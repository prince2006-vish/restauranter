import express from 'express';
import {
  getApprovedReviews,
  createReview,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getApprovedReviews);
router.post('/', createReview);

// Admin only
router.get('/admin', protectAdmin, getAllReviewsAdmin);
router.patch('/admin/:id', protectAdmin, updateReviewStatus);
router.delete('/admin/:id', protectAdmin, deleteReview);

export default router;
