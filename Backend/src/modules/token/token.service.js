const Token = require('./token.model');
const Consultation = require('../patient/consultation.model');
const Hospital = require('../hospital/hospital.model');
const Payment = require('../payment/payment.model');
const TokenCounter = require('./tokenCounter.model');
const Department = require('../department/department.model');
const Doctor = require('../doctor/doctor.model');
const Patient = require('../patient/patient.model');
const {
  broadcastToHospital,
  broadcastKioskQueue,
} = require('../../socket/socketHandler');
const { normalizeDate, getDayOfWeek } = require('./token.util');
const { default: mongoose } = require('mongoose');

/**
 * =============================================================================
 * SECTION 1: PATIENT & DATA RESOLUTION
 * =============================================================================
 */

/**
 * Find or create a patient based on phone number.
 */
const resolvePatient = async (hospitalId, patientData) => {
  const { name, phone, age, gender } = patientData;
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
    // Update existing patient if details changed
    let needsUpdate = false;
    if (age && patient.age !== age) { patient.age = age; needsUpdate = true; }
    if (gender && patient.gender !== gender) { patient.gender = gender; needsUpdate = true; }
    if (name && patient.name !== name) { patient.name = name; needsUpdate = true; }
    if (needsUpdate) await patient.save();
  }

  return patient;
};

/**
 * Atomic counter for generating sequence-based token numbers (e.g., A1, A2).
 */
const getNextTokenNumber = async (hospitalId, departmentId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const counter = await TokenCounter.findOneAndUpdate(
    { hospitalId, departmentId, date: targetDate },
    { $inc: { lastSequence: 1 } },
    { new: true, upsert: true }
  );

  const department = await Department.findById(departmentId).lean();
  if (!department) throw new Error('Department not found');

  return {
    tokenNumber: `${department.prefix}${counter.lastSequence}`,
    sequenceNumber: counter.lastSequence,
    appointmentDate: targetDate,
  };
};

/**
 * =============================================================================
 * SECTION 2: QUEUE LOGIC & ASSIGNMENT
 * =============================================================================
 */

/**
 * Load-balances new tokens by assigning them to the doctor with the shortest queue.
 */
const autoAssignDoctor = async (hospitalId, departmentId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Get available doctors for the day
  const doctors = await Doctor.find({ hospitalId, departmentId, isAvailable: true }).lean();
  const availableToday = doctors.filter(d => 
    d.availability?.some(a => a.day === dayOfWeek && a.sessions?.length > 0)
  );

  if (!availableToday.length) return null;

  // 2. Count active queues
  const doctorIds = availableToday.map(d => d._id);
  const queueCounts = await Token.aggregate([
    { $match: { hospitalId, doctorId: { $in: doctorIds }, appointmentDate: targetDate, status: { $in: ['WAITING', 'CALLED'] } } },
    { $group: { _id: '$doctorId', count: { $sum: 1 } } }
  ]);

  const countMap = Object.fromEntries(queueCounts.map(q => [q._id.toString(), q.count]));

  // 3. Find doctor with least load
  let minDoctor = null;
  let minCount = Infinity;

  for (const doctor of availableToday) {
    const count = countMap[doctor._id.toString()] || 0;
    const daySchedule = doctor.availability?.find(a => a.day === dayOfWeek);
    const maxTokens = daySchedule?.sessions?.reduce((sum, s) => sum + (s.maxTokens || 0), 0) || 50;

    if (count < maxTokens && count < minCount) {
      minCount = count;
      minDoctor = doctor;
    }
  }

  return minDoctor ? minDoctor._id : null;
};

/**
 * =============================================================================
 * SECTION 3: TOKEN LIFECYCLE (CREATE, COMPLETE, CANCEL)
 * =============================================================================
 */

