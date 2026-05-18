const User = require('./auth.model');
const Hospital = require('../hospital/hospital.model');
const { generateToken } = require('../../utils/jwt');

const mongoose = require('mongoose');

const registerUser = async (userData) => {
  const { name, email, password, hospitalName, phone } = userData;

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      throw new Error('Account already exists with this email');
    }

    // 2. Create Admin (Notice the .session(session) passed to all ops)
    const [admin] = await User.create(
      [
        {
          name,
          email,
          password,
          role: 'ADMIN',
        },
      ],
      { session }
    );

    // 3. Create Hospital with 25-day Free Trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 25);

    const [hospital] = await Hospital.create([{
      name: hospitalName,
      email,
      phone,
      createdBy: admin._id,
      trialEndDate,
      planId: 'PRO', // Give Pro features during trial
      subscriptionStatus: 'TRIAL',
    }], { session });

    // 4. Link hospital to admin
    admin.hospitalId = hospital._id;
    await admin.save({ session });

    // Commit the changes
    await session.commitTransaction();

    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      hospitalId: hospital._id,
      token: generateToken(admin._id, admin.role, hospital._id),
    };
  } catch (error) {
    // If anything fails, undo every change made during this process
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const loginUser = async (email, password) => {
  // Find user and include password for checking
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
      doctorId: user?.doctorId || null,
      token: generateToken(user._id, user.role, user.hospitalId),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

const createUser = async (userData, session = null) => {
  const { name, email, password, role, hospitalId, profilePic } = userData;

  const userExists = await User.findOne({ email }).session(session);
  if (userExists) {
    throw new Error('User with this email already exists');
  }

  const [user] = await User.create(
    [
      {
        name,
        email,
        password,
        role,
        hospitalId,
        profilePic,
      },
    ],
    { session }
  );

  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    user.email = updateData.email;
  }

  if (updateData.name !== undefined) {
    user.name = updateData.name;
  }

  if (updateData.profilePic !== undefined) {
    user.profilePic = updateData.profilePic;
  }

  if (updateData.password) {
    if (!updateData.currentPassword) {
      throw new Error('Current password is required to change password');
    }

    const isMatch = await user.matchPassword(updateData.currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password = updateData.password;
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId,
    doctorId: user.doctorId || null,
    profilePic: user.profilePic,
  };
};

const refreshUserToken = async (refreshToken) => {
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = generateToken(user._id, user.role, user.hospitalId);
    return { accessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  registerUser,
  loginUser,
  createUser,
  refreshUserToken,
  updateUserProfile,
};
