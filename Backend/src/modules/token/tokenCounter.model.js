const mongoose = require('mongoose');

const tokenCounterSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
        date: {
            type: String, // YYYY-MM-DD format
            required: true,
        },
        lastSequence: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Unique counter per hospital-department-date
tokenCounterSchema.index({ hospitalId: 1, departmentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TokenCounter', tokenCounterSchema);
