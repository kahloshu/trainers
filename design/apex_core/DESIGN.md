# Design System Document: The High-Performance Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Monolith"**

This design system moves away from the "friendly fitness app" tropes of rounded bubbles and neon gradients. Instead, it adopts a high-end editorial aesthetic inspired by premium sports photography and avant-garde architecture. The "Kinetic Monolith" combines the brutalist stability of a black-and-white foundation with the sudden, high-velocity energy of a vibrant blue accent. 

To break the "template" look, we employ **Intentional Asymmetry**. Imagery of trainers should bleed off the edges of the container, and typography should utilize extreme scale shifts (large displays paired with tiny, wide-tracked labels) to create a sense of professional authority. This system is designed to feel like a high-end digital lookbook rather than a utility tool.

---

## 2. Colors
Our palette is rooted in a sophisticated monochromatic base, using our vibrant primary blue solely as a "point-of-impact" color.

### The Palette
- **Primary (`#0050cb`):** Used sparingly for "Pulse Points"—CTAs, active progress, and badges.
- **Surface & Background (`#fcf9f8`):** A warm, off-white "fine paper" base that prevents the high-contrast B&W from feeling clinical.
- **On-Surface (`#1c1b1b`):** The "Ink"—deep, near-black for maximum legibility and gravitas.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section content. Boundaries must be defined through:
1.  **Tonal Shifts:** Placing a `surface-container-low` card against a `surface` background.
2.  **Negative Space:** Using the 64px+ spacing scale to let the eye define groupings.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of material. 
*   **The Base:** `surface`
*   **The Stage:** `surface-container-low` (for wide sections)
*   **The Object:** `surface-container-highest` (for interactive cards)

### Signature Textures & Glass
To add "soul," use **Glassmorphism** on floating navigation bars or overlays. Use `surface_container_lowest` at 70% opacity with a `24px` backdrop blur. For primary CTAs, apply a subtle linear gradient from `primary` (#0050cb) to `primary_container` (#0066ff) at a 135-degree angle to simulate the sheen of high-performance athletic gear.

---

## 3. Typography
The typography system uses a "Dual-Engine" approach: **Lexend** for athletic structure and **Manrope** for modern readability.

*   **Display (Lexend, 2.25rem - 3.5rem):** Massive, bold, and unapologetic. Use `display-lg` for trainer names or "hero" transformation stats.
*   **Headline (Lexend, 1.5rem - 2rem):** The "Action" level. Use for category headers (e.g., "STRENGTH & CONDITIONING").
*   **Title (Manrope, 1rem - 1.375rem):** The "Narrative" level. Used for trainer bios or session titles. 
*   **Body (Manrope, 0.75rem - 1rem):** Functional and clean. All body text should use a slightly increased line-height (1.6) to ensure an airy, premium feel.
*   **Label (Lexend, 0.6875rem - 0.75rem):** Used for "Micro-Data"—durations, prices, and tags. Labels should often be uppercase with `0.05em` letter spacing to enhance the "athletic tech" aesthetic.

---

## 4. Elevation & Depth
We eschew the standard "Drop Shadow" in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface_container_lowest` (pure white) card on a `surface_container_low` background. This creates a soft "lift" that feels integrated into the environment.
*   **Ambient Shadows:** When a floating element (like a "Book Now" FAB) is required, use a shadow with a 40px blur, 0px offset, and 6% opacity of the `on_surface` color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border":** If a separator is required for accessibility, use the `outline_variant` at **15% opacity**.
*   **Asymmetric Imagery:** All trainer imagery should have a `xl` (0.75rem) border radius, but consider "breaking the box" by having the trainer's head or limb overlap the container above it via z-index layering.

---

## 5. Components

### Buttons
*   **Primary:** High-gloss `primary` background, `on_primary` text. `xl` (0.75rem) corner radius. Use the signature gradient.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
*   **Tertiary:** Text-only in `primary` blue, Lexend Bold, uppercase.

### Cards (The "Trainer Profile")
*   **Styling:** No borders. Use `surface_container_lowest`. 
*   **Interaction:** On hover/tap, the card should scale slightly (1.02x) and the background should shift to `surface_container_highest`. 
*   **Rule:** Never use a divider line between the trainer's name and their bio; use a 16px vertical gap.

### Selection Chips
*   Unselected: `surface_container_high` with `on_surface_variant`.
*   Selected: `primary` background with `on_primary` text. Full `9999px` radius.

### Input Fields
*   Background: `surface_container_low`. 
*   Indicator: Only show a bottom-aligned 2px `primary` line when the field is focused. Otherwise, use no borders.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use extreme scale. A 56pt headline next to 12pt metadata creates a high-end editorial feel.
*   **DO** use high-quality, high-contrast photography. Deep blacks and bright highlights in trainer photos complement the `on_background` and `primary` tokens.
*   **DO** utilize whitespace as a structural element. If you think there’s enough space, add 16px more.

### Don't:
*   **DON'T** use 1px solid lines to separate content. It looks like a legacy table, not a premium marketplace.
*   **DON'T** use the `primary` blue for everything. If more than 10% of the screen is blue, it loses its "kinetic" impact.
*   **DON'T** use standard "drop shadows" (e.g., 0px 4px 4px). They feel "out-of-the-box" and cheapen the premium athletic aesthetic.