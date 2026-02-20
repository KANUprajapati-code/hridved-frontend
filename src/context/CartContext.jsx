import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'ecommerce_cart';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
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
                        const { data } = await api.get('/cart');
                        setCart(data);
                        // Update localStorage with server data
                        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
                    } catch (error) {
                        console.error('Error fetching cart from server', error);
                        // Keep the localStorage cart if API fails
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
        try {
            const cartItemData = {
                product: product._id,
                _id: product._id,
                name: product.name,
                qty: parseInt(qty),
                image: product.image,
                price: parseFloat(product.price),
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
                    const updatedCart = updateLocalCart(cart, cartItemData);
                    setCart(updatedCart);
                    saveToLocalStorage(updatedCart);
                }
            } else {
                // For guests, use localStorage only
                const updatedCart = updateLocalCart(cart, cartItemData);
                setCart(updatedCart);
                saveToLocalStorage(updatedCart);
            }
        } catch (error) {
            console.error('Error adding to cart', error);
        }
    };

    const updateLocalCart = (currentCart, newItem) => {
        const existingItems = currentCart.cartItems || [];
        const itemIndex = existingItems.findIndex(item => item.product === newItem.product || item._id === newItem._id);

        let updatedItems;
        if (itemIndex > -1) {
            // Update quantity if item exists
            updatedItems = [...existingItems];
            updatedItems[itemIndex].qty = newItem.qty;
        } else {
            // Add new item
            updatedItems = [...existingItems, newItem];
        }

        return { cartItems: updatedItems };
    };

    const removeFromCart = async (id) => {
        try {
            if (user) {
                // Sync with server for logged-in users
                try {
                    const { data } = await api.delete(`/cart/${id}`);
                    setCart(data);
                    saveToLocalStorage(data);
                } catch (error) {
                    console.error('Error removing from cart on server', error);
                    // Fallback to local storage
                    const updatedCart = removeLocalItem(cart, id);
                    setCart(updatedCart);
                    saveToLocalStorage(updatedCart);
                }
            } else {
                // For guests, use localStorage only
                const updatedCart = removeLocalItem(cart, id);
                setCart(updatedCart);
                saveToLocalStorage(updatedCart);
            }
        } catch (error) {
            console.error('Error removing from cart', error);
        }
    };

    const removeLocalItem = (currentCart, itemId) => {
        const updatedItems = (currentCart.cartItems || []).filter(
            item => item.product !== itemId && item._id !== itemId
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

    const updateCartItemQuantity = async (productId, newQty) => {
        try {
            const updatedCart = { ...cart };
            const itemIndex = (updatedCart.cartItems || []).findIndex(
                item => item.product === productId || item._id === productId
            );

            if (itemIndex > -1) {
                if (newQty <= 0) {
                    removeFromCart(productId);
                } else {
                    updatedCart.cartItems[itemIndex].qty = newQty;
                    setCart(updatedCart);
                    saveToLocalStorage(updatedCart);

                    if (user) {
                        try {
                            const { data } = await api.post('/cart', {
                                product: productId,
                                qty: newQty,
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
