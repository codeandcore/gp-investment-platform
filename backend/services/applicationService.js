"use strict";

const GpApplication = require("../models/GpApplication");
const User = require("../models/User");
const { logAuditEvent } = require("./auditService");
const ApplicationActivityLog = require("../models/ApplicationActivityLog");
const { sendEmail } = require("./emailService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
  if (filters.deckUploaded === "true" || filters.deckUploaded === true) {
    query["documents.deckUrl"] = { $exists: true, $ne: null };
  } else if (
    filters.deckUploaded === "false" ||
    filters.deckUploaded === false
  ) {
    query["$or"] = [
      { "documents.deckUrl": { $exists: false } },
      { "documents.deckUrl": null },
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
    const regex = new RegExp(filters.search, "i");
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
  const {
    page = 1,
    limit = 20,
    sortBy = "lastActivityAt",
    sortDir = -1,
  } = pagination;
  const skip = (page - 1) * Math.min(limit, 100); // cap at 100 per page

  const query = buildAdminFilterQuery(filters);

  const [applications, total] = await Promise.all([
    GpApplication.find(query)
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .populate("userId", "email name")
      .populate("ownedBy", "name email")
      .select("-internalNotes -teamMembers -strategy") // Lightweight for list view
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
    .populate("userId", "email name")
    .populate("ownedBy", "name email")
    .populate("internalNotes.addedBy", "name email")
    .lean();

  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }

  return application;
}

// ─── Extract email domain ─────────────────────────────────────────────────────
function extractDomain(email) {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1].toLowerCase();
}

// ─── Check company domain conflict ───────────────────────────────────────────
/**
 * Check if there's an existing active application for the same company domain.
 * Returns { conflict: false } or { conflict: true, existingApplication, ownerUser }
 */
async function checkCompanyDomainConflict(userId) {
  const user = await User.findById(userId).lean();
  if (!user || !user.email) return { conflict: false };

  const domain = extractDomain(user.email);
  if (!domain) return { conflict: false };

  // Find all users with same domain (excluding current user)
  const samedomainUsers = await User.find({
    email: { $regex: new RegExp(`@${domain.replace(/\./g, "\\.")}$`, "i") },
    _id: { $ne: userId },
    deletedAt: null,
  })
    .select("_id email name")
    .lean();

  if (samedomainUsers.length === 0) return { conflict: false };

  const samedomainUserIds = samedomainUsers.map((u) => u._id);

  // Find any active (started) application owned by those users
  const existingApplication = await GpApplication.findOne({
    userId: { $in: samedomainUserIds },
    applicantProgressStatus: { $in: ["started", "submitted"] },
    deletedAt: null,
  })
    .populate("userId", "email name")
    .lean();

  if (!existingApplication) return { conflict: false };

  // Check if this user already has a pending access request for this application
  const hasRequested = await ApplicationActivityLog.findOne({
    applicationId: existingApplication._id,
    userId,
    eventType: "ACCESS_REQUESTED",
  }).lean();

  // Check if access was already granted (meaning their request was processed)
  const wasGranted = hasRequested
    ? await ApplicationActivityLog.findOne({
        applicationId: existingApplication._id,
        eventType: "ACCESS_GRANTED",
        "metadata.newOwnerId": String(userId),
      }).lean()
    : null;

  const pendingRequest = !!(hasRequested && !wasGranted);
  const applicationSubmitted =
    existingApplication.applicantProgressStatus === "submitted";

  return {
    conflict: true,
    existingApplication,
    ownerUser: existingApplication.userId,
    pendingRequest,
    applicationSubmitted,
  };
}

// ─── Create or get application (idempotent) ──────────────────────────────────
async function createOrGetApplication(userId) {
  // Return existing active application if this user already owns one
  let application = await GpApplication.findOne({
    userId,
    applicantProgressStatus: "started",
    deletedAt: null,
  });
  // If found but has zero progress, check for domain conflict first
  // (handles old auto-created empty applications)
  if (application) {
    const hasNoProgress =
      (application.stepStatus?.lastCompletedStep || 0) === 0;
    if (hasNoProgress) {
      const conflictCheck = await checkCompanyDomainConflict(userId);
      if (
        conflictCheck.conflict &&
        (conflictCheck.existingApplication.stepStatus?.lastCompletedStep || 0) >
          0
      ) {
        // Soft-delete this empty application, block the user
        await GpApplication.updateOne(
          { _id: application._id },
          { $set: { deletedAt: new Date(), deletedBy: userId } },
        );
        return {
          conflict: true,
          existingApplication: conflictCheck.existingApplication,
          ownerUser: conflictCheck.ownerUser,
        };
      }
    }
    return { application, conflict: false };
  }

  // Check for domain conflict before creating
  const conflictCheck = await checkCompanyDomainConflict(userId);
  if (conflictCheck.conflict) {
    return {
      conflict: true,
      existingApplication: conflictCheck.existingApplication,
      ownerUser: conflictCheck.ownerUser,
    };
  }

  // Fetch user details for ownership history
  const user = await User.findById(userId).select("name email").lean();

  // Create fresh draft
  application = new GpApplication({
    userId,
    ownershipHistory: [
      {
        ownerId: userId,
        ownerName: user?.name || null,
        ownerEmail: user?.email || null,
        startedAt: new Date(),
        transferredBy: { id: null, name: null, email: null },
        endedAt: null,
      },
    ],
  });
  await application.save();

  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId,
    eventType: "APPLICATION_CREATED",
    description: "New application draft created",
  });

  return { application, conflict: false };
}

