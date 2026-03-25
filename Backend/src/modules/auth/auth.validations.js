const { check, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),

  check('email', 'Please include a valid email').isEmail().normalizeEmail(),

  check('password', 'Password must be at least 6 characters').isLength({
    min: 6,
  }),

  // ✅ Add hospital fields instead
  check('hospitalName', 'Hospital name is required').not().isEmpty(),

  check('phone.full', 'Valid phone number is required')
    .notEmpty()
    .isLength({ min: 10 }),

  // ✅ optional but recommended
  check('phone.countryCode', 'Country code is required').notEmpty(),

  check('phone.country', 'Country is required').notEmpty(),

  check('phone.nationalNumber', 'Invalid phone number')
    .notEmpty()
    .isLength({ min: 5 }),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

module.exports = {
  registerValidation,
  loginValidation,
  validateRequest,
};
