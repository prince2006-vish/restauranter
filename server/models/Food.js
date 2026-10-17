import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price must be positive'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodCategory',
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      required: [true, 'Food image is required'],
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    isVeg: {
      type: Boolean,
      default: true,
    },
    availability: {
      type: String,
      enum: ['available', 'out_of_stock', 'temporarily_unavailable'],
      default: 'available',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    prepTime: {
      type: String,
      default: '15-20 mins',
    },
    tags: [
      {
        type: String,
      },
    ],
    dietaryInfo: [
      {
        type: String,
      },
    ],
    orderCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });
foodSchema.index({ category: 1, availability: 1, isFeatured: 1 });

export default mongoose.model('Food', foodSchema);
