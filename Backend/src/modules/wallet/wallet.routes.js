const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
  createTopupPackageValidation,
  updateTopupPackageValidation,
  validateRequest,
} = require('./wallet.validations');

// Any authenticated user can view active packages
router.get('/packages', protect, walletController.getTopupPackages);
router.get('/packages/:id', protect, walletController.getTopupPackageById);

// Public Webhook from Razorpay
router.post('/webhook', walletController.handleWalletWebhook);

// Private hospital admin wallet & checkout routes
router.get('/balances', protect, walletController.getBalances);
router.get('/ledger', protect, walletController.getLedger);
router.post('/buy-package/:id', protect, walletController.buyPackage);
router.post('/verify-payment', protect, walletController.verifyPayment);

// SuperAdmin only — create / update / delete
router.use(protect, authorize('SUPERADMIN'));

router.post(
  '/packages',
  createTopupPackageValidation,
  validateRequest,
  walletController.createTopupPackage
);

router.put(
  '/packages/:id',
  updateTopupPackageValidation,
  validateRequest,
  walletController.updateTopupPackage
);

router.delete('/packages/:id', walletController.deleteTopupPackage);

module.exports = router;
