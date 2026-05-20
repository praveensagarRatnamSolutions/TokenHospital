const mongoose = require('mongoose');
const Plan = require('../modules/subscription/plan.model');
require('dotenv').config();

const plans = [
  {
    name: 'Free',
    planId: 'FREE',
    description: 'Essential queue management features for single practitioners.',
    price: 0,
    yearlyPrice: 0,
    currency: 'INR',
    displayOrder: 0,
    recommended: false,
    trialDays: 30,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    prices: [
      { billingCycle: 'MONTHLY', intervalMonths: 1, amount: 0, razorpayPlanId: null }
    ],
    limits: {
      maxDepartments: 1,
      maxDoctors: 2,
      maxKiosks: 0,
      allowCustomBranding: false,
    },
    features: [
      { text: '1 Department', available: true },
      { text: 'Up to 2 Doctors', available: true },
      { text: 'Basic Queue Reports', available: true },
      { text: 'Email Support', available: true },
      { text: 'Digital Kiosk', available: false },
      { text: 'Custom Branding', available: false },
      { text: 'Priority Support', available: false },
    ],
  },
  {
    name: 'Basic',
    planId: 'BASIC',
    description: 'Perfect for small clinics with a single department.',
    price: 499,
    yearlyPrice: 4799,
    currency: 'INR',
    displayOrder: 1,
    recommended: false,
    trialDays: 25,
    razorpayPlanIdMonthly: 'plan_basic_monthly',
    razorpayPlanIdYearly: 'plan_basic_yearly',
    prices: [
      { billingCycle: 'MONTHLY', intervalMonths: 1, amount: 499, razorpayPlanId: 'plan_basic_monthly' },
      { billingCycle: 'QUARTERLY', intervalMonths: 3, amount: 1299, razorpayPlanId: 'plan_basic_3months' },
      { billingCycle: 'HALF_YEARLY', intervalMonths: 6, amount: 2399, razorpayPlanId: 'plan_basic_6months' },
      { billingCycle: 'YEARLY', intervalMonths: 12, amount: 4799, razorpayPlanId: 'plan_basic_yearly' }
    ],
    limits: {
      maxDepartments: 1,
      maxDoctors: 2,
      maxKiosks: 0,
      allowCustomBranding: false,
    },
    features: [
      { text: '1 Department', available: true },
      { text: 'Up to 2 Doctors', available: true },
      { text: 'Basic Queue Reports', available: true },
      { text: 'Email Support', available: true },
      { text: 'Digital Kiosk', available: false },
      { text: 'Custom Branding', available: false },
      { text: 'Priority Support', available: false },
    ],
  },
  {
    name: 'Professional',
    planId: 'PRO',
    description: 'Best for growing multi-specialty hospitals.',
    price: 1499,
    yearlyPrice: 14399,
    currency: 'INR',
    displayOrder: 2,
    recommended: true,
    trialDays: 25,
    razorpayPlanIdMonthly: 'plan_pro_monthly',
    razorpayPlanIdYearly: 'plan_pro_yearly',
    prices: [
      { billingCycle: 'MONTHLY', intervalMonths: 1, amount: 1499, razorpayPlanId: 'plan_pro_monthly' },
      { billingCycle: 'QUARTERLY', intervalMonths: 3, amount: 3999, razorpayPlanId: 'plan_pro_3months' },
      { billingCycle: 'HALF_YEARLY', intervalMonths: 6, amount: 7499, razorpayPlanId: 'plan_pro_6months' },
      { billingCycle: 'YEARLY', intervalMonths: 12, amount: 14399, razorpayPlanId: 'plan_pro_yearly' }
    ],
    limits: {
      maxDepartments: 5,
      maxDoctors: 10,
      maxKiosks: 2,
      allowCustomBranding: false,
    },
    features: [
      { text: 'Up to 5 Departments', available: true },
      { text: 'Up to 10 Doctors', available: true },
      { text: 'Advanced Reports & Export', available: true },
      { text: 'Up to 2 Digital Kiosks', available: true },
      { text: 'Priority Support', available: true },
      { text: 'Custom Branding', available: false },
      { text: 'Dedicated Account Manager', available: false },
    ],
  },
  {
    name: 'Enterprise',
    planId: 'ENTERPRISE',
    description: 'For large medical centers and hospital chains.',
    price: 4999,
    yearlyPrice: 47999,
    currency: 'INR',
    displayOrder: 3,
    recommended: false,
    trialDays: 30,
    razorpayPlanIdMonthly: 'plan_enterprise_monthly',
    razorpayPlanIdYearly: 'plan_enterprise_yearly',
    prices: [
      { billingCycle: 'MONTHLY', intervalMonths: 1, amount: 4999, razorpayPlanId: 'plan_enterprise_monthly' },
      { billingCycle: 'QUARTERLY', intervalMonths: 3, amount: 13999, razorpayPlanId: 'plan_enterprise_3months' },
      { billingCycle: 'HALF_YEARLY', intervalMonths: 6, amount: 25999, razorpayPlanId: 'plan_enterprise_6months' },
      { billingCycle: 'YEARLY', intervalMonths: 12, amount: 47999, razorpayPlanId: 'plan_enterprise_yearly' }
    ],
    limits: {
      maxDepartments: 99999,
      maxDoctors: 99999,
      maxKiosks: -1,
      allowCustomBranding: true,
    },
    features: [
      { text: 'Unlimited Departments', available: true },
      { text: 'Unlimited Doctors', available: true },
      { text: 'Full Analytics Suite', available: true },
      { text: 'Unlimited Digital Kiosks', available: true },
      { text: 'Custom Branding & White-label', available: true },
      { text: 'Dedicated Account Manager', available: true },
      { text: 'SLA & Uptime Guarantee', available: true },
    ],
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Plan.deleteMany();
    await Plan.insertMany(plans);

    console.log('Plans seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
