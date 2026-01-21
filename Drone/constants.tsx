
import { Product, ResourceLink, Part107Step } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'g3',
    name: 'DJI Goggles 3',
    description: 'High-definition digital FPV goggles with real-view PiP and ultra-low latency transmission.',
    link: 'https://amzn.to/4pTmOR3',
    category: 'goggles'
  },
  {
    id: 'gn3',
    name: 'DJI Goggles N3',
    description: 'Immersive digital FPV experience from DJI, designed for comfort and clarity.',
    link: 'https://amzn.to/4bcB2c8',
    category: 'goggles'
  },
  {
    id: 'rpocket',
    name: 'RadioMaster Pocket',
    description: 'Portable, powerful, and affordable. The perfect entry point for any FPV pilot.',
    link: 'https://www.amazon.com/RadioMaster-Pocket-Portable-Remote-Controller/dp/B0DF45P8B6?',
    category: 'radio',
    badge: 'Beginner Choice'
  },
  {
    id: 'rcboxer',
    name: 'RadioMaster Boxer Crush',
    description: 'High-performance ELRS radio with full-size gimbals and incredible range.',
    link: 'https://amzn.to/4jOt4Ig',
    category: 'radio'
  },
  {
    id: 'tx15',
    name: 'RadioMaster TX15 2.4GHz',
    description: 'A solid, versatile radio controller for standard drone connectivity.',
    link: 'https://amzn.to/4pUCGmm',
    category: 'radio'
  },
  {
    id: 'femto',
    name: 'BetaFPV Pavo Femto',
    description: 'Ultra-light brushless whoop. Note: Requires DJI O4 Air Unit for digital FPV.',
    link: 'https://betafpv.com/collections/betafpv-naked-camera-series/products/pavo-femto-brushless-whoop-quadcopter',
    category: 'drone',
    badge: 'Micro King'
  },
  {
    id: 'pavo20pro',
    name: 'BetaFPV Pavo 20 Pro',
    description: 'Cinewhoop for DJI O4 Air Unit. Pro-grade performance in a compact frame.',
    link: 'https://betafpv.com/collections/betafpv-naked-camera-series/products/pavo20-pro-brushless-whoop-quadcopter?variant=42022567477382',
    category: 'drone'
  },
  {
    id: 'pavo20pro2',
    name: 'BetaFPV Pavo 20 Pro II',
    description: 'Next-gen Pavo 20. Note: Requires DJI O4 Pro Unit for maximum imaging quality.',
    link: 'https://betafpv.com/collections/betafpv-naked-camera-series/products/pavo20-pro-ii-brushless-whoop-quadcopter',
    category: 'drone'
  },
  {
    id: 'qavs2',
    name: 'QAV-S 2 Sub-250 Bardwell SE',
    description: 'The definitive 3" DIY kit by Joshua Bardwell. Sub-250g weight. (Does not include O4 Pro Unit).',
    link: 'https://www.getfpv.com/beginner-diy-fpv-drone-kit-qav-s-2-sub-250-joshua-bardwell-se-3-hd-ready.html',
    category: 'drone',
    badge: 'LaB Pick - Power'
  }
];

