const Hospital = require('./hospital.model');
const Plan = require('../subscription/plan.model');
const HospitalSubscription = require('../subscription/hospitalSubscription.model');

/**
 * Default Fallback Limits (In case DB is not seeded)
 */
const DEFAULT_LIMITS = {
  BASIC: {
    maxDepartments: 1,
    maxDoctors: 2,
    maxKiosks: 0,
    label: 'Basic',
  },
  PRO: {
    maxDepartments: 5,
    maxDoctors: 10,
    maxKiosks: 1,
    label: 'Professional',
  },
  ENTERPRISE: {
    maxDepartments: Infinity,
    maxDoctors: Infinity,
    maxKiosks: -1, // unlimited
    label: 'Enterprise',
  },
};

/**
 * Helper to get limits for a hospital based on their plan and trial status
 */
const getHospitalLimits = async (hospital) => {
  const now = new Date();

  // 1. Fetch Subscription from Database
  const subscription = await HospitalSubscription.findOne({ hospitalId: hospital._id });

  // 2. Identify which plan ID to fetch
  let planToFetch = 'BASIC';
  let isTrialActive = false;

  if (subscription) {
    planToFetch = subscription.planId || 'BASIC';
    if (subscription.status === 'TRIAL' && subscription.currentPeriodEnd > now) {
      isTrialActive = true;
    }
  }

  // 3. If in trial and not expired, give PRO features
  if (isTrialActive) {
    planToFetch = 'PRO';
  }

  // 4. Fetch Plan from Database
  try {
    const plan = await Plan.findOne({ planId: planToFetch, isActive: true });
    if (plan) {
      return {
        maxDepartments: plan.limits.maxDepartments,
        maxDoctors: plan.limits.maxDoctors,
        maxKiosks: plan.limits.maxKiosks,
        label: plan.name,
        planId: plan.planId,
      };
    }
  } catch (error) {
    console.error('Error fetching plan from DB:', error);
  }

  // 5. Fallback to hardcoded defaults
  return DEFAULT_LIMITS[planToFetch] || DEFAULT_LIMITS.BASIC;
};

/**
 * Checks if a hospital is in a valid state (Active, Trial, or Grace Period)
 */
const isSubscriptionValid = async (hospital) => {
  const now = new Date();
  
  const subscription = await HospitalSubscription.findOne({ hospitalId: hospital._id });
  if (!subscription) return false;

  const validStatuses = ['ACTIVE', 'GRACE_PERIOD'];
  if (validStatuses.includes(subscription.status)) {
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
      return true;
    }
  }

  if (subscription.status === 'TRIAL' && subscription.currentPeriodEnd > now) return true;

  return false;
};

module.exports = {
  DEFAULT_LIMITS,
  getHospitalLimits,
  isSubscriptionValid,
};
