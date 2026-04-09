const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { getKioskDisplayData } = require('../modules/kiosk/kiosk.service');

function kioskNameSpace(io) {
  const nsp = io.of('/kiosk');

  nsp.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY_SECRET);

      if (decoded.role !== 'kiosk') return next(new Error('Invalid role'));
      socket.kiosk = decoded;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  nsp.on('connection', async (socket) => {
    const {
      sub: kioskId,
      hid: hospitalId,
      dids: doctorIds,
      lt: locationType,
    } = socket.kiosk ?? {};

    logger.info(`Kiosk connected: ${kioskId}`);

    socket.join(`kiosk:${kioskId}`);
    socket.join(`hospital:${hospitalId}`);

    (doctorIds ?? []).forEach((doctorId) => {
      socket.join(`doctor:${doctorId}`);
    });

    try {
      if (locationType === 'doctor_room') {
        const data = await getKioskDisplayData({ doctorIds, locationType });
        socket.emit('INITIAL_DATA', data);
      }
    } catch (error) {
      logger.error(`Initial data error: ${error}`);
    }
  });
}
module.exports = kioskNameSpace;
