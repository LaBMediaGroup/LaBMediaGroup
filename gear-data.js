/* ============================================================
   THE KIT : what LaB Media actually owns and runs.
   ------------------------------------------------------------
   Every field except `name` is optional. Leave anything out and
   the page simply doesn't render it, so a half-filled entry
   still looks deliberate rather than broken.

     name     : what it is.                        REQUIRED
     what     : one line on what it does for you.
     verdict  : 'again'  buy it again tomorrow
                'maybe'  fine, but with a caveat
                'no'     wouldn't buy again
     note     : the honest bit. Why again, or why not.
     paid     : roughly what you paid. "~$300", "bundled".
                Not current retail. Left off where unknown.
     since    : year you got it.
     shared   : true if it belongs to a collaborator, not to LaB.
     url      : optional link.
     resource : id/name of a matching entry in resources-data.js,
                which cross-links the two pages and feeds the
                add-to-kit button.

   Sections may also carry:
     photo    : a 1400x466 strip, shown when the section opens.
     photoAlt : what is actually in it. Required if photo is set.

   Only add a photo where the frame genuinely shows that category.
   There is no honest lighting photo yet, so Light stays text.

   Sections render in the order below. Delete a whole section
   and it disappears from the page and the jump nav.

   ── STILL MISSING ──
   Verdicts and prices. Only a handful of items carry either,
   because those are the only ones confirmed. A gear list
   without verdicts is a shopping list : add `verdict` and
   `paid` to anything worth an opinion.
   ============================================================ */

