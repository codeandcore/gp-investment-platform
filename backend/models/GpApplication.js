"use strict";

const mongoose = require("mongoose");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    bio: { type: String, trim: true },
    headshotUrl: { type: String },
  },
  { _id: true },
);

const documentsSchema = new mongoose.Schema(
  {
    deckUrl: { type: String },
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
  { _id: false },
);

// ─── Ownership history entry ────────────────────────────────────────────────
const ownershipEntrySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    startedAt: { type: Date, default: Date.now },
    transferredBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String, trim: true, default: null },
      email: { type: String, trim: true, lowercase: true, default: null },
    },
    endedAt: { type: Date, default: null }, // null = current owner
  },
  { _id: true },
);

// ─── Step tracking schema ──────────────────────────────────────────────────────
const stepStatusSchema = new mongoose.Schema(
  {
    step1Completed: { type: Boolean, default: false },
    step2Completed: { type: Boolean, default: false },
    step3Completed: { type: Boolean, default: false },
    step4Completed: { type: Boolean, default: false },
    step5Completed: { type: Boolean, default: false },
    lastCompletedStep: { type: Number, default: 0, min: 0, max: 5 },
  },
  { _id: false },
);

// ─── Per-step data storage (submittedAt is embedded inside each stepNData object)
const stepDataSchema = new mongoose.Schema(
  {
    step1Data: { type: mongoose.Schema.Types.Mixed, default: {} },
    step2Data: { type: mongoose.Schema.Types.Mixed, default: {} },
    step3Data: { type: mongoose.Schema.Types.Mixed, default: {} },
    step4Data: { type: mongoose.Schema.Types.Mixed, default: {} },
    step5Data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
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
      ref: "User",
      required: true,
      index: true,
    },
    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // ── Ownership history (full transfer chain) ──
    ownershipHistory: { type: [ownershipEntrySchema], default: [] },

    // ── STEP 1: Basic Info ──
    companyName: { type: String, trim: true, index: true },
    primaryContactName: { type: String, trim: true, index: true },
    primaryContactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    primaryContactPhone: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    headquarters: { type: String, trim: true },
    yearFounded: { type: Number },
    legalStructure: { type: String, trim: true },

    // ── STEP 2: Team Composition ──
    teamMembers: [teamMemberSchema],
    teamSize: { type: Number },

    // ── STEP 3: Strategy & Track Record ──
    strategy: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── STEP 4: Portfolio / Documents ──
    documents: documentsSchema,

    // ── STEP 5: Database opt-in & submission info ──
    databaseOptIn: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    profileHeadline: { type: String, trim: true },
    profileSummary: { type: String, trim: true },
    allowDeck: { type: Boolean, default: false },
    allowTrackRecord: { type: Boolean, default: false },

    // ── Step tracking ──
    stepStatus: { type: stepStatusSchema, default: () => ({}) },

    // ── Per-step raw form data + timestamps ──
    stepData: { type: stepDataSchema, default: () => ({}) },

    // ── Applicant progress (system-controlled) ──
    applicantProgressStatus: {
      type: String,
      enum: ["started", "submitted"],
      default: "started",
      index: true,
    },
    submittedAt: { type: Date },

    // ── Admin qualification (manual) ──
    adminQualificationStatus: {
      type: String,
      enum: ["pending", "qualified", "not_qualified", "attending_raise"],
      default: "pending",
      index: true,
    },

    // ── Database opt-in (manual) ──
    databaseStatus: {
      type: String,
      enum: ["opted_in", "not_opted_in"],
      default: "not_opted_in",
      index: true,
    },

    // ── Activity tracking ──
    lastActivityAt: { type: Date, default: Date.now, index: true },

    // ── Internal notes (admins only) ──
    internalNotes: [
      {
        note: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Soft delete ──
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Virtual: deck uploaded flag ───────────────────────────────────────────────
gpApplicationSchema.virtual("isDeckUploaded").get(function () {
  return !!(this.documents && this.documents.deckUrl);
});

// ── Business logic validation ─────────────────────────────────────────────────
gpApplicationSchema.pre("save", function (next) {
  this.lastActivityAt = new Date();
  next();
});

// ── Auto-generate uniqueId ────────────────────────────────────────────────────
gpApplicationSchema.pre("validate", async function (next) {
  if (this.isNew && !this.uniqueId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.uniqueId = `GP-${date}-${rand}`;
  }
  next();
});

// ── Compound indexes for common admin queries ─────────────────────────────────
gpApplicationSchema.index({
  applicantProgressStatus: 1,
  adminQualificationStatus: 1,
});
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

const GpApplication = mongoose.model("GpApplication", gpApplicationSchema);

module.exports = GpApplication;
