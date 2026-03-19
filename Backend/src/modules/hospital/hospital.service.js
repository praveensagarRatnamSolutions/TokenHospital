const Hospital = require("./hospital.model");

const createHospital = async (hospitalData, createdById) => {
  const { name, email, phone, address, registrationNumber, licenseNumber } =
    hospitalData;

  // Check if hospital with this email already exists
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    throw new Error("Hospital with this email already exists");
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

const getAllHospitals = async (filters = {}) => {
  const query = { ...filters };
  const hospitals = await Hospital.find(query)
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
  return hospitals;
};

const getHospitalById = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId).populate(
    "createdBy",
    "name email role",
  );
  if (!hospital) {
    throw new Error("Hospital not found");
  }
  return hospital;
};

const updateHospital = async (hospitalId, updateData) => {
  const hospital = await Hospital.findByIdAndUpdate(hospitalId, updateData, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email role");

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  return hospital;
};

const deleteHospital = async (hospitalId) => {
  const hospital = await Hospital.findByIdAndDelete(hospitalId);
  if (!hospital) {
    throw new Error("Hospital not found");
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
};
