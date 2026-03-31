const { check } = require('express-validator');

const createTokenValidation = [
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),
    check('patientDetails.name', 'Patient name is required').not().isEmpty().trim(),
    check('patientDetails.phone', 'Patient phone is required').not().isEmpty().trim(),
    check('patientDetails.age', 'Patient age must be a number').optional().isNumeric(),

    check('doctorId', 'Doctor ID must be a valid Mongo ID').optional().isMongoId(),
    check('appointmentDate', 'Appointment date is required').not().isEmpty().isDate(),
    check('isEmergency', 'isEmergency must be a boolean').optional().isBoolean(),
]



module.exports = {
    createTokenValidation,
};
