const Department = require('./department.model');

const createDepartment = async (departmentData) => {
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
