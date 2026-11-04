/**
 * Grounded Knowledge Base & Guardrail Engine for Hridved AI Vaidya Guide
 * Supports multi-lingual natural language (Hindi, Hinglish, English).
 */

export const SUPPORT_PHONE = '917990934095';
export const SECONDARY_SUPPORT_PHONE = '918980411390';
export const SUPPORT_EMAIL = 'hridved.customercare@gmail.com';

export const TRIAGE_CATEGORIES = [
    {
        id: 'product',
        title: 'Formulation & Dosage',
        badge: 'Herbal Guide',
        description: 'Ask about pure herbs, usage timing, Suvarnaprashan, Hair Oil, Kumkumadi, and A2 Ghee.',
        quickQuestions: [
            'Suvarnaprashan Drop kaise aur kab dena chahiye?',
            'Rosemary + Saffron Hair Oil ke kya labh hain?',
            'Kumkumadi Tailam lagane ka sahi tarika kya hai?',
            'Joint Pain Roll On oil kaisa asar karta hai?'
        ]
    },
    {
        id: 'offers',
        title: 'Diwali Offers & Coupons',
        badge: 'Festive Deals',
        description: 'Check active festive discount codes, coupon savings, and free gifts.',
        quickQuestions: [
            'Diwali offer me kitna discount mil raha hai?',
            'DIWALI25 coupon code kaise use karein?',
            'SHUBH100 coupon code ki eligibility kya hai?',
            'Free gift kitne ke order par milta hai?'
        ]
    },
    {
        id: 'order_tracking',
        title: 'Track My Shipment',
        badge: 'Live Status',
        description: 'Check dispatch, current courier transit stage, and estimated delivery date.',
        quickQuestions: [
            'Mera order kahan pahuncha kaise track karein?',
            'Where do I enter my 10-digit mobile number to track?',
            'Has my order been dispatched from the pharmacy?'
        ]
    },
    {
        id: 'delivery',
        title: 'Delivery & Shipping',
        badge: 'Timelines & Fees',
        description: 'Information regarding free shipping thresholds, delivery days, and COD.',
        quickQuestions: [
            'Free shipping kitne rupaye ke order par hai?',
            'Delivery me kitne din lagte hain?',
            'Kya Cash on Delivery (COD) available hai?'
        ]
    },
    {
        id: 'health',
        title: 'Ayurvedic Wellness & Doshas',
        badge: 'Vaidya Advice',
        description: 'Guidance for digestion, hair fall, glowing skin, joint health, and Tridosha balance.',
        quickQuestions: [
            'Pachan theek karne ke liye Ayurvedic upchar?',
            'Baal jhadna rokne ke gharelu nuskhe?',
            'Tridosha (Vata, Pitta, Kapha) kaise balance karein?',
            'A2 Bilona Cow Ghee ke kya fayde hain?'
        ]
    }
];

/**
 * High-risk Medical Emergency Keywords
 */
const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'poison', 'unconscious', 'fainted',
    'severe bleeding', 'breathing difficulty', 'cannot breathe', 'stroke',
    'suicide', 'anaphylaxis', 'convulsion'
];

/**
 * Evaluates user input against safety guardrails and verified knowledge base.
 */
