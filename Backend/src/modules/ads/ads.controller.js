const adsService = require('./ads.service');
const logger = require('../../config/logger');

/**
 * @desc    Create a new ad (returns presigned upload URL)
 * @route   POST /api/ads
 * @access  Private (Admin)
 */
const createAd = async (req, res, next) => {
    try {
        const adData = { 
            ...req.body, 
            hospitalId: req.hospitalId,
            createdBy: req.user._id,
            approvalStatus: req.user.role === 'ADMIN' ? 'accepted' : 'pending',
            rejectionReason: '',
        };
        const result = await adsService.createAd(adData);
        logger.info(`Ad created: ${result.ad.title}`);

        // If created by Doctor, notify admins
        if (req.user.role === 'DOCTOR') {
            notifyAdminsAboutAd(req, result.ad);
        }

        res.status(201).json({
            success: true,
            data: result.ad,
            uploadUrl: result.uploadUrl,
            message: 'Use the uploadUrl to PUT the file directly to S3',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get active ads for kiosk display
 * @route   GET /api/ads?kiosk=true
 * @access  Private
 */
const getAds = async (req, res, next) => {
    try {
        if (req.query.kiosk === 'true') {
            const ads = await adsService.getActiveAds(req.hospitalId, req.query.departmentId);
            return res.status(200).json({ success: true, data: ads });
        }
        const { page, limit, isActive } = req.query;
        const filters = { page, limit, isActive };
        
        // Logic: Doctors only see their own ads, Admins see all
        if (req.user.role === 'DOCTOR') {
            filters.createdBy = req.user._id;
        }

        const result = await adsService.getAllAds(req.hospitalId, filters);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an ad
 * @route   PUT /api/ads/:id
 * @access  Private (Admin)
 */
const updateAd = async (req, res, next) => {
    try {
        const query = { _id: req.params.id, hospitalId: req.hospitalId };
        
        // Logic: Doctors can only update their own ads
        if (req.user.role === 'DOCTOR') {
            query.createdBy = req.user._id;
        }

        const Ad = require('./ads.model');
        const existingAd = await Ad.findOne(query);
        if (!existingAd) {
            return res.status(404).json({ success: false, message: 'Ad not found' });
        }

        // Prevent toggling active state on unapproved ads
        if (req.body.hasOwnProperty('isActive') && existingAd.approvalStatus !== 'accepted') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot activate/deactivate unapproved advertisements.' 
            });
        }

        const updateData = { ...req.body };
        if (req.user.role === 'DOCTOR') {
            updateData.approvalStatus = 'pending';
            updateData.rejectionReason = '';
        } else if (req.user.role === 'ADMIN') {
            updateData.approvalStatus = 'accepted';
        }

        const ad = await adsService.updateAd(query, updateData);
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Ad not found' });
        }
        logger.info(`Ad updated: ${ad.title}`);

        // If updated by Doctor, notify admins
        if (req.user.role === 'DOCTOR') {
            notifyAdminsAboutAd(req, ad);
        }

        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        if (error.message === 'Ad not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Delete an ad
 * @route   DELETE /api/ads/:id
 * @access  Private (Admin)
 */
const deleteAd = async (req, res, next) => {
    try {
        const query = { _id: req.params.id, hospitalId: req.hospitalId };
        
        // Logic: Doctors can only delete their own ads
        if (req.user.role === 'DOCTOR') {
            query.createdBy = req.user._id;
        }

        const result = await adsService.deleteAd(query);
        logger.info(`Ad deleted: ${req.params.id}`);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.message === 'Ad not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const notifyAdminsAboutAd = async (req, ad) => {
    try {
        const User = require('../auth/auth.model');
        const admins = await User.find({ hospitalId: req.hospitalId, role: 'ADMIN' });
        const notificationService = require('../notification/notification.service');
        const emailUtil = require('../../utils/email');

        const notificationPromises = admins.map(async (admin) => {
            // Dashboard Notification
            await notificationService.createNotification({
                recipient: admin._id,
                sender: req.user._id,
                hospitalId: req.hospitalId,
                title: 'New Advertisement Review Required',
                message: `Doctor ${req.user.name} has submitted the advertisement "${ad.title}" for approval.`,
                type: 'info',
                relatedType: 'Ad',
                relatedId: ad._id,
            });

            // Email Notification (non-blocking)
            emailUtil.sendApprovalRequestEmail({
                to: admin.email,
                adminName: admin.name,
                doctorName: req.user.name,
                itemName: ad.title,
                itemType: 'Advertisement',
            }).catch(err => logger.error(`Error sending email to admin ${admin.email}: ${err.message}`));
        });

        await Promise.all(notificationPromises);
    } catch (err) {
        logger.error(`Error notifying admins about ad: ${err.message}`);
    }
};

const reviewAd = async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid review status' });
        }

        const ad = await adsService.updateAd(
            { _id: req.params.id, hospitalId: req.hospitalId },
            { approvalStatus: status, rejectionReason: reason || '' }
        );

        if (!ad) {
            return res.status(404).json({ success: false, message: 'Ad not found' });
        }

        // Notify the doctor who created it
        if (ad.createdBy) {
            const User = require('../auth/auth.model');
            const doctorUser = await User.findById(ad.createdBy);
            if (doctorUser) {
                // Create Dashboard Notification
                const notificationService = require('../notification/notification.service');
                await notificationService.createNotification({
                    recipient: doctorUser._id,
                    sender: req.user._id,
                    hospitalId: req.hospitalId,
                    title: `Ad Review: ${status === 'accepted' ? 'Approved' : 'Rejected'}`,
                    message: `Your advertisement "${ad.title}" has been ${status}.${status === 'rejected' ? ` Reason: ${reason}` : ''}`,
                    type: status === 'accepted' ? 'success' : 'error',
                    relatedType: 'Ad',
                    relatedId: ad._id,
                });

                // Send email (non-blocking)
                const emailUtil = require('../../utils/email');
                emailUtil.sendApprovalResultEmail({
                    to: doctorUser.email,
                    doctorName: doctorUser.name,
                    itemName: ad.title,
                    itemType: 'Advertisement',
                    status,
                    reason,
                }).catch(err => logger.error(`Error sending email to doctor: ${err.message}`));
            }
        }

        logger.info(`Ad review completed: ${ad.title} status is ${status}`);
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAd,
    getAds,
    updateAd,
    deleteAd,
    reviewAd,
};
