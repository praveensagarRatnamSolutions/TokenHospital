const { default: mongoose } = require('mongoose');
const Hospital = require('./hospital.model');
const User = require('../auth/auth.model');
const createHospital = async (hospitalData, createdById) => {
  const { name, email, phone, address, registrationNumber, licenseNumber } =
    hospitalData;

  // Check if hospital with this email already exists
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    throw new Error('Hospital with this email already exists');
  }

  const hospital = await Hospital.create({
    name,
    email,
    phone,
    address,
    registrationNumber,
    licenseNumber,
    createdBy: createdById,
    isActive: true,
  });

  return hospital;
};

const createHospitalBySuperAdmin = async (hospitalData, superAdminId) => {
  const {
    adminName,
    email, // This is the Hospital/Admin email
    password, // You'll need a temporary password for the new Admin
    phone,
    hospitalName,
    address,
    registrationNumber,
    licenseNumber,
  } = hospitalData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if hospital OR admin email already exists
    const existingHospital = await Hospital.findOne({ email }).session(session);
    const existingUser = await User.findOne({ email }).session(session);

    if (existingHospital || existingUser) {
      throw new Error('A hospital or user with this email already exists');
    }

    // 2. Create the Admin User first (without hospitalId initially)
    // We use an array for .create() when using sessions
    const [newAdmin] = await User.create(
      [
        {
          name: `${adminName} Admin`, // Default name
          email,
          password, // Should be hashed by your pre-save hook
          role: 'admin',
        },
      ],
      { session }
    );

    // 3. Create the Hospital
    const [hospital] = await Hospital.create(
      [
        {
          name: hospitalName,
          email,
          phone,
          address,
          registrationNumber,
          licenseNumber,
          createdBy: superAdminId, // Track that a Super Admin created this
          isActive: true,
        },
      ],
      { session }
    );

    // 4. Link the Admin to the Hospital
    newAdmin.hospitalId = hospital._id;
    await newAdmin.save({ session });

    await session.commitTransaction();

    return {
      hospital,
      adminId: newAdmin._id,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllHospitals = async (filters = {}) => {
  const query = { ...filters };
  const hospitals = await Hospital.find(query)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });
  return hospitals;
};

const getHospitalById = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId).populate(
    'createdBy',
    'name email role'
  );
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  return hospital;
};

const updateHospital = async (hospitalId, updateData) => {
  const hospital = await Hospital.findByIdAndUpdate(hospitalId, updateData, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email role');

  if (!hospital) {
    throw new Error('Hospital not found');
  }

  return hospital;
};

const deleteHospital = async (hospitalId) => {
  const hospital = await Hospital.findByIdAndDelete(hospitalId);
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  return hospital;
};

const deactivateHospital = async (hospitalId) => {
  return await updateHospital(hospitalId, { isActive: false });
};

const activateHospital = async (hospitalId) => {
  return await updateHospital(hospitalId, { isActive: true });
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  deactivateHospital,
  activateHospital,
  createHospitalBySuperAdmin,
};
