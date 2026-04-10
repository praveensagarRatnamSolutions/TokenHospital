const kioskService = require('./kiosk.service');
const departmentService = require('../department/department.service');
const doctorController = require('../doctor/doctor.controller');
const tokenController = require('../token/token.controller');
const logger = require('../../config/logger');

/**
 * @desc Create a new kiosk
 */
const createKiosk = async (req, res, next) => {
  try {
    const kioskData = {
      ...req.body,
      hospitalId: req.hospitalId,
      createdBy: req.user._id,
    };
    const kiosk = await kioskService.createKiosk(kioskData);
    logger.info(`Kiosk created: ${kiosk.name} (${kiosk.code})`);
    res.status(201).json({ success: true, data: kiosk });
  } catch (error) {
    next(error);
  }
};

const getKioskTokenStats = async (req, res, next) => {
  try {
    console.log('Getting kiosk token stats for hospital:', req.hospitalId);
    const stats = await kioskService.getKioskTokenStats(req.hospitalId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get live token queue grouped by department/doctor (Public - for Kiosk displays)
 */
const getKioskTokensByHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'hospitalId query param is required',
      });
    }
    const stats = await kioskService.getKioskTokenStats(hospitalId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all kiosks for hospital (Admin sees all, Doctor sees own)
 */
const getKiosks = async (req, res, next) => {
  try {
    const filters = {};
    console.log('req.doctor._id456', req.user.doctorId);

    if (req.user.role === 'DOCTOR') {
      filters.$or = [
        { doctorIds: req.user.doctorId },
        { createdBy: req.user._id },
      ];
    }
    const kiosks = await kioskService.getKiosks(req.hospitalId, filters);
    res.status(200).json({ success: true, count: kiosks.length, data: kiosks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get kiosk by ID
 */
const getKioskById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, hospitalId: req.hospitalId };
    if (req.user.role === 'DOCTOR') {
      query.createdBy = req.user._id;
    }
    const kiosk = await kioskService.getKiosk(query);
    if (!kiosk) {
      return res
        .status(404)
        .json({ success: false, message: 'Kiosk not found' });
    }
    res.status(200).json({ success: true, data: kiosk });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get kiosk config by code (Public)
 */
const getKioskByCode = async (req, res, next) => {
  try {
    const kiosk = await kioskService.getKiosk({ code: req.params.code });
    if (!kiosk) {
      return res
        .status(404)
        .json({ success: false, message: 'Kiosk not found' });
    }
    res.status(200).json({ success: true, data: kiosk });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a kiosk
 */
const updateKiosk = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, hospitalId: req.hospitalId };
    if (req.user.role === 'DOCTOR') {
      query.createdBy = req.user._id;
    }

    // Logic: If updating ads, verify doctor owns those ads
    if (req.body.ads && req.user.role === 'DOCTOR') {
      // This could be a complex check, for now we assume they only use their own ads
      // but ideally we should validate the adId belongs to the doctor.
      // For now, let's keep it simple or implement a quick check.
    }

    const kiosk = await kioskService.updateKiosk(query, req.body);
    if (!kiosk) {
      return res
        .status(404)
        .json({ success: false, message: 'Kiosk not found' });
    }
    logger.info(`Kiosk updated: ${kiosk.name}`);
    res.status(200).json({ success: true, data: kiosk });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a kiosk
 */
const deleteKiosk = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, hospitalId: req.hospitalId };
    if (req.user.role === 'DOCTOR') {
      query.createdBy = req.user._id;
    }
    const result = await kioskService.deleteKiosk(query);
    logger.info(`Kiosk deleted: ${req.params.id}`);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'Kiosk not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc Login in kiosk
 */

const loginIntoKiosk = async (req, res, next) => {
  try {
    const data = await kioskService.loginKiosk({
      code: req.body?.kioskId,
      password: req.body?.password,
    });
    res.status(200).json({ data, success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Refresh token
 */

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    const token = await kioskService.refreshKioskToken(refreshToken);
    res.status(200).json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Kiosk ads
 */

const getKioskAds = async (req, res, next) => {
  try {
    const data = await kioskService.getKioskAds(req);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getKioskTokens = async (req, res, next) => {
  try {
    const data = await kioskService.getKioskDisplayData(req);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartments(req.kiosk.hid);
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    req.hospitalId = req.kiosk.hid;
    await doctorController.getDoctors(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createToken = async (req, res, next) => {
  try {
    req.hospitalId = req.kiosk.hid;
    tokenController.createToken(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createKiosk,
  getKiosks,
  getKioskById,
  getKioskByCode,
  updateKiosk,
  deleteKiosk,
  getKioskTokenStats,
  getKioskTokensByHospital,
  loginIntoKiosk,
  refreshToken,
  getKioskAds,
  getKioskTokens,
  getDepartments,
  getDoctors,
  createToken,
};
