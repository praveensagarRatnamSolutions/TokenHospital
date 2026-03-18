const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: SaaS Configuration API
 */

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
router.get('/', protect, settingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update hospital configuration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalType:
 *                 type: string
 *               features:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put('/', protect, authorize('admin'), settingsController.updateSettings);

module.exports = router;
