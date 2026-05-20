const mongoose = require('mongoose');

const topupPackageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  service: { 
    type: String, 
    enum: ['SMS', 'EMAIL'], 
    required: true 
  },
  credits: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  razorpayItemId: { 
    type: String,
    sparse: true,
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('TopupPackage', topupPackageSchema);
