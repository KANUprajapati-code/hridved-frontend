import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useJourneyAnalytics } from './JourneyAnalyticsContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'ecommerce_cart';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const { track } = useJourneyAnalytics();
    const [cart, setCart] = useState({ cartItems: [] });
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize cart from localStorage or API on mount
    useEffect(() => {
        const initializeCart = async () => {
            try {
                // First, try to load from localStorage
                const localCart = localStorage.getItem(CART_STORAGE_KEY);
                if (localCart) {
                    const parsedCart = JSON.parse(localCart);
                    setCart(parsedCart);
                }

                // If user is logged in, sync with server
                if (user) {
                    try {
                        const guestCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{"cartItems":[]}');

                        if (guestCart.cartItems && guestCart.cartItems.length > 0) {
                            // Merge guest items to server
                            const { data } = await api.post('/cart/merge', { cartItems: guestCart.cartItems });
                            setCart(data);
                            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
                        } else {
                            // Normal sync
                            const { data } = await api.get('/cart');
                            setCart(data);
                            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
                        }
                    } catch (error) {
                        console.error('Error fetching/merging cart from server', error);
                        // Fallback to local
                    }
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

    const saveToLocalStorage = (cartData) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    };

    const addToCart = async (product, qty = 1) => {
        if (!product || !product._id) {
            console.error('addToCart called with invalid product:', product);
            return;
        }

        try {
            track({ type: 'add_to_cart', productId: product._id, productName: product.name, price: Number(product.price) || 0, quantity: Math.max(1, parseInt(qty) || 1) });
            const cartItemData = {
                product: product._id, // Ensure this is a string
                _id: product._id,      // Keep for backward compatibility
                name: product.name,
                variantName: product.variantName || '',
                qty: Math.max(1, parseInt(qty)),
                image: product.image,
                price: parseFloat(product.price),
                gst: product.gst || 0,
                weight: product.weight || 0.5,
            };

            if (user) {
                // Sync with server for logged-in users
                try {
                    const { data } = await api.post('/cart', cartItemData);
                    setCart(data);
                    saveToLocalStorage(data);
                } catch (error) {
                    console.error('Error adding to cart on server', error);
                    // Fallback to local storage
                    setCart(prevCart => {
                        const updatedCart = updateLocalCart(prevCart, cartItemData);
                        saveToLocalStorage(updatedCart);
                        return updatedCart;
                    });
                }
            } else {
                // For guests, use localStorage only
                setCart(prevCart => {
                    const updatedCart = updateLocalCart(prevCart, cartItemData);
                    saveToLocalStorage(updatedCart);
                    return updatedCart;
                });
            }
        } catch (error) {
            console.error('Error adding to cart', error);
        }
    };

    const updateLocalCart = (currentCart, newItem) => {
        const existingItems = Array.isArray(currentCart?.cartItems) ? currentCart.cartItems : [];
        const itemIndex = existingItems.findIndex(item => 
            (String(item.product) === String(newItem.product) || String(item._id) === String(newItem._id)) &&
            (item.variantName || '') === (newItem.variantName || '')
        );

        let updatedItems;
        if (itemIndex > -1) {
            // Update quantity if item exists - create new object for immutability
            updatedItems = [...existingItems];
            updatedItems[itemIndex] = { 
                ...updatedItems[itemIndex], 
                qty: newItem.qty 
            };
        } else {
            // Add new item
            updatedItems = [...existingItems, newItem];
        }

        return { cartItems: updatedItems };
    };

    const removeFromCart = async (itemOrId) => {
        if (!itemOrId) return;
        const item = typeof itemOrId === 'object' ? itemOrId : null;
        const id = item ? (item.product || item._id) : itemOrId;
        const variantName = item?.variantName || '';
        
        try {
            if (user) {
                // Sync with server for logged-in users
                try {
                    const { data } = await api.delete(`/cart/${id}`, { params: { variantName } });
                    setCart(data);
                    saveToLocalStorage(data);
                } catch (error) {
                    console.error('Error removing from cart on server', error);
                    // Fallback to local storage
                    setCart(prevCart => {
                        const updatedCart = removeLocalItem(prevCart, item || id);
                        saveToLocalStorage(updatedCart);
                        return updatedCart;
                    });
                }
            } else {
                // For guests, use localStorage only
                setCart(prevCart => {
                    const updatedCart = removeLocalItem(prevCart, item || id);
                    saveToLocalStorage(updatedCart);
                    return updatedCart;
                });
            }
        } catch (error) {
            console.error('Error removing from cart', error);
        }
    };

    const removeLocalItem = (currentCart, itemOrId) => {
        const item = typeof itemOrId === 'object' ? itemOrId : null;
        const sid = String(item ? (item.product || item._id) : itemOrId);
        const existingItems = Array.isArray(currentCart?.cartItems) ? currentCart.cartItems : [];
        const updatedItems = existingItems.filter(
            (cartItem) => {
                const matchesProduct = String(cartItem.product) === sid || String(cartItem._id) === sid;
                if (!matchesProduct) return true;
                return item ? (cartItem.variantName || '') !== (item.variantName || '') : false;
            }
        );
        return { cartItems: updatedItems };
    };

    const clearCart = async () => {
        try {
            if (user) {
                // Sync with server for logged-in users
                try {
                    const { data } = await api.delete('/cart');
                    setCart(data);
                    saveToLocalStorage(data);
                } catch (error) {
                    console.error('Error clearing cart on server', error);
                    // Fallback to local storage
                    setCart({ cartItems: [] });
                    saveToLocalStorage({ cartItems: [] });
                }
            } else {
                // For guests, use localStorage only
                setCart({ cartItems: [] });
                saveToLocalStorage({ cartItems: [] });
            }
        } catch (error) {
            console.error('Error clearing cart', error);
        }
    };

    const updateCartItemQuantity = async (itemOrId, newQty) => {
        try {
            const target = typeof itemOrId === 'object' ? itemOrId : null;
            const productId = target ? (target.product || target._id) : itemOrId;
            const variantName = target?.variantName || '';
            const updatedCart = { ...cart };
            const itemIndex = (updatedCart.cartItems || []).findIndex(
                item => (String(item.product) === String(productId) || String(item._id) === String(productId)) && (item.variantName || '') === variantName
            );

            if (itemIndex > -1) {
                if (newQty <= 0) {
                    removeFromCart(target || productId);
                } else {
                    updatedCart.cartItems[itemIndex].qty = newQty;
                    setCart(updatedCart);
                    saveToLocalStorage(updatedCart);

                    if (user) {
                        try {
                            const { data } = await api.post('/cart', {
                                product: productId,
                                qty: newQty,
                                name: updatedCart.cartItems[itemIndex].name,
                                image: updatedCart.cartItems[itemIndex].image,
                                price: updatedCart.cartItems[itemIndex].price,
                                gst: updatedCart.cartItems[itemIndex].gst || 0,
                                weight: updatedCart.cartItems[itemIndex].weight || 0.5,
                                variantName,
                            });
                            setCart(data);
                            saveToLocalStorage(data);
                        } catch (error) {
                            console.error('Error updating cart on server', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error updating cart quantity', error);
        }
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
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
