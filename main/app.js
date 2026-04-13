// ============================================================
// THE CREATOR'S BULWARK — APP.JS
// Complete application logic with mock data & interactivity
// ============================================================

// ===== STATE =====
let currentPage = "landing";
let currentRole = "client";
// Supported RBAC roles: 'superadmin', 'admin', 'reviewer', 'client'
let isLoggedIn = true;
let sidebarCollapsed = false;
let selectedLoginRole = "client";
let currentWizardStep = 1;
let currentFormType = "";
let selectedSubmissionId = null;
let wizardData = {};
let notifOpen = false;
const ROLE_ALIASES = {
  superadmin: "superadmin",
  "Admin": "superadmin",
  admin: "superadmin",
  Admin: "superadmin",
  pitbi_admin: "superadmin",
  "PITBI Admin": "superadmin",
  reviewer: "reviewer",
  specialist: "reviewer",
  Reviewer: "reviewer",
  client: "client",
  Client: "client",
  user: "client",
  User: "client",
};

function normalizeRole(role) {
  return ROLE_ALIASES[role] || "client";
}
const mockNotifications = [
  {
    id: 1,
    icon: "fa-circle-check",
    color: "#22c55e",
    title: "PSU-PAT-2026-001 Approved",
    body: "Your patent application has been certified.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    icon: "fa-file-circle-plus",
    color: "#f59e0b",
    title: "Documents Requested",
    body: "Admin Garcia requests additional docs for PSU-COP-2026-002.",
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    icon: "fa-circle-info",
    color: "#3b82f6",
    title: "System Maintenance",
    body: "Scheduled maintenance on April 10, 2026 from 2–4 AM.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 4,
    icon: "fa-triangle-exclamation",
    color: "#ef4444",
    title: "Action Required: PSU-COP-2026-014",
    body: "Missing documents detected for Palawan Biodiversity Database.",
    time: "Just now",
    read: false,
  },
];

let announcements = [
  {
    id: 1,
    title: "New IP Filing Guidelines for 2026",
    content: "The PSU Intellectual Property Office has released updated guidelines for patent and copyright filings. Please review the new templates before submission.",
    date: "2026-04-10",
    category: "News",
    image: "images/psu_logo_main.png"
  },
  {
    id: 2,
    title: "Innovation Workshop: From Research to Patent",
    content: "Join our upcoming workshop on April 25th to learn how to transform your research findings into protectable intellectual property.",
    date: "2026-04-12",
    category: "Event",
    image: "images/partner_logo.png"
  },
  {
    id: 3,
    title: "System Maintenance Notice",
    content: "The Creator's Bulwark will undergo scheduled maintenance on April 20th, from 2:00 AM to 4:00 AM. Access may be intermittent during this time.",
    date: "2026-04-13",
    category: "Alert",
    image: "images/IPTTO-logo.jpg"
  }
];

// ===== MOCK DATA =====
let submissions = [
  {
    id: "PSU-PAT-2026-001",
    type: "Patent",
    title: "Bamboo-Based Water Filtration Device",
    applicant: "Maria Santos",
    department: "College of Engineering",
    email: "maria.santos@psu.edu.ph",
    contact: "09171234567",
    status: "Approved",
    date: "2026-01-15",
    description:
      "An innovative water filtration system using locally-sourced bamboo charcoal and natural minerals from Palawan.",
    field: "Environmental Engineering",
    dateConceived: "2025-08-10",
  },
  {
    id: "PSU-COP-2026-002",
    type: "Copyright",
    title: "PSU EcoLearn App",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Pending",
    date: "2026-02-20",
    description:
      "A mobile learning application focused on environmental science education for Palawan communities.",
    workType: "Software Application",
    dateCreated: "2025-11-05",
  },
  {
    id: "PSU-TM-2026-003",
    type: "Trademark",
    title: "AquaGuard Brand Mark",
    applicant: "Anna Reyes",
    department: "Research Office",
    email: "anna.reyes@psu.edu.ph",
    contact: "09191234567",
    status: "Under Review",
    date: "2026-02-28",
    description:
      "Brand identity for PSU's marine conservation research initiative.",
    markType: "Logo & Word",
    goods: "Research and educational services",
  },
  {
    id: "PSU-PAT-2026-004",
    type: "Patent",
    title: "Solar-Powered Rice Dryer",
    applicant: "Rodel Magtibay",
    department: "College of Agriculture",
    email: "rodel.magtibay@psu.edu.ph",
    contact: "09201234567",
    status: "Rejected",
    date: "2026-03-01",
    description:
      "A solar-powered mechanical dryer designed for small-scale rice farmers in Palawan.",
    field: "Agricultural Engineering",
    dateConceived: "2025-06-15",
  },
  {
    id: "PSU-COP-2026-005",
    type: "Copyright",
    title: "Heritage Palawan Cookbook",
    applicant: "Liza Manalo",
    department: "College of Arts",
    email: "liza.manalo@psu.edu.ph",
    contact: "09211234567",
    status: "Approved",
    date: "2026-01-10",
    description:
      "A comprehensive cookbook documenting traditional Palawan recipes and culinary heritage.",
    workType: "Literary Work",
    dateCreated: "2025-09-20",
  },
  {
    id: "PSU-TM-2026-006",
    type: "Trademark",
    title: "Palawan Honey Brand",
    applicant: "Dr. Elena Flores",
    department: "College of Agriculture",
    email: "elena.flores@psu.edu.ph",
    contact: "09221234567",
    status: "Pending",
    date: "2026-03-10",
    description:
      "Brand registration for organic honey products from PSU apiaries.",
    markType: "Word",
    goods: "Food products and agricultural goods",
  },
  {
    id: "PSU-COP-2026-007",
    type: "Copyright",
    title: "MarineTrack Research Software",
    applicant: "Dr. Ricardo Aquino",
    department: "College of Sciences",
    email: "ricardo.aquino@psu.edu.ph",
    contact: "09231234567",
    status: "Under Review",
    date: "2026-03-15",
    description:
      "Marine biodiversity tracking and data analysis software for underwater research.",
    workType: "Software Application",
    dateCreated: "2025-12-01",
  },
  {
    id: "PSU-PAT-2026-008",
    type: "Patent",
    title: "Coconut Shell Activated Carbon Filter",
    applicant: "Prof. Carlos Reyes",
    department: "College of Engineering",
    email: "carlos.reyes@psu.edu.ph",
    contact: "09241234567",
    status: "Pending",
    date: "2026-03-20",
    description:
      "Advanced activated carbon filter using coconut shell waste for industrial water purification.",
    field: "Chemical Engineering",
    dateConceived: "2025-10-25",
  },
  {
    id: "PSU-UM-2026-009",
    type: "Utility Model",
    title: "Compact Folding Hand Tractor",
    applicant: "Engr. Leo Hernandez",
    department: "College of Agriculture",
    email: "leo.hernandez@psu.edu.ph",
    contact: "09251234567",
    status: "Under Review",
    date: "2026-03-25",
    description:
      "A foldable hand tractor designed for easier transport in small-scale Palawan farms.",
    field: "Agri-Machinery",
  },
  {
    id: "PSU-ID-2026-010",
    type: "Industrial Design",
    title: "Tectonic Wave Furniture",
    applicant: "Alice Torres",
    department: "College of Arts",
    email: "alice.torres@psu.edu.ph",
    contact: "09261234567",
    status: "Awaiting Documents",
    date: "2026-03-28",
    description:
      "Modern modular furniture inspired by Palawan coastline structures.",
    designType: "Furniture Design",
  },
  {
    id: "PSU-PAT-2026-011",
    type: "Patent",
    title: "Solar-Powered Hydroponic System",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Under Review",
    date: "2026-04-05",
    description:
      "An automated hydroponic system optimized for urban farming in tropical climates using renewable energy.",
    field: "Agriculture Technology",
  },
  {
    id: "PSU-UM-2026-012",
    type: "Utility Model",
    title: "Modular Eco-Stove",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Pending",
    date: "2026-04-10",
    description:
      "A high-efficiency biomass stove with modular parts for easy maintenance and cleaner combustion.",
    field: "Renewable Energy",
  },
  {
    id: "PSU-TM-2026-013",
    type: "Trademark",
    title: "GreenGrowth Organic Fertilizer",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Approved",
    date: "2026-03-25",
    description:
      "Commercial brand for a sustainable organic fertilizer derived from local market waste.",
    markType: "Logo & Word",
  },
  {
    id: "PSU-COP-2026-014",
    type: "Copyright",
    title: "Palawan Biodiversity Database",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Awaiting Documents",
    date: "2026-04-12",
    description:
      "A comprehensive digital catalog of flora and fauna endemic to the Palawan region.",
    workType: "Database/Software",
  },
];

const marketplaceItems = [
  {
    id: 1,
    title: "Detector for Illicit Connections of Television Signals",
    fullTitle: "DETECTOR FOR ILLICIT CONNECTIONS OF TELEVISION SIGNALS",
    type: "Patent",
    inventor: "Engr. J. Santos",
    college: "College of Engineering",
    description:
      "Advanced system for identifying and tracking unauthorized television signal connections natively within distributed networks.",
    longDescription:
      "A wireless tool that can generate signal to Cable Television (CATV) distribution lines to detect or check if there are illegal cable connections.",
    features: [
      'The Republic Act 10515, also known as the "Anti-Cable Television and Cable Internet Tapping Act of 2013", stipulates that it is unlawful to intercept or receive signals without the authority of the concerned CATV Service Provider.',
      "Many offenders are still uncaught even if the law is already in place. Illegal tapping of CATV signal in the main distribution line is the most common method used by CATV thefts.",
      "Tracing illicit connections becomes very difficult for authorized technicians, especially when the cable connections are hidden. This tool automates the detection process.",
    ],
    businessPotential:
      "Illegal connections on CATV lines are rampant in the Philippines. One of the drawbacks is revenue loss to cable companies. The approximate amount of annual revenue loss is about 7 billion pesos or even more. This device helps cable companies penetrate the digital signal and stop violators.",
    contactPerson: "Engr. Aldrex Aviso",
    contactEmail: "aldrex.aviso@ipophil.gov.ph",
    year: 2026,
    icon: "fa-solid fa-satellite-dish",
    image: "images/solar_rice_dryer.png",
  },
  {
    id: 2,
    title: "Virtual Nutritionist Program Simulator",
    fullTitle: "VIRTUAL NUTRITIONIST PROGRAM SIMULATOR (VIRTUAL NUTRI)",
    type: "Patent",
    inventor: "Dr. A. Reyes",
    college: "College of Sciences",
    description:
      "Integrating a virtual nutritionist program to enhance automated body profiling and personalized diet mappings using AI.",
    longDescription:
      "An AI-driven simulation platform designed to provide real-time nutritional analysis and personalized dietary recommendations based on individual health metrics.",
    features: [
      "Automated Body Mass Index (BMI) profiling with predictive analysis.",
      "Integration with local food databases for culturally relevant diet mapping.",
      "Real-time adjustment of nutritional intake based on biometric feedback.",
    ],
    businessPotential:
      "High demand in the health and wellness sector, particularly for remote patient monitoring and personalized fitness coaching. The system can be licensed to clinics and gym chains.",
    contactPerson: "Dr. Angela Reyes",
    contactEmail: "angela.reyes@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-laptop-medical",
    image: "images/ecolearn_app.png",
  },
  {
    id: 3,
    title: "Malunggay Lumpia Wrapper",
    fullTitle: "Moringa Oleifera (MALUNGGAY) INFUSED LUMPIA WRAPPER",
    type: "Utility Model",
    inventor: "Prof. L. Manalo",
    college: "College of Arts",
    description:
      "A utility model concerning the formulation and optimal mass production of nutritious lumpia wrappers infused with Moringa oleifera.",
    longDescription:
      "A revolutionary food product that incorporates the nutritional benefits of Malunggay into a standard Filipino staple (Lumpia wrapper), enhancing vitamins and minerals without compromising texture.",
    features: [
      "High in Vitamin A and C due to concentrated moringa infusion.",
      "Optimized shelf-life through natural preservation techniques.",
      "Superior elasticity and strength compared to traditional flour wrappers.",
    ],
    businessPotential:
      "Targeting the healthy food market, which is seeing exponential growth in the Philippines. Can be packaged for both retail consumers and wholesale food establishments.",
    contactPerson: "Prof. Luisa Manalo",
    contactEmail: "luisa.manalo@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-leaf",
    image: "images/palawan_cookbook.png",
  },
  {
    id: 4,
    title: "Fish Eye Image-Based Formalin Detection",
    fullTitle: "RAPID SCAN: OPTIC-BASED FORMALIN DETECTION IN FRESH FISH",
    type: "Utility Model",
    inventor: "Engr. M. Chua",
    college: "College of Engineering",
    description:
      "A rapid hardware-software mechanism to detect formalin contamination in fresh fish strictly utilizing optic scanning of the fish eye.",
    longDescription:
      "A portable handheld device that uses advanced imaging to detect changes in the crystalline lens of the fish eye associated with formalin preservation.",
    features: [
      "Non-destructive testing — no need to slice or damage the sample.",
      "Instant result displaying Safe/Warning levels on a digital screen.",
      "Calibration for multiple fish species common in local wet markets.",
    ],
    businessPotential:
      "Essential for food safety inspectors and smart market consumers. Prevents the consumption of toxic chemicals in the fish supply chain.",
    contactPerson: "Engr. Michael Chua",
    contactEmail: "michael.chua@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-fish",
    image: "images/bamboo_filtration.png",
  },
  {
    id: 5,
    title: "Market Bagpack",
    fullTitle: "ERGONOMIC CONVERTIBLE PACK FOR MARKET VENDORS",
    type: "Industrial Design",
    inventor: "R. Magtibay",
    college: "College of Arts",
    description:
      "An ergonomic and convertible aesthetic design for a multipurpose backpack tailored specifically for local market vendors.",
    longDescription:
      "A modular bag system that converts from a heavy-duty backpack to a display stall or a lightweight hauler, optimized for the ergonomic needs of itinerant vendors.",
    features: [
      "Waterproof high-denier fabric resistant to wet-market environments.",
      "Hidden compartments for secure cash handling and receipts.",
      "Load-balancing straps that reduce spinal fatigue during 8-hour shifts.",
    ],
    businessPotential:
      "Can be manufactured as part of Livelihood development projects or sold directly to the large population of informal and formal vendors across Palawan.",
    contactPerson: "Mr. Roberto Magtibay",
    contactEmail: "roberto.magtibay@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-bag-shopping",
    image: "images/palawan_honey.png",
  },
  {
    id: 6,
    title: "Inflatable Outdoor Bed",
    fullTitle: "RAPID-DEPLOYMENT AERODYNAMIC LOUGE BED",
    type: "Industrial Design",
    inventor: "A. Torres",
    college: "College of Engineering",
    description:
      "A distinct, visually appealing structural layout for an ultra-durable and rapidly deploying inflatable outdoor bed.",
    longDescription:
      "An innovative outdoor furniture piece that uses ambient air pressure to inflate in under 30 seconds, designed for extreme durability in forest and beach conditions.",
    features: [
      "Ultra-lightweight ripstop nylon (same as parachute fabric).",
      "Dual locking mechanisms to prevent air leakage over night.",
      "Unique ergonomic curve that supports lumbar and neck regions.",
    ],
    businessPotential:
      "High potential in the tourism and camping industry, particularly for eco-adventure tour operators in Palawan.",
    contactPerson: "Ms. Andrea Torres",
    contactEmail: "andrea.torres@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-bed",
    image: "images/solar_rice_dryer.png",
  },
  {
    id: 7,
    title: "SARGATEK. Building Life.",
    fullTitle: "SARGATEK CORPORATE BRANDING IDENTITY",
    type: "Trademark",
    inventor: "Dr. P. Cruz",
    college: "College of Agriculture",
    description:
      "Official word-mark and brand logo registration for the Sargatek agricultural engineering cooperative.",
    longDescription:
      "Comprehensive visual identity system for Sargatek, focusing on its core mission of integrating sustainable agricultural engineering with modern construction.",
    features: [
      "Distinctive shield-and-stalk logo symbolizing growth and protection.",
      "Custom color palette (Navy/Silver) designed for corporate authority.",
      "Specific usage guidelines for both digital and print media.",
    ],
    businessPotential:
      "The trademark protects the intellectual capital of the cooperative, ensuring market differentiation as it expands its services across Mimaropa region.",
    contactPerson: "Dr. Pedro Cruz",
    contactEmail: "pedro.cruz@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-stamp",
    image: "images/partner_logo.png",
  },
  {
    id: 8,
    title: "ISUY FUDZ",
    fullTitle: "ISUY FUDZ HEALTH AND SUPPLEMENT BRAND",
    type: "Trademark",
    inventor: "M. Santos",
    college: "College of Sciences",
    description:
      "Distinct stylized design and brand identifier for locally produced food supplements under the ISUY framework.",
    longDescription:
      "A health-focused trademark that emphasizes the ethnic roots and natural sources of its supplement products.",
    features: [
      "Organic leaf iconography integrated into traditional tribal patterns.",
      "Dynamic brand identifier usable across multiple packaging formats.",
      "Phonetically unique name designed for easy brand recall.",
    ],
    businessPotential:
      "Protects the integrity of PSU-developed food supplements, allowing for commercial expansion and franchising without the risk of imitation.",
    contactPerson: "Mr. Mario Santos",
    contactEmail: "mario.santos@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-tag",
    image: "images/palawan_honey.png",
  },
  {
    id: 9,
    title: "Legal Office Procedures Manual",
    fullTitle: "PSU LEGAL OFFICE ADMINISTRATIVE PROCEDURES MANUAL",
    type: "Copyright",
    inventor: "Atty. J. dela Cruz",
    college: "College of Arts",
    description:
      "A comprehensive literary work outlining modernized legal office administrative procedures for academic institutions.",
    longDescription:
      "A formalized written manual that serves as the definitive guide for legal administration within Palawan State University.",
    features: [
      "Standardized document templates and workflow diagrams.",
      "Compliance frameworks for both institutional and national legal mandates.",
      "Case management protocols optimized for state university settings.",
    ],
    businessPotential:
      "Can be licensed to other State Universities and Colleges (SUCs) as a best-practice template for legal office management.",
    contactPerson: "Atty. Jose dela Cruz",
    contactEmail: "jose.delacruz@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-scale-balanced",
    image: "images/palawan_cookbook.png",
  },
  {
    id: 10,
    title: "Automated iPARC Software",
    fullTitle: "iPARC: INTEGRATED PERMIT AND REGISTRATION CLEARANCE SYSTEM",
    type: "Copyright",
    inventor: "IT Department",
    college: "College of Sciences",
    description:
      "Software code and system architecture blueprint for Information, Permit, Application, Registration, and Clearance framework.",
    longDescription:
      "A complex software solution that automates the entire lifecycle of student and faculty clearances and permit applications.",
    features: [
      "Encrypted digital signatures for multi-level approval cascading.",
      "Automated conflict checking for prerequisite document verification.",
      "Real-time status tracking for applicants via SMS and Email.",
    ],
    businessPotential:
      "Massive opportunity for Saas implementation within local government units and other higher education institutions looking to digitize their clearance workflows.",
    contactPerson: "ICT Department Head",
    contactEmail: "ict@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-computer",
    image: "images/marinetrack_software.png",
  },
  {
    id: 11,
    title: "Smart Irrigation Controller",
    fullTitle:
      "IOT-BASED ADAPTIVE SMART IRRIGATION CONTROLLER FOR SMALL-SCALE FARMS",
    type: "Patent",
    inventor: "Engr. R. Villanueva",
    college: "College of Agriculture",
    description:
      "An IoT-based irrigation controller that automatically adjusts watering schedules based on real-time soil moisture and weather data.",
    longDescription:
      "A low-cost, solar-powered smart irrigation system designed for small-scale Filipino farms. It reads soil moisture levels and cross-references live weather data to deliver precise water quantities, eliminating over-irrigation and drought stress.",
    features: [
      "Real-time soil moisture sensing using capacitive sensor arrays.",
      "Integration with local weather API for proactive scheduling adjustments.",
      "Remote control via SMS command for areas without internet connectivity.",
      "Solar-powered with 72-hour battery backup for uninterrupted operation.",
    ],
    businessPotential:
      "Targets the 5+ million small-scale farmers in the Philippines facing water scarcity. The device can reduce water usage by up to 40% while improving crop yields. High licensing potential with agricultural cooperatives and LGUs.",
    contactPerson: "Engr. Rodel Villanueva",
    contactEmail: "rodel.villanueva@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-seedling",
    image: "images/solar_rice_dryer.png",
  },
  {
    id: 12,
    title: "Biometric Student Attendance System",
    fullTitle: "MULTI-MODAL BIOMETRIC STUDENT ATTENDANCE AND MONITORING SYSTEM",
    type: "Patent",
    inventor: "Dr. C. Bonifacio",
    college: "College of Sciences",
    description:
      "A multi-modal biometric system combining fingerprint and face recognition to automate student attendance in academic institutions.",
    longDescription:
      "Eliminates manual attendance sheets by using dual-factor biometric verification. The system flags habitual absences, generates automated reports, and integrates with student information systems.",
    features: [
      "Dual-mode verification: fingerprint + face recognition for high accuracy.",
      "Automatic generation of attendance reports and parent notifications.",
      "Offline mode capability — syncs to cloud when connection is restored.",
      "Integration-ready with existing Student Information Systems (SIS).",
    ],
    businessPotential:
      "With over 2,000 higher education institutions in the Philippines, the licensing market is substantial. Can be expanded to government offices and corporate HR systems.",
    contactPerson: "Dr. Cynthia Bonifacio",
    contactEmail: "cynthia.bonifacio@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-fingerprint",
    image: "images/marinetrack_software.png",
  },
  {
    id: 13,
    title: "Banana Peel Organic Fertilizer",
    fullTitle:
      "FORMULATION OF HIGH-POTASSIUM ORGANIC FERTILIZER FROM BANANA PEEL EXTRACT",
    type: "Utility Model",
    inventor: "Prof. G. Aquino",
    college: "College of Agriculture",
    description:
      "A sustainable fertilizer formulation derived from banana peel extract, rich in potassium and micro-nutrients for vegetable crops.",
    longDescription:
      "A zero-waste innovation that converts banana peel — a common agricultural by-product — into a high-potassium liquid fertilizer proven to enhance vegetable growth and fruit quality.",
    features: [
      "Natural potassium concentration 3x higher than conventional fertilizers.",
      "Fully biodegradable with no chemical additives or preservatives.",
      "Cold-press extraction process operable at barangay level.",
      "Shelf-stable for up to 6 months without refrigeration.",
    ],
    businessPotential:
      "With Philippines producing over 9 million metric tons of bananas annually, the waste conversion opportunity is massive. Attractive to organic farming communities and sustainable agriculture NGOs.",
    contactPerson: "Prof. Gloria Aquino",
    contactEmail: "gloria.aquino@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-flask",
    image: "images/bamboo_filtration.png",
  },
  {
    id: 14,
    title: "Portable Solar Cooker Design",
    fullTitle: "PARABOLIC CONCENTRATOR PORTABLE SOLAR COOKING SYSTEM",
    type: "Utility Model",
    inventor: "Engr. A. de Guzman",
    college: "College of Engineering",
    description:
      "A foldable, high-efficiency parabolic solar cooker designed for community use in off-grid areas, capable of reaching cooking temperatures in 15 minutes.",
    longDescription:
      "Uses a parabolic mirror array to concentrate solar energy into a single focal point, achieving temperatures of 250°C sufficient for boiling, frying, and steaming — with zero fuel cost.",
    features: [
      "Foldable design packable into a 60cm x 40cm bag for portability.",
      "Aluminum composite reflectors with 92% solar reflectivity.",
      "Adjustable focal arm accommodating pots from 1L to 5L capacity.",
      "Reaches boiling point (100°C) in under 20 minutes on clear days.",
    ],
    businessPotential:
      "Addresses energy poverty for the estimated 15 million Filipinos without stable electricity. Strong demand from disaster relief agencies such as NDRRMC and international NGOs.",
    contactPerson: "Engr. Antonio de Guzman",
    contactEmail: "antonio.deguzman@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-sun",
    image: "images/solar_rice_dryer.png",
  },
  {
    id: 15,
    title: "Multipurpose Modular Furniture",
    fullTitle: "SNAP-LOCK MODULAR FURNITURE SYSTEM FOR SMALL-SPACE LIVING",
    type: "Industrial Design",
    inventor: "Des. M. Soriano",
    college: "College of Arts",
    description:
      "A snap-lock modular furniture system that transforms from a study desk to a dining table and shelving unit without any tools.",
    longDescription:
      "Designed for the modern urban micro-apartment, this furniture system uses an innovative dovetail snap-lock mechanism allowing reconfiguration in under 2 minutes. Crafted from sustainably sourced bamboo composite panels.",
    features: [
      "Tool-free assembly and disassembly using precision snap-lock joints.",
      "Bamboo composite panels — 40% lighter than wood, 3x stronger.",
      "Converts between 5 configurations: desk, table, shelving, bed frame, and storage unit.",
      "Flat-pack shipping reduces logistics cost by 60%.",
    ],
    businessPotential:
      "The Philippine urban furniture market is valued at ₱12 billion. Targets the growing Metro Manila condo and dormitory segment. Highly attractive for e-commerce platforms and IKEA-style local retailers.",
    contactPerson: "Des. Maria Soriano",
    contactEmail: "maria.soriano@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-couch",
    image: "images/palawan_honey.png",
  },
  {
    id: 16,
    title: "Eco-Coconut Husk Packaging",
    fullTitle:
      "BIODEGRADABLE PACKAGING MATERIAL FROM COMPRESSED COCONUT HUSK FIBER",
    type: "Industrial Design",
    inventor: "Engr. L. Bautista",
    college: "College of Sciences",
    description:
      "Sustainable packaging panels made from compressed coconut coir fiber — a fully biodegradable, water-resistant alternative to single-use plastic.",
    longDescription:
      "A heat-compressed molding process transforms raw coconut husk fiber into rigid, water-resistant packaging shells comparable in durability to conventional foam packaging.",
    features: [
      "Fully biodegradable in 90 days under standard composting conditions.",
      "Water-resistant coating from natural coconut wax — no plastic additives.",
      "Customizable mold shapes fitting product dimensions from 5cm to 60cm.",
      "Production waste is zero — all fiber off-cuts are reprocessed.",
    ],
    businessPotential:
      "Growing regulatory pressure against single-use plastics creates a massive market opening. The Philippines produces 15 billion coconuts per year — raw materials are abundantly available and cheap.",
    contactPerson: "Engr. Lourdes Bautista",
    contactEmail: "lourdes.bautista@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-box",
    image: "images/bamboo_filtration.png",
  },
  {
    id: 17,
    title: "PALAWAN PRIDE Brand Identity",
    fullTitle: "PALAWAN PRIDE — REGIONAL EXCELLENCE BRAND AND TRADEMARK",
    type: "Trademark",
    inventor: "PSU Design Team",
    college: "College of Arts",
    description:
      "A registered regional brand identity promoting authentic Palawan-made products and services to domestic and international markets.",
    longDescription:
      "A comprehensive brand system including wordmark, logo, color palette, and usage guidelines designed to certify and promote authentic products from Palawan province.",
    features: [
      "Stylized eagle motif referencing the Philippine Eagle — a Palawan icon.",
      "Bilingual brand name (English/Filipino) for broader market appeal.",
      "Usage guidelines covering product labels, tourism signage, and digital media.",
      "Certification program for authentic Palawan product producers.",
    ],
    businessPotential:
      'Protects the "Made in Palawan" brand value for a growing market of eco-tourists, organic consumers, and premium product buyers. Applicable to honey, coconut oil, cashew, seafood, and handicraft sectors.',
    contactPerson: "PSU IP Office",
    contactEmail: "ipoffice@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-star",
    image: "images/partner_logo.png",
  },
  {
    id: 18,
    title: "AGRI-SMART PSU Logo",
    fullTitle: "AGRI-SMART PSU — SMART AGRICULTURE DIVISION BRAND MARK",
    type: "Trademark",
    inventor: "ICT & Agriculture Dept.",
    college: "College of Agriculture",
    description:
      "Brand identity and trademark registration for PSU's Smart Agriculture innovation division, representing the convergence of technology and farming.",
    longDescription:
      "A modern brand mark combining circuit-board imagery with agricultural leaf elements, symbolizing the fusion of digital technology and sustainable farming that defines PSU's AgriTech research cluster.",
    features: [
      "Geometric leaf-circuit hybrid logo for instant recognition.",
      "Registered in English and Filipino variants for dual-market use.",
      "Color system: Emerald Green (agriculture) + Electric Blue (technology).",
      "Protected across 20 product and service classes under IPOPHL.",
    ],
    businessPotential:
      "Centralizes PSU's AgriTech branding under a single, protected identity. Enhances credibility for grant applications, industry partnerships, and technology licensing deals.",
    contactPerson: "AgriSmart Division",
    contactEmail: "agrismart@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-tractor",
    image: "images/partner_logo.png",
  },
  {
    id: 19,
    title: "Marine Biodiversity Field Guide",
    fullTitle:
      "GUIDE TO THE MARINE BIODIVERSITY OF PALAWAN: AN ILLUSTRATED FIELD REFERENCE",
    type: "Copyright",
    inventor: "Dr. F. Reyes & Team",
    college: "College of Sciences",
    description:
      "A comprehensive, illustrated field guide documenting over 400 marine species found in the waters of Palawan, authored by PSU marine biologists.",
    longDescription:
      "A rigorously peer-reviewed and beautifully illustrated reference guide for marine researchers, dive guides, conservationists, and ecotourists. Covers species identification, habitat notes, conservation status, and local ecological significance.",
    features: [
      "Full-colour scientific illustrations of 420+ documented marine species.",
      "Dive-friendly waterproof laminated quickguide companion booklet.",
      "QR codes linking each entry to live taxonomic databases and video footage.",
      "Contributions from 12 PSU marine biologist authors.",
    ],
    businessPotential:
      "High demand from ecotourism operators, DOST-funded conservation programs, and international research institutions studying Coral Triangle biodiversity. Digital e-book edition expandable for global academic licensing.",
    contactPerson: "Dr. Fatima Reyes",
    contactEmail: "fatima.reyes@psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-book-open",
    image: "images/marinetrack_software.png",
  },
  {
    id: 20,
    title: "Automated Faculty Workload Planner",
    fullTitle:
      "INTELLILOAD: AUTOMATED FACULTY WORKLOAD COMPUTATION AND SCHEDULING SYSTEM",
    type: "Copyright",
    inventor: "BSIT Capstone Group 2025",
    college: "College of Sciences",
    description:
      "An intelligent software system that automates faculty workload computation, scheduling conflict detection, and academic calendar generation.",
    longDescription:
      "Replaces spreadsheet-based workload computation with a rules-based engine that automatically calculates teaching units, administrative loads, and research credits per faculty member — producing instant DepEd/CHED-compliant workload reports.",
    features: [
      "Automatic conflict detection across 50+ concurrent class schedules.",
      "CHED-memorandum-compliant workload computation engine.",
      "Drag-and-drop schedule builder with real-time load indicators.",
      "Export to PDF, Excel, and CSV for official submission.",
    ],
    businessPotential:
      "Applicable to all 130+ State Universities and Colleges (SUCs) in the Philippines running manual workload systems. Clear SaaS subscription model with annual billing to registrar and HR offices.",
    contactPerson: "Capstone Adviser",
    contactEmail: "capstone@psu.edu.ph",
    year: 2025,
    icon: "fa-solid fa-calendar-check",
    image: "images/ecolearn_app.png",
  },
];

let systemUsers = [
  {
    id: 1,
    name: "Engr. Super User",
    email: "superadmin@psu.edu.ph",
    role: "superadmin",
    dept: "IT Office",
    status: "Active",
    dateCreated: "2025-06-01",
  },
  {
    id: 2,
    name: "Dir. Garcia",
    email: "director.garcia@psu.edu.ph",
    role: "superadmin",
    dept: "IP Office",
    status: "Active",
    dateCreated: "2025-07-15",
  },
  {
    id: 3,
    name: "Engr. Tech Reviewer",
    email: "reviewer@psu.edu.ph",
    role: "reviewer",
    dept: "Technical Review",
    status: "Active",
    dateCreated: "2025-08-01",
  },
  {
    id: 9,
    name: "Juan dela Cruz",
    email: "juan.delacruz@psu.edu.ph",
    role: "client",
    dept: "College of Sciences",
    status: "Active",
    dateCreated: "2025-12-01",
  },
  {
    id: 8,
    name: "Maria Santos",
    email: "maria.santos@psu.edu.ph",
    role: "client",
    dept: "College of Engineering",
    status: "Active",
    dateCreated: "2025-11-20",
  },
  {
    id: 10,
    name: "Anna Reyes",
    email: "anna.reyes@psu.edu.ph",
    role: "client",
    dept: "Research Office",
    status: "Active",
    dateCreated: "2025-12-05",
  },
];

const auditLogs = [
  {
    timestamp: "2026-03-27 14:32",
    user: "Admin Garcia",
    action: "Approved",
    module: "Patent",
    ip: "192.168.1.101",
    detail: "Approved PSU-PAT-2026-001",
  },
  {
    timestamp: "2026-03-27 13:15",
    user: "Maria Santos",
    action: "Submitted",
    module: "Patent",
    ip: "192.168.1.45",
    detail: "Submitted patent application",
  },
  {
    timestamp: "2026-03-26 16:45",
    user: "Admin Garcia",
    action: "Status Changed",
    module: "Trademark",
    ip: "192.168.1.101",
    detail: "Changed PSU-TM-2026-003 to Under Review",
  },
  {
    timestamp: "2026-03-26 10:20",
    user: "Juan dela Cruz",
    action: "Submitted",
    module: "Copyright",
    ip: "192.168.1.78",
    detail: "Submitted copyright registration",
  },
  {
    timestamp: "2026-03-25 09:00",
    user: "Admin Garcia",
    action: "Rejected",
    module: "Patent",
    ip: "192.168.1.101",
    detail: "Rejected PSU-PAT-2026-004 - Insufficient documentation",
  },
  {
    timestamp: "2026-03-24 15:30",
    user: "Anna Reyes",
    action: "Submitted",
    module: "Trademark",
    ip: "192.168.1.92",
    detail: "Submitted trademark application",
  },
  {
    timestamp: "2026-03-24 11:00",
    user: "Admin Garcia",
    action: "Exported",
    module: "Reports",
    ip: "192.168.1.101",
    detail: "Exported monthly submission report",
  },
  {
    timestamp: "2026-03-23 08:45",
    user: "Liza Manalo",
    action: "Submitted",
    module: "Copyright",
    ip: "192.168.1.55",
    detail: "Submitted copyright registration",
  },
  {
    timestamp: "2026-03-22 14:10",
    user: "Admin Garcia",
    action: "User Created",
    module: "Users",
    ip: "192.168.1.101",
    detail: "Created new user account",
  },
  {
    timestamp: "2026-03-21 09:30",
    user: "Dr. Ricardo Aquino",
    action: "Submitted",
    module: "Copyright",
    ip: "192.168.1.33",
    detail: "Submitted copyright registration",
  },
];

