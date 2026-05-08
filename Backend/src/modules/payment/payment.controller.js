const paymentService = require("./payment.service");
const logger = require("../../config/logger");

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      doctorId,
      departmentId,
      patientDetails,
      method,
      metadata
    } = req.body;

    const hospitalId = req.hospitalId;

    // 1. Validations
    if (!doctorId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "doctorId and departmentId are required"
      });
    }

    if (!patientDetails) {
      return res.status(400).json({
        success: false,
        message: "Patient details are required"
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // 2. Call service (amount comes from Doctor model internally)
    const order = await paymentService.createOrder({
      hospitalId,
      doctorId,
      departmentId,
      patientDetails,
      method,
      metadata
    });

    return res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.log("error", error);

    logger.error(`Error creating Razorpay order: ${error}`);

    return res.status(500).json({
      success: false,
      message: error.message
    });
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

const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ razorpayOrderId: orderId })
      .populate({
        path: 'tokenId',
        populate: [
          { path: 'departmentId', select: 'name prefix' },
          { path: 'doctorId', select: 'name roomNumber education' },
          { path: 'patientId', select: 'name phone age gender' },
          { path: 'hospitalId', select: 'name logo' }
        ]
      })
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    let waitingCount = 0;
    if (payment.tokenId) {
        waitingCount = await Token.countDocuments({
            hospitalId: payment.hospitalId,
            doctorId: payment.doctorId,
            appointmentDate: payment.tokenId.appointmentDate,
            status: 'WAITING',
            createdAt: { $lt: payment.tokenId.createdAt }
        });
    }

    res.status(200).json({
      success: true,
      status: payment.status,
      token: payment.tokenId, 
      waitingCount,
    });
  } catch (error) {
    logger.error(`Error getting payment status: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentStatus,
};
