const { Server } = require('socket.io');
const logger = require('../config/logger');

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

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Broadcast an event to a specific hospital room
 */
const broadcastToHospital = (hospitalId, eventName, data) => {
    if (!io) return;
    io.to(hospitalId).emit(eventName, data);
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
};
