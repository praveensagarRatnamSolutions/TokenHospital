const mongoose = require('mongoose');

const hospitalSubscriptionSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'TRIAL',
        'ACTIVE',
        'PAST_DUE',
        'UNPAID',
        'CANCELLED',
        'PAUSED',
        'GRACE_PERIOD',
        'EXPIRED',
      ],
      required: true,
      default: 'TRIAL',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    trialStart: Date,
    trialEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: Date,
    endedAt: Date,
    gatewayName: {
      type: String,
      default: 'RAZORPAY',
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    pendingPriceChange: {
      planId: String,
      billingCycle: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
      },
      currentAmount: Number,
      newAmount: Number,
      currency: {
        type: String,
        default: 'INR',
      },
      effectiveDate: Date,
      noticeSentAt: Date,
      status: {
        type: String,
        enum: ['NOTICE_SENT', 'ACCEPTED', 'CANCELLED'],
      },
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose index for optimized billing cycle period check runs
hospitalSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

module.exports = mongoose.model('HospitalSubscription', hospitalSubscriptionSchema);
