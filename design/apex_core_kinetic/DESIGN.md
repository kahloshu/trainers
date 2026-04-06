# Design System Specification: Kinetic Monolith (Dark Mode)

## 1. Overview & Creative North Star: "The Digital Obsidian"
This design system is not merely a dark mode; it is a high-performance environment built for focus, speed, and prestige. Our Creative North Star is **"The Digital Obsidian"**—a concept where the interface feels like it has been carved from a single, dark, matte mineral, polished to a mirror finish only where interaction is required.

To achieve the "Kinetic Monolith" aesthetic, we move away from the "boxy" nature of traditional web design. We embrace **intentional asymmetry**, where large display typography anchors the layout, and elements overlap to create a sense of forward motion. We avoid rigid grids in favor of a "breathing" layout that uses expansive negative space to highlight the precision of the `Lexend` typeface and the vibrant energy of our primary blue.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is built on a foundation of deep carbon and ink, using our primary blue as a high-frequency "pulse" across the interface.

### The "No-Line" Rule
**Designers are strictly prohibited from using 1px solid borders for sectioning.** 
Structural separation must be achieved through **Background Shifts**. To separate a sidebar from a main feed, or a header from a hero section, transition from `surface` (#0e0e0e) to `surface-container-low` (#131313). This creates a sophisticated, seamless transition that feels like high-end industrial design rather than a webpage.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Each "inner" container should move up or down the tier list to define its importance:
*   **Base Layer:** `background` (#0e0e0e)
*   **Structural Sections:** `surface-container` (#1a1a1a)
*   **Floating/Active Elements:** `surface-container-highest` (#262626)

### Glass & Gradient (The "Soul" Rule)
Flat colors are for utilities; gradients are for experiences. 
*   **CTAs:** Use a linear gradient from `primary` (#8eabff) to `primary_dim` (#156aff) at a 135-degree angle.
*   **Overlays:** Utilize **Glassmorphism**. Floating panels should use `surface_variant` at 60% opacity with a `24px` backdrop blur. This allows the "Kinetic" energy of the background content to bleed through softly.

---

## 3. Typography: Editorial Authority
We use **Lexend** exclusively. Its hyper-legibility and geometric clarity are the backbone of the "High-Performance" feel.

*   **Display (lg/md/sm):** These are your anchors. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. Don't be afraid to let display text bleed off-canvas or overlap with background imagery.
*   **Headlines & Titles:** Used for clarity. `headline-lg` (2rem) should always be `on_surface` (Pure White) to provide maximum contrast against the dark void.
*   **Body (lg/md/sm):** Reserved for data and descriptions. Use `body-md` (0.875rem) for most secondary text to maintain a sophisticated, "technical manual" density.
*   **Labels:** Use `label-sm` (0.6875rem) in All-Caps with +0.05em tracking for metadata and overlines.

---

## 4. Elevation & Depth: Tonal Layering
In this system, light does not come from above; it radiates from the components themselves.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on top of a `surface-container-low` section to create a "recessed" look. Place a `surface-bright` element on a `surface` background to create a "lifted" look.
*   **Ambient Shadows:** Traditional black shadows are invisible in dark mode. Instead, use "Glow Shadows" for floating elements. Use the `primary` color at 8% opacity with a `48px` blur to create a subtle corona around active components.
*   **The Ghost Border Fallback:** If accessibility requires a stroke, use a **Ghost Border**. Apply `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components: Precision Machining

### Buttons & Interaction
*   **Primary:** A "Monolith" button. Use the `primary` gradient, `Round Four` (1rem) corner radius, and `on_primary_fixed` (Black) text for maximum punch.
*   **Secondary:** No background. Use a `Ghost Border` and `primary` colored text.
*   **Tertiary:** Purely typographic. Use `label-md` with an underline that appears only on hover.

### Cards & Containers
*   **Forbid Dividers:** Do not use lines to separate content within a card. Use `1.5rem` (md) or `2rem` (lg) vertical padding to let the content sit in distinct "islands" of negative space.
*   **Kinetic Hover:** On hover, a card should shift from `surface-container` to `surface-container-high` and scale by 1.02x.

### Input Fields
*   **State:** The default state is a `surface-container-highest` fill with no border. On focus, the field grows a 2px "Glow Border" using the `primary` blue, and the label floats upward using `label-sm`.

### High-Performance Chips
*   Use `secondary_container` (#2f3aa1) for selected states. They should look like glowing indicators on a dashboard.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use extreme white space. If you think there's enough room, add 16px more.
*   **DO** use `surface-bright` (#2c2c2c) for subtle hover states on list items.
*   **DO** ensure all primary actions use the `#0066FF` blue pulse to draw the eye instantly.

### Don't:
*   **DON'T** use 100% black (#000000) for anything other than `surface-container-lowest` or shadows. It "kills" the depth of the dark gray.
*   **DON'T** use grey text for body copy. Stick to `on_surface` (White) or `on_surface_variant` (Light Gray) to maintain the premium, high-readability promise.
*   **DON'T** use standard "Round" (9999px) pills for everything. Stick to the `Round Four` scale (1rem) to maintain the "Monolith" architectural feel.

---

## 7. Spacing & Rhythm
*   **The Power of 8:** All spacing must be multiples of 8px.
*   **Asymmetric Gutters:** For editorial layouts, try a wide left margin (128px) and a tighter right margin (64px) to create a sense of "Kinetic" movement across the screen.