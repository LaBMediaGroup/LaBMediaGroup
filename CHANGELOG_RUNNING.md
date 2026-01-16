# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

**IMPORTANT:** This changelog MUST be updated with every code change, no matter how small. Before committing or deploying, add an entry documenting what was changed, which files were touched, and how to verify the change works.

2026-01-16 | 9:22PM EST
———————————————————————
Change: Added clearer submission feedback on forms, fixed Events poster image, corrected Plan page footer nav duplication, and darkened Anthony Brass overlay.
Files touched: events-data.js, events.html, callboard.html, resources.html, plan-your-project.html, portfolio.html, CHANGELOG_RUNNING.md
Notes:
1. Added animated status messaging for Callboard, Events, and Resources form submissions to make success/error states obvious.
2. Updated the Frames & Fabrics poster to use the correct JPG asset.
3. Replaced the Plan Your Project footer nav element to stop the fixed header duplication.
4. Adjusted the Anthony Brass overlay/shadow to a darker, woodier tone.
Quick test checklist:
1. Open events.html → Submit Event → verify “Sending…” status animation, then “Submitted for review,” and modal closes after a short delay.
2. Open callboard.html → Submit a Listing → verify status message animates and confirms submission.
3. Open resources.html → Suggest a Resource → verify sending state and success confirmation animation before auto-close.
4. Open events.html → Posters → confirm Frames & Fabrics poster image loads.
5. Open plan-your-project.html → verify only one header nav appears and links are clickable.
6. Open portfolio.html → Anthony Brass section → confirm darker overlay and less floaty video card styling.
7. Open DevTools console on events.html, callboard.html, resources.html, plan-your-project.html, and portfolio.html → confirm no errors.

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
