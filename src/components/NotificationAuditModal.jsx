import React, { useState, useEffect } from 'react';
import { 
    X, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle, 
    Bell, Send, Filter, Play, Clock, UserCheck, Ban, Check 
} from 'lucide-react';
import api from '../utils/api';
import Modal from './Modal';
import Badge from './Badge';

const NotificationAuditModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({});
    const [providers, setProviders] = useState({});
    const [loading, setLoading] = useState(true);
    const [runningSweep, setRunningSweep] = useState(false);
    const [sweepResult, setSweepResult] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            const { data } = await api.get('/notifications/logs', { params });
            if (data.success) {
                setLogs(data.logs || []);
                setStats(data.stats || {});
                setProviders(data.providers || {});
            }
        } catch (error) {
            console.error('Failed to fetch notification logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, filterStatus]);

    const handleRunSweep = async () => {
        try {
            setRunningSweep(true);
            setSweepResult(null);
            const { data } = await api.post('/notifications/abandoned-cart/run');
            if (data.success) {
                setSweepResult(data.summary);
                await fetchLogs();
            }
        } catch (error) {
            console.error('Sweep run failed:', error);
            alert('Failed to execute abandoned cart sweep.');
        } finally {
            setRunningSweep(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'delivered':
                return <Badge variant="success">Delivered (Live)</Badge>;
            case 'simulated_demo':
                return <Badge variant="neutral">Simulated (Demo)</Badge>;
            case 'suppressed_recent_order':
                return <Badge variant="gold">Suppressed (Purchased)</Badge>;
            case 'suppressed_opt_out':
                return <Badge variant="danger">Suppressed (Opt-Out)</Badge>;
            case 'frequency_capped':
                return <Badge variant="amber">Frequency Capped (24h)</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Notification & Abandoned-Cart Automation Audit"
            size="xl"
        >
            <div className="space-y-6 font-body text-xs text-gray-700">
                {/* Provider Status Banner */}
                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary text-sm">Provider Readiness:</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                providers.whatsapp?.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                WhatsApp: {providers.whatsapp?.configured ? 'Live Gateway' : 'Safe Simulation (Demo)'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                providers.sms?.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                SMS: {providers.sms?.configured ? providers.sms?.provider : 'Safe Simulation (Demo)'}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            Strict Compliance Active: Zero unsolicited messages sent in demo mode. Unverified order confirmations are completely blocked.
                        </p>
                    </div>

                    <button
                        onClick={handleRunSweep}
                        disabled={runningSweep}
                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                    >
                        {runningSweep ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                        <span>Run Abandoned-Cart Sweep</span>
                    </button>
                </div>

                {/* Sweep Execution Result Banner */}
                {sweepResult && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span>Sweep Finished:</span>
                            <span className="font-normal">
                                Evaluated: <strong>{sweepResult.totalEvaluated}</strong> | Dispatched/Simulated: <strong>{sweepResult.dispatchedOrSimulated}</strong> | Suppressed Due to Recent Purchase: <strong>{sweepResult.suppressedRecentOrder}</strong> | Suppressed Due to Opt-out: <strong>{sweepResult.suppressedOptOut}</strong>
                            </span>
                        </div>
                    </div>
                )}

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">Total Attempts</span>
                        <span className="text-xl font-black text-gray-900">{stats.total || 0}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="block text-[10px] text-emerald-600 uppercase font-bold">Delivered / Simulated</span>
                        <span className="text-xl font-black text-emerald-800">
                            {(stats.delivered || 0) + (stats.simulated_demo || 0)}
                        </span>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <span className="block text-[10px] text-purple-600 uppercase font-bold">Purchased (Blocked)</span>
                        <span className="text-xl font-black text-purple-800">{stats.suppressed_recent_order || 0}</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="block text-[10px] text-red-600 uppercase font-bold">Opted-Out</span>
                        <span className="text-xl font-black text-red-800">{stats.suppressed_opt_out || 0}</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="block text-[10px] text-amber-600 uppercase font-bold">Frequency Capped</span>
                        <span className="text-xl font-black text-amber-800">{stats.frequency_capped || 0}</span>
                    </div>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
                            <Filter size={12} /> Filter:
                        </span>
                        {[
                            { id: 'all', label: 'All Logs' },
                            { id: 'simulated_demo', label: 'Simulated' },
                            { id: 'delivered', label: 'Delivered' },
                            { id: 'suppressed_recent_order', label: 'Recent Order Suppressed' },
                            { id: 'suppressed_opt_out', label: 'Opt-Out Suppressed' },
                            { id: 'frequency_capped', label: '24h Capped' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilterStatus(f.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                    filterStatus === f.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchLogs}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Logs Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading delivery outcomes...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No logs found matching filter.</div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                                <tr>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Recipient (Masked)</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Compliance Guardrail Reason</th>
                                    <th className="p-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/50">
                                        <td className="p-3 font-bold text-primary">
                                            {log.notificationType === 'order_confirmation' && 'Order Confirmed'}
                                            {log.notificationType === 'shipping_update' && 'Shipping Update'}
                                            {log.notificationType === 'delivery_confirmation' && 'Delivered'}
                                            {log.notificationType === 'abandoned_cart_reminder' && 'Abandoned Cart'}
                                        </td>
                                        <td className="p-3 font-mono text-[11px] text-gray-600">
                                            {log.recipientPhoneMasked || log.recipientEmailMasked || 'N/A'}
                                        </td>
                                        <td className="p-3">{getStatusBadge(log.status)}</td>
                                        <td className="p-3 text-gray-500 max-w-[200px] truncate" title={log.triggerReason}>
                                            {log.triggerReason || 'Standard dispatch'}
                                        </td>
                                        <td className="p-3 text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NotificationAuditModal;
