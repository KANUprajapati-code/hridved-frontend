import { useState, useEffect } from 'react';
import {
    Users,
    MessageCircle,
    ShoppingCart,
    TrendingUp,
    PhoneCall,
    Search,
    Filter,
    Download,
    ExternalLink,
    Clock,
    Tag,
    Edit3,
    Trash2,
    CheckCircle,
    AlertCircle,
    Copy,
    Check,
    Send,
    Plus,
    X,
    FileSpreadsheet,
    Sparkles,
    Bell,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationAuditModal from '../../components/NotificationAuditModal';

const AudienceMarketingPage = () => {
    const { addToast } = useToast() || {};

    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        whatsappClicks: 0,
        whatsappOrders: 0,
        cartAbandoned: 0,
        converted: 0,
        newLeads: 0,
        conversionRate: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [selectedAction, setSelectedAction] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modals
    const [activeFollowUpModal, setActiveFollowUpModal] = useState(null); // lead object
    const [activeNotesModal, setActiveNotesModal] = useState(null); // lead object
    const [newNoteText, setNewNoteText] = useState('');
    const [copiedPhone, setCopiedPhone] = useState(null);
    const [showNotificationAuditModal, setShowNotificationAuditModal] = useState(false);

    // Custom follow-up message template
    const [selectedTemplate, setSelectedTemplate] = useState('discount');
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        fetchLeads();
    }, [page, selectedAction, selectedStatus]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
            };
            if (search) params.search = search;
            if (selectedAction !== 'all') params.actionType = selectedAction;
            if (selectedStatus !== 'all') params.status = selectedStatus;

            const { data } = await api.get('/leads/admin', { params });
            setLeads(data.leads || []);
            setStats(data.stats || {});
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalCount(data.pagination?.totalLeads || 0);
        } catch (error) {
            console.error('Failed to load audience leads:', error);
            if (addToast) addToast('Failed to load audience leads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLeads();
    };

    // Update Follow-up Status
    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const { data } = await api.put(`/leads/admin/${leadId}`, {
                followUpStatus: newStatus,
            });
            setLeads((prev) =>
                prev.map((item) => (item._id === leadId ? { ...item, followUpStatus: newStatus, lastContactedAt: new Date() } : item))
            );
            if (addToast) addToast(`Status updated to ${newStatus}`, 'success');
        } catch (error) {
            if (addToast) addToast('Failed to update status', 'error');
        }
    };

    // Add Note to Lead
    const handleAddNote = async () => {
        if (!newNoteText.trim() || !activeNotesModal) return;
        try {
            const { data } = await api.put(`/leads/admin/${activeNotesModal._id}`, {
                note: newNoteText.trim(),
            });
            setLeads((prev) =>
                prev.map((item) => (item._id === activeNotesModal._id ? data : item))
            );
            setActiveNotesModal(data);
            setNewNoteText('');
            if (addToast) addToast('Follow-up note added', 'success');
        } catch (error) {
            if (addToast) addToast('Failed to save note', 'error');
        }
    };

    // Delete Lead
    const handleDeleteLead = async (leadId) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        try {
            await api.delete(`/leads/admin/${leadId}`);
            setLeads((prev) => prev.filter((item) => item._id !== leadId));
            if (addToast) addToast('Lead deleted', 'success');
        } catch (error) {
            if (addToast) addToast('Failed to delete lead', 'error');
        }
    };

    // Copy Phone Number
    const handleCopyPhone = (phone) => {
        navigator.clipboard.writeText(phone);
        setCopiedPhone(phone);
        setTimeout(() => setCopiedPhone(null), 2000);
        if (addToast) addToast('Phone number copied!', 'info');
    };

    // Export CSV
    const handleExportCSV = () => {
        const token = localStorage.getItem('jwtToken');
        const exportUrl = `${api.defaults.baseURL || '/api'}/leads/admin/export?actionType=${selectedAction}&status=${selectedStatus}&token=${token}`;
        window.open(exportUrl, '_blank');
    };

    // Prepare WhatsApp Message
    const openWhatsAppFollowUp = (lead) => {
        setActiveFollowUpModal(lead);
        const name = lead.customerName || 'Customer';
        const productName = lead.product?.name || (lead.cartItems?.length ? `${lead.cartItems.length} products in cart` : 'our products');

        let defaultMsg = '';
        if (lead.actionType === 'whatsapp_click') {
            defaultMsg = `Namaste ${name} ji! 🙏 We noticed you were looking at *${productName}* on Hridved.\n\nWe have a special 10% discount for you today! Would you like help completing your order?`;
        } else if (lead.actionType === 'add_to_cart') {
            defaultMsg = `Namaste ${name} ji! 🙏 You left *${productName}* in your cart on Hridved.\n\nCan we help you complete this order with free fast shipping?`;
        } else {
            defaultMsg = `Namaste ${name} ji! 🙏 Thank you for visiting Hridved. Do you have any questions regarding *${productName}*? We are happy to help!`;
        }
        setCustomMessage(defaultMsg);
    };

    const handleSendWhatsApp = () => {
        if (!activeFollowUpModal || !activeFollowUpModal.phone) return;
        const cleanPhone = activeFollowUpModal.phone.replace(/\D/g, '').slice(-10);
        const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
        window.open(url, '_blank');

        // Automatically mark as Contacted
        handleStatusChange(activeFollowUpModal._id, 'Contacted');
        setActiveFollowUpModal(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-widest mb-1">
                        <Sparkles size={16} /> Audience Intelligence & Growth
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-black text-primary">
                        Follow-up & Audience Marketing
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        Track customers who clicked WhatsApp or added items to cart. Follow up instantly & export for Meta/Google Ads.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setShowNotificationAuditModal(true)}
                        className="bg-white border border-secondary/60 text-primary px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-secondary/10 shadow-xs transition-all cursor-pointer"
                    >
                        <Bell size={16} className="text-secondary" />
                        <span>Notification & Cart Audit</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="bg-primary text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-opacity-90 shadow-sm transition-all cursor-pointer"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Export CSV (Meta / Google Ads)</span>
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Leads</span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total || 0}</div>
                    <span className="text-[10px] text-gray-400 mt-1">Tracked potential customers</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Clicks</span>
                        <div className="w-8 h-8 rounded-full bg-green-50 text-[#25D366] flex items-center justify-center">
                            <MessageCircle size={16} />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-[#25D366]">{stats.whatsappClicks || 0}</div>
                    <span className="text-[10px] text-gray-400 mt-1">High purchase intent clicks</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Cart Drop-offs</span>
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                            <ShoppingCart size={16} />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.cartAbandoned || 0}</div>
                    <span className="text-[10px] text-gray-400 mt-1">Added to cart but didn't finish</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Converted Sales</span>
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-purple-700">{stats.converted || 0}</div>
                    <span className="text-[10px] text-gray-400 mt-1">Successfully closed deals</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.conversionRate || 0}%</div>
                    <span className="text-[10px] text-gray-400 mt-1">Lead to customer conversion</span>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                {/* Action Type Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'All Leads', icon: Users },
                        { id: 'whatsapp_click', label: 'WhatsApp Clicks', icon: MessageCircle },
                        { id: 'add_to_cart', label: 'Cart Drop-offs', icon: ShoppingCart },
                        { id: 'whatsapp_order', label: 'WhatsApp Orders', icon: CheckCircle },
                        { id: 'otp_lead', label: 'OTP Signups', icon: Tag },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = selectedAction === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setSelectedAction(tab.id); setPage(1); }}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                                    isSelected
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search & Status Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
                        <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Customer Name, Mobile (+91), or Product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-xl"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:border-primary"
                        >
                            <option value="all">All Follow-up Status</option>
                            <option value="New">Status: New</option>
                            <option value="Contacted">Status: Contacted</option>
                            <option value="Interested">Status: Interested</option>
                            <option value="Converted">Status: Converted</option>
                            <option value="Not Interested">Status: Not Interested</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                <th className="p-4 pl-6">Customer / Mobile</th>
                                <th className="p-4">Trigger / Intent</th>
                                <th className="p-4">Interested Product</th>
                                <th className="p-4">Value</th>
                                <th className="p-4">Follow-up Status</th>
                                <th className="p-4">Captured Time</th>
                                <th className="p-4 pr-6 text-right">Quick Follow-up</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-400">
                                        Loading audience leads...
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-400">
                                        No customer leads captured yet.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => {
                                    const actionBadge = {
                                        whatsapp_click: { label: 'WhatsApp Click', bg: 'bg-green-100 text-[#1da851] border-green-200' },
                                        whatsapp_order: { label: 'WhatsApp Order', bg: 'bg-purple-100 text-purple-700 border-purple-200' },
                                        add_to_cart: { label: 'Cart Drop-off', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
                                        otp_lead: { label: 'OTP Signup', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
                                    }[lead.actionType] || { label: lead.actionType, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                                    const isPhoneCopied = copiedPhone === lead.phone;

                                    return (
                                        <tr key={lead._id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Customer */}
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-gray-900">{lead.customerName || 'Guest User'}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <a
                                                        href={`tel:+91${lead.phone}`}
                                                        className="text-xs font-mono font-bold text-primary hover:underline"
                                                    >
                                                        +91 {lead.phone}
                                                    </a>
                                                    <button
                                                        onClick={() => handleCopyPhone(lead.phone)}
                                                        className="text-gray-400 hover:text-gray-600 p-0.5"
                                                        title="Copy Phone"
                                                    >
                                                        {isPhoneCopied ? (
                                                            <Check size={12} className="text-green-600" />
                                                        ) : (
                                                            <Copy size={12} />
                                                        )}
                                                    </button>
                                                </div>
                                                {lead.email && !lead.email.includes('@hridved.in') && (
                                                    <span className="text-[11px] text-gray-400 block">{lead.email}</span>
                                                )}
                                            </td>

                                            {/* Trigger */}
                                            <td className="p-4">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${actionBadge.bg}`}
                                                >
                                                    {actionBadge.label}
                                                </span>
                                            </td>

                                            {/* Product / Cart */}
                                            <td className="p-4">
                                                {lead.product?.name ? (
                                                    <div className="flex items-center gap-2.5">
                                                        {lead.product.image && (
                                                            <img
                                                                src={lead.product.image}
                                                                alt={lead.product.name}
                                                                className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-100"
                                                            />
                                                        )}
                                                        <div className="max-w-[180px]">
                                                            <span className="font-bold text-xs text-gray-800 line-clamp-1">
                                                                {lead.product.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                ₹{lead.product.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : lead.cartItems?.length > 0 ? (
                                                    <span className="text-xs text-gray-700 font-medium">
                                                        {lead.cartItems.length} items in cart
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Website Lead</span>
                                                )}
                                            </td>

                                            {/* Value */}
                                            <td className="p-4 font-black text-gray-900 text-xs">
                                                ₹{lead.cartTotal || lead.product?.price || 0}
                                            </td>

                                            {/* Follow-up Status */}
                                            <td className="p-4">
                                                <select
                                                    value={lead.followUpStatus || 'New'}
                                                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none transition-all ${
                                                        lead.followUpStatus === 'Converted'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : lead.followUpStatus === 'Contacted'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : lead.followUpStatus === 'Interested'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : lead.followUpStatus === 'Not Interested'
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    <option value="New">🟡 New</option>
                                                    <option value="Contacted">🔵 Contacted</option>
                                                    <option value="Interested">🟢 Interested</option>
                                                    <option value="Converted">🟣 Converted</option>
                                                    <option value="Not Interested">🔴 Lost</option>
                                                </select>
                                            </td>

                                            {/* Captured Time */}
                                            <td className="p-4 text-xs text-gray-500">
                                                <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-gray-400">
                                                    {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* WhatsApp Follow-up */}
                                                    <button
                                                        onClick={() => openWhatsAppFollowUp(lead)}
                                                        className="bg-[#25D366] hover:bg-[#1da851] text-white p-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                                                        title="Send WhatsApp Follow-up Message"
                                                    >
                                                        <MessageCircle size={14} />
                                                        <span className="hidden sm:inline">WhatsApp</span>
                                                    </button>

                                                    {/* Call */}
                                                    <a
                                                        href={`tel:+91${lead.phone}`}
                                                        className="bg-primary/10 hover:bg-primary hover:text-white text-primary p-2 rounded-xl transition-all"
                                                        title="Call Lead"
                                                    >
                                                        <PhoneCall size={14} />
                                                    </a>

                                                    {/* Notes */}
                                                    <button
                                                        onClick={() => setActiveNotesModal(lead)}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-xl transition-all"
                                                        title="Follow-up Notes"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteLead(lead._id)}
                                                        className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-xl transition-all"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
                        <span>
                            Showing {leads.length} of {totalCount} leads
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1.5 bg-primary text-white rounded-lg">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Follow-up Modal */}
            <AnimatePresence>
                {activeFollowUpModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setActiveFollowUpModal(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-gray-100"
                        >
                            <div className="bg-[#25D366] text-white p-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={22} />
                                    <div>
                                        <h3 className="font-bold text-base leading-tight">WhatsApp Direct Follow-up</h3>
                                        <p className="text-white/80 text-xs">To: {activeFollowUpModal.customerName} (+91 {activeFollowUpModal.phone})</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveFollowUpModal(null)}
                                    className="p-1 text-white/80 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Choose Marketing Template
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTemplate('discount');
                                                setCustomMessage(`Namaste ${activeFollowUpModal.customerName || 'Customer'} ji! 🙏 We noticed you were interested in *${activeFollowUpModal.product?.name || 'our products'}* on Hridved.\n\nUse code *SPECIAL10* to get 10% instant discount + Free Delivery today!\n\nCan I assist you in placing this order?`);
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                                selectedTemplate === 'discount'
                                                    ? 'border-[#25D366] bg-green-50 text-[#1da851]'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            🏷️ 10% Discount
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTemplate('cart');
                                                setCustomMessage(`Namaste ${activeFollowUpModal.customerName || 'Customer'} ji! 🙏 You left items in your cart on Hridved.\n\nWould you like us to confirm and dispatch your order today?`);
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                                selectedTemplate === 'cart'
                                                    ? 'border-[#25D366] bg-green-50 text-[#1da851]'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            🛒 Cart Recovery
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTemplate('help');
                                                setCustomMessage(`Namaste ${activeFollowUpModal.customerName || 'Customer'} ji! 🙏 Do you have any queries about *${activeFollowUpModal.product?.name || 'our Ayurvedic formulations'}*? Our Ayurvedic doctor is available for free consultation.`);
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                                selectedTemplate === 'help'
                                                    ? 'border-[#25D366] bg-green-50 text-[#1da851]'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            🩺 Free Consultation
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Personalize WhatsApp Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:border-[#25D366] font-sans"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveFollowUpModal(null)}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendWhatsApp}
                                        className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Send size={14} />
                                        <span>Open in WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes & History Modal */}
            <AnimatePresence>
                {activeNotesModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setActiveNotesModal(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-gray-100"
                        >
                            <div className="bg-primary text-white p-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base leading-tight">Follow-up Notes & Activity</h3>
                                    <p className="text-white/80 text-xs">Lead: {activeNotesModal.customerName} ({activeNotesModal.phone})</p>
                                </div>
                                <button
                                    onClick={() => setActiveNotesModal(null)}
                                    className="p-1 text-white/80 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                {/* Notes list */}
                                <div className="space-y-2.5">
                                    {activeNotesModal.notes && activeNotesModal.notes.length > 0 ? (
                                        activeNotesModal.notes.map((note, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                                                <div className="text-gray-800">{note.text}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center justify-between">
                                                    <span>By {note.addedBy || 'Admin'}</span>
                                                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-4">No notes recorded yet</p>
                                    )}
                                </div>

                                {/* Add note input */}
                                <div className="pt-2 border-t border-gray-100">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Add Follow-up Entry
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g., Called customer, offered 10% coupon..."
                                            value={newNoteText}
                                            onChange={(e) => setNewNoteText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddNote}
                                            disabled={!newNoteText.trim()}
                                            className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification & Abandoned Cart Audit Modal */}
            <NotificationAuditModal
                isOpen={showNotificationAuditModal}
                onClose={() => setShowNotificationAuditModal(false)}
            />
        </div>
    );
};

export default AudienceMarketingPage;
