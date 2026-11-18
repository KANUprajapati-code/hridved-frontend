import api from './api';

const CONSENT_KEY = 'hridved_analytics_consent';
const SESSION_KEY = 'hridved_analytics_session';
const TRACKED_PURCHASES_KEY = 'hridved_tracked_purchases';
const UTM_STORAGE_KEY = 'hridved_utm_params';

// Active tracking IDs cache
let marketingConfigCache = null;
let isMetaPixelInitialized = false;

/**
 * DPDP & e-commerce compliance:
 * Analytics & conversion tracking is enabled by default unless the user explicitly chose 'no'.
 */
export const hasAnalyticsConsent = () => {
    try {
        return localStorage.getItem(CONSENT_KEY) !== 'no';
    } catch {
        return true;
    }
};

/**
 * Update consent across Google Consent Mode v2 and Meta Pixel
 */
export const setAnalyticsConsent = (accepted) => {
    try {
        localStorage.setItem(CONSENT_KEY, accepted ? 'yes' : 'no');
    } catch {
        // Fallback silently
    }

    // 1. Update Google Consent Mode dynamically
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        try {
            window.gtag('consent', 'update', {
                analytics_storage: accepted ? 'granted' : 'denied',
                ad_storage: accepted ? 'granted' : 'denied',
                ad_user_data: accepted ? 'granted' : 'denied',
                ad_personalization: accepted ? 'granted' : 'denied',
            });
        } catch (e) {
            console.debug('[Analytics] gtag consent update failed:', e?.message);
        }
    }

    // 2. Update Meta Pixel consent
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        try {
            window.fbq('consent', accepted ? 'grant' : 'revoke');
        } catch (e) {
            console.debug('[Analytics] fbq consent update failed:', e?.message);
        }
    }

    if (accepted && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(SESSION_KEY)) {
        try {
            sessionStorage.setItem(SESSION_KEY, globalThis.crypto?.randomUUID?.().replaceAll('-', '') || `${Date.now()}${Math.random().toString(36).slice(2)}`);
        } catch {
            // Fallback silently
        }
    }
};

/**
 * Capture UTM & Ad Click Parameters from URL and persist across customer journey
 * Captures: utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid
 */
export const captureUtmParameters = () => {
    if (typeof window === 'undefined') return {};

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
        const captured = {};
        let hasAdParams = false;

        utmKeys.forEach((key) => {
            const val = urlParams.get(key);
            if (val) {
                captured[key] = val.trim();
                hasAdParams = true;
            }
        });

        if (hasAdParams) {
            captured.landing_page = window.location.pathname;
            captured.referrer = document.referrer || '';
            captured.captured_at = new Date().toISOString();

            try {
                sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
                localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
            } catch {
                // Storage quota fallback
            }
            return captured;
        }

        // Fallback to existing saved session/localStorage UTMs
        const existing = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
        return existing ? JSON.parse(existing) : {};
    } catch (err) {
        console.debug('[Analytics] Error capturing UTM parameters:', err?.message);
        return {};
    }
};

/**
 * Retrieve captured UTM parameters for attaching to orders and purchase events
 */
export const getUtmParams = () => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return captureUtmParameters();
    } catch {
        return {};
    }
};

/**
 * Initialize Marketing Tracking (Meta Pixel, GA4, GTM) dynamically
 */
export const initMarketingTracking = async () => {
    if (typeof window === 'undefined') return;

    // Capture any incoming URL UTM params immediately
    captureUtmParameters();

    // Determine Meta Pixel ID from env, window, or backend
    let pixelId = import.meta.env.VITE_META_PIXEL_ID || window.__META_PIXEL_ID__;

    if (!pixelId) {
        try {
            if (!marketingConfigCache) {
                const res = await api.get('/config/marketing');
                if (res.data?.success && res.data?.data) {
                    marketingConfigCache = res.data.data;
                }
            }
            if (marketingConfigCache?.metaPixelId) {
                pixelId = marketingConfigCache.metaPixelId;
            }
        } catch {
            // Silently continue if backend offline
        }
    }

    if (pixelId && typeof window.fbq === 'function' && !isMetaPixelInitialized) {
        try {
            window.fbq('init', String(pixelId).trim());
            window.fbq('track', 'PageView');
            isMetaPixelInitialized = true;
        } catch (e) {
            console.debug('[Analytics] Meta Pixel initialization failed:', e?.message);
        }
    }
};

/**
 * Deduplication check for purchase events to prevent multi-count
 */
const isPurchaseDeduplicated = (orderId) => {
    if (!orderId || typeof sessionStorage === 'undefined') return false;
    try {
        const tracked = JSON.parse(sessionStorage.getItem(TRACKED_PURCHASES_KEY) || '[]');
        return tracked.includes(String(orderId));
    } catch {
        return false;
    }
};

