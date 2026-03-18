const express = require('express');
const router = express.Router();
const adsController = require('./ads.controller');
const { createAdValidation, updateAdValidation } = require('./ads.validations');
const { validateRequest } = require('../auth/auth.validations');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Ads Management API
 */

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Create a new ad (returns S3 presigned upload URL)
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, fileName, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *               fileName:
 *                 type: string
 *                 description: Original file name for S3 key generation
 *               displayArea:
 *                 type: string
 *                 enum: [carousel, fullscreen]
 *               departmentId:
 *                 type: string
 *                 description: Optional - null means global ad
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ad created with presigned upload URL
 */
router.post('/', protect, authorize('admin'), createAdValidation, validateRequest, adsController.createAd);

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get ads (use ?kiosk=true for active ads only)
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kiosk
 *         schema:
 *           type: boolean
 *         description: Set to true to get only active, scheduled ads with presigned download URLs
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department (also includes global ads)
 *     responses:
 *       200:
 *         description: List of ads
 */
router.get('/', protect, adsController.getAds);

/**
 * @swagger
 * /api/ads/{id}:
 *   put:
 *     summary: Update an ad
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
 *               displayArea:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               priority:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ad updated
 *       404:
 *         description: Ad not found
 */
router.put('/:id', protect, authorize('admin'), updateAdValidation, validateRequest, adsController.updateAd);

/**
 * @swagger
 * /api/ads/{id}:
 *   delete:
 *     summary: Delete an ad (also removes from S3)
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
 *       404:
 *         description: Ad not found
 */
router.delete('/:id', protect, authorize('admin'), adsController.deleteAd);

module.exports = router;
