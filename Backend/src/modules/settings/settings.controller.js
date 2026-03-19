const settingsService = require("./settings.service");
const logger = require("../../config/logger");
const { validationResult } = require("express-validator");

/**
 * @desc    Create hospital settings
 * @route   POST /api/settings
 * @access  Private (Admin)
 */
const createSettings = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const settings = await settingsService.createSettings(req.body);
    logger.info(`Settings created for hospital ${req.body.hospitalId}`);
    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

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
    const settings = await settingsService.updateSettings(
      req.hospitalId,
      req.body,
    );
    logger.info(`Settings updated for hospital ${req.hospitalId}`);
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSettings,
  getSettings,
  updateSettings,
};
