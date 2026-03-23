const paymentService = require("./payment.service");
const logger = require("../../config/logger");

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { amount, metadata } = req.body;
    // Assuming hospitalId is available in req (from auth middleware)
    const hospitalId = req.hospitalId; 

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await paymentService.createOrder(hospitalId, amount, metadata);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    logger.error(`Error creating Razorpay order: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hospitalId = req.hospitalId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "All Razorpay fields are required" });
    }

    const isValid = await paymentService.verifyPayment(hospitalId, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (isValid) {
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    logger.error(`Error verifying Razorpay payment: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
