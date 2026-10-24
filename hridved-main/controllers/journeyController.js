import JourneyEvent from '../models/JourneyEvent.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const allowedTypes = new Set(['product_view', 'add_to_cart', 'checkout_step', 'abandonment_feedback']);
const allowedReasons = new Set(['shipping_cost', 'payment_options', 'delivery_time', 'need_more_info', 'comparing', 'other']);
const allowedSteps = new Set(['address', 'shipping', 'payment']);

export const recordJourneyEvent = async (req, res) => {
    try {
        const { sessionId, type, productId, productName, price, quantity, step } = req.body || {};
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(sessionId) || !allowedTypes.has(type)) {
            return res.status(400).json({ message: 'Invalid activity event.' });
        }

        let userId = null;
        const authHeader = req.headers.authorization;
        const token = req.cookies?.jwt || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
        if (type !== 'abandonment_feedback' && token && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.userId && await User.exists({ _id: decoded.userId })) userId = decoded.userId;
            } catch { /* Keep consented guest activity anonymous when a token is stale. */ }
        }

        const event = { sessionId, user: userId, type };
        if (type === 'product_view' || type === 'add_to_cart') {
            event.productId = String(productId || '').slice(0, 80);
            event.productName = String(productName || '').trim().slice(0, 160);
            event.price = Number.isFinite(Number(price)) ? Math.max(0, Number(price)) : 0;
            event.quantity = Number.isFinite(Number(quantity)) ? Math.min(1000, Math.max(0, Number(quantity))) : 0;
        }
        if (type === 'checkout_step' && allowedSteps.has(step)) event.step = step;
        if (type === 'abandonment_feedback' && allowedReasons.has(req.body.reason)) event.reason = req.body.reason;
        await JourneyEvent.create(event);
        return res.status(202).json({ accepted: true });
    } catch (error) {
        console.error('Journey event could not be recorded:', error.message);
        return res.status(500).json({ message: 'Could not record activity.' });
    }
};

export const getMarketingStats = async (_req, res) => {
    try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [eventTotals, sessions, productInterest, checkoutStages, reasons, latest] = await Promise.all([
            JourneyEvent.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: { _id: '$type', events: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
                { $project: { type: '$_id', events: 1, sessions: { $size: '$sessions' } } },
            ]),
            JourneyEvent.distinct('sessionId', { type: { $in: ['product_view', 'add_to_cart', 'checkout_step'] }, createdAt: { $gte: since } }),
            JourneyEvent.aggregate([
                { $match: { createdAt: { $gte: since }, type: { $in: ['product_view', 'add_to_cart'] }, productId: { $ne: '' } } },
                { $group: { _id: { productId: '$productId', name: '$productName' }, views: { $sum: { $cond: [{ $eq: ['$type', 'product_view'] }, 1, 0] } }, adds: { $sum: { $cond: [{ $eq: ['$type', 'add_to_cart'] }, 1, 0] } }, quantity: { $sum: { $cond: [{ $eq: ['$type', 'add_to_cart'] }, '$quantity', 0] } } } },
                { $sort: { adds: -1, views: -1 } }, { $limit: 10 },
            ]),
            JourneyEvent.aggregate([
                { $match: { createdAt: { $gte: since }, type: 'checkout_step' } },
                { $group: { _id: '$step', sessions: { $addToSet: '$sessionId' } } },
                { $project: { step: '$_id', sessions: { $size: '$sessions' } } },
            ]),
            JourneyEvent.aggregate([{ $match: { createdAt: { $gte: since }, type: 'abandonment_feedback', reason: { $ne: '' } } }, { $group: { _id: '$reason', responses: { $sum: 1 } } }, { $sort: { responses: -1 } }]),
            JourneyEvent.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(30).populate('user', 'name email').lean(),
        ]);
        const byType = Object.fromEntries(eventTotals.map((row) => [row.type, row]));
        res.json({
            periodDays: 30,
            totals: {
                sessions: sessions.length,
                productViews: byType.product_view?.events || 0,
                addToCart: byType.add_to_cart?.events || 0,
                checkoutSessions: byType.checkout_step?.sessions || 0,
            },
            funnel: ['address', 'shipping', 'payment'].map((step) => ({ step, sessions: checkoutStages.find((row) => row.step === step)?.sessions || 0 })),
            abandonmentReasons: reasons.map((row) => ({ reason: row._id, responses: row.responses })),
            productInterest: productInterest.map((row) => ({ productId: row._id.productId, name: row._id.name || 'Product', views: row.views, adds: row.adds, quantity: row.quantity })),
            recentActivity: latest.map((row) => ({ type: row.type, productName: row.productName, step: row.step, reason: row.reason, quantity: row.quantity, userName: row.user?.name || 'Guest', userEmail: row.user?.email || '', createdAt: row.createdAt })),
        });
    } catch (error) {
        console.error('Marketing stats error:', error.message);
        res.status(500).json({ message: 'Could not load marketing insights.' });
    }
};
