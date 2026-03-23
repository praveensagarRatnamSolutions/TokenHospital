const Doctor = require('./doctor.model');

const createDoctor = async (doctorData, options = {}) => {
    const doctor = await Doctor.create([doctorData], options);
    return doctor[0];
};


const getDoctors = async (hospitalId, filters = {}) => {
    const query = { hospitalId };

    if (filters.departmentId) {
        query.departmentId = filters.departmentId;
    }
    if (typeof filters.isAvailable !== 'undefined') {
        query.isAvailable = filters.isAvailable;
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
        Doctor.find(query)
            .populate('departmentId', 'name prefix')
            .populate('userId', 'profilePic')
            .skip(skip)
            .limit(limit)
            .lean(),

        Doctor.countDocuments(query),
    ]);

    return {
        doctors,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};

const getDoctorById = async (doctorId, hospitalId) => {
    const doctor = await Doctor.findOne({ _id: doctorId, hospitalId })
        .populate('departmentId', 'name prefix')
        .populate('userId', 'profilePic')
        .lean();

    if (!doctor) {
        throw new Error('Doctor not found');
    }
    return doctor;
};

const updateDoctor = async (doctorId, hospitalId, updateData) => {
    const doctor = await Doctor.findOneAndUpdate(
        { _id: doctorId, hospitalId },
        updateData,
        { new: true, runValidators: true }
    ).populate('departmentId', 'name prefix');

    if (!doctor) {
        throw new Error('Doctor not found');
    }
    return doctor;
};

const toggleDoctorStatus = async (doctorId, hospitalId) => {
    const doctor = await Doctor.findOne({ _id: doctorId, hospitalId });
    if (!doctor) {
        throw new Error('Doctor not found');
    }
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();
    return doctor;
};

module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    toggleDoctorStatus,
};
