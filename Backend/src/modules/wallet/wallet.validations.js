const { check, validationResult } = require('express-validator');

// Shared validateRequest middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const createTopupPackageValidation = [
  check('name', 'Package name is required').not().isEmpty().trim(),
  check('creditsMap', 'creditsMap must be an object').isObject(),
  check('creditsMap').custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error('creditsMap must be a valid object');
    }
    let total = 0;
    for (const key in value) {
      const val = value[key];
      if (val !== undefined && val !== null) {
        if (!Number.isInteger(val) || val < 0) {
          throw new Error(`Credit value for ${key} must be a non-negative integer`);
        }
        total += val;
      }
    }
    if (total <= 0) {
      throw new Error('At least one service must have credits greater than 0');
    }
    return true;
  }),
  check('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
  check('currency', 'Currency must be a string').optional().isString(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
];

const updateTopupPackageValidation = [
  check('name', 'Package name must be a string').optional().trim().not().isEmpty(),
  check('creditsMap', 'creditsMap must be an object').optional().isObject(),
  check('creditsMap').optional().custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error('creditsMap must be a valid object');
    }
    let total = 0;
    for (const key in value) {
      const val = value[key];
      if (val !== undefined && val !== null) {
        if (!Number.isInteger(val) || val < 0) {
          throw new Error(`Credit value for ${key} must be a non-negative integer`);
        }
        total += val;
      }
    }
    if (total <= 0) {
      throw new Error('At least one service must have credits greater than 0');
    }
    return true;
  }),
  check('price', 'Price must be a non-negative number').optional().isFloat({ min: 0 }),
  check('currency', 'Currency must be a string').optional().isString(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
];

module.exports = {
  validateRequest,
  createTopupPackageValidation,
  updateTopupPackageValidation,
};
