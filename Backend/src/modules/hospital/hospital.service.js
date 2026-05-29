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
  const {
    name,
    email,
    phone,
    address,
    registrationNumber,
    licenseNumber,
    logo,
  } = hospitalData;

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
    logo,
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
    logo,
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
          ...(registrationNumber?.trim()
            ? { registrationNumber: registrationNumber.trim() }
            : {}),
          ...(licenseNumber?.trim()
            ? { licenseNumber: licenseNumber.trim() }
            : {}),
          logo,
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

      // Use existing plan
      const existingPlan = await Plan.findOne({
        planId: subscription.planId,
      }).session(session);
      if (!existingPlan) throw new Error('Selected Plan not found');
      finalPlanId = existingPlan.planId;
      const cyclePrice = existingPlan.prices.find(
        (p) => p.billingCycle === finalBillingCycle
      );
      finalAmount = cyclePrice ? cyclePrice.amount : existingPlan.price;
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

    // Razorpay Subscription creation if requested
    if (subscription?.sendInvoice && finalAmount > 0) {
      const rzp = getGlobalRazorpayClient();
      if (rzp) {
        try {
          // Map billing cycle to Razorpay interval
          // Razorpay subscription period is always 'monthly', interval multiplies it
          const billingCycleConfig = {
            MONTHLY: { interval: 1, totalCount: 12 }, // 1 month × 12 invoices = 12 months
            QUARTERLY: { interval: 3, totalCount: 4 }, // 3 months × 4 invoices = 12 months
            HALF_YEARLY: { interval: 6, totalCount: 2 }, // 6 months × 2 invoices = 12 months
            YEARLY: { interval: 12, totalCount: 1 }, // 12 months × 1 invoice = 12 months
          };

          const cycleConfig =
            billingCycleConfig[finalBillingCycle] || billingCycleConfig.MONTHLY;
          const razorpayPlanId = `plan_${finalPlanId}_${finalBillingCycle.toLowerCase()}`;

          // Try to create or fetch plan
          let planExists = false;
          try {
            await rzp.plans.fetch(razorpayPlanId);
            planExists = true;
            console.log('✅ Razorpay Plan Already Exists:', {
              planId: razorpayPlanId,
            });
          } catch (err) {
            if (err.statusCode === 404 || err.code === 'BAD_REQUEST_ERROR') {
              // Plan doesn't exist, create it
              await rzp.plans.create({
                period: 'monthly', // Razorpay only supports 'monthly' for subscriptions
                interval: cycleConfig.interval,
                amount: finalAmount * 100, // in paise
                currency: 'INR',
                notes: {
                  planId: finalPlanId,
                  billingCycle: finalBillingCycle,
                  hospitalName,
                },
              });
              planExists = true;
              console.log('✅ Razorpay Plan Created:', {
                planId: razorpayPlanId,
                interval: cycleConfig.interval,
                amount: finalAmount,
                billingCycle: finalBillingCycle,
              });
            } else {
              throw err;
            }
          }

          // Create subscription if plan exists
          if (planExists) {
            const subscriptionReq = {
              plan_id: razorpayPlanId,
              customer_notify: 1,
              quantity: 1,
              total_count: cycleConfig.totalCount,
              notes: {
                hospitalId: hospital._id.toString(),
                planId: finalPlanId,
                billingCycle: finalBillingCycle,
                adminEmail: email,
                adminName,
              },
            };

            const razorpaySubscription =
              await rzp.subscriptions.create(subscriptionReq);
            invoiceLink = razorpaySubscription.short_url;

            console.log('✅ Razorpay Subscription Created:', {
              subscriptionId: razorpaySubscription.id,
              subscriptionLink: invoiceLink,
              hospitalId: hospital._id,
              email,
              amount: finalAmount,
              billingCycle: finalBillingCycle,
              interval: cycleConfig.interval,
              totalInvoices: cycleConfig.totalCount,
            });
          }
        } catch (rzpErr) {
          console.error('❌ Failed to create Razorpay Subscription:', {
            error: rzpErr.message,
            code: rzpErr.code,
            statusCode: rzpErr.statusCode,
            hospitalId: hospital._id,
            email,
            amount: finalAmount,
            billingCycle: finalBillingCycle,
          });
          // Proceed anyway, we don't want to abort hospital creation just for subscription failure
        }
      } else {
        console.warn(
          '⚠️ Razorpay client not configured. Skipping subscription creation.'
        );
      }
    }

    await session.commitTransaction();

    // Fire & Forget Email Dispatch
    console.log('📧 Sending onboarding email with:', {
      to: email,
      hospitalName,
      adminName,
      hasInvoiceLink: !!invoiceLink,
      invoiceLink: invoiceLink || 'No payment link generated',
    });

    sendOnboardingEmail({
      to: email,
      hospitalName: hospitalName,
      adminName: adminName,
      tempPassword: password,
      invoiceLink: invoiceLink,
    }).catch((err) => console.error('Email dispatch failed:', err));

    return {
      hospital,
      adminId: newAdmin._id,
      invoiceLink,
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
  const subscriptions = await HospitalSubscription.find({
    hospitalId: { $in: hospitalIds },
  }).lean();

  // Collect all unique plan IDs to minimize queries
  const planIds = [...new Set(subscriptions.map((s) => s.planId))];
  const plans = await Plan.find({ planId: { $in: planIds } }).lean();

  // Attach subscription & plan info
  for (let hospital of hospitals) {
    const sub = subscriptions.find(
      (s) => s.hospitalId.toString() === hospital._id.toString()
    );
    if (sub) {
      const plan = plans.find((p) => p.planId === sub.planId);
      hospital.subscription = {
        status: sub.status,
        billingCycle: sub.billingCycle,
        currentPeriodEnd: sub.currentPeriodEnd,
        plan: plan
          ? { name: plan.name, price: plan.price, isCustom: plan.isCustom }
          : { name: sub.planId, price: 0 },
      };
    } else {
      hospital.subscription = null;
    }
  }

  return hospitals;
};

const getHospitalById = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId)
    .populate('createdBy', 'name email role')
    .lean();

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
      plan: plan
        ? {
            name: plan.name,
            price: plan.price,
            isCustom: plan.isCustom,
            limits: plan.limits,
          }
        : { name: sub.planId, price: 0 },
    };
  } else {
    hospital.subscription = null;
  }

  // 3. Usage Statistics Aggregation
  const [doctorsCount, departmentsCount, kiosksCount, patientsCount] =
    await Promise.all([
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
  // Remove empty strings for registrationNumber and licenseNumber to avoid duplicate key errors
  const cleanedData = { ...updateData };

  if (cleanedData.registrationNumber === '') {
    delete cleanedData.registrationNumber;
  } else if (cleanedData.registrationNumber?.trim) {
    cleanedData.registrationNumber = cleanedData.registrationNumber.trim();
  }

  if (cleanedData.licenseNumber === '') {
    delete cleanedData.licenseNumber;
  } else if (cleanedData.licenseNumber?.trim) {
    cleanedData.licenseNumber = cleanedData.licenseNumber.trim();
  }

  const hospital = await Hospital.findByIdAndUpdate(hospitalId, cleanedData, {
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
