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
      note: 'This is the official Canon 33-grid technical conversion from C-Log 2 (BT.2020) to BT.709 Wide DR, not a stylized creative LUT. Apply it as the base conversion, then grade from there.',
      answer: 'The exact technical conversion LUT is:\nBT2020_CanonLog2-to-BT709_WideDR_33_FF LUT\n\nInside:\ncanon-lut-202510/3dlut/33grid-3dlut/\n\nUse it for Canon footage shot in:\n- Canon Log 2 (C-Log 2)\n- BT.2020 color space\n\nIt is the official Canon technical conversion to BT.709 Wide DR, not a stylized creative LUT. Apply it as the base conversion, then grade from there.\n\nHere is a video that helps explain the conversion process: https://www.youtube.com/watch?v=RiAC7Ef0rEo',
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
      title: 'Anthony Brass (2024) : Behind the Scenes & Production',
      tags: 'anthony brass artist portrait documentary detroit A-cam B-cam larry john voiceover plants cats acrylics vinyl script who shot who edited watch video player youtube',
      note: 'Production notes on Anthony Brass (2024).',
      answer: 'Anthony Brass (2024) is an intimate portrait of Detroit outsider artist Anthony R. Brass, filmed in his home studio surrounded by plants, cats, and mid-century decor. Bobby shot A-cam and edited; Larry ran B-cam. The connection came through Larry and John’s network. Anthony wrote his own script/voiceover, so the narration is genuinely his.\n\nWatch Anthony Brass on YouTube:\nhttps://www.youtube.com/watch?v=CPvxM8GrCg8',
      sources: [
        { title: 'Anthony Brass : The Reel', url: 'portfolio.html#artist', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=CPvxM8GrCg8', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-moz-interiors',
      url: 'portfolio.html#moz',
      title: 'MOZ Interiors (2024) : Production Notes & Fun Facts',
      tags: 'moz interiors brand film commercial lyzz industrial loft detroit 1970s custom banquette wine room brass reeded door father daughter drywall spiral staircase hidden mirror door closet nightingale builders anthony brass engagement most viewed watch video player youtube',
      note: 'Production notes and fun facts for MOZ Interiors (2024).',
      answer: 'MOZ Interiors (2024) is a cinematic walkthrough of an industrial loft designed by Lyzz (MOZ Interiors). It is LaB Media’s most-viewed video on YouTube. Bobby shot A-cam & edited; Larry ran B-cam. Key BTS details: The spiral staircase drywall was done by a father-daughter duo; a local Detroit metalworker crafted the custom brass reeded door, wavy steel range hood, and capsule fireplace; Nightingale Builders did contracting; and Lyzz designed the hidden mirror-door walk-in closet ("the child in me really wanted a secret room"). Later, Lyzz and Anthony Brass got engaged!\n\nWatch MOZ Interiors on YouTube:\nhttps://www.youtube.com/watch?v=HtF4L9RpkaU',
      sources: [
        { title: 'MOZ Interiors : The Reel', url: 'portfolio.html#moz', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=HtF4L9RpkaU', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-the-pandys',
      url: 'portfolio.html#pandys',
      title: 'The Pandys (2024) : Live Session Production',
      tags: 'the pandys music video live session rehearsal john larry drummer old guy band practice energy watch video player youtube',
      note: 'Production notes for The Pandys (2024).',
      answer: 'The Pandys (2024) captures raw band practice energy live as the band performs "Old Guy". Shot in a single day in January 2024 with minimal production interference. John (Larry’s brother) is the band’s drummer.\n\nWatch The Pandys on YouTube:\nhttps://www.youtube.com/watch?v=ZXYtZmIRiRI',
      sources: [
        { title: 'The Pandys : The Reel', url: 'portfolio.html#pandys', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=ZXYtZmIRiRI', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-trail-dead',
      url: 'portfolio.html#horror',
      title: 'Trail Dead (2025) : Horror Film Roulette Winner',
      tags: 'trail dead horror film roulette winner best editing 2025 bobby al al sr dad 2 days 3 person crew deadline slasher who shot who edited watch video player youtube',
      note: 'Production notes for Trail Dead (2025).',
      answer: 'Trail Dead (2025) won Best Editing at Horror Film Roulette 2025. Al spun the roulette wheel at the kickoff event drawing the constraints. The entire crew was just three people: Bobby, Al, and Al’s dad (Al Sr.). They co-directed, co-wrote, and both acted. Shot in 2 days and edited by Al in 2 days straight through to the deadline. Bobby calls the win ironic: "the award went to the thing we had the least time for."\n\nWatch Trail Dead on YouTube:\nhttps://www.youtube.com/watch?v=rtEs8chuDlM',
      sources: [
        { title: 'Trail Dead : The Reel', url: 'portfolio.html#horror', note: 'Film breakdown & BTS' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=rtEs8chuDlM', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-lookout',
      url: 'portfolio.html#comedy',
      title: 'Lookout (2025) : Satirical Dark Comedy',
      tags: 'lookout comedy roll 2025 top 25 bobby mark al joe marcus al sr older gentleman dereck twerk flip kelly janet ashley gym smart home who shot who edited cast watch video player youtube',
      note: 'Production notes for Lookout (2025).',
      answer: 'Lookout (2025) is a satirical dark comedy short that placed in the Top 25 at the Comedy Roll Film Festival 2025. Bobby wrote, produced, played lead character Mark, handled grip and sound. Al directed, wrote, ran main camera, and edited. Al’s brother Joe played Marcus (the trainer) & ran sound; Al’s dad (Al Sr.) played the older gentleman with the warning; Dereck played Derek (doing a twerk and a flip); Kelly played Janet; and Ashley made a cameo.\n\nWatch Lookout on YouTube:\nhttps://www.youtube.com/watch?v=G0zfFWwQuZA',
      sources: [
        { title: 'Lookout : The Reel', url: 'portfolio.html#comedy', note: 'Film breakdown & still' },
        { title: 'Watch on YouTube', url: 'https://www.youtube.com/watch?v=G0zfFWwQuZA', note: 'YouTube video' }
      ]
    },
    {
      id: 'lab-films-its-a-boy',
      url: 'portfolio.html#itsaboy',
      title: 'It’s a Boy (2026) : 13-Person Ensemble Comedy',
      tags: 'its a boy comedy roll 2026 ensemble 13 cast bobby al veda producer mike peanut allergy david contraption creator tripod sony camera who shot who edited',
      note: 'Production notes for It’s a Boy (2026).',
      answer: 'It’s a Boy (2026) is LaB Media’s big-crew 13-person ensemble film, screened at The Comedy Roll in May 2026. Co-directed by Bobby and Al, with Veda as producer. Al was main writer, editor, and main camera operator (rolling his Sony on the tripod, not the R50). Mike wrote the peanut allergy lines. David filmed a song as a "contraption creator". Filmed over 3 days (April 25, 28, 29, 2026).',
      sources: [
        { title: 'It’s a Boy : The Reel', url: 'portfolio.html#itsaboy', note: 'Film breakdown & still' }
      ]
    },
    {
      id: 'lab-films-scattered',
      url: 'portfolio.html#scattered',
      title: 'Scattered (2026) : Detroit 48 Hour Film Project',
      tags: 'scattered 48 hour film project 48hfp detroit sideways lab bobby al joe bart johns weatherman green screen river bends park tunnel eraser passerby kyle 6 minutes deadline music selection who edited who shot poster key art cast credits krakosky keaser baldwin behind the scenes photos',
      note: 'Production notes for Scattered (2026).',
      answer: 'Scattered (2026) was made for the Detroit 48 Hour Film Project (team Sideways Lab), drawing Thriller/Suspense with required character Bart Johns (Meteorologist), an eraser prop, and line "You have to be careful with that." Core team was Bobby, Al, and Joe (plus Kyle for a small tunnel scene). Shot at River Bends Park (22 Mile entrance). Bobby designed the weatherman billboard and picked all music tracks; Al and Joe handled the entire edit (Al primary editor, Joe on billboard/FX) and uploaded with 6 minutes left on the clock!\n\nIt has a poster, credited to Sideways Studio and LaB, naming the cast as Joe Krakosky, Robert Baldwin, Kyle Keaser and Albert Krakosky III. It had never been posted anywhere until it went up on the reel beside the film’s spec sheet. Thirteen behind-the-scenes photographs sit under the film; three of them are also on the About page, taken over the weekend itself.',
      sources: [
        { title: 'Scattered : The Reel', url: 'portfolio.html#scattered', note: 'Film breakdown & timeline' }
      ]
    },
    {
      id: 'community-film-mistaken',
      url: 'events.html#event-detroit-48hfp-premiere-2026',
      title: 'Mistaken (2026) : Detroit 48 Hour Film Project Community Short',
      tags: 'mistaken 2026 detroit 48 hour film project 48hfp group b 4 30 pm redford theater st park productions koffee noir productions joint production collaboration veda joe billy anton rylie david jeremy brandon amber kate nikki who worked on mistaken cast crew screening',
      note: 'Local community and screening context for Mistaken (2026).',
      answer: 'Mistaken (2026) is a Detroit 48 Hour Film Project short screening in Group B at 4:30 PM alongside Scattered. It was made jointly by ST Park Productions and Koffee Noir Productions. Veda, Joe, Billy, Anton, Rylie, David, Jeremy, Brandon, Amber, Kate, and Nikki all worked on the film. Their individual roles are not recorded in the LaB notes yet, so the assistant will not guess at them.',
      sources: [
        { title: 'Detroit 48HFP Premiere Screenings', url: 'events.html#event-detroit-48hfp-premiere-2026', note: 'Group B screening and local film context' }
      ]
    },
    {
      id: 'site-tool-golden-hour-planner',
      url: 'sun.html',
      title: 'Golden Hour Planner : Current Features',
      tags: 'golden hour planner blue hour dawn dusk sunrise sunset solar noon elevation azimuth direction color temperature date location time slider phrases quote roller wind cloud cover overcast filtered diffused grey blue moon lunar phase waxing waning crescent quarter gibbous full illumination copy day plan privacy local',
      note: 'Current Golden Hour Planner capabilities.',
      answer: 'Golden Hour is a date- and location-aware shoot planner. It calculates dawn and dusk blue hour, morning and evening golden hour, sunrise, sunset, solar noon, daylight length, elevation, direction and a color-temperature estimate. For today, current cloud cover distinguishes a clear golden window from filtered or overcast light, mutes the scene and sun or moon appropriately, shifts the color estimate, and supplies cloud-aware filming guidance. Its panoramic timeline gives the sun and moon separate left-to-right paths, responds to current wind, and rolls through time-ordered filmmaking prompts from pre-dawn through late night. The moon reflects the selected date\'s waxing or waning phase and illumination, including crescent, quarter, gibbous, full and new stages; its arc is a visual planning cue rather than a precise moonrise ephemeris. The day plan can be copied, and the selected date and location stay in the browser.',
      sources: [
        { title: 'Golden Hour Planner', url: 'sun.html', note: 'Interactive filmmaking tool' }
      ]
    },
    {
      id: 'site-tool-drone-weather',
      url: 'droneweather.html',
      title: 'Drone Weather : Current Features',
      tags: 'drone weather live conditions open meteo wind gust gusts visibility precipitation cloud cover overcast filtered grey blue temperature flight safety thresholds animated nature scene local time solar daylight sunset twilight blue hour night sun moon lunar phase waxing waning crescent quarter gibbous full night flying read gust preflight checklist 18 point move minimize resize pdf browser',
      note: 'Current Drone Weather and pre-flight checklist capabilities.',
      answer: 'Drone Weather reads current Open-Meteo wind, gusts, temperature, visibility, precipitation and cloud cover. Wind, visibility and precipitation inform its conservative green, amber or red planning thresholds; cloud percentage changes the scene and is reported separately rather than treated as a safety verdict without cloud-height data. The nature scene mirrors those conditions and Detroit local time, warming toward sunset when clear, muting toward grey-blue under overcast, cooling through blue hour and darkening at night. Its moon follows a separate left-to-right arc, can share the daylight sky, and reflects the date\'s waxing or waning phase and illumination. Gust-reading and after-dark guidance stay collapsed until needed. Its 18-point pre-flight checklist opens only when requested, then remains available around the site; it can be moved, minimized, resized and printed to PDF, and its progress stays in the browser.',
      sources: [
        { title: 'Drone Weather', url: 'droneweather.html', note: 'Live weather and flight-planning tool' }
      ]
    },
    {
      id: 'site-tool-aspect-ratio',
      url: 'aspect.html',
      title: 'Aspect Ratio Previewer : Current Features',
      tags: 'aspect ratio previewer crop framing letterbox anamorphic scope flat widescreen vertical social image video multiple files local browser memory privacy upload active pixel dimensions 1080p 4k',
      note: 'Current Aspect Ratio Previewer capabilities.',
      answer: 'The Aspect Ratio Previewer tests common cinema, widescreen and vertical crops against sample frames or your own images and video. It accepts multiple local files, calculates exact active-pixel dimensions for 1080p and 4K UHD timelines, and processes the media entirely in browser memory with zero server uploads.',
      sources: [
        { title: 'Aspect Ratio Previewer', url: 'aspect.html', note: 'Local framing and crop tool' }
      ]
    },
    {
      id: 'lab-films-le-juice',
      url: 'resources.html#le-juice-rochester',
      title: 'Le Juicé (2026) : Commercial Workflow & Color',
      tags: 'le juice rochester brand film commercial moz interiors lyzz green millwork terrazzo brass fruit clog3 canon log 3 lut BT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0 who shot who edited',
      note: 'Commercial brand film for Le Juicé and MOZ Interiors.',
      answer: 'Le Juicé (2026) is a commercial brand film for a cold-pressed juice bar in downtown Rochester, Michigan, designed by Lyzz (MOZ Interiors). Shot June 1, 2026. Bobby shot C-Log 3 footage on the Canon R50 and converted it using the technical LUT BT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0, grading manually to match the client’s real-space color target.',
      sources: [
        { title: 'Le Juicé Resource', url: 'resources.html#le-juice-rochester', note: 'Checked resource & film entry' }
      ]
    },
    {
      id: 'lab-crew-and-community',
      url: 'people.html',
      title: 'LaB Crew & Community Connections (ST Park, Comedy Roll, 48HFP)',
      tags: 'crew community st park koffee noir al joe rylie hook the-hook cracked mistaken mike billy veda anton david jeremy brandon amber kate nikki max josh comedy roll horror film roulette detroit film community larry 48hfp local crews who is al who is joe what is the hook what is cracked',
      note: 'Overview of LaB Media crew and Michigan film community connections.',
      answer: 'LaB Media’s core is Bobby and Al, with Joe forming the core trio on films like Scattered. Surrounding them is a vibrant local Michigan film community: ST Park Productions (Joe and Rylie, creators of The Hook and Brimstone), Koffee Noir Productions, Mike (writer/director of Cracked), Billy, Veda, Larry, and Josh (Comedy Roll showrunner). ST Park and Koffee Noir jointly made Mistaken with Veda, Joe, Billy, Anton, Rylie, David, Jeremy, Brandon, Amber, Kate, and Nikki. Bobby crewed on ST Park’s The Hook and Mike’s Cracked, building relationships that fuel collaborative Michigan filmmaking.',
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
      answer: 'LaB’s gear choices are built on practical set efficiency: Two Canon EOS R50s allow rolling two simultaneous angles on a two-person crew. The Tascam Portacapture X8 provides 32-bit float audio so clipping is impossible. A simple fog machine provides atmosphere that no lens can replicate. In post, Bobby’s editing philosophy in DaVinci Resolve is "rough cut first": build the story naked with zero music or color. Once the story works, build the audio foundation (J-cuts, L-cuts, room tone under everything, foley), then grade color last.',
      sources: [
        { title: 'LaB’s Kit Page', url: 'gear.html', note: 'Gear list & notes' }
      ]
    },
    {
      id: 'lab-studio-location',
      url: 'contact.html',
      title: 'LaB Media Base & Location',
      tags: 'where based location studio shelby township michigan macomb county detroit metro',
      note: 'Studio location in Shelby Township, Michigan.',
      answer: 'LaB Media is based in Shelby Township, Michigan (Macomb County, metro Detroit). Films like Scattered were shot locally at River Bends Park at the 22 Mile entrance.',
      sources: [
        { title: 'About LaB', url: 'contact.html', note: 'Location & studio note' }
      ]
    },
    {
      id: 'lab-gear-stabilization',
      url: 'gear.html',
      title: 'Camera Stabilization (Gimbals & Dollies)',
      tags: 'stabilization gimbals dji rs 3 mini ronin dana dolly tabletop movement use for stabilization',
      note: 'Gimbal and dolly stabilization gear used by LaB Media.',
      answer: 'For camera stabilization, LaB Media uses two DJI RS 3 Mini gimbals (allowing two stabilized angles rolling simultaneously), a full-size DJI Ronin for heavier builds, a Dana Dolly 6ft rail system, and tabletop dollies.',
      sources: [
        { title: 'LaB’s Kit', url: 'gear.html', note: 'Camera stabilization gear' }
      ]
    }
  ];

  root.LAB_FIELD_NOTES = notes;
})(typeof window!=='undefined'?window:globalThis);
