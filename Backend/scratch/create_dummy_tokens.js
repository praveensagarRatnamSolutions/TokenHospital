const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/modules/auth/auth.model');
const Doctor = require('../src/modules/doctor/doctor.model');
const Token = require('../src/modules/token/token.model');
const TokenCounter = require('../src/modules/token/tokenCounter.model');
const Department = require('../src/modules/department/department.model');
const Patient = require('../src/modules/patient/patient.model');

const MONGO_URI = process.env.MONGO_URI;

const createDummyTokens = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const doctorEmail = 'jones@anupama.com';
        const user = await User.findOne({ email: doctorEmail });

        if (!user) {
            console.error(`User with email ${doctorEmail} not found`);
            return;
        }

        if (!user.doctorId) {
            console.error(`User ${doctorEmail} is not associated with a doctor`);
            return;
        }

        const doctor = await Doctor.findById(user.doctorId);
        if (!doctor) {
            console.error(`Doctor record not found for ID ${user.doctorId}`);
            return;
        }

        const hospitalId = doctor.hospitalId;
        const departmentId = doctor.departmentId;
        const doctorId = doctor._id;
        const today = new Date().toISOString().split('T')[0];

        const dummyNames = [
            'Arjun Mehta', 'Priya Sharma', 'Rahul Vermal', 'Sneha Reddy', 
            'Amit Patel', 'Deepa Nair', 'Vikram Singh', 'Ananya Iyer',
            'Sanjay Gupta', 'Kavita Rao'
        ];

        const department = await Department.findById(departmentId).lean();
        if (!department) {
            console.error('Department not found');
            return;
        }

        // 2. Create 10 dummy tokens
        for (let i = 0; i < dummyNames.length; i++) {
            const name = dummyNames[i];
            const phoneStr = `+9199000000${i.toString().padStart(2, '0')}`;
            
            // 1. Ensure patient exists
            let patient = await Patient.findOne({ hospitalId, 'phone.full': phoneStr });
            if (!patient) {
                patient = await Patient.create({
                    name,
                    phone: {
                        full: phoneStr,
                        countryCode: '+91',
                        nationalNumber: `99000000${i.toString().padStart(2, '0')}`
                    },
                    age: 20 + Math.floor(Math.random() * 50),
                    gender: i % 2 === 0 ? 'Male' : 'Female',
                    hospitalId
                });
            }

            const counter = await TokenCounter.findOneAndUpdate(
                { hospitalId, departmentId, date: today },
                { $inc: { lastSequence: 1 } },
                { new: true, upsert: true }
            );

            const tokenNumber = `${department.prefix || 'T'}${counter.lastSequence}`;
            
            const token = await Token.create({
                tokenNumber,
                sequenceNumber: counter.lastSequence,
                departmentId,
                doctorId,
                hospitalId,
                appointmentDate: today,
                status: 'WAITING',
                patientId: patient._id,
                isEmergency: i === 0, // Keep first as emergency
                sortKey: new Date(Date.now() + i * 1000)
            });

            console.log(`Created token ${token.tokenNumber} for ${patient.name}`);
        }

        console.log('Successfully created 5 dummy tokens');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error creating dummy tokens:', error);
        process.exit(1);
    }
};

createDummyTokens();
