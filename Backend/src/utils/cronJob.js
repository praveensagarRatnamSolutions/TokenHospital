const cron = require('node-cron');
const Token = require('../modules/token/token.model');
const TokenCounter = require('../modules/token/tokenCounter.model');
const HospitalSubscription = require('../modules/subscription/hospitalSubscription.model');
const logger = require('../config/logger');

const expireEndedSubscriptions = async () => {
    const now = new Date();

    const result = await HospitalSubscription.updateMany(
        {
            status: {
                $in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'PAST_DUE', 'UNPAID'],
            },
            currentPeriodEnd: { $lte: now },
        },
        {
            $set: {
                status: 'EXPIRED',
                endedAt: now,
            },
        }
    );

    logger.info(`Subscription expiry sweep: marked ${result.modifiedCount} subscription(s) as EXPIRED.`);
};

/**
 * Daily Token Reset Cron Job
 * Runs every day at midnight (00:00)
 */
cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily token reset cron job...');

    try {
        const today = new Date().toISOString().split('T')[0];
        
        // In our current implementation, TokenCounter is scoped by 'date',
        // so it naturally starts from 1 for each new date.
        // However, we can perform cleanup of old counters here if needed.
        
        const result = await TokenCounter.deleteMany({
            date: { $lt: today }
        });

        logger.info(`Daily Reset: Cleared ${result.deletedCount} old token counters. New tokens will start from 1 for ${today}.`);
        
    } catch (error) {
        logger.error(`Cron Job Error: ${error.message}`);
    }
});

/**
 * Subscription Expiry Cron Job
 * Runs every hour and marks ended active/trial subscriptions as EXPIRED.
 */
cron.schedule('0 * * * *', async () => {
    logger.info('Running subscription expiry cron job...');

    try {
        await expireEndedSubscriptions();
    } catch (error) {
        logger.error(`Subscription Expiry Cron Job Error: ${error.message}`);
    }
});

logger.info('Cron jobs initialized.');
