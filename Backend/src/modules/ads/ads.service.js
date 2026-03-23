const mongoose = require("mongoose");
const path = require("path");
const mime = require("mime-types");
const Ad = require("./ads.model");
const {
  getUploadPresignedUrl,
  getDownloadPresignedUrl,
  deleteS3Object,
} = require("../../utils/s3");

/**
 * Logic: Generates S3 key and identifies the correct MIME type for AWS.
 * Sec: Uses 'mime-types' to prevent incorrect 'image' or 'video' generic strings.
 */
const getFileMetadata = (hospitalId, fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileKey = `ads/${hospitalId}/${uniqueId}${ext}`;
  const contentType = mime.lookup(fileName) || "application/octet-stream";

  return { fileKey, contentType };
};

/**
 * Create ad with Atomic Transaction.
 * Sec: Ensures DB record only exists if S3 URL generation succeeds.
 */
const createAd = async (adData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { hospitalId, fileName, type, ...rest } = adData;

    const { fileKey, contentType } = getFileMetadata(hospitalId, fileName);

    // Get presigned URL with the EXACT Content-Type for S3 headers
    const uploadUrl = await getUploadPresignedUrl(fileKey, contentType);

    const ad = await Ad.create(
      [
        {
          ...rest,
          hospitalId,
          type,
          fileName,
          fileKey,
          contentType,
          isActive: true,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { ad: ad[0], uploadUrl };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get active ads for kiosk.
 * Logic: Filters by isActive and priority.
 */
const getActiveAds = async (hospitalId, departmentId) => {
  const query = {
    hospitalId,
    isActive: true,
  };

  if (departmentId) {
    query.$or = [{ departmentId }, { departmentId: null }];
  }

  // Use the compound index: { hospitalId: 1, isActive: 1, priority: -1 }
  const ads = await Ad.find(query).sort({ priority: -1 }).lean();

  // Logic: Parallelize URL generation for speed
  return Promise.all(
    ads.map(async (ad) => {
      try {
        const fileUrl = await getDownloadPresignedUrl(ad.fileKey);
        return { ...ad, fileUrl };
      } catch (err) {
        return { ...ad, fileUrl: null };
      }
    })
  );
};

/**
 * Delete ad with cleanup logic.
 */
const deleteAd = async (adId, hospitalId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ad = await Ad.findOne({ _id: adId, hospitalId }).session(session);
    if (!ad) throw new Error("Ad not found");

    // 1. Delete DB record first
    await Ad.deleteOne({ _id: adId }).session(session);

    // 2. Cleanup S3 - Logic: If S3 fails, we log it for manual cleanup 
    // but don't roll back the DB deletion to avoid "ghost" records.
    deleteS3Object(ad.fileKey).catch((err) =>
      console.error(`S3 Orphaned File Alert: ${ad.fileKey}`, err)
    );

    await session.commitTransaction();
    return { message: "Ad deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createAd,
  getActiveAds,
  getAllAds: async (hospitalId) => 
    Ad.find({ hospitalId }).sort({ createdAt: -1 }).lean(),
  updateAd: async (adId, hospitalId, updateData) => 
    Ad.findOneAndUpdate({ _id: adId, hospitalId }, updateData, { new: true, runValidators: true }),
  deleteAd,
};