import { createContext, useCallback, useContext, useState } from 'react';
import api from '../utils/api';

const JourneyAnalyticsContext = createContext(null);
const CONSENT_KEY = 'hridved_activity_analytics_consent';
const SESSION_KEY = 'hridved_activity_session';

const getSessionId = () => {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
};

export const JourneyAnalyticsProvider = ({ children }) => {
    const [consent, setConsentState] = useState(() => localStorage.getItem(CONSENT_KEY));
    const setConsent = useCallback((value) => {
        localStorage.setItem(CONSENT_KEY, value);
        setConsentState(value);
    }, []);
    const track = useCallback(async (event) => {
        if (localStorage.getItem(CONSENT_KEY) !== 'yes') return;
        try {
            await api.post('/journey/event', { ...event, sessionId: getSessionId() });
        } catch {
            // Activity analytics is optional and must never interrupt shopping.
        }
    }, []);

    return (
        <JourneyAnalyticsContext.Provider value={{ consent, setConsent, track }}>
            {children}
            {consent === null ? (
                <aside className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl md:flex md:items-center md:justify-between md:gap-5" aria-label="Activity analytics choice">
                    <p className="text-sm leading-relaxed text-gray-700">Allow optional activity analytics to help us understand product interest and checkout drop-off? This records product names viewed or added and checkout steps; signed-in activity may be linked to your account. Consultation pages and consultation details are not tracked. <a href="/privacy" className="font-semibold text-primary underline">Privacy policy</a></p>
                    <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
                        <button onClick={() => setConsent('no')} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">No thanks</button>
                        <button onClick={() => setConsent('yes')} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Allow analytics</button>
                    </div>
                </aside>
            ) : <button onClick={() => setConsent(null)} className="fixed bottom-3 left-3 z-[110] rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-600 shadow-lg">Activity analytics: {consent === 'yes' ? 'On' : 'Off'} · Change</button>}
        </JourneyAnalyticsContext.Provider>
    );
};

export const useJourneyAnalytics = () => {
    const context = useContext(JourneyAnalyticsContext);
    if (!context) throw new Error('useJourneyAnalytics must be used inside JourneyAnalyticsProvider');
    return context;
};
