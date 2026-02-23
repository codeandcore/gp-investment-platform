'use strict';

const applicationService = require('../services/applicationService');
const storageService = require('../services/storageService');
const auditService = require('../services/auditService');
const ApplicationActivityLog = require('../models/ApplicationActivityLog');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GP controllers ───────────────────────────────────────────────────────────

/**
 * GET /api/applications/my
 * GP: get own application.
 */
const getMyApplication = asyncHandler(async (req, res) => {
    const GpApplication = require('../models/GpApplication');
    const application = await GpApplication.findOne({ userId: req.user._id }).lean();

    if (!application) {
        return res.status(404).json({ success: false, message: 'No application found.' });
    }

    res.status(200).json({ success: true, application });
});

/**
 * PUT /api/applications/:id/step/:stepNumber
 * GP: save a step's data (auto-save).
 */
const saveStep = asyncHandler(async (req, res) => {
    const { id, stepNumber } = req.params;
    const step = parseInt(stepNumber, 10);

    if (isNaN(step) || step < 1 || step > 4) {
        return res.status(400).json({ success: false, message: 'Step must be between 1 and 4.' });
    }

    const application = await applicationService.updateApplicationStep(
        id,
        req.user._id,
        step,
        req.body
    );

    res.status(200).json({ success: true, application });
});

/**
 * POST /api/applications/:id/submit
 * GP: final submission.
 */
const submitApplication = asyncHandler(async (req, res) => {
    const application = await applicationService.submitApplication(req.params.id, req.user._id);
    res.status(200).json({ success: true, application, message: 'Application submitted successfully.' });
});

/**
 * POST /api/applications/:id/upload/:fileType
 * GP: upload deck, logo, or headshot.
 */
const uploadFile = asyncHandler(async (req, res) => {
    const { id, fileType } = req.params;
    const GpApplication = require('../models/GpApplication');

    if (!['deck', 'logo', 'headshot'].includes(fileType)) {
        return res.status(400).json({ success: false, message: 'Invalid file type.' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const application = await GpApplication.findOne({ _id: id, userId: req.user._id });
    if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (application.applicantProgressStatus === 'submitted') {
        return res.status(403).json({ success: false, message: 'Application is locked.' });
    }

    const { url, key } = await storageService.uploadToS3(req.file, fileType, id);

    // Save URL to application
    if (!application.documents) application.documents = {};

    if (fileType === 'deck') {
        application.documents.deckUrl = url;
        application.documents.deckUploadedAt = new Date();
    } else if (fileType === 'logo') {
        application.documents.logoUrl = url;
        application.documents.logoUploadedAt = new Date();
    }

    await application.save();

    await ApplicationActivityLog.create({
        applicationId: id,
        userId: req.user._id,
        eventType: 'FILE_UPLOADED',
        description: `${fileType} uploaded`,
        metadata: { url, key },
    });

    res.status(200).json({ success: true, url, message: `${fileType} uploaded successfully.` });
});

// ─── Admin controllers ────────────────────────────────────────────────────────

/**
 * GET /api/admin/applications
 * Admin: paginated + filtered list.
 */
const listApplications = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortDir, ...filters } = req.query;
    const result = await applicationService.getApplicationsForAdmin(filters, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        sortBy: sortBy || 'lastActivityAt',
        sortDir: sortDir === 'asc' ? 1 : -1,
    });

    res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/admin/applications/:id
 * Admin: full application detail.
 */
const getApplicationDetail = asyncHandler(async (req, res) => {
    const application = await applicationService.getApplicationDetail(req.params.id);
    res.status(200).json({ success: true, application });
});

/**
 * PATCH /api/admin/applications/:id/qualification-status
 * Admin: set qualification status.
 */
const updateQualificationStatus = asyncHandler(async (req, res) => {
    const application = await applicationService.updateQualificationStatus(
        req.params.id,
        req.body.status,
        req.user,
        req
    );
    res.status(200).json({ success: true, application });
});

/**
 * PATCH /api/admin/applications/:id/database-status
 * Admin: opt in/out.
 */
const updateDatabaseStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['opted_in', 'not_opted_in'].includes(status)) {
        return res.status(422).json({ success: false, message: 'Invalid database status.' });
    }

    const GpApplication = require('../models/GpApplication');
    const application = await GpApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Not found.' });

    const previous = application.databaseStatus;
    application.databaseStatus = status;
    await application.save();

    await auditService.logAuditEvent({
        entityType: 'GpApplication',
        entityId: application._id,
        action: 'DATABASE_STATUS_CHANGED',
        performedBy: req.user._id,
        previousValue: { databaseStatus: previous },
        newValue: { databaseStatus: status },
        req,
    });

    res.status(200).json({ success: true, application });
});

