'use strict';

const GpApplication = require('../models/GpApplication');
const { logAuditEvent } = require('./auditService');
const ApplicationActivityLog = require('../models/ApplicationActivityLog');

// ─── Build filter query ───────────────────────────────────────────────────────
function buildAdminFilterQuery(filters = {}) {
    const query = { deletedAt: null };

    if (filters.applicantProgressStatus) {
        query.applicantProgressStatus = filters.applicantProgressStatus;
    }
    if (filters.adminQualificationStatus) {
        query.adminQualificationStatus = filters.adminQualificationStatus;
    }
    if (filters.databaseStatus) {
        query.databaseStatus = filters.databaseStatus;
    }
    if (filters.deckUploaded === 'true' || filters.deckUploaded === true) {
        query['documents.deckUrl'] = { $exists: true, $ne: null };
    } else if (filters.deckUploaded === 'false' || filters.deckUploaded === false) {
        query['$or'] = [
            { 'documents.deckUrl': { $exists: false } },
            { 'documents.deckUrl': null },
        ];
    }
    if (filters.lastActivityFrom || filters.lastActivityTo) {
        query.lastActivityAt = {};
        if (filters.lastActivityFrom) {
            query.lastActivityAt.$gte = new Date(filters.lastActivityFrom);
        }
        if (filters.lastActivityTo) {
            query.lastActivityAt.$lte = new Date(filters.lastActivityTo);
        }
    }
    if (filters.ownedBy) {
        query.ownedBy = filters.ownedBy;
    }
    if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
            { companyName: regex },
            { primaryContactName: regex },
            { primaryContactEmail: regex },
            { uniqueId: regex },
        ];
    }

    return query;
}

// ─── Get paginated applications (admin) ──────────────────────────────────────
async function getApplicationsForAdmin(filters = {}, pagination = {}) {
    const { page = 1, limit = 20, sortBy = 'lastActivityAt', sortDir = -1 } = pagination;
    const skip = (page - 1) * Math.min(limit, 100); // cap at 100 per page

    const query = buildAdminFilterQuery(filters);

    const [applications, total] = await Promise.all([
        GpApplication.find(query)
            .sort({ [sortBy]: sortDir })
            .skip(skip)
            .limit(Math.min(limit, 100))
            .populate('userId', 'email name')
            .populate('ownedBy', 'name email')
            .select('-internalNotes -teamMembers -strategy') // Lightweight for list view
            .lean(),
        GpApplication.countDocuments(query),
    ]);

    return {
        applications,
        pagination: {
            page: Number(page),
            limit: Math.min(limit, 100),
            total,
            pages: Math.ceil(total / Math.min(limit, 100)),
        },
    };
}

// ─── Get single application detail ───────────────────────────────────────────
async function getApplicationDetail(applicationId) {
    const application = await GpApplication.findById(applicationId)
        .populate('userId', 'email name')
        .populate('ownedBy', 'name email')
        .populate('internalNotes.addedBy', 'name email')
        .lean();

    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }

    return application;
}

// ─── Update step (GP-facing) ──────────────────────────────────────────────────
async function updateApplicationStep(applicationId, userId, stepNumber, stepData) {
    const application = await GpApplication.findOne({ _id: applicationId, userId });

    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }
    if (application.applicantProgressStatus === 'submitted') {
        throw Object.assign(new Error('Application is locked after submission.'), { statusCode: 403 });
    }

    // Map step number to fields
    const stepFieldMap = {
        1: [
            'companyName',
            'primaryContactName',
            'primaryContactEmail',
            'primaryContactPhone',
            'companyWebsite',
            'headquarters',
            'yearFounded',
            'legalStructure',
        ],
        // Step 2: team composition + strategy / focus fields
        2: ['teamMembers', 'teamSize', 'strategy'],
        // Step 3: strategy fine-tuning
        3: ['strategy'],
        // Step 4 only handles file uploads separately
        4: [],
    };

    const allowedFields = stepFieldMap[stepNumber] || [];
    allowedFields.forEach((field) => {
        if (stepData[field] !== undefined) {
            application[field] = stepData[field];
        }
    });

    // Mark step completed
    application.stepStatus[`step${stepNumber}Completed`] = true;
    application.stepStatus.lastCompletedStep = Math.max(
        application.stepStatus.lastCompletedStep,
        stepNumber
    );

    await application.save();

    await ApplicationActivityLog.create({
        applicationId: application._id,
        userId,
        eventType: 'STEP_SAVED',
        step: stepNumber,
        description: `Step ${stepNumber} data saved`,
    });

    return application;
}

