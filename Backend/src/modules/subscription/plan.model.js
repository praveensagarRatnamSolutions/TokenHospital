const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    planId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
    },
    yearlyPrice: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      default: 'MONTHLY',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    limits: {
      maxDepartments: {
        type: Number,
        default: 1,
      },
      maxDoctors: {
        type: Number,
        default: 2,
      },
      maxKiosks: {
        type: Number,
        default: 0, // 0 = no kiosk, -1 = unlimited
      },
      allowCustomBranding: {
        type: Boolean,
        default: false,
      },
    },
    features: [planFeatureSchema],
    trialDays: {
      type: Number,
      default: 25,
    },
    razorpayPlanId: {
      type: String,
      sparse: true,
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

module.exports = mongoose.model('Plan', planSchema);
