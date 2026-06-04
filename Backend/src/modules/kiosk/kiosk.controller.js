const kioskService = require('./kiosk.service');
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
      approvalStatus: req.user.role === 'ADMIN' ? 'accepted' : 'pending',
      rejectionReason: '',
    };
    const kiosk = await kioskService.createKiosk(kioskData);
    logger.info(`Kiosk created: ${kiosk.name} (${kiosk.code})`);

    // If created by Doctor, notify admins
    if (req.user.role === 'DOCTOR') {
      notifyAdminsAboutKiosk(req, kiosk);
    }

    res.status(201).json({ success: true, data: kiosk });
  } catch (error) {
    next(error);
  }
};

const getKioskTokenStats = async (req, res, next) => {
  try {
    console.log('Getting kiosk token stats for hospital:', req.hospitalId);
    const stats = await kioskService.getKioskTokenStats(req.hospitalId);
    res.status(200).json({ success: true ,data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get live token queue grouped by department/doctor (Public - for Kiosk displays)
 */
const getKioskTokensByHospital = async (req, res, next) => {
  try {
    const { hospitalId, kioskId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'hospitalId query param is required' });
    }
    const stats = await kioskService.getKioskTokenStats(hospitalId, kioskId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getPublicQueue = async (req, res, next) => {
    try {
      const { hospitalId } = req.params;
      const { kioskId } = req.query;
      const stats = await kioskService.getKioskTokenStats(hospitalId, kioskId);
      res.status(200).json({ success: true, data: stats, lastUpdated: new Date() });
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
    let kiosk = await kioskService.getKiosk({ code: req.params.code });
    if (!kiosk) {
      return res
        .status(404)
        .json({ success: false, message: 'Kiosk not found' });
    }

    // Check if kiosk is approved by admin
    if (kiosk.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'This kiosk is pending administrator approval.',
      });
    } else if (kiosk.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `This kiosk has been rejected by administrator: ${kiosk.rejectionReason || 'No reason specified'}`,
      });
    }

    // Convert to plain object if mongoose document to allow mutation
    if (typeof kiosk.toObject === 'function') {
      kiosk = kiosk.toObject();
    }

    // Only show accepted ads on the kiosk machine side
    if (kiosk.ads) {
      kiosk.ads = kiosk.ads.filter(
        (ad) => ad.adId && ad.adId.approvalStatus === 'accepted'
      );
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

    const Kiosk = require('./kiosk.model');
    const existingKiosk = await Kiosk.findOne(query);
    if (!existingKiosk) {
      return res.status(404).json({ success: false, message: 'Kiosk not found' });
    }

    // Prevent toggling active state on unapproved kiosks
    if (req.body.hasOwnProperty('isActive') && existingKiosk.approvalStatus !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot activate/deactivate unapproved kiosks.' 
      });
    }

    const updateData = { ...req.body };
    if (req.user.role === 'DOCTOR') {
      updateData.approvalStatus = 'pending';
      updateData.rejectionReason = '';
    } else if (req.user.role === 'ADMIN') {
      updateData.approvalStatus = 'accepted';
    }

    const kiosk = await kioskService.updateKiosk(query, updateData);
    if (!kiosk) {
      return res
        .status(404)
        .json({ success: false, message: 'Kiosk not found' });
    }
    logger.info(`Kiosk updated: ${kiosk.name}`);

    // If updated by Doctor, notify admins
    if (req.user.role === 'DOCTOR') {
      notifyAdminsAboutKiosk(req, kiosk);
    }

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

const notifyAdminsAboutKiosk = async (req, kiosk) => {
  try {
    const User = require('../auth/auth.model');
    const admins = await User.find({ hospitalId: req.hospitalId, role: 'ADMIN' });
    const notificationService = require('../notification/notification.service');
    const emailUtil = require('../../utils/email');

    const notificationPromises = admins.map(async (admin) => {
      // Dashboard Notification
      await notificationService.createNotification({
        recipient: admin._id,
        sender: req.user._id,
        hospitalId: req.hospitalId,
        title: 'New Kiosk Review Required',
        message: `Doctor ${req.user.name} has submitted the kiosk "${kiosk.name}" for approval.`,
        type: 'info',
        relatedType: 'Kiosk',
        relatedId: kiosk._id,
      });

      // Email Notification (non-blocking)
      emailUtil.sendApprovalRequestEmail({
        to: admin.email,
        adminName: admin.name,
        doctorName: req.user.name,
        itemName: kiosk.name,
        itemType: 'Kiosk',
      }).catch(err => logger.error(`Error sending email to admin ${admin.email}: ${err.message}`));
    });

    await Promise.all(notificationPromises);
  } catch (err) {
    logger.error(`Error notifying admins about kiosk: ${err.message}`);
  }
};

const reviewKiosk = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid review status' });
    }

    const kiosk = await kioskService.updateKiosk(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { approvalStatus: status, rejectionReason: reason || '' }
    );

    if (!kiosk) {
      return res.status(404).json({ success: false, message: 'Kiosk not found' });
    }

    // Notify the doctor who created it
    if (kiosk.createdBy) {
      const User = require('../auth/auth.model');
      const doctorUser = await User.findById(kiosk.createdBy);
      if (doctorUser) {
        // Create Dashboard Notification
        const notificationService = require('../notification/notification.service');
        await notificationService.createNotification({
          recipient: doctorUser._id,
          sender: req.user._id,
          hospitalId: req.hospitalId,
          title: `Kiosk Review: ${status === 'accepted' ? 'Approved' : 'Rejected'}`,
          message: `Your kiosk config "${kiosk.name}" has been ${status}.${status === 'rejected' ? ` Reason: ${reason}` : ''}`,
          type: status === 'accepted' ? 'success' : 'error',
          relatedType: 'Kiosk',
          relatedId: kiosk._id,
        });

        // Send email (non-blocking)
        const emailUtil = require('../../utils/email');
        emailUtil.sendApprovalResultEmail({
          to: doctorUser.email,
          doctorName: doctorUser.name,
          itemName: kiosk.name,
          itemType: 'Kiosk',
          status,
          reason,
        }).catch(err => logger.error(`Error sending email to doctor: ${err.message}`));
      }
    }

    logger.info(`Kiosk review completed: ${kiosk.name} status is ${status}`);
    res.status(200).json({ success: true, data: kiosk });
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
  getPublicQueue,
  reviewKiosk,
};
