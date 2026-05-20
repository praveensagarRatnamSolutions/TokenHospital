const crypto = require('crypto');
const Razorpay = require('razorpay');
const TopupPackage = require('./topupPackage.model');
const Hospital = require('../hospital/hospital.model');
const WalletLedger = require('./walletLedger.model');
const WalletService = require('./wallet.service');
const SubscriptionTransaction = require('../subscription/subscription.model');

/**
 * @desc    Create a new topup package
 * @route   POST /api/wallet/packages
 * @access  Private/SuperAdmin
 */
exports.createTopupPackage = async (req, res, next) => {
  try {
    const newPackage = await TopupPackage.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Top-up package created successfully',
      data: newPackage
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all topup packages
 * @route   GET /api/wallet/packages
 * @access  Private
 */
exports.getTopupPackages = async (req, res, next) => {
  try {
    // If not superadmin, only show active packages
    const filter = req.user && req.user.role === 'SUPERADMIN' ? {} : { isActive: true };
    
    const packages = await TopupPackage.find(filter).sort({ price: 1 });

    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get topup package by ID
 * @route   GET /api/wallet/packages/:id
 * @access  Private/SuperAdmin
 */
exports.getTopupPackageById = async (req, res, next) => {
  try {
    const pkg = await TopupPackage.findById(req.params.id);
    
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a topup package
 * @route   PUT /api/wallet/packages/:id
 * @access  Private/SuperAdmin
 */
exports.updateTopupPackage = async (req, res, next) => {
  try {
    const updatedPackage = await TopupPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Top-up package updated successfully',
      data: updatedPackage
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a topup package
 * @route   DELETE /api/wallet/packages/:id
 * @access  Private/SuperAdmin
 */
exports.deleteTopupPackage = async (req, res, next) => {
  try {
    const pkg = await TopupPackage.findByIdAndDelete(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Top-up package deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Retrieve the global Platform Razorpay client instance
const getGlobalRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_CLIENT_ID;
  const keySecret = process.env.RAZORPAY_CLIENT_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Global Platform Razorpay credentials are not configured in .env');
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * @desc    Get active wallet balances
 * @route   GET /api/wallet/balances
 * @access  Private (ADMIN)
 */
exports.getBalances = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.hospitalId).select('wallet');
    res.status(200).json({
      success: true,
      data: hospital?.wallet || { smsCredits: 0, emailCredits: 0 }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get active messaging wallet ledger logs statement
 * @route   GET /api/wallet/ledger
 * @access  Private (ADMIN)
 */
exports.getLedger = async (req, res, next) => {
  try {
    const ledger = await WalletLedger.find({ hospitalId: req.hospitalId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Razorpay Order for credits package top-up purchase
 * @route   POST /api/wallet/buy-package/:id
 * @access  Private (ADMIN)
 */
exports.buyPackage = async (req, res, next) => {
  try {
    const pkg = await TopupPackage.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const rzp = getGlobalRazorpayClient();

    // Generate standard Razorpay checkout Order
    const order = await rzp.orders.create({
      amount: Math.round(pkg.price * 100), // paise
      currency: 'INR',
      receipt: `topup_receipt_${Date.now()}`,
      notes: {
        hospitalId: req.hospitalId.toString(),
        packageId: pkg._id.toString(),
        credits: pkg.credits.toString(),
        service: pkg.service
      }
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        keyId: process.env.RAZORPAY_CLIENT_ID,
        amount: pkg.price,
        packageId: pkg._id,
        service: pkg.service,
        name: pkg.name
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Razorpay checkout payment signature and atomically credit wallet
 * @route   POST /api/wallet/verify-payment
 * @access  Private (ADMIN)
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = req.body;

    const pkg = await TopupPackage.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Perform HMAC SHA256 signature verification
    const secret = process.env.RAZORPAY_CLIENT_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Cryptographic signature verification failed.' });
    }

    // Atomically credit clinic wallet balances
    await WalletService.creditWallet(
      req.hospitalId,
      pkg.service, // 'SMS' or 'EMAIL'
      pkg.credits,
      `Purchased credit bundle: ${pkg.name}`,
      'MANUAL_TOPUP',
      razorpay_payment_id
    );

    // Write payment transaction to SubscriptionTransaction collection for payment history
    await SubscriptionTransaction.create({
      hospitalId: req.hospitalId,
      type: 'WALLET_TOPUP',
      amount: pkg.price,
      currency: 'INR',
      status: 'COMPLETED',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      description: `Bought messaging bundle: ${pkg.name} (${pkg.credits.toLocaleString()} ${pkg.service} Credits)`,
      metadata: {
        packageId,
        service: pkg.service,
        credits: pkg.credits
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and credits added successfully'
    });
  } catch (err) {
    next(err);
  }
};
