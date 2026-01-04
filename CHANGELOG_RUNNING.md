# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

2026-01-04 | 2:47PM EST
———————————————————————
Change: Normalize References subfilter handling (including Comedy) and show drone subtype filters on the top-level Drones tab; add debug counters for References renders.
Files touched: resources.html
Notes: References now defaults to All even if stale/legacy values are present; drone subfilter row appears for Drones and Tools→Drone views.
Quick test checklist:
- Hard refresh Resources, open References, confirm cards render
- Switch each References subfilter (including Comedy and All) to verify updates
- Open Drones tab and test Part 107 / Channels / Stores / All filters
- Check console for debug counts and absence of JS errors

2026-01-04 | 2:26PM EST
———————————————————————
Change: Fixed References filtering defaults so reference items render (including Comedy) even when subfilter state is stale; kept canonical category key `references`.
Files touched: resources.html
Notes: Ensures refs show when All is selected; comedy remains available.
Quick test checklist:
- Open References tab and verify items render without manual filters
- Toggle each References subfilter including Comedy → results adjust
- Ensure other categories (Film Festivals, Tools, Drones) still populate
- Check console for errors when switching between categories

## 2026-01-04
- Change: Resources grid now uses event delegation + chunked rendering for smoother filtering and less DOM churn. Added Saved (favorites) system using localStorage and a modal save toggle.
- Files touched: resources.html
- Notes: Favorites stored in localStorage key lab_favorites_v1. Saved filter shows only favorites.
- Quick test checklist:
  - Filtering/search doesn’t hitch during typing
  - Clicking resource cards still opens modal
  - Ghost/skeleton tiles never open modal
  - Save/unsave toggles star and persists after refresh
  - Saved filter correctly narrows results

- Change: Events page can export .ics calendar file from events-data.js
- Files touched: events.html
- Notes: Uses America/Detroit timezone for timed events and all-day spans for festivals.
- Quick test checklist:
  - Export downloads .ics
  - Import into Apple/Google Calendar shows expected dates/times

## YYYY-MM-DD
- Change:
- Files touched:
- Notes:
- Quick test checklist:

---
Example template:

## 2026-01-03
- Change: Removed glow from accent-line animations so they match the crisp “Scroll” line behavior.
- Files touched: index.html, plan-your-project.html
- Notes: Accent line pseudo-elements now explicitly disable box-shadow/filter.
- Quick test checklist:
  - Confirm hero lines animate with no halo/glow
  - Confirm poster lines animate with no halo/glow
  - Test on mobile + desktop
  - Check prefers-reduced-motion still behaves
2026-01-04 | 3:06PM EST
———————————————————————
Change: Normalize References data/filter fallbacks so reference cards render and Comedy is selectable; ensure Drone subfilters appear for Drones tab.
Files touched: resources.html
Notes: Added inspiration→references fallback for both category and refType lookups; kept subfilter rows single-instance for drones/references.
Quick test checklist:
- Hard refresh Resources; click References → cards render
- Toggle Inspiration/Editing/Filming/Art/Music/References/Comedy/All → results stay populated
- Select Drones → Drone subfilter row shows; Part 107/Channels/Stores/All filter items accordingly
- Console free of errors (favicon only)
2026-01-04 | 3:22PM EST
———————————————————————
Change: Fix Resources render crash (undefined isDrones) and resolve duplicate modal close declaration on Events.
Files touched: resources.html, events.html
Notes: Scoped drone detection to cover drone/drones keys; renamed modal close handle to avoid redeclaration.
Quick test checklist:
- Hard refresh Resources; Friends/Community/Drones tabs render without console errors
- Toggle Drones subfilters → cards remain visible
- Hard refresh Events; calendar visible
- Click an event → modal opens; close button works
