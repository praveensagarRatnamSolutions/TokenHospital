const tokenService = require('./token.service');
const logger = require('../../config/logger');

/**
 * @desc    Create a new token
 * @route   POST /api/token
 * @access  Private
 */
const createToken = async (req, res, next) => {
    try {
        const tokenData = { ...req.body, hospitalId: req.hospitalId };
        const token = await tokenService.createToken(tokenData);
        logger.info(`Token created: ${token.tokenNumber}`);
        res.status(201).json({ success: true, data: token });
    } catch (error) {
        if (error.message === 'Department not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Get current token for a doctor
 * @route   GET /api/token/current
 * @access  Private
 */
const getCurrentToken = async (req, res, next) => {
    try {
        const doctorId = req.user.doctorId;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'doctorId query param is required' });
        }
        const token = await tokenService.getCurrentToken(req.hospitalId, doctorId);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all tokens with filters
 * @route   GET /api/token
 * @access  Private
 */
const getTokens = async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            departmentId: req.query.departmentId,
            doctorId: req.query.doctorId,
            appointmentDate: req.query.appointmentDate,
            page: req.query.page,
            limit: req.query.limit,
        };
        const result = await tokenService.getTokens(req.hospitalId, filters);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Complete a token
 * @route   PATCH /api/token/:id/complete
 * @access  Private (Doctor)
 */
const completeToken = async (req, res, next) => {
    try {
        const token = await tokenService.completeToken(req.params.id, req.hospitalId, req.body);
        logger.info(`Token completed: ${token.tokenNumber}`);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        if (error.message === 'Token not found or not currently active') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Call next token for a doctor
 * @route   POST /api/token/next
 * @access  Private (Doctor)
 */
const callNextToken = async (req, res, next) => {
    try {
        const { doctorId } = req.body;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'doctorId is required in body' });
        }
        const token = await tokenService.callNextToken(doctorId, req.hospitalId);
        if (!token) {
            return res.status(200).json({ success: true, message: 'No tokens in queue', data: null });
        }
        logger.info(`Next token called: ${token.tokenNumber} for doctor ${doctorId}`);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel a token
 * @route   PATCH /api/token/:id/cancel
 * @access  Private (Admin, Receptionist)
 */
const cancelToken = async (req, res, next) => {
    try {
        const token = await tokenService.cancelToken(req.params.id, req.hospitalId);
        logger.info(`Token canceled: ${token.tokenNumber}`);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        if (error.message === 'Token not found or already completed') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Verify cash payment for a provisional token
 * @route   PATCH /api/token/:id/verify-cash
 * @access  Private (Admin)
 */
const verifyCashPayment = async (req, res, next) => {
    try {
        const token = await tokenService.verifyCashPayment(req.params.id, req.hospitalId);
        logger.info(`Cash payment verified for token: ${token.tokenNumber}`);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        if (error.message === 'Token not found or not in PROVISIONAL status') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Skip a token
 * @route   PATCH /api/token/:id/skip
 * @access  Private (Doctor)
 */
const skipToken = async (req, res, next) => {
    const doctorId = req.user.doctorId;
    try {
        const token = await tokenService.skipToken(req.params.id, req.hospitalId, doctorId);
        logger.info(`Token skipped: ${token.tokenNumber}`);
        res.status(200).json({ success: true, data: token });
    } catch (error) {
        if (error.message === 'Token not found or not in CALLED status') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createToken,
    getCurrentToken,
    getTokens,
    completeToken,
    callNextToken,
    cancelToken,
    verifyCashPayment,
    skipToken,
};

