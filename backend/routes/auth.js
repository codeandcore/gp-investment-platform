'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendMagicLink, verifyToken, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authValidators } = require('../middleware/validate');

const router = express.Router();

// ── Rate limiters specific to auth ────────────────────────────────────────────
const magicLinkLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min window
    max: Number(process.env.MAGIC_LINK_RATE_LIMIT_MAX) || 5,
    message: { success: false, message: 'Too many magic link requests. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.body.email || req.ip,  // Rate limit per email
});

// ─── Auth routes ──────────────────────────────────────────────────────────────

// POST /api/auth/magic-link
router.post('/magic-link', magicLinkLimiter, authValidators.requestMagicLink, sendMagicLink);

// GET /api/auth/verify
router.get('/verify', authValidators.verifyMagicLink, verifyToken);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
