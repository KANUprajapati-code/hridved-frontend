import React, { createContext, useState, useContext, useCallback } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within CheckoutProvider');
    }
    return context;
};

export const CheckoutProvider = ({ children }) => {
    // Load initial state from localStorage if available
    const [checkoutData, setCheckoutData] = useState(() => {
        const savedData = localStorage.getItem('checkoutData');
        const initial = {
            currentStep: 1, // 1: Address, 2: Shipping, 3: Payment, 4: Success
            address: null,
            shippingMethod: null,
            shippingProvider: null,
            shippingCost: 0,
            orderId: null,
            orderDetails: null,
            coupon: null,
            discount: 0,
        };
        
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                return { ...initial, ...parsed };
            } catch (e) {
                return initial;
            }
        }
        return initial;
    });

    // Save to localStorage whenever checkoutData changes
    React.useEffect(() => {
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }, [checkoutData]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableAddresses, setAvailableAddresses] = useState([]);
    const [shippingOptions, setShippingOptions] = useState([]);

    const updateStep = useCallback((step) => {
        setCheckoutData(prev => ({ ...prev, currentStep: step }));
    }, []);

    const updateAddress = useCallback((address) => {
        setCheckoutData(prev => ({ ...prev, address }));
        setError(null);
    }, []);

    const updateShippingMethod = useCallback((method, cost, provider = 'Vamaship') => {
        setCheckoutData(prev => ({
            ...prev,
            shippingMethod: method,
            shippingProvider: provider,
            shippingCost: cost
        }));
        setError(null);
    }, []);

    const setOrderId = useCallback((orderId, orderDetails) => {
        setCheckoutData(prev => ({
            ...prev,
            orderId,
            orderDetails
        }));
    }, []);

    const setErrorMessage = useCallback((message) => {
        setError(message);
    }, []);

    const applyCoupon = useCallback((coupon, discount) => {
        setCheckoutData(prev => ({
            ...prev,
            coupon,
            discount
        }));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const resetCheckout = useCallback(() => {
        setCheckoutData({
            currentStep: 1,
            address: null,
            shippingMethod: null,
            shippingProvider: null,
            shippingCost: 0,
            orderId: null,
            orderDetails: null,
            coupon: null,
            discount: 0,
        });
        setError(null);
        setAvailableAddresses([]);
        setShippingOptions([]);
    }, []);

    const value = {
        checkoutData,
        loading,
        setLoading,
        error,
        setErrorMessage,
        clearError,
        updateStep,
        updateAddress,
        updateShippingMethod,
        setOrderId,
        setShippingOptions,
        shippingOptions,
        availableAddresses,
        setAvailableAddresses,
        resetCheckout,
        applyCoupon,
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};

export default CheckoutContext;
