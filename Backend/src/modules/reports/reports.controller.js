const reportsService = require('./reports.service');

/**
 * @desc    Get daily summary report
 * @route   GET /api/reports/summary
 * @access  Private (Admin)
 */
const getSummary = async (req, res, next) => {
    try {
        const summary = await reportsService.getSummary(req.hospitalId);
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get department-wise report
 * @route   GET /api/reports/department
 * @access  Private (Admin)
 */
const getDepartmentReport = async (req, res, next) => {
    try {
        const report = await reportsService.getDepartmentReport(req.hospitalId);
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get doctor workload report
 * @route   GET /api/reports/doctor
 * @access  Private (Admin)
 */
const getDoctorReport = async (req, res, next) => {
    try {
        const report = await reportsService.getDoctorReport(req.hospitalId);
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getDepartmentReport,
    getDoctorReport,
};
