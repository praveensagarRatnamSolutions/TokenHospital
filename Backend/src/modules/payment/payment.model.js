const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    tokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
    patientId: {
      type: String, // Or ObjectId if you have a Patient model
      ref: "Patient",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    method: { type: String, enum: ['CASH', 'UPI', 'CARD'], required: true },
    status: {
      type: String,
      enum: ["pending", "captured", "failed"],
      default: "pending",
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
