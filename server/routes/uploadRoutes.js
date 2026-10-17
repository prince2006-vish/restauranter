import express from 'express';
import { upload, processUploadedFile } from '../middleware/uploadMiddleware.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin image upload endpoint
router.post('/', protectAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = await processUploadedFile(req, req.file);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
