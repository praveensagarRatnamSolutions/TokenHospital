const settingsService = require('./settings.service');
const logger = require('../../config/logger');

/**
 * @desc    Get hospital settings
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
    try {
        const settings = await settingsService.getSettings(req.hospitalId);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update hospital settings
 * @route   PUT /api/settings
 * @access  Private (Admin)
 */
const updateSettings = async (req, res, next) => {
    try {
        const settings = await settingsService.updateSettings(req.hospitalId, req.body);
        logger.info(`Settings updated for hospital ${req.hospitalId}`);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
