# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

**IMPORTANT:** This changelog MUST be updated with every code change, no matter how small. Before committing or deploying, add an entry documenting what was changed, which files were touched, and how to verify the change works.

2026-01-18 | 10:56PM EST
———————————————————————
Change: Matched callboard submission modal styling to directory form layout
Files touched: callboard.html, CHANGELOG_RUNNING.md
Notes:
1. Restructured the submission modal with header/body/footer sections and form-group layout.
2. Applied dark input styling, custom selects, and optional tag labels to remove white fields.
3. Tuned modal spacing to align with the directory form presentation.
Quick test checklist:
1. Open callboard.html → click "Submit a Listing" and confirm dark inputs/selects match the directory style.
2. Verify form rows align neatly on desktop and stack cleanly on smaller screens.
3. Submit the form (use test values) and confirm success highlight animation still appears.
4. Open DevTools Console on callboard.html and confirm no errors.

2026-01-18 | 10:50PM EST
———————————————————————
Change: Restyled callboard submission form and added success animation polish
Files touched: callboard.html, CHANGELOG_RUNNING.md
Notes:
1. Unified form layout with grid-based rows, uppercase labels, and consistent spacing.
2. Added clean focus states and helper text styling to match site aesthetic.
3. Added a success animation that highlights the modal on completed submission.
Quick test checklist:
1. Open callboard.html → click "Submit a Listing" and confirm the modal layout/labels align with site style.
2. Submit the form (use test values) and confirm success message + modal success animation appears before auto-close.
3. Reopen the modal and confirm the success styling resets.
4. Open DevTools Console on callboard.html and confirm no errors.

2026-01-19 | 3:00AM EST
———————————————————————
Change: Added Supabase setup documentation and edge function for directory submissions
Files touched: SUPABASE_DIRECTORY_SETUP.md, supabase/functions/submit-profile/index.ts, CHANGELOG_RUNNING.md
Notes:
1. Documented SQL schema, RLS policy, and deployment steps for directory submissions.
2. Added submit-profile edge function to insert pending listings and ignore honeypot spam.
Quick test checklist:
1. Open directory.html → Join the Directory and submit a profile (required fields only)
2. In Supabase, confirm a new row appears in directory_listings with status = pending
3. Mark the row approved and refresh directory.html to see the card appear
4. Check DevTools Console for errors on directory.html



2026-01-18 | 9:25PM EST
———————————————————————
Change: Restyled directory submission form with dark theme and success animation
Files touched: directory.html, CHANGELOG_RUNNING.md
Notes:
1. **Form Styling Overhaul** - Completely restyled the "Join Directory" submission modal with dark-themed inputs, proper spacing, and form-group layouts.
2. **Optional Fields** - Made most fields optional (Bio, Other Roles, Credits, Website, Instagram, IMDb). Only Name, Role, Location, and Email are required.
3. **Success Overlay** - Added animated success overlay with checkmark SVG that draws in after submission (replaces old in-form status messages).
4. **UI Improvements** - Added form-label uppercase styling, optional tags, form hints, dark selects with custom arrows, focus states, and mobile-responsive form rows.
Quick test checklist:
1. Open directory.html and click "Join Directory" - verify modal has dark themed inputs
2. Fill only required fields (Name, Role, Location, Email) and submit - verify success overlay appears with animated checkmark
3. Press ESC or click "Got It" to close success overlay
4. Test on mobile - verify form rows stack vertically

2026-01-18 | 9:00PM EST
———————————————————————
Change: Moved "Resources" from Community dropdown to Tools dropdown
Files touched: ideas.html, plan-your-project.html, past-events.html, 404.html, CHANGELOG_RUNNING.md
Notes:
1. **Navigation Reorganization** - "Resources" page is now categorized under "Tools" instead of "Community" site-wide.
2. **Community dropdown** now contains: Events, Callboard, Directory
3. **Tools dropdown** now contains: Resources, Story Generator, Plan
4. **Completed update** - Claude Cowork previously updated 6 files (resources.html, events.html, callboard.html, directory.html, portfolio.html, contact.html); this session completed the remaining 4 files.
Quick test checklist:
1. Open any page and hover/click the Community dropdown - verify Resources is NOT listed
2. Hover/click the Tools dropdown - verify Resources appears first, followed by Story Generator and Plan
3. Verify all dropdown links navigate to the correct pages


