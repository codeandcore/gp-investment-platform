'use strict';

const mongoose = require('mongoose');

/**
 * AuditLog – immutable record of every status/ownership change.
 * Inserts only – never update or delete.
 */
const auditLogSchema = new mongoose.Schema(
    {
        entityType: {
            type: String,
            required: true,
            enum: ['GpApplication', 'User', 'ReviewAssignment'],
            index: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            // Examples: STATUS_CHANGED, OWNER_CHANGED, NOTE_ADDED, SUBMITTED, etc.
            index: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        previousValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
        metadata: { type: mongoose.Schema.Types.Mixed },    // extra context
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    {
        timestamps: true,
        // Prevent updates – audit logs are write-once
        // Enforced at the service layer
    }
);

// Compound indexes for timeline queries
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

// TTL index: auto-purge logs older than 3 years (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 94608000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
