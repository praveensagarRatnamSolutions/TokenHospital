const mongoose = require('mongoose');
const Hospital = require('../hospital/hospital.model');
const WalletLedger = require('./walletLedger.model');
const { sendEmail } = require('../../utils/email');
const logger = require('../../config/logger');

class WalletService {
  /**
   * Credit units to the hospital's wallet
   */
  static async creditWallet(hospitalId, service, amount, description, referenceType, referenceId, session = null) {
    if (amount <= 0) return;

    const serviceKey = `${service.toLowerCase()}Credits`;
    const updateField = `wallet.${serviceKey}`;
    
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { $inc: { [updateField]: amount } },
      { new: true, session }
    );

    if (!hospital) {
      throw new Error('Hospital not found for wallet credit');
    }

    const balanceAfter = hospital.wallet ? hospital.wallet[serviceKey] : 0;

    await WalletLedger.create([{
      hospitalId,
      type: 'CREDIT',
      service,
      amount,
      balanceAfter,
      description,
      referenceType,
      referenceId
    }], { session });

    return balanceAfter;
  }

  /**
   * Deduct units from the hospital's wallet (e.g., when sending an SMS)
   */
  static async deductWallet(hospitalId, service, amount = 1, description = 'Service Usage', referenceType = 'TOKEN_ALERT', referenceId = null, session = null) {
    if (amount <= 0) return;

    const serviceKey = `${service.toLowerCase()}Credits`;
    const updateField = `wallet.${serviceKey}`;
    
    // Atomic findAndModify ensuring we don't drop below 0
    const hospital = await Hospital.findOneAndUpdate(
      { 
        _id: hospitalId,
        [updateField]: { $gte: amount } // Ensure they have enough balance
      },
      { $inc: { [updateField]: -amount } },
      { new: true, session }
    );

    if (!hospital) {
      throw new Error(`Insufficient ${service} credits or Hospital not found`);
    }

    const balanceAfter = hospital.wallet ? hospital.wallet[serviceKey] : 0;

    await WalletLedger.create([{
      hospitalId,
      type: 'DEBIT',
      service,
      amount,
      balanceAfter,
      description,
      referenceType,
      referenceId
    }], { session });

    return balanceAfter;
  }

  /**
   * Get current wallet balances
   */
  static async getBalances(hospitalId) {
    const hospital = await Hospital.findById(hospitalId).select('wallet');
    return hospital ? hospital.wallet : { smsCredits: 0, emailCredits: 0 };
  }

  static async sendEmailWithWallet({ hospitalId, to, subject, text, html, amount = 1, description, referenceType = 'TOKEN_ALERT', referenceId = null, session = null }) {
    const balanceAfter = await WalletService.deductWallet(
      hospitalId,
      'EMAIL',
      amount,
      description || `Email sent: ${subject}`,
      referenceType,
      referenceId,
      session
    );

    try {
      await sendEmail({ to, subject, text, html });
      return { success: true, balanceAfter };
    } catch (error) {
      logger.error(`Email send failed after wallet deduction for hospital ${hospitalId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = WalletService;
