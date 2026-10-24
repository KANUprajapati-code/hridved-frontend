import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'hridved_wishlist';

const readWishlist = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};

export const WishlistProvider = ({ children }) => {
    const [items, setItems] = useState(readWishlist);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const toggleWishlist = (product) => {
        const productId = product?._id || product?.id;
        if (!productId) return;
        setItems((current) => current.some((item) => (item._id || item.id) === productId)
            ? current.filter((item) => (item._id || item.id) !== productId)
            : [...current, product]);
    };

    const isWishlisted = (productId) => items.some((item) => (item._id || item.id) === productId);

    return (
        <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