const markPurchaseTracked = (orderId) => {
    if (!orderId || typeof sessionStorage === 'undefined') return;
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
 * Helper to normalize item structure for GA4 & Meta Pixel
 */
const normalizeItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((it) => {
        const id = it.product?._id || it.product || it._id || it.productId || '';
        const name = it.name || it.product?.name || 'Ayurvedic Wellness Product';
        const price = Number(it.price || it.product?.price || 0);
        const quantity = Number(it.qty || it.quantity || 1);
        const category = it.category || it.product?.category || 'Wellness';
        return {
            item_id: String(id),
            item_name: name,
            price: price,
            quantity: quantity,
            item_category: category,
        };
    });
};

/**
 * Universal Privacy-Safe Analytics & Performance Marketing Tracker
 * Dispatches to:
 * 1. First-Party Backend Collector (/api/website-events/collect)
 * 2. Google Analytics 4 via gtag('event', ...)
 * 3. Meta Pixel via fbq('track', ...)
 */
export const trackWebsiteEvent = (eventType, details = {}) => {
    if (!hasAnalyticsConsent()) return;

    let sessionId = null;
    try {
        sessionId = sessionStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            setAnalyticsConsent(true);
            sessionId = sessionStorage.getItem(SESSION_KEY);
        }
    } catch {
        sessionId = 'anon-session-' + Date.now();
    }

    const utm = getUtmParams();

    // 1. Purchase Deduplication check
    if (eventType === 'purchase') {
        const effectiveOrderId = details.orderId || details.orderRef || details.id;
        if (effectiveOrderId && isPurchaseDeduplicated(effectiveOrderId)) {
            console.debug('[Analytics] Purchase already tracked for order:', effectiveOrderId);
            return;
        }
        if (effectiveOrderId) {
            markPurchaseTracked(effectiveOrderId);
        }
    }

    // 2. Prepare First-Party Server Payload
    try {
        const payload = {
            eventType,
            sessionId: sessionId || 'anon-session-' + Date.now(),
            path: typeof window !== 'undefined' ? window.location.pathname.slice(0, 180) : '/',
            consentVersion: 'analytics-v2',
            utmSource: utm.utm_source,
            utmMedium: utm.utm_medium,
            utmCampaign: utm.utm_campaign,
            gclid: utm.gclid,
            fbclid: utm.fbclid,
        };

        const pid = details.productId || details.product?._id;
        if (pid && /^[a-f\d]{24}$/i.test(String(pid))) {
            payload.productId = String(pid);
        }

        const oid = details.orderId || details.orderRef;
        if ((eventType === 'order_created' || eventType === 'purchase') && oid && /^[a-f\d]{24}$/i.test(String(oid))) {
            payload.orderId = String(oid);
        }

        if (eventType === 'search' && typeof details.query === 'string') {
            payload.searchQuery = details.query.slice(0, 100);
        }

        // Dispatch to first-party collector (non-blocking)
        api.post('/website-events/collect', payload).catch(() => {});
    } catch {
        // Silently continue
    }

    // Normalize items if available
    const standardItems = normalizeItems(details.items || (details.product ? [details.product] : []));
    const firstItemId = details.productId || (standardItems[0]?.item_id) || '';
    const firstItemName = details.name || details.product?.name || (standardItems[0]?.item_name) || '';
    const eventPrice = Number(details.price || details.product?.price || standardItems[0]?.price || details.cartTotal || details.totalPrice || details.value || 0);

    // 3. Dispatch to Google Analytics 4 (gtag)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        try {
            switch (eventType) {
                case 'page_view':
                    window.gtag('event', 'page_view', {
                        page_path: window.location.pathname,
                        page_title: document.title,
                        page_location: window.location.href,
                    });
                    break;

                case 'product_view':
                case 'view_item':
                    window.gtag('event', 'view_item', {
                        currency: 'INR',
                        value: eventPrice,
                        items: standardItems.length > 0 ? standardItems : [{
                            item_id: String(firstItemId),
                            item_name: firstItemName,
                            price: eventPrice,
                        }],
                    });
                    break;

                case 'view_item_list':
                    window.gtag('event', 'view_item_list', {
                        item_list_name: details.listName || 'Shop Catalogue',
                        items: standardItems,
                    });
                    break;

                case 'search':
                    if (details.query) {
                        window.gtag('event', 'search', {
                            search_term: String(details.query).slice(0, 50),
                        });
                    }
                    break;

                case 'add_to_wishlist':
                    window.gtag('event', 'add_to_wishlist', {
                        currency: 'INR',
                        value: eventPrice,
                        items: [{ item_id: String(firstItemId), item_name: firstItemName, price: eventPrice }],
                    });
                    break;

                case 'add_to_cart':
                    window.gtag('event', 'add_to_cart', {
                        currency: 'INR',
                        value: eventPrice * (Number(details.qty) || 1),
                        items: standardItems.length > 0 ? standardItems : [{
                            item_id: String(firstItemId),
                            item_name: firstItemName,
                            price: eventPrice,
                            quantity: Number(details.qty) || 1,
                        }],
                    });
                    break;

                case 'remove_from_cart':
                    window.gtag('event', 'remove_from_cart', {
                        currency: 'INR',
                        value: eventPrice,
                        items: [{ item_id: String(firstItemId), item_name: firstItemName, price: eventPrice }],
                    });
                    break;

                case 'view_cart':
                    window.gtag('event', 'view_cart', {
                        currency: 'INR',
                        value: Number(details.cartTotal) || eventPrice,
                        items: standardItems,
                    });
                    break;

                case 'begin_checkout':
                    window.gtag('event', 'begin_checkout', {
                        currency: 'INR',
                        value: Number(details.cartTotal) || eventPrice,
                        items: standardItems,
                    });
                    break;

                case 'add_shipping_info':
                    window.gtag('event', 'add_shipping_info', {
                        currency: 'INR',
                        value: Number(details.cartTotal) || eventPrice,
                        shipping_tier: details.shippingMethod || 'Standard',
                        items: standardItems,
                    });
                    break;

                case 'add_payment_info':
                    window.gtag('event', 'add_payment_info', {
                        currency: 'INR',
                        value: Number(details.cartTotal) || eventPrice,
                        payment_type: details.paymentMethod || 'Razorpay',
                        items: standardItems,
                    });
                    break;

                case 'purchase':
                    window.gtag('event', 'purchase', {
                        transaction_id: String(details.orderId || details.orderRef || `ord_${Date.now()}`),
                        value: Number(details.totalPrice) || Number(details.value) || 0,
                        currency: 'INR',
                        shipping: Number(details.shippingPrice) || 0,
                        tax: Number(details.taxPrice) || 0,
                        coupon: details.couponCode || details.appliedCoupon?.code || undefined,
                        items: standardItems,
                    });
                    break;

                case 'consultation_click':
                case 'whatsapp_click':
                case 'whatsapp_order':
                    window.gtag('event', 'generate_lead', {
                        currency: 'INR',
                        value: eventPrice,
                        lead_type: 'whatsapp',
                        event_category: 'engagement',
                    });
                    break;

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
                    window.gtag('event', eventType, details);
                    break;
            }
        } catch (gtagErr) {
            console.debug('[Analytics] gtag dispatch failed:', gtagErr?.message);
        }
    }

    // 4. Dispatch to Meta Pixel (fbq)
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        try {
            const allItemIds = standardItems.length > 0 ? standardItems.map((it) => it.item_id) : (firstItemId ? [String(firstItemId)] : []);
            const numItems = standardItems.length > 0 ? standardItems.reduce((acc, it) => acc + (it.quantity || 1), 0) : (Number(details.qty) || 1);

            switch (eventType) {
                case 'page_view':
                    window.fbq('track', 'PageView');
                    break;

                case 'product_view':
                case 'view_item':
                    window.fbq('track', 'ViewContent', {
                        content_name: firstItemName || 'Ayurvedic Wellness',
                        content_ids: allItemIds,
                        content_type: 'product',
                        value: eventPrice,
                        currency: 'INR',
                    });
                    break;

                case 'add_to_cart':
                    window.fbq('track', 'AddToCart', {
                        content_name: firstItemName || 'Ayurvedic Wellness',
                        content_ids: allItemIds,
                        content_type: 'product',
                        value: eventPrice * (Number(details.qty) || 1),
                        currency: 'INR',
                    });
                    break;

                case 'add_to_wishlist':
                    window.fbq('track', 'AddToWishlist', {
                        content_name: firstItemName,
                        content_ids: allItemIds,
                        content_type: 'product',
                        value: eventPrice,
                        currency: 'INR',
                    });
                    break;

                case 'begin_checkout':
                    window.fbq('track', 'InitiateCheckout', {
                        content_ids: allItemIds,
                        content_type: 'product',
                        num_items: numItems,
                        value: Number(details.cartTotal) || eventPrice,
                        currency: 'INR',
                    });
                    break;

                case 'add_payment_info':
                    window.fbq('track', 'AddPaymentInfo', {
                        value: Number(details.cartTotal) || eventPrice,
                        currency: 'INR',
                    });
                    break;

                case 'purchase':
                    window.fbq('track', 'Purchase', {
                        content_ids: allItemIds,
                        content_type: 'product',
                        num_items: numItems,
                        value: Number(details.totalPrice) || Number(details.value) || 0,
                        currency: 'INR',
                    });
                    break;

                case 'search':
                    if (details.query) {
                        window.fbq('track', 'Search', {
                            search_string: String(details.query).slice(0, 50),
                        });
                    }
                    break;

                case 'whatsapp_click':
                case 'whatsapp_order':
                case 'consultation_click':
                    window.fbq('track', 'Lead', {
                        content_name: 'WhatsApp Enquiry',
                        value: eventPrice,
                        currency: 'INR',
                    });
                    break;

                default:
                    // Custom non-standard event
                    if (['assistant_escalate', 'newsletter_signup'].includes(eventType)) {
                        window.fbq('trackCustom', eventType, details);
                    }
                    break;
            }
        } catch (fbqErr) {
            console.debug('[Analytics] fbq dispatch failed:', fbqErr?.message);
        }
    }
};

export default trackWebsiteEvent;
