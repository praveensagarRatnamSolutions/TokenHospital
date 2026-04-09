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

const generateAccessTokenForKiosk = (kiosk) => {
  const accessTokenPayload = {
    sub: kiosk._id.toString(),
    hid: kiosk.hospitalId.toString(),
    dids: kiosk.doctorIds.map((id) => id.toString()),
    lt: kiosk.locationType,
    role: 'kiosk',
  };

  const { ACCESS_TOKEN: accessTokenTime } = getExpirationTimeOfTokens();

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_ACCESS_KEY_SECRET,
    { expiresIn: accessTokenTime }
  );

  return accessToken;
};

const generateTokensForKiosk = (kiosk) => {
  const refreshTokenPayload = {
    sub: kiosk._id.toString(),
    role: 'kiosk',
  };

  const { REFRESH_TOKEN: refreshTokenTime } = getExpirationTimeOfTokens();

  const accessToken = generateAccessTokenForKiosk(kiosk);

  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
    expiresIn: refreshTokenTime,
  });

  return { accessToken, refreshToken };
};

const getExpirationTimeOfTokens = () => ({
  ACCESS_TOKEN: '1d',
  REFRESH_TOKEN: '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
  generateRefreshToken,
  generateAccessToken,
  getExpirationTimeOfTokens,
  generateTokensForKiosk,
  generateAccessTokenForKiosk,
};
