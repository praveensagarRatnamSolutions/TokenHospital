const Hospital = require('../modules/hospital/hospital.model');
const { getHospitalLimits, isSubscriptionValid } = require('../modules/hospital/subscription.utils');
const Doctor = require('../modules/doctor/doctor.model');
const Department = require('../modules/department/department.model');
const Kiosk = require('../modules/kiosk/kiosk.model');

/**
 * Middleware to enforce plan limits before resource creation
 * @param {string} resourceType - 'doctors', 'departments', or 'kiosk'
 */
const checkLimit = (resourceType) => {
  return async (req, res, next) => {
    try {
      const hospitalId = req.hospitalId;
      if (!hospitalId) return res.status(400).json({ success: false, message: 'Hospital ID missing' });

      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

      // 1. Check if subscription/trial is valid
      if (!isSubscriptionValid(hospital)) {
        return res.status(403).json({
          success: false,
          message: 'Your subscription or trial has expired. Please upgrade to continue.',
          code: 'SUBSCRIPTION_EXPIRED',
        });
      }

      // 2. Get Plan Limits
      const limits = await getHospitalLimits(hospital);

      // 3. Resource specific checks
      if (resourceType === 'departments') {
        const count = await Department.countDocuments({ hospitalId });
        if (count >= limits.maxDepartments) {
          return res.status(403).json({
            success: false,
            message: `Limit Reached: Your plan allows only ${limits.maxDepartments} departments.`,
            code: 'LIMIT_REACHED',
          });
        }
      }

      if (resourceType === 'doctors') {
        const count = await Doctor.countDocuments({ hospitalId });
        if (count >= limits.maxDoctors) {
          return res.status(403).json({
            success: false,
            message: `Limit Reached: Your plan allows only ${limits.maxDoctors} doctors.`,
            code: 'LIMIT_REACHED',
          });
        }
      }

      if (resourceType === 'kiosk') {
        // -1 means unlimited
        if (limits.maxKiosks === 0) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: Your current plan does not include Kiosk access. Please upgrade.',
            code: 'FEATURE_LOCKED',
          });
        }

        if (limits.maxKiosks > 0) {
          const count = await Kiosk.countDocuments({ hospitalId });
          if (count >= limits.maxKiosks) {
            return res.status(403).json({
              success: false,
              message: `Limit Reached: Your plan allows only ${limits.maxKiosks} kiosks.`,
              code: 'LIMIT_REACHED',
            });
          }
        }
        // maxKiosks === -1 means unlimited, so just pass through
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkLimit };
