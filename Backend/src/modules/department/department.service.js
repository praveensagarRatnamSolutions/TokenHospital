const Department = require('./department.model');
const Hospital = require('../hospital/hospital.model');
const { getHospitalLimits, isSubscriptionValid } = require('../hospital/subscription.utils');

const createDepartment = async (departmentData) => {
    const { hospitalId } = departmentData;

    // Hospital check for data integrity
    const hospitalExists = await Hospital.exists({ _id: hospitalId });
    if (!hospitalExists) throw new Error('Hospital not found');

    const department = await Department.create(departmentData);
    return department;
};

const getDepartments = async (hospitalId) => {
    const departments = await Department.find({ hospitalId }).lean();
    return departments;
};

const getDepartmentById = async (departmentId, hospitalId) => {
    const department = await Department.findOne({ _id: departmentId, hospitalId }).lean();
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
};

const updateDepartment = async (departmentId, hospitalId, updateData) => {
    const department = await Department.findOneAndUpdate(
        { _id: departmentId, hospitalId },
        updateData,
        { new: true, runValidators: true }
    );
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
};
