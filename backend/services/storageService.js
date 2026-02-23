'use strict';

const aws = require('aws-sdk');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

// ─── S3 client ────────────────────────────────────────────────────────────────
let _s3 = null;

function getS3() {
    if (_s3) return _s3;
    _s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
    });
    return _s3;
}

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_TYPES = {
    deck: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    logo: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    headshot: ['image/png', 'image/jpeg', 'image/webp'],
};

const MAX_SIZES = {
    deck: 50 * 1024 * 1024,      // 50MB
    logo: 5 * 1024 * 1024,       // 5MB
    headshot: 5 * 1024 * 1024,   // 5MB
};

/**
 * Validate file before upload.
 */
function validateFile(file, fileType = 'deck') {
    const allowed = ALLOWED_TYPES[fileType];
    if (!allowed || !allowed.includes(file.mimetype)) {
        throw new Error(`File type "${file.mimetype}" is not allowed for ${fileType}.`);
    }
    const maxSize = MAX_SIZES[fileType] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`File too large. Max size for ${fileType} is ${maxSize / 1024 / 1024}MB.`);
    }
}

/**
 * Upload a file buffer to S3.
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadToS3(file, fileType, applicationId) {
    validateFile(file, fileType);

    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const key = `uploads/${fileType}s/${applicationId}/${hash}${ext}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Server-side encryption
        ServerSideEncryption: 'AES256',
        // Files are private by default
        ACL: 'private',
        Metadata: {
            applicationId: applicationId.toString(),
            fileType,
            originalName: file.originalname,
        },
    };

    const result = await getS3().upload(params).promise();

    return {
        url: result.Location,
        key: result.Key,
    };
}

/**
 * Generate a pre-signed URL for temporary access to a private S3 object.
 * Default expiry: 1 hour.
 */
async function getSignedUrl(key, expiresInSeconds = 3600) {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: expiresInSeconds,
    };
    return getS3().getSignedUrlPromise('getObject', params);
}

/**
 * Delete a file from S3.
 */
async function deleteFromS3(key) {
    await getS3()
        .deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key })
        .promise();
}

module.exports = { uploadToS3, getSignedUrl, deleteFromS3, validateFile };
