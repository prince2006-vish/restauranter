import GalleryImage from '../models/GalleryImage.js';

export const getGalleryImages = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    const images = await GalleryImage.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: images.length, data: images });
  } catch (error) {
    next(error);
  }
};

export const getAllGalleryAdmin = async (req, res, next) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: images.length, data: images });
  } catch (error) {
    next(error);
  }
};

export const createGalleryImage = async (req, res, next) => {
  try {
    const { title, imageUrl, category, caption, order, isActive } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required' });
    }

    const image = await GalleryImage.create({
      title,
      imageUrl,
      category: category || 'food',
      caption: caption || '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: 'Gallery image added successfully', data: image });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await GalleryImage.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, message: 'Gallery image updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await GalleryImage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, message: 'Gallery image removed successfully' });
  } catch (error) {
    next(error);
  }
};
