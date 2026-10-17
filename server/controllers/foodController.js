import Food from '../models/Food.js';

export const getFoods = async (req, res, next) => {
  try {
    const { category, isVeg, isFeatured, search, sort, availableOnly } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    if (isFeatured !== undefined && isFeatured !== '') {
      query.isFeatured = isFeatured === 'true';
    }

    if (availableOnly === 'true') {
      query.availability = 'available';
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { shortDescription: regex }, { tags: regex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { orderCount: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };

    const foods = await Food.find(query)
      .populate('category', 'name slug')
      .sort(sortOption);

    res.json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const food = await Food.findOne({ slug }).populate('category', 'name slug');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

export const getFoodsAdmin = async (req, res, next) => {
  try {
    const { category, availability, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (availability && availability !== 'all') query.availability = availability;
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { shortDescription: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Food.countDocuments(query);
    const foods = await Food.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

export const createFood = async (req, res, next) => {
  try {
    const {
      name,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      category,
      image,
      additionalImages,
      isVeg,
      availability,
      isFeatured,
      prepTime,
      tags,
      dietaryInfo,
    } = req.body;

    if (!name || !shortDescription || !price || !category || !image) {
      return res.status(400).json({ success: false, message: 'Please provide all required food fields' });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slugExists = await Food.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const food = await Food.create({
      name,
      slug,
      shortDescription,
      fullDescription: fullDescription || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category,
      image,
      additionalImages: additionalImages || [],
      isVeg: isVeg !== undefined ? isVeg : true,
      availability: availability || 'available',
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      prepTime: prepTime || '15-20 mins',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      dietaryInfo: Array.isArray(dietaryInfo) ? dietaryInfo : [],
    });

    res.status(201).json({ success: true, message: 'Food item created successfully', data: food });
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const updates = { ...req.body };
    if (updates.name && updates.name !== food.name) {
      let slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const slugExists = await Food.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      updates.slug = slug;
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) {
      updates.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : null;
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim());
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: 'Food item updated successfully', data: updatedFood });
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateFoodAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!['available', 'out_of_stock', 'temporarily_unavailable'].includes(availability)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    const food = await Food.findByIdAndUpdate(id, { availability }, { new: true });
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.json({ success: true, message: `Status updated to ${availability}`, data: food });
  } catch (error) {
    next(error);
  }
};
