// routes/razorpay.routes.js
const router = require('express').Router();
const { protect } = require('../../middlewares/authMiddleware');
const razorpayController = require('./razorpay.controller');

// Public: Check if active
router.get('/status', razorpayController.getStatus);

// Admin only: Get and update webhook config
router.get('/config', protect, razorpayController.getWebhookConfig);
router.put('/config', protect, razorpayController.updateConfig);

// Public: Webhook endpoint from Razorpay
router.post('/webhook/:webhookKey', razorpayController.handleWebhook);

module.exports = router;
