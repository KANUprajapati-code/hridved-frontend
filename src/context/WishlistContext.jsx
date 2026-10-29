import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const WISHLIST_STORAGE_KEY = 'hridved_wishlist';

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast() || {};
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Initialize wishlist from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setWishlist(parsed);
                }
            }
        } catch (err) {
            console.error('Failed to parse local wishlist:', err);
        }
    }, []);

    // 2. Sync with server when user logs in
    useEffect(() => {
        const syncWithServer = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const localStored = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
                const localIds = localStored.map(item => item._id || item);

                if (localIds.length > 0) {
                    const { data } = await api.post('/users/wishlist/sync', { productIds: localIds });
                    if (Array.isArray(data)) {
                        setWishlist(data);
                        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data));
                    }
                } else {
                    const { data } = await api.get('/users/wishlist');
                    if (Array.isArray(data)) {
                        setWishlist(data);
                        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error('Failed to sync wishlist with server:', err);
            } finally {
                setLoading(false);
            }
        };

        syncWithServer();
    }, [user]);

    // Save helper
    const saveWishlist = useCallback((items) => {
        setWishlist(items);
        try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            console.error('Failed to write wishlist to localStorage:', err);
        }
    }, []);

    // Check if item is in wishlist
    const isInWishlist = useCallback((productId) => {
        if (!productId) return false;
        const targetId = typeof productId === 'object' ? productId._id : productId;
        return wishlist.some(item => (item._id || item) === targetId);
    }, [wishlist]);

    // Toggle item in wishlist
    const toggleWishlist = useCallback(async (product) => {
        if (!product || !product._id) return;
        const productId = product._id;
        const exists = wishlist.some(item => (item._id || item) === productId);

        let updatedWishlist;
        if (exists) {
            updatedWishlist = wishlist.filter(item => (item._id || item) !== productId);
            saveWishlist(updatedWishlist);
            if (addToast) addToast(`Removed ${product.name || 'item'} from Wishlist`, 'info');
        } else {
            updatedWishlist = [...wishlist, product];
            saveWishlist(updatedWishlist);
            trackWebsiteEvent('add_to_wishlist', { productId });
            if (addToast) addToast(`Added ${product.name || 'item'} to Wishlist!`, 'success');
        }

        // Server sync in background for authenticated users
        if (user) {
            try {
                const { data } = await api.post(`/users/wishlist/${productId}`);
                if (data && Array.isArray(data.wishlist)) {
                    saveWishlist(data.wishlist);
                }
            } catch (err) {
                console.error('Error syncing wishlist toggle to server:', err);
            }
        }
    }, [wishlist, user, saveWishlist, addToast]);

    // Remove specific item
    const removeFromWishlist = useCallback(async (productId) => {
        if (!productId) return;
        const targetId = typeof productId === 'object' ? productId._id : productId;
        const itemToRemove = wishlist.find(item => (item._id || item) === targetId);
        const updatedWishlist = wishlist.filter(item => (item._id || item) !== targetId);
        saveWishlist(updatedWishlist);

        if (addToast) {
            addToast(`Removed ${itemToRemove?.name || 'item'} from Wishlist`, 'info');
        }

        if (user) {
            try {
                const { data } = await api.post(`/users/wishlist/${targetId}`);
                if (data && Array.isArray(data.wishlist)) {
                    saveWishlist(data.wishlist);
                }
            } catch (err) {
                console.error('Error removing wishlist item on server:', err);
            }
        }
    }, [wishlist, user, saveWishlist, addToast]);

    // Clear entire wishlist
    const clearWishlist = useCallback(() => {
        saveWishlist([]);
    }, [saveWishlist]);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistCount: wishlist.length,
                isInWishlist,
                toggleWishlist,
                removeFromWishlist,
                clearWishlist,
                loading,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
