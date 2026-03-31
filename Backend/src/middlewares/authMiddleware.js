const jwt = require('jsonwebtoken');
const User = require('../modules/auth/auth.model');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  } else if (req.query.state) {
    // For OAuth callbacks
    token = req.query.state;
  }

  if (token) {
    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      req.hospitalId = decoded.hospitalId;
      console.log('sdfaf', req.user);

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      logger.error(`Auth Middleware Error: ${error.message}`);
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
