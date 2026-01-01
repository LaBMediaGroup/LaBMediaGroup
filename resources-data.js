// LaB Media Resources Data - Comprehensive Edition 2025

const resources = [
    // ========== COLLABORATORS (Featured First) ==========
    {
        id: 'moz-interiors',
        name: 'MOZ Interiors',
        category: 'collaborators',
        shortDesc: 'Award-winning interior design featured in Vanity Fair, Architectural Digest, Hour Detroit',
        fullDesc: 'Michigan-based interior design studio specializing in high-end residential and commercial projects. MOZ Interiors brings sophisticated, timeless design to spaces throughout Metro Detroit and beyond. Their work has been recognized by major publications including Vanity Fair, Architectural Digest, Hour Detroit, and The World of Interiors. We partnered with MOZ to create their designer spotlight video, capturing the refined vision behind their award-winning work.',
        url: 'https://www.mozinteriors.com/',
        paid: false,
        badges: ['collaborator', 'michigan', 'design'],
        pricing: [
            { plan: 'Design Consultations', price: 'Contact for pricing' },
            { plan: 'Full-Service Design', price: 'Project-based' }
        ],
        features: [
            'Featured in Vanity Fair & Architectural Digest',
            'High-end residential & commercial design',
            'Based in Metro Detroit area',
            'Full-service interior design',
            'Award-winning portfolio',
            'LaB Media Collaborator — Designer Spotlight'
        ]
    },
    {
        id: 'anthony-brass',
        name: 'Anthony Brass',
        category: 'collaborators',
        shortDesc: 'Detroit-based contemporary artist creating bold, expressive paintings',
        fullDesc: 'Contemporary Detroit artist known for vibrant, nature-inspired work that captures emotion and energy through bold brushwork and organic color palettes. Anthony\'s studio practice spans painting, drawing, and mixed media, with work featured in local galleries and private collections throughout Michigan. We collaborated with Anthony to create an intimate artist spotlight video, filmed in his home studio capturing the authentic creative process behind his distinctive style.',
        url: 'https://www.anthonybrass.com/',
        paid: false,
        badges: ['collaborator', 'michigan', 'artist'],
        pricing: [
            { plan: 'Original Works', price: 'Contact artist' },
            { plan: 'Commissions', price: 'Project-based' },
            { plan: 'Prints', price: 'Available on site' }
        ],
        features: [
            'Contemporary fine art painter',
            'Based in Detroit, Michigan',
            'Bold, nature-inspired aesthetic',
            'Commissions available',
            'Gallery exhibitions',
            'LaB Media Collaborator — Artist Spotlight'
        ]
    },
    {
        id: 'joe-garofalo',
        name: 'Joe Garofalo Music',
        category: 'collaborators',
        shortDesc: 'Michigan-based composer and musician for film, video, and media projects',
        fullDesc: 'Professional musician and composer based in Michigan, specializing in original music and scores for film, video, and media projects. Joe brings a versatile approach to composition, working across genres from ambient underscore to energetic commercial music. Available for custom compositions, sound design, and music supervision for video productions of all sizes.',
        url: 'https://www.joegarofalomusic.com',
        paid: false,
        badges: ['collaborator', 'michigan', 'music'],
        pricing: [
            { plan: 'Custom Score', price: 'Project-based quote' },
            { plan: 'Music Supervision', price: 'Hourly/project' },
            { plan: 'Sound Design', price: 'Contact for pricing' }
        ],
        features: [
            'Original music composition',
            'Film and media scoring',
            'Based in Michigan',
            'Custom project work',
            'Music supervision services',
            'LaB Media Collaborator'
        ]
    },

    // ========== MUSIC ==========
    {
        id: 'epidemic-sound',
        name: 'Epidemic Sound',
        category: 'music',
        shortDesc: 'Comprehensive royalty-free music and SFX library with 50,000+ tracks',
        fullDesc: 'Industry-leading music and sound effects platform with over 50,000 tracks and 200,000 Hollywood-grade sound effects. Founded in Sweden in 2009, Epidemic Sound owns 100% of its music catalog, providing worry-free licensing with no copyright claims. Used by major brands like Coca-Cola and Nike.',
        url: 'https://www.epidemicsound.com',
        paid: true,
        badges: ['paid', 'subscription', 'pro-quality'],
        pricing: [
            { plan: 'Creator Plan', price: '$9.99/mo (annual) or $17.99/mo' },
            { plan: 'Pro Plan', price: '$16.99/mo (annual) or $35/mo' },
            { plan: 'Enterprise', price: 'Custom pricing' }
        ],
        features: [
            '50,000+ music tracks and 200,000+ sound effects',
            'YouTube, Instagram, TikTok, Twitch coverage',
            'No copyright claims or takedowns',
            'Stem files included for mixing',
            'Pro plan adds client work and AI voiceover tools',
            '30-day free trial'
        ]
    },
    {
        id: 'artlist',
        name: 'Artlist',
        category: 'music',
        shortDesc: 'Premium music with perpetual licenses that last forever',
        fullDesc: 'Premium royalty-free music platform offering perpetual licenses - meaning you keep usage rights forever, even after subscription ends. Quality-focused curated catalog from professional musicians and cinematographers.',
        url: 'https://artlist.io',
        paid: true,
        badges: ['paid', 'perpetual', '4k'],
        pricing: [
            { plan: 'Music & SFX Social', price: '$9.99/mo' },
            { plan: 'Music & SFX Pro', price: '$16.58-$24.92/mo' },
            { plan: 'Artlist Max', price: '$39.99/mo' }
        ],
        features: [
            'Perpetual licenses (keep rights after canceling)',
            'Unlimited downloads with annual plans',
            '8K stock footage from pro cinematographers',
            'Music stems for advanced mixing'
        ]
    },
    {
        id: 'audiio',
        name: 'Audiio',
        category: 'music',
        shortDesc: 'Flexible licensing with frequent lifetime deal promotions',
        fullDesc: 'Creator-friendly music platform known for lifetime access promotions. Great for indie creators who want to own their library outright.',
        url: 'https://audiio.com',
        paid: true,
        badges: ['paid', 'lifetime'],
        pricing: [
            { plan: 'Monthly', price: '$19/mo' },
            { plan: 'Yearly', price: '$149/yr' },
            { plan: 'Lifetime (promo)', price: '$199' }
        ],
        features: ['Lifetime deal options', 'Commercial license included', 'Weekly new releases']
    },
    {
        id: 'free-music-archive',
        name: 'Free Music Archive',
        category: 'music',
        shortDesc: 'Creative Commons music library',
        fullDesc: 'Community-curated library of Creative Commons and public domain music. Perfect for independent projects with tight budgets.',
        url: 'https://freemusicarchive.org',
        paid: false,
        badges: ['free', 'cc-license'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['Creative Commons licensed', 'Multiple genres', 'Community curated']
    },

    // ========== SOUND FX ==========
    {
        id: 'freesound',
        name: 'Freesound',
        category: 'soundfx',
        shortDesc: 'Community sound effects database with 600,000+ sounds',
        fullDesc: '600,000+ Creative Commons sounds from worldwide contributors. Best for unique, specific sounds. Check individual licenses.',
        url: 'https://freesound.org',
        paid: false,
        badges: ['free', 'community'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['600,000+ sounds', 'Community contributions', 'Creative Commons']
    },
    {
        id: 'zapsplat',
        name: 'Zapsplat',
        category: 'soundfx',
        shortDesc: 'Free professional sound effects library',
        fullDesc: 'High-quality professional SFX for video editors. Over 100,000 free sound effects. Attribution required for free plan.',
        url: 'https://www.zapsplat.com',
        paid: false,
        badges: ['free', 'pro-quality'],
        pricing: [{ plan: 'Free', price: '$0 (attribution required)' }, { plan: 'Gold', price: '$9/mo' }],
        features: ['100,000+ sounds', 'Pro quality', 'Gold removes attribution']
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        category: 'soundfx',
        shortDesc: 'AI voice generator and text-to-speech',
        fullDesc: 'Industry-leading AI voice generation. Create ultra-realistic voiceovers, clone voices, and generate speech in multiple languages.',
        url: 'https://elevenlabs.io/',
        paid: true,
        badges: ['paid', 'ai'],
        pricing: [{ plan: 'Free', price: '$0 (limited)' }, { plan: 'Starter', price: '$5/mo' }, { plan: 'Creator', price: '$22/mo' }],
        features: ['Realistic AI voices', 'Voice cloning', 'Multi-language', 'Commercial use']
    },

    // ========== AI TOOLS ==========
    {
        id: 'runway-ml',
        name: 'Runway ML',
        category: 'ai',
        shortDesc: 'Professional AI video generation with Gen-4 models',
        fullDesc: 'Industry-leading AI platform for video and image generation. Gen-4 model creates ultra-realistic video from text/image prompts.',
        url: 'https://runwayml.com',
        paid: true,
        badges: ['paid', 'ai', 'subscription'],
        pricing: [
            { plan: 'Free', price: '$0 (125 credits)' },
            { plan: 'Standard', price: '$12/mo' },
            { plan: 'Pro', price: '$28/mo' },
            { plan: 'Unlimited', price: '$76/mo' }
        ],
        features: ['Gen-4 video generation', 'Text-to-video', 'Image-to-video', '4K rendering']
    },
    {
        id: 'descript',
        name: 'Descript',
        category: 'ai',
        shortDesc: 'Edit video by editing text transcript',
        fullDesc: 'Revolutionary video editor that lets you edit video by editing a text transcript. 10x faster than traditional editing for dialogue-heavy content.',
        url: 'https://www.descript.com',
        paid: true,
        badges: ['paid', 'ai', 'subscription'],
        pricing: [
            { plan: 'Free', price: '$0 (1 hour/mo)' },
            { plan: 'Creator', price: '$24/mo' },
            { plan: 'Pro', price: '$40/mo' }
        ],
        features: ['Edit video as text', 'Auto transcription', 'AI noise reduction', 'Filler word removal']
    },
    {
        id: 'adobe-firefly',
        name: 'Adobe Firefly',
        category: 'ai',
        shortDesc: 'Adobe\'s AI image generator',
        fullDesc: 'Adobe\'s generative AI for creating images from text prompts. Trained on licensed content for commercial safety.',
        url: 'https://firefly.adobe.com',
        paid: true,
        badges: ['paid', 'ai'],
        pricing: [{ plan: 'Free', price: '$0 (25 credits/mo)' }, { plan: 'Premium', price: '$4.99/mo' }],
        features: ['AI image generation', 'Commercially safe', 'Adobe integration']
    },

    // ========== SOFTWARE ==========
    {
        id: 'davinci-resolve',
        name: 'DaVinci Resolve',
        category: 'software',
        shortDesc: 'Professional editing, color, VFX, audio - Hollywood standard',
        fullDesc: 'Industry-standard all-in-one post-production software used on more feature films and TV shows than any other solution. Free version is incredibly powerful.',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        paid: false,
        badges: ['free', 'pro-quality'],
        pricing: [
            { plan: 'Free Version', price: '$0 (full-featured)' },
            { plan: 'Studio', price: '$295 one-time' }
        ],
        features: ['Edit, color, VFX, audio', 'Used on Hollywood films', 'Free version supports 4K', 'One-time purchase option']
    },
    {
        id: 'frame-io',
        name: 'Frame.io',
        category: 'software',
        shortDesc: 'Cloud video review and collaboration',
        fullDesc: 'Essential for client feedback and team collaboration. Time-stamped comments on video. Industry standard for video review.',
        url: 'https://frame.io',
        paid: true,
        badges: ['paid', 'subscription'],
        pricing: [{ plan: 'Pro', price: '$15/mo' }, { plan: 'Team', price: '$30/user/mo' }],
        features: ['Cloud collaboration', 'Time-stamped comments', 'NLE integration']
    },

    // ========== STOCK FOOTAGE ==========
    {
        id: 'pexels',
        name: 'Pexels',
        category: 'stock',
        shortDesc: 'Completely free 4K stock videos and photos',
        fullDesc: 'Curated high-quality stock footage and images, completely free with no attribution required.',
        url: 'https://www.pexels.com',
        paid: false,
        badges: ['free', '4k'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['No attribution required', '4K video', 'Commercial use']
    },
    {
        id: 'pixabay',
        name: 'Pixabay',
        category: 'stock',
        shortDesc: 'Free stock videos, photos, music, and SFX',
        fullDesc: 'Over 4.5 million free media files including video, photos, music, and sound effects.',
        url: 'https://pixabay.com',
        paid: false,
        badges: ['free'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['4.5M+ files', 'No attribution', 'Multi-media library']
    },
    {
        id: 'actionvfx',
        name: 'ActionVFX',
        category: 'stock',
        shortDesc: 'Production-quality VFX assets',
        fullDesc: 'World\'s largest library of production-quality VFX elements. Fire, explosions, smoke, water, muzzle flashes.',
        url: 'https://www.actionvfx.com',
        paid: true,
        badges: ['paid', 'pro-quality'],
        pricing: [{ plan: 'Free Plan', price: '$0 (limited)' }, { plan: 'Paid', price: 'Varies' }],
        features: ['Production VFX elements', 'Hollywood quality', 'Multiple categories']
    },

    // ========== EQUIPMENT ==========
    {
        id: 'lensrentals',
        name: 'LensRentals',
        category: 'equipment',
        shortDesc: 'Industry-standard camera and lens rentals',
        fullDesc: 'Premier camera and lens rental service. Insurance included, rigorous gear testing, expert support.',
        url: 'https://www.lensrentals.com',
        paid: true,
        badges: ['paid', 'rental'],
        pricing: [{ plan: 'Daily Rate', price: 'Varies by gear' }],
        features: ['Insurance included', 'Tested gear', 'Expert support', 'Nationwide shipping']
    },
    {
        id: 'sharegrid',
        name: 'ShareGrid',
        category: 'equipment',
        shortDesc: 'Peer-to-peer camera gear rental',
        fullDesc: 'Rent camera gear from local filmmakers. Often 40-60% cheaper than rental houses.',
        url: 'https://www.sharegrid.com',
        paid: true,
        badges: ['paid', 'rental'],
        pricing: [{ plan: 'Daily', price: 'Set by owner' }],
        features: ['40-60% cheaper', 'Local rentals', 'Damage protection']
    },
    {
        id: 'smallrig',
        name: 'SmallRig',
        category: 'equipment',
        shortDesc: 'Camera rigs, cages, and accessories',
        fullDesc: 'Affordable, high-quality camera rigs, cages, stabilizers, and accessories.',
        url: 'https://www.smallrig.com',
        paid: true,
        badges: ['paid'],
        pricing: [{ plan: 'Products', price: 'Varies' }],
        features: ['Camera cages and rigs', 'Affordable pricing', 'Wide compatibility']
    },

    // ========== 3D ==========
    {
        id: 'blender-market',
        name: 'Blender Market',
        category: '3d',
        shortDesc: 'Marketplace for Blender add-ons and assets',
        fullDesc: 'Premier marketplace for the Blender community. Thousands of add-ons, 3D models, materials, and training resources.',
        url: 'https://blendermarket.com/',
        paid: false,
        badges: ['free', 'marketplace'],
        pricing: [{ plan: 'Marketplace', price: 'Varies' }],
        features: ['Blender add-ons', 'Professional 3D models', 'Training courses']
    },
    {
        id: 'mixamo',
        name: 'Mixamo',
        category: '3d',
        shortDesc: '3D character animation and rigging',
        fullDesc: 'Adobe\'s free 3D character animation tool. Auto-rigging, motion capture library.',
        url: 'https://www.mixamo.com',
        paid: false,
        badges: ['free'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['Auto-rigging', 'Mocap library', 'Free characters']
    },
    {
        id: 'sketchfab',
        name: 'Sketchfab',
        category: '3d',
        shortDesc: '3D model marketplace and viewer',
        fullDesc: 'Platform to publish, share, and discover 3D models. View models in browser.',
        url: 'https://sketchfab.com',
        paid: false,
        badges: ['free', 'marketplace'],
        pricing: [{ plan: 'Free Models', price: '$0' }, { plan: 'Paid Models', price: 'Varies' }],
        features: ['3D model library', 'Browser viewer', 'Artist community']
    },

    // ========== FONTS ==========
    {
        id: 'google-fonts',
        name: 'Google Fonts',
        category: 'fonts',
        shortDesc: '1000+ free, open-source fonts',
        fullDesc: 'Massive library of high-quality, professionally designed fonts. Free for commercial use.',
        url: 'https://fonts.google.com',
        paid: false,
        badges: ['free'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['1000+ font families', 'Free commercial use', 'Easy web integration']
    },
    {
        id: 'dafont',
        name: 'DaFont',
        category: 'fonts',
        shortDesc: 'Archive of freely downloadable fonts',
        fullDesc: 'Large collection of free fonts. Always check individual font licenses.',
        url: 'https://www.dafont.com',
        paid: false,
        badges: ['free'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['Thousands of fonts', 'Easy downloads', 'Multiple categories']
    },
    {
        id: 'whatthefont',
        name: 'WhatTheFont',
        category: 'fonts',
        shortDesc: 'Identify fonts by uploading an image',
        fullDesc: 'Upload an image of a font and WhatTheFont will identify it for you.',
        url: 'https://www.myfonts.com/pages/whatthefont',
        paid: false,
        badges: ['free', 'tool'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['Font identification', 'Image upload', 'Similar font suggestions']
    },

    // ========== EVENTS ==========
    {
        id: 'mograph-mondays',
        name: 'Mograph Mondays',
        category: 'events',
        shortDesc: 'Monthly motion graphics meetup in Detroit',
        fullDesc: 'Monthly gathering of motion designers, animators, and creatives in the Detroit area.',
        url: 'https://www.mographmondays.com/',
        paid: false,
        badges: ['free', 'detroit', 'community'],
        pricing: [{ plan: 'Free Event', price: '$0' }],
        features: ['Monthly meetups', 'Motion graphics community', 'Networking']
    },
    {
        id: 'campfire-film',
        name: 'Campfire Film',
        category: 'events',
        shortDesc: 'Filmmaking community and events',
        fullDesc: 'Community-driven platform connecting filmmakers through events and collaborative projects.',
        url: 'https://campfirefilm.org/',
        paid: false,
        badges: ['free', 'community'],
        pricing: [{ plan: 'Free', price: '$0' }],
        features: ['Filmmaking community', 'Screenings', 'Workshops']
    },

    // ========== FILM FESTIVALS ==========
    {
        id: 'horror-roulette',
        name: 'Horror Film Roulette',
        category: 'festivals',
        shortDesc: '3-week horror film challenge with cash prizes',
        fullDesc: '3-week horror film competition where teams create a short horror film from scratch. Random prompts ensure creativity.',
        url: 'https://horrorfilmroulette.com/',
        paid: false,
        badges: ['free', 'challenge'],
        pricing: [{ plan: 'Entry', price: 'Varies' }],
        features: ['3-week timeline', 'Horror genre', 'Cash prizes', 'Awards']
    },
    {
        id: 'comedy-roll',
        name: 'The Comedy Roll',
        category: 'festivals',
        shortDesc: 'Comedy short film festival',
        fullDesc: 'Annual festival celebrating comedy shorts. Top 25 selections screened and judged.',
        url: 'https://thecomedyroll.com/',
        paid: false,
        badges: ['free', 'festival'],
        pricing: [{ plan: 'Submission', price: 'Varies' }],
        features: ['Comedy shorts', 'Top 25 selections', 'Annual event']
    },

    // ========== OTHER ==========
    {
        id: 'standard-story',
        name: 'Standard Story Company',
        category: 'other',
        shortDesc: 'Short film blueprint course',
        fullDesc: 'Educational platform for filmmakers. Learn short film production from industry professionals.',
        url: 'https://standardstoryco.teachable.com',
        paid: true,
        badges: ['paid'],
        pricing: [{ plan: 'Course', price: 'Varies' }],
        features: ['Filmmaking education', 'Short film focus', 'Community access']
    },
    {
        id: 'fiverr',
        name: 'Fiverr',
        category: 'other',
        shortDesc: 'Freelance services marketplace',
        fullDesc: 'Global marketplace for freelance services. Find voice actors, motion graphics artists, editors.',
        url: 'https://www.fiverr.com/',
        paid: false,
        badges: ['free', 'marketplace'],
        pricing: [{ plan: 'Free to Browse', price: 'Services vary' }],
        features: ['Freelance marketplace', 'Global talent', 'Multiple categories']
    }
];
