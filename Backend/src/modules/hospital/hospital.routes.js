const express = require("express");
const router = express.Router();
const hospitalController = require("./hospital.controller");
const {
  createHospitalValidation,
  updateHospitalValidation,
  validateRequest,
} = require("./hospital.validations");
const { protect, authorize } = require("../../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Hospital
 *   description: Hospital Management API (SuperAdmin only)
 */

/**
 * @swagger
 * /api/hospital:
 *   post:
 *     summary: Create a new hospital (SuperAdmin only)
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               registrationNumber:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  protect,
  authorize("superadmin"),
  createHospitalValidation,
  validateRequest,
  hospitalController.createHospital,
);

/**
 * @swagger
 * /api/hospital:
 *   get:
 *     summary: Get all hospitals (SuperAdmin only)
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  protect,
  authorize("superadmin"),
  hospitalController.getAllHospitals,
);

/**
 * @swagger
 * /api/hospital/{id}:
 *   get:
 *     summary: Get hospital by ID (SuperAdmin only)
 *     tags: [Hospital]
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
 *         description: Hospital retrieved successfully
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  protect,
  authorize("superadmin"),
  hospitalController.getHospitalById,
);

/**
 * @swagger
 * /api/hospital/{id}:
 *   patch:
 *     summary: Update hospital (SuperAdmin only)
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  protect,
  authorize("superadmin"),
  updateHospitalValidation,
  validateRequest,
  hospitalController.updateHospital,
);

/**
 * @swagger
 * /api/hospital/{id}:
 *   delete:
 *     summary: Delete hospital (SuperAdmin only)
 *     tags: [Hospital]
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
 *         description: Hospital deleted successfully
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  protect,
  authorize("superadmin"),
  hospitalController.deleteHospital,
);

/**
 * @swagger
 * /api/hospital/{id}/deactivate:
 *   patch:
 *     summary: Deactivate hospital (SuperAdmin only)
 *     tags: [Hospital]
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
 *         description: Hospital deactivated successfully
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/deactivate",
  protect,
  authorize("superadmin"),
  hospitalController.deactivateHospital,
);

/**
 * @swagger
 * /api/hospital/{id}/activate:
 *   patch:
 *     summary: Activate hospital (SuperAdmin only)
 *     tags: [Hospital]
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
 *         description: Hospital activated successfully
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/activate",
  protect,
  authorize("superadmin"),
  hospitalController.activateHospital,
);

module.exports = router;
