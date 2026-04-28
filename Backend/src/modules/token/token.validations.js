const { check, body } = require("express-validator");

const createTokenValidation = [


  // ✅ Department
  check("departmentId", "Department ID is required")
    .notEmpty()
    .isMongoId(),

  // ✅ Doctor (optional)
  check("doctorId")
    .optional()
    .isMongoId()
    .withMessage("Doctor ID must be valid"),

  // ✅ Appointment Date (strict format)
  check("appointmentDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format"),

  // ✅ Payment Method (FIXED)
  check("paymentMethod")
    .optional()
    .isIn(["CASH", "UPI", "CARD"])
    .withMessage("Invalid payment method"),

  // ✅ Emergency
  check("isEmergency")
    .optional()
    .isBoolean()
    .withMessage("isEmergency must be boolean"),

  // ✅ Patient Name
  check("patientDetails.name")
    .notEmpty()
    .withMessage("Patient name is required")
    .trim(),

  // ✅ Phone (STRICT OBJECT)
  body("patientDetails.phone").custom((phone) => {
    if (!phone || typeof phone !== "object") {
      throw new Error("Phone must be an object");
    }

    if (!phone.full || phone.full.length < 10) {
      throw new Error("Valid phone.full is required");
    }

    if (!phone.countryCode) {
      throw new Error("countryCode is required");
    }

    if (!phone.country) {
      throw new Error("country is required");
    }

    if (!phone.nationalNumber || phone.nationalNumber.length < 10) {
      throw new Error("Valid nationalNumber required");
    }

    return true;
  }),

  // ✅ Age
  check("patientDetails.age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),

  // ✅ Gender
  check("patientDetails.gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),
];

module.exports = {
  createTokenValidation,
};