const Token = require('./token.model');
const Consultation = require('../patient/consultation.model');
const TokenCounter = require('./tokenCounter.model');
const Department = require('../department/department.model');
const Doctor = require('../doctor/doctor.model');
const Patient = require('../patient/patient.model');
const {
  getIo,
  broadcastToHospital,
  broadcastKioskQueue,
} = require('../../socket/socketHandler');

/**
 * Resolve/Create Patient
 */
const resolvePatient = async (hospitalId, patientData) => {
  const { name, phone, age, gender } = patientData;

  let patient = await Patient.findOne({ hospitalId, phone });

  if (!patient) {
    patient = await Patient.create({
      name,
      phone,
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
    doctor.availability?.some((a) => a.day === dayOfWeek)
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
    const maxTokens = doctor.tokenConfig?.maxPerDay || 50;

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
  const {
    departmentId,
    hospitalId,
    patientDetails,
    patientId,
    doctorId,
    appointmentDate,
  } = tokenData;
  const targetDate = appointmentDate || new Date().toISOString().split('T')[0];

  // 1. Resolve Patient
  let patient;
  if (patientId) {
    patient = await Patient.findOne({ _id: patientId, hospitalId });
    if (!patient) {
      throw new Error('Patient not found');
    }
  } else if (patientDetails) {
    patient = await resolvePatient(hospitalId, patientDetails);
  } else {
    throw new Error('Either patientId or patientDetails must be provided');
  }

  // 2. Resolve Doctor
  let assignedDoctorId = doctorId || null;
  if (!assignedDoctorId) {
    assignedDoctorId = await autoAssignDoctor(
      hospitalId,
      departmentId,
      targetDate
    );
    if (!assignedDoctorId) {
      throw new Error(
        'No available doctors for this department on the selected date or capacity full'
      );
    }
  } else {
    // Validate specific doctor's availability and capacity
    const doctor = await Doctor.findById(assignedDoctorId).lean();
    if (!doctor || !doctor.isAvailable) throw new Error('Doctor not available');

    const dayOfWeek = new Date(targetDate).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    const hasSchedule = doctor.availability?.some((a) => a.day === dayOfWeek);
    if (!hasSchedule) throw new Error(`Doctor does not work on ${dayOfWeek}s`);

    const currentQueue = await Token.countDocuments({
      hospitalId,
      doctorId: assignedDoctorId,
      appointmentDate: targetDate,
      status: { $in: ['WAITING', 'CALLED'] },
    });

    if (currentQueue >= (doctor.tokenConfig?.maxPerDay || 50)) {
      throw new Error('Doctor has reached maximum token capacity for the day');
    }
  }

  // 3. Generate token number
  const { tokenNumber, sequenceNumber } = await getNextTokenNumber(
    hospitalId,
    departmentId,
    targetDate
  );

  // 4. Create Token
  const status = tokenData.paymentType === 'CASH' ? 'PROVISIONAL' : 'WAITING';

  const token = await Token.create({
    tokenNumber,
    sequenceNumber,
    departmentId,
    doctorId: assignedDoctorId,
    hospitalId,
    appointmentDate: targetDate,
    status,
    paymentType: tokenData.paymentType || 'CASH',
    patientId: patient._id,
    isEmergency: tokenData.isEmergency || false,
  });

  const populatedToken = await Token.findById(token._id)
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender')
    .lean();

  // Emit socket event
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', populatedToken);
    broadcastKioskQueue(hospitalId);
  } catch (e) {
    // Socket not initialized yet, skip
  }

  return populatedToken;
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
  console.log('current token', token);

  return token;
};

/**
 * Get all tokens with filters
 */
const getTokens = async (hospitalId, filters = {}) => {
  const query = { hospitalId };

  if (filters.status) {
    const statusArray = filters.status
      .split(',')
      .map((s) => s.trim().toUpperCase());
    query.status = { $in: statusArray };
  }
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.appointmentDate) query.appointmentDate = filters.appointmentDate;
  else {
    // Default to today if no date filter provided
    query.appointmentDate = new Date().toISOString().split('T')[0];
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [tokens, total] = await Promise.all([
    Token.find(query)
      .populate('departmentId', 'name prefix')
      .populate('doctorId', 'name')
      .populate('patientId', 'name phone age gender')
      // Match the same sort order used in callNextToken
      .sort({ isEmergency: -1, sortKey: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Token.countDocuments(query),
  ]);

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
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: 'PROVISIONAL' },
    { status: 'WAITING' },
    { new: true }
  )
    .populate('departmentId', 'name prefix')
    .populate('doctorId', 'name')
    .populate('patientId', 'name phone age gender');

  if (!token) {
    throw new Error('Token not found or not in PROVISIONAL status');
  }

  // Emit socket event
  try {
    const {
      broadcastToHospital,
      broadcastKioskQueue,
    } = require('../../socket/socketHandler');
    broadcastToHospital(hospitalId, 'queue-updated', token);
    broadcastKioskQueue(hospitalId);
  } catch (e) {}

  return token;
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
};
