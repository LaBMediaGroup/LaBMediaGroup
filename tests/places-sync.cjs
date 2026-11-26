// Keep the site's copy of Labcoon's map identical to the brain's.
// node tests/places-sync.cjs          -> fails if they differ
// node tests/places-sync.cjs --write  -> copies the brain's map over the site's copy
const fs = require('fs'), path = require('path');
const brain = '/Volumes/LaB Media/GitHub/labmedia-raccoon/brain/lib/places.json';
const site = path.join(__dirname, '..', 'pond', 'labcoon', 'places.json');
const a = fs.readFileSync(brain, 'utf8'), b = fs.existsSync(site) ? fs.readFileSync(site, 'utf8') : '';
if (process.argv.includes('--write')) { fs.writeFileSync(site, a); console.log('copied', brain, '->', site); process.exit(0); }
if (a !== b) { console.error('places.json differs from the brain map. Run: node tests/places-sync.cjs --write'); process.exit(1); }
const map = JSON.parse(a), names = Object.keys(map.places);
for (const [k, v] of Object.entries(map.places)) for (const key of ['at', ...(v.stand ? ['stand'] : [])]) if (!Array.isArray(v[key]) || v[key].length !== 2) { console.error('bad', k, key); process.exit(1); }
console.log('places.json in sync:', names.length, 'places');
