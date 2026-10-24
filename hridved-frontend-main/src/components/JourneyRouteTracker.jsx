import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useJourneyAnalytics } from '../context/JourneyAnalyticsContext';

const checkoutSteps = {
    '/checkout/address': 'address',
    '/checkout/shipping': 'shipping',
    '/checkout/payment': 'payment',
};

const JourneyRouteTracker = () => {
    const { pathname } = useLocation();
    const { track } = useJourneyAnalytics();

    useEffect(() => {
        const step = checkoutSteps[pathname];
        if (step) track({ type: 'checkout_step', step });
    }, [pathname, track]);

    return null;
};

export default JourneyRouteTracker;
