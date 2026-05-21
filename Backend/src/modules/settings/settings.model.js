const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    features: {
      doctorSelection: { type: Boolean, default: true },
      payment: { type: Boolean, default: false },
      ads: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
      autoAssign: { type: Boolean, default: true },
    },
    tokenResetTime: {
      type: String,
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
