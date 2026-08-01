import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const jsFiles = fs.readdirSync(root).filter((file) => file.endsWith('.js')).sort();
const jsonFiles = fs.readdirSync(root).filter((file) => file.endsWith('.json')).sort();

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
  assert.match(entryPoints[0].anchor, /aria-hidden="true"/);
  assert.match(entryPoints[0].anchor, /position:fixed/);
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

function numberWord(value) {
  const words = {
    17: 'Seventeen'
  };
  return words[value] || String(value);
}
