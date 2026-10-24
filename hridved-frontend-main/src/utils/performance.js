// Cache management
export class CacheManager {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTTL = null) {
        const expiryTime = Date.now() + (customTTL || this.ttl);
        this.cache.set(key, {
            value,
            expiryTime,
        });
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiryTime) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    remove(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiryTime) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }
}

// Create global cache instance
export const globalCache = new CacheManager();

// Debounce function for search and input handling
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Memoization for expensive computations
export const memoize = (func) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func(...args);
        cache.set(key, result);
        return result;
    };
};

// Image optimization helpers
export const getOptimizedImageUrl = (url, width = null, height = null, quality = 80) => {
    if (!url) return url;
    
    // If using a CDN that supports parameters, add them
    // Example for Cloudinary: https://res.cloudinary.com/...
    // Example for imgix: https://domain.imgix.net/...
    
    // For now, return original URL
    return url;
};

// Preload critical resources
export const preloadResource = (href, type = 'prefetch') => {
    const link = document.createElement('link');
    link.rel = type; // 'prefetch', 'preload', 'dns-prefetch'
    link.href = href;
    
    if (type === 'preload') {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
};

// Lazy load a module
export const lazyLoadModule = (importFunc) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Lazy load timeout'));
        }, 10000); // 10 second timeout

        importFunc()
            .then((module) => {
                clearTimeout(timeoutId);
                resolve(module);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
};

// Measure async function
export const measureAsyncPerformance = async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
};

// Local storage with expiry
export const setLocalStorageWithExpiry = (key, value, expiryMs) => {
    const item = {
        value,
        expiry: Date.now() + expiryMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

export const getLocalStorageWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    } catch (e) {
        localStorage.removeItem(key);
        return null;
    }
};

// IndexedDB wrapper for large data
export const openIndexedDB = (dbName, version = 1, onUpgrade = null) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = (event) => {
            if (onUpgrade) {
                onUpgrade(event.target.result);
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

// Connection status
export const isOnline = () => navigator.onLine;

export const onOnline = (callback) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
};

export const onOffline = (callback) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
};

export default {
    CacheManager,
    globalCache,
    debounce,
    throttle,
    memoize,
    getOptimizedImageUrl,
    preloadResource,
    lazyLoadModule,
    measurePerformance,
    measureAsyncPerformance,
    setLocalStorageWithExpiry,
    getLocalStorageWithExpiry,
    openIndexedDB,
    isOnline,
    onOnline,
    onOffline,
};
