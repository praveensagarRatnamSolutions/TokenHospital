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

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });

        // Add additional event listeners here as needed
    });

    return io;
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
};