2026-01-18 | 12:40PM EST
———————————————————————
Change: Added Campfire animation GIF to event details
Files touched: events-data.js, events.html, task.md, CHANGELOG_RUNNING.md
Notes:
1. **Asset Added**: Added `Campfire.gif` to the "In Motion (Part 2)" event bio.
2. **Logic Update**: Updated `events.html` modal logic to render a `gif` property from the bio data if present.
3. **Styling**: Added CSS to ensure the event bio poster fills the container width (matching the GIF size).
Quick test checklist:
1. Open events.html.
2. Click "In Motion (Part 2)" to open the modal.
3. Verify the flyer and GIF are both full-width and aligned.
———————————————————————
Change: Created Michigan Filmmaker Directory page and submission flow
Files touched: directory.html, task.md, implementation_plan.md, walkthrough.md, CHANGELOG_RUNNING.md
Notes:
1. **New Page** - Created directory.html (cloned/adapted from callboard.html) to serve as a searchable profile directory.
2. **Features**:
   - **Grid View**: Displays profiles with Name, Primary Role, and Location.
   - **Filters**: Role (Director, DP, etc.) and Location (Detroit, Grand Rapids, etc.).
   - **Search**: Client-side filtering by Name, Role, Location, Bio, Tags.
3. **Submission Form**:
   - Added modal with fields: Name, Role, Location, Bio.
   - **New Fields Added**: `Roles Worked` (comma separated) and `Past Work` (text area) per user request.
   - Submits to `submit-profile` endpoint (User action required to create backend).
4. **Detail View**:
   - Helper function creates profile detail modal showing Bio, Links, Email, and the new Credit/Role info.
Quick test checklist:
1. Open directory.html and verify layout loads (empty state if no DB table).
2. Click "Join Directory" and verify new fields (Roles Worked, Past Work) exist.
3. Verify "Back" link and navigation menu work.

2026-01-18 | 11:45AM EST
———————————————————————
Change: Callboard layout refactor and "Filled & Expired" logic
Files touched: callboard.html, CHANGELOG_RUNNING.md
Notes:
1. **Expire Logic**: Listings with `expires_on` date in the past are automatically moved to a "Filled & Expired" section at the bottom.
2. **Layout**: Widened listing cards (min-width 450px) for better readability.
3. **New Fields**: Added `Options Open`, `Options Close`, and `Shooting Dates` to the submission form and detail view.
4. **Compact View**: Listings on main grid show only essential info (Title, Type, Comp, Location, Date); full details (Bio, Contact) reserved for modal.
Quick test checklist:
1. Open callboard.html and verify cards are wider/cleaner.
2. Check "Filled & Expired" section (toggle Show/Hide).
3. Verify "Submit Listing" form includes new Date fields.

———————————————————————
Change: Fixed Callboard listings not displaying - query was using wrong column name
Files touched: callboard.html, CHANGELOG_RUNNING.md
Notes:
1. **Bug Found** - The fetch query used `approved=eq.true` but the Supabase table uses a `status` text column with values: 'pending', 'approved', 'rejected'
2. **Fix** - Changed query from `approved=eq.true` to `status=eq.approved`
3. **Approval Workflow** - Listings are submitted with `status='pending'` by default. To approve a listing, manually change the status to 'approved' in Supabase Table Editor.
Quick test checklist:
1. Open callboard.html and verify approved listings now appear
2. In Supabase, set a listing's status to 'approved' and confirm it shows on the page
3. Listings with status='pending' should NOT appear on the public page

