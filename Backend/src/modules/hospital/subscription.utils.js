const Hospital = require('./hospital.model');
const Plan = require('../subscription/plan.model');

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

  // 1. Identify which plan ID to fetch
  let planToFetch = hospital.planId || 'BASIC';

  // 2. If in trial and not expired, give PRO features
  if (hospital.subscriptionStatus === 'TRIAL' && hospital.trialEndDate > now) {
    planToFetch = 'PRO';
  }

  // 3. Fetch Plan from Database
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

  // 4. Fallback to hardcoded defaults
  return DEFAULT_LIMITS[planToFetch] || DEFAULT_LIMITS.BASIC;
};

/**
 * Checks if a hospital is in a valid state (Active, Trial, or Grace Period)
 */
const isSubscriptionValid = (hospital) => {
  const now = new Date();
  const validStatuses = ['ACTIVE', 'GRACE_PERIOD'];

  if (validStatuses.includes(hospital.subscriptionStatus)) return true;

  if (hospital.subscriptionStatus === 'TRIAL' && hospital.trialEndDate > now) return true;

  return false;
};

module.exports = {
  DEFAULT_LIMITS,
  getHospitalLimits,
  isSubscriptionValid,
};
