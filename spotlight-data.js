/* Upcoming-event records shared by events.html and the LaB Assistant.
   Keep dates as local YYYY-MM-DD values. `until` keeps multi-day events
   current through their final day. */
var SPOTLIGHT = [
  {
    id:    'adam-evas-intimate-film',
    date:  '2026-08-05',
    time:  '6:30 PM',
    title: 'Adam &amp; Eva’s: <em>An Intimate Film Experience</em>',
    by:    'Campfire Film Cooperative',
    byUrl: 'https://campfirefilm.org',
    with_: 'The Black Canon · Motor City Cinematheque · Miss Eva’s Detroit',
    where: 'Miss Eva’s, Detroit',
    body:  'A live projection of <em>A Man Called Adam</em> : Sammy Davis Jr., from The Black Canon collection : paired with curated music and signature drinks built around the film. Designed as more than a screening: an evening staged inside the mood and sound of the picture, celebrating Black film history and legacy.',
    tags:  ['Screening','Live projection','Music','Black film history'],
    url:   'https://www.facebook.com/events/1531184581974584'
  },
  {
    id:    'detroit-new-wave',
    date:  '2026-08-27',
    time:  '6:30 PM',
    title: 'Detroit New Wave: <em>The Rise of Cinema Culture</em>',
    part:  'Part 1 of 3',
    by:    'Campfire Film Cooperative',
    byUrl: 'https://campfirefilm.org',
    with_: 'Weekly Watchlist',
    where: 'The Congregation, Detroit',
    body:  'A live-recorded panel bringing Metro Detroit’s independent cinema owners, audiences, and filmmakers into the same room : at least three theaters and microcinemas per night, followed by a social hour with food and drinks. If you want to actually meet the people programming film in this city, this is the room.',
    tags:  ['Alger Theater','Detroit Film Theatre','Farmington Civic','Historic Howell','Lowkey Cinema','Marquee Arts','Milford Independent','Senate Theater','Slimeball Cinerama'],
    url:   'https://www.facebook.com/events/2520859208335856'
  },
  {
    id:    'sci-gore-2026',
    date:  '2026-10-17',
    until: '2026-10-18',
    time:  '11 AM Sat \u2013 6 PM Sun',
    title: 'Sci-Gore: <em>Sci-Fi, Horror &amp; Cosplay</em>',
    by:    'Great Lakes Event Network',
    byUrl: 'https://www.facebook.com/GreatLakesEventNetwork',
    with_: 'Josh Wynn',
    where: '21001 Van Born Rd, Taylor',
    body:  'A two-day convention built around science fiction, horror and dark fantasy \u2014 themed vendors, special guests, showcases, and cosplay wrestling. What earns it a place on this list is the in-house limited-access theater, with screenings running across both days. Closer to cult cinema and retro convention culture than to a comic hall, and deliberately louder and stranger than a traditional con.',
    tags:  ['Convention','Screenings','Horror','Sci-fi','Cosplay'],
    url:   'https://www.facebook.com/events/1559253325559765'
  }
];

if (typeof window !== 'undefined') window.SPOTLIGHT = SPOTLIGHT;