// ─── Submit application ───────────────────────────────────────────────────────
async function submitApplication(applicationId, userId) {
    const application = await GpApplication.findOne({ _id: applicationId, userId });

    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }
    if (application.applicantProgressStatus === 'submitted') {
        throw Object.assign(new Error('Application already submitted.'), { statusCode: 409 });
    }

    // Validate all steps completed
    const { step1Completed, step2Completed, step3Completed } = application.stepStatus;
    if (!step1Completed || !step2Completed || !step3Completed) {
        throw Object.assign(new Error('Please complete all required steps before submitting.'), {
            statusCode: 422,
        });
    }

    application.applicantProgressStatus = 'submitted';
    application.submittedAt = new Date();
    await application.save();

    await ApplicationActivityLog.create({
        applicationId: application._id,
        userId,
        eventType: 'APPLICATION_SUBMITTED',
        description: 'Application submitted by GP',
    });

    return application;
}

// ─── Admin: update qualification status ──────────────────────────────────────
async function updateQualificationStatus(applicationId, newStatus, adminUser, req) {
    const application = await GpApplication.findById(applicationId);
    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }

    // Business rule: attending_raise requires qualified first
    if (newStatus === 'attending_raise' && application.adminQualificationStatus !== 'qualified') {
        throw Object.assign(
            new Error('Application must be qualified before setting attending_raise.'),
            { statusCode: 422 }
        );
    }

    const previousValue = application.adminQualificationStatus;
    application.adminQualificationStatus = newStatus;
    await application.save();

    await logAuditEvent({
        entityType: 'GpApplication',
        entityId: application._id,
        action: 'STATUS_CHANGED',
        performedBy: adminUser._id,
        previousValue: { adminQualificationStatus: previousValue },
        newValue: { adminQualificationStatus: newStatus },
        req,
    });

    return application;
}

// ─── Admin: change owner ──────────────────────────────────────────────────────
async function changeOwner(applicationId, newOwnerId, adminUser, req) {
    const application = await GpApplication.findById(applicationId);
    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }

    const previousOwner = application.ownedBy;
    application.ownedBy = newOwnerId;
    await application.save();

    await logAuditEvent({
        entityType: 'GpApplication',
        entityId: application._id,
        action: 'OWNER_CHANGED',
        performedBy: adminUser._id,
        previousValue: { ownedBy: previousOwner },
        newValue: { ownedBy: newOwnerId },
        req,
    });

    return application;
}

// ─── Admin: add internal note ─────────────────────────────────────────────────
async function addInternalNote(applicationId, note, adminUser) {
    const application = await GpApplication.findById(applicationId);
    if (!application) {
        throw Object.assign(new Error('Application not found.'), { statusCode: 404 });
    }

    application.internalNotes.push({
        note,
        addedBy: adminUser._id,
        addedAt: new Date(),
    });
    await application.save();

    return application;
}

// ─── Export CSV (excludes not_qualified) ─────────────────────────────────────
async function exportApplicationsCsv(filters = {}) {
    const query = buildAdminFilterQuery(filters);
    // Never export not_qualified applications
    query.adminQualificationStatus = { $ne: 'not_qualified' };

    const applications = await GpApplication.find(query)
        .populate('userId', 'email name')
        .populate('ownedBy', 'name email')
        .lean();

    // Convert to CSV rows
    const headers = [
        'Unique ID', 'Company Name', 'Contact Name', 'Email',
        'Progress Status', 'Qualification Status', 'Database Status',
        'Deck Uploaded', 'Last Activity', 'Owner',
    ];

    const rows = applications.map((app) => [
        app.uniqueId,
        app.companyName || '',
        app.primaryContactName || '',
        app.primaryContactEmail || '',
        app.applicantProgressStatus,
        app.adminQualificationStatus,
        app.databaseStatus,
        app.documents?.deckUrl ? 'Yes' : 'No',
        app.lastActivityAt?.toISOString() || '',
        app.ownedBy?.name || '',
    ]);

    return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

module.exports = {
    getApplicationsForAdmin,
    getApplicationDetail,
    updateApplicationStep,
    submitApplication,
    updateQualificationStatus,
    changeOwner,
    addInternalNote,
    exportApplicationsCsv,
    buildAdminFilterQuery,
};
