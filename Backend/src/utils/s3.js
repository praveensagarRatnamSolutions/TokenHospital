const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../config/logger');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    // credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

/**
 * Generate a presigned PUT URL for uploading a file to S3.
 * @param {string} key - S3 object key (path)
 * @param {string} contentType - MIME type (e.g. image/png, video/mp4)
 * @param {number} expiresIn - URL expiry in seconds (default 300)
 */
const getUploadPresignedUrl = async (key, contentType, expiresIn = 300) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    logger.info(`Generated presigned upload URL for key: ${key}`);
    return url;
};

/**
 * Generate a presigned GET URL for reading/downloading a file from S3.
 * @param {string} key - S3 object key (path)
 * @param {number} expiresIn - URL expiry in seconds (default 3600)
 */
const getDownloadPresignedUrl = async (key, expiresIn = 3600) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
};

/**
 * Delete a file from S3.
 * @param {string} key - S3 object key
 */
const deleteS3Object = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    await s3Client.send(command);
    logger.info(`Deleted S3 object: ${key}`);
};

module.exports = {
    getUploadPresignedUrl,
    getDownloadPresignedUrl,
    deleteS3Object,
};
