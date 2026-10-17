import Offer from '../models/Offer.js';

export const getActiveOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      $or: [{ validTill: null }, { validTill: { $gte: now } }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

export const getAllOffersAdmin = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const { title, code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, bannerImage, isActive, validTill } = req.body;

    if (!title || !code || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Title, code and discount value are required' });
    }

    const existing = await Offer.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const offer = await Offer.create({
      title,
      code: code.toUpperCase(),
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      bannerImage: bannerImage || '',
      isActive: isActive !== undefined ? isActive : true,
      validTill: validTill ? new Date(validTill) : null,
    });

    res.status(201).json({ success: true, message: 'Offer created successfully', data: offer });
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.toUpperCase();
    if (updates.discountValue) updates.discountValue = Number(updates.discountValue);
    if (updates.minOrderAmount !== undefined) updates.minOrderAmount = Number(updates.minOrderAmount);
    if (updates.maxDiscountAmount !== undefined) updates.maxDiscountAmount = Number(updates.maxDiscountAmount);

    const updated = await Offer.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Offer updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    if (!offer) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (offer.validTill && new Date(offer.validTill) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal < (offer.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum subtotal of ₹${offer.minOrderAmount}`,
      });
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = Math.round((currentSubtotal * offer.discountValue) / 100);
      if (offer.maxDiscountAmount > 0 && discount > offer.maxDiscountAmount) {
        discount = offer.maxDiscountAmount;
      }
    } else {
      discount = offer.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon applied: ₹${discount} discount`,
      code: offer.code,
      discount,
      offer,
    });
  } catch (error) {
    next(error);
  }
};
