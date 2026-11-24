import { useState, useEffect, useCallback } from 'react';
import { 
    Activity, 
    ShieldCheck, 
    AlertTriangle, 
    Wrench, 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    Calculator, 
    ShoppingCart, 
    Database, 
    Tag, 
    Package, 
    Truck, 
    Sparkles,
    ArrowRight
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const SystemHealthPage = () => {
    const { addToast } = useToast();
    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [repairing, setRepairing] = useState(false);
    const [lastRepairedActions, setLastRepairedActions] = useState([]);

    const fetchAudit = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/system-health/audit');
            setAuditData(data);
        } catch (err) {
            console.error('Failed to run diagnostics:', err);
            if (addToast) addToast(err.response?.data?.message || 'Failed to run diagnostics audit', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchAudit();
    }, [fetchAudit]);

    const handleAutoFix = async () => {
        try {
            setRepairing(true);
            const { data } = await api.post('/system-health/auto-fix');
            if (data.success) {
                setLastRepairedActions(data.fixedActions || []);
                if (addToast) addToast(data.message || 'Auto-repair completed successfully!', 'success');
                // Re-run audit to reflect fixes
                await fetchAudit();
            }
        } catch (err) {
            console.error('Auto-repair failed:', err);
            if (addToast) addToast(err.response?.data?.message || 'Auto-repair failed', 'error');
        } finally {
            setRepairing(false);
        }
    };

    const getSeverityBadge = (sev) => {
        switch (sev) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="space-y-8 font-sans pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Website Health & Bug Monitor</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        Autonomous diagnostic engine that audits mathematical accuracy, cart calculations, catalog pricing, and database integrity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAudit}
                        disabled={loading || repairing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        title="Re-run Diagnostics Audit"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>{loading ? 'Auditing...' : 'Run Diagnostics'}</span>
                    </button>
                    <button
                        onClick={handleAutoFix}
                        disabled={loading || repairing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-800 text-white hover:brightness-105 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        title="Auto-repair and fix detected discrepancies"
                    >
                        <Wrench size={14} className={repairing ? 'animate-spin' : ''} />
                        <span>{repairing ? 'Auto-Repairing...' : 'Auto-Fix All Issues'}</span>
                    </button>
                </div>
            </div>

            {/* Health Score Overview */}
            {auditData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Health Score</p>
                            <h3 className="text-4xl font-black text-gray-900 mt-1">{auditData.healthScore}%</h3>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                {auditData.status}
                            </span>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                            auditData.healthScore >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            <Activity size={28} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Products Checked</span>
                            <Package size={18} className="text-primary" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900">{auditData.totalProductsChecked} Products</h4>
                        <p className="text-xs text-gray-500 mt-1">Prices, MRP & bundle variants audited</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Coupons & Promos</span>
                            <Tag size={18} className="text-secondary" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900">{auditData.totalCouponsChecked} Active Rules</h4>
                        <p className="text-xs text-gray-500 mt-1">Expiry & discount math validated</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Audit Speed</span>
                            <Sparkles size={18} className="text-emerald-600" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900">{auditData.executionDurationMs} ms</h4>
                        <p className="text-xs text-gray-500 mt-1">Live sub-millisecond execution</p>
                    </div>
                </div>
            )}

            {/* Repair Notifications Banner */}
            {lastRepairedActions.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-sm">
                        <Sparkles size={18} className="text-emerald-600" />
                        <span>Recently Auto-Repaired Actions:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-emerald-800 space-y-1">
                        {lastRepairedActions.map((act, idx) => (
                            <li key={idx}>{act}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Subsystem Health Checks Grid */}
            {auditData && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        Verified Systems (Passing Diagnostics)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {auditData.passedChecks.map((chk, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5 shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{chk.name}</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{chk.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detected Issues & Auto-Repair Section */}
            {auditData && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={18} className={auditData.issues.length > 0 ? 'text-amber-500' : 'text-emerald-600'} />
                            <span>System Issues & Discrepancies ({auditData.issues.length})</span>
                        </h2>
                        {auditData.issues.length > 0 && (
                            <button
                                onClick={handleAutoFix}
                                disabled={repairing}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <span>Auto-Fix All Detected</span>
                                <ArrowRight size={13} />
                            </button>
                        )}
                    </div>

                    {auditData.issues.length === 0 ? (
                        <div className="py-10 text-center flex flex-col items-center justify-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-sm font-bold text-emerald-900">Zero Mathematical or System Errors Found</h3>
                            <p className="text-xs text-emerald-700 max-w-md mt-1">
                                Cart recalculation, bundle percentages, product variations, inventory stock, and courier thresholds are operating with 100% mathematical precision.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {auditData.issues.map((iss, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityBadge(iss.severity)}`}>
                                                {iss.severity}
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">{iss.subsystem}</span>
                                        </div>
                                        <p className="text-xs text-gray-800 font-medium">{iss.message}</p>
                                    </div>
                                    {iss.canAutoFix && (
                                        <button
                                            onClick={handleAutoFix}
                                            disabled={repairing}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-800 text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                                        >
                                            Auto-Repair
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SystemHealthPage;
