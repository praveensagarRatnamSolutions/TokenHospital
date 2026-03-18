const express = require('express');
const router = express.Router();
const departmentController = require('./department.controller');
const { createDepartmentValidation, updateDepartmentValidation } = require('./department.validations');
const { validateRequest } = require('../auth/auth.validations');
const { protect, authorize } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Department Management API
 */

/**
 * @swagger
 * /api/department:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, prefix]
 *             properties:
 *               name:
 *                 type: string
 *               prefix:
 *                 type: string
 *                 maxLength: 3
 *     responses:
 *       201:
 *         description: Department created
 *       400:
 *         description: Duplicate prefix
 */
router.post('/', protect, authorize('admin'), createDepartmentValidation, validateRequest, departmentController.createDepartment);

/**
 * @swagger
 * /api/department:
 *   get:
 *     summary: Get all departments
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', protect, departmentController.getDepartments);

/**
 * @swagger
 * /api/department/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Department]
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
 *               prefix:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated
 *       404:
 *         description: Department not found
 */
router.put('/:id', protect, authorize('admin'), updateDepartmentValidation, validateRequest, departmentController.updateDepartment);

module.exports = router;