const createToken = async (tokenData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { departmentId, hospitalId, patientDetails, patientId, doctorId, appointmentDate, isEmergency = false } = tokenData;
    const method = tokenData.paymentMethod || tokenData.paymentType;

    const hospital = await Hospital.findById(hospitalId).lean();
    const timeZone = hospital?.timezone || 'Asia/Kolkata';
    const targetDate = normalizeDate(appointmentDate || new Date(), timeZone);

    // 1. Resolve Patient
    const patient = patientId 
      ? await Patient.findOne({ _id: patientId, hospitalId }).session(session)
      : await resolvePatient(hospitalId, patientDetails);
    if (!patient) throw new Error('Patient resolution failed');

    // 2. Resolve Doctor
    let assignedDoctorId = doctorId || await autoAssignDoctor(hospitalId, departmentId, targetDate);
    if (!assignedDoctorId) throw new Error('No available doctors');

    // 3. Generation & Capacity Check
    const { tokenNumber, sequenceNumber } = await getNextTokenNumber(hospitalId, departmentId, targetDate);
    
    // 4. Create Token Record
    const [token] = await Token.create([{
      tokenNumber, sequenceNumber, departmentId, hospitalId,
      doctorId: assignedDoctorId, appointmentDate: targetDate,
      status: tokenData.status || (isEmergency ? 'WAITING' : 'PROVISIONAL'),
      patientId: patient._id, isEmergency,
    }], { session });

    // 5. Handle Payment
    let payment = null;
    if (tokenData.existingPaymentId) {
      payment = await Payment.findByIdAndUpdate(tokenData.existingPaymentId, { tokenId: token._id, patientId: patient._id }, { session, new: true });
    } else if (method) {
      const doc = await Doctor.findById(assignedDoctorId).lean();
      payment = (await Payment.create([{
        hospitalId, tokenId: token._id, patientId: patient._id, patientDetails,
        doctorId: assignedDoctorId, departmentId, amount: doc?.consultationFee || 0,
        method: method.toUpperCase(), status: 'pending'
      }], { session }))[0];
    }

    if (payment) await Token.findByIdAndUpdate(token._id, { paymentId: payment._id }, { session });

    await session.commitTransaction();
    session.endSession();

    // 6. Broadcast & Stats
    const populated = await Token.findById(token._id).populate('departmentId doctorId patientId hospitalId').lean();
    if (populated && populated.patientId) {
      populated.patient = populated.patientId;
    }
    broadcastToHospital(hospitalId, 'queue-updated', populated);
    broadcastKioskQueue(hospitalId);

    const waitingCount = await Token.countDocuments({ 
      hospitalId, 
      doctorId: assignedDoctorId, 
      appointmentDate: targetDate, 
      status: 'WAITING', 
      createdAt: { $lt: token.createdAt } 
    });

    return { token: populated, payment, waitingCount };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const completeToken = async (tokenId, hospitalId, consultationData = {}) => {
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: 'CALLED' },
    { status: 'COMPLETED', completedAt: new Date() },
    { new: true }
  ).populate('departmentId doctorId patientId');

  if (!token) throw new Error('Token not found or not currently active');

  if (Object.keys(consultationData).length > 0) {
    await Consultation.create({ ...consultationData, tokenId: token._id, patientId: token.patientId._id, doctorId: token.doctorId._id, hospitalId });
  }

  broadcastToHospital(hospitalId, 'queue-updated', token);
  broadcastKioskQueue(hospitalId);
  return token;
};

const getDoctorQueue = async (hospitalId, doctorId, filters = {}) => {
  const { date, status, limit = 50 } = filters;
  const hospital = await Hospital.findById(hospitalId).lean();
  if (!hospital) throw new Error('Hospital not found');

  const timeZone = hospital.timezone || 'Asia/Kolkata';
  const targetDate = normalizeDate(date || new Date(), timeZone);

  const query = {
    hospitalId,
    doctorId,
    appointmentDate: targetDate,
  };

  // 🔥 Apply status filter if provided (e.g. 'WAITING')
  if (status) {
    query.status = { $in: status.split(',').map(s => s.trim().toUpperCase()) };
  } else {
    // Default to both if no filter provided
    query.status = { $in: ['WAITING', 'CALLED'] };
  }

  const tokens = await Token.find(query)
    .populate('patientId', 'name phone age gender')
    .populate('departmentId', 'name prefix')
    .sort({ isEmergency: -1, sortKey: 1 })
    .limit(parseInt(limit))
    .lean();

  // 🔥 Alias patientId to patient for frontend compatibility
  const mappedTokens = tokens.map(t => ({
    ...t,
    patient: t.patientId
  }));

  return {
    tokens: mappedTokens,
    message: tokens.length === 0 ? "Hi! You have no patients in the queue. Have a great day!" : null
  };
};

/**
 * =============================================================================
 * SECTION 4: CALLING & QUEUE MANAGEMENT
 * =============================================================================
 */

