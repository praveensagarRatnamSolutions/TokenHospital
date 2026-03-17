const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ad title is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['image', 'video'],
            required: [true, 'Ad type is required'],
        },
        fileKey: {
            type: String, // S3 object key
            required: [true, 'File key is required'],
        },
        fileUrl: {
            type: String, // Can store a public or CDN URL if needed
            default: null,
        },
        displayArea: {
            type: String,
            enum: ['carousel', 'fullscreen'],
            default: 'carousel',
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Hospital ID is required'],
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null, // null = global ad
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

adSchema.index({ hospitalId: 1, isActive: 1, startTime: 1, endTime: 1 });
adSchema.index({ hospitalId: 1, departmentId: 1 });

module.exports = mongoose.model('Ad', adSchema);
