import mongoose from 'mongoose';

const journeyEventSchema = mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    type: { type: String, enum: ['product_view', 'add_to_cart', 'checkout_step', 'abandonment_feedback'], required: true, index: true },
    productId: { type: String, default: '', maxlength: 80 },
    productName: { type: String, default: '', maxlength: 160 },
    price: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0, max: 1000 },
    step: { type: String, enum: ['', 'address', 'shipping', 'payment'], default: '' },
    reason: { type: String, enum: ['', 'shipping_cost', 'payment_options', 'delivery_time', 'need_more_info', 'comparing', 'other'], default: '' },
}, { timestamps: true });

journeyEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
journeyEventSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('JourneyEvent', journeyEventSchema);
