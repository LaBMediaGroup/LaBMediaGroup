/* Curated LaB field notes.
   These are quiet retrieval records, not model training data and not page copy.
   Keep every note factual and safe to expose through the public assistant. */
(function(root){
  'use strict';

  var notes = [
    {
      id: 'canon-r50-rec709-lut',
      url: 'colophon.html#field-notes',
      title: 'Canon R50 Rec.709 conversion LUT',
      tags: 'canon eos r50 lut rec709 bt709 canon log 3 clog3 c-log3 wide dr conversion technical color colour grade grading davinci resolve',
      filename: 'BT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0.cube',
      path: 'canon-lut-202510/3dlut/65grid-3dlut/',
      capture: ['Canon Log 3', 'BT.709 color space'],
      note: 'This is the official Canon 65-grid technical conversion from C-Log 3 to BT.709 Wide DR—not a stylized creative LUT. Apply it as the base conversion, then grade from there.',
      answer: 'The exact LUT is:\nBT709_CanonLog3-to-BT709_WideDR_65_FF_Ver.2.0.cube\n\nInside:\ncanon-lut-202510/3dlut/65grid-3dlut/\n\nUse it for Canon R50 footage shot in:\n- Canon Log 3\n- BT.709 color space\n\nIt is the official Canon 65-grid technical conversion from C-Log 3 to BT.709 Wide DR—not a stylized creative LUT. Apply it as the base conversion, then grade from there.'
    }
  ];

  root.LAB_FIELD_NOTES = notes;
})(typeof window!=='undefined'?window:globalThis);
