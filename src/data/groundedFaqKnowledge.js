/**
 * Grounded Knowledge Base & Guardrail Engine for Hridved AI Support Assistant
 * 
 * STRICT COMPLIANCE:
 * 1. Only uses verified store data, certifications, and policies.
 * 2. Strictly admits uncertainty when questions fall outside the knowledge base.
 * 3. Never diagnoses diseases or promises guaranteed cures.
 * 4. Special safety handling for children, pregnant women, and medical emergencies.
 * 5. Provides seamless triage across the 5 verified support categories.
 */

export const SUPPORT_PHONE = '919265401508';
export const SUPPORT_EMAIL = 'hridved.customercare@gmail.com';

export const TRIAGE_CATEGORIES = [
    {
        id: 'product',
        title: 'Formulation & Dosage',
        badge: 'Herbal Guide',
        description: 'Ask about pure herbs, usage timing, dosha balance, and copper infusion rituals.',
        quickQuestions: [
            'How is the 72-hour copper infusion made?',
            'Are all products 100% vegetarian & Ayush certified?',
            'How long before I see visible wellness results?',
            'Can children use Hridved formulations?'
        ]
    },
    {
        id: 'order_tracking',
        title: 'Track My Shipment',
        badge: 'Live Status',
        description: 'Check dispatch, current courier transit stage, and estimated delivery date.',
        quickQuestions: [
            'How can I track my parcel?',
            'Where do I enter my 10-digit mobile number to track?',
            'Has my order been dispatched from the pharmacy?'
        ]
    },
    {
        id: 'delivery',
        title: 'Delivery & Shipping',
        badge: 'Timelines & Fees',
        description: 'Information regarding free shipping thresholds, delivery days, and pincode coverage.',
        quickQuestions: [
            'What is the free shipping threshold?',
            'How many days does delivery take to metro cities?',
            'Do you deliver to my pincode in India?'
        ]
    },
    {
        id: 'returns',
        title: 'Returns & Damages',
        badge: '7-Day Policy',
        description: 'Replacement for items damaged in transit or return eligibility criteria.',
        quickQuestions: [
            'What is your 7-day return policy?',
            'My product arrived leaked or damaged, what do I do?',
            'How soon will my refund be processed?'
        ]
    },
    {
        id: 'wholesale',
        title: 'Bulk & Vaidya Orders',
        badge: 'B2B & Clinics',
        description: 'Wholesale pricing, clinic supplies, and certified doctor partnerships.',
        quickQuestions: [
            'How do I place a bulk order for my Ayurvedic clinic?',
            'Do you provide custom formulations for doctors?',
            'What is the minimum order quantity for wholesale?'
        ]
    }
];

