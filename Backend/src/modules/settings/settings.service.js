const Settings = require('./settings.model');

const getSettings = async (hospitalId) => {
    let settings = await Settings.findOne({ hospitalId }).lean();
    if (!settings) {
        // Return default settings if none exist yet
        settings = {
            hospitalId,
            hospitalType: 'small',
            features: {
                doctorSelection: true,
                payment: false,
                ads: true,
                reports: true,
                autoAssign: true,
            },
            tokenResetTime: '0 0 * * *',
        };
    }
    return settings;
};

const updateSettings = async (hospitalId, updateData) => {
    const settings = await Settings.findOneAndUpdate(
        { hospitalId },
        { ...updateData, hospitalId },
        { new: true, upsert: true, runValidators: true }
    );
    return settings;
};

module.exports = {
    getSettings,
    updateSettings,
};
