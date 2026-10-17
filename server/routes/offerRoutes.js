import express from 'express';
import {
  getActiveOffers,
  getAllOffersAdmin,
  createOffer,
  updateOffer,
  deleteOffer,
  validateCoupon,
} from '../controllers/offerController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getActiveOffers);
router.post('/validate', validateCoupon);

// Admin only
router.get('/admin', protectAdmin, getAllOffersAdmin);
router.post('/admin', protectAdmin, createOffer);
router.put('/admin/:id', protectAdmin, updateOffer);
router.delete('/admin/:id', protectAdmin, deleteOffer);

export default router;
