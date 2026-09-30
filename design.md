---
version: alpha
name: Sortak Retro Studio
description: A bold, playful, editorial landing-page system with warm neutrals, hard outlines, and punchy CTA contrast.
colors:
  primary: "#c52020"
  primary-strong: "#a81818"
  primary-soft: "#e7b11a"
  secondary: "#1b120e"
  tertiary: "#f7f2e9"
  neutral: "#f3ede2"
  surface: "#f7f2e9"
  on-surface: "#1b120e"
  muted: "#6a5a51"
  border: "#1b120e"
  success: "#2f9b7a"
  warning: "#e7b11a"
  error: "#c52020"
typography:
  headline-display:
    fontFamily: "Bebas Neue"
    fontSize: "112px"
    fontWeight: 400
    lineHeight: "134px"
    letterSpacing: "4.48px"
  headline-lg:
    fontFamily: "Bebas Neue"
    fontSize: "67px"
    fontWeight: 400
    lineHeight: "80px"
    letterSpacing: "0.8px"
  headline-md:
    fontFamily: "Bebas Neue"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: "48px"
    letterSpacing: "0.8px"
  headline-sm:
    fontFamily: "Bebas Neue"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0.8px"
  body-lg:
    fontFamily: "Space Grotesk"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Space Grotesk"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "23px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Space Grotesk"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Space Grotesk"
    fontSize: "16px"
    fontWeight: 900
    lineHeight: "20px"
    letterSpacing: "0.04em"
  label-md:
    fontFamily: "Space Grotesk"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "18px"
    letterSpacing: "0.04em"
  label-sm:
    fontFamily: "Space Grotesk"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.06em"
  overline:
    fontFamily: "Space Grotesk"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: "14px"
    letterSpacing: "0.08em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 20px
  md: 40px
  lg: 64px
  xl: 118px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "12px 32px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "12px 32px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px"
  chip:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
---

# Sortak Retro Studio

## Overview
Sortak feels like a playful, high-contrast studio brand with a vintage poster attitude and modern product clarity. The interface is dense with personality, but the layout still breathes thanks to broad margins, generous hero spacing, and simple card forms. Overall, the tone is energetic and promotional rather than corporate, with a handcrafted feel reinforced by thick outlines and bold typographic hierarchy.

