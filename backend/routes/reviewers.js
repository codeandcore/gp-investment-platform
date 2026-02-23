'use strict';

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { reviewerValidators } = require('../middleware/validate');
const { assignReviewers, getMyAssignments } = require('../controllers/reviewerController');

const router = express.Router();

// POST /api/reviewers/assign  (admin)
router.post('/assign', authenticate, authorize('admin'), reviewerValidators.assignReviewers, assignReviewers);

// GET /api/reviewers/assignments  (reviewer)
router.get('/assignments', authenticate, authorize('reviewer', 'admin'), getMyAssignments);

module.exports = router;
