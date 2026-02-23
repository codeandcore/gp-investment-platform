'use strict';

const AuditLog = require('../models/AuditLog');

/**
 * Write-once audit log entry.
 * All status/ownership changes MUST call this.
 */
async function logAuditEvent({
    entityType,
    entityId,
    action,
    performedBy,
    previousValue,
    newValue,
    metadata,
    req,                // Optional Express req for IP/UA capture
}) {
    try {
        await AuditLog.create({
            entityType,
            entityId,
            action,
            performedBy,
            previousValue,
            newValue,
            metadata,
            ipAddress: req?.ip || req?.headers?.['x-forwarded-for'],
            userAgent: req?.headers?.['user-agent'],
        });
    } catch (error) {
        // Audit log failure should never crash the main flow
        console.error(`[AuditService] Failed to log event "${action}": ${error.message}`);
    }
}

/**
 * Get full audit timeline for an entity.
 */
async function getEntityTimeline(entityType, entityId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        AuditLog.find({ entityType, entityId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('performedBy', 'name email role')
            .lean(),
        AuditLog.countDocuments({ entityType, entityId }),
    ]);

    return {
        logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

module.exports = { logAuditEvent, getEntityTimeline };
