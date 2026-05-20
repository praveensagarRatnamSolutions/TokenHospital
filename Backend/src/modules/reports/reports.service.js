const Token = require('../token/token.model');
const Payment = require('../payment/payment.model');
const Hospital = require('../hospital/hospital.model');
const HospitalSubscription = require('../subscription/hospitalSubscription.model');
const SubscriptionTransaction = require('../subscription/subscription.model');
const User = require('../auth/auth.model');
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

/**
 * Detailed Doctor Performance Report
 */
const getDoctorPerformanceReport = async (hospitalId, filters = {}) => {
  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);

  // 1. Date Handling
  const today = new Date();
  let startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  if (filters.startDate && filters.endDate) {
    startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
  }

  const match = {
    hospitalId: hospitalObjId,
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (filters.departmentId && filters.departmentId !== '') {
    match.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
  }

  // 2. Aggregate Data
  const report = await Token.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$doctorId',
        totalPatients: { $sum: 1 },
        completedPatients: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        cancelledPatients: { $sum: { $cond: [{ $eq: ['$status', 'CANCELED'] }, 1, 0] } },
        emergencyPatients: { $sum: { $cond: ['$isEmergency', 1, 0] } },
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    // Join with departments
    {
      $lookup: {
        from: 'departments',
        localField: 'doctor.departmentId',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    // Join with payments for revenue
    {
      $lookup: {
        from: 'payments',
        let: { docId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$doctorId', '$$docId'] },
                  { $eq: ['$status', 'captured'] },
                  { $gte: ['$createdAt', startDate] },
                  { $lte: ['$createdAt', endDate] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$amount' }
            }
          }
        ],
        as: 'revenueData'
      }
    },
    { $unwind: { path: '$revenueData', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        doctorName: { $ifNull: ['$doctor.name', 'Unassigned Specialist'] },
        specialization: { $ifNull: ['$doctor.education', 'Medical Officer'] },
        departmentName: { $ifNull: ['$department.name', 'General'] },
        totalPatients: 1,
        completedPatients: 1,
        cancelledPatients: 1,
        emergencyPatients: 1,
        revenue: { $ifNull: ['$revenueData.revenue', 0] }
      }
    },
    // Final search filter if provided
    ...(filters.search ? [{
      $match: {
        $or: [
          { doctorName: new RegExp(filters.search, 'i') },
          { specialization: new RegExp(filters.search, 'i') },
          { departmentName: new RegExp(filters.search, 'i') }
        ]
      }
    }] : []),
    { $sort: { revenue: -1, totalPatients: -1 } }
  ]);

  return {
    period: { startDate, endDate },
    report
  };
};

/**
 * Get Patients for a specific doctor (drill-down)
 */
