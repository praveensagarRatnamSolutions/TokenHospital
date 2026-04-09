const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Kiosk name is required'],
      trim: true,
      maxlength: [100, 'Name is too long'],
    },

    code: {
      type: String,
      required: [true, 'Kiosk code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
      index: true,
    },

    // ✅ Access control
    departmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
      },
    ],

    doctorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        index: true,
      },
    ],

    // ✅ Ads playlist
    ads: [
      {
        adId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ad',
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],

    locationType: {
      type: String,
      enum: ['reception', 'waiting_area', 'doctor_room', 'general'],
      default: 'general',
    },

    // ✅ NEW: who created this kiosk
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// 🔥 Compound indexes for efficient filtering
// Note: We split these to avoid "cannot index parallel arrays" error
kioskSchema.index({ hospitalId: 1, departmentIds: 1, isActive: 1 });
kioskSchema.index({ hospitalId: 1, doctorIds: 1, isActive: 1 });
kioskSchema.index({ hospitalId: 1, createdBy: 1, isActive: 1 });

module.exports = mongoose.model('Kiosk', kioskSchema);
