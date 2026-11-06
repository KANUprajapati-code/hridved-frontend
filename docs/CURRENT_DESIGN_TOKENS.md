# CURRENT DESIGN TOKENS (STRICT LOCK)
**Brand:** HRIDVED Ayurveda  
**Document Status:** LOCKED & AUDITED (Prompt 02 Completed)  
**Rule:** Non-negotiable brand color and design token lock. No modifications, replacements, or substitutions permitted.

---

## 1. Primary Color Palette

| Token Name | Hex Code | HSL / RGB | Semantic Role | Source File & Line |
| :--- | :--- | :--- | :--- | :--- |
| **`primary`** | `#053807` | `rgb(5, 56, 7)` | Brand Forest Green, Primary Buttons, Main Headings, Navbar Accent, Active States | `tailwind.config.js:21`, `src/index.css:147, 162, 183, 192, 275` |
| **`secondary`** | `#D4AF37` | `rgb(212, 175, 55)` | Rich Ayurvedic Gold, Highlights, Secondary CTAs, Badges, Rating Stars, Border Accents | `tailwind.config.js:22`, `src/index.css:23, 36, 41, 78, 147, 166, 192` |
| **`accent`** | `#E5D3B3` | `rgb(229, 211, 179)` | Herbal Beige / Warm Cream, Subtle Dividers, Card Outlines, Hover Rings | `tailwind.config.js:23`, `src/index.css:18, 262` |
| **`background`** | `#FDFBF7` | `rgb(253, 251, 247)` | Warm Ivory Canvas, Main Page Background, Input Canvas, Clean Reading Area | `tailwind.config.js:24`, `src/index.css:14, 49` |

---

## 2. Functional & Status Colors

| Token Name | Hex Code | Role | Source File & Line |
| :--- | :--- | :--- | :--- |
| **`success`** | `#10B981` | In-stock badges, order success, verified icons, coupon applied | `tailwind.config.js:26`, `src/index.css:170` |
| **`error`** | `#EF4444` | Out-of-stock badges, form errors, payment failed alerts | `tailwind.config.js:27`, `src/index.css:174` |
| **`warning`** | `#F59E0B` | Low-stock indicators, consultation alerts, pending notices | `tailwind.config.js:28`, `src/index.css:178` |
| **`info`** | `#3B82F6` | Informational callouts, tracking status updates | `tailwind.config.js:29` |

---

## 3. Neutral & Surface Tokens

| Token Name | Tailwind / Value | Role |
| :--- | :--- | :--- |
| **Surface Card** | `#FFFFFF` | Product cards, modals, checkout white panels |
| **Surface Muted** | `#F9F6F0` / `#F3EFE6` | Alternate section backgrounds, trust strip, table rows |
| **Text Primary** | `#111827` (`gray-900`) | Main body copy, high-contrast readable text |
| **Text Secondary** | `#4B5563` (`gray-600`) | Subtitles, product variant labels, descriptions |
| **Text Tertiary** | `#9CA3AF` (`gray-400`) | Placeholder text, timestamps, inactive icons |
| **Border Soft** | `#E5E7EB` (`gray-200`) | Standard inputs, subtle section separators |
| **Border Accent** | `#E5D3B3` (`accent`) | Premium luxury borders (`.luxury-border`) |

---

## 4. Typography Hierarchy

| Font Family | CSS Family Specification | Typical Usage | Source |
| :--- | :--- | :--- | :--- |
| **Display** | `'Cormorant Garamond', serif` | `h1`, `h2`, `h3`, Section Titles, Hero Headlines | `tailwind.config.js:34`, `src/index.css:1, 55, 60, 65` |
| **Serif Accent** | `'Lora', serif` | `h4`, `h5`, Testimonial quotes, Ayurvedic descriptions | `tailwind.config.js:33`, `src/index.css:1, 70, 74` |
| **Body & UI** | `'Inter', sans-serif` | Body text, Buttons, Inputs, Navigation, Prices, Badges | `tailwind.config.js:32, 35`, `src/index.css:1, 49, 94` |

---

## 5. Spacing Scale

- **Base Grid:** `4px` (0.25rem) increments
- **Micro spacing:** `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px)
- **Component spacing:** `p-6` (24px), `p-8` (32px), `p-10` (40px)
- **Container padding:** `px-4 sm:px-6 lg:px-8` (Max container `max-w-7xl` or `container mx-auto`)
- **Section vertical padding:** `py-12 md:py-20` (Consistent rhythm across all 12 homepage sections)
- **Gap Scale:** `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px), `gap-10` (40px)

---

## 6. Border Radius Scale

- **`rounded-md` (6px):** Small badges, tag pills, tooltip indicators
- **`rounded-lg` (8px):** Input fields, select dropdowns, search bars
- **`rounded-xl` (12px):** Buttons, standard product cards, dropdown menus
- **`rounded-2xl` (16px):** Featured cards, dialog containers, modal overlays, mobile bottom bar
- **`rounded-full` (9999px):** Avatars, circular action pills, rating pills, scroll-to-top buttons

---

## 7. Shadows & Elevation Effects

- **Luxury Shadow:** `box-shadow: 0 10px 50px -12px rgba(5, 56, 7, 0.15)` (`src/index.css:258`)
- **Card Hover Shadow:** `hover:shadow-xl` (`src/index.css:154`)
- **Glassmorphism:** `bg-white/70 backdrop-blur-md border border-white/20` (`src/index.css:254`)
- **Gold Glow:** `0 0 15px rgba(212, 175, 55, 0.25)`

---

## 8. Button Styles & Design Patterns

1. **Primary Button:**
   - Classes: `bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all duration-300 font-semibold px-6 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2`
   - Purpose: Main conversion actions (Add to Cart, Checkout, Submit)

2. **Secondary Button (Gold / Highlight):**
   - Classes: `bg-secondary text-primary hover:bg-[#c49f2e] active:scale-95 transition-all duration-300 font-bold px-6 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`
   - Purpose: Hero CTA, promotional actions, special offers

3. **Outline / Luxury Button:**
   - Classes: `border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`
   - Purpose: Secondary actions (Explore, Learn More, View Details)

4. **Ghost / Icon Button:**
   - Classes: `p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary`
   - Purpose: Header icons (search, cart, wishlist, mobile menu)

---

## 9. Responsive Breakpoints

- **Mobile (sm):** `< 640px` (single column layout, bottom nav active, compact headers)
- **Small Tablet (sm):** `640px - 767px` (2 columns for grids, collapsed navigation)
- **Tablet (md):** `768px - 1023px` (2-3 columns, condensed header, bottom nav hidden on md/lg)
- **Desktop (lg):** `1024px - 1279px` (Full desktop header, 4-column product grids, horizontal navigation)
- **Large Desktop (xl / 2xl):** `1280px+` (Max container `1280px` - `1400px`, optimal reading line-lengths)

---

## 10. Strict Enforcement Protocol
1. **Zero Color Additions:** No developer or subagent may introduce new color codes without prior explicit approval.
2. **Preserve Brand Assets:** Logo `/logo-asset4.png` and approved imagery must not be altered or replaced.
3. **No Theme Swapping:** The external reference site (`https://hridved-ayurveda.lentlosites.com/`) serves purely for structural and functional reference. Its color codes MUST NOT be copied.
4. **Automated Verification:** Every task must end with a diff review verifying that none of the hex codes above were modified.

