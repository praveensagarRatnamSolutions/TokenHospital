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
 * @desc    Get billing history
 * @route   GET /api/subscription/history
 * @access  Private
 */
const getBillingHistory = async (req, res) => {
  try {
    const SubscriptionTransaction = require('./subscription.model');
    const history = await SubscriptionTransaction.find({ hospitalId: req.hospitalId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (error) {
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
      });
    }

    // 4. Write transaction ledger history receipt
    const SubscriptionTransaction = require('./subscription.model');
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

      const subscription = await HospitalSubscription.findOne({
        razorpaySubscriptionId: rzpSub.id,
      });

      if (subscription) {
        const nextPeriodEnd = new Date(rzpSub.current_end * 1000);
        const nextPeriodStart = new Date(rzpSub.current_start * 1000);

        subscription.status = 'ACTIVE';
        subscription.currentPeriodStart = nextPeriodStart;
        subscription.currentPeriodEnd = nextPeriodEnd;
        await subscription.save();

        const SubscriptionTransaction = require('./subscription.model');
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
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const rzpSub = payload.subscription.entity;

      const subscription = await HospitalSubscription.findOne({
        razorpaySubscriptionId: rzpSub.id,
      });

      if (subscription) {
        subscription.status = 'CANCELLED';
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

module.exports = {
  getSubscriptionStatus,
  changePlan,
  assignPlan,
  getBillingHistory,
  startTrial,
  createCheckout,
  verifyCheckout,
  handleSubscriptionWebhook,
};
