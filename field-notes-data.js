/* Curated LaB field notes.
   These are quiet retrieval records, not model training data and not page copy.
   Keep every note factual and safe to expose through the public assistant. */
(function(root){
  'use strict';

  var notes = [
    {
      id: 'canon-log2-rec709-lut',
      url: 'colophon.html#field-notes',
      title: 'Canon Log 2 to Rec.709 conversion LUT',
      tags: 'canon eos r50 r5 r6 c70 c300 lut rec709 bt709 canon log 2 clog2 c-log2 bt2020 wide dr conversion technical color colour grade grading davinci resolve video explanation',
      filename: 'BT2020_CanonLog2-to-BT709_WideDR_33_FF.cube',
      path: 'canon-lut-202510/3dlut/33grid-3dlut/',
      capture: ['Canon Log 2', 'BT.2020 color space'],
      note: 'This is the official Canon 33-grid technical conversion from C-Log 2 (BT.2020) to BT.709 Wide DR—not a stylized creative LUT. Apply it as the base conversion, then grade from there.',
      answer: 'The exact technical conversion LUT is:\nBT2020_CanonLog2-to-BT709_WideDR_33_FF LUT\n\nInside:\ncanon-lut-202510/3dlut/33grid-3dlut/\n\nUse it for Canon footage shot in:\n- Canon Log 2 (C-Log 2)\n- BT.2020 color space\n\nIt is the official Canon technical conversion to BT.709 Wide DR—not a stylized creative LUT. Apply it as the base conversion, then grade from there.\n\nHere is a video that helps explain the conversion process: https://www.youtube.com/watch?v=RiAC7Ef0rEo',
      sources: [
        { title: 'Canon Log 2 Conversion LUT', url: 'colophon.html#field-notes', note: 'Curated LaB field note' },
        { title: 'LUT Explanation Video', url: 'https://www.youtube.com/watch?v=RiAC7Ef0rEo', note: 'YouTube video breakdown' }
      ]
    },
    {
      id: 'davinci-resolve-color-grading',
      url: 'resources.html#davinci-resolve',
      title: 'DaVinci Resolve Color Grading Tutorial & Node Bible',
      tags: 'davinci resolve color colour grade grading help tutorial video workflow node nodes bible primary secondary look transform advice guide',
      note: 'Recommended video tutorial and node walkthrough for color grading in DaVinci Resolve.',
      answer: 'For color grading in DaVinci Resolve, check out this video walkthrough (essentially a DaVinci Resolve color grading node bible):\nhttps://www.youtube.com/watch?v=jBq8refj7cc&t=52s\n\nDaVinci Resolve is LaB’s primary tool for editing, color grading, and finishing.',
      sources: [
        { title: 'DaVinci Resolve', url: 'resources.html#davinci-resolve', note: 'Software & Assets entry' },
        { title: 'Color Grading Node Bible Video', url: 'https://www.youtube.com/watch?v=jBq8refj7cc&t=52s', note: 'YouTube video tutorial' }
      ]
    },
    {
      id: 'lab-films-anthony-brass',
      url: 'portfolio.html#artist',
      title: 'Anthony Brass (2024) — Behind the Scenes & Production',
      tags: 'anthony brass artist portrait documentary detroit A-cam B-cam leary asmar larry john asmar voiceover plants cats acrylics vinyl script who shot who edited',
      note: 'Production notes on Anthony Brass (2024).',
      answer: 'Anthony Brass (2024) is an intimate portrait of Detroit outsider artist Anthony R. Brass, filmed in his home studio surrounded by plants, cats, and mid-century decor. Bobby Baldwin shot A-cam and edited; Leary (Larry) Asmar ran B-cam. The connection came through Leary/John Asmar’s network. Anthony wrote his own script/voiceover, so the narration is genuinely his.',
      sources: [
        { title: 'Anthony Brass — The Reel', url: 'portfolio.html#artist', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=0kFj2m6qOVo', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-moz-interiors',
      url: 'portfolio.html#moz',
      title: 'MOZ Interiors (2024) — Production Notes & Fun Facts',
      tags: 'moz interiors brand film commercial lyzz industrial loft detroit 1970s custom banquette wine room brass reeded door father daughter drywall spiral staircase hidden mirror door closet nightingale builders anthony brass engagement most viewed',
      note: 'Production notes and fun facts for MOZ Interiors (2024).',
      answer: 'MOZ Interiors (2024) is a cinematic walkthrough of an industrial loft designed by Lyzz (MOZ Interiors). It is LaB Media’s most-viewed video on YouTube. Bobby Baldwin shot A-cam & edited; Leary (Larry) Asmar ran B-cam. Key BTS details: The spiral staircase drywall was done by a father-daughter duo; a local Detroit metalworker crafted the custom brass reeded door, wavy steel range hood, and capsule fireplace; Nightingale Builders did contracting; and Lyzz designed the hidden mirror-door walk-in closet ("the child in me really wanted a secret room"). Later, Lyzz and Anthony Brass got engaged!',
      sources: [
        { title: 'MOZ Interiors — The Reel', url: 'portfolio.html#moz', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=R2j9Z9W8oK0', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-trail-dead',
      url: 'portfolio.html#horror',
      title: 'Trail Dead (2025) — Horror Film Roulette Winner',
      tags: 'trail dead horror film roulette winner best editing 2025 bobby baldwin al krakosky al sr dad 2 days 3 person crew deadline slasher who shot who edited',
      note: 'Production notes for Trail Dead (2025).',
      answer: 'Trail Dead (2025) won Best Editing at Horror Film Roulette 2025. Al Krakosky spun the roulette wheel at the kickoff event drawing the constraints. The entire crew was just three people: Bobby, Al, and Al’s dad (Al Sr.). They co-directed, co-wrote, and both acted. Shot in 2 days and edited by Al in 2 days straight through to the deadline. Bobby calls the win ironic: "the award went to the thing we had the least time for."',
      sources: [
        { title: 'Trail Dead — The Reel', url: 'portfolio.html#horror', note: 'Film breakdown & BTS' }
      ]
    },
    {
      id: 'lab-films-lookout',
      url: 'portfolio.html#comedy',
      title: 'Lookout (2025) — Satirical Dark Comedy',
      tags: 'lookout comedy roll 2025 top 25 bobby baldwin mark al krakosky joe krakosky marcus al sr older gentleman dereck shedlowsky twerk flip kelly wasmer janet ashley baldwin gym smart home who shot who edited cast',
      note: 'Production notes for Lookout (2025).',
      answer: 'Lookout (2025) is a satirical dark comedy short that placed in the Top 25 at the Comedy Roll Film Festival 2025. Bobby Baldwin wrote, produced, played lead character Mark, handled grip and sound. Al Krakosky directed, wrote, ran main camera, and edited. Al’s brother Joe played Marcus (the trainer) & ran sound; Al’s dad (Al Sr.) played the older gentleman with the warning; Dereck Shedlowsky played Derek (doing a twerk and a flip); Kelly Wasmer played Janet; and Ashley Baldwin (Bobby’s ex-wife) made a cameo.',
      sources: [
        { title: 'Lookout — The Reel', url: 'portfolio.html#comedy', note: 'Film breakdown & still' }
      ]
    },
    {
      id: 'lab-films-its-a-boy',
      url: 'portfolio.html#itsaboy',
      title: 'It’s a Boy (2026) — 13-Person Ensemble Comedy',
      tags: 'its a boy comedy roll 2026 ensemble 13 cast bobby baldwin al krakosky veda kae producer mike pickard peanut allergy david versace contraption creator tripod sony camera who shot who edited',
      note: 'Production notes for It’s a Boy (2026).',
      answer: 'It’s a Boy (2026) is LaB Media’s big-crew 13-person ensemble film, screened at The Comedy Roll in May 2026. Co-directed by Bobby and Al, with Veda Kae as producer. Al was main writer, editor, and main camera operator (rolling his Sony on the tripod, not the R50). Mike Pickard wrote the peanut allergy lines. David Versace filmed a song as a "contraption creator". Filmed over 3 days (April 25, 28, 29, 2026).',
      sources: [
        { title: 'It’s a Boy — The Reel', url: 'portfolio.html#itsaboy', note: 'Film breakdown & still' }
      ]
    },
    {
      id: 'lab-films-scattered',
      url: 'portfolio.html#scattered',
      title: 'Scattered (2026) — Detroit 48 Hour Film Project',
      tags: 'scattered 48 hour film project 48hfp detroit sideways lab bobby baldwin al krakosky joe krakosky bart johns weatherman green screen river bends park tunnel eraser passerby kyle 6 minutes deadline music selection who edited who shot',
      note: 'Production notes for Scattered (2026).',
      answer: 'Scattered (2026) was made for the Detroit 48 Hour Film Project (team Sideways Lab), drawing Thriller/Suspense with required character Bart Johns (Meteorologist), an eraser prop, and line "You have to be careful with that." Core team was Bobby, Al, and Joe Krakosky (plus Kyle for a small tunnel scene). Shot at River Bends Park (22 Mile entrance). Bobby designed the weatherman billboard and picked all music tracks; Al and Joe handled the entire edit (Al primary editor, Joe on billboard/FX) and uploaded with 6 minutes left on the clock!',
      sources: [
        { title: 'Scattered — The Reel', url: 'portfolio.html#scattered', note: 'Film breakdown & timeline' }
      ]
    },
    {
      id: 'lab-films-le-juice',
      url: 'resources.html#le-juice-rochester',
      title: 'Le Juicé (2026) — Commercial Workflow & Color',
      tags: 'le juice rochester brand film commercial moz interiors lyzz green millwork terrazzo brass fruit clog3 canon log 3 lut BT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0 who shot who edited',
      note: 'Commercial brand film for Le Juicé and MOZ Interiors.',
      answer: 'Le Juicé (2026) is a commercial brand film for a cold-pressed juice bar in downtown Rochester, Michigan, designed by Lyzz (MOZ Interiors). Shot June 1, 2026. Bobby Baldwin shot C-Log 3 footage on the Canon R50 and converted it using the technical LUT BT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0, grading manually to match the client’s real-space color target.',
      sources: [
        { title: 'Le Juicé Resource', url: 'resources.html#le-juice-rochester', note: 'Checked resource & film entry' }
      ]
    },
    {
      id: 'lab-crew-and-community',
      url: 'people.html',
      title: 'LaB Crew & Community Connections (ST Park, Comedy Roll, 48HFP)',
      tags: 'crew community st park joe tenbrock rylie the hook cracked mistaken mike pickard billy nehring veda kae max josh comedy roll horror film roulette detroit film community',
      note: 'Overview of LaB Media crew and Michigan film community connections.',
      answer: 'LaB Media’s core is Bobby Baldwin and Al Krakosky, with Joe Krakosky forming the core trio on films like Scattered. Surrounding them is a vibrant local Michigan film community: ST Park Productions (Joe TenBrock & Rylie, creators of The Hook, Brimstone, Mistaken), Mike Pickard (writer/director of Cracked), Billy Nehring, Veda Kae, and Josh (Comedy Roll showrunner). Bobby crewed on ST Park’s The Hook and Mike Pickard’s Cracked, building relationships that fuel collaborative Michigan filmmaking.',
      sources: [
        { title: 'People & Community', url: 'people.html', note: 'Collaborator network' }
      ]
    },
    {
      id: 'lab-gear-and-editing-philosophy',
      url: 'gear.html',
      title: 'Gear Rationale & DaVinci Resolve Editing Philosophy',
      tags: 'why dual canon r50 tascam portacapture x8 32-bit float audio davinci resolve workflow rough cut first fog machine audio foundation j-cuts l-cuts room tone color last',
      note: 'Practical gear choices and editing workflow in DaVinci Resolve.',
      answer: 'LaB’s gear choices are built on practical set efficiency: Two Canon EOS R50s allow rolling two simultaneous angles on a two-person crew. The Tascam Portacapture X8 provides 32-bit float audio so clipping is impossible. A simple fog machine provides atmosphere that no lens can replicate. In post, Bobby’s editing philosophy in DaVinci Resolve is "rough cut first" — build the story naked with zero music or color. Once the story works, build the audio foundation (J-cuts, L-cuts, room tone under everything, foley), then grade color last.',
      sources: [
        { title: 'LaB’s Kit Page', url: 'gear.html', note: 'Gear list & notes' }
      ]
    }
  ];

  root.LAB_FIELD_NOTES = notes;
})(typeof window!=='undefined'?window:globalThis);
