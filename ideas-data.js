// Ideas Generator Data
// Short film prompts, locations, objects, and characters for filmmakers

const defaultIdeaTags = () => ({
    tone: ['neutral'],
    cast: [],
    budget: []
});

const normalizeIdeaEntry = (entry) => {
    if (typeof entry === 'string') {
        return { text: entry, tags: defaultIdeaTags() };
    }
    const tags = entry.tags || {};
    const tone = Array.isArray(tags.tone) && tags.tone.length ? tags.tone : ['neutral'];
    const cast = Array.isArray(tags.cast) ? tags.cast : [];
    const budget = Array.isArray(tags.budget) ? tags.budget : [];
    const normalized = {
        ...entry,
        tags: {
            tone,
            cast,
            budget
        }
    };
    if (typeof tags.intensity === 'number') {
        normalized.tags.intensity = tags.intensity;
    }
    return normalized;
};

const ideasData = {
    // ============================================
    // CORE CONCEPTS - Central ideas/situations
    // Evocative 1-2 sentence scenarios
    // ============================================
    concepts: [
        {
            text: "A stranger is sitting in your usual coffee shop seat. You decide to wait them out.",
            tags: { tone: ['neutral', 'dark'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A cashier is overly cheerful. The customer slowly realizes the cashier is stalling them from leaving.",
            tags: { tone: ['horror', 'dark'], cast: ['two'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "Two strangers compete for the last available outlet. The fight gets intimate, fast.",
            tags: { tone: ['comedy', 'dark'], cast: ['two'], budget: ['micro'], intensity: 3 }
        },
        "A person rehearses the same conversation in their car before going inside. We never see who they're meeting.",
        "Someone returns to their childhood home to retrieve one specific object. The new owners let them in.",
        "A delivery driver has been circling the same block for an hour. They can't bring themselves to make this delivery.",
        "Two strangers wait at a bus stop. One knows the buses aren't running today.",
        "A person sits alone at a table set for two. The second plate has already been cleared.",
        "Someone is recording a video message. We watch them start over, again and again.",
        "A late-night radio caller shares a story. We see it unfold as they speak.",
        "Two old friends meet for coffee. One doesn't recognize the other.",
        "A person wakes up to find a sticky note on their mirror that they don't remember writing.",
        "Someone practices their resignation speech in an empty conference room.",
        "A taxi driver's last fare of the night asks to go nowhere in particular.",
        "Two people are stuck in an elevator. One of them pressed the emergency stop.",
        "A person stands outside an apartment door with flowers. They've been there for twenty minutes.",
        "Someone is packing a suitcase. They keep unpacking it and starting over.",
        "A voicemail plays while we watch what the caller was actually doing when they said 'I'm fine.'",
        "Two neighbors finally talk after years of silent acknowledgment. It's 3 AM.",
        "A person sits in a parked car outside a house. Someone inside turns off the porch light.",
        "Someone finds an old letter they never sent. They decide to mail it today.",
        "A support group meets for the last time. No one wants to say goodbye.",
        "Two strangers share an umbrella in a sudden downpour. Neither speaks.",
        "A person is cleaning out their locker at work. They find something they wish they hadn't.",
        "Someone rehearses 'happy birthday' alone before a party. Their reflection doesn't match their enthusiasm.",
        "A late-night diner has only two customers. They're clearly avoiding each other.",
        "A person receives a text that simply says 'I know.' They delete their response three times.",
        "Someone is teaching a younger person something simple. It means more than either admits.",
        "Two people pass each other on a hiking trail. A year ago, they were inseparable.",
        "A person is returning something to a store. The item has never been used but is clearly old.",
        "Someone counts the rings before hanging up. They never let it connect.",
        "A photographer reviews old photos on a camera they just found in a closet.",
        "Two people play a card game in silence. The winner doesn't celebrate.",
        "A person is writing a letter by hand. We never see the name at the top.",
        "Someone is learning a language from an audio lesson. The phrases get increasingly personal.",
        "A barista draws on a cup. We follow where that cup goes throughout the day.",
        "Two co-workers meet outside during a fire drill. One confesses something unexpected.",
        "A person is reading aloud to an empty room. Someone used to sit in that chair.",
        "Someone keeps refreshing a social media page. The last post was three years ago.",
        "A person times how long they can hold their breath. Each attempt gets shorter.",
        "Two siblings divide up a parent's belongings. They both want the same worthless item.",
        "A person is talking to a plant. It's the only honest conversation they've had all week.",
        "Someone watches their neighbor's routine through a window. Today, the routine changed.",
        "A musician plays the same few bars repeatedly. They can never get past one section.",
        "Two people sit in a waiting room. Only one of them has an appointment.",
        "A person finds a journal from ten years ago. Their handwriting is almost unrecognizable.",
        "Someone is on hold with customer service. They've been waiting long enough to rethink everything.",
        "A person takes a photo of themselves. They delete it immediately. They try again.",
        "Two people make eye contact across a crowded room. One looks away. The other doesn't.",
        "A child asks a parent a question they can't answer honestly."
    ].map(normalizeIdeaEntry),

    // ============================================
    // CONSTRAINTS - Rules that shape the story
    // ============================================
    constraints: [
        { text: "The entire film takes place in real-time", type: "time" },
        { text: "Only one location can be used", type: "location" },
        { text: "The main character never speaks", type: "perspective" },
        { text: "We never see the main character's face", type: "visual" },
        { text: "All dialogue is heard through phone calls", type: "audio" },
        { text: "The story is told in reverse chronological order", type: "structure" },
        { text: "Everything happens during golden hour", type: "time" },
        { text: "There can only be two characters on screen", type: "cast" },
        { text: "No character can directly address another", type: "dialogue" },
        { text: "The camera never moves", type: "visual" },
        { text: "All action takes place in or around a vehicle", type: "location" },
        { text: "The story unfolds entirely through reflections", type: "visual" },
        { text: "No dialogue—only ambient sound", type: "audio" },
        { text: "Every scene must include a clock or timer", type: "prop" },
        { text: "The protagonist has only 5 minutes to achieve their goal", type: "time" },
        { text: "The story takes place entirely in a doorway or threshold", type: "location" },
        { text: "We only see the character's hands", type: "visual" },
        { text: "All conflict happens through text messages on screen", type: "format" },
        { text: "The protagonist cannot leave frame once they enter", type: "visual" },
        { text: "Everything must happen before sunrise", type: "time" },
        { text: "The story is told through security camera footage", type: "format" },
        { text: "Only one word of dialogue is allowed", type: "dialogue" },
        { text: "The main character is always in motion", type: "movement" },
        { text: "All sound must be diegetic (from the scene itself)", type: "audio" },
        { text: "The story takes place during a single phone call", type: "time" },
        { text: "No scene can last longer than 30 seconds", type: "pacing" },
        { text: "The protagonist must stay seated the entire time", type: "movement" },
        { text: "Everything is shot from one camera angle", type: "visual" },
        { text: "The story can only include what fits in a single room", type: "location" },
        { text: "All backstory must be conveyed through objects", type: "storytelling" },
        { text: "The main character can only interact with inanimate objects", type: "interaction" },
        { text: "The story takes place entirely in transit", type: "location" },
        { text: "We never see outside", type: "visual" },
        { text: "The protagonist's voice is the only one we hear", type: "audio" },
        { text: "Every cut must be motivated by a sound", type: "editing" },
        { text: "The story happens during a power outage", type: "setting" },
        { text: "No character can be named", type: "dialogue" },
        { text: "The entire story must fit in a 3-minute runtime", type: "time" },
        { text: "We only see what fits in a mirror", type: "visual" },
        { text: "The action takes place in complete silence until the final moment", type: "audio" }
    ].map(normalizeIdeaEntry),

    // ============================================
    // TWISTS - Complications that reframe the story
    // ============================================
    twists: [
        "The person they're waiting for was never coming.",
        "They've already made the decision they're pretending to debate.",
        "The other person can hear everything.",
        "This has happened before—many times.",
        "They're not who they claimed to be.",
        "The real conversation happened before we started watching.",
        "The object they're looking for doesn't exist anymore.",
        "They're saying goodbye, but the other person doesn't know it yet.",
        "What they're remembering isn't what actually happened.",
        "The person on the other end of the phone isn't who we think.",
        "They're practicing for a moment that already passed.",
        "The letter isn't for who we assumed.",
        "Everything we've seen is a rehearsal.",
        "They knew the ending before they started.",
        "The silence isn't uncomfortable—it's agreed upon.",
        "They're returning to fix a mistake they made years ago.",
        "The other person has been waiting for them to figure it out.",
        "What seems like a first meeting is actually a last one.",
        "They don't actually want to succeed.",
        "The message was never meant to be sent.",
        "The stranger isn't a stranger at all.",
        "They've been talking to themselves the entire time.",
        "The routine we're watching is their way of coping.",
        "Everything changes when the camera moves slightly.",
        "They already know what they'll find.",
        "This is the last time they'll do this.",
        "The person they're angry at is themselves.",
        "The reason for the meeting isn't the real reason for the meeting.",
        "They're being watched, and they know it.",
        "The kindness is strategic.",
        "What looks like weakness is actually strength.",
        "The obstacle isn't external—it's internal.",
        "They could leave at any moment, but they choose to stay.",
        "The other person figured it out first.",
        "The happy ending isn't what they actually wanted.",
        "The moment we're watching is the moment everything changed.",
        "They're not avoiding the truth—they're protecting someone from it.",
        "The thing they're hiding is obvious to everyone but them.",
        "This isn't the beginning—it's the middle.",
        "The real story is what we don't see."
    ].map(normalizeIdeaEntry),

    // ============================================
    // PLACES - Low-budget filming locations
    // ============================================
    places: [
        "Laundromat at closing time",
        "Parking garage stairwell",
        "Bus stop in the rain",
        "24-hour diner booth",
        "Empty playground after dark",
        "Hospital waiting room",
        "Elevator between floors",
        "Grocery store checkout line",
        "Hotel hallway",
        "Public library study room",
        "Gas station at 2 AM",
        "Park bench near a fountain",
        "Office break room",
        "Apartment building lobby",
        "Thrift store dressing room",
        "Subway platform between trains",
        "Motel room",
        "Rooftop with city lights",
        "Car wash tunnel",
        "Empty movie theater",
        "Coin-operated laundry",
        "Convenience store aisle",
        "Restaurant kitchen after hours",
        "Church pew",
        "Storage unit",
        "Bowling alley shoe counter",
        "Community center hallway",
        "Pharmacy waiting area",
        "School hallway on a weekend",
        "Barbershop chair",
        "Fire escape landing",
        "Abandoned storefront",
        "Dentist waiting room",
        "Food court late night",
        "ATM vestibule",
        "Car parked in a driveway",
        "Public bathroom",
        "Post office counter",
        "Funeral home parlor",
        "Used bookstore back aisle",
        "Coffee shop patio",
        "Airport gate at boarding time",
        "Bail bonds office",
        "Dry cleaner counter",
        "Tattoo shop waiting area",
        "Unemployment office",
        "Blood donation chair",
        "DMV plastic seats",
        "Pet store aquarium aisle",
        "Vintage clothing store mirror",
        "Stairwell landing",
        "Basement storage room",
        "Backyard patio at dusk",
        "Garage with door half-open",
        "Kitchen table set for one",
        "Porch swing",
        "Corner of a gym",
        "Bowling alley lane",
        "Record store listening booth",
        "Dance studio mirror wall"
    ],

    // ============================================
    // OBJECTS - Items to incorporate into the story
    // ============================================
    objects: [
        "A set of keys that don't unlock anything anymore",
        "An old receipt with a phone number on the back",
        "A birthday card never sent",
        "A broken watch that still gets wound",
        "A half-finished crossword puzzle",
        "A single earring",
        "An expired lottery ticket",
        "A dog collar with no dog",
        "A disposable camera with three shots left",
        "A handwritten recipe",
        "A cassette tape with no label",
        "A child's drawing hung with adult precision",
        "A business card with a name crossed out",
        "A coffee mug from somewhere far away",
        "A pill organizer with one day still full",
        "A voicemail that was never deleted",
        "A map with a route drawn in marker",
        "A pair of shoes by the door, gathering dust",
        "A sticky note that says 'I'm sorry'",
        "A book with a pressed flower inside",
        "A concert ticket stub",
        "A fortune cookie fortune, laminated",
        "A faded photograph in a wallet",
        "An envelope that was opened and resealed",
        "A USB drive no one has looked at in years",
        "A newspaper clipping, folded and worn",
        "A ring in a coat pocket",
        "A hotel key card from years ago",
        "A plant that someone is trying to keep alive",
        "A coffee maker that still brews for two",
        "A message in a bottle of hand lotion",
        "A notebook with the same sentence on every page",
        "A scarf that doesn't belong to anyone here",
        "An answering machine no one has updated",
        "A poster of somewhere they never went",
        "A book borrowed and never returned",
        "A matchbook from a restaurant that closed",
        "A mix CD with no track list",
        "A packed lunch that wasn't eaten",
        "A child's toy in an adult's car",
        "A postcard addressed but never mailed",
        "A keychain with too many keys",
        "A blanket folded too neatly",
        "A phone charger in an empty room",
        "A calendar with nothing marked",
        "A bottle of perfume almost empty",
        "A puzzle with one piece missing",
        "A trophy on a dusty shelf",
        "A name tag from a job long gone",
        "A gift bag with tissue paper still inside",
        "An umbrella left behind",
        "A pair of reading glasses on a Bible",
        "A photo face-down in a drawer",
        "A worn paperback with notes in the margins",
        "A candle burned down to nothing",
        "A tin of mints that holds something else",
        "A remote control with taped batteries",
        "A coat that fits no one in the house",
        "A stack of unsent letters tied with string",
        "A wedding invitation on a refrigerator"
    ],

    // ============================================
    // CHARACTERS - Archetypes and traits
    // ============================================
    characters: [
        "Someone who always arrives five minutes early",
        "A person who only lies about small things",
        "Someone who hasn't cried in years—until today",
        "A person who speaks to strangers but not to family",
        "Someone who keeps every voicemail",
        "A person who never takes photos of themselves",
        "Someone who always sits with their back to the wall",
        "A person who remembers every insult, but never mentions them",
        "Someone who laughs when they're nervous",
        "A person who has rehearsed this moment a hundred times",
        "Someone who was told they'd never amount to anything",
        "A person who hasn't been home in years",
        "Someone who still believes in second chances",
        "A person who reads the endings of books first",
        "Someone who keeps a secret they promised to tell",
        "A person who speaks softer when they're angry",
        "Someone who apologizes too much",
        "A person who trusts too easily—or not at all",
        "Someone who writes letters they never send",
        "A person who always knows when they're being lied to",
        "Someone who lost everything and rebuilt quietly",
        "A person who cares what strangers think but not what friends think",
        "Someone who avoids mirrors",
        "A person who stays too long at every goodbye",
        "Someone who learned the wrong lesson from a past experience",
        "A person who has never told anyone the real story",
        "Someone who is exactly like their parent, despite swearing not to be",
        "A person who is always the last to leave a party",
        "Someone who still keeps a promise no one remembers",
        "A person who treats everyone kindly except themselves",
        "Someone who makes others feel seen for the first time",
        "A person who changes who they are depending on who's watching",
        "Someone who always chooses the harder path",
        "A person who sees the worst in people—and is usually right",
        "Someone who talks to fill the silence",
        "A person who has never asked for help",
        "Someone who makes jokes when things get serious",
        "A person who is generous to a fault",
        "Someone who keeps grudges in a journal",
        "A person who walks away from every fight—but remembers every word"
    ],

    // ============================================
    // GENRES
    // ============================================
    genres: [
        "Drama",
        "Comedy",
        "Thriller",
        "Horror",
        "Sci-fi",
        "Slice-of-life",
        "Mystery",
        "Romance",
        "Dark comedy",
        "Psychological drama",
        "Magical realism",
        "Neo-noir",
        "Coming-of-age",
        "Mockumentary",
        "Absurdist"
    ],

    // ============================================
    // VISUAL STYLES
    // ============================================
    visualStyles: [
        "Little to no dialogue",
        "Single continuous shot",
        "Found footage aesthetic",
        "POV only",
        "No close-ups",
        "Handheld and intimate",
        "Static wide shots",
        "Entirely in silhouette",
        "Split screen throughout",
        "Match cuts connect scenes",
        "Shot through windows/doorways",
        "Available light only",
        "Shallow depth of field",
        "High contrast black and white",
        "Long takes with no cuts"
    ],

    // ============================================
    // EMOTIONAL TARGETS
    // ============================================
    emotions: [
        "Unease",
        "Humor",
        "Regret",
        "Warmth",
        "Irony",
        "Tension",
        "Melancholy",
        "Hope",
        "Dread",
        "Nostalgia",
        "Relief",
        "Longing",
        "Quiet joy",
        "Bittersweet",
        "Uncertainty"
    ],

    // ============================================
    // BONUS CHALLENGES - Extra points
    // ============================================
    bonuses: [
        "Someone must be waiting for something that never comes",
        "A character must lie about their name",
        "The ending must recontextualize the opening",
        "One character knows something the other doesn't",
        "A phone must ring but never be answered",
        "The same line of dialogue must appear twice with different meaning",
        "A meal must be interrupted",
        "Someone must leave something behind",
        "Two characters must want the same thing but for different reasons",
        "The most important moment happens off-screen",
        "A mirror must play a significant role",
        "Someone must apologize for the wrong thing",
        "The climax must happen in silence",
        "A door must close at a pivotal moment",
        "Someone must change their mind—but not say it aloud",
        "A secret must be revealed through action, not words",
        "The same location must feel different the second time we see it",
        "Someone must be holding back tears",
        "A minor character must know the truth before the main character",
        "The last shot must be a callback to the first",
        "Someone must pretend they didn't hear something",
        "A character must do something kind for the wrong reasons",
        "Two people must have completely different interpretations of the same event",
        "Someone must arrive at a realization too late",
        "The protagonist must lose something they didn't know they needed",
        "A prop established early must become essential later",
        "Someone must refuse to say goodbye",
        "A character must make a decision without all the information",
        "The weather must reflect or contrast the emotional tone",
        "Someone must be overheard saying something they shouldn't"
    ]
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ideasData;
}
