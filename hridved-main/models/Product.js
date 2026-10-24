
import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
    }],
    variants: [{
        name: { type: String, trim: true },
        price: { type: Number, min: 0 },
        mrp: { type: Number, min: 0 },
        countInStock: { type: Number, min: 0 },
    }],
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    benefits: {
        type: String,
    },
    howToUse: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    mrp: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    isBestseller: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    gst: {
        type: Number,
        required: true,
        default: 0,
    },
    weight: {
        type: Number,
        required: true,
        default: 0.5, // Default weight in kg
    },
    reviews: [reviewSchema],
}, {
    timestamps: true,
});

// Match storefront filters and sorts without scanning the full catalog.
productSchema.index({ isBestseller: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
