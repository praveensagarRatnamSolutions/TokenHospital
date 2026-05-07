// controllers/razorpay.controller.js
const crypto = require('crypto');
const RazorpayConfig = require('./razorpay.model');
const Settings = require('../settings/settings.model');
const Payment = require('../payment/payment.model');
const tokenService = require('../token/token.service');
const { decrypt } = require('../../utils/crypto');
const logger = require('../../config/logger');

/**
 * Handle incoming Razorpay Webhooks (Direct Integration)
 */
exports.handleWebhook = async (req, res) => {
  const { webhookKey } = req.params;

  try {
    const config = await RazorpayConfig.findOne({ webhookKey });

    if (!config || !config.webhookSecret) {
      logger.error(`Webhook received for invalid key: ${webhookKey}`);
      return res.status(400).json({ message: 'Invalid webhook' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody
      ? req.rawBody.toString()
      : JSON.stringify(req.body);

    const webhookSecret = decrypt(config.webhookSecret);
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (generatedSignature !== signature) {
      logger.warn(`Invalid Razorpay Webhook Signature for key: ${webhookKey}`);
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { event, payload } = req.body;
    const hospitalId = config.hospitalId;

    if (event === 'payment.captured') {
      const razorpayPayment = payload.payment.entity;
      const razorpayOrderId = razorpayPayment.order_id;

      // 1. Find the pending payment record
      const paymentRecord = await Payment.findOne({ razorpayOrderId });

      if (paymentRecord && paymentRecord.status !== 'captured') {
        logger.info(
          `Processing captured payment for Order: ${razorpayOrderId}`
        );

        console.log('Payment Record Found:', paymentRecord);
        // 2. Create the Token using stored patient details
        const tokenResult = await tokenService.createToken({
          hospitalId: paymentRecord.hospitalId,
          departmentId: paymentRecord.departmentId,
          doctorId: paymentRecord.doctorId,
          patientDetails: paymentRecord.patientDetails,
          appointmentDate:
            paymentRecord.patientDetails?.appointmentDate || new Date(),
          isEmergency: paymentRecord.patientDetails?.isEmergency || false,
          status: 'WAITING', // 👈 Activate immediately for UPI
          existingPaymentId: paymentRecord._id, // 👈 Link to this payment record
        });

        // 3. Update the payment record status (token linking is now handled in createToken)
        paymentRecord.status = 'captured';
        paymentRecord.razorpayPaymentId = razorpayPayment.id;
        await paymentRecord.save();

        logger.info(
          `Token created successfully for Order: ${razorpayOrderId}, Token: ${tokenResult.token.tokenNumber}`
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.log('Error processing Razorpay webhook:', error);
    logger.error('Razorpay Webhook Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Get the Webhook configuration for a hospital to display in Admin dashboard
 */
exports.getWebhookConfig = async (req, res) => {
  try {
    let config = await RazorpayConfig.findOne({
      hospitalId: req.hospitalId,
    });

    if (!config) {
      // Don't generate anything yet, just return empty config
      return res.json({
        webhookUrl: null,
        webhookSecret: null,
        config: null,
      });
    }

    // Only generate webhook info if keys are present
    let modified = false;
    if (config.keyId && config.keySecret) {
      if (!config.webhookKey) {
        config.webhookKey = crypto.randomBytes(12).toString('hex');
        modified = true;
      }
      if (!config.webhookSecret) {
        config.webhookSecret = crypto.randomBytes(16).toString('hex');
        modified = true;
      }
      if (modified) {
        await config.save();
      }
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const webhookUrl = config.webhookKey
      ? `${protocol}://${host}/api/razorpay/webhook/${config.webhookKey}`
      : null;

    res.json({
      webhookUrl,
      webhookSecret: config.webhookSecret || null,
      config: {
        keyId: config.keyId,
        keySecret: config.keySecret,
        enabled: config.enabled,
      },
    });
  } catch (error) {
    logger.error('Error in getWebhookConfig:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

/**
 * Update Razorpay configuration
 */
exports.updateConfig = async (req, res) => {
  try {
    const { keyId, keySecret, enabled } = req.body;

    // Find or create config
    let config = await RazorpayConfig.findOne({ hospitalId: req.hospitalId });

    if (!config) {
      config = new RazorpayConfig({ hospitalId: req.hospitalId });
    }

    config.keyId = keyId;
    config.keySecret = keySecret;
    config.enabled = enabled;

    // Generate webhook keys only if keys are present and webhook keys are missing
    if (keyId && keySecret) {
      if (!config.webhookKey) {
        config.webhookKey = crypto.randomBytes(12).toString('hex');
      }
      if (!config.webhookSecret) {
        config.webhookSecret = crypto.randomBytes(16).toString('hex');
      }
    }

    await config.save();

    res.json({
      success: true,
      message: 'Razorpay configuration updated',
      data: config,
    });
  } catch (error) {
    logger.error('Error updating razorpay config:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get public status (enabled or not)
 * @route   GET /api/razorpay/status
 * @access  Public
 */
exports.getStatus = async (req, res) => {
  try {
    const hospitalId = req.hospitalId || req.query.hospitalId;
    if (!hospitalId) {
      return res
        .status(400)
        .json({ success: false, message: 'hospitalId is required' });
    }

    const config = await RazorpayConfig.findOne({ hospitalId });
    res.json({
      success: true,
      enabled: config ? config.enabled : false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
