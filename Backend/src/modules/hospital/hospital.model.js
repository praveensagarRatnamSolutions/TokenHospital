const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      full: {
        type: String,
        required: true,
        unique: true,
      },
      countryCode: {
        type: String, // "+91"
        required: true,
      },
      country: {
        type: String, // "IN"
        required: true,
      },
      nationalNumber: {
        type: String,
        required: true,
      },
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    wallet: {
      smsCredits: {
        type: Number,
        default: 0,
        min: 0,
      },
      emailCredits: {
        type: Number,
        default: 0,
        min: 0,
      }
    },
    // ✅ ADD THIS
    timezone: {
      type: String,
      default: 'Asia/Kolkata', // fallback
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    logo: {
      type: String,
    },
    // --- Compliance ---
    gstNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
