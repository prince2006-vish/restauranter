import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Image title is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    category: {
      type: String,
      enum: ['interior', 'exterior', 'food', 'events', 'kitchen'],
      default: 'food',
    },
    caption: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

galleryImageSchema.index({ order: 1, category: 1 });

export default mongoose.model('GalleryImage', galleryImageSchema);