/**
 * PATCH /api/admin/applications/:id/owner
 * Admin: change owner.
 */
const changeOwner = asyncHandler(async (req, res) => {
    const application = await applicationService.changeOwner(
        req.params.id,
        req.body.ownerId,
        req.user,
        req
    );
    res.status(200).json({ success: true, application });
});

/**
 * POST /api/admin/applications/:id/notes
 * Admin: add internal note.
 */
const addNote = asyncHandler(async (req, res) => {
    const application = await applicationService.addInternalNote(
        req.params.id,
        req.body.note,
        req.user
    );
    res.status(201).json({ success: true, message: 'Note added.', application });
});

/**
 * GET /api/admin/applications/:id/audit-log
 * Admin: view audit log for an application.
 */
const getAuditLog = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await auditService.getEntityTimeline('GpApplication', req.params.id, {
        page: Number(page) || 1,
        limit: Number(limit) || 50,
    });
    res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/admin/applications/export/csv
 * Admin: export CSV (excludes not_qualified).
 */
const exportCsv = asyncHandler(async (req, res) => {
    const csv = await applicationService.exportApplicationsCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gp-applications-${Date.now()}.csv"`);
    res.status(200).send(csv);
});

/**
 * POST /api/admin/applications/bulk-action
 * Admin: bulk send reminders / opt-in nudges (simplified).
 */
const bulkAction = asyncHandler(async (req, res) => {
    const { action, applicationIds } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No applications selected.' });
    }

    const GpApplication = require('../models/GpApplication');
    const { sendBulkEmails } = require('../services/emailService');

    const applications = await GpApplication.find({ _id: { $in: applicationIds } })
        .populate('userId', 'email name')
        .lean();

    let emailJobs = [];

    if (action === 'send_reminder') {
        emailJobs = applications
            .filter((a) => a.applicantProgressStatus === 'started')
            .map((app) => ({
                to: app.primaryContactEmail || app.userId.email,
                templateName: 'application_reminder',
                templateData: {
                    gpName: app.primaryContactName || app.userId.name,
                    applicationLink: `${process.env.MAGIC_LINK_BASE_URL}/apply`,
                },
                relatedEntityId: app._id,
                triggeredBy: req.user._id,
            }));
    } else if (action === 'send_opt_in_nudge') {
        emailJobs = applications
            .filter((a) => a.databaseStatus === 'not_opted_in')
            .map((app) => ({
                to: app.primaryContactEmail || app.userId.email,
                templateName: 'opt_in_nudge',
                templateData: {
                    gpName: app.primaryContactName || app.userId.name,
                    optInLink: `${process.env.MAGIC_LINK_BASE_URL}/apply/opt-in`,
                },
                relatedEntityId: app._id,
                triggeredBy: req.user._id,
            }));
    } else {
        return res.status(400).json({ success: false, message: `Unknown bulk action: ${action}` });
    }

    const results = await sendBulkEmails(emailJobs);
    const successCount = results.filter((r) => r.success).length;

    res.status(200).json({
        success: true,
        message: `Bulk action completed. ${successCount}/${emailJobs.length} emails sent.`,
        results,
    });
});

module.exports = {
    getMyApplication,
    saveStep,
    submitApplication,
    uploadFile,
    listApplications,
    getApplicationDetail,
    updateQualificationStatus,
    updateDatabaseStatus,
    changeOwner,
    addNote,
    getAuditLog,
    exportCsv,
    bulkAction,
};
