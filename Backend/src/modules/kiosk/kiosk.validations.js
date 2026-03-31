const { check } = require('express-validator');

const createKioskValidation = [
  check('name', 'Kiosk name is required').not().isEmpty().trim(),
  check('code', 'Kiosk code is required').not().isEmpty().trim().toUpperCase(),
  check('hospitalId', 'Hospital ID is required').not().isEmpty().isMongoId(),
  check('locationType', 'Invalid location type')
    .optional()
    .isIn(['reception', 'waiting_area', 'doctor_room', 'general']),
  check('departmentIds', 'Department IDs must be an array of Mongo IDs')
    .optional()
    .isArray(),
  check('departmentIds.*', 'Invalid Department ID').optional().isMongoId(),
  check('doctorIds', 'Doctor IDs must be an array of Mongo IDs')
    .optional()
    .isArray(),
  check('doctorIds.*', 'Invalid Doctor ID').optional().isMongoId(),
];

const updateKioskValidation = [
  check('name', 'Kiosk name is required').optional().not().isEmpty().trim(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
  check('locationType', 'Invalid location type')
    .optional()
    .isIn(['reception', 'waiting_area', 'doctor_room', 'general']),
  check('ads', 'Ads playlist must be an array').optional().isArray(),
  check('ads.*.adId', 'Invalid Ad ID').optional().isMongoId(),
  check('ads.*.order', 'Order must be a number').optional().isNumeric(),
];

module.exports = {
  createKioskValidation,
  updateKioskValidation,
};
