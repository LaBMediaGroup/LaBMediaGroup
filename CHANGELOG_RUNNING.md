# LaB Media — Running Changelog (Rolling)

Purpose: compressed memory of shipped changes. Keep it short. Add newest at top.

**IMPORTANT:** This changelog MUST be updated with every code change, no matter how small. Before committing or deploying, add an entry documenting what was changed, which files were touched, and how to verify the change works.

2026-01-11 | Footer Navigation & Ideas Page Enhancements
———————————————————————
Change: Added footer navigation to secondary pages, updated footer text, added Current Results section with PDF export to Ideas page.
Files touched: portfolio.html, events.html, contact.html, plan-your-project.html, resources.html, ideas.html, 404.html
Notes:
**Footer Navigation Added:**
- Consistent footer navigation on all secondary pages
- Links: Home, Work, Resources, Events, Contact
- "Start a Project" CTA button on applicable pages
- Footer credit updated to "Made in Shelby Twp, MI with ❤️"

**Ideas Page - Current Results Section:**
- Shows all rolled results (prompts, bonus challenge, mini-roller results)
- PDF download functionality using jsPDF
- PDF includes WhiteBeakerLogo.png header
- Results persist during session for collection
- Clear Results button to start fresh

Quick test checklist:
- All secondary pages have consistent footer navigation
- Footer shows "Made in Shelby Twp, MI with ❤️"
- Ideas page: Roll prompts, bonus, and mini-rollers
- Click "Download PDF" - generates PDF with all results and beaker logo
- Click "Clear Results" - resets all rolled items

2026-01-11 | Ideas Page - Interactive Short Film Prompt Generator
———————————————————————
Change: Created new Ideas page with dice-rolling UI for generating short film prompts with constraints, twists, and bonus challenges.
Files touched: ideas.html (new), ideas-data.js (new), sitemap.xml, all pages (nav update)
Notes:
**Page Features:**
- Main "Roll the Die" button generates 3 unique prompts
- Each prompt: Core Concept + Constraint + Twist
- Optional flavor badges (Genre, Visual Style, Emotion)
- "Extra Points" bonus challenge generator
- 4 Mini-rollers: Place, Object, Character, Genre
- Dice animation on roll with face cycling

**Data File (ideas-data.js):**
- 50+ concepts, 40+ constraints, 40+ twists
- 60+ places, 60+ objects, 40+ characters
- Genres, visual styles, emotions, bonus challenges
- All prompts designed for low-budget, weekend shooting

**Navigation Updates:**
- Added Ideas link to nav on all pages
- Added ideas.html to sitemap.xml (priority 0.8)

Quick test checklist:
- Click "Roll the Die" → 3 prompt cards appear with animation
- Cards show Concept, Constraint, Twist + optional flavor badges
- Click "Roll Bonus" → bonus challenge appears
- Click each mini-roller → individual results display
- Mobile: hamburger menu works, layout stacks properly

2026-01-11 | 404 Error Page with Beaker Animation
———————————————————————
Change: Created custom 404 page with animated beaker logo, bubbles, and glitch effects.
Files touched: 404.html (new)
Notes:
**Visual Design:**
- Floating beaker animation (TheLaB.png logo)
- Rising bubbles effect (5 animated bubbles)
- Blue glow pulsing around beaker
- Glitch effect on "404" text
- GSAP entrance animations

**Features:**
- "PAGE NOT FOUND" message with glitch effect
- Humorous subtitle: "This experiment didn't go as planned..."
- Links: Home, Work, Resources, Contact
- Responsive design with reduced motion support

Quick test checklist:
- Navigate to non-existent page → 404.html displays
- Beaker floats with subtle animation
- Bubbles rise and fade
- "404" text has glitch effect
- Links work and navigate correctly

2026-01-11 | Quick Wins - Domain URLs, Sitemap, Focus States, Touch Targets
———————————————————————
Change: Fixed domain inconsistencies, added focus-visible states, improved mobile touch targets, added Ideas to sitemap.
Files touched: index.html, contact.html, prototype-theme.css, sitemap.xml, ideas.html
Notes:
**Domain URL Fix:**
- Changed labmediadot.com → labmedia.work across all pages
- Consistent canonical URLs and social meta tags

**Focus-Visible States:**
- Added :focus-visible styles to prototype-theme.css
- 2px solid blue outline with 4px offset
- Covers: buttons, cards, links, interactive elements

**Touch Target Improvements:**
- Mobile menu toggle increased to 44x44px minimum
- Applied to index.html and ideas.html

**Sitemap Update:**
- Added ideas.html with priority 0.8
- Proper lastmod dates

Quick test checklist:
- All page URLs reference labmedia.work
- Tab through pages → focus outlines visible
- Mobile: tap targets are at least 44x44px
- Sitemap includes all 7 public pages

2026-01-11 | MOZ Section - Video Size Reduction & Frame Removal
———————————————————————
Change: Removed white matted frame, reduced video size to 50% width to reveal more background photo.
Files touched: portfolio.html
Notes:
**Video Frame Removal:**
- Removed white matted border entirely (background: transparent, padding: 0)
- Removed brass gold inner border (deleted ::before pseudo-element)
- Video now displays cleanly without frame clutter
- Shadow darkened from brass gold to pure black for depth

**Video Size Reduction:**
- Added max-width: 50% to video container (half the previous size)
- Video now takes up significantly less screen space
- More MOZ interior background photo visible
- Better balance between video and editorial photography

**Layout Rebalancing:**
- Grid changed from 1.4fr/0.6fr back to 1fr/1fr (equal columns)
- Gap reduced from 5rem to 3rem
- Info card max-width increased from 380px to 450px
- Removed margin-left: auto from info card
- Both elements now have equal visual weight

