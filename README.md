# LaB Media

A small film studio and a public notebook, run out of Shelby Township, Michigan.

**Live:** [labmedia.work](https://labmedia.work)

## What this is

A hobby, not a business. Eight films with production notes and behind-the-scenes
photos, a folder of good filmmaking links that seemed more useful public than
private, and a prompt generator for anyone who wants to shoot something this
weekend. Nothing costs money and nothing asks for an email.

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Hub — 2024 reel, film grid, resource shortlists |
| `portfolio.html` | 8 films, 9 production timelines, 7 BTS galleries (81 photos) |
| `resources.html` | 134 vetted links across 15 groups, collapsed by default |
| `ideas.html` | Story generator — 1,218 prompts across 14 pools |
| `events.html` | Self-expiring spotlight events plus an evergreen org list |
| `skybound.html` | SkyBound case study |
| `contact.html` | — |
| `404.html` | — |

## Tech

Plain HTML, CSS and JS. No framework, no build step, no backend, no
dependencies. GitHub Pages hosting on a custom domain.

- **`lab.css` is the whole design system** — one `:root` token block governs
  every page. This replaced 11 divergent `:root` blocks and 9 separate nav
  markups. Change a colour there and it changes everywhere.
- **Three themes** — dark (default), light, sepia. Switched via `data-theme` on
  `<html>`, remembered in `localStorage`, applied by an inline script in
  `<head>` before first paint so there's no flash. Every text colour is solved
  to WCAG AA (4.5:1) against all three surfaces.
- **No JS required for content.** Resource sections, BTS galleries and detail
  panels are native `<details>`/`<summary>`. JS adds search, the lightbox and
  the story generator, and nothing breaks without it.
- **YouTube loads on click only** — a poster image stands in until you press
  play, then a `youtube-nocookie.com` iframe is injected. Nothing contacts
  YouTube before that.
- **Touch is a first-class case.** Photos are grayscale-until-hover on desktop;
  under `@media (hover:none)` they arrive in colour instead, because a finger
  can't hover and 106 photos would otherwise be permanently grey.

## Data files

- `resources-data.js` — 134 entries. 6 are collaborators (people actually worked
  with) and are exempt from the Free/Paid tags.
- `ideas-data.js` — 1,218 prompts. Predates the rebuild and was deliberately
  left untouched; `ideas.html` was rewritten around it.

## Images

Only seven folders under `images/` ship: `brass`, `itsaboy`, `lejuice`,
`lookout`, `moz`, `scattered`, `traildead`. Each has a `thumb/` subfolder at
560px for grid loading; full 1800px files load only when the lightbox opens.

Everything else in `images/` is source material — HEIC originals and untouched
camera MOVs, ~868 MB — and is excluded by `.gitignore`, which **whitelists**
rather than blacklists. An earlier version listed folders by name in caps
(`IMAGES/lookoutbts/`) because that's how the SMB mount displays them; the
folders are lowercase on disk and git is case-sensitive, so none of it matched.
A new source folder is now ignored by default.

Two things that will bite on deploy:

- **Case matters on GitHub Pages** and not on macOS/SMB. `images/ItsABoy/` works
  locally and 404s live. Keep folder names lowercase.
- **HEIC doesn't render in Chrome or Firefox.** Convert to JPEG before uploading;
  never put a `.HEIC` in a shipping folder.

## Conventions

- Display type Instrument Serif, body Inter, labels and meta Space Mono
- Section numbers are zero-padded mono (`01`, `02`) — a running site-wide motif
- Accent `--accent` is the warm ember; `--sky` is reserved for SkyBound
- Every animation sits behind `prefers-reduced-motion`

---

*Shelby Township, MI*
