const express = require('express');
const router = express.Router();
const kioskController = require('./kiosk.controller');
const {
  createKioskValidation,
  updateKioskValidation,
  kioskLoginValidation,
} = require('./kiosk.validations');
const { validateRequest } = require('../auth/auth.validations');
const {
  protect,
  authorize,
  protectKiosk,
} = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Kiosks
 *   description: Kiosk Management API
 */

/**
 * @swagger
 * /api/kiosk:
 *   post:
 *     summary: Create a new kiosk
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Kiosk'
 *     responses:
 *       201:
 *         description: Kiosk created
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  createKioskValidation,
  validateRequest,
  kioskController.createKiosk
);

router.get('/ads', protectKiosk, kioskController.getKioskAds);

router.get('/tokens', protectKiosk, kioskController.getKioskTokens);

router.get('/department', protectKiosk, kioskController.getDepartments);

router.get('/doctor', protectKiosk, kioskController.getDoctors);

router.post('/token', protectKiosk, kioskController.createToken);

/**
 * @swagger
 * /api/kiosk:
 *   get:
 *     summary: Get all kiosks for hospital
 *     tags: [Kiosks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of kiosks
 */
router.get(
  '/',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  kioskController.getKiosks
);

/**
 * @swagger
 * /api/kiosk/code/{code}:
 *   get:
 *     summary: Get kiosk details by unique code (Public)
 *     tags: [Kiosks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kiosk details
 */
router.get('/code/:code', kioskController.getKioskByCode);

/**
 * @swagger
 * /api/kiosk/token:
 *   get:
 *     summary: Get live department-grouped token queue for a hospital (Public - used by kiosks)
 *     tags: [Kiosks]
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grouped token queue by department and doctor
 */
router.get(
  '/token',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  kioskController.getKioskTokensByHospital
);

/**
 * @swagger
 * /api/kiosk/{id}:
 *   get:
 *     summary: Get kiosk by ID
 *     tags: [Kiosks]
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
 *         description: Kiosk details
 */
router.get(
  '/:id',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  kioskController.getKioskById
);

/**
 * @swagger
 * /api/kiosk/{id}:
 *   put:
 *     summary: Update a kiosk
 *     tags: [Kiosks]
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
 *         description: Kiosk updated
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  updateKioskValidation,
  validateRequest,
  kioskController.updateKiosk
);

/**
 * @swagger
 * /api/kiosk/{id}:
 *   delete:
 *     summary: Delete a kiosk
 *     tags: [Kiosks]
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
 *         description: Kiosk deleted
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  kioskController.deleteKiosk
);

router.post(
  '/login',
  kioskLoginValidation,
  validateRequest,
  kioskController.loginIntoKiosk
);

router.post('/refresh', kioskController.refreshToken);

module.exports = router;
