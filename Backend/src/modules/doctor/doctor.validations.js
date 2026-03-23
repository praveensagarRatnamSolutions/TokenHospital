const { check } = require('express-validator');

const createDoctorValidation = [
    check('name', 'Doctor name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),

    check('experience', 'Experience is required and must be a number').not().isEmpty().isNumeric(),
    check('tokenConfig.maxPerDay', 'Max tokens per day is required').not().isEmpty().isNumeric(),
    check('consultationFee', 'Consultation fee is required and must be a number').not().isEmpty().isNumeric(),
    check('availability', 'Availability must be an array').optional().isArray(),

];

const updateDoctorValidation = [
    check('name', 'Doctor name must be a string').optional().trim(),
    check('profilePic', 'Profile pic must be a string').optional().trim(),
    check('departmentId', 'Department ID must be valid').optional().isMongoId(),

    check('experience', 'Experience must be a number').optional().isNumeric(),
    check('isAvailable', 'Status must be a boolean').optional().isBoolean(),
    check('availability', 'Availability must be an array').optional().isArray(),
    check('tokenConfig.maxPerDay', 'Max tokens per day must be a number').optional().isNumeric(),
    check('tokenConfig.avgTimePerPatient', 'Avg time must be a number').optional().isNumeric(),
    check('breaks', 'Breaks must be an array').optional().isArray(),
];

module.exports = {
    createDoctorValidation,
    updateDoctorValidation,
};