2026-01-18 | 10:55AM EST
———————————————————————
Change: Site-wide mobile navigation consistency - added hamburger menu to all pages
Files touched: resources.html, events.html, contact.html, callboard.html, plan-your-project.html, past-events.html, index.html, CHANGELOG_RUNNING.md
Notes:
1. **Mobile Navigation Audit** - Discovered resources.html and 5 other pages were missing hamburger menu (showing cramped nav links on mobile). Fixed all pages:
   - resources.html - Added hamburger menu (was using horizontal scroll for nav)
   - events.html - Added hamburger menu
   - contact.html - Added hamburger menu
   - callboard.html - Added hamburger menu
   - plan-your-project.html - Added hamburger menu
   - past-events.html - Added hamburger menu
2. **index.html Mobile Menu Fix** - Changed mobile menu background from `rgba(0,0,0,0.98)` to solid `#000000` to prevent hero content bleeding through
3. Each page now has:
   - Hamburger button with ARIA attributes
   - `.menu-toggle` CSS with animated X transformation
   - Mobile media query (768px) showing hamburger, hiding default nav-links
   - Slide-out panel from right (300px max-width, solid black background)
   - JavaScript toggle with touch debounce, click-outside-to-close
Quick test checklist:
1. Open each page on mobile (<768px) and verify hamburger icon appears
2. Tap hamburger - menu should slide in from right with solid black background
3. Verify no content bleeds through menu panel
4. Tap a link or outside menu - should close
5. Test on touch device to verify no double-tap issues

2026-01-18 | 5:00AM EST
———————————————————————
Change: Added mobile hamburger menu to portfolio.html
Files touched: portfolio.html, CHANGELOG_RUNNING.md
Notes:
1. **Mobile Navigation** - Portfolio page was missing hamburger menu for mobile (was showing all nav links cramped at top). Added:
   - Hamburger button HTML with proper ARIA attributes
   - `.menu-toggle` CSS (base styles + animated X transformation)
   - Mobile media query (768px) to hide nav-links and show hamburger
   - Slide-out menu panel with backdrop blur
   - JavaScript toggle function with touch device debounce
   - Click-outside-to-close behavior
Quick test checklist:
1. Open portfolio.html on mobile (or resize to <768px)
2. Verify hamburger icon appears instead of cramped nav links
3. Tap hamburger - menu should slide in from right
4. Tap a link or outside menu - should close
5. Verify no double-tap issues on touch devices

2026-01-18 | 4:20AM EST
———————————————————————
Change: Site-wide improvements - favicons, 404 page, performance optimizations
Files touched: All HTML files, favicon.ico, images/apple-touch-icon.png, images/favicon-192.png, images/favicon-512.png, 404.html, images/Lookout.jpg, images/TrailDead.jpg, images/Framesnfabricflyer.JPG, CHANGELOG_RUNNING.md
Notes:
1. **Favicons** - Created favicon.ico (32x32), apple-touch-icon.png (180x180), favicon-192.png, favicon-512.png from WhiteBeakerLogo.png with black background. Added favicon references to all 9 HTML pages.
2. **404 Page** - Created custom 404.html with "Signal Lost" theme matching site's retrofuturistic design.
3. **Mobile Nav Fix** - Fixed double-firing issue on touch devices in index.html by adding touch event debounce.
4. **Lazy Loading** - Added `loading="lazy"` to all footer social icons across all pages.
5. **Image Optimization** - Resized/compressed large images:
   - Lookout.jpg: 1.9MB → 570KB (1920px width)
   - TrailDead.jpg: 910KB → 260KB (1920px width)
   - Framesnfabricflyer.JPG: 622KB → 435KB (quality optimization)
Quick test checklist:
1. Open any page and verify favicon appears in browser tab
2. Visit /404.html and verify styled error page displays
3. Test mobile nav toggle on touch device (should not double-fire)
4. Check DevTools Network tab to verify optimized image sizes

2026-01-18 | 3:15AM EST
———————————————————————
Change: Improved categorization for Drone resources.
Files touched: resources-data.js, CHANGELOG_RUNNING.md
Notes: Updated BetaFPV, DJI, GetFPV, RaceDayQuads, Pyrodrone to `droneType: 'stores'`. Updated Mr Steele to `droneType: 'channels'`.

