'use strict';

const User = require('../models/User');
const ReviewAssignment = require('../models/ReviewAssignment');
const GpApplication = require('../models/GpApplication');
const { sendBulkEmails } = require('./emailService');
const crypto = require('crypto');

/**
 * Assign reviewers to GP applications.
 *
 * @param {string[]} reviewerEmails - emails from CSV upload
 * @param {number}   ratingsPerApp  - how many reviewers per application
 * @param {'balanced'|'random'} logic
 * @param {ObjectId} assignedBy    - admin userId
 */
async function assignReviewers({ reviewerEmails, ratingsPerApp = 2, logic = 'balanced', assignedBy }) {
    // ── 1. Resolve / create reviewer users ──
    const reviewerUsers = await Promise.all(
        reviewerEmails.map(async (email) => {
            let user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                user = await User.create({ email: email.toLowerCase(), role: 'reviewer' });
            } else if (user.role !== 'reviewer') {
                user.role = 'reviewer';
                await user.save();
            }
            return user;
        })
    );

    const reviewerIds = reviewerUsers.map((u) => u._id);

    // ── 2. Fetch qualified, submitted applications (exclude not_qualified) ──
    const applications = await GpApplication.find({
        applicantProgressStatus: 'submitted',
        adminQualificationStatus: { $nin: ['not_qualified'] },
        deletedAt: null,
    }).select('_id uniqueId companyName').lean();

    if (applications.length === 0) {
        throw Object.assign(new Error('No eligible applications found for assignment.'), { statusCode: 422 });
    }

    // ── 3. Check existing assignments to avoid duplicates ──
    const existingAssignments = await ReviewAssignment.find({
        applicationId: { $in: applications.map((a) => a._id) },
        reviewerUserId: { $in: reviewerIds },
        deletedAt: null,
    }).select('applicationId reviewerUserId').lean();

    const existingSet = new Set(
        existingAssignments.map((a) => `${a.applicationId}-${a.reviewerUserId}`)
    );

    // ── 4. Build assignment pairs ──
    const batchId = crypto.randomBytes(8).toString('hex');
    const toCreate = [];
    const workload = Object.fromEntries(reviewerIds.map((id) => [id.toString(), 0]));

    for (const app of applications) {
        let assignedCount = 0;
        const shuffledReviewers =
            logic === 'random'
                ? [...reviewerIds].sort(() => Math.random() - 0.5)
                : [...reviewerIds].sort((a, b) => workload[a.toString()] - workload[b.toString()]);

        for (const reviewerId of shuffledReviewers) {
            if (assignedCount >= ratingsPerApp) break;
            const key = `${app._id}-${reviewerId}`;
            if (!existingSet.has(key)) {
                toCreate.push({
                    applicationId: app._id,
                    reviewerUserId: reviewerId,
                    assignedBy,
                    batchId,
                    distributionLogic: logic,
                    status: 'pending',
                });
                workload[reviewerId.toString()]++;
                assignedCount++;
            }
        }
    }

    // ── 5. Bulk insert ──
    const created = await ReviewAssignment.insertMany(toCreate, { ordered: false });

    // ── 6. Send email notifications to reviewers ──
    const reviewerAppCounts = {};
    toCreate.forEach((a) => {
        const id = a.reviewerUserId.toString();
        reviewerAppCounts[id] = (reviewerAppCounts[id] || 0) + 1;
    });

    const emailJobs = reviewerUsers
        .filter((u) => reviewerAppCounts[u._id.toString()])
        .map((user) => ({
            to: user.email,
            templateName: 'reviewer_assignment',
            templateData: {
                reviewerName: user.name || user.email,
                applicationCount: reviewerAppCounts[user._id.toString()],
                reviewLink: `${process.env.MAGIC_LINK_BASE_URL}/reviewer/assignments`,
            },
            triggeredBy: assignedBy,
        }));

    const emailResults = await sendBulkEmails(emailJobs);

    // ── 7. Build summary ──
    const summary = {
        batchId,
        totalApplications: applications.length,
        totalAssignments: created.length,
        reviewerCount: reviewerUsers.length,
        ratingsPerApp,
        logic,
        workload: reviewerUsers.map((u) => ({
            email: u.email,
            assignedCount: reviewerAppCounts[u._id.toString()] || 0,
        })),
        emailResults,
    };

    return summary;
}

/**
 * Get assignments for a reviewer.
 */
async function getReviewerAssignments(reviewerUserId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
        ReviewAssignment.find({ reviewerUserId, deletedAt: null, status: { $ne: 'declined' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'applicationId',
                select: 'uniqueId companyName primaryContactName applicantProgressStatus adminQualificationStatus',
            })
            .lean(),
        ReviewAssignment.countDocuments({ reviewerUserId, deletedAt: null }),
    ]);

    return { assignments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

module.exports = { assignReviewers, getReviewerAssignments };