// ─── Reset (start new) application ───────────────────────────────────────────
async function resetApplication(userId) {
  // Soft-delete all existing started applications for this user
  await GpApplication.updateMany(
    { userId, applicantProgressStatus: "started" },
    { $set: { deletedAt: new Date(), deletedBy: userId } },
  );

  // Fetch user for ownership history
  const user = await User.findById(userId).select("name email").lean();

  // Create fresh draft
  const application = new GpApplication({
    userId,
    ownershipHistory: [
      {
        ownerId: userId,
        ownerName: user?.name || null,
        ownerEmail: user?.email || null,
        startedAt: new Date(),
        transferredBy: { id: null, name: null, email: null },
        endedAt: null,
      },
    ],
  });
  await application.save();

  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId,
    eventType: "APPLICATION_RESET",
    description: "Previous application discarded; new draft created",
  });

  return application;
}

// ─── Update step (GP-facing) ──────────────────────────────────────────────────
async function updateApplicationStep(
  applicationId,
  userId,
  stepNumber,
  formData,
) {
  const application = await GpApplication.findOne({
    _id: applicationId,
    userId,
  });

  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }
  if (application.applicantProgressStatus === "submitted") {
    throw Object.assign(new Error("Application is locked after submission."), {
      statusCode: 403,
    });
  }

  // ── Save form data with submittedAt embedded inside the step data object ──
  if (!application.stepData) application.stepData = {};
  application.stepData[`step${stepNumber}Data`] = {
    ...formData,
    submittedAt: new Date(),
  };
  application.markModified("stepData");

  // ── Mark step completed ──
  application.stepStatus[`step${stepNumber}Completed`] = true;
  application.stepStatus.lastCompletedStep = Math.max(
    application.stepStatus.lastCompletedStep || 0,
    stepNumber,
  );
  application.markModified("stepStatus");

  await application.save();

  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId,
    eventType: "STEP_SAVED",
    step: stepNumber,
    description: `Step ${stepNumber} data saved`,
  });

  return application;
}

// ─── Submit application ───────────────────────────────────────────────────────
async function submitApplication(applicationId, userId) {
  const application = await GpApplication.findOne({
    _id: applicationId,
    userId,
  });

  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }
  if (application.applicantProgressStatus === "submitted") {
    throw Object.assign(new Error("Application already submitted."), {
      statusCode: 409,
    });
  }

  // Validate all 5 steps completed
  const s = application.stepStatus;
  if (
    !s.step1Completed ||
    !s.step2Completed ||
    !s.step3Completed ||
    !s.step4Completed ||
    !s.step5Completed
  ) {
    throw Object.assign(
      new Error("Please complete all required steps before submitting."),
      {
        statusCode: 422,
      },
    );
  }

  application.applicantProgressStatus = "submitted";
  application.submittedAt = new Date();
  await application.save();

  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId,
    eventType: "APPLICATION_SUBMITTED",
    description: "Application submitted by GP",
  });

  return application;
}

