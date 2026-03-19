const { check } = require('express-validator');

const createAdValidation = [
    check('title', 'Ad title is required').not().isEmpty().trim(),
    // check('type', 'Type must be image or video').isIn(['image', 'video']),
    check('fileName', 'File name is required for S3 key generation').not().isEmpty(),
    check('displayArea', 'Display area must be carousel or fullscreen').optional().isIn(['carousel', 'fullscreen']),
    check('startTime', 'Start time is required').not().optional().isISO8601(),
    check('endTime', 'End time is required').not().optional().isISO8601(),
    check('priority', 'Priority must be a number').optional().isNumeric(),
    check('departmentId', 'Department ID must be valid').optional().isMongoId(),
];

const updateAdValidation = [
    check('title').optional().trim(),
    check('displayArea').optional().isIn(['carousel', 'fullscreen']),
    check('startTime').optional().isISO8601(),
    check('endTime').optional().isISO8601(),
    check('priority').optional().isNumeric(),
    check('isActive').optional().isBoolean(),
];

module.exports = {
    createAdValidation,
    updateAdValidation,
};
