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

/**
 * @desc    Get financial summary report
 * @route   GET /api/reports/financial
 * @access  Private (Admin)
 */
const getFinancialSummary = async (req, res, next) => {
    try {
        const { range, startDate, endDate } = req.query;
        const report = await reportsService.getFinancialSummary(req.hospitalId, {
            range,
            startDate,
            endDate,
        });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get detailed financial report (transactions)
 * @route   GET /api/reports/transactions
 * @access  Private (Admin)
 */
const getDetailedFinancialReport = async (req, res, next) => {
    try {
        const {
            search,
            page,
            limit,
            startDate,
            endDate,
            method,
            status,
            doctorId,
            departmentId,
        } = req.query;

        const report = await reportsService.getDetailedFinancialReport(req.hospitalId, {
            search,
            page,
            limit,
            startDate,
            endDate,
            method,
            status,
            doctorId,
            departmentId,
        });

        res.status(200).json({ success: true, ...report });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Export transactions to Excel
 * @route   GET /api/reports/export-transactions
 * @access  Private (Admin)
 */
const exportTransactions = async (req, res, next) => {
    try {
        const ExcelJS = require('exceljs');
        const {
            search,
            startDate,
            endDate,
            range,
            method,
            status,
            doctorId,
            departmentId,
        } = req.query;

        const data = await reportsService.exportTransactions(req.hospitalId, {
            search,
            startDate,
            endDate,
            range,
            method,
            status,
            doctorId,
            departmentId,
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        // Define columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Time', key: 'time', width: 12 },
            { header: 'Token No', key: 'tokenNumber', width: 15 },
            { header: 'Patient Name', key: 'patientName', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Doctor', key: 'doctorName', width: 20 },
            { header: 'Department', key: 'departmentName', width: 20 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Method', key: 'method', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Transaction ID', key: 'transactionId', width: 30 },
        ];

        // Style the header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add rows
        data.forEach((tx) => {
            worksheet.addRow({
                date: new Date(tx.createdAt).toLocaleDateString(),
                time: new Date(tx.createdAt).toLocaleTimeString(),
                tokenNumber: tx.token?.tokenNumber || 'N/A',
                patientName: tx.patient?.name || tx.patientDetails?.name || 'N/A',
                phone: tx.patient?.phone?.full || tx.patientDetails?.phone?.full || 'N/A',
                doctorName: tx.doctor?.name || 'Unassigned',
                departmentName: tx.department?.name || 'General',
                amount: tx.amount,
                method: tx.method,
                status: tx.status,
                transactionId: tx.razorpayPaymentId || tx._id.toString(),
            });
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `Report_${new Date().getTime()}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getDepartmentReport,
    getDoctorReport,
    getFinancialSummary,
    getDetailedFinancialReport,
    exportTransactions,
};
