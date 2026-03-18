const adsService = require('./ads.service');
const logger = require('../../config/logger');

/**
 * @desc    Create a new ad (returns presigned upload URL)
 * @route   POST /api/ads
 * @access  Private (Admin)
 */
const createAd = async (req, res, next) => {
    try {
        const adData = { ...req.body, hospitalId: req.hospitalId };
        const result = await adsService.createAd(adData);
        logger.info(`Ad created: ${result.ad.title}`);
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
        const ads = await adsService.getAllAds(req.hospitalId);
        res.status(200).json({ success: true, data: ads });
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
        const ad = await adsService.updateAd(req.params.id, req.hospitalId, req.body);
        logger.info(`Ad updated: ${ad.title}`);
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
        const result = await adsService.deleteAd(req.params.id, req.hospitalId);
        logger.info(`Ad deleted: ${req.params.id}`);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.message === 'Ad not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createAd,
    getAds,
    updateAd,
    deleteAd,
};
