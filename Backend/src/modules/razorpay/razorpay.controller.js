// controllers/razorpay.controller.js
const axios = require('axios');
const crypto = require('crypto');
const RazorpayAccount = require('./razorpay.model');
const Payment = require('../payment/payment.model');
const tokenService = require('../token/token.service');
const logger = require('../../config/logger');

exports.connectRazorpay = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  const baseUrl = 'https://auth.razorpay.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: process.env.RAZORPAY_CLIENT_ID,
    response_type: 'code',
    scope: 'read_write',
    state: token,
    redirect_uri: `${process.env.BASE_URL}/api/razorpay/callback`,
  });

  res.json({ url: `${baseUrl}?${params.toString()}` });
};

exports.handleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code,
      },
      {
        auth: {
          username: process.env.RAZORPAY_CLIENT_ID,
          password: process.env.RAZORPAY_CLIENT_SECRET,
        },
      }
    );

    const data = response.data;

    const webhookKey = crypto.randomBytes(12).toString('hex');
    const webhookSecret = crypto.randomBytes(16).toString('hex');

    await RazorpayAccount.findOneAndUpdate(
      { hospitalId: req.hospitalId },
      {
        merchantId: data.merchant_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        webhookKey,
        webhookSecret,
        isActive: true,
      },
      { new: true, upsert: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}/settings/payments?connected=true`);
  } catch (error) {
    logger.error('Razorpay Callback Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings/payments?error=connection_failed`);
  }
};

exports.handleWebhook = async (req, res) => {
  const { webhookKey } = req.params;

  try {
    const account = await RazorpayAccount.findOne({ webhookKey });

    if (!account) {
      return res.status(400).json({ message: 'Invalid webhook key' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const generatedSignature = crypto
      .createHmac('sha256', account.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (generatedSignature !== signature) {
      logger.warn('Invalid Razorpay Webhook Signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const razorpayPayment = payload.payment.entity;
      const razorpayOrderId = razorpayPayment.order_id;

      // 1. Find the pending payment record
      const paymentRecord = await Payment.findOne({ razorpayOrderId });

      if (paymentRecord && paymentRecord.status !== 'captured') {
        logger.info(`Processing captured payment for Order: ${razorpayOrderId}`);

        // 2. Create the Token using stored patient details
        const tokenResult = await tokenService.createToken({
          hospitalId: paymentRecord.hospitalId,
          departmentId: paymentRecord.departmentId,
          doctorId: paymentRecord.doctorId,
          patientDetails: paymentRecord.patientDetails,
          appointmentDate: new Date(),
          isEmergency: false
        });

        // 3. Update the payment record
        paymentRecord.status = 'captured';
        paymentRecord.razorpayPaymentId = razorpayPayment.id;
        paymentRecord.tokenId = tokenResult.token._id;
        await paymentRecord.save();

        logger.info(`Token created successfully for Order: ${razorpayOrderId}, Token: ${tokenResult.token.tokenNumber}`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Razorpay Webhook Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getWebhookConfig = async (req, res) => {
  try {
    const account = await RazorpayAccount.findOne({
      hospitalId: req.hospitalId,
    });

    if (!account) {
      return res.status(404).json({ message: 'Not connected' });
    }

    const webhookUrl = `${process.env.BASE_URL}/api/razorpay/webhook/${account.webhookKey}`;

    res.json({
      webhookUrl,
      webhookSecret: account.webhookSecret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};