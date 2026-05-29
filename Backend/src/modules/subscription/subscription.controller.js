const Hospital = require('../hospital/hospital.model');
const Doctor = require('../doctor/doctor.model');
const Department = require('../department/department.model');
const Kiosk = require('../kiosk/kiosk.model');
const Plan = require('../subscription/plan.model');
const HospitalSubscription = require('./hospitalSubscription.model');
const { getHospitalLimits, isSubscriptionValid } = require('../hospital/subscription.utils');
const logger = require('../../config/logger');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const WalletService = require('../wallet/wallet.service');
const ExcelJS = require('exceljs');
const { sendPriceChangeNoticeEmail } = require('../../utils/email');

// Retrieve the global Platform Razorpay client instance
const getGlobalRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_CLIENT_ID;
  const keySecret = process.env.RAZORPAY_CLIENT_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Global Platform Razorpay credentials are not configured in .env');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * @desc    Get current subscription status and feature limits
 * @route   GET /api/subscription/status
 * @access  Private
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Fetch active subscription for this hospital
    const subscription = await HospitalSubscription.findOne({ hospitalId: req.hospitalId });

    // 1. Get Plan Limits (async — must await)
    const limits = await getHospitalLimits(hospital);
    const isValid = await isSubscriptionValid(hospital);

    // 2. Get Current Usage Counts
    const [doctorCount, departmentCount, kioskCount] = await Promise.all([
      Doctor.countDocuments({ hospitalId: req.hospitalId }),
      Department.countDocuments({ hospitalId: req.hospitalId }),
      Kiosk.countDocuments({ hospitalId: req.hospitalId }),
    ]);

    // 3. Calculate Trial Days Left
    let trialDaysLeft = 0;
    const planId = subscription?.planId || 'BASIC';
    const subscriptionStatus = subscription?.status || 'TRIAL';
    const trialEndDate = subscription?.trialEnd || null;

    if (subscriptionStatus === 'TRIAL' && trialEndDate) {
      const now = new Date();
      const diffTime = trialEndDate - now;
      trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (trialDaysLeft < 0) trialDaysLeft = 0;
    }

    // 4. Fetch full plan details for frontend rendering
    const currentPlan = await Plan.findOne({ planId, isActive: true });

    res.json({
      success: true,
      data: {
        planId,
        planName: currentPlan?.name || limits.label || planId,
        planDescription: currentPlan?.description || '',
        status: subscriptionStatus,
        isValid,
        trialDaysLeft,
        trialEndDate,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        billingCycle: subscription?.billingCycle || 'MONTHLY',
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        razorpaySubscriptionId: subscription?.razorpaySubscriptionId || null,
        pendingPriceChange: subscription?.pendingPriceChange || null,
        limits: {
          maxDoctors: limits.maxDoctors,
          maxDepartments: limits.maxDepartments,
          maxKiosks: limits.maxKiosks,
          currentDoctors: doctorCount,
          currentDepartments: departmentCount,
          currentKiosks: kioskCount,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching subscription status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Change hospital's plan (upgrade/downgrade)
 * @route   POST /api/subscription/change-plan
 * @access  Private (ADMIN)
 */
const changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, message: 'planId is required' });

    const plan = await Plan.findOne({ planId, isActive: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found or inactive' });

    let subscription = await HospitalSubscription.findOne({ hospitalId: req.hospitalId });
    if (subscription) {
      subscription.planId = plan.planId;
      subscription.status = 'ACTIVE';
      subscription.cancelAtPeriodEnd = false;
      subscription.canceledAt = null;
      subscription.endedAt = null;
      await subscription.save();
    } else {
      subscription = await HospitalSubscription.create({
        hospitalId: req.hospitalId,
        planId: plan.planId,
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    if (plan?.limits) {
      if (plan.limits.freeSmsUnits > 0) {
        await WalletService.creditWallet(req.hospitalId, 'SMS', plan.limits.freeSmsUnits, `Free credits from ${plan.name} upgrade`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
      if (plan.limits.freeEmailUnits > 0) {
        await WalletService.creditWallet(req.hospitalId, 'EMAIL', plan.limits.freeEmailUnits, `Free credits from ${plan.name} upgrade`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
    }

    res.json({
      success: true,
      message: `Plan changed to ${plan.name}`,
      data: { planId: subscription.planId, status: subscription.status },
    });
  } catch (error) {
    logger.error('Error changing plan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    SuperAdmin: Assign plan to any hospital
 * @route   POST /api/subscription/assign-plan/:hospitalId
 * @access  Private (SUPERADMIN)
 */
const assignPlan = async (req, res) => {
  try {
    const { planId, subscriptionStatus } = req.body;
    const { hospitalId } = req.params;

    const plan = await Plan.findOne({ planId, isActive: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    let subscription = await HospitalSubscription.findOne({ hospitalId });
    if (subscription) {
      subscription.planId = plan.planId;
      if (subscriptionStatus) subscription.status = subscriptionStatus;
      await subscription.save();
    } else {
      subscription = await HospitalSubscription.create({
        hospitalId,
        planId: plan.planId,
        billingCycle: 'MONTHLY',
        status: subscriptionStatus || 'ACTIVE',
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    if (plan?.limits) {
      if (plan.limits.freeSmsUnits > 0) {
        await WalletService.creditWallet(hospitalId, 'SMS', plan.limits.freeSmsUnits, `Free credits from ${plan.name} assignment`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
      if (plan.limits.freeEmailUnits > 0) {
        await WalletService.creditWallet(hospitalId, 'EMAIL', plan.limits.freeEmailUnits, `Free credits from ${plan.name} assignment`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
    }

    res.json({
      success: true,
      message: `Assigned ${plan.name} to ${hospital.name}`,
      data: { planId: subscription.planId, status: subscription.status },
    });
  } catch (error) {
    logger.error('Error assigning plan:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cancel auto-renewal at the end of current billing cycle
 * @route   POST /api/subscription/cancel-renewal
 * @access  Private (ADMIN)
 */
const cancelRenewal = async (req, res) => {
  try {
    const subscription = await HospitalSubscription.findOne({
      hospitalId: req.hospitalId,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.cancelAtPeriodEnd) {
      return res.json({
        success: true,
        message: 'Auto-renewal is already scheduled for cancellation.',
        data: subscription,
      });
    }

    const hasRealRazorpaySubscription =
      subscription.razorpaySubscriptionId &&
      !subscription.razorpaySubscriptionId.startsWith('sub_mock');

    if (hasRealRazorpaySubscription) {
      const rzp = getGlobalRazorpayClient();
      await rzp.subscriptions.cancel(subscription.razorpaySubscriptionId, {
        cancel_at_cycle_end: true,
      });
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message:
        'Auto-renewal cancelled. Your plan remains active until the current period ends.',
      data: subscription,
    });
  } catch (error) {
    logger.error('Error cancelling subscription renewal:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Resume auto-renewal when possible, otherwise request a fresh checkout
 * @route   POST /api/subscription/resume-renewal
 * @access  Private (ADMIN)
 */
const resumeRenewal = async (req, res) => {
  try {
    const subscription = await HospitalSubscription.findOne({
      hospitalId: req.hospitalId,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: 'Subscription not found' });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return res.json({
        success: true,
        message: 'Auto-renewal is already enabled.',
        data: subscription,
      });
    }

    const hasRealRazorpaySubscription =
      subscription.razorpaySubscriptionId &&
      !subscription.razorpaySubscriptionId.startsWith('sub_mock');

    if (hasRealRazorpaySubscription) {
      return res.status(409).json({
        success: false,
        requiresCheckout: true,
        message:
          'Razorpay subscriptions cannot be reactivated after cancellation is scheduled. Please complete checkout again to resume auto-renewal.',
        data: {
          planId: subscription.planId,
          billingCycle: subscription.billingCycle,
        },
      });
    }

    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = null;
    await subscription.save();

    res.json({
      success: true,
      message: 'Auto-renewal resumed successfully.',
      data: subscription,
    });
  } catch (error) {
    logger.error('Error resuming subscription renewal:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    SuperAdmin: Schedule a future price-change notice for existing subscribers
 * @route   POST /api/subscription/price-migrations
 * @access  Private (SUPERADMIN)
 */
const schedulePriceMigration = async (req, res) => {
  try {
    const { planId, billingCycle, newAmount, effectiveDate, sendEmails = true } = req.body;

    if (!planId || !billingCycle || newAmount === undefined || !effectiveDate) {
      return res.status(400).json({
        success: false,
        message: 'planId, billingCycle, newAmount, and effectiveDate are required',
      });
    }

    const parsedAmount = Number(newAmount);
    const parsedEffectiveDate = new Date(effectiveDate);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'newAmount must be a non-negative number',
      });
    }

    if (Number.isNaN(parsedEffectiveDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'effectiveDate must be a valid date',
      });
    }

    const plan = await Plan.findOne({ planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const currentPriceIndex = plan.prices?.findIndex((price) => price.billingCycle === billingCycle);
    if (currentPriceIndex === -1 || currentPriceIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: `No active price structure found for cycle: ${billingCycle}`,
      });
    }

    const currentPriceObj = plan.prices[currentPriceIndex];
    const currentAmount = currentPriceObj.amount;

    if (currentAmount === parsedAmount) {
      return res.status(400).json({
        success: false,
        message: 'New price must be different from current price',
      });
    }

    // 1. Create a brand new plan in Razorpay for the new price
    let newRazorpayPlanId = `plan_mock_${crypto.randomBytes(8).toString('hex')}`;
    let isMock = true;

    try {
      const rzp = getGlobalRazorpayClient();
      
      let period = 'monthly';
      let interval = currentPriceObj.intervalMonths || 1;

      if (billingCycle === 'YEARLY') {
        period = 'yearly';
        interval = 1;
      } else {
        period = 'monthly';
        interval = currentPriceObj.intervalMonths || 1;
      }

      logger.info(`Creating brand new Razorpay plan for price migration: ${plan.name} (${billingCycle}) - ₹${parsedAmount}`);
      
      const razorpayPlan = await rzp.plans.create({
        period,
        interval,
        item: {
          name: `${plan.name} - ${billingCycle}`,
          amount: Math.round(parsedAmount * 100), // paise
          currency: plan.currency || 'INR',
          description: plan.description || `Subscription Plan for ${plan.name}`,
        },
      });

      newRazorpayPlanId = razorpayPlan.id;
      isMock = false;
      logger.info(`✅ Razorpay plan created during migration: ${newRazorpayPlanId}`);
    } catch (err) {
      logger.error(`⚠️ Razorpay plan creation failed during migration. Sandbox mode fallback activated: ${err.message}`);
    }

    // 2. Update Plan document immediately so new checkouts/signups pay the new price
    plan.prices[currentPriceIndex].amount = parsedAmount;
    plan.prices[currentPriceIndex].razorpayPlanId = newRazorpayPlanId;

    // Sync legacy properties on the plan document
    if (billingCycle === 'MONTHLY') {
      plan.price = parsedAmount;
      plan.razorpayPlanIdMonthly = newRazorpayPlanId;
    } else if (billingCycle === 'YEARLY') {
      plan.yearlyPrice = parsedAmount;
      plan.razorpayPlanIdYearly = newRazorpayPlanId;
    }
    
    await plan.save();
    logger.info(`✅ Updated MongoDB Plan ${plan.planId} price cycle to ₹${parsedAmount} (Razorpay ID: ${newRazorpayPlanId})`);

    // 3. Find and schedule active subscriptions for migration
    const subscriptions = await HospitalSubscription.find({
      planId: plan.planId,
      billingCycle,
      status: { $in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD', 'PAST_DUE'] },
    }).populate('hospitalId', 'name email');

    const noticeSentAt = new Date();
    const pendingPriceChange = {
      planId: plan.planId,
      billingCycle,
      currentAmount,
      newAmount: parsedAmount,
      newRazorpayPlanId,
      currency: plan.currency || 'INR',
      effectiveDate: parsedEffectiveDate,
      noticeSentAt,
      status: 'NOTICE_SENT',
    };

    let emailsAttempted = 0;
    let emailsFailed = 0;

    for (const subscription of subscriptions) {
      subscription.pendingPriceChange = pendingPriceChange;
      await subscription.save();

      const hospital = subscription.hospitalId;
      if (sendEmails && hospital?.email) {
        emailsAttempted += 1;
        try {
          await sendPriceChangeNoticeEmail({
            to: hospital.email,
            hospitalName: hospital.name || 'Hospital',
            planName: plan.name,
            billingCycle,
            currentAmount,
            newAmount: parsedAmount,
            currency: plan.currency || 'INR',
            effectiveDate: parsedEffectiveDate,
          });
        } catch (emailError) {
          emailsFailed += 1;
          logger.error('Failed to send price change notice email:', emailError);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Scheduled price-change notice for ${subscriptions.length} active subscription(s). Updated plan checkout price to ₹${parsedAmount}.`,
      data: {
        planId: plan.planId,
        billingCycle,
        currentAmount,
        newAmount: parsedAmount,
        newRazorpayPlanId,
        isMock,
        effectiveDate: parsedEffectiveDate,
        affectedSubscriptions: subscriptions.length,
        emailsAttempted,
        emailsFailed,
      },
    });
  } catch (error) {
    logger.error('Error scheduling price migration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const SubscriptionTransaction = require('./subscription.model');
    const query = req.user.role === 'SUPERADMIN' ? {} : { hospitalId: req.hospitalId };
    
    const history = await SubscriptionTransaction.find(query)
      .populate('hospitalId', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .limit(req.user.role === 'SUPERADMIN' ? 500 : 50);

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Export billing history to Excel
 * @route   GET /api/subscription/history/export
 * @access  Private
 */
const exportBillingHistory = async (req, res) => {
  try {
    const { status, service, startDate, endDate, search } = req.query;
    const SubscriptionTransaction = require('./subscription.model');
    
    let query = req.user.role === 'SUPERADMIN' ? {} : { hospitalId: req.hospitalId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (service && service !== 'ALL') {
      if (service === 'SUBSCRIPTION') {
        query.type = 'SUBSCRIPTION';
      } else if (service === 'WALLET') {
        query.type = 'WALLET_TOPUP';
      }
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let history = await SubscriptionTransaction.find(query)
      .populate('hospitalId', 'name email contactNumber')
      .sort({ createdAt: -1 });

    if (search) {
      const lowerSearch = search.toLowerCase();
      history = history.filter(inv => {
        const hospitalName = inv.hospitalId?.name?.toLowerCase() || '';
        const invoiceId = inv.razorpayPaymentId?.toLowerCase() || inv._id.toString().toLowerCase();
        return hospitalName.includes(lowerSearch) || invoiceId.includes(lowerSearch);
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Billing History', {
      views: [{ showGridLines: false }]
    });

    // 1. Add Main Title
    worksheet.mergeCells('A1:G2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Hospital Token Management - Billing History Report';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // slate-800
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 2. Empty row for spacing
    worksheet.addRow([]);

    // 3. Set Columns
    worksheet.columns = [
      { header: 'Transaction ID', key: 'id', width: 32 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Hospital Name', key: 'hospital', width: 35 },
      { header: 'Service Type', key: 'service', width: 20 },
      { header: 'Amount', key: 'amount', width: 18, style: { numFmt: '"₹"#,##0.00' } },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Description', key: 'description', width: 50 },
    ];

    // 4. Style the Header Row
    const headerRow = worksheet.getRow(4);
    headerRow.height = 25;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // slate-900
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 5. Add Data Rows
    history.forEach(inv => {
      const isWallet = inv.type === 'WALLET_TOPUP';
      const serviceType = isWallet ? 'Wallet Top-up' : 'Subscription';
      
      const row = worksheet.addRow({
        id: inv.razorpayPaymentId || inv._id.toString(),
        date: new Date(inv.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        hospital: inv.hospitalId?.name || 'Unknown',
        service: serviceType,
        amount: inv.amount || 0,
        status: inv.status === 'COMPLETED' ? 'PAID' : inv.status,
        description: inv.description || '',
      });
      
      // Style row alignments
      row.height = 20;
      row.alignment = { vertical: 'middle' };
      row.getCell('amount').alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('date').alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Color code status
      const statusCell = row.getCell('status');
      if (inv.status === 'COMPLETED') {
        statusCell.font = { color: { argb: 'FF16A34A' }, bold: true }; // green-600
      } else if (inv.status === 'PENDING') {
        statusCell.font = { color: { argb: 'FFD97706' }, bold: true }; // amber-600
      } else if (inv.status === 'FAILED') {
        statusCell.font = { color: { argb: 'FFDC2626' }, bold: true }; // red-600
      }
    });

    // 6. Add Border to all data cells
    worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
      if (rowNumber >= 4) { // Apply borders to headers and data
        row.eachCell({ includeEmpty: true }, function(cell) {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, // slate-300
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Billing_Export_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error('Error exporting billing history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Frictionless Onboarding: Start 30-Day Free Trial
 * @route   POST /api/subscription/start-trial
 * @access  Private (ADMIN)
 */
const startTrial = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;

    // 1. Verify that they do not already have an active subscription or trial
    const existingSub = await HospitalSubscription.findOne({ hospitalId });
    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'Your hospital has already used its trial or holds an active subscription.',
      });
    }

    // 2. Fetch standard FREE plan details for default trial mapping
    const plan = await Plan.findOne({ planId: 'FREE', isActive: true });
    const trialDays = plan?.trialDays || 30;

    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    // 3. Create Subscription document (will trigger Mongoose auto-sync hook to update Hospital document)
    const subscription = await HospitalSubscription.create({
      hospitalId,
      planId: 'FREE',
      billingCycle: 'MONTHLY',
      status: 'TRIAL',
      startDate: trialStart,
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
      trialStart,
      trialEnd,
    });

    res.status(201).json({
      success: true,
      message: '30-Day Free Trial activated successfully!',
      data: subscription,
    });
  } catch (error) {
    logger.error('Error starting free trial:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create Razorpay Subscription mandate
 * @route   POST /api/subscription/create-checkout
 * @access  Private (ADMIN)
 */
const createCheckout = async (req, res) => {
  let plan = null;
  let chosenPrice = null;
  try {
    const { planId, billingCycle } = req.body;

    // 1. Retrieve the designated plan
    plan = await Plan.findOne({ planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // 2. Extract corresponding price cycle
    chosenPrice = plan.prices.find(p => p.billingCycle === billingCycle);
    if (!chosenPrice) {
      return res.status(400).json({
        success: false,
        message: `No active price structure found for cycle: ${billingCycle}`,
      });
    }

    // 3. Initiate the global Platform Razorpay client
    const rzp = getGlobalRazorpayClient();
    console.log("rzp", rzp);


    // 4. Create the Subscription on Razorpay
    const totalCount = billingCycle === 'YEARLY' ? 10 : (billingCycle === 'QUARTERLY' ? 40 : (billingCycle === 'HALF_YEARLY' ? 20 : 120));

    console.log(`Creating Razorpay Subscription for plan ID: ${chosenPrice.razorpayPlanId}...`);
    const rzpSubscription = await rzp.subscriptions.create({
      plan_id: chosenPrice.razorpayPlanId,
      total_count: totalCount,
      quantity: 1,
    });

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: rzpSubscription.id,
        keyId: process.env.RAZORPAY_CLIENT_ID,
        amount: chosenPrice.amount,
        planId: plan.planId,
        billingCycle,
        isMock: false,
      },
    });
  } catch (error) {
    logger.error('Razorpay subscription creation failed. Falling back to test Sandbox mode.', error);
    
    // In development or test environments, if Razorpay subscription creation fails 
    // (e.g. planId not synchronized on real dashboard), we gracefully fall back to a mock subscription mandate!
    const mockSubscriptionId = `sub_mock_${crypto.randomBytes(8).toString('hex')}`;
    res.status(201).json({
      success: true,
      message: 'Razorpay subscription creation failed. Sandbox mode activated.',
      data: {
        subscriptionId: mockSubscriptionId,
        keyId: process.env.RAZORPAY_CLIENT_ID || 'rzp_test_mock',
        amount: chosenPrice ? chosenPrice.amount : 0,
        planId: plan ? plan.planId : (req.body.planId || 'FREE'),
        billingCycle: req.body.billingCycle || 'MONTHLY',
        isMock: true,
      },
    });
  }
};

/**
 * @desc    Verify Razorpay Subscription Payment signature and activate subscription
 * @route   POST /api/subscription/verify-checkout
 * @access  Private (ADMIN)
 */
const verifyCheckout = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planId, billingCycle } = req.body;
    const SubscriptionTransaction = require('./subscription.model');

    // 0. Idempotency Check
    if (razorpay_payment_id) {
      const existingTransaction = await SubscriptionTransaction.findOne({ razorpayPaymentId: razorpay_payment_id });
      if (existingTransaction) {
        logger.info(`Subscription payment already verified for payment ID: ${razorpay_payment_id}`);
        const subscription = await HospitalSubscription.findOne({ razorpaySubscriptionId: razorpay_subscription_id });
        return res.status(200).json({
          success: true,
          message: 'Subscription payment already verified successfully!',
          data: subscription,
        });
      }
    }

    // 1. Perform HMAC SHA256 Signature Verification (Bypassed for mock subscriptions in sandbox mode)
    if (razorpay_subscription_id && razorpay_subscription_id.startsWith('sub_mock')) {
      logger.info(`Bypassing Razorpay signature verification for sandbox mock subscription: ${razorpay_subscription_id}`);
    } else {
      const secret = process.env.RAZORPAY_CLIENT_SECRET;
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Cryptographic signature verification failed.' });
      }
    }

    // 2. Fetch the plan details to calculate next renewal period date
    const plan = await Plan.findOne({ planId, isActive: true });
    const chosenPrice = plan?.prices.find(p => p.billingCycle === billingCycle);
    const intervalMonths = chosenPrice?.intervalMonths || 1;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + intervalMonths);

    // 3. Upsert active subscription record (automatically syncs to legacy Hospital fields)
    let subscription = await HospitalSubscription.findOne({ hospitalId: req.hospitalId });

    if (subscription) {
      subscription.planId = planId;
      subscription.billingCycle = billingCycle;
      subscription.status = 'ACTIVE';
      subscription.currentPeriodStart = startDate;
      subscription.currentPeriodEnd = endDate;
      subscription.razorpaySubscriptionId = razorpay_subscription_id;
      subscription.cancelAtPeriodEnd = false;
      subscription.canceledAt = null;
      subscription.endedAt = null;
      await subscription.save();
    } else {
      subscription = await HospitalSubscription.create({
        hospitalId: req.hospitalId,
        planId,
        billingCycle,
        status: 'ACTIVE',
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        razorpaySubscriptionId: razorpay_subscription_id,
        cancelAtPeriodEnd: false,
      });
    }

    // 4. Write transaction ledger history receipt
    await SubscriptionTransaction.create({
      hospitalId: req.hospitalId,
      type: 'SUBSCRIPTION',
      planId,
      amount: chosenPrice?.amount || 0,
      currency: plan?.currency || 'INR',
      status: 'COMPLETED',
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      description: `Subscription to ${plan?.name || planId} (${billingCycle})`,
    });

    // 5. Credit free wallet units based on plan limits
    if (plan?.limits) {
      if (plan.limits.freeSmsUnits > 0) {
        await WalletService.creditWallet(req.hospitalId, 'SMS', plan.limits.freeSmsUnits, `Free credits from ${plan.name} subscription`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
      if (plan.limits.freeEmailUnits > 0) {
        await WalletService.creditWallet(req.hospitalId, 'EMAIL', plan.limits.freeEmailUnits, `Free credits from ${plan.name} subscription`, 'SUBSCRIPTION_RENEWAL', subscription._id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Subscription payment verified and activated successfully!',
      data: subscription,
    });
  } catch (error) {
    logger.error('Error verifying subscription payment checkout:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Global Platform Webhook for Razorpay Subscription Events
 * @route   POST /api/subscription/webhook
 * @access  Public
 */
const handleSubscriptionWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      logger.error('Missing signature or webhook secret for subscription webhook');
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;
    if (!isSignatureValid) {
      logger.warn('Razorpay webhook signature verification failed for subscription webhook');
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ success: false, message: 'Signature verification failed' });
      }
    }

    const { event, payload } = req.body;
    logger.info(`Received subscription webhook event: ${event}`);

    if (event === 'subscription.charged') {
      const rzpSub = payload.subscription.entity;
      const rzpPayment = payload.payment.entity;

      const SubscriptionTransaction = require('./subscription.model');
      
      // Idempotency check
      const existingTransaction = await SubscriptionTransaction.findOne({ razorpayPaymentId: rzpPayment.id });
      if (existingTransaction) {
        logger.info(`Webhook idempotency: Subscription payment already processed for payment ID: ${rzpPayment.id}`);
        return res.json({ success: true, message: 'Already processed' });
      }

      const subscription = await HospitalSubscription.findOne({
        razorpaySubscriptionId: rzpSub.id,
      });

      if (subscription) {
        const nextPeriodEnd = new Date(rzpSub.current_end * 1000);
        const nextPeriodStart = new Date(rzpSub.current_start * 1000);

        subscription.status = 'ACTIVE';
        subscription.currentPeriodStart = nextPeriodStart;
        subscription.currentPeriodEnd = nextPeriodEnd;
        subscription.cancelAtPeriodEnd = false;
        subscription.canceledAt = null;
        subscription.endedAt = null;
        await subscription.save();

        const plan = await Plan.findOne({ planId: subscription.planId });
        const chosenPrice = plan?.prices.find(p => p.billingCycle === subscription.billingCycle);

        await SubscriptionTransaction.create({
          hospitalId: subscription.hospitalId,
          type: 'SUBSCRIPTION',
          planId: subscription.planId,
          amount: chosenPrice?.amount || (rzpPayment.amount / 100) || 0,
          currency: plan?.currency || 'INR',
          status: 'COMPLETED',
          razorpaySubscriptionId: rzpSub.id,
          razorpayPaymentId: rzpPayment.id,
          description: `Auto-Renewal of ${plan?.name || subscription.planId} (${subscription.billingCycle})`,
        });

        if (plan?.limits) {
          if (plan.limits.freeSmsUnits > 0) {
            await WalletService.creditWallet(subscription.hospitalId, 'SMS', plan.limits.freeSmsUnits, `Free credits from auto-renewal of ${plan.name}`, 'SUBSCRIPTION_RENEWAL', subscription._id);
          }
          if (plan.limits.freeEmailUnits > 0) {
            await WalletService.creditWallet(subscription.hospitalId, 'EMAIL', plan.limits.freeEmailUnits, `Free credits from auto-renewal of ${plan.name}`, 'SUBSCRIPTION_RENEWAL', subscription._id);
          }
        }

        logger.info(`Subscription ${rzpSub.id} successfully auto-renewed through webhook!`);
      }
    } else if (event === 'payment.failed') {
      // Handle payment failure for subscriptions
      const rzpPayment = payload.payment.entity;
      logger.warn(`Payment failed: ${rzpPayment.id}`);
    } else if (event === 'subscription.paused') {
      const rzpSub = payload.subscription.entity;

      const subscription = await HospitalSubscription.findOne({
        razorpaySubscriptionId: rzpSub.id,
      });

      if (subscription) {
        subscription.status = 'PAST_DUE';
        await subscription.save();
        logger.info(`Subscription ${rzpSub.id} marked as PAST_DUE through webhook.`);
      }
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const rzpSub = payload.subscription.entity;

      const subscription = await HospitalSubscription.findOne({
        razorpaySubscriptionId: rzpSub.id,
      });

      if (subscription) {
        subscription.status = 'CANCELLED';
        subscription.cancelAtPeriodEnd = false;
        subscription.canceledAt = new Date();
        subscription.endedAt = new Date();
        await subscription.save();
        logger.info(`Subscription ${rzpSub.id} marked as CANCELLED through webhook.`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing subscription webhook:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const runPriceMigrationsManual = async (req, res) => {
  try {
    const { executePriceMigrations } = require('../../utils/cronJob');
    const result = await executePriceMigrations();
    
    res.json({
      success: true,
      message: `Manual price migration sweep completed. Succeeded: ${result.succeeded}, Failed: ${result.failed}`,
      data: result,
    });
  } catch (error) {
    logger.error('Error running manual price migrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubscriptionStatus,
  changePlan,
  assignPlan,
  cancelRenewal,
  resumeRenewal,
  schedulePriceMigration,
  runPriceMigrationsManual,
  getBillingHistory,
  exportBillingHistory,
  startTrial,
  createCheckout,
  verifyCheckout,
  handleSubscriptionWebhook,
};
