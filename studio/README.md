# LaB studio prototype: window → calendar → fridge → projector

Private. Branch `studio-room-prototype` in the worktree `GitHub/labmedia-studio-room`. Nothing is committed, pushed or deployed, and the live site and `~/labmedia-site` are untouched.

Pitch and tool-to-object audit: [DIRECTIONS.md](DIRECTIONS.md). The chosen direction is A, Late Light Loft. The story generator moves from the fridge to a slide projector on a cart.

## Run it

Serve the repo root (any static server), then open `/studio/`:

- `studio/?date=2026-11-18&minute=955#window` opens at the window, 3:55 PM.
- `#events` opens on the calendar wall (on phones `#board` opens on the corkboard), `#fridge` on the story magnets, `#projector` on Selected work. `&tone=comedy` (any ideas.html tone) and `&film=brass` carry over.
- `date` and `minute` stay in the URL, so the return trip, a reload or a shared link keep the chosen time.

Check script (reuses the Playwright in `lab-crew-room`, plus Google Chrome and the cached WebKit build; nothing is installed):

```
node studio/check-studio.mjs chromium <outdir>
node studio/check-studio.mjs webkit <outdir>
```

It walks window → turn → events, drags back with a 0.9 s pause mid-drag, and lifts the flyer. Then it shakes the fridge (the idea must change), switches tone, and checks that the reel is rolling at the projector. It confirms the screening turns on (and reports how much of the width the picture fills), that Pause brings the lights back, switches to the Brass reel, and confirms the film pauses when you walk away. It also opens a deep link at dusk and plain view, at 1366×800 and 390×844, and fails if plain view scrolls sideways.

## Round 3 (Nov 18, after Bobby's iPhone test)

- **Flat view** is its own designed page: `flat.js` and `flat.css` render into `#flat`. The 3D room steps aside on the `lab:flat` event and hands over the URL state.
- **Getting around:** one station bar (Window · Events · Fridge · Films) replaces the per-wall back/next buttons. Panels hold only their wall's controls. On phones, the events wall has a Calendar/Corkboard switch.
- **Fridge on phones:** the words run the whole door (skipping the handle band) at up to 66 mm tiles, the camera frames the door, and the notes sit low. The brief is a tap away under "The notes on the door".
- **Screenings:** the panels, station bar and header step away and a small corner bar (Full screen · Pause) remains. The camera frames the picture against the whole screen, which fills 94% of the width on desktop and 88% of the height on a phone held sideways.
- **Golden hour:** the outside carries its own exposure (`expComp`), so dusk lamps and screenings never dim the sky. The sky has forward-scattering halos, a burning horizon band under a low sun, and clouds lit from below. The field has furrows that throw shadows at low sun, rye patches and aerial haze. There are two depths of bare November tree line, a farm fence and a run of utility poles with sagging lines. An anamorphic lens flare (streak, ghosts, veiling glare) appears when the low sun is in the lens through the glass. The mullions eclipse it and the shade blocks it.
- **Baked AO:** `blender/bake_ao.py` gives the room's big surfaces a Lightmap UV and bakes Cycles ambient occlusion (1.1 m reach) into `assets/ao/*.jpg` (832 KB in all), applied as aoMaps. Rerun it after any `build_loft.py` rebuild, then re-export.

## How it's built

