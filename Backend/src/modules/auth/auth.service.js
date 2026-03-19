const User = require('./auth.model');
const Hospital = require('../hospital/hospital.model');
const { generateToken } = require('../../utils/jwt');

const registerUser = async (userData) => {
  const { name, email, password, hospitalName, phone } = userData;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Account already exists with this email");
  }

  // 2. Create Admin (no hospitalId yet)
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin", // ✅ force admin
  });

  // 3. Create Hospital (tenant)
  const hospital = await Hospital.create({
    name: hospitalName,
    email,
    phone,
    createdBy: admin._id,
  });

  // 4. Link hospital to admin
  admin.hospitalId = hospital._id;
  await admin.save();

  // 5. Return response
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    hospitalId: hospital._id,
    token: generateToken(admin._id, admin.role, hospital._id),
  };
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

module.exports = {
    registerUser,
    loginUser,
};
