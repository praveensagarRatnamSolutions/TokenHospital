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

/**
 * @desc    Get detailed doctor performance report
 * @route   GET /api/reports/doctor-performance
 * @access  Private (Admin)
 */
const getDoctorPerformanceReport = async (req, res, next) => {
    try {
        const { startDate, endDate, search, departmentId } = req.query;
        const report = await reportsService.getDoctorPerformanceReport(req.hospitalId, {
            startDate,
            endDate,
            search,
            departmentId,
        });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get patients for a specific doctor (drill-down)
 * @route   GET /api/reports/doctor-performance/:doctorId/patients
 */
const getDoctorPatients = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { startDate, endDate, search, page, limit } = req.query;
        const result = await reportsService.getDoctorPatients(req.hospitalId, doctorId, {
            startDate, endDate, search, page, limit,
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Export Doctor Performance Report to Excel
 * @route   GET /api/reports/doctor-performance/export
 */
const exportDoctorPerformance = async (req, res, next) => {
    try {
        const ExcelJS = require('exceljs');
        const { startDate, endDate, search, departmentId } = req.query;

        const data = await reportsService.exportDoctorPerformanceData(req.hospitalId, {
            startDate, endDate, search, departmentId,
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hospital System';
        const ws = workbook.addWorksheet('Doctor Performance');

        ws.columns = [
            { header: 'Rank', key: 'rank', width: 8 },
            { header: 'Doctor Name', key: 'doctorName', width: 28 },
            { header: 'Specialization', key: 'specialization', width: 22 },
            { header: 'Department', key: 'departmentName', width: 22 },
            { header: 'Total Patients', key: 'totalPatients', width: 16 },
            { header: 'Completed', key: 'completedPatients', width: 14 },
            { header: 'Cancelled', key: 'cancelledPatients', width: 14 },
            { header: 'Emergencies', key: 'emergencyPatients', width: 14 },
            { header: 'Total Revenue (₹)', key: 'revenue', width: 20 },
        ];

        // Style header row
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = {
            type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' },
        };
        ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getRow(1).height = 20;

        data.forEach((doc, index) => {
            const row = ws.addRow({
                rank: index + 1,
                doctorName: doc.doctorName,
                specialization: doc.specialization,
                departmentName: doc.departmentName,
                totalPatients: doc.totalPatients,
                completedPatients: doc.completedPatients,
                cancelledPatients: doc.cancelledPatients,
                emergencyPatients: doc.emergencyPatients,
                revenue: doc.revenue,
            });
            if (index % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8FF' } };
            }
        });

        ws.autoFilter = { from: 'A1', to: 'I1' };

        const filename = `Doctor_Performance_${startDate || 'today'}_to_${endDate || 'today'}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Export patients for a specific doctor to Excel
 * @route   GET /api/reports/doctor-performance/:doctorId/patients/export
 */
const exportDoctorPatients = async (req, res, next) => {
    try {
        const ExcelJS = require('exceljs');
        const { doctorId } = req.params;
        const { startDate, endDate, search } = req.query;

        const data = await reportsService.exportDoctorPatientsData(req.hospitalId, doctorId, {
            startDate, endDate, search,
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hospital System';
        const ws = workbook.addWorksheet('Patient List');

        ws.columns = [
            { header: 'Token No', key: 'tokenNumber', width: 14 },
            { header: 'Patient Name', key: 'patientName', width: 26 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Department', key: 'departmentName', width: 22 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Emergency', key: 'isEmergency', width: 12 },
            { header: 'Date', key: 'date', width: 14 },
            { header: 'Time', key: 'time', width: 12 },
        ];

        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = {
            type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' },
        };
        ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getRow(1).height = 20;

        data.forEach((token, index) => {
            const createdAt = new Date(token.createdAt);
            const row = ws.addRow({
                tokenNumber: token.tokenNumber || 'N/A',
                patientName: token.patient?.name || token.patientDetails?.name || 'Unknown',
                phone: token.patient?.phone?.full || token.patientDetails?.phone?.full || 'N/A',
                departmentName: token.department?.name || 'General',
                status: token.status,
                isEmergency: token.isEmergency ? 'Yes' : 'No',
                date: createdAt.toLocaleDateString(),
                time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            if (token.isEmergency) {
                row.getCell('isEmergency').font = { bold: true, color: { argb: 'FFDC2626' } };
            }
            if (index % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8FF' } };
            }
        });

        ws.autoFilter = { from: 'A1', to: 'H1' };

        const filename = `Patients_${startDate || 'today'}_to_${endDate || 'today'}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

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
    getDoctorPerformanceReport,
    getDoctorPatients,
    exportDoctorPerformance,
    exportDoctorPatients,
};