const callNextToken = async (doctorId, hospitalId) => {
  // Clear any existing active token
  await Token.updateMany({ doctorId, hospitalId, status: 'CALLED' }, { status: 'COMPLETED', completedAt: new Date() });

  const today = new Date().toISOString().split('T')[0];
  const nextToken = await Token.findOneAndUpdate(
    { doctorId, hospitalId, status: 'WAITING', appointmentDate: today },
    { status: 'CALLED', calledAt: new Date() },
    { new: true, sort: { isEmergency: -1, sortKey: 1 } }
  ).populate('departmentId doctorId patientId');

  if (nextToken) {
    const tokenObj = nextToken.toObject();
    tokenObj.patient = tokenObj.patientId;
    broadcastToHospital(hospitalId, 'queue-updated', tokenObj);
    broadcastKioskQueue(hospitalId);
    return tokenObj;
  } else {
    broadcastToHospital(hospitalId, 'queue-updated', { doctorId, status: 'EMPTY' });
    broadcastKioskQueue(hospitalId);
    return { 
      data: null, 
      message: "Hi! You have seen all your patients for now. Take a break!" 
    };
  }
};

const callTokenById = async (tokenId, doctorId, hospitalId) => {
  // Clear any existing active token for this doctor
  await Token.updateMany(
    { doctorId, hospitalId, status: 'CALLED' },
    { status: 'COMPLETED', completedAt: new Date() }
  );

  const token = await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: 'WAITING' },
    { status: 'CALLED', calledAt: new Date() },
    { new: true }
  ).populate('departmentId doctorId patientId');

  if (token) {
    const tokenObj = token.toObject();
    tokenObj.patient = tokenObj.patientId;
    broadcastToHospital(hospitalId, 'queue-updated', tokenObj);
    broadcastKioskQueue(hospitalId);
    return tokenObj;
  }
  return null;
};

const skipToken = async (tokenId, hospitalId, doctorId) => {
  const appointmentDate = new Date().toISOString().split('T')[0];
  const token = await Token.findOne({ _id: tokenId, doctorId, hospitalId, appointmentDate, status: 'CALLED' });
  if (!token) throw new Error('Token not found or not in CALLED status');

  const nextInQueue = await Token.findOne({ doctorId, hospitalId, status: 'WAITING', appointmentDate }, null, { sort: { isEmergency: -1, sortKey: 1 } });
  
  // Slot just after the next patient
  const newSortKey = nextInQueue 
    ? new Date(new Date(nextInQueue.sortKey || nextInQueue.createdAt).getTime() + 1)
    : new Date();

  const updated = await Token.findByIdAndUpdate(tokenId, { status: 'WAITING', calledAt: null, isPostponed: true, postponedAt: new Date(), sortKey: newSortKey }, { new: true }).populate('departmentId doctorId patientId');

  broadcastToHospital(hospitalId, 'queue-updated', updated);
  broadcastKioskQueue(hospitalId);
  return updated;
};

/**
 * =============================================================================
 * SECTION 5: ANALYTICS & ADMIN VIEWS
 * =============================================================================
 */

/**
 * Get all tokens with advanced filtering for Admin Panel.
 */
const getTokens = async (hospitalId, filters = {}) => {
  const match = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
  
  if (filters.status) match.status = { $in: filters.status.split(',').map(s => s.trim().toUpperCase()) };
  if (filters.departmentId) match.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
  if (filters.doctorId) match.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
  
  const date = filters.appointmentDate || new Date();
  match.appointmentDate = { $gte: new Date(new Date(date).setUTCHours(0,0,0,0)), $lte: new Date(new Date(date).setUTCHours(23,59,59,999)) };

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;

  const pipeline = [
    { $match: match },
    { $lookup: { from: 'payments', localField: '_id', foreignField: 'tokenId', as: 'payment' } },
    { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'patients', localField: 'patientId', foreignField: '_id', as: 'patient' } },
    { $unwind: '$patient' },
    { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'department' } },
    { $unwind: '$department' },
    { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $sort: filters.isQueue ? { isEmergency: -1, sortKey: 1 } : { createdAt: -1 } },
    { $facet: {
        tokens: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
        summary: [
          { $group: { _id: null, totalCreated: { $sum: 1 }, emergencyCount: { $sum: { $cond: ['$isEmergency', 1, 0] } }, waitingCount: { $sum: { $cond: [{ $eq: ['$status', 'WAITING'] }, 1, 0] } } } }
        ]
    }}
  ];

  const [results] = await Token.aggregate(pipeline);
  return {
    tokens: results.tokens,
    stats: results.summary[0] || { totalCreated: 0, emergencyCount: 0, waitingCount: 0 },
    pagination: { total: results.totalCount[0]?.count || 0, page, limit }
  };
};

/**
 * FIXED: Returns hierarchical queue board (Department -> Doctor -> Tokens).
 * Ensures all departments are visible even if only one doctor has tokens.
 */