export const getGroundedAnswer = (userQuery) => {
    if (!userQuery || typeof userQuery !== 'string') {
        return {
            status: 'grounded',
            message: "Namaste! 🙏 Main aapki kya sahayata kar sakta hoon? Aap mujhse Suvarnaprashan, Hair Oil, Ghee, offers ya delivery ke baare mein poochh sakte hain.",
            category: 'general',
            canEscalate: true
        };
    }

    const q = userQuery.toLowerCase().trim();

    // 1. EMERGENCY GUARDRAIL (Immediate escalation)
    for (const em of EMERGENCY_KEYWORDS) {
        if (q.includes(em)) {
            return {
                status: 'emergency',
                message: "⚠️ MEDICAL EMERGENCY NOTICE: Classical Ayurvedic lifestyle formulations are not designed for acute medical emergencies. If you or someone near you is experiencing severe symptoms or an acute condition, please call national emergency services (112 or 102) or proceed to the nearest emergency hospital immediately.",
                category: 'emergency',
                canEscalate: true,
                isMedicalDisclaimer: true
            };
        }
    }

    // 2. GREETINGS & WHO ARE YOU
    if (/^(hi|hello|namaste|namaskar|pranam|kem cho|ram ram|radhe radhe|good morning|good evening|hey)\b/i.test(q) ||
        /^(who are you|aap kaun ho|tum kaun ho|introduce|help|madad)\b/i.test(q)) {
        return {
            status: 'grounded',
            category: 'general',
            message: `🙏 **Namaste! Main Hridved ka AI Vaidya Guide hoon.**\n\nMain aapki authentic Ayurvedic swasthya yatra mein sahayata ke liye yahan hoon. Aap mujhse poochh sakte hain:\n• 🌿 **Formulations:** Suvarnaprashan, Kumkumadi Tailam, A2 Bilona Ghee, Hair Oil, Joint Roll On\n• 🧘‍♂️ **Ayurvedic Care:** Tridosha santulan, pachan, twacha aur baalon ki dekhbhal\n• 🪔 **Offers & Support:** Diwali discounts, Free shipping above ₹999, aur live order tracking!\n\nBataiye, aaj main aapki kya seva kar sakta hoon?`,
            canEscalate: true
        };
    }

    // 3. DIWALI OFFERS, DISCOUNTS & COUPONS
    if (/(offer|discount|coupon|code|promo|voucher|chhoot|bachat|diwali|shubh|sale|799|999)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'offers',
            message: `🪔 **Shubh Deepavali Ayurvedic Mahasale Offers:**\n\n1. **DIWALI25** — Sabhi Ayurvedic medicines aur oils par **FLAT 25% OFF**!\n2. **SHUBH100** — ₹999 se upar ke orders par **FLAT ₹100 Instant Discount**!\n3. 🎁 **Free Festive Gift:** ₹999 se upar ke har order par Surprise Ayurvedic Immunity Booster Gift bilkul FREE milta hai!\n4. 🚚 **Free Shipping:** ₹999+ ke sabhi orders par Free Express Delivery uplabdh hai.\n\nCheckout page par coupon code daalein aur instant bachat ka labh uthayein!`,
            canEscalate: true
        };
    }

    // 4. SUVARNAPRASHAN (DROPS & AVALEHA) - Kids Bal Rasayana
    if (/(suvarna|swarna|prashan|suvarnaprashan|swarnaprashan|drop|avaleha|avleh|gold bhasma|kashyapa|pushya|bache|bacho|children|kids|baby|toddler)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'product',
            message: `✨ **HRIDVED Suvarnaprashan (Classical Bal Sanskar):**\n\nMaharshi Kashyapa Samhita ke pramanik vidhan se taiyar yeh Rasayana 24K Certified Swarna Bhasma (Gold Ash), Medhya Brahmi, Shankhpushpi, Vacha, Desi Cow Ghee aur Raw Honey ka divya mishran hai.\n\n• **Umar (Age Group):** 0 se 16 saal ke bachhon ke liye 100% safe & certified hai.\n• **Mukhya Labh (Benefits):**\n  1. Bachhon ki Immunity badhata hai, bar-bar sardi, khasi aur bukhar se bachata hai.\n  2. Brain development, memory aur focus ko tez karta hai.\n  3. Sharirik vikas aur pachan kshamata ko pusht karta hai.\n• **Dosage (Sevan Vidhi):** Roz subah khali pet 1–2 boond direct ya chammach se dein. Pushya Nakshatra par yeh atyant kalyankari hota hai.\n• **Prices:**\n  - 15ML Liquid Drops: ₹949 (MRP ₹999)\n  - 30GM Pure Avaleha: ₹2800\n• 100% Ayush certified & GMP licensed.`,
            canEscalate: true
        };
    }

    // 5. ROSEMARY + SAFFRON HAIR OIL
    if (/(hair|baal|bal|jhadna|hair fall|dandruff|rosemary|scalp|regrowth|oil for hair|kesh)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'product',
            message: `🌿 **HRIDVED Rosemary + Saffron Premium Hair Oil (100ML | ₹450):**\n\n• **Ingredients:** Cold-pressed oils mein Rosemary extract aur Kashmiri Saffron (Kesar) ko 72 ghante copper vessel mein slow-cook karke banaya gaya hai.\n• **Labh (Benefits):**\n  1. Hair fall (baal girna) ko tezi se rokta hai.\n  2. Scalp ki microcirculation stimulate karke baalon ki new growth ko badhava deta hai.\n  3. Dandruff aur dryness ko jad se khatam karta hai.\n• **Kaise use karein:** Hafte mein 2 se 3 baar raat ko ya nahane se 2 ghante pehle halki massage karein aur mild herbal shampoo se dho lein.`,
            canEscalate: true
        };
    }

    // 6. KUMKUMADI TAILAM / SKINCARE
    if (/(kumkumadi|tailam|face|chehra|skin|glow|pigmentation|pimples|acne|daag|dhabbe|facewash|pureglow)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'product',
            message: `🌺 **HRIDVED Ayurvedic Glowing Skin Care:**\n\n1. **HRIDVED Kumkumadi Tailam (20ML | ₹890):**\n  • Authentic Ashtanga Hridaya vidhi se bana 100% pure Kashmiri Saffron & Sandalwood oil.\n  • Raat ko chehra dhone ke baad 2–3 boond lekar chehre par gently massage karein.\n  • Natural glow lata hai aur pigmentation, dark spots aur dullness ko dur karta hai.\n\n2. **PureGlow Natural Facewash Powder (30GM | ₹210):**\n  • 100% chemical-free herbal ubtan powder for gentle face cleansing.`,
            canEscalate: true
        };
    }

    // 7. JOINT PAIN ROLL-ON OIL
    if (/(joint|dard|pain|ghutna|ghutno|kamar|back pain|gathiya|arthritis|roll on|muscle|sandhi)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'product',
            message: `🍃 **HRIDVED Joint Pain Roll-On Oil (50ML | ₹189):**\n\n• **Formula:** Mahanarayan aur Gandhapura taila jaisi classical herbs ka shaktishali blend.\n• **Roll-On Advantage:** Direct lagane mein aasan, haath gande nahi hote aur kapdo par daag nahi lagta. Skin mein turant absorb hota hai.\n• **Labh:** Ghutno ke dard, gathiya (arthritis), kamar dard, aur muscle stiffness mein turant aaram deta hai.\n• **Upyog:** Din mein 2-3 baar prabhavit sthan par roll karein.`,
            canEscalate: true
        };
    }

    // 8. A2 BILONA COW GHEE
    if (/(ghee|a2|bilona|cow ghee|desi cow|gir cow)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'product',
            message: `🧈 **HRIDVED A2 Bilona Cow Ghee (500GM | ₹999):**\n\n• **Vedic Bilona Method:** Desi Gir gayon ke A2 doodh se dahi jamakar, mitti ke bartan mein bilona karke amrit-tulya shuddh ghee banaya jata hai.\n• **Fayde:**\n  1. Pachan kshamata (Agni) ko mazboot karta hai.\n  2. Dimaag ki smriti (Memory & cognitive health) ko tez karta hai.\n  3. Joints ko lubricate karta hai aur sharir ki Ojas badhata hai.\n  4. Zero chemicals, 100% authentic Vedic aroma.`,
            canEscalate: true
        };
    }

    // 9. SHIPPING, DELIVERY & COD
    if (/(delivery|shipping|deliver|courier|dispatch|pincode|kitne din|kab aayega|charges|free shipping|cod|cash on delivery|payment)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'delivery',
            message: `🚚 **Shipping, Delivery & Payment Guide:**\n\n• **Free Shipping:** ₹999 se upar ke sabhi orders par Express Shipping bilkul FREE hai.\n• **Delivery Timeline:** Metro cities mein 2–4 din, baki Bharat mein 3–6 din lagte hain.\n• **COD (Cash on Delivery):** Pure Bharat mein uplabdh hai.\n• **Online Payment:** UPI (GPay, PhonePe, Paytm) aur Cards 100% secure hain.`,
            canEscalate: true
        };
    }

    // 10. ORDER TRACKING
    if (/(track|tracking|order status|mera order|kahan pahuncha|awb|waybill)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'order_tracking',
            message: `📦 **Live Order Tracking:**\n\nAap website ke **'Track Order'** page par jakar apna 10-digit registered mobile number ya Order ID enter karein. Aapko live courier location aur delivery date mil jayegi.\n\nKisi sahayata ke liye hamare Order Desk WhatsApp (+91 79909 34095) par message karein.`,
            canEscalate: true
        };
    }

    // 11. RETURNS & REFUNDS
    if (/(return|refund|cancel|damage|leaked|tuta|wapas|exchange)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'returns',
            message: `🔄 **7-Day Return & Replacement Policy:**\n\nAgar aapka parcel transit mein damage ya leak hua ho, toh 7 dino ke andar WhatsApp (+91 79909 34095) par unboxing photo bhej kar turant free replacement ya refund prapt karein.`,
            canEscalate: true
        };
    }

    // 12. DOCTOR CONSULTATION & CONTACT
    if (/(doctor|vaidya|consult|call|phone|contact|number|email|whatsapp|clinic|bulk)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'general',
            message: `👨‍⚕️ **Hridved Vaidya Care & Contact:**\n\n• **WhatsApp Support:** [+91 79909 34095](https://wa.me/917990934095) / [+91 89804 11390](https://wa.me/918980411390)\n• **Email:** hridved.customercare@gmail.com\n• Aap hamare certified Ayurvedic Vaidyas se free consultation aur personal swasthya salah le sakte hain!`,
            canEscalate: true
        };
    }

    // 13. DIGESTION / PACHAN / KABZ / ACIDITY
    if (/(pet|digestion|pachan|gas|acidity|kabz|constipation|bloating|apach)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'health',
            message: `🌿 **Ayurvedic Digestion (Pachan) & Gut Care:**\n\n• Subah gunguna pani piyein aur khana chaba-chaba kar khayein.\n• Raat ko sone se pehle gungune doodh ya pani mein 1 chammach **Hridved A2 Bilona Cow Ghee** lein; yeh aanto ko lubricate karta hai aur kabz (constipation) dur karta hai.\n• Khane ke turant baad thanda pani peene se parhez karein taaki Jatharagni mand na ho.`,
            canEscalate: true
        };
    }

    // 14. TRIDOSHA (VATA, PITTA, KAPHA)
    if (/(dosha|vata|pitta|kapha|tridosha|prakriti)/i.test(q)) {
        return {
            status: 'grounded',
            category: 'health',
            message: `⚖️ **Ayurvedic Tridosha Guidance:**\n\n• **Vata (Air & Space):** Asantulan se dry skin, joint pain aur anxiety hoti hai. Solution: Gunguna tel aur A2 Ghee.\n• **Pitta (Fire & Water):** Asantulan se acidity, heat aur skin redness badhti hai. Solution: Sheetal aahar aur desi ghee.\n• **Kapha (Earth & Water):** Asantulan se sluggishness, cold aur weight gain hota hai. Solution: Warm water aur active exercise.`,
            canEscalate: true
        };
    }

    // 15. COMPREHENSIVE INTELLIGENT AYURVEDIC ANSWER
    return {
        status: 'grounded',
        category: 'general',
        message: `🌿 **Ayurvedic Vaidya Guidance on "${userQuery}":**\n\nAyurveda sharir ke Prakriti aur Tridosha (Vata, Pitta, Kapha) santulan par karya karta hai.\n\n• **Aahar (Diet):** Taja, gunguna aur poshtik khana lein. Pachan aur Ojas badhane ke liye Hridved A2 Bilona Ghee ka prayog kalyankari hai.\n• **Formulations:** Bachho ke liye Suvarnaprashan, baalo ke liye Rosemary Hair Oil, skin ke liye Kumkumadi Tailam, aur joint pain ke liye Roll On oil atyant prabhavshali hain.\n• **Special Offer:** Abhi Shubh Deepavali offer mein coupon **DIWALI25** (25% off) aur **SHUBH100** uplabdh hain!\n\nAgar aapka koi vishisht sawal ya bimari ke baare mein janna hai, toh kripya vistar se batayein ya hamare **Vaidya se WhatsApp (+91 79909 34095)** par personalized advice lein!`,
        canEscalate: true
    };
};