const gearData = [

  {
    id: 'camera',
    title: 'Cameras &amp; <em>bodies</em>',
    blurb: 'What the picture is actually recorded on.',
    photo: 'images/kit/camera.jpg',
    photoAlt: 'An R50 on a gimbal, mid-take on the It\u2019s a Boy shoot, boom operator behind.',
    items: [
      { name: 'Canon EOS R50 ×2', key: true,
        what: 'Principal photography, lightweight location work, second angles, and vertical content.',
        note: 'Two entry-level bodies rather than one expensive one. On a two-person crew that buys a second angle you can actually roll at the same time, which is worth more than a better sensor you can only point in one direction. Small enough that nobody in a room becomes self-conscious about it.' },

      { name: 'Insta360 ONE R',
        what: '360 capture, action shots, and camera placements a normal rig can’t survive.',
        url: 'https://www.insta360.com' },
    ]
  },

  {
    id: 'lenses',
    title: 'Lenses &amp; <em>optics</em>',
    blurb: 'Everything mounts to the R50s. Four Canon lenses plus an adapter that keeps older EF glass alive.',
    items: [
      { name: 'Canon RF 16mm f/2.8 STM',
        what: 'Wide. Small rooms, close work, and anywhere a step backwards isn’t possible.' },
      { name: 'Canon RF 50mm f/1.8 STM',
        what: 'The cheap fifty. Fast enough for low light and flattering on faces.' },
      { name: 'Canon RF-S 18–45mm',
        what: 'The everyday zoom. Lives on the body when there’s no time to swap.' },
      { name: 'Canon EF 24mm f/2.8 IS USM',
        what: 'EF-mount via the adapter, and the only stabilised lens in the bag. On the R50\u2019s APS-C sensor it frames closer to a 38mm.' },
      { name: 'NEEWER EF-to-RF adapter',
        what: 'Keeps EF glass usable on an RF body : far cheaper than replacing lenses.' },
      { name: 'Matte box with ND glass',
        what: 'Flare control and neutral density for shooting wide open in daylight.',
        shared: true },
    ]
  },

  {
    id: 'support',
    title: 'Support &amp; <em>movement</em>',
    blurb: 'Gimbals, sticks and rails : whatever keeps the camera where it should be, or moves it on purpose.',
    photo: 'images/kit/support.jpg',
    photoAlt: 'A camera on an RS 3 Mini set up on the counter at Le Juic\u00e9.',
    items: [
      { name: 'DJI RS 3 Mini ×2', key: true,
        what: 'The workhorse gimbal. Two of them means a second angle without a rebalance.' },
      { name: 'DJI Ronin (full-size)',
        what: 'For heavier builds where the Mini runs out of payload.' },
      { name: 'SmallRig tripod',
        what: 'Everyday sticks.' },
      { name: 'Manfrotto tripod',
        what: 'Heavier legs for longer lenses and locked-off work.',
        shared: true },
      { name: 'Dana Dolly : 6ft rail system',
        what: 'Repeatable, smooth lateral moves. The shot that makes a small production look bigger.',
        shared: true },
      { name: 'Mini tabletop dollies',
        what: 'Product moves and tight detail shots.' },
      { name: 'Nucleus follow focus',
        what: 'Wireless focus pulling : the difference between a rack that lands and one that hunts.',
        shared: true },
      { name: 'C-stand',
        what: 'Holds anything, anywhere, for as long as you need.',
        shared: true },
      { name: 'SmallRig clamps, magic arms, plates and gimbal handles',
        what: 'The connective tissue. Nothing gets mounted without some of this.' },
      { name: 'Insta360 Bullet Time monopod',
        what: 'Spinning 360 shots, and a decent monopod the rest of the time.' },
    ]
  },

  {
    id: 'monitoring-light',
    title: 'Monitoring &amp; <em>light</em>',
    blurb: 'Seeing what the camera sees before it’s wrapped, and shaping the light when natural isn’t enough.',
    items: [
      { name: 'Feelworld 5.5" field monitor',
        what: 'On-camera. Focus and exposure you can trust.' },
      { name: 'Hollyland Pyro wireless',
        what: 'Video to a director or client who isn’t stood behind the camera.',
        shared: true },
      { name: 'iPad as a monitor',
        what: 'Bigger client view, and it’s already in the bag.' },
      { name: 'USB-C / HDMI capture interface',
        what: 'Camera into a computer for streams and pulls.' },
      { name: 'SmallRig RC 60B', key: true,
        what: 'Bi-colour COB. The main light on most setups.' },
      { name: 'NEEWER T120 ×2',
        what: 'Half-panels. Soft fill, or a quick two-point setup on their own.' },
      { name: 'SmallRig IP200 beauty panel',
        what: 'Big soft source for faces.' },
      { name: 'NEEWER TL96RGB wand',
        what: 'Colour, practicals and accents. Small enough to hide in frame.' },
      { name: 'Fog machine',
        what: 'Makes light visible. Does more for a horror short than any lens.' },
      { name: 'Portable projector',
        what: 'In-frame light source and a way to throw texture onto a wall or a face.' },
    ]
  },

  {
    id: 'audio-prod',
    title: 'Production <em>sound</em>',
    blurb: 'The half of filmmaking an audience notices first and nobody budgets for.',
    items: [
      { name: 'Tascam Portacapture X8', key: true,
        what: '32-bit float multitrack field recorder. Clipping stops being a thing you can do.' },
      { name: 'Canon DM-E100',
        what: 'On-camera mic. Reference audio and run-and-gun.' },
      { name: 'XLR production cables', minor: true,
        what: 'Never enough of them.' },
    ]
  },

  {
    id: 'audio-post',
    title: 'Voice &amp; <em>post audio</em>',
    blurb: 'Narration, scratch tracks and mixing.',
    items: [
      { name: 'Shure SM7B',
        what: 'Voiceover. Forgiving of an untreated room, which is the whole reason for it.' },
      { name: 'Beyerdynamic DT 770 Pro',
        what: 'Closed-back monitoring for the edit.' },
      { name: 'Elgato USB-C microphone',
        what: 'Quick takes without setting up the SM7B chain.' },
      { name: 'PYLE audio mixer',
        what: 'Routing and levels.' },
    ]
  },

  {
    id: 'power',
    title: 'Media, backup &amp; <em>power</em>',
    blurb: 'The unglamorous half of a shoot day, and the half that ends it early when it’s missing.',
    items: [
      { name: 'SanDisk portable SSDs : 500GB, 1TB, 2TB',
        what: 'Offload on location. Footage exists in two places before anything gets wrapped.' },
      { name: 'SanDisk SD cards : 128GB and 256GB',
        what: 'With a reader and a hard case, because loose cards get lost.' },
      { name: 'Canon LP-E17 batteries and chargers', minor: true,
        what: 'Body power.' },
      { name: 'NP-F550 / F750 / F970 system',
        what: 'One battery standard across monitors, lights and accessories.' },
      { name: '50,000mAh power banks',
        what: 'All-day power where there are no outlets.' },
      { name: 'Rechargeable AAs', minor: true,
        what: 'For everything that still, somehow, takes AAs.' },
      { name: 'Extension cords and power distribution', minor: true,
        what: 'The reason the lights reach.' },
    ]
  },

  {
    id: 'small',
    title: 'Small things that <em>save a shoot</em>',
    blurb: 'None of it is exciting. All of it has rescued a day.',
    items: [
      { name: 'Gaff tape, multiple colours', minor: true,
        what: 'Marks, fixes, labels. Colour-coded so a mark isn’t mistaken for a repair.' },
      { name: 'Think Tank cable bags', minor: true,
        what: 'Cables you can find in the dark.' },
      { name: 'Velcro straps' , minor: true },
      { name: 'Lens and sensor cleaning kits' , minor: true },
      { name: 'Microfiber cloths and blower' , minor: true },
      { name: 'iFixit and SmallRig tool kits', minor: true,
        what: 'Because something always needs a hex key at the worst moment.' },
      { name: 'Spare 1/4-20 and 3/8" hardware', minor: true,
        what: 'The single most common thing to lose on location.' },
      { name: 'Quick-release plates' , minor: true },
      { name: 'Hot and cold shoe adapters' , minor: true },
    ]
  },

  {
    id: 'drone',
    title: 'Drone &amp; <em>FPV</em>',
    blurb: 'What actually flies. The <a href="skybound.html">SkyBound guide</a> covers how to start; this is the kit behind it.',
    items: [
      { name: 'BetaFPV Pavo 20 Pro', key: true,
        what: 'Cinewhoop. Ducted, so it can fly close to people and objects.' },
      { name: 'BetaFPV Pavo 20 Pro 2',
        what: 'The second one. Two airframes means a crash isn’t the end of the shoot.' },
      { name: 'Joshua Bardwell Sub250',
        what: 'Under 250g : lighter regulatory burden, and it goes where the bigger ones can’t.',
        resource: 'Joshua Bardwell' },
      { name: 'DJI Goggles 3',
        what: 'The view.' },
      { name: 'RadioMaster Pocket (ELRS)',
        what: 'Controller. ELRS for range and latency.' },
      { name: 'SKYRC B6Neo',
        what: 'Field charger. Batteries are the actual limit on a flying day.' },
    ]
  },

  {
    id: 'shared-bodies',
    title: 'Also on set, <em>not ours</em>',
    blurb: 'Bigger gear that comes with collaborators. Listed because it shapes what the films look like : and flagged because it isn’t owned.',
    items: [
      { name: 'Sony A7S III',
        what: 'A collaborator\u2019s low-light body. Where the very dark scenes come from.',
        shared: true },
      { name: 'Sony FE 24–70mm f/2.8 GM',
        what: 'Fast standard zoom.',
        shared: true },
    ]
  },

  {
    id: 'machine',
    title: 'The <em>machine</em>',
    blurb: 'Edit bay and storage. The part beginners ask about most and almost nobody writes down.',
    items: [
      { name: 'NAS : 12TB', key: true,
        what: 'Everything lives here. Footage, projects, this website.',
        verdict: 'again',
        note: 'Working off a network drive rather than a pile of external disks is the single biggest quality-of-life change in post. Nothing is ever on the wrong drive.' },
    ]
  },

  {
    id: 'software',
    title: '<em>Software</em>',
    blurb: 'What is installed and what is paid for. The ones cross-linked below also appear in <a href="resources.html#inlab">In the LaB</a> on the resources page.',
    items: [
      { name: 'DaVinci Resolve Studio', key: true,
        what: 'Edit, colour, sound, delivery : all of it, in one application.',
        verdict: 'again',
        note: 'The licence often comes bundled free with Blackmagic hardware : a Speed Editor or a small ATEM : so the deal costs about what the software alone would and you get a physical thing out of it. That is how this one was bought. Worth saying plainly: the free version is not a demo, and most of what is on this site could have been finished in it.',
        paid: 'bundled with hardware',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        resource: 'DaVinci Resolve' },

      { name: 'Audiio',
        what: 'Music licensing and search.',
        verdict: 'again',
        note: 'Bought the lifetime deal rather than renting a library forever. Most of what you hear under these films came from here.',
        paid: 'lifetime deal',
        url: 'https://audiio.com',
        resource: 'Audiio' },

      { name: 'Obsidian',
        what: 'Story development, production planning, research and project archiving.',
        note: 'Plain markdown files in a folder, so notes from a shoot three years ago still open without asking anyone’s permission.',
        url: 'https://obsidian.md' },

      { name: 'Pixelmator Pro',
        what: 'Stills, thumbnails, titles and graphics.',
        url: 'https://www.pixelmator.com/pro/' },

      { name: 'Adobe Premiere Pro',
        what: 'Not the house editor \u2014 a regular collaborator cuts in it, so projects sometimes move between Premiere and Resolve.',
        note: 'Worth saying because handing a project between two NLEs is a real cost. XML round-trips lose effects and speed ramps every time, so the practical answer is to agree who is finishing before anyone starts cutting.',
        shared: true,
        url: 'https://www.adobe.com/products/premiere.html' },

      { name: 'Claude',
        what: 'Writing, problem-solving, and building things like this site.',
        verdict: 'again',
        note: 'This entire site : the design system, the story generator, the lot : was rebuilt with it.',
        paid: 'subscription',
        url: 'https://claude.ai',
        resource: 'Claude.ai' },
    ]
  },

];

function gearItemAnchor(section,item){
  var name=String(item&&item.name||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return 'gear-'+String(section&&section.id||'kit')+'-'+name;
}

if (typeof window !== 'undefined') {
  window.gearData = gearData;
  window.gearItemAnchor = gearItemAnchor;
}
