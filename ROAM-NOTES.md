# Explore prototype (free-roam) · Nov 26 2026

A local prototype of walking the labmedia.work field yourself, with Labcoon living on the bank. It runs the homepage's own pond world (`pond/world.js`). Nothing about the scroll homepage changes. Branch `free-roam-prototype` (worktree `GitHub/labmedia-roam`, cut from `origin/main` 313895a). Local only: not pushed, not deployed.

Open `explore.html` (preview config `lab-roam`, http://127.0.0.1:5430/explore.html). `?at=15:10` previews another time of day. `?wind=18` sets the wind.

## What's in it

- **Walking:**
  - Desktop: WASD/arrows (Shift runs), drag to look, click the ground to walk there.
  - Phones: drag to look, tap the ground to walk there.
  - Eye height is 1.55 m on the real terrain. You can't walk into the pond, the oak's trunk or the shed pad. You slide along the shore instead of stopping dead.
- **Labcoon:**
  - He lives on the near bank and wanders it: walk (0.21 m/s, the clip rate scaled to match so his feet don't skate), idle and sniff.
  - Now and then he finds a bottle cap: `pick_up` → two turns of `hold_find` → `set_down`. The cap rides `interaction_target` between the grip and the release.
  - The HUD says what he's doing.
- **Follow:**
  - Tap or click Labcoon, the button, or F starts a third-person camera behind him. Drag orbits it and the wheel zooms.
  - F, Esc or Walk puts you back on foot behind him.
- **Light:** Labcoon is lit from the world's own sky uniforms (sun direction, colour, day/gold/night). His materials get the same display transform as the world's shaders, so he sits in the same light.
- **Hooks in `world.js`:**
  - `LabWorld.explore(hook)` hands the camera to the hook each frame and returns the scene, ground height, shed test and sky uniforms.
  - On `explore.html` only, the stubble is scattered out to 40 m (15,000 blades, 6,500 on small screens) so the far field isn't bare.
  - The drone course always flies on this page.

## Timing (local Chrome, Apple M4 GPU)

| View | Median frame |
|---|---|
| Desktop 1366×850 | 16.7 ms (60 fps, vsync-capped) |
| Phone-sized 390×844 @2× | 16.7 ms (60 fps) |

These numbers come from the Mac's GPU. **Real-phone speed is unmeasured.** It needs a Wi-Fi test on Bobby's phone. `tests/roam-check.cjs` reruns the timings and the walk-around survey. `tests/roam-record.cjs` records the walk-and-follow clip.

## Round 2 (Nov 26): Labcoon's places, the field edges, and the brain driving him

- **Places** (`pond/labcoon-places.js`): each one gets a real spot in the field, sampled from the actual shoreline.
  - **Culvert (home):** an 18 in corrugated steel field drain coming out of an earth berm on the north-east bank, with riprap.
  - **Washing rock:** a flat fieldstone half in the shallows on the east shore.
  - **Art shed:** a raccoon-sized scrap lean-to on the north bank, with a pallet back, corrugated roof, crate desk and pinned drawings.
  - **Farm lane:** a two-track on the west side, running through the corn.
  - **Trash can and mailbox:** a 20 gal galvanized can with a bail lid, and a T1 rural mailbox on a 4×4 post, both by the lane.
  - **Picnic table and bird feeder:** places the brain discovers later.
  - **Already there:** the oak, drone course, corn and pole line are mapped too.
  - Every stand spot checks itself against the real ground.
- **Field edges** (explore page only):
  - Corn now stands in a full ring from the clearing to the terrain edge, thinning raggedly at its inner edge, with the lane cut through it. It's planted wider apart than the homepage's corn: 0.32 m, or 0.5 m on small screens.
  - The far-ground haze is thinner, so there's no pale stripe under the tree line.
  - The field shows more straw.
  - Poles and every place are solid for the walker.
- **Brain-driven Labcoon:** the scripted wander is gone. He now lives a night from the brain: `pond/labcoon/night.json` is 179 events from `sim-3`, cleaned to move + place + his own first sentence. Visitors' mail text and fence tests are left out.
  - Each event becomes tasks. For a walk he trots past 5 m (0.58 m/s, trot clip at 2×) and walks closer in (0.21 m/s). Routes go round the pond on a ring of dry points.
  - **Clips per move:**
    - `wash` at the rock
    - `fish` / `look_back` for fish
    - `beg` at the mailbox
    - `pry` at the trash can
    - `draw` at the art shed
    - `sleep` then `wake` for naps
    - `moon` for moon-watching
    - pick up → hold → set down for finds
    - `swim` out to the middle and back out at the nearest shore
  - The HUD shows his journal line with its time.
  - `?speed=4` runs his night faster for review.
  - Live, the brain service sends the same events.
- Checks: `tests/night-check.cjs` (a 90 s night at 4×: tasks, clips, never on wet ground except swimming), `tests/places-shots.cjs` (close-ups). Timing with the corn ring is still 60 fps at desktop and phone sizes on the M4.

## Still open

1. Real-phone speed, especially the corn ring and stubble counts. Needs a Wi-Fi test on Bobby's phone.
2. The brain's own map (`labmedia-raccoon/brain/lib/world.js` PLACES) is still a rough sketch with different coordinates. Move it to these field positions so walk times match what visitors see. Keep one shared list.
3. No collision on course gates, the anemometer mast, cattails or corn; Labcoon himself ignores the walker colliders. The shed still can't be entered.
4. Swimming uses the surface `swim` clip at a guessed waterline (y = −0.055). It needs a close look at the water.
5. Finds are always a red bottle cap. The brain's items (nail, toy car wheel, acorn…) should each get their own small model.
6. Labcoon carries nothing between places. A small-find carry (mouth or one paw) is the next motion.
7. The art shed's drawings are random scribbles. They should be his real SVG drawings from the brain.
8. Underwater and the film TVs aren't reachable on foot.
9. Grass in front of the follow camera sometimes hides him.

## For the Explore/Browse direction doc

- **Map:** where Labcoon's places and the portfolio landmarks sit relative to the pond, shed and course. Explore and the flat Browse pages should share one list.
- **Landmarks:** what you can click while walking (film TVs, shed tools, course sign), and whether they open the same panels as Browse.
- **Phone budget:** corn ring or not, the stubble count, and the quality steps.
- **First screen:** two doors (Explore / Browse) over the live field.
