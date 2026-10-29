import { useState } from 'react';
import { hasAnalyticsConsent, setAnalyticsConsent } from '../utils/websiteAnalytics';

export default function AnalyticsConsent() {
    const [choice, setChoice] = useState(() => localStorage.getItem('hridved_analytics_consent'));
    if (choice) return null;
    const decide = (accepted) => { setAnalyticsConsent(accepted); setChoice(accepted ? 'yes' : 'no'); };
    return <aside role="dialog" aria-label="Analytics preferences" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-2xl md:flex md:items-center md:gap-5">
        <div className="flex-1"><p className="font-bold text-gray-900">Your privacy choices</p><p className="mt-1 text-sm text-gray-600">Allow anonymous analytics to help us understand product interest and checkout completion. We do not send your name, phone, address or cart contents through analytics. This choice is optional and can be changed by clearing site preferences.</p></div>
        <div className="mt-3 flex shrink-0 gap-2 md:mt-0"><button onClick={() => decide(false)} className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Decline</button><button onClick={() => decide(true)} className="rounded-lg bg-primary hover:bg-[#07470a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors">Allow analytics</button></div>
    </aside>;
}
