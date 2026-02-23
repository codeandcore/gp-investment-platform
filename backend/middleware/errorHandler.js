'use strict';

/**
 * Centralized async error handler.
 * Wrap route handlers with this to avoid repetitive try/catch.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler – mount LAST in Express app.
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    const response = {
        success: false,
        message: err.message || 'Internal server error.',
        ...(isProduction ? {} : { stack: err.stack, details: err.details }),
    };

    // Don't log 400/401/403/404 errors in prod (client errors, not server errors)
    if (statusCode >= 500) {
        console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    }

    res.status(statusCode).json(response);
}

/**
 * 404 handler – mount after all routes.
 */
function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

module.exports = { asyncHandler, errorHandler, notFound };
