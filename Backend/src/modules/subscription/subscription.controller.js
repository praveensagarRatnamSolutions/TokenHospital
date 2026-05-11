const Hospital = require('../hospital/hospital.model');
const Doctor = require('../doctor/doctor.model');
const Department = require('../department/department.model');
const Kiosk = require('../kiosk/kiosk.model');
const Plan = require('../subscription/plan.model');
const { getHospitalLimits, isSubscriptionValid } = require('../hospital/subscription.utils');
const logger = require('../../config/logger');

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

    // 1. Get Plan Limits (async — must await)
    const limits = await getHospitalLimits(hospital);
    const isValid = isSubscriptionValid(hospital);

    // 2. Get Current Usage Counts
    const [doctorCount, departmentCount, kioskCount] = await Promise.all([
      Doctor.countDocuments({ hospitalId: req.hospitalId }),
      Department.countDocuments({ hospitalId: req.hospitalId }),
      Kiosk.countDocuments({ hospitalId: req.hospitalId }),
    ]);

    // 3. Calculate Trial Days Left
    let trialDaysLeft = 0;
    if (hospital.subscriptionStatus === 'TRIAL' && hospital.trialEndDate) {
      const now = new Date();
      const diffTime = hospital.trialEndDate - now;
      trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (trialDaysLeft < 0) trialDaysLeft = 0;
    }

    // 4. Fetch full plan details for frontend rendering
    const currentPlan = await Plan.findOne({ planId: hospital.planId, isActive: true });

    res.json({
      success: true,
      data: {
        planId: hospital.planId,
        planName: currentPlan?.name || limits.label || hospital.planId,
        planDescription: currentPlan?.description || '',
        status: hospital.subscriptionStatus,
        isValid,
        trialDaysLeft,
        trialEndDate: hospital.trialEndDate,
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

    const hospital = await Hospital.findByIdAndUpdate(
      req.hospitalId,
      {
        planId: plan.planId,
        subscriptionStatus: 'ACTIVE',
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Plan changed to ${plan.name}`,
      data: { planId: hospital.planId, status: hospital.subscriptionStatus },
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

    const updateData = { planId: plan.planId };
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;

    const hospital = await Hospital.findByIdAndUpdate(hospitalId, updateData, { new: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    res.json({
      success: true,
      message: `Assigned ${plan.name} to ${hospital.name}`,
      data: { planId: hospital.planId, status: hospital.subscriptionStatus },
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

module.exports = {
  getSubscriptionStatus,
  changePlan,
  assignPlan,
  getBillingHistory,
};
