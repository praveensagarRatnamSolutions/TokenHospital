const mongoose = require('mongoose');

const topupPackageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  // Map of service names (e.g. 'SMS', 'EMAIL') to credit numbers
  creditsMap: {
    type: Map,
    of: Number,
    default: {}
  },
  // Deprecated/Legacy fields kept for backward compatibility
  service: { 
    type: String, 
    required: false 
  },
  credits: { 
    type: Number, 
    required: false 
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

// Post-init hook to migrate legacy documents dynamically at load time
topupPackageSchema.post('init', function(doc) {
  if (!doc.creditsMap) {
    doc.creditsMap = new Map();
  }
  if (doc.service && doc.credits && (!doc.creditsMap.size || doc.creditsMap.size === 0)) {
    doc.creditsMap.set(doc.service, doc.credits);
  }
});

// Pre-save hook to populate legacy fields for any existing integrations
topupPackageSchema.pre('save', function(next) {
  if (this.creditsMap && this.creditsMap.size > 0) {
    const entries = Array.from(this.creditsMap.entries());
    if (entries.length === 1) {
      this.service = entries[0][0];
      this.credits = entries[0][1];
    } else {
      // Pick first service as fallback and sum all credits
      this.service = entries[0][0];
      let total = 0;
      for (const [_, val] of entries) {
        total += val || 0;
      }
      this.credits = total;
    }
  }
  next();
});

module.exports = mongoose.model('TopupPackage', topupPackageSchema);