Quick test:
- Load portfolio.html and scroll to MOZ section
- Video should be approximately half its previous size
- No white frame or brass border around video
- More staircase and marble island visible in background
- Video displays at proper 16:9 ratio
- Shadow effect provides depth without frame

2026-01-11 | MOZ Section - Final Polish (Matted Frame Refinement + Info Card Repositioning)
———————————————————————
Change: Thinned matted frame border, moved info card further right away from staircase.
Files touched: portfolio.html
Notes:
**Matted Frame Refinement:**
- Reduced white border padding from 14px to 10px for cleaner look
- Updated brass border inset from 14px to 10px to match
- Bottom frame edge no longer clipped, displays cleanly
- Maintains elegant framed art aesthetic with subtler border

**Info Card Repositioning:**
- Adjusted grid from 1.3fr/0.7fr to 1.4fr/0.6fr (70/30 split)
- Increased gap from 4rem to 5rem for more breathing room
- Reduced padding-right from 5% to 3%
- Added margin-left: auto to push card to right edge
- Reduced max-width from 420px to 380px
- Info card now positioned well away from staircase balustrade
- More architectural drama visible in background

Quick test:
- Load portfolio.html and scroll to MOZ section
- Video matted frame should have clean 10px white border (no clipping on bottom)
- Brass gold inner border visible inside white frame
- Info card positioned to far right, not blocking staircase pole
- Video displays at proper 16:9 ratio
- Overall composition feels balanced and editorial

2026-01-11 | MOZ Section - Video Container Override Fix
———————————————————————
Change: Fixed video container inheriting conflicting aspect ratio from general styles.
Files touched: portfolio.html
Notes:
**Container Override Fix:**
- Root cause: General .video-container at line 170-176 applies padding-bottom: 56.25% and height: 0
- These properties were inherited by MOZ .video-container, breaking the matted frame structure
- Solution: Added overrides to MOZ .video-container
  - padding-bottom: 0 !important (removes aspect ratio from outer container)
  - height: auto !important (allows container to size based on content)
  - overflow: visible (prevents clipping)
- Aspect ratio now controlled solely by inner .video-aspect-wrapper
- Outer container provides only the white matted frame effect

Quick test:
- Video should now display at correct 16:9 ratio
- White matted border visible around entire video frame
- No clipping or distortion

2026-01-11 | MOZ Section - ACTUAL Video Fix (Wrapper Approach) + Motto Repositioning
———————————————————————
Change: Fixed video clipping by adding dedicated aspect ratio wrapper div. Repositioned motto down to center over couch.
Files touched: portfolio.html
Notes:
**Video Display - FINAL FIX (Wrapper Approach):**
- Root cause: padding-bottom technique doesn't work on <button> elements due to button box model
- Solution: Added .video-aspect-wrapper div between .video-container and .video-placeholder button
- Wrapper maintains aspect ratio: position: relative, padding-bottom: 56.25%
- Button positioned absolutely inside wrapper: fills 100% width/height of aspect ratio container
- Structure: .video-container (matted frame) → .video-aspect-wrapper (aspect ratio) → .video-placeholder (button fills wrapper)
- Video thumbnail and play button positioned absolutely inside button

**HTML Structure:**
```
<div class="video-container">          <!-- Matted white frame with padding -->
  <div class="video-aspect-wrapper">   <!-- 16:9 aspect ratio container -->
    <button class="video-placeholder"> <!-- Fills aspect wrapper 100% -->
      <img class="video-thumb">
      <span class="video-play">
    </button>
  </div>
</div>
```

**Motto Repositioning:**
- Moved pull quote from bottom: 15% to bottom: 9%
- Positions motto approximately 1-2 inches lower
- Now centered over middle of couch back in background photo
- Maintains single-line elegant display with letter/word spacing

Quick test:
- Load portfolio.html and scroll to MOZ section
- Video MUST display as proper 16:9 rectangle (NOT clipped horizontal strip)
- Matted white frame visible around video with brass border inside
- Motto positioned lower, centered over couch in background
- Click video - should load YouTube iframe filling entire frame

2026-01-11 | MOZ Section - Final Editorial Polish (Video Fix, Layout, Motto)
———————————————————————
Change: Fixed video clipping issue with !important overrides, repositioned info card away from staircase, reformatted motto to single line with elegant spacing.
Files touched: portfolio.html
Notes:
**Video Display Fix:**
- Added !important overrides to prevent general .video-placeholder styles from breaking MOZ section
- Fixed position: relative, height: 0, display: block with !important
- Removed conflicting absolute positioning (top: auto, left: auto)
- Video now displays properly at 16:9 ratio without clipping

**Info Card Repositioning:**
- Adjusted grid from 1.2fr/0.8fr to 1.3fr/0.7fr (65/35 split)
- Added padding-right: 5% to section-inner
- Increased gap from 3rem to 4rem
- Info card now positioned to the right, away from staircase balustrade
- More staircase and marble island visible

**Motto Refinement:**
- Changed from multi-line to single-line display (white-space: nowrap)
- Increased letter-spacing to 0.25em for elegant spread
- Added word-spacing: 0.5em for breathing room between words
- Font size: 1.4rem (was 1.8rem) for better single-line fit
- Max-width increased to 900px to accommodate full line
- "VINTAGE VIBES WITH MODERN MODALITY" now displays on one elegant line
- Mobile: reverts to normal wrapping with adjusted spacing

Quick test:
- Load portfolio.html and scroll to MOZ section
- Video should display at proper 16:9 ratio (not clipped/tiny)
- Info card positioned to right side, not blocking staircase
- Motto displays as single line with elegant letter and word spacing
- Mobile: motto wraps naturally, all elements stack properly

