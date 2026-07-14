---
name: Komorebi
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e1'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf4'
  surface-container-high: '#e9e7ef'
  surface-container-highest: '#e3e1e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#444651'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f7'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#a43073'
  on-secondary: '#ffffff'
  secondary-container: '#fc79bd'
  on-secondary-container: '#76014e'
  tertiary: '#3e2400'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c3800'
  on-tertiary-container: '#ef9900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#ffafd3'
  on-secondary-fixed: '#3d0026'
  on-secondary-fixed-variant: '#85145a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e3e1e9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  japanese-lg:
    fontFamily: Noto Sans JP
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 44px
  japanese-md:
    fontFamily: Noto Sans JP
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 1rem
  container-padding-desktop: 2rem
  gutter: 1.5rem
  sidebar-width: 280px
  max-content-width: 1200px
---

## Brand & Style
The design system for this educational platform balances traditional Japanese academic rigor with modern, interactive engagement. The brand personality is focused, disciplined, yet encouraging—designed to reduce the cognitive load of language learning while celebrating progress through subtle gamification.

The aesthetic follows **Modern Minimalism** with **Tactile Gamification** elements. This approach utilizes generous whitespace and a restricted color palette to maintain focus on the curriculum, while interactive components (streaks, buttons, cards) use soft depth and vibrant accents to provide the dopamine hits necessary for long-term retention. The interface should feel like a premium digital stationary set: clean, intentional, and high-quality.

## Colors
The palette is rooted in Japanese tradition and modern UI standards.

*   **Primary (Japanese Indigo):** Used for navigation, core headers, and structural elements. It evokes a sense of "Juku" (cram school) discipline and professional trust.
*   **Accent (Sakura Pink):** Reserved for primary actions, active progress states, and key highlights. This provides a soft, welcoming contrast to the deep indigo.
*   **Gamification (Golden/Orange):** Specifically for reward systems, streak counters, and urgency-based alerts.
*   **Neutrals:** The background uses a slightly cool off-white to reduce eye strain during long study sessions, while pure white is used to elevate interactive containers.

## Typography
The typographic system prioritizes legibility across two scripts. **Inter** handles all UI labels, English instructions, and system metadata, providing a clean, neutral framework. **Noto Sans JP** is used for all Japanese characters, selected for its balanced weight and excellent rendering of complex Kanji at smaller sizes.

For learning modules, Japanese text should be rendered 15-20% larger than the surrounding English text to ensure stroke clarity. Use `label-caps` for non-interactive metadata like category tags or "Daily Goal" headers to create a clear hierarchy.

## Layout & Spacing
The design system utilizes a **Fixed Grid** for desktop and a **Fluid Grid** for mobile devices.

*   **Desktop:** A 12-column layout with a fixed maximum width of 1200px. The sidebar remains docked at 280px, providing persistent access to the learning map, profile, and shop.
*   **Mobile:** A single-column fluid layout. The sidebar transitions to a bottom navigation bar for primary destinations, with secondary settings hidden in a "More" menu.
*   **Spacing Rhythm:** An 8px base unit (linear scale) governs all padding and margins. Use `24px` (base * 3) for vertical spacing between learning cards to maintain an airy, non-intimidating feel.

## Elevation & Depth
Depth is used sparingly to signify "pressability" and information hierarchy:

*   **Tonal Layers:** The main page background is at the lowest level (Level 0). Cards and the sidebar sit at Level 1, using pure white and a subtle 1px border (#E5E7EB) rather than shadows to maintain a clean aesthetic.
*   **Gamification Depth:** Interactive cards (like Quiz Options) use a "Skeuomorphic Lite" approach. Instead of traditional shadows, they use a 4px solid bottom border in a darker shade of the element's color to create a "physical button" effect that feels satisfying to tap.
*   **Overlays:** Modals and tooltips use a soft ambient shadow (15% opacity, 20px blur) to lift them above the instructional content.

## Shapes
The shape language is consistently **Rounded**. This choice softens the academic nature of the app, making it feel more like a lifestyle habit than a chore.

*   **Standard Elements:** Buttons, input fields, and small cards use a `0.5rem` (8px) radius.
*   **Large Containers:** Lesson modules and profile headers use `rounded-lg` (16px) or `rounded-xl` (24px) to create a friendly, "contained" look.
*   **Avatars & Icons:** Profile pictures and streak "flame" icons are strictly circular to contrast against the rectangular layout of the rest of the UI.

## Components
Consistent styling of these key components ensures the learning experience feels cohesive:

*   **Sidebars:** The background should be `background_container`. Active links use a left-edge `4px` Sakura Pink border and Indigo text. Icons should be stroke-based and 24px.
*   **Streak Counters:** A pill-shaped component featuring the Golden/Orange fire icon. Use `label-caps` for the number. When a streak is active, the container should have a subtle 1px Golden border.
*   **Primary Buttons:** High-contrast Sakura Pink background with white text. Use the "physical button" 4px bottom border (in a darker pink) to encourage interaction.
*   **Learning Cards:** Pure white background, 1px grey border. The top section features the Japanese character in `japanese-lg`, with the English translation in `body-md` below.
*   **User Profile Headers:** A large `rounded-xl` container at the top of the dashboard. It integrates the user's avatar, current level (Indigo badge), and a Sakura Pink progress bar indicating the path to the next level.
*   **Checkboxes/Radio Buttons:** Circular and oversized (minimum 24px tap target). When selected, they fill with Sakura Pink and display a white checkmark.