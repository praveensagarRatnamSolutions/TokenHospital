const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const { protect } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Patient management and history
 */

/**
 * @swagger
 * /api/patient/search:
 *   get:
 *     summary: Search patient by phone
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient found
 */
router.get('/search', protect, patientController.searchPatient);

/**
 * @swagger
 * /api/patient/{id}/history:
 *   get:
 *     summary: Get patient medical history
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of previous visits
 */
router.get('/:id/history', protect, patientController.getPatientHistory);

module.exports = router;
