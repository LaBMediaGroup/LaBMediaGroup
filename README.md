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
| `learn.html` | Craft references and filmmaking education |
| `resources.html` | Software, AI, music, stock, type and 3D resources |
| `sourcing.html` | Gear shops, rentals and flight resources |
| `people.html` | Collaborators, festivals and community |
| `gear.html` | The Kit — what LaB actually owns, with verdicts and prices |
| `mykit.html` | A visitor's saved resource kit |
| `ideas.html` | Story generator — 1,334 prompts across 14 pools |
| `events.html` | Self-expiring spotlight events plus an evergreen org list |
| `skybound.html` | SkyBound case study |
| `droneweather.html` | Drone weather and flight-condition helper |
| `sun.html` | Golden-hour planning helper |
| `aspect.html` | Aspect-ratio previewer |
| `assistant.html` | LaB's grounded site guide |
| `contact.html` | About LaB and contact details |
| `colophon.html` | How the site is built, and what was quietly broken |
| `404.html` | Not-found page |

There are 17 indexable pages. `404.html` and the deliberately tucked-away
`ai-usage.html` dashboard are not listed in the sitemap.

## Tech

Plain HTML, CSS and JS. No framework, no build step, no backend and no runtime
dependencies. GitHub Pages hosting on a custom domain. A small Node test suite
runs in GitHub Actions to keep data, links, metadata and published counts aligned.

- **`lab.css` is the whole design system** — one `:root` token block governs
  every page. This replaced 11 divergent `:root` blocks and 9 separate nav
  markups. Change a colour there and it changes everywhere.
- **`--good`** is the affirmative green (free, verified, would-buy-again) and is
  defined per theme. A single hardcoded `#7FC8A0` sat at **1.89:1 on the light
  theme** — effectively invisible — and it was already live on the resources
  Free tag, so that was a real bug rather than a new one. Light uses `#2C6E49`.
- **Five themes** — dark (default), light, sepia, timber and forest. Switched via `data-theme` on
  `<html>`, remembered in `localStorage`, applied by an inline script in
  `<head>` before first paint so there's no flash. Every text colour is solved
  to WCAG AA (4.5:1) against all five surfaces.
- **Progressive enhancement, but only where it's true.** The portfolio is real
  HTML — 8 films, 9 timelines and 81 photographs in native `<details>` elements,
  1,248 words readable with scripts off. SkyBound too.

  **Resources, gear and the generator are not.** They render at runtime from
  data files, so with JS disabled they'd have shown a heading and nothing else.
  Each now carries a `<noscript>` block explaining why and linking the raw data
  file, which is readable on its own.

  The colophon originally claimed nothing on the site needed JavaScript. It took
  actually disabling JavaScript to catch that — a claim in a page about finding
  quietly broken things being itself quietly wrong.
- **YouTube loads on click only** — a poster image stands in until you press
  play, then a `youtube-nocookie.com` iframe is injected. Nothing contacts
  YouTube before that.
- **Touch is a first-class case.** Photos are grayscale-until-hover on desktop;
  under `@media (hover:none)` they arrive in colour instead, because a finger
  can't hover and 106 photos would otherwise be permanently grey.

## Your kit

Resources can be starred into a personal kit — stored in `localStorage` under
`lab-kit`, shown as a pinned group above group 01, hidden when empty.

Keys come from `keyOf()`, which slugifies the entry **name**. Only 18 of the 127
entries carry an explicit `id`, but all 127 names are unique and slugify
uniquely, so no data file had to change. Deriving from name rather than array
position means reordering or inserting entries never invalidates a saved kit or
a link already shared. Stale keys are pruned silently on load.

A kit encodes into `resources.html#kit=slug.slug.slug` — roughly 67 characters
for three items. An incoming link never overwrites silently; it offers add,
replace, or dismiss, and the hash is scrubbed from the URL either way.

## Data files

