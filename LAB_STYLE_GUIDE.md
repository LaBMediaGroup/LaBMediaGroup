# LaB Media — Style Guide (Prototype / Retrofuturist Minimal)

This site is pure HTML/CSS/JS with GSAP. No build step by default. Keep it fast, crisp, and “high-tech but tasteful.”

## North Star
- Minimal UI, maximal intention.
- “Prototype / retrofuturism” cues: corner brackets, scan lines, accent lines, status-y UI hints.
- Avoid “busy cyberpunk.” No neon soup, no visual spam.

## Typography
- Headings: Space Mono (display/tech vibe)
- Body/UI: Inter

Rules:
- Prefer fewer sizes; let spacing + weight do the work.
- Avoid long all-caps paragraphs.
- Keep line-length readable (roughly 55–85 chars when possible).

## Color + Crisp Lines (No Glow on Accent Lines)
- Base palette: grayscale/dark
- Accents: cyan/blue/orange sparingly

Accent line rules (important):
- Accent lines must be crisp and **non-glowy**
- No `box-shadow` halos on accent lines
- No “neon blur” look
- Use opacity + position animation for the “breathing” effect
- Solid white is preferred; avoid gradients for lines unless explicitly requested

Where glow *is* allowed (optional):
- Small, controlled emphasis on buttons/cards (hover/active), never everywhere at once
- If used: keep it subtle and localized (no foggy UI)

## Buttons + Links
- Buttons should feel “instrument panel”:
  - clear affordance (hover, active)
  - high contrast
  - consistent padding and radius
- Links in detail/bio views are buttons when they matter (Website / FilmFreeway / Instagram / YouTube).
- External links open in a new tab where appropriate.

## Motion + Interaction
- Default: micro-interactions, not constant movement.
- Must respect `prefers-reduced-motion`.
- Scroll reveals: smooth, not jittery.

Accent line spec (the “Scroll line” baseline):
- Bright, crisp, “breathing” ease-in/out
- Higher peak opacity than other lines
- Minimal blur; ideally none
- Animation should be periodic and calm, not frantic
- **No glow on the lines**

## Accessibility (Non-negotiable)
- Keyboard usable:
  - Focus states visible and consistent
  - Modals have focus trap, ESC close, backdrop close
  - Return focus to trigger on close
- ARIA only when it helps; don’t add junk ARIA.
- Color contrast: ensure readable text on dark backgrounds.

## Performance Guardrails
- Don’t re-render huge DOM trees unnecessarily.
- Prefer event delegation where reasonable.
- Lazy-load heavy embeds (YouTube) and heavy data (resources) where possible.
- Keep third-party scripts lazy-loaded and isolated.

## “No framework unless justified”
Vanilla wins unless:
- You can prove maintenance/performance/feature velocity improvements
- AND you can ship it without breaking the vibe

If proposing React/Vue/etc, provide a clear migration plan and why it’s worth it.
