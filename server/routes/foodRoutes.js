import express from 'express';
import {
  getFoods,
  getFoodBySlug,
  getFoodsAdmin,
  createFood,
  updateFood,
  deleteFood,
  updateFoodAvailability,
} from '../controllers/foodController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getFoods);
router.get('/slug/:slug', getFoodBySlug);

// Admin only
router.get('/admin', protectAdmin, getFoodsAdmin);
router.post('/admin', protectAdmin, createFood);
router.put('/admin/:id', protectAdmin, updateFood);
router.delete('/admin/:id', protectAdmin, deleteFood);
router.patch('/admin/:id/availability', protectAdmin, updateFoodAvailability);

export default router;
