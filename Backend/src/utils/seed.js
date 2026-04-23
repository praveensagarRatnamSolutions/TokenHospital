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

    // 2. Create Hospital
    const hospital = await Hospital.create({
      name: 'Anupama Hospital',
      email: 'admin@anupama.com',
      phone: {
        full: '+919876543210',
        countryCode: '+91',
        country: 'IN',
        nationalNumber: '9876543210',
      },
      address: {
        street: 'Main Road',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        country: 'India',
      },
      createdBy: superAdmin._id,
    });

    // 3. Create Departments
    const cardiology = await Department.create({
      name: 'Cardiology',
      prefix: 'CARD',
      hospitalId: hospital._id,
    });

    const pediatrics = await Department.create({
      name: 'Pediatrics',
      prefix: 'PEDS',
      hospitalId: hospital._id,
    });

    // 4. Create Users (Admin & Doctors)
    const adminUser = await User.create({
      name: 'Anupama Admin',
      email: 'admin@anupama.com',
      password: 'password123',
      role: 'ADMIN',
      hospitalId: hospital._id,
    });

    const cardDoctorUser = await User.create({
      name: 'Dr. Smith (Cardiology)',
      email: 'smith@anupama.com',
      password: 'password123',
      role: 'DOCTOR',
      hospitalId: hospital._id,
    });

    const pedsDoctorUser = await User.create({
      name: 'Dr. Jones (Pediatrics)',
      email: 'jones@anupama.com',
      password: 'password123',
      role: 'DOCTOR',
      hospitalId: hospital._id,
    });

    // 5. Create Doctor Profiles
    const cardDoctor = await Doctor.create({
      name: 'Dr. Smith',
      email: 'smith@anupama.com',
      hospitalId: hospital._id,
      departmentId: cardiology._id,
      userId: cardDoctorUser._id,
      isAvailable: true,
      experience: 12,
      consultationFee: 500,
      consultationFee: 500,
      availability: [
        {
          day: 'Monday',
          sessions: [
            {
              label: 'Morning',
              from: '09:00',
              to: '13:00',
              maxTokens: 25,
              breaks: [{ from: '11:00', to: '11:15', label: 'Tea Break' }],
            },
            {
              label: 'Evening',
              from: '14:00',
              to: '18:00',
              maxTokens: 25,
              breaks: [{ from: '16:00', to: '16:15', label: 'Tea Break' }],
            },
          ],
        },
        {
          day: 'Tuesday',
          sessions: [
            {
              label: 'Full Day',
              from: '09:00',
              to: '17:00',
              maxTokens: 50,
              breaks: [{ from: '13:00', to: '14:00', label: 'Lunch Break' }],
            },
          ],
        },
        {
          day: 'Wednesday',
          sessions: [
            {
              label: 'Morning Session',
              from: '09:00',
              to: '13:00',
              maxTokens: 30,
            },
          ],
        },
      ],
    });

    const pedsDoctor = await Doctor.create({
      name: 'Dr. Jones',
      email: 'jones@anupama.com',
      hospitalId: hospital._id,
      departmentId: pediatrics._id,
      userId: pedsDoctorUser._id,
      isAvailable: true,
      experience: 10,
      consultationFee: 400,
      consultationFee: 400,
      availability: [
        {
          day: 'Monday',
          sessions: [
            { label: 'Afternoon', from: '13:00', to: '17:00', maxTokens: 20 },
          ],
        },
        {
          day: 'Thursday',
          sessions: [
            { label: 'Morning', from: '08:00', to: '12:00', maxTokens: 20 },
          ],
        },
      ],
    });

    // Link User records with doctorId
    await User.findByIdAndUpdate(cardDoctorUser._id, {
      doctorId: cardDoctor._id,
    });
    await User.findByIdAndUpdate(pedsDoctorUser._id, {
      doctorId: pedsDoctor._id,
    });

    // 6. Create Patients
    const patientsData = [
      { name: 'Alice Johnson', phone: '1234567890', age: 30, gender: 'Female' },
      { name: 'Bob Smith', phone: '0987654321', age: 45, gender: 'Male' },
      { name: 'Charlie Davis', phone: '1112223333', age: 50, gender: 'Male' },
      { name: 'Diana Prince', phone: '4445556666', age: 28, gender: 'Female' },
      { name: 'Evan Wright', phone: '7778889999', age: 60, gender: 'Male' },
      {
        name: 'Fiona Gallagher',
        phone: '1231231234',
        age: 22,
        gender: 'Female',
      },
      { name: 'George Miller', phone: '3213214321', age: 35, gender: 'Male' },
      { name: 'Hannah Abbott', phone: '5556667777', age: 40, gender: 'Female' },
    ];

    const patients = await Patient.insertMany(
      patientsData.map((p) => ({ ...p, hospitalId: hospital._id }))
    );

    // 7. Create Tokens
    const today = new Date().toISOString().split('T')[0];

    const tokensData = [
      // Cardiology - Dr. Smith (Various states)
      {
        tokenNumber: 'CARD1',
        sequenceNumber: 1,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'COMPLETED',
        patientId: patients[0]._id,
        paymentType: 'DIGITAL',
      },
      {
        tokenNumber: 'CARD2',
        sequenceNumber: 2,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'CALLED',
        patientId: patients[1]._id,
        paymentType: 'CASH',
      },
      {
        tokenNumber: 'CARD3',
        sequenceNumber: 3,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'WAITING',
        patientId: patients[2]._id,
        paymentType: 'DIGITAL',
      },
      {
        tokenNumber: 'CARD4',
        sequenceNumber: 4,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'WAITING',
        patientId: patients[3]._id,
        paymentType: 'CASH',
      },
      {
        tokenNumber: 'CARD5',
        sequenceNumber: 5,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'WAITING',
        patientId: patients[4]._id,
        paymentType: 'DIGITAL',
      },
      {
        tokenNumber: 'CARD6',
        sequenceNumber: 6,
        departmentId: cardiology._id,
        doctorId: cardDoctor._id,
        status: 'PROVISIONAL',
        patientId: patients[5]._id,
        paymentType: 'CASH',
      },

      // Pediatrics - Dr. Jones
      {
        tokenNumber: 'PEDS1',
        sequenceNumber: 1,
        departmentId: pediatrics._id,
        doctorId: pedsDoctor._id,
        status: 'CALLED',
        patientId: patients[6]._id,
        paymentType: 'DIGITAL',
      },
      {
        tokenNumber: 'PEDS2',
        sequenceNumber: 2,
        departmentId: pediatrics._id,
        doctorId: pedsDoctor._id,
        status: 'WAITING',
        patientId: patients[7]._id,
        paymentType: 'CASH',
      },
      {
        tokenNumber: 'PEDS3',
        sequenceNumber: 3,
        departmentId: pediatrics._id,
        doctorId: pedsDoctor._id,
        status: 'PROVISIONAL',
        patientId: patients[0]._id,
        paymentType: 'CASH',
      },
      {
        tokenNumber: 'PEDS4',
        sequenceNumber: 4,
        departmentId: pediatrics._id,
        doctorId: pedsDoctor._id,
        status: 'WAITING',
        patientId: patients[1]._id,
        paymentType: 'DIGITAL',
      },
    ];

    await Token.insertMany(
      tokensData.map((t) => ({
        ...t,
        hospitalId: hospital._id,
        appointmentDate: today,
      }))
    );

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
