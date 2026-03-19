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

  check('phone', 'Valid phone number is required')
    .not()
    .isEmpty()
    .isLength({ min: 10 }),
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
