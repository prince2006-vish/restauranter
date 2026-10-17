import express from 'express';
import {
  getGalleryImages,
  getAllGalleryAdmin,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getGalleryImages);

// Admin only
router.get('/admin', protectAdmin, getAllGalleryAdmin);
router.post('/admin', protectAdmin, createGalleryImage);
router.put('/admin/:id', protectAdmin, updateGalleryImage);
router.delete('/admin/:id', protectAdmin, deleteGalleryImage);

export default router;
