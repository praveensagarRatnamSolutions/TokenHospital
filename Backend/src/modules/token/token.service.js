const Token = require('./token.model');
const Consultation = require('../patient/consultation.model');
const Hospital = require('../hospital/hospital.model');
const Payment = require('../payment/payment.model');
const TokenCounter = require('./tokenCounter.model');
const Department = require('../department/department.model');
const Doctor = require('../doctor/doctor.model');
const Patient = require('../patient/patient.model');
const {
  getIo,
  broadcastToHospital,
  broadcastKioskQueue,
} = require('../../socket/socketHandler');
const { normalizeDate, getDayOfWeek } = require('./token.util');
const { default: mongoose } = require('mongoose');

/**
 * Resolve/Create Patient
 */
const resolvePatient = async (hospitalId, patientData) => {
  const { name, phone, age, gender } = patientData;

  // Search by the full phone number string
  const phoneFull = typeof phone === 'object' ? phone.full : phone;
  let patient = await Patient.findOne({ hospitalId, 'phone.full': phoneFull });

  if (!patient) {
    patient = await Patient.create({
      name,
      phone: typeof phone === 'object' ? phone : { full: phone },
      age,
      gender,
      hospitalId,
    });
  } else {
    // Optionally update details if they are provided and different
    let needsUpdate = false;
    if (age && patient.age !== age) {
      patient.age = age;
      needsUpdate = true;
    }
    if (gender && patient.gender !== gender) {
      patient.gender = gender;
      needsUpdate = true;
    }
    if (name && patient.name !== name) {
      patient.name = name;
      needsUpdate = true;
    }

    if (needsUpdate) await patient.save();
  }

  return patient;
};

const getDoctorQueue = async (hospitalId, doctorId, date) => {
  const hospital = await Hospital.findById(hospitalId).lean();
  if (!hospital) throw new Error('Hospital not found');

  const timeZone = hospital.timezone || 'Asia/Kolkata';
  const targetDate = normalizeDate(date || new Date(), timeZone);

  const tokens = await Token.aggregate([
    // 1. Match tokens
    {
      $match: {
        hospitalId: new mongoose.Types.ObjectId(hospitalId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: targetDate,
        status: { $in: ['WAITING', 'CALLED'] },
      },
    },

    // 2. Join Payment
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'tokenId',
        as: 'payment',
      },
    },

    // 3. Flatten payment array
    {
      $unwind: {
        path: '$payment',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Add computed fields
    {
      $addFields: {
        paymentStatus: {
          $cond: [
            '$isEmergency',
            'captured', // 🚨 emergency override
            { $ifNull: ['$payment.status', 'pending'] },
          ],
        },
        paymentMethod: {
          $cond: ['$isEmergency', null, '$payment.method'],
        },
        isPaid: {
          $cond: [
            '$isEmergency',
            true,
            { $eq: ['$payment.status', 'captured'] },
          ],
        },
      },
    },

    // 5. Populate patient
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient',
      },
    },
    { $unwind: '$patient' },

    // 6. Populate department
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: '$department' },

    // 7. Sort (VERY IMPORTANT)
    {
      $sort: {
        isEmergency: -1, // 🚨 first
        sortKey: 1, // FIFO
      },
    },

    // 8. Project clean response
    {
      $project: {
        tokenNumber: 1,
        sequenceNumber: 1,
        status: 1,
        isEmergency: 1,
        appointmentDate: 1,
        sortKey: 1,

        paymentStatus: 1,
        paymentMethod: 1,
        isPaid: 1,

        'patient._id': 1,
        'patient.name': 1,
        'patient.phone': 1,
        'patient.age': 1,
        'patient.gender': 1,

        'department._id': 1,
        'department.name': 1,
        'department.prefix': 1,
      },
    },
  ]);

  return tokens;
};

/**
 * Generate next token number for a department.
 * Uses atomic findOneAndUpdate to prevent race conditions.
 */
