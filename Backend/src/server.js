require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
const logger = require('./config/logger');

// Initialize Cron Jobs
require('./utils/cronJob');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
    try {
        await connectDB();
        logger.info('Database connected successfully.');

        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Graceful Shutdown Handler
 * Ensures in-flight requests finish and DB connections close cleanly
 * before the process exits (triggered by SIGINT or SIGTERM from OS/Docker/PM2).
 */
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Initiating graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
        logger.info('HTTP server closed. Closing database connection...');
        try {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed. Goodbye!');
            process.exit(0);
        } catch (err) {
            logger.error(`Error closing MongoDB connection: ${err.message}`);
            process.exit(1);
        }
    });

    // Force kill if connections refuse to close within 10 seconds
    setTimeout(() => {
        logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

