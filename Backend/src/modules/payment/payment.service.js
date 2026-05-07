const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('./payment.model');
const Doctor = require('../doctor/doctor.model');
const RazorpayConfig = require('../razorpay/razorpay.model');
const { decrypt } = require('../../utils/crypto');
const logger = require('../../config/logger');

/**
 * Get Razorpay client for a specific hospital (Direct Key/Secret)
 * @param {string} hospitalId
 * @returns {Promise<Razorpay>}
 */
const getRazorpayClient = async (hospitalId) => {
  const config = await RazorpayConfig.findOne({ hospitalId });
  if (!config || !config.enabled) {
    throw new Error('Razorpay is not configured for this hospital');
  }

  const { keyId, keySecret } = config;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing for this hospital');
  }

  // Explicitly decrypt to ensure we have the plaintext secret
  const decryptedSecret = decrypt(keySecret);

  console.log("decryptedSecret", decryptedSecret);

  return new Razorpay({
    key_id: keyId,
    key_secret: decryptedSecret,
  });
};

/**
 * Create a Razorpay order and QR Code
 * @param {Object} data
 * @returns {Promise<Object>}
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

  const amount = doctor.consultationFee || 500; // Fallback fee

  // 2. Get Razorpay Client
  const razorpay = await getRazorpayClient(hospitalId);
  const config = await RazorpayConfig.findOne({ hospitalId });

  // 3. Create Razorpay Order
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    notes: {
      doctorId: doctorId.toString(),
      departmentId: departmentId.toString(),
    },
  });

  // 4. Create Payment record (pending)
  const paymentRecord = await Payment.create({
    hospitalId,
    doctorId,
    departmentId,
    amount,
    currency: 'INR',
    razorpayOrderId: order.id,
    method,
    status: 'pending',
    patientDetails,
  });

  // 5. Generate QR Code for the payment
  let qrCode = null;
  try {
    qrCode = await razorpay.qrCode.create({
      type: "upi_qr",
      name: "Hospital Token",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: Math.round(amount * 100),
      description: `Consultation with Dr. ${doctor.name}`,
      notes: {
        paymentId: paymentRecord._id.toString(),
        orderId: order.id
      }
    });
  } catch (err) {
    logger.error('Failed to generate Razorpay QR Code:', err);
  }

  return {
    orderId: order.id,
    key: config.keyId, // Return key for frontend if needed
    amount: order.amount,
    currency: order.currency,
    qrCode: qrCode ? {
      id: qrCode.id,
      imageUrl: qrCode.image_url,
      payload: qrCode.payload // UPI string
    } : null
  };
};

/**
 * Verify Razorpay payment signature
 */
const verifyPayment = async (
  hospitalId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  const config = await RazorpayConfig.findOne({ hospitalId });
  if (!config || !config.keySecret) {
    throw new Error('Razorpay configuration not found');
  }

  const secret = config.keySecret;
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', razorpayPaymentId: razorpay_payment_id }
    );
    return false;
  }

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
