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

/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     summary: Get financial summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Financial summary report
 */
router.get(
  '/financial',
  protect,
  authorize('ADMIN'),
  reportsController.getFinancialSummary
);

/**
 * @swagger
 * /api/reports/transactions:
 *   get:
 *     summary: Get detailed transaction report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detailed transaction report
 */
router.get(
  '/transactions',
  protect,
  authorize('ADMIN'),
  reportsController.getDetailedFinancialReport
);

/**
 * @swagger
 * /api/reports/export-transactions:
 *   get:
 *     summary: Export detailed transaction report to Excel/CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/export-transactions',
  protect,
  authorize('ADMIN'),
  reportsController.exportTransactions
);

module.exports = router;