2026-01-18 | 3:00AM EST
———————————————————————
Change: Added new Drone Channels and corrected Bardwell categorization.
Files touched: resources-data.js, CHANGELOG_RUNNING.md
Notes: Added "Botgrinder" and "Captain Drone" to resources. Updated "Joshua Bardwell" `droneType` from 'channel' to 'channels' to match filter logic.

2026-01-18 | 12:55AM EST
———————————————————————
Change: Fixed default filtering state for Music and Drones resources.
Files touched: resources.html, CHANGELOG_RUNNING.md
Notes: Changed `musicTier` and `droneType` defaults from 'paid'/'part107' to 'all' to ensure all resources are visible by default. Updated subfilter logic to persist 'all' state.

2026-01-18 | 12:12AM EST
———————————————————————
Change: Increased mobile background opacity for The Pandys section to improve visibility.
Files touched: portfolio.html, CHANGELOG_RUNNING.md
Notes: Increased `#pandys::before` opacity from 0.22 to 0.5 on mobile to punch through the purple gradient overlay.

2026-01-17 | 5:12PM EST
———————————————————————
Change: Restored missing drone and software resources from backup and ensured all items have unique IDs.
Files touched: resources-data.js, CHANGELOG_RUNNING.md
Notes: 
1. **resources-data.js** - Restored full 127-item database from backup (Drones, AI, Sound FX, Equipment, etc.).
2. **resources-data.js** - Generated unique slug-based IDs for all restored items to support filtering and favorites.
3. **resources-data.js** - Merged recently added "non-local" badges for Horror Hotel.

2026-01-17 | 1:45PM EST
Files touched: events.html, events-data.js, resources-data.js, resources.html, CHANGELOG_RUNNING.md
Notes:
1. **events.html** - Moved Events Posters section below the featured announcement and above the calendar.
2. **events.html** - Added mobile media query (max-width 640px) to shrink posters into a compact 2-column grid.
3. **events-data.js** - Fully updated "In Motion (Part 2)" event with specific location, Nat Anderson guest bio, and detailed description.
4. **events.html** - Added Campfire Film Cooperative to resourceBioLookup for series context.
5. **portfolio.html** - Increased mobile background opacity for #pandys (0.12 -> 0.22) and #artist (0.12 -> 0.18) to ensure they aren't lost in the dark purple/black backgrounds on mobile.
6. **resources-data.js** - Updated Horror Hotel Film Festival with 15th Anniversary details, FilmFreeway link, and Middleburg Heights location.
7. **resources-data.js** - Added `nonLocal: true` and `locationBadge: 'Northern Ohio'` to Horror Hotel.
8. **resources.html** - Added CSS for `.badge-non-local` and `.badge-northern-ohio`. Updated `generateBadges` to automatically inject these badges for any resource with those data properties.
Quick test checklist:
1. Open events.html on mobile and confirm posters appear in 2-column grid.
2. Click "In Motion" poster and verify Nat Anderson bio and full address in modal.
3. Open resources.html, search for "Horror Hotel", and verify "NON-LOCAL" and "NORTHERN OHIO" badges appear.
4. Open portfolio.html on mobile and verify "The Pandys" background texture is visible.
5. Open DevTools console and verify no errors.

2026-01-17 | 2:15AM EST
———————————————————————
Change: Cleaned up unused large asset backups
Files touched: images/BrassShoot.jpeg (deleted), images/BrassShoot2_ORIGINAL_49MB.png (deleted), images/Pandys_ORIGINAL_17MB.png (deleted), CHANGELOG_RUNNING.md
Notes: Removed ~68MB of unused/legacy assets that were replaced by optimized JPG versions.
Quick test checklist:
1. Open portfolio.html and confirm Anthony Brass and The Pandys sections still load images correctly (now using .jpg)
2. Open DevTools console and verify no 404 errors for images

