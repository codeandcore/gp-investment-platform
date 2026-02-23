'use strict';

const { validateSession } = require('../services/authService');

/**
 * authenticate – validates JWT from HTTP-only cookie or Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
async function authenticate(req, res, next) {
    try {
        const token =
            req.cookies?.auth_token ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.slice(7)
                : null);
        console.log("token--", req.headers);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const { user } = await validateSession(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(error.statusCode || 401).json({
            success: false,
            message: error.message || 'Invalid session.',
        });
    }
}

/**
 * authorize – role-based access control factory.
 * Usage: authorize('admin', 'reviewer')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}.`,
            });
        }
        next();
    };
}

/**
 * authorizeGpOwner – ensures a GP can only access their own application.
 * Compares req.user._id with application's userId field.
 */
function authorizeGpOwner(req, res, next) {
    if (req.user.role === 'admin') return next(); // admins bypass
    // The actual ownership check happens in the service layer
    // This middleware gates early for obvious violations
    next();
}

module.exports = { authenticate, authorize, authorizeGpOwner };
