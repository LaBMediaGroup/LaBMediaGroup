// ============================================
// LaB MEDIA RESOURCES DATABASE
// Metro Detroit & Michigan Focused
// ============================================

const resources = [

    // ============================================
    // FILM FESTIVALS
    // ============================================

    {
        id: 'horror-film-roulette',
        name: 'Horror Film Roulette',
        category: 'film-festivals',
        desc: 'Annual horror filmmaking competition with genre roulette draw and 4-week sprint.',
        fullDesc: 'Horror Film Roulette is an annual Michigan horror filmmaking competition where teams draw random subgenres and race to complete short films in a 4-week sprint. Great community energy and a solid showcase at Emagine.',
        url: 'https://www.horrorfilmroulette.com',
        filmFreewayUrl: 'https://filmfreeway.com/HorrorFilmRoulette',
        labPick: true,
        paid: false
    },

    {
        id: 'horror-hotel-film-festival',
        name: 'Horror Hotel Film Festival',
        category: 'film-festivals',
        desc: 'Northeast Ohio festival for horror, sci-fi, and fantasy filmmakers.',
        fullDesc: 'Celebrating its 15th anniversary in 2026, the International Horror Hotel Film Festival and Convention is a 4-day event in Middleburg Heights, Ohio. It features screenings, panel discussions, and unique live competitions like Scream Queen/King and FX makeup contests.',
        url: 'https://horrorhotelfilmfest.com',
        filmFreewayUrl: 'https://filmfreeway.com/HorrorHotel',
        location: 'Middleburg Heights, OH',
        paid: false
    },

    {
        id: 'royal-starr-film-festival',
        name: 'Royal Starr Film Festival',
        category: 'film-festivals',
        desc: 'Metro Detroit film festival with screenings, panels, and community mixers.',
        fullDesc: 'Royal Starr Film Festival hosts multiple days of screenings, filmmaker panels, and community events in the Birmingham area. They also run monthly filmmaker mixers throughout the year.',
        url: 'https://www.royalstarr.org',
        filmFreewayUrl: 'https://filmfreeway.com/RoyalStarrFilmFestival',
        labPick: true,
        paid: false
    },

    {
        id: 'the-comedy-roll',
        name: 'The Comedy Roll',
        category: 'film-festivals',
        desc: 'Comedy filmmaking challenge with timed production sprints and showcase screenings.',
        fullDesc: 'The Comedy Roll is a comedy-focused filmmaking competition where teams create short films under time pressure. Ends with a showcase screening at a local theater.',
        url: 'https://thecomedyroll.com',
        paid: false
    },

    {
        id: 'fresh-coast-film-festival',
        name: 'Fresh Coast Film Festival',
        category: 'film-festivals',
        desc: 'Traverse City festival focused on fresh voices and community screenings.',
        fullDesc: 'Fresh Coast Film Festival brings filmmakers and film lovers together in Traverse City for screenings, panels, and community events.',
        url: 'https://freshcoastfilmtraversecity.ludus.com/',
        paid: false
    },

    // ============================================
    // COMMUNITY
    // ============================================

    {
        id: 'campfire-film-cooperative',
        name: 'Campfire Film Cooperative',
        category: 'community',
        communityType: 'groups',
        desc: 'Detroit film cooperative hosting workshops, screenings, and community events.',
        fullDesc: 'Campfire Film Cooperative is a Detroit-based film community hosting regular workshops, screening series, and filmmaker meetups at The Scarab Club and other venues.',
        url: 'https://campfirefilm.org',
        labPick: true,
        paid: false
    },

    {
        id: 'film-detroit',
        name: 'Film Detroit',
        category: 'community',
        communityType: 'groups',
        desc: 'City of Detroit film office supporting local film production and community events.',
        fullDesc: 'Film Detroit is the official film office for the City of Detroit, supporting local productions and hosting community events like Frames & Fabrics.',
        url: 'https://detroitmi.gov/departments/media-services-department',
        paid: false
    },

    {
        id: 'movies-plus-tv',
        name: 'Movies Plus TV',
        category: 'community',
        communityType: 'groups',
        desc: 'Film and TV community resource for local productions and industry connections.',
        fullDesc: 'Movies Plus TV provides resources and connections for film and television productions in the region.',
        url: 'https://moviesplustv.com',
        paid: false
    },

    {
        id: 'actors-loft',
        name: 'Actors Loft',
        category: 'community',
        communityType: 'training',
        desc: 'Acting studio and training center for film and theater performers.',
        fullDesc: 'Actors Loft offers acting classes, workshops, and training for performers looking to develop their craft for film and theater.',
        url: 'https://actorsloft.com',
        paid: true
    },

    // ============================================
    // REFERENCES / INSPIRATION
    // ============================================

    {
        id: 'every-frame-a-painting',
        name: 'Every Frame a Painting',
        category: ['references', 'inspiration'],
        desc: 'Video essays on film form and technique.',
        fullDesc: 'Classic YouTube video essay series analyzing film techniques, editing, and cinematography. Essential viewing for filmmakers.',
        youtubeUrl: 'https://www.youtube.com/@everyframeapainting',
        url: 'https://www.youtube.com/@everyframeapainting',
        paid: false
    },

    {
        id: 'nerdwriter',
        name: 'Nerdwriter1',
        category: ['references', 'inspiration'],
        desc: 'Video essays on film, art, and culture.',
        fullDesc: 'Nerdwriter1 creates thoughtful video essays analyzing films, art, music, and culture with a focus on craft and meaning.',
        youtubeUrl: 'https://www.youtube.com/@Nerdwriter1',
        url: 'https://www.youtube.com/@Nerdwriter1',
        paid: false
    },

    // ============================================
    // STOCK - MUSIC
    // ============================================

    {
        id: 'artlist',
        name: 'Artlist',
        category: ['stock', 'music'],
        desc: 'Premium royalty-free music and SFX for filmmakers.',
        fullDesc: 'Artlist offers high-quality royalty-free music and sound effects with simple licensing for filmmakers and content creators.',
        url: 'https://artlist.io',
        paid: true,
        labPick: true
    },

    {
        id: 'epidemic-sound',
        name: 'Epidemic Sound',
        category: ['stock', 'music'],
        desc: 'Subscription-based music library for video creators.',
        fullDesc: 'Epidemic Sound provides a massive library of royalty-free music with straightforward licensing for all platforms.',
        url: 'https://www.epidemicsound.com',
        paid: true
    },

    {
        id: 'incompetech',
        name: 'Incompetech',
        category: ['stock', 'music'],
        desc: 'Free royalty-free music by Kevin MacLeod.',
        fullDesc: 'Incompetech offers free royalty-free music by composer Kevin MacLeod. Attribution required but completely free to use.',
        url: 'https://incompetech.com',
        paid: false
    },

    // ============================================
    // TOOLS - SOFTWARE
    // ============================================

    {
        id: 'davinci-resolve',
        name: 'DaVinci Resolve',
        category: ['tools', 'software'],
        desc: 'Professional video editing, color grading, and VFX software.',
        fullDesc: 'DaVinci Resolve is a professional-grade editing, color grading, visual effects, and audio post-production software. Free version is incredibly powerful.',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        paid: false,
        labPick: true
    },

    {
        id: 'adobe-premiere',
        name: 'Adobe Premiere Pro',
        category: ['tools', 'software'],
        desc: 'Industry-standard video editing software.',
        fullDesc: 'Adobe Premiere Pro is an industry-standard video editing application used in professional film and video production.',
        url: 'https://www.adobe.com/products/premiere.html',
        paid: true
    }

];