2026-01-17 | 12:55AM EST
———————————————————————
Change: Significantly reduced event poster sizes and added Campfire Film poster
Files touched: events-data.js, events.html, CHANGELOG_RUNNING.md
Notes:
1. **events-data.js** - Added Campfire Film (Feb 19) poster entry with CampFireFilm0219.JPG to eventsPosterData array
2. **events.html** - Reduced poster grid from minmax(180px, 1fr) to minmax(120px, 1fr) and gap from 1.5rem to 1rem
3. **events.html** - Changed poster-image from aspect-ratio: 3/4 to max-height: 180px constraint
4. **events.html** - Reduced poster-meta padding from 1rem 1.1rem 1.25rem to 0.75rem 0.9rem 1rem
Quick test checklist:
1. Open events.html and confirm both Frames & Fabrics and Campfire Film posters display side by side in small cards
2. Verify posters are compact (approx 120-140px wide × 180px max tall) without requiring excessive scroll
3. Click poster cards and confirm modal opens with poster at 240px max width
4. Open DevTools console on events.html and verify no errors

2026-01-17 | 12:45AM EST
———————————————————————
Change: Restored events posters section and reduced poster sizes
Files touched: events-data.js, events.html, CHANGELOG_RUNNING.md
Notes:
1. **events-data.js** - Added eventsPosterData array with Frames & Fabrics event poster entry (images/Framesnfabricflyer.JPG)
2. **events.html** - Reduced poster card grid size from minmax(240px, 1fr) to minmax(180px, 1fr)
3. **events.html** - Reduced modal poster size from min(320px, 100%) to min(240px, 100%)
Quick test checklist:
1. Open events.html and confirm Events Posters section displays above calendar with Framesnfabricflyer.JPG visible
2. Open events.html and confirm poster cards are smaller (approximately 180-220px wide on desktop)
3. Click a poster card and confirm modal opens with poster at reasonable size (max 240px wide)
4. Open DevTools console on events.html and verify no errors

2026-01-17 | 12:15AM EST
———————————————————————
Change: Documentation overhaul, MOZ mobile fix, and SEO updates
Files touched: CLAUDE.MD, AGENTS.md, README.md, robots.txt, sitemap.xml, portfolio.html, CHANGELOG_RUNNING.md
Notes:
1. **CLAUDE.MD** - Added Callboard page to key pages list, added Supabase integration section (CSP requirements, form patterns, honeypot fields), added callboard page rules, updated regression checklist, expanded quick reference with all pages and data files.
2. **AGENTS.md** - Added Supabase integration section, added callboard.html page ownership rules, updated regression checklist with callboard checks, updated free tier tools list.
3. **README.md** - Complete rewrite from 3-line placeholder to full project overview with features, tech stack, local focus, contributor docs, and zero-budget philosophy.
4. **robots.txt** - Added descriptive comments and Disallow for 404.html.
5. **sitemap.xml** - Added callboard.html entry (priority 0.75, weekly changefreq).
6. **portfolio.html** - Fixed MOZ mobile layout: Added flex column display to #moz section, proper order values for masthead/section-inner/pull-quote/photo-credit, z-index layering, adjusted spacing and typography for clean vertical stack on mobile.
Quick test checklist:
1. Open portfolio.html on mobile (375px width), scroll to MOZ section - verify logo, video, info card, pull quote, and photo credit stack cleanly without overlap
2. Open callboard.html and verify nav includes Callboard link, form opens and has all fields
3. View sitemap.xml and confirm callboard.html entry exists
4. Open DevTools console on portfolio.html and callboard.html - verify no errors

