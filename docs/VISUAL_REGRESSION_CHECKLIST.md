# HRIDVED VISUAL REGRESSION & RESPONSIVE CHECKLIST
**Version:** 1.0 (Prompt 02 Deliverable)  
**Scope:** Responsive Shell, Navigation, Layout, Accessibility & Design Token Conformance  
**Target Viewports:**
- **Mobile:** 360px - 767px (iPhone SE, iPhone 14/15, Android standard)
- **Tablet:** 768px - 1023px (iPad Mini, iPad Air, Surface Pro)
- **Desktop:** 1024px - 1920px (Laptop 13"/15", Desktop Monitor 1080p)

---

## 1. Announcement Strip & Header

| Item | Desktop (1024px+) | Tablet (768px - 1023px) | Mobile (360px - 767px) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Top Announcement Strip** | Displays marquee offer (₹999 free shipping threshold), helpline, consultation link | Compact banner with key offer text | Compact single-line marquee banner | Pass |
| **Logo (`/logo-asset4.png`)** | Crisp rendering, links to `/`, `h-14` or `h-16`, accessible alt | Proportional sizing, non-distorted | Scaled cleanly without horizontal overflow | Pass |
| **Navigation Links** | Full horizontal menu with active underline indicator | Condensed or hamburger trigger | Hamburger icon button with `aria-label` & `aria-expanded` | Pass |
| **Search Bar / Modal** | Search input visible or expandable via icon; Escape closes | Expandable search bar; Escape closes | Full-width search modal overlay; Escape closes | Pass |
| **Cart & User Icons** | Action icons with badge counts; keyboard focusable | Action icons with badge counts | Action icons visible in header and replicated in bottom nav | Pass |
| **Sticky Behavior** | Header smoothly transitions on scroll with subtle backdrop blur | Consistent backdrop blur | Consistent backdrop blur, no jitter | Pass |

---

## 2. Responsive Shell & Layout

| Item | Desktop (1024px+) | Tablet (768px - 1023px) | Mobile (360px - 767px) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Skip to Content Link** | Hidden until focused via Tab; jumps to `#main-content` | Functional via external keyboard | Functional via external keyboard | Pass |
| **Main Content Container** | Constrained max-width `max-w-7xl` or `container mx-auto px-6` | Fluid grid with `px-4` padding | Fluid single column with `px-4` padding, no horizontal scroll | Pass |
| **Mobile Bottom Navigation** | Hidden (`hidden lg:hidden`) | Hidden on desktop, visible on mobile | Fixed bottom bar with 5 primary actions (Home, Shop, Contact, Cart, Profile) | Pass |
| **Bottom Padding Compensation** | Standard padding (`pb-12`) | Standard padding (`pb-12`) | Extra bottom padding (`pb-20`) to prevent mobile nav overlap | Pass |

---

## 3. Footer

| Item | Desktop (1024px+) | Tablet (768px - 1023px) | Mobile (360px - 767px) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Column Grid** | 4 columns: About/Socials, Quick Links, Support/Legal, Contact | 2x2 grid layout | 1 column stacked layout with comfortable tap targets | Pass |
| **Semantic Navigation** | `<nav aria-label="Footer Quick Links">` and `<nav aria-label="Footer Support and Legal Links">` | Verified semantic tags | Verified semantic tags | Pass |
| **Contact Details** | Both phone numbers displayed: `+91 89804 11390` (WA) & `+91 79909 34095` (Call) | Accessible tap-to-call / tap-to-chat links | Direct `tel:` and `wa.me:` action links | Pass |
| **Copyright Notice** | Centered copyright with dynamic year | Centered copyright with dynamic year | Centered copyright, readable text | Pass |

---

## 4. Accessibility (A11y) & Interaction

- [x] **Keyboard Navigation:** Tab cycle flows logically through Header -> Navigation -> Skip Link -> Main Content -> Footer.
- [x] **Escape Key Listener:** Pressing `Escape` closes search modal, mobile drawer, and user menu dropdown.
- [x] **ARIA Labels:** Mobile menu toggle (`aria-label="Toggle navigation menu"`), search toggle (`aria-label="Open search dialog"`), footer socials (`aria-label="HRIDVED on Facebook"`), and mobile bottom nav tabs (`aria-label` & `aria-current="page"`).
- [x] **Color Contrast:** All body text (`#111827` or `#4B5563` on `#FDFBF7`) meets WCAG 2.2 AA (minimum 4.5:1 ratio). Footer text (`#FFFFFF` or `#D1D5DB` on `#053807`) exceeds 7:1 contrast ratio.
- [x] **Focus Indicators:** Interactive buttons and links display distinctive focus rings (`focus:ring-2 focus:ring-secondary` or `focus:ring-primary`).

---

## 5. Design Token Conformance Verification

- [x] **Primary Forest Green (`#053807`):** Headers, footer background, primary buttons, borders.
- [x] **Ayurvedic Gold (`#D4AF37`):** Accent highlights, ratings, badges, secondary buttons.
- [x] **Warm Cream (`#E5D3B3`):** Luxury card borders and dividers.
- [x] **Warm Ivory Canvas (`#FDFBF7`):** Page background.
- [x] **Zero Unauthorized Colors:** No CSS alterations modifying the locked palette.

