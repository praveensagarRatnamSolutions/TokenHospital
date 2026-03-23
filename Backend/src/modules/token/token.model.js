const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        tokenNumber: {
            type: String,
            required: true,
        },
        sequenceNumber: {
            type: Number,
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: [true, 'Department is required'],
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            default: null,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Hospital ID is required'],
        },
        status: {
            type: String,
            enum: ['waiting', 'current', 'completed', 'canceled'],
            default: 'waiting',
        },
        appointmentDate: {
            type: String, // YYYY-MM-DD
            required: true,
            default: () => new Date().toISOString().split('T')[0]
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        problem: {
            type: String,
        },
        calledAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        canceledAt: {
            type: Date,
            default: null,
        },
    },


    {
        timestamps: true,
    }
);

// Indexes for performance-critical queries
tokenSchema.index({ hospitalId: 1, status: 1, appointmentDate: 1, createdAt: 1 });
tokenSchema.index({ hospitalId: 1, doctorId: 1, status: 1, appointmentDate: 1 });
tokenSchema.index({ hospitalId: 1, departmentId: 1, status: 1, appointmentDate: 1 });
tokenSchema.index({ hospitalId: 1, appointmentDate: 1, createdAt: -1 });


module.exports = mongoose.model('Token', tokenSchema);
