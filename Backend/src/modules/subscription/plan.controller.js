const Plan = require('./plan.model');
const Razorpay = require('razorpay');
const logger = require('../../config/logger');

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



const createPlan = async (req, res, next) => {
  try {
    const planData = req.body;

    /**
     * =========================================
     * 1. Compatibility Layer
     * =========================================
     * If old payload structure is sent
     * generate prices array automatically
     */

    if (!planData.prices || planData.prices.length === 0) {
      planData.prices = [];

      // Monthly
      if (planData.price > 0) {
        planData.prices.push({
          billingCycle: 'MONTHLY',
          intervalMonths: 1,
          amount: planData.price,
          razorpayPlanId: null,
        });
      }

      // Quarterly
      if (planData.quarterlyPrice > 0) {
        planData.prices.push({
          billingCycle: 'QUARTERLY',
          intervalMonths: 3,
          amount: planData.quarterlyPrice,
          razorpayPlanId: null,
        });
      }

      // Half Yearly
      if (planData.halfYearlyPrice > 0) {
        planData.prices.push({
          billingCycle: 'HALF_YEARLY',
          intervalMonths: 6,
          amount: planData.halfYearlyPrice,
          razorpayPlanId: null,
        });
      }

      // Yearly
      if (planData.yearlyPrice > 0) {
        planData.prices.push({
          billingCycle: 'YEARLY',
          intervalMonths: 12,
          amount: planData.yearlyPrice,
          razorpayPlanId: null,
        });
      }
    }

    /**
     * =========================================
     * 2. Razorpay Plan Creation
     * =========================================
     */

    const rzp = getGlobalRazorpayClient();

    console.log('Razorpay Client:', !!rzp);

    // Only create Razorpay plans for paid plans
    for (const priceOption of planData.prices) {
      /**
       * FREE PLAN
       * Skip Razorpay creation
       */
      if (priceOption.amount <= 0) {
        priceOption.razorpayPlanId = null;
        continue;
      }

      let period = 'monthly';
      let interval = priceOption.intervalMonths;

      /**
       * Razorpay supports:
       * daily, weekly, monthly, yearly
       */

      switch (priceOption.billingCycle) {
        case 'MONTHLY':
          period = 'monthly';
          interval = 1;
          break;

        case 'QUARTERLY':
          period = 'monthly';
          interval = 3;
          break;

        case 'HALF_YEARLY':
          period = 'monthly';
          interval = 6;
          break;

        case 'YEARLY':
          period = 'yearly';
          interval = 1;
          break;

        default:
          period = 'monthly';
          interval = 1;
      }

      try {
        console.log(
          `Creating Razorpay plan for ${planData.name} (${priceOption.billingCycle}) at ₹${priceOption.amount}`
        );

        const razorpayPlan = await rzp.plans.create({
          period,
          interval,
          item: {
            name: `${planData.name} - ${priceOption.billingCycle}`,
            amount: Math.round(priceOption.amount * 100), // paise
            currency: planData.currency || 'INR',
            description:
              planData.description ||
              `Subscription for ${planData.name}`,
          },
        });

        console.log('Razorpay Plan Created:', razorpayPlan.id);

        priceOption.razorpayPlanId = razorpayPlan.id;
      } catch (err) {
        console.log('RAZORPAY ERROR:', err);

        logger.error(
          `Failed to register Razorpay plan`,
          err
        );

        return res.status(500).json({
          success: false,
          message:
            err?.error?.description ||
            err?.message ||
            'Failed to create Razorpay plan',
          error: err,
        });
      }
    }

    /**
     * =========================================
     * 3. Create Plan in MongoDB
     * =========================================
     */

    const plan = await Plan.create(planData);

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    logger.error('Create Plan Error:', error);

    next(error);
  }
};



const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const planData = req.body;

    // If the update modifies pricing, register any brand-new prices in Razorpay dynamically
    if (planData.prices && planData.prices.length > 0) {
      const rzp = getGlobalRazorpayClient();

      for (let priceOption of planData.prices) {
        if (!priceOption.razorpayPlanId || priceOption.razorpayPlanId.startsWith('temp_')) {
          let period = 'monthly';
          let interval = priceOption.intervalMonths;

          if (priceOption.billingCycle === 'YEARLY') {
            period = 'yearly';
            interval = 1;
          } else {
            period = 'monthly';
            interval = priceOption.intervalMonths;
          }

          try {
            console.log(`Creating Razorpay plan for new cycle ${priceOption.billingCycle} during update...`);
            const rzpPlan = await rzp.plans.create({
              period: period,
              interval: interval,
              item: {
                name: `${planData.name || 'Plan'} - ${priceOption.billingCycle}`,
                amount: Math.round(priceOption.amount * 100),
                currency: planData.currency || 'INR',
                description: planData.description || `Subscription Plan`,
              },
            });
            priceOption.razorpayPlanId = rzpPlan.id;
          } catch (err) {
            logger.error(`Failed to register new plan cycle in Razorpay during update:`, err);
            throw new Error(`Razorpay plan registration failed: ${err.message}`);
          }
        }
      }
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, planData, {
      new: true,
      runValidators: true,
    });

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getPlans,
  getAllPlans,
  updatePlan,
  deletePlan,
};
