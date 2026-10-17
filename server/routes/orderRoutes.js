import express from 'express';
import {
  createOrder,
  getOrderTracking,
  getCustomerOrders,
  markWhatsappInitiated,
  getAdminOrders,
  updateOrderStatus,
  getAdminOrderStats,
} from '../controllers/orderController.js';
import { protectAdmin, protectCustomer, optionalCustomer } from '../middleware/authMiddleware.js';
import { orderLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public / Customer Checkout
router.post('/checkout', orderLimiter, optionalCustomer, createOrder);

// Order tracking (guest with token or authenticated customer / admin)
router.get('/track/:orderNumber', optionalCustomer, getOrderTracking);

// Customer logged-in order history
router.get('/my-orders', protectCustomer, getCustomerOrders);

// Record customer clicking WhatsApp button
router.patch('/track/:orderNumber/whatsapp-initiated', markWhatsappInitiated);

// Admin Order Management
router.get('/admin', protectAdmin, getAdminOrders);
router.get('/admin/stats', protectAdmin, getAdminOrderStats);
router.patch('/admin/:orderNumber/status', protectAdmin, updateOrderStatus);

export default router;
