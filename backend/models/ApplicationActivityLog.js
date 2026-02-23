'use strict';

const mongoose = require('mongoose');

/**
 * ApplicationActivityLog – lightweight timeline for GP-facing events.
 * Separate from AuditLog (which covers admin/system actions).
 */
const applicationActivityLogSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GpApplication',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        eventType: {
            type: String,
            required: true,
            enum: [
                'STEP_STARTED',
                'STEP_SAVED',
                'STEP_COMPLETED',
                'FILE_UPLOADED',
                'FILE_REMOVED',
                'APPLICATION_SUBMITTED',
                'LOGIN',
                'SESSION_RESUMED',
            ],
        },
        step: { type: Number, min: 1, max: 4 },
        description: { type: String },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

applicationActivityLogSchema.index({ applicationId: 1, createdAt: -1 });

const ApplicationActivityLog = mongoose.model(
    'ApplicationActivityLog',
    applicationActivityLogSchema
);
module.exports = ApplicationActivityLog;
