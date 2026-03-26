// controllers/razorpay.controller.js
const axios = require('axios');
const crypto = require('crypto');
const RazorpayAccount = require('./razorpay.model');

exports.connectRazorpay = (req, res) => {
  // Token will be extracted by protect middleware and available in req
  const token = req.headers.authorization?.split(' ')[1];
  
  // Use /oauth/authorize for GET request to start OAuth flow
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

  // ✅ Generate secure values
  const webhookKey = crypto.randomBytes(12).toString('hex');
  const webhookSecret = crypto.randomBytes(16).toString('hex');

  // Optional: upsert (avoid duplicates)
  const account = await RazorpayAccount.findOneAndUpdate(
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

  // 🔁 Redirect to frontend
  res.redirect(`${process.env.FRONTEND_URL}/settings/payments?connected=true`);
};



exports.handleWebhook = async (req, res) => {
  const { webhookKey } = req.params;

  const account = await RazorpayAccount.findOne({ webhookKey });

  if (!account) {
    return res.status(400).json({ message: 'Invalid webhook' });
  }

  const signature = req.headers['x-razorpay-signature'];

  const generatedSignature = crypto
    .createHmac('sha256', account.webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (generatedSignature !== signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body.event;

  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;

    // 👉 Update token using payment.notes.tokenId
    console.log('Payment success:', payment);
  }

  res.status(200).json({ status: 'ok' });
};


// controllers/razorpay.controller.js

exports.getWebhookConfig = async (req, res) => {
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
};