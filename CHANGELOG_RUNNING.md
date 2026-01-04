# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

2026-01-04 | 3:40PM EST
———————————————————————
Change: Fixed critical JS errors preventing Resources/Events pages from loading; removed duplicate HTML IDs; normalized References taxonomy (inspiration → references); added Drone subfilter event handlers.
Files touched: resources.html, resources-data.js, events.html
Notes:
- Fixed ReferenceError: isDrones undefined in resources.html:2779
- Fixed SyntaxError: duplicate eventModalClose declaration in events.html:1704
- Changed all category:'inspiration' to category:'references' and inspirationType to refType in resources-data.js
- Removed 4 duplicate droneTypeBar and 5 duplicate referencesGroupBar HTML blocks
- Added missing event listeners for droneTypeButtons and aiTypeButtons
- Normalized referencesSubcategory initial value from 'all-ref' to 'all' to match button data-attribute
Quick test checklist:
- Resources page: hard refresh, no console errors
- Click each category (Friends/Community/Stock/Tools/Drones/References) → tiles render correctly
- References tab: subfilters show (Inspiration/Art/Editing/Filming/Music/References/Comedy/All) and filter results
- Drones tab: subfilters show (Part 107/Channels/Stores/All) and filter results
- Events page: hard refresh, calendar loads, no console errors
- Events: click event opens modal, close button works

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
