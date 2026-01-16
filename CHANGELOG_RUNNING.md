# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

**IMPORTANT:** This changelog MUST be updated with every code change, no matter how small. Before committing or deploying, add an entry documenting what was changed, which files were touched, and how to verify the change works.

2026-01-16 | 5:57PM EST
———————————————————————
Change: Added extra fields to event submissions and fixed callboard modal focus handling.
Files touched: events.html, callboard.html, CHANGELOG_RUNNING.md
Notes: Event submissions now include name/url fields and surface API errors; callboard closes without aria-hidden focus warnings.
Quick test checklist:
1. Submit an event in events.html and confirm it no longer returns a 400 error.
2. Open and close the callboard modal, then confirm no aria-hidden warnings appear in DevTools.
3. Verify the callboard modal focuses the first field on open.

2026-01-16 | 5:45PM EST
———————————————————————
Change: Added a suggest shortcut on resources and tightened event submission payloads.
Files touched: resources.html, events.html, CHANGELOG_RUNNING.md
Notes: The quick filter row now includes a Suggest button and event submissions send normalized optional fields plus source.
Quick test checklist:
1. Open resources.html and click Suggest to confirm the modal opens.
2. Submit a test event on events.html and confirm it completes without a 400 error.
3. Open DevTools console on resources.html and events.html and verify no errors.

2026-01-16 | 5:30PM EST
———————————————————————
Change: Added a Callboard link to the main navigation across key pages.
Files touched: index.html, resources.html, events.html, ideas.html, plan-your-project.html, portfolio.html, contact.html, past-events.html, CHANGELOG_RUNNING.md
Notes: Kept the nav link minimal to avoid clutter while making the callboard discoverable.
Quick test checklist:
1. Open index.html and confirm the Callboard link appears in the nav.
2. Click the Callboard link from a few pages (resources, events) and confirm it opens callboard.html.
3. Open DevTools console on one updated page and verify no errors.

2026-01-16 | 5:25PM EST
———————————————————————
Change: Routed resource suggestions through Supabase instead of mailto and allowed the endpoint in the CSP.
Files touched: resources.html, CHANGELOG_RUNNING.md
Notes: The suggest modal now posts to the submit-resource function and shows the review success state.
Quick test checklist:
1. Open resources.html, submit a suggestion, and confirm the success message appears.
2. Verify the suggestion submits without CSP errors in DevTools.
3. Refresh resources.html, reopen the modal, and ensure the form resets properly.

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
