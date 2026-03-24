const Patient = require('./patient.model');
const Token = require('../token/token.model');
const Consultation = require('./consultation.model');
const logger = require('../../config/logger');

/**
 * @desc    Search patient by phone
 * @route   GET /api/patient/search
 * @access  Private
 */
const searchPatient = async (req, res, next) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const patient = await Patient.findOne({ hospitalId: req.hospitalId, phone }).lean();
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get patient history (all tokens)
 * @route   GET /api/patient/:id/history
 * @access  Private
 */
const getPatientHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const history = await Token.find({ 
            hospitalId: req.hospitalId, 
            patientId: id 
        })
        .populate('doctorId', 'name')
        .populate('departmentId', 'name prefix')
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a consultation for a patient
 * @route   POST /api/patient/:id/consultation
 * @access  Private
 */
const createConsultation = async (req, res, next) => {
    try {
        const { id: patientId } = req.params;
        const hospitalId = req.hospitalId;
        const consultationData = { ...req.body, patientId, hospitalId };

        const consultation = await Consultation.create(consultationData);
        res.status(201).json({ success: true, data: consultation });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all consultations for a patient
 * @route   GET /api/patient/:id/consultations
 * @access  Private
 */
const getPatientConsultations = async (req, res, next) => {
    try {
        const { id: patientId } = req.params;
        const hospitalId = req.hospitalId;

        const consultations = await Consultation.find({ patientId, hospitalId })
            .populate('doctorId', 'name')
            .populate('tokenId', 'tokenNumber')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, count: consultations.length, data: consultations });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchPatient,
    getPatientHistory,
    createConsultation,
    getPatientConsultations,
};
