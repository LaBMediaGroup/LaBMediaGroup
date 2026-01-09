# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

2026-01-04 | 4:07PM EST
———————————————————————
Change: Refined site-wide copy to match "A CREATIVE STUDIO" tagline aesthetic; reordered navigation hierarchy.
Files touched: events.html, resources.html, index.html
Notes:
- Updated suggest note to uppercase tagline style: "MISSING AN EVENT? SEND IT OUR WAY" (0.6rem, gray-600, 2px letter-spacing)
- Refined Events subtitle: "Screenings, meetups, and deadlines keeping the Detroit creative community connected."
- Refined Resources subtitle: "Curated tools, references, and collaborators keeping every LaB project moving."
- Reordered nav: Resources → Events → Plan → Work → Contact (Work moved between Plan and Contact)
- Applied nav order to index.html and events.html for consistency
Quick test checklist:
- All page subtitles: cleaner, more concise, parallel structure
- Suggest text: matches tagline aesthetic (small, uppercase, spaced, subtle)
- Nav order: Resources, Events, Plan, Work, Contact on all pages with full nav

2026-01-04 | 3:59PM EST
———————————————————————
Change: Refined Events page UI polish - improved event modal close button and suggest text styling to match LaB proto aesthetic.
Files touched: events.html
Notes:
- Removed duplicate .event-modal-close CSS definition (lines 444-451)
- Improved close button: cleaner styling, backdrop blur, subtle hover lift, uppercase text
- Removed 5 duplicate .suggest-note CSS rules
- Updated suggest text: Space Mono font, smaller size, better letter-spacing for consistency
Quick test checklist:
- Event modal: close button has clean proto aesthetic with subtle hover effect
- Close button: hover shows lift and brightness, active state feels responsive
- Suggest text: matches monospace proto style with proper spacing

2026-01-04 | 3:53PM EST
———————————————————————
Change: Fixed remaining Events page JS errors blocking event preview modal and Suggest button functionality.
Files touched: events.html
Notes:
- Fixed ReferenceError: renderPastList undefined (line 1641) - changed to renderPastEvents
- Fixed ReferenceError: Cannot access eventPreviewBackdrop before initialization - moved declarations to global scope
- Fixed ReferenceError: updateViewVisibility undefined (line 1642) - removed orphaned function call
- Renamed lastFocusEl to lastSuggestFocusEl in suggest modal section to avoid variable shadowing
Quick test checklist:
- Events page: hard refresh, no console errors
- Calendar: click event pill → event preview modal opens with details
- Event preview: close button works, Escape key closes modal
- Suggest button: click opens suggest modal
- Suggest modal: form visible, close button works, backdrop click closes

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
2026-01-04 | 4:58PM EST
———————————————————————
Change: Refresh events data, add verification badges for unverified listings, and display Film Fest labeling in type tags and modal previews.
Files touched: events.html, events-data.js, CHANGELOG_RUNNING.md
Notes: Added optional verification badge logic that links to event URLs when present while keeping verified events unchanged.
Quick test checklist:
- Load events page in list view: unverified Royal Starr mixers show orange badge beside type label; verified events display normally.
- Open the Royal Starr mixer modal: badge appears near the type/status chips and links to the event site; Film Fest label shows for festival types.
- Confirm no console errors on page load after hard refresh.
2026-01-08 | 2:35PM EST
———————————————————————
Change: Replace Short Film Block Party listing with Fresh Coast Film Festival on Resources.
Files touched: resources-data.js
Notes: Added Fresh Coast Film Festival details with website and Instagram.
Quick test checklist:
- Hard refresh Resources page; confirm Fresh Coast Film Festival appears in Film Festivals list
- Open Fresh Coast Film Festival detail view; verify website/Instagram links display
- Console free of errors on Resources page
2026-01-08 | 2:53PM EST
———————————————————————
Change: Move Fiverr, Mandy, and ProductionHub into Tools and add Fresh Coast Film Festival to events data.
Files touched: resources-data.js, events-data.js, CHANGELOG_RUNNING.md
Notes: Reclassified hiring marketplaces under software/tools and logged Fresh Coast Film Festival with dates pending verification.
Quick test checklist:
- Hard refresh Resources page; filter Tools → All Tools and confirm Fiverr, Mandy, ProductionHub appear (not under Community)
- Load Events page; find Fresh Coast Film Festival entry and open modal to confirm date range + Traverse City location display
- Console free of errors on Resources and Events pages
2026-01-08 | 11:33AM EST
———————————————————————
Change: Add Ann Arbor Film Festival, Capital City Film Festival, Dancing Stars Uplifting Film Fest, and Hell’s Half Mile entries; update Fresh Coast Film Festival details for Marquette.
Files touched: resources-data.js, CHANGELOG_RUNNING.md
Notes: Added new festival listings with key timing/location info and refreshed Fresh Coast description.
Quick test checklist:
- Hard refresh Resources page; filter Film Festivals and confirm the new festival cards appear
- Open each new festival detail view; verify website and FilmFreeway links where provided
- Open Fresh Coast Film Festival detail view; confirm Marquette location and October timing
- Console free of errors on Resources page
2026-01-09 | 2:52PM EST
———————————————————————
Change: Speed up Resources subcategory label flicker and align community/stock/tools/reference subcategory options with updated filter logic.
Files touched: resources.html, resources-data.js, CHANGELOG_RUNNING.md
Notes: Added community subcategory filtering support and refreshed subcategory button labels.
Quick test checklist:
- Load Resources page; select Community and click Events/Casting/Groups/Meetups; confirm cards filter and the subfilter label flickers faster.
- Switch Stock/Tools/References tabs; verify subcategory button labels match the requested list and results update.
- Open DevTools console on Resources page; confirm no errors.
2026-01-09 | 4:07PM EST
———————————————————————
Change: Restore Music option in Stock subcategories to keep music filtering available on Resources.
Files touched: resources.html, CHANGELOG_RUNNING.md
Notes: Re-added the Music subcategory button for Stock filters.
Quick test checklist:
- Load Resources page; select Stock and confirm Music appears alongside 3D/Fonts/Footage/SoundFX/All.
- Click Stock → Music and verify music resources are isolated and the list updates.
- Open DevTools console on Resources page; confirm no errors.
