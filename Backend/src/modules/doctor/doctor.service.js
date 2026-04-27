const Doctor = require('./doctor.model');
const User = require('../auth/auth.model');
const Token = require('../token/token.model');

const createDoctor = async (doctorData, options = {}) => {
  const doctor = await Doctor.create([doctorData], options);
  return doctor[0];
};

const updateUser = async (userId, updateData, session) => {
  return User.findByIdAndUpdate(userId, updateData, { new: true, session });
};

const getDoctors = async (hospitalId, filters = {}) => {
  const query = { hospitalId };

  if (filters.departmentId) {
    query.departmentId = filters.departmentId;
  }
  if (typeof filters.isAvailable !== 'undefined') {
    query.isAvailable = filters.isAvailable;
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(query)
      .populate('departmentId', 'name prefix')
      .populate('userId', 'profilePic')
      .skip(skip)
      .limit(limit)
      .lean(),

    Doctor.countDocuments(query),
  ]);

  return {
    doctors,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDoctorById = async (doctorId, hospitalId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, hospitalId })
    .populate('departmentId', 'name prefix')
    .populate('userId', 'profilePic email')
    .lean();

  if (!doctor) {
    throw new Error('Doctor not found');
  }
  return doctor;
};

const updateDoctor = async (doctorId, hospitalId, updateData) => {
  // Extract user-related fields
  const userUpdateFields = {};
  if (updateData.email) userUpdateFields.email = updateData.email;
  if (updateData.profilePic)
    userUpdateFields.profilePic = updateData.profilePic;

  // Remove them from doctor update payload
  delete updateData.email;
  delete updateData.profilePic;

  // Update Doctor
  const doctor = await Doctor.findOneAndUpdate(
    { _id: doctorId, hospitalId },
    updateData,
    { new: true, runValidators: true }
  ).populate('departmentId', 'name prefix');

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Update User (if needed)
  if (Object.keys(userUpdateFields).length > 0) {
    await User.findOneAndUpdate(
      { doctorId: doctorId },
      userUpdateFields,
      { new: true, runValidators: true }
    );
  }

  return doctor;
};

const toggleDoctorStatus = async (doctorId, hospitalId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, hospitalId });
  if (!doctor) {
    throw new Error('Doctor not found');
  }
  doctor.isAvailable = !doctor.isAvailable;
  await doctor.save();
  return doctor;
};

const getDoctorStats = async (doctorId, hospitalId) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Total patients seen today
  const totalSeenToday = await Token.countDocuments({
    doctorId,
    hospitalId,
    status: 'COMPLETED',
    appointmentDate: today,
  });

  // 2. Average consultation time for today
  const completedTokensToday = await Token.find({
    doctorId,
    hospitalId,
    status: 'COMPLETED',
    appointmentDate: today,
    calledAt: { $exists: true },
    completedAt: { $exists: true },
  }).lean();

  let avgConsultationTime = 0;
  if (completedTokensToday.length > 0) {
    const totalTime = completedTokensToday.reduce((acc, t) => {
      const duration = new Date(t.completedAt) - new Date(t.calledAt);
      return acc + duration;
    }, 0);
    avgConsultationTime = Math.round(
      totalTime / completedTokensToday.length / 60000
    ); // In minutes
  }

  // 3. Waiting tokens currently
  const currentWaiting = await Token.countDocuments({
    doctorId,
    hospitalId,
    status: 'WAITING',
    appointmentDate: today,
  });

  return {
    totalSeenToday,
    avgConsultationTime,
    currentWaiting,
  };
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  toggleDoctorStatus,
  getDoctorStats,
  updateUser,
};
