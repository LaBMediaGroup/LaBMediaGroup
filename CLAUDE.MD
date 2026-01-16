# CLAUDE.MD — Working with Claude Code on LaB Media Site

This file provides Claude Code-specific instructions for working on this project effectively.

## Quick Project Context

**What this is:** Static resource hub for filmmakers and creatives. One-person side hobby project, no paid work yet, zero budget. This is NOT a scaling startup - it's a curated local resource goldmine.

**Mission:** Help Metro Detroit filmmakers and writers with tools, events, and creative inspiration. That's it. No grand expansion plans.

**Tech stack:** Pure HTML/CSS/JS with GSAP. No frameworks, no build step. GitHub Pages hosting with custom domain.

**Design aesthetic:** Prototype/retrofuturist minimal. Crisp lines (NO GLOW), high-tech but tasteful, command-line inspired.

**Key pages (by priority):**
1. `resources.html` - **Crown jewel**: Fast filtering, search, favorites (localStorage), Lab Picks. Resources goldmine for filmmakers.
2. `ideas.html` - **Hidden gem**: Film prompt generator ("52prompts.com but on one page"). Roll the dice for instant story ideas. Horror/Comedy toggles. HIGHLY SOUGHT AFTER feature - possibly the coolest thing on the site.
3. `events.html` - Community calendar (Metro Detroit only, 50mi from Shelby Township, MI)
4. `callboard.html` - **Job board**: Crew/cast/services listings for local filmmakers. Supabase-powered submissions with moderation.
5. `plan-your-project.html` - Project planning tool (kinda cool)
6. `portfolio.html` - Video/work showcase
7. `index.html` - Home/hero/work grid
8. `contact.html` - Contact form
9. `past-events.html` - Archive of past events

---

## Critical Requirements (Read These First)

### 1. CHANGELOG IS MANDATORY
**BEFORE any commit or considering work "done":**
- Append new entry to `CHANGELOG_RUNNING.md` (top of file)
- Format:
  ```
  YYYY-MM-DD | h:mmAM/PM EST
  ———————————————————————
  Change:
  Files touched:
  Notes:
  Quick test checklist:
  ```
- Never delete/rewrite prior entries
- **A code change without a changelog entry is INCOMPLETE**

### 2. Design Non-Negotiables
- **Crisp lines only. NO GLOW on accent lines.**
  - No `box-shadow` halos, neon glows, bloom effects on accent lines
  - Animation is opacity/position only, not blur effects
- Keep changes surgical - prefer edits over rewrites
- No UI duplication (IDs must be unique, no duplicate filter bars/modals)
- FilmFreeway links go in detail/bio view ONLY, not on tiles

### 3. Stack & Budget Constraints
- Pure HTML/CSS/JS only (no React/Vue/build tooling unless explicitly approved)
- No new dependencies unless requested
- Motion must respect `prefers-reduced-motion`
- **CRITICAL: $0 budget forever** - No paid services, no subscriptions, no backend costs
- Free tier tools only: GitHub Pages, Supabase free tier (forms/database), Mailchimp free (if needed)
- If a feature requires paid hosting/services, it's not happening

### 4. Supabase Integration (Forms & Data)
- **Callboard, Events submissions, and Resource suggestions** use Supabase
- CSP meta tag MUST include Supabase endpoint: `connect-src 'self' https://dfwgjbjrkwikvqmnzcxx.supabase.co;`
- Form pattern:
  - Honeypot field for spam prevention (hidden input that bots fill)
  - Client-side validation + server-side edge function
  - Friendly user feedback on success/error
  - No console spam on errors
- Submissions are **moderated** - don't display unverified data directly
- Edge functions handle email notifications (if configured)

### 5. Testing Constraints
**Environment has proxy restrictions - NO Playwright/automated screenshots.**

Testing output must be:
- "Automated tests: Not run (environment restriction)"
- Manual verification checklist with click-path steps
- Console error check step (DevTools) for touched pages

---

## Working Method (Step-by-Step)

When given a task:

1. **Read first, then edit**
   - Never propose changes to code you haven't read
   - Use Read tool on files before making changes

2. **Plan if needed**
   - Use TodoWrite for multi-step tasks (3+ steps)
   - Mark todos as in_progress/completed as you work

3. **Make minimal changes**
   - Surgical edits over rewrites
   - Don't add features beyond what's requested
   - No "improvements" unless directly asked

4. **Update changelog**
   - Append to `CHANGELOG_RUNNING.md` BEFORE considering work done
   - Include actual filenames in "Files touched"

5. **Provide verification checklist**
   - Manual test steps (no automated tests due to environment)
   - Console error check
   - Page-specific regression checks (see below)

---

## Page-Specific Rules

### resources.html (Crown Jewel)
- **THIS IS THE STAR** - Resources goldmine for filmmakers
- Fast filtering & search is priority
- Favorites: localStorage only, saved drawer hidden by default
- Export features: "Copy Links" button + "Export Bookmarks" (browser HTML format)
- Lab Picks: Special badge system for curated recommendations
- **Never render multiple quick-filter rows**
- Category "hubs" preferred over too many tabs

