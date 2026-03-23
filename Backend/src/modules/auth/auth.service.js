const User = require('./auth.model');
const Hospital = require('../hospital/hospital.model');
const { generateToken } = require('../../utils/jwt');

const mongoose = require("mongoose");

const registerUser = async (userData) => {
  const { name, email, password, hospitalName, phone } = userData;

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      throw new Error("Account already exists with this email");
    }

    // 2. Create Admin (Notice the .session(session) passed to all ops)
    const [admin] = await User.create([{
      name,
      email,
      password,
      role: "admin",
    }], { session });

    // 3. Create Hospital
    const [hospital] = await Hospital.create([{
      name: hospitalName,
      email,
      phone,
      createdBy: admin._id,
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
        throw new Error("User with this email already exists");
    }

    const [user] = await User.create([{
        name,
        email,
        password,
        role,
        hospitalId,
        profilePic
    }], { session });

    return user;
};


module.exports = {
    registerUser,
    loginUser,
    createUser,
};

