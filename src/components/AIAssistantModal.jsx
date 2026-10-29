import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, X, Send, MessageCircle, HelpCircle, 
    Package, RotateCcw, Truck, Briefcase, AlertTriangle, 
    CheckCircle2, ArrowRight, User, ShieldCheck, PhoneCall, RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import { 
    TRIAGE_CATEGORIES, 
    getGroundedAnswer, 
    SUPPORT_PHONE, 
    SUPPORT_EMAIL 
} from '../data/groundedFaqKnowledge';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const AIAssistantModal = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'assistant',
            text: 'Namaste! I am your Hridved Herbal Guide. How may I support your wellness journey or answer your order questions today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'grounded'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    
    // In-chat ticket form state
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactOrder, setContactOrder] = useState('');
    const [contactMsg, setContactMsg] = useState('');
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const [ticketSubmitted, setTicketSubmitted] = useState(false);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            trackWebsiteEvent('assistant_open');
        }
    }, [isOpen, messages, isTyping, showContactForm]);

    const handleSendMessage = (textToSend) => {
        const query = (textToSend || inputText).trim();
        if (!query) return;

        const userMsg = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: query,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Track query event (without sensitive health details)
        trackWebsiteEvent('assistant_query', { queryLength: query.length });

        // Simulate thoughtful Ayurvedic knowledge retrieval
        setTimeout(() => {
            const result = getGroundedAnswer(query);

            const assistantMsg = {
                id: `assistant_${Date.now()}`,
                sender: 'assistant',
                text: result.message,
                status: result.status,
                isMedicalDisclaimer: result.isMedicalDisclaimer,
                canEscalate: result.canEscalate,
                category: result.category,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, assistantMsg]);
            setIsTyping(false);
        }, 600);
    };

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat.id);
        const catInfoMsg = {
            id: `cat_select_${Date.now()}`,
            sender: 'assistant',
            text: `Selected topic: **${cat.title}**. ${cat.description} Select a frequent question below or type your inquiry.`,
            status: 'grounded',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: cat.id,
            quickQuestions: cat.quickQuestions
        };
        setMessages(prev => [...prev, catInfoMsg]);
    };

    const handleWhatsAppEscalate = (contextMsg = '') => {
        trackWebsiteEvent('assistant_escalate', { channel: 'whatsapp' });
        const text = `Namaste Hridved, I am inquiring via the Herbal Assistant.${contextMsg ? ` Context: ${contextMsg}` : ''}`;
        window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setSubmittingTicket(true);
        try {
            await api.post('/contact', {
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                category: selectedCategory || 'General',
                orderNumber: contactOrder,
                source: 'assistant_triage',
                message: contactMsg || `Support triage logged from Assistant.`
            });

            setTicketSubmitted(true);
            setMessages(prev => [
                ...prev,
                {
                    id: `ticket_${Date.now()}`,
                    sender: 'assistant',
                    text: `✅ Thank you, ${contactName}! Your support ticket has been registered in our system. Our patient care team will contact you within 24 hours at ${contactEmail}.`,
                    status: 'grounded',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
            setShowContactForm(false);
        } catch (error) {
            console.error('Failed to submit ticket:', error);
            alert('Failed to register ticket. You can reach us directly on WhatsApp.');
        } finally {
            setSubmittingTicket(false);
        }
    };

    const resetChat = () => {
        setMessages([
            {
                id: 'welcome',
                sender: 'assistant',
                text: 'Namaste! I am your Hridved Herbal Guide. How may I support your wellness journey or answer your order questions today?',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'grounded'
            }
        ]);
        setSelectedCategory(null);
        setShowContactForm(false);
        setTicketSubmitted(false);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-6 z-40">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            aria-label="Open Hridved Ayurvedic Assistant"
                            className="group flex items-center gap-2.5 bg-primary text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border-2 border-secondary/40 hover:border-secondary transition-all cursor-pointer backdrop-blur-md"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                            </span>
                            <Sparkles size={17} className="text-secondary animate-pulse" />
                            <div className="text-left font-body">
                                <span className="block text-[11px] font-bold text-white tracking-wide">Ask Vaidya Guide</span>
                                <span className="block text-[9px] text-accent tracking-wider uppercase font-semibold">Grounded FAQ & Triage</span>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Modal / Flyout */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-secondary/30 flex flex-col overflow-hidden font-body"
                    >
                        {/* Header */}
                        <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-secondary/30 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-bold tracking-wide text-white">Hridved Herbal Guide</h3>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    </div>
                                    <p className="text-[10px] text-accent flex items-center gap-1 font-medium">
                                        <ShieldCheck size={11} className="text-secondary" /> Grounded in Ayush Standards
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={resetChat}
                                    title="Restart Conversation"
                                    className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                                >
                                    <RefreshCw size={15} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Close Assistant"
                                    className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Triage Quick Selector Bar */}
                        <div className="bg-[#FDFBF7] px-3 py-2 border-b border-accent/40 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
                            {TRIAGE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleSelectCategory(cat)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer border ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-secondary hover:text-primary'
                                    }`}
                                >
                                    {cat.id === 'product' && <HelpCircle size={11} className="text-secondary" />}
                                    {cat.id === 'order_tracking' && <Package size={11} className="text-secondary" />}
                                    {cat.id === 'delivery' && <Truck size={11} className="text-secondary" />}
                                    {cat.id === 'returns' && <RotateCcw size={11} className="text-secondary" />}
                                    {cat.id === 'wholesale' && <Briefcase size={11} className="text-secondary" />}
                                    <span>{cat.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* Chat Messages Stream */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FDFBF7]/50 text-xs">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                                            m.sender === 'user'
                                                ? 'bg-primary text-white rounded-br-xs'
                                                : m.status === 'emergency'
                                                ? 'bg-red-50 text-red-950 border border-red-200 rounded-bl-xs'
                                                : m.isMedicalDisclaimer
                                                ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-bl-xs'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                                        }`}
                                    >
                                        {m.status === 'emergency' && (
                                            <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1">
                                                <AlertTriangle size={14} /> Medical Emergency Safeguard
                                            </div>
                                        )}

                                        {m.isMedicalDisclaimer && m.status !== 'emergency' && (
                                            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                                                <AlertTriangle size={14} /> Ayush Cautionary Note
                                            </div>
                                        )}

                                        <p className="whitespace-pre-line">{m.text}</p>

                                        {/* Quick Questions Attached to message */}
                                        {m.quickQuestions && (
                                            <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Questions:</span>
                                                {m.quickQuestions.map((q, qIdx) => (
                                                    <button
                                                        key={qIdx}
                                                        onClick={() => handleSendMessage(q)}
                                                        className="w-full text-left text-[11px] p-1.5 rounded-lg bg-[#FDFBF7] text-primary hover:bg-secondary/15 transition border border-accent/40 font-medium cursor-pointer block"
                                                    >
                                                        • {q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions for Grounded / Escalation Answers */}
                                        {m.canEscalate && (
                                            <div className="mt-3 pt-2.5 border-t border-gray-100/60 flex flex-wrap gap-1.5">
                                                {m.category === 'order_tracking' && (
                                                    <button
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            navigate('/track-order');
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold hover:bg-primary/90 transition cursor-pointer"
                                                    >
                                                        <Package size={11} /> Open Order Tracker
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleWhatsAppEscalate(m.text.slice(0, 100))}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition cursor-pointer"
                                                >
                                                    <MessageCircle size={11} /> WhatsApp Vaidya
                                                </button>

                                                <button
                                                    onClick={() => setShowContactForm(true)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold hover:bg-gray-200 transition cursor-pointer"
                                                >
                                                    <PhoneCall size={11} /> Submit Ticket
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-1 px-1">{m.time}</span>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs px-2 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                                    <span className="text-[10px] italic ml-1">Consulting Ayurvedic texts...</span>
                                </div>
                            )}

                            {/* In-Chat Support Ticket Form */}
                            {showContactForm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-4 border border-secondary/40 shadow-sm space-y-2.5"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-primary text-xs flex items-center gap-1.5">
                                            <PhoneCall size={13} className="text-secondary" /> Submit Human Care Ticket
                                        </h4>
                                        <button
                                            onClick={() => setShowContactForm(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmitTicket} className="space-y-2 text-xs">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Full Name *"
                                            value={contactName}
                                            onChange={e => setContactName(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="email"
                                                required
                                                placeholder="Email Address *"
                                                value={contactEmail}
                                                onChange={e => setContactEmail(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone (Optional)"
                                                value={contactPhone}
                                                onChange={e => setContactPhone(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Order ID / Waybill (If Applicable)"
                                            value={contactOrder}
                                            onChange={e => setContactOrder(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                        />
                                        <textarea
                                            rows={2}
                                            required
                                            placeholder="Describe your inquiry or requirement *"
                                            value={contactMsg}
                                            onChange={e => setContactMsg(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingTicket}
                                            className="w-full py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
                                        >
                                            {submittingTicket ? 'Submitting...' : 'Register Support Ticket'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box Footer */}
                        <div className="p-3 bg-white border-t border-accent/40 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask about ingredients, dosage, shipping..."
                                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-[#FDFBF7] text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
                                    title="Send Message"
                                >
                                    <Send size={15} />
                                </button>
                            </form>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-2">
                                <span>Certified Vaidya Triage</span>
                                <button 
                                    onClick={() => handleWhatsAppEscalate()} 
                                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <MessageCircle size={10} /> +91 92654 01508
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantModal;
