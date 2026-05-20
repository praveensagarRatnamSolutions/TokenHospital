const mongoose = require('mongoose');

const subscriptionTransactionSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['SUBSCRIPTION', 'WALLET_TOPUP', 'WALLET_DEDUCTION'],
      required: true,
    },
    planId: {
      type: String,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    razorpayOrderId: String,
    razorpaySubscriptionId: String,
    razorpayPaymentId: String,
    description: String,
    metadata: Object,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SubscriptionTransaction', subscriptionTransactionSchema);
