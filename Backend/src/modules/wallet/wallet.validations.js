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
  check('service', 'Service must be SMS or EMAIL').isIn(['SMS', 'EMAIL']),
  check('credits', 'Credits must be a positive integer').isInt({ min: 1 }),
  check('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
  check('currency', 'Currency must be a string').optional().isString(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
];

const updateTopupPackageValidation = [
  check('name', 'Package name must be a string').optional().trim().not().isEmpty(),
  check('service', 'Service must be SMS or EMAIL').optional().isIn(['SMS', 'EMAIL']),
  check('credits', 'Credits must be a positive integer').optional().isInt({ min: 1 }),
  check('price', 'Price must be a non-negative number').optional().isFloat({ min: 0 }),
  check('currency', 'Currency must be a string').optional().isString(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
];

module.exports = {
  validateRequest,
  createTopupPackageValidation,
  updateTopupPackageValidation,
};
