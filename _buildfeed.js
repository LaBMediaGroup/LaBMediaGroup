/* Regenerates feed.xml and feed.json from the site's own data.
   Run after adding a film, a dated resource, or an event:  node _buildfeed.js  */
const fs = require('fs'), vm = require('vm');

const strip = t => String(t).replace(/<[^>]+>/g, '')
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
  .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const items = [];

/* films — read from the schema block so there is one source of truth */
const p = fs.readFileSync('portfolio.html', 'utf8');
const ld = JSON.parse(p.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
ld.mainEntity.itemListElement.forEach(x => {
  const f = x.item;
  items.push({ title: f.name, link: f.url, date: f.dateCreated, cat: 'Film',
    desc: f.description + (f.award ? ' — won ' + f.award + '.' : '') });
});

/* resources that carry an added date */
const rs = { window: {} }; vm.createContext(rs);
vm.runInContext(fs.readFileSync('resources-data.js', 'utf8') + ';\nthis.__out = resources;', rs);
(rs.__out || []).filter(r => r.added).forEach(r => {
  items.push({ title: r.name, link: 'https://labmedia.work/resources.html#' + (r.id || ''),
    date: r.added, cat: 'Resource', desc: r.desc || '' });
});

/* spotlight events, pulled straight out of events.html */
const ev = fs.readFileSync('events.html', 'utf8');
const block = ev.match(/var SPOTLIGHT\s*=\s*(\[[\s\S]*?\n\];)/);
if (block) {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext('var SPOTLIGHT = ' + block[1].replace(/with_/g, 'withWho'), ctx);
  (ctx.SPOTLIGHT || []).forEach(e => {
    items.push({ title: strip(e.title), link: e.url || 'https://labmedia.work/events.html',
      date: e.date, cat: 'Event',
      desc: strip(e.body || '') + (e.where ? ' — ' + strip(e.where) : '') });
  });
}

items.sort((a, b) => (a.date < b.date ? 1 : -1));

const now = new Date().toUTCString();
let rss = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
  + '  <title>LaB Media</title>\n  <link>https://labmedia.work</link>\n'
  + '  <description>A small film studio and a public notebook, run out of Shelby Township, Michigan.</description>\n'
  + '  <language>en-us</language>\n  <lastBuildDate>' + now + '</lastBuildDate>\n'
  + '  <atom:link href="https://labmedia.work/feed.xml" rel="self" type="application/rss+xml"/>\n';
items.forEach(i => {
  rss += '  <item>\n    <title>' + esc(i.title) + '</title>\n'
    + '    <link>' + esc(i.link) + '</link>\n'
    + '    <guid isPermaLink="false">' + esc(i.link) + '</guid>\n'
    + '    <pubDate>' + new Date(i.date + 'T12:00:00Z').toUTCString() + '</pubDate>\n'
    + '    <category>' + i.cat + '</category>\n'
    + '    <description>' + esc(i.desc) + '</description>\n  </item>\n';
});
rss += '</channel>\n</rss>\n';
fs.writeFileSync('feed.xml', rss);

fs.writeFileSync('feed.json', JSON.stringify({
  version: 'https://jsonfeed.org/version/1.1', title: 'LaB Media',
  home_page_url: 'https://labmedia.work', feed_url: 'https://labmedia.work/feed.json',
  description: 'A small film studio and a public notebook, run out of Shelby Township, Michigan.',
  icon: 'https://labmedia.work/images/favicon-512.png',
  items: items.map(i => ({ id: i.link, url: i.link, title: i.title,
    content_text: i.desc, date_published: i.date + 'T12:00:00Z', tags: [i.cat] }))
}, null, 2));

const by = {};
items.forEach(i => by[i.cat] = (by[i.cat] || 0) + 1);
console.log(items.length + ' items — ' + Object.entries(by).map(x => x[1] + ' ' + x[0].toLowerCase()).join(', '));
