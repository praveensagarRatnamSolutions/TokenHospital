const Token = require('./token.model');
const mongoose = require('mongoose');

const findTokensByDoctor = (doctorId) => {
  return Token.find({ doctorId });
};

const aggregateDoctorQueue = (doctorId) => {
  const appointmentDate = new Date().toISOString().split('T')[0];
  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  return Token.aggregate([
    {
      $match: {
        doctorId: doctorObjectId,
        appointmentDate,
      },
    },
    {
      $project: {
        tokenNumber: 1,
        status: {
          $switch: {
            branches: [
              // Priority 1: If it's CALLED, keep it CALLED (or whatever your top priority is)
              { case: { $eq: ['$status', 'CALLED'] }, then: 'CALLED' },

              // Priority 2: If it's WAITING and an Emergency, label it EMERGENCY
              {
                case: {
                  $and: [
                    { $eq: ['$status', 'WAITING'] },
                    { $eq: ['$isEmergency', true] },
                  ],
                },
                then: 'EMERGENCY',
              },
            ],
            // Priority 3: For everything else (PROVISIONAL, COMPLETED, etc.), use the original status
            default: '$status',
          },
        },
        isEmergency: 1,
        createdAt: 1,
        updatedAt: 1,
        sortKey: 1,
      },
    },

    {
      $facet: {
        lastCompleted: [
          {
            $match: { status: 'COMPLETED' },
          },
          {
            $sort: {
              updatedAt: -1,
            },
          },
          {
            $limit: 1,
          },
        ],
        current: [
          {
            $match: { status: 'CALLED' },
          },
          {
            $sort: { updatedAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        emergency: [
          {
            $match: { status: 'EMERGENCY' },
          },
          {
            $sort: { sortKey: 1 },
          },
        ],
        general: [
          {
            $match: { status: { $in: ['WAITING'] } },
          },
          {
            $sort: {
              sortKey: 1,
            },
          },
        ],
      },
    },

    {
      $project: {
        allTokens: {
          $concatArrays: [
            '$lastCompleted',
            '$current',
            '$emergency',
            '$general',
          ],
        },
        lastCompleted: 1,
        current: 1,
        general: 1,
        emergency: 1,
      },
    },

    {
      $project: {
        tokensById: {
          $arrayToObject: {
            $map: {
              input: '$allTokens',
              as: 'token',
              in: {
                k: { $toString: '$$token._id' },
                v: {
                  _id: '$$token._id',
                  tokenNumber: '$$token.tokenNumber',
                  status: '$$token.status',
                  isEmergency: '$$token.isEmergency',
                },
              },
            },
          },
        },

        buckets: {
          lastCompleted: {
            $map: {
              input: '$lastCompleted',
              as: 't',
              in: { $toString: '$$t._id' },
            },
          },
          current: {
            $map: {
              input: '$current',
              as: 'token',
              in: { $toString: '$$token._id' },
            },
          },
          emergency: {
            $map: {
              input: '$emergency',
              as: 'token',
              in: { $toString: '$$token._id' },
            },
          },
          general: {
            $map: {
              input: '$general',
              as: 'token',
              in: { $toString: '$$token._id' },
            },
          },
        },
      },
    },
  ]);
};

module.exports = {
  aggregateDoctorQueue,
  findTokensByDoctor,
};
