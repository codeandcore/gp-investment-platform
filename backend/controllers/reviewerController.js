'use strict';

const reviewerService = require('../services/reviewerService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/admin/reviewers/assign
 * Upload reviewer emails and run assignment algorithm.
 */
const assignReviewers = asyncHandler(async (req, res) => {
    const { reviewerEmails, ratingsPerApp, logic } = req.body;

    const summary = await reviewerService.assignReviewers({
        reviewerEmails,
        ratingsPerApp: Number(ratingsPerApp),
        logic,
        assignedBy: req.user._id,
    });

    res.status(200).json({ success: true, summary });
});

/**
 * GET /api/reviewer/assignments
 * Reviewer: get own assignments.
 */
const getMyAssignments = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await reviewerService.getReviewerAssignments(req.user._id, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
    });
    res.status(200).json({ success: true, ...result });
});

module.exports = { assignReviewers, getMyAssignments };