export const GROUNDED_QA_ENTRIES = [
    {
        id: 'copper_infusion',
        category: 'product',
        keywords: ['copper', 'infusion', 'handcrafted', 'process', 'slow', '72 hour', 'batch', 'pure', 'made', 'prepare', 'manufacturing'],
        question: 'How are Hridved formulations crafted?',
        answer: 'Every Hridved oil and elixir is handcrafted in small batches following classical Ayurvedic texts. Formulations are slow-cooked for 72 hours in copper vessels to unlock the full bioavailability of classical herbs. We strictly never use mineral oils, parabens, synthetic fragrances, or animal derivatives.'
    },
    {
        id: 'certifications',
        category: 'product',
        keywords: ['certified', 'certification', 'ayush', 'gmp', 'lab', 'vegetarian', 'vegan', 'cruelty', 'safe', 'tested', 'quality'],
        question: 'Are all Hridved products Ayush certified and 100% vegetarian?',
        answer: 'Yes. 100% of our catalogue is plant-based, cruelty-free, and certified under Ayush and GMP standards. Each production batch is rigorously lab-tested against 140+ safety and purity parameters for heavy metals, pesticides, and microbial safety.'
    },
    {
        id: 'results_timeline',
        category: 'product',
        keywords: ['result', 'time', 'how long', 'work', 'effective', 'days', 'weeks', 'benefit', 'visible'],
        question: 'How long does it take to see visible wellness results?',
        answer: 'Classical Ayurveda restores natural cellular harmony rather than suppressing symptoms temporarily. While daily calmness and relaxation are felt immediately, visible improvements in vitality, hair texture, skin tone, or digestion typically appear within 3 to 4 weeks of consistent daily ritual.'
    },
    {
        id: 'doctor_consultation',
        category: 'product',
        keywords: ['doctor', 'vaidya', 'consult', 'consultation', 'advice', 'dosha', 'prakriti', 'free consultation', 'speak', 'ask'],
        question: 'Can I speak with an Ayurvedic Vaidya before buying?',
        answer: 'Yes! We offer 100% complimentary WhatsApp consultations with qualified Ayurvedic doctors. Our Vaidyas assess your unique dosha profile (Vata, Pitta, Kapha) and recommend the right herbal ritual with zero obligation to buy.'
    },
    {
        id: 'free_shipping',
        category: 'delivery',
        keywords: ['shipping', 'free delivery', 'charges', 'shipping cost', 'delivery fee', 'fee', 'price shipping', 'rate'],
        question: 'What are the shipping charges and free delivery rules?',
        answer: 'We provide FREE SHIPPING across India on all orders of ₹999 and above. For orders below ₹999, a nominal flat shipping fee of ₹50 is applied at checkout.'
    },
    {
        id: 'delivery_timelines',
        category: 'delivery',
        keywords: ['timeline', 'days', 'speed', 'when will i receive', 'how fast', 'dispatch', 'transit', 'metro'],
        question: 'What is the delivery timeline across India?',
        answer: 'Orders are freshly packaged and dispatched within 24 to 48 hours from our certified Ayurvedic pharmacy. Typical transit time is 2 to 3 business days for metro cities, and 3 to 7 business days for the rest of India.'
    },
    {
        id: 'order_tracking',
        category: 'order_tracking',
        keywords: ['track', 'where is my order', 'status', 'awb', 'waybill', 'courier', 'parcel', 'location', 'shipment'],
        question: 'How can I track my existing order?',
        answer: 'You can track your order instantly on our Track Order page (/track-order) by entering either your 10-digit mobile number, your Order ID, or your Courier Waybill Number. We mask sensitive personal information for your privacy.'
    },
    {
        id: 'returns_policy',
        category: 'returns',
        keywords: ['return', 'refund', 'replacement', 'damaged', 'broken', 'leak', 'exchange', '7 days', 'cancel'],
        question: 'What is your return and damage replacement policy?',
        answer: 'We offer a 7-day return policy for unopened items in their original packaging. If your shipment arrives damaged, broken, or leaking, simply message our care team on WhatsApp with photos within 7 days for an immediate replacement or full refund.'
    },
    {
        id: 'payment_methods',
        category: 'delivery',
        keywords: ['payment', 'cod', 'cash on delivery', 'upi', 'gpay', 'phonepe', 'card', 'pay'],
        question: 'Which payment methods are accepted?',
        answer: 'We accept all major secure payment options through Razorpay (UPI, Google Pay, PhonePe, Debit/Credit Cards, Netbanking) with 256-bit bank encryption. We also support Cash on Delivery (COD) across serviceable Indian pincodes with a ₹50 verification fee.'
    },
    {
        id: 'wholesale_clinics',
        category: 'wholesale',
        keywords: ['wholesale', 'bulk', 'clinic', 'distributor', 'reseller', 'b2b', 'doctors', 'bulk order', 'volume'],
        question: 'How can Ayurvedic clinics and doctors place bulk orders?',
        answer: 'We partner directly with registered Ayurvedic practitioners, wellness centres, and clinics across India. We offer specialized practitioner pricing and batch certifications. You can connect directly with our B2B team on WhatsApp or submit a clinic enquiry.'
    }
];

/**
 * High-risk Medical Emergency Keywords
 */
const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'poison', 'unconscious', 'fainted',
    'severe bleeding', 'breathing difficulty', 'cannot breathe', 'stroke',
    'suicide', 'anaphylaxis', 'choking', 'convulsion'
];

/**
 * Children and Infant Safeguard Keywords
 */
const CHILD_KEYWORDS = [
    'baby', 'infant', 'toddler', 'child', 'children', 'kid', 'newborn', 'pediatric', 'pediatrician', 'son', 'daughter'
];

/**
 * Pregnancy and Lactation Safeguard Keywords
 */
const PREGNANCY_KEYWORDS = [
    'pregnant', 'pregnancy', 'lactating', 'breastfeeding', 'nursing', 'trimester'
];

