const authService = require('./auth.service');
const logger = require('../../config/logger');
const { getExpirationTimeOfTokens } = require('../../utils/jwt');

/**
 * @desc    Register user (Admin or Doctor)
 * @route   POST /api/auth/register
 * @access  Public (Should be restricted to SuperAdmin in real SaaS, but public for demo)
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.message === 'User already exists with this email') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { refreshToken, ...user } = await authService.loginUser(
      email,
      password
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: getExpirationTimeOfTokens().COOKIE_MAX_AGE,
    });

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = await authService.refreshToken(req);

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refresh,
};
