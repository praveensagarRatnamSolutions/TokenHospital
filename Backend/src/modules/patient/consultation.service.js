const Consultation = require('./consultation.model');
const Token = require('../token/token.model');

/**
 * Create a new consultation record
 */
const createConsultation = async (consultationData) => {
    const consultation = await Consultation.create(consultationData);
    return consultation;
};

/**
 * Get consultation history for a patient
 */
const getPatientHistory = async (patientId, hospitalId) => {
    return Consultation.find({ patientId, hospitalId })
        .sort({ createdAt: -1 })
        .populate('doctorId', 'name')
        .populate('tokenId', 'tokenNumber appointmentDate');
};

/**
 * Get a specific consultation by token ID
 */
const getConsultationByToken = async (tokenId, hospitalId) => {
    return Consultation.findOne({ tokenId, hospitalId });
};

module.exports = {
    createConsultation,
    getPatientHistory,
    getConsultationByToken,
};
