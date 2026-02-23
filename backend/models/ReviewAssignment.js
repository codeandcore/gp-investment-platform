'use strict';

const mongoose = require('mongoose');

const reviewAssignmentSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GpApplication',
            required: true,
            index: true,
        },
        reviewerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        batchId: {
            type: String,
            index: true,    // Group assignments created in one bulk operation
        },
        distributionLogic: {
            type: String,
            enum: ['balanced', 'random'],
        },
        status: {
            type: String,
            enum: ['pending', 'in_review', 'completed', 'declined'],
            default: 'pending',
            index: true,
        },
        dueDate: { type: Date },
        completedAt: { type: Date },
        rating: { type: Number, min: 1, max: 5 },
        notes: { type: String },
        emailSentAt: { type: Date },

        // Soft delete
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Unique constraint: one reviewer per application
reviewAssignmentSchema.index({ applicationId: 1, reviewerUserId: 1 }, { unique: true });
reviewAssignmentSchema.index({ batchId: 1, status: 1 });
reviewAssignmentSchema.index({ reviewerUserId: 1, status: 1 });

const ReviewAssignment = mongoose.model('ReviewAssignment', reviewAssignmentSchema);
module.exports = ReviewAssignment;
