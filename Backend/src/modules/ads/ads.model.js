const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ad title is required"],
      trim: true,
      maxlength: [100, "Title is too long"],
    },
    type: {
      type: String,
      required: [true, "Ad type is required"],
      enum: {
        values: ["image", "video"],
        message: "{VALUE} is not a supported media type",
      },
    },
    fileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    contentType: {
      type: String,
      required: [true, "MIME Content-Type is required"],
      trim: true,
      // Example: image/png, video/mp4, image/webp
    },
    fileKey: {
      type: String,
      required: [true, "S3 file key is required"],
      unique: true,
      trim: true,
    },
    displayArea: {
      type: String,
      enum: ["carousel", "fullscreen"],
      default: "carousel",
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    duration: {
      type: Number,
      required: [true, "Display duration (seconds) is required"],
      min: [1, "Duration must be at least 1s"],
      max: [3600, "Duration cannot exceed 1 hour"],
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true, 
      transform: (doc, ret) => { 
        delete ret.__v; 
        return ret; 
      } 
    },
    toObject: { virtuals: true }
  }
);

// Compound index for high-speed retrieval of active ads
adSchema.index({ hospitalId: 1, isActive: 1 });

module.exports = mongoose.model("Ad", adSchema);