| Part | Where |
| --- | --- |
| Room geometry, materials and lighting source, camera marks and test move | `blender/build_loft.py`. The .blend, renders and GLB live on **LaBMedia2TB/LaB-Studio-Room/** |
| Web export (interior only, 180 KB) | `blender/export_web.py` → `assets/loft.glb` |
| Browser scene | `studio.js`: three r180 (vendored copy, MIT) with procedural canvas textures, NOAA sun from `../sun-calc.js`, a mullion-striped beam, dust, a bounce from the sun patch, and practicals that fade up after sunset |
| Calendar | Real `SPOTLIGHT` records (`../spotlight-data.js`). Real HTML, projected onto the wall's paper with a CSS homography. The ink multiplies over the 3D paper so it takes the room's light |
| Flyer | A real button pinned over the 3D flyer. Click lifts the sheet off the board into a `<dialog>`; "Pin it back" returns it |
| Story magnets (fridge) | The fridge is modelled after the Smeg FAB28 (1530 × 601 × 728 mm, right-hinged; [spec sheet](https://cdn.shopify.com/s/files/1/0503/8663/2867/files/FAB28LPB5UK-1.pdf), [photos](https://www.smeg.com/hk-en/products/FAB28RDEG5)). It has a pillow door with rolled 32 mm edges and a rounded cabinet top, a chrome lever handle on the opening side at 0.97 m, a chrome LaB nameplate in place of the brand, a stainless kick strip on feet, and a gasket line. The site's own `rollIdea` + `ideas-data.js`, same tones as ideas.html. The idea is spelled in magnetic-poetry word tiles (real 3D tiles that take the room's light and shadow). Four prop magnets pin notes: house = place, figure = who, key = thing, star = twist. **Shake it up**, or tap the door: the door yanks open and slams, the old words tumble to the floor (gravity, bounce, then they tidy away), and the new words slap on one by one with a quiet synthesised click. The brief is real text in the dock |
| Selected work (16 mm projector) | Local reels: `assets/selected-work/moz-interior-v3.mp4` and `assets/hero-v4/AnthonyBrass-Paintingclip.mp4`, muted and looping, thrown on the east wall as light (screen blend). **Screening:** while a reel plays at the projector, the blackout roller shade comes down over the window (it really blocks the sun's shadow-casting light, with a sliver leaking at the edges), the house lights and practicals dim, the beam fades, and the camera pushes in to a screening seat where the picture fills the frame. Pause or walk away and the room comes back. The lamp throws a 16:9 rectangle (a cookie with lens shift), not a round pool. **Full screen** hands the film to the native player (iPhone: `webkitEnterFullscreen`), and portrait phones get a "turn sideways" hint. Full films link to YouTube |

The camera turns clockwise: window (west) → events (north) → fridge (north-east corner) → projector (east wall). The projector shot is hand-placed with a long lens behind the cart, so the projector sits in the foreground under its beam.

The building is turned so the window faces 232° (south-west), which gets direct sun from midday through sunset all year. The same value lives in both `build_loft.py` and `studio.js`.

## Without 3D or animation

- **Plain view** (top right, remembered per browser): no WebGL. You get the Golden Hour scrubber and times plus a normal calendar page and a flyer button.
- If WebGL fails, the page falls back to plain view on its own. Without JavaScript you get links to `sun.html`, `events.html` and `ideas.html`.
- Reduced motion turns the camera moves into cuts and stops the dust. It skips the flyer lift and page flip, swaps the fridge words with no door swing, and leaves the reel paused until you press Play.
- The keyboard works throughout: Tab moves through real controls, the arrow keys turn, the slider has an `aria-valuetext`, and Escape pins the flyer back.

## Safari drag fix

The old room loads `brand-motion.js`. A paused drag over its mark could lift a large ghost of the logo. Here there's no brand animation at all, and images have `-webkit-user-drag:none`. The stage blocks `dragstart`, the long-press callout and text selection, and a paused drag just holds the pan. The check script confirms that no large image appears during a paused drag in WebKit and Chromium.

## Needs a real iPhone

1. A long-press, then a paused drag with a finger, in Safari and in the installed home-screen app. Headless WebKit used a mouse, not touch.
2. Text sharpness on the projected calendar. Safari can rasterize `matrix3d` layers soft.
3. The bottom dock against the home indicator, and the top ~85 pt blur on installed apps (see the Little Table and Ballcap notes).
4. Frame rate and heat: 2048 px shadows on desktop and 1024 px on phones, with pixel ratio capped at 2. Watch for thermal throttling over a minute of scrubbing.
5. `mix-blend-mode: multiply` over WebGL on iOS. If it composites wrong, the calendar ink could look washed out.
6. `<input type=date>` and the slider thumb in iOS Safari.

## Known gaps / next

- Fridge: the lever is a bowed bar. The real FAB28 lever has a sculpted body, and the door has no inner liner (it opens about 30° in the shake, so you never see inside).
- Blender stills are a lit blockout. The browser look (painted tree line, limewash, oak) isn't baked back into the .blend yet.
- The corkboard holds one real flyer. The other papers are blank, and no other events have art.
- November 2026 has no listings, so the calendar says so and links to the latest event. It invents nothing.
- Drone case, shelf (Notebook), desk (Assistant, Selected work) and contact are staged or planned, but not wired up.
- The door thunk and magnet clicks are synthesised Web Audio. Check their volume on a phone, and that nothing plays before a tap.
- Muted inline autoplay of the reels on iOS, and whether the screen-blended `<video>` composites correctly over WebGL in iOS Safari.
- The repo's site tests show 8 failures that already exist on `main`. They fail the same way without this folder.
