const express = require("express");
const paymentController = require("./payment.controller");
const { protect, authorize } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Apply protection to all payment routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment & Razorpay Integration API
 */

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in INR
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/create-order", paymentController.createOrder);

/**
 * @swagger
 * /api/payment/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 *       500:
 *         description: Server error
 */
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;
