const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const planController = require('./plan.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

// Public routes (no auth)
router.get('/public-plans', planController.getPlans);

// All routes below require authentication
router.use(protect);

// Admin & SuperAdmin routes
router.get('/status', authorize('ADMIN', 'SUPERADMIN'), subscriptionController.getSubscriptionStatus);
router.get('/history', authorize('ADMIN', 'SUPERADMIN'), subscriptionController.getBillingHistory);
router.post('/change-plan', authorize('ADMIN'), subscriptionController.changePlan);

// SuperAdmin Only
router.get('/plans', authorize('SUPERADMIN'), planController.getAllPlans);
router.post('/plans', authorize('SUPERADMIN'), planController.createPlan);
router.put('/plans/:id', authorize('SUPERADMIN'), planController.updatePlan);
router.delete('/plans/:id', authorize('SUPERADMIN'), planController.deletePlan);
router.post('/assign-plan/:hospitalId', authorize('SUPERADMIN'), subscriptionController.assignPlan);

module.exports = router;