2026-01-16 | 11:30PM EST
———————————————————————
Change: Major asset optimization and CSS consolidation
Files touched: prototype-theme.css, images/BrassShoot2.png→.jpg, images/Pandys.png→.jpg, CHANGELOG_RUNNING.md
Notes:
1. **Image compression** - BrassShoot2.png (49MB) → BrassShoot2.jpg (392KB), Pandys.png (17MB) → Pandys.jpg (262KB). Original PNGs renamed with _ORIGINAL suffix for backup. Total savings: ~65MB.
2. **CSS consolidation** - Added non-prefixed color variables (--black, --white, --gray-*, --lab-orange, --lab-green, --lab-purple, --accent-blue) to prototype-theme.css. Added base reset (*, body) and site navigation styles (nav, .site-nav, .nav-logo, .nav-back, .nav-links) to eliminate duplication across HTML files.
3. **Callboard nav** - Verified Callboard link exists in all main page navs (index, resources, ideas, events, past-events, portfolio, plan-your-project, contact). 404 keeps simplified nav as intended.
Quick test checklist:
1. Open portfolio.html and confirm BrassShoot2/Pandys images load correctly (now JPG format)
2. Open any page and confirm styles still apply correctly (variables now coming from theme file)
3. Confirm nav links work and include Callboard on all main pages
4. Open DevTools console on index.html and resources.html and verify no errors

2026-01-16 | 9:45PM EST
———————————————————————
Change: Reorganized events page layout to display Calendar, List, and Events Posters as 3-column grid with equal heights
Files touched: events.html, CHANGELOG_RUNNING.md
Notes: Moved Events Posters section from standalone block to third column in events-split grid. Updated grid columns from 2-column to 3-column layout (Calendar | List | Posters). All three panes now share same max-height (70vh) with independent scrolling. Poster grid changed to single column for better fit in narrower pane. Mobile remains single-column stack.
Quick test checklist:
1. Open events.html on desktop and confirm Calendar, List, and Events Posters appear side-by-side in 3 equal-height columns
2. Verify all three sections end at the same height and can scroll independently if content exceeds viewport
3. Open events.html on mobile width and confirm all three sections stack vertically without overlap
4. Open DevTools console on events.html and verify no errors

2026-01-16 | 7:13PM EST
———————————————————————
Change: Refined mobile layout fixes on the portfolio page, aligned callboard navigation with the main site, and unified footer layout/placement across resources, ideas, events, plan, and contact.
Files touched: portfolio.html, resources.html, ideas.html, events.html, plan-your-project.html, contact.html, callboard.html, CHANGELOG_RUNNING.md
Notes: Updated MOZ mobile stacking, swapped Lookout mobile order, expanded Trail Dead mobile coverage, moved footer social icons left on resources, and matched footer layout across key pages with consistent nav styling.
Quick test checklist:
1. Open portfolio.html on a mobile viewport, confirm MOZ stacks cleanly, Trail Dead fills the screen without clipped edges, and Lookout shows video before text so background faces stay visible.
2. Open resources.html and confirm the Instagram icon sits on the far left of the footer; verify layout spacing remains balanced at desktop and mobile widths.
3. Open ideas.html, events.html, plan-your-project.html, and contact.html to confirm footer layout matches resources and icons are left-aligned on desktop, centered on mobile.
4. Open callboard.html and confirm the top navigation uses the full link row matching other pages.
5. Open DevTools console on portfolio.html, resources.html, and callboard.html to verify no errors.

2026-01-16 | 6:20PM EST
———————————————————————
Change: Added a contextual hot tip panel to resources, tuned mobile layouts on portfolio sections, and paused videos when scrolling away.
Files touched: resources.html, portfolio.html, CHANGELOG_RUNNING.md
Notes: Removed footer "Start a Project" CTAs on resources/portfolio, added dynamic section tips on resources, and refined mobile layout rules for MOZ/Trail Dead/Lookout while pausing videos on section exit.
Quick test checklist:
1. Open resources.html, switch between categories/subfilters, and confirm the hot tip text updates with each section.
2. Open portfolio.html on mobile width, confirm MOZ layout stacks cleanly, Trail Dead video fills the frame, and Lookout shows info above video so the background faces are visible.
3. Play a portfolio video, scroll to the next/previous section, and confirm the video pauses.
4. Open DevTools console on resources.html and portfolio.html and verify no errors.

