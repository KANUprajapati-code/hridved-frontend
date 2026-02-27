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
    const [checkoutData, setCheckoutData] = useState({
        currentStep: 1, // 1: Address, 2: Shipping, 3: Payment, 4: Success
        address: null,
        shippingMethod: null,
        shippingProvider: null,
        shippingCost: 0,
        orderId: null,
        orderDetails: null,
    });

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

    const updateShippingMethod = useCallback((method, cost, provider = 'Fship') => {
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
        availableAddresses,
        setAvailableAddresses,
        resetCheckout,
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};

export default CheckoutContext;