const ROLE_META = {
  superadmin: { label: "Super Admin", dashboard: "admin-dashboard" },
  admin: { label: "Admin", dashboard: "admin-dashboard" },
  reviewer: { label: "Reviewer", dashboard: "admin-dashboard" },
  client: { label: "Client", dashboard: "user-dashboard" },
};

const DASHBOARD_ACCESS = {
  superadmin: [
    "admin-dashboard",
    "admin-submissions",
    "admin-search",
    "submission-detail",
    "audit-log",
    "user-profile",
    "admin-records",
    "admin-users",
    "admin-settings",
    "role-permissions",
    "create-account",
    "project-blueprint",
    "admin-announcements",
  ],

  reviewer: [
    "admin-dashboard",
    "admin-submissions",
    "admin-search",
    "submission-detail",
    "user-profile",
    "project-blueprint",
  ],
  client: [
    "user-dashboard",
    "user-submissions",
    "submission-detail",
    "user-profile",
    "patent-form",
    "trademark-form",
    "copyright-form",
    "utility-form",
    "industrial-form",
    "faq-dash",
    "ip-tutorial",
    "project-blueprint",
  ],
};

const OPERATIONAL_AUDIT_MODULES = new Set([
  "Patent",
  "Trademark",
  "Copyright",
  "Utility Model",
  "Industrial Design",
  "Reports",
]);
const REVIEWER_ASSIGNMENTS = {
  "PSU-TM-2026-003": 3,
  "PSU-COP-2026-007": 3,
  "PSU-PAT-2026-008": 3,
  "PSU-UM-2026-009": 3,
};
const COPYRIGHT_CASE_OVERRIDES = {
  "PSU-COP-2026-002": {
    registrationLane: "Copyright",
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: false,
    officialReceiptNumber: "Pending cashier receipt",
    copyrightStage: "technical-review",
  },
  "PSU-COP-2026-005": {
    registrationLane: "ISBN",
    officialDutyWork: true,
    letterRequestApproved: true,
    paymentExempt: true,
    paymentVerified: true,
    officialReceiptNumber: "Fee-waived routing",
    certificateNumber: "NL-COR-2026-0105",
    copyrightStage: "certificate-released",
  },
  "PSU-COP-2026-007": {
    registrationLane: "Copyright",
    officialDutyWork: true,
    letterRequestApproved: true,
    paymentExempt: true,
    paymentVerified: true,
    officialReceiptNumber: "Fee-waived routing",
    copyrightStage: "ip-director-action",
  },
};

const IPOPHL_CASE_OVERRIDES = {
  "PSU-PAT-2026-001": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: true,
    officialReceiptNumber: "Official Receipt #2026-0115",
    ipophlStage: "certificate-released",
  },
  "PSU-TM-2026-003": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: true,
    officialReceiptNumber: "Official Receipt #2026-0228",
    ipophlStage: "ip-director-action",
  },
  "PSU-PAT-2026-004": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: true,
    officialReceiptNumber: "Official Receipt #2026-0301",
    ipophlStage: "technical-review",
  },
  "PSU-TM-2026-006": {
    officialDutyWork: true,
    letterRequestApproved: true,
    paymentExempt: true,
    paymentVerified: true,
    officialReceiptNumber: "Fee-waived routing",
    ipophlStage: "mis-recording",
  },
  "PSU-PAT-2026-008": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: false,
    officialReceiptNumber: "Pending cashier receipt",
    ipophlStage: "technical-review",
  },
  "PSU-UM-2026-009": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: true,
    officialReceiptNumber: "Official Receipt #2026-0325",
    ipophlStage: "ip-director-action",
  },
  "PSU-ID-2026-010": {
    officialDutyWork: false,
    letterRequestApproved: false,
    paymentExempt: false,
    paymentVerified: false,
    officialReceiptNumber: "Pending cashier receipt",
    ipophlStage: "technical-review",
  },
};

const IPOPHL_TYPES = new Set([
  "Patent",
  "Trademark",
  "Utility Model",
  "Industrial Design",
]);

submissions = submissions.map((submission) => ({
  ...submission,
  ...(COPYRIGHT_CASE_OVERRIDES[submission.id] || {}),
  ...(IPOPHL_TYPES.has(submission.type)
    ? IPOPHL_CASE_OVERRIDES[submission.id] || {}
    : {}),
  assignedReviewerId: REVIEWER_ASSIGNMENTS[submission.id] || null,
  hasTopSecretAnnex: ["Patent", "Utility Model"].includes(submission.type),
}));

systemUsers = systemUsers.map((user) => ({
  ...user,
  role: normalizeRole(user.role),
}));

function getRoleMeta(role = currentRole) {
  return ROLE_META[normalizeRole(role)] || ROLE_META.client;
}

function getCurrentUser(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return (
    systemUsers.find((user) => user.role === normalizedRole) || systemUsers[0]
  );
}

function getDefaultDashboardPage(role = currentRole) {
  return getRoleMeta(role).dashboard;
}

function canAccessDashboardPage(page, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return (DASHBOARD_ACCESS[normalizedRole] || []).includes(page);
}

function isOwnSubmission(submission, role = currentRole) {
  const user = getCurrentUser(role);
  return submission.applicant === user.name || submission.email === user.email;
}

function isAssignedReviewerSubmission(submission, role = currentRole) {
  const user = getCurrentUser(role);
  return submission.assignedReviewerId === user.id;
}

function getVisibleSubmissions(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin" || normalizedRole === "admin")
    return submissions;
  if (normalizedRole === "reviewer")
    return submissions.filter((submission) =>
      isAssignedReviewerSubmission(submission, role),
    );
  return submissions.filter((submission) => isOwnSubmission(submission, role));
}

function canEditSubmission(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return (
    normalizedRole === "superadmin" ||
    normalizedRole === "admin" ||
    (normalizedRole === "reviewer" &&
      isAssignedReviewerSubmission(submission, role))
  );
}

function canAdvanceSubmission(submission, role = currentRole) {
  return canEditSubmission(submission, role);
}

function canArchiveSubmission(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "superadmin" || normalizedRole === "admin";
}

function canUploadDocuments(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "client") return isOwnSubmission(submission, role);
  return canEditSubmission(submission, role);
}

function getDownloadAccess(submission, level, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (level === "confidential") {
    if (normalizedRole === "superadmin" || normalizedRole === "admin")
      return "allow";
    if (
      normalizedRole === "reviewer" &&
      isAssignedReviewerSubmission(submission, role)
    )
      return "allow";
    return "deny";
  }

  if (normalizedRole === "superadmin") return "allow";
  if (normalizedRole === "admin") return "approval";
  return "deny";
}

function canManageUsers(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "superadmin" || normalizedRole === "admin";
}

function canManageTargetUser(user, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  const targetRole = normalizeRole(user.role);
  if (normalizedRole === "superadmin") return true;
  if (normalizedRole === "admin")
    return !["superadmin", "admin"].includes(targetRole);
  return false;
}

function getManageableRoleOptions(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin")
    return ["superadmin", "admin", "reviewer", "client"];
  if (normalizedRole === "admin") return ["reviewer", "client"];
  return [];
}

function getVisibleAuditLogs(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin") return auditLogs;
  if (normalizedRole === "admin") {
    return auditLogs.filter((log) => OPERATIONAL_AUDIT_MODULES.has(log.module));
  }
  return [];
}

function canExportAudit(role = currentRole) {
  return normalizeRole(role) === "superadmin";
}

const proposalBlueprint = {
  summary:
    "A multi-tiered pre-filing ecosystem that reduces fragmented submission work, protects confidential records, and improves the visibility of PSU innovations before national registration.",
  tags: [
    "Requirement Intelligence",
    "Administrative Mitigation Dashboard",
    "Financial Verification Layer",
    "Innovation Marketplace",
    "Role-Based Access Control",
    "Manual IPOPHL relay",
  ],
  problemMatrix: [
    {
      manual:
        "Applicants face a knowledge gap across Patent, Trademark, Copyright, Utility Model, and Industrial Design requirements.",
      system:
        "Requirement Intelligence groups the exact filing checklists and legal artifacts per IP type before a packet is submitted.",
    },
    {
      manual:
        "Paper-dependent intake and fragmented records slow down review and increase incomplete submissions.",
      system:
        "A centralized Administrative Mitigation Dashboard gives the IP office one queue for submissions, payment checks, and manual review.",
    },
    {
      manual:
        "Payment follow-up and submission completeness are handled through separate manual exchanges.",
      system:
        "A Financial Verification Layer requires Proof-of-Deposit or official receipt uploads before the application becomes review-ready.",
    },
    {
      manual:
        "University innovations remain under-documented or invisible to collaborators and industry partners.",
      system:
        "A searchable innovation marketplace exposes PSU outputs, identifies inventors, and provides a clear inquiry path.",
    },
  ],
  pillars: [
    {
      icon: "fa-list-check",
      title: "Requirement Intelligence",
      description:
        "Guided checklists classify the exact documents and legal artifacts needed for each IP service before intake begins.",
    },
    {
      icon: "fa-table-columns",
      title: "Administrative Mitigation Dashboard",
      description:
        "Authorized personnel review digital packets, manage the processing queue, and monitor the institution-wide IP pipeline.",
    },
    {
      icon: "fa-file-invoice-dollar",
      title: "Financial Verification Layer",
      description:
        "Proof-of-Deposit or official receipts are mandatory before an application is considered complete for internal review.",
    },
    {
      icon: "fa-store",
      title: "Innovation Marketplace",
      description:
        "Research outputs and inventions are showcased to external stakeholders for collaboration, technology transfer, and market discovery.",
    },
  ],
  workflow: [
    {
      title: "Choose the right IP service",
      description:
        "The applicant starts with the correct filing path and reviews the exact category-specific requirements.",
    },
    {
      title: "Build the digital packet",
      description:
        "Forms, technical artifacts, and supporting records are uploaded into one structured submission.",
    },
    {
      title: "Verify financial readiness",
      description:
        "Receipt evidence is checked so incomplete packets do not move into the review queue.",
    },
    {
      title: "Manual office review",
      description:
        "Authorized IP office staff assess every file without automated or AI-driven legal evaluation.",
    },
    {
      title: "Relay official IPOPHL feedback",
      description:
        "Administrators update the submission based on registry feedback and institutional follow-through.",
    },
    {
      title: "Certify, freeze, and expose",
      description:
        "Approved records are locked for integrity while qualified innovations remain visible in the marketplace.",
    },
  ],
  securityLayers: [
    {
      icon: "fa-user-lock",
      title: "Multi-factor authentication",
      description:
        "The prototype login flow now reflects the proposal emphasis on MFA for protecting sensitive academic IP records.",
    },
    {
      icon: "fa-shield-halved",
      title: "Role-based access control",
      description:
        "Clients, reviewers, PITBI administrators, and super administrators operate inside distinct permission boundaries.",
    },
    {
      icon: "fa-file-circle-check",
      title: "Manual evaluation policy",
      description:
        "No automated legal judgment is performed; internal reviewers remain the decision point for every submission.",
    },
    {
      icon: "fa-lock",
      title: "Frozen certified metadata",
      description:
        "Once a record is certified, its core technical metadata is locked to preserve integrity and accountability.",
    },
  ],
  objectives: [
    "Identify and categorize the registry-mandated requirements and legal checklists for Patent, Trademark, Copyright, Utility Model, and Industrial Design filings.",
    "Maintain a secure and organized database of submitted forms and records with access controls that support confidentiality and retrieval.",
    "Provide a secure web-based submission interface for creators and a centralized management dashboard for administrative staff.",
    "Develop an online marketplace where users can browse innovations, identify inventors, and learn how to avail or collaborate on products.",
    "Evaluate the platform using ISO 25010-oriented quality targets centered on sustainability, usability, and operational efficiency.",
  ],
  qualityTargets: [
    "Functional sustainability across intake, tracking, review, and records handling.",
    "Usability for creators, IP office personnel, and external stakeholders.",
    "Administrative efficiency when compared with fragmented paper-based workflows.",
  ],
  stakeholders: [
    {
      icon: "fa-building-columns",
      title: "University Administration and IP Office",
      description:
        "Structured oversight, lighter document handling, and clearer monitoring of client requests and university records.",
    },
    {
      icon: "fa-user-graduate",
      title: "Applicants",
      description:
        "Convenient access to IP forms, procedures, requirements, and private tracking for their own submissions.",
    },
    {
      icon: "fa-handshake",
      title: "External Stakeholders and Industry Partners",
      description:
        "A clearer path to discover university innovations, identify inventors, and start collaboration or technology transfer conversations.",
    },
    {
      icon: "fa-book",
      title: "Future Researchers",
      description:
        "A concrete reference model for institutional IP management, innovation promotion, and secure digital service design.",
    },
  ],
  scope: [
    "Centralized access to IP services, forms, records, and filing procedures through a web-based platform.",
    "Secure document storage, submission tracking, and searchable university innovation listings.",
    "User authentication and role-based access controls designed to protect sensitive institutional information.",
  ],
  limitations: [
    "Standalone deployment only: no integration with the main university portal or existing university databases.",
    "Web application only: responsive in browsers, but no dedicated mobile app in the initial version.",
    "Pilot evaluation is limited to Palawan State University.",
    "The first release focuses on core IP management and innovation showcasing, not automated legal processing or monetary transactions.",
  ],
  evidence: {
    local: [
      {
        citation: "Cruz and Fernandez (2023)",
        insight:
          "State universities still rely heavily on manual IP processing, reinforcing the need for a centralized digital intake platform.",
      },
      {
        citation: "Mendoza and Santos (2024)",
        insight:
          "A web-based IP documentation system improved traceability and received high marks for ease of use and security.",
      },
      {
        citation: "Villanueva and Garcia (2022)",
        insight:
          "Limited visibility of research outputs weakens commercialization, which supports integrating a marketplace into the platform.",
      },
      {
        citation: "Reyes and Aquino (2023)",
        insight:
          "Data privacy gaps in academic IP management point directly to MFA, access control, and audit logging as necessary safeguards.",
      },
    ],
    foreign: [
      {
        citation: "Jacob and Lefgren (2021)",
        insight:
          "Centralized IP systems at research universities are linked to better patenting outcomes and stronger industry partnerships.",
      },
      {
        citation: "Williams and Kumar (2022)",
        insight:
          "Dedicated online innovation showcases improve engagement, licensing potential, and startup creation.",
      },
      {
        citation: "Rodriguez and Lee (2021)",
        insight:
          "Layered security controls reduce unauthorized access incidents in academic IP environments.",
      },
      {
        citation: "Cahyanto et al. (2024)",
        insight:
          "Their MFA review found major reductions in breach risk and stronger user trust in digital academic systems.",
      },
    ],
  },
};

// ===== UTILITIES =====
function typeBadge(type) {
  const m = {
    Patent: "badge-patent",
    Copyright: "badge-copyright",
    Trademark: "badge-trademark",
    "Utility Model": "badge-utility",
    "Industrial Design": "badge-industrial",
  };
  return `<span class="badge ${m[type] || "badge-pending"}">${type}</span>`;
}
function statusBadge(status) {
  const m = {
    Approved: "badge-approved",
    Pending: "badge-pending",
    "Under Review": "badge-review",
    Rejected: "badge-rejected",
    "Awaiting Documents": "badge-review",
  };
  return `<span class="badge ${m[status] || "badge-pending"}">${status}</span>`;
}

// ===== NAVIGATION =====
let navHistory = [];

window.goBack = function () {
  if (navHistory.length > 0) {
    const prevPage = navHistory.pop();
    navigateTo(prevPage, true);
  }
};

function navigateTo(page, isBack = false) {
  const landingSections = {
    services: "ip-services-section",
    about: "project-overview-section",
    news: "announcements-landing-section",
  };

  if (landingSections[page]) {
    const targetId = landingSections[page];
    if (currentPage !== "landing") {
      navigateTo("landing");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (!isBack && currentPage && currentPage !== page) {
    if (
      navHistory.length === 0 ||
      navHistory[navHistory.length - 1] !== currentPage
    ) {
      navHistory.push(currentPage);
    }
  }
  currentPage = page;

  // Hide all pages & states
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("dashboard-layout").classList.remove("active");
  document.getElementById("public-nav").classList.remove("active");
  document.getElementById("dashboard-topbar").classList.remove("active");

  const dashboardPages = [
    "user-dashboard",
    "admin-dashboard",
    "admin-submissions",
    "admin-search",
    "patent-form",
    "trademark-form",
    "copyright-form",
    "utility-form",
    "industrial-form",
    "submission-detail",
    "marketplace-dash",
    "admin-marketplace",
    "audit-log",
    "user-profile",
    "user-submissions",
    "admin-records",
    "admin-users",
    "admin-settings",
    "role-permissions",
    "create-account",
    "faq-dash",
    "ip-tutorial",
    "project-blueprint",
    "admin-announcements",
  ];

  if (page === "landing") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-landing").classList.add("active");
    initFeaturedMarketplace();
    renderLandingAnnouncements();
    initLandingProposalSections();
    animateStats();
  } else if (page === "marketplace") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-marketplace").classList.add("active");
    initFullMarketplace();
  } else if (page === "faq") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-faq").classList.add("active");
    document.getElementById("faqPublicContent").innerHTML = renderFaq();
  } else if (page === "login") {
    document.getElementById("page-login").classList.add("active");
  } else if (dashboardPages.includes(page)) {
    if (!isLoggedIn) {
      navigateTo("login");
      return;
    }
    if (!canAccessDashboardPage(page)) {
      showToast(`${getRoleMeta().label} does not have access to this page.`);
      const fallbackPage = getDefaultDashboardPage();
      if (page !== fallbackPage) {
        navigateTo(fallbackPage);
      }
      return;
    }
    document.getElementById("dashboard-layout").classList.add("active");
    document.getElementById("dashboard-topbar").classList.add("active");
    renderSidebar();
    renderDashboardContent(page);
    updateTopbarRole();
    updateActiveSidebarLink(page);
  }

  // Close mobile menu
  document.getElementById("navLinks")?.classList.remove("open");
  window.scrollTo(0, 0);

  // Update UI Back Buttons
  const pubBack = document.getElementById("ui-back-btn-public");
  const dashBack = document.getElementById("ui-back-btn-dashboard");
  const showBack = navHistory.length > 0 && page !== "landing";
  if (pubBack) pubBack.style.display = showBack ? "block" : "none";
  if (dashBack) dashBack.style.display = showBack ? "block" : "none";
  if (page === "landing") navHistory = []; // Reset history
}

function initFeaturedMarketplace() {
  const grid = document.getElementById("featuredInnovationGrid");
  if (grid) {
    // Show only the first 3 items as "Featured"
    const featured = marketplaceItems.slice(0, 3);
    grid.innerHTML = renderInnovationCards(featured);
  }
}

let activeMarketType = "All";
let currentMarketView = "grid";

function initFullMarketplace() {
  const grid = document.getElementById("marketInnovationGrid");
  if (grid) {
    filterFullMarketplace();
  }
}

function setMarketType(type, el) {
  activeMarketType = type;
  document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  filterFullMarketplace();
}

function setMarketView(view) {
  currentMarketView = view;
  document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById(`view-${view}-btn`)?.classList.add("active");

  const grid = document.getElementById("marketInnovationGrid");
  if (grid) {
    if (view === "list") grid.classList.add("list-mode");
    else grid.classList.remove("list-mode");
  }

  filterFullMarketplace();
}

function filterFullMarketplace() {
  const search = document.getElementById("marketSearch")?.value.toLowerCase() || "";
  const college = document.getElementById("marketCollege")?.value || "All";
  let filtered = marketplaceItems.filter((item) => {
    if (activeMarketType !== "All" && item.type !== activeMarketType) return false;
    if (college !== "All" && item.college !== college) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search) &&
      !item.description.toLowerCase().includes(search)
    )
      return false;
    return true;
  });

  const grid = document.getElementById("marketInnovationGrid");
  const countEl = document.getElementById("marketResultsCount");

  if (grid) {
    const renderer = currentMarketView === "list" ? renderInnovationList : renderInnovationCards;
    grid.innerHTML = filtered.length
      ? renderer(filtered)
      : `<div style="grid-column:1/-1;text-align:center;padding:80px 0;">
          <i class="fa-solid fa-cloud-moon" style="font-size:3rem;color:var(--gray-200);margin-bottom:20px;"></i>
          <p style="color:var(--gray-500);font-weight:600">No innovations found matching your specific criteria.</p>
          <button class="btn btn-outline" style="margin-top:20px;" onclick="resetMarketFilters()">Clear all filters</button>
        </div>`;
  }
  if (countEl) {
    countEl.innerText = `Showing ${filtered.length} innovations`;
  }
}

function resetMarketFilters() {
  document.getElementById("marketSearch").value = "";
  document.getElementById("marketCollege").value = "All";
  document.getElementById("marketStatus").value = "All";
  const allChip = document.querySelector('.filter-chip[data-type="All"]');
  if (allChip) setMarketType("All", allChip);
  else filterFullMarketplace();
}

function renderInnovationList(items) {
  return items
    .map(
      (item) => `
    <div class="innovation-list-item" onclick="showInnovationDetail(${item.id})">
      <div class="list-img-box">
        ${item.image ? `<img src="${item.image}" alt="${item.title}">` : `<i class="${item.icon}"></i>`}
      </div>
      <div class="list-title">
        <h4>${item.title}</h4>
        <div class="list-inventor"><i class="fa-solid fa-user"></i> ${item.inventor}</div>
      </div>
      <div class="list-college"><i class="fa-solid fa-building-columns"></i> ${item.college}</div>
      <div class="list-tags">${typeBadge(item.type)}</div>
      <div class="list-action">
        <button class="btn btn-sm btn-icon"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>`,
    )
    .join("");
}

