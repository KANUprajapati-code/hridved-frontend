import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'ecommerce_cart';
const COUPON_STORAGE_KEY = 'hridved_applied_coupon';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({ cartItems: [] });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [activeCoupons, setActiveCoupons] = useState([]);
    
    // Persistent applied coupon from localStorage
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        try {
            const saved = localStorage.getItem(COUPON_STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Server-recalculated pricing totals (Never trust client totals!)
    const [serverTotals, setServerTotals] = useState({
        itemsPrice: 0,
        mrpTotal: 0,
        mrpSavings: 0,
        discount: 0,
        shippingPrice: 0,
        freeShippingThreshold: 999,
        amountNeededForFreeShipping: 999,
        taxPrice: 0,
        totalPrice: 0,
        coupon: null,
        couponError: null,
        stockWarnings: [],
        loading: false,
    });

    const [shippingConfig, setShippingConfig] = useState({
        isFreeShipping: false,
        shippingFee: 49,
        freeShippingThreshold: 999,
        codFee: 0,
        isCodFeeEnabled: false,
        vamashipEnabled: true
    });

    const recalculateTimer = useRef(null);

    // Fetch active coupons for shopper visibility
    const fetchActiveCoupons = async () => {
        try {
            const { data } = await api.get('/coupons/active');
            if (Array.isArray(data)) {
                setActiveCoupons(data);
            }
        } catch (err) {
            console.warn('[COUPONS] Failed to fetch active coupons:', err.message);
        }
    };

    const refreshShippingConfig = async () => {
        try {
            const { data } = await api.get('/config/shipping');
            if (data.success && data.data) {
                setShippingConfig(data.data);
            }
        } catch (error) {
            console.warn('[SHIPPING-CONFIG] Failed to fetch shipping config:', error.message);
        }
    };

    useEffect(() => {
        refreshShippingConfig();
        fetchActiveCoupons();
    }, []);

    const calculateShipping = (amount) => {
        if (!shippingConfig) return 0;
        if (shippingConfig.isFreeShipping || Number(shippingConfig.shippingFee) === 0) return 0;
        if (Number(shippingConfig.freeShippingThreshold) > 0 && amount >= Number(shippingConfig.freeShippingThreshold)) return 0;
        return Number(shippingConfig.shippingFee) || 0;
    };

    const calculateCodFee = (paymentMethod) => {
        if (paymentMethod !== 'COD') return 0;
        if (!shippingConfig?.isCodFeeEnabled) return 0;
        return Number(shippingConfig?.codFee) || 0;
    };

    const openCartDrawer = () => setIsCartDrawerOpen(true);
    const closeCartDrawer = () => setIsCartDrawerOpen(false);

    // Save cart to localStorage
    const saveToLocalStorage = (cartData) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    };

    // Recalculate prices and coupon eligibility from backend
    const recalculateServerTotals = useCallback(async (itemsToCalc, couponCodeToUse) => {
        const items = itemsToCalc || cart?.cartItems || [];
        const code = couponCodeToUse !== undefined ? couponCodeToUse : (appliedCoupon?.code || null);

        if (!items || items.length === 0) {
            setServerTotals({
                itemsPrice: 0,
                mrpTotal: 0,
                mrpSavings: 0,
                discount: 0,
                shippingPrice: 0,
                freeShippingThreshold: 999,
                amountNeededForFreeShipping: 999,
                taxPrice: 0,
                totalPrice: 0,
                coupon: null,
                couponError: null,
                stockWarnings: [],
                loading: false,
            });
            return;
        }

        try {
            setServerTotals(prev => ({ ...prev, loading: true }));
            const { data } = await api.post('/cart/recalculate', {
                cartItems: items,
                couponCode: code,
            });

            if (data.success) {
                // Ensure itemsPrice from server never inexplicably diverges from legitimate client cart item totals
                const localSubtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
                const localMrpTotal = items.reduce((sum, it) => sum + (Number(it.mrp || it.price) || 0) * (Number(it.qty) || 1), 0);
                const verifiedItemsPrice = (data.itemsPrice && data.itemsPrice > 0) ? data.itemsPrice : localSubtotal;
                const verifiedMrpTotal = (data.mrpTotal && data.mrpTotal > 0) ? data.mrpTotal : localMrpTotal;
                const verifiedMrpSavings = Math.max(0, verifiedMrpTotal - verifiedItemsPrice);
                const discount = data.discount || 0;
                const postDiscountSubtotal = Math.max(0, verifiedItemsPrice - discount);
                const shippingPrice = data.shippingPrice !== undefined ? data.shippingPrice : (postDiscountSubtotal >= 999 || verifiedItemsPrice === 0 ? 0 : 49);
                const totalPrice = postDiscountSubtotal + shippingPrice;

                setServerTotals({
                    itemsPrice: verifiedItemsPrice,
                    mrpTotal: verifiedMrpTotal,
                    mrpSavings: verifiedMrpSavings,
                    discount: discount,
                    shippingPrice: shippingPrice,
                    freeShippingThreshold: data.freeShippingThreshold || 999,
                    amountNeededForFreeShipping: data.amountNeededForFreeShipping ?? Math.max(0, 999 - postDiscountSubtotal),
                    taxPrice: data.taxPrice || 0,
                    totalPrice: totalPrice,
                    coupon: data.coupon || null,
                    couponError: data.couponError || null,
                    stockWarnings: data.stockWarnings || [],
                    loading: false,
                });

                // Update active applied coupon if verified
                if (data.coupon) {
                    setAppliedCoupon(data.coupon);
                    try { localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(data.coupon)); } catch {}
                } else if (code && data.couponError) {
                    // Invalid/expired coupon
                    setAppliedCoupon(null);
                    try { localStorage.removeItem(COUPON_STORAGE_KEY); } catch {}
                }

                // If stock was clamped or adjusted on server, sync back to local cart
                if (data.stockWarnings && data.stockWarnings.length > 0 && data.verifiedItems) {
                    const updatedItems = data.verifiedItems.filter(vi => vi.qty > 0);
                    setCart({ cartItems: updatedItems });
                    saveToLocalStorage({ cartItems: updatedItems });
                }
            }
        } catch (error) {
            console.error('Server cart recalculation failed, using offline fallback:', error);
            // Offline fallback
            const fallbackSubtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
            const fallbackMrpTotal = items.reduce((sum, it) => sum + (Number(it.mrp || it.price) || 0) * (Number(it.qty) || 1), 0);
            const fallbackSavings = Math.max(0, fallbackMrpTotal - fallbackSubtotal);
            const fallbackShipping = fallbackSubtotal >= 999 || fallbackSubtotal === 0 ? 0 : 49;
            setServerTotals(prev => ({
                ...prev,
                itemsPrice: fallbackSubtotal,
                mrpTotal: fallbackMrpTotal,
                mrpSavings: fallbackSavings,
                shippingPrice: fallbackShipping,
                amountNeededForFreeShipping: Math.max(0, 999 - fallbackSubtotal),
                totalPrice: fallbackSubtotal + fallbackShipping,
                loading: false,
            }));
        }
    }, [cart?.cartItems, appliedCoupon?.code]);

    // Initialize cart from localStorage or API on mount
    useEffect(() => {
        const initializeCart = async () => {
            try {
                const localCart = localStorage.getItem(CART_STORAGE_KEY);
                let initialCart = { cartItems: [] };
                if (localCart) {
                    initialCart = JSON.parse(localCart);
                    setCart(initialCart);
                }

                if (user) {
                    try {
                        const guestCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{"cartItems":[]}');
                        if (guestCart.cartItems && guestCart.cartItems.length > 0) {
                            const { data } = await api.post('/cart/merge', { cartItems: guestCart.cartItems });
                            setCart(data);
                            initialCart = data;
                            saveToLocalStorage(data);
                        } else {
                            const { data } = await api.get('/cart');
                            setCart(data);
                            initialCart = data;
                            saveToLocalStorage(data);
                        }
                    } catch (error) {
                        console.error('Error fetching/merging cart from server', error);
                    }
                }

                // Initial server-side price recalculation
                if (initialCart.cartItems && initialCart.cartItems.length > 0) {
                    recalculateServerTotals(initialCart.cartItems, appliedCoupon?.code);
                }
            } catch (error) {
                console.error('Error initializing cart', error);
                setCart({ cartItems: [] });
            } finally {
                setIsInitialized(true);
            }
        };

        initializeCart();
    }, [user]);

    // Debounced recalculation on cart items change
    useEffect(() => {
        if (!isInitialized) return;

        if (recalculateTimer.current) clearTimeout(recalculateTimer.current);
        recalculateTimer.current = setTimeout(() => {
            recalculateServerTotals(cart.cartItems, appliedCoupon?.code);
        }, 150);

        return () => {
            if (recalculateTimer.current) clearTimeout(recalculateTimer.current);
        };
    }, [cart.cartItems, appliedCoupon?.code, isInitialized, recalculateServerTotals]);

    const addToCart = async (product, qty = 1) => {
        if (!product || !product._id) {
            console.error('addToCart called with invalid product:', product);
            return;
        }

        try {
            const numQty = Math.max(1, parseInt(qty) || 1);
            const itemPrice = parseFloat(product.price) || 0;
            const itemMrp = parseFloat(product.mrp || product.price) || itemPrice;
            const variantId = product.variantId || product.selectedVariantId || (product.selectedVariant?.id) || null;
            const variantLabel = typeof product.selectedVariant === 'string'
                ? product.selectedVariant
                : (product.selectedVariant?.name || product.selectedVariant?.title || null);

            trackWebsiteEvent('add_to_cart', {
                productId: product._id,
                name: product.name,
                price: itemPrice,
                qty: numQty,
                product: product,
            });
            const cartItemData = {
                product: product._id,
                _id: product._id,
                name: product.name,
                qty: numQty,
                image: product.image,
                price: itemPrice,
                mrp: itemMrp,
                sku: product.sku || '',
                packSize: product.packSize || '',
                variantId: variantId,
                selectedVariant: variantLabel,
                gst: product.gst || 0,
                weight: product.weight || 0.5,
            };

            // 1. Instant optimistic update to local state & storage (0ms UI lag!)
            const optimisticCart = updateLocalCart(cart, cartItemData);
            setCart(optimisticCart);
            saveToLocalStorage(optimisticCart);

            // 2. Background non-blocking sync with server
            if (user) {
                api.post('/cart', cartItemData)
                    .then(({ data }) => {
                        if (data && data.cartItems) {
                            setCart(data);
                            saveToLocalStorage(data);
                        }
                    })
                    .catch((err) => {
                        console.error('Background server cart sync skipped or failed:', err?.message);
                    });
            }

            // 3. Background totals recalculation
            recalculateServerTotals(optimisticCart.cartItems, appliedCoupon?.code);
        } catch (error) {
            console.error('Error adding to cart', error);
        }
    };

    const updateLocalCart = (currentCart, newItem) => {
        const existingItems = Array.isArray(currentCart?.cartItems) ? currentCart.cartItems : [];
        const newPid = String(newItem.product || newItem._id);
        const incomingVar = String(newItem.selectedVariant || '').trim().toLowerCase();
        
        // Find if this product exists; if incoming has a variant, replace older empty/default pack of same medicine
        const itemIndex = existingItems.findIndex(item => {
            const sameProduct = String(item.product) === newPid || String(item._id) === newPid;
            if (!sameProduct) return false;
            const itemVar = String(item.selectedVariant || '').trim().toLowerCase();
            if (incomingVar) {
                return itemVar === incomingVar || !itemVar;
            }
            return true;
        });

        let updatedItems;
        if (itemIndex > -1) {
            updatedItems = [...existingItems];
            updatedItems[itemIndex] = { 
                ...updatedItems[itemIndex], 
                ...newItem,
                qty: newItem.qty,
            };
        } else {
            updatedItems = [...existingItems, newItem];
        }

        return { cartItems: updatedItems };
    };

    const removeFromCart = async (id) => {
        if (!id) return;
        
        try {
            const removingItem = (cart?.cartItems || []).find(it => (it.product || it._id) === id);
            if (removingItem) {
                trackWebsiteEvent('remove_from_cart', {
                    productId: id,
                    name: removingItem.name,
                    price: parseFloat(removingItem.price) || 0,
                    qty: Number(removingItem.qty) || 1,
                });
            }

            let updatedCart;
            if (user) {
                try {
                    const { data } = await api.delete(`/cart/${id}`);
                    updatedCart = data;
                } catch (error) {
                    console.error('Error removing from cart on server', error);
                    updatedCart = removeLocalItem(cart, id);
                }
            } else {
                updatedCart = removeLocalItem(cart, id);
            }

            setCart(updatedCart);
            saveToLocalStorage(updatedCart);
            recalculateServerTotals(updatedCart.cartItems, appliedCoupon?.code);
        } catch (error) {
            console.error('Error removing from cart', error);
        }
    };

    const removeLocalItem = (currentCart, itemId) => {
        const sid = String(itemId);
        const existingItems = Array.isArray(currentCart?.cartItems) ? currentCart.cartItems : [];
        const updatedItems = existingItems.filter(
            item => String(item.product) !== sid && String(item._id) !== sid
        );
        return { cartItems: updatedItems };
    };

    const clearCart = async () => {
        try {
            if (user) {
                try {
                    await api.delete('/cart');
                } catch (error) {
                    console.warn('Cart cleared on client');
                }
            }
            setCart({ cartItems: [] });
            saveToLocalStorage({ cartItems: [] });
            setAppliedCoupon(null);
            try { localStorage.removeItem(COUPON_STORAGE_KEY); } catch {}
            recalculateServerTotals([], null);
        } catch (error) {
            console.error('Error clearing cart', error);
        }
    };

    const updateCartItemQuantity = async (productId, newQty) => {
        try {
            const sid = String(productId);
            const currentItems = Array.isArray(cart?.cartItems) ? cart.cartItems : [];
            const itemIndex = currentItems.findIndex(
                item => String(item.product) === sid || String(item._id) === sid
            );

            if (itemIndex > -1) {
                if (newQty <= 0) {
                    removeFromCart(productId);
                } else {
                    const updatedItems = [...currentItems];
                    updatedItems[itemIndex] = {
                        ...updatedItems[itemIndex],
                        qty: Math.max(1, parseInt(newQty)),
                    };
                    const updatedCart = { ...cart, cartItems: updatedItems };
                    setCart(updatedCart);
                    saveToLocalStorage(updatedCart);

                    if (user) {
                        try {
                            await api.post('/cart', {
                                product: productId,
                                qty: newQty,
                            });
                        } catch (error) {
                            console.error('Error updating cart on server', error);
                        }
                    }

                    recalculateServerTotals(updatedItems, appliedCoupon?.code);
                }
            }
        } catch (error) {
            console.error('Error updating cart quantity', error);
        }
    };

    // Apply coupon handler
    const applyCouponCode = async (code) => {
        if (!code || !code.trim()) return { success: false, message: 'Please enter a promo code' };
        const cleanCode = code.trim().toUpperCase();

        try {
            const { data } = await api.post('/cart/recalculate', {
                cartItems: cart.cartItems,
                couponCode: cleanCode,
            });

            if (data.coupon) {
                setAppliedCoupon(data.coupon);
                try { localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(data.coupon)); } catch {}
                setServerTotals({
                    itemsPrice: data.itemsPrice || 0,
                    mrpTotal: data.mrpTotal || 0,
                    mrpSavings: data.mrpSavings || 0,
                    discount: data.discount || 0,
                    shippingPrice: data.shippingPrice || 0,
                    freeShippingThreshold: data.freeShippingThreshold || 999,
                    amountNeededForFreeShipping: data.amountNeededForFreeShipping || 0,
                    taxPrice: data.taxPrice || 0,
                    totalPrice: data.totalPrice || 0,
                    coupon: data.coupon,
                    couponError: null,
                    stockWarnings: data.stockWarnings || [],
                    loading: false,
                });
                return { success: true, coupon: data.coupon };
            } else {
                const msg = data.couponError || 'Invalid or ineligible coupon code';
                return { success: false, message: msg };
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to validate coupon';
            return { success: false, message: msg };
        }
    };

    // Remove coupon handler
    const removeCouponCode = () => {
        setAppliedCoupon(null);
        try { localStorage.removeItem(COUPON_STORAGE_KEY); } catch {}
        recalculateServerTotals(cart.cartItems, null);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                updateCartItemQuantity,
                isInitialized,
                isCartDrawerOpen,
                setIsCartDrawerOpen,
                openCartDrawer,
                closeCartDrawer,
                shippingConfig,
                refreshShippingConfig,
                calculateShipping,
                calculateCodFee,
                serverTotals,
                recalculateServerTotals,
                appliedCoupon,
                applyCouponCode,
                removeCouponCode,
                activeCoupons,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
