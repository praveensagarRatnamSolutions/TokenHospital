const express = require("express");
const router = express.Router();
const settingsController = require("./settings.controller");
const { protect, authorize } = require("../../middlewares/authMiddleware");
const {
  validateCreateSettings,
  validateUpdateSettings,
} = require("./settings.validations");

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: SaaS Configuration API
 */

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create hospital configuration/settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalId
 *               - hospitalName
 *             properties:
 *               hospitalId:
 *                 type: string
 *               hospitalName:
 *                 type: string
 *               hospitalType:
 *                 type: string
 *               features:
 *                 type: object
 *               tokenResetTime:
 *                 type: string
 *               paymentConfig:
 *                 type: object
 *                 properties:
 *                   razorpay:
 *                     type: object
 *                     properties:
 *                       keyId:
 *                         type: string
 *                       keySecret:
 *                         type: string
 *                       webhookSecret:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *     responses:
 *       201:
 *         description: Settings created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  validateCreateSettings,
  settingsController.createSettings,
);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get hospital configuration/settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospital settings
 */
router.get("/", protect, settingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update hospital configuration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalType:
 *                 type: string
 *               hospitalName:
 *                 type: string
 *               features:
 *                 type: object
 *               tokenResetTime:
 *                 type: string
 *               paymentConfig:
 *                 type: object
 *                 properties:
 *                   razorpay:
 *                     type: object
 *                     properties:
 *                       keyId:
 *                         type: string
 *                       keySecret:
 *                         type: string
 *                       webhookSecret:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Settings updated
 *       400:
 *         description: Validation error
 */
router.put(
  "/",
  protect,
  authorize("admin"),
  validateUpdateSettings,
  settingsController.updateSettings,
);

module.exports = router;