const getGlobalQueue = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId).lean();
  const today = normalizeDate(new Date(), hospital?.timezone || 'Asia/Kolkata');

  const pipeline = [
    { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId), appointmentDate: today, status: { $in: ['WAITING', 'CALLED'] } } },
    { $sort: { isEmergency: -1, sortKey: 1 } },
    { $lookup: { from: 'patients', localField: 'patientId', foreignField: '_id', as: 'patient' } },
    { $unwind: '$patient' },
    { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'department' } },
    { $unwind: '$department' },
    // First group by Doctor
    { $group: {
        _id: '$doctorId',
        doctorName: { $first: '$doctor.name' },
        departmentId: { $first: '$department._id' },
        departmentName: { $first: '$department.name' },
        tokens: { $push: '$$ROOT' }
    }},
    // Then group by Department to fix the "one department" issue
    { $group: {
        _id: '$departmentId',
        departmentName: { $first: '$departmentName' },
        doctors: { $push: {
            id: '$_id',
            name: '$doctorName',
            activeToken: { $arrayElemAt: [{ $filter: { input: '$tokens', cond: { $eq: ['$$this.status', 'CALLED'] } } }, 0] },
            waitingTokens: { $filter: { input: '$tokens', cond: { $eq: ['$$this.status', 'WAITING'] } } }
        }}
    }},
    { $sort: { departmentName: 1 } }
  ];

  const departments = await Token.aggregate(pipeline);

  // Flatten departments into a flat queue for the main dashboard view
  const queue = departments.flatMap((dep) =>
    dep.doctors.map((doc) => ({
      _id: doc.id,
      doctorName: doc.name,
      departmentName: dep.departmentName,
      activeToken: doc.activeToken,
      waitingTokens: doc.waitingTokens,
    }))
  );

  return {
    lastUpdated: new Date(),
    departments,
    queue, // Provide flat queue for dashboard
    stats: {
      waitingCount: departments.reduce(
        (acc, dep) =>
          acc +
          dep.doctors.reduce((dAcc, doc) => dAcc + doc.waitingTokens.length, 0),
        0
      ),
      activeCount: departments.reduce(
        (acc, dep) => acc + dep.doctors.filter((doc) => doc.activeToken).length,
        0
      ),
      doctorsOnline: departments.reduce(
        (acc, dep) => acc + dep.doctors.length,
        0
      ),
    },
  };
};

/**
 * Verify cash payment for a provisional token.
 * Moves token from PROVISIONAL to WAITING status.
 */
const verifyCashPayment = async (tokenId, hospitalId) => {
  const token = await Token.findOne({ _id: tokenId, hospitalId, status: 'PROVISIONAL' });
  if (!token) throw new Error('Token not found or not in PROVISIONAL state');

  const payment = await Payment.findOne({ tokenId: token._id, hospitalId, method: 'CASH' });
  if (!payment) throw new Error('Cash payment not found');
  if (payment.status === 'captured') throw new Error('Payment already verified');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    payment.status = 'captured';
    await payment.save({ session });

    const updatedToken = await Token.findByIdAndUpdate(
      token._id,
      { status: 'WAITING', isPaid: true },
      { new: true, session }
    ).populate('departmentId doctorId patientId');

    await session.commitTransaction();
    session.endSession();

    broadcastToHospital(hospitalId, 'queue-updated', updatedToken);
    broadcastKioskQueue(hospitalId);

    return { token: updatedToken, payment };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getCurrentToken = async (hospitalId, doctorId) => {
  const token = await Token.findOne({ hospitalId, doctorId, status: 'CALLED' })
    .populate('departmentId doctorId patientId')
    .lean();
    
  if (token && token.patientId) {
    token.patient = token.patientId;
  }
  return token;
};

const cancelToken = async (tokenId, hospitalId) => {
  return await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId, status: { $nin: ['COMPLETED', 'CANCELED'] } },
    { status: 'CANCELED', canceledAt: new Date() },
    { new: true }
  ).populate('departmentId doctorId patientId');
};

const toggleEmergency = async (tokenId, hospitalId) => {
  const token = await Token.findOne({ _id: tokenId, hospitalId });
  if (token) {
    token.isEmergency = !token.isEmergency;
    await token.save();
  }
  return token;
};

const reassignDoctor = async (tokenId, hospitalId, { doctorId, departmentId }) => {
  return await Token.findOneAndUpdate(
    { _id: tokenId, hospitalId },
    { doctorId, departmentId },
    { new: true }
  );
};

module.exports = {
  createToken,
  getTokens,
  getDoctorQueue,
  getGlobalQueue,
  completeToken,
  callNextToken,
  callTokenById,
  skipToken,
  autoAssignDoctor,
  resolvePatient,
  getNextTokenNumber,
  getCurrentToken,
  cancelToken,
  verifyCashPayment,
  toggleEmergency,
  reassignDoctor,
};
