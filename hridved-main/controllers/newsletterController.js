import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

const subscribe = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
        { email },
        { $set: { isSubscribed: true, subscribedAt: new Date() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'You are subscribed to Hridved updates.', subscriber });
};

const getSubscribers = async (req, res) => {
    const subscribers = await NewsletterSubscriber.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
};

const setSubscription = async (req, res) => {
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
        req.params.id,
        { isSubscribed: Boolean(req.body.isSubscribed) },
        { new: true }
    );
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });
    res.json(subscriber);
};

export { subscribe, getSubscribers, setSubscription };
