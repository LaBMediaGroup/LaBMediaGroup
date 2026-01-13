# LaB Media — Agents & Workflow (AGENTS.md)

This repo is a static website (HTML/CSS/JS). No frameworks, no build step.

**Project Reality:** One-person side hobby. Zero budget. No paid work yet. This is NOT a scaling business - it's a curated local resource hub for Metro Detroit filmmakers and writers. Features must be free forever.

**Key Pages:** `resources.html` (crown jewel resources hub), `ideas.html` (film prompt generator - possibly the coolest feature), `events.html` (local calendar), `plan-your-project.html`, `portfolio.html`.

This document defines role-based workflows for coding assistants working on this site.

**For Claude Code users:** See `CLAUDE.MD` first for Claude-specific quick reference, then return here for detailed role-based workflows.

---

## Ops & Logging (MANDATORY - NO EXCEPTIONS)

**CRITICAL REQUIREMENT:** Every code change, no matter how small, MUST append a new entry to `CHANGELOG_RUNNING.md` BEFORE committing or deploying.

- Never delete or rewrite prior entries - only append new ones at the top
- If you modify code but don't update the changelog, the change is INCOMPLETE
- Keep the exact entry format:

```
YYYY-MM-DD | h:mmAM/PM EST
———————————————————————
Change:
Files touched:
Notes:
Quick test checklist:
```

- "Files touched" must list actual edited filenames
- "Quick test checklist" must be manual checks (see Verification rules below)

---

## 1) Non-Negotiable Project Rules

### Stack & Structure
- Pure HTML/CSS/JS (no React/Vue/build tooling unless explicitly approved in writing)
- Keep changes surgical - prefer edits over rewrites
- Do not introduce new dependencies unless requested
- **Zero budget constraint** - No paid services ever (no Airtable Pro, ConvertKit, custom backend, etc.)
- Free tier tools only: GitHub Pages, Mailchimp free, Formspree free
- If it costs money, don't suggest it

### Design Intent
- "Prototype / command-line" aesthetic
- **Crisp lines only. No glow on accent lines.**
  - Do not add box-shadow halos, neon glows, bloom effects to accent lines
  - Accent lines are solid/clean; any animation is opacity/position only
- Cards/tiles remain minimal. Details go in modals/bio view

### UI Behavior Rules
- Do not place FilmFreeway links on tiles - FilmFreeway appears only in detail/bio view
- Avoid UI duplication:
  - IDs must be unique
  - Filter bars, drawers, modals appear once

---

## 2) Page Ownership & Expectations

### index.html (Home)
- Hero + work grid + contact portal
- Motion: GSAP/ScrollTrigger acceptable; must respect `prefers-reduced-motion`
- Voice agent: should not clutter top nav; must not cover content

### resources.html (Crown Jewel)
- Fast filtering & search is priority
- Category "hubs" preferred over too many tabs
- Favorites:
  - Local-only persistence via `localStorage`
  - Saved drawer is hidden by default and opens via button
- **Never render multiple quick-filter rows**

### events.html (Community Calendar)
- Default view: real month grid calendar
- Events must be local to Metro Detroit (~50 miles of Shelby Township, MI) unless explicitly overridden
- Clicking an event opens a modal with full details
- Avoid demo/sample events (no TX/CA/NY locations)

### portfolio.html
- Must remain snappy
- Prefer YouTube thumbnail-to-iframe ("lite") loading to reduce initial cost

---

## 3) Agent Roles (Who Does What)

Use these role-based workflows to organize multi-agent or multi-session work:

### A) Systems Editor (Translator Role)

**Use when:**
- Feedback is vague ("this feels wrong")
- Requirements are not settled
- You need a spec + acceptance criteria before implementation

**Outputs:**
- Frozen decisions
- Non-negotiables
- "Do / Don't" constraints
- Codex-ready prompt for execution

**Example prompt:** "I want to improve the resources page, but I'm not sure what exactly feels off. Help me clarify what needs to change."

### B) Site Engineer (Execution Role)

**Use when:**
- Spec is frozen and clear
- You want implementation and diffs
- Requirements are non-negotiable

**Outputs:**
- Minimal diffs (surgical changes only)
- Files changed list
- No re-architecture unless explicitly requested

**Example prompt:** "Implement the spec from Systems Editor: Add local-only filter to events page, defaulting to Metro Detroit (50mi radius from Shelby Township)."

### C) QA Checker (Verification Role)

**Use when:**
- You want smoke test steps or regression checks
- Post-implementation verification
- Pre-merge sanity check

**Outputs:**
- Test checklist (manual, due to environment constraints)
- Known high-risk areas to watch
- Console error checks

**Example prompt:** "Review changes to resources.html and provide manual test checklist for filtering and favorites functionality."

---

## 4) Working Method (Mandatory for All Assistants)

When given a task:

1. **Identify which files are touched** - Never change code you haven't read first
2. **Make minimal changes** - Surgical edits, no re-architecture
3. **Do not add duplicate UI** - Check for existing elements before creating new ones
4. **Provide acceptance criteria** - Clear definition of "done"
5. **Provide a short smoke test list** - Manual checks only (see below)
6. **Update changelog** - Append to `CHANGELOG_RUNNING.md` BEFORE considering work complete

### Verification Rules (Environment Constraint)

**Do not attempt Playwright install or automated screenshot capture** (proxy restriction).

Testing output must be:
- "Automated tests: Not run (environment restriction)"
- A manual verification checklist with click-path steps + observed outcomes
- A console error check step (DevTools) for the touched page(s)

### Changelog Requirement (Repeat for Emphasis)

**MANDATORY STEP:** Always append a new entry to `CHANGELOG_RUNNING.md` using the required template.

- This is NOT optional - treat it as part of the code change itself
- Format: Date | Title, Change, Files touched, Notes, Quick test checklist
- Add the entry IMMEDIATELY after making code changes, not as an afterthought
- **If changelog is not updated, the change is INCOMPLETE**

---

## 5) Local-Only Events Filter (Default)

Events are considered "local" if:
- Location contains "MI" or "Michigan", OR
- Location includes one of:
  - Shelby Township
  - Sterling Heights
  - Troy
  - Rochester
  - Royal Oak
  - Ferndale
  - Detroit
  - Warren
  - Clinton Twp / Clinton Township
  - Utica
  - Auburn Hills

**If location is missing or unrecognized: exclude by default.**

---

## 6) Quick Regression Checklist

After any merge, verify:

### General (ALWAYS)
- **VERIFY CHANGELOG FIRST:** Confirm `CHANGELOG_RUNNING.md` has a new appended entry at the TOP of the file
- Entry must include: Date, Change description, Files touched, Notes, Quick test checklist
- Confirm no console errors on the page(s) touched
- **IF CHANGELOG IS NOT UPDATED, THE CHANGE IS NOT COMPLETE - DO NOT MERGE/DEPLOY**

### Resources Page
- Only one group tab row
- Only one quickfilter row
- Saved drawer hidden until opened

### Events Page
- No TX/CA/NY demo locations (Metro Detroit only)
- Month grid calendar is default view

### All Pages
- No console errors in DevTools
- No visual regressions (glow where there shouldn't be, duplicate UI)
