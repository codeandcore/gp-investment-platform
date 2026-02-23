'use strict';

const mongoose = require('mongoose');

/**
 * Session – stored server-side for extra security.
 * Avoids relying solely on JWT statelessness so tokens can be revoked.
 */
const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sessionToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
            select: false,        // Never returned in queries by default
        },
        ipAddress: { type: String },
        userAgent: { type: String },
        isActive: { type: Boolean, default: true, index: true },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 },   // MongoDB TTL auto-cleanup
        },
        revokedAt: { type: Date },
        revokedReason: { type: String },
    },
    { timestamps: true }
);

sessionSchema.index({ userId: 1, isActive: 1 });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
