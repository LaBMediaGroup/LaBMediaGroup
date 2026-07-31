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
      id: 'lab-production-behind-the-scenes',
      url: 'contact.html',
      title: 'What it’s like on a LaB set (Behind the Scenes & Collaboration)',
      tags: 'shoot set set life filming behind the scenes bts crew collaboration crew size brand film short film edit editing how we shoot spaces environment Al helpers team work working on a film set environment',
      note: 'Curated notes on how LaB Media shoots, crew size, collaboration, and set life.',
      answer: 'On a LaB set, nothing is a solo effort:\n- Short Films: Made collaboratively with small, tight-knit crews of good friends. For example, Al handles the editing (winning Best Editing for Trail Dead), while collaborators crew up on set to run sound, light, or lend a hand.\n- Brand Pieces (like MOZ Interiors & Le Juicé): Filmed with lean 1–2 person crews on location, moving fast with a minimal footprint so the space and real people stay front and center.\n- Production Spaces: Set environments are kept relaxed, collaborative, and practical—focused on getting great work done without huge crew overhead.',
      sources: [
        { title: 'About LaB & Collaboration', url: 'contact.html', note: 'About Bobby & how LaB shoots' },
        { title: 'People & Collaborators', url: 'people.html', note: 'People & Community' },
        { title: 'The Reel & Production Notes', url: 'portfolio.html', note: 'Film timelines and BTS galleries' }
      ]
    }
  ];

  root.LAB_FIELD_NOTES = notes;
})(typeof window!=='undefined'?window:globalThis);
