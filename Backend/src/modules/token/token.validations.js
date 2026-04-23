const { check, body } = require('express-validator');

const createTokenValidation = [
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),
    check('patientDetails.name', 'Patient name is required').not().isEmpty().trim(),
    body('patientDetails.phone').custom((value) => {
        if (typeof value === 'string') {
            if (value.trim().length < 10) throw new Error('Phone number must be at least 10 digits');
            return true;
        }
        if (typeof value === 'object' && value !== null) {
            if (!value.full || value.full.trim().length < 10) throw new Error('Valid phone number is required');
            return true;
        }
        throw new Error('Invalid phone number format');
    }),
    check('patientDetails.age', 'Patient age must be a number').optional().isNumeric(),

    check('doctorId', 'Doctor ID must be a valid Mongo ID').optional().isMongoId(),
    check('appointmentDate', 'Appointment date must be a valid date').optional().isDate(),
    check('isEmergency', 'isEmergency must be a boolean').optional().isBoolean(),
]



module.exports = {
    createTokenValidation,
};
