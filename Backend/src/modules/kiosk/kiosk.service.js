const Kiosk = require('./kiosk.model');

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
  return await Kiosk.findOne(query).populate('departmentIds doctorIds', 'name').populate('ads.adId');
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

module.exports = {
  createKiosk,
  getKiosks,
  getKiosk,
  updateKiosk,
  deleteKiosk,
};
