import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// Check what ships, not whatever happens to be sitting in the folder. The
// working copy lives on the SMB-mounted NAS, which sprays AppleDouble `._*`
// twins beside every file, and staging-only `mockup-*.html` iterations sit in
// the open folder until one is chosen. Both are gitignored, so CI never saw
// them — but a plain `readdirSync` did, and seven checks failed locally against
// a tree that was perfectly fine.
const trackedRootFiles = listTrackedRootFiles();

function listTrackedRootFiles() {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
      .split('\0')
      .filter((file) => file && !file.includes('/'));
  } catch {
    // Not a git checkout (an exported copy, say). Fall back to the folder and
    // drop at least the AppleDouble twins, which are binary and never parse.
    return fs.readdirSync(root).filter((file) => !file.startsWith('._'));
  }
}

const byExtension = (extension) => trackedRootFiles.filter((file) => file.endsWith(extension)).sort();
const htmlFiles = byExtension('.html');
const jsFiles = byExtension('.js');
const jsonFiles = byExtension('.json');

function loadConst(file, name) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${read(file)}\nthis.__value = ${name};`, context, { filename: file });
  return context.__value;
}

const require = createRequire(import.meta.url);
const ideasData = require('../ideas-data.js');
const resources = loadConst('resources-data.js', 'resources');
const gearData = loadConst('gear-data.js', 'gearData');
const spotlight = loadConst('spotlight-data.js', 'SPOTLIGHT');
const fieldNotes = loadConst('field-notes-data.js', 'LAB_FIELD_NOTES');
const assistantKnowledge = loadConst('assistant-data.js', 'LAB_ASSISTANT_KNOWLEDGE');
const assistantCore = require('../assistant-core.js');
const sun = require('../sun-calc.js');
const promptPools = Object.entries(ideasData).filter(([, value]) => Array.isArray(value));
const promptCount = promptPools.reduce((total, [, value]) => total + value.length, 0);
const resourceCount = resources.length;
const gearItemCount = gearData.reduce((total, section) => total + section.items.length, 0);

test('JavaScript files parse', async (t) => {
  for (const file of jsFiles) {
    await t.test(file, () => {
      execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
    });
  }
});

test('inline JavaScript parses on every page', async (t) => {
  for (const file of htmlFiles) {
    await t.test(file, () => {
      const scripts = [...read(file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
      scripts.forEach((match, index) => {
        const attrs = match[1];
        if (/\bsrc\s*=/i.test(attrs) || /application\/ld\+json/i.test(attrs)) return;
        assert.doesNotThrow(
          () => new vm.Script(match[2], { filename: `${file}:inline-${index + 1}` }),
          `${file} inline script ${index + 1} does not parse`
        );
      });
    });
  }
});

test('JSON files parse', async (t) => {
  for (const file of jsonFiles) {
    await t.test(file, () => assert.doesNotThrow(() => JSON.parse(read(file))));
  }
});

test('Story Generator data has one tags object per entry', () => {
  const duplicateLines = read('ideas-data.js').split('\n').filter((line) =>
    (line.match(/\btags\s*:/g) || []).length > 1
  );
  assert.deepEqual(duplicateLines, []);
});

test('Story Generator tag arrays contain no duplicate values', () => {
  for (const [pool, entries] of promptPools) {
    for (const entry of entries) {
      if (!entry || typeof entry === 'string' || !entry.tags) continue;
      for (const key of ['tone', 'cast', 'budget']) {
        const values = entry.tags[key] || [];
        assert.equal(new Set(values).size, values.length, `${pool}: ${entry.text} repeats a ${key} tag`);
      }
    }
  }
});

test('Story Generator pools contain unique prompt text', () => {
  for (const [pool, entries] of promptPools) {
    const values = entries.map((entry) => String(entry?.text ?? entry).trim().toLowerCase());
    assert.equal(new Set(values).size, values.length, `${pool} contains duplicate prompt text`);
  }
});

test('Story Generator can roll every public tone', () => {
  const tones = ['drama', 'comedy', 'dark', 'thriller', 'mystery', 'horror', 'tender', 'experimental', 'scifi', 'action', 'satire', 'docu', 'noir'];
  for (const tone of tones) {
    const roll = ideasData.rollIdea(ideasData, { tone });
    assert.equal(roll.tone, tone);
    assert.ok(roll.text.concept, `${tone} roll has no concept`);
    assert.ok(roll.text.genre, `${tone} roll has no genre`);
  }
});

test('data totals and stable keys are internally consistent', () => {
  assert.ok(resourceCount > 0);
  assert.ok(promptCount > 0);
  assert.ok(gearData.length > 0);
  assert.ok(gearItemCount > 0);
  const resourceKeys = resources.map((resource) => String(resource.id || resource.name)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  assert.equal(new Set(resourceKeys).size, resources.length);
});

test('spotlight events have stable IDs, valid local dates, and usable links', () => {
  assert.equal(new Set(spotlight.map((event) => event.id)).size, spotlight.length);
  for (const event of spotlight) {
    assert.match(event.id, /^[a-z0-9-]+$/);
    assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(event.title);
    assert.ok(event.url);
    assert.doesNotThrow(() => new URL(event.url));
    for (const link of event.links || []) {
      assert.ok(link.label);
      assert.doesNotThrow(() => new URL(link.url));
    }
  }
  const detroit48 = spotlight.filter((event) => event.id.startsWith('detroit-48hfp-'));
  assert.deepEqual(Array.from(detroit48, (event) => event.date), ['2026-08-02', '2026-08-16']);
  assert.match(detroit48[0].time, /Group B · 4:30 PM · Scattered/);
  assert.match(detroit48[0].body, /Scattered[\s\S]*Group B at 4:30 PM/);
  assert.match(detroit48[0].body, /Mistaken[\s\S]*ST Park Productions and Koffee Noir Productions/);
  assert.match(detroit48[0].time, /2:00 PM.*4:30 PM/);
  assert.match(detroit48[1].body, /awards/i);
});

test('assistant knows the Mistaken community film without inventing crew roles', () => {
  const mistaken = fieldNotes.find((note) => note.id === 'community-film-mistaken');
  assert.ok(mistaken);
  for (const name of ['Veda', 'Joe', 'Billy', 'Anton', 'Rylie', 'David', 'Jeremy', 'Brandon', 'Amber', 'Kate', 'Nikki']) {
    assert.match(mistaken.answer, new RegExp(`\\b${name}\\b`));
  }
  assert.match(mistaken.answer, /ST Park Productions and Koffee Noir Productions/);
  assert.match(mistaken.answer, /Group B at 4:30 PM/);
  assert.match(mistaken.answer, /will not guess/i);

  const engine = assistantCore.createEngine({ fieldNotes, spotlight });
  const answer = engine.ask('Who worked on Mistaken?');
  assert.equal(answer.kind, 'field-note');
  assert.match(answer.answer, /Veda[\s\S]*Nikki/);
});

test('assistant knowledge follows the current filmmaking tools', () => {
  for (const title of ['Golden Hour Planner', 'Drone Weather', 'Aspect Ratio Previewer']) {
    assert.ok(assistantKnowledge.pages.some((page) => page.title === title), `${title} is missing from assistant page knowledge`);
  }
  const engine = assistantCore.createEngine({ fieldNotes, spotlight, knowledge: assistantKnowledge });
  const checks = [
    ['What does the Golden Hour Planner do?', /date- and location-aware[\s\S]*sun and moon separate[\s\S]*waxing or waning/i],
    ['What does Drone Weather do?', /Open-Meteo[\s\S]*18-point pre-flight checklist/i],
    ['What does the Aspect Ratio Previewer do?', /multiple local files[\s\S]*zero server uploads/i]
  ];
  for (const [query, expected] of checks) {
    const answer = engine.ask(query);
    assert.equal(answer.kind, 'field-note');
    assert.match(answer.answer, expected);
  }
});

test('public totals match their data sources', () => {
  const index = read('index.html');
  assert.equal((index.match(new RegExp(`${resourceCount} vetted resources`, 'g')) || []).length, 3);

  for (const file of ['learn.html', 'people.html', 'resources.html', 'sourcing.html']) {
    assert.match(read(file), new RegExp(`id="totalCount">${resourceCount} entries`));
  }

  const docs = read('README.md');
  assert.match(docs, new RegExp(`Story generator .* ${promptCount.toLocaleString('en-US')} prompts`));
  assert.match(docs, new RegExp(`${promptPools.length} pools`));
  assert.match(docs, /Five themes/);
  assert.match(docs, new RegExp(`${gearItemCount} items across ${gearData.length} sections`));
  assert.match(docs, new RegExp(`Only ${resources.filter((resource) => resource.id).length} of the ${resourceCount}`));
  assert.doesNotMatch(docs, /YOURCODE/);
});

test('the published page count follows the sitemap', () => {
  const sitemapCount = (read('sitemap.xml').match(/<loc>/g) || []).length;
  const indexablePages = htmlFiles.filter((file) => !['404.html', 'ai-usage.html'].includes(file));
  assert.equal(sitemapCount, indexablePages.length);

  const colophon = read('colophon.html');
  assert.match(colophon, new RegExp(`<h1>${numberWord(sitemapCount)} pages,`, 'i'));
  assert.match(colophon, new RegExp(`<dt>Pages</dt><dd>${sitemapCount}</dd>`));
  assert.equal((colophon.match(new RegExp(`${numberWord(sitemapCount)} pages`, 'gi')) || []).length, 4);
  assert.match(colophon, /<dt>Stylesheets<\/dt><dd>02<\/dd>/);
  assert.doesNotMatch(colophon, /one stylesheet/i);
  assert.match(colophon, /14 mph\s+gusts/);
  assert.doesNotMatch(colophon, /stale-test|A test that had stopped watching/i);
  assert.equal((colophon.match(/press play/gi) || []).length, 1);
  assert.match(colophon, /<div class="bug" id="flight-checklist">\s*<span class="bug-n">11<\/span>/);
  assert.equal((colophon.match(/<h3>[^<]*<em>[^<]+<\/em>[^<]*<\/h3>/g) || []).length, 12);
  // Entries get reordered as tools land, and the numbers are typed by hand, so
  // check the run is still 01..12 with nothing repeated or skipped.
  const bugNumbers = (colophon.match(/<span class="bug-n">(\d+)<\/span>/g) || []).map((span) => span.replace(/\D/g, ''));
  assert.deepEqual(bugNumbers, Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')));
  // The joke only works if the missing page is the one you reach last.
  assert.match(colophon, /<span class="bug-n">12<\/span>\s*<div class="bug-main">\s*<h3>The one page <em>nobody plans to visit<\/em><\/h3>/);
  assert.match(colophon, /\.bug h3 em\{font-style:italic;color:var\(--accent\)\}/);
  // A deliberate contrast: the figures row keeps its square hairline corners,
  // and the definition card is the one that softens.
  assert.match(colophon, /\.def\{[^}]*border-radius:10px/);
  assert.doesNotMatch(colophon, /\.figs\{[^}]*border-radius/);
});

test('each HTML page has one title, viewport, and h1', async (t) => {
  for (const file of htmlFiles) {
    await t.test(file, () => {
      const html = read(file);
      assert.equal((html.match(/<title>/gi) || []).length, 1);
      assert.equal((html.match(/<meta\s+[^>]*name=["']viewport["']/gi) || []).length, 1);
      assert.equal((html.match(/<h1\b/gi) || []).length, 1);
    });
  }
});

test('HTML ids are unique per page', async (t) => {
  for (const file of htmlFiles) {
    await t.test(file, () => {
      const ids = [...read(file).matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
      assert.equal(new Set(ids).size, ids.length);
    });
  }
});

test('primary navigation and Explore footer links stay in sync', () => {
  const pages = htmlFiles.filter((file) => /class=["']nav-primary["']/.test(read(file)));
  const hrefs = (markup) => [...markup.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]);
  const section = (html, startPattern, endPattern) => {
    const start = html.search(startPattern);
    assert.notEqual(start, -1);
    const tail = html.slice(start);
    const end = tail.search(endPattern);
    assert.notEqual(end, -1);
    return tail.slice(0, end);
  };
  const expectedNav = hrefs(section(read(pages[0]), /<nav\b[^>]*class=["']nav-primary["']/, /<\/nav>/i));
  const footerGroups = ['Resources', 'Tools', 'Studio', 'Elsewhere'];
  const group = (html, heading) => hrefs(section(html, new RegExp(`<h3>${heading}</h3>`, 'i'), /<\/div>/i));
  const expectedFooter = Object.fromEntries(footerGroups.map((heading) => [heading, group(read(pages[0]), heading)]));

  for (const file of pages) {
    const html = read(file);
    assert.deepEqual(hrefs(section(html, /<nav\b[^>]*class=["']nav-primary["']/, /<\/nav>/i)), expectedNav, `${file} primary nav drifted`);
    for (const heading of footerGroups) {
      assert.deepEqual(group(html, heading), expectedFooter[heading], `${file} ${heading} footer group drifted`);
    }
  }

  // The footer mirrors the nav's grouping, so it should also reach everywhere
  // the nav reaches. The old flat Explore list had drifted out of step twice.
  const internal = (list) => list.filter((href) => !/^https?:/i.test(href));
  const footerInternal = new Set(internal(footerGroups.flatMap((heading) => expectedFooter[heading])));
  for (const href of internal(expectedNav)) {
    assert.ok(footerInternal.has(href), `${href} is reachable from the nav but missing from the footer`);
  }
  assert.equal(footerInternal.size, internal(expectedNav).length, 'the footer should not reach past the nav either');

  // Elsewhere is for other places on the internet, not other pages of ours.
  for (const href of expectedFooter.Elsewhere) {
    assert.match(href, /^https:\/\//, 'Elsewhere should hold external links only');
  }
});

test('local file references resolve', async (t) => {
  for (const file of htmlFiles) {
    await t.test(file, () => {
      for (const match of read(file).matchAll(/\s(?:href|src|poster)=["']([^"']+)["']/gi)) {
        const value = match[1];
        if (!value || value.includes('${') || /^(?:[a-z]+:|\/\/|#|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
        const clean = decodeURIComponent(value.split('#')[0].split('?')[0]);
        if (!clean) continue;
        const target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(root, clean);
        assert.ok(fs.existsSync(target), `${file} references missing ${value}`);
      }
    });
  }
});

test('floating assistant coverage matches page intent', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    if (file === 'ai-usage.html') {
      assert.doesNotMatch(html, /assistant-widget\.js/);
      continue;
    }
    assert.match(html, /assistant-guide\.js/, `${file} is missing assistant-guide.js`);
    if (file === 'assistant.html') assert.doesNotMatch(html, /assistant-widget\.js/);
    else assert.match(html, /assistant-widget\.js/, `${file} is missing assistant-widget.js`);
  }
});

test('flight checklist follows visitors without exposing the private usage page', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    if (file === 'ai-usage.html') assert.doesNotMatch(html, /flight-checklist\.js/);
    else assert.match(html, /flight-checklist\.js/, `${file} is missing the persistent flight checklist`);
  }
  const checklist = read('flight-checklist.js');
  assert.match(checklist, /lab-preflight/);
  assert.match(checklist, /lab-flight-checklist-ui-v2/);
  assert.match(checklist, /savedUI\.mode\|\|'closed'/);
  assert.match(checklist, /window\.print\(\)/);
  assert.match(checklist, /pointerdown/);
  assert.match(checklist, /data-fc-resize/);
  assert.match(checklist, /fc-spark/);
  assert.match(checklist, /border-radius:10px/);
  assert.match(checklist, /w:parseFloat\(root\.style\.width\)/);
  assert.match(checklist, /Go fly\./);
  assert.equal((checklist.match(/\['[abc][1-6]'/g) || []).length, 18);
});

test('weather and Golden Hour scenes keep separate solar-aware compositions', () => {
  const weather = read('droneweather.html');
  assert.match(weather, /id="wxSceneTest"/);
  assert.match(weather, /data-wx-live/);
  assert.doesNotMatch(weather, /data-wx-time=/);
  assert.doesNotMatch(weather, /class="wx-scene-time"/);
  assert.match(weather, /LaBSun\.phaseAt/);
  assert.match(weather, /function drawMoon/);
  assert.equal((weather.match(/<details class="wx-deepdive">/g) || []).length, 2);
  assert.doesNotMatch(weather, /<details class="wx-deepdive" open/);

  const golden = read('sun.html');
  assert.match(golden, /id="sunNatureCanvas"/);
  assert.match(golden, /id="moonOrb"/);
  const goldenScript = read('sun.js');
  assert.match(goldenScript, /function initNatureScene/);
  assert.match(goldenScript, /wind_gusts_10m/);
  assert.match(goldenScript, /advice-accent/);
  assert.doesNotMatch(goldenScript, /bird\.s\*width/);
  assert.equal((goldenScript.match(/treeTip\(Math\.round/g) || []).length, 5);
  assert.match(goldenScript, /bw\*\.68[\s\S]*bw\*\.78[\s\S]*bw\*\.88/);
});

test('live cloud cover shapes both light scenes without changing safety thresholds', () => {
  const weather = read('droneweather.html');
  const golden = read('sun.js');
  assert.match(weather, /current=[^'"\s]*cloud_cover/);
  assert.match(golden, /current=[^'"\s]*cloud_cover/);
  assert.match(weather, /cloud cover shapes the scene, not the safety verdict/i);
  assert.match(weather, /labSceneSetCloud/);
  assert.match(golden, /labSunSetCloud/);
  assert.match(golden, /Overcast now/);
});

test('AI Usage remains public but deliberately hidden', () => {
  const usage = read('ai-usage.html');
  assert.match(usage, /name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(read('sitemap.xml'), /ai-usage\.html/);
  const entryPoints = htmlFiles.flatMap((file) =>
    [...read(file).matchAll(/<a\b[^>]*href=["'][^"']*ai-usage\.html[^>]*>/gi)]
      .map((match) => ({ file, anchor: match[0] }))
  );
  assert.equal(entryPoints.length, 1);
  assert.equal(entryPoints[0].file, 'colophon.html');
  // The way in is a quiet word in the footer rather than an unlabelled dot
  // floating over the corner. It is a real link now: readable, keyboard
  // reachable and announced, just not advertised.
  assert.match(entryPoints[0].anchor, /class="foot-quiet"/);
  assert.doesNotMatch(entryPoints[0].anchor, /aria-hidden|tabindex|position:fixed/);
  assert.match(read('colophon.html'), /<a class="foot-quiet" href="ai-usage\.html">Usage<\/a>/);
  assert.match(read('lab.css'), /\.foot-quiet\{[^}]*opacity:\.4/);
  assert.match(read('lab-egg.js'), /window\.location\.href\s*=\s*['"]\/ai-usage\.html['"]/);
});

test('new tool pages have complete social preview metadata', () => {
  for (const file of ['aspect.html', 'droneweather.html', 'sun.html']) {
    const html = read(file);
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, /name="twitter:image"/);
  }
});

test('usage timeline adds each changelog item once', () => {
  assert.equal((read('ai-usage.html').match(/days\[e\.date\]\.push\(e\)/g) || []).length, 1);
});

test('reduced-motion weather scene does not schedule a continuous render loop', () => {
  assert.match(read('droneweather.html'), /visible\s*&&\s*!REDUCED\s*\?\s*requestAnimationFrame\(render\)\s*:\s*null/);
});

test('solar calculator keeps local-day events ordered across UTC boundaries', () => {
  const day = sun.getDay('2026-08-01', 42.67, -83.03);
  const events = [day.civilDawn, day.sunrise, day.morningGoldenEnd, day.eveningGoldenStart, day.sunset, day.civilDusk];
  events.slice(1).forEach((event, index) => assert.ok(event > events[index], 'solar events must be chronological'));
  assert.ok(day.daylightMinutes > 800 && day.daylightMinutes < 1000);
  assert.ok(day.maxElevation > 50 && day.maxElevation < 80);
  assert.equal(day.sunset.getUTCDate(), 2, 'Detroit sunset crosses into the next UTC date in August');
});

test('lunar phase calculator distinguishes the major waxing and waning stages', () => {
  const epoch = Date.UTC(2000, 0, 6, 18, 14);
  const cycle = 29.530588853 * 86400000;
  const phases = [
    [0, 'New moon', 0],
    [.25, 'First quarter', .5],
    [.5, 'Full moon', 1],
    [.75, 'Last quarter', .5]
  ];
  for (const [offset, label, illumination] of phases) {
    const phase = sun.moonPhase(new Date(epoch + cycle * offset));
    assert.equal(phase.label, label);
    assert.ok(Math.abs(phase.illumination - illumination) < .01);
  }
  assert.equal(sun.moonPhase(new Date(epoch + cycle * .125)).waxing, true);
  assert.equal(sun.moonPhase(new Date(epoch + cycle * .875)).waxing, false);
});

test('shared lunar arc keeps moon travel independent from the sun', () => {
  const newMoon = sun.moonArc(720, 720, 0);
  const fullMoon = sun.moonArc(0, 720, .5);
  assert.equal(newMoon.aboveHorizon, true, 'new moon transits with the midday sun');
  assert.equal(fullMoon.aboveHorizon, true, 'full moon transits near local midnight');
  assert.ok(sun.moonArc(120, 818, .62).progress > sun.moonArc(1380, 818, .62).progress, 'the overnight arc should continue left to right across midnight');
});

function numberWord(value) {
  const words = {
    17: 'Seventeen'
  };
  return words[value] || String(value);
}