// ─── Admin: update qualification status ──────────────────────────────────────
async function updateQualificationStatus(
  applicationId,
  newStatus,
  adminUser,
  req,
) {
  const application = await GpApplication.findById(applicationId);
  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }

  // Business rule: attending_raise requires qualified first
  if (
    newStatus === "attending_raise" &&
    application.adminQualificationStatus !== "qualified"
  ) {
    throw Object.assign(
      new Error(
        "Application must be qualified before setting attending_raise.",
      ),
      { statusCode: 422 },
    );
  }

  const previousValue = application.adminQualificationStatus;
  application.adminQualificationStatus = newStatus;
  await application.save();

  await logAuditEvent({
    entityType: "GpApplication",
    entityId: application._id,
    action: "STATUS_CHANGED",
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
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }

  const previousOwner = application.ownedBy;
  const now = new Date();

  // Fetch new owner user details
  const newOwnerUser = await User.findById(newOwnerId)
    .select("name email")
    .lean();

  // Close out current ownership entry
  if (application.ownershipHistory && application.ownershipHistory.length > 0) {
    const lastEntry =
      application.ownershipHistory[application.ownershipHistory.length - 1];
    if (!lastEntry.endedAt) {
      lastEntry.endedAt = now;
      application.markModified("ownershipHistory");
    }
  }

  // Push new ownership entry
  application.ownershipHistory.push({
    ownerId: newOwnerId,
    ownerName: newOwnerUser?.name || null,
    ownerEmail: newOwnerUser?.email || null,
    startedAt: now,
    transferredBy: {
      id: adminUser._id,
      name: adminUser.name || null,
      email: adminUser.email || null,
    },
    endedAt: null,
  });

  application.ownedBy = newOwnerId;
  application.userId = newOwnerId;
  await application.save();

  await logAuditEvent({
    entityType: "GpApplication",
    entityId: application._id,
    action: "OWNER_CHANGED",
    performedBy: adminUser._id,
    previousValue: { ownedBy: previousOwner },
    newValue: { ownedBy: newOwnerId },
    req,
  });

  return application;
}

// ─── GP: request access to another user’s application ────────────────────────────────
/**
 * 1. Generates a signed JWT grant-token (24h) encoding { applicationId, requestingUserId }
 * 2. Logs the request in ApplicationActivityLog with the token hash
 * 3. Emails the application owner with a "Grant Access" button
 */
async function requestAccess(applicationId, requestingUserId) {
  const application = await GpApplication.findById(applicationId)
    .populate("userId", "name email")
    .lean();
  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }

  const requester = await User.findById(requestingUserId)
    .select("name email")
    .lean();

  // Generate a signed grant token (24h expiry)
  const grantToken = jwt.sign(
    {
      applicationId: String(applicationId),
      requestingUserId: String(requestingUserId),
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(grantToken)
    .digest("hex");

  // Log the access request (store token hash for idempotency)
  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId: requestingUserId,
    eventType: "ACCESS_REQUESTED",
    description: `GP ${requester?.email} requested access`,
    metadata: { tokenHash },
  });

  // Get company name from step1Data or fallback
  const companyName =
    application.stepData?.step1Data?.companyName ||
    application.companyName ||
    "your firm";

  // Build grant link — points to the FRONTEND page which proxies to backend
  // This way the link always works on port 3000 regardless of backend port
  const grantLink = `${process.env.MAGIC_LINK_BASE_URL}/apply/grant-access?token=${encodeURIComponent(grantToken)}`;

  // Email the current owner
  const ownerEmail = application.userId?.email;
  console.log(
    "[requestAccess] ownerEmail:",
    ownerEmail,
    "grantLink:",
    grantLink,
  );

  if (!ownerEmail) {
    console.error(
      "[requestAccess] No owner email found — application.userId:",
      application.userId,
    );
  } else {
    try {
      await sendEmail({
        to: ownerEmail,
        templateName: "access_request_to_owner",
        templateData: {
          ownerName: application.userId?.name || ownerEmail,
          requesterName: requester?.name || requester?.email || "A colleague",
          requesterEmail: requester?.email,
          companyName,
          grantLink,
        },
        relatedEntityId: application._id,
        triggeredBy: requestingUserId,
      });
      console.log("[requestAccess] Email sent successfully to", ownerEmail);
    } catch (emailErr) {
      console.error(
        "[requestAccess] Failed to send access request email:",
        emailErr,
      );
    }
  }

  return { success: true };
}

// ─── Owner grants access (called via token link in email) ────────────────────────────
/**
 * 1. Verify and decode JWT grant-token
 * 2. Transfer the application’s userId to the requester
 * 3. Update ownershipHistory
 * 4. Email the requester with a "Continue Application" link
 * Returns: { redirectUrl } — the frontend step URL the requester should land on
 */
