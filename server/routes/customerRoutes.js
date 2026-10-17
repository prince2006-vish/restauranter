import express from 'express';
import {
  getCustomersAdmin,
  getCustomerDetailsAdmin,
  updateCustomerStatusAdmin,
} from '../controllers/customerController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/admin', protectAdmin, getCustomersAdmin);
router.get('/admin/:id', protectAdmin, getCustomerDetailsAdmin);
router.patch('/admin/:id/status', protectAdmin, updateCustomerStatusAdmin);

export default router;
