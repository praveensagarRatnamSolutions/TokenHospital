const consultationService = require('./consultation.service');
const logger = require('../../config/logger');

/**
 * @desc    Create a new consultation
 * @route   POST /api/patient/consultation
 * @access  Private (Doctor)
 */
const createConsultation = async (req, res, next) => {
    try {
        const consultationData = {
            ...req.body,
            hospitalId: req.hospitalId,
            doctorId: req.user.doctorId || req.user._id, // Support both doctor ID from profile and user ID
        };
        const consultation = await consultationService.createConsultation(consultationData);
        logger.info(`Consultation created for patient: ${consultation.patientId}`);
        res.status(201).json({ success: true, data: consultation });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get patient consultation history
 * @route   GET /api/patient/:patientId/history
 * @access  Private
 */
const getPatientHistory = async (req, res, next) => {
    try {
        const history = await consultationService.getPatientHistory(req.params.patientId, req.hospitalId);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get clinical data by token ID
 * @route   GET /api/patient/consultation/token/:tokenId
 * @access  Private
 */
const getConsultationByToken = async (req, res, next) => {
    try {
        const consultation = await consultationService.getConsultationByToken(req.params.tokenId, req.hospitalId);
        res.status(200).json({ success: true, data: consultation });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createConsultation,
    getPatientHistory,
    getConsultationByToken,
};
