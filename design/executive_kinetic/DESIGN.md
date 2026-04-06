# Design System Document: The Executive Minimalist

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Editor"**

This design system transcends the utility of a standard admin dashboard to become a high-end digital command center. Inspired by modern architectural blueprints and premium editorial layouts, "The Architectural Editor" prioritizes clarity through immense breathing room and authoritative typography. 

We break the "template" look by rejecting traditional grid-based boxing. Instead, we use intentional asymmetry and tonal depth. The UI should feel like a custom-tailored suit: precise, quiet in its luxury, and perfectly fitted to the user’s needs. We move away from "software" and toward "experience" by using high-contrast typography scales and layered surfaces that mimic the physical depth of premium stationery.

---

## 2. Colors: Tonal Authority
The palette is rooted in a high-contrast foundation of absolute Black and White, punctuated by the signature "James Blue" (#003399).

### Core Brand Tones
- **Primary (#002068):** The anchor. Used for high-level branding.
- **Primary Container (#003399):** The signature "James Blue." Use this sparingly for key action points and critical data highlights.
- **Surface (#f8f9fa):** The canvas. A very light gray that reduces eye strain compared to pure white while maintaining a premium "paper" feel.

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders for sectioning are prohibited.** Physical boundaries must be defined solely through background color shifts.
- To separate a header from a body, transition from `surface` to `surface-container-low`.
- To define a content area, let the negative space and the shift in tonal value (e.g., a `surface-container-lowest` card on a `surface` background) do the work.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy to create "nested" depth:
- **Level 0 (Base):** `surface` (#f8f9fa)
- **Level 1 (Sections):** `surface-container-low` (#f3f4f5)
- **Level 2 (Cards):** `surface-container-lowest` (#ffffff) - This creates a soft, natural lift.

### The "Glass & Signature" Rule
For floating elements (like a bottom navigation bar or a sticky header), use **Glassmorphism**. Apply `surface` with 80% opacity and a 20px backdrop-blur. 
**Signature Gradients:** For main CTAs, use a subtle linear gradient from `primary-container` (#003399) to `primary` (#002068) at a 135-degree angle. This adds "soul" and professional polish that flat fills cannot achieve.

---

## 3. Typography: Editorial Precision
We utilize a dual-typeface system to balance high-performance readability with executive authority.

*   **Display & Headline (Manrope):** Chosen for its geometric precision and modern "tech-luxury" feel. Use `display-lg` for daily stats and `headline-md` for section titles to command attention.
*   **Body & Labels (Inter/Pretendard):** These provide maximum legibility for dense admin data. Inter’s neutral tone ensures the interface feels functional and unobtrusive.

**Hierarchy as Identity:**
- **The Power Gap:** Create a large contrast between headlines and body text. A `headline-lg` title should often sit near `body-sm` metadata to create an "Editorial" look.
- **Tracking:** Set `label-sm` and `label-md` to +2% or +3% letter-spacing to enhance the premium feel of small text.

---

## 4. Elevation & Depth: Tonal Layering
We reject the heavy, muddy shadows of standard UI. We convey hierarchy through "Tonal Layering."

- **The Layering Principle:** Place a `surface-container-lowest` (pure white) card on a `surface-container-low` background. This creates a crisp, architectural edge without a single line of CSS border.
- **Ambient Shadows:** When an element must "float" (e.g., a modal), use an ultra-diffused shadow: `0px 12px 32px rgba(25, 28, 29, 0.04)`. The shadow color must be a tinted version of `on-surface`, never pure black.
- **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at 15% opacity. It should be felt, not seen.
- **Glassmorphism:** Use semi-transparent `surface-container-lowest` with a backdrop blur for "Action Sheets" to maintain a sense of context within the gym's busy data environment.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary-container` to `primary`). `lg` (0.5rem) roundedness. No border.
- **Secondary:** `surface-container-highest` background with `on-surface` text. Flat and architectural.
- **Tertiary:** Pure text with `primary-container` color. Used for low-emphasis actions like "Cancel" or "View All."

### Cards & Lists
- **Rule:** **Strictly no divider lines.**
- **Implementation:** Use `0.75rem (xl)` spacing between list items. For cards, use `surface-container-lowest` on a `surface` background with `lg` (0.5rem) roundedness.
- **Data Tables:** Use alternating row colors (`surface` and `surface-container-low`) instead of lines to guide the eye across member stats.

### Inputs & Selection
- **Input Fields:** Use `surface-container-low` with a `Ghost Border`. On focus, the border transitions to `primary-container` at 100% opacity.
- **Chips:** Selection chips use `primary-fixed` with `on-primary-fixed` text. They should feel like "pills" with `full` (9999px) roundedness.

### Contextual Admin Components
- **Member Status Indicator:** A small, high-chroma dot next to a name. Do not use large badges; use a 6px circle to maintain the minimalist aesthetic.
- **The "Power Summary" Header:** A large `display-md` number (e.g., Active Members) paired with a `label-sm` caption, utilizing the generous white space of the top 30% of the screen.

---

## 6. Do’s and Don’ts

### Do
- **Do** use white space as a structural element. If a screen feels crowded, increase the padding, don't add a border.
- **Do** optimize for one-handed use. Keep primary actions (Save, Add Member) within the bottom 40% of the screen.
- **Do** use `manrope` for any numeric data you want to celebrate (Revenue, Attendance).

### Don’t
- **Don't** use 100% opaque black for text. Use `on-surface` (#191c1d) to keep the look sophisticated and soft.
- **Don't** use standard "Success Green" or "Warning Orange" unless necessary for safety. Use subtle tonal shifts or the `tertiary` (deep red/brown) palette for errors to maintain the "Executive" vibe.
- **Don't** use shadows on every card. Only shadow elements that are "temporary" (pop-ups, menus). Base cards should be flat.

---

## 7. Motion & Interaction
- **Surface Transitions:** When a user taps a card, it shouldn't "pop" up; it should subtly shift its background color to `surface-container-high`.
- **Staggered Entrance:** When loading a dashboard, stagger the entrance of cards with a 50ms delay each, moving from bottom to top, to emphasize the "one-handed" layout logic.