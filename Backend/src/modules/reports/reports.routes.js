const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reports & Analytics API
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get daily summary (total patients, waiting, current, completed, avg wait time)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily summary report
 */
router.get(
  '/summary',
  protect,
  authorize('ADMIN'),
  reportsController.getSummary
);

/**
 * @swagger
 * /api/reports/department:
 *   get:
 *     summary: Get department-wise token breakdown
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department report
 */
router.get(
  '/department',
  protect,
  authorize('ADMIN'),
  reportsController.getDepartmentReport
);

/**
 * @swagger
 * /api/reports/doctor:
 *   get:
 *     summary: Get doctor workload report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor workload report
 */
router.get(
  '/doctor',
  protect,
  authorize('ADMIN'),
  reportsController.getDoctorReport
);

module.exports = router;
