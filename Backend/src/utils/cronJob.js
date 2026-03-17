const cron = require('node-cron');
const Token = require('../modules/token/token.model');
const TokenCounter = require('../modules/token/tokenCounter.model');
const logger = require('../config/logger');

/**
 * Daily Token Reset Cron Job
 * Runs every day at midnight (00:00)
 */
cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily token reset cron job...');

    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Wait, the TokenCounter already uses 'date' for isolation.
        // But for performance, we might want to archive completed tokens older than 24h.
        
        // We can archive old tokens if needed, but for now we just reset logic is handled
        // by the fact that TokenCounter is daily (date field).
        
        // Let's log how many tokens were processed yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const tokenCount = await Token.countDocuments({
            createdAt: { 
                $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
                $lte: new Date(yesterday.setHours(23, 59, 59, 999))
            }
        });

        logger.info(`Token reset summary: ${tokenCount} tokens were generated on ${yesterdayStr}`);
        
        // Optional: Move tokens to an 'Archive' collection to keep 'tokens' table slim
        // This is a production optimization
    } catch (error) {
        logger.error(`Cron Job Error: ${error.message}`);
    }
});

logger.info('Cron jobs initialized.');
