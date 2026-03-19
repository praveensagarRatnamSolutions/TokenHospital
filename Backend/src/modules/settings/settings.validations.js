const { body } = require("express-validator");

/**
 * Validates cron expression format
 * Basic validation for cron expressions (5 fields: minute hour day month day-of-week)
 */
const isValidCronExpression = (value) => {
  // Allow common cron expressions
  const cronRegex =
    /^(\*|(\d+|\*\/\d+)(,(\d+|\*\/\d+))*)\s(\*|(\d+|\*\/\d+)(,(\d+|\*\/\d+))*)\s(\*|(\d+|\*\/\d+)(,(\d+|\*\/\d+))*)\s(\*|(\d+|\*\/\d+)(,(\d+|\*\/\d+))*)\s(\*|(\d+|\*\/\d+)(,(\d+|\*\/\d+))*)$/;
  return cronRegex.test(value);
};

/**
 * Validation rules for creating hospital settings
 */
const validateCreateSettings = [
  body("hospitalId")
    .trim()
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isMongoId()
    .withMessage("Hospital ID must be a valid MongoDB ID"),
  body("hospitalName")
    .trim()
    .notEmpty()
    .withMessage("Hospital name is required")
    .isLength({ min: 3 })
    .withMessage("Hospital name must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Hospital name must not exceed 100 characters"),
  body("hospitalType")
    .optional()
    .isIn(["small", "large"])
    .withMessage('Hospital type must be either "small" or "large"'),
  body("features")
    .optional()
    .isObject()
    .withMessage("Features must be an object"),
  body("features.doctorSelection")
    .optional()
    .isBoolean()
    .withMessage("doctorSelection must be a boolean"),
  body("features.payment")
    .optional()
    .isBoolean()
    .withMessage("payment must be a boolean"),
  body("features.ads")
    .optional()
    .isBoolean()
    .withMessage("ads must be a boolean"),
  body("features.reports")
    .optional()
    .isBoolean()
    .withMessage("reports must be a boolean"),
  body("features.autoAssign")
    .optional()
    .isBoolean()
    .withMessage("autoAssign must be a boolean"),
  body("tokenResetTime")
    .optional()
    .custom(isValidCronExpression)
    .withMessage(
      'tokenResetTime must be a valid cron expression (e.g., "0 0 * * *" for midnight)',
    ),
];

/**
 * Validation rules for updating hospital settings
 */
const validateUpdateSettings = [
  body("hospitalName")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Hospital name must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Hospital name must not exceed 100 characters"),
  body("hospitalType")
    .optional()
    .isIn(["small", "large"])
    .withMessage('Hospital type must be either "small" or "large"'),
  body("features")
    .optional()
    .isObject()
    .withMessage("Features must be an object"),
  body("features.doctorSelection")
    .optional()
    .isBoolean()
    .withMessage("doctorSelection must be a boolean"),
  body("features.payment")
    .optional()
    .isBoolean()
    .withMessage("payment must be a boolean"),
  body("features.ads")
    .optional()
    .isBoolean()
    .withMessage("ads must be a boolean"),
  body("features.reports")
    .optional()
    .isBoolean()
    .withMessage("reports must be a boolean"),
  body("features.autoAssign")
    .optional()
    .isBoolean()
    .withMessage("autoAssign must be a boolean"),
  body("tokenResetTime")
    .optional()
    .custom(isValidCronExpression)
    .withMessage(
      'tokenResetTime must be a valid cron expression (e.g., "0 0 * * *" for midnight)',
    ),
];

module.exports = {
  validateCreateSettings,
  validateUpdateSettings,
};
