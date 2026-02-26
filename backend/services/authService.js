"use strict";

const User = require("../models/User");
const Session = require("../models/Session");
const GpApplication = require("../models/GpApplication");
const { sendMagicLinkEmail } = require("./emailService");
const { logAuditEvent } = require("./auditService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Common personal / free email domains — company emails only
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.in",
  "outlook.com",
  "outlook.in",
  "live.com",
  "live.in",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "yopmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
]);

// ─── Request magic link ───────────────────────────────────────────────────────
/**
 * 1. Validate email is a company domain (not gmail/yahoo/etc.)
 * 2. Find or create user by email
 * 3. Generate raw token → hash → store
 * 4. Send magic link email
 */
async function requestMagicLink(email) {
  // Block personal/free email addresses
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain || FREE_EMAIL_DOMAINS.has(emailDomain)) {
    throw Object.assign(
      new Error(
        "Please use your company email address. Personal email accounts (Gmail, Yahoo, Hotmail, etc.) are not allowed.",
      ),
      { statusCode: 422 },
    );
  }

  let user = await User.findOne({ email }).select(
    "+magicLinkTokenHash +magicLinkTokenExpiry +magicLinkRequestedAt",
  );

  // Rate-check: prevent spam (max 1 request per 60s)
  if (user?.magicLinkRequestedAt) {
    const secondsSinceLast =
      (Date.now() - user.magicLinkRequestedAt.getTime()) / 1000;
    if (secondsSinceLast < 60) {
      const waitSeconds = Math.ceil(60 - secondsSinceLast);
      throw Object.assign(
        new Error(
          `Please wait ${waitSeconds}s before requesting another link.`,
        ),
        {
          statusCode: 429,
        },
      );
    }
  }

  if (!user) {
    user = new User({ email, role: "gp" });
  }

  const rawToken = user.setMagicLinkToken();
  await user.save();
  console.log("user", user);

  // Fire-and-forget email (non-blocking) — but we await for auditability
  await sendMagicLinkEmail(email, rawToken);

  return { message: "Magic link sent. Check your email." };
}

// ─── Verify magic link token ──────────────────────────────────────────────────
/**
 * 1. Find user by email
 * 2. Verify raw token against hash
 * 3. Clear token (one-time use)
 * 4. Create server-side session + JWT
 * 5. Handle GP application routing
 */
async function verifyMagicLink(email, rawToken, req) {
  const user = await User.findOne({ email }).select(
    "+magicLinkTokenHash +magicLinkTokenExpiry +magicLinkRequestedAt",
  );

  if (!user) {
    throw Object.assign(new Error("Invalid or expired link."), {
      statusCode: 401,
    });
  }

  if (!user.verifyMagicLinkToken(rawToken)) {
    throw Object.assign(new Error("Invalid or expired link."), {
      statusCode: 401,
    });
  }

  // Invalidate token (one-time use)
  user.clearMagicLinkToken();
  user.lastLoginAt = new Date();
  await user.save();

  // ── Create session ──
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await Session.create({
    userId: user._id,
    sessionToken: crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex"),
    ipAddress: req?.ip,
    userAgent: req?.headers?.["user-agent"],
    expiresAt,
    isActive: true,
  });

  // ── Sign JWT ──
  const token = jwt.sign(
    { userId: user._id, role: user.role, sessionId: sessionToken.slice(0, 8) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  // ── GP routing logic ──
  let redirectPath = "/";
  let applicationState = null;

  if (user.role === "gp") {
    const application = await GpApplication.findOne({
      userId: user._id,
      deletedAt: null,
    });

    if (!application) {
      // No application yet — let the apply page handle creation (+ conflict detection)
      redirectPath = "/apply/step/1";
      applicationState = { status: "new" };
    } else if (application.applicantProgressStatus === "submitted") {
      // Submitted — always show the submitted/in-review screen
      const companyName = application.stepData?.step1Data?.companyName || "";
      redirectPath = `/apply/submitted?companyName=${encodeURIComponent(companyName)}`;
      applicationState = {
        status: "submitted",
        applicationId: application._id,
      };
    } else {
      // Draft in progress — always go to step/1 so the resume page is shown.
      // The step page detects lastCompletedStep > 0 and redirects to /apply/resume
      // which gives the user "Continue Application" or "Discard & Start New".
      redirectPath = "/apply/step/1";
      applicationState = { status: "draft", applicationId: application._id };
    }
  } else if (user.role === "admin") {
    redirectPath = "/admin/applications";
  } else if (user.role === "reviewer") {
    redirectPath = "/reviewer/assignments";
  }

  await logAuditEvent({
    entityType: "User",
    entityId: user._id,
    action: "LOGIN",
    performedBy: user._id,
    metadata: { email, role: user.role },
    req,
  });

  return {
    token,
    user: { id: user._id, email: user.email, role: user.role, name: user.name },
    redirectPath,
    applicationState,
  };
}

// ─── Revoke session ───────────────────────────────────────────────────────────
async function revokeSession(userId) {
  await Session.updateMany(
    { userId, isActive: true },
    { isActive: false, revokedAt: new Date(), revokedReason: "user_logout" },
  );
}

async function validateSession(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw Object.assign(new Error("Invalid or expired token."), {
      statusCode: 401,
    });
  }

  const user = await User.findById(decoded.userId).lean();
  if (!user || !user.isActive) {
    throw Object.assign(new Error("User not found or deactivated."), {
      statusCode: 401,
    });
  }

  return { user, decoded };
}

module.exports = {
  requestMagicLink,
  verifyMagicLink,
  revokeSession,
  validateSession,
};