## Colors
- **Primary (#c52020):** A vivid red used for the main call to action, badges, and emphasis points. It gives the site its energetic, urgent retail-like punch.
- **Secondary (#1b120e):** A near-black espresso tone used for text, borders, icons, and structural outlines. It replaces pure black with a warmer, more analog feel.
- **Tertiary (#f7f2e9):** A soft warm cream used for light button surfaces and cards. It keeps the palette friendly and slightly nostalgic.
- **Neutral (#f3ede2):** The page background and large atmospheric canvas color. It reads as aged paper rather than sterile white.
- **Surface (#f7f2e9):** Card and panel fill for content blocks that need separation without breaking the warm tone.
- **Muted (#6a5a51):** Supporting body copy and secondary text color. It should be used sparingly to preserve contrast and hierarchy.
- **Primary-Strong (#a81818):** A darker red for hover and pressed states. It deepens the CTA without changing the brand hue.
- **Primary-Soft (#e7b11a):** A golden accent used for pills, icons, and spotlight labels. It introduces a bright, playful contrast against the warm neutrals.
- **Success (#2f9b7a):** A restrained green used for affirming states such as acceptance buttons or positive confirmations.
- **Warning (#e7b11a):** A vivid amber that supports the badge and highlight language.
- **Error (#c52020):** Error states should reuse the brand red rather than introducing a separate destructive palette.

## Typography
The system combines **Bebas Neue** for display messaging and **Space Grotesk** for interface text. Bebas Neue gives the brand its tall, condensed, poster-like voice, while Space Grotesk keeps the body copy clean, readable, and functional.

- **Headlines:** Use Bebas Neue with very large sizes and tight, deliberate rhythm. The hero title is especially impactful, with strong letter spacing that creates a billboard-like presence.
- **Body:** Use Space Grotesk at 14px–16px with comfortable line height for paragraphs and supporting content. The copy should feel conversational but still structured.
- **Labels:** Use Space Grotesk in heavy weights for buttons, pills, nav items, and micro-UI. Labels are often uppercase or visually shouty, so modest tracking helps them feel crisp.
- **Uppercase conventions:** Navigation, badges, and CTAs lean heavily into uppercase styling. Keep that convention for actions and section markers to preserve the retro editorial mood.

## Layout
The page uses a wide, open hero composition with a strong central axis and generous negative space. Content is arranged in large blocks rather than dense columns, and the overall rhythm alternates between broad breathing room and compact feature clusters.

Spacing follows a stepwise scale: 8px for fine adjustments, 20px for modest gaps, 40px for section separation, 64px for major breathing room, and 118px for large hero offsets. Cards and panels typically use 24px internal padding, while larger containers sit comfortably within a fixed-max-width feel rather than a fluid edge-to-edge grid.

Navigation elements are horizontally spaced with clear separation, and primary action groups cluster tightly so the eye can scan quickly. The result is spacious in feel, but not minimal; it is intentionally staged like a magazine spread.

## Elevation & Depth
Elevation is created mostly through bold outlines, shadow offsets, and contrast rather than soft blur shadows. The design prefers a cutout, sticker-like depth: dark borders, crisp surfaces, and a hard shadow step that makes buttons and cards feel physically stacked.

The small shadow treatment is a sharp offset rather than a diffuse one. This keeps the interface tactile and slightly comic-book-like, which matches the brand’s retro studio personality. Flat areas are acceptable when the shape, border, and color contrast already define separation.

## Shapes
The shape language is rounded but assertive. Corners typically land in the 8px–12px range, enough to soften the system without losing the graphic, poster-like edge.

Buttons and cards feel like printed placards or mounted cards rather than soft app panels. Avoid overly pill-shaped forms except where a full-round treatment is explicitly needed for tiny icons or badges.

## Components
- **Buttons:** Primary buttons use the strongest red background, warm light text, 12px x 32px padding, 52px height, and a bold label treatment. They should read as the highest-priority action and may include a small icon or arrow. Secondary buttons invert the surface treatment with cream fills and dark text, but retain the same outline-heavy structure. Tertiary buttons are text-only and should be reserved for low-emphasis actions.
- **Button states:** Hover states should deepen the red toward `button-primary-hover` or soften the cream for secondary actions. Keep borders and shadows consistent so motion feels like a shift in paper layers rather than a modern glow.
- **Cards:** Cards use warm cream surfaces, 12px to 16px corners, 24px padding, and dark borders. They should feel like pinned poster panels or ticket stubs, with enough structure to support content without looking corporate.
- **Inputs:** Inputs should mirror cards with a lighter surface, dark border, and 8px–12px radius. Keep text readable and avoid decorative internal chrome; the field should feel utilitarian and sturdy.
- **Chips and badges:** Chips are compact, high-contrast labels with bold uppercase text and a warm accent fill. Use them for status tags like AI-powered or file format indicators.
- **Navigation:** Top navigation items are simple, uppercase, and tightly tracked. The active item should be visually distinct with a dark filled background and light text.
- **Icon buttons:** Small square icon buttons should keep strong contrast, dark framing, and a slightly inset, sticker-like presence. Use them sparingly to preserve the hero’s clarity.
- **Dialogs and cookie notices:** Modal-like panels should use the same card treatment as the rest of the system, with a prominent title, dense body copy, and action buttons aligned to the lower right.

## Do's and Don'ts
- Do keep headlines large, condensed, and strongly letterspaced.
- Do use warm neutrals and dark espresso outlines instead of pure black-and-white contrast.
- Do preserve the hard-edged, printed-card feel with visible borders and offset shadows.
- Do make primary actions red and unmistakable, with bold label treatment.
- Don't introduce soft gradients, glassmorphism, or modern blurred shadows.
- Don't round everything into pills; reserve full rounding for small utility elements only.
- Don't use thin font weights for UI labels or navigation.
- Don't crowd the layout; maintain the airy hero spacing and wide margins.