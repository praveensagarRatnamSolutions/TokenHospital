const { check } = require('express-validator');

const planCreationValidation = [
  check('name', 'Plan name is required and must be a string').notEmpty().isString().trim(),
  check('planId', 'planId is required and must be a string').notEmpty().isString().trim().toUpperCase(),
  check('price', 'Price is required and must be a positive number').notEmpty().isFloat({ min: 0 }),
  check('limits', 'Limits configuration is required').notEmpty().isObject(),
  check('limits.maxDepartments', 'maxDepartments limit must be an integer').notEmpty().isInt(),
  check('limits.maxDoctors', 'maxDoctors limit must be an integer').notEmpty().isInt(),
  check('limits.maxKiosks', 'maxKiosks limit must be an integer').notEmpty().isInt(),
  check('prices', 'Prices cycle array must be an array if provided').optional().isArray(),
  check('prices.*.billingCycle', 'Each cycle must match MONTHLY, QUARTERLY, HALF_YEARLY, or YEARLY')
    .optional()
    .isIn(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
  check('prices.*.intervalMonths', 'intervalMonths is required for prices and must be an integer')
    .optional()
    .isInt({ min: 1 }),
  check('prices.*.amount', 'amount is required for prices and must be a positive number')
    .optional()
    .isFloat({ min: 0 }),
];

const checkoutValidation = [
  check('planId', 'planId is required and must be a string').notEmpty().isString().trim(),
  check('billingCycle', 'billingCycle is required and must be one of: MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY')
    .notEmpty()
    .isIn(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
];

const verifyCheckoutValidation = [
  check('razorpay_payment_id', 'razorpay_payment_id signature token is required').notEmpty().isString().trim(),
  check('razorpay_subscription_id', 'razorpay_subscription_id token is required').notEmpty().isString().trim(),
  check('razorpay_signature', 'razorpay_signature verification token is required').notEmpty().isString().trim(),
  check('planId', 'planId is required and must be a string').notEmpty().isString().trim(),
  check('billingCycle', 'billingCycle is required and must be one of: MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY')
    .notEmpty()
    .isIn(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
];

module.exports = {
  planCreationValidation,
  checkoutValidation,
  verifyCheckoutValidation,
};
