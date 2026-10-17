import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
    dishMentioned: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    orderRef: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ isApproved: 1, isFeatured: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