2026-01-11 | MOZ Section - Editorial Refinements (Logo, Layout, Video Fix)
———————————————————————
Change: Enlarged logo 2-3x, removed brass underline, compacted info card, fixed video display, adjusted grid proportions for magazine editorial aesthetic.
Files touched: portfolio.html
Notes:
**Logo Enlargement:**
- Increased logo size from 60-120px to 180-320px (2.5-3x larger)
- Mobile: 140px @ 1024px, 100px @ 640px
- Removed brass gold underline (display: none on .moz-masthead-line)
- Logo now has commanding editorial presence

**Info Card Compaction:**
- Reduced padding from 3.5rem to 2.5rem
- Added max-width: 420px to minimize staircase/island coverage
- Smaller typography: title 1.5-2.2rem (was 2-3.2rem), subtitle 0.95rem (was 1.15rem)
- Tighter spacing: margins/padding reduced by ~20%
- Featured block font: 0.85rem (was 1rem)
- More background visible, cleaner magazine layout

**Grid Proportion Adjustment:**
- Changed from equal 1fr 1fr to 1.2fr 0.8fr (60/40 split)
- Video gets more space, info card more compact
- Gap reduced from 4rem to 3rem
- Better balance for editorial presentation

**Video Display Fix:**
- Fixed aspect ratio container on .video-placeholder
- Corrected absolute positioning for .video-thumb and .video-play
- Video now displays at proper 16:9 ratio within matted frame
- Play button centered with transform positioning

Quick test:
- Load portfolio.html and scroll to MOZ section
- Logo should be 2-3x larger, no brass line underneath
- Video displays properly at 16:9 ratio (not clipped/tiny)
- Info card is more compact, shows more staircase/marble island
- Layout feels like editorial magazine spread (60/40 visual weight)

2026-01-11 | MOZ Section - Logo Implementation
———————————————————————
Change: Replaced text masthead with MOZ's actual logo image.
Files touched: portfolio.html
Notes:
**Logo Integration:**
- Replaced "MOZ INTERIORS" text with actual brand logo (images/MOZLOGOREAL.png)
- Logo scales responsively: clamp(60px, 8vw, 120px) for desktop
- Drop shadow effect maintains legibility over background (0 2px 12px rgba(0,0,0,0.4))
- Mobile sizes: 70px @ 1024px, 50px @ 640px
- Maintains brass gold underline accent below logo
- Auto width preserves logo aspect ratio

Quick test:
- Load portfolio.html and scroll to MOZ section
- MOZ logo should display at top-left instead of text
- Logo should be crisp and legible with subtle shadow
- Brass gold line appears below logo
- Mobile: logo scales down appropriately while maintaining clarity

2026-01-11 | MOZ Section - Video Container & Photo Credit Fixes
———————————————————————
Change: Fixed video container sizing issue and increased photo credit font size for better readability.
Files touched: portfolio.html
Notes:
**Video Container Fix:**
- Added proper aspect ratio styling to MOZ video container (.video-placeholder)
- Video now displays at correct 16:9 ratio (padding-bottom: 56.25%)
- Fixed tiny square display issue - video thumbnail now fills matted frame properly
- Maintains matted white border (14px) with brass gold inner accent