### ideas.html (Hidden Gem - Possibly #1 Coolest Feature)
- Film prompt generator - "52prompts.com but on one page"
- Roll the dice for instant story ideas (genre, character, setting, constraint, twist)
- Horror toggle: Adds creepy details and horror-specific prompts
- Comedy toggle: Adds comedy beats and comedy-specific mechanics
- Export to PDF functionality
- **Users LOVE this** - helps writers break through creative blocks
- Highly sought after, possibly the site's most unique feature

### events.html (Community Calendar)
- Default view: real month grid calendar
- **Local-only events:** Metro Detroit (~50mi of Shelby Township, MI)
  - Includes: Shelby Township, Sterling Heights, Troy, Rochester, Royal Oak, Ferndale, Detroit, Warren, Clinton Twp, Utica, Auburn Hills
  - Location must contain "MI" or "Michigan" OR one of these cities
  - If location missing/unrecognized: **exclude by default**
- No demo/sample events (no TX/CA/NY locations)
- Clicking event opens modal with full details
- Event submission form sends to Supabase for moderation

### callboard.html (Job Board)
- Listings for crew, cast, services, gear, and locations
- **Supabase-powered**: Submissions go to database, moderated before display
- Only show **approved** listings (verified field in Supabase)
- Filters: category (crew/cast/services/gear/locations), type, location
- Submission form includes honeypot field for spam prevention
- Metro Detroit focus (same location rules as events)

### portfolio.html
- Must remain snappy
- Prefer YouTube thumbnail-to-iframe ("lite") loading

### index.html (Home)
- Hero + work grid + contact portal
- GSAP/ScrollTrigger acceptable (respect prefers-reduced-motion)
- Voice agent must not clutter nav or cover content

---

## Quick Regression Checklist

After any change, verify:

**General (ALWAYS):**
- `CHANGELOG_RUNNING.md` has new entry at top
- No console errors on touched pages

**Resources page:**
- Only one group tab row
- Only one quickfilter row
- Saved drawer hidden until opened

**Events page:**
- No TX/CA/NY demo locations
- Month grid calendar is default view
- Submission form works (if touched)

**Callboard page:**
- Only approved/verified listings shown
- Filters work correctly
- Submission form validates and sends to Supabase
- Honeypot field is hidden (not visible to users)
- CSP allows Supabase connection (no console errors)

---

## Related Documentation

- `AGENTS.md` - Agent roles and workflow (translator/execution/QA)
- `LAB_STYLE_GUIDE.md` - Visual design system and aesthetic rules
- `RESOURCES_SCHEMA.md` - Data structure for resources
- `CHANGELOG_RUNNING.md` - Running log of all changes (MANDATORY to update)

---

## When to Ask Questions

Use AskUserQuestion tool when:
- Requirements are ambiguous or vague
- Multiple valid approaches exist
- Design decisions need user input
- Unclear which files/components to modify

Don't guess - ask first, then execute with confidence.

---

## Common Pitfalls to Avoid

1. Adding glow effects to accent lines (design violation)
2. Forgetting changelog entry (makes change incomplete)
3. Attempting automated tests (environment restriction)
4. Creating new files when editing existing ones would work
5. Adding FilmFreeway links to tiles (they go in detail view only)
6. Duplicating UI elements (filter bars, modals, etc.)
7. Including non-local events in events.html
8. Over-engineering simple changes

---

## Quick Reference: Key Files

**Pages:**
- `index.html` - Home page
- `resources.html` - Resource hub with filtering
- `ideas.html` - Story prompt generator
- `events.html` - Community calendar
- `callboard.html` - Job board (Supabase-powered)
- `portfolio.html` - Work showcase
- `plan-your-project.html` - Project planning tool
- `contact.html` - Contact form
- `past-events.html` - Event archive
- `404.html` - Error page

**Data files:**
- `resources-data.js` - Resource entries (~80KB)
- `ideas-data.js` - Story prompts (~113KB)
- `events-data.js` - Events data (~8KB)

**Styles:**
- `prototype-theme.css` - Unified design system (colors, nav, base styles)

**Documentation:**
- `CHANGELOG_RUNNING.md` - **MUST UPDATE WITH EVERY CHANGE**
- `AGENTS.md` - Agent roles and workflows
- `LAB_STYLE_GUIDE.md` - Visual design rules
- `RESOURCES_SCHEMA.md` - Resource data structure

---

## Summary: The Four Golden Rules

1. **Read before you edit** - Never change code you haven't read
2. **Update the changelog** - Every change needs a CHANGELOG_RUNNING.md entry
3. **Keep it crisp** - No glow on accent lines, minimal changes only
4. **Stay free** - Zero budget forever. No paid services, no subscriptions, no backend costs.

## Project Philosophy

This is a **resource hub**, not a business. The goal is to help local filmmakers and writers with curated tools, events, and creative inspiration. No grand expansion plans. No monetization strategy. Just a helpful site that works well and stays free.

The site's strength is its **focused utility**: Resources are curated (Lab Picks), Ideas page is genuinely useful (prompt generator), Events are local-only (Metro Detroit). Quality over quantity.

Follow these rules and refer to AGENTS.md for role-based workflows.