2026-01-16 | 5:19PM EST
———————————————————————
Change: Softened the Anthony Brass overlay and muted the Lookout color wash to a darker, greener palette.
Files touched: portfolio.html, CHANGELOG_RUNNING.md
Notes: Reduced the white overlay opacity on Anthony Brass and adjusted Lookout gradients to be less intense.
Quick test checklist:
1. Open portfolio.html and confirm the Anthony Brass overlay is lighter without washing out the background.
2. Scroll to Lookout and confirm the color wash is darker/greener and still readable.
3. Open DevTools console on portfolio.html and verify no errors.

2026-01-16 | 5:13PM EST
———————————————————————
Change: Updated Supabase submission pages to allow the Supabase endpoint in CSP connect-src.
Files touched: callboard.html, events.html, CHANGELOG_RUNNING.md
Notes: Reformatted the CSP meta tags while keeping the same directives plus the Supabase endpoint.
Quick test checklist:
1. Open callboard.html, submit a listing, and confirm the request reaches Supabase without CSP errors.
2. Open events.html, submit an event, and confirm the request reaches Supabase without CSP errors.
3. Open DevTools console on callboard.html and events.html and verify no CSP errors.

2026-01-16 | 4:12PM EST
———————————————————————
Change: Added the Callboard page with Supabase-powered listings, filters, and a moderated submission modal.
Files touched: callboard.html, CHANGELOG_RUNNING.md
Notes: New callboard page reads approved listings and posts submissions to the submit-listing edge function with a honeypot field and friendly status messaging.
Quick test checklist:
1. Open callboard.html and confirm approved listings load with filters and search.
2. Click “Submit a Listing,” fill the form, and confirm the success message “Submitted for approval.” appears.
3. Trigger a network failure or block the endpoint and confirm the form shows a friendly error without console noise.
4. Open DevTools console on callboard.html and verify no errors.

2026-01-16 | 9:50AM EST
———————————————————————
Change: Restored the missing events data file so the calendar, list, past events, and export flow can render again.
Files touched: events-data.js, CHANGELOG_RUNNING.md
Notes: Recreated the events dataset with Metro Detroit-only entries (future and past) so the events UI can render and modal/export features can function.
Quick test checklist:
1. Open events.html and confirm calendar/list populate with event pills and rows.
2. Click a list row and confirm the event modal opens with details and Add to Calendar button for future events.
3. Toggle “Show Past” and confirm past events render in the archive grid and open the modal on click.
4. Click “Add to Calendar” on a future event and confirm an .ics file downloads.
5. Open past-events.html and confirm past events render.
6. Open DevTools console on events.html and past-events.html and verify no errors.

2026-01-16 | 2:14PM EST
———————————————————————
Change: Tuned mobile portfolio styling for the MOZ section and lightened mobile backgrounds for Trail Dead and Lookout.
Files touched: portfolio.html, CHANGELOG_RUNNING.md
Notes: Added mobile spacing and logo sizing adjustments for MOZ, plus increased mobile background image visibility for Trail Dead and Lookout.
Quick test checklist:
1. Open portfolio.html on a phone-sized viewport and scroll to the MOZ section; confirm the logo, video, and info card stack cleanly without the nav overlapping.
2. On the same viewport, check Trail Dead and Lookout sections; confirm the background art is more visible while text remains readable.
3. Open DevTools console on portfolio.html and verify no errors.

2026-01-16 | 1:32PM EST
———————————————————————
Change: Made the DFA partnership callout open an on-page modal with full details and tuned the DFA resource bio image metadata.
Files touched: index.html, resources-data.js, CHANGELOG_RUNNING.md
Notes: The DFA callout on the homepage is now fully clickable and opens a modal with details, image, and close behavior instead of navigating away.
Quick test checklist:
1. Open index.html and click anywhere on the DFA callout tile; confirm a modal opens with image, details, and a close button.
2. Click the backdrop or press ESC to close the modal, then confirm focus returns to the callout tile.
3. Open resources.html and open the Detroit Filmmaker Awards modal; confirm the DFA image appears in the bio panel.
4. Open DevTools console on both pages and verify no errors.
