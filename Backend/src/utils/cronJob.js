const cron = require('node-cron');
const Token = require('../modules/token/token.model');
const TokenCounter = require('../modules/token/tokenCounter.model');
const HospitalSubscription = require('../modules/subscription/hospitalSubscription.model');
const logger = require('../config/logger');

const expireEndedSubscriptions = async () => {
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    // 1. Hard expire everything in GRACE_PERIOD, PAST_DUE, UNPAID where the cycle ended > 3 days ago
    const expiredResult = await HospitalSubscription.updateMany(
        {
            status: {
                $in: ['GRACE_PERIOD', 'PAST_DUE', 'UNPAID'],
            },
            currentPeriodEnd: { $lte: gracePeriodEnd },
        },
        {
            $set: {
                status: 'EXPIRED',
                endedAt: now,
            },
        }
    );

    // 2. Soft expire ACTIVE or TRIAL subscriptions whose period just ended, moving them to GRACE_PERIOD
    const graceResult = await HospitalSubscription.updateMany(
        {
            status: {
                $in: ['TRIAL', 'ACTIVE'],
            },
            currentPeriodEnd: { $lte: now },
        },
        {
            $set: {
                status: 'GRACE_PERIOD',
            },
        }
    );

    logger.info(`Subscription expiry sweep: moved ${graceResult.modifiedCount} to GRACE_PERIOD, marked ${expiredResult.modifiedCount} as EXPIRED.`);
};

/**
 * Daily Token Reset Cron Job
 * Runs every day at midnight (00:00)
 */
cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily token reset cron job...');

    try {
        const today = new Date().toISOString().split('T')[0];
        
        const result = await TokenCounter.deleteMany({
            date: { $lt: today }
        });

        logger.info(`Daily Reset: Cleared ${result.deletedCount} old token counters. New tokens will start from 1 for ${today}.`);
        
    } catch (error) {
        logger.error(`Cron Job Error: ${error.message}`);
    }
});

/**
 * Subscription Price Migration Sweeper
 * Processes subscriptions scheduled for a price migration when their effective date is reached.
 */
const executePriceMigrations = async () => {
    const now = new Date();
    const Razorpay = require('razorpay');

    const getGlobalRazorpayClient = () => {
        const keyId = process.env.RAZORPAY_CLIENT_ID;
        const keySecret = process.env.RAZORPAY_CLIENT_SECRET;

        if (!keyId || !keySecret) {
            throw new Error('Global Platform Razorpay credentials are not configured in .env');
        }

        return new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    };

    // Find subscriptions where pending migration is active and due
    const subscriptions = await HospitalSubscription.find({
        'pendingPriceChange.status': 'NOTICE_SENT',
        'pendingPriceChange.effectiveDate': { $lte: now },
        status: { $in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD', 'PAST_DUE'] },
    });

    logger.info(`Subscription price migration sweeper: found ${subscriptions.length} subscription(s) due for migration.`);

    let succeeded = 0;
    let failed = 0;
    const details = [];

    for (const sub of subscriptions) {
        try {
            const pending = sub.pendingPriceChange;
            const isMock = !sub.razorpaySubscriptionId || sub.razorpaySubscriptionId.startsWith('sub_mock');

            if (isMock) {
                logger.info(`Sandbox: Migrating mock subscription ${sub.razorpaySubscriptionId} to new mock plan ${pending.newRazorpayPlanId}`);
            } else {
                const rzp = getGlobalRazorpayClient();
                logger.info(`Razorpay API: Scheduling subscription ${sub.razorpaySubscriptionId} change to new plan ${pending.newRazorpayPlanId} at cycle end`);
                
                await rzp.subscriptions.update(sub.razorpaySubscriptionId, {
                    plan_id: pending.newRazorpayPlanId,
                    schedule_change_at: 'cycle_end',
                });
            }

            // Transition MongoDB properties
            sub.planId = pending.planId;
            sub.billingCycle = pending.billingCycle;
            sub.pendingPriceChange.status = 'ACCEPTED';
            await sub.save();
            
            logger.info(`✅ Successfully migrated subscription ${sub.razorpaySubscriptionId || sub._id} to Plan ${pending.planId} (₹${pending.newAmount})`);
            succeeded += 1;
            details.push({
                subscriptionId: sub.razorpaySubscriptionId || sub._id.toString(),
                status: 'MIGRATED',
                newAmount: pending.newAmount,
                newPlanId: pending.planId,
            });
        } catch (err) {
            logger.error(`❌ Failed to migrate subscription ${sub.razorpaySubscriptionId || sub._id}: ${err.message}`);
            failed += 1;
            details.push({
                subscriptionId: sub.razorpaySubscriptionId || sub._id.toString(),
                status: 'FAILED',
                error: err.message,
            });
        }
    }

    return { succeeded, failed, details };
};

/**
 * Daily Subscription Price Migration Cron Job
 * Runs every day at midnight (00:00)
 */
cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily subscription price migration cron job...');
    try {
        await executePriceMigrations();
    } catch (error) {
        logger.error(`Price Migration Cron Job Error: ${error.message}`);
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

module.exports = {
    expireEndedSubscriptions,
    executePriceMigrations,
};
