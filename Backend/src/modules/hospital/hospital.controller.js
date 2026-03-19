const hospitalService = require("./hospital.service");

const createHospital = async (req, res) => {
  try {
    const hospital = await hospitalService.createHospitalBySuperAdmin(
      req.body,
      req.user._id,
    );
    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    const hospitals = await hospitalService.getAllHospitals(filters);
    res.status(200).json({
      success: true,
      message: "Hospitals retrieved successfully",
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await hospitalService.getHospitalById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hospital retrieved successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateHospital = async (req, res) => {
  try {
    const hospital = await hospitalService.updateHospital(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteHospital = async (req, res) => {
  try {
    await hospitalService.deleteHospital(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deactivateHospital = async (req, res) => {
  try {
    const hospital = await hospitalService.deactivateHospital(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hospital deactivated successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const activateHospital = async (req, res) => {
  try {
    const hospital = await hospitalService.activateHospital(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hospital activated successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
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
