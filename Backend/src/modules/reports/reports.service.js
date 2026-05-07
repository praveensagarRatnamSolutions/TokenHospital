const Token = require('../token/token.model');
const Payment = require('../payment/payment.model');
const Hospital = require('../hospital/hospital.model');
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

/**
 * Financial Summary report
 */
const getFinancialSummary = async (hospitalId, filters = {}) => {
  const hospital = await Hospital.findById(hospitalId).lean();
  if (!hospital) throw new Error('Hospital not found');

  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

  // 1. Date Handling
  const today = new Date();
  let startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  if (filters.range === 'weekly') {
    startDate.setDate(today.getDate() - 7);
  } else if (filters.range === 'monthly') {
    startDate.setMonth(today.getMonth() - 1);
  } else if (filters.startDate && filters.endDate) {
    startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
  }

  const match = {
    hospitalId: hospitalObjId,
    createdAt: { $gte: startDate, $lte: endDate },
  };

  // 2. High Level Stats (Captured Payments)
  const stats = await Payment.aggregate([
    { $match: { ...match, status: 'captured' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        avgTransactionValue: { $avg: '$amount' },
      },
    },
  ]);

  // 3. Revenue by Payment Method
  const methodSplit = await Payment.aggregate([
    { $match: { ...match, status: 'captured' } },
    {
      $group: {
        _id: '$method',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // 4. Revenue by Doctor
  const doctorRevenue = await Payment.aggregate([
    { $match: { ...match, status: 'captured' } },
    {
      $group: {
        _id: '$doctorId',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
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
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ['$doctor.name', 'Unassigned'] },
        revenue: 1,
        count: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  // 5. Revenue by Department
  const departmentRevenue = await Payment.aggregate([
    { $match: { ...match, status: 'captured' } },
    {
      $group: {
        _id: '$departmentId',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
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
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ['$department.name', 'General'] },
        revenue: 1,
        count: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  // 6. Transaction Status Summary (Health Check)
  const statusSummary = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  return {
    period: { startDate, endDate },
    summary: stats[0] || { totalRevenue: 0, transactionCount: 0, avgTransactionValue: 0 },
    methodSplit,
    doctorRevenue,
    departmentRevenue,
    statusSummary,
  };
};

/**
 * Detailed Transaction Report (Table View)
 * Supports Search, Filters, and Pagination
 */
const getDetailedFinancialReport = async (hospitalId, filters = {}) => {
  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // 1. Build Match Object
  const match = { hospitalId: hospitalObjId };

  // Date Range
  if (filters.startDate && filters.endDate) {
    match.createdAt = {
      $gte: new Date(new Date(filters.startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)),
    };
  } else {
    // Default to today if no date provided
    const today = new Date();
    match.createdAt = {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lte: new Date(today.setHours(23, 59, 59, 999)),
    };
  }

  if (filters.doctorId) {
    match.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
  }

  if (filters.departmentId) {
    match.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
  }

  if (filters.method) {
    match.method = filters.method.toUpperCase();
  }

  if (filters.status) {
    match.status = filters.status;
  }

  // 2. Aggregation Pipeline
  const pipeline = [
    { $match: match },
    // 👥 Populate patient (if patientId exists)
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient',
      },
    },
    { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
    // 👨‍⚕️ Populate doctor
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    // 🏥 Populate department
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    // 🔗 Populate Token
    {
      $lookup: {
        from: 'tokens',
        localField: 'tokenId',
        foreignField: '_id',
        as: 'token',
      },
    },
    { $unwind: { path: '$token', preserveNullAndEmptyArrays: true } },
  ];

  // 3. Apply Search Filter (after populating patient)
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { 'patient.name': searchRegex },
          { 'patient.phone.full': searchRegex },
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.phone.full': searchRegex },
          { 'token.tokenNumber': searchRegex },
        ],
      },
    });
  }

  // 4. Sorting & Pagination
  pipeline.push({ $sort: { createdAt: -1 } });

  const finalPipeline = [
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const results = await Payment.aggregate(finalPipeline);

  const data = results[0].data;
  const total = results[0].totalCount[0]?.count || 0;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Export Transactions (All records based on filters)
 */
const exportTransactions = async (hospitalId, filters = {}) => {
  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

  // 1. Build Match Object
  const match = { hospitalId: hospitalObjId };

  if (filters.range === 'weekly') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    match.createdAt = { $gte: start };
  } else if (filters.range === 'monthly') {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    match.createdAt = { $gte: start };
  } else if (filters.startDate && filters.endDate) {
    match.createdAt = {
      $gte: new Date(new Date(filters.startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)),
    };
  }

  if (filters.doctorId) {
    match.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
  }

  if (filters.departmentId) {
    match.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
  }

  if (filters.method) {
    match.method = filters.method.toUpperCase();
  }

  if (filters.status) {
    match.status = filters.status;
  }

  // 2. Aggregation Pipeline (Same as table but no pagination)
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient',
      },
    },
    { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'tokens',
        localField: 'tokenId',
        foreignField: '_id',
        as: 'token',
      },
    },
    { $unwind: { path: '$token', preserveNullAndEmptyArrays: true } },
  ];

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { 'patient.name': searchRegex },
          { 'patient.phone.full': searchRegex },
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.phone.full': searchRegex },
          { 'token.tokenNumber': searchRegex },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  return await Payment.aggregate(pipeline);
};

module.exports = {
  getSummary,
  getDepartmentReport,
  getDoctorReport,
  getFinancialSummary,
  getDetailedFinancialReport,
  exportTransactions,
};
