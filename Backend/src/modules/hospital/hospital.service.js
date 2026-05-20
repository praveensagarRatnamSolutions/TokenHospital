const { default: mongoose } = require('mongoose');
const Hospital = require('./hospital.model');
const User = require('../auth/auth.model');
const HospitalSubscription = require('../subscription/hospitalSubscription.model');
const Plan = require('../subscription/plan.model');
const Doctor = require('../doctor/doctor.model');
const Department = require('../department/department.model');
const Kiosk = require('../kiosk/kiosk.model');
const Patient = require('../patient/patient.model');
const WalletLedger = require('../wallet/walletLedger.model');
const SubscriptionTransaction = require('../subscription/subscription.model');
const { sendOnboardingEmail } = require('../../utils/email');
const Razorpay = require('razorpay');

const getGlobalRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_CLIENT_ID;
  const keySecret = process.env.RAZORPAY_CLIENT_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const createHospital = async (hospitalData, createdById) => {
  const { name, email, phone, address, registrationNumber, licenseNumber } =
    hospitalData;

  // Check if hospital with this email already exists
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    throw new Error('Hospital with this email already exists');
  }

  const hospital = await Hospital.create({
    name,
    email,
    phone,
    address,
    registrationNumber,
    licenseNumber,
    createdBy: createdById,
    isActive: true,
  });

  // Create active subscription trial
  const trialStart = new Date();
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  await HospitalSubscription.create({
    hospitalId: hospital._id,
    planId: 'PRO',
    billingCycle: 'MONTHLY',
    status: 'TRIAL',
    startDate: trialStart,
    currentPeriodStart: trialStart,
    currentPeriodEnd: trialEndDate,
    trialStart,
    trialEnd: trialEndDate,
  });

  return hospital;
};

