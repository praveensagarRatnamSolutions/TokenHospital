const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const planPriceSchema = new mongoose.Schema(
  {
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
      required: true,
    },
    intervalMonths: {
      type: Number,
      required: true, // e.g. 1, 3, 6, 12
    },
    amount: {
      type: Number,
      required: true,
    },
    razorpayPlanId: {
      type: String,
      required: function () {
        return this.amount > 0;
      },
    },
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
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      default: 'MONTHLY',
    },
    prices: [planPriceSchema], // 👈 Dynamic, extensible prices array
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
      freeSmsUnits: {
        type: Number,
        default: 0,
      },
      freeEmailUnits: {
        type: Number,
        default: 0,
      },
    },
    features: [planFeatureSchema],
    trialDays: {
      type: Number,
      default: 30,
    },
    razorpayPlanId: {
      type: String,
      sparse: true,
    },
    razorpayPlanIdMonthly: {
      type: String,
      sparse: true,
    },
    razorpayPlanIdYearly: {
      type: String,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plan', planSchema);
