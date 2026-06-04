const Kiosk = require('./kiosk.model');
const Token = require('../token/token.model');
const Hospital = require('../hospital/hospital.model');
const {
  getHospitalLimits,
  isSubscriptionValid,
} = require('../hospital/subscription.utils');

/**
 * @desc Create a new kiosk
 */
const createKiosk = async (kioskData) => {
  const { hospitalId } = kioskData;

  // Hospital integrity check
  const hospitalExists = await Hospital.exists({ _id: hospitalId });
  if (!hospitalExists) throw new Error('Hospital not found');

  return await Kiosk.create(kioskData);
};

/**
 * @desc Get all kiosks for a hospital with optional ownership filter
 */
const getKiosks = async (hospitalId, filters = {}) => {
  const query = { hospitalId, ...filters };
  return await Kiosk.find(query).populate('departmentIds doctorIds', 'name');
};

/**
 * @desc Get a single kiosk by query (ID or Code)
 */
const getKiosk = async (query) => {
  return await Kiosk.findOne(query)
    .populate('departmentIds doctorIds', 'name')
    .populate('ads.adId');
};

/**
 * @desc Update a kiosk
 */
const updateKiosk = async (query, updateData) => {
  return await Kiosk.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true,
  });
};

/**
 * @desc Delete a kiosk
 */
const deleteKiosk = async (query) => {
  const kiosk = await Kiosk.findOne(query);
  if (!kiosk) throw new Error('Kiosk not found');
  await Kiosk.deleteOne(query);
  return { message: 'Kiosk deleted successfully' };
};

// const getKioskTokenStats = async (hospitalId) => {
//   const today = new Date().toISOString().split('T')[0];

//   const tokens = await Token.find({
//     hospitalId,
//     appointmentDate: today,
//     status: { $in: ['WAITING', 'CALLED'] },
//   })
//     .populate('departmentId', 'name')
//     .populate('doctorId', 'name roomNumber')
//     .lean();

//   // 🔥 STEP 1: Group by department + doctor
//   const grouped = {};

//   for (const token of tokens) {
//     if (!token.doctorId || !token.departmentId) continue;

//     const key = `${token.departmentId._id}_${token.doctorId._id}`;

//     if (!grouped[key]) {
//       grouped[key] = {
//         departmentId: token.departmentId._id.toString(),
//         departmentName: token.departmentId.name,

//         doctorId: token.doctorId._id.toString(),
//         doctorName: token.doctorId.name,
//         room: token.doctorId.roomNumber,

//         emergency: null,
//         normal: [],
//       };
//     }

//     if (token.isEmergency) {
//       grouped[key].emergency = token;
//     } else {
//       grouped[key].normal.push(token);
//     }
//   }

//   // 🔥 STEP 2: Convert into department structure
//   const departmentMap = {};

//   Object.values(grouped).forEach((item) => {
//     const depId = item.departmentId;

//     if (!departmentMap[depId]) {
//       departmentMap[depId] = {
//         id: depId,
//         name: item.departmentName,
//         doctors: [],
//       };
//     }

//     // Sort queue
//     item.normal.sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey));

//     departmentMap[depId].doctors.push({
//       id: item.doctorId,
//       name: item.doctorName,
//       room: item.room,

//       display: {
//         emergency: item.emergency?.tokenNumber || null,
//         current: item.normal[0]?.tokenNumber || '---',
//         next: item.normal[1]?.tokenNumber || '---',
//       },

//       queue: item.normal.slice(2).map((t) => t.tokenNumber),

//       meta: {
//         totalWaiting: item.normal.length,
//         estimatedWaitTime: `${item.normal.length * 5} mins`,
//       },
//     });
//   });

//   return Object.values(departmentMap);
// };

