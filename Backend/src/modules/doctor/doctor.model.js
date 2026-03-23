const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Doctor name is required'],
            trim: true,
        },

        departmentId: {


            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: [true, 'Department is required'],
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Hospital ID is required'],
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        // ✅ Experience
        experience: {
            type: Number, // years
            required: [true, 'Experience is required'],
        },

        // ✅ Availability (day-wise)
        availability: [
            {
                day: {
                    type: String, // "Monday"
                    required: true,
                },
                from: {
                    type: String, // "09:00"
                    required: true,
                },
                to: {
                    type: String, // "17:00"
                    required: true,
                },
            },
        ],

        // ✅ Token Configuration
        tokenConfig: {
            maxPerDay: {
                type: Number,
                required: [true, 'Max tokens per day required'],
            },
            avgTimePerPatient: {
                type: Number, // minutes
                default: 10,
            },
        },

        // ✅ Live Queue Tracking
        currentToken: {
            type: Number,
            default: 0,
        },

        // ✅ Optional Break Time
        breaks: [
            {
                from: String,
                to: String,
                label: String, // Added label (e.g., "Lunch Break")
            },
        ],
        // ✅ Consultation Fee
        consultationFee: {
            type: Number,
            required: [true, 'Consultation fee is required'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }

);

// ✅ Indexes for performance
doctorSchema.index({ hospitalId: 1, departmentId: 1 });
doctorSchema.index({ hospitalId: 1, isAvailable: 1 });
doctorSchema.index({ hospitalId: 1, name: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);

