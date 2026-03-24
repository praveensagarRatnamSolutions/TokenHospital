const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
        },
        prefix: {
            type: String,
            required: [true, 'Token prefix is required (e.g. A, B, C)'],
            uppercase: true,
            trim: true,
            maxlength: 5,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Hospital ID is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: unique prefix per hospital
departmentSchema.index({ hospitalId: 1, prefix: 1 }, { unique: true });
departmentSchema.index({ hospitalId: 1 });

module.exports = mongoose.model('Department', departmentSchema);
