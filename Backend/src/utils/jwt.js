const jwt = require('jsonwebtoken');

const generateRefreshToken = (id, role, hospitalId) => {
  return jwt.sign({ id, role, hospitalId }, process.env.JWT_SECRET, {
    expiresIn: getExpirationTimeOfTokens().REFRESH_TOKEN,
  });
};

const generateAccessToken = (id, role, hospitalId) => {
  return jwt.sign({ id, role, hospitalId }, process.env.JWT_ACCESS_KEY_SECRET, {
    expiresIn: getExpirationTimeOfTokens().ACCESS_TOKEN,
  });
};

const getExpirationTimeOfTokens = () => ({
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
  generateRefreshToken,
  generateAccessToken,
  getExpirationTimeOfTokens,
};
