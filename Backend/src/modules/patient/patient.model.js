const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Patient phone is required'],
            trim: true,
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique phone number per hospital
patientSchema.index({ hospitalId: 1, phone: 1 }, { unique: true });
patientSchema.index({ hospitalId: 1, name: 1 });

module.exports = mongoose.model('Patient', patientSchema);
