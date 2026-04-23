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

        education: {
            type: String, // e.g. MBBS, MD
        },

        // ✅ Availability (day-wise with sessions)
        availability: [
            {
                day: {
                    type: String, // "Monday"
                    required: true,
                },
                sessions: [
                    {
                        label: {
                            type: String, // "Morning", "Evening"
                        },
                        from: {
                            type: String, // "09:00"
                            required: true,
                        },
                        to: {
                            type: String, // "13:00"
                            required: true,
                        },
                        maxTokens: {
                            type: Number, // tokens only for this session
                        },
                        avgTimePerPatient: {
                            type: Number, // override global if needed
                        },
                        breaks: [
                            {
                                from: String,
                                to: String,
                                label: String, // "Tea Break"
                            },
                        ],
                    },
                ],
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

