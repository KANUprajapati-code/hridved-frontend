import api from './api';

/**
 * Track user activities (WhatsApp click, Add to Cart, etc.)
 * @param {Object} data - tracking payload
 * @param {string} data.actionType - 'whatsapp_click' | 'whatsapp_order' | 'add_to_cart' | 'cart_abandoned' | 'otp_lead'
 * @param {Object} [data.product] - product details { productId, name, image, price }
 * @param {Array} [data.cartItems] - cart items array
 * @param {number} [data.cartTotal] - total cart value
 * @param {string} [data.phone] - customer phone
 * @param {string} [data.customerName] - customer name
 */
export const trackLeadEvent = async (data) => {
    try {
        const payload = {
            actionType: data.actionType || 'whatsapp_click',
            product: data.product ? {
                productId: data.product._id || data.product.productId,
                name: data.product.name,
                image: data.product.image,
                price: data.product.price,
            } : undefined,
            cartItems: data.cartItems ? data.cartItems.map(item => ({
                productId: item._id || item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.qty || 1,
            })) : undefined,
            cartTotal: data.cartTotal || (data.product?.price || 0),
            phone: data.phone,
            customerName: data.customerName,
            email: data.email,
        };

        await api.post('/leads/track', payload);
    } catch (error) {
        // Silently capture tracking errors so UI is never blocked
        console.debug('[Tracking] Event log skipped or failed:', error?.message);
    }
};

export default trackLeadEvent;
