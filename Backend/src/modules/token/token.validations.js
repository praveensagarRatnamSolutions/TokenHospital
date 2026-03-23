const { check } = require('express-validator');

const createTokenValidation = [
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),
    check('patientDetails.name', 'Patient name is required').not().isEmpty().trim(),
    check('patientDetails.phone', 'Patient phone is required').not().isEmpty().trim(),
    check('patientDetails.age', 'Patient age must be a number').optional().isNumeric(),
    check('patientDetails.gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
    check('patientDetails.problem', 'Problem description must be a string').optional().trim(),
    check('doctorId', 'Doctor ID must be a valid Mongo ID').optional().isMongoId(),
    check('appointmentDate', 'Appointment date must be in YYYY-MM-DD format').optional().isISO8601(),
];



module.exports = {
    createTokenValidation,
};
