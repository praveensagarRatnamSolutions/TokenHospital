require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/auth/auth.model');
const Hospital = require('../modules/hospital/hospital.model');
const Doctor = require('../modules/doctor/doctor.model');
const Department = require('../modules/department/department.model');
const Token = require('../modules/token/token.model');
const Patient = require('../modules/patient/patient.model');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await Token.deleteMany({});
    await Patient.deleteMany({});

    console.log('Existing data cleared.');

    // 1. Create a Super Admin (to avoid circular dependency for createdBy)
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@system.com',
      password: 'password123',
      role: 'SUPERADMIN',
      // hospitalId is not required for SUPERADMIN per model logic
    });


    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
