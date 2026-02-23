'use strict';

const { requestMagicLink, verifyMagicLink, revokeSession } = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/',
};


const sendMagicLink = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await requestMagicLink(email.toLowerCase().trim());
    res.status(200).json({ success: true, ...result });
});


const verifyToken = asyncHandler(async (req, res) => {
    const { token, email } = req.query;
    const normalizedEmail = email?.toLowerCase().trim();
    const result = await verifyMagicLink(normalizedEmail, token, req);

    // Set HTTP-only session cookie
    res.cookie('auth_token', result.token, COOKIE_OPTIONS);

    // Respond with user info and redirect path (for SPA redirect)
    res.status(200).json({
        success: true,
        user: result.user,
        redirectPath: result.redirectPath,
        applicationState: result.applicationState,
    });
});

/**
 * POST /api/auth/logout
 * Revoke all sessions for the authenticated user.
 */
const logout = asyncHandler(async (req, res) => {
    await revokeSession(req.user._id);
    res.clearCookie('auth_token', { path: '/' });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Return current user profile.
 */
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

module.exports = { sendMagicLink, verifyToken, logout, getMe };
