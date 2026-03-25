const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');
const {
  createDoctorValidation,
  updateDoctorValidation,
} = require('./doctor.validations');
const { validateRequest } = require('../auth/auth.validations');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor Management API
 */

/**
 * @swagger
 * /api/doctor:
 *   post:
 *     summary: Add a new doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, departmentId]
 *             properties:
 *               name:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created successfully
 */
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  createDoctorValidation,
  validateRequest,
  doctorController.createDoctor
);

/**
 * @swagger
 * /api/doctor:
 *   get:
 *     summary: Get all doctors (filter by department, availability)
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', protect, doctorController.getDoctors);

/**
 * @swagger
 * /api/doctor/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctor]
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
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
/**
 * @swagger
 * /api/doctor/upload-url:
 *   get:
 *     summary: Get a presigned URL for uploading doctor-related files
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: The URL to upload the file to
 *                 key:
 *                   type: string
 *                   description: The key (path) of the uploaded file in the storage bucket
 *       500:
 *         description: Server error
 */
router.get(
  '/upload-url',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  doctorController.getPresignedUrl
);

router.get('/:id', protect, doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctor/{id}:
 *   put:
 *     summary: Update doctor details
 *     tags: [Doctor]
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
 *               name:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  updateDoctorValidation,
  validateRequest,
  doctorController.updateDoctor
);

/**
 * @swagger
 * /api/doctor/{id}/status:
 *   patch:
 *     summary: Toggle doctor availability (online/offline)
 *     tags: [Doctor]
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
 *         description: Doctor status toggled
 */
router.patch(
  '/:id/status',
  protect,
  authorize('ADMIN', 'DOCTOR'),
  doctorController.toggleDoctorStatus
);

module.exports = router;
