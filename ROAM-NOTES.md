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

## Round 3 (Nov 26): game UI

`pond/explore-hud.js`, styled in the LaB look (Bebas Neue, Space Mono, Instrument Serif for his thoughts, the orange):
- **Labcoon card** (top left):
  - his mood, where he is and what he's holding
  - his current thought
  - his plan as a quest list (done steps ticked, the current one in orange)
  - five needs bars (hunger, energy, joy, boredom, curiosity)
  - his project
  - On phones it folds to a one-line chip; tap to open.
- **Map** (Map button):
  - top-down field with the real shoreline (sampled from the terrain), his places, the lane and the shed
  - you as a live blue arrow, Labcoon as a live orange dot
  - tap a place, or a "take me to" button (Labcoon, culvert, washing rock, art shed, mailbox, the LaB shed, drone course, the oak), to stand 2.6 m from it, facing it
- **Tap Labcoon:**
  - Asleep, three taps wake him the way the brain plans: an ear flick, then a yawn and roll, then `wake` + `wake_grumble`, and he's grumbly.
  - Awake, a sheet lets you **say hi** (5 a day, counted in the browser). His reply shows in a speech bubble over his head, and he turns to look at you.
  - Replies are a canned **offline preview** in his voice, picked by mood. Live, the Worker passes the line to his brain with the visitor caps and filters.
- **Journal line** (bottom): his current event with its time.
- **Brain side:** `brain/sim.js` now writes a `hud` snapshot with every event (mood, place, asleep, holding, project, needs, thought, plan steps, current step).
- **Replay:** `tools/make-night.cjs <events.jsonl>` turns a sim night into `pond/labcoon/night.json`. It keeps the HUD state, drops visitors' words and free-text arguments, and drops any thought that looks like money, links or injection.
- **Checks:** `tests/hud-shots.cjs` (desktop and phone: card, map, take-me-to, tap and say hi). It caught a hidden map overlay that was swallowing every tap on the field.

## Round 4 (Nov 26): live

- **Live mode:** `explore.html?live=<service base>` (local: `http://<mac>:8788/api/labcoon`).
  - On arrival it reads his state, places him where the brain says he is (afloat if he's in the pond), and shows his last line.
  - It then pulls new events every 3 s and turns each into the same tasks as the replay. If it falls behind, he jumps ahead to stay true.
  - Brain events that are just a clip (ear flick, yawn and roll, waking) play that clip.
- **Visitors in live mode:**
  - Tapping him while he sleeps sends a real tap to the brain, which flicks an ear, then yawns and rolls, then wakes. In his 10am–noon long sleep he only mumbles.
  - Say hi goes to his real brain through the service. The bubble shows "…" until his reply arrives (3–5 s in tests).
- **Fallback:** without `live`, or if the service is unreachable, it replays a brain night as before.
- **Visitor id:** a random id kept in the browser (`labcoon-vid`). The service adds a daily connection hash.
- **Check:** `tests/live-check.cjs` (connects, taps or opens say hi, gets his real reply).

## Round 5 (Nov 26): game UI, art and music

- **Look:** LaB × toy-sticker (`pond/explore.css`; research in `PINO-UI-NOTES.md`):
  - cream panels, one deep pond-ink colour, chunky outlines, hard no-blur shadows, pill buttons that press down
  - Bebas Neue titles and Nunito body
  - a colour per need
- **Layout** (`pond/explore-hud.js`):
  - needs strip with coloured icons
  - a "right now" card: activity, his thought, plan as a checklist, "lately", "his journal"
  - clock pill from the real sky (sun or moon) and a sound toggle
  - round "His things" menu and a radar map
  - a status pill in his voice turned third person ("dips his paws in pigment")
  - follow button, and an orange "Leave him something" button
  - a loading screen with Labcoon trundling along a lane
- **Leave him something** (sheet):
  - **Say hi:** 5 a day.
  - **Note:** 1 a day, mailed to the service.
  - **Doodle:** a 96×96 pad with six colours, 1 a day.
  - **Swap:** coming soon.
  - **Yours:** what you sent and what he said, kept only in your browser.
- **His things** (sheet):
  - **Art:** his drawings from the service; a sample wall when he's offline.
  - **Songs:** his tunes with play buttons; a tiny synth for ocarina, tin whistle, thumb piano, toy xylophone and harmonica.
  - **Journal:** his recent lines.
  - **Map:** with take-me-to.
- **His tunes in the field:** you hear them when you're within 14 m or following him. He sits up to play; mud drawings scratch at the bank.
- **Checks:** `tests/ui-shots.cjs` (desktop and phone: loading, main, card, both sheets, doodle, art, songs, map). It caught a `.now` class clash.

## Still open

1. Real-phone speed, especially the corn ring and stubble counts. Needs a Wi-Fi test on Bobby's phone.
2. ~~One map~~ **Done Nov 26:** `pond/labcoon/places.json` is a synced copy of the brain's `brain/lib/places.json` (field metres, stand spots, flags). The brain's walk times follow the route round the pond. Edit the brain's file, then `node tests/places-sync.cjs --write`. `tests/map-check.cjs` boots Explore from it: no errors, no stand spot in the water, Labcoon never more than a damp paw into the pond except swimming. It also fixed a swim-back bug, where he walked the pond floor home.
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
