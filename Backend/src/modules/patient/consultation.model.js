// models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Your Doctor/Staff user
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    tokenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token' // Links this specific visit to the token issued
    },
    diagnosis: { type: String, trim: true },
    symptoms: [String],
    prescription: [{
        medicineName: String,
        dosage: String, // e.g., "1-0-1"
        duration: String, // e.g., "5 days"
        instructions: String // e.g., "After food"
    }],
    vitals: {
        bp: String,
        hr: String,
        spo2: String,
        temp: String
    },
    notes: { type: String }, // Doctor's private notes
    nextFollowUp: { type: Date }
}, { timestamps: true });

// Index for fast retrieval of a specific patient's history
consultationSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);