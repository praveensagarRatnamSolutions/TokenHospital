// routes/razorpay.routes.js
const router = require('express').Router();
const { protect } = require('../../middlewares/authMiddleware');
const razorpayController = require('./razorpay.controller');

router.get('/connect', protect, razorpayController.connectRazorpay);
router.get('/callback', protect, razorpayController.handleCallback);

// routes/razorpay.routes.js
router.get('/config', protect, razorpayController.getWebhookConfig);

router.post('/webhook/:webhookKey', razorpayController.handleWebhook);

module.exports = router;
