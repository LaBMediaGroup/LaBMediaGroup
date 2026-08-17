/* Upcoming-event records shared by events.html and the LaB Assistant.
   Keep dates as local YYYY-MM-DD values. `until` keeps multi-day events
   current through their final day. */
var SPOTLIGHT = [
  {
    id:    'detroit-48hfp-premiere-2026',
    date:  '2026-08-02',
    time:  'Group A · 2:00 PM / Group B · 4:30 PM · Scattered',
    title: 'Detroit 48HFP: <em>Premiere Screenings</em>',
    by:    '48 Hour Film Project · Detroit',
    byUrl: 'https://www.48hourfilm.com/detroit',
    venue: 'The Redford Theater',
    venueUrl: 'https://redfordtheatre.com/',
    address: '17360 Lahser Rd, Detroit, MI 48219',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Redford+Theater%2C+17360+Lahser+Rd%2C+Detroit%2C+MI+48219',
    where: 'The Redford Theater · 17360 Lahser Rd, Detroit',
    body:  'The completed 2026 Detroit 48 Hour films hit the big screen in two program blocks. LaB’s film <em>Scattered</em>, made as Sideways Lab, screens in Group B at 4:30 PM alongside <em>Mistaken</em>, a joint ST Park Productions and Koffee Noir Productions short. Group A begins at 2:00 PM.',
    tags:  ['Premiere','Group A · 2 PM','Scattered · Group B · 4:30 PM','Mistaken','Detroit filmmakers'],
    url:   'https://ticketing.useast.veezi.com/sessions/?siteToken=ks2qqa1sp218n79f3jdn2r6qy0',
    links: [
      {label:'Tickets · both screenings',url:'https://ticketing.useast.veezi.com/sessions/?siteToken=ks2qqa1sp218n79f3jdn2r6qy0'},
      {label:'Official event details',url:'https://www.48hourfilm.com/detroit/48hfp'}
    ]
  },
  {
    id:    'royal-starr-mixer-2026',
    date:  '2026-08-11',
    time:  '7:00 PM – 10:00 PM',
    title: 'Royal Starr Filmmaker <em>Mixer</em>',
    by:    'Royal Starr Film Festival',
    byUrl: 'https://www.royalstarrfilmfestival.com',
    venue: 'Eastern Palace Club',
    address: '21509 John R Rd, Hazel Park, MI 48030',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Eastern+Palace+Club%2C+21509+John+R+Rd%2C+Hazel+Park%2C+MI+48030',
    where: 'Eastern Palace Club · 21509 John R Rd, Hazel Park',
    body:  'One of Metro Detroit’s largest film industry networking events — filmmakers, actors, writers, producers, cinematographers, editors, photographers, and content creators in a fun, welcoming atmosphere. $3 donation at the door enters you to win two VIP passes to the Royal Starr Film Festival (Sep 10–13, 2026, Birmingham 8 Theatre Powered by Emagine) — including screenings, networking events, and the full filmmaker weekend.',
    tags:  ['Networking','Mixer','Detroit filmmakers','Royal Starr Film Festival','Giveaway'],
    url:   'https://www.royalstarrfilmfestival.com/mixer'
  },
  {
    id:    'detroit-48hfp-best-of-2026',
    date:  '2026-08-16',
    time:  '7:30 PM',
    title: 'Detroit 48HFP: <em>Best Of Screening &amp; Awards</em>',
    by:    '48 Hour Film Project · Detroit',
    byUrl: 'https://www.48hourfilm.com/detroit',
    venue: 'The Civic Theater',
    venueUrl: 'https://www.thefct.com/',
    address: '33332 Grand River Ave, Farmington, MI 48336',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Civic+Theater%2C+33332+Grand+River+Ave%2C+Farmington%2C+MI+48336',
    where: 'The Civic Theater · 33332 Grand River Ave, Farmington',
    body:  'The top films from the 2026 Detroit 48 Hour Film Project return to the screen, followed by the awards presentation for this year’s winners.',
    tags:  ['Best Of','Screening','Awards','Detroit filmmakers'],
    url:   'https://www.48hourfilm.com/detroit/48hfp',
    links: [
      {label:'Official event details',url:'https://www.48hourfilm.com/detroit/48hfp'}
    ]
  },
  {
    id:    'royal-starr-mixer-2026-09',
    date:  '2026-09-08',
    time:  '7:00 PM – 10:00 PM',
    title: 'Royal Starr <em>Kick-Off Mixer + 11 Years</em>',
    by:    'Royal Starr Arts Institute',
    byUrl: 'https://www.royalstarr.org',
    venue: 'Eastern Palace Club',
    address: '21509 John R Rd, Hazel Park, MI 48030',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Eastern+Palace+Club%2C+21509+John+R+Rd%2C+Hazel+Park%2C+MI+48030',
    where: 'Eastern Palace Club · 21509 John R Rd, Hazel Park',
    body:  'The Royal Starr Film Festival kicks off its 11th year with the monthly filmmaker mixer — networking with filmmakers, actors, casting professionals, and crew, plus casting opportunities and creative connections. Bring business cards, headshots, and resumes.',
    tags:  ['Networking','Mixer','Detroit filmmakers','Royal Starr Film Festival','Kick-Off'],
    url:   'https://www.royalstarr.org'
  },
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
