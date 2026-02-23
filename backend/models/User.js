'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

// ─── User Schema ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        role: {
            type: String,
            enum: ['admin', 'gp', 'reviewer', 'lp'],
            default: 'gp',
            index: true,
        },
        name: { type: String, trim: true },
        isActive: { type: Boolean, default: true, index: true },
        lastLoginAt: { type: Date },
        // Tracks which admin "owns" this user/application
        ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

        // ── Magic Link fields ──
        magicLinkTokenHash: { type: String, select: false },     // hashed token
        magicLinkTokenExpiry: { type: Date, select: false },
        magicLinkRequestedAt: { type: Date, select: false },

        // ── Soft delete ──
        deletedAt: { type: Date, default: null },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,           // adds createdAt, updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, createdAt: -1 });

// ── Instance methods ──────────────────────────────────────────────────────────
/**
 * Set a magic link token. Stores SHA-256 hash only.
 * Returns the raw token so it can be emailed.
 */
userSchema.methods.setMagicLinkToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.magicLinkTokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    this.magicLinkTokenExpiry = new Date(
        Date.now() + Number(process.env.MAGIC_LINK_EXPIRY_MINUTES || 15) * 60 * 1000
    );
    this.magicLinkRequestedAt = new Date();
    return rawToken;
};

/**
 * Verify a raw token against stored hash.
 */
userSchema.methods.verifyMagicLinkToken = function (rawToken) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const isMatch = this.magicLinkTokenHash === hash;
    const isNotExpired = this.magicLinkTokenExpiry > new Date();
    return isMatch && isNotExpired;
};

/**
 * Invalidate magic link token after use.
 */
userSchema.methods.clearMagicLinkToken = function () {
    this.magicLinkTokenHash = undefined;
    this.magicLinkTokenExpiry = undefined;
};

// ── Query helpers (exclude soft-deleted by default) ───────────────────────────
userSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeSoftDeleted) {
        this.where({ deletedAt: null });
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