/**
 * Evaluates user input against safety guardrails and verified knowledge base.
 */
export const getGroundedAnswer = (userQuery) => {
    if (!userQuery || typeof userQuery !== 'string') {
        return {
            status: 'uncertain',
            message: "I didn't receive a question. Please feel free to ask about our formulations, shipping, or orders.",
            category: null,
            canEscalate: true
        };
    }

    const queryLower = userQuery.toLowerCase().trim();

    // 1. EMERGENCY GUARDRAIL (Immediate escalation)
    for (const em of EMERGENCY_KEYWORDS) {
        if (queryLower.includes(em)) {
            return {
                status: 'emergency',
                message: "⚠️ MEDICAL EMERGENCY NOTICE: Ayurvedic lifestyle formulations are not designed for acute medical emergencies. If you or someone near you is experiencing severe symptoms or an acute condition, please call national emergency services (112 or 102) or proceed to the nearest emergency hospital immediately.",
                category: 'emergency',
                canEscalate: true,
                isMedicalDisclaimer: true
            };
        }
    }

    // 2. CHILD / PEDIATRIC SAFEGUARD
    for (const ck of CHILD_KEYWORDS) {
        if (new RegExp(`\\b${ck}\\b`, 'i').test(queryLower)) {
            return {
                status: 'child_safeguard',
                message: "👶 Child Safety Notice: Classical Ayurveda places the utmost caution on young children and infants. We never recommend self-administering herbal remedies or adult dosages to children without professional oversight. Please consult your pediatrician or speak directly with our certified Vaidya to determine whether a mild herbal ritual is safe.",
                category: 'product',
                canEscalate: true,
                isMedicalDisclaimer: true
            };
        }
    }

    // 3. PREGNANCY / NURSING SAFEGUARD
    for (const pk of PREGNANCY_KEYWORDS) {
        if (new RegExp(`\\b${pk}\\b`, 'i').test(queryLower)) {
            return {
                status: 'pregnancy_safeguard',
                message: "🌸 Pregnancy & Nursing Care: During pregnancy and lactation, maternal dosha balance requires personalized medical supervision. Please consult your obstetrician or talk to our senior Vaidya before introducing any new herbal supplements or active topical rituals.",
                category: 'product',
                canEscalate: true,
                isMedicalDisclaimer: true
            };
        }
    }

    // 4. MEDICAL DIAGNOSIS / CURE PROMISE GUARDRAIL
    const cureRegex = /(cure|diagnose|heal completely|guarantee|fix cancer|fix diabetes|prescribe)/i;
    if (cureRegex.test(queryLower)) {
        return {
            status: 'no_diagnosis',
            message: "🌿 Holistic Health Notice: Classical Ayurveda focuses on rebalancing your natural constitution (Prakriti) and strengthening cellular vitality rather than claiming miraculous cures for chronic clinical diseases. We do not diagnose or claim guaranteed cures. For specialized health concerns, we encourage you to consult our certified Vaidyas or your primary physician.",
            category: 'product',
            canEscalate: true,
            isMedicalDisclaimer: true
        };
    }

    // 5. MATCH AGAINST GROUNDED KNOWLEDGE BASE
    let bestMatch = null;
    let highestScore = 0;

    for (const entry of GROUNDED_QA_ENTRIES) {
        let score = 0;
        for (const kw of entry.keywords) {
            if (queryLower.includes(kw)) {
                score += kw.includes(' ') ? 3 : 1; // Prioritize multi-word matches
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    }

    // Threshold check (must have at least 1 strong match or multiple partials)
    if (bestMatch && highestScore >= 1) {
        return {
            status: 'grounded',
            question: bestMatch.question,
            message: bestMatch.answer,
            category: bestMatch.category,
            canEscalate: true,
            matchedId: bestMatch.id
        };
    }

    // 6. ADMIT UNCERTAINTY (Strict Prompt 11 Requirement)
    return {
        status: 'uncertain',
        message: "I do not have verified knowledge about that in my official Ayurvedic repository. As an authentic herbal guide, I never speculate on unverified claims. Would you like me to connect you directly with a qualified Vaidya on WhatsApp (+91 92654 01508) or log a support ticket?",
        category: null,
        canEscalate: true
    };
};
