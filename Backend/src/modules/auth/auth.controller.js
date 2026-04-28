const authService = require('./auth.service');
const logger = require('../../config/logger');
const User = require('./auth.model');

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
    const user = await authService.loginUser(email, password);

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
    const userId = req.user._id; // assuming auth middleware sets this
    console.log('Fetching user details for userId:', userId);
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'departmentId', // 🔥 this gets department inside doctor
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Refresh token is required' });
    }

    const data = await authService.refreshUserToken(refreshToken);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  refresh,
};
