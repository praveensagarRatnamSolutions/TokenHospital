const Token = require('./token.model');
const TokenCounter = require('./tokenCounter.model');
const Department = require('../department/department.model');
const Doctor = require('../doctor/doctor.model');
const { getIo } = require('../../socket/socketHandler');

/**
 * Generate next token number for a department.
 * Uses atomic findOneAndUpdate to prevent race conditions.
 */
const getNextTokenNumber = async (hospitalId, departmentId) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const counter = await TokenCounter.findOneAndUpdate(
        { hospitalId, departmentId, date: today },
        { $inc: { lastSequence: 1 } },
        { new: true, upsert: true }
    );

    const department = await Department.findById(departmentId).lean();
    if (!department) {
        throw new Error('Department not found');
    }

    const tokenNumber = `${department.prefix}${counter.lastSequence}`;
    return { tokenNumber, sequenceNumber: counter.lastSequence };
};

/**
 * Auto-assign doctor with least queue in the department.
 */
const autoAssignDoctor = async (hospitalId, departmentId) => {
    // Get all available doctors in this department
    const doctors = await Doctor.find({
        hospitalId,
        departmentId,
        isAvailable: true,
    }).lean();

    if (!doctors.length) {
        return null; // No available doctor; token stays unassigned
    }

    // Count waiting + current tokens per doctor
    const doctorIds = doctors.map((d) => d._id);
    const queueCounts = await Token.aggregate([
        {
            $match: {
                hospitalId: hospitalId,
                doctorId: { $in: doctorIds },
                status: { $in: ['waiting', 'current'] },
            },
        },
        {
            $group: {
                _id: '$doctorId',
                count: { $sum: 1 },
            },
        },
    ]);

    // Build a map of doctorId -> count
    const countMap = {};
    queueCounts.forEach((q) => {
        countMap[q._id.toString()] = q.count;
    });

    // Find the doctor with the least queue
    let minDoctor = doctors[0];
    let minCount = countMap[minDoctor._id.toString()] || 0;

    for (const doctor of doctors) {
        const count = countMap[doctor._id.toString()] || 0;
        if (count < minCount) {
            minCount = count;
            minDoctor = doctor;
        }
    }

    return minDoctor._id;
};

/**
 * Create a new token
 */
const createToken = async (tokenData) => {
    const { departmentId, hospitalId, patientDetails, doctorId } = tokenData;

    // Generate token number
    const { tokenNumber, sequenceNumber } = await getNextTokenNumber(hospitalId, departmentId);

    // Auto-assign doctor if not specified
    let assignedDoctorId = doctorId || null;
    if (!assignedDoctorId) {
        assignedDoctorId = await autoAssignDoctor(hospitalId, departmentId);
    }

    const token = await Token.create({
        tokenNumber,
        sequenceNumber,
        departmentId,
        doctorId: assignedDoctorId,
        hospitalId,
        status: 'waiting',
        patientDetails,
    });

    const populatedToken = await Token.findById(token._id)
        .populate('departmentId', 'name prefix')
        .populate('doctorId', 'name')
        .lean();

    // Emit socket event
    try {
        const io = getIo();
        io.emit('tokenCreated', populatedToken);
    } catch (e) {
        // Socket not initialized yet, skip
    }

    return populatedToken;
};

/**
 * Get current token for a doctor
 */
const getCurrentToken = async (hospitalId, doctorId) => {
    const token = await Token.findOne({
        hospitalId,
        doctorId,
        status: 'current',
    })
        .populate('departmentId', 'name prefix')
        .populate('doctorId', 'name')
        .lean();

    return token;
};

/**
 * Get all tokens with filters
 */
const getTokens = async (hospitalId, filters = {}) => {
    const query = { hospitalId };

    if (filters.status) query.status = filters.status;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.doctorId) query.doctorId = filters.doctorId;

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
        Token.find(query)
            .populate('departmentId', 'name prefix')
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Token.countDocuments(query),
    ]);

    return {
        tokens,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Complete current token for a doctor
 */
const completeToken = async (tokenId, hospitalId) => {
    const token = await Token.findOneAndUpdate(
        { _id: tokenId, hospitalId, status: 'current' },
        { status: 'completed', completedAt: new Date() },
        { new: true }
    )
        .populate('departmentId', 'name prefix')
        .populate('doctorId', 'name');

    if (!token) {
        throw new Error('Token not found or not currently active');
    }

    // Emit socket event
    try {
        const io = getIo();
        io.emit('tokenCompleted', token);
    } catch (e) {
        // Socket not initialized yet, skip
    }

    return token;
};

/**
 * Call next token for a doctor.
 * - Completes the current token (if any)
 * - Picks the oldest waiting token assigned to this doctor
 * - Sets it as 'current'
 */
const callNextToken = async (doctorId, hospitalId) => {
    // Complete any current token for this doctor
    await Token.updateMany(
        { doctorId, hospitalId, status: 'current' },
        { status: 'completed', completedAt: new Date() }
    );

    // Find the oldest waiting token for this doctor
    const nextToken = await Token.findOneAndUpdate(
        { doctorId, hospitalId, status: 'waiting' },
        { status: 'current', calledAt: new Date() },
        { new: true, sort: { createdAt: 1 } }
    )
        .populate('departmentId', 'name prefix')
        .populate('doctorId', 'name');

    if (!nextToken) {
        return null; // No more tokens in queue
    }

    // Emit socket event
    try {
        const io = getIo();
        io.emit('tokenUpdated', nextToken);
    } catch (e) {
        // Socket not initialized yet, skip
    }

    return nextToken;
};

module.exports = {
    createToken,
    getCurrentToken,
    getTokens,
    completeToken,
    callNextToken,
};