export const CHANNELS: ResourceLink[] = [
  {
    name: 'Joshua Bardwell',
    description: 'The "Godfather" of FPV. Deep dives into gear, building, and troubleshooting.',
    url: 'https://www.youtube.com/@JoshuaBardwell',
    type: 'channel',
    isLaBPick: true
  },
  {
    name: 'DJI',
    description: 'Official channel for the industry-leading camera drone ecosystem.',
    url: 'https://www.dji.com/camera-drones',
    type: 'channel'
  },
  {
    name: 'BetaFPV',
    description: 'Masters of the micro drone. Great for compact systems and learning builds.',
    url: 'https://betafpv.com',
    type: 'channel'
  },
  {
    name: 'CAPTAIN DRONE',
    description: 'Comprehensive FPV tutorials, reviews, and high-quality flight content.',
    url: 'https://www.youtube.com/@CAPTAINDRONE798',
    type: 'channel'
  },
  {
    name: 'Mr Steele',
    description: 'Legendary FPV freestyle. The gold standard for cinematic movement.',
    url: 'https://www.youtube.com/@MrSteeleFPV',
    type: 'channel'
  },
  {
    name: 'BOTGRINDER',
    description: 'Aggressive freestyle, raw energy, and pure FPV inspiration.',
    url: 'https://www.youtube.com/@BOTGRINDER',
    type: 'channel'
  },
  {
    name: 'Mike Sytes (Part 107)',
    description: 'Walkthroughs and practical guidance for the Part 107 exam.',
    url: 'https://www.youtube.com/@mikesytes',
    type: 'channel'
  },
  {
    name: 'Mr. Migs Classroom',
    description: 'Structured classroom-style lessons covering everything in the Part 107.',
    url: 'https://www.youtube.com/@MrMigsClassroom',
    type: 'channel'
  }
];

export const SHOPS: ResourceLink[] = [
  { name: 'GetFPV', description: 'Major US retailer for all things FPV.', url: 'https://www.getfpv.com', type: 'shop' },
  { name: 'RaceDayQuads', description: 'Fast shipping and a massive inventory.', url: 'https://www.racedayquads.com', type: 'shop' },
  { name: 'Pyrodrone', description: 'Premium FPV components and parts.', url: 'https://pyrodrone.com', type: 'shop' },
  { name: 'BetaFPV', description: 'Direct from the micro drone specialists.', url: 'https://betafpv.com', type: 'shop' },
  { name: 'DJI Store', description: 'Official source for DJI drones and gear.', url: 'https://www.dji.com', type: 'shop' }
];

export const OFFICIAL_LINKS: ResourceLink[] = [
  { name: 'FAA Drone Certification', description: 'Official FAA path for Part 107.', url: 'https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot', type: 'official' },
  { name: 'FAA PSI Exams', description: 'Login and schedule your knowledge test.', url: 'https://faa.psiexams.com/faa/login', type: 'official' },
  { name: 'IACRA System', description: 'Official application for your certificate.', url: 'https://iacra.faa.gov/IACRA/Default.aspx', type: 'official' },
  { name: 'FAA Safety Course', description: 'TRUST and Recurrent training portal.', url: 'https://www.faasafety.gov/gslac/ALC/CourseLanding.aspx?cID=677', type: 'official' },
  { name: 'UAS ACS PDF', description: 'Airman Certification Standards (The Syllabus).', url: 'https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf', type: 'official' }
];

export const PART107_STEPS: Part107Step[] = [
  {
    title: 'Register on IACRA',
    description: 'Create an account on the Integrated Airman Certification and Rating Application to get your FAA Tracking Number (FTN).',
    iconName: 'User',
    links: [{ label: 'Go to IACRA', url: 'https://iacra.faa.gov/IACRA/Default.aspx' }]
  },
  {
    title: 'Study the ACS',
    description: 'Review the Airman Certification Standards to know exactly what concepts will be tested.',
    iconName: 'BookOpen',
    links: [{ label: 'Download ACS PDF', url: 'https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf' }]
  },
  {
    title: 'Prep with Experts',
    description: 'Master aviation weather, sectional charts, and laws. Choose a path that fits your budget.',
    iconName: 'GraduationCap',
    links: [
      { label: 'Free: Mr. Migs (YT)', url: 'https://www.youtube.com/@MrMigsClassroom' },
      { label: 'Free: Mike Sytes (YT)', url: 'https://www.youtube.com/@mikesytes' },
      { label: 'Paid: King Schools', url: 'https://kingschools.com/drone-pilot-license-test-prep-course' }
    ]
  },
  {
    title: 'Schedule PSI Test',
    description: 'Book your in-person knowledge exam at a certified testing center via the official portal.',
    iconName: 'CalendarCheck',
    links: [{ label: 'Schedule via PSI', url: 'https://faa.psiexams.com/faa/login' }]
  }
];
