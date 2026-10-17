import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getSettings);

// Admin only
router.put('/admin', protectAdmin, updateSettings);

export default router;
