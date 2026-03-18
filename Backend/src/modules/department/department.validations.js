const { check } = require('express-validator');

const createDepartmentValidation = [
    check('name', 'Department name is required').not().isEmpty().trim(),
    check('prefix', 'Token prefix is required (e.g. A, B, C)').not().isEmpty().trim().isLength({ max: 3 }),
];

const updateDepartmentValidation = [
    check('name', 'Department name must be a string').optional().trim(),
    check('prefix', 'Prefix must be max 3 characters').optional().trim().isLength({ max: 3 }),
];

module.exports = {
    createDepartmentValidation,
    updateDepartmentValidation,
};
