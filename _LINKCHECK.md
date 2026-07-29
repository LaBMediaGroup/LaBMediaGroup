# Link check — 28 July 2026

> **Status: closed.** All edits applied. Four entries removed (134 → 130) and
> two duplicate pairs merged. Le Juicé spelling is the only item still open.

181 unique external URLs across `resources-data.js`. 79 of those sit on large
platforms (YouTube 35, Instagram 18, Facebook 10, FilmFreeway 10, Spotify 3,
Campfire 3) where rot is unlikely. That leaves 102 independent domains; I
checked the 22 most likely to have died — local orgs, Michigan festivals,
collaborator sites and small indie tools.

**Nothing is dead.** Every one still resolves. But six need edits, because the
link working is not the same as the description being true.

---

## Needs an edit

### 1. Horror Hotel Film Festival — description is two things out of date
Your copy: *"Celebrating its 15th anniversary in 2026 … a 4-day event in
**Middleburg Heights**, Ohio."*

Their site now says **"Scary 16!"**, announces **2027: June 24–27**, and carries
a banner reading **NEW LOCATION!!** — the footer now gives **Cleveland, Ohio**.

So the anniversary number and the town are both stale. The Ohio tag you asked
for is still correct.

### 2. Cinetopia — the festival moved organisations
`cinetopiafestival.org` still works, but it redirects to
`marquee-arts.org/cinetopia`. It now runs under **Marquee Arts** (Michigan
Theater / State Theatre, Ann Arbor). Their page says the next edition is
**May 2027** — 2026 has already happened.

Worth pointing the link straight at `https://marquee-arts.org/cinetopia/` so it
survives the day the old domain stops redirecting.

### 3. Fresh Coast Film Festival — the link loads nothing
`freshcoastfilmtraversecity.ludus.com` returns an **empty page**. So does
`freshcoastfilm.org`. Could be a ticketing page that only renders with
JavaScript, or it could be gone. This one genuinely needs your eyes.

Also worth confirming the city — your description says **Traverse City**, and
that's worth double-checking against whatever the festival currently says.

### 4. Le Juicé — they spell it "Le Juice"
Their own site uses **Le Juice** throughout: page title, `og:site_name`
("Le Juice Rochester"), and the footer copyright ("© 2026 LE JUICE"). One
instance of "Lé Juice" appears in body copy. Nowhere does it say "Le Juicé".

You've worked with them, so you'd know better than their Wix site — but worth a
glance before someone else notices.

### 5. Detroit Independent Film Festival — no link at all
One of three entries with no `url`. Either find the current one or drop it; a
resource nobody can click isn't doing work. (The other two are The Pandys and
Short Film Block Party.)

### 6. Royal Starr — their site is the stale one, not yours
Their homepage still advertises *"2025 Royal Starr Film Festival … September
11–14, 2025"*. Your description sensibly avoids dates, so nothing to change —
just don't be surprised if a visitor sees old info there.

---

## Confirmed healthy

Anthony Brass · MOZ Interiors · Joe Garofalo Music · Sideways Studio ·
Panda House Detroit · Le Juice · Royal Starr · Mograph Mondays · Actors Loft ·
Detroit Filmmaker Awards · The Comedy Roll · Horror Film Roulette ·
Creepy Cheapy · KickstART Farmington · Horror Hotel · Detroit Media Services ·
Ten Hundred · ENDE.app

Two nice finds: **Anthony Brass credits "VIDEO BY LAB MEDIA" on his own site**,
and **The Comedy Roll links to Horror Film Roulette** — the two competitions
you've shot for are formally connected.

---

## Not yet checked (80 independent domains)

Mostly stable commercial tools — Blender, Adobe, Google, B&H, Pixabay,
Freesound, Artlist, DaVinci Resolve, and similar. Lower risk, but the volatile
ones worth a future pass are the **AI tools** (several are startups less than
two years old) and the **FPV shops**, which turn over fast.

Ask me to run a second batch whenever you want them done.


---

## APPLIED

- **Horror Hotel** — now "16th, June 24–27 2027, Cleveland", venue corrected
  from Middleburg Heights. Rewrote the description around the competitions,
  which are the actual reason to enter.
- **Cinetopia** — link repointed to `marquee-arts.org/cinetopia/`, description
  now names Marquee Arts and calls out the Michigan-Made Shorts Showcase.
