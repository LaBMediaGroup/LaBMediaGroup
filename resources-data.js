// ============================================
// LaB MEDIA PRODUCTION RESOURCES DATABASE
// ============================================

const resources = [
    // ============================================
    // COLLABORATORS
    // ============================================
    {
        name: 'Anthony R Brass',
        category: 'collaborators',
        desc: 'Fine artist known for vibrant, nature-driven work that leans into color and mood.',
        fullDesc: 'Anthony R Brass is a fine artist whose paintings explore nature, memory, and emotion through saturated color and bold composition. His work often balances organic forms with an intuitive, expressive energy—built for close looking and slow living.',
        url: 'https://www.anthonybrass.com',
        instagramUrl: 'https://www.instagram.com/anthonyrbrass/',
        youtubeUrl: 'https://www.youtube.com/channel/UChBFLCl5yzjO_vZj15_pqhw',
        facebookUrl: 'https://www.facebook.com/anthonyRbrass/',
        featuredVideo: 'CPvxM8GrCg8',
        features: ['Fine Art', 'Nature-Inspired', 'Documentary Subject', 'Studio Work']
    },
    {
        name: 'MOZ Interiors',
        category: 'collaborators',
        desc: 'Luxury interior design studio with press features including Vanity Fair, AD, and Hour Detroit.',
        fullDesc: 'MOZ Interiors is a luxury interior design studio focused on refined spaces with strong architectural lines and elevated material choices. Their work has been featured in outlets including Vanity Fair, Architectural Digest, Hour Detroit, and The World of Interiors—design that reads clean, confident, and lived-in.',
        url: 'https://www.mozinteriors.com',
        instagramUrl: 'https://www.instagram.com/moz_interiors/',
        facebookUrl: 'https://www.facebook.com/mozinterior',
        featuredVideo: 'HtF4L9RpkaU',
        features: ['Interior Design', 'Press Featured', 'Commercial Partner', 'Luxury Brand']
    },
    {
        name: 'Joe Garofalo Music',
        category: 'collaborators',
        desc: 'Composer and producer creating original scores and custom music across genres.',
        fullDesc: 'Joe Garofalo is a composer and musician crafting original scores and custom music built to support story and atmosphere. His work moves comfortably between cinematic textures, modern electronic palettes, and stripped-back instrumentation—adaptable, detailed, and mix-ready.',
        url: 'https://www.joegarofalomusic.com',
        instagramUrl: 'https://www.instagram.com/_joegmusic_/',
        spotifyUrl: 'https://open.spotify.com/artist/3w9fELcZkbxwfto7bZOajz',
        features: ['Original Scores', 'Music Production', 'Composer', 'Multi-Genre']
    },
    {
        name: 'The Pandys',
        category: 'collaborators',
        desc: 'Detroit band featured in LaB Media live session music videos.',
        fullDesc: 'The Pandys bring raw, high-energy performances with a lived-in, no-frills feel. LaB Media captured authentic rehearsal and live-session energy with minimal production interference—momentum first, always.',
        url: null,
        instagramUrl: 'https://www.instagram.com/thepandys/',
        facebookUrl: 'https://www.facebook.com/thepandys/',
        spotifyUrl: 'https://open.spotify.com/artist/2YgKO7H0VDyFOAJtEYpBX7',
        features: ['Music Video', 'Live Sessions', 'Band', 'Authentic Performance']
    },
    {
        name: 'Sideways Studio',
        category: 'collaborators',
        desc: 'Animation and motion partner crafting expressive character-led work.',
        fullDesc: 'Sideways Studio delivers animation and motion design with a playful, character-forward aesthetic—ideal for narrative explainers, title sequences, and stylized visual storytelling.',
        url: 'https://sidewaysstudio.net',
        instagramUrl: 'https://www.instagram.com/sideways_animation/',
        vimeoVideo: '938684872',
        features: ['Animation', 'Motion Design', 'Character Work', 'Title Design']
    },

    // ============================================
    // COMMUNITY & NETWORKING
    // ============================================
    {
        name: 'Royal Starr Arts Institute',
        category: 'community',
        desc: 'Michigan nonprofit building filmmaker community through mixers, events, and festival programming.',
        fullDesc: 'Royal Starr Arts Institute serves Michigan\'s creative community through networking, education, and events—anchored by Royal Starr Film Festival and recurring filmmaker mixers in Metro Detroit.',
        url: 'https://www.royalstarr.org',
        filmFreewayUrl: 'https://filmfreeway.com/RoyalStarrFilmFestival',
        instagramUrl: 'https://www.instagram.com/royalstarrff/',
        additionalLinks: [
            {
                label: 'Michigan Crew Calls',
                url: 'https://www.facebook.com/groups/micrewcalls/',
                type: 'facebook',
                description: 'Royal Starr subgroup for crew opportunities and on-set needs.'
            },
            {
                label: 'Michigan Talent Casting',
                url: 'https://www.facebook.com/groups/micasting/',
                type: 'facebook',
                description: 'Royal Starr subgroup for casting calls and Michigan talent.'
            }
        ],
        paid: false,
        hideKeyInfo: true,
        features: ['Michigan Community', 'Networking', 'Events', 'Festival Hub']
    },
    {
        name: 'Michigan Filmmaker Community (Facebook Group)',
        category: 'community',
        desc: 'Facebook networking group for Michigan filmmakers, cast, and crew.',
        fullDesc: 'Active Facebook group for connecting Michigan filmmakers with actors, crew, and collaborators. Useful for posting gigs, staffing up, sharing resources, and finding local production support.',
        url: 'https://www.facebook.com/groups/mifilmcommunity',
        keyInfo: [
            { label: 'Main Group', value: 'Michigan Filmmaker Community' },
            { label: 'Subgroups', value: 'Michigan Crew Calls, Michigan Talent Casting' }
        ],
        additionalLinks: [
            {
                label: 'Main Group',
                url: 'https://www.facebook.com/groups/mifilmcommunity',
                type: 'facebook',
                description: 'Active Facebook group for connecting Michigan filmmakers with actors, crew, and collaborators. Useful for posting gigs, staffing up, sharing resources, and finding local production support.'
            },
            {
                label: 'Michigan Crew Calls',
                url: 'https://www.facebook.com/groups/micrewcalls/',
                type: 'facebook',
                description: 'Subgroup dedicated to on-set crew opportunities and urgent hires.'
            },
            {
                label: 'Michigan Talent Casting',
                url: 'https://www.facebook.com/groups/micasting/',
                type: 'facebook',
                description: 'Focused casting posts for Michigan-based actors and performers.'
            }
        ],
        paid: false,
        features: ['Facebook Group', 'Networking', 'Casting & Crew', 'Local Community']
    },
    {
        name: 'Campfire Film Cooperative',
        category: 'community',
        desc: 'Community for filmmakers and creators—events, meetups, and crew connection.',
        fullDesc: 'Campfire Film Cooperative is a community built around connection and craft: share work, find collaborators, and show up for events designed to spark momentum and keep projects moving.',
        url: 'https://campfirefilm.org',
        youtubeUrl: 'https://www.youtube.com/@campfirefilmcoop',
        facebookUrl: 'https://www.facebook.com/campfirefilm',
        instagramUrl: 'https://www.instagram.com/campfirefilm',
        paid: false,
        features: ['Community', 'Events', 'Find Your Crew', 'Work Sharing']
    },
    {
        name: 'Mograph Mondays Detroit',
        category: 'community',
        desc: 'Monthly Detroit meetup for motion designers, animators, and CG artists.',
        fullDesc: 'Mograph Mondays Detroit is a recurring meetup for motion designers, animators, CG artists, and adjacent creatives—an easy on-ramp to post, VFX, and design collaborators.',
        url: 'https://www.mographmondays.com/det',
        instagramUrl: 'https://www.instagram.com/mographmondaysdetroit',
        facebookUrl: 'https://www.facebook.com/groups/mographmondays/',
        paid: false,
        features: ['Meetup', 'Motion Design', 'Animation', 'Networking']
    },
    {
        name: 'Michigan Crew Calls',
        category: 'community',
        desc: 'Facebook group for Michigan crew opportunities and on-set needs.',
        fullDesc: 'Michigan Crew Calls is a Facebook community built for posting and finding crew gigs, last-minute hires, and on-set opportunities across the state.',
        url: 'https://www.facebook.com/groups/micrewcalls/',
        paid: false,
        features: ['Facebook Group', 'Crew Calls', 'Hiring', 'Local Production']
    },
    {
        name: 'Michigan Talent Casting',
        category: 'community',
        desc: 'Facebook group dedicated to casting calls for Michigan talent.',
        fullDesc: 'Michigan Talent Casting connects producers and directors with Michigan actors and performers—centralized casting posts and opportunities.',
        url: 'https://www.facebook.com/groups/micasting/',
        paid: false,
        features: ['Facebook Group', 'Casting', 'Actors', 'Michigan Talent']
    },

    // ============================================
    // FILM FESTIVALS
    // ============================================
    {
        name: 'Detroit Filmmaker Awards',
        category: 'film-festivals',
        desc: 'Detroit-based festival and awards program spotlighting independent filmmakers.',
        fullDesc: 'Detroit Filmmaker Awards is an annual Detroit festival and awards program that highlights independent filmmaking with screenings, networking, and celebration awards across multiple categories.',
        url: 'https://detroitfilmmakerawards.com/',
        filmFreewayUrl: 'https://filmfreeway.com/DetroitFilmmakerAwards',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Detroit, MI' }
        ],
        features: ['Awards Program', 'Detroit-Based', 'Independent Film', 'FilmFreeway Submissions']
    },
    {
        name: 'Cinetopia Film Festival',
        category: 'film-festivals',
        desc: 'Ann Arbor festival showcasing independent cinema.',
        fullDesc: 'Cinetopia brings acclaimed independent films to Ann Arbor with a focus on films that have premiered at major festivals. Curated selection with filmmaker appearances and community discussions.',
        url: 'https://cinetopiafestival.org',
        filmFreewayUrl: 'https://filmfreeway.com/CinetopiaFilmFestival',
        paid: true,
        pricing: [
            { plan: 'Feature', price: '$35-50' },
            { plan: 'Short', price: '$25-35' }
        ],
        keyInfo: [
            { label: 'Location', value: 'Ann Arbor, MI' }
        ],
        features: ['Ann Arbor', 'Curated Selection', 'Indie Focus', 'University Town']
    },
    {
        name: 'Ann Arbor Film Festival (AAFF)',
        category: 'film-festivals',
        desc: 'Oldest experimental film festival in North America celebrating independent and avant-garde cinema.',
        fullDesc: 'Ann Arbor Film Festival is a globally recognized festival for experimental, documentary, narrative, animation, and hybrid films. Founded in 1963, it is Academy Award®–qualifying for short films and features international submissions alongside a traveling Best of AAFF program.',
        url: 'https://www.aafilmfest.org/',
        filmFreewayUrl: 'https://filmfreeway.com/AAFilmFest',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Ann Arbor, MI' },
            { label: 'Timing', value: 'Late March (annual)' }
        ],
        features: ['Experimental Focus', 'Academy Award Qualifying', 'International Submissions', 'Best of AAFF Tour']
    },
    {
        name: 'Capital City Film Festival (CCFF)',
        category: 'film-festivals',
        desc: '10-day Lansing festival with screenings, mixers, and filmmaker Q&As.',
        fullDesc: 'Capital City Film Festival in Lansing showcases a diverse mix of narrative, documentary, and experimental films alongside live events, mixers, and filmmaker Q&As. It supports both local and international artists.',
        filmFreewayUrl: 'https://filmfreeway.com/CapitalCityFilmFestival',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Lansing, MI' },
            { label: 'Timing', value: 'April (annual)' }
        ],
        features: ['Lansing', 'Live Events', 'Filmmaker Q&As', 'International & Local Mix']
    },
    {
        name: 'Dancing Stars Uplifting Film Fest',
        category: 'film-festivals',
        desc: 'Emerging film festival focused on uplifting stories and visibility.',
        fullDesc: 'Dancing Stars Uplifting Film Fest is a growing festival highlighted through FilmFreeway, offering visibility for uplifting and positive storytelling across short and feature formats.',
        filmFreewayUrl: 'https://filmfreeway.com/DancingstarsUpliftingFilmFest',
        paid: true,
        features: ['Emerging Festival', 'Uplifting Stories', 'FilmFreeway Submissions']
    },
    {
        name: 'Hell’s Half Mile Film & Music Festival',
        category: 'film-festivals',
        desc: 'Bay City indie film and music festival with screenings, panels, and live music.',
        fullDesc: 'Hell’s Half Mile is a four-day independent film and music festival in downtown Bay City featuring features, shorts, live music, panels, and community networking events. Founded in 2006, it blends indie cinema with indie music culture.',
        url: 'https://hhmfest.com/',
        filmFreewayUrl: 'https://filmfreeway.com/HellsHalfMileFilmMusicFestival',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Bay City, MI' },
            { label: 'Timing', value: 'Late September (annual)' }
        ],
        features: ['Film + Music', 'Panels & Networking', 'Downtown Bay City', 'Indie Focus']
    },
    {
        name: 'Horror Film Roulette',
        category: 'film-festivals',
        desc: 'Horror short film competition. Trail Dead won Best Editing 2025.',
        fullDesc: 'Horror Film Roulette is a competitive horror short film festival where LaB Media\'s "Trail Dead" earned Best Editing recognition in 2025. Quick turnaround format challenges filmmakers with genre constraints.',
        url: 'https://horrorfilmroulette.com',
        filmFreewayUrl: 'https://filmfreeway.com/HorrorFilmRoulette',
        facebookUrl: 'https://www.facebook.com/Horrorfilmroulette/',
        instagramUrl: 'https://www.instagram.com/horrorfilmroulette',
        youtubeUrl: 'https://www.youtube.com/@horrorfilmroulette',
        paid: true,
        labPick: true,
        pricing: [
            { plan: 'Entry', price: '$15-35' }
        ],
        features: ['Horror Genre', 'Competition Format', 'Short Films', 'Quick Turnaround']
    },
    {
        name: 'Comedy Roll Film Festival',
        category: 'film-festivals',
        desc: 'Comedy short competition. Lookout placed Top 25 in 2025.',
        fullDesc: 'Comedy Roll Film Festival celebrates comedic short films. LaB Media\'s "Lookout" earned Top 25 placement in 2025. Focused on tight, well-executed comedy across multiple styles.',
        url: 'https://thecomedyroll.com',
        filmFreewayUrl: 'https://filmfreeway.com/TheComedyRoll/',
        instagramUrl: 'https://www.instagram.com/thecomedyroll_',
        youtubeUrl: 'https://www.youtube.com/@thecomedyroll',
        facebookUrl: 'https://www.facebook.com/thecomedyroll',
        paid: true,
        labPick: true,
        pricing: [
            { plan: 'Entry', price: '$15-35' }
        ],
        features: ['Comedy Genre', 'Competition', 'Short Films', 'Multiple Styles']
    },
    {
        name: 'Creepy Cheapy',
        category: 'film-festivals',
        desc: 'Michigan micro-budget horror fest for DIY, cult, and underground genre work.',
        fullDesc: 'Creepy Cheapy is a Michigan-based horror festival built for scrappy, micro-budget filmmaking—cult energy, practical effects, underground voices, and regional community screenings. A strong fit for filmmakers making weird, lean, and fearless genre work without the “competition sprint” structure of time-boxed challenges.',
        url: 'https://www.creepycheapy.com',
        filmFreewayUrl: 'https://filmfreeway.com/CreepyCheapy',
        paid: true,
        pricing: [
            { plan: 'Shorts & Features', price: '$10–30' }
        ],
        features: [
            'Micro-Budget Friendly',
            'Regional Michigan',
            'Cult Horror',
            'Underground & DIY',
            'Practical FX Vibes',
            'Community Screenings'
        ]
    },
    {
        name: 'Farmington Film Festival',
        category: 'film-festivals',
        desc: 'Metro Detroit festival pairing community screenings with filmmaker networking.',
        fullDesc: 'Farmington Film Festival showcases indie shorts and features with a focus on community connection in Metro Detroit. Programming blends local voices with visiting filmmakers and pairs screenings with live Q&As and mixer-style events.',
        url: 'https://kickstartfarmington.org/film/',
        filmFreewayUrl: 'https://filmfreeway.com/FFF26',
        instagramUrl: 'https://www.instagram.com/kickstart_farmington',
        facebookUrl: 'https://www.facebook.com/KickstartFarmington',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Farmington, MI' }
        ],
        features: ['Community Screenings', 'Q&A Sessions', 'Metro Detroit', 'FilmFreeway Submissions']
    },
    {
        name: 'Fresh Coast Film Festival',
        category: 'film-festivals',
        desc: 'Marquette documentary festival celebrating outdoor lifestyle and Great Lakes stories.',
        fullDesc: 'Fresh Coast Film Festival in Marquette showcases documentary films centered on outdoor lifestyles, Great Lakes storytelling, and environmental and cultural themes. The October festival pairs screenings with outdoor activities and community events.',
        url: 'https://freshcoastfilm.com/',
        instagramUrl: 'https://www.instagram.com/freshcoastfilm',
        paid: true,
        keyInfo: [
            { label: 'Location', value: 'Marquette, MI' },
            { label: 'Timing', value: 'October (third weekend)' }
        ],
        features: ['Documentary Focus', 'Outdoor Lifestyle', 'Great Lakes Stories', 'Community Screenings']
    },

    // ============================================
    // REFERENCES
    // ============================================
    {
        name: 'Hillier Smith',
        category: 'references',
        refType: 'editing',
        desc: 'High-level breakdowns on editing momentum for YouTube storytelling.',
        fullDesc: 'Film editor Hillier Smith dissects pacing, structure, and storytelling choices for creator-led projects—practical, advanced insight for cutting modern YouTube narratives.',
        url: 'https://www.youtube.com/@HillierSmith',
        paid: false,
        featuredVideo: 'IROKEjmIIlM',
        additionalVideos: ['mPhhBgTIG2Y'],
        features: ['Editing', 'Pacing', 'Story Structure', 'YouTube Craft']
    },
    {
        name: 'Gawx Art',
        category: 'references',
        refType: 'art',
        desc: 'Experimental digital artist blending illustration, animation, and texture.',
        fullDesc: 'Expressive digital illustration through animation, texture, and surreal motion—great reference for stylized visual language.',
        url: 'https://www.youtube.com/@GawxArt',
        paid: false,
        featuredVideo: 'N08LnQ77hGs',
        additionalVideos: ['BbwgsBPuXRE'],
        features: ['Digital Art', 'Animation', 'Experimental Visuals', 'Creative Process']
    },
    {
        name: 'Dodford',
        category: 'references',
        refType: 'filming',
        desc: 'Visual storytelling experiments with a creator-first, process-forward approach.',
        fullDesc: 'A channel built around creative experimentation—useful for seeing how simple ideas evolve into polished visual narratives.',
        url: 'https://www.youtube.com/@DodfordYT',
        paid: false,
        featuredVideo: 'NKYH738UihQ',
        additionalVideos: ['dujnjw_s8bY'],
        features: ['Creative Process', 'Visual Storytelling', 'Experimentation']
    },
    {
        name: 'Chuck Lee MBM',
        category: 'references',
        refType: 'filming',
        desc: 'Creative filmmaking and craft-focused storytelling references.',
        fullDesc: 'Practical creative inspiration centered on making, refining, and finishing work—good fuel for momentum.',
        url: 'https://www.youtube.com/@ChuckLeeMBM',
        paid: false,
        featuredVideo: 'iGTif3RG42U',
        features: ['Filmmaking', 'Creative Process', 'Storytelling', 'Craft', 'Made in Michigan']
    },
    {
        name: 'Joris Hermans',
        category: 'references',
        refType: 'filming',
        desc: 'Design-forward filmmaking and visual craft inspiration.',
        fullDesc: 'A clean, intentional approach to visuals—useful reference for composition, pacing, and taste.',
        url: 'https://www.youtube.com/@JorisHermans',
        paid: false,
        featuredVideo: 'N2EelRBlwtQ',
        features: ['Visual Craft', 'Composition', 'Pacing', 'Taste']
    },
    {
        name: 'ALTER',
        category: 'references',
        refType: 'references',
        desc: 'Award-winning short horror films and genre storytelling.',
        fullDesc: 'Curated horror shorts from filmmakers around the world—a consistent reference for pacing, atmosphere, and short-form genre execution. Useful for studying structure, tension building, and visual storytelling in tight formats.',
        url: 'https://www.youtube.com/WatchALTER',
        instagramUrl: 'https://www.instagram.com/watch_alter/',
        paid: false,
        featuredVideo: 'EBGwY0bOjsU',
        features: ['Horror Shorts', 'Genre Storytelling', 'Pacing Reference', 'Short Form']
    },
    {
        name: 'paul_et',
        category: 'references',
        refType: 'art',
        desc: 'Design, motion, and digital craft inspiration with a modern aesthetic.',
        fullDesc: 'A modern visual sensibility—useful reference for minimal, clean design decisions and motion-forward thinking.',
        url: 'https://www.youtube.com/@paul_et',
        paid: false,
        featuredVideo: '5mWtaTlSvww',
        features: ['Design', 'Motion', 'Modern Aesthetic', 'Digital Craft']
    },
    {
        name: 'Sean Kitching',
        category: 'references',
        refType: 'filming',
        desc: 'Creator workflow and filmmaking momentum inspiration.',
        fullDesc: 'A reference point for staying consistent—workflow, output, and pushing projects over the finish line.',
        url: 'https://www.youtube.com/@seankitching',
        paid: false,
        featuredVideo: 'tqdWtSnoRws',
        features: ['Workflow', 'Consistency', 'Filmmaking', 'Output']
    },
    {
        name: 'Casey Neistat',
        category: 'references',
        refType: 'filming',
        desc: 'High-energy personal filmmaking and creative momentum.',
        fullDesc: 'A reference for rhythm, structure, and creative confidence—motion-first storytelling with editorial instinct.',
        url: 'https://www.youtube.com/@casey',
        paid: false,
        featuredVideo: '-jCQerxzF48',
        features: ['Personal Filmmaking', 'Editing Rhythm', 'Creative Process']
    },
    {
        name: 'Lofi Girl',
        category: 'references',
        refType: 'music',
        desc: 'Iconic lo-fi music channel with strong visual identity.',
        fullDesc: 'A reference point for branding, tone, and ambient storytelling through consistent visual language.',
        url: 'https://www.youtube.com/@LofiGirl',
        paid: false,
        featuredVideo: '8b3fqIBrNW0',
        features: ['Music Channel', 'Visual Identity', 'Brand Consistency']
    },
    {
        name: 'Viva La Dirt League',
        category: 'references',
        refType: 'filming',
        desc: 'Narrative comedy sketches rooted in gaming and pop culture.',
        fullDesc: 'High-output narrative comedy with strong character consistency and efficient production workflows.',
        url: 'https://www.youtube.com/@VivaLaDirtLeague',
        instagramUrl: 'https://www.instagram.com/vivaladirtleague/',
        paid: false,
        featuredVideo: 'tM2L1Je92w0',
        features: ['Comedy', 'Sketch Writing', 'Narrative Shorts', 'High Output']
    },
    // ============================================
    // DRONE
    // ============================================
    {
        name: 'Joshua Bardwell',
        category: 'drone',
        droneType: 'channels',
        droneSubType: 'channels',
        desc: 'FPV drone tutorials and gear deep-dives with clear visual demos.',
        fullDesc: 'Technical yet accessible breakdowns of FPV drone builds, tuning, and flight footage—essential resource for FPV learning, diagnostics, and gear selection. Clear explanations for both beginners and advanced pilots.',
        url: 'https://www.youtube.com/@JoshuaBardwell',
        paid: false,
        labPick: true,
        featuredVideo: 'ZfM8CWBIJ9M',
        features: ['FPV Tutorials', 'Gear Reviews', 'Build Guides', 'Flight Techniques']
    },
    {
        name: 'DJI',
        category: 'drone',
        droneType: 'stores',
        droneSubType: 'stores',
        desc: 'Industry-leading camera drones for aerial photography and cinematography.',
        fullDesc: 'DJI offers the most comprehensive lineup of camera drones, from compact mini drones to professional multi-lens flagship models. Their products enable creators to capture aerial moments with reliability, advanced stabilization, and professional-grade imaging—trusted by filmmakers worldwide.',
        url: 'https://www.dji.com/camera-drones',
        paid: true,
        features: ['Camera Drones', 'Professional Imaging', 'Stabilization', 'Aerial Cinema']
    },
    {
        name: 'BetaFPV',
        category: 'drone',
        droneType: 'stores',
        droneSubType: 'stores',
        desc: 'Trailblazer in micro FPV drones and components.',
        fullDesc: 'BetaFPV specializes in micro FPV drones and comprehensive component offerings including ready-to-fly kits, brushless quadcopters, flight controllers, cameras, motors, and accessories. Perfect for both beginner pilots and experienced racers looking for compact, agile systems.',
        url: 'https://betafpv.com',
        youtubeUrl: 'https://www.youtube.com/c/BETAFPVHobby',
        paid: true,
        features: ['Micro FPV', 'Ready-to-Fly Kits', 'Components', 'Racing Drones']
    },
    {
        name: 'FAA Drone Certification',
        category: 'drone',
        droneType: 'part107',
        droneSubType: 'part107',
        desc: 'Official guide to becoming a certified commercial drone pilot (Part 107).',
        fullDesc: 'The FAA\'s comprehensive resource for obtaining your Remote Pilot Certificate under Part 107. Covers eligibility requirements, application process through IACRA, knowledge testing, and ongoing recertification—essential for anyone operating drones commercially in the United States.',
        url: 'https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot',
        paid: false,
        additionalLinks: [
            {
                label: 'IACRA Registration',
                url: 'https://iacra.faa.gov/IACRA/default.aspx',
                type: 'website',
                description: 'Integrated Airman Certification and Rating Application system for submitting your Part 107 application.'
            }
        ],
        features: ['Part 107 Certification', 'Commercial License', 'FAA Official', 'US Required']
    },
    {
        name: 'King Schools Part 107 Prep',
        category: 'drone',
        droneType: 'part107',
        droneSubType: 'part107',
        desc: 'Self-paced course to pass the FAA Part 107 Remote Pilot knowledge test.',
        fullDesc: 'King Schools offers a dedicated Part 107 online course with video lessons, practice tests, and scenario-based training to prepare pilots for the FAA Remote Pilot knowledge exam. Designed for clarity and test confidence with mobile-friendly access.',
        url: 'https://kingschools.com/drone-pilot-license-test-prep-course',
        additionalLinks: [
            {
                label: 'King Schools iLearn',
                url: 'https://ilearn.kingschools.com',
                type: 'website',
                description: 'Direct access to the King Schools learning portal for course materials.'
            }
        ],
        paid: true,
        features: ['Part 107 Training', 'Practice Tests', 'Video Lessons', 'Self-Paced']
    },
    {
        name: 'Mike Sytes (Part 107)',
        category: 'drone',
        droneType: 'part107',
        droneSubType: 'part107',
        desc: 'Practical Part 107 study walkthroughs with clear test-taking tips.',
        fullDesc: 'Mike Sytes provides approachable guidance for passing the Part 107 exam, including regulation breakdowns, aeronautical charts, and practice question reviews. Useful for quick refreshers and applied study sessions.',
        url: 'https://www.youtube.com/@mikesytes',
        featuredVideo: 'hRPQlwg-xvc',
        additionalLinks: [
            {
                label: 'Example Video',
                url: 'https://www.youtube.com/watch?v=hRPQlwg-xvc&t=45s',
                type: 'video',
                description: 'Sample Part 107 walkthrough with practical tips.'
            }
        ],
        paid: false,
        features: ['Part 107 Study', 'Regulation Guides', 'Practice Reviews', 'YouTube Channel']
    },
    {
        name: 'Mr. Migs Classroom (Part 107)',
        category: 'drone',
        droneType: 'part107',
        droneSubType: 'part107',
        desc: 'Classroom-style lessons covering Part 107 knowledge areas.',
        fullDesc: 'Mr. Migs Classroom delivers organized Part 107 instruction with playlists on airspace, weather, sectional charts, and operating rules—great for structured study and teaching contexts.',
        url: 'https://www.youtube.com/@MrMigsClassroom',
        featuredVideo: 'T1ECN0y0Myk',
        additionalLinks: [
            {
                label: 'Example Lesson',
                url: 'https://www.youtube.com/watch?v=T1ECN0y0Myk&list=PLGspbs93n4nP5g4SFPOJswZ21Qv3ynl1K',
                type: 'video',
                description: 'Sample classroom session covering key Part 107 concepts.'
            }
        ],
        paid: false,
        features: ['Part 107 Lessons', 'Structured Playlists', 'Regulation Coverage', 'YouTube Channel']
    },
    {
        name: 'CAPTAIN DRONE',
        category: 'drone',
        droneType: 'channels',
        droneSubType: 'channels',
        desc: 'FPV tutorials, reviews, and flight content.',
        fullDesc: 'YouTube channel focused on FPV drone flying, gear reviews, tutorials, and flight footage. Practical insights for pilots at all levels with an emphasis on real-world flying and equipment recommendations.',
        url: 'https://www.youtube.com/@CAPTAINDRONE798',
        paid: false,
        featuredVideo: 'o5vUDbHHBlE',
        features: ['FPV Content', 'Tutorials', 'Gear Reviews', 'Flight Footage']
    },
    {
        name: 'GetFPV',
        category: 'drone',
        droneType: 'stores',
        droneSubType: 'stores',
        desc: 'Leading FPV drone retailer with extensive components and learning resources.',
        fullDesc: 'GetFPV is a comprehensive FPV drone store offering everything from complete systems to individual components, batteries, and accessories. Their YouTube channel provides tutorials, product reviews, and build guides—solid resource for gear selection and technical knowledge.',
        url: 'https://www.getfpv.com',
        youtubeUrl: 'https://www.youtube.com/@GetFPV',
        paid: true,
        features: ['FPV Store', 'Components', 'Build Guides', 'Product Reviews']
    },
    {
        name: 'RaceDayQuads',
        category: 'drone',
        droneType: 'stores',
        droneSubType: 'stores',
        desc: 'FPV racing equipment and components from top brands.',
        fullDesc: 'RaceDayQuads specializes in FPV drone racing equipment with a comprehensive selection of pre-built drones, flight controllers, motors, propellers, batteries, frames, and accessories from leading industry brands. Go-to shop for competitive racing builds.',
        url: 'https://www.racedayquads.com',
        paid: true,
        features: ['FPV Racing', 'Components', 'Pre-Built Drones', 'Top Brands']
    },
    {
        name: 'Pyrodrone',
        category: 'drone',
        droneType: 'stores',
        droneSubType: 'stores',
        desc: 'Top-rated FPV drones and extensive component selection.',
        fullDesc: 'Pyrodrone offers prebuilt FPV drones across micro, digital, analog, and cinewhoop categories, plus extensive individual components including motors, propellers, batteries, frames, and electronics. Well-curated selection for FPV enthusiasts of all skill levels.',
        url: 'https://pyrodrone.com',
        paid: true,
        features: ['FPV Drones', 'Cinewhoop', 'Components', 'All Skill Levels']
    },
    {
        name: 'Mr Steele',
        category: 'drone',
        droneType: 'channels',
        droneSubType: 'channels',
        desc: 'Legendary FPV pilot known for cinematic freestyle and creativity.',
        fullDesc: 'Mr Steele is one of the most influential FPV pilots in the community, known for his smooth cinematic freestyle flying and creative approach to drone content. His videos showcase what\'s possible with FPV—useful inspiration for visual movement and dynamic aerial storytelling.',
        url: 'https://www.youtube.com/@MrSteeleFPV',
        instagramUrl: 'https://www.instagram.com/mrsteelefpv/',
        facebookUrl: 'https://www.facebook.com/MrSteeleFPV',
        paid: false,
        featuredVideo: 'MGNV7divwa8',
        features: ['Cinematic FPV', 'Freestyle', 'Creative Flying', 'Influential Pilot']
    },
    {
        name: 'BOTGRINDER',
        category: 'drone',
        droneType: 'channels',
        droneSubType: 'channels',
        desc: 'High-energy FPV freestyle and creative drone cinematography.',
        fullDesc: 'BOTGRINDER delivers aggressive, technical FPV freestyle with creative cinematography and unique locations. Known for pushing the limits of FPV movement and visual storytelling—great reference for dynamic aerial work and bold flying.',
        url: 'https://www.youtube.com/@BOTGRINDER',
        paid: false,
        featuredVideo: 'zA6y9TXxoZg',
        features: ['FPV Freestyle', 'Creative Cinematography', 'Technical Flying', 'Bold Movement']
    },
    {
        name: 'BobtatsiC',
        category: 'drone',
        droneType: 'channels',
        droneSubType: 'channels',
        desc: 'FPV drone flights and channel updates from BobtatsiC.',
        fullDesc: 'BobtatsiC shares FPV flight footage and channel updates with a focus on hands-on piloting. Useful reference for real-world freestyle runs and progress tracking.',
        url: 'https://www.youtube.com/@BobtastiCFPV',
        instagramUrl: 'https://www.instagram.com/bob.tastic/',
        paid: false,
        featuredVideo: 'k1uJmmoMX1I',
        additionalLinks: [
            {
                label: 'Example Video',
                url: 'https://www.youtube.com/watch?v=k1uJmmoMX1I',
                type: 'video',
                description: 'Sample FPV flight shared on the channel.'
            }
        ],
        features: ['FPV Freestyle', 'YouTube Channel', 'Flight Footage', 'Hands-On Flying']
    },
    {
        name: 'Betaflight',
        category: 'drone',
        droneType: 'software',
        desc: 'Open-source flight controller firmware for FPV drones.',
        fullDesc: 'Betaflight is the industry-standard open-source flight controller firmware for FPV racing and freestyle drones. Offers precise tuning, configurator software, and active development—essential for custom builds and performance optimization.',
        url: 'https://www.betaflight.com',
        paid: false,
        features: ['Flight Controller', 'Open Source', 'FPV Standard', 'Performance Tuning']
    },
    {
        name: 'DJI Assistant 2',
        category: 'drone',
        droneType: 'software',
        desc: 'Official DJI software for firmware updates and diagnostics.',
        fullDesc: 'DJI Assistant 2 is the official desktop application for updating DJI consumer drone firmware, calibrating sensors, and accessing advanced diagnostic tools. Required for maintaining DJI drones and ensuring optimal performance.',
        url: 'https://www.dji.com/downloads/softwares/dji-assistant-2-consumer-drones-series',
        paid: false,
        features: ['Firmware Updates', 'Diagnostics', 'Sensor Calibration', 'Official DJI Tool']
    },
    {
        name: 'Liftoff',
        category: 'drone',
        droneType: 'software',
        desc: 'FPV drone racing simulator for skill development.',
        fullDesc: 'Liftoff is a realistic FPV drone racing simulator that lets pilots practice flying and racing without risking real equipment. Features accurate physics, customizable drones, multiple tracks, and multiplayer racing—perfect for beginners learning controls and experienced pilots refining technique.',
        url: 'https://www.liftoff-game.com',
        paid: true,
        pricing: [
            { plan: 'Standard', price: '$19.99' }
        ],
        features: ['FPV Simulator', 'Realistic Physics', 'Multiplayer Racing', 'Practice Tool']
    },

    {
        name: 'Crypt TV',
        category: 'references',
        refType: 'references',
        desc: 'Short horror films and monster-driven genre content.',
        fullDesc: 'Crypt TV produces short horror films and episodic monster content with recurring creatures and interconnected lore. Their work focuses on practical creature effects, atmospheric horror, and building tension in short formats—useful reference for genre filmmaking and franchise-building storytelling.',
        url: 'https://www.youtube.com/@Crypttv/videos',
        paid: false,
        featuredVideo: 'GISm-KB4voo',
        features: ['Horror Shorts', 'Monster Content', 'Practical Effects', 'Franchise Lore']
    },
    {
        name: 'PandaHouse',
        category: 'references',
        refType: 'music',
        desc: 'Detroit-based music project blending indie, alternative, and expressive songwriting.',
        fullDesc: 'Mood-driven songwriting with an atmospheric edge—useful inspiration for music-led visual tone and emotional pacing. Features Anthony Brass (collaborator) on drums alongside emotive indie arrangements.',
        url: 'https://www.pandahousedetroit.com',
        youtubeUrl: 'https://www.youtube.com/channel/UCIPj80TPOAufdvsm666GQng',
        spotifyUrl: 'https://open.spotify.com/artist/0HuGjGGYSPTGINTZpc6ziy',
        paid: false,
        featuredVideo: '5gKjeyHaH6o',
        hideKeyInfo: true,
        features: ['Indie Music', 'Detroit Artist', 'Mood-Driven Sound', 'Atmospheric Tone']
    },
    {
        name: 'TenHundred',
        category: 'references',
        refType: 'art',
        desc: 'Multidisciplinary artist working across painting, murals, illustration, and YouTube.',
        fullDesc: 'TenHundred is a creative based in Southwest Michigan whose work spans painting, murals, illustration, and design. Their YouTube channel documents the creative process, offering insights into making work with momentum and intention—useful inspiration for project-driven creativity.',
        url: 'https://tenhundredart.com',
        youtubeUrl: 'https://www.youtube.com/@TenHundred',
        instagramUrl: 'https://www.instagram.com/tenhun/',
        paid: false,
        featuredVideo: 'QOXvuMR0_nA',
        features: ['Painting', 'Murals', 'Illustration', 'Creative Process', 'Visual Art']
    },
    {
        name: 'Omeleto',
        category: 'references',
        refType: 'references',
        desc: 'Award-winning short films across all genres—drama, comedy, sci-fi, thriller.',
        fullDesc: 'Omeleto curates and showcases the best short films from festivals and independent filmmakers worldwide. Their catalog spans every genre with consistently high production values and compelling storytelling—essential reference for studying narrative structure, pacing, and cinematic craft in 5-20 minute formats.',
        url: 'https://www.youtube.com/@Omeleto',
        instagramUrl: 'https://www.instagram.com/watchomeleto/',
        paid: false,
        featuredVideo: '6Lchj0FkVtE',
        features: ['Award-Winning Shorts', 'Multi-Genre', 'Festival Quality', 'Global Filmmakers']
    },
    {
        name: 'Short of the Week',
        category: 'references',
        refType: 'references',
        desc: 'Curated short film platform highlighting the best in independent short cinema.',
        fullDesc: 'Short of the Week is a tastemaker platform that hand-picks exceptional short films across narrative, documentary, animation, and experimental formats. Each film is thoughtfully curated and includes editorial insights—ideal for discovering cutting-edge storytelling and unique visual approaches.',
        url: 'https://www.shortoftheweek.com',
        youtubeUrl: 'https://www.youtube.com/@shortoftheweek',
        instagramUrl: 'https://www.instagram.com/shortoftheweek/',
        paid: false,
        featuredVideo: 'kNbhYqG4Q-c',
        features: ['Curated Selection', 'Editorial Insights', 'Diverse Formats', 'Industry Standard']
    },
    {
        name: 'Film Shortage',
        category: 'references',
        refType: 'references',
        desc: 'International short films with a focus on narrative and experimental cinema.',
        fullDesc: 'Film Shortage showcases boundary-pushing short films from around the world, often highlighting experimental techniques and bold narrative choices. Their selection leans artistic and unconventional—great for studying non-traditional storytelling and visual risk-taking.',
        url: 'https://www.youtube.com/@FilmShortage',
        paid: false,
        featuredVideo: 'rka6ClUGxDo',
        features: ['International Selection', 'Experimental Cinema', 'Artistic Vision', 'Bold Storytelling']
    },

    // ============================================
    // MUSIC & LICENSING
    // ============================================
    {
        name: 'Epidemic Sound',
        category: 'music',
        desc: 'Royalty-free music and SFX for content creators.',
        fullDesc: 'Over 40,000 tracks across all genres. Covers YouTube, podcasts, social media, and commercial use. Simple licensing protects from copyright claims. Includes stem files for mixing flexibility.',
        url: 'https://www.epidemicsound.com',
        paid: true,
        pricing: [
            { plan: 'Personal', price: '$15/mo' },
            { plan: 'Commercial', price: '$49/mo' }
        ],
        features: ['40,000+ Tracks', 'YouTube Safe', 'Unlimited Downloads', 'Stem Files']
    },
    {
        name: 'Artlist',
        category: 'music',
        desc: 'Premium music licensing with perpetual licenses.',
        fullDesc: 'Perpetual licenses mean rights remain even after subscription ends. High-quality curated catalog. Also offers Artlist SFX and stock footage through Artgrid.',
        url: 'https://artlist.io',
        paid: true,
        pricing: [
            { plan: 'Music & SFX', price: '$14.99/mo' },
            { plan: 'Max', price: '$25/mo' },
            { plan: 'Yearly', price: '$299/yr' }
        ],
        features: ['Perpetual Licenses', 'Commercial Use', 'Curated Catalog', 'Stem Tracks']
    },
    {
        name: 'Musicbed',
        category: 'music',
        desc: 'Boutique licensing for premium productions.',
        fullDesc: 'Musicbed focuses on quality over quantity with a carefully curated catalog of premium tracks. Per-song licensing model ideal for specific high-end projects requiring unique sound.',
        url: 'https://www.musicbed.com',
        paid: true,
        pricing: [
            { plan: 'Personal', price: '$9.99/song' },
            { plan: 'Commercial', price: '$49+/song' },
            { plan: 'Subscription', price: '$9.99/mo' }
        ],
        features: ['Curated Premium', 'Per-Song Option', 'High-End Catalog', 'Boutique Feel']
    },
    {
        name: 'Audiio',
        category: 'music',
        desc: 'Flexible licensing with lifetime deal options.',
        fullDesc: 'Great for indie creators wanting to own their library. Quality tracks across genres. Frequently offers lifetime access promotions at competitive prices.',
        url: 'https://audiio.com',
        paid: true,
        labPick: true,
        pricing: [
            { plan: 'Monthly', price: '$19/mo' },
            { plan: 'Yearly', price: '$149/yr' },
            { plan: 'Lifetime', price: '$199 (promo)' }
        ],
        features: ['Lifetime Deals', 'Unlimited Downloads', 'Commercial License', 'Weekly Updates']
    },
    {
        name: 'Free Music Archive',
        category: 'music',
        desc: 'Community-driven free audio downloads.',
        fullDesc: 'Curated by WFMU radio. Creative Commons and public domain music across genres. Perfect for indie projects with tight budgets. Always verify specific licenses.',
        url: 'https://freemusicarchive.org',
        paid: false,
        features: ['Creative Commons', 'Multiple Genres', 'Community Curated', 'Check Licenses']
    },
    {
        name: 'Soundstripe',
        category: 'music',
        desc: 'Subscription music and SFX with pre-cleared licenses for creators.',
        fullDesc: 'Soundstripe offers a deep library of music and sound effects cleared for YouTube, client work, and broadcast. Straightforward licensing covers multiple platforms with unlimited downloads while subscribed.',
        url: 'https://app.soundstripe.com/',
        paid: true,
        pricing: [
            { plan: 'Creator', price: '$12.50/mo (annual)' },
            { plan: 'Pro', price: '$19/mo (annual)' }
        ],
        features: ['Unlimited Downloads', 'YouTube Safe', 'Music & SFX', 'Simple Licensing']
    },
    {
        name: 'Bensound',
        category: 'music',
        desc: 'Royalty-free tracks with both free and paid licenses.',
        fullDesc: 'Bensound delivers genre-spanning tracks with free options that require attribution and paid licenses for commercial use without credit. Useful for quick temp music or budget-friendly client projects.',
        url: 'https://www.bensound.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (with credit)' },
            { plan: 'Standard', price: '$34/license' },
            { plan: 'Subscription', price: '$139/yr' }
        ],
        features: ['Attribution-Free Paid Licenses', 'Genre Variety', 'Quick Downloads', 'Budget Friendly']
    },
    {
        name: 'ENDE.app',
        category: 'music',
        desc: 'Free cinematic music catalog with clear usage notes.',
        fullDesc: 'ENDE.app curates cinematic and ambient tracks released for free creator use. Each track lists allowed usage and attribution guidance—ideal for mood pieces, trailers, and social edits.',
        url: 'https://ende.app',
        paid: false,
        features: ['Cinematic Focus', 'Clear Usage Notes', 'Ambient & Trailer Ready', 'Attribution Guidance']
    },
    {
        name: 'Incompetech',
        category: 'music',
        desc: 'Kevin MacLeod’s royalty-free catalog with Creative Commons licensing.',
        fullDesc: 'Long-running library of instantly recognizable cues plus deep cuts across genres. Most tracks are free with attribution; paid licenses remove the credit requirement for commercial work.',
        url: 'https://incompetech.com/music/royalty-free/music.html',
        paid: false,
        features: ['Creative Commons', 'Attribution Optional (paid)', 'Genre Variety', 'Production Ready']
    },
    {
        name: 'ProductionCrate Music',
        category: 'music',
        desc: 'Free and premium music library tied to ProductionCrate assets.',
        fullDesc: 'ProductionCrate’s music section supplies royalty-free tracks alongside their SFX and VFX assets. Free users get daily downloads; a Pro plan unlocks the full catalog for higher-volume needs.',
        url: 'https://www.productioncrate.com/sfx/music',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0 (daily limits)' },
            { plan: 'Pro', price: '$49/yr' }
        ],
        features: ['Pairs with VFX Assets', 'Free Tier', 'Royalty-Free', 'Daily Download Limits']
    },
    {
        name: 'NCS (NoCopyrightSounds)',
        category: 'music',
        desc: 'Copyright-free electronic music for creators and streamers.',
        fullDesc: 'NCS releases EDM, trap, and pop tracks cleared for YouTube and Twitch with attribution. Great for gaming edits, hype reels, and streams needing energetic, claim-free music.',
        url: 'https://ncs.io',
        paid: false,
        features: ['Creator-Friendly', 'EDM Focus', 'YouTube Safe', 'Attribution Required']
    },
    {
        name: 'StreamBeats',
        category: 'music',
        desc: 'Royalty-free music packs designed for streaming and content.',
        fullDesc: 'StreamBeats offers genre playlists (lofi, EDM, rock) engineered to avoid DMCA strikes. Download MP3s or stream via major platforms for background beds, live streams, and vlogs.',
        url: 'https://streambeats.com/',
        paid: false,
        features: ['DMCA Safe', 'Multiple Genres', 'Download or Stream', 'No Cost']
    },
    {
        name: 'Purple Planet Music',
        category: 'music',
        desc: 'Royalty-free duo providing cinematic and atmospheric tracks.',
        fullDesc: 'Purple Planet offers free tracks with attribution plus affordable licenses for projects needing credit-free use. Strong selection of cinematic underscores, ambient beds, and light corporate cues.',
        url: 'https://www.purple-planet.com/home',
        paid: false,
        features: ['Attribution-Friendly', 'Cinematic Beds', 'Affordable Licenses', 'Atmospheric Tracks']
    },
    {
        name: 'IMUNO Library',
        category: 'music',
        desc: 'SourceAudio-hosted library of free-to-use tracks for creators.',
        fullDesc: 'IMUNO provides a curated SourceAudio library intended for creators and nonprofits, with straightforward terms and searchable genres for quick soundtrack finds.',
        url: 'https://imuno.sourceaudio.com',
        paid: false,
        features: ['SourceAudio Library', 'Creator-Friendly', 'Genre Filters', 'Free Access']
    },
    {
        name: 'Uppbeat',
        category: 'music',
        desc: 'Creator music with a generous free plan and credit-based downloads.',
        fullDesc: 'Uppbeat supplies modern tracks across genres; the free tier includes monthly credits and automatic YouTube whitelisting to prevent claims. Paid plans increase credits and unlock stems.',
        url: 'https://uppbeat.io',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0 (10 credits/mo)' },
            { plan: 'Premium', price: '$6.99/mo' }
        ],
        features: ['Whitelisted for YouTube', 'Modern Genres', 'Credit System', 'Stems on Paid Plans']
    },
    {
        name: 'NCS SoundCloud Hub',
        category: 'music',
        desc: 'SoundCloud stream of NCS no-copyright catalog.',
        fullDesc: 'Access the NCS catalog directly on SoundCloud for quick streaming and download options. Great for grabbing creator-safe tracks while browsing without leaving the platform.',
        url: 'https://soundcloud.com/royaltyfreemusic-nocopyrightmusic',
        paid: false,
        features: ['SoundCloud Access', 'No-Copyright Music', 'Streaming Friendly', 'Quick Downloads']
    },

    // ============================================
    // SOUND FX & MUSIC LIBRARIES
    // ============================================
    {
        name: 'Freesound',
        category: 'soundfx',
        desc: 'Collaborative database of 600,000+ Creative Commons sounds.',
        fullDesc: 'Worldwide community contributions. Best for unique, specific sounds not found elsewhere. Attribution usually required - check individual licenses.',
        url: 'https://freesound.org',
        paid: false,
        features: ['600,000+ Sounds', 'User Contributions', 'Unique Effects', 'CC Licenses']
    },
    {
        name: 'Zapsplat',
        category: 'soundfx',
        desc: 'Free professional SFX library with 100,000+ sounds.',
        fullDesc: 'High-quality professional SFX for video editors. Attribution required for free plan. Upgrade to Gold to remove attribution and get early access.',
        url: 'https://www.zapsplat.com',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0 (attribution)' },
            { plan: 'Gold', price: '$9/mo' }
        ],
        features: ['100,000+ Sounds', 'Pro Quality', 'Category Browsing', 'Download Packs']
    },
    {
        name: 'Krotos Studio',
        category: 'soundfx',
        desc: 'AI-powered real-time sound effects generation.',
        fullDesc: 'Perfect for foley and creature sounds. Records and analyzes voice to create custom SFX. Game-changer for sound designers on tight deadlines.',
        url: 'https://www.krotosaudio.com',
        paid: true,
        pricing: [
            { plan: 'License', price: '$399' },
            { plan: 'Subscription', price: '$19.99/mo' }
        ],
        features: ['AI Generation', 'Real-time Processing', 'Voice-to-SFX', 'DAW Plugin']
    },
    {
        name: 'Boom Library',
        category: 'soundfx',
        desc: 'Premium sound design libraries for film and games.',
        fullDesc: 'Professional-grade sound design libraries used in AAA games and films. Categories include cinematic, construction kits, and specialized collections.',
        url: 'https://www.boomlibrary.com',
        paid: true,
        pricing: [
            { plan: 'Libraries', price: '$49-299' }
        ],
        features: ['Cinema Quality', 'Game Audio', 'Construction Kits', 'Professional']
    },
    {
        name: 'Soundstripe',
        category: ['music', 'soundfx'],
        desc: 'Music and sound effects subscription with YouTube-safe licensing.',
        fullDesc: 'Soundstripe offers a deep library of music and sound effects cleared for YouTube, client work, and broadcast. Straightforward licensing covers multiple platforms with unlimited downloads while subscribed—ideal for creators needing consistent access to both music and SFX.',
        url: 'https://app.soundstripe.com/',
        paid: true,
        pricing: [
            { plan: 'Music + SFX', price: '$19.99/mo' }
        ],
        features: ['YouTube Safe', 'Unlimited Downloads', 'Music Library', 'SFX Library', 'Client Projects']
    },

    // ============================================
    // AI TOOLS
    // ============================================
    {
        name: 'Runway ML',
        category: 'ai',
        aiType: 'video',
        desc: 'AI-powered video editing and generation platform.',
        fullDesc: 'Industry-leading AI tools. Green screen removal, object removal, frame interpolation, and AI video generation. Magic Tools for rotoscoping. Used by major studios.',
        url: 'https://runwayml.com',
        paid: true,
        pricing: [
            { plan: 'Basic', price: 'Free (limited)' },
            { plan: 'Standard', price: '$15/mo' },
            { plan: 'Pro', price: '$35/mo' }
        ],
        features: ['AI Video Generation', 'Background Removal', 'Object Removal', 'Frame Interpolation']
    },
    {
        name: 'Descript',
        category: 'ai',
        aiType: 'video',
        desc: 'Edit video by editing text transcript.',
        fullDesc: 'Perfect for interviews, podcasts, talking-heads. Auto transcription, filler word removal, AI voices. Studio Sound removes background noise. Workflow game changer.',
        url: 'https://www.descript.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (1hr/mo)' },
            { plan: 'Creator', price: '$24/mo' },
            { plan: 'Pro', price: '$40/mo' }
        ],
        features: ['Edit Video as Text', 'Auto Transcription', 'Studio Sound', 'Filler Word Removal']
    },
    {
        name: 'MiniMax',
        category: 'ai',
        aiType: 'video',
        desc: 'Chinese AI platform with video generation, audio synthesis, and 4M token context models.',
        fullDesc: 'MiniMax offers multimodal AI capabilities including Hailuo Video Agent for video creation, lifelike audio synthesis, and the open-source MiniMax-01 models with 456B parameters and 4M token context (20-32x longer than competitors). API access available for developers with competitive token-based pricing.',
        url: 'https://www.minimax.io',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (3 credits)' },
            { plan: 'Starter', price: '$9.90' },
            { plan: 'Pro', price: '$49' },
            { plan: 'Premium', price: '$99' }
        ],
        features: ['Video Generation', 'Audio Synthesis', '4M Token Context', 'Open Source Models', 'API Access']
    },
    {
        name: 'Adobe Firefly',
        category: 'ai',
        aiType: 'image',
        desc: 'Adobe\'s AI image and text effects generator.',
        fullDesc: 'Create custom graphics from text prompts. Trained on licensed Adobe Stock - commercially safe. Integrates with Photoshop, Illustrator, and Express.',
        url: 'https://firefly.adobe.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (25 credits/mo)' },
            { plan: 'Premium', price: '$4.99/mo' },
            { plan: 'Creative Cloud', price: 'Included' }
        ],
        features: ['AI Image Generation', 'Commercially Safe', 'Adobe Integration', 'Text Effects']
    },
    {
        name: 'Suno',
        category: 'ai',
        aiType: 'music',
        desc: 'AI music generation for songs, stems, and quick demos.',
        fullDesc: 'Suno turns text prompts into fully arranged songs with vocals, alternate takes, and exportable stems. Handy for fast pitch tracks, mood sketches, and temp music without clearing hurdles.',
        url: 'https://suno.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (limited credits)' },
            { plan: 'Pro', price: '$10/mo' },
            { plan: 'Premier', price: '$30/mo' }
        ],
        features: ['AI Music', 'Stems Export', 'Vocal Generation', 'Rapid Ideation']
    },
    {
        name: 'Claude.ai',
        category: 'ai',
        aiType: 'chat',
        desc: 'AI assistant tuned for coding help, writing, and research.',
        fullDesc: 'Claude handles code review, generation, and doc summaries with strong long-context support. Useful for scripting, technical outlines, and brainstorming workflows without leaving the browser.',
        url: 'https://claude.ai',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (daily messages)' },
            { plan: 'Pro', price: '$20/mo' }
        ],
        features: ['Long Context', 'Coding Help', 'Writing Support', 'Browser-Based']
    },
    {
        name: 'Grok',
        category: 'ai',
        aiType: 'chat',
        desc: 'xAI\'s chatbot with real-time X platform access and free limited usage.',
        fullDesc: 'Grok is xAI\'s AI chatbot featuring real-time access to X (Twitter) for current events and trending topics. Available in 29 languages with Fast and Expert modes. Free tier offers limited access (~10 requests every 2 hours), while paid plans unlock Grok 4 and higher usage limits. API access available for developers.',
        url: 'https://grok.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (limited, via X)' },
            { plan: 'SuperGrok', price: '$30/mo' },
            { plan: 'X Premium+', price: '$40/mo' }
        ],
        features: ['Real-Time X Access', 'Current Events', 'Image Generation', 'Voice Function', 'API Available']
    },
    {
        name: 'Chat.com',
        category: 'ai',
        aiType: 'chat',
        desc: 'Simple web AI chat for quick prompts and ideation.',
        fullDesc: 'Chat.com offers a straightforward AI assistant experience—drop in a prompt to brainstorm ideas, rephrase copy, or outline project steps without extra setup or logins.',
        url: 'https://chat.com',
        paid: false,
        features: ['Fast Access', 'No Friction', 'Brainstorming', 'Copy Support']
    },
    {
        name: 'Z.ai',
        category: 'ai',
        aiType: 'chat',
        desc: 'AI chat platform powered by top-tier models including GLM-4.7 and GPT-5.2.',
        fullDesc: 'Z.ai provides a clean AI chat interface powered by multiple leading AI models including GLM-4.7 and GPT-5.2. Supports brainstorming, coding help, writing assistance, and quick problem-solving with developer-friendly pricing and MCP tools integration.',
        url: 'https://chat.z.ai',
        paid: true,
        pricing: [
            { plan: 'Lite', price: '$3/mo' },
            { plan: 'Pro', price: '$15/mo' },
            { plan: 'Max', price: '$30/mo' }
        ],
        features: ['Multiple AI Models', 'GLM-4.7 & GPT-5.2', 'MCP Tools', 'Developer Pricing']
    },
    {
        name: 'OpenRouter',
        category: 'ai',
        aiType: 'chat',
        desc: 'Unified API for 500+ AI models across 60+ providers with pay-as-you-go pricing.',
        fullDesc: 'OpenRouter aggregates access to 500+ AI models from providers like OpenAI, Anthropic, Google, and Meta through a single OpenAI-compatible API. Features automatic fallback for reliability, flexible credit-based pricing with no subscriptions, and customizable data policies. Ideal for developers who want to test and switch between models without architectural changes.',
        url: 'https://openrouter.ai',
        paid: true,
        pricing: [
            { plan: 'Pay-as-you-go', price: 'Credit-based (varies by model)' }
        ],
        features: ['500+ Models', 'Unified API', 'Auto Fallback', 'No Subscriptions', 'OpenAI Compatible']
    },
    {
        name: 'Google AI Studio',
        category: 'ai',
        aiType: 'chat',
        desc: 'Playground for Gemini models with API keys and quick testing.',
        fullDesc: 'AI Studio makes it easy to prototype with Gemini models—test prompts, generate code snippets, and grab API keys for integrating generative AI into apps or production pipelines.',
        url: 'https://aistudio.google.com',
        paid: false,
        features: ['Gemini Playground', 'API Keys', 'Prompt Testing', 'Code Snippets']
    },
    {
        name: 'ElevenLabs',
        category: 'ai',
        aiType: 'voice',
        desc: 'AI voice synthesis and cloning platform for narration, characters, and localization.',
        fullDesc: 'ElevenLabs offers natural-sounding AI voices for narration, character work, and multilingual localization. Supports voice cloning and API workflows, with controls for tone and delivery that help match performance to picture.',
        url: 'https://elevenlabs.io',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (10k chars/mo)' },
            { plan: 'Starter', price: '$5/mo' },
            { plan: 'Creator', price: '$22/mo' }
        ],
        features: ['Voice Synthesis', 'Voice Cloning', 'Natural Sound', 'API Access']
    },
    {
        name: 'Midjourney',
        category: 'ai',
        aiType: 'image',
        desc: 'AI image generation for concept art and storyboards.',
        fullDesc: 'Leading AI image generator for creative ideation. Useful for mood boards, concept art, and pre-visualization. Discord-based workflow with growing web interface.',
        url: 'https://www.midjourney.com',
        paid: true,
        pricing: [
            { plan: 'Basic', price: '$10/mo' },
            { plan: 'Standard', price: '$30/mo' },
            { plan: 'Pro', price: '$60/mo' }
        ],
        features: ['Concept Art', 'Mood Boards', 'Storyboarding', 'Discord Workflow']
    },
    {
        name: 'Opal (Google)',
        category: 'ai',
        aiType: 'video',
        desc: 'Google Opal for fast, high-quality video generation and edits.',
        fullDesc: 'Opal pairs Google research models with video-forward controls for turning prompts into polished motion quickly. Useful for look previews, motion tests, and stylized transitions.',
        url: 'https://opal.google/landing/',
        paid: false,
        features: ['Video Generation', 'Style Controls', 'Fast Iteration', 'Google Models']
    },
    {
        name: 'Sora by OpenAI',
        category: 'ai',
        aiType: 'video',
        desc: 'Text-to-video generation focused on cinematic, photoreal results.',
        fullDesc: 'Sora converts prompts into detailed video sequences with realistic motion, camera moves, and environments—great for previz, concept tests, and mood films when paired with clear prompt references.',
        url: 'https://sora.chatgpt.com',
        paid: false,
        features: ['Text-to-Video', 'Cinematic Motion', 'Camera Control', 'Previsualization']
    },
    {
        name: 'Gemini',
        category: 'ai',
        aiType: 'chat',
        desc: 'Google’s multimodal assistant for research, outlining, and coding.',
        fullDesc: 'Gemini handles chat, code, and image understanding in one workspace—good for script coverage, outline drafts, research pulls, and quick code snippets with Google account sign-in.',
        url: 'https://gemini.google.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0' },
            { plan: 'Advanced', price: '$19.99/mo' }
        ],
        features: ['Multimodal', 'Research', 'Code Help', 'Outline Drafts']
    },
    {
        name: 'Perplexity',
        category: 'ai',
        aiType: 'chat',
        desc: 'Answer-focused AI with citations and quick reading mode.',
        fullDesc: 'Perplexity blends web search with AI summaries, returning citations by default—handy for fast fact checks, source gathering, and concise briefs before deeper dives.',
        url: 'https://www.perplexity.ai',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0' },
            { plan: 'Pro', price: '$20/mo' }
        ],
        features: ['Cited Answers', 'Web Search', 'Summaries', 'Reading Mode']
    },
    {
        name: 'Krotos Studio (AI)',
        category: 'ai',
        aiType: 'voice',
        desc: 'Voice-driven AI for generating foley and creature sound design.',
        fullDesc: 'Krotos Studio listens to your voice or controller input and translates it into custom sound effects in real time. Ideal for expressive foley passes, creature vocals, and rapid prototyping directly in DAWs.',
        url: 'https://www.krotosaudio.com',
        paid: true,
        pricing: [
            { plan: 'License', price: '$399' },
            { plan: 'Subscription', price: '$19.99/mo' }
        ],
        features: ['Voice-to-SFX', 'Real-Time Processing', 'DAW Integration', 'Creature & Foley']
    },

    // ============================================
    // STOCK FOOTAGE
    // ============================================
    {
        name: 'Pexels',
        category: 'stock',
        desc: 'Completely free stock videos and photos.',
        fullDesc: 'No attribution required. Curated high-quality content. Great for B-roll, backgrounds, and establishing shots. 4K footage available with filters.',
        url: 'https://www.pexels.com',
        paid: false,
        features: ['No Attribution', '4K Available', 'Curated Content', 'Commercial Safe']
    },
    {
        name: 'Artgrid',
        category: 'stock',
        desc: 'Premium 4K/5K stock footage by professional cinematographers.',
        fullDesc: 'Cinematic quality shot by pros. Perpetual licenses like Artlist music. Smaller library but exceptional quality. Best for high-end productions.',
        url: 'https://artgrid.io',
        paid: true,
        pricing: [
            { plan: 'Creator', price: '$29/mo' },
            { plan: 'Yearly', price: '$348/yr' }
        ],
        features: ['4K/5K Footage', 'Perpetual Licenses', 'Cinematic Quality', 'Pro Cinematographers']
    },
    {
        name: 'Pixabay',
        category: 'stock',
        desc: 'Free stock videos, photos, music, and sound effects.',
        fullDesc: 'Over 4.5 million media files. No attribution required. Generous Creative Commons-inspired license. Great all-in-one resource for indie creators.',
        url: 'https://pixabay.com',
        paid: false,
        features: ['4.5M+ Files', 'No Attribution', 'Multi-Media Library', 'Music Included']
    },
    {
        name: 'Storyblocks',
        category: 'stock',
        desc: 'Unlimited downloads of stock video, audio, and images.',
        fullDesc: 'Subscription model with unlimited downloads. Growing library of 4K content, templates, and After Effects projects. Good value for high-volume needs.',
        url: 'https://www.storyblocks.com',
        paid: true,
        pricing: [
            { plan: 'Unlimited', price: '$30/mo' },
            { plan: 'Yearly', price: '$216/yr' }
        ],
        features: ['Unlimited Downloads', '4K Content', 'Templates', 'AE Projects']
    },
    {
        name: 'Freepik',
        category: 'stock',
        desc: 'Massive library of photos, vectors, and mockups for design support.',
        fullDesc: 'Freepik offers millions of royalty-free images, vectors, PSD mockups, and icons. Great for pitch decks, thumbnails, and design elements that pair with video productions.',
        url: 'https://www.freepik.com',
        paid: true,
        pricing: [
            { plan: 'Free', price: '$0 (attribution required)' },
            { plan: 'Premium', price: '$14/mo' }
        ],
        features: ['Vectors & PSDs', 'Mockups', 'Photos & Icons', 'Attribution-Free on Premium']
    },

    // ============================================
    // EQUIPMENT & GEAR
    // ============================================
    {
        name: 'LensRentals',
        category: 'equipment',
        desc: 'Industry-standard camera and lens rental service.',
        fullDesc: 'Insurance included. Rigorous testing and maintenance. Expert customer support. Ships nationwide. Great for trying gear before buying or one-off shoots.',
        url: 'https://www.lensrentals.com',
        paid: true,
        pricing: [
            { plan: 'Daily', price: 'Varies by gear' },
            { plan: 'Weekly', price: '3x daily rate' }
        ],
        features: ['Insurance Included', 'Tested Gear', 'Expert Support', 'Nationwide Shipping']
    },
    {
        name: 'ShareGrid',
        category: 'equipment',
        desc: 'Peer-to-peer camera gear rental marketplace.',
        fullDesc: 'Rent from local filmmakers. Often 40-60% cheaper than rental houses. Every rental includes damage protection. Browse by location to find gear nearby.',
        url: 'https://www.sharegrid.com',
        paid: true,
        pricing: [
            { plan: 'Daily', price: 'Set by owner' },
            { plan: 'Insurance', price: 'Included' }
        ],
        features: ['40-60% Cheaper', 'Local Rentals', 'Damage Protection', 'Community-Driven']
    },
    {
        name: 'BorrowLenses',
        category: 'equipment',
        desc: 'Try-before-you-buy camera gear rental.',
        fullDesc: 'Rent high-end cameras, lenses, and lighting to test before purchasing. Great selection of cinema cameras and pro photo gear. Apply rental fees toward purchase.',
        url: 'https://www.borrowlenses.com',
        paid: true,
        pricing: [
            { plan: 'Weekly', price: 'Varies by gear' },
            { plan: 'Try Before Buy', price: 'Credit toward purchase' }
        ],
        features: ['Try Before Buying', 'Cinema Cameras', 'Purchase Credits', 'Pro Lighting']
    },
    {
        name: 'KEH Camera',
        category: 'equipment',
        desc: 'Used camera gear with quality ratings.',
        fullDesc: 'Buy and sell used camera equipment with transparent condition ratings. Great way to acquire professional gear at reduced prices. 180-day warranty on purchases.',
        url: 'https://www.keh.com',
        paid: true,
        features: ['Used Gear', 'Quality Ratings', '180-Day Warranty', 'Buy & Sell']
    },
    {
        name: 'B&H Photo',
        category: 'equipment',
        desc: 'Major retailer for pro video and photo equipment.',
        fullDesc: 'Industry-standard retailer for cameras, lighting, grip, and audio gear. Competitive pricing, knowledgeable staff, and reliable shipping. NYC superstore worth visiting.',
        url: 'https://www.bhphotovideo.com',
        paid: true,
        features: ['Full Selection', 'Competitive Pricing', 'Expert Staff', 'Fast Shipping']
    },

    // ============================================
    // 3D & VFX
    // ============================================
    {
        name: 'Blender',
        category: '3d',
        desc: 'Free, open-source 3D creation suite.',
        fullDesc: 'Industry-competitive 3D modeling, animation, and rendering. Active community with extensive tutorials. Cycles and Eevee renderers. VFX, motion tracking, and compositing included.',
        url: 'https://www.blender.org',
        paid: false,
        features: ['Completely Free', 'Full 3D Suite', 'Active Community', 'VFX Capable']
    },
    {
        name: 'Sketchfab',
        category: '3d',
        desc: 'Platform for 3D model viewing, buying, and selling.',
        fullDesc: 'Browse millions of 3D models. Free and paid options. Useful for reference, purchasing assets, or showcasing work. Web-based viewer embeds anywhere.',
        url: 'https://sketchfab.com',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0' },
            { plan: 'Pro', price: '$15/mo' }
        ],
        features: ['Millions of Models', 'Free Downloads', 'Web Viewer', 'Marketplace']
    },
    {
        name: 'Mixamo',
        category: '3d',
        desc: 'Free character rigging and animation library.',
        fullDesc: 'Adobe-owned service providing automatic character rigging and a library of motion capture animations. Upload your character, download rigged and animated. Free for personal use.',
        url: 'https://www.mixamo.com',
        paid: false,
        features: ['Auto-Rigging', 'Animation Library', 'Adobe-Owned', 'Free Personal Use']
    },
    {
        name: 'Quixel Megascans',
        category: '3d',
        desc: 'Photorealistic 3D scans for environments and materials.',
        fullDesc: 'Epic Games-owned library of high-quality 3D scans. Free for Unreal Engine users, paid for others. Essential for realistic environments and textures.',
        url: 'https://quixel.com/megascans',
        paid: true,
        pricing: [
            { plan: 'Unreal Users', price: 'Free' },
            { plan: 'External', price: '$19/mo' }
        ],
        features: ['Photorealistic Scans', 'Free for UE', 'Environment Assets', 'High Quality']
    },

    // ============================================
    // FONTS & TYPOGRAPHY
    // ============================================
    {
        name: 'Google Fonts',
        category: 'fonts',
        desc: 'Free, open-source font library.',
        fullDesc: 'Extensive library of free fonts optimized for web. Easy embedding, variable fonts support. Covers most common needs for web and video projects.',
        url: 'https://fonts.google.com',
        paid: false,
        features: ['Completely Free', 'Web Optimized', 'Variable Fonts', 'Easy Embedding']
    },
    {
        name: 'Adobe Fonts',
        category: 'fonts',
        desc: 'Premium font library included with Creative Cloud.',
        fullDesc: 'Thousands of premium fonts from leading foundries. Included with any Creative Cloud subscription. Sync across apps, use in web projects.',
        url: 'https://fonts.adobe.com',
        paid: true,
        pricing: [
            { plan: 'Creative Cloud', price: 'Included' }
        ],
        features: ['Premium Foundries', 'CC Included', 'App Sync', 'Web Fonts']
    },
    {
        name: 'Font Squirrel',
        category: 'fonts',
        desc: 'Curated free fonts for commercial use.',
        fullDesc: 'Hand-selected free fonts that are safe for commercial use. Webfont generator included. Quality over quantity approach.',
        url: 'https://www.fontsquirrel.com',
        paid: false,
        features: ['Commercial Safe', 'Curated Selection', 'Webfont Generator', 'Free']
    },
    {
        name: 'DaFont',
        category: 'fonts',
        desc: 'Massive user-uploaded font library with easy browsing.',
        fullDesc: 'DaFont hosts thousands of fonts across novelty, display, and practical categories. Quick previews, zip downloads, and tagging make it easy to find unique type for titles and experimental designs.',
        url: 'https://www.dafont.com/',
        paid: false,
        features: ['Large Library', 'Quick Previews', 'Free Downloads', 'Display Fonts']
    },
    {
        name: 'FontSpace',
        category: 'fonts',
        desc: 'Designer-uploaded fonts with clear licensing filters.',
        fullDesc: 'FontSpace offers community-curated fonts with filters for commercial use, styles, and popularity. Each download includes author licensing notes, helping pick safe fonts for client work and personal projects.',
        url: 'https://www.fontspace.com',
        paid: false,
        features: ['Community Fonts', 'License Filters', 'Free Options', 'Commercial-Ready']
    },
    {
        name: 'Fontshare',
        category: 'fonts',
        desc: 'Free font service by Indian Type Foundry.',
        fullDesc: 'High-quality original typefaces available for free. Fresh designs not found elsewhere. Simple licensing for personal and commercial projects.',
        url: 'https://www.fontshare.com',
        paid: false,
        features: ['Original Designs', 'High Quality', 'Simple License', 'Free Commercial']
    },
    {
        name: 'Future Fonts',
        category: 'fonts',
        desc: 'Support type designers, get fonts in progress.',
        fullDesc: 'Buy fonts while they\'re still being developed. Lower prices, updates included. Support independent type designers. Unique fonts not available elsewhere.',
        url: 'https://www.futurefonts.xyz',
        paid: true,
        features: ['In-Progress Fonts', 'Support Designers', 'Unique Selection', 'Updates Included']
    },

    // ============================================
    // FREELANCE & OTHER
    // ============================================
    {
        name: 'DaVinci Resolve',
        category: 'software',
        desc: 'Professional editing, color, VFX, and audio in one app.',
        fullDesc: 'Free version used on Hollywood films. Includes Fairlight audio and Fusion VFX. Studio version adds collaboration, 3D tools, and advanced features.',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0' },
            { plan: 'Studio', price: '$295 (lifetime)' }
        ],
        features: ['Edit, Color, VFX, Audio', 'Hollywood-Grade', 'Free is Powerful', 'One-Time Purchase']
    },
    {
        name: 'Frame.io',
        category: 'software',
        desc: 'Cloud-based video review and collaboration.',
        fullDesc: 'Essential for client feedback and team collaboration. Time-stamped comments on video. Integrates with Premiere, Final Cut, and Resolve. Streamlines revisions.',
        url: 'https://frame.io',
        paid: true,
        pricing: [
            { plan: 'Pro', price: '$15/mo' },
            { plan: 'Team', price: '$30/user/mo' },
            { plan: 'Enterprise', price: 'Custom' }
        ],
        features: ['Cloud Collaboration', 'Time-Stamped Comments', 'NLE Integration', 'Version Control']
    },
    {
        name: 'Fiverr',
        category: 'software',
        desc: 'Freelance marketplace for creative services.',
        fullDesc: 'Find freelancers for specific tasks: logo animation, subtitles, voice-over, etc. Variable quality - vet carefully. Useful for specialized one-off needs.',
        url: 'https://www.fiverr.com',
        paid: true,
        features: ['Freelance Marketplace', 'Specialized Tasks', 'Variable Quality', 'One-Off Projects']
    },
    {
        name: 'Mandy',
        category: 'software',
        desc: 'Crew and talent hiring platform for production.',
        fullDesc: 'Find crew, actors, and production professionals. Job postings and crew profiles. UK-focused but growing internationally. Good for finding local talent.',
        url: 'https://www.mandy.com',
        paid: true,
        pricing: [
            { plan: 'Job Posting', price: 'From £25' }
        ],
        features: ['Crew Hiring', 'Talent Search', 'Job Board', 'Production Focus']
    },
    {
        name: 'ProductionHub',
        category: 'software',
        desc: 'US-focused production job board and directory.',
        fullDesc: 'Find and post production jobs. Searchable directory of crew and vendors by location. Useful for staffing up local shoots and finding specialists.',
        url: 'https://www.productionhub.com',
        paid: true,
        features: ['US Focus', 'Job Board', 'Crew Directory', 'Vendor Search']
    },
    {
        name: 'Notion',
        category: 'software',
        desc: 'All-in-one workspace for production planning.',
        fullDesc: 'Flexible workspace for call sheets, shot lists, scripts, and production bibles. Database and wiki features. Team collaboration. Free tier is generous.',
        url: 'https://www.notion.so',
        paid: false,
        pricing: [
            { plan: 'Free', price: '$0' },
            { plan: 'Plus', price: '$10/mo' }
        ],
        features: ['Production Planning', 'Call Sheets', 'Team Collaboration', 'Free Tier']
    }
];