const createHospitalBySuperAdmin = async (hospitalData, superAdminId) => {
  const {
    adminName,
    email,
    password,
    phone,
    hospitalName,
    address,
    registrationNumber,
    licenseNumber,
    subscription, // new field from frontend
  } = hospitalData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingHospital = await Hospital.findOne({ email }).session(session);
    const existingUser = await User.findOne({ email }).session(session);

    if (existingHospital || existingUser) {
      throw new Error('A hospital or user with this email already exists');
    }

    const [newAdmin] = await User.create(
      [
        {
          name: `${adminName}`,
          email,
          password,
          role: 'ADMIN',
        },
      ],
      { session }
    );

    const [hospital] = await Hospital.create(
      [
        {
          name: hospitalName,
          email,
          phone,
          address,
          registrationNumber,
          licenseNumber,
          createdBy: superAdminId,
          isActive: true,
        },
      ],
      { session }
    );

    // Default values if no subscription payload is provided
    let finalPlanId = 'PRO';
    let finalBillingCycle = 'MONTHLY';
    let invoiceLink = null;
    let finalAmount = 0;
    
    // Process subscription payload if provided
    if (subscription) {
      finalBillingCycle = subscription.billingCycle || 'MONTHLY';
      
      if (subscription.isCustom) {
        // Create dynamic hidden Custom Plan
        finalPlanId = `CUSTOM_${hospital._id.toString().substring(0, 8).toUpperCase()}`;
        const newCustomPlan = await Plan.create([{
          name: `Custom Plan - ${hospitalName}`,
          planId: finalPlanId,
          price: subscription.price || 0,
          billingCycle: finalBillingCycle,
          limits: {
            maxDepartments: subscription.maxDepartments || 1,
            maxDoctors: subscription.maxDoctors || 2,
            maxKiosks: subscription.maxKiosks || 0,
          },
          prices: [{
             billingCycle: finalBillingCycle,
             intervalMonths: finalBillingCycle === 'YEARLY' ? 12 : 1,
             amount: subscription.price || 0,
             razorpayPlanId: 'CUSTOM_RZP_IGNORE' // Custom plans might skip razorpay strict plans for now
          }],
          isActive: false, // Hidden from public
          isCustom: true,
        }], { session });
        
        finalAmount = subscription.price || 0;
      } else {
        // Use existing plan
        const existingPlan = await Plan.findOne({ planId: subscription.planId }).session(session);
        if (!existingPlan) throw new Error('Selected Plan not found');
        finalPlanId = existingPlan.planId;
        const cyclePrice = existingPlan.prices.find(p => p.billingCycle === finalBillingCycle);
        finalAmount = cyclePrice ? cyclePrice.amount : existingPlan.price;
      }
    }

    const trialStart = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    // Assume if sendInvoice is true, it's not a free trial but a direct ACTIVE sub (or PENDING)
    const subStatus = subscription?.sendInvoice ? 'UNPAID' : 'TRIAL';

    await HospitalSubscription.create(
      [
        {
          hospitalId: hospital._id,
          planId: finalPlanId,
          billingCycle: finalBillingCycle,
          status: subStatus,
          startDate: trialStart,
          currentPeriodStart: trialStart,
          currentPeriodEnd: trialEndDate,
          trialStart: subStatus === 'TRIAL' ? trialStart : null,
          trialEnd: subStatus === 'TRIAL' ? trialEndDate : null,
        },
      ],
      { session }
    );

    newAdmin.hospitalId = hospital._id;
    await newAdmin.save({ session });

    // Payment Link generation using Razorpay Payment Links API if requested
    if (subscription?.sendInvoice && finalAmount > 0) {
       const rzp = getGlobalRazorpayClient();
       if (rzp) {
         try {
           const paymentLinkReq = {
             amount: finalAmount * 100, // in paise
             currency: 'INR',
             accept_partial: false,
             description: `Invoice for ${hospitalName} - ${finalPlanId} (${finalBillingCycle})`,
             customer: {
               name: adminName,
               email: email,
               contact: phone || '',
             },
             notify: { sms: false, email: false },
             reminder_enable: true,
             notes: {
               hospitalId: hospital._id.toString(),
               planId: finalPlanId
             }
           };
           const paymentLink = await rzp.paymentLink.create(paymentLinkReq);
           invoiceLink = paymentLink.short_url;
         } catch (rzpErr) {
           console.error("Failed to generate Razorpay Payment Link:", rzpErr);
           // Proceed anyway, we don't want to abort hospital creation just for invoice failure
         }
       }
    }

    await session.commitTransaction();

    // Fire & Forget Email Dispatch
    sendOnboardingEmail({
      to: email,
      hospitalName: hospitalName,
      adminName: adminName,
      tempPassword: password,
      invoiceLink: invoiceLink
    }).catch(err => console.error("Email dispatch failed:", err));

    return {
      hospital,
      adminId: newAdmin._id,
      invoiceLink
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllHospitals = async (filters = {}) => {
  const query = { ...filters };
  const hospitals = await Hospital.find(query)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean(); // Convert to plain objects

  // Aggregate subscriptions
  const hospitalIds = hospitals.map((h) => h._id);
  const subscriptions = await HospitalSubscription.find({ hospitalId: { $in: hospitalIds } }).lean();
  
  // Collect all unique plan IDs to minimize queries
  const planIds = [...new Set(subscriptions.map(s => s.planId))];
  const plans = await Plan.find({ planId: { $in: planIds } }).lean();

  // Attach subscription & plan info
  for (let hospital of hospitals) {
    const sub = subscriptions.find((s) => s.hospitalId.toString() === hospital._id.toString());
    if (sub) {
      const plan = plans.find((p) => p.planId === sub.planId);
      hospital.subscription = {
        status: sub.status,
        billingCycle: sub.billingCycle,
        currentPeriodEnd: sub.currentPeriodEnd,
        plan: plan ? { name: plan.name, price: plan.price, isCustom: plan.isCustom } : { name: sub.planId, price: 0 }
      };
    } else {
      hospital.subscription = null;
    }
  }

  return hospitals;
};

const getHospitalById = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId).populate(
    'createdBy',
    'name email role'
  ).lean();
  
  if (!hospital) {
    throw new Error('Hospital not found');
  }

  // 1. Fetch Primary Admin User
  const primaryAdmin = await User.findOne({ hospitalId, role: 'ADMIN' })
    .select('name email phone role createdAt')
    .sort({ createdAt: 1 })
    .lean();
  hospital.primaryAdmin = primaryAdmin || null;
  
  // 2. Fetch Subscription Info
  const sub = await HospitalSubscription.findOne({ hospitalId }).lean();
  if (sub) {
    const plan = await Plan.findOne({ planId: sub.planId }).lean();
    hospital.subscription = {
      status: sub.status,
      billingCycle: sub.billingCycle,
      currentPeriodEnd: sub.currentPeriodEnd,
      plan: plan ? { name: plan.name, price: plan.price, isCustom: plan.isCustom, limits: plan.limits } : { name: sub.planId, price: 0 }
    };
  } else {
    hospital.subscription = null;
  }
  
  // 3. Usage Statistics Aggregation
  const [doctorsCount, departmentsCount, kiosksCount, patientsCount] = await Promise.all([
    Doctor.countDocuments({ hospitalId }),
    Department.countDocuments({ hospitalId }),
    Kiosk.countDocuments({ hospitalId }),
    Patient.countDocuments({ hospitalId }),
  ]);
  
  hospital.usageStats = {
    doctors: doctorsCount,
    departments: departmentsCount,
    kiosks: kiosksCount,
    patients: patientsCount,
  };
  
  // 4. Financial Ledgers
  const walletLedger = await WalletLedger.find({ hospitalId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
  const subscriptionHistory = await SubscriptionTransaction.find({ hospitalId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
  hospital.walletLedger = walletLedger || [];
  hospital.subscriptionHistory = subscriptionHistory || [];
  
  // Note: Wallet balance is inherently present in hospital.wallet via schema
  return hospital;
};

const updateHospital = async (hospitalId, updateData) => {
  const hospital = await Hospital.findByIdAndUpdate(hospitalId, updateData, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email role');

  if (!hospital) {
    throw new Error('Hospital not found');
  }

  return hospital;
};

const deleteHospital = async (hospitalId) => {
  const hospital = await Hospital.findByIdAndDelete(hospitalId);
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  return hospital;
};

const deactivateHospital = async (hospitalId) => {
  return await updateHospital(hospitalId, { isActive: false });
};

const activateHospital = async (hospitalId) => {
  return await updateHospital(hospitalId, { isActive: true });
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  deactivateHospital,
  activateHospital,
  createHospitalBySuperAdmin,
};
