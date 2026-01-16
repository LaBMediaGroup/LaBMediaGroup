# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

**IMPORTANT:** This changelog MUST be updated with every code change, no matter how small. Before committing or deploying, add an entry documenting what was changed, which files were touched, and how to verify the change works.

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
