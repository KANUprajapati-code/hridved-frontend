import api from './api';

const CONSENT_KEY = 'hridved_analytics_consent';
const SESSION_KEY = 'hridved_analytics_session';
const TRACKED_PURCHASES_KEY = 'hridved_tracked_purchases';

export const hasAnalyticsConsent = () => localStorage.getItem(CONSENT_KEY) === 'yes';

export const setAnalyticsConsent = (accepted) => {
    localStorage.setItem(CONSENT_KEY, accepted ? 'yes' : 'no');
    
    // Update Google Consent Mode dynamically
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            analytics_storage: accepted ? 'granted' : 'denied',
            ad_storage: accepted ? 'granted' : 'denied',
            ad_user_data: accepted ? 'granted' : 'denied',
            ad_personalization: accepted ? 'granted' : 'denied',
        });
    }

    if (accepted && !sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, globalThis.crypto?.randomUUID?.().replaceAll('-', '') || `${Date.now()}${Math.random().toString(36).slice(2)}`);
    }
};

/**
 * Check if a purchase has already been tracked to prevent duplicate counting
 */
const isPurchaseDeduplicated = (orderId) => {
    if (!orderId) return false;
    try {
        const tracked = JSON.parse(sessionStorage.getItem(TRACKED_PURCHASES_KEY) || '[]');
        return tracked.includes(String(orderId));
    } catch {
        return false;
    }
};

const markPurchaseTracked = (orderId) => {
    if (!orderId) return;
    try {
        const tracked = JSON.parse(sessionStorage.getItem(TRACKED_PURCHASES_KEY) || '[]');
        if (!tracked.includes(String(orderId))) {
            tracked.push(String(orderId));
            sessionStorage.setItem(TRACKED_PURCHASES_KEY, JSON.stringify(tracked));
        }
    } catch {
        // Fallback silently
    }
};

/**
 * Universal Privacy-Safe Analytics Tracker
 * Excludes all PII (no phone, email, address, OTP, or health concerns)
 */
export const trackWebsiteEvent = (eventType, details = {}) => {
    if (!hasAnalyticsConsent()) return;

    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        setAnalyticsConsent(true);
        sessionId = sessionStorage.getItem(SESSION_KEY);
    }

    // 1. Purchase Deduplication check
    if (eventType === 'purchase') {
        if (isPurchaseDeduplicated(details.orderId)) {
            console.debug('[Analytics] Purchase already tracked for order:', details.orderId);
            return;
        }
        markPurchaseTracked(details.orderId);
    }

    // 2. Prepare First-Party Server Payload
    const payload = {
        eventType,
        sessionId,
        path: window.location.pathname.slice(0, 180),
        consentVersion: 'analytics-v1',
    };

    if (details.productId && /^[a-f\d]{24}$/i.test(String(details.productId))) {
        payload.productId = String(details.productId);
    }

    if ((eventType === 'order_created' || eventType === 'purchase') && details.orderId && /^[a-f\d]{24}$/i.test(String(details.orderId))) {
        payload.orderId = String(details.orderId);
    }

    if (eventType === 'search' && typeof details.query === 'string') {
        payload.searchQuery = details.query.slice(0, 100);
    }

    // Dispatch to first-party collector (non-blocking)
    api.post('/website-events/collect', payload).catch(() => {});

    // 3. Dispatch to GA4 via gtag with strictly non-PII parameters
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        try {
            switch (eventType) {
                case 'page_view':
                    window.gtag('event', 'page_view', {
                        page_path: window.location.pathname,
                        page_title: document.title,
                    });
                    break;

                case 'product_view':
                case 'view_item':
                    window.gtag('event', 'view_item', {
                        currency: 'INR',
                        value: details.price || 0,
                        items: details.product ? [{
                            item_id: details.product._id,
                            item_name: details.product.name,
                            price: details.product.price,
                            item_category: details.product.category,
                        }] : undefined,
                    });
                    break;

                case 'search':
                    if (details.query) {
                        window.gtag('event', 'search', {
                            search_term: details.query.slice(0, 50),
                        });
                    }
                    break;

                case 'add_to_wishlist':
                    window.gtag('event', 'add_to_wishlist', {
                        currency: 'INR',
                        value: details.price || 0,
                        items: [{ item_id: details.productId }],
                    });
                    break;

                case 'add_to_cart':
                    window.gtag('event', 'add_to_cart', {
                        currency: 'INR',
                        value: details.price || 0,
                        items: [{ item_id: details.productId, quantity: details.qty || 1 }],
                    });
                    break;

                case 'remove_from_cart':
                    window.gtag('event', 'remove_from_cart', {
                        currency: 'INR',
                        value: details.price || 0,
                        items: [{ item_id: details.productId }],
                    });
                    break;

                case 'view_cart':
                    window.gtag('event', 'view_cart', {
                        currency: 'INR',
                        value: details.cartTotal || 0,
                    });
                    break;

                case 'begin_checkout':
                    window.gtag('event', 'begin_checkout', {
                        currency: 'INR',
                        value: details.cartTotal || 0,
                    });
                    break;

                case 'add_shipping_info':
                    window.gtag('event', 'add_shipping_info', {
                        currency: 'INR',
                        shipping_tier: details.shippingMethod || 'Standard',
                    });
                    break;

                case 'add_payment_info':
                    window.gtag('event', 'add_payment_info', {
                        currency: 'INR',
                        payment_type: details.paymentMethod || 'Razorpay',
                    });
                    break;

                case 'purchase':
                    window.gtag('event', 'purchase', {
                        transaction_id: String(details.orderId || details.orderRef),
                        value: Number(details.totalPrice) || Number(details.value) || 0,
                        currency: 'INR',
                        items: Array.isArray(details.items) ? details.items.map(item => ({
                            item_id: item.product || item._id,
                            item_name: item.name,
                            price: item.price,
                            quantity: item.qty || 1,
                        })) : undefined,
                    });
                    break;

                // Custom events
                case 'consultation_click':
                case 'whatsapp_click':
                case 'pincode_check':
                case 'newsletter_signup':
                case 'order_tracking_lookup':
                case 'assistant_open':
                case 'assistant_query':
                case 'assistant_escalate':
                    window.gtag('event', eventType, {
                        event_category: 'engagement',
                    });
                    break;

                default:
                    window.gtag('event', eventType);
                    break;
            }
        } catch (gtagErr) {
            console.debug('[Analytics] gtag dispatch failed:', gtagErr?.message);
        }
    }
};

export default trackWebsiteEvent;
