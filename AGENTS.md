# LaB Media — Agents & Workflow (AGENTS.md)

This repo is a static website (HTML/CSS/JS). No frameworks, no build step.

This document defines how to work on the site using coding assistants (Codex, ChatGPT, Claude Code, etc.) without breaking design intent or duplicating UI.

Ops & logging (mandatory)
	•	Every PR/change must append to CHANGELOG_RUNNING.md (never delete or rewrite prior entries).
	•	Keep the exact entry format:

  YYYY-MM-DD | h:mmAM/PM EST
———————————————————————
Change:
Files touched:
Notes:
Quick test checklist:

“Files touched” must list actual edited filenames.
	•	“Quick test checklist” must be manual checks (see Verification rules below).

---

## 1) Non-negotiable project rules

### Stack & structure
- Pure HTML/CSS/JS (no React/Vue/build tooling unless explicitly approved in writing).
- Keep changes surgical. Prefer edits over rewrites.
- Do not introduce new dependencies unless requested.

### Design intent
- “Prototype / command-line” aesthetic.
- **Crisp lines only. No glow.**
  - Do not add box-shadow halos, neon glows, bloom effects.
  - Accent lines are solid/clean; any animation is opacity/position only.
- Cards/tiles remain minimal. Details go in modals/bio view.

### UI behavior rules
- Do not place FilmFreeway links on tiles. FilmFreeway appears only in the detail/bio view.
- Avoid UI duplication:
  - IDs must be unique.
  - Filter bars, drawers, modals appear once.

---

## 2) Page ownership & expectations

### index.html (Home)
- Hero + work grid + contact portal.
- Motion: GSAP/ScrollTrigger acceptable; must respect prefers-reduced-motion.
- Voice agent: should not clutter top nav; must not cover content.

### resources.html (Crown jewel)
- Fast filtering & search.
- Category “hubs” are preferred over too many tabs.
- Favorites:
  - Local-only persistence via localStorage.
  - Saved drawer is hidden by default and opens via button.
- Never render multiple quick-filter rows.

### events.html (Community calendar)
- Default view should be a real month grid calendar.
- Events must be local to Metro Detroit (~50 miles of Shelby Twp, MI) unless explicitly overridden.
- Clicking an event opens a modal with full details.
- Avoid demo/sample events.

### portfolio.html
- Must remain snappy.
- Prefer YouTube thumbnail-to-iframe (“lite”) loading to reduce initial cost.

---

## 3) Agent roles (who does what)

### A) Systems Editor (translator role)
Use when:
- Feedback is vague (“this feels wrong”)
- Requirements are not settled
- You need a spec + acceptance criteria
Outputs:
- Frozen decisions
- Non-negotiables
- “Do / Don’t” constraints
- Codex-ready prompt

### B) Site Engineer (execution role)
Use when:
- Spec is frozen
- You want implementation and diffs
Outputs:
- Minimal diffs
- Files changed list
- No re-architecture

### C) QA Checker (verification role)
Use when:
- You want smoke test steps or regression checks
Outputs:
- Test checklist
- Known high-risk areas

---

## 4) Working method (mandatory for assistants)

When given a task:
1. Identify which files are touched.
2. Make minimal changes.
3. Do not add duplicate UI.
4. Provide acceptance criteria.
5. Provide a short smoke test list.

Verification rules (environment constraint)
	•	Do not attempt Playwright install or automated screenshot capture (proxy restriction).
	•	Testing output must be:
	•	“Automated tests: Not run (environment restriction)”
	•	A manual verification checklist with click-path steps + observed outcomes
	•	A console error check step (DevTools) for the touched page(s)

Changelog requirement (repeat here so it’s never missed)
	•	Always append a new entry to CHANGELOG_RUNNING.md using the required template.

---

## 5) Local-only events filter (default)
Events are considered “local” if:
- location contains “MI” or “Michigan”, OR
- location includes one of:
  Shelby Township, Sterling Heights, Troy, Rochester, Royal Oak, Ferndale,
  Detroit, Warren, Clinton Twp/Clinton Township, Utica, Auburn Hills

If location is missing or unrecognized: **exclude by default**.

---

## 6) Quick regression checklist
After any merge:
- Resources page:
  - only one group tab row
  - only one quickfilter row
  - Saved drawer hidden until opened
- Events page:
  - no TX/CA/NY demo locations
  - month grid calendar default
- No console errors
- General:
	•	Confirm CHANGELOG_RUNNING.md has a new appended entry for the change
	•	Confirm no console errors on the page(s) touched
