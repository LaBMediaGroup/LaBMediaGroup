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
        desc: 'Detroit-based contemporary artist with vibrant, nature-inspired work. LaB Media collaborator.',
        fullDesc: 'Anthony R Brass is a Detroit-based fine artist whose work explores nature, color, and emotion through bold brushwork and organic palettes. LaB Media collaborated with Anthony on an intimate artist spotlight documentary filmed in-studio, capturing authentic process and lived-in craft.',
        url: 'https://www.anthonybrass.com',
        keyInfo: [
            { label: 'Instagram', value: 'https://www.instagram.com/anthonyrbrass/' },
            { label: 'YouTube', value: 'https://www.youtube.com/channel/UChBFLCl5yzjO_vZj15_pqhw' },
            { label: 'Facebook', value: 'https://www.facebook.com/anthonyRbrass/' }
        ],
        features: [
            'Contemporary Fine Art',
            'Nature-Inspired',
            'Detroit-Based Artist',
            'Studio Practice',
            'Documentary Subject',
            'LaB Media Collaborator'
        ]
    },
    {
        name: 'MOZ Interiors',
        category: 'collaborators',
        desc: 'Award-winning interior design studio featured in Vanity Fair, Architectural Digest, and Hour Detroit.',
        fullDesc: 'MOZ Interiors is a Michigan-based interior design studio specializing in high-end residential and commercial spaces. Their work has been recognized by Vanity Fair, Architectural Digest, Hour Detroit, and The World of Interiors. LaB Media partnered with MOZ on a designer spotlight film, capturing refined vision through clean, confident cinematography.',
        url: 'https://www.mozinteriors.com',
        keyInfo: [
            { label: 'Instagram', value: 'https://www.instagram.com/moz_interiors/' },
            { label: 'Facebook', value: 'https://www.facebook.com/mozinterior' }
        ],
        features: [
            'Interior Design',
            'Press Featured',
            'Residential & Commercial',
            'Luxury Brand',
            'Metro Detroit',
            'LaB Media Collaborator'
        ]
    },
    {
        name: 'Joe Garofalo Music',
        category: 'collaborators',
        desc: 'Michigan-based composer and musician creating original music for film and media.',
        fullDesc: 'Joe Garofalo is a professional composer and musician based in Michigan, specializing in original music and scoring for film, video, and media projects. His work spans cinematic underscore, ambient textures, and modern electronic composition.',
        url: 'https://www.joegarofalomusic.com',
        keyInfo: [
            { label: 'Instagram', value: 'https://www.instagram.com/_joegmusic_/' },
            { label: 'Spotify', value: 'https://open.spotify.com/artist/3w9fELcZkbxwfto7bZOajz' }
        ],
        features: [
            'Original Scores',
            'Music Production',
            'Composer',
            'Multi-Genre',
            'Michigan-Based',
            'Custom Project Work'
        ]
    },
    {
        name: 'Sideways Studios',
        category: 'collaborators',
        desc: 'Animation and motion design studio specializing in bold, stylized visual work.',
        fullDesc: 'Sideways Studios is a motion design and animation studio creating bold, stylized visual work across animation, branding, and short-form content. Their approach emphasizes strong graphic language, movement, and visual clarity—built for design-forward collaborations.',
        url: 'https://sidewaysstudio.net',
        keyInfo: [
            { label: 'Instagram', value: 'https://www.instagram.com/sideways_animation/?hl=en' }
        ],
        features: [
            'Motion Design',
            'Animation Studio',
            'Stylized Visuals',
            'Design-Forward Work',
            'Branding & Content',
            'Collaborator'
        ]
    },
    {
        name: 'The Pandys',
        category: 'collaborators',
        desc: 'Detroit band featured in LaB Media live session music videos.',
        fullDesc: 'The Pandys bring raw, high-energy performances with a lived-in, no-frills feel. LaB Media captured authentic rehearsal and live-session energy with minimal production interference—momentum first, always.',
        url: null,
        keyInfo: [
            { label: 'Instagram', value: 'https://www.instagram.com/thepandys/?hl=en' },
            { label: 'Facebook', value: 'https://www.facebook.com/thepandys/' }
        ],
        features: [
            'Music Video',
            'Live Sessions',
            'Band',
            'Authentic Performance',
            'Detroit Music Scene'
        ]
    },

    // ============================================
    // COMMUNITY & NETWORKING
    // ============================================
    {
        name: 'Michigan Film & Digital Media Office',
        category: 'community',
        desc: 'State resource for film incentives, locations, and crew.',
        fullDesc: 'The Michigan Film & Digital Media Office supports production in the state with location scouting assistance, crew databases, and information about tax incentives. Essential resource for local productions.',
        url: 'https://www.michiganfilmoffice.org',
        paid: false,
        features: ['Crew Database', 'Location Scouting', 'Tax Incentives', 'State Support']
    },
    {
        name: 'Royal Starr Arts Institute',
        category: 'community',
        desc: 'Michigan nonprofit building filmmaker community through mixers, events, and festival programming.',
        fullDesc: 'Royal Starr Arts Institute serves Michigan’s creative community through networking, education, and events—anchored by Royal Starr Film Festival and recurring filmmaker mixers.',
        url: 'https://www.royalstarr.org',
        paid: false,
        keyInfo: [
            { label: 'FilmFreeway', value: 'https://filmfreeway.com/RoyalStarrFilmFestival' },
            { label: 'Instagram', value: 'https://www.instagram.com/royalstarrff/?hl=en' }
        ],
        features: ['Michigan Community', 'Networking', 'Events', 'Festival Hub']
    },
    {
        name: 'Michigan Filmmaker Community (Facebook Group)',
        category: 'community',
        desc: 'Facebook networking group for Michigan filmmakers, cast, and crew.',
        fullDesc: 'Active Facebook group for connecting Michigan filmmakers with actors, crew, and collaborators. Useful for posting gigs, staffing up, sharing resources, and finding local production support.',
        url: 'https://www.facebook.com/groups/mifilmcommunity',
        paid: false,
        features: ['Facebook Group', 'Networking', 'Casting & Crew', 'Local Community']
    },
    {
        name: 'Campfire Film Cooperative',
        category: 'community',
        desc: 'Filmmaker community focused on connection, meetups, and project momentum.',
        fullDesc: 'Campfire Film Cooperative is a community built around connection and craft: share work, find collaborators, and show up for events designed to spark momentum and keep projects moving.',
        url: 'https://campfirefilm.org',
        paid: false,
        features: ['Community', 'Events', 'Collaboration', 'Work Sharing']
    },
    {
        name: 'Mograph Mondays Detroit',
        category: 'community',
        desc: 'Monthly Detroit meetup for motion designers, animators, and CG artists.',
        fullDesc: 'Mograph Mondays Detroit is a recurring meetup for motion designers, animators, CG artists, and adjacent creatives—an easy on-ramp to post, VFX, and design collaborators.',
        url: 'https://www.mographmondays.com/det',
        paid: false,
        features: ['Meetup', 'Motion Design', 'Animation', 'Networking']
    },

    // ============================================
    // FILM FESTIVALS
    // ============================================
    {
        name: 'Traverse City Film Festival',
        category: 'film-festivals',
        desc: 'Michael Moore\'s Michigan festival celebrating great movies.',
        fullDesc: 'Founded by Michael Moore, TCFF brings world-class cinema to Northern Michigan. Mix of premieres and repertory screenings with filmmaker Q&As. Strong community engagement and beautiful lakeside setting.',
        url: 'https://www.traversecityfilmfest.org',
        filmFreewayUrl: 'https://filmfreeway.com/TraverseCityFilmFestival',
        paid: true,
        pricing: [
            { plan: 'Feature', price: '$35-55' },
            { plan: 'Short', price: '$25-45' }
        ],
        keyInfo: [
            { label: 'Dates', value: 'July-August 2025' },
            { label: 'Location', value: 'Traverse City, MI' }
        ],
        features: ['Michigan Festival', 'Community Focus', 'Filmmaker Q&As', 'Repertory']
    },
    {
        name: 'Freep Film Festival',
        category: 'film-festivals',
        desc: 'Detroit Free Press documentary festival celebrating nonfiction.',
        fullDesc: 'Freep Film Festival focuses exclusively on documentary work, presented by the Detroit Free Press. Strong local journalism angle with community screenings and filmmaker discussions throughout metro Detroit.',
        url: 'https://freepfilmfestival.com',
        filmFreewayUrl: 'https://filmfreeway.com/FreepFilmFestival',
        paid: true,
        pricing: [
            { plan: 'Documentary', price: '$30-50' }
        ],
        keyInfo: [
            { label: 'Dates', value: 'April 2025' },
            { label: 'Location', value: 'Detroit, MI' }
        ],
        features: ['Documentary Only', 'Detroit-Based', 'Journalism Focus', 'Community']
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
        name: 'Flint Film Festival',
        category: 'film-festivals',
        desc: 'Celebrating diverse voices in Michigan filmmaking.',
        fullDesc: 'Flint Film Festival highlights diverse voices and stories, with particular focus on Michigan filmmakers and stories relevant to the Flint community. Growing platform for regional talent.',
        url: 'https://flintfilmfestival.com',
        filmFreewayUrl: 'https://filmfreeway.com/FlintFilmFestival',
        paid: true,
        pricing: [
            { plan: 'General', price: '$25-40' }
        ],
        keyInfo: [
            { label: 'Location', value: 'Flint, MI' }
        ],
        features: ['Michigan Focus', 'Diverse Voices', 'Community Stories', 'Regional']
    },
    {
        name: 'Horror Film Roulette',
        category: 'film-festivals',
        desc: 'Horror short film competition. Trail Dead won Best Editing 2025.',
        fullDesc: 'Horror Film Roulette is a competitive horror short film festival where LaB Media\'s "Trail Dead" earned Best Editing recognition in 2025. Quick turnaround format challenges filmmakers with genre constraints.',
        url: null,
        filmFreewayUrl: 'https://filmfreeway.com/HorrorFilmRoulette',
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
        url: null,
        filmFreewayUrl: 'https://filmfreeway.com/ComedyRollFilmFestival',
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
        fullDesc: 'Creepy Cheapy is a Michigan-based horror festival built for scrappy, micro-budget filmmaking—cult energy, practical effects, underground voices, and regional community screenings. A strong fit for weird, lean, fearless genre work that isn’t built around a time-boxed challenge format.',
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

    // ============================================
    // INSPIRATION
    // ============================================
    {
        name: 'Hillier Smith',
        category: 'inspiration',
        desc: 'Cinematic filmmaking, lighting, and camera movement studies.',
        fullDesc: 'Thoughtful breakdowns on cinematography, camera movement, and visual storytelling with a strong emphasis on mood and restraint.',
        url: 'https://www.youtube.com/@HillierSmith',
        paid: false,
        features: ['Cinematography', 'Lighting', 'Camera Movement', 'Filmmaking']
    },
    {
        name: 'Gawx Art',
        category: 'inspiration',
        desc: 'Experimental digital artist blending illustration, animation, and texture.',
        fullDesc: 'Expressive digital illustration through animation, texture, and surreal motion—great reference for stylized visual language.',
        url: 'https://www.youtube.com/@GawxArt',
        paid: false,
        features: ['Digital Art', 'Animation', 'Experimental Visuals', 'Creative Process']
    },
    {
        name: 'Dodford',
        category: 'inspiration',
        desc: 'Visual storytelling experiments with a creator-first, process-forward approach.',
        fullDesc: 'A channel built around creative experimentation—useful for seeing how simple ideas evolve into polished visual narratives.',
        url: 'https://www.youtube.com/@DodfordYT',
        paid: false,
        features: ['Creative Process', 'Visual Storytelling', 'Experimentation']
    },
    {
        name: 'Chuck Lee MBM',
        category: 'inspiration',
        desc: 'Creative filmmaking and craft-focused storytelling references.',
        fullDesc: 'Practical creative inspiration centered on making, refining, and finishing work—good fuel for momentum.',
        url: 'https://www.youtube.com/@ChuckLeeMBM',
        paid: false,
        features: ['Filmmaking', 'Creative Process', 'Storytelling', 'Craft']
    },
    {
        name: 'Joris Hermans',
        category: 'inspiration',
        desc: 'Design-forward filmmaking and visual craft inspiration.',
        fullDesc: 'A clean, intentional approach to visuals—useful reference for composition, pacing, and taste.',
        url: 'https://www.youtube.com/@JorisHermans',
        paid: false,
        features: ['Visual Craft', 'Composition', 'Pacing', 'Taste']
    },
    {
        name: 'ALTER',
        category: 'inspiration',
        desc: 'Award-winning short horror films and genre storytelling.',
        fullDesc: 'Curated horror shorts from filmmakers around the world—a consistent reference for pacing, atmosphere, and short-form genre execution.',
        url: 'https://www.youtube.com/WatchALTER',
        paid: false,
        features: ['Horror Shorts', 'Genre Storytelling', 'Atmosphere', 'Short Form']
    },
    {
        name: 'Veritas Games',
        category: 'inspiration',
        desc: 'Gaming and interactive storytelling with strong pacing and format discipline.',
        fullDesc: 'A solid reference for structure and audience retention—how to hold attention, build stakes, and land beats cleanly.',
        url: 'https://www.youtube.com/@VeritasGames',
        paid: false,
        features: ['Pacing', 'Structure', 'Audience Retention', 'Format']
    },
    {
        name: 'paul_et',
        category: 'inspiration',
        desc: 'Design, motion, and digital craft inspiration with a modern aesthetic.',
        fullDesc: 'A modern visual sensibility—useful reference for minimal, clean design decisions and motion-forward thinking.',
        url: 'https://www.youtube.com/@paul_et',
        paid: false,
        features: ['Design', 'Motion', 'Modern Aesthetic', 'Digital Craft']
    },
    {
        name: 'Sean Kitching',
        category: 'inspiration',
        desc: 'Creator workflow and filmmaking momentum inspiration.',
        fullDesc: 'A reference point for staying consistent—workflow, output, and pushing projects over the finish line.',
        url: 'https://www.youtube.com/@seankitching',
        paid: false,
        features: ['Workflow', 'Consistency', 'Filmmaking', 'Output']
    },
    {
        name: 'Casey Neistat',
        category: 'inspiration',
        desc: 'High-energy personal filmmaking and creative momentum.',
        fullDesc: 'A reference for rhythm, structure, and creative confidence—motion-first storytelling with editorial instinct.',
        url: 'https://www.youtube.com/@casey',
        paid: false,
        features: ['Personal Filmmaking', 'Editing Rhythm', 'Creative Process']
    },
    {
        name: 'Lofi Girl',
        category: 'inspiration',
        desc: 'Iconic lo-fi music channel with strong visual identity.',
        fullDesc: 'A reference point for branding, tone, and ambient storytelling through consistent visual language.',
        url: 'https://www.youtube.com/@LofiGirl',
        paid: false,
        features: ['Music Channel', 'Visual Identity', 'Brand Consistency']
    },
    {
        name: 'Viva La Dirt League',
        category: 'inspiration',
        desc: 'Narrative comedy sketches rooted in gaming and pop culture.',
        fullDesc: 'High-output narrative comedy with strong character consistency and efficient production workflows.',
        url: 'https://www.youtube.com/@VivaLaDirtLeague',
        paid: false,
        features: ['Comedy', 'Sketch Writing', 'Narrative Shorts', 'High Output']
    },
    {
        name: 'PandaHouse',
        category: 'inspiration',
        desc: 'Detroit-based music project blending indie, alternative, and expressive songwriting.',
        fullDesc: 'Mood-driven songwriting with an atmospheric edge—useful inspiration for music-led visual tone and emotional pacing.',
        url: 'https://www.pandahousedetroit.com',
        paid: false,
        keyInfo: [
            { label: 'Spotify', value: 'https://open.spotify.com/artist/0HuGjGGYSPTGINTZpc6ziy' }
        ],
        features: ['Indie Music', 'Detroit Artist', 'Mood-Driven Sound', 'Atmospheric Tone']
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

    // ============================================
    // SOUND FX
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

    // ============================================
    // AI TOOLS
    // ============================================
    {
        name: 'Runway ML',
        category: 'ai',
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
        name: 'Adobe Firefly',
        category: 'ai',
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
        name: 'Topaz Video AI',
        category: 'ai',
        desc: 'AI upscaling, denoising, and frame interpolation.',
        fullDesc: 'Essential for rescuing footage. Upscale old content to 4K, remove noise, interpolate frames for smooth slow motion. One-time purchase with free updates.',
        url: 'https://www.topazlabs.com/topaz-video-ai',
        paid: true,
        pricing: [
            { plan: 'Perpetual', price: '$299' }
        ],
        features: ['4K Upscaling', 'Noise Removal', 'Frame Interpolation', 'One-Time Purchase']
    },
    {
        name: 'ElevenLabs',
        category: 'ai',
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
        category: 'other',
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
        category: 'other',
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
        category: 'other',
        desc: 'Freelance marketplace for creative services.',
        fullDesc: 'Find freelancers for specific tasks: logo animation, subtitles, voice-over, etc. Variable quality - vet carefully. Useful for specialized one-off needs.',
        url: 'https://www.fiverr.com',
        paid: true,
        features: ['Freelance Marketplace', 'Specialized Tasks', 'Variable Quality', 'One-Off Projects']
    },
    {
        name: 'Mandy',
        category: 'other',
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
        category: 'other',
        desc: 'US-focused production job board and directory.',
        fullDesc: 'Find and post production jobs. Searchable directory of crew and vendors by location. Useful for staffing up local shoots and finding specialists.',
        url: 'https://www.productionhub.com',
        paid: true,
        features: ['US Focus', 'Job Board', 'Crew Directory', 'Vendor Search']
    },
    {
        name: 'Notion',
        category: 'other',
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
