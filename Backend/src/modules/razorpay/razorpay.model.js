// modules/razorpay/razorpay.model.js
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../../utils/crypto');

const razorpayConfigSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        keyId: { 
            type: String, 
            trim: true 
        },
        keySecret: { 
            type: String, 
            trim: true,
            set: encrypt,
            get: decrypt
        },
        webhookSecret: { 
            type: String, 
            trim: true,
            set: encrypt,
            get: decrypt
        },
        webhookKey: {
            type: String,
            unique: true,
            sparse: true
        },
        enabled: { 
            type: Boolean, 
            default: false 
        }
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

module.exports = mongoose.model('RazorpayConfig', razorpayConfigSchema);