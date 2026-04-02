const Kiosk = require('./kiosk.model');
const Token = require('../token/token.model');

/**
 * @desc Create a new kiosk
 */
const createKiosk = async (kioskData) => {
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

const getKioskTokenStats = async (hospitalId) => {
  const today = new Date().toISOString().split('T')[0];

  const tokens = await Token.find({
    hospitalId,
    appointmentDate: today,
    status: { $in: ['WAITING', 'CALLED'] },
  })
    .populate('departmentId', 'name')
    .populate('doctorId', 'name roomNumber')
    .sort({ sortKey: 1 }) // Let MongoDB do the initial sorting
    .lean();

  console.log('Tokens fetched for stats:', tokens.length);

  const grouped = {};

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
      };
    }

    // Identify if this is the active patient or queue
    if (token.status === 'CALLED') {
      grouped[key].active = token;
    } else {
      grouped[key].waiting.push(token);
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

    department.doctors.push({
      id: item.doctor._id.toString(),
      name: item.doctor.name,
      room: item.doctor.roomNumber,
      display: {
        // If an emergency is 'CALLED', it becomes 'current'
        // If not, we show it in the emergency slot
        emergency: item.emergency?.tokenNumber || null,
        current:
          item.active?.tokenNumber ||
          (item.waiting.length > 0 ? 'Next Up...' : '---'),
        next: item.active
          ? item.waiting[0]?.tokenNumber || '---'
          : item.waiting[1]?.tokenNumber || '---',
      },
      queue: item.active
        ? item.waiting.slice(1, 4).map((t) => t.tokenNumber) // Show next 3 if someone is inside
        : item.waiting.slice(2, 5).map((t) => t.tokenNumber),
      meta: {
        totalWaiting: item.waiting.length,
        estimatedWaitTime: `${item.waiting.length * 5} mins`,
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