const getNextTokenNumber = async (hospitalId, departmentId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const counter = await TokenCounter.findOneAndUpdate(
    { hospitalId, departmentId, date: targetDate },
    { $inc: { lastSequence: 1 } },
    { new: true, upsert: true }
  );

  const department = await Department.findById(departmentId).lean();
  if (!department) {
    throw new Error('Department not found');
  }

  const tokenNumber = `${department.prefix}${counter.lastSequence}`;
  return {
    tokenNumber,
    sequenceNumber: counter.lastSequence,
    appointmentDate: targetDate,
  };
};

/**
 * Auto-assign doctor with least queue in the department.
 */
const autoAssignDoctor = async (hospitalId, departmentId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get all available doctors in this department
  const doctors = await Doctor.find({
    hospitalId,
    departmentId,
    isAvailable: true,
  }).lean();

  if (!doctors.length) {
    return null; // No available doctor; token stays unassigned
  }

  // Filter by availability for this specific day of the week
  const dayOfWeek = new Date(targetDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const availableToday = doctors.filter((doctor) =>
    doctor.availability?.some(
      (a) => a.day === dayOfWeek && a.sessions?.length > 0
    )
  );

  if (!availableToday.length) return null;

  // Count waiting + current tokens per doctor for this specific date
  const doctorIds = availableToday.map((d) => d._id);
  const queueCounts = await Token.aggregate([
    {
      $match: {
        hospitalId: hospitalId,
        doctorId: { $in: doctorIds },
        appointmentDate: targetDate,
        status: { $in: ['WAITING', 'CALLED'] },
      },
    },
    {
      $group: {
        _id: '$doctorId',
        count: { $sum: 1 },
      },
    },
  ]);

  // Build a map of doctorId -> count
  const countMap = {};
  queueCounts.forEach((q) => {
    countMap[q._id.toString()] = q.count;
  });

  // Find the doctor with the least queue who hasn't reached maxPerDay
  let minDoctor = null;
  let minCount = Infinity;

  for (const doctor of availableToday) {
    const count = countMap[doctor._id.toString()] || 0;

    // Calculate daily capacity from sessions
    const daySchedule = doctor.availability?.find((a) => a.day === dayOfWeek);
    const maxTokens =
      daySchedule?.sessions?.reduce((sum, s) => sum + (s.maxTokens || 0), 0) ||
      50;

    if (count < maxTokens && count < minCount) {
      minCount = count;
      minDoctor = doctor;
    }
  }

  return minDoctor ? minDoctor._id : null;
};

/**
 * Create a new token
 */
const createToken = async (tokenData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      departmentId,
      hospitalId,
      patientDetails,
      patientId,
      doctorId,
      appointmentDate,
      paymentMethod, // CASH / UPI / CARD
      isEmergency = false,
    } = tokenData;

    // 1. Get Hospital (for timezone)
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) throw new Error('Hospital not found');

    const timeZone = hospital.timezone || 'Asia/Kolkata';

    // 2. Normalize appointment date
    const targetDate = normalizeDate(appointmentDate || new Date(), timeZone);

    // 3. Resolve Patient
    let patient;
    if (patientId) {
      patient = await Patient.findOne({ _id: patientId, hospitalId }).session(
        session
      );
      if (!patient) throw new Error('Patient not found');
    } else if (patientDetails) {
      patient = await resolvePatient(hospitalId, patientDetails); // your existing fn
    } else {
      throw new Error('Patient info required');
    }

    // 4. Resolve Doctor
    let assignedDoctorId = doctorId;

    if (!assignedDoctorId) {
      assignedDoctorId = await autoAssignDoctor(
        hospitalId,
        departmentId,
        targetDate
      );
      if (!assignedDoctorId) {
        throw new Error('No available doctors');
      }
    } else {
      const doctor = await Doctor.findById(assignedDoctorId).lean();
      if (!doctor || !doctor.isAvailable) {
        throw new Error('Doctor not available');
      }

      if (!isEmergency) {
        const dayOfWeek = getDayOfWeek(targetDate, timeZone);

        const daySchedule = doctor.availability?.find(
          (a) => a.day === dayOfWeek
        );

        if (!daySchedule) {
          throw new Error(`Doctor does not work on ${dayOfWeek}`);
        }

        const maxTokens =
          daySchedule.sessions?.reduce(
            (sum, s) => sum + (s.maxTokens || 0),
            0
          ) || 50;

        const currentQueue = await Token.countDocuments({
          hospitalId,
          doctorId: assignedDoctorId,
          appointmentDate: targetDate,
          status: { $in: ['WAITING', 'CALLED'] },
        });

        if (currentQueue >= maxTokens) {
          throw new Error('Doctor capacity full');
        }
      }
    }

    // 5. Generate token number
    const { tokenNumber, sequenceNumber } = await getNextTokenNumber(
      hospitalId,
      departmentId,
      targetDate
    );

    const doctor = await Doctor.findById(assignedDoctorId).lean();

    if (!doctor) throw new Error('Doctor not found');

    const consultationFee = doctor.consultationFee || 0;
    let status = 'PROVISIONAL';
    if (isEmergency) {
      status = 'WAITING'; // skip provisional
    }

    // 7. Create Token
    const token = await Token.create(
      [
        {
          tokenNumber,
          sequenceNumber,
          departmentId,
          doctorId: assignedDoctorId,
          hospitalId,
          appointmentDate: targetDate,
          status: status,
          patientId: patient._id,
          isEmergency,
        },
      ],
      { session }
    );

    let payment = null;

    // 8. Create Payment (if needed)
    if (paymentMethod) {
      payment = await Payment.create(
        [
          {
            hospitalId,
            tokenId: token[0]._id,
            patientId: patient._id,
            doctorId: assignedDoctorId,
            amount: consultationFee || 0,
            method: paymentMethod,
            razorpayOrderId: `order_${token[0]._id}`,
            status: 'pending',
          },
        ],
        { session }
      );

      // // Link payment → token
      // await Token.findByIdAndUpdate(
      //   token[0]._id,
      //   { paymentId: payment[0]._id, status: 'WAITING' },
      //   { session }
      // );
    }

    await session.commitTransaction();
    session.endSession();

    // 9. Populate response
    const populatedToken = await Token.findById(token[0]._id)
      .populate('departmentId', 'name prefix')
      .populate('doctorId', 'name')
      .populate('patientId', 'name phone age gender')
      .lean();

    // 10. Emit socket
    try {
      const {
        broadcastToHospital,
        broadcastKioskQueue,
      } = require('../../socket/socketHandler');

      broadcastToHospital(hospitalId, 'queue-updated', populatedToken);
      broadcastKioskQueue(hospitalId);
    } catch (e) {}

    return {
      token: populatedToken,
      payment: payment ? payment[0] : null,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get current token for a doctor
 */
const getCurrentToken = async (hospitalId, doctorId) => {
  const token = await Token.findOne({
    hospitalId,
    doctorId,
    status: 'CALLED',
  })
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender')
    .lean();

  return token;
};

/**
 * Get all tokens with filters
 */
const getTokens = async (hospitalId, filters = {}) => {
  const match = {
    hospitalId: new mongoose.Types.ObjectId(hospitalId),
  };

  console.log('Filters received in service:', filters, hospitalId);

  // 🔎 Filters
  if (filters.status) {
    const statusArray = filters.status
      .split(',')
      .map((s) => s.trim().toUpperCase());
    match.status = { $in: statusArray };
  }

  if (filters.departmentId) {
    match.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
  }

  if (filters.doctorId) {
    match.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
  }

  const date = filters.appointmentDate || new Date();

  // Create start of day (UTC)
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  // Create end of day (UTC)
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  match.appointmentDate = {
    $gte: start,
    $lte: end,
  };

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 50;
  const skip = (page - 1) * limit;

  // 🔥 Aggregation pipeline
  const pipeline = [
    { $match: match },

    // 🔗 Join payments
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'tokenId',
        as: 'payment',
      },
    },
    {
      $unwind: {
        path: '$payment',
        preserveNullAndEmptyArrays: true,
      },
    },


    // 👥 Populate patient
    {
      $lookup: {
        from: 'patients',
        localField: 'patientId',
        foreignField: '_id',
        as: 'patient',
      },
    },
    { $unwind: '$patient' },

    // 🏥 Populate department
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: '$department' },

    // 👨‍⚕️ Populate doctor
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    {
      $unwind: {
        path: '$doctor',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔀 Sorting
    // 👉 Admin view → latest first
    // 👉 If you want queue view → replace with isEmergency/sortKey
    {
      $sort: { createdAt: -1 },
      // For queue-style:
      // $sort: { isEmergency: -1, sortKey: 1 }
    },

    // 📄 Projection (clean response)
    {
      $project: {
        tokenNumber: 1,
        sequenceNumber: 1,
        status: 1,
        isEmergency: 1,
        appointmentDate: 1,
        createdAt: 1,

        
        'payment.status': 1,
        'payment.method': 1,
        'payment.amount': 1,
        'payment.currency': 1,

        'patient._id': 1,
        'patient.name': 1,
        'patient.phone': 1,
        'patient.age': 1,
        'patient.gender': 1,

        'department._id': 1,
        'department.name': 1,
        'department.prefix': 1,

        'doctor._id': 1,
        'doctor.name': 1,
      },
    },

    // 📄 Pagination
    {
      $facet: {
        tokens: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await Token.aggregate(pipeline);

  const tokens = result[0]?.tokens || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    tokens,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Complete current token for a doctor
 */
const completeToken = async (tokenId, hospitalId, consultationData = {}) => {
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: 'CALLED' },
    { status: 'COMPLETED', completedAt: new Date() },
    { new: true }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  if (!token) {
    throw new Error('Token not found or not currently active');
  }

  // Create a consultation record if data is provided
  if (Object.keys(consultationData).length > 0) {
    await Consultation.create({
      ...consultationData,
      tokenId: token._id,
      patientId: token.patientId._id,
      doctorId: token.doctorId._id,
      hospitalId: hospitalId,
    });
  }

  if (!token) {
    throw new Error('Token not found or not currently active');
  }

  // Emit socket event
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', token);
    broadcastKioskQueue(hospitalId);
  } catch (e) {
    // Socket not initialized yet, skip
  }

  return token;
};

/**
 * Call next token for a doctor.
 * - Completes the current token (if any)
 * - Picks the oldest waiting token assigned to this doctor
 * - Sets it as 'current'
 */
const callNextToken = async (doctorId, hospitalId) => {
  // Complete any current token for this doctor
  await Token.updateMany(
    { doctorId, hospitalId, status: 'CALLED' },
    { status: 'COMPLETED', completedAt: new Date() }
  );

  // Find the next waiting token for this doctor for TODAY.
  const today = new Date().toISOString().split('T')[0];
  const nextToken = await Token.findOneAndUpdate(
    {
      doctorId,
      hospitalId,
      status: 'WAITING',
      appointmentDate: today,
    },
    { status: 'CALLED', calledAt: new Date() },
    {
      new: true,
      sort: { isEmergency: -1, sortKey: 1 },
    }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  if (!nextToken) {
    // Broadcast update even if no more tokens (to clear UI)
    try {
      const {
        broadcastToHospital,
        broadcastKioskQueue,
      } = require('../../socket/socketHandler');
      broadcastToHospital(hospitalId, 'queue-updated', {
        doctorId,
        status: 'EMPTY',
      });
      broadcastKioskQueue(hospitalId);
    } catch (e) {}
    return null;
  }

  // Emit socket event
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', nextToken);
    broadcastKioskQueue(hospitalId);
  } catch (e) {
    // Socket not initialized yet, skip
  }

  return nextToken;
};

const callTokenById = async (tokenId, hospitalId) => {
  // Get token first
  const token = await Token.findById(tokenId);

  if (!token) throw new Error('Token not found');

  const { doctorId } = token;

  // Complete current CALLED token
  await Token.updateMany(
    { doctorId, hospitalId, status: 'CALLED' },
    { status: 'COMPLETED', completedAt: new Date() }
  );

  // Call selected token
  const updatedToken = await Token.findByIdAndUpdate(
    tokenId,
    {
      status: 'CALLED',
      calledAt: new Date(),
    },
    { new: true }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  // 🔊 Emit socket events
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');

    broadcastToHospital(hospitalId, 'queue-updated', updatedToken);
    broadcastKioskQueue(hospitalId);
  } catch (e) {}

  return updatedToken;
};

/**
 * Cancel a token
 */
const cancelToken = async (tokenId, hospitalId) => {
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: { $nin: ['COMPLETED', 'CANCELED'] } },
    { status: 'CANCELED', canceledAt: new Date() },
    { new: true }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  if (!token) {
    throw new Error('Token not found or already completed');
  }

  // Emit socket event
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', token);
    broadcastKioskQueue(hospitalId);
  } catch (e) {
    // skip
  }

  return token;
};

