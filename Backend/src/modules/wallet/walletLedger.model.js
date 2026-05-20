const mongoose = require('mongoose');

const walletLedgerSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'], // CREDIT = added to wallet, DEBIT = used/deducted
    required: true,
  },
  service: {
    type: String,
    enum: ['SMS', 'EMAIL'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String, // e.g., "Monthly Plan Renewal: 500 units added" or "Token #12 Alert"
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['SUBSCRIPTION_RENEWAL', 'MANUAL_TOPUP', 'TOKEN_ALERT', 'PROMOTIONAL_GIFT'],
  },
  referenceId: {
    type: String, // ID of the token, subscription, or payment
  }
}, { timestamps: true });

module.exports = mongoose.model('WalletLedger', walletLedgerSchema);
