const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const planController = require('./plan.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { validateRequest } = require('../auth/auth.validations');
const {
  planCreationValidation,
  checkoutValidation,
  verifyCheckoutValidation,
} = require('./subscription.validations');

// Public routes (no auth)
router.get('/public-plans', planController.getPlans);
router.post('/webhook', subscriptionController.handleSubscriptionWebhook);

// All routes below require authentication
router.use(protect);

// Admin & SuperAdmin routes
router.get('/status', authorize('ADMIN', 'SUPERADMIN'), subscriptionController.getSubscriptionStatus);
router.get('/history', authorize('ADMIN', 'SUPERADMIN'), subscriptionController.getBillingHistory);
router.get('/history/export', authorize('ADMIN', 'SUPERADMIN'), subscriptionController.exportBillingHistory);
router.post('/change-plan', authorize('ADMIN'), subscriptionController.changePlan);
router.post('/cancel-renewal', authorize('ADMIN'), subscriptionController.cancelRenewal);
router.post('/resume-renewal', authorize('ADMIN'), subscriptionController.resumeRenewal);

// Checkout & Trial Endpoints
router.post('/start-trial', authorize('ADMIN'), subscriptionController.startTrial);
router.post('/create-checkout', authorize('ADMIN'), checkoutValidation, validateRequest, subscriptionController.createCheckout);
router.post('/verify-checkout', authorize('ADMIN'), verifyCheckoutValidation, validateRequest, subscriptionController.verifyCheckout);

// SuperAdmin Only
router.get('/plans', authorize('SUPERADMIN'), planController.getAllPlans);
router.post('/plans', authorize('SUPERADMIN'), planCreationValidation, validateRequest, planController.createPlan);
router.get('/plans/:id', authorize('SUPERADMIN'), planController.getPlanById);
router.put('/plans/:id', authorize('SUPERADMIN'), planCreationValidation, validateRequest, planController.updatePlan);
router.delete('/plans/:id', authorize('SUPERADMIN'), planController.deletePlan);
router.post('/assign-plan/:hospitalId', authorize('SUPERADMIN'), subscriptionController.assignPlan);
router.post('/price-migrations', authorize('SUPERADMIN'), subscriptionController.schedulePriceMigration);

module.exports = router;