const getDoctorPatients = async (hospitalId, doctorId, filters = {}) => {
  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);
  const doctorObjId = new mongoose.Types.ObjectId(doctorId);

  const today = new Date();
  let startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  if (filters.startDate && filters.endDate) {
    startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const match = {
    hospitalId: hospitalObjId,
    doctorId: doctorObjId,
    createdAt: { $gte: startDate, $lte: endDate },
  };

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
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
  ];

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    pipeline.splice(pipeline.length - 1, 0, {
      $match: {
        $or: [
          { 'patient.name': searchRegex },
          { 'patient.phone.full': searchRegex },
          { tokenNumber: searchRegex },
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.phone.full': searchRegex },
        ],
      },
    });
  }

  const finalPipeline = [
    ...pipeline,
    {
      $facet: {
        tokens: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const results = await Token.aggregate(finalPipeline);
  const tokens = results[0]?.tokens || [];
  const total = results[0]?.totalCount[0]?.count || 0;

  return {
    tokens,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Export Doctor Performance Report data (all records, no pagination)
 */
const exportDoctorPerformanceData = async (hospitalId, filters = {}) => {
  // Re-use existing service but strip pagination
  const result = await getDoctorPerformanceReport(hospitalId, filters);
  return result.report;
};

/**
 * Export Doctor Patients data (all records for a doctor, no pagination)
 */
const exportDoctorPatientsData = async (hospitalId, doctorId, filters = {}) => {
  const hospitalObjId = new mongoose.Types.ObjectId(hospitalId);
  const doctorObjId = new mongoose.Types.ObjectId(doctorId);

  const today = new Date();
  let startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  if (filters.startDate && filters.endDate) {
    startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
  }

  const match = {
    hospitalId: hospitalObjId,
    doctorId: doctorObjId,
    createdAt: { $gte: startDate, $lte: endDate },
  };

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
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
  ];

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    pipeline.splice(pipeline.length - 1, 0, {
      $match: {
        $or: [
          { 'patient.name': searchRegex },
          { 'patient.phone.full': searchRegex },
          { tokenNumber: searchRegex },
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.phone.full': searchRegex },
        ],
      },
    });
  }

  return await Token.aggregate(pipeline);
};

const SUPERADMIN_SUBSCRIPTION_STATUSES = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELLED', 'PAUSED'];
const SUPERADMIN_TRANSACTION_TYPES = ['SUBSCRIPTION', 'WALLET_TOPUP'];

const getSelectedFilter = (value) => {
  if (!value) return '';

  const selected = String(value).trim();
  return selected && selected.toUpperCase() !== 'ALL' ? selected : '';
};

const getUpperFilter = (value, allowedValues) => {
  const selected = getSelectedFilter(value).toUpperCase();
  return allowedValues.includes(selected) ? selected : '';
};

const parseReportDate = (value, endOfDay = false) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const getChartDateRange = (filters, today) => {
  const customStart = parseReportDate(filters.startDate);
  const customEnd = parseReportDate(filters.endDate, true);

  if (customStart || customEnd) {
    let endDate = customEnd || new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    let startDate = customStart || new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      [startDate, endDate] = [new Date(endDate.setHours(0, 0, 0, 0)), new Date(startDate.setHours(23, 59, 59, 999))];
    }

    return { startDate, endDate, isCustom: true };
  }

  let rangeMonths = 7;
  if (filters.timeRange === '1M') rangeMonths = 1;
  else if (filters.timeRange === '3M') rangeMonths = 3;
  else if (filters.timeRange === '1Y') rangeMonths = 12;

  return {
    startDate: new Date(today.getFullYear(), today.getMonth() - rangeMonths + 1, 1),
    endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
    isCustom: false,
  };
};

const getMonthBuckets = (startDate, endDate) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const monthCount =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth()) +
    1;
  const includeYear = startMonth.getFullYear() !== endMonth.getFullYear() || monthCount > 12;
  const revenueDataMap = {};
  const walletDataMap = {};

  for (let i = 0; i < monthCount; i++) {
    const bucketDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth() + 1}`;
    const month = includeYear
      ? `${monthNames[bucketDate.getMonth()]} ${String(bucketDate.getFullYear()).slice(-2)}`
      : monthNames[bucketDate.getMonth()];

    revenueDataMap[key] = { month, revenue: 0, subscriptions: 0 };
    walletDataMap[key] = { month, sms: 0, email: 0 };
  }

  return { revenueDataMap, walletDataMap };
};

const getScopedHospitalIds = async ({ hospitalId, hospitalStatus, subscriptionStatus }) => {
  let hospitalMatch = {};

  if (hospitalId) {
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) return [];
    hospitalMatch._id = new mongoose.Types.ObjectId(hospitalId);
  }

  if (hospitalStatus === 'ACTIVE') {
    hospitalMatch.isActive = true;
  } else if (hospitalStatus === 'INACTIVE') {
    hospitalMatch.isActive = false;
  }

  const hasHospitalFilter = Object.keys(hospitalMatch).length > 0;

  if (hasHospitalFilter) {
    const hospitalIds = await Hospital.find(hospitalMatch).distinct('_id');

    if (!subscriptionStatus) return hospitalIds;
    if (!hospitalIds.length) return [];

    return HospitalSubscription.find({
      hospitalId: { $in: hospitalIds },
      status: subscriptionStatus,
    }).distinct('hospitalId');
  }

  if (subscriptionStatus) {
    return HospitalSubscription.find({ status: subscriptionStatus }).distinct('hospitalId');
  }

  return null;
};

/**
 * Global SuperAdmin Reports
 */
const getSuperAdminReports = async (filters = {}) => {
  const today = new Date();
  const hospitalStatus = getUpperFilter(filters.hospitalStatus, ['ACTIVE', 'INACTIVE']);
  const subscriptionStatus = getUpperFilter(filters.subscriptionStatus, SUPERADMIN_SUBSCRIPTION_STATUSES);
  const transactionType = getUpperFilter(filters.transactionType, SUPERADMIN_TRANSACTION_TYPES);
  const hospitalId = getSelectedFilter(filters.hospitalId);
  const scopedHospitalIds = await getScopedHospitalIds({
    hospitalId,
    hospitalStatus,
    subscriptionStatus,
  });
  const scopedHospitalMatch = scopedHospitalIds ? { _id: { $in: scopedHospitalIds } } : {};
  const scopedReferenceMatch = scopedHospitalIds ? { hospitalId: { $in: scopedHospitalIds } } : {};

  const totalHospitals = await Hospital.countDocuments(scopedHospitalMatch);

  const subscriptionMetricStatus = subscriptionStatus || 'ACTIVE';
  const subscriptionMetricMatch = {
    status: subscriptionMetricStatus,
    ...scopedReferenceMatch,
  };
  const activeSubscriptions = await HospitalSubscription.countDocuments(subscriptionMetricMatch);

  const totalUsers = scopedHospitalIds
    ? await User.countDocuments({ hospitalId: { $in: scopedHospitalIds } })
    : await User.countDocuments();

  const chartRange = getChartDateRange(filters, today);
  const revenuePeriod = chartRange.isCustom
    ? chartRange
    : {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
      };

  const revenueMetricType = transactionType || 'SUBSCRIPTION';
  const revenueSummary = await SubscriptionTransaction.aggregate([
    {
      $match: {
        ...scopedReferenceMatch,
        type: { $in: SUPERADMIN_TRANSACTION_TYPES },
        status: 'COMPLETED',
        createdAt: { $gte: revenuePeriod.startDate, $lte: revenuePeriod.endDate },
      },
    },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const subscriptionRevenue = revenueSummary.find((item) => item._id === 'SUBSCRIPTION')?.total || 0;
  const walletRevenue = revenueSummary.find((item) => item._id === 'WALLET_TOPUP')?.total || 0;
  const totalRevenue = subscriptionRevenue + walletRevenue;
  const revenueThisMonth = revenueMetricType === 'WALLET_TOPUP' ? walletRevenue : subscriptionRevenue;

  const transactionMatch = {
    ...scopedReferenceMatch,
    status: 'COMPLETED',
    createdAt: { $gte: chartRange.startDate, $lte: chartRange.endDate },
  };

  if (transactionType) {
    transactionMatch.type = transactionType;
  }

  const transactions = await SubscriptionTransaction.aggregate([
    { $match: transactionMatch },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const { revenueDataMap, walletDataMap } = getMonthBuckets(chartRange.startDate, chartRange.endDate);

  transactions.forEach((transaction) => {
    const key = `${transaction._id.year}-${transaction._id.month}`;

    if (transaction._id.type === 'SUBSCRIPTION' && revenueDataMap[key]) {
      revenueDataMap[key].revenue += transaction.total;
      revenueDataMap[key].subscriptions += transaction.count;
    } else if (transaction._id.type === 'WALLET_TOPUP' && walletDataMap[key]) {
      walletDataMap[key].sms += Math.round(transaction.total * 0.6);
      walletDataMap[key].email += Math.round(transaction.total * 0.4);

      if (transactionType === 'WALLET_TOPUP' && revenueDataMap[key]) {
        revenueDataMap[key].revenue += transaction.total;
        revenueDataMap[key].subscriptions += transaction.count;
      }
    }
  });

  return {
    metrics: {
      totalHospitals,
      activeSubscriptions,
      revenueThisMonth,
      subscriptionRevenue,
      walletRevenue,
      totalRevenue,
      totalUsers,
      subscriptionMetricLabel: subscriptionStatus ? `${subscriptionStatus} Subscriptions` : 'Active Subscriptions',
      revenueMetricLabel: revenueMetricType === 'WALLET_TOPUP' ? 'Wallet Revenue' : 'Subscription Revenue',
      revenueMetricPeriodLabel: chartRange.isCustom ? 'Selected Period' : 'Current Month',
    },
    filters: {
      timeRange: filters.timeRange || '7M',
      startDate: chartRange.startDate,
      endDate: chartRange.endDate,
      hospitalId: hospitalId || 'ALL',
      hospitalStatus: hospitalStatus || 'ALL',
      subscriptionStatus: subscriptionStatus || 'ACTIVE',
      transactionType: transactionType || 'ALL',
    },
    revenueData: Object.values(revenueDataMap),
    walletData: Object.values(walletDataMap),
  };
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
  exportDoctorPerformanceData,
  exportDoctorPatientsData,
  getSuperAdminReports,
};
