const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: false,
      index: true,
    },
    patientDetails: {
      type: Object, // Stores name, phone, age, gender temporarily
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId, // Or ObjectId if you have a Patient model
      ref: 'Patient',
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    method: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
