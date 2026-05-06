const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../../utils/crypto');

const settingsSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        hospitalName: {
            type: String,
            required: [true, 'Hospital name is required'],
            trim: true,
        },
        hospitalType: {
            type: String,
            enum: ['small', 'large'],
            default: 'small',
        },
        features: {
            doctorSelection: { type: Boolean, default: true },
            payment: { type: Boolean, default: false },
            ads: { type: Boolean, default: true },
            reports: { type: Boolean, default: true },
            autoAssign: { type: Boolean, default: true },
        },

        tokenResetTime: {
            type: String, // Cron expression, default midnight
            default: '0 0 * * *',
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
