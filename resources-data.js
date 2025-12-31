// LaB Media Resources Data - Comprehensive Edition 2025

const resources = [
    // ========== MUSIC ==========
    {
        id: 'epidemic-sound',
        name: 'Epidemic Sound',
        category: 'music',
        shortDesc: 'Comprehensive royalty-free music and SFX library with 50,000+ tracks',
        fullDesc: 'Industry-leading music and sound effects platform with over 50,000 tracks and 200,000 Hollywood-grade sound effects. Founded in Sweden in 2009, Epidemic Sound owns 100% of its music catalog, providing worry-free licensing with no copyright claims. Used by major brands like Coca-Cola and Nike. Artists earn $1,775-$8,000 per track plus 50% streaming royalties and share of annual $2.9M Soundtrack Bonus.',
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
            'Mobile app with Adobe extension',
            '30-day free trial'
        ]
    },
    {
        id: 'artlist',
        name: 'Artlist',
        category: 'music',
        shortDesc: 'Premium music with perpetual licenses that last forever',
        fullDesc: 'Premium royalty-free music platform offering perpetual licenses - meaning you keep usage rights forever, even after subscription ends. Expanded in 2025 to include AI video generation (Google Veo 3), footage library with 8K clips, video templates, and 50+ Premiere Pro plugins. Quality-focused curated catalog from professional musicians and cinematographers.',
        url: 'https://artlist.io',
        paid: true,
        badges: ['paid', 'perpetual', '4k'],
        pricing: [
            { plan: 'Music & SFX Social', price: '$9.99/mo (1 channel per platform)' },
            { plan: 'Music & SFX Pro', price: '$16.58-$24.92/mo (commercial use)' },
            { plan: 'Artlist Max', price: '$39.99/mo (everything + AI tools)' },
            { plan: 'Teams (2-7 seats)', price: '$14-$34/user/mo' },
            { plan: 'Business (50+ employees)', price: 'Custom pricing' }
        ],
        features: [
            'Perpetual licenses (keep rights after canceling)',
            'Unlimited downloads with annual plans',
            'AI video generation with Veo 3, Kling 2.5',
            '8K stock footage from pro cinematographers',
            '50+ Premiere Pro plugins and LUTs',
            'Music stems for advanced mixing',
            'Get 2 free months with annual plan'
        ]
    },
    {
        id: 'audiio',
        name: 'Audiio',
        category: 'music',
        shortDesc: 'Flexible licensing with frequent lifetime deal promotions',
        fullDesc: 'Creator-friendly music platform known for lifetime access promotions. Quality tracks across multiple genres with both subscription and one-time purchase options. Great for indie creators who want to own their library outright. Weekly content updates keep the catalog fresh.',
        url: 'https://audiio.com',
        paid: true,
        badges: ['paid', 'lifetime'],
        pricing: [
            { plan: 'Monthly', price: '$19/mo' },
            { plan: 'Yearly', price: '$149/yr' },
            { plan: 'Lifetime (promo)', price: '$199 (limited time)' }
        ],
        features: [
            'Lifetime deal options (own forever)',
            'Unlimited downloads during subscription',
            'Commercial license included',
            'Weekly new releases',
            'No attribution required'
        ]
    },
    
    // ========== AI TOOLS ==========
    {
        id: 'runway-ml',
        name: 'Runway ML',
        category: 'ai',
        shortDesc: 'Professional AI video generation with Gen-4 models',
        fullDesc: 'Industry-leading AI platform for video and image generation. Gen-4 model (released 2025) creates ultra-realistic video from text/image prompts with precise control over characters, objects, and environments. Credit-based system where quality and speed determine cost. Used by professionals in film, marketing, and content creation. Offers text-to-video, image-to-video, video-to-video, AI voices, and 30+ editing tools.',
        url: 'https://runwayml.com',
        paid: true,
        badges: ['paid', 'ai', 'subscription'],
        pricing: [
            { plan: 'Free', price: '$0 (125 credits one-time)' },
            { plan: 'Standard', price: '$12/mo (625 credits)' },
            { plan: 'Pro', price: '$28/mo (2,250 credits)' },
            { plan: 'Unlimited', price: '$76/mo (unlimited Explore Mode)' },
            { plan: 'Enterprise', price: 'Custom' }
        ],
        features: [
            'Gen-4 Alpha: Ultra-realistic video generation',
            '2250 credits = 90s of Gen-4.5, 187s of Gen-4, or 450s Gen-4 Turbo',
            'Text-to-video, image-to-video, video-to-video',
            'Custom AI voices for lip sync and TTS',
            'Unlimited video in Explore Mode (Unlimited plan)',
            '4K rendering, watermark-free exports (Pro+)',
            'Multi-Motion Brush for precise scene control'
        ]
    },
    {
        id: 'descript',
        name: 'Descript',
        category: 'ai',
        shortDesc: 'Edit video by editing text transcript - game changer',
        fullDesc: 'Revolutionary video editor that lets you edit video by editing a text transcript. Perfect for interviews, podcasts, and talking-heads content. Auto transcription with speaker detection, AI-powered filler word removal ("um", "uh"), Studio Sound removes background noise, and Overdub creates AI voice clones. Workflow is 10x faster than traditional editing for dialogue-heavy content.',
        url: 'https://www.descript.com',
        paid: true,
        badges: ['paid', 'ai', 'subscription'],
        pricing: [
            { plan: 'Free', price: '$0 (1 hour transcription/mo)' },
            { plan: 'Creator', price: '$24/mo (10 hours/mo)' },
            { plan: 'Pro', price: '$40/mo (30 hours/mo)' }
        ],
        features: [
            'Edit video by editing text transcript',
            'Auto transcription with speaker labels',
            'Studio Sound: AI noise reduction',
            'Remove filler words automatically',
            'Overdub: Create your AI voice clone',
            'Screen recording built-in',
            'Publish to YouTube, podcast platforms'
        ]
    },
    
    // ========== SOFTWARE ==========
    {
        id: 'davinci-resolve',
        name: 'DaVinci Resolve',
        category: 'software',
        shortDesc: 'Professional editing, color, VFX, audio - Hollywood standard',
        fullDesc: 'Industry-standard all-in-one post-production software used on more feature films and TV shows than any other solution. Free version is incredibly powerful with no watermarks or time limits. Studio version ($295 one-time) unlocks AI Neural Engine, 8K/32K editing, 120fps support, advanced color tools, noise reduction, and 100+ Resolve FX plugins. Includes Fairlight audio post and Fusion VFX. Free lifetime updates with Studio.',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        paid: false,
        badges: ['free', 'pro-quality'],
        pricing: [
            { plan: 'Free Version', price: '$0 (full-featured, no watermark)' },
            { plan: 'Studio', price: '$295 one-time purchase' },
            { plan: 'iPad Version', price: 'Free or $94.99 for Studio' }
        ],
        features: [
            'Edit, color, VFX, audio all in one app',
            'Used on Hollywood films and Netflix shows',
            'Free version supports up to 4K 60fps',
            'Studio: 8K/32K at 120fps, AI tools, 100+ FX',
            'DaVinci Neural Engine for AI features',
            'Multi-user collaboration (Studio)',
            'One-time $295 purchase, free updates forever'
        ]
    },
    
    // ========== STOCK FOOTAGE ==========
    {
        id: 'pexels',
        name: 'Pexels',
        category: 'stock',
        shortDesc: 'Completely free 4K stock videos and photos',
        fullDesc: 'Curated high-quality stock footage and images, completely free with no attribution required. Great for B-roll, backgrounds, and establishing shots. 4K footage available with advanced filtering. All content is hand-picked and licensed for commercial use.',
        url: 'https://www.pexels.com',
        paid: false,
        badges: ['free', '4k'],
        pricing: [
            { plan: 'Free', price: '$0 (no attribution required)' }
        ],
        features: [
            'No attribution required',
            '4K video and high-res photos',
            'Curated, hand-picked content',
            'Commercial use allowed',
            'Advanced search and filters',
            'Completely free forever'
        ]
    },
    
    // ========== 3D ==========
    {
        id: 'blender-market',
        name: 'Blender Market',
        category: '3d',
        shortDesc: 'Marketplace for Blender add-ons, models, and assets',
        fullDesc: 'Premier marketplace for the Blender community. Thousands of add-ons, 3D models, materials, HDRIs, and training resources created by professional artists. Quality-curated content that extends Blender\'s capabilities for modeling, animation, VFX, and rendering.',
        url: 'https://blendermarket.com/',
        paid: false,
        badges: ['free', 'marketplace'],
        pricing: [
            { plan: 'Marketplace', price: 'Pay per item (varies)' },
            { plan: 'Free Items', price: 'Many free resources available' }
        ],
        features: [
            'Thousands of Blender add-ons and assets',
            'Professional 3D models and materials',
            'HDRIs and texture packs',
            'Training courses and tutorials',
            'Created by professional Blender artists',
            'Both free and paid content'
        ]
    },
    
    // ========== FRIENDS ==========
    {
        id: 'moz-interiors',
        name: 'MOZ Interiors',
        category: 'friends',
        shortDesc: 'Award-winning interior design featured in Vanity Fair, AD',
        fullDesc: 'Michigan-based interior design studio specializing in high-end residential and commercial projects. Featured in Vanity Fair, Architectural Digest, Hour Detroit, and The World of Interiors. Known for sophisticated, timeless design and exceptional client service.',
        url: 'https://www.mozinteriors.com/',
        paid: false,
        badges: ['michigan', 'design'],
        pricing: [
            { plan: 'Consultations', price: 'Contact for pricing' }
        ],
        features: [
            'Featured in Vanity Fair & Architectural Digest',
            'High-end residential & commercial design',
            'Based in Metro Detroit area',
            'Full-service interior design',
            'Award-winning portfolio'
        ]
    },
    {
        id: 'anthony-brass',
        name: 'Anthony R Brass',
        category: 'friends',
        shortDesc: 'Detroit-based artist creating bold, expressive paintings',
        fullDesc: 'Contemporary Detroit artist known for bold, expressive work. Creates vibrant paintings that capture emotion and energy. Available for commissions and exhibitions. Work featured in local galleries and private collections.',
        url: 'https://www.anthonyrbrass.com/',
        paid: false,
        badges: ['michigan', 'artist'],
        pricing: [
            { plan: 'Original Works', price: 'Contact artist for pricing' }
        ],
        features: [
            'Contemporary fine art painter',
            'Based in Detroit, Michigan',
            'Bold, expressive style',
            'Commissions available',
            'Gallery exhibitions'
        ]
    },
    {
        id: 'joe-garofalo',
        name: 'Joe Garofalo Music',
        category: 'friends',
        shortDesc: 'Michigan-based musician and composer',
        fullDesc: 'Professional musician and composer based in Michigan. Creates original music and scores for film, video, and media projects. Available for custom compositions and collaborations.',
        url: 'https://www.joegarofalomusic.com',
        paid: false,
        badges: ['michigan', 'music'],
        pricing: [
            { plan: 'Custom Compositions', price: 'Contact for quote' }
        ],
        features: [
            'Original music composition',
            'Film and media scoring',
            'Michigan-based',
            'Custom projects',
            'Professional musician'
        ]
    },
    
    // ========== EVENTS ==========
    {
        id: 'mograph-mondays',
        name: 'Mograph Mondays',
        category: 'events',
        shortDesc: 'Monthly motion graphics meetup in Detroit',
        fullDesc: 'Monthly gathering of motion designers, animators, and creatives in the Detroit area. Network with local talent, share work, learn new techniques, and connect with the growing Michigan motion graphics community.',
        url: 'https://www.mographmondays.com/',
        paid: false,
        badges: ['free', 'detroit', 'community'],
        pricing: [
            { plan: 'Free Event', price: '$0' }
        ],
        features: [
            'Monthly meetups in Detroit',
            'Motion graphics community',
            'Networking opportunities',
            'Portfolio sharing',
            'Free to attend'
        ]
    },
    {
        id: 'campfire-film',
        name: 'Campfire Film',
        category: 'events',
        shortDesc: 'Filmmaking community and events platform',
        fullDesc: 'Community-driven platform connecting filmmakers through events, challenges, and collaborative projects. Hosts screenings, workshops, and networking events for independent filmmakers.',
        url: 'https://campfirefilm.org/',
        paid: false,
        badges: ['free', 'community'],
        pricing: [
            { plan: 'Free', price: '$0' }
        ],
        features: [
            'Filmmaking community events',
            'Screenings and workshops',
            'Networking for filmmakers',
            'Collaborative projects',
            'Independent film focused'
        ]
    },
    
    // ========== FILM FESTIVALS ==========
    {
        id: 'horror-roulette',
        name: 'Horror Film Roulette',
        category: 'festivals',
        shortDesc: '3-week horror film challenge with cash prizes',
        fullDesc: '3-week horror film competition where teams create a short horror film from scratch. Random prompts ensure creativity and unique storytelling. Winners receive cash prizes, awards, and industry recognition. Great for building your horror portfolio.',
        url: 'https://horrorfilmroulette.com/',
        paid: false,
        badges: ['free', 'challenge'],
        pricing: [
            { plan: 'Entry', price: 'Varies by year' }
        ],
        features: [
            '3-week filmmaking timeline',
            'Horror genre focus',
            'Random creative prompts',
            'Cash prizes for winners',
            'Awards and recognition',
            'Industry networking opportunities'
        ]
    },
    {
        id: 'comedy-roll',
        name: 'The Comedy Roll',
        category: 'festivals',
        shortDesc: 'Comedy short film festival with Top 25 selections',
        fullDesc: 'Annual festival celebrating comedy shorts. Top 25 selections screened and judged. Great platform for comedy filmmakers to gain exposure and connect with other creators in the genre.',
        url: 'https://thecomedyroll.com/',
        paid: false,
        badges: ['free', 'festival'],
        pricing: [
            { plan: 'Submission', price: 'Varies by deadline' }
        ],
        features: [
            'Comedy short film festival',
            'Top 25 selections screened',
            'Annual event',
            'Filmmaker networking',
            'Genre-specific focus'
        ]
    },
    
    // Add remaining resources with shorter descriptions for now
    // User can request specific resources be expanded
    
    { id: 'free-music-archive', name: 'Free Music Archive', category: 'music', shortDesc: 'Creative Commons music library', fullDesc: 'Community-curated library of Creative Commons and public domain music. Perfect for independent projects with tight budgets.', url: 'https://freemusicarchive.org', paid: false, badges: ['free', 'cc-license'], pricing: [{plan: 'Free', price: '$0'}], features: ['Creative Commons licensed', 'Multiple genres', 'Community curated'] },
    
    { id: 'freesound', name: 'Freesound', category: 'soundfx', shortDesc: 'Community sound effects database', fullDesc: '600,000+ Creative Commons sounds from worldwide contributors. Best for unique, specific sounds. Check individual licenses.', url: 'https://freesound.org', paid: false, badges: ['free', 'community'], pricing: [{plan: 'Free', price: '$0'}], features: ['600,000+ sounds', 'Community contributions', 'Creative Commons'] },
    
    { id: 'google-fonts', name: 'Google Fonts', category: 'fonts', shortDesc: '1000+ free, open-source fonts', fullDesc: 'Massive library of high-quality, professionally designed fonts. Free for commercial use, easy web integration, regularly updated.', url: 'https://fonts.google.com', paid: false, badges: ['free'], pricing: [{plan: 'Free', price: '$0'}], features: ['1000+ font families', 'Free commercial use', 'Easy web integration'] },
    
    { id: 'frame-io', name: 'Frame.io', category: 'software', shortDesc: 'Cloud video review and collaboration', fullDesc: 'Essential for client feedback and team collaboration. Time-stamped comments on video. Integrates with Premiere, Final Cut, Resolve.', url: 'https://frame.io', paid: true, badges: ['paid', 'subscription'], pricing: [{plan: 'Pro', price: '$15/mo'}, {plan: 'Team', price: '$30/user/mo'}], features: ['Cloud collaboration', 'Time-stamped comments', 'NLE integration'] }
];
