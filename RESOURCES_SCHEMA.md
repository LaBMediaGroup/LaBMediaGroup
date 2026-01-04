# LaB Media — Resources Data Contract

Single source of truth for resources displayed on `resources.html`. This prevents “tiles showing bio-only info” regressions.

## Resource Object (canonical)
Required:
- `name` (string) — display title
- `category` (string) — canonical category key (must match UI filters)
- `desc` (string) — short tile description (1–2 lines)
- `fullDesc` (string) — bio/detail description (multi-sentence allowed)

Common optional:
- `url` (string) — primary website link
- `labPick` (boolean) — show “LaB Pick” badge
- `paid` (boolean) — paid vs free badge logic (only where applicable)
- `features` (string[]) — bullet traits shown in bio
- `tags` (string[]) — secondary tags for filtering/search (if supported)

Social/media optional:
- `instagramUrl` (string)
- `youtubeUrl` (string) — for channels or specific videos
- `vimeoUrl` (string)
- `tiktokUrl` (string)

Film festival optional:
- `filmFreewayUrl` (string) — FilmFreeway link

## Rendering Rules: Tile vs Bio (Critical)
Tile/grid card MUST ONLY show:
- `name`
- `desc`
- small badges (category, labPick, free/paid if relevant)
- minimal tags if already part of the current design

Tile/grid card MUST NOT show:
- FilmFreeway URLs
- long descriptions (`fullDesc`)
- pricing tables / big link lists
- social icons cluster

Bio/detail view may show:
- `fullDesc`
- features
- primary links:
  - Website button if `url`
  - FilmFreeway button if `filmFreewayUrl`
  - Social icon buttons if corresponding URLs exist

## Category Rules
- Categories must be exclusive when intended.
  - Example: Film festivals should not leak into Community.
- If you support tags, tags can overlap, but the primary category must remain correct.

## Pricing Rules
Pricing is optional and only valid for categories that sell something or have tiers.
- Inspiration (YouTube channels) should NOT show pricing.
- If pricing exists, it belongs in bio view only (unless explicitly designed otherwise).

## “Lab Pick” Rules
- `labPick: true` shows a badge on tile and bio.
- Do not overload “Lab Pick” into multiple different visuals.

## Data Hygiene
- No duplicate resources by name.
- URLs must include protocol (`https://`).
- Keep descriptions human and clean (no keyword spam).
- If info is unknown, omit the field; don’t invent.

## Events extraction hooks (future-proofing)
If a resource has known event dates:
- Prefer adding event info to a separate `events-data.js`
- Or add optional fields (only if we decide to support it consistently):
  - `eventDate` (YYYY-MM-DD)
  - `eventEndDate` (YYYY-MM-DD)
  - `deadlineDate` (YYYY-MM-DD)

But do not sprinkle inconsistent date fields across random items without a plan.
