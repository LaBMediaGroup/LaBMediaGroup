// Ideas Generator Data
// Short film prompts, locations, objects, and characters for filmmakers

const defaultIdeaTags = () => ({
    tone: ['neutral'],
    cast: [],
    budget: [],
    accessible: undefined
});

const normalizeIdeaEntry = (entry) => {
    if (typeof entry === 'string') {
        return { text: entry, tags: defaultIdeaTags() };
    }
    const tags = entry.tags || {};
    const tone = Array.isArray(tags.tone) && tags.tone.length ? tags.tone : ['neutral'];
    const cast = Array.isArray(tags.cast) ? tags.cast : [];
    const budget = Array.isArray(tags.budget) ? tags.budget : [];
    const accessible = typeof tags.accessible === 'boolean' ? tags.accessible : undefined;
    const normalized = {
        ...entry,
        tags: {
            tone,
            cast,
            budget,
            accessible
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
        "A child asks a parent a question they can't answer honestly.",
        {
            text: "A person returns a borrowed item to someone who insists they’ve never met.",
            tags: { tone: ['neutral', 'dark'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Someone keeps getting ‘wrong number’ calls from the same voice, asking for them by name.",
            tags: { tone: ['dark', 'horror'], cast: ['solo', 'two'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "A barista recognizes a customer from a dream they had last night—and can prove it.",
            tags: { tone: ['neutral', 'dark'], cast: ['two'], budget: ['micro'], intensity: 3 }
        },
        {
            text: "Two people share a quiet table. Their phones buzz at the exact same time: ‘Don’t look up.’",
            tags: { tone: ['dark', 'horror'], cast: ['two'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "A person tries to record a simple apology video. Every take is interrupted by something off-screen that gets closer.",
            tags: { tone: ['horror', 'dark'], cast: ['solo'], budget: ['micro'], intensity: 5 }
        },
        {
            text: "A person is interviewed for a job they definitely didn’t apply for. The interviewer knows intimate details anyway.",
            tags: { tone: ['dark', 'horror'], cast: ['two'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "Someone finds a lost pet flyer… featuring a photo of their own face.",
            tags: { tone: ['dark', 'horror'], cast: ['solo'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "A couple practices a breakup in the mirror like choreography. One of them keeps changing the script.",
            tags: { tone: ['neutral', 'dark'], cast: ['two'], budget: ['micro'], intensity: 3 }
        },
        {
            text: "A person arrives early to a support group and realizes the meeting is for something they secretly are.",
            tags: { tone: ['dark', 'horror'], cast: ['ensemble'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "A rideshare driver picks up the same passenger twice in one night—same clothes, same seat, different story.",
            tags: { tone: ['dark', 'horror'], cast: ['two'], budget: ['micro'], intensity: 4 }
        },
        {
            text: "Two strangers discover they’ve been rehearsing the same difficult conversation—for different people.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person records a goodbye message, then realizes they don’t remember who it’s for.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 3 }
        },
        {
            text: "Someone waits at the wrong location for an event that already ended—and starts meeting others who missed it too.",
            tags: { tone: ['comedy'], cast: ['ensemble'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "A barista notices two customers using the café as a rehearsal space for different versions of themselves.",
            tags: { tone: ['neutral'], cast: ['ensemble'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "A person practices telling a joke that once ruined a relationship.",
            tags: { tone: ['comedy'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Two people share a ride and slowly realize they’re both lying about where they’re going.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person finds a handwritten note in a book they donated years ago—addressed to them now.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Someone agrees to help a stranger move, only to realize the apartment is already empty.",
            tags: { tone: ['comedy'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Two siblings compete over who remembers a shared childhood event correctly.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person keeps bumping into the same stranger who claims they’ve already had this conversation.",
            tags: { tone: ['dark'], cast: ['two'], budget: ['micro'], intensity: 3 }
        },
        {
            text: "A musician plays the same song for different people, changing it slightly each time.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "A person agrees to dogsit but the dog refuses to acknowledge them at all.",
            tags: { tone: ['comedy'], cast: ['solo'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "Two strangers realize they are both pretending to be someone else for the same reason.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person receives a thank-you card for something they don’t remember doing.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Someone tries to quietly quit a volunteer role that no one realizes they’ve been carrying alone.",
            tags: { tone: ['neutral'], cast: ['ensemble'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person returns to a place they associate with confidence and finds it unchanged—except for them.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Two people argue politely in public about something deeply personal.",
            tags: { tone: ['comedy'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person agrees to teach someone a skill they themselves have just learned.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "Someone discovers their routine has been quietly adopted by a stranger.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "A person practices being honest and finds it’s much harder than lying.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Two people share an awkward task neither wants to admit they don’t know how to do.",
            tags: { tone: ['comedy'], cast: ['two'], budget: ['micro'], intensity: 1 }
        },
        {
            text: "A person tries to recreate a moment they remember as perfect.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 3 }
        },
        {
            text: "Someone keeps delaying a small decision until it becomes a big one.",
            tags: { tone: ['neutral'], cast: ['solo'], budget: ['micro'], intensity: 2 }
        },
        {
            text: "Two strangers share a quiet win and don’t exchange names.",
            tags: { tone: ['neutral'], cast: ['two'], budget: ['micro'], intensity: 1 }
        }
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
        { text: "The action takes place in complete silence until the final moment", type: "audio" },
        {
            text: "The story unfolds during a single shared task",
            type: "structure",
            tags: { tone: ['neutral'] }
        },
        {
            text: "The protagonist must change their mind twice",
            type: "storytelling",
            tags: { tone: ['neutral'] }
        },
        {
            text: "We never hear the most important line of dialogue",
            type: "dialogue",
            tags: { tone: ['neutral'] }
        },
        {
            text: "Every scene must include an interruption",
            type: "pacing",
            tags: { tone: ['comedy'] }
        },
        {
            text: "Only one character is allowed to move at a time",
            type: "visual",
            tags: { tone: ['neutral'] }
        },
        {
            text: "The film must begin and end with the same action",
            type: "structure",
            tags: { tone: ['neutral'] }
        },
        {
            text: "All conflict is expressed through behavior, not dialogue",
            type: "storytelling",
            tags: { tone: ['neutral'] }
        },
        {
            text: "We only hear one side of every conversation",
            type: "audio",
            tags: { tone: ['neutral'] }
        },
        {
            text: "The protagonist must teach something incorrectly at first",
            type: "storytelling",
            tags: { tone: ['comedy'] }
        },
        {
            text: "The camera never enters the main space—it observes from outside",
            type: "visual",
            tags: { tone: ['neutral'] }
        },
        {
            text: "A recurring sound gains new meaning by the end",
            type: "audio",
            tags: { tone: ['neutral'] }
        },
        {
            text: "Every scene must reveal a small mistake",
            type: "storytelling",
            tags: { tone: ['comedy'] }
        },
        {
            text: "The story must work without subtitles or dialogue",
            type: "audio",
            tags: { tone: ['neutral'] }
        },
        {
            text: "We never see the resolution—only the choice",
            type: "structure",
            tags: { tone: ['neutral'] }
        },
        {
            text: "The protagonist must attempt something they’re bad at",
            type: "character",
            tags: { tone: ['comedy'] }
        }
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
        "Dance studio mirror wall",
        {
            text: "Community college hallway",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Public library book return area",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Local print shop counter",
            tags: { tone: ['comedy'], budget: ['micro'] }
        },
        {
            text: "Basement laundry room",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Ice cream shop in winter",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Town hall meeting room",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Empty dog park",
            tags: { tone: ['comedy'], budget: ['micro'] }
        },
        {
            text: "Apartment mailroom",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Community theater lobby",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Parking garage rooftop",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Record store listening station",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Church basement after an event",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Bike repair shop",
            tags: { tone: ['comedy'], budget: ['micro'] }
        },
        {
            text: "Public pool bleachers",
            tags: { tone: ['neutral'], budget: ['micro'] }
        },
        {
            text: "Closed roller rink",
            tags: { tone: ['neutral'], budget: ['micro'] }
        }
    ].map(normalizeIdeaEntry),

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
    ].map(normalizeIdeaEntry),

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
    ].map(normalizeIdeaEntry),

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
    ].map(normalizeIdeaEntry),

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
        "Long takes with no cuts",
        "Extreme close-ups only (hands, objects, details)",
        "Overhead shots only (top-down)",
        "Wide lens, very close distance (intimate distortion)",
        "Slow push-ins only (no other camera moves)",
        "Rack focus tells the story (focus reveals meaning)",
        "Foreground blocks the frame (shoot through clutter)",
        "One dominant color appears in every shot",
        "Neon/practicals only (signs, lamps, screens)",
        "Backlit haze/silhouette vibe (cheap fog/spray + backlight)",
        "Soft diffusion look (DIY: thin fabric/filters)",
        "Harsh fluorescent realism (no hiding it)",
        "Golden hour → blue hour transition is the arc",
        "One shot is in slow motion; everything else is normal",
        "Use negative space constantly (characters small in frame)",
        "Centered symmetry framing (Wes-ish, but make it yours)",
        "Off-center framing (characters pushed to the edge)",
        "Camera is always slightly too low (subtle unease)",
        "Camera is always slightly too high (quiet judgment)",
        "Only reflections and refractions for key moments (glass/water)",
        "Lens flare allowed—shoot into light on purpose",
        "Shadows do the acting (shadow-play emphasis)",
        "Static shots, but blocking changes aggressively",
        "Handheld only when a character lies",
        "Dutch angles only at turning points",
        "Match on action for every cut",
        "Jump cuts are the rhythm (time stutters)",
        "Crossfades only (dream logic)",
        "Hard cuts only (no dissolves, no fades)",
        "Cutaways to objects replace reaction shots",
        "Hold on empty frames after characters exit",
        "Insert titles as “thought captions” (minimal text)",
        "Subtitles reveal what’s NOT being said (sparingly)",
        "Use one repeating composition three times (A/B/C structure)",
        "Frame within frames (doorways, mirrors, car windows) — but always",
        "One scene is a single locked-off wide take (the ‘stage’ scene)",
        "One scene is entirely shot from behind a character",
        "One scene is entirely shot from the POV of an object",
        "Background action matters more than foreground",
        "Intentional underexposure (dark, moody detail)",
        "Intentional overexposure (washed-out memory)",
        "Black-and-white BUT one object stays in color (selective)",
        "Aspect ratio shift at the twist (subtle but meaningful)",
        "Use a “motivated zoom” once (only once) for impact",
        "Every scene begins on a detail, then reveals context",
        "End every scene on an unresolved image (no button)"
    ].map(normalizeIdeaEntry),

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
        "Uncertainty",
        "Secondhand embarrassment",
        "Quiet panic",
        "Protective tenderness",
        "Reluctant gratitude",
        "Righteous anger",
        "Jealousy disguised as support",
        "Shame that won’t leave",
        "Defiance",
        "Powerlessness",
        "Vindication",
        "Disorientation",
        "Paranoia",
        "Restlessness",
        "Fleeting peace",
        "Loneliness in a crowd",
        "Unspoken affection",
        "Awkward intimacy",
        "Warm discomfort",
        "Hope against evidence",
        "Soft heartbreak",
        "Emotional whiplash",
        "Anticipation",
        "Suspicion",
        "Stubborn optimism",
        "Bitterness (earned, not edgy)",
        "Mercy",
        "Envy",
        "Wonder",
        "Awe",
        "Overwhelm",
        "Resignation",
        "Reconciliation",
        "Yearning for closure",
        "Safety (finally)",
        "Being seen",
        "Being misunderstood",
        "Craving control",
        "Losing control",
        "Catharsis",
        "Regret with teeth",
        "Nostalgia that hurts",
        "Dread in daylight",
        "Joy with a catch",
        "Acceptance",
        "Relief that feels wrong"
    ].map(normalizeIdeaEntry),

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
        "Someone must be overheard saying something they shouldn't",
        "A character practices a sentence… and never says it",
        "An apology is attempted three times; it never lands the same way",
        "A ‘small’ favor becomes the whole conflict",
        "Someone offers food or drink and gets refused (it matters)",
        "A character deletes a message instead of sending it",
        "A character sends a message… then immediately regrets it",
        "Show the same moment twice: once as remembered, once as true",
        "A background detail reveals the twist (no dialogue explains it)",
        "The last line is a lie we now understand",
        "The first line is a lie we only realize at the end",
        "A character laughs and it turns into something else",
        "A character tells the truth, but only through an object",
        "Someone returns something they were never asked to return",
        "A character is interrupted by something trivial at a crucial moment",
        "One character tries to leave; the other never stops them",
        "Someone says ‘I’m fine’ while doing the opposite",
        "A promise is made that cannot be kept",
        "A character gives someone directions to a place that doesn’t exist",
        "The most important thing is said while no one is listening",
        "A sound (buzz/hum/drip) becomes unbearable by the end",
        "Use a recurring sound cue to signal danger or desire",
        "One shot must be filmed from inside something (car trunk/fridge/cabinet)",
        "One scene must play entirely in a reflection",
        "A character is forced to repeat themselves, but changes one word",
        "Someone asks a question and gets an answer to a different question",
        "A character misreads the room—and doubles down",
        "Someone sees themselves in someone else (and hates it)",
        "The twist is revealed by what’s missing, not what’s present",
        "A character does the right thing for the wrong reason",
        "A character does the wrong thing for the right reason",
        "Two characters remember the same event completely differently",
        "A character hears their own voice (voicemail/video) and can’t handle it",
        "A character refuses to say a name (the name has power)",
        "A character finally says a name (and it breaks something open)",
        "A character gives a gift that’s actually a test",
        "A mundane object becomes a ‘totem’ that signals truth vs lie",
        "Someone pretends not to notice something obvious",
        "A character is late, but the reason is emotionally revealing",
        "The setting changes, but the blocking repeats (visual déjà vu)",
        "End on an action, not a reaction",
        "End on a reaction, not the action",
        "A character is forced to wait… and the waiting is the story",
        "A character chooses silence when words would ‘fix’ it",
        "Someone fixes something that wasn’t broken (and reveals themselves)",
        "A character wins… and looks devastated",
        "A character loses… and looks relieved",
        "One character tries to be kind and fails spectacularly",
        "Make the ‘villain’ do something genuinely caring",
        "Make the ‘hero’ do something quietly selfish",
        "A character gives advice they can’t follow",
        "Someone overhears a truth and treats it like a joke",
        "A character lies to protect someone who doesn’t want protecting",
        "Someone is forgiven too easily (and it feels suspicious)",
        "Someone is not forgiven at all (and it feels final)",
        "A character changes their mind mid-sentence",
        "The climax happens during a mundane task (laundry, dishes, sweeping)",
        "A character breaks a personal rule and no one notices but them",
        "A character keeps a personal rule and it costs them",
        "Reveal a secret without showing the secret (only the aftermath)",
        "Include one moment of sincere connection that gets ruined immediately",
        "A character tries to return to ‘normal’ and can’t",
        "The final shot is an object, not a person"
    ].map(normalizeIdeaEntry)
};

// =====================================================
// TAGGED ADDITIONS — Objects, Twists, Characters, Bonuses
// =====================================================
const objects_additions = [
    { text: "A laminated ‘employee of the month’ photo with the face cut out", tags: { tone: ["mystery", "dark", "neutral"], budget: ["micro"], intensity: 3 } },
    { text: "A motel Bible with a phone number written in the margins", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A bag of ice melting inside a backpack", tags: { tone: ["comedy", "thriller", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A key taped under a table", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A name badge with the wrong name worn proudly", tags: { tone: ["comedy", "slice-of-life"], budget: ["micro"], intensity: 1 } },
    { text: "A receipt for something they swear they never bought", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A Polaroid that develops into a different photo each time you look away", tags: { tone: ["experimental", "mystery", "horror"], budget: ["micro"], intensity: 4 } },
    { text: "A voicemail transcription full of words they never said", tags: { tone: ["mystery", "thriller", "neutral"], budget: ["micro"], intensity: 3 } },
    { text: "A cheap trophy engraved with a future date", tags: { tone: ["mystery", "dark", "neutral"], budget: ["micro"], intensity: 3 } },
    { text: "A folded-up eulogy in a coat pocket", tags: { tone: ["drama", "tender", "dark"], budget: ["micro"], intensity: 3 } },
    { text: "A lock with no key, already opened", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A burned CD labeled ‘DO NOT PLAY’", tags: { tone: ["horror", "thriller", "mystery"], budget: ["micro"], intensity: 4 } },
    { text: "A set of dice with one blank side", tags: { tone: ["absurd", "mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A tiny bottle of hand sanitizer refilled with something else", tags: { tone: ["comedy", "thriller", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A menu with one item circled in red ink", tags: { tone: ["mystery", "thriller"], budget: ["micro"], intensity: 3 } },
    { text: "A flashlight that only works when pointed at a person", tags: { tone: ["horror", "experimental", "thriller"], budget: ["micro"], intensity: 4 } },
    { text: "A disposable glove filled with air like a hand", tags: { tone: ["comedy", "horror", "absurd"], budget: ["micro"], intensity: 3 } },
    { text: "A souvenir magnet from a place they’ve never been", tags: { tone: ["mystery", "tender", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A book of matches that smells like a specific person", tags: { tone: ["romance", "tender", "mystery"], budget: ["micro"], intensity: 2 } },
    { text: "A broken phone that still receives notifications", tags: { tone: ["thriller", "mystery", "neutral"], budget: ["micro"], intensity: 3 } },
    { text: "A single earbud that plays someone else’s audio", tags: { tone: ["mystery", "thriller", "neutral"], budget: ["micro"], intensity: 3 } },
    { text: "A handwritten to-do list that includes ‘forgive them’", tags: { tone: ["tender", "drama"], budget: ["micro"], intensity: 2 } },
    { text: "A locket with nothing inside—yet it feels heavy", tags: { tone: ["tender", "mystery", "drama"], budget: ["micro"], intensity: 2 } },
    { text: "A parking pass that never expires", tags: { tone: ["absurd", "mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A printed screenshot of a text they never received", tags: { tone: ["mystery", "drama", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A house key on a ring labeled ‘NOT YOURS’", tags: { tone: ["mystery", "thriller"], budget: ["micro"], intensity: 3 } },
    { text: "A roll of quarters with one coin taped on the outside", tags: { tone: ["slice-of-life", "comedy"], budget: ["micro"], intensity: 1 } },
    { text: "A clipboard sign-in sheet of unfamiliar names… including theirs", tags: { tone: ["mystery", "thriller", "dark"], budget: ["micro"], intensity: 4 } },
    { text: "A thrifted jacket with something stitched into the lining", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A stress ball shaped like a heart, visibly punctured", tags: { tone: ["drama", "dark", "comedy"], budget: ["micro"], intensity: 2 } },
    { text: "A coffee punch card with one stamp left—always one stamp left", tags: { tone: ["absurd", "comedy", "neutral"], budget: ["micro"], intensity: 1 } },
    { text: "A ring light used as a halo in a dark room", tags: { tone: ["experimental", "dark", "comedy"], budget: ["micro"], intensity: 2 } },
    { text: "A tiny screwdriver set missing the exact bit you need", tags: { tone: ["comedy", "slice-of-life"], budget: ["micro"], intensity: 1 } },
    { text: "A journal with the last page torn out cleanly", tags: { tone: ["mystery", "drama"], budget: ["micro"], intensity: 2 } },
    { text: "A self-help book full of angry underlines", tags: { tone: ["comedy", "drama", "dark"], budget: ["micro"], intensity: 2 } },
    { text: "A snow globe with no water inside", tags: { tone: ["tender", "melancholy", "neutral"], budget: ["micro"], intensity: 1 } },
    { text: "A security tag still attached to clothing", tags: { tone: ["thriller", "comedy", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A library card with someone else’s photo", tags: { tone: ["mystery", "neutral"], budget: ["micro"], intensity: 2 } },
    { text: "A ticket number that keeps being called… for other people", tags: { tone: ["absurd", "mystery", "dark"], budget: ["micro"], intensity: 3 } }
];

const twists_additions = [
    { text: "They aren’t waiting for a person—they’re waiting for permission.", tags: { tone: ["drama", "tender", "neutral"], intensity: 2 } },
    { text: "The ‘helpful’ stranger is actually stalling to prevent a mistake.", tags: { tone: ["thriller", "mystery", "neutral"], intensity: 3 } },
    { text: "The apology is real—but it’s being used as leverage.", tags: { tone: ["drama", "dark", "thriller"], intensity: 3 } },
    { text: "The object is evidence, but of a kindness—not a crime.", tags: { tone: ["tender", "mystery"], intensity: 2 } },
    { text: "The lie wasn’t to deceive them—it was to protect the truth from being spoken aloud.", tags: { tone: ["drama", "tender"], intensity: 2 } },
    { text: "What we assumed was awkwardness is actually a rehearsed strategy.", tags: { tone: ["comedy", "thriller", "neutral"], intensity: 2 } },
    { text: "The conversation is happening in two different timeframes.", tags: { tone: ["experimental", "mystery"], intensity: 3 } },
    { text: "They get what they want and realize it proves the other person right.", tags: { tone: ["drama", "dark"], intensity: 3 } },
    { text: "The ‘villain’ is the only person telling the truth.", tags: { tone: ["thriller", "mystery", "dark"], intensity: 3 } },
    { text: "The most honest line was played as a joke—and now it can’t be taken back.", tags: { tone: ["comedy", "drama"], intensity: 2 } },
    { text: "They’re not trapped in the location—they’re trapped in the role they’re performing.", tags: { tone: ["drama", "experimental", "neutral"], intensity: 3 } },
    { text: "The rules keep changing because someone off-screen is negotiating them.", tags: { tone: ["thriller", "mystery"], intensity: 3 } },
    { text: "They aren’t trying to win—they’re trying to be witnessed losing.", tags: { tone: ["drama", "dark"], intensity: 3 } },
    { text: "The ‘solution’ happens early; the rest is the cost.", tags: { tone: ["thriller", "drama"], intensity: 3 } },
    { text: "They didn’t forget—they decided not to remember.", tags: { tone: ["drama", "dark", "mystery"], intensity: 3 } },
    { text: "The stranger knows their routine because they helped invent it.", tags: { tone: ["mystery", "thriller"], intensity: 3 } },
    { text: "The silence isn’t absence—it’s a shared agreement.", tags: { tone: ["tender", "mystery", "neutral"], intensity: 2 } },
    { text: "They realize they’ve been the anonymous voice in someone else’s story.", tags: { tone: ["drama", "tender", "mystery"], intensity: 3 } },
    { text: "The message is real—but it was sent years ago and just arrived.", tags: { tone: ["mystery", "drama"], intensity: 2 } },
    { text: "They accidentally become the ‘sign’ they were waiting for.", tags: { tone: ["tender", "slice-of-life", "neutral"], intensity: 2 } },
    { text: "The beginning was already an ending; we just didn’t have the context.", tags: { tone: ["drama", "mystery"], intensity: 2 } },
    { text: "The ‘romantic’ gesture is revealed to be a coping mechanism.", tags: { tone: ["romance", "drama", "dark"], intensity: 3 } },
    { text: "The person who ‘doesn’t know’ has known the longest.", tags: { tone: ["drama", "tender"], intensity: 2 } },
    { text: "The threat is real, but it’s coming from an act of love.", tags: { tone: ["thriller", "tender"], intensity: 3 } },
    { text: "The location was public the whole time; privacy was an illusion.", tags: { tone: ["dark", "thriller", "experimental"], intensity: 4 } },
    { text: "They’ve been mispronouncing a name on purpose—to keep distance.", tags: { tone: ["drama", "tender"], intensity: 2 } },
    { text: "The ‘kindness’ is strategic—and it works.", tags: { tone: ["thriller", "dark"], intensity: 3 } },
    { text: "A misunderstanding resolves… into something worse but truer.", tags: { tone: ["drama", "dark"], intensity: 3 } },
    { text: "The last shot reveals the person we trusted was editing the story.", tags: { tone: ["thriller", "mystery"], intensity: 3 } },
    { text: "The ‘happy ending’ is available—but they refuse it on principle.", tags: { tone: ["drama", "slice-of-life", "neutral"], intensity: 2 } }
];

const characters_additions = [
    { text: "Someone who treats every interaction like a negotiation", tags: { tone: ["comedy", "thriller", "neutral"], cast: ["solo", "two"], intensity: 2 } },
    { text: "A person who refuses to sit down until they get the truth", tags: { tone: ["thriller", "drama"], cast: ["solo", "two"], intensity: 3 } },
    { text: "Someone who’s always ‘on their way’ but never arrives", tags: { tone: ["comedy", "drama", "slice-of-life"], cast: ["solo"], intensity: 2 } },
    { text: "A person who laughs too loudly when they’re cornered", tags: { tone: ["comedy", "dark"], cast: ["solo", "two"], intensity: 2 } },
    { text: "Someone who collects rules because chaos scares them", tags: { tone: ["drama", "tender", "neutral"], cast: ["solo"], intensity: 2 } },
    { text: "A person who keeps souvenirs of moments they ruined", tags: { tone: ["drama", "dark"], cast: ["solo"], intensity: 3 } },
    { text: "Someone who is overly polite as a form of control", tags: { tone: ["thriller", "dark", "comedy"], cast: ["two"], intensity: 3 } },
    { text: "A person who can’t stop narrating their own choices", tags: { tone: ["comedy", "experimental"], cast: ["solo"], intensity: 2 } },
    { text: "Someone who speaks in advice they never follow", tags: { tone: ["comedy", "slice-of-life"], cast: ["solo"], intensity: 1 } },
    { text: "A person who makes everyone comfortable, then asks for something big", tags: { tone: ["thriller", "drama"], cast: ["two"], intensity: 3 } },
    { text: "Someone who keeps receipts like they’re evidence in court", tags: { tone: ["comedy", "mystery"], cast: ["solo", "two"], intensity: 2 } },
    { text: "A person who won’t say ‘sorry’ but will do everything else", tags: { tone: ["tender", "drama"], cast: ["solo", "two"], intensity: 2 } },
    { text: "Someone who insists they’re fine—and proves it aggressively", tags: { tone: ["comedy", "dark"], cast: ["solo"], intensity: 2 } },
    { text: "A person who is always waiting for a ‘sincere ‘sign’ to change", tags: { tone: ["tender", "slice-of-life"], cast: ["solo"], intensity: 1 } },
    { text: "Someone convinced they’re being punished—quietly", tags: { tone: ["dark", "drama"], cast: ["solo"], intensity: 3 } },
    { text: "A person who compliments people like they’re taking notes", tags: { tone: ["comedy", "thriller", "neutral"], cast: ["two"], intensity: 2 } },
    { text: "Someone who hides anger inside helpfulness", tags: { tone: ["drama", "dark"], cast: ["solo", "two"], intensity: 3 } },
    { text: "A person who believes the universe speaks in coincidences", tags: { tone: ["mystery", "tender", "neutral"], cast: ["solo"], intensity: 2 } },
    { text: "Someone who gives gifts that feel like obligations", tags: { tone: ["comedy", "dark", "drama"], cast: ["two"], intensity: 2 } },
    { text: "A person terrified of being misunderstood—and makes it worse", tags: { tone: ["comedy", "drama"], cast: ["solo"], intensity: 2 } },
    { text: "Someone who never deletes anything", tags: { tone: ["mystery", "thriller", "neutral"], cast: ["solo"], intensity: 2 } },
    { text: "A person who can’t stop smiling when the stakes rise", tags: { tone: ["dark", "comedy", "thriller"], cast: ["solo"], intensity: 3 } },
    { text: "Someone charming only when they’re lying", tags: { tone: ["thriller", "romance", "dark"], cast: ["two"], intensity: 3 } },
    { text: "A person who apologizes for other people’s behavior", tags: { tone: ["tender", "drama"], cast: ["solo", "two"], intensity: 2 } },
    { text: "Someone trying to outgrow their old self—angrily", tags: { tone: ["drama", "dark"], cast: ["solo"], intensity: 3 } },
    { text: "A person who acts like a side character in their own life", tags: { tone: ["drama", "tender"], cast: ["solo"], intensity: 2 } },
    { text: "Someone who refuses to be photographed", tags: { tone: ["mystery", "drama", "neutral"], cast: ["solo"], intensity: 2 } },
    { text: "A person practicing bravery in private", tags: { tone: ["tender", "drama"], cast: ["solo"], intensity: 2 } },
    { text: "Someone who asks questions like they’re testing you", tags: { tone: ["thriller", "comedy", "neutral"], cast: ["two"], intensity: 2 } },
    { text: "A person who can’t leave until they’ve ‘fixed’ the vibe", tags: { tone: ["comedy", "slice-of-life"], cast: ["solo", "two"], intensity: 1 } }
];

const bonuses_additions = [
    { text: "A character must misinterpret kindness as a threat", tags: { tone: ["thriller", "mystery", "dark"], intensity: 3 } },
    { text: "A prop must change owners three times", tags: { tone: ["neutral", "comedy", "mystery"], intensity: 2 } },
    { text: "Someone must overhear their own name said with disgust", tags: { tone: ["drama", "dark"], intensity: 3 } },
    { text: "The most intense moment must occur during a mundane task", tags: { tone: ["neutral", "thriller", "drama"], intensity: 2 } },
    { text: "A character must pretend not to recognize someone", tags: { tone: ["mystery", "drama", "romance"], intensity: 2 } },
    { text: "A lie must be corrected gently—too late", tags: { tone: ["drama", "tender"], intensity: 2 } },
    { text: "A character must refuse an easy exit", tags: { tone: ["drama", "thriller", "neutral"], intensity: 2 } },
    { text: "An object must be used in a way it was never intended", tags: { tone: ["comedy", "thriller", "neutral"], intensity: 2 } },
    { text: "Two characters must share a secret without saying it out loud", tags: { tone: ["tender", "mystery", "romance"], intensity: 2 } },
    { text: "Someone must be caught rehearsing", tags: { tone: ["comedy", "drama", "neutral"], intensity: 1 } },
    { text: "A background detail must become the main plot", tags: { tone: ["neutral", "mystery"], intensity: 2 } },
    { text: "A character must get exactly what they asked for—and hate it", tags: { tone: ["dark", "drama", "thriller"], intensity: 3 } },
    { text: "A misunderstanding must resolve into something worse but truer", tags: { tone: ["drama", "dark"], intensity: 3 } },
    { text: "A character must offer help they don’t mean", tags: { tone: ["comedy", "dark", "thriller"], intensity: 2 } },
    { text: "A joke must land, then haunt the rest of the film", tags: { tone: ["comedy", "dark"], intensity: 2 } },
    { text: "A character must make a promise they can’t keep within the runtime", tags: { tone: ["drama", "tender"], intensity: 2 } },
    { text: "Someone must leave a message they immediately regret", tags: { tone: ["drama", "mystery", "neutral"], intensity: 2 } },
    { text: "A character must break a personal rule on camera", tags: { tone: ["neutral", "thriller", "drama"], intensity: 2 } },
    { text: "A location must be revisited in a different emotional genre", tags: { tone: ["experimental", "neutral"], intensity: 2 } },
    { text: "The final moment must be silent but unmistakably decisive", tags: { tone: ["drama", "tender", "thriller"], intensity: 2 } },
    { text: "A character must be interrupted at the moment they become honest", tags: { tone: ["comedy", "drama"], intensity: 2 } },
    { text: "The ‘villain’ must do something genuinely kind", tags: { tone: ["tender", "thriller", "dark"], intensity: 2 } },
    { text: "A small sound must become unbearable by the end", tags: { tone: ["horror", "thriller", "experimental"], intensity: 4 } },
    { text: "Someone must walk away without turning around once", tags: { tone: ["neutral", "drama", "thriller"], intensity: 2 } },
    { text: "The last shot must prove someone was listening", tags: { tone: ["mystery", "thriller", "dark"], intensity: 3 } }
];

ideasData.objects = ideasData.objects.concat(objects_additions.map(normalizeIdeaEntry));
ideasData.twists = ideasData.twists.concat(twists_additions.map(normalizeIdeaEntry));
ideasData.characters = ideasData.characters.concat(characters_additions.map(normalizeIdeaEntry));
ideasData.bonuses = ideasData.bonuses.concat(bonuses_additions.map(normalizeIdeaEntry));

// =====================================================
// DROP-IN ROLL FUNCTION — filters + relaxes rules
// Works with either strings or {text, tags:{...}} objects.
// =====================================================
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const normalizeRollEntry = (entry) => normalizeIdeaEntry(entry);

const hasAnyTone = (item, toneWanted) => {
    const tones = item.tags?.tone ?? ['neutral'];
    return tones.includes(toneWanted) || tones.includes('neutral');
};

const matchesCast = (item, maxCast) => {
    if (!maxCast) return true;
    const castTags = item.tags?.cast;
    if (!castTags || castTags.length === 0) return true;
    const castMax = castTags.includes('ensemble') ? 3 : (castTags.includes('two') ? 2 : 1);
    return castMax <= maxCast;
};

const matchesBudget = (item, budgetWanted) => {
    if (!budgetWanted) return true;
    const budgets = item.tags?.budget;
    if (!budgets || budgets.length === 0) return true;
    return budgets.includes(budgetWanted);
};

const matchesAccessibility = (item, accessibleOnly) => {
    if (!accessibleOnly) return true;
    const acc = item.tags?.accessible;
    return acc === undefined ? true : acc === true;
};

/**
 * Filters with graceful relaxation:
 * 1) tone + other constraints
 * 2) tone relaxed to include neutral already (built-in), then:
 * 3) if too small, drop tone constraint
 * 4) if still too small, drop cast/budget/accessibility constraints in that order
 */
const filterWithRelaxation = (items, rules, minPool = 6) => {
    const base = items.map(normalizeRollEntry);

    const applyAll = (arr, r) => arr.filter((it) =>
        (!r.tone || hasAnyTone(it, r.tone)) &&
        matchesCast(it, r.maxCast) &&
        matchesBudget(it, r.budget) &&
        matchesAccessibility(it, r.accessibleOnly)
    );

    let pool = applyAll(base, rules);
    if (pool.length >= minPool) return pool;

    pool = applyAll(base, { ...rules, tone: null });
    if (pool.length >= minPool) return pool;

    pool = applyAll(base, { ...rules, tone: null, maxCast: null });
    if (pool.length >= minPool) return pool;

    pool = applyAll(base, { ...rules, tone: null, maxCast: null, budget: null });
    if (pool.length >= minPool) return pool;

    pool = base;
    return pool.length ? pool : [];
};

/**
 * Roll an idea bundle from your library.
 *
 * @param {object} library - your full data object, e.g. { concepts, constraints, twists, places, objects, characters, genres, visualStyles, emotions, bonuses }
 * @param {object} options
 * @param {string|null} options.tone - e.g. "comedy" | "horror" | "mystery" | "romance" | "slice-of-life" | "experimental" | null
 * @param {boolean} options.localMode - if true: maxCast=2, budget="micro", accessibleOnly=true
 * @param {number|null} options.maxCast - override; if localMode true and maxCast not provided => 2
 * @param {string|null} options.budget - override; if localMode true and budget not provided => "micro"
 * @returns rolled bundle with text + original objects
 */
const rollIdea = (library, options = {}) => {
    const {
        tone = null,
        localMode = false,
        maxCast = null,
        budget = null
    } = options;

    const rules = {
        tone,
        maxCast: localMode ? (maxCast ?? 2) : maxCast,
        budget: localMode ? (budget ?? 'micro') : budget,
        accessibleOnly: !!localMode
    };

    const rollFrom = (arr) => {
        const pool = filterWithRelaxation(arr ?? [], rules);
        return pool.length ? randPick(pool) : null;
    };

    const concept = rollFrom(library.concepts);
    const place = rollFrom(library.places);
    const object = rollFrom(library.objects);
    const character = rollFrom(library.characters);
    const constraint = rollFrom(library.constraints);
    const twist = rollFrom(library.twists);
    const bonus = rollFrom(library.bonuses);

    const softRules = { tone };
    const softRollFrom = (arr) => {
        const base = (arr ?? []).map(normalizeRollEntry);
        let pool = base.filter((it) => !softRules.tone || hasAnyTone(it, softRules.tone));
        if (pool.length < 6) pool = base;
        return pool.length ? randPick(pool) : null;
    };

    const genre = softRollFrom(library.genres);
    const visualStyle = softRollFrom(library.visualStyles);
    const emotion = softRollFrom(library.emotions);

    return {
        mode: localMode ? 'local-filmmaker' : 'standard',
        tone: tone ?? 'mixed',
        picks: { concept, place, object, character, constraint, twist, genre, visualStyle, emotion, bonus },
        text: {
            concept: concept?.text ?? '',
            place: place?.text ?? '',
            object: object?.text ?? '',
            character: character?.text ?? '',
            constraint: constraint?.text ?? '',
            twist: twist?.text ?? '',
            genre: genre?.text ?? (typeof genre === 'string' ? genre : ''),
            visualStyle: visualStyle?.text ?? '',
            emotion: emotion?.text ?? '',
            bonus: bonus?.text ?? ''
        }
    };
};

// Optional: a helper preset you can expose in UI
const LOCAL_FILMMAKER_PRESET = {
    localMode: true,
    maxCast: 2,
    budget: 'micro'
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ideasData;
    module.exports.rollIdea = rollIdea;
    module.exports.LOCAL_FILMMAKER_PRESET = LOCAL_FILMMAKER_PRESET;
}

if (typeof window !== 'undefined') {
    window.rollIdea = rollIdea;
    window.LOCAL_FILMMAKER_PRESET = LOCAL_FILMMAKER_PRESET;
}
