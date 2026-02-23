'use strict';

const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
    {
        to: { type: String, required: true, lowercase: true, index: true },
        from: { type: String },
        subject: { type: String },
        templateName: {
            type: String,
            enum: [
                'magic_link',
                'application_reminder',
                'opt_in_nudge',
                'reviewer_assignment',
                'status_change',
            ],
        },
        status: {
            type: String,
            enum: ['queued', 'sent', 'failed', 'bounced'],
            default: 'queued',
            index: true,
        },
        sentAt: { type: Date },
        failureReason: { type: String },
        messageId: { type: String },      // SMTP message ID for tracking
        relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
        triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

emailLogSchema.index({ to: 1, templateName: 1, createdAt: -1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
module.exports = EmailLog;
