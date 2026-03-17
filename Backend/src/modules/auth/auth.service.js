const User = require('./auth.model');
const { generateToken } = require('../../utils/jwt');

const registerUser = async (userData) => {
    const { name, email, password, role, hospitalId } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists with this email');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        hospitalId,
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
            token: generateToken(user._id, user.role, user.hospitalId),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const loginUser = async (email, password) => {
    // Find user and include password for checking
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
            token: generateToken(user._id, user.role, user.hospitalId),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

module.exports = {
    registerUser,
    loginUser,
};
