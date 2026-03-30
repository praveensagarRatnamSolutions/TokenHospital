const express = require('express');
const router = express.Router();
const adsController = require('./ads.controller');

const {
  createAdValidation,
  updateAdValidation,
  getActiveValidation,
} = require('./ads.validations');

const { validateRequest } = require('../auth/auth.validations');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Ads Management API (Hospital Kiosk System)
 */

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Create a new ad record and get S3 upload URL
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, fileName, duration, hospitalId]
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *               fileName:
 *                 type: string
 *                 description: Original file name (e.g., ad_video.mp4)
 *               duration:
 *                 type: number
 *                 description: Display time in seconds
 *               hospitalId:
 *                 type: string
 *               displayArea:
 *                 type: string
 *                 enum: [carousel, fullscreen]
 *               departmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ad created. Returns DB object + uploadUrl
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  createAdValidation,
  validateRequest,
  adsController.createAd
);

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Fetch ads (Dashboard or Kiosk mode)
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         schema:
 *           type: string
 *       - in: query
 *         name: kiosk
 *         schema:
 *           type: boolean
 *         description: If true, generates presigned download URLs for active ads
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ads
 */
router.get(
  '/',
  protect,
  getActiveValidation,
  validateRequest,
  adsController.getAds
);

/**
 * @swagger
 * /api/ads/{id}:
 *   put:
 *     summary: Update an existing ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               displayArea:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ad updated
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  updateAdValidation,
  validateRequest,
  adsController.updateAd
);

/**
 * @swagger
 * /api/ads/{id}:
 *   delete:
 *     summary: Remove ad and S3 file
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad deleted
 */
router.delete('/:id', protect, authorize('ADMIN', 'DOCTOR'), adsController.deleteAd);

module.exports = router;
