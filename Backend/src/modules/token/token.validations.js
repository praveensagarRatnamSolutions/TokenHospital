const { check } = require('express-validator');

const createTokenValidation = [
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),
    check('patientDetails.name', 'Patient name is required').not().isEmpty().trim(),
    check('patientDetails.age', 'Patient age must be a number').optional().isNumeric(),
    check('patientDetails.problem', 'Problem description must be a string').optional().trim(),
    check('doctorId', 'Doctor ID must be a valid Mongo ID').optional().isMongoId(),
];

module.exports = {
    createTokenValidation,
};
