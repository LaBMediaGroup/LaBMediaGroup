# Pino's UI: what makes it feel nice (research, Nov 26 2026)

Bobby likes how Pino's bird UI looks and feels ("really nice and fun"). Looked at https://pinos.world (desktop and phone) and the author's Three.js forum post (https://discourse.threejs.org/t/autonomous-ai-bird-living-in-a-small-town-on-the-internet/93707).

## How it's built
- Next.js (React app router) with Tailwind utility classes. The 3D is Three.js with the WebGPU renderer. The dithered halftone look is computed in the materials before rendering, not as a post effect.
- The brain runs on a Raspberry Pi, 24/7.
- Fonts: Nunito (rounded) for the UI, Geist for body, and Noto Sans JP for the ピノ title.
- Privy (a sign-in and wallet library) handles "connect to Pino". Visitors have accounts, and offerings, photos included, are shown publicly. **Labcoon deliberately doesn't do either** (no accounts; notes are never shown word for word).

## The look (measured)
- **Panels:** warm cream `#F7E7D2`, a chunky deep-indigo outline `2.5px solid #2F2650`, and 26 px radius. Phone cards add a **dashed inner outline** and **dashed dividers**, like a stitched label or a ticket.
- **Shadow:** a hard, offset shadow with no blur, `0 4px 0 rgba(47,38,80,.32)` on cards and `0 3px 0` on buttons. Everything looks like a raised plastic toy or sticker.
- **Buttons:** full pills (999 px). Primary is peach-orange `#F0B064`, with indigo text in Nunito 800 at 13.5 px.
- **Text:** one ink colour, indigo `#2F2650`, everywhere. Thoughts are in Nunito 600 italic.

## The layout
- **Top:** the needs strip, one row with a coloured round icon and a pill bar for each need (Fullness, Energy, Wonder, Joy, Calm), and a tab to switch between the two characters (Pino / Dot).
- **Round widgets:** a globe minimap (top left), a radar (bottom left on desktop, top right on phone), a time and weather pill (sun icon 11:47), an orange "leave him something" pill, and a round ☰.
- **"right now" card:** a purple dot label, a bold activity title, the thought in italics, a dashed rule, the other character's note, a dashed rule, "changed lately" with a timestamp, and a "read the diary" link. It closes with a round ✕.
- **Bottom:** a status pill with an avatar circle ("Pino is taking a moment") and an activity pill with the time ("winding the clock · 11:35 AM").
- **Leave him something:** a bottom sheet with a drag handle and tabs (Offerings / Talk / Let go / Yours, the active tab a dark pill). Offering cards carry a green "Pino kept it" chip, his reply in italic gold, and small pill actions (share, like, say something). Footer: "590 read today, 5 waiting".
- **Loading:** a stack of train tickets to "punch" (a ticket counter) and a tiny train with the bird riding it as the progress bar. Small icons row, Enter as a ticket-shaped button, and copy like "Putting the lights on" and "The town is ready".

## For Labcoon (our own take, not a copy)
Borrow the principles, not the palette or the layout pixel for pixel:
- **Toy-sticker panels:** a thick ink outline, a hard offset shadow, big radii and pills, one ink colour. Our palette: night-pond cream, deep pond-green/indigo ink, and LaB orange for the primary action.
- **Needs as coloured round icons with pill bars** in a compact top strip. Our five: hunger, energy, joy, boredom, curiosity.
- **A "right now" card with dashed dividers:** the activity, the thought, "lately…", and a "read his journal" link.
- **Small round widgets:** time and weather from the real sky; a map in a round frame.
- **A bottom-sheet "Leave him something"** with tabs: Say hi / Mail a note / Doodle / Swap / Yours (the cards he gave you, saved in your browser). No public wall of visitors' words.
- **Status pills at the bottom:** "Labcoon is washing a bottle cap · 9:42pm".
- **A playful loading moment of our own:** Labcoon trundling along a pipe or the lane as the progress bar, with a line like "Putting the lights on at the pond".
