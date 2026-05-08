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

        // Join a specific kiosk room for targeted updates
        socket.on('join-kiosk', (kioskId) => {
            socket.join(`kiosk_${kioskId}`);
            logger.info(`Socket ${socket.id} joined kiosk room: kiosk_${kioskId}`);
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

/**
 * Broadcast the grouped token queue to all kiosks.
 * Fetches filtered data for each kiosk individually to respect their assigned depts/doctors.
 */
const broadcastKioskQueue = async (hospitalId) => {
    if (!io) return;
    try {
        const kioskService = require('../modules/kiosk/kiosk.service');
        const Kiosk = require('../modules/kiosk/kiosk.model');
        
        // Find all active kiosks for this hospital
        const kiosks = await Kiosk.find({ hospitalId: hospitalId.toString(), isActive: true }).select('_id');

        for (const kiosk of kiosks) {
            const kioskId = kiosk._id.toString();
            const stats = await kioskService.getKioskTokenStats(hospitalId, kioskId);
            
            // Emit to the specific kiosk room
            io.to(`kiosk_${kioskId}`).emit('kiosk-queue-updated', stats);
        }
        
        logger.info(`Broadcasted targeted kiosk-queue-updated to ${kiosks.length} kiosks in hospital ${hospitalId}`);
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
