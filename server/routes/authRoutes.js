import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  customerRegister,
  customerLogin,
  getCustomerProfile,
  updateCustomerProfile,
} from '../controllers/authController.js';
import { protectAdmin, protectCustomer } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin routes
router.post('/admin/login', authLimiter, adminLogin);
router.get('/admin/profile', protectAdmin, getAdminProfile);
router.put('/admin/profile', protectAdmin, updateAdminProfile);

// Customer routes
router.post('/customer/register', authLimiter, customerRegister);
router.post('/customer/login', authLimiter, customerLogin);
router.get('/customer/profile', protectCustomer, getCustomerProfile);
router.put('/customer/profile', protectCustomer, updateCustomerProfile);

export default router;