- `resources-data.js` — 127 entries. 6 are collaborators (people actually worked
  with) and are exempt from the Free/Paid tags.

  Four were removed in July 2026. **Detroit Independent Film Festival** —
  online-only quarterly award waves, its own name misspelled throughout its
  site, and submission copy still naming a different festival. **Short Film
  Block Party** — Bobby had no knowledge of it. **Krotos Studio** and **The
  Comedy Roll** were each listed twice; the grouping is first-match-wins
  precisely to stop an entry appearing in two places, so a second record was a
  workaround producing the duplicate the logic prevents. Both merged, keeping
  the better copy from each.

  A list that claims to be vetted has to be willing to drop things.
- `ideas-data.js` — 1,334 prompts across 14 pools.

  Originally 1,218 with 46 duplicates (mostly formatting twins created by the
  four `_additions` blocks that used to be concatenated on at the end; those are
  now folded into the main object). Deduping preserved deliberate opposite pairs
  such as camera-inside / camera-outside.

  More importantly, the tone selector barely worked. `filterWithRelaxation`
  drops the tone constraint whenever a pool has fewer than 6 matches, and 41 of
  72 tone/pool combinations were under that line — `visualStyles` and
  `emotions` had no tone tags at all. Every entry was retagged and 149 new ones
  written against the specific gaps; all 72 combinations now clear the
  threshold.

  `hasAnyTone` treats `neutral` as a wildcard, which is deliberate — a
  laundromat suits any tone, and structural prompts like "the ending must
  recontextualize the opening" belong in every roll. Roughly a third to a half
  of each pool is intentionally left neutral for that reason. Tagging is
  lexicon-driven and errs toward over-inclusion, since a wider pool is a much
  smaller problem than a filter that silently does nothing.

  **The tone selector never worked at all.** `opts()` in `ideas.html` passed
  `o.tone = [tone]`, and `hasAnyTone` does `tones.includes(toneWanted)` — an
  array compared by identity never matches, so every roll fell through to the
  neutral wildcards. Picking Horror returned zero horror concepts out of 2,000.
  It's a string now. Same class of bug hid in `genres`, where 23 of 25 entries
  were tagged neutral and therefore passed every filter; genres are tagged
  properly and 13 more were added so each tone clears the pool threshold.

  Concepts may carry a `setting`. Twenty-one of them state where they happen,
  and rolling an unrelated place on top produced briefs that argued with
  themselves. When a concept owns a setting the place field echoes it.

  The headline carries a **rolling word** — "Spark a _creepy_ film" — with the
  accent on only two things: the instruction ("Roll the die.") and the word that
  moves. An early version put the accent on the whole second clause and reserved
  `min-width: 5.5ch` on the word to stop the line jittering; at 100px display
  type that reserved a visible hole mid-sentence. No width is reserved now — a
  word landing every four seconds nudging the line is far less ugly than a
  permanent gap.

  It reuses the same `spin()` helper as the element cards rather than adding a
  second animation, and follows the tone selector — picking Horror stops it
  offering "tender". The two clauses are block-level spans rather than a `<br>`,
  so the line break is intentional at every width without landing in the
  accessible name.

  Three deliberate restraints: it stops while the tab is hidden, it settles on
  one word and stays put under `prefers-reduced-motion`, and the span is
  `aria-hidden` with a static "short" beside it, so a screen reader hears
  "Spark a short film" once instead of a heading that re-announces itself every
  four seconds.

  `maxIntensity` is a ceiling, not a target, and drives the "keep it light"
  toggle. There is deliberately no "heavy" setting — the library is written
  gentle (647 of 845 rated entries sit at 2), so a five-point dial would either
  mislabel prompts or silently relax, which is the bug above wearing a hat.
  Untagged entries always pass: no rating is not a claim about weight.

## In the LaB

A second pinned section above the groups, listing only what money actually went
on — three entries at the time of writing. Driven by an `inLab` field on the
resource itself rather than a hand-kept list, so it cannot drift out of sync:
add `inLab: 'why it earns its place'` to any entry and it appears in the
section, badges itself in its own group, and prints the note inside its detail
panel.

Deliberately short. A long list of things somebody claims to pay for is not
worth much, and the whole point is that this is the one endorsement on the page
with a price attached — everything else is a recommendation, which costs
nothing to give.

