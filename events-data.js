// ============================================
// LaB MEDIA EVENTS DATABASE
// Michigan & Metro Detroit Only
// ============================================

const eventsData = [
  // ============================================
  // UPCOMING (Verified / Active listings)
  // ============================================

  {
    id: 'royal-starr-new-year-mixer-2026-01-13',
    title: 'Royal Starr Filmmaker New Year Mixer',
    type: 'meetup',
    startDate: '2026-01-13',
    // Facebook/event listings can change—verify before posting hard details
    startTime: '19:00',
    endTime: '22:00',
    location: 'Metro Detroit, MI',
    venue: 'TBD (check RSVP / listing)',
    url: 'https://www.royalstarr.org',
    description: 'Royal Starr New Year mixer (listed for Jan 13). Confirm exact venue/time via RSVP/listing before sharing widely.',
    verification: 'partial (listing found; confirm final details)',
    audience: 'Filmmakers, writers, and creatives looking to connect for 2026 projects.'
  },
  {
    id: 'royal-starr-mixer-2026-02-10',
    title: 'Royal Starr Filmmaker Community Mixer',
    type: 'meetup',
    startDate: '2026-02-10',
    location: 'Metro Detroit, MI',
    venue: 'TBD (Royal Starr posts details monthly)',
    url: 'https://www.royalstarr.org',
    description: 'Royal Starr filmmaker community mixer in Metro Detroit. Check the official RSVP/listing for the final venue.',
    verification: 'verified',
    audience: 'Local filmmakers who want a casual monthly touchpoint.'
  },
  {
    id: 'royal-starr-mixer-2026-03-10',
    title: 'Royal Starr Filmmaker Community Mixer',
    type: 'meetup',
    startDate: '2026-03-10',
    location: 'Metro Detroit, MI',
    venue: 'TBD (Royal Starr posts details monthly)',
    url: 'https://www.royalstarr.org',
    description: 'Royal Starr indicates a 2nd-Tuesday mixer cadence (Jan–Oct). Confirm exact venue/time on the official RSVP/listing.',
    verification: 'cadence (date derived; details TBD)',
    audience: 'Local filmmakers who want a casual monthly touchpoint.'
  },
  {
    id: 'campfire-in-motion-2026-01-15',
    title: 'In Motion (Part 1 of 3): Animation on Film',
    type: 'workshop',
    startDate: '2026-01-15',
    startTime: '18:30',
    location: 'The Scarab Club, 217 Farnsworth St, Detroit, MI 48202',
    venue: 'The Scarab Club',
    url: 'https://campfirefilm.org/events',
    description: 'Campfire Film Cooperative animation series kickoff: “In Motion: Animation on Film.”',
    verification: 'verified',
    audience: 'Animators, experimental filmmakers, and anyone exploring hand-crafted motion.'
  },
  {
    id: 'frames-and-fabric-film-detroit-2026-01-31',
    title: "Film Detroit's Frames & Fabrics: The Art of Film in Detroit",
    type: 'workshop',
    startDate: '2026-01-31',
    startTime: '15:00',
    endTime: '20:00',
    location: 'Heilmann Rec Center, 19601 Brock Ave, Detroit, MI 48205',
    venue: 'Heilmann Rec Center',
    url: 'https://detroitmi.gov/events/film-detroits-frames-fabrics-event-art-film-detroit-jan-31',
    website: 'https://detroitmi.gov/events/film-detroits-frames-fabrics-event-art-film-detroit-jan-31',
    thumbnail: 'images/events/frames-fabrics-2026.svg',
    promoUrl: 'https://www.facebook.com/share/r/1858PXs8By/?mibextid=wwXIfr',
    description: 'Community-focused film event with filmmaking sessions, budget workshops, and makeup/wardrobe sessions.',
    // Official link = Detroit.gov; promo media from FB/screenshot.
    verification: 'verified',
    audience: 'Detroit filmmakers, students, and neighbors exploring hands-on film craft.'
  },
  {
    id: 'fresh-coast-film-festival-2025',
    title: 'Fresh Coast Film Festival',
    type: 'festival',
    startDate: '2025-10-09',
    endDate: '2025-10-12',
    location: 'Traverse City, MI',
    venue: 'Traverse City venues (see official schedule)',
    url: 'https://freshcoastfilmtraversecity.ludus.com/',
    description: 'Traverse City festival focused on fresh voices, screenings, and community events. Confirm final schedule/times via official listings.',
    verification: 'partial (dates to confirm)',
    audience: 'Filmmakers and film lovers looking for regional festival exposure.'
  },

  // ============================================
  // PAST EVENTS (Confirmed)
  // ============================================

  {
    id: 'comedy-roll-kickoff-2025',
    title: 'The Comedy Roll Kickoff 2025',
    type: 'festival',
    startDate: '2025-04-01',
    startTime: '19:00',
    endTime: '22:00',
    location: 'Hazel Park, MI',
    venue: 'Eastern Palace Club',
    url: 'https://thecomedyroll.com',
    description: 'Opening-night kickoff for The Comedy Roll: live pitches, lineup reveal, and signups for the 2025 run.',
    verification: 'verified',
    audience: 'Comedy filmmakers, writers, and teams looking for a timed challenge.',
    recap: 'A packed kickoff night with live pitches, new teams forming, and the 2025 challenge calendar revealed.',
    photos: []
  },
  {
    id: 'comedy-roll-showcase-2025',
    title: 'The Comedy Roll Showcase 2025',
    type: 'screening',
    startDate: '2025-05-20',
    startTime: '19:00',
    location: 'Royal Oak, MI',
    venue: 'Emagine Royal Oak',
    url: 'https://thecomedyroll.com',
    description: 'Showcase screening for the 2025 Comedy Roll (per official site listing).',
    verification: 'verified',
    audience: 'Comedy teams, friends, and local supporters celebrating finished shorts.',
    recap: 'A full-house screening with audience Q&A and a spotlight on standout teams.',
    photos: []
  },
  {
    id: 'hfr-kickoff-2025',
    title: 'Horror Film Roulette XII Kick-Off',
    type: 'festival',
    startDate: '2025-09-05',
    startTime: '18:00',
    endTime: '22:00',
    location: 'The Scarab Club, 217 Farnsworth St, Detroit, MI 48202',
    venue: 'The Scarab Club',
    url: 'https://www.horrorfilmroulette.com',
    description: 'Annual HFR competition kick-off (teams draw subgenres + begin the sprint).',
    verification: 'verified',
    audience: 'Horror filmmakers and teams ready to sprint on a tight deadline.',
    recap: 'Teams pulled their genres, met collaborators, and launched the 4-week production sprint.',
    photos: []
  },
  {
    id: 'royal-starr-film-festival-2025',
    title: 'Royal Starr Film Festival 2025',
    type: 'festival',
    startDate: '2025-09-11',
    endDate: '2025-09-14',
    location: 'Birmingham, MI',
    venue: 'Emagine Birmingham 8',
    url: 'https://filmfreeway.com/RoyalStarrFilmFestival',
    description: 'Royal Starr Film Festival 2025 run.',
    verification: 'verified',
    audience: 'Filmmakers and film lovers attending screenings, panels, and mixers.',
    recap: 'Multiple days of screenings and filmmaker spotlights across Birmingham.',
    photos: []
  },
  {
    id: 'hfr-showcase-2025',
    title: 'Horror Film Roulette XII Showcase',
    type: 'screening',
    startDate: '2025-10-26',
    startTime: '19:00',
    location: 'Royal Oak, MI',
    venue: 'Emagine Royal Oak',
    url: 'https://www.horrorfilmroulette.com',
    description: 'Big-screen showcase of the year’s HFR films.',
    verification: 'verified',
    audience: 'Horror Film Roulette teams, fans, and Metro Detroit film community.',
    recap: 'Showcase night with an audience-first screening and team recognition.',
    photos: []
  },
  {
    id: 'horror-film-roulette-2024',
    title: 'Horror Film Roulette Kickoff',
    type: 'festival',
    startDate: '2024-09-05',
    startTime: '18:00',
    endTime: '22:00',
    location: 'The Scarab Club, 217 Farnsworth St, Detroit, MI 48202',
    venue: 'The Scarab Club',
    url: 'https://filmfreeway.com/HorrorFilmRoulette',
    description: 'Horror Film Roulette: annual Michigan horror filmmaking competition (roulette theme draw + 4-week sprint).',
    verification: 'verified',
    audience: 'Horror filmmakers and crews starting their competition sprint.',
    recap: 'A classic kickoff with theme draws, team meetups, and production planning.',
    photos: []
  }
];
