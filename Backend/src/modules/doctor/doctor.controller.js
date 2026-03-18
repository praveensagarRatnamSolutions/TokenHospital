const doctorService = require('./doctor.service');
const logger = require('../../config/logger');

/**
 * @desc    Add a new doctor
 * @route   POST /api/doctor
 * @access  Private (Admin)
 */
const createDoctor = async (req, res, next) => {
    try {
        const doctorData = { ...req.body, hospitalId: req.hospitalId };
        const doctor = await doctorService.createDoctor(doctorData);
        logger.info(`Doctor created: ${doctor.name} for hospital ${req.hospitalId}`);
        res.status(201).json({ success: true, data: doctor });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all doctors (with optional department filter)
 * @route   GET /api/doctor
 * @access  Private
 */
const getDoctors = async (req, res, next) => {
    try {
        const filters = {
            departmentId: req.query.departmentId,
            isAvailable: req.query.isAvailable,
            page: req.query.page,
            limit: req.query.limit,
        };
        const result = await doctorService.getDoctors(req.hospitalId, filters);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctor/:id
 * @access  Private
 */
const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await doctorService.getDoctorById(req.params.id, req.hospitalId);
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        if (error.message === 'Doctor not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Update doctor
 * @route   PUT /api/doctor/:id
 * @access  Private (Admin)
 */
const updateDoctor = async (req, res, next) => {
    try {
        const doctor = await doctorService.updateDoctor(req.params.id, req.hospitalId, req.body);
        logger.info(`Doctor updated: ${doctor.name}`);
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        if (error.message === 'Doctor not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Toggle doctor availability (online/offline)
 * @route   PATCH /api/doctor/:id/status
 * @access  Private (Admin, Doctor)
 */
const toggleDoctorStatus = async (req, res, next) => {
    try {
        const doctor = await doctorService.toggleDoctorStatus(req.params.id, req.hospitalId);
        logger.info(`Doctor ${doctor.name} status toggled to ${doctor.isAvailable ? 'Available' : 'Unavailable'}`);
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        if (error.message === 'Doctor not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    toggleDoctorStatus,
};
