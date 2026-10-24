import mongoose from 'mongoose';

const newsletterSubscriberSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isSubscribed: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
export default NewsletterSubscriber;
