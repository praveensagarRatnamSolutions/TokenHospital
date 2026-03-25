const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('./payment.model');
const Doctor = require('../doctor/doctor.model');
const Settings = require('../settings/settings.model');
const logger = require('../../config/logger');

/**
 * Get Razorpay client for a specific hospital
 * @param {string} hospitalId
 * @returns {Promise<Razorpay>}
 */
const getRazorpayClient = async (hospitalId) => {
  const settings = await Settings.findOne({ hospitalId });
  if (!settings || !settings.paymentConfig?.razorpay?.enabled) {
    throw new Error('Razorpay is not configured for this hospital');
  }

  const { keyId, keySecret } = settings.paymentConfig.razorpay;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing for this hospital');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * Create a Razorpay order
 * @param {string} hospitalId
 * @param {number} amount - Amount in INR
 * @param {Object} metadata - Optional metadata
 * @param {string} tokenId
 * @param {string} patientId
 * @param {string} method
 * @returns {Promise<Object>} - Razorpay order object
 */
const createOrder = async ({
  hospitalId,
  doctorId,
  departmentId,
  patientDetails,
  method,
}) => {
  // 1. Get doctor (source of truth for fee)
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) throw new Error('Doctor not found');

  const amount = doctor.consultationFee;

  // 2. Get hospital Razorpay config
  const hospital = await Hospital.findById(hospitalId);

  if (!hospital?.razorpay?.keyId) {
    throw new Error('Hospital payment not configured');
  }

  const razorpay = await getRazorpayClient(hospitalId);

  // 3. Create order
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    notes: {
      doctorId,
      departmentId,
    },
  });

  // 4. Save ONLY payment (no token yet)
  await Payment.create({
    hospitalId,
    doctorId,
    departmentId,
    amount,
    currency: 'INR',

    razorpayOrderId: order.id,

    method,
    status: 'pending',

    patientDetails, // store temporarily
  });

  return {
    orderId: order.id,
    key: hospital.razorpay.keyId,
    amount: order.amount,
    currency: order.currency,
  };
};

/**
 * Verify Razorpay payment signature
 * @param {string} hospitalId
 * @param {Object} response - Razorpay payment response
 * @returns {Promise<boolean>}
 */
const verifyPayment = async (
  hospitalId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  const settings = await Settings.findOne({ hospitalId });
  if (!settings || !settings.paymentConfig?.razorpay?.keySecret) {
    throw new Error('Razorpay configuration not found');
  }

  const secret = settings.paymentConfig.razorpay.keySecret;
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    // Mark payment as failed if we find a record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', razorpayPaymentId: razorpay_payment_id }
    );
    return false;
  }

  // Update payment status to captured
  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: 'captured',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    }
  );

  return true;
};

module.exports = {
  createOrder,
  verifyPayment,
};