async function grantAccess(grantToken) {
  // Verify token
  let payload;
  try {
    payload = jwt.verify(grantToken, process.env.JWT_SECRET);
  } catch {
    throw Object.assign(
      new Error("This grant link is invalid or has expired (24h window)."),
      { statusCode: 400 },
    );
  }

  const { applicationId, requestingUserId } = payload;

  const application = await GpApplication.findById(applicationId)
    .populate("userId", "name email")
    .lean();
  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
  }

  const requester = await User.findById(requestingUserId)
    .select("name email")
    .lean();
  if (!requester) {
    throw Object.assign(new Error("Requesting user not found."), {
      statusCode: 404,
    });
  }

  const previousOwnerId = application.userId?._id || application.userId;
  const previousOwnerUser = application.userId; // populated
  const now = new Date();

  const companyName =
    application.stepData?.step1Data?.companyName ||
    application.companyName ||
    "your firm";

  const lastCompletedStep = application.stepStatus?.lastCompletedStep || 0;
  const continueStep = Math.min(lastCompletedStep + 1, 5);

  // Update application ownership
  const appDoc = await GpApplication.findById(applicationId);

  // Close current ownership entry
  if (appDoc.ownershipHistory && appDoc.ownershipHistory.length > 0) {
    const last = appDoc.ownershipHistory[appDoc.ownershipHistory.length - 1];
    if (!last.endedAt) {
      last.endedAt = now;
      appDoc.markModified("ownershipHistory");
    }
  }

  // Push new ownership entry (transferred by current owner via email grant)
  appDoc.ownershipHistory.push({
    ownerId: requestingUserId,
    ownerName: requester.name || null,
    ownerEmail: requester.email || null,
    startedAt: now,
    transferredBy: {
      id: previousOwnerId,
      name: previousOwnerUser?.name || null,
      email: previousOwnerUser?.email || null,
    },
    endedAt: null,
  });

  appDoc.userId = requestingUserId;
  appDoc.ownedBy = requestingUserId;
  await appDoc.save();

  await ApplicationActivityLog.create({
    applicationId: application._id,
    userId: previousOwnerId,
    eventType: "ACCESS_GRANTED",
    description: `Owner granted access to ${requester.email}. Step ${continueStep}.`,
    metadata: { newOwnerId: String(requestingUserId) },
  });

  // Email the requester with their continue link
  const continueLink = `${process.env.MAGIC_LINK_BASE_URL}/apply/step/${continueStep}`;

  try {
    await sendEmail({
      to: requester.email,
      templateName: "access_granted",
      templateData: {
        requesterName: requester.name || requester.email,
        ownerName:
          previousOwnerUser?.name || previousOwnerUser?.email || "The owner",
        companyName,
        continueLink,
        stepNumber: continueStep,
      },
      relatedEntityId: application._id,
      triggeredBy: previousOwnerId,
    });
  } catch (emailErr) {
    console.error("Failed to send access granted email:", emailErr.message);
  }

  // Return redirect URL for the browser (owner is redirected after clicking)
  return {
    redirectUrl: `${process.env.MAGIC_LINK_BASE_URL}/apply/step/${continueStep}`,
    requesterEmail: requester.email,
    companyName,
    continueStep,
  };
}

// ─── Admin: add internal note ─────────────────────────────────────────────────
async function addInternalNote(applicationId, note, adminUser) {
  const application = await GpApplication.findById(applicationId);
  if (!application) {
    throw Object.assign(new Error("Application not found."), {
      statusCode: 404,
    });
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
  query.adminQualificationStatus = { $ne: "not_qualified" };

  const applications = await GpApplication.find(query)
    .populate("userId", "email name")
    .populate("ownedBy", "name email")
    .lean();

  // Convert to CSV rows
  const headers = [
    "Unique ID",
    "Company Name",
    "Contact Name",
    "Email",
    "Progress Status",
    "Qualification Status",
    "Database Status",
    "Deck Uploaded",
    "Last Activity",
    "Owner",
  ];

  const rows = applications.map((app) => [
    app.uniqueId,
    app.companyName || "",
    app.primaryContactName || "",
    app.primaryContactEmail || "",
    app.applicantProgressStatus,
    app.adminQualificationStatus,
    app.databaseStatus,
    app.documents?.deckUrl ? "Yes" : "No",
    app.lastActivityAt?.toISOString() || "",
    app.ownedBy?.name || "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

module.exports = {
  createOrGetApplication,
  resetApplication,
  getApplicationsForAdmin,
  getApplicationDetail,
  updateApplicationStep,
  submitApplication,
  updateQualificationStatus,
  changeOwner,
  requestAccess,
  grantAccess,
  addInternalNote,
  exportApplicationsCsv,
  buildAdminFilterQuery,
  checkCompanyDomainConflict,
};
