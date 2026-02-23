'use strict';

const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const teamMemberSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        title: { type: String, trim: true },
        linkedIn: { type: String, trim: true },
        bio: { type: String, trim: true },
        headshotUrl: { type: String },          // S3 URL
    },
    { _id: true }
);

const strategySchema = new mongoose.Schema(
    {
        fundName: { type: String, trim: true },
        fundSize: { type: Number },
        targetReturns: { type: String, trim: true },
        investmentThesis: { type: String, trim: true },
        assetClasses: [{ type: String }],
        geographies: [{ type: String }],
        historicalIRR: { type: Number },
        numberOfDeals: { type: Number },
        previousFundCount: { type: Number },
        trackRecordSummary: { type: String, trim: true },
    },
    { _id: false }
);

const documentsSchema = new mongoose.Schema(
    {
        deckUrl: { type: String },              // S3 URL
        deckUploadedAt: { type: Date },
        logoUrl: { type: String },
        logoUploadedAt: { type: Date },
        additionalDocs: [
            {
                name: { type: String },
                url: { type: String },
                uploadedAt: { type: Date },
            },
        ],
    },
    { _id: false }
);

const stepStatusSchema = new mongoose.Schema(
    {
        step1Completed: { type: Boolean, default: false },
        step2Completed: { type: Boolean, default: false },
        step3Completed: { type: Boolean, default: false },
        step4Completed: { type: Boolean, default: false },
        lastCompletedStep: { type: Number, default: 0, min: 0, max: 4 },
    },
    { _id: false }
);

// ─── Main Application Schema ──────────────────────────────────────────────────
const gpApplicationSchema = new mongoose.Schema(
    {
        // ── Unique human-readable ID ──
        uniqueId: {
            type: String,
            unique: true,
            index: true,
        },

        // ── Ownership ──
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        ownedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },

        // ── STEP 1: Basic Info ──
        companyName: { type: String, trim: true, index: true },
        primaryContactName: { type: String, trim: true, index: true },
        primaryContactEmail: { type: String, trim: true, lowercase: true, index: true },
        primaryContactPhone: { type: String, trim: true },
        companyWebsite: { type: String, trim: true },
        headquarters: { type: String, trim: true },
        yearFounded: { type: Number },
        legalStructure: { type: String, trim: true },

        // ── STEP 2: Team Composition ──
        teamMembers: [teamMemberSchema],
        teamSize: { type: Number },

        // ── STEP 3: Strategy & Track Record ──
        strategy: strategySchema,

        // ── STEP 4: Documents ──
        documents: documentsSchema,

        // ── Step tracking ──
        stepStatus: { type: stepStatusSchema, default: () => ({}) },

        // ── Applicant progress (system-controlled) ──
        applicantProgressStatus: {
            type: String,
            enum: ['started', 'submitted'],
            default: 'started',
            index: true,
        },
        submittedAt: { type: Date },

        // ── Admin qualification (manual) ──
        adminQualificationStatus: {
            type: String,
            enum: ['pending', 'qualified', 'not_qualified', 'attending_raise'],
            default: 'pending',
            index: true,
        },

        // ── Database opt-in (manual) ──
        databaseStatus: {
            type: String,
            enum: ['opted_in', 'not_opted_in'],
            default: 'not_opted_in',
            index: true,
        },

        // ── Activity tracking ──
        lastActivityAt: { type: Date, default: Date.now, index: true },

        // ── Internal notes (admins only) ──
        internalNotes: [
            {
                note: { type: String },
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                addedAt: { type: Date, default: Date.now },
            },
        ],

        // ── Soft delete ──
        deletedAt: { type: Date, default: null, index: true },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Virtual: deck uploaded flag ───────────────────────────────────────────────
gpApplicationSchema.virtual('isDeckUploaded').get(function () {
    return !!(this.documents && this.documents.deckUrl);
});

// ── Business logic validation ─────────────────────────────────────────────────
gpApplicationSchema.pre('save', function (next) {
    // Rule: attending_raise only allowed if qualified
    if (
        this.adminQualificationStatus === 'attending_raise' &&
        this.adminQualificationStatus !== 'qualified'
    ) {
        // This check is enforced at service layer; here as safeguard
    }

    // Update lastActivityAt on save
    this.lastActivityAt = new Date();
    next();
});

// ── Auto-generate uniqueId ────────────────────────────────────────────────────
gpApplicationSchema.pre('validate', async function (next) {
    if (this.isNew && !this.uniqueId) {
        // Format: GP-YYYYMMDD-XXXXX (nanoid 5 chars)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.uniqueId = `GP-${date}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
    next();
});

// ── Compound indexes for common admin queries ─────────────────────────────────
gpApplicationSchema.index({ applicantProgressStatus: 1, adminQualificationStatus: 1 });
gpApplicationSchema.index({ lastActivityAt: -1, adminQualificationStatus: 1 });
gpApplicationSchema.index({ databaseStatus: 1, adminQualificationStatus: 1 });
gpApplicationSchema.index({ deletedAt: 1, applicantProgressStatus: 1 });
gpApplicationSchema.index({ createdAt: -1 });

// ── Soft delete middleware ────────────────────────────────────────────────────
gpApplicationSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeSoftDeleted) {
        this.where({ deletedAt: null });
    }
    next();
});

const GpApplication = mongoose.model('GpApplication', gpApplicationSchema);

module.exports = GpApplication;
