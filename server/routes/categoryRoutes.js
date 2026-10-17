import express from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getCategories);

// Admin only
router.get('/admin', protectAdmin, getAllCategoriesAdmin);
router.post('/admin', protectAdmin, createCategory);
router.put('/admin/:id', protectAdmin, updateCategory);
router.delete('/admin/:id', protectAdmin, deleteCategory);

export default router;
