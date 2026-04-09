const { Server } = require('socket.io');
const logger = require('../config/logger');
const kioskNamespace = require('./kiosk.namespace');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a specific hospital room
    socket.on('join-hospital', (hospitalId) => {
      socket.join(hospitalId);
      logger.info(`Socket ${socket.id} joined hospital room: ${hospitalId}`);
    });

    // Kiosk devices join hospital room via query param on connect
    const hospitalId = socket.handshake.query?.hospitalId;
    if (hospitalId) {
      socket.join(hospitalId);
      logger.info(
        `Kiosk socket ${socket.id} auto-joined hospital room: ${hospitalId}`
      );
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  kioskNamespace(io);

  return io;
};

/**
 * Broadcast an event to a specific hospital room
 */
const broadcastToHospital = (hospitalId, eventName, data) => {
  if (!io) return;
  io.to(hospitalId).emit(eventName, data);
};

/**
 * Broadcast the full grouped token queue to all kiosk displays in a hospital.
 * This fetches fresh stats and emits 'kiosk-queue-updated' with department-grouped data.
 */
const broadcastKioskQueue = async (hospitalId) => {
  if (!io) return;
  try {
    const kioskService = require('../modules/kiosk/kiosk.service');
    const stats = await kioskService.getKioskTokenStats(hospitalId);
    io.to(hospitalId.toString()).emit('kiosk-queue-updated', stats);
    logger.info(`Broadcasted kiosk-queue-updated to hospital ${hospitalId}`);
  } catch (e) {
    logger.error(`Failed to broadcast kiosk queue: ${e.message}`);
  }
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
  broadcastToHospital,
  broadcastKioskQueue,
};