- **Fresh Coast** — this was the big one. See below.
- **Location badges** — they never rendered. Now they do, on 7 festivals.

### Fresh Coast was wrong in three ways

Your entry read *"Traverse City festival focused on fresh voices and community
screenings"* and linked to a Ludus ticketing page.

It is actually a **documentary** festival about the Great Lakes and Upper
Midwest — outdoors, water, environment — held in **Marquette**, not Traverse
City. Four days, 80+ films, 10 venues, plus outdoor tours built around the
programme. 2026 was its 10th year. Oct 15–18.

The Traverse City event you linked was a **separate inaugural spin-off**,
April 30 – May 3 2026, which has already happened — so that link pointed at a
dead one-off rather than the festival.

Link now goes to `freshcoastfilm.com`, with the FilmFreeway submission page
attached. **The badge you asked for now reads Marquette, not Traverse City** —
flagging that explicitly because it reverses an earlier request of yours, and
the reason is that the festival simply isn't a Traverse City festival.

### The badges you asked for never existed

You asked for an Ohio tag on Horror Hotel and a city badge on Fresh Coast.
Both went into `locationBadge` in the data — and **nothing in `resources.html`
ever read that field.** They have been invisible since the day you asked.

Now rendered as a pale-blue pill with a ⌖ marker, on: Royal Starr (Birmingham),
Cinetopia (Ann Arbor), Creepy Cheapy (Pontiac), Detroit Filmmaker Awards
(Detroit), Farmington (Farmington), Fresh Coast (Marquette), Horror Hotel
(Northern Ohio).

Every city was read off that festival's own site during this check. The
remaining festivals are unbadged because I could not verify them — add
`locationBadge: 'City'` to any entry and it appears.

---

## FLAGGED — your call

### Detroit Independent Film Festival

I found the missing link — `detroitindependent.org` — and then decided not to
add it. Read this first.

On their own homepage:

- The festival's name is **misspelled in their own copy**, repeatedly:
  "Detroit Inependet Film Festival", in the heading, the body, and the footer.
- The submission section ends: *"then **Niagara Falls Film Festival** is the
  perfect place for you"* — copy-pasted from a different festival and never
  corrected.
- It is **online only** — "Join us for an online event of screenings".
- Winners run in quarterly waves: Spring 2026, Fall 2025, Summer 2025, Winter
  2025, Summer 2024, Winter 2024, Summer 2023.
- Footer copyright still says **2022**.

Quarterly online award waves with per-entry fees and no physical screening is
the shape of a laurel mill — you pay, you get a laurel, nobody watches it in a
room. That may be unfair to them, and you know the Detroit scene far better
than I do.

But your own callout says the list *"only stays good if it stays honest"* and
that you'd *"rather it be right than long"*. Adding a link to this one would
work against that, so I left the entry linkless rather than make the call for
you.

**Resolved: cut.** Removed 28 July 2026. Counts updated everywhere — 134 → 133
entries, festivals 12 → 11, and the homepage "Film Fests" row now reads 11
links. No other entry referenced it.

**Short Film Block Party** was cut too — you had no knowledge of it, and an
unvetted entry on a vetted list is worse than a shorter list.

**The Pandys** keeps its missing URL on purpose: they are a band you filmed,
they exist on streaming, and the entry links their socials.

### Two duplicate pairs found while removing those

Listing the festivals turned up **The Comedy Roll** twice — as "Comedy Roll
Film Festival" and "The Comedy Roll", same URL, both in film-festivals. A URL
sweep then found **Krotos Studio** listed twice as well, once under `ai` and
once under `soundfx`.

The grouping logic is first-match-wins *specifically* so nothing appears in two
places — so a second record was a workaround that produced exactly the
duplicate the logic exists to prevent. Both merged, keeping the better copy
from each side.

The Comedy Roll entry is now written from what their site actually says: roll
two dice, one picks the comedy genre, four weeks to shoot five minutes, top 25
screen in a theater for $2,000. Neither original entry mentioned the dice,
which is the entire premise. Lookout's Top 25 placement is preserved.

Two remaining shared URLs are intentional: Royal Starr's institute vs its
festival, and Claude.ai vs Claude Code — different things, different groups.

### Final counts

134 → **130** entries. Festivals 12 → 9. AI 18 → 17. Music stays 21 (Krotos
moved into it from AI, offsetting the merge). Homepage row counts updated to
match: References 21, Drone 19, AI 17, Music 21, Film Fests 9.
