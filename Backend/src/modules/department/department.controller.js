const departmentService = require('./department.service');
const logger = require('../../config/logger');

/**
 * @desc    Create a new department
 * @route   POST /api/department
 * @access  Private (Admin)
 */
const createDepartment = async (req, res, next) => {
    try {
        const departmentData = { ...req.body, hospitalId: req.hospitalId };
        const department = await departmentService.createDepartment(departmentData);
        logger.info(`Department created: ${department.name} [${department.prefix}]`);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Prefix already exists for this hospital' });
        }
        next(error);
    }
};

/**
 * @desc    Get all departments
 * @route   GET /api/department
 * @access  Private
 */
const getDepartments = async (req, res, next) => {
    try {
        const departments = await departmentService.getDepartments(req.hospitalId);
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update department
 * @route   PUT /api/department/:id
 * @access  Private (Admin)
 */
const updateDepartment = async (req, res, next) => {
    try {
        const department = await departmentService.updateDepartment(req.params.id, req.hospitalId, req.body);
        logger.info(`Department updated: ${department.name}`);
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        if (error.message === 'Department not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    updateDepartment,
};
