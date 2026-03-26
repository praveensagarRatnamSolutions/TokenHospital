const doctorService = require('./doctor.service');
const doctorValidation = require('./doctor.validations');
const authService = require('../auth/auth.service');
const mongoose = require('mongoose');
const logger = require('../../config/logger');
const { getUploadPresignedUrl } = require('../../utils/s3');

/**
 * @desc    Add a new doctor
 * @route   POST /api/doctor
 * @access  Private (Admin)
 */
const createDoctor = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, ...doctorData } = req.body;
    console.log('req.hospitalId785', req.hospitalId);

    // 1. Create User Account
    const user = await authService.createUser(
      {
        name: doctorData.name,
        email,
        password,
        profilePic: doctorData.profilePic,
        role: 'DOCTOR',
        hospitalId: req.hospitalId,
      },
      session
    );

    // 2. Create Doctor Profile
    const { profilePic, ...profileData } = doctorData;
    const doctor = await doctorService.createDoctor(
      {
        ...profileData,
        userId: user._id,
        hospitalId: req.hospitalId,
      },
      { session }
    );

    await doctorService.updateUser(user._id, { doctorId: doctor._id }, session);

    await session.commitTransaction();
    logger.info(`Doctor created with account: ${doctor.name} (${email})`);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    await session.abortTransaction();
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all doctors (with optional department filter)
 * @route   GET /api/doctor
 * @access  Private
 */
const getDoctors = async (req, res, next) => {
  try {
    const filters = {
      departmentId: req.query.departmentId,
      isAvailable: req.query.isAvailable,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await doctorService.getDoctors(req.hospitalId, filters);

    // Flatten profilePic from userId for frontend convenience
    const doctors = result.doctors.map((doc) => ({
      ...doc,
      profilePic: doc.userId?.profilePic || null,
    }));

    res.status(200).json({ success: true, ...result, doctors });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctor/:id
 * @access  Private
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(
      req.params.id,
      req.hospitalId
    );

    // Flatten profilePic from userId
    const flattenedDoctor = {
      ...doctor,
      profilePic: doctor.userId?.profilePic || null,
    };

    res.status(200).json({ success: true, data: flattenedDoctor });
  } catch (error) {
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Update doctor
 * @route   PUT /api/doctor/:id
 * @access  Private (Admin)
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(
      req.params.id,
      req.hospitalId,
      req.body
    );
    logger.info(`Doctor updated: ${doctor.name}`);
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Toggle doctor availability (online/offline)
 * @route   PATCH /api/doctor/:id/status
 * @access  Private (Admin, Doctor)
 */
const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await doctorService.toggleDoctorStatus(
      req.params.id,
      req.hospitalId
    );
    logger.info(
      `Doctor ${doctor.name} status toggled to ${doctor.isAvailable ? 'Available' : 'Unavailable'}`
    );
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Get presigned URL for profile pic upload
 * @route   GET /api/doctor/upload-url
 * @access  Private (Admin, Doctor)
 */
const getPresignedUrl = async (req, res, next) => {
  try {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'fileName and fileType are required',
      });
    }

    const key = `profile/${req.hospitalId}/${Date.now()}-${fileName}`;
    const uploadUrl = await getUploadPresignedUrl(key, fileType);

    res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        key,
        imageUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  toggleDoctorStatus,
  getPresignedUrl,
};
