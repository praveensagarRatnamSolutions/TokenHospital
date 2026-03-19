const { body, validationResult } = require("express-validator");

const createHospitalValidation = [
  body("hospitalName")
    .trim()
    .notEmpty()
    .withMessage("Hospital name is required")
    .isLength({ min: 3 })
    .withMessage("Hospital name must be at least 3 characters"),
   body("adminName")
    .trim()
    .notEmpty()
    .withMessage("Admin name is required")
    .isLength({ min: 3 })
    .withMessage("Admin name must be at least 3 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Invalid phone number format"),
  body("address.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("address.city").trim().notEmpty().withMessage("City is required"),
  body("address.state").trim().notEmpty().withMessage("State is required"),
  body("address.zipCode").trim().notEmpty().withMessage("Zip code is required"),
  body("address.country").trim().notEmpty().withMessage("Country is required"),
  body("registrationNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Registration number cannot be empty if provided"),
  body("licenseNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License number cannot be empty if provided"),
];

const updateHospitalValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Hospital name must be at least 3 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Invalid phone number format"),
];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  createHospitalValidation,
  updateHospitalValidation,
  validateRequest,
};
