import Review from '../models/Review.js';

export const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { customerName, rating, comment, dishMentioned, orderRef } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide name, rating, and feedback' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      customerName: customerName.trim(),
      rating: numRating,
      comment: comment.trim(),
      dishMentioned: dishMentioned ? dishMentioned.trim() : '',
      orderRef: orderRef ? orderRef.trim() : '',
      isApproved: false, // Requires admin moderation
      isFeatured: false,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear on our website after moderation.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved, isFeatured } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (isApproved !== undefined) review.isApproved = isApproved;
    if (isFeatured !== undefined) review.isFeatured = isFeatured;

    await review.save();

    res.json({ success: true, message: 'Review status updated', data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
