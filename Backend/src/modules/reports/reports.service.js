const Token = require('../token/token.model');
const mongoose = require('mongoose');

/**
 * Summary report: total patients today, waiting, current, completed
 */
const getSummary = async (hospitalId) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

    const summary = await Token.aggregate([
        {
            $match: {
                hospitalId: hospitalObjId,
                createdAt: { $gte: todayStart, $lte: todayEnd },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const result = { total: 0, waiting: 0, current: 0, completed: 0 };
    summary.forEach((s) => {
        result[s._id] = s.count;
        result.total += s.count;
    });

    // Average waiting time for completed tokens today
    const avgWait = await Token.aggregate([
        {
            $match: {
                hospitalId: hospitalObjId,
                status: 'completed',
                createdAt: { $gte: todayStart, $lte: todayEnd },
                calledAt: { $ne: null },
            },
        },
        {
            $project: {
                waitTimeMs: { $subtract: ['$calledAt', '$createdAt'] },
            },
        },
        {
            $group: {
                _id: null,
                avgWaitTime: { $avg: '$waitTimeMs' },
            },
        },
    ]);

    result.avgWaitTimeMinutes = avgWait.length
        ? Math.round(avgWait[0].avgWaitTime / 60000)
        : 0;

    return result;
};

/**
 * Department-wise report: tokens per department today
 */
const getDepartmentReport = async (hospitalId) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

    const report = await Token.aggregate([
        {
            $match: {
                hospitalId: hospitalObjId,
                createdAt: { $gte: todayStart },
            },
        },
        {
            $group: {
                _id: { departmentId: '$departmentId', status: '$status' },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: '$_id.departmentId',
                statuses: {
                    $push: { status: '$_id.status', count: '$count' },
                },
                total: { $sum: '$count' },
            },
        },
        {
            $lookup: {
                from: 'departments',
                localField: '_id',
                foreignField: '_id',
                as: 'department',
            },
        },
        { $unwind: '$department' },
        {
            $project: {
                departmentName: '$department.name',
                prefix: '$department.prefix',
                total: 1,
                statuses: 1,
            },
        },
        { $sort: { total: -1 } },
    ]);

    return report;
};

/**
 * Doctor workload report: tokens per doctor today
 */
const getDoctorReport = async (hospitalId) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

    const report = await Token.aggregate([
        {
            $match: {
                hospitalId: hospitalObjId,
                createdAt: { $gte: todayStart },
                doctorId: { $ne: null },
            },
        },
        {
            $group: {
                _id: { doctorId: '$doctorId', status: '$status' },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: '$_id.doctorId',
                statuses: {
                    $push: { status: '$_id.status', count: '$count' },
                },
                total: { $sum: '$count' },
            },
        },
        {
            $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: '_id',
                as: 'doctor',
            },
        },
        { $unwind: '$doctor' },
        {
            $project: {
                doctorName: '$doctor.name',
                total: 1,
                statuses: 1,
            },
        },
        // Average service time per doctor
        {
            $sort: { total: -1 },
        },
    ]);

    return report;
};

module.exports = {
    getSummary,
    getDepartmentReport,
    getDoctorReport,
};