DaVinci Resolve stays tagged **free**, because the free version genuinely is
enough to finish a film and that matters more to a broke filmmaker than what
LaB happens to run. The `inLab` note carries the Studio detail instead.

Both pinned sections hide while searching or filtering, and the search set is
scoped to `#groups` — counting the pinned copies reported more matches than
were on screen.

## The Kit

`gear.html`, driven by `gear-data.js`. Every field except `name` is optional and
sections with no items are dropped from both the page and the jump rail, so a
half-written list reads as deliberate rather than broken.

Each item can carry a `verdict` — `again`, `maybe` or `no` — and a rough `paid`
figure. That is the point of the page: a gear list without a verdict is a
shopping list, and there are enough of those.

66 items across 12 sections, in two layers. Seven items flagged `key: true`
render as a headline strip at the top — the things that actually decide how the
work gets made. Everything else sits in `<details>` sections, closed by default
with a peek line, exactly like the resources page.

The first version listed all 64 as equal full-width rows, which gave gaffer tape
the same visual weight as a camera and read like an inventory audit. Nothing was
removed in the rebuild — completeness is part of being honest — it is weighted
instead. Thirteen items flagged `minor: true` render as compact chips under an
"Also in the bag" heading at the foot of their section.

`shared: true` marks gear that belongs to collaborators rather than to LaB —
Bobby asked for that explicitly so the page never implies he owns the whole
truck. Eight items carry it, and the badge is explained once at the foot.

Verdicts are deliberately sparse: only the four confirmed directly carry one.
Inventing "would buy again" opinions would defeat the point of the page.

`resource: 'Name'` cross-links an item to `resources-data.js`, and those same
links feed the **add-to-kit** button, which points at
`resources.html#kit=…&from=lab`. It deliberately reuses the share-link
mechanism rather than writing to a visitor's `localStorage` directly — consent
is already handled by the incoming-kit bar over there, and there is no second
code path to keep in sync. The `from=lab` flag only changes the wording, since
"someone shared a kit with you" is wrong when it came from our own page. Read
it before `history.replaceState` scrubs the hash, or it is always false.

## Coming back

The site had one thing that changed on its own — the story generator — and no
way to tell a returning visitor that anything else had.

- **Prompt of the day.** `ideas.html` seeds a roll from the calendar date, so
  every visitor gets the same brief and it turns over at midnight. Nothing to
  curate. Rolling by hand replaces it.
- **Shareable briefs.** A roll encodes into `ideas.html#b=hash.hash.hash`,
  each pick keyed by a hash of its own text rather than its index, so adding or
  reordering prompts never breaks a link already sent. Unresolvable picks are
  dropped rather than erroring.
- **New markers.** A resource with `added: 'YYYY-MM-DD'` shows a NEW tag for 60
  days and counts into the header rule. No date means not new — better than
  backfilling dates nobody can verify.
- **Feeds.** `feed.xml` and `feed.json` cover films, dated resources and
  spotlight events. Rebuild with `node _buildfeed.js` after adding any of the
  three; it reads the film list out of the portfolio's schema block so there is
  one source of truth.

## Analytics

One counter: **GoatCounter**, added July 2026. Open source, no cookies, no
persistent identifiers, ~3.5 KB. Their docs state it needs no GDPR notice,
which is why the site still has no consent banner.

The snippet is on every page but **guarded** — it skips `localhost` and
`file://` entirely. Production uses the `labmedia` GoatCounter site code.

The site total is drawn in the footer from GoatCounter's JSON endpoint
(`/counter/TOTAL.json`) rather than their built-in widget, which is a 200x80
bordered box carrying its own branding. The element ships `hidden` and is only
revealed if a number actually arrives — a disabled setting, a blocked request,
an empty response or a browser without `fetch` all leave no gap and no empty
label. Their responses cache for up to four hours, so it lags reality.

"Allow adding visitor counts on your website" is enabled in GoatCounter so the
footer can read the public total.

The colophon's figure list previously read "Trackers 00". Adding a counter meant
that had to change; it now reads "Cookies 00" and the page states plainly what
the counter does and does not do. A claim on a page about honesty has to survive
the thing it is describing.

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