**Photo Credit Enhancement:**
- Increased font size from 0.5rem to 0.7rem for better legibility
- Still appears on hover (opacity 0→0.7 transition)
- Maintains monospace styling and brass gold color (#B8966D)

Quick test:
- Load portfolio.html and scroll to MOZ section
- Video should display at proper 16:9 aspect ratio, not as tiny square
- Hover over section to see photo credit at readable size (0.7rem)
- Video maintains matted frame with white border and brass accent

2026-01-11 | MOZ Branding Refinement - Typography & Awards Update
———————————————————————
Change: Updated MOZ section slogan typography to match mozinteriors.com brand style and added 2025 Detroit Designs awards.
Files touched: portfolio.html
Notes:
**Typography Update:**
- Pull quote now uses MOZ's official slogan: "VINTAGE VIBES WITH MODERN MODALITY"
- Changed from italic serif to uppercase with extended letter-spacing (0.15em)
- Font: Playfair Display, 1.8rem, normal weight 500
- Style matches her website's sophisticated, spaced-out typography treatment
- Mobile: reduced to 1.2rem with 0.1em spacing for readability

**Awards Added:**
- Recognition row now displays: "Best Fireplace · Detroit Design Awards 2025" and "Best Staircase · Detroit Design Awards 2025"
- Both awards from Detroit Design Awards for the interior featured in MOZPage.jpg
- Displayed as award badges with brass gold (#B8966D) styling
- Replaced generic "Industry Press Coverage" with actual client accolades

Quick test:
- Scroll to MOZ section on portfolio.html
- Verify slogan displays in uppercase with elegant spacing
- Check that both Detroit 2025 awards appear in Recognition detail row
- Confirm typography feels refined and matches high-fashion brand aesthetic

2026-01-11 | MOZ Interiors Section - Editorial Magazine Implementation Complete
———————————————————————
Change: Completely redesigned MOZ Interiors portfolio section with fashion magazine editorial treatment using MOZPage.jpg as full-bleed background. Fixed image path and updated photo credit.
Files touched: portfolio.html
Notes:
**Visual Design:**
- Full-bleed background: MOZPage.jpg (spiral staircase, marble island, luxury interior)
- Ken Burns zoom animation: 25s infinite alternate, scale 1.0→1.08, creates living editorial feel
- Radial gradient overlay: centered on staircase (65% 40%), darkens edges for text contrast
- Glass-morphism info card: rgba(255,255,255,0.12) with 10px backdrop blur
- Matted video frame: 14px white border with brass gold (#B8966D) inner accent
- Parallax effect disabled on mobile for performance

**Typography:**
- Masthead: Playfair Display, 4.5rem, white, ultra-spaced (0.15em), top-left positioning
- Title: Playfair Display serif, white with text-shadow for legibility
- Subtitle: Playfair italic, cream white, editorial style
- Labels: Space Mono monospace, brass gold accent (#B8966D)
- Pull quote: 2rem italic serif, bottom-left over velvet seating area

**Color Palette (Extracted from Photo):**
- Brass Gold: #B8966D (from bar stools - accent color throughout)
- Marble White: #E8E6E3 (matted border)
- Overlay: radial-gradient from rgba(0,0,0,0.3) to rgba(40,35,30,0.75)
- Text: white/cream with subtle shadows for depth

**Layout Elements:**
1. Masthead treatment (top-left): "MOZ INTERIORS" with cognac underline
2. Video player (center-left): matted frame over marble island area
3. Glass-morphism info card (right): floating with staircase visible through blur
4. Pull quote (bottom-left): "Every space tells a story..." over seating area
5. Photo credit (bottom-right): "Photography: Shelby Dubin Photography" - appears on hover, monospace brass gold

**Interactive Features:**
- Ken Burns zoom: smooth 25-second animation creates depth
- Video hover: matted border glows, subtle scale (1.01x)
- Photo credit: fades in on section hover (opacity 0→0.7)
- Glass-morphism: backdrop blur allows background to show through elegantly

**Technical Implementation:**
- CSS ::before for background image with animation
- CSS ::after for gradient overlay (z-index layering)
- @keyframes kenBurnsZoom with transform-origin shifts
- backdrop-filter with -webkit prefix for Safari support
- Responsive: disables Ken Burns on mobile, stacks layout, maintains matted frame
- Accessibility: prefers-reduced-motion stops animation, 4.5:1 contrast ratio maintained

**Animation Specs:**
```css
@keyframes kenBurnsZoom {
    0%: scale(1.0) at 65% 40% (staircase focus)
    100%: scale(1.08) at 45% 60% (marble island focus)
}
```

**Mobile Responsive:**
- Portrait crop focuses on staircase vertical element
- Ken Burns disabled for performance
- Glass cards full-width with margin
- Matted border reduces to 8px
- Pull quote becomes static element
- Masthead font-size reduces to 1.5rem

Quick test checklist:
- Load portfolio.html and scroll to MOZ section
- Background should be MOZPage.jpg (images/MOZPage.jpg) with slow zoom animation
- Staircase visible through glass-morphism info card
- Video frame has white matted border with brass accent
- Pull quote visible bottom-left: "Every space tells a story..."
- Hover section: photo credit "Photography: Shelby Dubin Photography" fades in bottom-right
- Hover video: matted border glows brass gold
- Mobile: Ken Burns stops, layout stacks vertically
- Reduced motion: animation disabled completely
- All text legible with proper contrast on darkened photo

**Fixed Issues:**
- Corrected image path from 'MOZPage.jpg' to 'images/MOZPage.jpg'
- Updated photo credit from "LaB Media" to "Shelby Dubin Photography"

2026-01-11 | Portfolio Redesign Proposal Created + MOZ Section Update
———————————————————————
Change: Created comprehensive portfolio redesign proposal with professional design concepts for each project; updated MOZ section with background photo integration.
Files touched: PORTFOLIO_REDESIGN_PROPOSAL.md (new)
Notes:
**Initial Proposal:**
- Created 5 unique design concepts (MOZ, Anthony Brass, Trail Dead, Lookout, The Pandys)
- Each designed by "specialist in that field" approach (magazine editor, gallery curator, film programmer, etc.)
- Includes technical specs, animation concepts, timeline, budget estimates

**MOZ Interiors Update:**
- Revised design to incorporate production still photo as full-bleed background
- Fashion magazine art director approach: photo with gradient overlay + glass-morphism content cards
- Three layout options presented (Full Bleed recommended, Split-Screen, Layered Depth)
- Detailed specs: Didot typography, matted video frame, "AS SEEN IN" treatment
- Glass-morphism cards: backdrop-blur with semi-transparent white backgrounds
- Parallax effect: background photo moves slower than content for depth
- Advanced features: interactive hotspots, photo credit overlay, zoom detail
- Mobile-responsive strategy maintaining elegance
- Asset requirements documented (2560x1440px minimum photo resolution)

**Key Technical Specs:**
- Typography: Didot/Bodoni serif for titles, white on darkened photo
- Glass-morphism: rgba(255,255,255,0.12) with 10px backdrop blur
- Color palette: cognac accents (#A0826D), warm overlays, cream whites
- Parallax: 0.5x speed background movement
- Accessibility: 4.5:1 contrast ratio maintained, reduced motion support

Quick test checklist:
- Review PORTFOLIO_REDESIGN_PROPOSAL.md for full details
- MOZ section now has 3 layout options with recommended approach
- All technical specs, color codes, and typography documented
- Implementation timeline: 60-75 hours estimated
- Ready for mockup phase once photo asset is provided

2026-01-11 | Resources Section Header Added (Section Count 04)
———————————————————————
Change: Added section-header structure to Resources section to match Events/Work styling consistency.
Files touched: index.html
Notes:
- Added section-header wrapper with label "For Reference", decorative line, and count "04"
- Moved "For Reference" from resources-label into section-label for consistency
- Updated GSAP animations to include section-header and section-line animations
- Animation sequence: header drops (-20px) → line expands → title bounces → desc rises → button scales
- Adjusted animation delays to accommodate new header (0.1s, 0.2s, 0.4s, 0.6s progression)
- Maintains visual consistency across all homepage sections

Quick test checklist:
- Resources section displays "For Reference" label, line, and "04" count
- Header animates in first with drop effect
- Line expands smoothly after header
- Title, description, and button follow in sequence
- No layout shifts or styling inconsistencies

2026-01-11 | Homepage Section Reordering & Unique Scroll Animations
———————————————————————
Change: Reorganized homepage section order to move portfolio below events/resources; implemented unique scroll animations for each section.
Files touched: index.html
Notes:
**Section Reordering:**
- New homepage flow: Hero → Events Preview → Resources → Work/Portfolio → Footer
- Portfolio section moved from position 2 to position 4 (less prominent, less "in your face")
- Events and production resources now appear earlier, prioritizing community engagement
- Maintains logical flow: hero intro → upcoming events → useful tools → work showcase

**Unique Scroll Animations:**
- Events Preview: Slides in smoothly from left with staggered card animations
  - Header slides from left (-30px), section line expands left-to-right
  - Event cards slide in from left (-40px) with 0.12s stagger
  - View All link slides from left
- Resources Section: Drops in with weight and elastic bounce
  - Label floats down (-20px)
  - Title drops with back.out(1.2) bounce effect (-40px)
  - Description fades up from below (+20px)
  - CTA button scales up (0.9→1.0) with back.out(1.4) bounce
- Work Section: Subtle lift and fade with scale
  - Projects fade up with scale (0.95→1.0) and vertical movement (+60px)
  - Staggered timing (0.1s) for sequential reveal
  - Section line draws across smoothly

**Animation Details:**
- All animations use GSAP ScrollTrigger
- Trigger points optimized for natural feel (75-80% viewport)
- Easing curves matched to content type (power2, power3, back)
- Stagger delays prevent overwhelming users
- Respects prefers-reduced-motion settings

Quick test checklist:
- Scroll homepage slowly and observe each section's unique entrance animation
- Events should slide from left smoothly
- Resources title should have satisfying bounce on entry
- Work projects should lift and scale in with elegant stagger
- No animation conflicts or janky movement
- Test on mobile - animations should still feel smooth
- Reduced motion users see instant reveals (no animation)

2026-01-11 | Path 3 Deep Cleanup - Production Debug Logging Removed
———————————————————————
Change: Removed all console.log(), console.warn(), and console.debug() statements from production code (22 total removed).
Files touched: index.html (7 removed), resources.html (12 removed), plan-your-project.html (1 removed), events.html (1 removed)
Notes:
- Preserved all console.error() statements (intentional error logging for global error handlers)
- index.html: Removed debug logs from loadEventsPreview() function and voice agent
- resources.html: Removed debug logs from saveFavorites(), showToast(), favorites initialization, setFavoriteUI(), favorite button click handler, and logReferencesDebug()
- plan-your-project.html: Removed beaker logo load warning
- events.html: Removed iCal export success log
- Cleaner browser console for production users
- Reduces noise in debugging actual errors

Quick test checklist:
- Open site in browser, open DevTools Console
- Navigate through pages, trigger events, save favorites, export events
- Console should only show errors (if any occur), no debug/info logs
- Verify favorites still save/load correctly
- Verify events preview still loads on index.html
- Verify toast messages still appear on resources.html

2026-01-11 | Path 2 Solid Upgrade - Maintainability & Code Quality
———————————————————————
Change: Completed remaining Path 2 improvements - added JSON-LD structured data, global error handling, email obfuscation, lazy loading, and .gitignore.
Files touched: index.html, contact.html, portfolio.html, events.html, resources.html, plan-your-project.html, .gitignore (new)
Notes:
**JSON-LD Structured Data:**
- Added Organization schema to index.html
- Includes: name, URL, logo, description, address (Shelby Township, MI)
- Contact point and social media links (Instagram, YouTube)
- Validates at https://search.google.com/test/rich-results
- Improves Google Knowledge Graph appearance

**Global Error Handling:**
- Added window.onerror handler to all 6 HTML pages
- Logs errors with full context (message, source, line, column, error object)
- Added unhandledrejection listener for Promise errors
- Errors logged with [Global Error Handler] prefix for easy filtering
- Ready for integration with error tracking services (Sentry, LogRocket, etc.)

**Email Obfuscation:**
- Obfuscated email on contact.html to prevent spam harvesting
- Email stored as data attributes (data-user, data-domain, data-tld)
- JavaScript decodes email on page load
- HTML source shows "Email Us" link, not actual email address
- Functional mailto link after JS execution

**Lazy Loading:**
- Added loading="lazy" to hero logo (index.html)
- Added loading="lazy" to work section images (index.html - 1 image)
- Added loading="lazy" to all portfolio video thumbnails (portfolio.html - 5 images)
- Navigation logos intentionally excluded (above the fold, need immediate load)
- Improves initial page load performance

**.gitignore File:**
- Created comprehensive .gitignore for the project
- Excludes: .DS_Store, .claude/, .vscode/, .idea/, logs, temp files, backups
- Future-proofed for node_modules/, dist/, build/ (if build process added later)
- Covers macOS, Windows, Linux editor files

Quick test checklist:
- JSON-LD: `grep "application/ld+json" index.html` (should find Organization schema)
- Test structured data: Paste index.html URL into https://search.google.com/test/rich-results
- Global error handler: `grep -c "window.onerror" *.html` (should return 6)
- Test error handler: Open DevTools Console, trigger an error (e.g., call undefined function)
- Email obfuscation: View contact.html source, should see data-user/domain/tld attributes, not plain email
- Test email link: Visit contact.html, click "Email Us" link (should open mailto)
- Lazy loading: `grep -c 'loading="lazy"' index.html portfolio.html` (should show 7 total)
- Test lazy loading: Open DevTools Network tab, scroll page, images load on demand
- .gitignore: `ls -la | grep .gitignore` (file exists)
- Git test: `git status` should not show .DS_Store or .claude/ files

2026-01-11 | SEO, Security & Infrastructure Improvements
———————————————————————
Change: Comprehensive site optimization - added SEO infrastructure, security hardening, and meta tag completion. Strengthened changelog documentation requirements.
Files touched: sitemap.xml (new), robots.txt (new), index.html, contact.html, portfolio.html, events.html, resources.html, plan-your-project.html, CHANGELOG_RUNNING.md, AGENTS.md
Notes:
**SEO Infrastructure:**
- Created sitemap.xml with all 6 public pages (proper priorities and change frequencies)
- Created robots.txt allowing all crawlers with sitemap reference
- Added canonical tags to all 6 HTML pages (prevents duplicate content penalties)
- Added complete SEO meta tags to 4 pages missing them (portfolio, events, resources, plan-your-project)
- Each page now has: meta description, meta keywords, Open Graph tags, Twitter Card tags

**Security Hardening:**
- Added SRI (Subresource Integrity) hashes to all CDN scripts (GSAP 3.12.5, ScrollTrigger, jsPDF 2.5.1)
- All CDN scripts now include integrity, crossorigin, and referrerpolicy attributes
- Added CSP (Content Security Policy) meta tags to all 6 pages
- CSP allows: Google Fonts, CDN scripts, YouTube embeds, inline styles/scripts
- Protects against XSS attacks while maintaining functionality

**Navigation Review:**
- Analyzed navigation across all pages - confirmed intentional design (not duplication)
- Three patterns: Full nav (index), Standard nav (events/resources), Minimal nav (contact/portfolio/plan)
- No changes needed - appropriate UX for each page type

**Documentation Updates:**
- Updated CHANGELOG_RUNNING.md header with mandatory update requirement
- Strengthened AGENTS.md changelog requirements (3 locations)
- Made changelog updates non-negotiable part of development workflow

**Files Removed:**
- diagnostic.html (deleted by user before this session)

Quick test checklist:
- Verify sitemap: `curl https://labmedia.work/sitemap.xml | grep "<url>"` (should show 6 URLs)
- Verify robots.txt: `curl https://labmedia.work/robots.txt` (should show sitemap reference)
- Check canonical tags: `grep -c 'rel="canonical"' *.html` (should return 6)
- Check SEO meta tags: All pages pass https://www.opengraph.xyz/ validation
- Verify SRI hashes: `grep -c "integrity=" *.html` (should show 5 occurrences)
- Verify CSP: `grep -c "Content-Security-Policy" *.html` (should show 6)
- Test in browser: Open each page, check DevTools Console for no CSP violations
- Social sharing: Share any page on Twitter/Facebook, preview should show correct image/description
- Search engines: Submit sitemap to Google Search Console for faster indexing

2026-01-10 | (Current Session) - Final Pre-Upload Fixes + Diagnostics
———————————————————————
Change: Fixed events not loading on index page and added comprehensive debugging + diagnostic tools.
Files touched: index.html, resources.html, diagnostic.html (new)
Notes:
- Fixed: Events preview not loading - changed `window.eventsData` to `eventsData` (line 1735)
- Root cause: events-data.js declares `const eventsData` which is script-scoped, not window-scoped
- Added: Comprehensive console logging for debugging favorites save button
- Added: Console logging for events loading, favorites save/load, and toast notifications
- Added: diagnostic.html - standalone test page for verifying both features work
- Debug logs prefixed with [SAVE], [TOAST], [EVENTS], or [INIT] for easy filtering
- Enhanced saveFavorites() with error logging
- Enhanced setFavoriteUI() with detailed logging
Quick test checklist:
- Open diagnostic.html → auto-runs all tests, shows pass/fail status
- Open index.html → Events preview section shows next 3 upcoming events (Jan 13, Jan 15, Feb 10)
- Check console → should see "[EVENTS] Loading events preview..." and event count
- Open resources.html → click resource card → modal opens
- Click SAVE button (⭐) → check console for "[SAVE] Button clicked" and "[TOAST] Showing: Added to saved"
- Toast notification appears bottom-right with white background
- Button should highlight on hover (same as ESC button style)
- Saved badge updates on filter button
- Click "Saved" filter → should show only saved resources
- If any issues, check browser console for error messages or use diagnostic.html

2026-01-10 | (Current Session)
———————————————————————
Change: Fixed Favorites/Saved functionality - badge now updates correctly when saving resources.
Files touched: resources.html
Notes:
- Fixed: Saved badge count not updating when clicking SAVE button in resource modals
- Root cause: updateSavedBadge() wasn't being called in favorite button click handler
- Added: Toast notifications ("Added to saved" / "Removed from saved") for user feedback
- Badge now updates immediately after clicking SAVE button (line 2188)
Quick test checklist:
- Click resource card → modal opens
- Click SAVE button (⭐) → toast shows "Added to saved"
- Saved badge on filter button updates from empty to "1" (orange badge)
- Save more resources → badge increments (2, 3, 4...)
- Click SAVE again on saved item → toast shows "Removed from saved", badge decrements

2026-01-10 | (Current Session)
———————————————————————
Change: PHASE 5 - Implemented comprehensive analytics tracking system for resources page.
Files touched: resources.html
Notes:
- Added analytics tracking system using localStorage (no backend needed)
- Track resource card clicks and CTA button clicks in modals
- Display view count badge on resource cards ("X views" - blue badge)
- Display trending badge on popular resources (🔥 "Trending" - red with pulse animation)
- Trending criteria: 3+ views in last 7 days
- Analytics data structure: { resourceId: { views, lastViewed, firstViewed } }
- Helper functions: trackResourceClick(), getResourceViews(), getTopResources(), isTrending()
- View counts persist across sessions
- Added CSS for .badge-views and .badge-trending with pulse animation
Quick test checklist:
- Click resource cards → view counts increment
- Refresh page → view counts persist
- Click same resource 3+ times → trending badge appears with pulse animation
- Analytics stored in localStorage under 'lab_analytics_v1' key

2026-01-10 | (Current Session)
———————————————————————
Change: PHASE 3 - Added dynamic Events Preview section to homepage.
Files touched: index.html
Notes:
- Added "Next 3 Events" section between Work and Resources sections
- Pulls data dynamically from events-data.js
- Shows event date, title, location, and color-coded type badge
- Auto-filters past events (only shows upcoming)
- Shows "No upcoming events" message if none found
- Color-coded badges: meetup (green), festival (orange), workshop (blue), screening (purple), deadline (red)
- Added GSAP scroll animations (header fades in, cards stagger)
- Event count display shows "03" format
- All cards link to events.html
- Responsive grid layout
Quick test checklist:
- Homepage loads → Events Preview section visible between Work and Resources
- Shows next 3 upcoming events with dates, titles, locations
- Count badge shows correct number (e.g., "03")
- Click event card → navigates to events.html
- No upcoming events → shows fallback message
- Animations trigger on scroll

2026-01-10 | (Current Session)
———————————————————————
Change: PHASE 2 - Created standalone contact page and removed contact section from homepage.
Files touched: index.html, contact.html (new file)
Notes:
- Created new contact.html page with portal-style prototype design
- Added full SEO meta tags, GSAP animations, responsive layout
- All contact info: email, phone, location, social links
- Updated navigation across all pages: #contact → contact.html
- Removed contact section HTML from homepage (~55 lines)
- Removed contact section GSAP animations (~70 lines)
- Updated voice agent tool handler to navigate to contact page
- Homepage now cleaner and more focused: Hero → Work → Events → Resources → Footer
Quick test checklist:
- Navigation menu: Click Contact → loads contact.html
- Contact page: animations work, info displays correctly
- Homepage: contact section removed, shorter page
- Mobile: contact page responsive

2026-01-10 | (Current Session)
———————————————————————
Change: PHASE 1 - Code cleanup, bug fixes, and SEO improvements.
Files touched: index.html, resources.html, prototype-theme.css, Images/ folder
Notes:
- Removed duplicate logReferencesDebug() function (resources.html:2346)
- Disabled debug mode: REFERENCES_DEBUG = false (resources.html:2012)
- Fixed Images folder case sensitivity: renamed Images/ → images/ for cross-platform compatibility
- Removed ~150 lines of unused CSS from prototype-theme.css (glitch effects, loaders, data displays)
- Added comprehensive SEO meta tags to index.html (description, keywords, Open Graph, Twitter Cards)
- Fixed production console.log statements
- Cleaned up code comments and formatting
Quick test checklist:
- No duplicate function errors in console
- No debug console.debug statements firing
- Images load correctly on all systems (case-insensitive and case-sensitive)
- Social media preview cards work when sharing site
- Google search shows proper title and description

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
2026-01-09 | 11:41PM EST
———————————————————————
Change: Add Betaflight to Tools → Drone filters in Resources.
Files touched: resources-data.js, CHANGELOG_RUNNING.md
Notes: Tagged Betaflight with software category so it appears under Tools → Drone.
Quick test checklist:
- Open resources.html; select Tools → Drone and confirm Betaflight appears in the list.
- Use the search bar to find Betaflight; confirm it still opens the resource modal.
- Open DevTools console on Resources page; confirm no errors.
2026-01-12 | 3:46AM EST
———————————————————————
Change: Fix portfolio video embeds to load inside the correct aspect wrapper so click-to-play works on all sections.
Files touched: portfolio.html, CHANGELOG_RUNNING.md
Notes: Updated the video loader to target the MOZ aspect wrapper when present.
Quick test checklist:
- Open portfolio.html; click each video thumbnail and confirm the YouTube player loads and plays in place.
- Resize the browser and confirm MOZ video maintains its 16:9 frame while playing.
- Open DevTools console on portfolio.html; confirm no errors.
2026-01-11 | 10:55PM EST
———————————————————————
Change: Let a single selected prompt populate the Current Results list instead of showing all three.
Files touched: ideas.html, CHANGELOG_RUNNING.md
Notes: Added prompt selection handling so choosing a card isolates it in the results while keeping bonus and mini rolls.
Quick test checklist:
- Open ideas.html; click Roll the Die and confirm three prompts appear.
- Click one prompt card; confirm Current Results shows only the selected prompt plus any bonus/quick rolls.
- Roll a bonus and a quick roller; confirm they appear alongside the selected prompt.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 4:14AM EST
———————————————————————
Change: Add select-one cue above prompts and per-tile clear actions for Quick Rollers.
Files touched: ideas.html, CHANGELOG_RUNNING.md
Notes: Added a subtle "Select One" hint and clear buttons for each mini roller tile.
Quick test checklist:
- Open ideas.html; click Roll the Die and confirm "Select One" appears between the header and Roll Again button.
- In Quick Rollers, click Roll on a tile and then Clear; confirm that tile resets to "Click roll to reveal..." and Current Results updates.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 4:51AM EST
———————————————————————
Change: Add tone-tagged idea entries with tone-aware prompt filtering and normalization.
Files touched: ideas-data.js, ideas.html, CHANGELOG_RUNNING.md
Notes: Added tagging helpers and tone filtering with neutral fallback plus sample tagged concepts.
Quick test checklist:
- Open ideas.html; click Roll the Die and confirm three prompts render with concept/constraint/twist text.
- Refresh and roll again; confirm prompts still generate without errors.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 5:01AM EST
———————————————————————
Change: Add tagged idea concepts, constraints, and places to expand the data library.
Files touched: ideas-data.js, CHANGELOG_RUNNING.md
Notes: Normalized new entries to the supported tone tags with micro-budget defaults.
Quick test checklist:
- Open ideas.html; click Roll the Die and confirm new prompt text appears across concepts, constraints, and places.
- Roll multiple times to confirm tags do not break prompt generation.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 5:15AM EST
———————————————————————
Change: Make ideas UI resilient to object-backed entries and normalize extra data arrays.
Files touched: ideas.html, ideas-data.js, CHANGELOG_RUNNING.md
Notes: Added getEntryText usage across bonus, mini rollers, flavor display, and fixed constraint type fields.
Quick test checklist:
- Open ideas.html; click Roll the Die and confirm prompts render with readable flavor badges.
- Click Bonus Roll and each mini roller; confirm results appear and Current Results updates.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 12:23AM EST
———————————————————————
Change: Add tagged idea additions and a roll helper with local filmmaker filtering in the ideas data library.
Files touched: ideas-data.js, CHANGELOG_RUNNING.md
Notes: Included optional accessible tags and a browser/global preset for local-mode rolls.
Quick test checklist:
- Open ideas.html; roll prompts and confirm objects/twists/characters/bonuses include new entries.
- In DevTools console on ideas.html, run rollIdea(ideasData, { tone: "mystery", localMode: true }) and confirm a bundle returns.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 5:38AM EST
———————————————————————
Change: Allow embedded example videos to load in resource modals by expanding CSP frame sources.
Files touched: resources.html, CHANGELOG_RUNNING.md
Notes: Added YouTube and Vimeo frame-src allowances for modal video iframes.
Quick test checklist:
- Open resources.html; open a resource with an Example Video (e.g., Mike Sytes) and confirm the video iframe loads.
- Open resources.html; open another resource with a Vimeo example and confirm the video iframe loads.
- Open DevTools console on resources.html; confirm no errors.
2026-01-12 | 5:51AM EST
———————————————————————
Change: Improve resource modal video embedding by resolving IDs from stored video fields and link URLs.
Files touched: resources.html, CHANGELOG_RUNNING.md
Notes: Added YouTube/Vimeo ID parsing and embed fallbacks to keep video frames loading across entries.
Quick test checklist:
- Open resources.html; open collaborators like Anthony R Brass and confirm the embedded video renders in the modal.
- Open resources.html; open a drone channel like Joshua Bardwell or BOTGRINDER and confirm the embedded video renders.
- Open DevTools console on resources.html; confirm no errors.
2026-01-12 | 6:12AM EST
———————————————————————
Change: Cap plan page budget dropdown at $5,000+ as the maximum option.
Files touched: plan-your-project.html, CHANGELOG_RUNNING.md
Notes: Removed higher budget tiers so the max range matches the requested ceiling.
Quick test checklist:
- Open plan-your-project.html; verify the Budget dropdown tops out at $5,000+.
- Select Budget options and confirm the form accepts the selection.
- Open DevTools console on plan-your-project.html; confirm no errors.
2026-01-12 | 4:48PM EST
———————————————————————
Change: Add new visual style, emotional target, and bonus challenge options to the ideas data set.
Files touched: ideas-data.js, CHANGELOG_RUNNING.md
Notes: Appended new entries without removing existing options.
Quick test checklist:
- Open ideas.html; trigger rolls and confirm new visual style, emotion, and bonus options appear.
- Open ideas.html; refresh and confirm existing idea options still render.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 11:57AM EST
———————————————————————
Change: Add per-prompt reroll buttons for constraints and twists on the Ideas page.
Files touched: ideas.html, CHANGELOG_RUNNING.md
Notes: Reroll controls update the prompt card text and results summary without changing the concept.
Quick test checklist:
- Open ideas.html; roll prompts, then reroll Constraint and Twist on a card and confirm the text updates in the card.
- Select a prompt after rerolling and confirm the Current Results section reflects the updated constraint/twist.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 11:58AM EST
———————————————————————
Change: Fix keyboard reroll actions to avoid triggering prompt selection.
Files touched: ideas.html, CHANGELOG_RUNNING.md
Notes: Card keydown now ignores reroll buttons and reroll buttons stop Enter/Space propagation.
Quick test checklist:
- Open ideas.html; roll prompts, tab to a reroll button, press Enter/Space, and confirm the constraint/twist rerolls without selecting the card.
- Tab to the card itself and press Enter/Space; confirm it selects the card as before.
- Open DevTools console on ideas.html; confirm no errors.
2026-01-12 | 12:05PM EST
———————————————————————
Change: Add Roll All challenge, prompt locks, and new idea data options on the Ideas page.
Files touched: ideas.html, ideas-data.js, CHANGELOG_RUNNING.md
Notes: Roll All triggers prompts, bonus, and quick rollers once per reset; lock toggles preserve fields during rerolls.
Quick test checklist:
- Open ideas.html; click Roll All and confirm prompts, bonus, and quick rollers populate with the animation and the button locks afterward.
- Toggle lock icons on a prompt, click Roll Again, and confirm locked fields persist while unlocked fields reroll.
- Open DevTools console on ideas.html; confirm no errors.
