import FoodCategory from '../models/FoodCategory.js';
import Food from '../models/Food.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await FoodCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await FoodCategory.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, order, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await FoodCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
    }

    const category = await FoodCategory.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, order, isActive } = req.body;

    const category = await FoodCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name !== category.name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foodCount = await Food.countDocuments({ category: id });
    if (foodCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It still contains ${foodCount} food items. Please reassign or delete them first.`,
      });
    }

    const category = await FoodCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
