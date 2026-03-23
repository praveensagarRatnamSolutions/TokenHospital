const { body, param, query, validationResult } = require('express-validator');
const path = require('path');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// Define allowed extensions for security
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.mov', '.webm'];

const createAdValidation = [
    body('title')
        .notEmpty().withMessage('Ad title is required')
        .trim()
        .isLength({ max: 100 }).escape(),

    body('type')
        .isIn(['image', 'video']).withMessage('Type must be image or video'),

    body('fileName')
        .notEmpty().withMessage('File name is required')
        .trim()
        // Sec: Check for valid extensions using custom logic
        .custom((value, { req }) => {
            const ext = path.extname(value).toLowerCase();
            const type = req.body.type;

            if (type === 'image' && !ALLOWED_IMAGE_EXTS.includes(ext)) {
                throw new Error(`Invalid image extension. Allowed: ${ALLOWED_IMAGE_EXTS.join(', ')}`);
            }
            if (type === 'video' && !ALLOWED_VIDEO_EXTS.includes(ext)) {
                throw new Error(`Invalid video extension. Allowed: ${ALLOWED_VIDEO_EXTS.join(', ')}`);
            }
            return true;
        }),

    body('duration')
        .notEmpty().withMessage('Duration is required')
        .isInt({ min: 1, max: 3600 }),

    body('displayArea')
        .optional()
        .isIn(['carousel', 'fullscreen']),

    body('hospitalId')
        .optional().isMongoId().withMessage('Invalid Hospital ID'),

    body('departmentId')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Invalid Department ID'),

    body('priority')
        .optional()
        .isInt({ min: 0, max: 100 }),
    
    validate 
];

const updateAdValidation = [
    param('id').isMongoId().withMessage('Invalid Ad ID'),
    body('title').optional().trim().isLength({ max: 100 }).escape(),
    body('duration').optional().isInt({ min: 1, max: 3600 }),
    body('displayArea').optional().isIn(['carousel', 'fullscreen']),
    body('priority').optional().isInt({ min: 0, max: 100 }),
    body('isActive').optional().isBoolean(),
    validate
];

const getActiveValidation = [
    query('hospitalId').optional().isMongoId(),
    query('departmentId').optional({ checkFalsy: true }).isMongoId(),
    validate
];

module.exports = {
    createAdValidation,
    updateAdValidation,
    getActiveValidation
};