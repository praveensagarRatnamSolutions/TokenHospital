const express = require('express');
const router = express.Router();
const tokenController = require('./token.controller');
const { createTokenValidation } = require('./token.validations');
const { validateRequest } = require('../auth/auth.validations');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Token Management API (Core)
 */

/**
 * @swagger
 * /api/token:
 *   post:
 *     summary: Create a new token
 *     tags: [Token]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId, patientDetails]
 *             properties:
 *               departmentId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *                 description: Optional - auto-assigned if not provided
 *               appointmentDate:
 *                 type: string
 *                 description: Optional - defaults to today (YYYY-MM-DD)
 *               patientDetails:
 *                 type: object
 *                 required: [name, phone]
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   age:
 *                     type: number
 *                   gender:
 *                     type: string
 *                     enum: [Male, Female, Other]
 *                   problem:
 *                     type: string

 *     responses:
 *       201:
 *         description: Token created
 */
router.post('/', protect, createTokenValidation, validateRequest, tokenController.createToken);

/**
 * @swagger
 * /api/token:
 *   get:
 *     summary: Get all tokens with filters
 *     tags: [Token]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, current, completed]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
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
 *         description: List of tokens
 */
router.get('/', protect, tokenController.getTokens);
router.get('/doctor', protect, tokenController.getDoctorQueue);

/**
 * @swagger
 * /api/token/current:
 *   get:
 *     summary: Get current token for a doctor
 *     tags: [Token]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current token or null
 */
router.get('/current', protect, tokenController.getCurrentToken);

/**
 * @swagger
 * /api/token/{id}/complete:
 *   patch:
 *     summary: Complete a token
 *     tags: [Token]
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
 *         description: Token completed
 *       404:
 *         description: Token not found or not active
 */
router.patch('/:id/complete', protect, authorize('ADMIN', 'DOCTOR'), tokenController.completeToken);

/**
 * @swagger
 * /api/token/next:
 *   post:
 *     summary: Call next token for a doctor
 *     tags: [Token]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Next token called or no tokens in queue
 */
router.post('/next', protect, authorize('ADMIN', 'DOCTOR'), tokenController.callNextToken);
router.post('/:id/call', protect, authorize('ADMIN', 'DOCTOR'), tokenController.callTokenById);

/**
 * @swagger
 * /api/token/{id}/cancel:
 *   patch:
 *     summary: Cancel a token
 *     tags: [Token]
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
 *         description: Token canceled
 *       404:
 *         description: Token not found or already completed
 */
router.patch('/:id/cancel', protect, authorize('ADMIN', 'DOCTOR'), tokenController.cancelToken);

/**
 * @swagger
 * /api/token/{id}/verify-cash:
 *   patch:
 *     summary: Verify cash payment for a provisional token
 *     tags: [Token]
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
 *         description: Cash payment verified
 *       404:
 *         description: Token not found or not in PROVISIONAL status
 */
router.patch('/:id/verify-cash', protect, authorize('ADMIN'), tokenController.verifyCashPayment);

/**
 * @swagger
 * /api/token/{id}/skip:
 *   patch:
 *     summary: Skip a token (postpone it)
 *     tags: [Token]
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
 *         description: Token skipped and set back to WAITING
 *       404:
 *         description: Token not found or not currently active
 */
router.patch('/:id/skip', protect, authorize('ADMIN', 'DOCTOR'), tokenController.skipToken);

module.exports = router;

