'use strict';

const { body, param, query, validationResult } = require('express-validator');

/**
 * Run validation and respond with errors if any.
 */
function validate(validations) {
    return async (req, res, next) => {
        await Promise.all(validations.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
        }
        next();
    };
}

// ─── Auth validators ──────────────────────────────────────────────────────────
const authValidators = {
    requestMagicLink: validate([
        body('email')
            .isEmail().withMessage('A valid email address is required.')
            .normalizeEmail(),
    ]),
    verifyMagicLink: validate([
        query('token').notEmpty().withMessage('Token is required.'),
        query('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    ]),
};

// ─── Application validators ───────────────────────────────────────────────────
const applicationValidators = {
    step1: validate([
        body('companyName').trim().notEmpty().withMessage('Company name is required.'),
        body('primaryContactName').trim().notEmpty().withMessage('Contact name is required.'),
        body('primaryContactEmail').isEmail().withMessage('A valid contact email is required.').normalizeEmail(),
        body('primaryContactPhone').optional().isMobilePhone().withMessage('Invalid phone number.'),
        body('yearFounded').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid year.'),
    ]),
    step2: validate([
        body('teamMembers').isArray({ min: 1 }).withMessage('At least one team member is required.'),
        body('teamMembers.*.name').trim().notEmpty().withMessage('Team member name is required.'),
        body('teamMembers.*.title').optional().trim(),
        body('teamSize').isInt({ min: 1 }).withMessage('Team size must be at least 1.'),
    ]),
    step3: validate([
        body('strategy.fundName').trim().notEmpty().withMessage('Fund name is required.'),
        body('strategy.fundSize').isNumeric().withMessage('Fund size must be a number.'),
        body('strategy.investmentThesis').trim().notEmpty().withMessage('Investment thesis is required.'),
    ]),
};

// ─── Admin validators ─────────────────────────────────────────────────────────
const adminValidators = {
    qualificationStatus: validate([
        body('status')
            .isIn(['pending', 'qualified', 'not_qualified', 'attending_raise'])
            .withMessage('Invalid status value.'),
    ]),
    changeOwner: validate([
        body('ownerId').isMongoId().withMessage('Invalid owner ID.'),
    ]),
    addNote: validate([
        body('note').trim().isLength({ min: 1, max: 2000 }).withMessage('Note must be 1–2000 characters.'),
    ]),
    listApplications: validate([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1.'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100.'),
        query('applicantProgressStatus').optional().isIn(['started', 'submitted']),
        query('adminQualificationStatus').optional().isIn(['pending', 'qualified', 'not_qualified', 'attending_raise']),
        query('databaseStatus').optional().isIn(['opted_in', 'not_opted_in']),
        query('deckUploaded').optional().isIn(['true', 'false']),
    ]),
};

// ─── Reviewer validators ──────────────────────────────────────────────────────
const reviewerValidators = {
    assignReviewers: validate([
        body('reviewerEmails').isArray({ min: 1 }).withMessage('At least one reviewer email required.'),
        body('reviewerEmails.*').isEmail().withMessage('Invalid reviewer email.').normalizeEmail(),
        body('ratingsPerApp').isInt({ min: 1, max: 10 }).withMessage('ratingsPerApp must be 1–10.'),
        body('logic').isIn(['balanced', 'random']).withMessage("Logic must be 'balanced' or 'random'."),
    ]),
};

module.exports = { validate, authValidators, applicationValidators, adminValidators, reviewerValidators };
