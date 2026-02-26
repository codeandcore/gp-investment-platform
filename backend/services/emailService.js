"use strict";

const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailLog");

// ─── Transport factory ─────────────────────────────────────────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ─── HTML templates ───────────────────────────────────────────────────────────
const templates = {
  magic_link: ({ magicLink, expiryMinutes = 15 }) => ({
    subject: "Your Login Link – GP Investment Platform",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">GP Platform</div>
        </div>
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #f8fafc;">Sign in to your account</h1>
        <p style="color: #94a3b8; margin-bottom: 32px; line-height: 1.6;">
          Click the button below to securely sign in. This link expires in <strong style="color: #f1f5f9;">${expiryMinutes} minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">
            Sign In Securely →
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 24px;">
          If you didn't request this link, you can safely ignore this email. Never share this link with anyone.
        </p>
      </div>
    `,
  }),

  application_reminder: ({ gpName, applicationLink }) => ({
    subject: "Complete Your GP Application – Action Required",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <h1 style="font-size: 22px; color: #f8fafc;">Hi ${gpName || "there"},</h1>
        <p style="color: #94a3b8; line-height: 1.7;">
          We noticed you started a GP application but haven't completed it yet. Your progress has been saved — pick up right where you left off.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${applicationLink}" style="background: #6366f1; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Resume Application
          </a>
        </div>
      </div>
    `,
  }),

  opt_in_nudge: ({ gpName, optInLink }) => ({
    subject: "Join Our GP Database – Opt In Today",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <h1 style="font-size: 22px; color: #f8fafc;">Hi ${gpName || "there"},</h1>
        <p style="color: #94a3b8; line-height: 1.7;">
          We'd love to include your application in our curated GP database. Opting in gives you visibility to our network of LPs.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${optInLink}" style="background: #10b981; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Opt In to Database
          </a>
        </div>
      </div>
    `,
  }),

  reviewer_assignment: ({ reviewerName, applicationCount, reviewLink }) => ({
    subject: `You have ${applicationCount} new GP application(s) to review`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <h1 style="font-size: 22px; color: #f8fafc;">Hi ${reviewerName || "Reviewer"},</h1>
        <p style="color: #94a3b8; line-height: 1.7;">
          You've been assigned <strong style="color: #f1f5f9;">${applicationCount}</strong> GP application(s) to review. 
          Please complete your reviews at your earliest convenience.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${reviewLink}" style="background: #6366f1; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Start Reviewing
          </a>
        </div>
      </div>
    `,
  }),

  // Sent to the OWNER when someone from their company requests access
  access_request_to_owner: ({
    ownerName,
    requesterName,
    requesterEmail,
    companyName,
    grantLink,
  }) => ({
    subject: `${requesterName || requesterEmail} is requesting access to your ${companyName} application`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">GP Platform</div>
        </div>
        <h1 style="font-size: 22px; color: #f8fafc; margin-bottom: 8px;">Hi ${ownerName || "there"},</h1>
        <p style="color: #94a3b8; line-height: 1.7; margin-bottom: 24px;">
          <strong style="color: #f1f5f9;">${requesterName || requesterEmail}</strong>
          (<a href="mailto:${requesterEmail}" style="color: #818cf8;">${requesterEmail}</a>) 
          is requesting access to the <strong style="color: #f1f5f9;">${companyName || "your firm"}</strong> application.
        </p>
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">
            Clicking <strong style="color: #f1f5f9;">Grant Access</strong> will transfer the application to ${requesterName || requesterEmail}. 
            They will be taken directly to the step where you left off. This action cannot be undone.
          </p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${grantLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">
            Grant Access →
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 24px;">
          If you did not expect this request or believe it is in error, please ignore this email.
          Contact <a href="mailto:test@raise.com" style="color: #818cf8;">RAISE Support</a> if you need help.
        </p>
      </div>
    `,
  }),

  // Sent to the REQUESTER after the owner grants access
  access_granted: ({
    requesterName,
    ownerName,
    companyName,
    continueLink,
    stepNumber,
  }) => ({
    subject: `Access granted! Continue the ${companyName} application`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">GP Platform</div>
        </div>
        <div style="text-align:center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: #059669; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: #fff; font-size: 28px;">✓</span>
          </div>
        </div>
        <h1 style="font-size: 22px; color: #f8fafc; margin-bottom: 8px; text-align:center;">Access Granted!</h1>
        <p style="color: #94a3b8; line-height: 1.7; margin-bottom: 24px; text-align:center;">
          <strong style="color: #f1f5f9;">${ownerName || "The owner"}</strong> has granted you access to the
          <strong style="color: #f1f5f9;">${companyName || "application"}</strong>.
          You can continue from Step ${stepNumber}.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${continueLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">
            Continue Application → Step ${stepNumber}
          </a>
        </div>
      </div>
    `,
  }),
};

// ─── Core send function ───────────────────────────────────────────────────────
/**
 * @param {Object} opts
 * @param {string} opts.to - recipient email
 * @param {string} opts.templateName - key in templates object
 * @param {Object} opts.templateData - interpolation data
 * @param {string} [opts.relatedEntityId] - linked entity ObjectId
 * @param {string} [opts.triggeredBy] - admin userId who triggered
 */
async function sendEmail({
  to,
  templateName,
  templateData,
  relatedEntityId,
  triggeredBy,
}) {
  const log = await EmailLog.create({
    to,
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    subject: "Test",
    templateName,
    relatedEntityId,
    triggeredBy,
    status: "queued",
  });
  console.log("log", log);

  try {
    const template = templates[templateName];
    console.log("subject", template, templateName);
    if (!template) throw new Error(`Unknown email template: ${templateName}`);
    const { subject, html } = template(templateData);

    const info = await getTransporter().sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    await EmailLog.findByIdAndUpdate(log._id, {
      subject,
      status: "sent",
      sentAt: new Date(),
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    await EmailLog.findByIdAndUpdate(log._id, {
      status: "failed",
      failureReason: error.message,
    });
    console.error(
      `Email send failed [${templateName}] to ${to}: ${error.message}`,
    );
    throw error;
  }
}

/**
 * Send magic link email.
 */
async function sendMagicLinkEmail(to, rawToken) {
  const magicLink = `${process.env.MAGIC_LINK_BASE_URL}/auth/verify?token=${rawToken}&email=${encodeURIComponent(to)}`;
  return sendEmail({
    to,
    templateName: "magic_link",
    templateData: {
      magicLink,
      expiryMinutes: process.env.MAGIC_LINK_EXPIRY_MINUTES || 15,
    },
  });
}

/**
 * Send bulk emails (e.g. reviewer assignments).
 * Returns array of results.
 */
async function sendBulkEmails(emailJobs) {
  const results = await Promise.allSettled(emailJobs.map(sendEmail));
  return results.map((r, i) => ({
    ...emailJobs[i],
    success: r.status === "fulfilled",
    error: r.reason?.message,
  }));
}

module.exports = { sendEmail, sendMagicLinkEmail, sendBulkEmails };