function renderProposalComparisonRows() {
  return proposalBlueprint.problemMatrix
    .map(
      (item) => `
    <div class="proposal-compare-row">
      <div class="proposal-compare-cell manual">
        <span class="proposal-compare-label">Manual pain point</span>
        <p>${item.manual}</p>
      </div>
      <div class="proposal-compare-cell system">
        <span class="proposal-compare-label">Bulwark response</span>
        <p>${item.system}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderProposalPillars() {
  return proposalBlueprint.pillars
    .map(
      (item) => `
    <div class="proposal-pillar-card">
      <i class="fa-solid ${item.icon}"></i>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `,
    )
    .join("");
}

function renderProposalWorkflow() {
  return proposalBlueprint.workflow
    .map(
      (item, index) => `
    <div class="proposal-step">
      <span class="proposal-step-index">${String(index + 1).padStart(2, "0")}</span>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `,
    )
    .join("");
}

function renderProposalObjectives() {
  return proposalBlueprint.objectives
    .map(
      (item) => `
    <li><i class="fa-solid fa-circle-check"></i><span>${item}</span></li>
  `,
    )
    .join("");
}

function renderProposalQualityTargets() {
  return proposalBlueprint.qualityTargets
    .map(
      (item) => `
    <div class="proposal-mini-card">
      <i class="fa-solid fa-chart-simple"></i>
      <h4>${item}</h4>
      <p>ISO 25010-oriented evaluation focus carried forward from the capstone proposal.</p>
    </div>
  `,
    )
    .join("");
}

function renderProposalStakeholders() {
  return proposalBlueprint.stakeholders
    .map(
      (item) => `
    <div class="proposal-mini-card">
      <i class="fa-solid ${item.icon}"></i>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `,
    )
    .join("");
}

function renderProposalSecurityLayers() {
  return proposalBlueprint.securityLayers
    .map(
      (item) => `
    <div class="proposal-mini-card">
      <i class="fa-solid ${item.icon}"></i>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `,
    )
    .join("");
}

function renderProposalScope(items) {
  return items
    .map(
      (item) => `
    <li><i class="fa-solid fa-angle-right"></i><span>${item}</span></li>
  `,
    )
    .join("");
}

function renderProposalEvidenceGroup(entries, label) {
  return `
    <div class="proposal-evidence-group">
      <div class="proposal-column-label">${label}</div>
      ${entries
        .map(
          (item) => `
        <div class="proposal-evidence-card">
          <span>${item.citation}</span>
          <h4>Evidence signal</h4>
          <p>${item.insight}</p>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderProposalOverviewBlocks() {
  return `
    <div class="proposal-card soft">
      <div class="proposal-section-title"><i class="fa-solid fa-scale-balanced"></i> Manual process vs. digital response</div>
      <div class="proposal-compare-table">${renderProposalComparisonRows()}</div>
    </div>
    <div class="proposal-card">
      <div class="proposal-section-title"><i class="fa-solid fa-layer-group"></i> Core system pillars from the proposal</div>
      <div class="proposal-grid proposal-grid-4">${renderProposalPillars()}</div>
    </div>
    <div class="proposal-card">
      <div class="proposal-section-title"><i class="fa-solid fa-diagram-project"></i> End-to-end pre-filing workflow</div>
      <div class="proposal-step-grid">${renderProposalWorkflow()}</div>
    </div>
  `;
}

function renderProposalFoundationBlocks() {
  return `
    <div class="proposal-grid proposal-grid-2">
      <div class="proposal-card">
        <div class="proposal-section-title"><i class="fa-solid fa-bullseye"></i> Proposal objectives</div>
        <ul class="proposal-bullet-list">${renderProposalObjectives()}</ul>
      </div>
      <div class="proposal-card">
        <div class="proposal-section-title"><i class="fa-solid fa-square-poll-vertical"></i> ISO 25010-oriented quality targets</div>
        <div class="proposal-grid proposal-grid-1 proposal-quality-grid">${renderProposalQualityTargets()}</div>
      </div>
    </div>
    <div class="proposal-card">
      <div class="proposal-section-title"><i class="fa-solid fa-people-group"></i> Stakeholders served by the system</div>
      <div class="proposal-grid proposal-grid-4">${renderProposalStakeholders()}</div>
    </div>
    <div class="proposal-grid proposal-grid-2">
      <div class="proposal-card">
        <div class="proposal-section-title"><i class="fa-solid fa-compass-drafting"></i> Current scope</div>
        <ul class="proposal-bullet-list">${renderProposalScope(proposalBlueprint.scope)}</ul>
      </div>
      <div class="proposal-card">
        <div class="proposal-section-title"><i class="fa-solid fa-triangle-exclamation"></i> Current limitations</div>
        <ul class="proposal-bullet-list">${renderProposalScope(proposalBlueprint.limitations)}</ul>
      </div>
    </div>
    <div class="proposal-card">
      <div class="proposal-section-title"><i class="fa-solid fa-book-open-reader"></i> Research-backed design choices</div>
      <div class="proposal-evidence-columns">
        ${renderProposalEvidenceGroup(proposalBlueprint.evidence.local, "Local literature")}
        ${renderProposalEvidenceGroup(proposalBlueprint.evidence.foreign, "Foreign literature")}
      </div>
    </div>
  `;
}

function renderLandingProjectOverview() {
  return `
    <div class="proposal-shell">
      <div class="proposal-hero">
        <span class="proposal-eyebrow"><i class="fa-solid fa-file-lines"></i> Capstone Blueprint</span>
        <h2 class="proposal-heading">Why The Creator's Bulwark exists</h2>
        <p class="proposal-copy">${proposalBlueprint.summary}</p>
        <div class="proposal-tag-row">
          ${proposalBlueprint.tags.map((tag) => `<span class="proposal-tag">${tag}</span>`).join("")}
        </div>
      </div>
      ${renderProposalOverviewBlocks()}
    </div>
  `;
}

function renderLandingProjectFoundation() {
  return `
    <div class="proposal-shell">
      <div class="proposal-hero">
        <span class="proposal-eyebrow"><i class="fa-solid fa-book"></i> Proposal Foundation</span>
        <h2 class="proposal-heading">Objectives, scope, and evidence translated into the prototype</h2>
        <p class="proposal-copy">The document frames the platform as a secure, web-based pre-processing system for creators and administrators, with a marketplace for visibility and ISO 25010-oriented evaluation targets.</p>
      </div>
      ${renderProposalFoundationBlocks()}
    </div>
  `;
}

function initLandingProposalSections() {
  const overview = document.getElementById("projectOverviewMount");
  if (overview) {
    overview.innerHTML = renderLandingProjectOverview();
  }

  const foundation = document.getElementById("projectFoundationMount");
  if (foundation) {
    foundation.innerHTML = renderLandingProjectFoundation();
  }
}

function filterLandingMarketplace() {
  const type = document.getElementById("landingFilterType")?.value || "All";
  const college =
    document.getElementById("landingFilterCollege")?.value || "All";
  const search =
    document.getElementById("landingSearch")?.value.toLowerCase() || "";

  let filtered = marketplaceItems.filter((item) => {
    if (type !== "All" && item.type !== type) return false;
    if (college !== "All" && item.college !== college) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search) &&
      !item.description.toLowerCase().includes(search)
    )
      return false;
    return true;
  });

  const grid = document.getElementById("landingInnovationGrid");
  if (grid) {
    grid.innerHTML = filtered.length
      ? renderInnovationCards(filtered)
      : '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);padding:60px 0;font-weight:600">No innovations found matching your criteria.</p>';
  }
}

// ===== LOGIN =====
function selectLoginRole(role) {
  selectedLoginRole = normalizeRole(role);
  // Sync selectors
  const pubSelect = document.getElementById("publicRoleSelect");
  const topSelect = document.getElementById("topbarRoleSelect");
  if (pubSelect) pubSelect.value = selectedLoginRole;
  if (topSelect) topSelect.value = selectedLoginRole;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  let valid = true;

  if (!email) {
    showError("loginEmailError", "Email is required");
    valid = false;
  } else {
    hideError("loginEmailError");
  }
  if (!pass) {
    showError("loginPasswordError", "Password is required");
    valid = false;
  } else if (pass.length < 3) {
    showError("loginPasswordError", "Password too short");
    valid = false;
  } else {
    hideError("loginPasswordError");
  }

  if (!valid) return;

  // Show MFA OTP verification screen
  const loginPage = document.getElementById("page-login");
  if (loginPage) {
    loginPage.innerHTML = `
      <div class="login-container" style="animation: fadeIn 0.4s ease-out;">
        <div class="login-card">
          <div style="text-align:center; margin-bottom:32px;">
            <div style="width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg, var(--gold), var(--gold-dark)); display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 8px 24px rgba(255,127,80,0.3);">
              <i class="fa-solid fa-shield-halved" style="font-size:1.8rem; color:white;"></i>
            </div>
            <h2 style="font-size:1.5rem; font-weight:800; color:var(--navy); margin-bottom:8px;">Two-Factor Authentication</h2>
            <p style="color:var(--gray-500); font-size:.9rem; line-height:1.5;">A 6-digit verification code has been sent to<br><strong style="color:var(--navy)">${email}</strong></p>
          </div>
          <div class="otp-inputs" style="display:flex; justify-content:center; gap:12px; margin-bottom:28px;">
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" autofocus />
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" />
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" />
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" />
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" />
            <input type="text" maxlength="1" class="otp-box" oninput="otpAutoFocus(this)" onkeydown="otpBackspace(event, this)" />
          </div>
          <button class="btn btn-primary btn-block" onclick="verifyOtp()" style="margin-bottom:16px; padding:14px;"><i class="fa-solid fa-check-double"></i> Verify & Login</button>
          <div style="text-align:center;">
            <p style="font-size:.85rem; color:var(--gray-400); margin-bottom:8px;">Didn't receive a code?</p>
            <button onclick="showToast('A new code has been sent to your email.')" style="background:none; border:none; color:var(--gold-dark); font-weight:600; cursor:pointer; font-size:.85rem;">Resend Code</button>
            <span style="color:var(--gray-300); margin:0 8px;">|</span>
            <button onclick="navigateTo('login')" style="background:none; border:none; color:var(--gray-500); cursor:pointer; font-size:.85rem;">Cancel</button>
          </div>
          <div style="margin-top:24px; padding:16px; background:var(--gray-50); border-radius:8px; text-align:center; border:1px solid var(--gray-200);">
            <p style="font-size:.75rem; color:var(--gray-400);"><i class="fa-solid fa-info-circle" style="color:var(--blue); margin-right:4px;"></i> <strong>Demo Mode:</strong> Enter any 6 digits to proceed.</p>
          </div>
        </div>
      </div>`;
  }
}

window.otpAutoFocus = function (el) {
  if (el.value.length === 1 && el.nextElementSibling) {
    el.nextElementSibling.focus();
  }
};

window.otpBackspace = function (e, el) {
  if (e.key === "Backspace" && el.value === "" && el.previousElementSibling) {
    el.previousElementSibling.focus();
  }
};

window.verifyOtp = function () {
  const boxes = document.querySelectorAll(".otp-box");
  const code = Array.from(boxes)
    .map((b) => b.value)
    .join("");
  if (code.length < 6) {
    showToast("Please enter the full 6-digit code.");
    return;
  }

  isLoggedIn = true;
  currentRole = normalizeRole(selectedLoginRole);
  updateTopbarRole();
  navigateTo(getDefaultDashboardPage(currentRole));

  showToast("MFA verified — Successfully logged in!");
};

function logout() {
  isLoggedIn = false;
  currentRole = "client";
  selectedLoginRole = "client";
  navigateTo("landing");
  showToast("Logged out successfully");
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add("show");
  el.previousElementSibling
    ?.querySelector("input")
    ?.classList.add("input-error");
}
function hideError(id) {
  const el = document.getElementById(id);
  el.classList.remove("show");
  el.previousElementSibling
    ?.querySelector("input")
    ?.classList.remove("input-error");
}

// ===== ROLE TOGGLE =====
// Merged with the main switchRole at the bottom to avoid redeclaration issues.

function toggleRole() {
  // Cycle through main roles for the old toggle if it still exists
  const roles = ["client", "reviewer", "admin", "superadmin"];
  let idx = roles.indexOf(currentRole);
  currentRole = roles[(idx + 1) % roles.length];
  switchRole(currentRole);
}

function updateTopbarRole() {
  const pubSelect = document.getElementById("publicRoleSelect");
  const topSelect = document.getElementById("topbarRoleSelect");
  if (pubSelect) pubSelect.value = normalizeRole(currentRole);
  if (topSelect) topSelect.value = normalizeRole(currentRole);

  const user = getCurrentUser();
  const userName = user?.name || "User";
  const userRole = getRoleMeta().label;

  document.getElementById("topbarUserName").textContent = userName;
  document.getElementById("sidebarUserName").textContent = userName;
  document.getElementById("sidebarUserRole").textContent = userRole;
}

// ===== SIDEBAR =====
function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  if (window.innerWidth <= 768) {
    sb.classList.toggle("mobile-open");
  } else {
    sidebarCollapsed = !sidebarCollapsed;
    sb.classList.toggle("collapsed");
    document.getElementById("dashboard-topbar").style.left = sidebarCollapsed
      ? "var(--sidebar-collapsed-w)"
      : "var(--sidebar-w)";
  }
}

function toggleMobileMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

function renderSidebar() {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;

  const menuMap = {
    superadmin: [
      { page: "admin-dashboard", icon: "fa-chart-line", text: "Dashboard" },
      { page: "admin-submissions", icon: "fa-inbox", text: "All Submissions" },
      {
        page: "admin-search",
        icon: "fa-magnifying-glass",
        text: "Search",
      },
      { page: "admin-records", icon: "fa-folder-open", text: "IP Records" },
      { page: "admin-users", icon: "fa-users", text: "User Manager" },
      { page: "create-account", icon: "fa-user-plus", text: "Create Account" },
      { page: "audit-log", icon: "fa-clipboard-list", text: "System Logs" },
      {
        page: "role-permissions",
        icon: "fa-shield-halved",
        text: "Permissions",
      },
      { page: "admin-settings", icon: "fa-gear", text: "System Config" },
      { page: "admin-announcements", icon: "fa-bullhorn", text: "Announcements" },
      { page: "user-profile", icon: "fa-user", text: "Profile" },
    ],

    reviewer: [
      { page: "admin-dashboard", icon: "fa-microscope", text: "Review Hub" },
      { page: "admin-submissions", icon: "fa-inbox", text: "Assigned Cases" },
      {
        page: "admin-search",
        icon: "fa-magnifying-glass",
        text: "Search",
      },
      { page: "user-profile", icon: "fa-user", text: "Profile" },
    ],
    client: [
      { page: "user-dashboard", icon: "fa-chart-line", text: "My Dashboard" },
      { page: "user-submissions", icon: "fa-file-lines", text: "My Cases" },
      { page: "patent-form", icon: "fa-lightbulb", text: "File Patent" },
      { page: "trademark-form", icon: "fa-stamp", text: "File Trademark" },
      { page: "copyright-form", icon: "fa-copyright", text: "File Copyright" },
      { page: "utility-form", icon: "fa-gears", text: "File Utility Model" },
      {
        page: "industrial-form",
        icon: "fa-pen-nib",
        text: "File Industrial Design",
      },
      { page: "ip-tutorial", icon: "fa-book-open", text: "IP Tutorial" },
      { page: "faq-dash", icon: "fa-circle-question", text: "FAQ" },
    ],
  };

  const menu = menuMap[normalizeRole(currentRole)] || menuMap.client;
  nav.innerHTML = menu
    .map(
      (m) => `
    <a href="#" onclick="navigateTo('${m.page}')" data-page="${m.page}">
      <i class="fa-solid ${m.icon}"></i>
      <span class="nav-text">${m.text}</span>
    </a>
  `,
    )
    .join("");

  // Ensure sidebar visibility for all roles
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  if (sidebar) sidebar.style.display = "";
  if (mainContent) mainContent.style.marginLeft = "";
  if (sidebarToggle) sidebarToggle.style.display = "";
}

function updateActiveSidebarLink(page) {
  document.querySelectorAll(".sidebar-nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });
}

// ===== RENDER DASHBOARD CONTENT =====
function renderDashboardContent(page) {
  const mc = document.getElementById("main-content");
  switch (page) {
    case "user-dashboard":
      mc.innerHTML = renderUserDashboard();
      break;
    case "admin-dashboard":
      mc.innerHTML = renderAdminDashboard();
      setTimeout(() => initCharts(), 100);
      break;
    case "admin-submissions":
      mc.innerHTML = renderAdminSubmissionsPage();
      break;
    case "admin-search":
      mc.innerHTML = renderIPSearchPage();
      break;
    case "patent-form":
      currentWizardStep = 1;
      currentFormType = "patent";
      mc.innerHTML = renderFormWizard("Patent Application");
      break;
    case "trademark-form":
      currentWizardStep = 1;
      currentFormType = "trademark";
      mc.innerHTML = renderFormWizard("Trademark Application");
      break;
    case "copyright-form":
      currentWizardStep = 1;
      currentFormType = "copyright";
      mc.innerHTML = renderFormWizard("Copyright Registration");
      break;
    case "utility-form":
      currentWizardStep = 1;
      currentFormType = "utility";
      mc.innerHTML = renderFormWizard("Utility Model Application");
      break;
    case "industrial-form":
      currentWizardStep = 1;
      currentFormType = "industrial";
      mc.innerHTML = renderFormWizard("Industrial Design Registration");
      break;
    case "submission-detail":
      mc.innerHTML = renderSubmissionDetail();
      break;
    case "marketplace-dash":
    case "admin-marketplace":
      mc.innerHTML = renderMarketplace();
      break;
    case "audit-log":
      mc.innerHTML = renderAuditLog();
      break;
    case "user-profile":
      mc.innerHTML = renderProfile();
      break;
    case "user-submissions":
      mc.innerHTML = renderUserSubmissions();
      break;
    case "admin-records":
      mc.innerHTML = renderAdminRecords();
      break;
    case "admin-users":
      mc.innerHTML = renderAdminUsers();
      break;
    case "admin-settings":
      mc.innerHTML = renderAdminSettings();
      break;
    case "role-permissions":
      mc.innerHTML = renderRolePermissions();
      break;
    case "create-account":
      mc.innerHTML = renderCreateAccount();
      break;
    case "faq-dash":
      mc.innerHTML = renderFaq();
      break;
    case "ip-tutorial":
      mc.innerHTML = renderIpTutorial();
      break;
    case "project-blueprint":
      mc.innerHTML = renderProjectBlueprint();
      break;
    case "admin-announcements":
      mc.innerHTML = renderAdminAnnouncementsPage();
      break;
    default:
      mc.innerHTML = "<p>Page not found</p>";
  }
}

// ===== BADGE HELPER =====
function statusBadge(status) {
  const cls = {
    Approved: "badge-approved",
    Pending: "badge-pending",
    Rejected: "badge-rejected",
    "Under Review": "badge-review",
    "Awaiting Documents": "badge-awaiting",
    Archived: "badge-awaiting",
  };
  return `<span class="badge ${cls[status] || "badge-pending"}">${status}</span>`;
}
function typeBadge(type) {
  const cls = {
    Patent: "badge-patent",
    Trademark: "badge-trademark",
    Copyright: "badge-copyright",
    "Utility Model": "badge-patent",
    "Industrial Design": "badge-trademark",
  };
  return `<span class="badge ${cls[type] || ""}">${type}</span>`;
}

// ===== USER DASHBOARD =====
function renderUserDashboard() {
  const userSubmissions = getVisibleSubmissions("client");
  const total = userSubmissions.length;
  const pending = userSubmissions.filter(
    (s) =>
      s.status === "Pending" ||
      s.status === "Under Review" ||
      s.status === "Awaiting Documents",
  ).length;
  const approved = userSubmissions.filter(
    (s) => s.status === "Approved",
  ).length;
  const rejected = userSubmissions.filter(
    (s) => s.status === "Rejected",
  ).length;
  const recent = userSubmissions.slice(0, 5);
  const user = getCurrentUser("client");

  return `
    <div class="page-header">
      <h1>My Dashboard</h1>
      <p>Welcome back, <strong>${user.name}</strong>. This workspace follows the proposal's applicant flow: guided intake, receipt verification, and protected tracking.</p>
    </div>

    <div class="stats-cards">
      <div class="stat-card" onclick="navigateTo('user-submissions')" style="cursor:pointer">
        <div class="stat-card-icon blue"><i class="fa-solid fa-file-lines"></i></div>
        <div class="stat-card-info"><h3>${total}</h3><p>Packets in Workspace</p></div>
      </div>
      <div class="stat-card" onclick="navigateTo('user-submissions')" style="cursor:pointer">
        <div class="stat-card-icon yellow"><i class="fa-solid fa-hourglass-half"></i></div>
        <div class="stat-card-info"><h3>${pending}</h3><p>In Manual Review</p></div>
      </div>
      <div class="stat-card" onclick="navigateTo('user-submissions')" style="cursor:pointer">
        <div class="stat-card-icon green"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-card-info"><h3>${approved}</h3><p>Certified Records</p></div>
      </div>
      <div class="stat-card" onclick="navigateTo('user-submissions')" style="cursor:pointer">
        <div class="stat-card-icon red"><i class="fa-solid fa-circle-xmark"></i></div>
        <div class="stat-card-info"><h3>${rejected}</h3><p>Returned Packets</p></div>
      </div>
    </div>

    <div class="table-container" style="margin-top:24px">
      <div class="table-header">
        <h3>Recent Submissions</h3>
        <button class="btn btn-sm btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-eye"></i> View All</button>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference No.</th><th>Type</th><th>Title</th><th>Date Submitted</th><th>Status</th></tr></thead><tbody>
        ${
          recent.length
            ? recent
                .map(
                  (s) =>
                    `<tr onclick="viewSubmission('${s.id}')" style="cursor:pointer"><td><strong>${s.id}</strong></td><td>${typeBadge(s.type)}</td><td>${s.title}</td><td>${s.date}</td><td>${statusBadge(s.status)}</td></tr>`,
                )
                .join("")
            : '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--gray-400)">No submissions yet for this client account.</td></tr>'
        }
      </tbody></table></div>
    </div>`;
}

window.toggleFaq = function (btn) {
  const item = btn.closest(".faq-item");
  if (!item) return;
  const answer = item.querySelector(".faq-a");
  const wasOpen = item.classList.contains("open");

  // Close others (Accordion behavior)
  document.querySelectorAll(".faq-item.open").forEach((opened) => {
    if (opened !== item) {
      opened.classList.remove("open");
      const ans = opened.querySelector(".faq-a");
      if (ans) ans.style.maxHeight = "0px";
    }
  });

  // Toggle the current item
  if (wasOpen) {
    item.classList.remove("open");
    if (answer) answer.style.maxHeight = "0px";
  } else {
    item.classList.add("open");
    if (answer) {
      // Small timeout to ensure the browser has a starting point if it was just reset internally
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  }
};

function renderFaq() {
  const faqData = {
    patent: [
      {
        q: "What is a Patent?",
        a: "A patent is an exclusive right granted for an invention, which is a product or a process that provides a new way of doing something, or offers a new technical solution to a problem.",
      },
      {
        q: "How long does patent protection last?",
        a: "Patent protection is granted for a limited period, generally 20 years from the filing date of the application subject to the payment of annual maintenance fees.",
      },
      {
        q: "What can be patented?",
        a: "An invention can be patented if it is new, involves an inventive step, and is industrially applicable.",
      },
      {
        q: "Is a Philippine patent valid in other countries?",
        a: "No. Patents are territorial rights. A Philippine patent is only valid within the Philippines.",
      },
      {
        q: "What are the required documents to file a patent?",
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>Patent Application Form (PSU-IPO-PAT-01)</li><li>Invention Disclosure Statement</li><li>Technical Drawings / Diagrams</li><li>Abstract (150 words max)</li><li>Claims Statement</li></ul>",
      },
    ],
    trademark: [
      {
        q: "What is a Trademark?",
        a: "A trademark is a tool used to differentiate goods and services from each other. It is a very important marketing tool that makes the public recognize the product or service.",
      },
      {
        q: "What are the requirements for registration?",
        a: "You need a completed application form, a clear drawing or reproduction of the mark, and payment of the filing fee.",
      },
      {
        q: "How long is a trademark valid?",
        a: "A trademark registration is valid for 10 years and may be renewed for periods of 10 years as long as the mark remains in commercial use.",
      },
      {
        q: "What are the required documents to file a trademark?",
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>Trademark Application Form (PSU-IPO-TM-01)</li><li>Mark Specimen / Logo File (300+ DPI)</li><li>Description of Goods/Services</li><li>Declaration of First Use</li></ul>",
      },
    ],
    copyright: [
      {
        q: "What does Copyright protect?",
        a: "Copyright protects literary, scholarly, scientific and artistic works. It gives the creator the exclusive right to control the use of their work.",
      },
      {
        q: "Is registration required to obtain copyright?",
        a: "No. Works are protected from the moment of their creation. However, registration provides a public record of your copyright claim and is highly recommended.",
      },
      {
        q: "How does the PSU copyright route move?",
        a: "The packet first goes to the reviewer for completeness checking, then to Admin for recording and payment-slip or fee-waiver routing, then to the cashier and back to Admin for OR recording before the super admin lane endorses filing with the National Library.",
      },
      {
        q: "How long does copyright last?",
        a: "Copyright generally lasts for the lifetime of the author plus fifty (50) years after their death.",
      },
      {
        q: "What are the required documents to register a copyright?",
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>National Library application form for Copyright, ISSN, ISBN, or ISMN</li><li>Complete Copy of the Work</li><li>Valid Philippine ID (Digitized)</li><li>Declaration of Originality</li><li>Approved letter-request for official-duty works (if applicable)</li><li>Official Receipt copy after Admin issues the payment slip</li></ul>",
      },
    ],
    utilityModel: [
      {
        q: "What is a Utility Model?",
        a: "A utility model is an intellectual property right to protect inventions. It is similar to a patent but usually requires less stringent requirements for novelty and does not require an inventive step.",
      },
      {
        q: "What is the difference between a patent and a utility model?",
        a: "A utility model does not require an 'inventive step' (non-obviousness), making it easier and faster to obtain, but it usually offers a shorter term of protection (typically 7 years without renewal).",
      },
      {
        q: "What are the required documents to file a utility model?",
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>Utility Model Application Form</li><li>Technical Description</li><li>Drawings/Illustrations</li><li>Claims Statement</li></ul>",
      },
    ],
    industrialDesign: [
      {
        q: "What is an Industrial Design?",
        a: "An industrial design constitutes the ornamental or aesthetic aspect of an article. It may consist of three-dimensional features, such as the shape or surface, or of two-dimensional features, such as patterns, lines, or color.",
      },
      {
        q: "Why protect industrial designs?",
        a: "Protecting an industrial design ensures an exclusive right against unauthorized copying or imitation of the design by third parties, protecting the commercial value.",
      },
      {
        q: "How long is the term of protection?",
        a: "Protection for an industrial design is valid for five (5) years from the filing date, and it may be renewed for not more than two (2) consecutive periods of five (5) years.",
      },
      {
        q: "What are the required documents to register an industrial design?",
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>Industrial Design Application Form</li><li>Design Representation (Photos/3D)</li><li>Description of Design</li></ul>",
      },
    ],
  };

  function renderGroup(title, data, icon, gradient) {
    return `
      <div class="faq-group glass-panel" style="margin-bottom: 30px; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid var(--gray-200); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display:flex; align-items:center; gap: 15px; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${gradient}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            ${icon}
          </div>
          <h2 style="color: var(--navy); font-size: 1.4rem; font-weight: 700; margin: 0;">${title}</h2>
        </div>
        <div class="faq-list">
          ${data
            .map(
              (item) => `
            <div class="faq-item">
              <button onclick="toggleFaq(this)" class="faq-q">
                <span>${item.q}</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
              <div class="faq-a">
                ${item.a}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="page-header" style="margin-bottom: 40px;">
      <h1>Internal Knowledge Base (FAQ)</h1>
      <p>Comprehensive answers and official guidelines regarding Intellectual Property protection.</p>
    </div>
    
    <div class="faq-container" style="max-width: 900px; margin: 0 auto; padding-bottom: 50px;">
      ${renderGroup("Patent Guidelines", faqData.patent, '<i class="fa-solid fa-lightbulb"></i>', "linear-gradient(135deg,#3b82f6,#1d4ed8)")}
      ${renderGroup("Trademark Information", faqData.trademark, '<i class="fa-solid fa-stamp"></i>', "linear-gradient(135deg,#f59e0b,#d97706)")}
      ${renderGroup("Copyright Basics", faqData.copyright, '<i class="fa-solid fa-copyright"></i>', "linear-gradient(135deg,#10b981,#059669)")}
      ${renderGroup("Utility Model Protections", faqData.utilityModel, '<i class="fa-solid fa-gears"></i>', "linear-gradient(135deg,#6366f1,#4338ca)")}
      ${renderGroup("Industrial Design Rights", faqData.industrialDesign, '<i class="fa-solid fa-pen-nib"></i>', "linear-gradient(135deg,#ec4899,#be185d)")}
    </div>
  `;
}

function renderProjectBlueprint() {
  return `
    <div class="page-header">
      <h1><i class="fa-solid fa-diagram-project"></i> System Blueprint</h1>
      <p>Proposal-driven context, scope, and evidence integrated directly into the prototype.</p>
    </div>
    <div class="proposal-shell">
      <div class="proposal-hero project-page">
        <span class="proposal-eyebrow"><i class="fa-solid fa-shield-halved"></i> Multi-tiered pre-filing model</span>
        <h2 class="proposal-heading">The prototype now exposes the proposal's operating model, not just the workflow screens.</h2>
        <p class="proposal-copy">${proposalBlueprint.summary}</p>
        <div class="proposal-tag-row">
          ${proposalBlueprint.tags.map((tag) => `<span class="proposal-tag">${tag}</span>`).join("")}
        </div>
        <div class="proposal-actions">
          <button class="btn btn-primary" onclick="navigateTo('ip-tutorial')"><i class="fa-solid fa-book-open"></i> Open Requirement Guide</button>
          <button class="btn btn-outline-navy" onclick="navigateTo('marketplace-dash')"><i class="fa-solid fa-store"></i> Open Marketplace</button>
        </div>
      </div>
      <div class="proposal-card">
        <div class="proposal-section-title"><i class="fa-solid fa-user-shield"></i> Security and governance layers</div>
        <div class="proposal-grid proposal-grid-4 proposal-security-grid">${renderProposalSecurityLayers()}</div>
      </div>
      ${renderProposalOverviewBlocks()}
      ${renderProposalFoundationBlocks()}
    </div>
  `;
}

//// ===== ADMIN DASHBOARD HUB (Supports All Admin/Reviewer/Staff Roles) =====
function renderAdminDashboard() {
  const role = normalizeRole(currentRole);
  const stats = getRoleSpecificStats(role);
  const panels = getRoleSpecificPanels(role);
  const user = getCurrentUser(role);
  const roleCopy = {
    superadmin:
      "Full governance across permissions, records, logs, and institutional configuration.",
    admin:
      "Operate the administrative mitigation dashboard for intake control, verification, and progress monitoring.",
    reviewer:
      "Handle assigned cases, advance review stages, and work within the confidentiality boundaries defined by the RBAC matrix.",
  };

  return `
    <div class="page-header">
      <h1>${stats.title}</h1>
      <p>Greetings, ${user.name}. ${stats.subtitle}</p>
    </div>

    <div class="stats-cards">
      ${stats.cards
        .map(
          (c) => `
        <div class="stat-card">
          <div class="stat-card-icon ${c.color}"><i class="fa-solid ${c.icon}"></i></div>
          <div class="stat-card-info"><h3>${c.value}</h3><p>${c.label}</p></div>
        </div>
      `,
        )
        .join("")}
    </div>
    
    <div class="admin-dash-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; align-items: start;">
      <div class="dashboard-main-col" style="display: flex; flex-direction: column; gap: 24px; grid-column: span 2;">
        ${panels.main}
      </div>
      <div class="dashboard-side-col" style="display: flex; flex-direction: column; gap: 24px; grid-column: span 1;">
        ${panels.side}
      </div>
    </div>`;
}

function legacyGetRoleSpecificStats(role) {
  const total = submissions.length;
  const pending = submissions.filter(
    (s) => s.status === "Pending" || s.status === "Under Review",
  ).length;
  const approvedCount = submissions.filter(
    (s) => s.status === "Approved",
  ).length;

  const baseStats = {
    superadmin: {
      title: "Full System Control",
      subtitle: "Global oversight of all university IP activities.",
      cards: [
        {
          label: "System Users",
          value: systemUsers.length,
          icon: "fa-users",
          color: "blue",
        },
        {
          label: "Total Logs",
          value: auditLogs.length,
          icon: "fa-clipboard-list",
          color: "yellow",
        },
        {
          label: "Storage Used",
          value: "4.2 GB",
          icon: "fa-database",
          color: "green",
        },
        {
          label: "Cloud Status",
          value: "Active",
          icon: "fa-cloud",
          color: "indigo",
        },
      ],
    },
    admin: {
      title: "Admin Operations",
      subtitle: "Managing the university core IP portfolio.",
      cards: [
        { label: "Total Files", value: total, icon: "fa-inbox", color: "blue" },
        {
          label: "Pending Review",
          value: pending,
          icon: "fa-hourglass-half",
          color: "yellow",
        },
        {
          label: "Registered IPs",
          value: approvedCount,
          icon: "fa-certificate",
          color: "green",
        },
        {
          label: "Revenue Flow",
          value: "₱125k",
          icon: "fa-money-bill-trend-up",
          color: "indigo",
        },
      ],
    },
    admin: {
      title: "PITBI Operations",
      subtitle: "Managing the university core IP portfolio.",
      cards: [
        { label: "Total Files", value: total, icon: "fa-inbox", color: "blue" },
        {
          label: "Pending Review",
          value: pending,
          icon: "fa-hourglass-half",
          color: "yellow",
        },
        {
          label: "Registered IPs",
          value: approvedCount,
          icon: "fa-certificate",
          color: "green",
        },
        {
          label: "Revenue Flow",
          value: "P125k",
          icon: "fa-money-bill-trend-up",
          color: "indigo",
        },
      ],
    },
    specialist: {
      title: "Technical Review Hub",
      subtitle: "Examine and evaluate technical disclosures.",
      cards: [
        {
          label: "Assigned to Me",
          value: 3,
          icon: "fa-file-signature",
          color: "blue",
        },
        {
          label: "In Evaluation",
          value: 2,
          icon: "fa-microscope",
          color: "yellow",
        },
        {
          label: "Completed",
          value: 12,
          icon: "fa-check-double",
          color: "green",
        },
        {
          label: "Prior Art Docs",
          value: "1.5k",
          icon: "fa-magnifying-glass",
          color: "indigo",
        },
      ],
    },
    ipo_director: {
      title: "Executive Oversight",
      subtitle: "Approval gating and strategic IP management.",
      cards: [
        {
          label: "Awaiting Sig",
          value: 5,
          icon: "fa-pen-fancy",
          color: "blue",
        },
        {
          label: "Univ Portfolio",
          value: 156,
          icon: "fa-ranking-star",
          color: "yellow",
        },
        {
          label: "Policy Alerts",
          value: 0,
          icon: "fa-shield-check",
          color: "green",
        },
        {
          label: "Growth Index",
          value: "+12%",
          icon: "fa-arrow-trend-up",
          color: "indigo",
        },
      ],
    },
    dept_head: {
      title: "Department Portal",
      subtitle: "Endorsing college-level innovations.",
      cards: [
        {
          label: "Dept Submissions",
          value: 18,
          icon: "fa-building-columns",
          color: "blue",
        },
        {
          label: "Needs Endorsement",
          value: 4,
          icon: "fa-certificate",
          color: "yellow",
        },
        {
          label: "Approved Faculty",
          value: 6,
          icon: "fa-user-graduate",
          color: "green",
        },
        {
          label: "Grant Status",
          value: "Active",
          icon: "fa-hand-holding-dollar",
          color: "indigo",
        },
      ],
    },
    facilitator: {
      title: "Facilitator Tools",
      subtitle: "Assisting creators with their applications.",
      cards: [
        {
          label: "Active Support",
          value: 8,
          icon: "fa-handshake-angle",
          color: "blue",
        },
        {
          label: "Follow-ups",
          value: 3,
          icon: "fa-comment-dots",
          color: "yellow",
        },
        {
          label: "Completed Prep",
          value: 24,
          icon: "fa-file-circle-check",
          color: "green",
        },
        { label: "Clients", value: 12, icon: "fa-users", color: "indigo" },
      ],
    },
    external_expert: {
      title: "External Evaluation",
      subtitle: "Third-party specialized technical review.",
      cards: [
        {
          label: "New Dossiers",
          value: 1,
          icon: "fa-folder-plus",
          color: "blue",
        },
        {
          label: "In Analysis",
          value: 1,
          icon: "fa-flask-vial",
          color: "yellow",
        },
        {
          label: "Reports Filed",
          value: 8,
          icon: "fa-file-export",
          color: "green",
        },
        { label: "Current Score", value: 98, icon: "fa-star", color: "indigo" },
      ],
    },
  };

  const finalRole = role;
  return baseStats[finalRole] || baseStats.superadmin;
}

function legacyGetRoleSpecificPanels(role) {
  const submissionsList = submissions.slice(0, 3);
  const mainPanelTitle =
    role === "ipo_director"
      ? "Awaiting Signature"
      : role === "specialist"
        ? "Technical Assignment"
        : "Action Required";

  const main = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
        <h3 style="font-size:1.15rem; color:var(--navy); font-weight:800; margin-bottom:16px;"><i class="fa-solid fa-chart-line" style="color:var(--gold); margin-right:6px;"></i> Portfolio Analytics</h3>
        <div style="height:250px; width:100%; position:relative;">
          <canvas id="submissionsChart"></canvas>
        </div>
      </div>
      <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
        <h3 style="font-size:1.15rem; color:var(--navy); font-weight:800; margin-bottom:16px;"><i class="fa-solid fa-bell" style="color:var(--yellow); margin-right:6px;"></i> ${mainPanelTitle}</h3>
        <div class="table-responsive">
          <table class="data-table" style="width:100%; font-size: 0.9rem;">
            <thead><tr><th>Reference</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
            ${submissionsList
              .map(
                (s) => `
              <tr>
                <td><strong>${s.id}</strong></td>
                <td>${typeBadge(s.type)}</td>
                <td>${statusBadge(s.status)}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewSubmission('${s.id}')">Process</button></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const side = `
    <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
      <h3 style="font-size:1.15rem; color:var(--navy); margin-bottom: 16px; font-weight:800;"><i class="fa-solid fa-bolt" style="color:var(--yellow); margin-right:6px;"></i> Quick Launch</h3>
      <button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; margin-bottom: 12px; font-weight:600;" onclick="showToast('Starting report generation...')"><i class="fa-solid fa-file-export" style="margin-right:8px; width:16px;"></i> Download Status</button>
      <button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; font-weight:600;" onclick="navigateTo('ip-tutorial')"><i class="fa-solid fa-book" style="margin-right:8px; width:16px;"></i> Operations Manual</button>
    </div>`;

  return { main, side };
}

function getRoleSpecificStats(role) {
  const visibleSubmissions = getVisibleSubmissions(role);
  const total = visibleSubmissions.length;
  const pending = visibleSubmissions.filter(
    (s) =>
      s.status === "Pending" ||
      s.status === "Under Review" ||
      s.status === "Awaiting Documents",
  ).length;
  const approvedCount = visibleSubmissions.filter(
    (s) => s.status === "Approved",
  ).length;
  const baseStats = {
    superadmin: {
      title: "Admin Dashboard",
      subtitle: "Complete institutional oversight of all IP activities.",
      cards: [
        {
          label: "System Users",
          value: systemUsers.length,
          icon: "fa-users",
          color: "blue",
        },
        {
          label: "Audit Events",
          value: getVisibleAuditLogs(role).length,
          icon: "fa-clipboard-list",
          color: "yellow",
        },
        {
          label: "Active Cases",
          value: total,
          icon: "fa-database",
          color: "green",
        },
        {
          label: "Registered IPs",
          value: approvedCount,
          icon: "fa-certificate",
          color: "green",
        },
        {
          label: "Operational Logs",
          value: getVisibleAuditLogs(role).length,
          icon: "fa-clipboard-list",
          color: "indigo",
        },
      ],
    },
    reviewer: {
      title: "Reviewer Workspace",
      subtitle: "Process assigned cases within reviewer-only permissions.",
      cards: [
        {
          label: "Assigned Cases",
          value: total,
          icon: "fa-file-signature",
          color: "blue",
        },
        {
          label: "In Review",
          value: pending,
          icon: "fa-microscope",
          color: "yellow",
        },
        {
          label: "Advanced Stages",
          value: approvedCount,
          icon: "fa-check-double",
          color: "green",
        },
        {
          label: "Search Access",
          value: "Internal",
          icon: "fa-magnifying-glass",
          color: "indigo",
        },
      ],
    },
  };

  return baseStats[normalizeRole(role)] || baseStats.superadmin;
}

function getRoleSpecificPanels(role) {
  const normalizedRole = normalizeRole(role);
  const submissionsList = getVisibleSubmissions(normalizedRole).slice(0, 3);
  const mainPanelTitle =
    normalizedRole === "reviewer" ? "Assigned Review Queue" : "Action Required";

  const main = `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
        <h3 style="font-size:1.15rem; color:var(--navy); font-weight:800; margin-bottom:16px;"><i class="fa-solid fa-chart-line" style="color:var(--gold); margin-right:6px;"></i> Portfolio Analytics</h3>
        <div style="height:250px; width:100%; position:relative;">
          <canvas id="submissionsChart"></canvas>
        </div>
      </div>
      <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
        <h3 style="font-size:1.15rem; color:var(--navy); font-weight:800; margin-bottom:16px;"><i class="fa-solid fa-bell" style="color:var(--yellow); margin-right:6px;"></i> ${mainPanelTitle}</h3>
        <div class="table-responsive">
          <table class="data-table" style="width:100%; font-size: 0.9rem;">
            <thead><tr><th>Reference</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
            ${
              (submissionsList.length ? submissionsList : [])
                .map(
                  (s) => `
              <tr>
                <td><strong>${s.id}</strong></td>
                <td>${typeBadge(s.type)}</td>
                <td>${statusBadge(s.status)}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewSubmission('${s.id}')">Process</button></td>
              </tr>
            `,
                )
                .join("") ||
              '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--gray-400)">No cases available for this role.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const side = `
    <div class="dashboard-panel" style="background:rgba(255,255,255,0.9); backdrop-filter:blur(12px); border-radius:16px; padding:24px; border: 1px solid rgba(255,255,255,0.8); box-shadow:0 8px 30px rgba(0,0,0,0.03);">
      <h3 style="font-size:1.15rem; color:var(--navy); margin-bottom: 16px; font-weight:800;"><i class="fa-solid fa-bolt" style="color:var(--yellow); margin-right:6px;"></i> Quick Launch</h3>
      ${normalizedRole !== "reviewer" ? `<button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; margin-bottom: 12px; font-weight:600;" onclick="showToast('Starting report generation...')"><i class="fa-solid fa-file-export" style="margin-right:8px; width:16px;"></i> Download Status</button>` : ""}
      <button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; font-weight:600;" onclick="navigateTo('${normalizedRole === "reviewer" ? "admin-search" : "ip-tutorial"}')"><i class="fa-solid fa-${normalizedRole === "reviewer" ? "magnifying-glass" : "book"}" style="margin-right:8px; width:16px;"></i> ${normalizedRole === "reviewer" ? "Open Search" : "Operations Manual"}</button>
    </div>`;

  return { main, side };
}

function initCharts() {
  const lineCtx = document.getElementById("submissionsChart");
  if (lineCtx) {
    if (window.myLineChart) window.myLineChart.destroy();
    window.myLineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "IP Submissions",
            data: [12, 19, 15, 25, 22, 30],
            borderColor: "#E66B3F",
            backgroundColor: "rgba(230, 107, 63, 0.2)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#E66B3F",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [5, 5], color: "rgba(0,0,0,0.05)" },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }

  const pieCtx = document.getElementById("typeChart");
  if (pieCtx) {
    if (window.myPieChart) window.myPieChart.destroy();
    window.myPieChart = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Patent",
          "Trademark",
          "Copyright",
          "Utility Model",
          "Ind. Design",
        ],
        datasets: [
          {
            data: [35, 25, 20, 10, 10],
            backgroundColor: [
              "#E66B3F",
              "#F7BEA2",
              "#22C55E",
              "#3B82F6",
              "#8B5CF6",
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, font: { size: 10 } },
          },
        },
      },
    });
  }
}

function switchRole(role) {
  currentRole = normalizeRole(role);
  selectedLoginRole = currentRole;
  isLoggedIn = true;

  const menu = document.getElementById("switcherMenu");
  if (menu) menu.classList.remove("active");

  const user = getCurrentUser(currentRole);
  if (user) {
    showToast(
      `Access switched to: ${user.name} (${getRoleMeta(currentRole).label})`,
    );
  }

  navigateTo(getDefaultDashboardPage(currentRole));

  renderSidebar();
  updateTopbarRole();
}

function renderAdminSubmissionsPage() {
  adminFilterType = "All";
  adminFilterStatus = "All";
  adminSearchQuery = "";
  const normalizedRole = normalizeRole(currentRole);
  const title =
    normalizedRole === "reviewer" ? "Assigned Cases" : "All Submissions";
  const subtitle =
    normalizedRole === "reviewer"
      ? "Review only the cases assigned to this reviewer account."
      : "Filter, review, and manage IP applications.";
  return `
    <div class="page-header">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    ${renderAdminSubmissionsTable()}
  `;
}

function renderAdminSubmissionsTable(filterType, filterStatus, searchQuery) {
  let filtered = [...getVisibleSubmissions(currentRole)];
  if (filterType && filterType !== "All")
    filtered = filtered.filter((s) => s.type === filterType);
  if (filterStatus && filterStatus !== "All")
    filtered = filtered.filter((s) => s.status === filterStatus);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.applicant.toLowerCase().includes(q) ||
        (s.department || "").toLowerCase().includes(q),
    );
  }

  return `
    <div class="table-container" id="adminSubmissionsTable">
      <div class="table-header">
        <h3>${normalizeRole(currentRole) === "reviewer" ? "Assigned Cases" : "Visible Cases"} <span style="font-size:.8rem;font-weight:400;color:var(--gray-400);">(${filtered.length} result${filtered.length !== 1 ? "s" : ""})</span></h3>
        <div style="display:flex;gap:10px;align-items:center;">
          <div class="search-box" style="width:230px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="adminSearchInput" placeholder="Search by title, applicant, ID..." value="${searchQuery || ""}" oninput="filterAdminSearch(this.value)" />
          </div>
          <select class="filter-select" onchange="filterAdminStatus(this.value)">
            <option value="All">All Status</option>
            <option value="Pending" ${(filterStatus || "") === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Under Review" ${(filterStatus || "") === "Under Review" ? "selected" : ""}>Under Review</option>
            <option value="Approved" ${(filterStatus || "") === "Approved" ? "selected" : ""}>Approved</option>
            <option value="Rejected" ${(filterStatus || "") === "Rejected" ? "selected" : ""}>Rejected</option>
            <option value="Awaiting Documents" ${(filterStatus || "") === "Awaiting Documents" ? "selected" : ""}>Awaiting Docs</option>
            <option value="Archived" ${(filterStatus || "") === "Archived" ? "selected" : ""}>Archived</option>
          </select>
        </div>
      </div>
      <div style="padding:0 24px 14px;display:flex;gap:6px;flex-wrap:wrap;">
        <button class="filter-btn ${!filterType || filterType === "All" ? "active" : ""}" onclick="filterAdminTable('All')">All</button>
        <button class="filter-btn ${(filterType || "") === "Patent" ? "active" : ""}" onclick="filterAdminTable('Patent')">Patent</button>
        <button class="filter-btn ${(filterType || "") === "Trademark" ? "active" : ""}" onclick="filterAdminTable('Trademark')">Trademark</button>
        <button class="filter-btn ${(filterType || "") === "Copyright" ? "active" : ""}" onclick="filterAdminTable('Copyright')">Copyright</button>
        <button class="filter-btn ${(filterType || "") === "Utility Model" ? "active" : ""}" onclick="filterAdminTable('Utility Model')">Utility Model</button>
        <button class="filter-btn ${(filterType || "") === "Industrial Design" ? "active" : ""}" onclick="filterAdminTable('Industrial Design')">Industrial Design</button>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference No.</th><th>Type</th><th>Title</th><th>Applicant</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${
          filtered.length === 0
            ? `<tr><td colspan="7" style="text-align:center;padding:50px;color:var(--gray-400);"><i class="fa-solid fa-inbox" style="font-size:2.5rem;display:block;margin-bottom:12px;"></i>No submissions match your criteria.</td></tr>`
            : filtered
                .map(
                  (s) => `<tr>
          <td><strong>${s.id}</strong></td><td>${typeBadge(s.type)}</td><td>${s.title}</td><td>${s.applicant}</td><td>${s.date}</td><td>${statusBadge(s.status)}</td>
          <td><div class="action-btns">
            <button class="btn btn-sm btn-outline-navy" onclick="viewSubmission('${s.id}')"><i class="fa-solid fa-eye"></i> View</button>
            ${canAdvanceSubmission(s) ? `<button class="btn btn-sm btn-success" title="Approve" onclick="changeStatus('${s.id}','Approved')"><i class="fa-solid fa-check"></i></button>` : ""}
            ${canAdvanceSubmission(s) ? `<button class="btn btn-sm btn-danger" title="Reject" onclick="changeStatus('${s.id}','Rejected')"><i class="fa-solid fa-xmark"></i></button>` : ""}
            ${canEditSubmission(s) ? `<button class="btn btn-sm btn-secondary" title="Request Docs" onclick="requestDocs('${s.id}')"><i class="fa-solid fa-file-circle-plus"></i></button>` : ""}
            ${canArchiveSubmission() ? `<button class="btn btn-sm btn-secondary" title="Archive" onclick="archiveSubmission('${s.id}')"><i class="fa-solid fa-box-archive"></i></button>` : ""}
          </div></td></tr>`,
                )
                .join("")
        }
      </tbody></table></div>
    </div>`;
}

let adminFilterType = "All",
  adminFilterStatus = "All",
  adminSearchQuery = "";
let userFilterType = "All",
  userFilterStatus = "All",
  userSearchQuery = "";

function filterAdminTable(type) {
  adminFilterType = type;
  refreshAdminTable();
}
function filterAdminStatus(status) {
  adminFilterStatus = status;
  refreshAdminTable();
}
function filterAdminSearch(q) {
  adminSearchQuery = q;
  refreshAdminTable();
}
function refreshAdminTable() {
  const container = document.getElementById("adminSubmissionsTable");
  if (container) {
    container.innerHTML = renderAdminSubmissionsTable(
      adminFilterType,
      adminFilterStatus,
      adminSearchQuery,
    );
  }
}

function filterUserTable(type, btn) {
  userFilterType = type;
  if (btn) {
    btn.parentElement
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
  refreshUserTable();
}
function filterUserStatus(status) {
  userFilterStatus = status;
  refreshUserTable();
}
function filterUserSearch(q) {
  userSearchQuery = q;
  refreshUserTable();
}
function refreshUserTable() {
  const container = document.getElementById("userSubmissionsList");
  if (container) {
    container.innerHTML = renderUserSubmissionsTable(
      userFilterType,
      userFilterStatus,
      userSearchQuery,
    );
  }
}

function changeStatus(id, newStatus) {
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return;
  if (!canAdvanceSubmission(sub)) {
    showToast(`${getRoleMeta().label} cannot advance this case.`);
    return;
  }
  sub.status = newStatus;
  syncSubmissionWorkflowState(sub);
  showToast(`${sub.title} marked as ${newStatus}`);
  navigateTo(getDefaultDashboardPage());
}

function requestDocs(id) {
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return;
  if (!canEditSubmission(sub)) {
    showToast(`${getRoleMeta().label} cannot edit this case.`);
    return;
  }

  const missing = prompt(
    "Please specify the missing documents for this submission (e.g., PSA-IPO-PAT-01 Signature, Invention Disclosure):",
    "",
  );

  if (missing !== null) {
    // If user didn't cancel
    sub.status = "Awaiting Documents";
    sub.statusNote = missing;
    syncSubmissionWorkflowState(sub);
    showToast(`Request for "${missing}" sent to ${sub.applicant}`);
    navigateTo(getDefaultDashboardPage());
  }
}

function archiveSubmission(id) {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return;
  if (!canArchiveSubmission()) {
    showToast(`${getRoleMeta().label} cannot archive cases.`);
    return;
  }
  submission.status = "Archived";
  syncSubmissionWorkflowState(submission);
  showToast(`${submission.id} archived successfully.`);
  navigateTo(getDefaultDashboardPage());
}

function viewSubmission(id) {
  const submission = submissions.find((s) => s.id === id);
  if (
    !submission ||
    !getVisibleSubmissions(currentRole).some((s) => s.id === id)
  ) {
    showToast(`${getRoleMeta().label} cannot open this case.`);
    return;
  }
  selectedSubmissionId = id;
  navigateTo("submission-detail");
}

const COPYRIGHT_OPERATION_FLOW = [
  {
    key: "author-submission",
    step: 1,
    title: "Author submits application to Technical Expert",
    owner: "Client",
    lane: "Author / Applicant",
    description:
      "Properly filled out application for Copyright, ISSN, ISBN, or ISMN together with other requirements of the National Library; and letter-request approved by the University President through the Quality Assurance Director for the registration of the intellectual property material and payment of basic fees to the National Library in the case of faculty or staff whose work is part of his/her regular official duties. (Other clients must pay basic fees and cost of courier).",
  },
  {
    key: "technical-review",
    step: 2,
    title:
      "Technical Expert receives and acknowledges submitted application from author",
    owner: "Reviewer",
    lane: "Technical Expert",
    description:
      "Review and prepare a checklist, return incomplete application to author, and forward complete application to admin staff/MIS for record purposes.",
  },
  {
    key: "mis-recording",
    step: 3,
    title: "Admin Staff/MIS receives application from Technical Expert",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Record in logbook and encode in database. Prepare payment slip and inform author to pay basic fees at cashier's office. (Note: those with approved letter-request as mentioned in step 1b shall proceed to step 7b).",
  },
  {
    key: "payment-slip-issued",
    step: 4,
    title: "Author receives payment slip and pays basic fees to cashier",
    owner: "Client",
    lane: "Author / Applicant",
    description:
      "The applicant receives the payment slip and pays the basic fees to the university cashier.",
  },
  {
    key: "cashier-receipt",
    step: 5,
    title:
      "University Cashier receives payment slip/cash and issues official receipt to author",
    owner: "University Cashier",
    lane: "Cashier",
    description:
      "The University Cashier receives payment and issues the official receipt. Prepares monthly collection report copy furnished UIP/ITSO office.",
  },
  {
    key: "receipt-submitted",
    step: 6,
    title:
      "Author receives official receipt from cashier and submit photocopy to Admin Staff/MIS",
    owner: "Client",
    lane: "Author / Applicant",
    description:
      "The applicant submits the photocopied official receipt to Admin Staff/MIS after cashier payment.",
  },
  {
    key: "mis-forwarding",
    step: 7,
    title: "Admin Staff/MIS receives photocopied official receipt from author",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Record O.R. in logbook and encode in database. Forward application to IP Director for action.",
  },
  {
    key: "ip-director-action",
    step: 8,
    title: "IP Director acts on application for IP registration",
    owner: "Super Admin",
    lane: "IP Director",
    description:
      "Verify and prioritize. Endorse to the University President through the VP Research & Extension list of applications for approval. File IP applications with the National Library (Note: the IP Director may authorize the technical expert/admin staff/MIS to file applications on his/her behalf).",
  },
  {
    key: "certificate-received",
    step: 9,
    title:
      "Admin Staff/MIS receives Certificate of Registration from National Library",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Record C.O.R. in logbook and encode in database. Release C.O.R. to author.",
  },
  {
    key: "certificate-released",
    step: 10,
    title: "Author receives Certificate of Registration from Admin Staff",
    owner: "Client",
    lane: "Author / Applicant",
    description:
      "The author receives the Certificate of Registration from Admin Staff, completing the registration process.",
  },
];

const COPYRIGHT_TRACKING_GROUPS = [
  { label: "Submitted to Reviewer", keys: ["author-submission"] },
  {
    label: "Completeness Checked",
    keys: ["technical-review", "mis-recording"],
  },
  {
    label: "Payment and OR Route",
    keys: ["payment-slip-issued", "cashier-receipt", "receipt-submitted"],
  },
  { label: "Admin Forwarding", keys: ["mis-forwarding"] },
  {
    label: "National Library Filing",
    keys: ["ip-director-action", "certificate-received"],
  },
  { label: "Certificate Released", keys: ["certificate-released"] },
];

const IPOPHL_OPERATION_FLOW = [
  {
    key: "inventor-submission",
    step: 1,
    title: "Inventor submits application to Technical Expert",
    owner: "Client",
    lane: "Inventor / Applicant",
    description:
      "Submit a properly filled-out application for Patent, UM, ID, or Trademark together with other requirements of the IPOPHL, and a letter-request approved by the University President through the VP for R&D (if applicable).",
  },
  {
    key: "technical-review",
    step: 2,
    title: "Technical Expert reviews and acknowledges application",
    owner: "Reviewer",
    lane: "Technical Expert",
    description:
      "The Technical Expert reviews and prepares a checklist, assists the inventor if the application is incomplete, and forwards the complete application to Admin Staff/MIS for record purposes.",
  },
  {
    key: "mis-recording",
    step: 3,
    title: "Admin Staff/MIS receives and records application",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Records the application in the logbook and database, prepares the payment slip, and informs the inventor to pay basic fees at the cashier. Approved letter-request holders proceed directly to Step 7.",
  },
  {
    key: "payment-slip-issued",
    step: 4,
    title: "Inventor receives payment slip and pays basic fees",
    owner: "Client",
    lane: "Inventor / Applicant",
    description:
      "The inventor receives the payment slip and pays the basic fees to the university cashier.",
  },
  {
    key: "cashier-receipt",
    step: 5,
    title: "University Cashier receives payment and issues receipt",
    owner: "University Cashier",
    lane: "Cashier",
    description:
      "The University Cashier receives the payment slip/cash and issues an official receipt to the inventor. Prepares monthly collection report copy furnished to UIP/ITSO office.",
  },
  {
    key: "receipt-submitted",
    step: 6,
    title: "Inventor submits official receipt copy to Admin Staff/MIS",
    owner: "Client",
    lane: "Inventor / Applicant",
    description:
      "The inventor receives the official receipt from the cashier and submits a photocopy to Admin Staff/MIS.",
  },
  {
    key: "mis-forwarding",
    step: 7,
    title: "Admin Staff/MIS records OR and forwards application",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Records the official receipt in the logbook and database, then forwards the application to the IP Director for action.",
  },
  {
    key: "ip-director-action",
    step: 8,
    title: "IP Director acts on application for IP registration",
    owner: "Super Admin",
    lane: "IP Director",
    description:
      "Verifies and prioritizes the application, endorses it to the University President through the VP for Research & Extension, and files IP applications with IPOPHL.",
  },
  {
    key: "certificate-received",
    step: 9,
    title: "Admin Staff/MIS receives Certificate from IPOPHL",
    owner: "Admin",
    lane: "Admin Staff / MIS",
    description:
      "Receives the Certificate of Registration from IPOPHL, records it in the logbook and database, and prepares release to the inventor.",
  },
  {
    key: "certificate-released",
    step: 10,
    title: "Inventor receives Certificate of Registration",
    owner: "Client",
    lane: "Inventor / Applicant",
    description:
      "The inventor receives the Certificate of Registration from Admin Staff, completing the IP registration process.",
  },
];

const IPOPHL_TRACKING_GROUPS = [
  { label: "Submitted to Technical Expert", keys: ["inventor-submission"] },
  {
    label: "Completeness Checked",
    keys: ["technical-review", "mis-recording"],
  },
  {
    label: "Payment and OR Route",
    keys: ["payment-slip-issued", "cashier-receipt", "receipt-submitted"],
  },
  { label: "Admin Forwarding", keys: ["mis-forwarding"] },
  {
    label: "IPOPHL Filing",
    keys: ["ip-director-action", "certificate-received"],
  },
  { label: "Certificate Released", keys: ["certificate-released"] },
];

function getCopyrightStageKey(submission) {
  if (submission.copyrightStage) return submission.copyrightStage;
  if (submission.status === "Approved") return "certificate-released";
  if (submission.status === "Under Review")
    return submission.paymentExempt || submission.paymentVerified !== false
      ? "ip-director-action"
      : "payment-slip-issued";
  if (submission.status === "Awaiting Documents") return "technical-review";
  if (submission.paymentExempt) return "mis-forwarding";
  if (submission.paymentVerified === false) return "technical-review";
  return "author-submission";
}

function getCopyrightStageIndex(submission) {
  const key = getCopyrightStageKey(submission);
  const idx = COPYRIGHT_OPERATION_FLOW.findIndex((step) => step.key === key);
  return idx < 0 ? 0 : idx;
}

function syncSubmissionWorkflowState(submission) {
  if (IPOPHL_TYPES.has(submission.type)) {
    syncIPOPHLWorkflowState(submission);
    return;
  }
  if (submission.type !== "Copyright") return;
  if (submission.status === "Approved") {
    submission.copyrightStage = "certificate-released";
    return;
  }
  if (submission.status === "Awaiting Documents") {
    submission.copyrightStage = "technical-review";
    return;
  }
  if (submission.status === "Under Review") {
    submission.copyrightStage =
      submission.paymentExempt || submission.paymentVerified !== false
        ? "ip-director-action"
        : "payment-slip-issued";
    return;
  }
  if (submission.status === "Pending") {
    if (submission.paymentExempt) {
      submission.copyrightStage = submission.copyrightStage || "mis-recording";
      return;
    }
    submission.copyrightStage =
      submission.copyrightStage ||
      (submission.paymentVerified !== false
        ? "mis-forwarding"
        : "technical-review");
  }
}

function getCopyrightTrackingSteps(submission) {
  const stageKey = getCopyrightStageKey(submission);
  const activeIdx = COPYRIGHT_TRACKING_GROUPS.findIndex((group) =>
    group.keys.includes(stageKey),
  );
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";
  return COPYRIGHT_TRACKING_GROUPS.map((step, i) => {
    let cls = "pending";
    let icon = "fa-circle";
    if (closed) {
      cls = i === 0 ? "completed" : "pending";
      icon = i === 0 ? "fa-check" : "fa-circle";
    } else if (i < activeIdx) {
      cls = "completed";
      icon = "fa-check";
    } else if (i === activeIdx) {
      cls = "active";
      icon = "fa-circle-dot";
    }
    return { label: step.label, cls, icon };
  });
}

// ===== IPOPHL STAGE MANAGEMENT (Patent, Trademark, Utility Model, Industrial Design) =====
function getIPOPHLStageKey(submission) {
  if (submission.ipophlStage) return submission.ipophlStage;
  if (submission.status === "Approved") return "certificate-released";
  if (submission.status === "Under Review")
    return submission.paymentExempt || submission.paymentVerified !== false
      ? "ip-director-action"
      : "payment-slip-issued";
  if (submission.status === "Awaiting Documents") return "technical-review";
  if (submission.paymentExempt) return "mis-forwarding";
  if (submission.paymentVerified === false) return "technical-review";
  return "inventor-submission";
}

function getIPOPHLStageIndex(submission) {
  const key = getIPOPHLStageKey(submission);
  const idx = IPOPHL_OPERATION_FLOW.findIndex((step) => step.key === key);
  return idx < 0 ? 0 : idx;
}

function syncIPOPHLWorkflowState(submission) {
  if (submission.status === "Approved") {
    submission.ipophlStage = "certificate-released";
    return;
  }
  if (submission.status === "Awaiting Documents") {
    submission.ipophlStage = "technical-review";
    return;
  }
  if (submission.status === "Under Review") {
    submission.ipophlStage =
      submission.paymentExempt || submission.paymentVerified !== false
        ? "ip-director-action"
        : "payment-slip-issued";
    return;
  }
  if (submission.status === "Pending") {
    if (submission.paymentExempt) {
      submission.ipophlStage = submission.ipophlStage || "mis-recording";
      return;
    }
    submission.ipophlStage =
      submission.ipophlStage ||
      (submission.paymentVerified !== false
        ? "mis-forwarding"
        : "technical-review");
  }
}

function getIPOPHLTrackingSteps(submission) {
  const stageKey = getIPOPHLStageKey(submission);
  const activeIdx = IPOPHL_TRACKING_GROUPS.findIndex((group) =>
    group.keys.includes(stageKey),
  );
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";
  return IPOPHL_TRACKING_GROUPS.map((step, i) => {
    let cls = "pending";
    let icon = "fa-circle";
    if (closed) {
      cls = i === 0 ? "completed" : "pending";
      icon = i === 0 ? "fa-check" : "fa-circle";
    } else if (i < activeIdx) {
      cls = "completed";
      icon = "fa-check";
    } else if (i === activeIdx) {
      cls = "active";
      icon = "fa-circle-dot";
    }
    return { label: step.label, cls, icon };
  });
}

function getSubmissionPaymentMeta(submission) {
  if (submission.type === "Copyright") {
    if (submission.paymentExempt) {
      return {
        theme: "blue",
        icon: "fa-file-signature",
        title: "Fee-waived route recorded",
        detail:
          "An approved university letter-request is on file, so Admin may route the packet without cashier payment.",
        actionLabel: "",
      };
    }
    if (submission.paymentVerified === false) {
      return {
        theme: "red",
        icon: "fa-receipt",
        title: "Awaiting payment slip and OR copy",
        detail:
          "After reviewer clearance, Admin issues the payment slip. The applicant then pays the university cashier and submits the official receipt copy.",
        actionLabel: "Record OR Copy",
      };
    }
    return {
      theme: "green",
      icon: "fa-circle-check",
      title: "Official receipt recorded",
      detail: `${submission.officialReceiptNumber || "Official Receipt #2026-0321"} has been recorded for routing and filing.`,
      actionLabel: "Recorded",
    };
  }

  // IPOPHL types (Patent, Trademark, Utility Model, Industrial Design)
  if (IPOPHL_TYPES.has(submission.type)) {
    if (submission.paymentExempt) {
      return {
        theme: "blue",
        icon: "fa-file-signature",
        title: "Fee-waived route (approved letter-request)",
        detail:
          "An approved university letter-request is on file. The inventor is faculty or staff whose work is part of regular official duties, so basic fees are waived.",
        actionLabel: "",
      };
    }
    if (submission.paymentVerified === false) {
      return {
        theme: "red",
        icon: "fa-receipt",
        title: "Awaiting payment slip and official receipt",
        detail:
          "After completeness check by the Technical Expert, Admin Staff/MIS issues the payment slip. The inventor pays at the cashier and returns the official receipt copy.",
        actionLabel: "Record OR Copy",
      };
    }
    return {
      theme: "green",
      icon: "fa-circle-check",
      title: "Official receipt recorded",
      detail: `${submission.officialReceiptNumber || "Official Receipt"} has been recorded for IPOPHL filing.`,
      actionLabel: "Recorded",
    };
  }

  if (submission.paymentVerified === false) {
    return {
      theme: "red",
      icon: "fa-circle-xmark",
      title: "Awaiting Proof of Deposit",
      detail:
        "Upload or record the official receipt before forwarding the packet for review.",
      actionLabel: "Mark Verified",
    };
  }
  return {
    theme: "green",
    icon: "fa-circle-check",
    title: "Payment Verified",
    detail: `${submission.officialReceiptNumber || "Official Receipt #2026-0321"} has been validated for this case.`,
    actionLabel: "Verified",
  };
}

function renderCopyrightOperationTimeline(submission) {
  const activeIdx = getCopyrightStageIndex(submission);
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";

  return `
    <div class="workflow-note">
      Reviewer = technical expert lane, PITBI Admin = Admin Staff / MIS lane, and Super Admin = IP Director approval authority inside this prototype.
    </div>
    <div class="copyright-flow-grid">
      ${COPYRIGHT_OPERATION_FLOW.map((step, idx) => {
        let state = "pending";
        if (closed) state = idx === 0 ? "completed" : "pending";
        else if (idx < activeIdx) state = "completed";
        else if (idx === activeIdx) state = "active";

        const stateLabel =
          state === "completed"
            ? "Completed"
            : state === "active"
              ? "Current"
              : "Pending";

        return `
          <div class="copyright-flow-card ${state}">
            <div class="copyright-flow-meta">
              <span class="copyright-flow-step">Step ${step.step}</span>
              <span class="copyright-stage-pill ${state}">${stateLabel}</span>
            </div>
            <div class="copyright-flow-title">${step.title}</div>
            <div class="copyright-flow-owner">${step.owner} - ${step.lane}</div>
            <div class="copyright-flow-desc">${step.description}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderIPOPHLOperationTimeline(submission) {
  const activeIdx = getIPOPHLStageIndex(submission);
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";
  const feeWaived = submission.paymentExempt;

  return `
    <div class="workflow-note">
      Reviewer = Technical Expert lane, PITBI Admin = Admin Staff / MIS lane, and Super Admin = IP Director approval authority inside this prototype.
      ${feeWaived ? "<br><strong>Fee-waived route:</strong> Steps 4\u20136 are bypassed because an approved letter-request is on file." : ""}
    </div>
    <div class="copyright-flow-grid">
      ${IPOPHL_OPERATION_FLOW.map((step, idx) => {
        const isPaymentStep = [3, 4, 5].includes(idx);
        let state = "pending";
        if (closed) {
          state = idx === 0 ? "completed" : "pending";
        } else if (feeWaived && isPaymentStep) {
          state = activeIdx > 2 ? "completed" : "pending";
        } else if (idx < activeIdx) {
          state = "completed";
        } else if (idx === activeIdx) {
          state = "active";
        }
        const skipped = feeWaived && isPaymentStep;
        const stateLabel = skipped
          ? state === "completed"
            ? "Skipped"
            : "Fee-waived"
          : state === "completed"
            ? "Completed"
            : state === "active"
              ? "Current"
              : "Pending";

        return `
          <div class="copyright-flow-card ${state}${skipped ? " skipped" : ""}">
            <div class="copyright-flow-meta">
              <span class="copyright-flow-step">Step ${step.step}</span>
              <span class="copyright-stage-pill ${state}">${stateLabel}</span>
            </div>
            <div class="copyright-flow-title">${step.title}</div>
            <div class="copyright-flow-owner">${step.owner} - ${step.lane}</div>
            <div class="copyright-flow-desc">${skipped ? "This step is bypassed under the approved letter-request route." : step.description}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function togglePaymentStatus(id) {
  const submission = submissions.find((entry) => entry.id === id);
  if (!submission) return;
  const normalizedRole = normalizeRole(currentRole);
  if (!["admin", "superadmin"].includes(normalizedRole)) {
    showToast("Only Admin or Super Admin can record payment status.");
    return;
  }
  if (submission.type === "Copyright" && submission.paymentExempt) {
    showToast("This copyright case uses the approved letter-request route.");
    return;
  }

  submission.paymentVerified = submission.paymentVerified === false;
  if (submission.paymentVerified) {
    submission.officialReceiptNumber =
      submission.officialReceiptNumber &&
      !submission.officialReceiptNumber.includes("Pending")
        ? submission.officialReceiptNumber
        : "Official Receipt #2026-0404";
    if (submission.type === "Copyright") {
      submission.copyrightStage = "mis-forwarding";
    } else if (IPOPHL_TYPES.has(submission.type)) {
      submission.ipophlStage = "mis-forwarding";
    }
  } else {
    submission.officialReceiptNumber =
      submission.type === "Copyright"
        ? "Pending cashier receipt"
        : "Pending receipt validation";
    if (submission.type === "Copyright") {
      submission.copyrightStage = "payment-slip-issued";
    } else if (IPOPHL_TYPES.has(submission.type)) {
      submission.ipophlStage = "payment-slip-issued";
    }
  }

  showToast(`${submission.id} payment record updated.`);
  navigateTo("submission-detail");
}

// ===== IP SEARCH PAGE =====
function renderIPSearchPage() {
  const normalizedRole = normalizeRole(currentRole);
  const results = (
    normalizedRole === "reviewer"
      ? getVisibleSubmissions(currentRole)
      : submissions
  )
    .filter(
      (item) => item.status === "Approved" || normalizedRole === "reviewer",
    )
    .slice(0, 5);
  return `
    <div class="page-header">
      <h1><i class="fa-solid fa-magnifying-glass"></i> Search</h1>
      <p>${normalizedRole === "reviewer" ? "Search assigned and approved records for manual review support." : "Search through approved PSU innovations and internal reference records."}</p>
    </div>
    <div class="detail-panel" style="margin-bottom:24px">
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <input type="text" placeholder="Search keywords, inventor name, or reference ID..." style="flex:1; padding:12px; border:1px solid var(--gray-200); border-radius:8px; outline:none;" />
        <button class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
      </div>
      <div style="display:flex; gap:20px; font-size:0.85rem; color:var(--gray-500);">
        <span><i class="fa-solid fa-sliders"></i> Filter:</span>
        <label><input type="checkbox" checked /> PSU Internal</label>
        <label><input type="checkbox" ${normalizedRole === "reviewer" ? "" : "checked"} /> IPOPHL Records</label>
        <label><input type="checkbox" /> Public Marketplace</label>
      </div>
    </div>
    <div class="table-container">
      <div class="table-header"><h3>Recent Results</h3></div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference</th><th>Type</th><th>Title</th><th>Status</th><th>Scope</th></tr></thead><tbody>
        ${results.map((item) => `<tr><td>${item.id}</td><td>${typeBadge(item.type)}</td><td>${item.title}</td><td>${statusBadge(item.status)}</td><td>${normalizedRole === "reviewer" ? "Assigned / Internal" : "Internal / Approved"}</td></tr>`).join("")}
      </tbody></table></div>
    </div>
  `;
}

// ===== SUBMISSION DETAIL =====
function renderSubmissionDetail() {
  const s = submissions.find((sub) => sub.id === selectedSubmissionId);
  if (!s) return "<p>Submission not found.</p>";
  if (!getVisibleSubmissions(currentRole).some((sub) => sub.id === s.id)) {
    return '<div class="detail-panel"><h3>Access Restricted</h3><p>This role cannot open the requested case.</p></div>';
  }
  const normalizedRole = normalizeRole(currentRole);
  const frozen = s.status === "Approved";
  const paymentVerified = s.paymentVerified !== false;
  const confidentialAccess = getDownloadAccess(s, "confidential");
  const topSecretAccess = s.hasTopSecretAnnex
    ? getDownloadAccess(s, "top_secret")
    : "deny";
  const paymentMeta = getSubmissionPaymentMeta(s);
  const paymentStyles =
    paymentMeta.theme === "green"
      ? {
          bg: "rgba(22,163,74,0.06)",
          border: "rgba(22,163,74,0.2)",
          color: "var(--green)",
        }
      : paymentMeta.theme === "blue"
        ? {
            bg: "rgba(59,130,246,0.06)",
            border: "rgba(59,130,246,0.2)",
            color: "var(--navy)",
          }
        : {
            bg: "rgba(239,68,68,0.06)",
            border: "rgba(239,68,68,0.2)",
            color: "var(--red)",
          };
  const copyrightStage =
    s.type === "Copyright"
      ? COPYRIGHT_OPERATION_FLOW.find(
          (step) => step.key === getCopyrightStageKey(s),
        )
      : null;

  return `
    <div class="page-header">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <h1 style="margin:0">${s.title}</h1>
        ${frozen ? '<span class="badge badge-frozen"><i class="fa-solid fa-lock"></i> Frozen for Certification</span>' : ""}
      </div>
      <p style="margin-top:8px">Submission Detail — ${s.id} &bull; Filed ${s.date}</p>
    </div>
    
    ${
      frozen
        ? `<div style="padding:14px 20px; background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
      <i class="fa-solid fa-lock" style="color:#6366f1; font-size:1.2rem;"></i>
      <div><strong style="color:#4f46e5;">Metadata Frozen</strong><p style="font-size:.85rem; color:var(--gray-500); margin:2px 0 0;">Per system policy, the core technical metadata of this approved submission has been locked and cannot be altered by administrators.</p></div>
    </div>`
        : ""
    }

    <div style="padding:12px 18px; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
      <i class="fa-solid fa-person-chalkboard" style="color:#d97706; font-size:1.1rem;"></i>
      <div><strong style="color:#d97706;">Manual Review Policy</strong><p style="font-size:.82rem; color:var(--gray-500); margin:2px 0 0;">This system does not use automated or AI-driven document assessment. All submissions undergo human evaluation by authorized IP Office personnel before status is updated.</p></div>
    </div>

    <div class="detail-layout">
      <div>
        <div class="detail-panel">
          <h3><i class="fa-solid fa-user"></i> Applicant Information</h3>
          <div class="detail-row"><span class="label">Name</span><span class="value">${s.applicant}</span></div>
          <div class="detail-row"><span class="label">Department</span><span class="value">${s.department}</span></div>
          <div class="detail-row"><span class="label">Email</span><span class="value">${s.email}</span></div>
          <div class="detail-row"><span class="label">Contact</span><span class="value">${s.contact}</span></div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-file-lines"></i> IP Details</h3>
          <div class="detail-row"><span class="label">Type</span><span class="value">${typeBadge(s.type)}</span></div>
          <div class="detail-row"><span class="label">Title</span><span class="value">${s.title}</span></div>
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">National Library Lane</span><span class="value">${s.registrationLane || "Copyright"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Work Type</span><span class="value">${s.workType || "Creative Work"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Official Duty Work</span><span class="value">${s.officialDutyWork ? "Yes" : "No"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Approved Letter-Request</span><span class="value">${s.letterRequestApproved ? "Yes" : "No"}</span></div>` : ""}
          <div class="detail-row"><span class="label">Description</span><span class="value">${s.description}</span></div>
          <div class="detail-row"><span class="label">Date Filed</span><span class="value">${s.date}</span></div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-paperclip"></i> Documents & Payment</h3>
          <div style="padding:16px;background:var(--gray-50);border-radius:8px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:10px">
              <i class="fa-solid fa-file-pdf" style="color:var(--red);font-size:1.3rem"></i>
              <div><div style="font-weight:600;font-size:.9rem">application_document.pdf</div><div style="font-size:.8rem;color:var(--gray-400)">Uploaded on ${s.date}</div></div>
            </div>
          </div>
          <div class="detail-actions" style="margin-top:0; margin-bottom:12px;">
            ${canUploadDocuments(s) ? `<button class="btn btn-secondary btn-sm" onclick="showToast('Document upload slot opened for ${s.id}')"><i class="fa-solid fa-upload"></i> Upload Documents</button>` : ""}
            ${confidentialAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading confidential packet for ${s.id}')"><i class="fa-solid fa-download"></i> Download Confidential</button>` : ""}
            ${topSecretAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading top secret annex for ${s.id}')"><i class="fa-solid fa-shield-halved"></i> Download Top Secret</button>` : ""}
            ${topSecretAccess === "approval" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Top secret download for ${s.id} requires super admin approval.')"><i class="fa-solid fa-key"></i> Top Secret Approval</button>` : ""}
          </div>
          <div style="padding:14px;background:${paymentVerified ? "rgba(22,163,74,0.06)" : "rgba(239,68,68,0.06)"};border:1px solid ${paymentVerified ? "rgba(22,163,74,0.2)" : "rgba(239,68,68,0.2)"};border-radius:8px;display:flex;align-items:center;gap:10px">
            <i class="fa-solid fa-${paymentVerified ? "circle-check" : "circle-xmark"}" style="color:var(--${paymentVerified ? "green" : "red"});font-size:1.2rem"></i>
            <div><div style="font-weight:700;font-size:.9rem;color:var(--${paymentVerified ? "green" : "red"})">${paymentVerified ? "Payment Verified" : "Awaiting Proof of Deposit"}</div><div style="font-size:.8rem;color:var(--gray-400)">proof_of_deposit.pdf — Official Receipt #2026-0321</div></div>
            ${normalizedRole === "admin" || normalizedRole === "superadmin" ? `<button class="btn btn-sm btn-success" style="margin-left:auto" onclick="showToast('Payment status updated')"><i class="fa-solid fa-${paymentVerified ? "check" : "upload"}"></i> ${paymentVerified ? "Verified" : "Mark Verified"}</button>` : ""}
          </div>
        </div>
      </div>
      <div>
        <div class="detail-panel">
          <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
          <div style="margin-bottom:16px">${statusBadge(s.status)}</div>
          ${
            canAdvanceSubmission(s) && !frozen
              ? `
          <label class="form-group" style="margin-bottom:12px">
            <span style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px">Update Status</span>
            <select onchange="changeStatus('${s.id}', this.value)" style="width:100%">
              <option ${s.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${s.status === "Under Review" ? "selected" : ""}>Under Review</option>
              <option ${s.status === "Awaiting Documents" ? "selected" : ""}>Awaiting Documents</option>
              <option ${s.status === "Approved" ? "selected" : ""}>Approved</option>
              <option ${s.status === "Rejected" ? "selected" : ""}>Rejected</option>
              ${canArchiveSubmission() ? `<option ${s.status === "Archived" ? "selected" : ""}>Archived</option>` : ""}
            </select>
          </label>`
              : frozen
                ? '<p style="font-size:.8rem;color:#6366f1;background:rgba(99,102,241,0.06);padding:10px;border-radius:6px;"><i class="fa-solid fa-lock"></i> Status changes are locked for certified submissions.</p>'
                : ""
          }
          ${
            canAdvanceSubmission(s) && !frozen
              ? `<div class="detail-actions">
            <button class="btn btn-success btn-sm" onclick="changeStatus('${s.id}','Approved')"><i class="fa-solid fa-check"></i> Approve</button>
            <button class="btn btn-danger btn-sm" onclick="changeStatus('${s.id}','Rejected')"><i class="fa-solid fa-xmark"></i> Reject</button>
            <button class="btn btn-secondary btn-sm" onclick="requestDocs('${s.id}')"><i class="fa-solid fa-file-circle-plus"></i> Request Docs</button>
            ${canArchiveSubmission() ? `<button class="btn btn-secondary btn-sm" onclick="archiveSubmission('${s.id}')"><i class="fa-solid fa-box-archive"></i> Archive</button>` : ""}
          </div>`
              : ""
          }
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-comment"></i> Admin Notes</h3>
          <div class="admin-notes">
            <textarea placeholder="Add internal notes about this submission..." ${frozen || !canEditSubmission(s) ? "disabled" : ""}></textarea>
            ${!frozen && canEditSubmission(s) ? `<button class="btn btn-sm btn-primary" onclick="showToast('Notes saved')">Save Notes</button>` : ""}
          </div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-timeline"></i> Activity Timeline</h3>
          <div class="timeline">
            ${s.status === "Approved" ? '<div class="timeline-item"><div class="time">Mar 29, 2026 — 11:00 AM</div><div class="event"><i class="fa-solid fa-lock" style="color:#6366f1"></i> Metadata frozen for certification</div></div>' : ""}
            <div class="timeline-item"><div class="time">Mar 27, 2026 — 2:32 PM</div><div class="event">Status changed to ${s.status} by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">Mar 26, 2026 — 9:45 AM</div><div class="event"><i class="fa-solid fa-receipt" style="color:var(--gold)"></i> Proof of Deposit verified</div></div>
            <div class="timeline-item"><div class="time">Mar 25, 2026 — 10:15 AM</div><div class="event">Documents reviewed by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">${s.date} — 9:00 AM</div><div class="event">Application submitted by ${s.applicant}</div></div>
          </div>
        </div>
      </div>
    </div>`;
}

// ===== FORM WIZARD =====
function getFormGuideContent() {
  const guides = {
    patent: {
      title: "Patent Application Guide",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      steps: [
        "Prepare inventor details (name, ID, department, email)",
        "Document your invention with detailed description and field of technology",
        "Prepare technical drawings and claims statement",
        "Upload all documents in PDF format",
        "Submit and receive your reference number for tracking",
      ],
      docs: [
        "Patent Application Form (PSU-IPO-PAT-01)",
        "Invention Disclosure Statement (min 2 pages)",
        "Technical Drawings / Diagrams",
        "Abstract (150 words max)",
        "Claims Statement",
        "Proof of Concept (optional)",
        "Prior Art Search Report (optional)",
      ],
    },
    trademark: {
      title: "Trademark Registration Guide",
      icon: "fa-stamp",
      color: "#f59e0b",
      steps: [
        "Provide applicant details and ownership type",
        "Define mark name, type (word/logo/combination), and goods/services",
        "Upload high-resolution mark specimen (PNG/JPG, 300+ DPI)",
        "Submit and track your application status",
      ],
      docs: [
        "Trademark Application Form (PSU-IPO-TM-01)",
        "Mark Specimen / Logo File (min 300 DPI)",
        "Description of Goods/Services",
        "Declaration of First Use",
        "Color Claim Statement (if applicable)",
      ],
    },
    copyright: {
      title: "Copyright Registration Guide",
      icon: "fa-copyright",
      color: "#10b981",
      steps: [
        "List all authors/creators with contributions",
        "Describe the work — title, type, date of creation",
        "Upload complete copy of the work being registered",
        "Submit and receive Certificate of Registration",
      ],
      docs: [
        "Copyright Registration Form (PSU-IPO-CR-01)",
        "Complete Copy of the Work",
        "Valid Philippine ID (Digitized)",
        "Declaration of Originality",
        "Authorship Agreement (for multiple authors)",
        "Publication History (if published, optional)",
      ],
    },
    utility: {
      title: "Utility Model Guide",
      icon: "fa-gears",
      color: "#6366f1",
      steps: [
        "Prepare inventor and technical details",
        "Describe the technical innovation and its industrial use",
        "Upload technical drawings/diagrams",
        "Submit and track application",
      ],
      docs: [
        "Utility Model Application Form",
        "Technical Description",
        "Technical Drawings",
        "Claims Statement",
      ],
    },
    industrial: {
      title: "Industrial Design Guide",
      icon: "fa-pen-nib",
      color: "#ec4899",
      steps: [
        "Provide applicant and product details",
        "Upload high-quality representations (photos/drawings) of the design",
        "Provide description of design features",
        "Submit and track application",
      ],
      docs: [
        "Industrial Design Application Form",
        "Design Representation Files",
        "Description of Design",
      ],
    },
  };
  const g = guides[currentFormType] || guides.patent;
  return `<div class="form-guide-panel">
    <div class="form-guide-toggle" onclick="this.parentElement.classList.toggle('open')">
      <span><i class="fa-solid fa-${g.icon}" style="color:${g.color}"></i> <strong>${g.title}</strong> — Required documents & steps</span>
      <i class="fa-solid fa-chevron-down"></i>
    </div>
    <div class="form-guide-body">
      <div class="form-guide-cols">
        <div><h4><i class="fa-solid fa-list-ol"></i> Steps</h4><ol class="guide-steps-list">${g.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>
        <div><h4><i class="fa-solid fa-file-lines"></i> Required Documents</h4><ul class="guide-docs-list">${g.docs.map((d, i) => `<li><i class="fa-solid fa-${i < (currentFormType === "patent" ? 5 : 4) ? "check-circle" : "circle"}" style="color:${i < (currentFormType === "patent" ? 5 : 4) ? "var(--green)" : "var(--gray-300)"};font-size:.8rem"></i> ${d}</li>`).join("")}</ul></div>
      </div>
    </div>
  </div>`;
}

function renderFormWizard(title) {
  const steps = [
    "Applicant Info",
    getStep2Label(),
    "Upload Documents",
    "Review & Submit",
  ];
  return `
    <div class="page-header"><h1>${title}</h1><p>Complete all steps to submit your application.</p></div>
    ${getFormGuideContent()}
    <div class="wizard-container">
      <div class="wizard-progress">
        ${steps
          .map(
            (
              s,
              i,
            ) => `<div class="wizard-step ${i + 1 === currentWizardStep ? "active" : ""} ${i + 1 < currentWizardStep ? "completed" : ""}" id="wizStep${i + 1}">
          <span class="step-num">${i + 1 < currentWizardStep ? '<i class="fa-solid fa-check"></i>' : i + 1}</span><span class="step-text">${s}</span>
        </div>`,
          )
          .join("")}
      </div>
      <div class="wizard-body" id="wizardBody">${renderWizardStep()}</div>
      <div class="wizard-footer">
        <button class="btn btn-secondary" onclick="prevWizardStep()" ${currentWizardStep === 1 ? "disabled" : ""}><i class="fa-solid fa-arrow-left"></i> Previous</button>
        ${
          currentWizardStep < 4
            ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next <i class="fa-solid fa-arrow-right"></i></button>`
            : `<button class="btn btn-success" onclick="submitForm()"><i class="fa-solid fa-paper-plane"></i> Submit Application</button>`
        }
      </div>
    </div>`;
}

function getStep2Label() {
  if (currentFormType === "patent" || currentFormType === "utility")
    return "Invention Details";
  if (currentFormType === "trademark") return "Mark Details";
  if (currentFormType === "industrial") return "Design Details";
  return "Work Details";
}

function renderWizardStep() {
  if (currentWizardStep === 1) return renderStep1();
  if (currentWizardStep === 2) return renderStep2();
  if (currentWizardStep === 3) return renderStep3();
  if (currentWizardStep === 4) return renderStep4Review();
  return "";
}

function renderStep1() {
  return `<h3 style="margin-bottom:24px">Applicant Information</h3>
    <div class="form-row">
      <div class="form-group"><label>Full Name *</label><input type="text" id="wiz-name" placeholder="Enter full name" required /></div>
      <div class="form-group"><label>Email *</label><input type="email" id="wiz-email" placeholder="your.email@psu.edu.ph" required /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Department *</label><input type="text" id="wiz-dept" placeholder="e.g., College of Engineering" required /></div>
      <div class="form-group"><label>College *</label>
        <select id="wiz-college"><option value="">Select College</option><option>College of Engineering</option><option>College of Sciences</option><option>College of Agriculture</option><option>College of Arts</option><option>Research Office</option></select></div>
    </div>
    <div class="form-group"><label>Contact Number</label><input type="tel" id="wiz-contact" placeholder="09XX XXX XXXX" /></div>`;
}

function renderStep2() {
  if (currentFormType === "patent") {
    return `<h3 style="margin-bottom:24px">Invention Details</h3>
      <div class="form-group"><label>Title of Invention *</label><input type="text" id="wiz-title" placeholder="Enter invention title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Field of Invention *</label><input type="text" id="wiz-field" placeholder="e.g., Environmental Engineering" /></div>
        <div class="form-group"><label>Date Conceived *</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Abstract (150 words max) *</label><textarea id="wiz-abstract" placeholder="Provide a concise abstract of your invention..." maxlength="900"></textarea></div>
      <div class="form-group"><label>Description *</label><textarea id="wiz-desc" placeholder="Provide a detailed description of your invention..."></textarea></div>
      <div class="form-group"><label>Claims Statement *</label><textarea id="wiz-claims" placeholder="List the specific claims of your invention..."></textarea></div>`;
  } else if (currentFormType === "trademark") {
    return `<h3 style="margin-bottom:24px">Mark Details</h3>
      <div class="form-group"><label>Mark Name *</label><input type="text" id="wiz-title" placeholder="Enter mark name" /></div>
      <div class="form-row">
        <div class="form-group"><label>Mark Type *</label>
          <select id="wiz-marktype"><option value="">Select Type</option><option>Word</option><option>Logo</option><option>Word & Logo</option></select></div>
        <div class="form-group"><label>Date of First Use</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Goods/Services Description *</label><textarea id="wiz-desc" placeholder="Describe the goods or services associated with this mark..."></textarea></div>
      <div class="form-group"><label>Color Claim Statement (if applicable)</label><textarea id="wiz-colorclaim" placeholder="Describe specific color claims for the mark, if any..."></textarea></div>`;
  } else if (currentFormType === "utility") {
    return `<h3 style="margin-bottom:24px">Utility Model Details</h3>
      <div class="form-group"><label>Title of Utility Model *</label><input type="text" id="wiz-title" placeholder="Enter utility model title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Technical Field *</label><input type="text" id="wiz-field" placeholder="e.g., Agricultural Machinery" /></div>
        <div class="form-group"><label>Date Conceived *</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Technical Description *</label><textarea id="wiz-desc" placeholder="Describe your utility model in detail, including its novel technical aspects..."></textarea></div>
      <div class="form-group"><label>Claims Statement *</label><textarea id="wiz-claims" placeholder="Define the specific claims of your utility model..."></textarea></div>
      <div class="form-group"><label>Industrial Applicability *</label><textarea id="wiz-industrial" placeholder="Explain how this model can be industrially produced or used..."></textarea></div>
      <div class="form-group"><label>Novelty Statement *</label><textarea id="wiz-novelty" placeholder="Describe what makes this model new compared to existing solutions..."></textarea></div>`;
  } else if (currentFormType === "industrial") {
    return `<h3 style="margin-bottom:24px">Industrial Design Details</h3>
      <div class="form-group"><label>Design Title *</label><input type="text" id="wiz-title" placeholder="Enter design title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Product Category *</label>
          <select id="wiz-prodcat"><option value="">Select Category</option><option>Furniture</option><option>Packaging</option><option>Tools & Equipment</option><option>Fashion & Accessories</option><option>Household Items</option><option>Electronics Housing</option><option>Transportation</option><option>Other</option></select></div>
        <div class="form-group"><label>Design Type *</label>
          <select id="wiz-designtype"><option value="">Select Type</option><option>3D (Shape/Form)</option><option>2D (Pattern/Lines/Color)</option><option>Combination (3D + 2D)</option></select></div>
      </div>
      <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" /></div>
      <div class="form-group"><label>Design Statement *</label><textarea id="wiz-desc" placeholder="Describe the ornamental or aesthetic aspects of your design that give it a special appearance..."></textarea></div>
      <div class="form-group"><label>Visual Representation Description *</label><textarea id="wiz-visual" placeholder="Describe the views (front, back, top, side, perspective) you will upload as representations of the design..."></textarea></div>`;
  } else {
    return `<h3 style="margin-bottom:24px">Work Details</h3>
      <div class="form-group"><label>Title of Work *</label><input type="text" id="wiz-title" placeholder="Enter title of work" /></div>
      <div class="form-row">
        <div class="form-group"><label>Type of Work *</label>
          <select id="wiz-worktype"><option value="">Select Type</option><option>Literary Work</option><option>Musical Work</option><option>Software Application</option><option>Artistic Work</option><option>Audio/Visual Work</option></select></div>
        <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Description *</label><textarea id="wiz-desc" placeholder="Describe your creative work..."></textarea></div>
      <div class="form-group"><label>Declaration of Originality *</label><textarea id="wiz-originality" placeholder="I hereby declare that this work is an original creation..."></textarea></div>`;
  }
}

function renderStep3() {
  const docMap = {
    patent: [
      "Patent Application Form (PSU-IPO-PAT-01)",
      "Invention Disclosure Statement",
      "Technical Drawings / Diagrams",
      "Abstract",
      "Claims Statement",
    ],
    trademark: [
      "Trademark Application Form (PSU-IPO-TM-01)",
      "Mark Specimen / Logo File (300+ DPI)",
      "Description of Goods/Services",
      "Declaration of First Use",
    ],
    copyright: [
      "Copyright Registration Form (PSU-IPO-CR-01)",
      "Complete Copy of the Work",
      "Valid Philippine ID (Digitized)",
      "Declaration of Originality",
    ],
    utility: [
      "Utility Model Application Form",
      "Technical Description",
      "Technical Drawings/Illustrations",
      "Claims Statement",
      "Novelty Statement",
    ],
    industrial: [
      "Industrial Design Application Form",
      "Design Representations (Photos/3D renders)",
      "Description of Design",
      "Product Category Statement",
    ],
  };
  const requiredDocs = docMap[currentFormType] || docMap.patent;

  return `<h3 style="margin-bottom:24px">Upload Supporting Documents</h3>
    <div class="requirement-checklist" style="background:var(--gray-50); border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid var(--gray-200);">
      <h4 style="font-size:.9rem; color:var(--navy); margin-bottom:12px;"><i class="fa-solid fa-clipboard-check" style="color:var(--gold); margin-right:6px;"></i> Required Documents Checklist</h4>
      <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
        ${requiredDocs.map((d) => `<li style="font-size:.85rem; color:var(--gray-600); display:flex; align-items:center; gap:8px;"><i class="fa-regular fa-square" style="color:var(--gray-300);"></i> ${d}</li>`).join("")}
      </ul>
    </div>
    <div class="upload-area" onclick="document.getElementById('fileInput').click()">
      <i class="fa-solid fa-cloud-arrow-up"></i>
      <p>Drag & drop your files here, or <span class="browse-text">browse</span></p>
      <p style="font-size:.8rem;margin-top:8px;color:var(--gray-400)">Supported: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
      <input type="file" id="fileInput" style="display:none" onchange="handleFileUpload(this)" multiple />
    </div>
    <div id="fileList" style="margin-top:16px"></div>

    <div class="proof-of-deposit" style="margin-top:28px; border:2px dashed var(--gold); border-radius:12px; padding:24px; background:rgba(255,127,80,0.04);">
      <h4 style="font-size:.95rem; color:var(--navy); margin-bottom:6px;"><i class="fa-solid fa-receipt" style="color:var(--gold); margin-right:8px;"></i> Financial Verification — Proof of Deposit <span class="badge badge-pending" style="font-size:.65rem; vertical-align:middle; margin-left:8px;">REQUIRED</span></h4>
      <p style="font-size:.82rem; color:var(--gray-500); margin-bottom:16px; line-height:1.6;">
        Per university policy, all IP applications require a valid Proof-of-Deposit or Official Receipt before the submission can be forwarded for review. Upload a scanned copy or photo of your receipt below.
      </p>
      <div class="upload-area" onclick="document.getElementById('depositInput').click()" style="border-color:var(--gold); background:rgba(255,127,80,0.03);">
        <i class="fa-solid fa-file-invoice-dollar" style="color:var(--gold);"></i>
        <p>Upload Proof-of-Deposit / Official Receipt</p>
        <p style="font-size:.8rem;margin-top:8px;color:var(--gray-400)">JPG, PNG, or PDF (max 5MB)</p>
        <input type="file" id="depositInput" style="display:none" onchange="handleDepositUpload(this)" accept=".jpg,.jpeg,.png,.pdf" />
      </div>
      <div id="depositFileStatus" style="margin-top:12px;"></div>
    </div>`;
}

function renderStep4Review() {
  const val = (v) =>
    v
      ? `<span class="value">${v}</span>`
      : `<span class="value" style="color:var(--gray-400);font-style:italic;">Not provided</span>`;
  return `<h3 style="margin-bottom:24px">Review Your Application</h3>
    <div class="review-section"><h4><i class="fa-solid fa-user" style="color:var(--gold);margin-right:6px"></i>Applicant Information</h4>
      <div class="review-grid">
        <div class="review-item"><span class="label">Name</span>${val(wizardData.name)}</div>
        <div class="review-item"><span class="label">Email</span>${val(wizardData.email)}</div>
        <div class="review-item"><span class="label">Department</span>${val(wizardData.dept)}</div>
        <div class="review-item"><span class="label">College</span>${val(wizardData.college)}</div>
        ${wizardData.contact ? `<div class="review-item"><span class="label">Contact</span>${val(wizardData.contact)}</div>` : ""}
      </div>
    </div>
    <div class="review-section"><h4><i class="fa-solid fa-file-lines" style="color:var(--gold);margin-right:6px"></i>${getStep2Label()}</h4>
      <div class="review-grid">
        <div class="review-item"><span class="label">Title</span>${val(wizardData.title)}</div>
        ${wizardData.date ? `<div class="review-item"><span class="label">Date</span>${val(wizardData.date)}</div>` : ""}
        ${wizardData.field ? `<div class="review-item"><span class="label">Field</span>${val(wizardData.field)}</div>` : ""}
        ${wizardData.marktype ? `<div class="review-item"><span class="label">Mark Type</span>${val(wizardData.marktype)}</div>` : ""}
        ${wizardData.worktype ? `<div class="review-item"><span class="label">Work Type</span>${val(wizardData.worktype)}</div>` : ""}
        ${wizardData.prodcat ? `<div class="review-item"><span class="label">Product Category</span>${val(wizardData.prodcat)}</div>` : ""}
        ${wizardData.designtype ? `<div class="review-item"><span class="label">Design Type</span>${val(wizardData.designtype)}</div>` : ""}
      </div>
      ${wizardData.desc ? `<div class="review-item" style="margin-top:12px"><span class="label">Description</span><span class="value" style="white-space:pre-wrap;line-height:1.6">${wizardData.desc.substring(0, 400)}${wizardData.desc.length > 400 ? "…" : ""}</span></div>` : ""}
    </div>
    <div class="review-section"><h4><i class="fa-solid fa-paperclip" style="color:var(--gold);margin-right:6px"></i>Documents & Payment</h4>
      <p style="color:var(--gray-500);font-size:.9rem">Supporting documents and Proof-of-Deposit were uploaded in Step 3.</p>
    </div>
    <div style="padding:16px 20px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;margin-top:4px;font-size:.85rem;color:#92400e;display:flex;gap:10px;align-items:flex-start">
      <i class="fa-solid fa-person-chalkboard" style="color:#d97706;margin-top:2px"></i>
      <div><strong>Manual Review Policy:</strong> Your submission will be reviewed by PSU IP Office staff. No AI-driven assessment occurs. You will be notified at your registered email once review is complete.</div>
    </div>`;
}

function captureWizardData() {
  if (currentWizardStep === 1) {
    wizardData.name =
      document.getElementById("wiz-name")?.value || wizardData.name || "";
    wizardData.email =
      document.getElementById("wiz-email")?.value || wizardData.email || "";
    wizardData.dept =
      document.getElementById("wiz-dept")?.value || wizardData.dept || "";
    wizardData.college =
      document.getElementById("wiz-college")?.value || wizardData.college || "";
    wizardData.contact =
      document.getElementById("wiz-contact")?.value || wizardData.contact || "";
  }
  if (currentWizardStep === 2) {
    wizardData.title =
      document.getElementById("wiz-title")?.value || wizardData.title || "";
    wizardData.date =
      document.getElementById("wiz-date")?.value || wizardData.date || "";
    wizardData.desc =
      document.getElementById("wiz-desc")?.value || wizardData.desc || "";
    wizardData.field =
      document.getElementById("wiz-field")?.value || wizardData.field || "";
    wizardData.abstract =
      document.getElementById("wiz-abstract")?.value ||
      wizardData.abstract ||
      "";
    wizardData.claims =
      document.getElementById("wiz-claims")?.value || wizardData.claims || "";
    wizardData.marktype =
      document.getElementById("wiz-marktype")?.value ||
      wizardData.marktype ||
      "";
    wizardData.worktype =
      document.getElementById("wiz-worktype")?.value ||
      wizardData.worktype ||
      "";
    wizardData.prodcat =
      document.getElementById("wiz-prodcat")?.value || wizardData.prodcat || "";
    wizardData.designtype =
      document.getElementById("wiz-designtype")?.value ||
      wizardData.designtype ||
      "";
  }
}

function nextWizardStep() {
  captureWizardData();
  if (currentWizardStep < 4) {
    currentWizardStep++;
    refreshWizard();
  }
}
function prevWizardStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    refreshWizard();
  }
}
function refreshWizard() {
  document.querySelectorAll(".wizard-step").forEach((s, i) => {
    s.classList.remove("active", "completed");
    if (i + 1 === currentWizardStep) s.classList.add("active");
    else if (i + 1 < currentWizardStep) s.classList.add("completed");
  });
  document.getElementById("wizardBody").innerHTML = renderWizardStep();
  const footer = document.querySelector(".wizard-footer");
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="prevWizardStep()" ${currentWizardStep === 1 ? "disabled" : ""}><i class="fa-solid fa-arrow-left"></i> Previous</button>
    ${
      currentWizardStep < 4
        ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next <i class="fa-solid fa-arrow-right"></i></button>`
        : `<button class="btn btn-success" onclick="submitForm()"><i class="fa-solid fa-paper-plane"></i> Submit Application</button>`
    }`;
}

function handleFileUpload(input) {
  const list = document.getElementById("fileList");
  if (!list) return;
  let html = "";
  for (const f of input.files) {
    html += `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--gray-50);border-radius:8px;margin-bottom:8px">
      <i class="fa-solid fa-file-pdf" style="color:var(--red)"></i>
      <span style="flex:1;font-size:.9rem">${f.name}</span>
      <span style="font-size:.8rem;color:var(--gray-400)">${(f.size / 1024).toFixed(1)} KB</span>
    </div>`;
  }
  list.innerHTML = html;
}

function handleDepositUpload(input) {
  const status = document.getElementById("depositFileStatus");
  if (!status || !input.files.length) return;
  const f = input.files[0];
  status.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);border-radius:8px">
    <i class="fa-solid fa-circle-check" style="color:var(--green);font-size:1.2rem"></i>
    <div style="flex:1">
      <div style="font-size:.9rem;font-weight:600;color:var(--navy)">${f.name}</div>
      <div style="font-size:.8rem;color:var(--gray-400)">${(f.size / 1024).toFixed(1)} KB — Proof of Deposit uploaded</div>
    </div>
    <span class="badge badge-approved" style="font-size:.65rem">VERIFIED</span>
  </div>`;
}

function submitForm() {
  const typeMap = {
    patent: "Patent",
    trademark: "Trademark",
    copyright: "Copyright",
    utility: "Utility Model",
    industrial: "Industrial Design",
  };
  const prefix = {
    patent: "PAT",
    trademark: "TM",
    copyright: "COP",
    utility: "UM",
    industrial: "ID",
  };
  const refNum = `PSU-${prefix[currentFormType]}-2026-${String(submissions.length + 1).padStart(3, "0")}`;
  const newSub = {
    id: refNum,
    type: typeMap[currentFormType],
    title: "New Research Innovation",
    applicant: "Juan dela Cruz",
    department: "College of Sciences",
    email: "juan.delacruz@psu.edu.ph",
    contact: "09181234567",
    status: "Pending",
    date: "2026-03-28",
    description: "Newly submitted application.",
    paymentVerified: true,
    frozen: false,
  };
  submissions.unshift(newSub);

  document.getElementById("main-content").innerHTML = `
    <div class="confirmation-screen">
      <div class="check-circle"><i class="fa-solid fa-check"></i></div>
      <h2>Application Submitted Successfully!</h2>
      <p style="color:var(--gray-500)">Your ${typeMap[currentFormType]} application has been received and is now under review.</p>
      <div class="ref-number">${refNum}</div>
      <p style="font-size:.85rem;color:var(--gray-400);margin-bottom:24px">Please save this reference number for tracking purposes.</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-primary" onclick="navigateTo('user-dashboard')"><i class="fa-solid fa-chart-line"></i> Go to Dashboard</button>
        <button class="btn btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-file-lines"></i> View Submissions</button>
      </div>
    </div>`;
}

// ===== MARKETPLACE =====
function renderMarketplace() {
  return `
    <div class="page-header"><h1>Innovation Marketplace</h1><p>Discover and connect with PSU innovations and research outputs.</p></div>
    <div class="marketplace-layout">
      <div class="filter-panel">
        <h3><i class="fa-solid fa-filter"></i> Filters</h3>
        <div class="filter-group"><label>Type</label>
          <select id="mpFilterType" onchange="filterMarketplace()"><option value="All">All Types</option><option>Patent</option><option>Utility Model</option><option>Industrial Design</option><option>Trademark</option><option>Copyright</option></select></div>
        <div class="filter-group"><label>College</label>
          <select id="mpFilterCollege" onchange="filterMarketplace()"><option value="All">All Colleges</option><option>College of Engineering</option><option>College of Sciences</option><option>College of Agriculture</option><option>College of Arts</option></select></div>
        <div class="filter-group"><label>Year</label>
          <select id="mpFilterYear" onchange="filterMarketplace()"><option value="All">All Years</option><option>2026</option><option>2025</option></select></div>
      </div>
      <div>
        <div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="mpSearch" placeholder="Search innovations..." oninput="filterMarketplace()" /></div>
        <div class="innovation-grid" id="innovationGrid">${renderInnovationCards(marketplaceItems)}</div>
      </div>
    </div>`;
}

function renderInnovationCards(items) {
  return items
    .map(
      (item) => `
    <div class="innovation-card" onclick="showInnovationDetail(${item.id})">
      <div class="innovation-card-img" ${item.image ? `style="background:url('${item.image}') center/cover no-repeat"` : ""}>${!item.image ? `<i class="${item.icon}"></i>` : ""}</div>
      <div class="innovation-card-body">
        <h4>${item.title}</h4>
        <div class="innovation-meta">${typeBadge(item.type)} <span><i class="fa-solid fa-user"></i> ${item.inventor}</span> <span><i class="fa-solid fa-building-columns"></i> ${item.college}</span></div>
        <p>${item.description.substring(0, 100)}...</p>
        <span class="learn-more">Learn More <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>`,
    )
    .join("");
}

function filterMarketplace() {
  const type = document.getElementById("mpFilterType")?.value || "All";
  const college = document.getElementById("mpFilterCollege")?.value || "All";
  const year = document.getElementById("mpFilterYear")?.value || "All";
  const search = document.getElementById("mpSearch")?.value.toLowerCase() || "";
  let filtered = marketplaceItems.filter((item) => {
    if (type !== "All" && item.type !== type) return false;
    if (college !== "All" && item.college !== college) return false;
    if (year !== "All" && item.year !== parseInt(year)) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search) &&
      !item.description.toLowerCase().includes(search)
    )
      return false;
    return true;
  });
  document.getElementById("innovationGrid").innerHTML = filtered.length
    ? renderInnovationCards(filtered)
    : '<p style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:60px 0">No innovations found matching your criteria.</p>';
}

function showInnovationDetail(id) {
  const item = marketplaceItems.find((i) => i.id === id);
  if (!item) return;

  const modalCard = document.querySelector(".modal-card");
  if (modalCard) modalCard.classList.add("xl");

  document.getElementById("modalTitle").style.display = "none"; // Custom title inside body
  document.getElementById("modalBody").innerHTML = `
    <div class="ip-detail-scroll">
      <div class="ip-detail-grid">
        <!-- Main Content -->
        <div class="ip-detail-main">
          <div class="ip-detail-header-group">
            <h1 class="ip-detail-title-large">${item.fullTitle || item.title}</h1>
            <p class="ip-detail-subtitle">${item.type} Title: <span>${item.fullTitle || item.title}</span></p>
          </div>

          <section>
            <span class="ip-detail-section-label">Description</span>
            <p class="ip-detail-text">${item.longDescription || item.description}</p>
          </section>

          <section>
            <span class="ip-detail-section-label">Innovative Features and Benefits:</span>
            <ul class="ip-detail-features-list">
              ${(item.features || []).map((f) => `<li class="ip-detail-text">${f}</li>`).join("")}
            </ul>
          </section>

          <section>
            <span class="ip-detail-section-label">Business Potential:</span>
            <p class="ip-detail-text">${item.businessPotential || "High potential for commercialization and industry licensing within its respective sector."}</p>
          </section>

          <footer class="detail-footer-contact">
            If you are interested to know more about this technology and its owners, please feel free 
            to contact <strong>${item.contactPerson || item.inventor}</strong> at 
            <a href="mailto:${item.contactEmail || "techtransfer@psu.edu.ph"}">${item.contactEmail || "techtransfer@psu.edu.ph"}</a>
          </footer>
        </div>

        <!-- Sidebar / Visuals -->
        <div class="ip-detail-side">
          <div class="ip-product-visual" style="background-image: url('${item.image}')"></div>
          <p style="text-align:center; font-size:0.9rem; color:#666; font-weight:600; margin-top:-10px">
            ${item.title.split(" ").slice(0, 2).join(" ")} visual
          </p>
          
          <div class="carousel-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
          </div>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0">

          <div class="inquiry-box">
            <h4>Interested in this IP?</h4>
            <button class="btn-contact" onclick="closeModal(); showToast('Inquiry request sent to ${item.contactPerson || item.inventor}')">Contact us</button>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  const modalCard = document.querySelector(".modal-card");
  if (modalCard) modalCard.classList.remove("xl");
  // Reset title display for regular modals
  document.getElementById("modalTitle").style.display = "block";
}

// ===== AUDIT LOG =====
function renderAuditLog() {
  const visibleLogs = getVisibleAuditLogs(currentRole);
  return `
    <div class="page-header"><h1>Audit Log</h1><p>System activity and change tracking.</p></div>
    <div class="audit-filters">
      <div class="form-group"><label>From Date</label><input type="date" id="auditFrom" /></div>
      <div class="form-group"><label>To Date</label><input type="date" id="auditTo" /></div>
      <div class="form-group"><label>Action</label>
        <select id="auditAction" onchange="filterAudit()"><option value="All">All Actions</option><option>Submitted</option><option>Approved</option><option>Rejected</option><option>Status Changed</option><option>Exported</option><option>User Created</option></select></div>
      ${canExportAudit() ? '<button class="btn btn-primary btn-sm" style="margin-top:auto" onclick="exportCSV()"><i class="fa-solid fa-download"></i> Export CSV</button>' : ""}
    </div>
    <div class="table-container"><div class="table-responsive"><table class="data-table" id="auditTable"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Details</th><th>IP Address</th></tr></thead><tbody>
      ${visibleLogs.map((l) => `<tr><td>${l.timestamp}</td><td>${l.user}</td><td><span class="badge badge-review">${l.action}</span></td><td>${l.module}</td><td>${l.detail}</td><td>${l.ip}</td></tr>`).join("")}
    </tbody></table></div></div>`;
}

function filterAudit() {
  const action = document.getElementById("auditAction").value;
  const rows = document.querySelectorAll("#auditTable tbody tr");
  rows.forEach((row) => {
    const a = row.children[2].textContent;
    row.style.display = action === "All" || a.includes(action) ? "" : "none";
  });
}

function exportCSV() {
  if (!canExportAudit()) {
    showToast("Only the super admin can export the audit trail.");
    return;
  }
  let csv = "Timestamp,User,Action,Module,Details,IP Address\n";
  getVisibleAuditLogs(currentRole).forEach((l) => {
    csv += `"${l.timestamp}","${l.user}","${l.action}","${l.module}","${l.detail}","${l.ip}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "audit_log.csv";
  a.click();
  showToast("CSV file exported successfully!");
}

// ===== EXTRA PAGES =====
function getTrackingSteps(status) {
  const stepOrder = [
    "Submitted",
    "Payment Verified",
    "Under Review",
    "Forwarded to IPOPHL",
    "Registered",
  ];
  const statusMap = {
    Pending: 0,
    "Awaiting Documents": 0,
    "Under Review": 2,
    Approved: 4,
    Rejected: -1,
    Archived: -1,
  };
  const activeIdx = statusMap[status] ?? 0;
  return stepOrder.map((label, i) => {
    let cls = "pending",
      icon = "fa-circle";
    if (activeIdx < 0) {
      cls = i === 0 ? "completed" : "pending";
    } else if (i < activeIdx) {
      cls = "completed";
      icon = "fa-check";
    } else if (i === activeIdx) {
      cls = "active";
      icon = "fa-circle-dot";
    }
    return { label, cls, icon };
  });
}

function getPreciseSubmissionSteps(s) {
  const isCR = s.type === "Copyright";
  const flow = isCR ? COPYRIGHT_OPERATION_FLOW : IPOPHL_OPERATION_FLOW;
  const activeIdx = isCR ? getCopyrightStageIndex(s) : getIPOPHLStageIndex(s);
  const approved = s.status === "Approved";
  const closed = s.status === "Rejected" || s.status === "Archived";

  return flow.map((step, i) => {
    let cls = "pending",
      icon = "fa-circle";
    if (approved) {
      cls = "completed";
      icon = "fa-check";
    } else if (closed) {
      cls = i === 0 ? "completed" : "pending";
      icon = i === 0 ? "fa-check" : "fa-circle";
    } else if (i < activeIdx) {
      cls = "completed";
      icon = "fa-check";
    } else if (i === activeIdx) {
      cls = "active";
      icon = "fa-circle-dot";
    }
    return { label: step.title, cls, icon };
  });
}

function renderUserSubmissions() {
  // Filters are now maintained globally to prevent reset on navigation
  if (typeof userFilterType === "undefined") {
    userFilterType = "All";
    userFilterStatus = "All";
    userSearchQuery = "";
  }
  return `
    <div class="page-header">
      <h1>My IP Applications</h1>
      <p>Track the real-time status and operational precision of your submissions.</p>
    </div>
    
    <div class="user-controls-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; gap:16px; flex-wrap:wrap;">
      <div style="display:flex; gap:12px; align-items:center; flex:1;">
        <div class="search-box" style="max-width:350px; width:100%;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="userSearchInput" placeholder="Search your cases..." oninput="filterUserSearch(this.value)" />
        </div>
        <select class="filter-select" id="userStatusSelect" onchange="filterUserStatus(this.value)" style="width:160px;">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Awaiting Documents">Awaiting Docs</option>
        </select>
      </div>
      <div class="filter-tabs" style="display:flex; gap:8px;">
        <button class="filter-btn active" onclick="filterUserTable('All', this)">All</button>
        <button class="filter-btn" onclick="filterUserTable('Patent', this)">Patent</button>
        <button class="filter-btn" onclick="filterUserTable('Trademark', this)">TM</button>
        <button class="filter-btn" onclick="filterUserTable('Copyright', this)">CR</button>
        <button class="filter-btn" onclick="filterUserTable('Utility Model', this)">UM</button>
        <button class="filter-btn" onclick="filterUserTable('Industrial Design', this)">ID</button>
      </div>
    </div>

    <div id="userSubmissionsList">
      ${renderUserSubmissionsTable()}
    </div>
  `;
}

function renderUserSubmissionsTable(filterType, filterStatus, searchQuery) {
  try {
    let filtered = [...getVisibleSubmissions("client")];

    const ft = filterType || userFilterType;
    const fs = filterStatus || userFilterStatus;
    const sq = searchQuery !== undefined ? searchQuery : userSearchQuery;

    if (ft && ft !== "All") filtered = filtered.filter((s) => s.type === ft);
    if (fs && fs !== "All") filtered = filtered.filter((s) => s.status === fs);

    if (sq) {
      const q = sq.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
      );
    }

    if (!filtered.length) {
      return `
        <div style="text-align:center; padding:60px 0; background:white; border-radius:12px; border:2px dashed var(--gray-200);">
          <i class="fa-solid fa-inbox" style="font-size:3rem; color:var(--gray-200); margin-bottom:16px;"></i>
          <h3 style="color:var(--gray-400);">No matching cases found</h3>
          <p style="color:var(--gray-400); font-size:0.9rem;">Try adjusting your filters or search query.</p>
        </div>`;
    }

    return filtered
      .map((s) => {
        const isCR = s.type === "Copyright";
        const flow = isCR ? COPYRIGHT_OPERATION_FLOW : IPOPHL_OPERATION_FLOW;
        const stageIdx = isCR
          ? getCopyrightStageIndex(s)
          : getIPOPHLStageIndex(s);
        const steps = getPreciseSubmissionSteps(s);
        const totalStages = flow.length;
        const currentStepObj = flow[stageIdx] || (flow.length ? flow[0] : null);

        const frozen = s.status === "Approved";
        const needsAction = s.status === "Awaiting Documents";

        return `
      <div class="case-card ${needsAction ? "needs-action" : ""}" style="margin-bottom:20px; background:white; border-radius:12px; border:1px solid var(--gray-200); overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div class="case-card-header" style="padding:20px 24px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:${needsAction ? "rgba(239, 68, 68, 0.02)" : "white"}" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.chevron-icon').classList.toggle('fa-rotate-180')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div class="case-type-icon" style="width:40px; height:40px; border-radius:10px; background:var(--gray-50); display:flex; align-items:center; justify-content:center; color:var(--navy);">
              <i class="fa-solid ${isCR ? "fa-copyright" : s.type === "Trademark" ? "fa-stamp" : "fa-lightbulb"}"></i>
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <h3 style="font-size:1.05rem; font-weight:800; color:var(--navy); margin:0">${s.title}</h3>
                ${typeBadge(s.type)}
                ${needsAction ? '<span class="badge badge-rejected" style="font-size:0.7rem;"><i class="fa-solid fa-triangle-exclamation"></i> ACTION REQUIRED</span>' : ""}
              </div>
              <div style="font-size:0.85rem; color:var(--gray-500); display:flex; align-items:center; gap:12px;">
                <span><i class="fa-solid fa-hashtag" style="font-size:0.75rem; margin-right:4px;"></i>${s.id}</span>
                <span><i class="fa-solid fa-calendar" style="font-size:0.75rem; margin-right:4px;"></i>Filed ${s.date}</span>
                <span style="color:var(--gold-dark); font-weight:600;"><i class="fa-solid fa-layer-group" style="font-size:0.75rem; margin-right:4px;"></i>Step ${stageIdx + 1} of ${totalStages}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="text-align:right;">
              ${statusBadge(s.status)}
              <div style="font-size:0.75rem; color:var(--gray-400); margin-top:4px;">Last updated: Just now</div>
            </div>
            <i class="fa-solid fa-chevron-down chevron-icon"></i>
          </div>
        </div>
        
        <div class="case-detail-panel hidden" style="border-top:1px solid var(--gray-100);">
          <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:24px; margin-top:24px;">
            <div class="workflow-visual">
              <h4 style="font-size:0.9rem; color:var(--navy); font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-diagram-project" style="color:var(--gold);"></i> Submission Progress
              </h4>
              <div class="tracking-timeline">
                ${steps
                  .map(
                    (step, idx) => {
                      const isCompleted = idx < stageIdx;
                      const isCurrent = idx === stageIdx;
                      const statusClass = isCompleted ? "completed" : isCurrent ? "current" : "";
                      return `
                  <div class="tracking-step ${statusClass}">
                    <div class="step-dot">${isCompleted ? '<i class="fa-solid fa-check"></i>' : idx + 1}</div>
                    <div class="step-info">
                      <div style="font-size:0.85rem; font-weight:700; color:${isCurrent ? "var(--gold-dark)" : "var(--navy)"}">${step.label}</div>
                      ${isCurrent ? `<div style="font-size:0.75rem; color:var(--gray-500); margin-top:4px;">${currentStepObj.description}</div>` : ""}
                    </div>
                  </div>`;
                    },
                  )
                  .join("")}
              </div>
              
              ${
                currentStepObj
                  ? `
                <div class="current-step-detail" style="margin-top:20px; padding:16px; background:white; border-radius:8px; border:1px solid var(--gray-200);">
                  <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--gold-dark); text-transform:uppercase; letter-spacing:0.5px;">Current Stage Detail</span>
                    <span style="font-size:0.75rem; color:var(--gray-400);">Responsible: ${currentStepObj.lane}</span>
                  </div>
                  <h5 style="font-size:0.95rem; font-weight:700; color:var(--navy); margin-bottom:8px;">${currentStepObj.title}</h5>
                  <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.5; margin:0;">${currentStepObj.description}</p>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="case-meta-sidebar">
              <h4 style="font-size:0.9rem; color:var(--navy); font-weight:700; margin-bottom:16px;">Quick Info</h4>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                  <span style="color:var(--gray-500);">Assigned Reviewer</span>
                  <span style="font-weight:600; color:var(--navy);">${s.assignedReviewerId ? "Expert Reviewer" : "Unassigned"}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                  <span style="color:var(--gray-500);">Intellectual Property</span>
                  <span style="font-weight:600; color:var(--navy);">${s.type}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                  <span style="color:var(--gray-500);">College / Dept</span>
                  <span style="font-weight:600; color:var(--navy);">${s.department || "N/A"}</span>
                </div>
                <div style="border-top:1px solid var(--gray-200); margin:8px 0; padding-top:12px;">
                  <button class="btn btn-sm btn-outline-navy" style="width:100%; justify-content:center;" onclick="viewSubmission('${s.id}')">
                    <i class="fa-solid fa-circle-info"></i> Full Details & History
                  </button>
                  ${
                    needsAction
                      ? `
                    <button class="btn btn-sm btn-primary" style="width:100%; justify-content:center; margin-top:8px;" onclick="viewSubmission('${s.id}')">
                      <i class="fa-solid fa-upload"></i> Upload Requirements
                    </button>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error("renderUserSubmissionsTable Error:", err);
    return `<div class="error-msg show">Error loading submissions: ${err.message}</div>`;
  }
}

function renderProfile() {
  const user = getCurrentUser();
  const name = user.name;
  const role = getRoleMeta().label;
  return `<div class="page-header"><h1>My Profile</h1></div>
    <div class="profile-card">
      <div class="profile-header"><div class="profile-avatar"><i class="fa-solid fa-user"></i></div><div><h2>${name}</h2><p style="color:var(--gray-500)">${role}</p></div></div>
      <div class="form-group"><label>Full Name</label><input type="text" value="${name}" /></div>
      <div class="form-group"><label>Email</label><input type="email" value="${user.email}" /></div>
      <div class="form-group"><label>Department</label><input type="text" value="${user.dept}" /></div>
      <div class="form-group"><label>Contact</label><input type="tel" value="09181234567" /></div>
      <button class="btn btn-primary" onclick="showToast('Profile updated successfully!')"><i class="fa-solid fa-save"></i> Save Changes</button>
    </div>`;
}

function renderAdminRecords() {
  const approved = submissions.filter((s) => s.status === "Approved");
  return `<div class="page-header"><h1>IP Records</h1><p>All certified intellectual properties — metadata is locked for integrity.</p></div>
    <div style="padding:12px 18px; background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
      <i class="fa-solid fa-shield-halved" style="color:#6366f1; font-size:1.1rem;"></i>
      <p style="font-size:.85rem; color:var(--gray-600); margin:0;"><strong style="color:#4f46e5">Certified Records Archive</strong> — All records below have been certified and their metadata is <strong>frozen for protection</strong>. Administrators may not alter core technical fields of these submissions.</p>
    </div>
    <div class="table-container"><div class="table-responsive"><table class="data-table"><thead><tr><th>Reference</th><th>Type</th><th>Title</th><th>Owner</th><th>Department</th><th>Status</th><th>Integrity</th></tr></thead><tbody>
      ${approved
        .map(
          (s) => `<tr>
        <td>${s.id}</td>
        <td>${typeBadge(s.type)}</td>
        <td>${s.title}</td>
        <td>${s.applicant}</td>
        <td>${s.department}</td>
        <td>${statusBadge(s.status)}</td>
        <td><span class="badge badge-frozen"><i class="fa-solid fa-lock"></i> Frozen</span></td>
      </tr>`,
        )
        .join("")}
    </tbody></table></div></div>`;
}

function legacyRenderAdminUsers() {
  const roleBadge = (r, u) => {
    const m = {
      superadmin: "badge-rejected",
      admin: "badge-review",
      specialist: "badge-pending",
      client: "badge-approved",
      "Super Admin": "badge-rejected",
      Admin: "badge-review",
      Reviewer: "badge-pending",
      Client: "badge-approved",
    };
    let label = r;
    if (r === "superadmin") label = "Super Admin";
    if (r === "admin") label = "Admin";
    if (r === "specialist") label = "Specialist";
    if (r === "client") label = "Client";

    let ipLabel = "";
    if (r === "specialist" || r === "Reviewer") {
      const types =
        u && u.ipTypes && u.ipTypes.length > 0
          ? u.ipTypes.join(", ")
          : "All IP Types";
      ipLabel = `<div style="font-size:0.75rem; color:var(--gray-500); margin-top:4px;"><i class="fa-solid fa-tags"></i> ${types}</div>`;
    }

    return `<span class="badge ${m[r] || "badge-pending"}">${label}</span>${ipLabel}`;
  };
  return `<div class="page-header"><h1>User Management</h1><p>Manage all registered system users and their roles.</p></div>
    ${currentRole === "superadmin" ? '<button class="btn btn-primary" style="margin-bottom:20px" onclick="navigateTo(\'create-account\')"><i class="fa-solid fa-user-plus"></i> Create New Account</button>' : ""}
    <div class="table-container"><div class="table-responsive"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Date Created</th>${currentRole === "superadmin" ? "<th>Actions</th>" : ""}</tr></thead><tbody>
      ${systemUsers.map((u) => `<tr><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${roleBadge(u.role, u)}</td><td><span class="badge ${u.status === "Active" ? "badge-approved" : "badge-rejected"}">${u.status}</span></td><td>${u.dateCreated}</td>${currentRole === "superadmin" ? `<td><div class="action-btns"><button class="btn btn-sm btn-outline-navy" title="Assign Role & IP Types" onclick="editUserRole(${u.id})"><i class="fa-solid fa-user-gear"></i> Manage</button><button class="btn btn-sm ${u.status === "Active" ? "btn-danger" : "btn-success"}" title="Toggle Account Status" onclick="toggleUserStatus(${u.id})"><i class="fa-solid fa-${u.status === "Active" ? "ban" : "check"}"></i></button></div></td>` : ""}</tr>`).join("")}
    </tbody></table></div></div>`;
}

window.legacyToggleSpecialistSettings = function (val) {
  const el = document.getElementById("specialistSettings");
  if (el) el.style.display = val === "specialist" ? "block" : "none";
};

function legacyEditUserRole(userId) {
  const u = systemUsers.find((x) => x.id === userId);
  if (!u) return;

  const currentTypes = u.ipTypes || [];
  const typesOptions = [
    "Patent",
    "Trademark",
    "Copyright",
    "Utility Model",
    "Industrial Design",
  ];
  let checkboxesHTML = typesOptions
    .map(
      (t) =>
        `<label style="display:flex;align-items:center;margin-bottom:8px;font-size:0.9rem;cursor:pointer"><input type="checkbox" value="${t}" class="ip-type-cb" style="margin-right:8px" ${currentTypes.includes(t) ? "checked" : ""}> ${t}</label>`,
    )
    .join("");

  document.getElementById("modalTitle").textContent =
    "Edit User Role & Specializations";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-group"><label>Current Role</label><input type="text" value="${u.role}" disabled style="background:var(--gray-50)" /></div>
    <div class="form-group"><label>Assign Role</label>
      <select id="newRoleSelect" onchange="toggleSpecialistSettings(this.value)">
        <option value="superadmin" ${u.role === "superadmin" ? "selected" : ""}>Super Admin</option>
        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
        <option value="specialist" ${u.role === "specialist" || u.role === "Reviewer" ? "selected" : ""}>Specialist</option>
        <option value="client" ${u.role === "client" ? "selected" : ""}>Client</option>
      </select>
    </div>
    
    <div id="specialistSettings" style="display: ${u.role === "specialist" || u.role === "Reviewer" ? "block" : "none"}; padding: 15px; background: var(--blue-bg); border-radius: var(--radius-sm); margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.2);">
      <label style="font-weight:600; display:block; margin-bottom:12px; color:var(--blue);"><i class="fa-solid fa-list-check"></i> Assign IP Application Types</label>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        ${checkboxesHTML}
      </div>
    </div>
    
    <button class="btn btn-primary btn-block" onclick="applyRoleChange(${u.id})"><i class="fa-solid fa-save"></i> Save Changes</button>`;
  document.getElementById("modalOverlay").classList.add("active");
}

function legacyApplyRoleChange(userId) {
  const u = systemUsers.find((x) => x.id === userId);
  if (u) {
    const newRole = document.getElementById("newRoleSelect").value;
    u.role = newRole;

    if (newRole === "specialist") {
      const checkedBoxes = Array.from(
        document.querySelectorAll(".ip-type-cb:checked"),
      ).map((cb) => cb.value);
      u.ipTypes = checkedBoxes;
    }

    closeModal();
    showToast(u.name + " settings updated!");
    navigateTo("admin-users");
  }
}
function legacyToggleUserStatus(userId) {
  const u = systemUsers.find((x) => x.id === userId);
  if (u) {
    u.status = u.status === "Active" ? "Inactive" : "Active";
    showToast(u.name + " status changed to " + u.status);
    navigateTo("admin-users");
  }
}

function legacyRenderAdminSettings() {
  return `<div class="page-header"><h1>System Settings</h1><p>Configure application preferences.</p></div>
    <div class="detail-panel" style="max-width:600px">
      <h3><i class="fa-solid fa-gear"></i> General Settings</h3>
      <div class="form-group"><label>System Name</label><input type="text" value="The Creator's Bulwark" /></div>
      <div class="form-group"><label>Institution</label><input type="text" value="Palawan State University" /></div>
      <div class="form-group"><label>Admin Email</label><input type="email" value="ipo@psu.palawan.edu.ph" /></div>
      <div class="form-group"><label>Auto-approval</label>
        <select><option>Disabled</option><option>Enabled</option></select></div>
      <div class="form-group"><label>Maximum File Upload Size</label>
        <select><option>5 MB</option><option selected>10 MB</option><option>25 MB</option></select></div>
      <div class="form-group"><label>Notification Email</label>
        <select><option selected>Enabled</option><option>Disabled</option></select></div>
      <button class="btn btn-primary" onclick="showToast('Settings saved')"><i class="fa-solid fa-save"></i> Save Settings</button>
    </div>`;
}

// ===== ROLE PERMISSIONS MATRIX =====
function legacyRenderRolePermissions() {
  const perms = [
    {
      cat: "CASE MANAGEMENT",
      items: [
        {
          action: "View all cases",
          sa: "✓",
          pa: "✓",
          rv: "Assigned",
          cl: "Own only",
        },
        {
          action: "Create / edit cases",
          sa: "✓",
          pa: "✓",
          rv: "Assigned",
          cl: "✗",
        },
        { action: "Advance stage", sa: "✓", pa: "✓", rv: "✓", cl: "✗" },
        {
          action: "Delete / archive cases",
          sa: "✓",
          pa: "Archive only",
          rv: "✗",
          cl: "✗",
        },
      ],
    },
    {
      cat: "DOCUMENT VAULT",
      items: [
        {
          action: "Upload documents",
          sa: "✓",
          pa: "✓",
          rv: "✓",
          cl: "Own cases",
        },
        {
          action: "Download CONFIDENTIAL",
          sa: "✓",
          pa: "✓",
          rv: "Assigned",
          cl: "✗",
        },
        {
          action: "Download TOP SECRET",
          sa: "✓",
          pa: "With approval",
          rv: "✗",
          cl: "✗",
        },
      ],
    },
    {
      cat: "PATENT SEARCH",
      items: [
        {
          action: "Execute patent search",
          sa: "✓",
          pa: "✓",
          rv: "✓",
          cl: "Limited query",
        },
        {
          action: "View full search results",
          sa: "✓",
          pa: "✓",
          rv: "✓",
          cl: "Public only",
        },
      ],
    },
    {
      cat: "SYSTEM ADMIN",
      items: [
        {
          action: "Manage user roles",
          sa: "✓",
          pa: "Non-admin only",
          rv: "✗",
          cl: "✗",
        },
        {
          action: "View audit trail",
          sa: "✓",
          pa: "Operational only",
          rv: "✗",
          cl: "✗",
        },
        { action: "System configuration", sa: "✓", pa: "✗", rv: "✗", cl: "✗" },
        {
          action: "Encryption key management",
          sa: "✓",
          pa: "✗",
          rv: "✗",
          cl: "✗",
        },
      ],
    },
  ];
  const badge = (v) => {
    if (v === "✓")
      return '<span style="color:var(--green);font-size:1.1rem">✓</span>';
    if (v === "✗") return '<span style="color:var(--gray-400)">✗</span>';
    return `<span class="badge badge-pending" style="font-size:.7rem">${v}</span>`;
  };
  let rows = "";
  perms.forEach((cat) => {
    rows += `<tr><td colspan="5" style="background:var(--navy-dark);color:var(--gold);font-size:.75rem;font-weight:700;letter-spacing:1px;padding:10px 24px">${cat.cat}</td></tr>`;
    cat.items.forEach((p) => {
      rows += `<tr><td style="font-weight:500">${p.action}</td><td style="text-align:center">${badge(p.sa)}</td><td style="text-align:center">${badge(p.pa)}</td><td style="text-align:center">${badge(p.rv)}</td><td style="text-align:center">${badge(p.cl)}</td></tr>`;
    });
  });
  return `<div class="page-header"><h1><i class="fa-solid fa-shield-halved"></i> Role Permissions Matrix</h1><p>Access control matrix for all system roles.</p></div>
    <div class="table-container"><div class="table-responsive"><table class="data-table"><thead><tr>
      <th>MODULE / ACTION</th>
      <th style="text-align:center;color:var(--green)">SUPER ADMIN</th>
      <th style="text-align:center;color:var(--blue)">PITBI ADMIN</th>
      <th style="text-align:center;color:var(--gold)">REVIEWER</th>
      <th style="text-align:center;color:var(--gold-dark)">CLIENT</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

// ===== CREATE ACCOUNT (SUPER ADMIN ONLY) =====
function legacyToggleDeptField(role) {
  const deptGroup = document.getElementById("dept-group");
  const roleGroup = document.getElementById("role-group");
  if (!deptGroup || !roleGroup) return;

  if (role === "Super Admin") {
    deptGroup.style.display = "none";
    roleGroup.classList.add("full");
  } else {
    deptGroup.style.display = "block";
    roleGroup.classList.remove("full");
  }
}

function legacyRenderCreateAccount() {
  return `<div class="page-header"><h1><i class="fa-solid fa-user-plus"></i> Create New Account</h1><p>Register a new user in the system with a specific role.</p></div>
    <div class="detail-panel" style="max-width:640px">
      <h3><i class="fa-solid fa-id-card"></i> New User Details</h3>
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input type="text" id="newUserName" placeholder="Enter full name" /></div>
        <div class="form-group"><label>Email *</label><input type="email" id="newUserEmail" placeholder="user@psu.edu.ph" /></div>
      </div>
      <div class="form-row">
        <div class="form-group" id="dept-group"><label>Department *</label>
          <select id="newUserDept"><option value="">Select Department</option><option>IT Office</option><option>IP Office</option><option>Research Office</option><option>College of Engineering</option><option>College of Sciences</option><option>College of Agriculture</option><option>College of Arts</option></select></div>
        <div class="form-group" id="role-group"><label>Assign Role *</label>
          <select id="newUserRole" onchange="toggleDeptField(this.value)"><option value="">Select Role</option><option>Super Admin</option><option>PITBI Admin</option><option>Reviewer</option><option>Client</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Temporary Password *</label><input type="password" id="newUserPass" placeholder="Min 8 characters" /></div>
        <div class="form-group"><label>Confirm Password *</label><input type="password" id="newUserPassConfirm" placeholder="Re-enter password" /></div>
      </div>
      <div style="background:var(--blue-bg);padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:.85rem;color:#1e40af">
        <i class="fa-solid fa-circle-info"></i> The user will receive an email notification with login instructions. They will be prompted to change their password on first login.
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" onclick="createNewAccount()"><i class="fa-solid fa-user-plus"></i> Create Account</button>
        <button class="btn btn-secondary" onclick="navigateTo('admin-users')"><i class="fa-solid fa-arrow-left"></i> Back to Users</button>
      </div>
    </div>`;
}

function legacyCreateNewAccount() {
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const dept = document.getElementById("newUserDept").value;
  const role = document.getElementById("newUserRole").value;
  const pass = document.getElementById("newUserPass").value;
  const passC = document.getElementById("newUserPassConfirm").value;

  if (!name || !email || !role || !pass) {
    showToast("Please fill in all required fields");
    return;
  }
  if (role !== "Super Admin" && !dept) {
    showToast("Please select a department");
    return;
  }

  if (pass.length < 8) {
    showToast("Password must be at least 8 characters");
    return;
  }
  if (pass !== passC) {
    showToast("Passwords do not match");
    return;
  }

  const finalDept = role === "Super Admin" ? "System" : dept;
  const newUser = {
    id: systemUsers.length + 1,
    name,
    email,
    role,
    dept: finalDept,
    status: "Active",
    dateCreated: new Date().toISOString().split("T")[0],
  };
  systemUsers.push(newUser);
  showToast("Account created successfully for " + name + "!");
  navigateTo("admin-users");
}

function formatRoleLabel(role) {
  const normalizedRole = normalizeRole(role);
  return getRoleMeta(normalizedRole).label;
}

function renderAdminUsers() {
  const roleBadgeClass = {
    superadmin: "badge-rejected",
    admin: "badge-review",
    reviewer: "badge-pending",
    client: "badge-approved",
  };
  return `<div class="page-header"><h1>User Management</h1><p>Manage registered system users according to the RBAC matrix.</p></div>
    ${canManageUsers() ? `<button class="btn btn-primary" style="margin-bottom:20px" onclick="navigateTo('create-account')"><i class="fa-solid fa-user-plus"></i> Create Account</button>` : ""}
    <div class="table-container"><div class="table-responsive"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Date Created</th>${canManageUsers() ? "<th>Actions</th>" : ""}</tr></thead><tbody>
      ${systemUsers
        .map(
          (user) => `
        <tr>
          <td><strong>${user.name}</strong></td>
          <td>${user.email}</td>
          <td><span class="badge ${roleBadgeClass[normalizeRole(user.role)] || "badge-pending"}">${formatRoleLabel(user.role)}</span></td>
          <td><span class="badge ${user.status === "Active" ? "badge-approved" : "badge-rejected"}">${user.status}</span></td>
          <td>${user.dateCreated}</td>
          ${canManageUsers() ? `<td>${canManageTargetUser(user) ? `<div class="action-btns"><button class="btn btn-sm btn-outline-navy" onclick="editUserRole(${user.id})"><i class="fa-solid fa-user-gear"></i> Manage</button><button class="btn btn-sm ${user.status === "Active" ? "btn-danger" : "btn-success"}" onclick="toggleUserStatus(${user.id})"><i class="fa-solid fa-${user.status === "Active" ? "ban" : "check"}"></i></button></div>` : '<span style="font-size:.8rem;color:var(--gray-400)">Protected</span>'}</td>` : ""}
        </tr>
      `,
        )
        .join("")}
    </tbody></table></div></div>`;
}

function editUserRole(userId) {
  const user = systemUsers.find((entry) => entry.id === userId);
  if (!user || !canManageTargetUser(user)) {
    showToast(`${getRoleMeta().label} cannot manage this account.`);
    return;
  }

  const options = getManageableRoleOptions()
    .map(
      (role) =>
        `<option value="${role}" ${normalizeRole(user.role) === role ? "selected" : ""}>${formatRoleLabel(role)}</option>`,
    )
    .join("");
  document.getElementById("modalTitle").textContent = "Edit User Role";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-group"><label>Account</label><input type="text" value="${user.name}" disabled style="background:var(--gray-50)" /></div>
    <div class="form-group"><label>Assign Role</label>
      <select id="newRoleSelect">${options}</select>
    </div>
    <button class="btn btn-primary btn-block" onclick="applyRoleChange(${user.id})"><i class="fa-solid fa-save"></i> Save Changes</button>`;
  document.getElementById("modalOverlay").classList.add("active");
}

function applyRoleChange(userId) {
  const user = systemUsers.find((entry) => entry.id === userId);
  if (!user || !canManageTargetUser(user)) {
    showToast(`${getRoleMeta().label} cannot update this account.`);
    return;
  }

  const newRole = normalizeRole(document.getElementById("newRoleSelect").value);
  if (!getManageableRoleOptions().includes(newRole)) {
    showToast("The selected role is not allowed for this account.");
    return;
  }

  user.role = newRole;
  closeModal();
  showToast(`${user.name} updated to ${formatRoleLabel(newRole)}.`);
  navigateTo("admin-users");
}

function toggleUserStatus(userId) {
  const user = systemUsers.find((entry) => entry.id === userId);
  if (!user || !canManageTargetUser(user)) {
    showToast(`${getRoleMeta().label} cannot change this account status.`);
    return;
  }
  user.status = user.status === "Active" ? "Inactive" : "Active";
  showToast(`${user.name} status changed to ${user.status}.`);
  navigateTo("admin-users");
}

function toggleDeptField(role) {
  const deptGroup = document.getElementById("dept-group");
  const roleGroup = document.getElementById("role-group");
  if (!deptGroup || !roleGroup) return;

  if (normalizeRole(role) === "superadmin") {
    deptGroup.style.display = "none";
    roleGroup.classList.add("full");
  } else {
    deptGroup.style.display = "block";
    roleGroup.classList.remove("full");
  }
}

function renderCreateAccount() {
  const roleOptions = getManageableRoleOptions()
    .map((role) => `<option value="${role}">${formatRoleLabel(role)}</option>`)
    .join("");
  return `<div class="page-header"><h1><i class="fa-solid fa-user-plus"></i> Create New Account</h1><p>Create only the accounts allowed by the current RBAC role.</p></div>
    <div class="detail-panel" style="max-width:640px">
      <h3><i class="fa-solid fa-id-card"></i> New User Details</h3>
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input type="text" id="newUserName" placeholder="Enter full name" /></div>
        <div class="form-group"><label>Email *</label><input type="email" id="newUserEmail" placeholder="user@psu.edu.ph" /></div>
      </div>
      <div class="form-row">
        <div class="form-group" id="dept-group"><label>Department *</label>
          <select id="newUserDept"><option value="">Select Department</option><option>IT Office</option><option>IP Office</option><option>Research Office</option><option>College of Engineering</option><option>College of Sciences</option><option>College of Agriculture</option><option>College of Arts</option></select></div>
        <div class="form-group" id="role-group"><label>Assign Role *</label>
          <select id="newUserRole" onchange="toggleDeptField(this.value)"><option value="">Select Role</option>${roleOptions}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Temporary Password *</label><input type="password" id="newUserPass" placeholder="Min 8 characters" /></div>
        <div class="form-group"><label>Confirm Password *</label><input type="password" id="newUserPassConfirm" placeholder="Re-enter password" /></div>
      </div>
      <div style="background:var(--blue-bg);padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:.85rem;color:#1e40af">
        <i class="fa-solid fa-circle-info"></i> Accounts created here are limited by the current user's RBAC permissions.
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" onclick="createNewAccount()"><i class="fa-solid fa-user-plus"></i> Create Account</button>
        <button class="btn btn-secondary" onclick="navigateTo('admin-users')"><i class="fa-solid fa-arrow-left"></i> Back to Users</button>
      </div>
    </div>`;
}

function createNewAccount() {
  const name = document.getElementById("newUserName").value.trim();
  const email = document.getElementById("newUserEmail").value.trim();
  const dept = document.getElementById("newUserDept").value;
  const role = normalizeRole(document.getElementById("newUserRole").value);
  const pass = document.getElementById("newUserPass").value;
  const passC = document.getElementById("newUserPassConfirm").value;

  if (!name || !email || !role || !pass) {
    showToast("Please fill in all required fields");
    return;
  }
  if (!getManageableRoleOptions().includes(role)) {
    showToast("This role cannot be created from the current account.");
    return;
  }
  if (role !== "superadmin" && !dept) {
    showToast("Please select a department");
    return;
  }
  if (pass.length < 8) {
    showToast("Password must be at least 8 characters");
    return;
  }
  if (pass !== passC) {
    showToast("Passwords do not match");
    return;
  }

  const newUser = {
    id: Math.max(...systemUsers.map((user) => user.id)) + 1,
    name,
    email,
    role,
    dept: role === "superadmin" ? "System" : dept,
    status: "Active",
    dateCreated: new Date().toISOString().split("T")[0],
  };
  systemUsers.push(newUser);
  showToast(`Account created successfully for ${name}.`);
  navigateTo("admin-users");
}

function renderRolePermissions() {
  const permissions = [
    {
      cat: "CASE MANAGEMENT",
      items: [
        {
          action: "View all cases",
          sa: "check",
          pa: "check",
          rv: "Assigned",
          cl: "Own only",
        },
        {
          action: "Create / edit cases",
          sa: "check",
          pa: "check",
          rv: "Assigned",
          cl: "deny",
        },
        {
          action: "Advance stage",
          sa: "check",
          pa: "check",
          rv: "check",
          cl: "deny",
        },
        {
          action: "Delete / archive cases",
          sa: "check",
          pa: "Archive only",
          rv: "deny",
          cl: "deny",
        },
      ],
    },
    {
      cat: "DOCUMENT VAULT",
      items: [
        {
          action: "Upload documents",
          sa: "check",
          pa: "check",
          rv: "check",
          cl: "Own cases",
        },
        {
          action: "Download CONFIDENTIAL",
          sa: "check",
          pa: "check",
          rv: "Assigned",
          cl: "deny",
        },
        {
          action: "Download TOP SECRET",
          sa: "check",
          pa: "With approval",
          rv: "deny",
          cl: "deny",
        },
      ],
    },
    {
      cat: "PATENT SEARCH",
      items: [
        {
          action: "Execute patent search",
          sa: "check",
          pa: "check",
          rv: "check",
          cl: "Limited query",
        },
        {
          action: "View full search results",
          sa: "check",
          pa: "check",
          rv: "check",
          cl: "Public only",
        },
      ],
    },
    {
      cat: "SYSTEM ADMIN",
      items: [
        {
          action: "Manage user roles",
          sa: "check",
          pa: "Non-admin only",
          rv: "deny",
          cl: "deny",
        },
        {
          action: "View audit trail",
          sa: "check",
          pa: "Operational only",
          rv: "deny",
          cl: "deny",
        },
        {
          action: "System configuration",
          sa: "check",
          pa: "deny",
          rv: "deny",
          cl: "deny",
        },
        {
          action: "Encryption key management",
          sa: "check",
          pa: "deny",
          rv: "deny",
          cl: "deny",
        },
      ],
    },
  ];
  const badge = (value) => {
    if (value === "check")
      return '<span style="color:var(--green);font-size:1.1rem">✓</span>';
    if (value === "deny")
      return '<span style="color:var(--red);font-size:1.1rem">✕</span>';
    return `<span class="badge badge-pending" style="font-size:.7rem">${value}</span>`;
  };
  let rows = "";
  permissions.forEach((category) => {
    rows += `<tr><td colspan="5" style="background:var(--gold);color:white;font-size:.75rem;font-weight:700;letter-spacing:1px;padding:10px 24px">${category.cat}</td></tr>`;
    category.items.forEach((item) => {
      rows += `<tr><td style="font-weight:500">${item.action}</td><td style="text-align:center">${badge(item.sa)}</td><td style="text-align:center">${badge(item.pa)}</td><td style="text-align:center">${badge(item.rv)}</td><td style="text-align:center">${badge(item.cl)}</td></tr>`;
    });
  });
  return `<div class="page-header"><h1><i class="fa-solid fa-shield-halved"></i> Role Permissions Matrix</h1><p>RBAC rules implemented in this prototype based on the supplied access matrix.</p></div>
    <div class="table-container"><div class="table-responsive"><table class="data-table"><thead><tr>
      <th>MODULE / ACTION</th>
      <th style="text-align:center;color:var(--green)">SUPER ADMIN</th>
      <th style="text-align:center;color:var(--blue)">PITBI ADMIN</th>
      <th style="text-align:center;color:var(--gold)">REVIEWER</th>
      <th style="text-align:center;color:var(--gold-dark)">CLIENT</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderAdminSettings() {
  return `<div class="page-header"><h1>System Settings</h1><p>Super admin configuration and security controls.</p></div>
    <div class="detail-layout">
      <div class="detail-panel">
        <h3><i class="fa-solid fa-gear"></i> System Configuration</h3>
        <div class="form-group"><label>System Name</label><input type="text" value="The Creator's Bulwark" /></div>
        <div class="form-group"><label>Institution</label><input type="text" value="Palawan State University" /></div>
        <div class="form-group"><label>Admin Email</label><input type="email" value="ipo@psu.palawan.edu.ph" /></div>
        <div class="form-group"><label>Notification Email</label>
          <select><option selected>Enabled</option><option>Disabled</option></select></div>
        <button class="btn btn-primary" onclick="showToast('System configuration saved')"><i class="fa-solid fa-save"></i> Save Settings</button>
      </div>
      <div class="detail-panel">
        <h3><i class="fa-solid fa-key"></i> Encryption Key Management</h3>
        <div class="detail-row"><span class="label">Primary Key</span><span class="value">KMS-PSU-2026-ACTIVE</span></div>
        <div class="detail-row"><span class="label">Backup Key</span><span class="value">KMS-PSU-2026-STANDBY</span></div>
        <div class="detail-row"><span class="label">Rotation Policy</span><span class="value">Quarterly</span></div>
        <div class="detail-actions">
          <button class="btn btn-primary btn-sm" onclick="showToast('Key rotation scheduled')"><i class="fa-solid fa-arrows-rotate"></i> Rotate Keys</button>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Key escrow report generated')"><i class="fa-solid fa-file-shield"></i> Escrow Report</button>
        </div>
      </div>
    </div>`;
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toastMessage").textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ===== STATS ANIMATION =====
function animateStats() {
  document.querySelectorAll(".stat-number[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 30);
  });
}

// ===== IP TUTORIAL =====
function renderIpTutorial() {
  const types = [
    {
      id: "patent",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      title: "Patent",
      subtitle: "Protect inventions & technical innovations",
      term: "20 years from filing date",
      requirements: [
        "Novelty — new to the world",
        "Inventive Step — non-obvious",
        "Industrial Applicability",
      ],
      process: [
        {
          n: 1,
          t: "Prepare Disclosure",
          d: "Write Invention Disclosure Statement with technical details.",
        },
        {
          n: 2,
          t: "Fill Application Form",
          d: "Complete PSU-IPO-PAT-01 with full inventor details.",
        },
        {
          n: 3,
          t: "Prepare Drawings",
          d: "Prepare technical drawings, diagrams, and abstract.",
        },
        {
          n: 4,
          t: "Submit & Pay",
          d: "Upload all documents + proof-of-deposit filing fee.",
        },
        {
          n: 5,
          t: "IPOPHL Filing",
          d: "IP Office forwards verified packet to national registry.",
        },
      ],
      docs: [
        "Patent Application Form (PSU-IPO-PAT-01)",
        "Invention Disclosure Statement (min 2 pages)",
        "Technical Drawings / Diagrams",
        "Abstract (150 words max)",
        "Claims Statement",
        "Proof-of-Deposit / Official Receipt ⭐",
      ],
    },
    {
      id: "trademark",
      icon: "fa-stamp",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      title: "Trademark",
      subtitle: "Register brands, logos & identifiers",
      term: "10 years (renewable)",
      requirements: [
        "Distinctiveness",
        "Non-descriptive of goods/services",
        "Non-deceptive in nature",
      ],
      process: [
        {
          n: 1,
          t: "Define the Mark",
          d: "Identify whether it is a word, logo, or combination mark.",
        },
        {
          n: 2,
          t: "Prepare Specimen",
          d: "Prepare high-resolution mark file (300+ DPI).",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete PSU-IPO-TM-01 with goods/services description.",
        },
        { n: 4, t: "Submit & Pay", d: "Upload mark + proof-of-deposit." },
        {
          n: 5,
          t: "IPOPHL Review",
          d: "IP Office submits to IPOPHL for official registration.",
        },
      ],
      docs: [
        "Trademark Application Form (PSU-IPO-TM-01)",
        "Mark Specimen / Logo File (min 300 DPI)",
        "Description of Goods/Services",
        "Declaration of First Use",
        "Color Claim Statement (if applicable)",
        "Proof-of-Deposit / Official Receipt ⭐",
      ],
    },
    {
      id: "copyright",
      icon: "fa-copyright",
      color: "#10b981",
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      title: "Copyright",
      subtitle: "Safeguard creative works, software & publications",
      term: "Lifetime + 50 years",
      requirements: [
        "Original work of the author",
        "Fixed in tangible form",
        "Creative expression (not just ideas)",
      ],
      process: [
        {
          n: 1,
          t: "Complete the Work",
          d: "Ensure the work is finished and in its final form.",
        },
        {
          n: 2,
          t: "Fill Registration Form",
          d: "Complete PSU-IPO-CR-01 with author/creator details.",
        },
        {
          n: 3,
          t: "Upload Work & ID",
          d: "Submit a complete copy of the work + digitized valid ID.",
        },
        {
          n: 4,
          t: "Submit & Pay",
          d: "Upload proof-of-deposit for the registration fee.",
        },
        {
          n: 5,
          t: "Certificate Issuance",
          d: "IPOPHL issues official Certificate of Registration.",
        },
      ],
      docs: [
        "Copyright Registration Form (PSU-IPO-CR-01)",
        "Complete Copy of the Work",
        "Valid Philippine ID (Digitized)",
        "Declaration of Originality",
        "Authorship Agreement (multiple authors)",
        "Proof-of-Deposit / Official Receipt ⭐",
      ],
    },
    {
      id: "utility",
      icon: "fa-gears",
      color: "#6366f1",
      gradient: "linear-gradient(135deg,#6366f1,#4338ca)",
      title: "Utility Model",
      subtitle: "Faster protection for technical innovations",
      term: "7 years (no renewal)",
      requirements: [
        "Novelty — new to the world",
        "Industrial Applicability",
        "No inventive step required (easier than patent)",
      ],
      process: [
        {
          n: 1,
          t: "Document Innovation",
          d: "Write technical description of the model and its use.",
        },
        {
          n: 2,
          t: "Prepare Drawings",
          d: "Create technical drawings or illustrations of the model.",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete the Utility Model Application Form.",
        },
        {
          n: 4,
          t: "Write Claims",
          d: "Define the specific claims and novelty statement.",
        },
        {
          n: 5,
          t: "Submit & Pay",
          d: "Upload all documents + proof-of-deposit.",
        },
      ],
      docs: [
        "Utility Model Application Form",
        "Technical Description",
        "Technical Drawings / Illustrations",
        "Claims Statement",
        "Novelty Statement",
        "Proof-of-Deposit / Official Receipt ⭐",
      ],
    },
    {
      id: "industrial",
      icon: "fa-pen-nib",
      color: "#ec4899",
      gradient: "linear-gradient(135deg,#ec4899,#be185d)",
      title: "Industrial Design",
      subtitle: "Protect the aesthetic appearance of products",
      term: "5 years (renewable up to 15 yrs)",
      requirements: [
        "Visual/ornamental novelty",
        "Applied to an article/product",
        "Not dictated solely by function",
      ],
      process: [
        {
          n: 1,
          t: "Photograph the Design",
          d: "Take clear photos from all angles: front, back, top, sides, perspective.",
        },
        {
          n: 2,
          t: "Write Design Statement",
          d: "Describe the ornamental features that give the design its appearance.",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete the Industrial Design Application Form.",
        },
        { n: 4, t: "Submit & Pay", d: "Upload all files + proof-of-deposit." },
        {
          n: 5,
          t: "IPOPHL Registration",
          d: "Design is examined and registered if qualifying.",
        },
      ],
      docs: [
        "Industrial Design Application Form",
        "Design Representation Files (Photos/3D renders)",
        "Description of Design — ornamental aspects",
        "Product Category Statement",
        "Proof-of-Deposit / Official Receipt ⭐",
      ],
    },
  ];

  return `
    <div class="page-header" style="margin-bottom:36px">
      <h1><i class="fa-solid fa-book-open" style="color:var(--gold);margin-right:10px"></i>IP Application Tutorial</h1>
      <p>A step-by-step guide to all five IP types, their requirements, and filing procedures at PSU.</p>
    </div>
    <div style="background:linear-gradient(135deg,var(--navy),var(--navy-dark));border-radius:16px;padding:28px 32px;margin-bottom:36px;color:white;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-30px;right:-30px;width:180px;height:180px;background:rgba(255,255,255,0.04);border-radius:50%;pointer-events:none;"></div>
      <h2 style="font-size:1.1rem;font-weight:800;margin-bottom:10px;"><i class="fa-solid fa-shield-halved" style="color:var(--gold);margin-right:8px;"></i>Before You Begin — Important Notes</h2>
      <ul style="color:rgba(255,255,255,0.8);font-size:0.88rem;line-height:1.8;padding-left:20px;margin:0;">
        <li>This system is a <strong style="color:var(--gold)">pre-filing optimization engine</strong> — not a final registration site. Verified packets are forwarded to <strong style="color:white">IPOPHL</strong> by IP Office staff.</li>
        <li>All submissions require a <strong style="color:var(--gold)">Proof-of-Deposit or Official Receipt</strong> before they are considered complete for review.</li>
        <li>Review is performed <strong style="color:white">manually by authorized IP Office personnel</strong> — no automated or AI-driven assessment is used.</li>
        <li>Once a submission is approved and certified, its core metadata is <strong style="color:white">frozen and cannot be altered</strong>.</li>
      </ul>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px;padding-bottom:60px;">
      ${types
        .map(
          (t) => `
        <div style="background:#fff;border-radius:16px;border:1px solid var(--gray-200);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="background:${t.gradient};padding:22px 28px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
            <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;flex-shrink:0;">
              <i class="fa-solid ${t.icon}"></i>
            </div>
            <div style="flex:1">
              <h2 style="color:white;font-size:1.25rem;font-weight:800;margin:0;">${t.title}</h2>
              <p style="color:rgba(255,255,255,0.8);font-size:0.85rem;margin:3px 0 0;">${t.subtitle}</p>
            </div>
            <div style="background:rgba(255,255,255,0.15);padding:6px 16px;border-radius:20px;color:white;font-size:0.8rem;font-weight:600;white-space:nowrap;">
              <i class="fa-solid fa-clock" style="margin-right:5px;"></i>Protection: ${t.term}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;">
            <div style="padding:24px 28px;border-right:1px solid var(--gray-100);">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-list-check" style="color:${t.color};"></i>Requirements</h4>
              <ul style="padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">
                ${t.requirements.map((r) => `<li style="display:flex;align-items:flex-start;gap:8px;font-size:0.875rem;color:var(--gray-700);"><i class="fa-solid fa-circle-check" style="color:${t.color};margin-top:3px;font-size:0.7rem;flex-shrink:0;"></i>${r}</li>`).join("")}
              </ul>
            </div>
            <div style="padding:24px 28px;border-right:1px solid var(--gray-100);">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-list-ol" style="color:${t.color};"></i>Filing Process</h4>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${t.process.map((p) => `<div style="display:flex;gap:10px;"><span style="width:22px;height:22px;border-radius:50%;background:${t.color};color:white;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${p.n}</span><div><strong style="color:var(--navy);display:block;font-size:0.85rem;">${p.t}</strong><span style="color:var(--gray-500);font-size:0.8rem;">${p.d}</span></div></div>`).join("")}
              </div>
            </div>
            <div style="padding:24px 28px;">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-paperclip" style="color:${t.color};"></i>Required Documents</h4>
              <ul style="padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:16px;">
                ${t.docs.map((d) => `<li style="display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;color:var(--gray-600);"><i class="fa-solid fa-file-lines" style="color:${t.color};margin-top:3px;font-size:0.65rem;flex-shrink:0;"></i>${d}</li>`).join("")}
              </ul>
              <button style="background:${t.gradient};color:white;border:none;padding:9px 18px;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:'Inter',sans-serif;" onclick="navigateTo('${t.id}-form')">
                <i class="fa-solid fa-file-circle-plus"></i> Start ${t.title} Application
              </button>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>`;
}

function isCopyrightFeeWaivedRoute() {
  return (
    currentFormType === "copyright" &&
    wizardData.officialDuty === "Yes" &&
    wizardData.letterRequest === "Approved"
  );
}

function getFormGuideContent() {
  const guides = {
    patent: {
      title: "Patent Application Guide",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      steps: [
        "Prepare inventor details (name, ID, department, email)",
        "Document your invention with detailed description and field of technology",
        "Prepare technical drawings and claims statement",
        "Upload all documents in PDF format",
        "Submit and receive your reference number for tracking",
      ],
      docs: [
        "Patent Application Form (PSU-IPO-PAT-01)",
        "Invention Disclosure Statement (min 2 pages)",
        "Technical Drawings / Diagrams",
        "Abstract (150 words max)",
        "Claims Statement",
        "Proof of Concept (optional)",
        "Prior Art Search Report (optional)",
      ],
    },
    trademark: {
      title: "Trademark Registration Guide",
      icon: "fa-stamp",
      color: "#f59e0b",
      steps: [
        "Provide applicant details and ownership type",
        "Define mark name, type (word/logo/combination), and goods/services",
        "Upload high-resolution mark specimen (PNG/JPG, 300+ DPI)",
        "Submit and track your application status",
      ],
      docs: [
        "Trademark Application Form (PSU-IPO-TM-01)",
        "Mark Specimen / Logo File (min 300 DPI)",
        "Description of Goods/Services",
        "Declaration of First Use",
        "Color Claim Statement (if applicable)",
      ],
    },
    copyright: {
      title: "Copyright Registration Guide",
      icon: "fa-copyright",
      color: "#10b981",
      steps: [
        "Prepare the National Library application packet and complete copy of the work.",
        "Route the packet first to the reviewer for completeness checking.",
        "PITBI Admin records the case and issues the payment slip unless an approved letter-request waives the fee.",
        "If cashier payment is needed, return the official receipt copy to PITBI Admin.",
        "The super admin lane endorses filing with the National Library and PITBI Admin releases the certificate once received.",
      ],
      docs: [
        "National Library application form (Copyright / ISSN / ISBN / ISMN)",
        "Complete Copy of the Work",
        "Valid Philippine ID (Digitized)",
        "Declaration of Originality",
        "Approved letter-request for official-duty works (conditional)",
        "Official Receipt / cashier receipt copy (submitted after payment slip)",
        "Authorship Agreement for multiple authors (conditional)",
      ],
    },
    utility: {
      title: "Utility Model Guide",
      icon: "fa-gears",
      color: "#6366f1",
      steps: [
        "Prepare inventor and technical details",
        "Describe the technical innovation and its industrial use",
        "Upload technical drawings/diagrams",
        "Submit and track application",
      ],
      docs: [
        "Utility Model Application Form",
        "Technical Description",
        "Technical Drawings",
        "Claims Statement",
      ],
    },
    industrial: {
      title: "Industrial Design Guide",
      icon: "fa-pen-nib",
      color: "#ec4899",
      steps: [
        "Provide applicant and product details",
        "Upload high-quality representations (photos/drawings) of the design",
        "Provide description of design features",
        "Submit and track application",
      ],
      docs: [
        "Industrial Design Application Form",
        "Design Representation Files",
        "Description of Design",
      ],
    },
  };

  const g = guides[currentFormType] || guides.patent;
  const requiredCount = currentFormType === "patent" ? 5 : 4;

  return `<div class="form-guide-panel">
    <div class="form-guide-toggle" onclick="this.parentElement.classList.toggle('open')">
      <span><i class="fa-solid fa-${g.icon}" style="color:${g.color}"></i> <strong>${g.title}</strong> - Required documents and steps</span>
      <i class="fa-solid fa-chevron-down"></i>
    </div>
    <div class="form-guide-body">
      <div class="form-guide-cols">
        <div><h4><i class="fa-solid fa-list-ol"></i> Steps</h4><ol class="guide-steps-list">${g.steps.map((step) => `<li>${step}</li>`).join("")}</ol></div>
        <div><h4><i class="fa-solid fa-file-lines"></i> Required Documents</h4><ul class="guide-docs-list">${g.docs.map((doc, idx) => `<li><i class="fa-solid fa-${idx < requiredCount ? "check-circle" : "circle"}" style="color:${idx < requiredCount ? "var(--green)" : "var(--gray-300)"};font-size:.8rem"></i> ${doc}</li>`).join("")}</ul></div>
      </div>
    </div>
  </div>`;
}

function renderStep2() {
  if (currentFormType === "patent") {
    return `<h3 style="margin-bottom:24px">Invention Details</h3>
      <div class="form-group"><label>Title of Invention *</label><input type="text" id="wiz-title" placeholder="Enter invention title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Field of Invention *</label><input type="text" id="wiz-field" placeholder="e.g., Environmental Engineering" /></div>
        <div class="form-group"><label>Date Conceived *</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Abstract (150 words max) *</label><textarea id="wiz-abstract" placeholder="Provide a concise abstract of your invention..." maxlength="900"></textarea></div>
      <div class="form-group"><label>Description *</label><textarea id="wiz-desc" placeholder="Provide a detailed description of your invention..."></textarea></div>
      <div class="form-group"><label>Claims Statement *</label><textarea id="wiz-claims" placeholder="List the specific claims of your invention..."></textarea></div>`;
  }
  if (currentFormType === "trademark") {
    return `<h3 style="margin-bottom:24px">Mark Details</h3>
      <div class="form-group"><label>Mark Name *</label><input type="text" id="wiz-title" placeholder="Enter mark name" /></div>
      <div class="form-row">
        <div class="form-group"><label>Mark Type *</label>
          <select id="wiz-marktype"><option value="">Select Type</option><option>Word</option><option>Logo</option><option>Word & Logo</option></select></div>
        <div class="form-group"><label>Date of First Use</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Goods/Services Description *</label><textarea id="wiz-desc" placeholder="Describe the goods or services associated with this mark..."></textarea></div>
      <div class="form-group"><label>Color Claim Statement (if applicable)</label><textarea id="wiz-colorclaim" placeholder="Describe specific color claims for the mark, if any..."></textarea></div>`;
  }
  if (currentFormType === "utility") {
    return `<h3 style="margin-bottom:24px">Utility Model Details</h3>
      <div class="form-group"><label>Title of Utility Model *</label><input type="text" id="wiz-title" placeholder="Enter utility model title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Technical Field *</label><input type="text" id="wiz-field" placeholder="e.g., Agricultural Machinery" /></div>
        <div class="form-group"><label>Date Conceived *</label><input type="date" id="wiz-date" /></div>
      </div>
      <div class="form-group"><label>Technical Description *</label><textarea id="wiz-desc" placeholder="Describe your utility model in detail, including its novel technical aspects..."></textarea></div>
      <div class="form-group"><label>Claims Statement *</label><textarea id="wiz-claims" placeholder="Define the specific claims of your utility model..."></textarea></div>
      <div class="form-group"><label>Industrial Applicability *</label><textarea id="wiz-industrial" placeholder="Explain how this model can be industrially produced or used..."></textarea></div>
      <div class="form-group"><label>Novelty Statement *</label><textarea id="wiz-novelty" placeholder="Describe what makes this model new compared to existing solutions..."></textarea></div>`;
  }
  if (currentFormType === "industrial") {
    return `<h3 style="margin-bottom:24px">Industrial Design Details</h3>
      <div class="form-group"><label>Design Title *</label><input type="text" id="wiz-title" placeholder="Enter design title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Product Category *</label>
          <select id="wiz-prodcat"><option value="">Select Category</option><option>Furniture</option><option>Packaging</option><option>Tools & Equipment</option><option>Fashion & Accessories</option><option>Household Items</option><option>Electronics Housing</option><option>Transportation</option><option>Other</option></select></div>
        <div class="form-group"><label>Design Type *</label>
          <select id="wiz-designtype"><option value="">Select Type</option><option>3D (Shape/Form)</option><option>2D (Pattern/Lines/Color)</option><option>Combination (3D + 2D)</option></select></div>
      </div>
      <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" /></div>
      <div class="form-group"><label>Design Statement *</label><textarea id="wiz-desc" placeholder="Describe the ornamental or aesthetic aspects of your design that give it a special appearance..."></textarea></div>
      <div class="form-group"><label>Visual Representation Description *</label><textarea id="wiz-visual" placeholder="Describe the views (front, back, top, side, perspective) you will upload as representations of the design..."></textarea></div>`;
  }

  return `<h3 style="margin-bottom:24px">Work Details</h3>
    <div class="form-group"><label>Title of Work *</label><input type="text" id="wiz-title" placeholder="Enter title of work" /></div>
    <div class="form-row">
      <div class="form-group"><label>National Library Lane *</label>
        <select id="wiz-reglane"><option value="">Select Lane</option><option>Copyright</option><option>ISSN</option><option>ISBN</option><option>ISMN</option></select></div>
      <div class="form-group"><label>Type of Work *</label>
        <select id="wiz-worktype"><option value="">Select Type</option><option>Literary Work</option><option>Musical Work</option><option>Software Application</option><option>Artistic Work</option><option>Audio/Visual Work</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" /></div>
      <div class="form-group"><label>Created as part of official duties? *</label>
        <select id="wiz-officialduty"><option value="">Select</option><option>Yes</option><option>No</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Approved letter-request status</label>
        <select id="wiz-letterrequest"><option value="">Select status</option><option>Approved</option><option>Not yet</option><option>Not applicable</option></select></div>
      <div class="form-group"><label>Review Routing</label><input type="text" value="Reviewer intake before PITBI Admin processing" disabled /></div>
    </div>
    <div class="form-group"><label>Description *</label><textarea id="wiz-desc" placeholder="Describe your creative work..."></textarea></div>
    <div class="form-group"><label>Declaration of Originality *</label><textarea id="wiz-originality" placeholder="State that the work is original and identify the author or authors responsible for it..."></textarea></div>
    <div style="padding:14px 18px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:10px; margin-top:18px;">
      <div style="font-size:.84rem; font-weight:700; color:#047857; margin-bottom:4px;">Copyright routing note</div>
      <div style="font-size:.82rem; color:var(--gray-500); line-height:1.6;">After you submit this packet, the reviewer acts as the technical expert for completeness checking. PITBI Admin records the case and manages payment slip or fee-waiver routing before the super admin lane endorses National Library filing.</div>
    </div>`;
}

function renderStep3() {
  const docMap = {
    patent: [
      "Patent Application Form (PSU-IPO-PAT-01)",
      "Invention Disclosure Statement",
      "Technical Drawings / Diagrams",
      "Abstract",
      "Claims Statement",
    ],
    trademark: [
      "Trademark Application Form (PSU-IPO-TM-01)",
      "Mark Specimen / Logo File (300+ DPI)",
      "Description of Goods/Services",
      "Declaration of First Use",
    ],
    copyright: [
      {
        label:
          "National Library application form (Copyright / ISSN / ISBN / ISMN)",
        state: "required",
      },
      { label: "Complete Copy of the Work", state: "required" },
      { label: "Valid Philippine ID (Digitized)", state: "required" },
      { label: "Declaration of Originality", state: "required" },
      {
        label: "Approved letter-request for official-duty works",
        state: "conditional",
      },
      {
        label: "Official Receipt / cashier receipt copy",
        state: "post-review",
      },
    ],
    utility: [
      "Utility Model Application Form",
      "Technical Description",
      "Technical Drawings/Illustrations",
      "Claims Statement",
      "Novelty Statement",
    ],
    industrial: [
      "Industrial Design Application Form",
      "Design Representations (Photos/3D renders)",
      "Description of Design",
      "Product Category Statement",
    ],
  };

  const requiredDocs = docMap[currentFormType] || docMap.patent;
  const isCopyright = currentFormType === "copyright";
  const feeWaived = isCopyrightFeeWaivedRoute();
  const renderDocItem = (item) => {
    const entry =
      typeof item === "string" ? { label: item, state: "required" } : item;
    const badgeMap = {
      required: {
        label: "Required",
        bg: "rgba(22,163,74,0.08)",
        color: "var(--green)",
      },
      conditional: {
        label: "Conditional",
        bg: "rgba(245,158,11,0.12)",
        color: "#b45309",
      },
      "post-review": {
        label: "Post-review",
        bg: "rgba(59,130,246,0.08)",
        color: "var(--navy)",
      },
    };
    const badge = badgeMap[entry.state] || badgeMap.required;
    return `<li style="font-size:.85rem; color:var(--gray-600); display:flex; align-items:center; gap:8px; justify-content:space-between; flex-wrap:wrap;">
      <span style="display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-${entry.state === "required" ? "circle-check" : "circle"}" style="color:${entry.state === "required" ? "var(--green)" : "var(--gray-300)"};"></i> ${entry.label}</span>
      <span style="padding:3px 8px; border-radius:999px; background:${badge.bg}; color:${badge.color}; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em;">${badge.label}</span>
    </li>`;
  };

  return `<h3 style="margin-bottom:24px">${isCopyright ? "Upload Initial Copyright Packet" : "Upload Supporting Documents"}</h3>
    <div class="requirement-checklist" style="background:var(--gray-50); border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid var(--gray-200);">
      <h4 style="font-size:.9rem; color:var(--navy); margin-bottom:12px;"><i class="fa-solid fa-clipboard-check" style="color:var(--gold); margin-right:6px;"></i> Required Documents Checklist</h4>
      <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
        ${requiredDocs.map(renderDocItem).join("")}
      </ul>
    </div>
    ${
      isCopyright
        ? `<div style="padding:16px 18px; background:rgba(255,127,80,0.06); border:1px solid rgba(255,127,80,0.18); border-radius:12px; margin-bottom:24px;">
      <div style="font-size:.86rem; font-weight:700; color:var(--navy); margin-bottom:6px;"><i class="fa-solid fa-route" style="color:var(--gold); margin-right:8px;"></i> Reviewer and cashier routing</div>
      <div style="font-size:.82rem; color:var(--gray-500); line-height:1.7;">This step collects the initial National Library packet only. After reviewer clearance, PITBI Admin either issues the payment slip for cashier payment or uses the fee-waived route when an approved letter-request is on file.</div>
    </div>`
        : ""
    }
    <div class="upload-area" onclick="document.getElementById('fileInput').click()">
      <i class="fa-solid fa-cloud-arrow-up"></i>
      <p>Drag & drop your files here, or <span class="browse-text">browse</span></p>
      <p style="font-size:.8rem;margin-top:8px;color:var(--gray-400)">Supported: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
      <input type="file" id="fileInput" style="display:none" onchange="handleFileUpload(this)" multiple />
    </div>
    <div id="fileList" style="margin-top:16px"></div>

    <div class="proof-of-deposit" style="margin-top:28px; border:2px dashed var(--gold); border-radius:12px; padding:24px; background:rgba(255,127,80,0.04);">
      <h4 style="font-size:.95rem; color:var(--navy); margin-bottom:6px;"><i class="fa-solid fa-receipt" style="color:var(--gold); margin-right:8px;"></i> ${isCopyright ? "Cashier and official receipt slot" : "Financial Verification - Proof of Deposit"} <span class="badge badge-pending" style="font-size:.65rem; vertical-align:middle; margin-left:8px;">${isCopyright ? (feeWaived ? "WAIVED ROUTE" : "POST-REVIEW") : "REQUIRED"}</span></h4>
      <p style="font-size:.82rem; color:var(--gray-500); margin-bottom:16px; line-height:1.6;">
        ${
          isCopyright
            ? feeWaived
              ? "An approved letter-request is declared for this official-duty work. PITBI Admin can use the fee-waived route after reviewer clearance, so cashier payment is not expected unless the office requests it."
              : "Use this slot only after PITBI Admin issues the payment slip and the university cashier releases the official receipt. The OR copy is part of Steps 4 to 6 of the PSU copyright flow."
            : "Per university policy, all IP applications require a valid Proof-of-Deposit or Official Receipt before the submission can be forwarded for review. Upload a scanned copy or photo of your receipt below."
        }
      </p>
      <div class="upload-area" onclick="document.getElementById('depositInput').click()" style="border-color:var(--gold); background:rgba(255,127,80,0.03);">
        <i class="fa-solid fa-file-invoice-dollar" style="color:var(--gold);"></i>
        <p>${isCopyright ? "Upload Official Receipt Copy (when available)" : "Upload Proof-of-Deposit / Official Receipt"}</p>
        <p style="font-size:.8rem;margin-top:8px;color:var(--gray-400)">JPG, PNG, or PDF (max 5MB)</p>
        <input type="file" id="depositInput" style="display:none" onchange="handleDepositUpload(this)" accept=".jpg,.jpeg,.png,.pdf" />
      </div>
      <div id="depositFileStatus" style="margin-top:12px;"></div>
    </div>`;
}

function renderStep4Review() {
  const val = (v) =>
    v
      ? `<span class="value">${v}</span>`
      : `<span class="value" style="color:var(--gray-400);font-style:italic;">Not provided</span>`;
  const feeWaived = isCopyrightFeeWaivedRoute();

  return `<h3 style="margin-bottom:24px">Review Your Application</h3>
    <div class="review-section"><h4><i class="fa-solid fa-user" style="color:var(--gold);margin-right:6px"></i>Applicant Information</h4>
      <div class="review-grid">
        <div class="review-item"><span class="label">Name</span>${val(wizardData.name)}</div>
        <div class="review-item"><span class="label">Email</span>${val(wizardData.email)}</div>
        <div class="review-item"><span class="label">Department</span>${val(wizardData.dept)}</div>
        <div class="review-item"><span class="label">College</span>${val(wizardData.college)}</div>
        ${wizardData.contact ? `<div class="review-item"><span class="label">Contact</span>${val(wizardData.contact)}</div>` : ""}
      </div>
    </div>
    <div class="review-section"><h4><i class="fa-solid fa-file-lines" style="color:var(--gold);margin-right:6px"></i>${getStep2Label()}</h4>
      <div class="review-grid">
        <div class="review-item"><span class="label">Title</span>${val(wizardData.title)}</div>
        ${wizardData.date ? `<div class="review-item"><span class="label">Date</span>${val(wizardData.date)}</div>` : ""}
        ${wizardData.field ? `<div class="review-item"><span class="label">Field</span>${val(wizardData.field)}</div>` : ""}
        ${wizardData.marktype ? `<div class="review-item"><span class="label">Mark Type</span>${val(wizardData.marktype)}</div>` : ""}
        ${wizardData.worktype ? `<div class="review-item"><span class="label">Work Type</span>${val(wizardData.worktype)}</div>` : ""}
        ${wizardData.registrationLane ? `<div class="review-item"><span class="label">National Library Lane</span>${val(wizardData.registrationLane)}</div>` : ""}
        ${wizardData.officialDuty ? `<div class="review-item"><span class="label">Official Duty Work</span>${val(wizardData.officialDuty)}</div>` : ""}
        ${wizardData.letterRequest ? `<div class="review-item"><span class="label">Letter-Request Status</span>${val(wizardData.letterRequest)}</div>` : ""}
        ${wizardData.prodcat ? `<div class="review-item"><span class="label">Product Category</span>${val(wizardData.prodcat)}</div>` : ""}
        ${wizardData.designtype ? `<div class="review-item"><span class="label">Design Type</span>${val(wizardData.designtype)}</div>` : ""}
      </div>
      ${wizardData.desc ? `<div class="review-item" style="margin-top:12px"><span class="label">Description</span><span class="value" style="white-space:pre-wrap;line-height:1.6">${wizardData.desc.substring(0, 400)}${wizardData.desc.length > 400 ? "..." : ""}</span></div>` : ""}
      ${wizardData.originality ? `<div class="review-item" style="margin-top:12px"><span class="label">Originality Statement</span><span class="value" style="white-space:pre-wrap;line-height:1.6">${wizardData.originality.substring(0, 260)}${wizardData.originality.length > 260 ? "..." : ""}</span></div>` : ""}
    </div>
    <div class="review-section"><h4><i class="fa-solid fa-paperclip" style="color:var(--gold);margin-right:6px"></i>Documents & Payment</h4>
      <p style="color:var(--gray-500);font-size:.9rem">${
        currentFormType === "copyright"
          ? feeWaived
            ? "The initial copyright packet is ready for reviewer intake. Because an approved letter-request is declared, PITBI Admin may route this case without cashier payment once verified."
            : "The initial copyright packet is ready for reviewer intake. The official receipt copy follows later after PITBI Admin issues the payment slip and the cashier releases the OR."
          : "Supporting documents and Proof-of-Deposit were uploaded in Step 3."
      }</p>
    </div>
    ${
      ["patent", "trademark", "utility", "industrial"].includes(currentFormType)
        ? `<div class="review-section"><h4><i class="fa-solid fa-diagram-project" style="color:var(--gold);margin-right:6px"></i>IPOPHL Operational Route</h4>
      <div class="copyright-flow-grid">
        <div class="copyright-flow-card active">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 1-2</span><span class="copyright-stage-pill active">Queued</span></div>
          <div class="copyright-flow-title">Reviewer intake and completeness check</div>
          <div class="copyright-flow-owner">Reviewer - Technical expert lane</div>
          <div class="copyright-flow-desc">The reviewer acts as the Technical Expert checking documents before forwarding to Admin Staff/MIS.</div>
        </div>
        <div class="copyright-flow-card pending">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 3-7</span><span class="copyright-stage-pill pending">Cashier route</span></div>
          <div class="copyright-flow-title">Admin Staff/MIS recording and payment routing</div>
          <div class="copyright-flow-owner">PITBI Admin - Admin Staff / MIS</div>
          <div class="copyright-flow-desc">Admin Staff/MIS records the case, issues the payment slip, and records the official receipt copy after cashier payment.</div>
        </div>
        <div class="copyright-flow-card pending">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 8-10</span><span class="copyright-stage-pill pending">IPOPHL Filing</span></div>
          <div class="copyright-flow-title">Endorsement, filing, and certificate release</div>
          <div class="copyright-flow-owner">Super Admin and PITBI Admin</div>
          <div class="copyright-flow-desc">The super admin lane acts on behalf of the IP Director for endorsement and IPOPHL filing, then Admin Staff/MIS releases the Certificate of Registration back to the inventor.</div>
        </div>
      </div>
    </div>`
        : ""
    }
    ${
      currentFormType === "copyright"
        ? `<div class="review-section"><h4><i class="fa-solid fa-diagram-project" style="color:var(--gold);margin-right:6px"></i>Copyright Operational Route</h4>
      <div class="copyright-flow-grid">
        <div class="copyright-flow-card active">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 1-2</span><span class="copyright-stage-pill active">Queued</span></div>
          <div class="copyright-flow-title">Reviewer intake and completeness check</div>
          <div class="copyright-flow-owner">Reviewer - Technical expert lane</div>
          <div class="copyright-flow-desc">The reviewer acknowledges the application and returns incomplete packets before endorsing complete ones to PITBI Admin.</div>
        </div>
        <div class="copyright-flow-card pending">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 3-7</span><span class="copyright-stage-pill pending">${feeWaived ? "Fee-waived" : "Cashier route"}</span></div>
          <div class="copyright-flow-title">PITBI Admin recording and payment routing</div>
          <div class="copyright-flow-owner">PITBI Admin - Admin Staff / MIS</div>
          <div class="copyright-flow-desc">${feeWaived ? "PITBI Admin records the approved letter-request and can forward the packet without cashier payment." : "PITBI Admin records the case, issues the payment slip, and records the official receipt copy after cashier payment."}</div>
        </div>
        <div class="copyright-flow-card pending">
          <div class="copyright-flow-meta"><span class="copyright-flow-step">Step 8-10</span><span class="copyright-stage-pill pending">National Library</span></div>
          <div class="copyright-flow-title">Endorsement, filing, and certificate release</div>
          <div class="copyright-flow-owner">Super Admin and PITBI Admin</div>
          <div class="copyright-flow-desc">The super admin lane acts on behalf of the IP Director for endorsement and National Library filing, then PITBI Admin releases the Certificate of Registration back to the author.</div>
        </div>
      </div>
    </div>`
        : ""
    }
    <div style="padding:16px 20px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;margin-top:4px;font-size:.85rem;color:#92400e;display:flex;gap:10px;align-items:flex-start">
      <i class="fa-solid fa-person-chalkboard" style="color:#d97706;margin-top:2px"></i>
      <div><strong>Manual Review Policy:</strong> Your submission will be reviewed by PSU IP Office staff. No AI-driven assessment occurs. You will be notified at your registered email once review is complete.</div>
    </div>`;
}

function captureWizardData() {
  if (currentWizardStep === 1) {
    wizardData.name =
      document.getElementById("wiz-name")?.value || wizardData.name || "";
    wizardData.email =
      document.getElementById("wiz-email")?.value || wizardData.email || "";
    wizardData.dept =
      document.getElementById("wiz-dept")?.value || wizardData.dept || "";
    wizardData.college =
      document.getElementById("wiz-college")?.value || wizardData.college || "";
    wizardData.contact =
      document.getElementById("wiz-contact")?.value || wizardData.contact || "";
  }
  if (currentWizardStep === 2) {
    wizardData.title =
      document.getElementById("wiz-title")?.value || wizardData.title || "";
    wizardData.date =
      document.getElementById("wiz-date")?.value || wizardData.date || "";
    wizardData.desc =
      document.getElementById("wiz-desc")?.value || wizardData.desc || "";
    wizardData.field =
      document.getElementById("wiz-field")?.value || wizardData.field || "";
    wizardData.abstract =
      document.getElementById("wiz-abstract")?.value ||
      wizardData.abstract ||
      "";
    wizardData.claims =
      document.getElementById("wiz-claims")?.value || wizardData.claims || "";
    wizardData.marktype =
      document.getElementById("wiz-marktype")?.value ||
      wizardData.marktype ||
      "";
    wizardData.worktype =
      document.getElementById("wiz-worktype")?.value ||
      wizardData.worktype ||
      "";
    wizardData.registrationLane =
      document.getElementById("wiz-reglane")?.value ||
      wizardData.registrationLane ||
      "";
    wizardData.officialDuty =
      document.getElementById("wiz-officialduty")?.value ||
      wizardData.officialDuty ||
      "";
    wizardData.letterRequest =
      document.getElementById("wiz-letterrequest")?.value ||
      wizardData.letterRequest ||
      "";
    wizardData.originality =
      document.getElementById("wiz-originality")?.value ||
      wizardData.originality ||
      "";
    wizardData.prodcat =
      document.getElementById("wiz-prodcat")?.value || wizardData.prodcat || "";
    wizardData.designtype =
      document.getElementById("wiz-designtype")?.value ||
      wizardData.designtype ||
      "";
  }
}

function handleDepositUpload(input) {
  const status = document.getElementById("depositFileStatus");
  if (!status || !input.files.length) return;
  const f = input.files[0];
  const label =
    currentFormType === "copyright"
      ? "Official receipt copy uploaded"
      : "Proof of Deposit uploaded";
  const badge = currentFormType === "copyright" ? "RECORDED" : "VERIFIED";
  status.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);border-radius:8px">
    <i class="fa-solid fa-circle-check" style="color:var(--green);font-size:1.2rem"></i>
    <div style="flex:1">
      <div style="font-size:.9rem;font-weight:600;color:var(--navy)">${f.name}</div>
      <div style="font-size:.8rem;color:var(--gray-400)">${(f.size / 1024).toFixed(1)} KB - ${label}</div>
    </div>
    <span class="badge badge-approved" style="font-size:.65rem">${badge}</span>
  </div>`;
}

function submitForm() {
  const typeMap = {
    patent: "Patent",
    trademark: "Trademark",
    copyright: "Copyright",
    utility: "Utility Model",
    industrial: "Industrial Design",
  };
  const prefix = {
    patent: "PAT",
    trademark: "TM",
    copyright: "COP",
    utility: "UM",
    industrial: "ID",
  };
  const refNum = `PSU-${prefix[currentFormType]}-2026-${String(submissions.length + 1).padStart(3, "0")}`;
  const feeWaived = isCopyrightFeeWaivedRoute();

  const newSub = {
    id: refNum,
    type: typeMap[currentFormType],
    title: wizardData.title || "New Research Innovation",
    applicant: wizardData.name || "Juan dela Cruz",
    department: wizardData.dept || "College of Sciences",
    email: wizardData.email || "juan.delacruz@psu.edu.ph",
    contact: wizardData.contact || "09181234567",
    status: "Pending",
    date: "2026-03-28",
    description: wizardData.desc || "Newly submitted application.",
    paymentVerified: currentFormType === "copyright" ? feeWaived : true,
    paymentExempt: feeWaived,
    frozen: false,
    assignedReviewerId: null,
    hasTopSecretAnnex: ["Patent", "Utility Model"].includes(
      typeMap[currentFormType],
    ),
  };

  if (currentFormType === "copyright") {
    newSub.workType = wizardData.worktype || "Creative Work";
    newSub.dateCreated = wizardData.date || "2026-03-28";
    newSub.registrationLane = wizardData.registrationLane || "Copyright";
    newSub.officialDutyWork = wizardData.officialDuty === "Yes";
    newSub.letterRequestApproved = wizardData.letterRequest === "Approved";
    newSub.originalityStatement = wizardData.originality || "";
    newSub.officialReceiptNumber = feeWaived
      ? "Fee-waived routing"
      : "Pending cashier receipt";
    newSub.copyrightStage = "author-submission";
  } else {
    newSub.paymentVerified = false; // match IPOPHL operations flow
    newSub.paymentExempt = false;
    newSub.officialReceiptNumber = "Pending receipt validation";
    newSub.ipophlStage = "inventor-submission";
  }

  submissions.unshift(newSub);

  document.getElementById("main-content").innerHTML = `
    <div class="confirmation-screen">
      <div class="check-circle"><i class="fa-solid fa-check"></i></div>
      <h2>Application Submitted Successfully!</h2>
      <p style="color:var(--gray-500)">${
        currentFormType === "copyright"
          ? feeWaived
            ? "Your copyright packet has been routed to the reviewer for completeness checking using the declared fee-waived route."
            : "Your copyright packet has been routed to the reviewer for completeness checking before PITBI Admin issues the payment slip."
          : `Your ${typeMap[currentFormType]} application has been received and is now under review.`
      }</p>
      <div class="ref-number">${refNum}</div>
      <p style="font-size:.85rem;color:var(--gray-400);margin-bottom:24px">Please save this reference number for tracking purposes.</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-primary" onclick="navigateTo('user-dashboard')"><i class="fa-solid fa-chart-line"></i> Go to Dashboard</button>
        <button class="btn btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-file-lines"></i> View Submissions</button>
      </div>
    </div>`;
}

function renderSubmissionDetail() {
  const s = submissions.find((sub) => sub.id === selectedSubmissionId);
  if (!s) return "<p>Submission not found.</p>";
  if (!getVisibleSubmissions(currentRole).some((sub) => sub.id === s.id)) {
    return '<div class="detail-panel"><h3>Access Restricted</h3><p>This role cannot open the requested case.</p></div>';
  }

  const normalizedRole = normalizeRole(currentRole);
  const frozen = s.status === "Approved";
  const paymentVerified = s.paymentVerified !== false;
  const confidentialAccess = getDownloadAccess(s, "confidential");
  const topSecretAccess = s.hasTopSecretAnnex
    ? getDownloadAccess(s, "top_secret")
    : "deny";
  const paymentMeta = getSubmissionPaymentMeta(s);
  const paymentStyles =
    paymentMeta.theme === "green"
      ? {
          bg: "rgba(22,163,74,0.06)",
          border: "rgba(22,163,74,0.2)",
          color: "var(--green)",
        }
      : paymentMeta.theme === "blue"
        ? {
            bg: "rgba(59,130,246,0.06)",
            border: "rgba(59,130,246,0.2)",
            color: "var(--navy)",
          }
        : {
            bg: "rgba(239,68,68,0.06)",
            border: "rgba(239,68,68,0.2)",
            color: "var(--red)",
          };
  const copyrightStage =
    s.type === "Copyright"
      ? COPYRIGHT_OPERATION_FLOW.find(
          (step) => step.key === getCopyrightStageKey(s),
        )
      : null;
  const ipophlStageObj = IPOPHL_TYPES.has(s.type)
    ? IPOPHL_OPERATION_FLOW.find((step) => step.key === getIPOPHLStageKey(s))
    : null;

  return `
    <div class="page-header">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <h1 style="margin:0">${s.title}</h1>
        ${frozen ? '<span class="badge badge-frozen"><i class="fa-solid fa-lock"></i> Frozen for Certification</span>' : ""}
      </div>
      <p style="margin-top:8px">Submission Detail - ${s.id} &bull; Filed ${s.date}</p>
    </div>

    ${
      frozen
        ? `<div style="padding:14px 20px; background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
      <i class="fa-solid fa-lock" style="color:#6366f1; font-size:1.2rem;"></i>
      <div><strong style="color:#4f46e5;">Metadata Frozen</strong><p style="font-size:.85rem; color:var(--gray-500); margin:2px 0 0;">Per system policy, the core technical metadata of this approved submission has been locked and cannot be altered by administrators.</p></div>
    </div>`
        : ""
    }

    <div style="padding:12px 18px; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
      <i class="fa-solid fa-person-chalkboard" style="color:#d97706; font-size:1.1rem;"></i>
      <div><strong style="color:#d97706;">Manual Review Policy</strong><p style="font-size:.82rem; color:var(--gray-500); margin:2px 0 0;">This system does not use automated or AI-driven document assessment. All submissions undergo human evaluation by authorized IP Office personnel before status is updated.</p></div>
    </div>

    <div class="detail-layout">
      <div>
        <div class="detail-panel">
          <h3><i class="fa-solid fa-user"></i> Applicant Information</h3>
          <div class="detail-row"><span class="label">Name</span><span class="value">${s.applicant}</span></div>
          <div class="detail-row"><span class="label">Department</span><span class="value">${s.department}</span></div>
          <div class="detail-row"><span class="label">Email</span><span class="value">${s.email}</span></div>
          <div class="detail-row"><span class="label">Contact</span><span class="value">${s.contact}</span></div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-file-lines"></i> IP Details</h3>
          <div class="detail-row"><span class="label">Type</span><span class="value">${typeBadge(s.type)}</span></div>
          <div class="detail-row"><span class="label">Title</span><span class="value">${s.title}</span></div>
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">National Library Lane</span><span class="value">${s.registrationLane || "Copyright"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Work Type</span><span class="value">${s.workType || "Creative Work"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Official Duty Work</span><span class="value">${s.officialDutyWork ? "Yes" : "No"}</span></div>` : ""}
          ${s.type === "Copyright" ? `<div class="detail-row"><span class="label">Approved Letter-Request</span><span class="value">${s.letterRequestApproved ? "Yes" : "No"}</span></div>` : ""}
          <div class="detail-row"><span class="label">Description</span><span class="value">${s.description}</span></div>
          <div class="detail-row"><span class="label">Date Filed</span><span class="value">${s.date}</span></div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-paperclip"></i> Documents & Payment</h3>
          <div style="padding:16px;background:var(--gray-50);border-radius:8px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:10px">
              <i class="fa-solid fa-file-pdf" style="color:var(--red);font-size:1.3rem"></i>
              <div><div style="font-weight:600;font-size:.9rem">application_document.pdf</div><div style="font-size:.8rem;color:var(--gray-400)">Uploaded on ${s.date}</div></div>
            </div>
          </div>
          <div class="detail-actions" style="margin-top:0; margin-bottom:12px;">
            ${canUploadDocuments(s) ? `<button class="btn btn-secondary btn-sm" onclick="showToast('Document upload slot opened for ${s.id}')"><i class="fa-solid fa-upload"></i> Upload Documents</button>` : ""}
            ${confidentialAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading confidential packet for ${s.id}')"><i class="fa-solid fa-download"></i> Download Confidential</button>` : ""}
            ${topSecretAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading top secret annex for ${s.id}')"><i class="fa-solid fa-shield-halved"></i> Download Top Secret</button>` : ""}
            ${topSecretAccess === "approval" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Top secret download for ${s.id} requires super admin approval.')"><i class="fa-solid fa-key"></i> Top Secret Approval</button>` : ""}
          </div>
          <div style="padding:14px;background:${paymentStyles.bg};border:1px solid ${paymentStyles.border};border-radius:8px;display:flex;align-items:center;gap:10px">
            <i class="fa-solid ${paymentMeta.icon}" style="color:${paymentStyles.color};font-size:1.2rem"></i>
            <div><div style="font-weight:700;font-size:.9rem;color:${paymentStyles.color}">${paymentMeta.title}</div><div style="font-size:.8rem;color:var(--gray-400)">${paymentMeta.detail}</div></div>
            ${(normalizedRole === "admin" || normalizedRole === "superadmin") && paymentMeta.actionLabel ? `<button class="btn btn-sm btn-success" style="margin-left:auto" onclick="togglePaymentStatus('${s.id}')"><i class="fa-solid fa-${paymentVerified ? "check" : "upload"}"></i> ${paymentMeta.actionLabel}</button>` : ""}
          </div>
        </div>
      </div>
      <div>
        <div class="detail-panel">
          <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
          <div style="margin-bottom:16px">${statusBadge(s.status)}</div>
          ${
            copyrightStage
              ? `<div style="padding:12px 14px; background:rgba(255,127,80,0.06); border:1px solid rgba(255,127,80,0.18); border-radius:10px; margin-bottom:16px;">
            <div style="font-size:.78rem; font-weight:700; color:var(--gold-dark); text-transform:uppercase; letter-spacing:.08em;">Current Copyright Step</div>
            <div style="font-size:.95rem; font-weight:700; color:var(--navy); margin-top:4px;">Step ${copyrightStage.step}: ${copyrightStage.title}</div>
            <div style="font-size:.8rem; color:var(--gray-500); margin-top:4px;">${copyrightStage.owner} - ${copyrightStage.lane}</div>
          </div>`
              : ""
          }
          ${
            ipophlStageObj
              ? `<div style="padding:12px 14px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.18); border-radius:10px; margin-bottom:16px;">
            <div style="font-size:.78rem; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:.08em;">Current IPOPHL Step</div>
            <div style="font-size:.95rem; font-weight:700; color:var(--navy); margin-top:4px;">Step ${ipophlStageObj.step}: ${ipophlStageObj.title}</div>
            <div style="font-size:.8rem; color:var(--gray-500); margin-top:4px;">${ipophlStageObj.owner} - ${ipophlStageObj.lane}</div>
          </div>`
              : ""
          }
          ${
            canAdvanceSubmission(s) && !frozen
              ? `
          <label class="form-group" style="margin-bottom:12px">
            <span style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px">Update Status</span>
            <select onchange="changeStatus('${s.id}', this.value)" style="width:100%">
              <option ${s.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${s.status === "Under Review" ? "selected" : ""}>Under Review</option>
              <option ${s.status === "Awaiting Documents" ? "selected" : ""}>Awaiting Documents</option>
              <option ${s.status === "Approved" ? "selected" : ""}>Approved</option>
              <option ${s.status === "Rejected" ? "selected" : ""}>Rejected</option>
              ${canArchiveSubmission() ? `<option ${s.status === "Archived" ? "selected" : ""}>Archived</option>` : ""}
            </select>
          </label>`
              : frozen
                ? '<p style="font-size:.8rem;color:#6366f1;background:rgba(99,102,241,0.06);padding:10px;border-radius:6px;"><i class="fa-solid fa-lock"></i> Status changes are locked for certified submissions.</p>'
                : ""
          }
          ${
            canAdvanceSubmission(s) && !frozen
              ? `<div class="detail-actions">
            <button class="btn btn-success btn-sm" onclick="changeStatus('${s.id}','Approved')"><i class="fa-solid fa-check"></i> Approve</button>
            <button class="btn btn-danger btn-sm" onclick="changeStatus('${s.id}','Rejected')"><i class="fa-solid fa-xmark"></i> Reject</button>
            <button class="btn btn-secondary btn-sm" onclick="requestDocs('${s.id}')"><i class="fa-solid fa-file-circle-plus"></i> Request Docs</button>
            ${canArchiveSubmission() ? `<button class="btn btn-secondary btn-sm" onclick="archiveSubmission('${s.id}')"><i class="fa-solid fa-box-archive"></i> Archive</button>` : ""}
          </div>`
              : ""
          }
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-comment"></i> Admin Notes</h3>
          <div class="admin-notes">
            <textarea placeholder="Add internal notes about this submission..." ${frozen || !canEditSubmission(s) ? "disabled" : ""}></textarea>
            ${!frozen && canEditSubmission(s) ? `<button class="btn btn-sm btn-primary" onclick="showToast('Notes saved')">Save Notes</button>` : ""}
          </div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-timeline"></i> ${normalizedRole !== "reviewer" && s.type === "Copyright" ? "Copyright Operational Flow" : normalizedRole !== "reviewer" && IPOPHL_TYPES.has(s.type) ? "IPOPHL Operational Flow" : "Activity Timeline"}</h3>
          ${
            normalizedRole !== "reviewer" && s.type === "Copyright"
              ? renderCopyrightOperationTimeline(s)
              : normalizedRole !== "reviewer" && IPOPHL_TYPES.has(s.type)
                ? renderIPOPHLOperationTimeline(s)
                : `<div class="timeline">
            ${s.status === "Approved" ? '<div class="timeline-item"><div class="time">Mar 29, 2026 - 11:00 AM</div><div class="event"><i class="fa-solid fa-lock" style="color:#6366f1"></i> Metadata frozen for certification</div></div>' : ""}
            <div class="timeline-item"><div class="time">Mar 27, 2026 - 2:32 PM</div><div class="event">Status changed to ${s.status} by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">Mar 26, 2026 - 9:45 AM</div><div class="event"><i class="fa-solid fa-receipt" style="color:var(--gold)"></i> Proof of Deposit verified</div></div>
            <div class="timeline-item"><div class="time">Mar 25, 2026 - 10:15 AM</div><div class="event">Documents reviewed by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">${s.date} - 9:00 AM</div><div class="event">Application submitted by ${s.applicant}</div></div>
          </div>`
          }
        </div>
      </div>
    </div>`;
}

function renderIpTutorial() {
  const types = [
    {
      id: "patent",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      title: "Patent",
      subtitle: "Protect inventions & technical innovations",
      term: "20 years from filing date",
      requirements: [
        "Novelty - new to the world",
        "Inventive Step - non-obvious",
        "Industrial Applicability",
      ],
      process: [
        {
          n: 1,
          t: "Prepare Disclosure",
          d: "Write Invention Disclosure Statement with technical details.",
        },
        {
          n: 2,
          t: "Fill Application Form",
          d: "Complete PSU-IPO-PAT-01 with full inventor details.",
        },
        {
          n: 3,
          t: "Prepare Drawings",
          d: "Prepare technical drawings, diagrams, and abstract.",
        },
        {
          n: 4,
          t: "Submit & Pay",
          d: "Upload all documents + proof-of-deposit filing fee.",
        },
        {
          n: 5,
          t: "IPOPHL Filing",
          d: "IP Office forwards verified packet to national registry.",
        },
      ],
      docs: [
        "Patent Application Form (PSU-IPO-PAT-01)",
        "Invention Disclosure Statement (min 2 pages)",
        "Technical Drawings / Diagrams",
        "Abstract (150 words max)",
        "Claims Statement",
        "Proof-of-Deposit / Official Receipt",
      ],
    },
    {
      id: "trademark",
      icon: "fa-stamp",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      title: "Trademark",
      subtitle: "Register brands, logos & identifiers",
      term: "10 years (renewable)",
      requirements: [
        "Distinctiveness",
        "Non-descriptive of goods/services",
        "Non-deceptive in nature",
      ],
      process: [
        {
          n: 1,
          t: "Define the Mark",
          d: "Identify whether it is a word, logo, or combination mark.",
        },
        {
          n: 2,
          t: "Prepare Specimen",
          d: "Prepare high-resolution mark file (300+ DPI).",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete PSU-IPO-TM-01 with goods/services description.",
        },
        { n: 4, t: "Submit & Pay", d: "Upload mark + proof-of-deposit." },
        {
          n: 5,
          t: "IPOPHL Review",
          d: "IP Office submits to IPOPHL for official registration.",
        },
      ],
      docs: [
        "Trademark Application Form (PSU-IPO-TM-01)",
        "Mark Specimen / Logo File (min 300 DPI)",
        "Description of Goods/Services",
        "Declaration of First Use",
        "Color Claim Statement (if applicable)",
        "Proof-of-Deposit / Official Receipt",
      ],
    },
    {
      id: "copyright",
      icon: "fa-copyright",
      color: "#10b981",
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      title: "Copyright",
      subtitle: "Safeguard creative works, software, and publications",
      term: "Lifetime + 50 years",
      requirements: [
        "Original work of the author",
        "Fixed in tangible form",
        "Creative expression (not just ideas)",
      ],
      process: [
        {
          n: 1,
          t: "Submit to Reviewer",
          d: "The author files the National Library packet to the reviewer for completeness checking.",
        },
        {
          n: 2,
          t: "Admin Recording",
          d: "Complete packets are logged by Admin and assigned the cashier or fee-waived route.",
        },
        {
          n: 3,
          t: "Cashier and OR Return",
          d: "If payment is required, the author pays the cashier and returns the official receipt copy.",
        },
        {
          n: 4,
          t: "National Library Filing",
          d: "The super admin lane acts as the IP Director authority for endorsement and filing.",
        },
        {
          n: 5,
          t: "Certificate Release",
          d: "Admin records the Certificate of Registration and releases it to the author.",
        },
      ],
      docs: [
        "National Library application form (Copyright / ISSN / ISBN / ISMN)",
        "Complete Copy of the Work",
        "Valid Philippine ID (Digitized)",
        "Declaration of Originality",
        "Approved letter-request for official-duty works (conditional)",
        "Official Receipt / cashier receipt copy",
      ],
    },
    {
      id: "utility",
      icon: "fa-gears",
      color: "#6366f1",
      gradient: "linear-gradient(135deg,#6366f1,#4338ca)",
      title: "Utility Model",
      subtitle: "Faster protection for technical innovations",
      term: "7 years (no renewal)",
      requirements: [
        "Novelty - new to the world",
        "Industrial Applicability",
        "No inventive step required (easier than patent)",
      ],
      process: [
        {
          n: 1,
          t: "Document Innovation",
          d: "Write technical description of the model and its use.",
        },
        {
          n: 2,
          t: "Prepare Drawings",
          d: "Create technical drawings or illustrations of the model.",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete the Utility Model Application Form.",
        },
        {
          n: 4,
          t: "Write Claims",
          d: "Define the specific claims and novelty statement.",
        },
        {
          n: 5,
          t: "Submit & Pay",
          d: "Upload all documents + proof-of-deposit.",
        },
      ],
      docs: [
        "Utility Model Application Form",
        "Technical Description",
        "Technical Drawings / Illustrations",
        "Claims Statement",
        "Novelty Statement",
        "Proof-of-Deposit / Official Receipt",
      ],
    },
    {
      id: "industrial",
      icon: "fa-pen-nib",
      color: "#ec4899",
      gradient: "linear-gradient(135deg,#ec4899,#be185d)",
      title: "Industrial Design",
      subtitle: "Protect the aesthetic appearance of products",
      term: "5 years (renewable up to 15 yrs)",
      requirements: [
        "Visual/ornamental novelty",
        "Applied to an article/product",
        "Not dictated solely by function",
      ],
      process: [
        {
          n: 1,
          t: "Photograph the Design",
          d: "Take clear photos from all angles: front, back, top, sides, perspective.",
        },
        {
          n: 2,
          t: "Write Design Statement",
          d: "Describe the ornamental features that give the design its appearance.",
        },
        {
          n: 3,
          t: "Fill Application Form",
          d: "Complete the Industrial Design Application Form.",
        },
        { n: 4, t: "Submit & Pay", d: "Upload all files + proof-of-deposit." },
        {
          n: 5,
          t: "IPOPHL Registration",
          d: "Design is examined and registered if qualifying.",
        },
      ],
      docs: [
        "Industrial Design Application Form",
        "Design Representation Files (Photos/3D renders)",
        "Description of Design - ornamental aspects",
        "Product Category Statement",
        "Proof-of-Deposit / Official Receipt",
      ],
    },
  ];

  return `
    <div class="page-header" style="margin-bottom:36px">
      <h1><i class="fa-solid fa-book-open" style="color:var(--gold);margin-right:10px"></i>IP Application Tutorial</h1>
      <p>A step-by-step guide to all five IP types, their requirements, and filing procedures at PSU.</p>
    </div>
    <div style="background:linear-gradient(135deg,var(--navy),var(--navy-dark));border-radius:16px;padding:28px 32px;margin-bottom:36px;color:white;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-30px;right:-30px;width:180px;height:180px;background:rgba(255,255,255,0.04);border-radius:50%;pointer-events:none;"></div>
      <h2 style="font-size:1.1rem;font-weight:800;margin-bottom:10px;"><i class="fa-solid fa-shield-halved" style="color:var(--gold);margin-right:8px;"></i>Before You Begin - Important Notes</h2>
      <ul style="color:rgba(255,255,255,0.8);font-size:0.88rem;line-height:1.8;padding-left:20px;margin:0;">
        <li>This system is a <strong style="color:var(--gold)">pre-filing optimization engine</strong> - not a final registration site. Verified packets are forwarded to <strong style="color:white">IPOPHL</strong> or the <strong style="color:white">National Library</strong>, depending on the IP type.</li>
        <li>All submissions require a <strong style="color:var(--gold)">Proof-of-Deposit or Official Receipt</strong> before they are considered complete for review, unless a copyright fee-waiver route is approved through an official letter-request.</li>
        <li>Review is performed <strong style="color:white">manually by authorized IP Office personnel</strong> - no automated or AI-driven assessment is used.</li>
        <li>Once a submission is approved and certified, its core metadata is <strong style="color:white">frozen and cannot be altered</strong>.</li>
      </ul>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px;padding-bottom:60px;">
      ${types
        .map(
          (t) => `
        <div style="background:#fff;border-radius:16px;border:1px solid var(--gray-200);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="background:${t.gradient};padding:22px 28px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
            <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;flex-shrink:0;">
              <i class="fa-solid ${t.icon}"></i>
            </div>
            <div style="flex:1">
              <h3 style="font-size:1.2rem;font-weight:800;color:white;margin-bottom:4px;">${t.title}</h3>
              <p style="color:rgba(255,255,255,0.82);font-size:0.86rem;margin:0;">${t.subtitle}</p>
            </div>
            <div style="padding:10px 14px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.2);border-radius:10px;color:white;font-size:0.78rem;font-weight:700;">Term: ${t.term}</div>
          </div>
          <div style="display:grid;grid-template-columns:1.1fr 1.25fr 1fr;">
            <div style="padding:24px 28px;border-right:1px solid var(--gray-100);">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-shield-check" style="color:${t.color};"></i>Qualification Checklist</h4>
              <ul style="padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">
                ${t.requirements.map((r) => `<li style="display:flex;align-items:flex-start;gap:8px;font-size:0.875rem;color:var(--gray-700);"><i class="fa-solid fa-circle-check" style="color:${t.color};margin-top:3px;font-size:0.7rem;flex-shrink:0;"></i>${r}</li>`).join("")}
              </ul>
            </div>
            <div style="padding:24px 28px;border-right:1px solid var(--gray-100);">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-list-ol" style="color:${t.color};"></i>Filing Process</h4>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${t.process.map((p) => `<div style="display:flex;gap:10px;"><span style="width:22px;height:22px;border-radius:50%;background:${t.color};color:white;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${p.n}</span><div><strong style="color:var(--navy);display:block;font-size:0.85rem;">${p.t}</strong><span style="color:var(--gray-500);font-size:0.8rem;">${p.d}</span></div></div>`).join("")}
              </div>
            </div>
            <div style="padding:24px 28px;">
              <h4 style="font-size:0.8rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-paperclip" style="color:${t.color};"></i>Required Documents</h4>
              <ul style="padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:16px;">
                ${t.docs.map((d) => `<li style="display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;color:var(--gray-600);"><i class="fa-solid fa-file-lines" style="color:${t.color};margin-top:3px;font-size:0.65rem;flex-shrink:0;"></i>${d}</li>`).join("")}
              </ul>
              <button style="background:${t.gradient};color:white;border:none;padding:9px 18px;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:'Inter',sans-serif;" onclick="navigateTo('${t.id}-form')">
                <i class="fa-solid fa-file-circle-plus"></i> Start ${t.title} Application
              </button>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>`;
}

// ===== NOTIFICATIONS =====
window.toggleNotifications = function () {
  notifOpen = !notifOpen;
  const dropdown = document.getElementById("notifDropdown");
  const bell = document.getElementById("notifBell");
  if (dropdown) dropdown.classList.toggle("open", notifOpen);
  if (bell) bell.classList.toggle("active", notifOpen);
  if (notifOpen) {
    // Mark all as read after open
    setTimeout(() => {
      mockNotifications.forEach((n) => (n.read = true));
      const badge = document.getElementById("notifBadge");
      if (badge) badge.style.display = "none";
    }, 2000);
    // Render notifications
    const list = document.getElementById("notifList");
    if (list) {
      list.innerHTML = mockNotifications
        .map(
          (n) => `
        <div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--gray-100);${n.read ? "opacity:.65" : ""};cursor:pointer;" onmouseenter="this.style.background='var(--gray-50)'" onmouseleave="this.style.background=''">
          <div style="width:36px;height:36px;border-radius:50%;background:${n.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid ${n.icon}" style="color:${n.color};font-size:.85rem;"></i>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.85rem;font-weight:${n.read ? "500" : "700"};color:var(--navy);margin-bottom:2px;">${n.title}</div>
            <div style="font-size:.78rem;color:var(--gray-500);line-height:1.4;">${n.body}</div>
            <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px;">${n.time}</div>
          </div>
          ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0;margin-top:6px;"></div>' : ""}
        </div>`,
        )
        .join("");
    }
  }
  // Close on outside click
  if (notifOpen) {
    setTimeout(() => {
      document.addEventListener("click", function closeNotif(e) {
        if (!document.getElementById("notifBell")?.contains(e.target)) {
          notifOpen = false;
          document.getElementById("notifDropdown")?.classList.remove("open");
          document.getElementById("notifBell")?.classList.remove("active");
          document.removeEventListener("click", closeNotif);
        }
      });
    }, 0);
  }
};

// ===== ANNOUNCEMENTS =====
function renderAdminAnnouncementsPage() {
  return `
    <div class="page-header" style="margin-bottom:32px;">
      <h1>Manage Announcements</h1>
      <p>Create and edit news, events, and alerts for the landing page.</p>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h3>All Announcements</h3>
        <button class="btn btn-primary" onclick="showAnnouncementModal()"><i class="fa-solid fa-plus"></i> Add New Announcement</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${announcements.length ? announcements.map(a => `
              <tr>
                <td>${a.date}</td>
                <td><span class="badge badge-info">${a.category}</span></td>
                <td><strong>${a.title}</strong></td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-outline-navy" onclick="showAnnouncementModal(${a.id})"><i class="fa-solid fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-red" onclick="deleteAnnouncement(${a.id})"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;">No announcements found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

window.showAnnouncementModal = function(id = null) {
  const isEdit = id !== null;
  const a = isEdit ? announcements.find(item => item.id === id) : { title: '', content: '', category: 'News', date: new Date().toISOString().split('T')[0] };
  
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const modalOverlay = document.getElementById('modalOverlay');

  modalTitle.innerText = isEdit ? 'Edit Announcement' : 'Add New Announcement';
  
  // Use a data attribute or hidden input to store the ID for safer retrieval
  modalBody.innerHTML = `
    <form id="announcementForm" onsubmit="saveAnnouncement(event, ${id === null ? 'null' : id})">
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="annTitle" value="${a.title}" required />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="annCategory">
          <option ${a.category === 'News' ? 'selected' : ''}>News</option>
          <option ${a.category === 'Event' ? 'selected' : ''}>Event</option>
          <option ${a.category === 'Alert' ? 'selected' : ''}>Alert</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="annDate" value="${a.date}" required />
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea id="annContent" rows="4" required>${a.content}</textarea>
      </div>
      <div style="display:flex; gap:12px; margin-top:20px;">
        <button type="submit" class="btn btn-primary btn-block">${isEdit ? 'Save Changes' : 'Create Announcement'}</button>
        <button type="button" class="btn btn-outline btn-block" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `;
  modalOverlay.classList.add('active');
};

window.saveAnnouncement = function(e, id) {
  e.preventDefault();
  const title = document.getElementById('annTitle').value;
  const category = document.getElementById('annCategory').value;
  const date = document.getElementById('annDate').value;
  const content = document.getElementById('annContent').value;

  console.log('Saving announcement:', { id, title, category, date });

  if (id !== null && id !== undefined && id !== 'null') {
    // Editing existing
    const idx = announcements.findIndex(a => a.id == id);
    if (idx !== -1) {
      announcements[idx] = { ...announcements[idx], title, category, date, content };
      showToast('Announcement updated successfully');
    } else {
      console.error('Announcement not found for ID:', id);
      showToast('Error: Announcement not found', 'error');
    }
  } else {
    // Creating new
    const newId = announcements.length ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
    announcements.push({ 
      id: newId, 
      title, 
      category, 
      date, 
      content, 
      image: 'images/psu_logo_main.png' 
    });
    showToast('Announcement created successfully');
  }
  
  if (typeof closeModal === 'function') closeModal();
  renderDashboardContent('admin-announcements');
};

window.deleteAnnouncement = function(id) {
  if (confirm('Are you sure you want to delete this announcement?')) {
    const idx = announcements.findIndex(a => a.id === id);
    announcements.splice(idx, 1);
    showToast('Announcement deleted');
    renderDashboardContent('admin-announcements');
  }
};

function renderLandingAnnouncements() {
  const grid = document.getElementById('announcementGrid');
  if (!grid) return;

  grid.innerHTML = announcements.map(a => `
    <div class="announcement-card" style="animation: fadeInUp 0.5s ease forwards;">
      <div class="ann-badge-line">
        <span class="ann-badge ${a.category.toLowerCase()}">${a.category}</span>
        <span class="ann-date">${a.date}</span>
      </div>
      <h3 class="ann-title">${a.title}</h3>
      <p class="ann-content">${a.content}</p>
      <div class="ann-footer">
        <a href="#" class="ann-link">Read More <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </div>
  `).join('');
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  if (currentRole === "client" && isLoggedIn) {
    navigateTo("user-dashboard");
  } else if (isLoggedIn) {
    navigateTo("admin-dashboard");
  } else {
    navigateTo("landing");
  }
});
