"use strict";

const express = require("express");
const multer = require("multer");
const { authenticate, authorize } = require("../middleware/auth");
const {
  applicationValidators,
  adminValidators,
} = require("../middleware/validate");
const {
  createApplication,
  resetApplication,
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
} = require("../controllers/applicationController");

const router = express.Router();

// Multer: memory storage for direct S3 upload (no temp disk files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// ─── GP routes ─────────────────────────────────────────────────────────────────

// POST /api/applications  — create or get existing draft (idempotent)
router.post("/", authenticate, authorize("gp"), createApplication);

// POST /api/applications/reset  — discard current draft and start fresh
router.post("/reset", authenticate, authorize("gp"), resetApplication);

// GET /api/applications/my
router.get("/my", authenticate, authorize("gp"), getMyApplication);

// PUT /api/applications/:id/step/:stepNumber  (steps 1-5)
router.put("/:id/step/:stepNumber", authenticate, authorize("gp"), saveStep);

// POST /api/applications/:id/submit
router.post("/:id/submit", authenticate, authorize("gp"), submitApplication);

// POST /api/applications/:id/upload/:fileType
router.post(
  "/:id/upload/:fileType",
  authenticate,
  authorize("gp", "admin"),
  upload.single("file"),
  uploadFile,
);

// ─── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/applications (admin list with filters)
router.get(
  "/",
  authenticate,
  authorize("admin", "reviewer"),
  adminValidators.listApplications,
  listApplications,
);

// GET /api/applications/export/csv
router.get("/export/csv", authenticate, authorize("admin"), exportCsv);

// POST /api/applications/bulk-action
router.post("/bulk-action", authenticate, authorize("admin"), bulkAction);

// GET /api/applications/:id
router.get(
  "/:id",
  authenticate,
  authorize("admin", "reviewer"),
  getApplicationDetail,
);

// PATCH /api/applications/:id/qualification-status
router.patch(
  "/:id/qualification-status",
  authenticate,
  authorize("admin"),
  adminValidators.qualificationStatus,
  updateQualificationStatus,
);

router.patch(
  "/:id/database-status",
  authenticate,
  authorize("admin"),
  updateDatabaseStatus,
);

// PATCH /api/applications/:id/owner
router.patch(
  "/:id/owner",
  authenticate,
  authorize("admin"),
  adminValidators.changeOwner,
  changeOwner,
);

// POST /api/applications/:id/notes
router.post(
  "/:id/notes",
  authenticate,
  authorize("admin"),
  adminValidators.addNote,
  addNote,
);

// GET /api/applications/:id/audit-log
router.get("/:id/audit-log", authenticate, authorize("admin"), getAuditLog);

module.exports = router;
