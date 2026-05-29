const User = require('./auth.model');
const Hospital = require('../hospital/hospital.model');
const HospitalSubscription = require('../subscription/hospitalSubscription.model');
const Plan = require('../subscription/plan.model');
const { generateToken } = require('../../utils/jwt');

const mongoose = require('mongoose');
const WalletService = require('../wallet/wallet.service');

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('Account already exists with this email');
  }

  // 2. Create Admin
  const admin = await User.create({
    name,
    email,
    password,
    role: 'ADMIN',
  });

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    hospitalId: null,
    token: generateToken(admin._id, admin.role, null),
  };
};

const onboardUser = async (onboardData, userId) => {
  const {
    hospitalName,
    phone,
    address,
    registrationNumber,
    licenseNumber,
    gstNumber,
    logo,
  } = onboardData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify user exists and doesn't already have a hospital
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.hospitalId) {
      throw new Error('User is already onboarded and linked to a hospital');
    }

    // 2. Check if a hospital already exists by email
    const hospitalEmailExists = await Hospital.findOne({
      email: user.email,
    }).session(session);
    if (hospitalEmailExists) {
      throw new Error('A clinic with this email address is already registered');
    }

    // 3. Check if hospital already exists by phone
    if (phone && phone.full) {
      const hospitalPhoneExists = await Hospital.findOne({
        'phone.full': phone.full,
      }).session(session);
      if (hospitalPhoneExists) {
        throw new Error(
          'This phone number is already registered to another clinic'
        );
      }
    }

    // 4. Create the Hospital
    const [hospital] = await Hospital.create(
      [
        {
          name: hospitalName,
          email: user.email,
          phone,
          address,
          registrationNumber,
          licenseNumber,
          gstNumber,
          logo,
          createdBy: user._id,
          isActive: true,
        },
      ],
      { session }
    );

    // 5. Create matching HospitalSubscription record with the standard trial period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days initial period

    const subscription = await HospitalSubscription.create(
      [
        {
          hospitalId: hospital._id,
          planId: 'FREE',
          billingCycle: 'MONTHLY',
          status: 'TRIAL',
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          trialStart: startDate,
          trialEnd: endDate,
        },
      ],
      { session }
    );

    const plan = await Plan.findOne({ planId: 'FREE', isActive: true }).session(
      session
    );
    if (plan?.limits) {
      if (plan.limits.freeSmsUnits > 0) {
        await WalletService.creditWallet(
          hospital._id,
          'SMS',
          plan.limits.freeSmsUnits,
          `Free credits from ${plan.name} onboarding trial`,
          'SUBSCRIPTION_RENEWAL',
          subscription._id,
          session
        );
      }
      if (plan.limits.freeEmailUnits > 0) {
        await WalletService.creditWallet(
          hospital._id,
          'EMAIL',
          plan.limits.freeEmailUnits,
          `Free credits from ${plan.name} onboarding trial`,
          'SUBSCRIPTION_RENEWAL',
          subscription._id,
          session
        );
      }
    }

    // 6. Link hospital to user
    user.hospitalId = hospital._id;
    await user.save({ session });

    await session.commitTransaction();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: hospital._id,
      token: generateToken(user._id, user.role, hospital._id),
    };
  } catch (error) {
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
  onboardUser,
  loginUser,
  createUser,
  refreshUserToken,
  updateUserProfile,
};
