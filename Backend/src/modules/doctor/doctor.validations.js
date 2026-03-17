const { check } = require('express-validator');

const createDoctorValidation = [
    check('name', 'Doctor name is required').not().isEmpty().trim(),
    check('departmentId', 'Department ID is required').not().isEmpty().isMongoId(),
];

const updateDoctorValidation = [
    check('name', 'Doctor name must be a string').optional().trim(),
    check('departmentId', 'Department ID must be valid').optional().isMongoId(),
];

module.exports = {
    createDoctorValidation,
    updateDoctorValidation,
};
