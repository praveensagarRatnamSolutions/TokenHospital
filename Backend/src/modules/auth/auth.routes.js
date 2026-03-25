const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("./auth.validations");
const { protect, authorize } = require("../../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (SuperAdmin/Admin/Doctor)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: ["ADMIN", "DOCTOR", "SUPERADMIN"]
 *               hospitalId:
 *                 type: string
 *                 description: Required for admin and doctor roles, not required for superadmin
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation errors or User already exists
 */
router.post(
  "/register",
  registerValidation,
  validateRequest,
  authController.register,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user & get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", loginValidation, validateRequest, authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current blocked in user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user data
 *       401:
 *         description: Not authorized
 */
router.get("/me", protect, authController.getMe);

module.exports = router;
