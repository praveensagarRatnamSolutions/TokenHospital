const Ad = require('./ads.model');
const { getUploadPresignedUrl, getDownloadPresignedUrl, deleteS3Object } = require('../../utils/s3');
const { v4: uuidv4 } = require('crypto');

/**
 * Generate a unique S3 key for an ad file.
 */
const generateS3Key = (hospitalId, type, originalName) => {
    const ext = originalName ? originalName.split('.').pop() : (type === 'image' ? 'png' : 'mp4');
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return `ads/${hospitalId}/${uniqueId}.${ext}`;
};

/**
 * Create ad and return a presigned upload URL.
 */
const createAd = async (adData) => {
    const { hospitalId, title, type, displayArea, departmentId, startTime, endTime, priority, fileName } = adData;

    // Generate S3 key and presigned upload URL
    const fileKey = generateS3Key(hospitalId, type, fileName);
    const contentType = type === 'image' ? 'image/*' : 'video/*';
    const uploadUrl = await getUploadPresignedUrl(fileKey, contentType);

    const ad = await Ad.create({
        title,
        type,
        fileKey,
        displayArea: displayArea || 'carousel',
        hospitalId,
        departmentId: departmentId || null,
        startTime,
        endTime,
        priority: priority || 0,
        isActive: true,
    });

    return { ad, uploadUrl };
};

/**
 * Get active ads (for kiosk display).
 */
const getActiveAds = async (hospitalId, departmentId) => {
    const now = new Date();
    const query = {
        hospitalId,
        isActive: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
    };

    if (departmentId) {
        query.$or = [
            { departmentId },
            { departmentId: null }, // Also include global ads
        ];
    }

    const ads = await Ad.find(query)
        .sort({ priority: -1 })
        .lean();

    // Generate presigned download URLs for each ad
    const adsWithUrls = await Promise.all(
        ads.map(async (ad) => {
            try {
                const fileUrl = await getDownloadPresignedUrl(ad.fileKey);
                return { ...ad, fileUrl };
            } catch (err) {
                return { ...ad, fileUrl: null };
            }
        })
    );

    return adsWithUrls;
};

/**
 * Get all ads for management.
 */
const getAllAds = async (hospitalId) => {
    const ads = await Ad.find({ hospitalId })
        .populate('departmentId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    return ads;
};

/**
 * Update ad.
 */
const updateAd = async (adId, hospitalId, updateData) => {
    const ad = await Ad.findOneAndUpdate(
        { _id: adId, hospitalId },
        updateData,
        { new: true, runValidators: true }
    ).populate('departmentId', 'name');

    if (!ad) {
        throw new Error('Ad not found');
    }
    return ad;
};

/**
 * Delete ad and its S3 file.
 */
const deleteAd = async (adId, hospitalId) => {
    const ad = await Ad.findOne({ _id: adId, hospitalId });
    if (!ad) {
        throw new Error('Ad not found');
    }

    // Delete from S3
    try {
        await deleteS3Object(ad.fileKey);
    } catch (err) {
        // Log but don't fail the deletion
    }

    await Ad.deleteOne({ _id: adId });
    return { message: 'Ad deleted successfully' };
};

module.exports = {
    createAd,
    getActiveAds,
    getAllAds,
    updateAd,
    deleteAd,
};