const getKioskTokenStats = async (hospitalId, kioskId = null) => {
  // 1. Fetch Hospital to check plan and status
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) throw new Error('Hospital not found');

  // 2. Check if subscription is valid and Kiosk is allowed
  const limits = await getHospitalLimits(hospital);
  console.log('Hospital Limits for Kiosk Access:', limits);
  if (!(await isSubscriptionValid(hospital)) || !limits.maxKiosks) {
    throw new Error(
      'Access Denied: Your plan does not allow Kiosk access or has expired.'
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const query = {
    hospitalId,
    appointmentDate: today,
    status: { $in: ['WAITING', 'CALLED', 'COMPLETED'] },
  };

  // 🏥 Apply Kiosk-specific filters if kioskId is provided
  if (kioskId) {
    const kiosk = await Kiosk.findById(kioskId);
    if (kiosk) {
      const filters = [];
      if (kiosk.departmentIds && kiosk.departmentIds.length > 0) {
        filters.push({ departmentId: { $in: kiosk.departmentIds } });
      }
      if (kiosk.doctorIds && kiosk.doctorIds.length > 0) {
        filters.push({ doctorId: { $in: kiosk.doctorIds } });
      }

      if (filters.length > 0) {
        query.$or = filters;
      }
    }
  }

  const tokens = await Token.find(query)
    .populate('departmentId', 'name')
    .populate('doctorId', 'name roomNumber education')
    .sort({ sortKey: 1 })
    .lean();

  console.log('Tokens fetched for stats:', tokens.length);

  const grouped = {};

  // 🔥 Pre-initialize grouped data from Kiosk config to ensure assigned slots
  // show as 'Ready' and allow 'Hi, Doctor' messages to work.
  if (kioskId) {
    const Kiosk = require('./kiosk.model');
    const kioskConfig = await Kiosk.findById(kioskId)
      .populate('departmentIds', 'name')
      .populate('doctorIds', 'name roomNumber education departmentId')
      .lean();

    if (kioskConfig) {
      for (const doc of kioskConfig.doctorIds) {
        let dept = kioskConfig.departmentIds.find(
          (d) => d._id.toString() === doc.departmentId?.toString()
        );
        if (!dept && doc.departmentId) {
          dept = await require('../department/department.model')
            .findById(doc.departmentId)
            .lean();
        }

        if (dept) {
          const key = `${dept._id}_${doc._id}`;
          grouped[key] = {
            dept,
            doctor: doc,
            active: null,
            waiting: [],
            emergency: null,
            completed: null,
          };
        }
      }
    }
  }

  for (const token of tokens) {
    if (!token.doctorId || !token.departmentId) continue;

    const key = `${token.departmentId._id}_${token.doctorId._id}`;

    if (!grouped[key]) {
      grouped[key] = {
        dept: token.departmentId,
        doctor: token.doctorId,
        active: null, // The person currently in the room (CALLED)
        waiting: [], // People in the queue (WAITING)
        emergency: null, // Latest emergency
        completed: null,
      };
    }

    // Identify if this is the active patient or queue
    if (token.status === 'CALLED') {
      grouped[key].active = token;
    } else if (token.status === 'WAITING') {
      grouped[key].waiting.push(token);
    } else if (token.status === 'COMPLETED') {
      // Find the most recently completed token
      if (!grouped[key].completed || new Date(token.completedAt || token.updatedAt) > new Date(grouped[key].completed.completedAt || grouped[key].completed.updatedAt)) {
        grouped[key].completed = token;
      }
    }

    // Separate flag for UI badge
    if (token.isEmergency) {
      grouped[key].emergency = token;
    }
  }

  return Object.values(grouped).reduce((acc, item) => {
    const depId = item.dept._id.toString();

    // Find or create department
    let department = acc.find((d) => d.id === depId);
    if (!department) {
      department = { id: depId, name: item.dept.name, doctors: [] };
      acc.push(department);
    }

    const activeToken = item.active?.tokenNumber || null;
    const nextToken = item.waiting[0]?.tokenNumber || '---';

    department.doctors.push({
      id: item.doctor._id.toString(),
      name: item.doctor.name,
      specialty: item.doctor.education,
      room: item.doctor.roomNumber,
      display: {
        emergency: item.emergency?.tokenNumber || null,
        current: activeToken || 'Ready',
        next: nextToken,
        currentInfo: item.active ? {
          tokenNumber: item.active.tokenNumber,
          isEmergency: item.active.isEmergency,
          isPostponed: item.active.isPostponed,
          status: item.active.status,
        } : null,
        nextInfo: item.waiting[0] ? {
          tokenNumber: item.waiting[0].tokenNumber,
          isEmergency: item.waiting[0].isEmergency,
          isPostponed: item.waiting[0].isPostponed,
          status: item.waiting[0].status,
        } : null,
        completedInfo: item.completed ? {
          tokenNumber: item.completed.tokenNumber,
          isEmergency: item.completed.isEmergency,
          isPostponed: item.completed.isPostponed,
          status: item.completed.status,
        } : null,
      },
      // The queue starts from the 2nd person in the waiting list (since the 1st is in 'next')
      queue: item.waiting.slice(1, 6).map((t) => t.tokenNumber),
      queueInfo: item.waiting.slice(1, 6).map((t) => ({
        tokenNumber: t.tokenNumber,
        isEmergency: t.isEmergency,
        isPostponed: t.isPostponed,
        status: t.status,
      })),
      meta: {
        totalWaiting: item.waiting.length,
        estimatedWaitTime: `${item.waiting.length * 10} mins`,
      },
    });

    return acc;
  }, []);
};
module.exports = {
  createKiosk,
  getKiosks,
  getKiosk,
  updateKiosk,
  deleteKiosk,
  getKioskTokenStats,
};