/**
 * Verify cash payment for a provisional token
 */
const verifyCashPayment = async (tokenId, hospitalId) => {
  // 1. Find token (must be PROVISIONAL)
  const token = await Token.findOne({
    _id: tokenId,
    hospitalId,
    status: 'PROVISIONAL',
  });

  if (!token) {
    throw new Error('Token not found or not in PROVISIONAL state');
  }

  // 2. Find payment
  const payment = await Payment.findOne({
    tokenId: token._id,
    hospitalId,
    method: 'CASH',
  });

  if (!payment) {
    throw new Error('Cash payment not found');
  }

  if (payment.status === 'captured') {
    throw new Error('Payment already verified');
  }

  // 3. Update BOTH atomically (recommended)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update payment
    payment.status = 'captured';
    await payment.save({ session });

    // Update token → move to queue
    const updatedToken = await Token.findByIdAndUpdate(
      token._id,
      {
        status: 'WAITING',
        isPaid: true, // optional but useful
      },
      { new: true, session }
    )
      .populate('departmentId', 'name prefix')
      .populate('doctorId', 'name')
      .populate('patientId', 'name phone age gender');

    await session.commitTransaction();
    session.endSession();

    // 4. Emit socket
    try {
      const {
        broadcastToHospital,
        broadcastKioskQueue,
      } = require('../../socket/socketHandler');

      broadcastToHospital(hospitalId, 'queue-updated', updatedToken);
      broadcastKioskQueue(hospitalId);
    } catch (e) {}

    return {
      token: updatedToken,
      payment,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * Skip a token (postpone it)
 * - Changes status from CALLED back to WAITING
 */
const skipToken = async (tokenId, hospitalId, doctorId) => {
  const appointmentDate = new Date().toISOString().split('T')[0];
  // Find the token to be postponed
  const token = await Token.findOne({
    _id: tokenId,
    doctorId,
    hospitalId,
    appointmentDate,
    status: 'CALLED',
  });
  if (!token) throw new Error('Token not found or not in CALLED status');
  console.log('token', token);

  // Find the immediate NEXT patient in the queue (the one who would be called next)
  const nextInQueue = await Token.findOne(
    {
      doctorId: token.doctorId,
      hospitalId,
      status: 'WAITING',
      appointmentDate,
    },
    null,
    { sort: { isEmergency: -1, sortKey: 1 } }
  );
  console.log('next in queue', nextInQueue);
  // Compute the effective sort time of the next patient — fall back to createdAt
  // for legacy tokens that don't have sortKey set yet
  let newSortKey;
  if (nextInQueue) {
    const baseTime = nextInQueue.sortKey
      ? new Date(nextInQueue.sortKey).getTime()
      : new Date(nextInQueue.createdAt).getTime();
    newSortKey = new Date(baseTime + 1); // Slot just after the next patient
  } else {
    // No one else waiting — this patient goes to the front
    newSortKey = new Date();
  }

  const updated = await Token.findByIdAndUpdate(
    tokenId,
    {
      status: 'WAITING',
      calledAt: null,
      isPostponed: true,
      postponedAt: new Date(),
      sortKey: newSortKey,
    },
    { new: true }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  // Emit socket event to update all dashboards
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', updated);
    broadcastKioskQueue(hospitalId);
  } catch (e) {}

  return updated;
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
  callTokenById,
  getDoctorQueue,
};
