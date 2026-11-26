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

## Gaps found by walking round (the scene was staged for the scroll camera)

Fixed here: stubble now reaches the tree line in every direction, and the walker no longer passes through the shed or the oak.

Still open:
1. **Corn stops at a hard straight edge.** It was planted only in the wedge the camera saw (`corn` in `world.js`). Walking south-east or south-west shows the cut. Planting a full ring costs roughly 3–4× the corn instances, which is a phone budget question.
2. **Horizon band.** The 84 m terrain square meets a flat, lighter far-field plane. You see the seam as a pale strip under the tree line.
3. **The far field reads dark and flat.** The field shader is soil-heavy away from the old hero view. It needs more straw and row variation.
4. **No collision on poles, course gates, the anemometer mast, cattails or corn.** You walk through them.
5. **The shed can't be entered.** Its interior (fridge, workbench, board) exists, but the pad is blocked for now. Decide whether walking in is part of Explore.
6. **Labcoon's own places don't exist yet:** the culvert (home), washing rock, mailbox, trash can, art shed, rowboat. His wander is a loop around one spot on the near bank.
7. **Labcoon isn't driven by the brain yet.** It's a scripted wander. Next, the simulator's events (`animation` + `then`) choose what he does, as in the Labcoon viewer.
8. **Underwater:** the dive to the film TVs exists on the homepage, but Explore keeps you out of the water.
9. **Grass in front of the follow camera** sometimes hides Labcoon on the bank. The camera could lift or fade near blades.

## For the Explore/Browse direction doc

- **Map:** where Labcoon's places and the portfolio landmarks sit relative to the pond, shed and course. Explore and the flat Browse pages should share one list.
- **Landmarks:** what you can click while walking (film TVs, shed tools, course sign), and whether they open the same panels as Browse.
- **Phone budget:** corn ring or not, the stubble count, and the quality steps.
- **First screen:** two doors (Explore / Browse) over the live field.
