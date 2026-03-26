// models/razorpay.model.js
const mongoose = require('mongoose');

const razorpaySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    merchantId: String,
    accessToken: String,
    refreshToken: String,

    webhookKey: String,
    webhookSecret: String,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RazorpayAccount', razorpaySchema);