// ============================================================
// THE CREATOR'S BULWARK — APP.JS
// Complete application logic with mock data & interactivity
// ============================================================

// ===== STATE =====
let currentPage = "landing";
let currentRole = "applicant";
// Supported RBAC roles: 'superadmin', 'admin', 'reviewer', 'applicant'
let isLoggedIn = false;
let sidebarCollapsed = false;
let selectedLoginRole = "client";
let currentWizardStep = 1;
let currentFormType = "";
let submissionMethod = "online"; // 'online' or 'upload'
let selectedSubmissionId = null;
let wizardData = {};
let notifOpen = false;
let pendingSignupData = null; // Holds signup data during OTP verification
let pendingParams = {};
let pendingAction = null; // Stores action to perform after login/signup
let currentMpType = "All";
let landingMpType = "All";
let dismissedTopAlertId = null;

function updateMarketplaceTypeButtons(selector, type) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
}

window.setMpType = function(type) {
  currentMpType = type;
  updateMarketplaceTypeButtons("#main-content .mp-type-btn, #marketplacePublicContent .mp-type-btn", type);
  filterMarketplace();
};

window.setLandingMpType = function(type) {
  landingMpType = type;
  updateMarketplaceTypeButtons("#featured-marketplace-section .mp-type-btn", type);
  filterLandingMarketplace();
};

const ROLE_ALIASES = {
  superadmin: "superadmin",
  "Admin": "superadmin",
  admin: "superadmin",
  Admin: "superadmin",
  pitbi_admin: "superadmin",
  "PITBI Admin": "superadmin",
  reviewer: "reviewer",
  specialist: "reviewer",
  evaluator: "reviewer",
  Evaluator: "reviewer",
  Reviewer: "reviewer",
  applicant: "applicant",
  inventor: "applicant",
  author: "applicant",
  creator: "applicant",
  client: "applicant",
  Client: "applicant",
  user: "applicant",
  User: "applicant",
};

function normalizeRole(role) {
  return ROLE_ALIASES[role] || "applicant";
}
const mockNotifications = {
  superadmin: [
    {
      id: 201,
      icon: "fa-circle-plus",
      color: "#22c55e",
      title: "New Application Submitted",
      body: "A new Patent application (PSU-PAT-2026-022) is awaiting initial review.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 202,
      icon: "fa-triangle-exclamation",
      color: "#ef4444",
      title: "Urgent: Fee Verification",
      body: "Payment verification is pending for 3 priority applications.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 203,
      icon: "fa-file-shield",
      color: "#3b82f6",
      title: "Audit Log Export Complete",
      body: "The monthly audit log for March 2026 is ready for download.",
      time: "5 hours ago",
      read: true,
    }
  ],
  reviewer: [
    {
      id: 101,
      userId: 3,
      icon: "fa-clipboard-list",
      color: "#3b82f6",
      title: "New Specialist Case",
      body: "You have been assigned as specialist for PSU-PAT-2026-015.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 102,
      userId: 3,
      icon: "fa-clock",
      color: "#f59e0b",
      title: "Deadline Approaching",
      body: "Evaluation for PSU-COP-2026-008 is due in 2 days.",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 103,
      userId: 3,
      icon: "fa-circle-check",
      color: "#22c55e",
      title: "Review Confirmed",
      body: "Your feedback for PSU-COP-2026-004 has been received by Admin.",
      time: "Yesterday",
      read: true,
    }
  ],
  applicant: [
    {
      id: 1,
      icon: "fa-circle-check",
      color: "#22c55e",
      title: "PSU-PAT-2026-001 Approved",
      body: "Your patent application has been certified by the IP Office.",
      time: "2 hours ago",
      read: false,
      submissionId: "PSU-PAT-2026-001",
    },
    {
      id: 5,
      userId: 9,
      icon: "fa-store",
      color: "#f97316",
      title: "Marketplace Approval Request",
      body: "Admin requests approval to publish Bamboo-Based Water Filter in the marketplace.",
      time: "Just now",
      read: false,
      type: "marketplace-approval",
      requestId: "MKT-REQ-001",
      submissionId: "PSU-PAT-2026-155",
    },
    {
      id: 2,
      icon: "fa-file-circle-plus",
      color: "#f59e0b",
      title: "Documents Requested",
      body: "Admin Garcia requests additional docs for PSU-COP-2026-002.",
      time: "Yesterday",
      read: false,
      submissionId: "PSU-COP-2026-002",
    },
    {
      id: 3,
      icon: "fa-triangle-exclamation",
      color: "#ef4444",
      title: "Action Required: PSU-COP-2026-014",
      body: "Missing documents detected for Palawan Biodiversity Database.",
      time: " Just now",
      read: false,
      submissionId: "PSU-COP-2026-014",
    },
    {
      id: 4,
      icon: "fa-circle-info",
      color: "#3b82f6",
      title: "System Maintenance",
      body: "We’ll be temporarily closed on April 20 from 2:00 AM to 4:00 AM due to the holiday. You may experience intermittent access during this time.",
      time: "3 days ago",
      read: true,
      announcementId: 3,
    }
  ]
};

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
    content: "We’ll be temporarily closed on April 20 from 2:00 AM to 4:00 AM due to the holiday. You may experience intermittent access during this time.",
    date: "2026-04-13",
    category: "Alert",
    image: "images/IPTTO-logo.jpg"
  }
];

// ===== MOCK DATA =====
let submissions = [
  // PATENTS
  {
    id: "PSU-PAT-2026-001",
    type: "Patent",
    title: "High-Efficiency Solar Distiller",
    applicant: "Juan dela Cruz",
    status: "Under Review",
    date: "2026-04-01",
    department: "College of Engineering",
    description: "A solar-powered distiller optimized for brackish water."
  },
  {
    id: "PSU-PAT-2026-002",
    type: "Patent",
    title: "Automated Crop Pest Detector",
    applicant: "Juan dela Cruz",
    status: "Under Review",
    date: "2026-03-15",
    department: "College of Agriculture",
    description: "IoT-based system for detecting common pests in rice fields.",
    assignedReviewerId: 3,
    assignedEvaluatorId: 3
  },
  {
    id: "PSU-PAT-2026-003",
    type: "Patent",
    title: "Low-Cost Wind Turbine Blade",
    applicant: "Juan dela Cruz",
    status: "Validated",
    date: "2026-03-01",
    department: "College of Engineering",
    description: "Optimized blade design using composite local materials.",
    assignedReviewerId: 3,
    assignedEvaluatorId: 3
  },
  {
    id: "PSU-PAT-2026-004",
    type: "Patent",
    title: "Portable Soil Analyzer",
    applicant: "Juan dela Cruz",
    status: "Payment Requested",
    date: "2026-02-10",
    department: "College of Sciences",
    description: "Handheld device for real-time soil nutrient analysis."
  },
  {
    id: "PSU-PAT-2026-005",
    type: "Patent",
    title: "Bamboo-Based Water Filter",
    applicant: "Juan dela Cruz",
    status: "Approved",
    date: "2026-01-20",
    department: "College of Engineering",
    description: "Natural filtration system using bamboo charcoal."
  },
  {
    id: "PSU-PAT-2026-006",
    type: "Patent",
    title: "Plastic-to-Fuel Converter",
    applicant: "Juan dela Cruz",
    status: "Rejected",
    date: "2025-12-05",
    department: "College of Engineering",
    description: "Small-scale pyrolysis reactor for non-recyclable plastics."
  },
  {
    id: "PSU-PAT-2026-007",
    type: "Patent",
    title: "Smart Irrigation Valve",
    applicant: "Juan dela Cruz",
    status: "Awaiting Documents",
    date: "2026-04-20",
    department: "College of Engineering",
    description: "Electronically controlled valve for precision farming."
  },
  {
    id: "PSU-DFT-PAT-001",
    type: "Patent",
    title: "Thermal Energy Harvester",
    applicant: "Juan dela Cruz",
    status: "Draft",
    date: "2026-04-25",
    department: "College of Sciences",
    description: "Drafting phase for thermoelectric generator modules."
  },
  {
    id: "PSU-PAT-2026-008",
    type: "Patent",
    title: "Smart Hydroponics System",
    applicant: "Juan dela Cruz",
    status: "Pending",
    date: "2026-04-26",
    department: "College of Agriculture",
    description: "Automated nutrient delivery system for indoor farming."
  },

  // COPYRIGHTS
  {
    id: "PSU-COP-2026-001",
    type: "Copyright",
    title: "Palawan Ecosystem Documentary",
    applicant: "Juan dela Cruz",
    status: "Under Review",
    date: "2026-04-05",
    department: "College of Arts",
    description: "Visual documentation of Palawan's flora and fauna."
  },
  {
    id: "PSU-COP-2026-002",
    type: "Copyright",
    title: "PSU Campus Map App",
    applicant: "Juan dela Cruz",
    status: "Under Review",
    date: "2026-03-20",
    department: "College of Sciences",
    description: "Mobile application for campus navigation and info.",
    assignedReviewerId: 3,
    assignedEvaluatorId: 3
  },
  {
    id: "PSU-COP-2026-003",
    type: "Copyright",
    title: "Sustainable Living Handbook",
    applicant: "Juan dela Cruz",
    status: "Validated",
    date: "2026-03-05",
    department: "College of Arts",
    description: "Illustrated guide for eco-friendly urban living.",
    assignedReviewerId: 3,
    assignedEvaluatorId: 3
  },
  {
    id: "PSU-COP-2026-004",
    type: "Copyright",
    title: "Local Legends Anthology",
    applicant: "Juan dela Cruz",
    status: "Payment Requested",
    date: "2026-02-15",
    department: "College of Arts",
    description: "Compilation of oral traditions from northern Palawan."
  },
  {
    id: "PSU-COP-2026-005",
    type: "Copyright",
    title: "EcoLearn Mobile Game",
    applicant: "Juan dela Cruz",
    status: "Approved",
    date: "2026-01-25",
    department: "College of Sciences",
    description: "Educational game teaching environmental stewardship."
  },
  {
    id: "PSU-COP-2026-006",
    type: "Copyright",
    title: "Palawan Culinary History",
    applicant: "Juan dela Cruz",
    status: "Rejected",
    date: "2025-12-15",
    department: "College of Arts",
    description: "Research paper on traditional cooking methods."
  },
  {
    id: "PSU-COP-2026-007",
    type: "Copyright",
    title: "Visual Art Collection 2025",
    applicant: "Juan dela Cruz",
    status: "Awaiting Documents",
    date: "2026-04-22",
    department: "College of Arts",
    description: "Digital gallery of student art contributions."
  },
  {
    id: "PSU-DFT-COP-001",
    type: "Copyright",
    title: "IP Management Software",
    applicant: "Juan dela Cruz",
    status: "Draft",
    date: "2026-04-26",
    department: "College of Sciences",
    description: "Internal codebase for submission tracking."
  },
  {
    id: "PSU-COP-2026-008",
    type: "Copyright",
    title: "Native Plants Field Guide",
    applicant: "Juan dela Cruz",
    status: "Pending",
    date: "2026-04-26",
    department: "College of Sciences",
    description: "Comprehensive field guide for Palawan's native plant species."
  },

  // ADDING SOME OTHER TYPES FOR VARIETY
  {
    id: "PSU-UM-2026-001",
    type: "Utility Model",
    title: "Foldable Solar Oven",
    applicant: "Juan dela Cruz",
    status: "Approved",
    date: "2026-01-10",
    department: "College of Engineering",
    description: "Portable cooking device for field researchers."
  }
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
  {
    id: 21,
    title: "Zero-Emission Seaweed Processor",
    fullTitle: "ZERO-EMISSION SEAWEED PROCESSOR WITH INTEGRATED SOLAR THERMAL DRYING",
    type: "Patent",
    inventor: "Engr. Elena Vance",
    college: "College of Engineering",
    description: "A sustainable seaweed processing system powered by solar thermal energy, eliminating carbon emissions in coastal farming.",
    longDescription: "This innovation provides a complete, off-grid solution for seaweed farmers to process their harvests. It integrates high-efficiency solar thermal collectors with a closed-loop processing chamber that maintains optimal temperature and humidity, ensuring high-quality output while removing the need for burning biomass or using fossil fuels.",
    features: [
      "Zero-carbon footprint during the entire processing cycle.",
      "Smart moisture sensors for automated quality control.",
      "Modular design easily deployable in remote coastal settings."
    ],
    businessPotential: "Highly valuable for the global sustainable aquaculture market. Licensing opportunities with NGOs and government agricultural agencies focused on green energy transitions.",
    contactPerson: "Dr. Gordon Freeman",
    contactEmail: "g.freeman@tcb.psu.edu.ph",
    year: 2026,
    icon: "fa-solid fa-wind",
    image: "images/solar_rice_dryer.png",
  },
];

let marketplaceApprovalRequests = [
  {
    id: "MKT-REQ-001",
    recordId: "PSU-PAT-2026-155",
    applicantUserId: 9,
    requestedByUserId: 2,
    requestedByName: "Dir. Garcia",
    status: "pending",
    requestedAt: "2026-04-29T09:10:00+08:00",
    respondedAt: null,
    listingId: null,
  },
];

let systemUsers = [
  {
    id: 0,
    name: "Dr. Elena Vance",
    email: "elena.vance@globalresearch.org",
    role: "applicant",
    dept: "External Partner",
    status: "Active",
    dateCreated: "2026-04-05",
  },
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
    name: "Engr. Miguel Tan",
    email: "miguel.tan@psu.edu.ph",
    role: "reviewer",
    dept: "Specialist Pool",
    status: "Active",
    dateCreated: "2025-08-01",
    allowedCaseTypes: ["Patent", "Utility Model"],
  },
  {
    id: 4,
    name: "Dr. Celeste Navarro",
    email: "celeste.navarro@psu.edu.ph",
    role: "reviewer",
    dept: "Specialist Pool",
    status: "Active",
    dateCreated: "2025-08-14",
    allowedCaseTypes: ["Industrial Design"],
  },
  {
    id: 5,
    name: "Atty. Ramon Lopez",
    email: "ramon.lopez@psu.edu.ph",
    role: "reviewer",
    dept: "Specialist Pool",
    status: "Active",
    dateCreated: "2025-09-02",
    allowedCaseTypes: ["Copyright"],
  },
  {
    id: 9,
    name: "Juan dela Cruz",
    email: "juan.delacruz@psu.edu.ph",
    role: "applicant",
    dept: "College of Sciences",
    status: "Active",
    dateCreated: "2025-12-01",
  },
  {
    id: 8,
    name: "Maria Santos",
    email: "maria.santos@psu.edu.ph",
    role: "applicant",
    dept: "College of Engineering",
    status: "Active",
    dateCreated: "2025-11-20",
  },
  {
    id: 10,
    name: "Anna Reyes",
    email: "anna.reyes@psu.edu.ph",
    role: "applicant",
    dept: "Research Office",
    status: "Active",
    dateCreated: "2025-12-05",
  },
];

const auditLogs = [
  {
    timestamp: "2026-03-27 14:32",
    accountName: "Dir. Garcia",
    action: "Approved",
    record: "PSU-PAT-2026-001",
    module: "Patent",
    details: "Approved Bamboo-Based Water Filtration Device for final filing.",
  },
  {
    timestamp: "2026-03-27 13:15",
    accountName: "Maria Santos",
    action: "Submitted",
    record: "PSU-PAT-2026-001",
    module: "Patent",
    details: "Submitted a new patent application for intake review.",
  },

  {
    timestamp: "2026-03-26 10:20",
    accountName: "Juan dela Cruz",
    action: "Submitted",
    record: "PSU-COP-2026-002",
    module: "Copyright",
    details: "Submitted a copyright registration packet.",
  },
  {
    timestamp: "2026-03-25 09:00",
    accountName: "Dir. Garcia",
    action: "Rejected",
    record: "PSU-PAT-2026-004",
    module: "Patent",
    details: "Rejected the filing due to insufficient documentation.",
  },

  {
    timestamp: "2026-03-24 11:00",
    accountName: "Dir. Garcia",
    action: "Exported Audit",
    record: "March 2026 Audit Log",
    module: "Audit Log",
    details: "Exported the monthly audit log for institutional reporting.",
  },
  {
    timestamp: "2026-03-23 08:45",
    accountName: "Liza Manalo",
    action: "Submitted",
    record: "PSU-COP-2026-005",
    module: "Copyright",
    details: "Submitted a copyright registration packet.",
  },
  {
    timestamp: "2026-03-22 14:10",
    accountName: "Dir. Garcia",
    action: "Created Account",
    record: "celeste.navarro@psu.edu.ph",
    module: "Accounts",
    details: "Created a specialist account for Dr. Celeste Navarro.",
  },
  {
    timestamp: "2026-03-21 09:30",
    accountName: "Dr. Ricardo Aquino",
    action: "Submitted",
    record: "PSU-COP-2026-007",
    module: "Copyright",
    details: "Submitted a copyright registration packet.",
  },
];

const ROLE_META = {
  superadmin: { label: "Admin", dashboard: "admin-dashboard" },
  admin: { label: "Admin", dashboard: "admin-dashboard" },
  reviewer: { label: "Evaluator", dashboard: "admin-dashboard" },
  applicant: { label: "Applicant", dashboard: "user-dashboard" },
};

const DASHBOARD_ACCESS = {
  superadmin: [
    "admin-dashboard",
    "admin-submissions",
    "messages",
    "submission-detail",
    "audit-log",
    "user-profile",
    "admin-records",
    "admin-marketplace",
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
    "reviewer-my-cases",
    "messages",
    "submission-detail",
    "user-profile",
    "project-blueprint",
  ],
  applicant: [
    "user-dashboard",
    "user-submissions",
    "messages",
    "submission-detail",
    "user-profile",
    "patent-form",
    "copyright-form",
    "utility-form",
    "industrial-form",
    "faq-dash",
    "ip-tutorial",
    "ip-guidelines",
    "project-blueprint",
    "marketplace-dash",
    "filing-hub",
    "forms-dash",
  ],
};

const OPERATIONAL_AUDIT_MODULES = new Set([
  "Patent",
  "Copyright",
  "Utility Model",
  "Industrial Design",
  "Audit Log",
  "Accounts",
  "Market Listing",
  "Announcements",
  "Messages",
]);
const REVIEWER_ASSIGNMENTS = {
  "PSU-COP-2026-007": 4,
  "PSU-PAT-2026-008": 5,
  "PSU-UM-2026-009": 3,
  "PSU-PAT-2026-002": 3,
  "PSU-PAT-2026-003": 3,
  "PSU-COP-2026-002": 3,
  "PSU-COP-2026-003": 3,
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
  "Utility Model",
  "Industrial Design",
]);

submissions = submissions.map((submission) => ({
  ...submission,
  ...(COPYRIGHT_CASE_OVERRIDES[submission.id] || {}),
  ...(IPOPHL_TYPES.has(submission.type)
    ? IPOPHL_CASE_OVERRIDES[submission.id] || {}
    : {}),
  assignedReviewerId: REVIEWER_ASSIGNMENTS[submission.id] || submission.assignedReviewerId || null,
  assignedEvaluatorId: REVIEWER_ASSIGNMENTS[submission.id] || submission.assignedEvaluatorId || null,
  hasTopSecretAnnex: ["Patent", "Utility Model"].includes(submission.type),
}));

systemUsers = systemUsers.map((user) => ({
  ...user,
  role: normalizeRole(user.role),
}));

submissions.forEach((submission) => {
  normalizeUnassignedSubmissionStatus(submission);
  syncSubmissionWorkflowState(submission);
});

const ACTIVE_ROLE_USER_IDS = {
  superadmin: 2,
  reviewer: 3,
  applicant: 9,
};

function formatAuditTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getAuditAccountName(log) {
  return log.accountName || log.user || "System";
}

function getAuditRecord(log) {
  return log.record || log.module || "System";
}

function getAuditDetails(log) {
  return log.details || log.detail || "";
}

function addAuditLog({ accountName, action, record, details, module = "System" }) {
  auditLogs.unshift({
    timestamp: formatAuditTimestamp(),
    accountName,
    action,
    record,
    details,
    module,
  });
}

function maskSensitiveValue(value) {
  if (!value) return "";
  const visible = value.slice(-2);
  return `${"*".repeat(Math.max(0, value.length - 2))}${visible}`;
}

function getSystemSecurityKeys() {
  return {
    primary: "KMS-PSU-2026-ACTIVE",
    backup: "KMS-PSU-2026-STANDBY",
  };
}

function verifyEncryptionKey(value) {
  const enteredKey = String(value || "").trim();
  const { primary, backup } = getSystemSecurityKeys();
  return enteredKey === primary || enteredKey === backup;
}

function getDisplaySecurityKey(type) {
  const keys = getSystemSecurityKeys();
  const value = keys[type];
  return securityKeyVisibility[type] ? value : maskSensitiveValue(value);
}

function setActiveUserForRole(role, userId) {
  const normalizedRole = normalizeRole(role);
  const target = systemUsers.find(
    (user) => user.id === Number(userId) && user.role === normalizedRole,
  );
  if (target) {
    ACTIVE_ROLE_USER_IDS[normalizedRole] = target.id;
  }
}

function getReviewerUsers() {
  return systemUsers.filter(
    (user) => normalizeRole(user.role) === "reviewer" && user.status === "Active",
  );
}

function getAssignedReviewerId(submission) {
  return submission.assignedReviewerId || submission.assignedEvaluatorId || null;
}

function shouldDefaultToPending(submission) {
  if (!submission) return false;
  if (getAssignedReviewerId(submission)) return false;
  return !["Draft", "Archived", "Cancelled", "Approved", "Rejected"].includes(
    submission.status,
  );
}

function normalizeUnassignedSubmissionStatus(submission) {
  if (!shouldDefaultToPending(submission)) return;
  submission.status = "Pending";
}

function canLeavePendingStatus(submission) {
  if (!submission) return false;
  if (submission.status !== "Pending") return true;
  return Boolean(getAssignedReviewerId(submission));
}

function getAssignedReviewer(submission) {
  const assignedId = getAssignedReviewerId(submission);
  return systemUsers.find((user) => user.id === assignedId) || null;
}

function getAssignedReviewerName(submission) {
  return getAssignedReviewer(submission)?.name || "Unassigned";
}

function isSubmissionArchived(submission) {
  return submission?.status === "Archived";
}

function reviewerCanAccessSubmissionType(submission, role = currentRole) {
  const user = getCurrentUser(role);
  return (
    !user.allowedCaseTypes || user.allowedCaseTypes.includes(submission.type)
  );
}

function canTakeSubmission(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole !== "reviewer" || !submission) return false;
  if (isSubmissionArchived(submission)) return false;
  if (getAssignedReviewerId(submission)) return false;
  if (submission.status !== "Pending") return false;
  return reviewerCanAccessSubmissionType(submission, role);
}

function isSubmissionReadOnly(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (!submission) return true;
  if (isSubmissionArchived(submission)) return true;
  if (normalizedRole === "reviewer") {
    return !isAssignedReviewerSubmission(submission, role);
  }
  return normalizedRole !== "superadmin" && normalizedRole !== "admin";
}

function getCurrentRoleNotifications(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  const activeUser = getCurrentUser(role);
  return (mockNotifications[normalizedRole] || []).filter(
    (notification) =>
      !notification.userId || !activeUser || notification.userId === activeUser.id,
  );
}

function pushReviewerNotification(userId, title, body) {
  mockNotifications.reviewer.unshift({
    id: Date.now(),
    userId,
    icon: "fa-user-check",
    color: "#3b82f6",
    title,
    body,
    time: "Just now",
    read: false,
  });
}

function pushRoleNotification(role, notification) {
  const normalizedRole = normalizeRole(role);
  if (!mockNotifications[normalizedRole]) mockNotifications[normalizedRole] = [];
  mockNotifications[normalizedRole].unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    time: "Just now",
    read: false,
    ...notification,
  });
  if (normalizeRole(currentRole) === normalizedRole) {
    renderNotifications();
  }
}

function updateNotificationByRequestId(requestId, updates) {
  Object.values(mockNotifications).forEach((notifications) => {
    notifications.forEach((notification) => {
      if (notification.requestId === requestId) {
        Object.assign(notification, updates);
      }
    });
  });
}

function getRoleMeta(role = currentRole) {
  return ROLE_META[normalizeRole(role)] || ROLE_META.applicant;
}

function getCurrentUser(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  const activeUserId = ACTIVE_ROLE_USER_IDS[normalizedRole];
  return (
    systemUsers.find(
      (user) => user.role === normalizedRole && user.id === activeUserId,
    ) ||
    systemUsers.find((user) => user.role === normalizedRole) ||
    systemUsers[0]
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
  return getAssignedReviewerId(submission) === user.id;
}

function getVisibleSubmissions(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin" || normalizedRole === "admin") {
    return submissions.filter(
      (submission) =>
        submission.status !== "Draft" && !getAssignedReviewerId(submission),
    );
  }
  if (normalizedRole === "reviewer") {
    return submissions.filter((submission) => {
      if (submission.status === "Draft") return false;
      const isUnassigned = !getAssignedReviewerId(submission);
      const isMine = isAssignedReviewerSubmission(submission, role);
      const canAccessType = reviewerCanAccessSubmissionType(submission, role);
      return (isUnassigned || isMine) && canAccessType;
    });
  }
  return submissions.filter((submission) => isOwnSubmission(submission, role));
}

function canEditSubmission(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (isSubmissionArchived(submission)) return false;

  // Specialists can only edit if assigned
  if (normalizedRole === "reviewer") {
    return isAssignedReviewerSubmission(submission, role);
  }

  // Admins and Superadmins can no longer edit/update status, they only view and archive.
  return false;
}

function canAdvanceSubmission(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  // Only the assigned specialist can advance/update status.
  if (normalizedRole === "reviewer") {
    return isAssignedReviewerSubmission(submission, role);
  }
  return false;
}

function canArchiveSubmission(submission = null, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (!(normalizedRole === "superadmin" || normalizedRole === "admin"))
    return false;
  if (submission && isSubmissionArchived(submission)) return false;
  return true;
}

function canUnarchiveSubmission(submission = null, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return (
    (normalizedRole === "superadmin" || normalizedRole === "admin") &&
    Boolean(submission) &&
    isSubmissionArchived(submission)
  );
}

function getSubmissionRestoreStatus(submission) {
  const previousStatus = String(submission?.archivedFromStatus || "").trim();
  if (previousStatus && previousStatus !== "Archived") return previousStatus;
  return getAssignedReviewerId(submission) ? "Under Review" : "Pending";
}

function canUploadDocuments(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "applicant") return isOwnSubmission(submission, role);
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
  if (normalizedRole === "superadmin" || normalizedRole === "admin") return ["reviewer"];
  return [];
}

function getCreatableRoleOptions(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin" || normalizedRole === "admin") {
    return ["reviewer"];
  }
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
        "Applicants face a knowledge gap across Patent, Copyright, Utility Model, and Industrial Design requirements.",
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
        "A conditional payment layer opens only after evaluator review, so applicants upload Proof of Payment only when it is specifically requested.",
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
        "Guided checklists classify the exact documents and legal artifacts needed for each service before intake begins.",
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
        "Proof of Payment is requested only when the evaluator determines it is needed for the next processing step.",
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
      title: "Choose the right service",
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
    "Identify and categorize the registry-mandated requirements and legal checklists for Patent, Copyright, Utility Model, and Industrial Design filings.",
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
    "Centralized access to services, forms, records, and filing procedures through a web-based platform.",
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
    Validated: "badge-approved",
    "Payment Requested": "badge-pending",
    Rejected: "badge-rejected",
    Cancelled: "badge-rejected",
    "Awaiting Documents": "badge-review",
    Draft: "badge-review",
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

function renderBackNav(customTarget = null, customLabel = null) {
  const role = normalizeRole(currentRole);
  const defaultTarget = (role === "superadmin" || role === "admin") ? "admin-dashboard" : "user-dashboard";
  const defaultLabel = (role === "superadmin" || role === "admin") ? "Dashboard" : "Home";
  
  const target = customTarget || defaultTarget;
  const label = customLabel || defaultLabel;
  
  return `
    <div class="back-nav-wrap">
      <div class="back-nav-link" onclick="navigateTo('${target}')">
        <i class="fa-solid fa-arrow-left"></i> Back to ${label}
      </div>
    </div>
  `;
}

function navigateTo(page, isBack = false, params = null) {
  // Ensure mobile menu closes on every navigation
  document.getElementById("navLinks")?.classList.remove("open");

  if (params) currentParams = params;
  else if (!isBack) currentParams = {};

  const landingSections = {
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
  
  const dashLayout = document.getElementById("dashboard-layout");
  const dashTopbar = document.getElementById("dashboard-topbar");
  const publicNav = document.getElementById("public-nav");

  if (dashLayout) {
    dashLayout.classList.remove("active");
    dashLayout.style.display = ""; // Reset inline override
  }
  if (dashTopbar) {
    dashTopbar.classList.remove("active");
    dashTopbar.style.display = ""; // Reset inline override
  }
  if (publicNav) publicNav.classList.remove("active");


  const dashboardPages = [
    "user-dashboard",
    "admin-dashboard",
    "admin-submissions",
    "reviewer-my-cases",
    "messages",
    "patent-form",
   
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
    "ip-guidelines",
    "project-blueprint",
    "admin-announcements",
    "filing-hub",
    "notifications",
    "forms-dash",
    "contact-dash",
  ];

  if (page === "notifications") {
    toggleNotifications();
    return;
  }

  if (page === "landing") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-landing").classList.add("active");
    initFeaturedMarketplace();
    renderLandingAnnouncements();
    initLandingProposalSections();
    animateStats();
  } else if (page === "faq") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-faq").classList.add("active");
    document.getElementById("faqPublicContent").innerHTML = renderFaq();
  } else if (page === "guidelines") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-guidelines").classList.add("active");
    document.getElementById("guidelinesPublicContent").innerHTML = renderIpGuidelines(currentParams.serviceId);
  } else if (page === "marketplace") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-marketplace").classList.add("active");
    document.getElementById("marketplacePublicContent").innerHTML = renderMarketplace();
  } else if (page === "contact") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-contact").classList.add("active");
    document.getElementById("contactPublicContent").innerHTML = renderContactUs();
  } else if (page === "forms") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-forms").classList.add("active");
    document.getElementById("formsPublicContent").innerHTML = renderFormsPublicContent();
  } else if (page === "terms") {
    document.getElementById("public-nav").classList.add("active");
    document.getElementById("page-terms").classList.add("active");
    document.getElementById("termsPublicContent").innerHTML = renderTermsAndConditions();
  } else if (page === "login") {
    if (publicNav) publicNav.classList.add("active");
    document.getElementById("page-login").classList.add("active");
  } else if (page === "signup") {
    if (publicNav) publicNav.classList.add("active");
    initSignupWizard();
    document.getElementById("page-signup").classList.add("active");
  } else if (page === "forgot-password") {
    if (publicNav) publicNav.classList.add("active");
    document.getElementById("page-forgot-password").classList.add("active");
  } else if (page === "reset-password") {
    if (publicNav) publicNav.classList.add("active");
    document.getElementById("page-reset-password").classList.add("active");
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
    updateActiveNavLinks(page);
    // NEW: Sync the Shopee-style bottom nav active state
    if (typeof updateBottomNavItemActive === 'function') updateBottomNavItemActive(page);
  }

  setSystemAlertVisible(
    page === "landing" ||
      (dashboardPages.includes(page) && normalizeRole(currentRole) === "applicant"),
  );

  window.scrollTo(0, 0);

  // Update UI Back Buttons
  const pubBack = document.getElementById("ui-back-btn-public");
  const dashBack = document.getElementById("ui-back-btn-dashboard");
  const topbarRight = document.querySelector(".topbar-right");
  const NO_BACK_PAGES = ["landing", "forms", "marketplace", "faq", "guidelines", "contact", "about", "news"];
  const showBack = navHistory.length > 0 && !NO_BACK_PAGES.includes(page);
  const userRole = normalizeRole(currentRole);
  
  if (pubBack) pubBack.style.display = showBack ? "block" : "none";
  
  // Dashboard elements for Applicants
  const IS_APPLICANT = userRole === 'applicant';

  if (dashBack) {
    dashBack.style.display = "none";
  }

  if (topbarRight) {
    topbarRight.style.display = "flex";
  }

  // Ensure dashboard visibility
  if (isLoggedIn && page !== "landing") {
    const dashLayout = document.getElementById("dashboard-layout");
    const dashTopbar = document.getElementById("dashboard-topbar");
    if (dashLayout) {
      dashLayout.classList.add("active");
      dashLayout.style.display = "flex";
    }
    if (dashTopbar) {
      dashTopbar.classList.add("active");
      dashTopbar.style.display = "flex";
    }
  }
  if (page === "landing") navHistory = []; // Reset history

  // Sync active states for both sidebar and topnav
  updateActiveNavLinks(page);
}

function setSystemAlertVisible(isVisible) {
  const alert = renderTopAlertBanner();
  const shouldShow =
    Boolean(isVisible && alert && dismissedTopAlertId !== alert.id);
  document.body.classList.toggle("show-system-alert", shouldShow);
}

function dismissTopAlert() {
  const alert = getLatestAlertAnnouncement();
  dismissedTopAlertId = alert?.id || null;
  setSystemAlertVisible(false);
}

function getLatestAlertAnnouncement() {
  return announcements
    .filter((item) => item.category === "Alert")
    .slice()
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return dateDiff || b.id - a.id;
    })[0] || null;
}

function renderTopAlertBanner() {
  const alert = getLatestAlertAnnouncement();
  const messageEl = document.getElementById("topAlertMessage");
  if (!alert) {
    if (messageEl) messageEl.textContent = "";
    return null;
  }

  if (messageEl) {
    messageEl.textContent = `${alert.title}: ${alert.content}`;
  }
  return alert;
}

function refreshSystemAlertForCurrentPage() {
  setSystemAlertVisible(
    currentPage === "landing" ||
      (isLoggedIn && normalizeRole(currentRole) === "applicant"),
  );
}

window.showTopAlertAnnouncement = function() {
  const alert = getLatestAlertAnnouncement();
  if (alert) showAnnouncementModal(alert.id);
};

function updateBottomNavItemActive(page) {
  const items = document.querySelectorAll(".bottom-nav-item");
  items.forEach((item) => {
    const onc = item.getAttribute("onclick");
    if (onc && onc.includes(`'${page}'`)) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function initFeaturedMarketplace() {
  const grid = document.getElementById("featuredInnovationGrid");
  if (grid) {
    filterLandingMarketplace();
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
    if (item.archived) return false;
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

function renderNotificationActions(notification) {
  if (notification.type !== "marketplace-approval" || !notification.requestId) {
    return "";
  }

  const request = marketplaceApprovalRequests.find(
    (item) => item.id === notification.requestId,
  );
  if (!request) return "";
  if (request.status === "accepted") {
    return `<div class="notif-actions"><span class="badge badge-approved"><i class="fa-solid fa-check"></i> Accepted</span></div>`;
  }
  if (request.status === "declined") {
    return `<div class="notif-actions"><span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i> Declined</span></div>`;
  }

  return `
    <div class="notif-actions">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); acceptMarketplaceApproval('${request.id}')"><i class="fa-solid fa-check"></i> Accept</button>
      <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); declineMarketplaceApproval('${request.id}')"><i class="fa-solid fa-xmark"></i> Decline</button>
    </div>`;
}

function closeNotificationDropdown() {
  notifOpen = false;
  document.getElementById("notifDropdown")?.classList.remove("open");
  document.getElementById("notifBell")?.classList.remove("active");
}

function findNotificationById(notificationId, role = currentRole) {
  return getCurrentRoleNotifications(role).find(
    (notification) => String(notification.id) === String(notificationId),
  );
}

function getNotificationSubmissionId(notification) {
  if (!notification) return "";
  const directId = notification.submissionId || notification.recordId || "";
  if (directId) return directId;
  if (notification.caseId && !isChatNotification(notification)) return notification.caseId;
  const combined = `${notification.title || ""} ${notification.body || ""}`;
  return combined.match(/PSU-[A-Z]+-\d{4}-\d{3}/)?.[0] || "";
}

function isChatNotification(notification) {
  return (
    notification?.type === "case-message" ||
    notification?.icon === "fa-comment-dots" ||
    String(notification?.title || "").toLowerCase().includes("new message")
  );
}

function markNotificationRead(notification) {
  if (!notification) return;
  notification.read = true;
  renderNotifications();
}

function openSubmissionFromNotification(submissionId, notification = null) {
  const submission = submissions.find((item) => item.id === submissionId);
  if (!submission || !getVisibleSubmissions(currentRole).some((item) => item.id === submissionId)) {
    showNotificationDetail(notification, {
      note: submissionId
        ? `Reference ${submissionId} is not available in your current submissions list.`
        : "",
    });
    return;
  }

  selectedSubmissionId = submission.id;
  navigateTo("submission-detail");
}

function showNotificationDetail(notification, options = {}) {
  if (!notification) return;
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalOverlay = document.getElementById("modalOverlay");
  const submissionId = getNotificationSubmissionId(notification);
  modalTitle.textContent = "Notification Details";
  modalTitle.style.display = "block";
  modalBody.innerHTML = `
    <div class="notification-detail-modal">
      <div class="notification-detail-icon" style="background:${notification.color}15; color:${notification.color}">
        <i class="fa-solid ${notification.icon}"></i>
      </div>
      <div class="notification-detail-content">
        <h2>${escapeHtml(notification.title)}</h2>
        <p>${escapeHtml(notification.body)}</p>
        <div class="notification-detail-time">${escapeHtml(notification.time || "Just now")}</div>
        ${submissionId ? `<div class="notification-detail-ref"><strong>Reference:</strong> ${escapeHtml(submissionId)}</div>` : ""}
        ${options.note ? `<div class="notification-detail-note"><i class="fa-solid fa-circle-info"></i> ${escapeHtml(options.note)}</div>` : ""}
      </div>
      <div class="detail-actions" style="justify-content:flex-end; margin-top:22px;">
        <button class="btn btn-outline-navy" onclick="closeModal()">Close</button>
        ${
          submissionId && getVisibleSubmissions(currentRole).some((item) => item.id === submissionId)
            ? `<button class="btn btn-primary" onclick="closeModal(); openSubmissionFromNotification('${submissionId}')"><i class="fa-solid fa-arrow-right"></i> Open Submission</button>`
            : ""
        }
      </div>
    </div>
  `;
  modalOverlay.classList.add("active");
}

function showMarketplaceApprovalNotice(requestId) {
  const request = marketplaceApprovalRequests.find((item) => item.id === requestId);
  if (!request) {
    showToast("Marketplace approval request not found.");
    return;
  }

  const match = findCertifiedRecord(request.recordId);
  const record = match?.record || null;
  const listing = request.listingId
    ? marketplaceItems.find((item) => item.id === request.listingId)
    : null;
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalOverlay = document.getElementById("modalOverlay");
  const statusBadgeHtml =
    request.status === "accepted"
      ? '<span class="badge badge-approved"><i class="fa-solid fa-check"></i> Accepted</span>'
      : request.status === "declined"
        ? '<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i> Declined</span>'
        : '<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending Approval</span>';

  modalTitle.textContent = "Marketplace Approval Request";
  modalTitle.style.display = "block";
  modalBody.innerHTML = `
    <div class="notification-detail-modal marketplace-request-modal">
      <div class="notification-detail-icon" style="background:#f9731615; color:#f97316">
        <i class="fa-solid fa-store"></i>
      </div>
      <div class="notification-detail-content">
        <div style="margin-bottom:10px;">${statusBadgeHtml}</div>
        <h2>${escapeHtml(record?.title || request.recordId)}</h2>
        <p>Admin requests your approval to publish this certified IP record in the public marketplace.</p>
        <div class="notification-detail-ref"><strong>Reference:</strong> ${escapeHtml(request.recordId)}</div>
        ${
          record
            ? `<div class="notification-detail-record">
                <div><strong>Type</strong><span>${escapeHtml(record.type)}</span></div>
                <div><strong>Owner</strong><span>${escapeHtml(record.applicant)}</span></div>
                <div><strong>Department</strong><span>${escapeHtml(record.department)}</span></div>
              </div>`
            : ""
        }
      </div>
      <div class="detail-actions" style="justify-content:flex-end; margin-top:22px;">
        <button class="btn btn-outline-navy" onclick="closeModal()">Close</button>
        ${
          request.status === "pending"
            ? `<button class="btn btn-secondary" onclick="declineMarketplaceApproval('${request.id}'); showMarketplaceApprovalNotice('${request.id}')"><i class="fa-solid fa-xmark"></i> Decline</button>
               <button class="btn btn-primary" onclick="acceptMarketplaceApproval('${request.id}'); showMarketplaceApprovalNotice('${request.id}')"><i class="fa-solid fa-check"></i> Accept</button>`
            : listing
              ? `<button class="btn btn-primary" onclick="closeModal(); showInnovationDetail(${listing.id})"><i class="fa-solid fa-store"></i> View Listing</button>`
              : ""
        }
      </div>
    </div>
  `;
  modalOverlay.classList.add("active");
}

window.openNotificationContent = function(notificationId) {
  const notification = findNotificationById(notificationId);
  if (!notification) return;
  markNotificationRead(notification);
  closeNotificationDropdown();

  if (notification.type === "marketplace-approval" && notification.requestId) {
    showMarketplaceApprovalNotice(notification.requestId);
    return;
  }

  if (notification.announcementId) {
    showAnnouncementModal(notification.announcementId);
    return;
  }

  if (notification.caseId && isChatNotification(notification)) {
    openCaseChat(notification.caseId);
    return;
  }

  const submissionId = getNotificationSubmissionId(notification);
  if (submissionId) {
    openSubmissionFromNotification(submissionId, notification);
    return;
  }

  showNotificationDetail(notification);
};

function renderNotifications() {
  const list = document.getElementById("notifList");
  if (!list) return;

  const roleNotifs = getCurrentRoleNotifications();
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  const badge = document.getElementById("notifBadge");
  if (badge) {
    badge.innerText = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }

  if (roleNotifs.length === 0) {
    list.innerHTML =
      '<div style="padding:40px 20px;text-align:center;color:var(--gray-400);font-size:.85rem;"><i class="fa-solid fa-bell-slash" style="display:block;font-size:1.5rem;margin-bottom:12px;opacity:.3;"></i>No notifications yet</div>';
    return;
  }

  list.innerHTML = roleNotifs
    .map(
      (n) => {
        const actions = renderNotificationActions(n);
        return `
    <div class="notif-item ${n.read ? "" : "unread"}" onclick="event.stopPropagation(); openNotificationContent('${n.id}')" role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); openNotificationContent('${n.id}'); }">
      <div class="notif-icon" style="background:${n.color}15; color:${n.color}">
        <i class="fa-solid ${n.icon}"></i>
      </div>
      <div class="notif-info">
        <div class="notif-title">${escapeHtml(n.title)}</div>
        <div class="notif-body">${escapeHtml(n.body)}</div>
        <div class="notif-time">${escapeHtml(n.time)}</div>
        ${actions}
      </div>
    </div>
  `;
      },
    )
    .join("");
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
  const type = landingMpType;
  const college =
    document.getElementById("landingFilterCollege")?.value || "All";
  const search =
    document.getElementById("landingSearch")?.value.toLowerCase() || "";

  let filtered = marketplaceItems.filter((item) => {
    if (item.archived) return false;
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

  const grid =
    document.getElementById("landingInnovationGrid") ||
    document.getElementById("featuredInnovationGrid");
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

window.initSignupWizard = function() {
  const step2 = document.getElementById('signup-step-2');
  const title = document.getElementById('signup-title');
  const subtitle = document.getElementById('signup-subtitle');
  
  if (step2) step2.style.display = 'block';
  if (title) title.innerText = 'Create Account';
  if (subtitle) subtitle.innerText = "Join The Creator's Bulwark Community";
  
  document.getElementById('signupForm')?.reset();
  document.getElementById('regEmailHint').innerHTML = '';
  document.getElementById('regEmailError').innerText = '';
};

window.selectSignUpRole = function(role) {
  const step1 = document.getElementById('signup-step-1');
  const step2 = document.getElementById('signup-step-2');
  const title = document.getElementById('signup-title');
  const subtitle = document.getElementById('signup-subtitle');
  const regTypeInput = document.getElementById('regType');
  
  if (regTypeInput) regTypeInput.value = role;
  
  // Update Header for Step 2
  const roleNames = {
    'psu_member': 'PSU Community',
    'outsider': 'External User'
  };
  
  if (title) title.innerText = `Sign up as ${roleNames[role]}`;
  if (subtitle) subtitle.innerText = 'Please provide your account details below.';
  
  // Transition
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
  
  updateRegEmailHint();
};

window.goBackToStep1 = function() {
  initSignupWizard();
};

window.updateRegEmailHint = function() {
  const type = document.getElementById('regType').value;
  const emailInput = document.getElementById('regEmail');
  const hintEl = document.getElementById('regEmailHint');
  
  if (type === 'psu_member') {
    emailInput.placeholder = 'your.name@psu.palawan.edu.ph';
    hintEl.innerHTML = '<i class="fa-solid fa-building-columns"></i> PSU Students/Faculty must use their <strong>@psu.palawan.edu.ph</strong> corporate email.';
    hintEl.style.color = 'var(--blue)';
  } else if (type === 'outsider') {
    emailInput.placeholder = 'your.email@example.com';
    hintEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> You can use any valid personal or professional email.';
    hintEl.style.color = 'var(--gray-500)';
  }
};

window.handleSignUp = function(e) {
  if (e) e.preventDefault();
  
  // PROTOTYPE BYPASS: Go directly to dashboard
  isLoggedIn = true;
  currentRole = 'applicant';
  updateTopbarRole();
  
  showToast("Prototype Access: Account created and logged in!");

  if (pendingAction && pendingAction.type === 'registration') {
    const action = pendingAction;
    pendingAction = null;
    startSubmissionFlow(action.typeId, action.method);
  } else {
    navigateTo(getDefaultDashboardPage(currentRole));
  }
};

window.verifySignupOtp = function() {
  const boxes = document.querySelectorAll("#signup-step-3 .otp-box");
  const code = Array.from(boxes).map(b => b.value).join("");
  
  if (code.length < 6) {
    showToast("Please enter the full 6-digit verification code.", "warning");
    return;
  }
  
  // In a real app, we'd verify the 'code' here.
  // For the prototype, any 6-digit code works.
  
  const newUser = {
    id: systemUsers.length + 1,
    name: pendingSignupData.username, // Using username as name for simplicity in this prototype
    username: pendingSignupData.username,
    email: pendingSignupData.email,
    role: 'applicant',
    dept: pendingSignupData.type === 'psu_member' ? 'PSU Community' : 'External',
    status: 'Active',
    dateCreated: new Date().toISOString().split('T')[0]
  };
  
  systemUsers.push(newUser);
  
  // AUTOMATIC LOGIN
  isLoggedIn = true;
  currentRole = 'applicant'; // Standard applicant role
  updateTopbarRole();
  
  showToast(`Account verified! Welcome, ${pendingSignupData.username}. Logging you in...`);
  
  // Reset and navigate to Dashboard
  pendingSignupData = null;
  
  if (pendingAction && pendingAction.type === 'registration') {
    const action = pendingAction;
    pendingAction = null;
    startSubmissionFlow(action.typeId, action.method);
  } else {
    navigateTo(getDefaultDashboardPage(currentRole));
  }
};

window.signupOtpAutoFocus = function(el) {
  if (el.value.length === 1 && el.nextElementSibling) {
    el.nextElementSibling.focus();
  }
};

window.signupOtpBackspace = function(e, el) {
  if (e.key === "Backspace" && el.value === "" && el.previousElementSibling) {
    el.previousElementSibling.focus();
  }
};

window.resendSignupOtp = function() {
  showToast("A new verification code has been sent to your email.");
};

function handleLogin(e) {
  if (e) e.preventDefault();
  
  // PROTOTYPE BYPASS: Go directly to applicant dashboard
  isLoggedIn = true;
  currentRole = 'applicant';
  updateTopbarRole();
  
  showToast("Prototype Access: Logged in as APPLICANT");

  if (pendingAction && pendingAction.type === 'registration') {
    const action = pendingAction;
    pendingAction = null;
    startSubmissionFlow(action.typeId, action.method);
  } else {
    navigateTo(getDefaultDashboardPage(currentRole));
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
  
  showToast("MFA verified — Successfully logged in!");

  if (pendingAction && pendingAction.type === 'registration') {
    const action = pendingAction;
    pendingAction = null;
    startSubmissionFlow(action.typeId, action.method);
  } else {
    navigateTo(getDefaultDashboardPage(currentRole));
  }
};

function logout() {
  isLoggedIn = false;
  currentRole = "applicant";
  selectedLoginRole = "client";
  navigateTo("landing");
  showToast("Logged out successfully");
}

function handleMarketplaceAccess() {
  if (isLoggedIn) {
    navigateTo('marketplace-dash');
  } else {
    showToast("Please login or sign up first to access the full marketplace.", "warning");
    navigateTo('login');
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = msg;
    el.style.display = 'block';
  }
}

// ====== PASSWORD RECOVERY LOGIC ======

window.handleForgotPasswordSubmit = function(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('forgotEmail').value;
  const container = document.getElementById('forgotPasswordFormContainer');
  
  // Security First: Generic success message
  container.innerHTML = `
    <div style="text-align:center; padding: 24px 0;">
      <div style="width:64px; height:64px; background:rgba(34,197,94,0.1); color:#22c55e; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
        <i class="fa-solid fa-circle-check" style="font-size:1.8rem;"></i>
      </div>
      <h3 style="color:var(--navy); margin-bottom:12px;">Link Sent!</h3>
      <p style="color:var(--gray-600); font-size:0.9rem; line-height:1.6;">
        If an account with <strong>${email}</strong> exists, we’ve sent a password reset link to that address.
      </p>
      <p style="color:var(--gray-500); font-size:0.8rem; margin-top:16px;">
        Please check your inbox (and spam folder) for further instructions.
      </p>
    </div>
  `;
  
  showToast("Recovery link processed.");
  
  // Trigger Mock Email after 2 seconds
  setTimeout(showMockEmail, 2000);
};

window.showMockEmail = function() {
  const mockEmail = document.getElementById('mock-email-notification');
  if (mockEmail) {
    mockEmail.style.display = 'flex';
    mockEmail.classList.add('slide-in');
    // Auto hide after 10 seconds
    setTimeout(hideMockEmail, 10000);
  }
};

window.hideMockEmail = function() {
  const mockEmail = document.getElementById('mock-email-notification');
  if (mockEmail) {
    mockEmail.classList.remove('slide-in');
    mockEmail.classList.add('slide-out');
    setTimeout(() => {
      mockEmail.style.display = 'none';
      mockEmail.classList.remove('slide-out');
    }, 500);
  }
};

window.openMockEmail = function() {
  document.getElementById('emailModalOverlay').classList.add('active');
  hideMockEmail();
};

window.closeEmailModal = function() {
  document.getElementById('emailModalOverlay').classList.remove('active');
};

window.handleResetPasswordSubmit = function(e) {
  if (e) e.preventDefault();
  
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  
  if (newPass !== confirmPass) {
    showError('confirmPasswordError', 'Passwords do not match.');
    return;
  }
  
  // Show final success modal
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const overlay = document.getElementById("modalOverlay");
  
  modalTitle.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#22c55e; margin-right:10px;"></i> Success';
  modalBody.innerHTML = `
    <div style="text-align:center; padding: 20px 0;">
      <h3 style="color:var(--navy); margin-bottom:12px;">Password Reset Successfully</h3>
      <p style="color:var(--gray-600); font-size:0.9rem; line-height:1.6; margin-bottom:24px;">
        Your password has been updated. You can now use your new password to sign in to your account.
      </p>
      <button class="btn btn-primary btn-block" onclick="closeModal(); navigateTo('login')" style="width:100%;">
        Go to Login
      </button>
    </div>
  `;
  
  overlay.classList.add("active");
  showToast("Password successfully reset!");
};

window.checkPasswordStrength = function() {
  const pass = document.getElementById('newPassword').value;
  const bar = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');
  
  if (!pass) {
    bar.style.width = '0%';
    label.innerText = 'Weak';
    return;
  }
  
  let strength = 0;
  if (pass.length >= 8) strength += 25;
  if (/[A-Z]/.test(pass)) strength += 25;
  if (/[0-9]/.test(pass)) strength += 25;
  if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
  
  bar.style.width = strength + '%';
  if (strength <= 25) {
    bar.style.background = '#ef4444';
    label.innerText = 'Weak';
  } else if (strength <= 50) {
    bar.style.background = '#f59e0b';
    label.innerText = 'Fair';
  } else if (strength <= 75) {
    bar.style.background = '#3b82f6';
    label.innerText = 'Good';
  } else {
    bar.style.background = '#22c55e';
    label.innerText = 'Strong';
  }
  
  checkPasswordMatch();
};

window.checkPasswordMatch = function() {
  const pass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const btn = document.getElementById('resetBtn');
  const error = document.getElementById('confirmPasswordError');
  
  if (confirm && pass !== confirm) {
    error.innerText = 'Passwords do not match.';
    error.style.display = 'block';
    btn.disabled = true;
  } else {
    error.innerText = '';
    error.style.display = 'none';
    btn.disabled = pass.length < 8;
  }
};

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
  const roles = ["applicant", "reviewer", "superadmin"];
  const currentNorm = normalizeRole(currentRole);
  let idx = roles.indexOf(currentNorm);
  const nextRole = roles[(idx + 1) % roles.length];
  switchRole(nextRole);
}

function updateTopbarRole() {
  const pubSelect = document.getElementById("publicRoleSelect");
  const topSelect = document.getElementById("topbarRoleSelect");
  const normRole = normalizeRole(currentRole);

  let uiRole = normRole;
  if (normRole === "reviewer") uiRole = "evaluator";

  if (pubSelect) pubSelect.value = uiRole;
  if (topSelect) topSelect.value = uiRole;

  const user = getCurrentUser();
  const userName = user?.name || "User";
  const userRole = getRoleMeta(currentRole).label;

  const els = {
    topbarUserName: userName,
    sidebarUserName: userName,
    sidebarUserRole: userRole,
    dropdownFullUserName: userName,
  };

  for (const [id, val] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  const roleLabel = document.querySelector(".user-role-label");
  if (roleLabel) {
    roleLabel.textContent = userRole + " Portal";
  }
  updateBodyRoleClass(normRole);
  updateProfileDropdownRoleVisibility();

  // Hide topbar branding for Admin/Evaluator (they have sidebar brand)
  const isAdminOrEvaluator = normRole === "superadmin" || normRole === "reviewer";
  const topbarBrand = document.querySelector(".topbar-brand");
  if (topbarBrand) {
    topbarBrand.style.display = isAdminOrEvaluator ? "none" : "flex";
  }
  renderNotifications();
}

function updateBodyRoleClass(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  document.body.classList.remove(
    "role-applicant",
    "role-reviewer",
    "role-superadmin",
    "role-admin",
  );
  document.body.classList.add(`role-${normalizedRole}`);
}

function updateProfileDropdownRoleVisibility() {
  const isApplicant = normalizeRole(currentRole) === "applicant";
  document.querySelectorAll("[data-applicant-only='true']").forEach((item) => {
    item.style.display = isApplicant ? "" : "none";
  });
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
      { page: "messages", icon: "fa-comments", text: "Chat Monitor" },
      { page: "admin-records", icon: "fa-folder-open", text: "IP Records" },
      { page: "admin-marketplace", icon: "fa-store", text: "Market Listing" },
      { page: "admin-users", icon: "fa-users", text: "User Manager" },
      { page: "audit-log", icon: "fa-clipboard-list", text: "Audit Log" },
      { page: "admin-settings", icon: "fa-gear", text: "System Config" },
      { page: "admin-announcements", icon: "fa-bullhorn", text: "Announcements" },
    ],

    reviewer: [
      { page: "admin-dashboard", icon: "fa-microscope", text: "Dashboard" },
      { page: "admin-submissions", icon: "fa-inbox", text: "Cases" },
      { page: "reviewer-my-cases", icon: "fa-briefcase", text: "My Cases" },
      { page: "messages", icon: "fa-comments", text: "Messages" },
    ],
    applicant: [
      { page: "user-dashboard", icon: "fa-house", text: "Home" },
      { page: "user-submissions", icon: "fa-file-lines", text: "My Cases" },
      { page: "messages", icon: "fa-comments", text: "Messages" },
      { page: "forms-dash", icon: "fa-folder-open", text: "Forms" },
      { page: "marketplace-dash", icon: "fa-shop", text: "Marketplace" },
      { page: "notifications", icon: "fa-bell", text: "Notification" },
    ],
  };

  const isApplicant = normalizeRole(currentRole) === "applicant";
  const menu = menuMap[normalizeRole(currentRole)] || menuMap.applicant;
  const sidebar = document.getElementById("sidebar");

  const topNav = document.getElementById("dashboard-top-nav");

  if (isApplicant) {
    document.body.classList.add("top-nav-layout");
    
    // Clear the sidebar navigation
    nav.innerHTML = "";

    // Separate primary, main, and footer items for horizontal nav
    const footerPages = ['notifications', 'user-profile', 'logout'];
    const mainItems = menu.filter(i => !footerPages.includes(i.page));

    if (topNav) {
      topNav.innerHTML = `
        ${mainItems.map((m) => {
          const badge = m.page === "messages" ? renderChatNavBadge() : "";
          return `
          <a href="#" onclick="navigateTo('${m.page}')" data-page="${m.page}" class="top-nav-link">${m.text === "Dashboard" ? "Home" : m.text}${badge}</a>
        `;
        }).join('')}
      `;
    }
  } else {
    // Normal Sidebar Nav for Admin/Reviewer
    document.body.classList.remove("top-nav-layout");
    if (topNav) topNav.innerHTML = "";
    nav.innerHTML = menu
      .map(
        (m) => {
          const badge = m.page === "messages" ? renderChatNavBadge() : "";
          return `
      <a href="#" onclick="navigateTo('${m.page}')" data-page="${m.page}">
        <i class="fa-solid ${m.icon}"></i>
        <span class="nav-text">${m.text}${badge}</span>
      </a>
    `;
        },
      )
      .join("");
  }

  const mainContent = document.getElementById("main-content");
  const topbar = document.getElementById("dashboard-topbar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const bottomNav = document.querySelector(".bottom-nav");

  if (isApplicant) {
    if (sidebar) sidebar.style.display = "none";
    if (mainContent) mainContent.style.marginLeft = "0";
    if (topbar) {
      topbar.style.left = "0";
      topbar.style.display = "flex";
    }
    if (sidebarToggle) sidebarToggle.style.display = "none";
    if (bottomNav) bottomNav.style.display = "none";
    document.body.classList.add("top-nav-layout");
    document.body.classList.remove("compact-layout");
  } else {
    // Normal Sidebar handling for Reviewer/Admin
    if (sidebar) {
      sidebar.style.display = "flex";
      sidebar.classList.remove("canva-mode");
    }
    if (mainContent) mainContent.style.marginLeft = ""; // Let CSS handle it via .sidebar.collapsed ~ #main-content
    if (topbar) {
      topbar.style.left = sidebarCollapsed ? "var(--sidebar-collapsed-w)" : "var(--sidebar-w, 260px)";
      topbar.style.display = "flex";
    }
    if (sidebarToggle) sidebarToggle.style.display = "block";
    if (bottomNav) bottomNav.style.display = "none";
    document.body.classList.remove("top-nav-layout");
    document.body.classList.remove("compact-layout");
  }
}

const REQUIRED_DOCUMENTS_BY_TYPE = {
  patent: [
    { key: "technical-drawings-diagrams", name: "Technical Drawings / Diagrams", type: "Optional" },
    { key: "abstract", name: "Abstract", type: "Optional" },
    { key: "claims-statement", name: "Claims Statement", type: "Optional" },
  ],
  copyright: [
    { key: "valid-id", name: "Valid ID", type: "Required" },
    { key: "copy-of-work", name: "Copy of the work (soft copy)", type: "Required" },
    { key: "registration-form", name: "Registration Form (BCRR Form 2025-1 / BCRR Form 2025-2)", type: "Required" },
    { key: "affidavit-ownership", name: "Affidavit of Ownership", type: "Required" },
  ],
  utility: [
    { key: "technical-drawings-diagrams", name: "Technical Drawings / Diagrams", type: "Optional" },
    { key: "abstract", name: "Abstract", type: "Optional" },
    { key: "claims-statement", name: "Claims Statement", type: "Optional" },
  ],
  industrial: [
    {
      key: "industrial-drawings",
      name: "Drawings",
      type: "Required",
      description: "Submit either in a single PDF file or as individual JPEG files.",
      details: [
        "Figure 1 - Perspective View",
        "Figure 2 - Front View",
        "Figure 3 - Back View",
        "Figure 4 - Left Side View",
        "Figure 5 - Right Side View",
        "Figure 6 - Top View",
        "Figure 7 - Bottom View",
      ],
      accept: ".pdf,.jpg,.jpeg",
      acceptLabel: "PDF or JPEG",
      multiple: true,
    },
  ],
};

const FORM_GUIDE_STEPS = {
  patent: [
    "Complete the applicant and invention details.",
    "Review the required patent documents before uploading.",
    "Upload one file for each listed requirement.",
    "Submit for evaluator review and track the validation status.",
  ],
  copyright: [
    "Complete the applicant and work details.",
    "Prepare the copyright filing packet.",
    "Upload one file for each listed requirement.",
    "Submit for evaluator review and track the current status.",
  ],
  utility: [
    "Complete the applicant and utility model details.",
    "Prepare the technical requirement set.",
    "Upload one file for each listed requirement.",
    "Submit for evaluator review and track the validation result.",
  ],
  industrial: [
    "Complete the applicant and design details.",
    "Prepare the design requirement set.",
    "Upload one file for each listed requirement.",
    "Submit for evaluator review and follow the guided status updates.",
  ],
};

const APPLICANT_VISIBLE_STATUSES = [
  "Pending",
  "Under Review",
  "Validated",
  "Payment Requested",
];

function getRequiredDocumentsForType(formType = currentFormType) {
  let docs = REQUIRED_DOCUMENTS_BY_TYPE[formType] || REQUIRED_DOCUMENTS_BY_TYPE.patent;
  if (formType === "copyright") {
    // Deep copy to allow modifying objects inside the array safely
    let copyDocs = docs.map(doc => ({ ...doc }));
    const copyOfWorkIndex = copyDocs.findIndex(d => d.key === "copy-of-work");
    if (copyOfWorkIndex !== -1 && typeof getCopyrightCopyWorkRequirementMeta === "function") {
      copyDocs[copyOfWorkIndex] = {
        ...copyDocs[copyOfWorkIndex],
        ...getCopyrightCopyWorkRequirementMeta(),
      };
    }
    
    // If online method, remove the manual registration form upload requirement
    if (typeof submissionMethod !== 'undefined' && submissionMethod === 'online') {
      copyDocs = copyDocs.filter(d => d.key !== "registration-form");
    }

    if (typeof wizardData !== 'undefined' && wizardData) {
      const regFormIndex = copyDocs.findIndex(d => d.key === "registration-form");
      if (wizardData.applicantTypeGroup === "Individual") {
        if (regFormIndex !== -1) copyDocs[regFormIndex].name = "Registration Form (BCRR Form 2025-1)";
        copyDocs.push({ key: "tin-sss-gsis", name: "TIN / SSS / GSIS", type: "Required" });
      } else if (wizardData.applicantTypeGroup === "Institution") {
        if (regFormIndex !== -1) copyDocs[regFormIndex].name = "Registration Form (BCRR Form 2025-2)";
        copyDocs.push({ key: "business-details", name: "Business Details / Company ID", type: "Required" });
      }
    }
    return copyDocs;
  }
  return docs;
}

function getRequiredDocumentCount(formType = currentFormType) {
  return getRequiredDocumentsForType(formType).filter((doc) => doc.type === "Required").length;
}

function ensureRequirementUploads(data = wizardData) {
  if (!data.requirementUploads) {
    data.requirementUploads = {};
  }
  return data.requirementUploads;
}

function getRequirementUploadEntries(formType = currentFormType, data = wizardData) {
  const uploads = ensureRequirementUploads(data);
  return getRequiredDocumentsForType(formType).map((doc) => ({
    doc,
    key: doc.key,
    file: uploads[doc.key] || null,
  }));
}

function syncRequirementUploadsToFiles(formType = currentFormType, data = wizardData) {
  data.files = getRequirementUploadEntries(formType, data)
    .filter((entry) => entry.file)
    .flatMap((entry) => {
      if (Array.isArray(entry.file.files) && entry.file.files.length) {
        return entry.file.files.map((file) => ({
          ...file,
          requirementName: entry.doc.name,
          required: entry.doc.type === "Required",
        }));
      }
      return [
        {
          ...entry.file,
          requirementName: entry.doc.name,
          required: entry.doc.type === "Required",
        },
      ];
    });
}

function getUploadedRequiredCount(formType = currentFormType, data = wizardData) {
  return getRequirementUploadEntries(formType, data).filter(
    (entry) => entry.doc.type === "Required" && entry.file,
  ).length;
}

function getFormTypeKeyFromSubmissionType(type = "") {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();
  const map = {
    patent: "patent",
    
    copyright: "copyright",
    "utility model": "utility",
    utility: "utility",
    "industrial design": "industrial",
    industrial: "industrial",
  };
  return map[normalized] || normalized || currentFormType || "patent";
}

function getPaymentProofFile(data = wizardData) {
  return data.depositFile || data.paymentProofFile || null;
}

function renderConditionalPaymentUploadPanel(
  data = wizardData,
  {
    inputId = "depositInput",
    onChange = "handleDepositUpload(this)",
    infoOnly = false,
  } = {},
) {
  const isCopyrightPaymentContext =
    (data === wizardData && currentFormType === "copyright") ||
    data?.type === "Copyright";
  if (isCopyrightPaymentContext) return "";

  const paymentRequested = data.paymentRequested === true;
  const paymentFile = getPaymentProofFile(data);

  if (!paymentRequested) {
    return `
      <div style="padding:18px 20px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.14); border-radius:14px; display:flex; gap:12px; align-items:flex-start;">
        <i class="fa-solid fa-circle-info" style="color:#2563eb; margin-top:2px;"></i>
        <div>
          <div style="font-size:0.9rem; font-weight:700; color:var(--navy);">Upload Proof of Payment</div>
          <div style="font-size:0.82rem; color:var(--gray-500); line-height:1.6; margin-top:4px;">
            Hidden by default. This upload appears only when an evaluator requests payment after reviewing your application.
          </div>
        </div>
      </div>
    `;
  }

  const statusMarkup = paymentFile
    ? `
      <div style="margin-top:12px; padding:12px 14px; background:rgba(22,163,74,0.06); border:1px solid rgba(22,163,74,0.2); border-radius:10px; display:flex; align-items:center; gap:10px;">
        <i class="fa-solid fa-circle-check" style="color:var(--green);"></i>
        <div style="flex:1;">
          <div style="font-size:0.88rem; font-weight:700; color:var(--navy);">${escapeHtml(paymentFile.name)}</div>
          <div style="font-size:0.76rem; color:var(--gray-400);">Proof uploaded and awaiting evaluator verification.</div>
        </div>
        <span class="badge badge-review" style="font-size:0.66rem;">AWAITING REVIEW</span>
      </div>
    `
    : "";

  if (infoOnly) {
    return `
      <div style="padding:18px 20px; background:rgba(255,127,80,0.05); border:1px solid rgba(255,127,80,0.18); border-radius:14px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <div style="display:flex; gap:12px; align-items:flex-start; flex:1;">
            <i class="fa-solid fa-receipt" style="color:var(--gold-dark); margin-top:2px;"></i>
            <div>
              <div style="font-size:0.9rem; font-weight:700; color:var(--navy);">Payment Requested</div>
              <div style="font-size:0.82rem; color:var(--gray-500); line-height:1.6; margin-top:4px;">
                The evaluator has requested payment for this application. Upload proof of payment to continue the review cycle.
              </div>
            </div>
          </div>
        </div>
        ${statusMarkup}
      </div>
    `;
  }

  return `
    <div style="border:1.5px dashed var(--gold); border-radius:16px; padding:22px; background:rgba(255,127,80,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;">
        <div style="flex:1; min-width:280px;">
          <h4 style="font-size:0.95rem; color:var(--navy); margin:0 0 6px;"><i class="fa-solid fa-receipt" style="color:var(--gold); margin-right:8px;"></i> Upload Proof of Payment</h4>
          <p style="font-size:0.82rem; color:var(--gray-500); margin:0 0 12px; line-height:1.6;">
            Payment was requested by the evaluator. Upload the receipt or proof of payment to move this case forward.
          </p>
        </div>
        <button type="button" class="btn ${paymentFile ? "btn-outline-navy" : "btn-primary"} btn-sm" onclick="document.getElementById('${inputId}').click()">
          <i class="fa-solid fa-${paymentFile ? "arrows-rotate" : "upload"}"></i> ${paymentFile ? "Replace Proof" : "Choose File"}
        </button>
      </div>
      <input type="file" id="${inputId}" style="display:none" accept=".jpg,.jpeg,.png,.pdf" onchange="${onChange}" />
      ${statusMarkup}
    </div>
  `;
}

function renderRequirementChecklistPanel(
  formType = currentFormType,
  { data = wizardData, compact = false } = {},
) {
  const entries = getRequirementUploadEntries(formType, data);
  const containerStyle = compact
    ? "display:flex; flex-direction:column; gap:10px;"
    : "display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;";

  return `
    <div style="${containerStyle}">
      ${entries.map((entry) => {
        const uploaded = Boolean(entry.file);
        const detailList = Array.isArray(entry.doc.details) && entry.doc.details.length
          ? `<ul style="margin:6px 0 0; padding-left:16px; color:var(--gray-500); line-height:1.5;">${entry.doc.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : "";
        return `
          <div style="font-size:${compact ? "0.78rem" : "0.82rem"}; color:var(--gray-600); display:flex; align-items:flex-start; gap:10px; padding:${compact ? "10px 12px" : "10px"}; background:white; border-radius:10px; border:1px solid ${uploaded ? "rgba(34,197,94,0.18)" : "var(--gray-50)"};">
            <i class="fa-solid fa-${uploaded ? "circle-check" : "circle"}" style="color:${uploaded ? "var(--green)" : "var(--gray-300)"}; font-size:0.8rem; margin-top:3px;"></i>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; color:var(--navy); line-height:1.45;">${entry.doc.name}</div>
              ${entry.doc.description ? `<div style="font-size:0.74rem; color:var(--gray-500); margin-top:4px; line-height:1.5;">${escapeHtml(entry.doc.description)}</div>` : ""}
              ${detailList}
              ${entry.file ? `<div style="font-size:0.72rem; color:var(--gray-400); margin-top:4px;">${escapeHtml(entry.file.name)}</div>` : ""}
            </div>
            <span style="font-size:0.65rem; font-weight:800; color:${entry.doc.type === "Required" ? "var(--red)" : "var(--gray-400)"}; text-transform:uppercase; white-space:nowrap;">${entry.doc.type}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDynamicRequirementUploadersLegacy(formType = currentFormType) {
  return `
    <div style="display:grid; gap:14px;">
      ${getRequirementUploadEntries(formType).map((entry) => {
        const inputId = `req-upload-${formType}-${entry.key}`;
        const detailList = Array.isArray(entry.doc.details) && entry.doc.details.length
          ? `<ul style="margin:8px 0 0; padding-left:18px; color:var(--gray-500); line-height:1.55;">${entry.doc.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : "";
        return `
          <div style="border:1.5px solid ${entry.file ? "rgba(34,197,94,0.2)" : "var(--gray-200)"}; background:${entry.file ? "rgba(34,197,94,0.04)" : "white"}; border-radius:16px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap;">
            <div style="flex:1; min-width:240px;">
              <div style="font-size:0.9rem; font-weight:700; color:var(--navy); line-height:1.45;">Upload a file for ${entry.doc.name}</div>
              <div style="font-size:0.78rem; color:var(--gray-500); margin-top:6px;">
                ${entry.file ? `${entry.file.name} • ${(entry.file.size / 1024).toFixed(1)} KB` : "Accepted formats: PDF, DOCX, JPG, PNG"}
              </div>
            </div>
            ${entry.doc.description ? `<div style="flex:1 1 100%; font-size:0.78rem; color:var(--gray-500); line-height:1.55;">${escapeHtml(entry.doc.description)}${entry.doc.acceptLabel ? ` Accepted formats: ${escapeHtml(entry.doc.acceptLabel)}.` : ""}${detailList}</div>` : ""}
            <div style="display:flex; align-items:center; gap:12px;">
              ${
                entry.file
                  ? '<span class="badge badge-approved" style="font-size:0.68rem;">UPLOADED</span>'
                  : `<span class="badge ${entry.doc.type === "Required" ? "badge-pending" : "badge-review"}" style="font-size:0.68rem;">${entry.doc.type.toUpperCase()}</span>`
              }
              <button type="button" class="btn ${entry.file ? "btn-outline-navy" : "btn-primary"} btn-sm" onclick="document.getElementById('${inputId}').click()">
                <i class="fa-solid fa-${entry.file ? "arrows-rotate" : "upload"}"></i> ${entry.file ? "Replace File" : "Choose File"}
              </button>
              <input type="file" id="${inputId}" style="display:none" ${entry.doc.accept ? `accept="${entry.doc.accept}"` : ""} ${entry.doc.multiple ? "multiple" : ""} onchange="handleRequirementUpload('${entry.key}', this, '${formType}')" />
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDynamicRequirementUploaders(formType = currentFormType) {
  return `
    <div style="display:grid; gap:14px;">
      ${getRequirementUploadEntries(formType).map((entry) => {
        const inputId = `req-upload-${formType}-${entry.key}`;
        const detailList = Array.isArray(entry.doc.details) && entry.doc.details.length
          ? `<ul style="margin:8px 0 0; padding-left:18px; color:var(--gray-500); line-height:1.55;">${entry.doc.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : "";
        const acceptedFormats = entry.doc.acceptLabel || "PDF, DOCX, JPG, PNG";
        const fileSummary = entry.file
          ? `${entry.file.fileCount ? `${entry.file.fileCount} files` : entry.file.name} - ${(entry.file.size / 1024).toFixed(1)} KB`
          : `Accepted formats: ${acceptedFormats}`;

        return `
          <div style="border:1.5px solid ${entry.file ? "rgba(34,197,94,0.2)" : "var(--gray-200)"}; background:${entry.file ? "rgba(34,197,94,0.04)" : "white"}; border-radius:16px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap;">
            <div style="flex:1; min-width:240px;">
              <div style="font-size:0.9rem; font-weight:700; color:var(--navy); line-height:1.45;">Upload a file for ${escapeHtml(entry.doc.name)}</div>
              <div style="font-size:0.78rem; color:var(--gray-500); margin-top:6px;">${escapeHtml(fileSummary)}</div>
              ${entry.doc.description ? `<div style="font-size:0.78rem; color:var(--gray-500); margin-top:6px; line-height:1.55;">${escapeHtml(entry.doc.description)}</div>` : ""}
              ${detailList}
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              ${
                entry.file
                  ? '<span class="badge badge-approved" style="font-size:0.68rem;">UPLOADED</span>'
                  : `<span class="badge ${entry.doc.type === "Required" ? "badge-pending" : "badge-review"}" style="font-size:0.68rem;">${entry.doc.type.toUpperCase()}</span>`
              }
              <button type="button" class="btn ${entry.file ? "btn-outline-navy" : "btn-primary"} btn-sm" onclick="document.getElementById('${inputId}').click()">
                <i class="fa-solid fa-${entry.file ? "arrows-rotate" : "upload"}"></i> ${entry.file ? "Replace File" : "Choose File"}
              </button>
              <input type="file" id="${inputId}" style="display:none" ${entry.doc.accept ? `accept="${entry.doc.accept}"` : ""} ${entry.doc.multiple ? "multiple" : ""} onchange="handleRequirementUpload('${entry.key}', this, '${formType}')" />
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderApplicantStatusLegend(activeStatus = "Pending") {
  const activeIndex = APPLICANT_VISIBLE_STATUSES.indexOf(activeStatus);
  const isApproved = activeStatus === "Approved";
  return `
    <div style="display:grid; gap:10px;">
      ${APPLICANT_VISIBLE_STATUSES.map((status, index) => {
        const completed = isApproved || (activeIndex >= 0 && index < activeIndex);
        const current = !isApproved && index === activeIndex;
        return `
          <div style="display:flex; align-items:center; gap:10px; font-size:0.82rem; color:${current ? "var(--navy)" : "var(--gray-600)"};">
            <span style="width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:${completed ? "var(--green)" : current ? "var(--gold)" : "var(--gray-100)"}; color:${completed || current ? "white" : "var(--gray-500)"}; font-size:0.7rem; font-weight:800; flex-shrink:0;">
              ${completed ? '<i class="fa-solid fa-check"></i>' : index + 1}
            </span>
            <span style="font-weight:${current ? "700" : "600"};">${status}</span>
          </div>
        `;
      }).join("")}
      ${
        activeStatus === "Approved"
          ? `<div style="padding-top:6px; font-size:0.76rem; color:var(--green); font-weight:700;">Approved after validation and any requested payment review.</div>`
          : ""
      }
    </div>
  `;
}

function renderFilingHub() {
  const options = [
    { id: 'patent-form', typeKey: 'patent', title: 'Patent', icon: 'fa-lightbulb', desc: 'Inventions and technical solutions that are new and useful.', time: '12-18 mos' },
    { id: 'utility-form', typeKey: 'utility', title: 'Utility Model', icon: 'fa-gears', desc: 'Practical improvements or new technical solutions.', time: '6-10 mos' },
    { id: 'industrial-form', typeKey: 'industrial', title: 'Industrial Design', icon: 'fa-pen-nib', desc: 'The aesthetic and ornamental aspect of a product.', time: '6-10 mos' },
    { id: 'copyright-form', typeKey: 'copyright', title: 'Copyright', icon: 'fa-copyright', desc: 'Original literary, artistic, and creative works.', time: '1-3 mos' }
  ];

  return `
    ${renderBackNav()}
    <div class="page-header">
      <h1>New IP Submission</h1>
      <p>Select the protective lane that best suits your creation to begin the pre-filing process.</p>
    </div>

    <div class="filing-hub-grid">
      ${options.map(opt => `
        <div class="filing-card" onclick="showSubmissionMethodModal('${opt.id}')">
          <div class="filing-card-icon"><i class="fa-solid ${opt.icon}"></i></div>
          <h3 style="color:var(--navy); font-weight:800; margin-bottom:8px;">${opt.title}</h3>
          <p style="color:var(--gray-500); font-size:0.88rem; line-height:1.5; margin-bottom:16px;">${opt.desc}</p>
          

        </div>
      `).join('')}
    </div>

    <div style="margin-top:48px; padding:32px; background:white; border-radius:16px; border:1px solid var(--gray-100); display:flex; gap:24px; align-items:center;">
      <div style="width:64px; height:64px; border-radius:50%; background:var(--gold-light); color:var(--gold-dark); display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">
        <i class="fa-solid fa-circle-question"></i>
      </div>
      <div>
        <h4 style="color:var(--navy); margin-bottom:4px;">Not sure which IP type to choose?</h4>
        <p style="color:var(--gray-500); font-size:0.95rem;">Check our <a href="#" onclick="navigateTo('ip-guidelines')" style="color:var(--gold-dark); font-weight:700; text-decoration:underline;">IP Guidelines</a> or schedule a quick consultation with a PITBI counselor.</p>
      </div>
    </div>
  `;
}

function updateActiveNavLinks(page) {
  // Update normal sidebar links
  document.querySelectorAll(".sidebar-nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });

  // Update top nav links (Applicant Layout)
  document.querySelectorAll(".top-nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });

  // Update canva-style links
  document.querySelectorAll(".canva-nav-item").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });
}
// ===== RENDER DASHBOARD CONTENT =====
function renderDashboardContent(page) {
  const mc = document.getElementById("main-content");
  if (!mc) return;

  // Clear previous content and ensure visibility
  mc.style.display = "block";
  mc.innerHTML = ""; 

  try {
    switch (page) {
      case "user-dashboard":
        mc.innerHTML = renderUserDashboard();
        break;
    case "filing-hub":
      mc.innerHTML = renderFilingHub();
      break;
      case "admin-dashboard":
        mc.innerHTML = renderAdminDashboard();
        setTimeout(() => initCharts(), 1000); // Wait a bit longer for DOM to settle
        break;
    case "admin-submissions":
      mc.innerHTML = renderAdminSubmissionsPage();
      break;
    case "reviewer-my-cases":
      mc.innerHTML = renderReviewerMyCasesPage();
      break;
    case "messages":
      mc.innerHTML = renderMessagesPage();
      break;
    case "admin-search":
      mc.innerHTML = renderAdminSubmissionsPage();
      break;
    case "patent-form":
      currentWizardStep = 1;
      currentFormType = "patent";
      if (submissionMethod !== "upload") {
        submissionMethod = "online";
      }
      mc.innerHTML = renderFormWizard("Patent Application");
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
      mc.innerHTML = renderMarketplace();
      break;
    case "admin-marketplace":
      mc.innerHTML = renderAdminMarketplacePage();
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
    case "ip-guidelines":
      mc.innerHTML = renderIpGuidelines();
      break;
    case "forms-dash":
      mc.innerHTML = renderForms();
      break;
    case "faq-dash":
      mc.innerHTML = renderFaq();
      break;
    case "ip-guidelines":
      mc.innerHTML = renderIpGuidelines();
      break;
    case "project-blueprint":
      mc.innerHTML = renderProjectBlueprint();
      break;
    case "admin-announcements":
      mc.innerHTML = renderAdminAnnouncementsPage();
      break;
    case "contact-dash":
      mc.innerHTML = renderContactUs();
      break;
      default:
        mc.innerHTML = `
          <div class="page-header">
            <h1>Page Not Found</h1>
            <p>The requested page "<strong>${page}</strong>" does not exist or you don't have permission to view it.</p>
          </div>
        `;
    }
  } catch (err) {
    console.error("Dashboard Render Error:", err);
    mc.innerHTML = `
      <div style="padding:40px; text-align:center; background:white; border-radius:24px; border: 2px dashed var(--red-bg);">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--red); margin-bottom:20px;"></i>
        <h2 style="color:var(--navy);">Oops! Component Rendering Failed</h2>
        <p style="color:var(--gray-500); margin:12px 0 24px;">Something went wrong while loading the <strong>${page}</strong> view.</p>
        <button class="btn btn-navy" onclick="location.reload()">Refresh Application</button>
      </div>
    `;
  }
}

// ===== CASE CHAT / MESSAGING =====
// Mock chats/messages collection schema:
// id, case_id, sender_id, receiver_id, sender_role, message_text,
// attachment_url, attachment_type, created_at, is_read
function renderChatNavBadge() {
  const count = getUnreadChatCount();
  return count > 0 ? `<span class="chat-nav-badge">${count}</span>` : "";
}

function getSubmissionApplicantUser(submission) {
  if (!submission) return null;
  return (
    systemUsers.find((user) => user.email && user.email === submission.email) ||
    systemUsers.find((user) => user.name === submission.applicant) ||
    systemUsers.find(
      (user) =>
        normalizeRole(user.role) === "applicant" &&
        String(submission.applicant || "")
          .toLowerCase()
          .includes(String(user.name || "").toLowerCase()),
    ) ||
    null
  );
}

function getChatUserName(userId) {
  return systemUsers.find((user) => user.id === userId)?.name || "System User";
}

function getCaseChatAvailability(submission) {
  if (!submission) {
    return { available: false, message: "Case not found." };
  }
  const assignedReviewerId = getAssignedReviewerId(submission);
  if (!assignedReviewerId) {
    return {
      available: false,
      message: "Chat will be available once an evaluator takes your case.",
    };
  }
  if (!getSubmissionApplicantUser(submission)) {
    return {
      available: false,
      message: "Chat is unavailable because the applicant account could not be matched.",
    };
  }
  if (!systemUsers.find((user) => user.id === assignedReviewerId)) {
    return {
      available: false,
      message: "Chat is unavailable because the assigned evaluator account could not be found.",
    };
  }
  return { available: true, message: "" };
}

function canAccessCaseChat(submission, role = currentRole) {
  if (!submission) return false;
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "superadmin" || normalizedRole === "admin") return true;
  if (normalizedRole === "applicant") return isOwnSubmission(submission, role);
  if (normalizedRole === "reviewer") {
    return getAssignedReviewerId(submission) === getCurrentUser(role).id;
  }
  return false;
}

function canSendCaseChat(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return (
    (normalizedRole === "applicant" || normalizedRole === "reviewer") &&
    canAccessCaseChat(submission, role) &&
    getCaseChatAvailability(submission).available
  );
}

function getChatReceiverId(submission, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "applicant") return getAssignedReviewerId(submission);
  if (normalizedRole === "reviewer") return getSubmissionApplicantUser(submission)?.id || null;
  return null;
}

function getCaseChatMessages(caseId) {
  return chatMessages
    .filter((message) => message.case_id === caseId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function getLastChatMessage(caseId) {
  return getCaseChatMessages(caseId).slice(-1)[0] || null;
}

function getUnreadChatCount(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole !== "applicant" && normalizedRole !== "reviewer") return 0;
  const user = getCurrentUser(role);
  return chatMessages.filter((message) => {
    if (message.receiver_id !== user.id || message.is_read) return false;
    const submission = submissions.find((s) => s.id === message.case_id);
    return canAccessCaseChat(submission, role);
  }).length;
}

function getUnreadChatCountForCase(caseId, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole !== "applicant" && normalizedRole !== "reviewer") return 0;
  const user = getCurrentUser(role);
  return chatMessages.filter(
    (message) =>
      message.case_id === caseId &&
      message.receiver_id === user.id &&
      !message.is_read,
  ).length;
}

function markCaseChatRead(caseId) {
  const normalizedRole = normalizeRole(currentRole);
  if (normalizedRole !== "applicant" && normalizedRole !== "reviewer") return;
  const user = getCurrentUser();
  chatMessages.forEach((message) => {
    if (message.case_id === caseId && message.receiver_id === user.id) {
      message.is_read = true;
    }
  });
}

function getChatConversationCases(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  let cases = [];
  if (normalizedRole === "applicant") {
    cases = getVisibleSubmissions("applicant").filter((s) => s.status !== "Draft");
  } else if (normalizedRole === "reviewer") {
    cases = submissions.filter((s) => getAssignedReviewerId(s) === getCurrentUser(role).id);
  } else if (normalizedRole === "superadmin" || normalizedRole === "admin") {
    cases = submissions.filter(
      (s) => getAssignedReviewerId(s) || chatMessages.some((message) => message.case_id === s.id),
    );
  }

  return cases.sort((a, b) => {
    const aLast = getLastChatMessage(a.id);
    const bLast = getLastChatMessage(b.id);
    return new Date(bLast?.created_at || b.date || 0) - new Date(aLast?.created_at || a.date || 0);
  });
}

function isAdminChatMonitorRole(role = currentRole) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "superadmin" || normalizedRole === "admin";
}

function getChatCaseApplicantName(submission) {
  return getSubmissionApplicantUser(submission)?.name || submission?.applicant || "Unknown applicant";
}

function getChatCaseSpecialistName(submission) {
  return getAssignedReviewer(submission)?.name || "Unassigned specialist";
}

function getAdminChatMonitorFilters() {
  const params = typeof currentParams === "object" && currentParams ? currentParams : {};
  return {
    specialistId: params.chatSpecialistId || "all",
    applicant: params.chatApplicant || "all",
    sort: params.chatSort || "latest",
  };
}

function compareText(a, b) {
  return String(a || "").localeCompare(String(b || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function applyAdminChatMonitorFilters(cases, filters) {
  const filtered = cases.filter((submission) => {
    if (filters.specialistId !== "all") {
      const assignedId = getAssignedReviewerId(submission);
      const filterId = filters.specialistId === "unassigned" ? null : Number(filters.specialistId);
      if ((assignedId || null) !== filterId) return false;
    }

    if (filters.applicant !== "all" && getChatCaseApplicantName(submission) !== filters.applicant) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "specialist") {
      return (
        compareText(getChatCaseSpecialistName(a), getChatCaseSpecialistName(b)) ||
        compareText(getChatCaseApplicantName(a), getChatCaseApplicantName(b)) ||
        compareText(a.id, b.id)
      );
    }
    if (filters.sort === "applicant") {
      return (
        compareText(getChatCaseApplicantName(a), getChatCaseApplicantName(b)) ||
        compareText(getChatCaseSpecialistName(a), getChatCaseSpecialistName(b)) ||
        compareText(a.id, b.id)
      );
    }
    if (filters.sort === "case") {
      return compareText(a.id, b.id);
    }

    const aLast = getLastChatMessage(a.id);
    const bLast = getLastChatMessage(b.id);
    return new Date(bLast?.created_at || b.date || 0) - new Date(aLast?.created_at || a.date || 0);
  });
}

function renderAdminChatMonitorControls(allCases, visibleCases, filters) {
  const specialistOptions = [
    { value: "all", label: "All specialists" },
    ...getReviewerUsers().map((user) => ({ value: String(user.id), label: user.name })),
  ];
  if (allCases.some((submission) => !getAssignedReviewerId(submission))) {
    specialistOptions.push({ value: "unassigned", label: "Unassigned specialist" });
  }

  const applicantOptions = [
    "All applicants",
    ...Array.from(new Set(allCases.map((submission) => getChatCaseApplicantName(submission)))).sort(compareText),
  ];

  return `
    <div class="admin-chat-monitor-controls">
      <div class="chat-filter-group">
        <label for="chatSpecialistFilter">Specialist</label>
        <select id="chatSpecialistFilter" onchange="setAdminChatMonitorFilter('chatSpecialistId', this.value)">
          ${specialistOptions
            .map(
              (option) =>
                `<option value="${escapeHtml(option.value)}" ${filters.specialistId === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="chat-filter-group">
        <label for="chatApplicantFilter">Applicant Conversation</label>
        <select id="chatApplicantFilter" onchange="setAdminChatMonitorFilter('chatApplicant', this.value)">
          ${applicantOptions
            .map((applicant, index) => {
              const value = index === 0 ? "all" : applicant;
              return `<option value="${escapeHtml(value)}" ${filters.applicant === value ? "selected" : ""}>${escapeHtml(applicant)}</option>`;
            })
            .join("")}
        </select>
      </div>
      <div class="chat-filter-group">
        <label for="chatSortFilter">Sort</label>
        <select id="chatSortFilter" onchange="setAdminChatMonitorFilter('chatSort', this.value)">
          <option value="latest" ${filters.sort === "latest" ? "selected" : ""}>Latest activity</option>
          <option value="specialist" ${filters.sort === "specialist" ? "selected" : ""}>Specialist name A-Z</option>
          <option value="applicant" ${filters.sort === "applicant" ? "selected" : ""}>Applicant name A-Z</option>
          <option value="case" ${filters.sort === "case" ? "selected" : ""}>Case ID A-Z</option>
        </select>
      </div>
      <div class="chat-filter-actions">
        <div class="chat-filter-summary">
          <strong>${visibleCases.length}</strong> of ${allCases.length} conversations
        </div>
        <button type="button" class="chat-filter-reset" onclick="resetAdminChatMonitorFilters()" title="Reset filters">
          <i class="fa-solid fa-rotate-left"></i>
          <span>Reset</span>
        </button>
      </div>
    </div>
  `;
}

function formatChatDateTime(value) {
  if (!value) return "Just now";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes = 0) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getChatAttachmentType(file) {
  return file.type.startsWith("image/") ? "image" : "file";
}

function validateChatFile(file) {
  if (!file) return { valid: true };
  const lowerName = file.name.toLowerCase();
  const hasSafeExtension = CHAT_ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasSafeMime = CHAT_ALLOWED_MIME_TYPES.includes(file.type);
  if (!hasSafeExtension || (file.type && !hasSafeMime)) {
    return {
      valid: false,
      message: "Only JPG, PNG, PDF, and DOCX files are allowed.",
    };
  }
  if (file.size > CHAT_MAX_FILE_SIZE) {
    return {
      valid: false,
      message: "File is too large. Maximum upload size is 5 MB.",
    };
  }
  return { valid: true };
}

function renderChatAttachment(attachment) {
  if (!attachment || !attachment.attachment_url) return "";
  const name = escapeHtml(attachment.attachment_name || "Attachment");
  const size = formatFileSize(attachment.attachment_size);
  if (attachment.attachment_type === "image") {
    return `
      <a class="chat-image-attachment" href="${attachment.attachment_url}" target="_blank" rel="noopener noreferrer">
        <img src="${attachment.attachment_url}" alt="${name}" />
      </a>
      <div class="chat-file-meta">${name} - ${size}</div>
    `;
  }
  return `
    <div class="chat-file-attachment">
      <div class="chat-file-icon"><i class="fa-solid fa-file-lines"></i></div>
      <div class="chat-file-info">
        <strong>${name}</strong>
        <span>${size}</span>
      </div>
      <a class="btn btn-sm btn-outline-navy" href="${attachment.attachment_url}" download="${name}">
        <i class="fa-solid fa-download"></i> Download
      </a>
    </div>
  `;
}

function renderDraftChatAttachment(caseId) {
  const draft = chatDraftAttachments[caseId];
  if (!draft) return "";
  return `
    <div class="chat-draft-attachment">
      ${draft.attachment_type === "image" ? `<img src="${draft.attachment_url}" alt="${escapeHtml(draft.attachment_name)}" />` : `<i class="fa-solid fa-file-lines"></i>`}
      <div>
        <strong>${escapeHtml(draft.attachment_name)}</strong>
        <span>${formatFileSize(draft.attachment_size)}</span>
      </div>
      <button type="button" onclick="clearChatAttachment('${caseId}')" title="Remove attachment"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `;
}

function renderCaseChatButton(submission) {
  if (!canAccessCaseChat(submission)) return "";
  const role = normalizeRole(currentRole);
  const unread = getUnreadChatCountForCase(submission.id);
  const label = role === "superadmin" || role === "admin" ? "View Chat History" : "Chat";
  return `
    <button class="btn btn-outline-navy btn-sm case-chat-btn" onclick="openCaseChat('${submission.id}')">
      <i class="fa-solid fa-comments"></i> ${label}
      ${unread ? `<span class="chat-button-badge">${unread}</span>` : ""}
    </button>
  `;
}

function renderChatConversationList(cases, activeCaseId) {
  if (!cases.length) {
    return `
      <div class="chat-empty-state">
        <i class="fa-solid fa-comments"></i>
        <h3>No conversations yet</h3>
        <p>Case chat threads will appear here once a submitted case is available.</p>
      </div>
    `;
  }

  return cases
    .map((submission) => {
      const role = normalizeRole(currentRole);
      const last = getLastChatMessage(submission.id);
      const unread = getUnreadChatCountForCase(submission.id);
      const availability = getCaseChatAvailability(submission);
      const applicantName = getChatCaseApplicantName(submission);
      const specialistName = getAssignedReviewer(submission)?.name || "Evaluator pending";
      const metaContent =
        role === "applicant"
          ? `${escapeHtml(specialistName)} - ${typeBadge(submission.type)}`
          : role === "reviewer"
            ? `${escapeHtml(applicantName)} - ${typeBadge(submission.type)}`
            : `<span><i class="fa-solid fa-user"></i> ${escapeHtml(applicantName)}</span><span><i class="fa-solid fa-user-tie"></i> ${escapeHtml(specialistName)}</span>${typeBadge(submission.type)}`;
      return `
        <button class="chat-thread-item ${activeCaseId === submission.id ? "active" : ""}" onclick="openCaseChat('${submission.id}')">
          <div class="chat-thread-top">
            <strong>${escapeHtml(submission.id)}</strong>
            ${unread ? `<span>${unread}</span>` : ""}
          </div>
          <div class="chat-thread-title">${escapeHtml(submission.title)}</div>
          <div class="chat-thread-meta">${metaContent}</div>
          <p>${last ? escapeHtml(last.message_text || last.attachment_name || "Attachment sent") : availability.available ? "No messages yet." : availability.message}</p>
        </button>
      `;
    })
    .join("");
}

function renderChatThread(submission) {
  if (!submission || !canAccessCaseChat(submission)) {
    return `
      <div class="chat-empty-state">
        <i class="fa-solid fa-lock"></i>
        <h3>Access Restricted</h3>
        <p>You can only view conversations for cases that belong to you or are assigned to you.</p>
      </div>
    `;
  }

  const role = normalizeRole(currentRole);
  const availability = getCaseChatAvailability(submission);
  const messages = getCaseChatMessages(submission.id);
  const applicant = getSubmissionApplicantUser(submission);
  const reviewer = getAssignedReviewer(submission);
  const applicantName = applicant?.name || submission.applicant;
  const specialistName = reviewer?.name || "Evaluator pending";
  const counterpart =
    role === "applicant"
      ? specialistName
      : applicantName;
  const readOnly = role === "superadmin" || role === "admin";
  const canSend = canSendCaseChat(submission);
  const safeId = submission.id.replace(/[^a-zA-Z0-9_-]/g, "_");

  return `
    <div class="chat-panel">
      <div class="chat-panel-header">
        <div>
          <div class="chat-case-kicker">${escapeHtml(submission.id)} - ${escapeHtml(submission.type)}</div>
          <h2>${escapeHtml(submission.title)}</h2>
          <p>${readOnly ? `Applicant: ${escapeHtml(applicantName)} | Specialist: ${escapeHtml(specialistName)}` : `Conversation with ${escapeHtml(counterpart)}`}</p>
        </div>
        <div class="chat-header-actions">
          ${statusBadge(submission.status)}
          ${readOnly ? '<span class="badge badge-review"><i class="fa-solid fa-eye"></i> Audit only</span>' : ""}
        </div>
      </div>

      ${
        availability.available
          ? ""
          : `<div class="chat-unavailable"><i class="fa-solid fa-circle-info"></i> ${availability.message}</div>`
      }

      <div class="chat-message-area" id="chatMessageArea-${safeId}">
        ${
          messages.length
            ? messages
                .map((message) => {
                  const isMine = message.sender_id === getCurrentUser().id && role !== "superadmin";
                  return `
                    <div class="chat-message ${isMine ? "mine" : "theirs"}">
                      <div class="chat-bubble">
                        <div class="chat-message-head">
                          <strong>${escapeHtml(getChatUserName(message.sender_id))}</strong>
                          <span>${formatChatDateTime(message.created_at)}</span>
                        </div>
                        ${message.message_text ? `<div class="chat-message-text">${escapeHtml(message.message_text)}</div>` : ""}
                        ${renderChatAttachment(message)}
                        <div class="chat-message-status">${isMine ? (message.is_read ? "Seen" : "Sent") : "Seen"}</div>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<div class="chat-empty-state compact"><i class="fa-solid fa-message"></i><p>No messages yet for this case.</p></div>`
        }
      </div>

      ${
        canSend
          ? `<div class="chat-composer">
              ${renderDraftChatAttachment(submission.id)}
              <div class="chat-composer-row">
                <button type="button" class="chat-file-button" onclick="document.getElementById('chatFileInput-${safeId}').click()" title="Attach file">
                  <i class="fa-solid fa-paperclip"></i>
                </button>
                <input id="chatFileInput-${safeId}" type="file" accept=".jpg,.jpeg,.png,.pdf,.docx" onchange="selectChatAttachment(this, '${submission.id}')" />
                <textarea id="chatMessageInput-${safeId}" placeholder="Write a message about this case..."></textarea>
                <button type="button" class="btn btn-primary" onclick="sendChatMessage('${submission.id}')">
                  <i class="fa-solid fa-paper-plane"></i> Send
                </button>
              </div>
              <div class="chat-upload-hint">Allowed: JPG, PNG, PDF, DOCX. Maximum size: 5 MB.</div>
            </div>`
          : readOnly
            ? `<div class="chat-readonly-note"><i class="fa-solid fa-eye"></i> Admin monitoring is read-only. Messages cannot be sent from this view.</div>`
            : ""
      }
    </div>
  `;
}

function renderMessagesPage() {
  const role = normalizeRole(currentRole);
  const requestedCaseId = currentParams.caseId || "";
  const adminMonitor = isAdminChatMonitorRole(role);
  const allCases = getChatConversationCases(role);
  const adminFilters = adminMonitor ? getAdminChatMonitorFilters() : null;
  let cases = adminMonitor ? applyAdminChatMonitorFilters(allCases, adminFilters) : allCases;
  let activeCase =
    cases.find((submission) => submission.id === requestedCaseId) ||
    (!adminMonitor && requestedCaseId
      ? submissions.find((submission) => submission.id === requestedCaseId && canAccessCaseChat(submission))
      : null) ||
    cases[0] ||
    null;

  if (!adminMonitor && activeCase && !cases.some((submission) => submission.id === activeCase.id)) {
    cases = [activeCase, ...cases];
  }

  if (activeCase) {
    currentParams.caseId = activeCase.id;
    markCaseChatRead(activeCase.id);
  }

  const title =
    role === "reviewer"
      ? "Messages"
      : role === "applicant"
        ? "Case Messages"
        : "Chat Monitoring";
  const subtitle =
    role === "reviewer"
      ? "Reply to applicants for cases assigned to you."
      : role === "applicant"
        ? "Talk with the assigned evaluator for each submitted case."
        : "Read-only monitoring of applicant and evaluator conversations.";

  return `
    ${renderBackNav()}
    <div class="page-header">
      <h1><i class="fa-solid fa-comments"></i> ${title}</h1>
      <p>${subtitle}</p>
    </div>
    ${adminMonitor ? renderAdminChatMonitorControls(allCases, cases, adminFilters) : ""}
    <div class="chat-shell">
      <aside class="chat-thread-list">
        <div class="chat-thread-list-header">
          <strong>Conversations</strong>
          ${getUnreadChatCount() ? `<span>${getUnreadChatCount()} unread</span>` : ""}
        </div>
        ${renderChatConversationList(cases, activeCase?.id || "")}
      </aside>
      <section class="chat-workspace">
        ${
          activeCase
            ? renderChatThread(activeCase)
            : `<div class="chat-empty-state"><i class="fa-solid fa-comments"></i><h3>Select a conversation</h3><p>No eligible case conversations are available yet.</p></div>`
        }
      </section>
    </div>
  `;
}

window.openCaseChat = function(caseId) {
  const params = currentPage === "messages" ? { ...currentParams, caseId } : { caseId };
  navigateTo("messages", false, params);
};

window.setAdminChatMonitorFilter = function(key, value) {
  currentParams = {
    ...(typeof currentParams === "object" && currentParams ? currentParams : {}),
    [key]: value,
  };
  if (key !== "chatSort") {
    currentParams.caseId = "";
  }
  renderDashboardContent("messages");
};

window.resetAdminChatMonitorFilters = function() {
  currentParams = { caseId: "" };
  renderDashboardContent("messages");
};

window.selectChatAttachment = function(input, caseId) {
  const file = input.files?.[0];
  if (!file) return;
  const result = validateChatFile(file);
  if (!result.valid) {
    input.value = "";
    showToast(result.message);
    return;
  }
  const attachmentUrl =
    typeof URL !== "undefined" && URL.createObjectURL
      ? URL.createObjectURL(file)
      : "#";
  chatDraftAttachments[caseId] = {
    attachment_url: attachmentUrl,
    attachment_type: getChatAttachmentType(file),
    attachment_name: file.name,
    attachment_size: file.size,
  };
  renderDashboardContent("messages");
};

window.clearChatAttachment = function(caseId) {
  delete chatDraftAttachments[caseId];
  renderDashboardContent("messages");
};

function pushChatNotification(receiverId, submission, preview) {
  const receiver = systemUsers.find((user) => user.id === receiverId);
  if (!receiver) return;
  const receiverRole = normalizeRole(receiver.role);
  if (receiverRole !== "applicant" && receiverRole !== "reviewer") return;
  mockNotifications[receiverRole].unshift({
    id: Date.now(),
    userId: receiver.id,
    icon: "fa-comment-dots",
    color: "#3b82f6",
    title: `New message: ${submission.id}`,
    body: `${getCurrentUser().name}: ${preview || "Attachment sent"}`,
    time: "Just now",
    read: false,
    type: "case-message",
    caseId: submission.id,
  });
}

window.sendChatMessage = function(caseId) {
  const submission = submissions.find((s) => s.id === caseId);
  if (!canSendCaseChat(submission)) {
    showToast("You cannot send messages in this case chat.");
    return;
  }
  const safeId = caseId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const input = document.getElementById(`chatMessageInput-${safeId}`);
  const text = (input?.value || "").trim();
  const attachment = chatDraftAttachments[caseId] || null;
  if (!text && !attachment) {
    showToast("Enter a message or attach a file before sending.");
    return;
  }

  const sender = getCurrentUser();
  const receiverId = getChatReceiverId(submission);
  if (!receiverId) {
    showToast("No eligible receiver found for this case.");
    return;
  }

  chatMessages.push({
    id: Date.now(),
    case_id: caseId,
    sender_id: sender.id,
    receiver_id: receiverId,
    sender_role: normalizeRole(currentRole),
    message_text: text,
    attachment_url: attachment?.attachment_url || "",
    attachment_type: attachment?.attachment_type || "",
    attachment_name: attachment?.attachment_name || "",
    attachment_size: attachment?.attachment_size || 0,
    created_at: new Date().toISOString(),
    is_read: false,
  });

  delete chatDraftAttachments[caseId];
  pushChatNotification(receiverId, submission, text || attachment?.attachment_name);
  addAuditLog({
    accountName: sender.name,
    action: "Sent Chat Message",
    record: caseId,
    details: `Sent a case-linked message${attachment ? ` with attachment ${attachment.attachment_name}` : ""}.`,
    module: "Messages",
  });
  showToast("Message sent.");
  renderSidebar();
  renderDashboardContent("messages");
};

// Badges deduplicated above.

// ===== USER DASHBOARD =====
function renderUserDashboard() {
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
  else if (currentHour >= 17) greeting = "Good Evening";

  const user = getCurrentUser();
  const role = "applicant";
  const userSubmissions = getVisibleSubmissions(role);
  const total = userSubmissions.length;
  const actionRequired = userSubmissions.filter((s) => s.status === "Awaiting Documents").length;
  const drafts = userSubmissions.filter((s) => s.status === "Draft").length;
  const rejected = userSubmissions.filter((s) => s.status === "Rejected").length;
  const paymentRequested = userSubmissions.filter((s) => s.status === "Payment Requested").length;
  const recent = userSubmissions.filter(s => s.status !== 'Draft').slice(0, 3);
  const unreadMessages = getUnreadChatCount("applicant");

  // Stats clicking helper
  window.goToFilteredSubmissions = function(status) {
    if (typeof userFilterStatus !== 'undefined') {
      userFilterStatus = status;
    }
    navigateTo('user-submissions');
  };

  return `
    <div class="dashboard-hero" style="animation: fadeIn 0.6s ease-out;">
      <div class="hero-bg-accent"></div>
      <h1>${greeting}, ${user.name}!</h1>
      <p>Your intellectual property command center is ready. Track your active filings or start a new protective lane for your latest innovation below.</p>
    </div>

    <div class="quick-actions-grid">
      <div class="action-card" onclick="navigateTo('filing-hub')">
        <div class="action-card-icon"><i class="fa-solid fa-rocket"></i></div>
        <div class="action-card-content">
          <h3>Register New IP</h3>
          <p>Begin a new submission for Patent, Utility Model, Industrial Design, or Copyright.</p>
        </div>
        <div class="action-card-arrow"><i class="fa-solid fa-chevron-right"></i></div>
      </div>

      <div class="action-card" onclick="navigateTo('messages')">
        <div class="action-card-icon"><i class="fa-solid fa-comments"></i></div>
        <div class="action-card-content">
          <h3>Messages ${unreadMessages ? `<span class="chat-button-badge">${unreadMessages}</span>` : ""}</h3>
          <p>Chat with the assigned evaluator for your submitted cases.</p>
        </div>
        <div class="action-card-arrow"><i class="fa-solid fa-chevron-right"></i></div>
      </div>

    </div>

    <div class="page-header" style="margin-bottom: 24px;">
      <h2 style="font-size:1.4rem; font-weight:800; color:var(--navy);">Quick Stats</h2>
      <p>Overview of your current workspace status. Click a card to filter your cases.</p>
    </div>

    <div class="dashboard-stats-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:24px; margin-bottom:40px;">
      <!-- Payment Card -->
      <div class="stat-card" style="background:white; padding:24px; border-radius:16px; border:1px solid var(--gray-100); display:flex; align-items:center; gap:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); cursor:pointer; transition: transform 0.2s; --accent: var(--blue);" onclick="goToFilteredSubmissions('Payment Requested')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--blue-light); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
          <i class="fa-solid fa-credit-card"></i>
        </div>
        <div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--navy); line-height:1;">${paymentRequested}</div>
          <div style="font-size:0.85rem; color:var(--gray-500); font-weight:500; margin-top:4px;">Payment</div>
        </div>
      </div>

      <!-- Rejected Card -->
      <div class="stat-card" style="background:white; padding:24px; border-radius:16px; border:1px solid var(--gray-100); display:flex; align-items:center; gap:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); cursor:pointer; transition: transform 0.2s; --accent: var(--red);" onclick="goToFilteredSubmissions('Rejected')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--red-light); color:var(--red); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--red); line-height:1;">${rejected}</div>
          <div style="font-size:0.85rem; color:var(--gray-500); font-weight:500; margin-top:4px;">Rejected</div>
        </div>
      </div>

      <!-- Action Needed Card -->
      <div class="stat-card" style="background:white; padding:24px; border-radius:16px; border:1px solid var(--gray-100); display:flex; align-items:center; gap:20px; box-shadow:0 10px 20px -10px rgba(239,68,68,0.2); cursor:pointer; transition: transform 0.2s; --accent: #ef4444;" onclick="goToFilteredSubmissions('ActionRequired')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px; height:48px; border-radius:12px; background:#ef444415; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>
        <div>
          <div style="font-size:1.8rem; font-weight:800; color:#ef4444; line-height:1;">${actionRequired}</div>
          <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-top:4px;">Action Needed</div>
        </div>
      </div>

      <!-- Saved Draft Card -->
      <div class="stat-card" style="background:white; padding:24px; border-radius:16px; border:1px solid var(--gray-100); display:flex; align-items:center; gap:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); cursor:pointer; transition: transform 0.2s; --accent: var(--gray-500);" onclick="goToFilteredSubmissions('Draft')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--gray-100); color:var(--gray-600); display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
          <i class="fa-solid fa-file-pen"></i>
        </div>
        <div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--navy); line-height:1;">${drafts}</div>
          <div style="font-size:0.85rem; color:var(--gray-500); font-weight:500; margin-top:4px;">Saved Draft</div>
        </div>
      </div>
    </div>

    <div class="dashboard-section" style="background:white; border-radius:16px; border:1px solid var(--gray-100); padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.02); margin-bottom: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="font-size:1.1rem; font-weight:800; color:var(--navy); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-bullhorn" style="color:var(--gold);"></i> News & Announcements
        </h3>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        ${announcements.slice(0, 3).map(a => `
          <div class="bulletin-item" onclick="showAnnouncementModal(${a.id})" style="padding:16px; background:var(--gray-50); border-radius:12px; cursor:pointer; transition:all 0.2s ease; border:1.5px solid transparent;" onmouseover="this.style.borderColor='var(--gold-light)'; this.style.background='white'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='transparent'; this.style.background='var(--gray-50)'; this.style.transform='translateY(0)'">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="ann-badge ${a.category.toLowerCase()}" style="font-size:0.65rem; padding:4px 8px;">${a.category}</span>
              <span style="font-size:0.75rem; color:var(--gray-400); font-weight:600;">${a.date}</span>
            </div>
            <h4 style="font-size:0.9rem; font-weight:700; color:var(--navy); margin-bottom:4px; line-height:1.4;">${a.title}</h4>
            <p style="font-size:0.8rem; color:var(--gray-500); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${a.content}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dashboard-section" style="background:white; border-radius:16px; border:1px solid var(--gray-100); padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="font-size:1.2rem; font-weight:800; color:var(--navy);">Recent Submissions</h3>
        <button class="btn-text" onclick="navigateTo('user-submissions')" style="color:var(--gold-dark); font-weight:700; background:none; border:none; cursor:pointer;">View All <i class="fa-solid fa-circle-arrow-right" style="margin-left:4px;"></i></button>
      </div>
      
      <div class="table-container">
        ${
          recent.length
            ? `
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
            <thead>
              <tr style="text-align:left; border-bottom:1px solid var(--gray-100);">
                <th style="padding:16px; color:var(--gray-500); font-weight:600;">Reference No.</th>
                <th style="padding:16px; color:var(--gray-500); font-weight:600;">Type</th>
                <th style="padding:16px; color:var(--gray-500); font-weight:600;">Title</th>
                <th style="padding:16px; color:var(--gray-500); font-weight:600;">Date Submitted</th>
                <th style="padding:16px; color:var(--gray-500); font-weight:600;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${recent
                .map(
                  (s) => `
                <tr style="border-bottom:1px solid var(--gray-50); cursor:pointer; transition: background 0.2s;" onclick="viewSubmission('${s.id}')" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
                  <td style="padding:16px; font-weight:700; color:var(--navy);">${s.id}</td>
                  <td style="padding:16px;">${typeBadge(s.type)}</td>
                  <td style="padding:16px; font-weight:500; color:var(--gray-700);">${s.title}</td>
                  <td style="padding:16px; color:var(--gray-500);">${s.date}</td>
                  <td style="padding:16px;">${statusBadge(s.status)}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>`
            : `
          <div style="text-align:center; padding:48px 0;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--gray-50); display:inline-flex; align-items:center; justify-content:center; color:var(--gray-300); font-size:1.5rem; margin-bottom:16px;">
              <i class="fa-solid fa-file-circle-plus"></i>
            </div>
            <h4 style="color:var(--navy); margin-bottom:8px;">No submissions found</h4>
            <p style="color:var(--gray-500); font-size:0.9rem; margin-bottom:20px;">You haven't started any IP applications yet. Protect your first innovation today!</p>
            <button class="btn btn-primary" onclick="navigateTo('filing-hub')">Register Your First IP</button>
          </div>`
        }
      </div>
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
window.showTermsModal = function() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalFooter = document.getElementById("modalFooter");
  
  if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-file-contract"></i> Terms & Conditions`;
  if (modalBody) {
    modalBody.innerHTML = renderTermsAndConditions(true);
  }
  if (modalFooter) {
    modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
  }
  if (modalOverlay) {
    modalOverlay.classList.add("active");
  }
};

window.toggleSubmitButton = function() {
  const checkbox = document.getElementById("reviewTermsConfirm");
  const btn = document.getElementById("finalSubmitBtn");
  if (checkbox && btn) {
    btn.disabled = !checkbox.checked;
  }
};

function renderTermsAndConditions(isModal = false) {
  const sections = [
    {
      id: "ip-rights",
      icon: "fa-shield-halved",
      color: "#1e40af",
      gradient: "linear-gradient(135deg, #1e40af, #3b82f6)",
      badge: "Core Policy",
      title: "Intellectual Property Rights",
      content: `
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          This platform is designed to assist users in preparing and managing intellectual property applications 
          in accordance with Philippine laws, specifically <strong>Republic Act No. 8293</strong> — the Intellectual Property Code of the Philippines.
        </p>
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          All submissions — including Patentss, Copyrights, Utility Models, and Industrial Designs — 
          are covered under a unified IP policy aligned with RA 8293.
        </p>
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8;">
          By using this platform, users agree that all submissions are <strong>original or properly authorized</strong>. 
          Users are solely responsible for ensuring that their submissions do not infringe on existing intellectual property rights.
        </p>
        <div style="margin-top:16px; display:flex; flex-wrap:wrap; gap:8px;">
          ${["Patent",  "Copyright", "Utility Model", "Industrial Design"].map(ip => `
            <span style="padding:4px 12px; border-radius:999px; font-size:0.75rem; font-weight:700; background:rgba(30,64,175,0.08); color:#1e40af; border:1px solid rgba(30,64,175,0.15);">${ip}</span>
          `).join("")}
        </div>
      `
    },
    {
      id: "user-responsibility",
      icon: "fa-user-shield",
      color: "#0f766e",
      gradient: "linear-gradient(135deg, #0f766e, #10b981)",
      badge: "User Obligation",
      title: "User Responsibility",
      content: `
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          By submitting any application through this platform, the user confirms and represents the following:
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            { icon: "fa-user-check", text: "They are the <strong>rightful owner</strong> or an <strong>authorized representative</strong> of the intellectual property being submitted." },
            { icon: "fa-circle-check", text: "All information provided is <strong>accurate, truthful, and complete</strong>." },
            { icon: "fa-scale-balanced", text: "Submitted materials do <strong>not violate</strong> any existing laws, regulations, or third-party intellectual property rights." },
            { icon: "fa-file-shield", text: "They understand and accept that false or misleading submissions may result in account suspension and legal liability." },
          ].map(item => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; background:rgba(15,118,110,0.04); border:1px solid rgba(15,118,110,0.12); border-radius:10px;">
              <i class="fa-solid ${item.icon}" style="color:#0f766e; margin-top:2px; font-size:0.9rem; flex-shrink:0;"></i>
              <span style="font-size:0.87rem; color:var(--gray-700); line-height:1.6;">${item.text}</span>
            </div>
          `).join("")}
        </div>
      `
    },
    {
      id: "platform-role",
      icon: "fa-building-columns",
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
      badge: "Important Notice",
      title: "Platform Role & Limitations",
      content: `
        <div style="padding:14px 16px; border-radius:10px; background:#fffbeb; border:1px solid #fde68a; margin-bottom:16px;">
          <p style="font-size:0.88rem; color:#92400e; margin:0; line-height:1.7;">
            <i class="fa-solid fa-triangle-exclamation" style="margin-right:6px;"></i>
            <strong>This system serves as a submission and tracking platform for intellectual property applications. 
            It does not guarantee approval, registration, or legal protection of any submission.</strong>
          </p>
        </div>
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:12px;">
          All applications submitted through this platform are subject to review and evaluation by the appropriate authorities, 
          including the <strong>Intellectual Property Office of the Philippines (IPOPHL)</strong> and relevant university bodies.
        </p>
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8;">
          The platform facilitates the preparation and organization of application documents but does not act as a legal representative or guarantor of any outcome.
        </p>
      `
    },
    {
      id: "prohibited-use",
      icon: "fa-ban",
      color: "#dc2626",
      gradient: "linear-gradient(135deg, #dc2626, #f87171)",
      badge: "Prohibited",
      title: "Prohibited Actions",
      content: `
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          The following actions are strictly prohibited on this platform. Violations may result in immediate account termination and appropriate legal action.
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            "Submitting <strong>false, fabricated, or misleading</strong> information in any application.",
            "Uploading content that is <strong>unauthorized, infringing, or violates third-party rights</strong>.",
            "<strong>Misrepresenting ownership</strong> or authorization for any intellectual property submission.",
            "Attempting to <strong>circumvent or manipulate</strong> the review and evaluation process.",
            "Using the platform for any purpose <strong>outside of legitimate IP registration</strong> and management.",
          ].map((item, i) => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; background:rgba(220,38,38,0.04); border:1px solid rgba(220,38,38,0.12); border-radius:10px;">
              <span style="font-size:0.75rem; font-weight:900; color:#dc2626; background:rgba(220,38,38,0.1); border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px;">${i + 1}</span>
              <span style="font-size:0.87rem; color:var(--gray-700); line-height:1.6;">${item}</span>
            </div>
          `).join("")}
        </div>
      `
    },
    {
      id: "data-privacy",
      icon: "fa-lock",
      color: "#d97706",
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      badge: "Data Protection",
      title: "Data & Privacy",
      content: `
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          This platform is committed to protecting the privacy and confidentiality of all user data in accordance with the 
          <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            { icon: "fa-database", text: "User data and submitted documents are stored securely and accessed only by authorized personnel." },
            { icon: "fa-bullseye", text: "Data collected is used exclusively for <strong>processing and managing IP applications</strong> within the system." },
            { icon: "fa-share-nodes", text: "Personal information will not be shared with third parties without the user's explicit consent, except as required by law." },
            { icon: "fa-trash-can", text: "Users may request deletion or correction of their personal data by contacting the platform administrator." },
          ].map(item => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; background:rgba(217,119,6,0.04); border:1px solid rgba(217,119,6,0.12); border-radius:10px;">
              <i class="fa-solid ${item.icon}" style="color:#d97706; margin-top:2px; font-size:0.9rem; flex-shrink:0;"></i>
              <span style="font-size:0.87rem; color:var(--gray-700); line-height:1.6;">${item.text}</span>
            </div>
          `).join("")}
        </div>
      `
    },
    {
      id: "account-actions",
      icon: "fa-user-slash",
      color: "#374151",
      gradient: "linear-gradient(135deg, #374151, #6b7280)",
      badge: "Enforcement",
      title: "Account Actions",
      content: `
        <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.8; margin-bottom:14px;">
          The platform administrators reserve the right to take the following actions to maintain the integrity of the system:
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            { icon: "fa-circle-pause", label: "Account Suspension", text: "Temporary suspension of accounts under investigation for policy violations." },
            { icon: "fa-circle-xmark", label: "Account Termination", text: "Permanent termination of accounts confirmed to have violated these terms." },
            { icon: "fa-file-circle-xmark", label: "Submission Rejection", text: "Rejection of any application found to contain false or infringing content." },
            { icon: "fa-gavel", label: "Legal Referral", text: "Referral to appropriate legal authorities in cases of serious violations." },
          ].map(item => `
            <div style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; background:var(--gray-50); border:1px solid var(--gray-100); border-radius:10px;">
              <i class="fa-solid ${item.icon}" style="color:#374151; margin-top:2px; font-size:0.9rem; flex-shrink:0;"></i>
              <div>
                <div style="font-weight:700; color:var(--navy); font-size:0.85rem; margin-bottom:2px;">${item.label}</div>
                <span style="font-size:0.83rem; color:var(--gray-600); line-height:1.5;">${item.text}</span>
              </div>
            </div>
          `).join("")}
        </div>
      `
    },
  ];

  return `
    <div style="max-width:860px; margin:0 auto; padding: 16px 0 60px;">

      <!-- Hero Header -->
      <div style="text-align:center; margin-bottom:48px;">
        <div style="width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg,#1e40af,#3b82f6); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow:0 8px 24px rgba(30,64,175,0.25);">
          <i class="fa-solid fa-file-contract" style="color:white; font-size:1.6rem;"></i>
        </div>
        <h1 style="font-size:2rem; font-weight:900; color:var(--navy); margin-bottom:12px; letter-spacing:-0.02em;">Terms &amp; Conditions</h1>
        <p style="font-size:0.95rem; color:var(--gray-500); max-width:560px; margin:0 auto; line-height:1.7;">
          Please read these terms carefully before using The Creator's Bulwark IP Management System. 
          By accessing or submitting any application, you agree to be bound by these terms.
        </p>
        <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin-top:20px; flex-wrap:wrap;">
          <span style="font-size:0.78rem; color:var(--gray-400); font-weight:600;"><i class="fa-solid fa-calendar" style="margin-right:4px;"></i> Effective: January 1, 2026</span>
          <span style="font-size:0.78rem; color:var(--gray-400); font-weight:600;"><i class="fa-solid fa-scale-balanced" style="margin-right:4px;"></i> Governed by Republic Act No. 8293</span>
          <span style="font-size:0.78rem; color:var(--gray-400); font-weight:600;"><i class="fa-solid fa-location-dot" style="margin-right:4px;"></i> Philippines</span>
        </div>
      </div>

      <!-- Quick Nav -->
      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:36px; padding:20px; background:white; border-radius:16px; border:1px solid var(--gray-100); box-shadow:0 2px 12px rgba(0,0,0,0.04);">
        <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-400); width:100%; margin-bottom:4px;">Jump to section</span>
        ${sections.map(s => `
          <a href="#terms-${s.id}" style="padding:6px 14px; border-radius:999px; font-size:0.78rem; font-weight:700; background:var(--gray-50); color:var(--navy); border:1px solid var(--gray-100); text-decoration:none; transition:all 0.2s ease;" 
             onmouseover="this.style.background='${s.gradient}'; this.style.color='white'; this.style.borderColor='transparent';"
             onmouseout="this.style.background='var(--gray-50)'; this.style.color='var(--navy)'; this.style.borderColor='var(--gray-100)';">
            <i class="fa-solid ${s.icon}" style="margin-right:5px; font-size:0.75rem;"></i>${s.title}
          </a>
        `).join("")}
      </div>

      <!-- Sections -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        ${sections.map((s, idx) => `
          <div id="terms-${s.id}" style="background:white; border-radius:20px; border:1px solid var(--gray-100); overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
            <div style="padding:20px 24px; border-bottom:1px solid var(--gray-100); display:flex; align-items:center; gap:14px;">
              <div style="width:44px; height:44px; border-radius:12px; background:${s.gradient}; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
                <i class="fa-solid ${s.icon}" style="color:white; font-size:1rem;"></i>
              </div>
              <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:${s.color}; background:rgba(0,0,0,0.04); padding:2px 8px; border-radius:999px;">${s.badge}</span>
                  <span style="font-size:0.7rem; font-weight:700; color:var(--gray-400);">Section ${idx + 1}</span>
                </div>
                <h2 style="font-size:1rem; font-weight:800; color:var(--navy); margin:4px 0 0;">${s.title}</h2>
              </div>
            </div>
            <div style="padding:20px 24px;">
              ${s.content}
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Agreement Banner -->
      <div style="margin-top:36px; padding:28px; border-radius:20px; background:linear-gradient(135deg, #1e3a5f, #1e40af); color:white; text-align:center; box-shadow:0 8px 32px rgba(30,64,175,0.3);">
        <i class="fa-solid fa-handshake" style="font-size:2rem; margin-bottom:14px; opacity:0.9;"></i>
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:10px;">Agreement</h3>
        <p style="font-size:0.88rem; line-height:1.7; opacity:0.85; max-width:520px; margin:0 auto 20px;">
          By continuing to use this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions.
        </p>

        <div style="margin-top:20px;">
          ${isModal 
            ? `<a href="javascript:void(0)" onclick="closeModal()" style="display:inline-block; padding:12px 32px; background:white; color:#1e40af; font-weight:800; font-size:0.9rem; border-radius:10px; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.15);">Close Terms &amp; Conditions</a>`
            : `<a href="javascript:void(0)" onclick="navigateTo('landing')" style="display:inline-block; padding:12px 32px; background:white; color:#1e40af; font-weight:800; font-size:0.9rem; border-radius:10px; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.15);"><i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i> Return to Homepage</a>`
          }
        </div>
      </div>

      <!-- Legal Footer Note -->
      <p style="text-align:center; font-size:0.78rem; color:var(--gray-400); margin-top:24px; line-height:1.6;">
        This platform is operated by Palawan State University — Intellectual Property &amp; Technology Transfer Office (IPTTO). 
        For questions or concerns, contact <strong>ipo@psu.palawan.edu.ph</strong>
      </p>

    </div>
  `;
}

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
        a: "<strong>Required Documents:</strong><ul style='margin-top:10px; padding-left:20px; line-height: 1.8;'><li>Copyright Registration Form (PSU-IPO-CR-01)</li><li>Complete Copy of the Work</li><li>Valid Philippine ID (Digitized)</li></ul>",
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
    <div class="page-header" style="max-width: 900px; margin: 0 auto 40px auto; padding: 0 16px;">
      <h1 style="font-size: 2.5rem; margin-bottom: 0;">Frequently Asked Questions</h1>
    </div>
    
    <div class="faq-container" style="max-width: 900px; margin: 0 auto; padding-bottom: 50px;">
      ${renderGroup("Patent Guidelines", faqData.patent, '<i class="fa-solid fa-lightbulb"></i>', "linear-gradient(135deg,#3b82f6,#1d4ed8)")}
      ${renderGroup("Utility Model Protections", faqData.utilityModel, '<i class="fa-solid fa-gears"></i>', "linear-gradient(135deg,#6366f1,#4338ca)")}
      ${renderGroup("Industrial Design Rights", faqData.industrialDesign, '<i class="fa-solid fa-pen-nib"></i>', "linear-gradient(135deg,#ec4899,#be185d)")}
      ${renderGroup("Copyright Basics", faqData.copyright, '<i class="fa-solid fa-copyright"></i>', "linear-gradient(135deg,#10b981,#059669)")}
    </div>
  `;
}

function renderProjectBlueprint() {
  return `
    ${renderBackNav()}
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
      <button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; font-weight:600;" onclick="showToast('Starting report generation...')"><i class="fa-solid fa-file-export" style="margin-right:8px; width:16px;"></i> Download Status</button>
    </div>`;

  return { main, side };
}

function getRoleSpecificStats(role) {
  const norm = normalizeRole(role);
  const visibleSubmissions = getVisibleSubmissions(role);
  const total = visibleSubmissions.length;
  const pending = visibleSubmissions.filter(
    (s) =>
      s.status === "Pending" ||
      s.status === "Under Review" ||
      s.status === "Validated" ||
      s.status === "Payment Requested" ||
      s.status === "Awaiting Documents",
  ).length;
  const approvedCount = visibleSubmissions.filter(
    (s) => s.status === "Approved",
  ).length;
  const baseStats = {
    superadmin: {
      title: "Admin Dashboard",
      subtitle: "Global oversight of all university IP activities.",
      cards: [
        {
          label: "Total Submissions",
          value: total,
          icon: "fa-folder-open",
          color: "blue",
        },
        {
          label: "Approved",
          value: approvedCount,
          icon: "fa-certificate",
          color: "green",
        },
        {
          label: "Under Review",
          value: pending,
          icon: "fa-microscope",
          color: "yellow",
        },
      ],
    },
    reviewer: {
      title: "Specialist Workspace",
      subtitle: "Manage cases and complete specialist evaluations.",
      cards: [
        {
          label: "Cases",
          value: total,
          icon: "fa-briefcase",
          color: "blue",
        },
        {
          label: "Completed Reviews",
          value: approvedCount,
          icon: "fa-check-circle",
          color: "green",
        },
        {
          label: "Pending Action",
          value: pending,
          icon: "fa-clock",
          color: "yellow",
        },
      ],
    },
    applicant: [
      {
        label: "My Applications",
        value: visibleSubmissions.length,
        icon: "fa-file-lines",
        color: "blue",
      },
      {
        label: "Approved",
        value: visibleSubmissions.filter((s) => s.status === "Approved").length,
        icon: "fa-check",
        color: "green",
      },
    ],
  };

  return baseStats[norm] || baseStats.applicant;
}

function getRoleSpecificPanels(role) {
  const normalizedRole = normalizeRole(role);
  const submissionsList = getVisibleSubmissions(normalizedRole).slice(0, 3);
  const mainPanelTitle =
    normalizedRole === "reviewer" ? "Assigned Case Queue" : "Action Required";

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
      <button class="btn btn-outline-navy" style="width:100%; justify-content:flex-start; font-weight:600;" onclick="${normalizedRole === "reviewer" ? "generateEvaluatorReport()" : "showToast('Starting report generation...')"}"><i class="fa-solid fa-file-export" style="margin-right:8px; width:16px;"></i> ${normalizedRole === "reviewer" ? "Download Cases Report" : "Download Status"}</button>
    </div>`;
  return { main, side };
}

window.generateEvaluatorReport = function() {
  const role = "reviewer";
  const visibleSubmissions = getVisibleSubmissions(role);
  
  if (visibleSubmissions.length === 0) {
    showToast("No cases available to generate a report.");
    return;
  }

  showToast("Generating cases report...");

  // CSV Header
  let csvContent = "Reference No.,Type,Title,Applicant,Date,Status,Assigned Evaluator\n";

  // CSV Rows
  visibleSubmissions.forEach(s => {
    const specialist = getAssignedReviewerName(s);
    const row = [
      s.id,
      s.type,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.applicant.replace(/"/g, '""')}"`,
      s.date,
      s.status,
      `"${specialist.replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });

  // Download Trigger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split('T')[0];
  const userName = getCurrentUser(role).name.replace(/\s+/g, '_').toLowerCase();
  
  link.setAttribute("href", url);
  link.setAttribute("download", `evaluator_report_${userName}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Generated Report",
    record: "Cases CSV",
    details: `Evaluator ${getCurrentUser().name} downloaded a report of their visible cases.`,
    module: "Dashboard",
  });
};

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

  const user = getCurrentUser(currentRole);
  if (user) {
    showToast(
      `Access switched to: ${user.name} (${getRoleMeta(currentRole).label})`,
    );
  }

  // Render Sidebar and Topbar immediately to reflect new role
  renderSidebar();
  updateTopbarRole();

  // Navigate to appropriate landing page
  navigateTo(getDefaultDashboardPage(currentRole));
}

function getScopedReviewerSubmissions(scope = adminCaseScope, role = currentRole) {
  const normalizedRole = normalizeRole(role);
  let visible = [...getVisibleSubmissions(role)];
  if (normalizedRole !== "reviewer") return visible;
  if (scope === "mine") {
    return visible.filter((submission) =>
      isAssignedReviewerSubmission(submission, role),
    );
  }
  if (scope === "queue") {
    return visible.filter(
      (submission) => !isAssignedReviewerSubmission(submission, role),
    );
  }
  return visible;
}

function renderAdminSubmissionsPage() {
  adminFilterType = "All";
  adminFilterStatus = "All";
  adminCaseView = "active";
  adminCaseScope = "queue";
  adminSearchQuery = "";
  const normalizedRole = normalizeRole(currentRole);
  const pageTitle =
  normalizedRole === "reviewer" ? "Cases" : "All Submissions";
  const subtitle =
    normalizedRole === "reviewer"
      ? "Take an available case before updating its status. Assigned cases owned by other evaluators stay visible in read-only mode."
      : "Filter, review, and manage IP applications.";
  return `
    <div class="page-header">
      <h1>${pageTitle}</h1>
      <p>${subtitle}</p>
    </div>
    ${renderAdminSubmissionsTable()}
  `;
}

function renderReviewerMyCasesPage() {
  adminFilterType = "All";
  adminFilterStatus = "All";
  adminCaseView = "active";
  adminCaseScope = "mine";
  adminSearchQuery = "";
  return `
    <div class="page-header">
      <h1>My Cases</h1>
      <p>Track the cases you have taken and update their status from your personal work queue.</p>
    </div>
    ${renderAdminSubmissionsTable()}
  `;
}

function renderAdminSubmissionsTable(filterType, filterStatus, searchQuery) {
  let filtered = [...getScopedReviewerSubmissions(adminCaseScope, currentRole)];
  const activeCount = filtered.filter((s) => !isSubmissionArchived(s)).length;
  const archivedCount = filtered.filter((s) => isSubmissionArchived(s)).length;
  if (adminCaseView === "archived") {
    filtered = filtered.filter((s) => isSubmissionArchived(s));
  } else {
    filtered = filtered.filter((s) => !isSubmissionArchived(s));
  }
  if (filterType && filterType !== "All")
    filtered = filtered.filter((s) => s.type === filterType);
  if (filterStatus && filterStatus !== "All")
    filtered = filtered.filter((s) => s.status === filterStatus);

  const isMyCasesView = adminCaseScope === "mine";

  return `
    <div class="table-container" id="adminSubmissionsTable">
      <div class="table-header">
        ${isMyCasesView || normalizeRole(currentRole) === "reviewer" ? "" : `<h3>Visible Cases <span style="font-size:.8rem;font-weight:400;color:var(--gray-400);">(${filtered.length} result${filtered.length !== 1 ? "s" : ""})</span></h3>`}
        <select class="filter-select" onchange="filterAdminStatus(this.value)">
          <option value="All">All Status</option>
          <option value="Pending" ${(filterStatus || "") === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Under Review" ${(filterStatus || "") === "Under Review" ? "selected" : ""}>Under Review</option>
          <option value="Validated" ${(filterStatus || "") === "Validated" ? "selected" : ""}>Validated</option>
          <option value="Payment Requested" ${(filterStatus || "") === "Payment Requested" ? "selected" : ""}>Payment Requested</option>
          <option value="Approved" ${(filterStatus || "") === "Approved" ? "selected" : ""}>Approved</option>
          <option value="Rejected" ${(filterStatus || "") === "Rejected" ? "selected" : ""}>Rejected</option>
          <option value="Awaiting Documents" ${(filterStatus || "") === "Awaiting Documents" ? "selected" : ""}>Awaiting Docs</option>
          <option value="Archived" ${(filterStatus || "") === "Archived" ? "selected" : ""}>Archived</option>
        </select>
      </div>
      <div style="padding:0 24px 10px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="filter-btn ${adminCaseView === "active" ? "active" : ""}" onclick="setAdminCaseView('active')">Active Cases (${activeCount})</button>
        <button class="filter-btn ${adminCaseView === "archived" ? "active" : ""}" onclick="setAdminCaseView('archived')">Archived (${archivedCount})</button>
      </div>
      <div style="padding:0 24px 14px;display:flex;gap:6px;flex-wrap:wrap;">
        <button class="filter-btn ${!filterType || filterType === "All" ? "active" : ""}" onclick="filterAdminTable('All')">All</button>
        <button class="filter-btn ${(filterType || "") === "Patent" ? "active" : ""}" onclick="filterAdminTable('Patent')">Patent</button>
        <button class="filter-btn ${(filterType || "") === "Copyright" ? "active" : ""}" onclick="filterAdminTable('Copyright')">Copyright</button>
        <button class="filter-btn ${(filterType || "") === "Utility Model" ? "active" : ""}" onclick="filterAdminTable('Utility Model')">Utility Model</button>
        <button class="filter-btn ${(filterType || "") === "Industrial Design" ? "active" : ""}" onclick="filterAdminTable('Industrial Design')">Industrial Design</button>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference No.</th><th>Type</th><th>Title</th><th>Applicant</th>${isMyCasesView || normalizeRole(currentRole) === "reviewer" ? "" : "<th>Specialist</th>"}<th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${
          filtered.length === 0
            ? `<tr><td colspan="${isMyCasesView || normalizeRole(currentRole) === "reviewer" ? "7" : "8"}" style="text-align:center;padding:50px;color:var(--gray-400);"><i class="fa-solid fa-inbox" style="font-size:2.5rem;display:block;margin-bottom:12px;"></i>No submissions match your criteria.</td></tr>`
            : filtered
                .map(
                  (s) => `<tr>
          <td><strong>${s.id}</strong></td><td>${typeBadge(s.type)}</td><td>${s.title}</td><td>${s.applicant}</td>${isMyCasesView || normalizeRole(currentRole) === "reviewer" ? "" : `<td>${getAssignedReviewerName(s)}</td>`}<td>${s.date}</td><td>${statusBadge(s.status)}</td>
          <td><div class="action-btns">
            <button class="btn btn-sm btn-outline-navy" onclick="viewSubmission('${s.id}')"><i class="fa-solid fa-eye"></i> View</button>
            ${canTakeSubmission(s) ? `<button class="btn btn-sm btn-primary" onclick="takeCase('${s.id}')"><i class="fa-solid fa-hand-holding-hand"></i> Take Case</button>` : ""}
            ${normalizeRole(currentRole) === "reviewer" && !canTakeSubmission(s) && !isAssignedReviewerSubmission(s) ? `<button class="btn btn-sm btn-secondary" disabled title="Evaluator: ${getAssignedReviewerName(s)}"><i class="fa-solid fa-lock"></i> Read Only</button>` : ""}
            ${canArchiveSubmission(s) ? `<button class="btn btn-sm btn-secondary" title="Archive" onclick="archiveSubmission('${s.id}')"><i class="fa-solid fa-box-archive"></i> Archive</button>` : ""}
            ${canUnarchiveSubmission(s) ? `<button class="btn btn-sm btn-primary" title="Unarchive" onclick="unarchiveSubmission('${s.id}')"><i class="fa-solid fa-box-open"></i> Unarchive</button>` : ""}
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
let adminCaseView = "active";
let adminCaseScope = "all";
let adminMarketplaceView = "active";
let adminRecordsTypeFilter = "All";
let announcementCategoryFilter = "All";
let securityKeyVisibility = {
  primary: false,
  backup: false,
};
let integrityFreezeUnlocked = false;
let unlockedCertifiedRecordId = null;
let unlockedCertifiedRecordType = null;
let certifiedDemoRecords = [
  {
    id: "PSU-PAT-2026-155",
    type: "Patent",
    title: "Bamboo-Based Water Filter",
    applicant: "Juan dela Cruz",
    department: "College of Engineering",
    status: "Approved",
    date: "2026-01-20",
    description: "Natural filtration system using bamboo charcoal for community-scale potable water support.",
  },
  {
    id: "PSU-PAT-2026-101",
    type: "Patent",
    title: "MarineTrack Autonomous Reef Monitoring Buoy",
    applicant: "Dr. Maria Santos",
    department: "College of Engineering",
    status: "Approved",
    date: "2026-02-18",
    description: "Autonomous buoy system for monitoring reef temperature, turbidity, and salinity.",
  },
  {
    id: "PSU-ID-2026-044",
    type: "Industrial Design",
    title: "Palawan Green Seal Product Label Layout",
    applicant: "PSU Innovation Office",
    department: "IPTTO",
    status: "Approved",
    date: "2026-02-07",
    description: "Protected product-label layout for PSU-supported sustainable products and services.",
  },
  {
    id: "PSU-COP-2026-087",
    type: "Copyright",
    title: "Mangrove Atlas of Southern Palawan",
    applicant: "Dr. Liza Manalo",
    department: "College of Sciences",
    status: "Approved",
    date: "2026-01-30",
    description: "Illustrated academic atlas documenting mangrove zones and conservation notes.",
  },
  {
    id: "PSU-UM-2026-032",
    type: "Utility Model",
    title: "Modular Bamboo Drying Rack",
    applicant: "Engr. Paolo Reyes",
    department: "College of Engineering",
    status: "Approved",
    date: "2026-01-16",
    description: "Collapsible bamboo rack designed for small-scale agricultural drying.",
  },
  {
    id: "PSU-ID-2026-018",
    type: "Industrial Design",
    title: "Ergonomic Fisherfolk Sorting Tray",
    applicant: "Prof. Ana Villanueva",
    department: "College of Arts",
    status: "Approved",
    date: "2026-01-04",
    description: "Ergonomic tray design for faster seafood sorting in coastal communities.",
  },
];

let chatMessages = [
  {
    id: 1,
    case_id: "PSU-PAT-2026-002",
    sender_id: 9,
    receiver_id: 3,
    sender_role: "applicant",
    message_text: "Good day, Engr. Tan. I uploaded the pest detector diagrams. Please let me know if you need a clearer copy.",
    attachment_url: "",
    attachment_type: "",
    attachment_name: "",
    attachment_size: 0,
    created_at: "2026-04-28T09:18:00+08:00",
    is_read: true,
  },
  {
    id: 2,
    case_id: "PSU-PAT-2026-002",
    sender_id: 3,
    receiver_id: 9,
    sender_role: "reviewer",
    message_text: "Thanks, Juan. Please send the latest sensor calibration sheet before I complete the technical review.",
    attachment_url: "",
    attachment_type: "",
    attachment_name: "",
    attachment_size: 0,
    created_at: "2026-04-28T10:05:00+08:00",
    is_read: false,
  },
  {
    id: 3,
    case_id: "PSU-COP-2026-002",
    sender_id: 9,
    receiver_id: 3,
    sender_role: "applicant",
    message_text: "Sharing the updated campus map screenshot for review.",
    attachment_url: "images/marinetrack_software.png",
    attachment_type: "image",
    attachment_name: "campus-map-preview.png",
    attachment_size: 428000,
    created_at: "2026-04-28T11:42:00+08:00",
    is_read: false,
  },
];
let chatDraftAttachments = {};
const CHAT_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
const CHAT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const CHAT_MAX_FILE_SIZE = 5 * 1024 * 1024;
let userFilterType = "All",
  userFilterStatus = "All",
  userSearchQuery = "",
  userPeriod = "All";

function filterAdminTable(type) {
  adminFilterType = type;
  refreshAdminTable();
}
function filterAdminStatus(status) {
  adminFilterStatus = status;
  refreshAdminTable();
}
function setAdminCaseView(view) {
  adminCaseView = view;
  if (view === "active" && adminFilterStatus === "Archived") {
    adminFilterStatus = "All";
  }
  if (view === "archived") {
    adminFilterStatus = "Archived";
  }
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

function filterUserTable(type) {
  userFilterType = type;
  refreshUserTable();
}
function filterUserStatus(status) {
  userFilterStatus = status;
  // Re-render the whole page to update tab active states and counts
  const mc = document.getElementById("main-content");
  if (mc) {
    mc.innerHTML = renderUserSubmissions();
    // After re-rendering, focus search input if it was active
    if (userSearchQuery) {
      const si = document.getElementById("userSearchInput");
      if (si) {
        si.value = userSearchQuery;
        si.focus();
      }
    }
  }
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

function takeCase(id) {
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return;
  const user = getCurrentUser();
  const normalizedRole = normalizeRole(currentRole);

  if (normalizedRole !== "reviewer") {
    showToast("Only specialists can take cases.");
    return;
  }

  if (!canTakeSubmission(sub)) {
    showToast(
      sub.assignedReviewerId
        ? `This case is already assigned to ${getAssignedReviewerName(sub)}.`
        : "You cannot take this case.",
    );
    navigateTo("admin-submissions");
    return;
  }

  sub.assignedReviewerId = user.id;
  sub.assignedEvaluatorId = user.id;
  sub.status = "Under Review";
  syncSubmissionWorkflowState(sub);
  
  addAuditLog({
    accountName: user.name,
    action: "Took Case",
    record: sub.id,
    details: `Specialist ${user.name} took the case for processing. Status updated to Under Review.`,
    module: sub.type,
  });

  showToast(`You have taken the case: ${sub.id}`);
  navigateTo("reviewer-my-cases");
}

function changeStatus(id, newStatus) {
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return;
  normalizeUnassignedSubmissionStatus(sub);
  if (!canAdvanceSubmission(sub)) {
    showToast(`${getRoleMeta().label} cannot advance this case.`);
    return;
  }

  if (newStatus !== "Pending" && !canLeavePendingStatus(sub)) {
    showToast(
      "This case must remain Pending until it is assigned or taken by a specialist.",
    );
    return;
  }

  // Specialist-specific restriction: Must take the case first
  const normalizedRole = normalizeRole(currentRole);
  if (normalizedRole === "reviewer" && !isAssignedReviewerSubmission(sub)) {
    showToast("You must 'Take' this case before you can update its status.");
    return;
  }

  const previousStatus = sub.status;
  sub.status = newStatus;
  if (newStatus === "Payment Requested") {
    sub.paymentRequested = true;
    sub.paymentVerified = false;
  } else if (newStatus === "Validated") {
    sub.paymentRequested = false;
  } else if (newStatus === "Approved") {
    sub.paymentRequested = false;
  }
  syncSubmissionWorkflowState(sub);
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Updated Review",
    record: sub.id,
    details: `Changed status from ${previousStatus} to ${newStatus}.`,
    module: sub.type,
  });
  showToast(`${sub.title} marked as ${newStatus}`);
  navigateTo(getDefaultDashboardPage());
}

function requestPayment(id) {
  changeStatus(id, "Payment Requested");
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
    sub.paymentRequested = false;
    syncSubmissionWorkflowState(sub);
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Requested Documents",
      record: sub.id,
      details: `Requested additional documents: ${missing}.`,
      module: sub.type,
    });
    showToast(`Request for "${missing}" sent to ${sub.applicant}`);
    navigateTo(getDefaultDashboardPage());
  }
}

function archiveSubmission(id) {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return;
  if (!canArchiveSubmission(submission)) {
    showToast(`${getRoleMeta().label} cannot archive cases.`);
    return;
  }
  const previousStatus = submission.status;
  submission.archivedFromStatus = previousStatus;
  submission.status = "Archived";
  syncSubmissionWorkflowState(submission);
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Archived Case",
    record: submission.id,
    details: `Archived ${submission.title}. Previous status: ${previousStatus}.`,
    module: submission.type,
  });
  showToast(`${submission.id} archived successfully.`);
  navigateTo(getDefaultDashboardPage());
}

function unarchiveSubmission(id) {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return;
  if (!canUnarchiveSubmission(submission)) {
    showToast(`${getRoleMeta().label} cannot unarchive cases.`);
    return;
  }
  const restoredStatus = getSubmissionRestoreStatus(submission);
  submission.status = restoredStatus;
  delete submission.archivedFromStatus;
  syncSubmissionWorkflowState(submission);
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Unarchived Case",
    record: submission.id,
    details: `Restored ${submission.title} to ${restoredStatus}.`,
    module: submission.type,
  });
  showToast(`${submission.id} unarchived successfully.`);
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

function resumeDraft(id) {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return;

  // Set global state for wizard
  wizardData = { ...submission };
  selectedSubmissionId = id;
  currentWizardStep = 1;

  // Determine form type
  let formPage = "patent-form";
  if (submission.type === "Copyright") formPage = "copyright-form";

  currentFormType = submission.type.toLowerCase();
  
  navigateTo(formPage);
}

const COPYRIGHT_OPERATION_FLOW = [
  {
    key: "author-submission",
    step: 1,
    title: "Author submits application to Technical Expert",
    owner: "Applicant",
    lane: "Author / Applicant",
    description:
      "Properly filled out application for Copyright, ISSN, ISBN, or ISMN together with other requirements of the National Library; and letter-request approved by the University President through the Quality Assurance Director for the registration of the intellectual property material and payment of basic fees to the National Library in the case of faculty or staff whose work is part of his/her regular official duties. (Other clients must pay basic fees and cost of courier).",
  },
  {
    key: "technical-review",
    step: 2,
    title:
      "Technical Expert receives and acknowledges submitted application from author",
    owner: "Evaluator",
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
    owner: "Applicant",
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
    owner: "Applicant",
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
    owner: "Applicant",
    lane: "Author / Applicant",
    description:
      "The author receives the Certificate of Registration from Admin Staff, completing the registration process.",
  },
];

const COPYRIGHT_TRACKING_GROUPS = [
  { label: "Submitted to Evaluator", keys: ["author-submission"] },
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

const PATENT_OPERATION_FLOW = [
  {
    key: "advisory-disclosure",
    step: 1,
    title: "Advisory Sheet and Disclosure form (to PSU)",
    owner: "Applicant",
    lane: "Applicant",
    description:
      "Applicant completes the Advisory Service Sheet and IP Disclosure Form for PSU intake.",
  },
  {
    key: "optional-documents",
    step: 2,
    title: "Optional Document to Upload",
    owner: "Applicant",
    lane: "Applicant",
    description:
      "Optional supporting files may be uploaded with the patent intake packet.",
    subitems: [
      "Technical Drawings / Diagrams (Accepted formats: PDF, DOCX, JPG, PNG)",
      "Abstract (Accepted formats: PDF, DOCX, JPG, PNG)",
      "Claims Statement (Accepted formats: PDF, DOCX, JPG, PNG)",
    ],
  },
  {
    key: "acknowledgement-application",
    step: 3,
    title: "Acknowledgement of Application (from PSU)",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description: "PSU acknowledges receipt of the patent intake packet.",
  },
  {
    key: "payment-slip-generated",
    step: 4,
    title:
      "Payment Slip Generated (Download) Payment Required: Outsider, Payment Situational: Insider",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description:
      "Payment slip is generated when payment is required for the applicant route.",
  },
  {
    key: "or-upload",
    step: 5,
    title: "OR Upload (Upload)",
    owner: "Applicant",
    lane: "Applicant",
    description: "Applicant uploads the official receipt.",
  },
  {
    key: "payment-ack-psu",
    step: 6,
    title: "Payment Acknowledgement (from PSU)",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description: "PSU acknowledges payment and receipt records.",
  },
  {
    key: "under-review",
    step: 7,
    title: "Status: Under review",
    owner: "Evaluator",
    lane: "PSU / IPTTO",
    description: "PSU reviews the patent intake packet.",
  },
  {
    key: "approved-for-drafting",
    step: 8,
    title: "Status: Approved",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description: "The patent packet is approved for drafting.",
  },
  {
    key: "application-drafting",
    step: 9,
    title: "Status: Application Drafting (From PSU to IPOPHL)",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description: "PSU prepares the formal patent application for IPOPHL.",
  },
  {
    key: "application-submitted",
    step: 10,
    title: "Status: Application Submitted (From PSU to IPOPHL)",
    owner: "PSU",
    lane: "PSU / IPTTO",
    description: "The prepared application is submitted to IPOPHL.",
  },
  {
    key: "ipophil-payment-slip",
    step: 11,
    title: "Payment Slip Generate (From IPOPHL website to agent to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / Agent / Inventor",
    description: "IPOPHL payment slip is generated and relayed to the inventor.",
  },
  {
    key: "eor-email",
    step: 12,
    title: "eOR email (IPOPHL emails PSU to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "Electronic official receipt email is relayed through PSU.",
  },
  {
    key: "ipophil-payment-ack",
    step: 13,
    title: "Payment Acknowledgement (From IPOPHL to PSU to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "IPOPHL acknowledges payment and PSU relays it to the inventor.",
  },
  {
    key: "filing-acknowledgement",
    step: 14,
    title: "Filing Acknowledgement (From IPOPHL to PSU to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "IPOPHL filing acknowledgement is relayed to the inventor.",
  },
  {
    key: "formality-report",
    step: 15,
    title: "Status: Formality Report received (IPOPHL to PSU to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "Formality report is received and reviewed for defects.",
    subitems: [
      "No defect (no action need)",
      "With defect (need to file a response: PSU to IPOPHL)",
    ],
  },
  {
    key: "publication",
    step: 16,
    title: "Status: Publication (IPOPHL publication at gazette, 18 months after filing)",
    owner: "IPOPHL",
    lane: "IPOPHL",
    description: "The application is published in the gazette 18 months after filing.",
  },
  {
    key: "substantial-examination-report",
    step: 17,
    title:
      "Status: Substantial Examination Report received (From IPOPHL to PSU to inventor)",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "Substantive examination report is received and reviewed.",
    subitems: [
      "No defect (no action need)",
      "With defect (need to file a response: PSU to IPOPHL)",
    ],
  },
  {
    key: "certificate-registration-withdrawal",
    step: 18,
    title: "Status: Certificate Registration or Withdrawal",
    owner: "IPOPHL",
    lane: "IPOPHL / PSU / Inventor",
    description: "The application reaches registration, certificate issuance, or withdrawal.",
  },
];

const IPOPHL_OPERATION_FLOW = [
  {
    key: "inventor-submission",
    step: 1,
    title: "Inventor submits application to Technical Expert",
    owner: "Applicant",
    lane: "Inventor / Applicant",
    description:
      "Submit a properly filled-out application for Patent, UM, ID, or together with other requirements of the IPOPHL, and a letter-request approved by the University President through the VP for R&D (if applicable).",
  },
  {
    key: "technical-review",
    step: 2,
    title: "Technical Expert reviews and acknowledges application",
    owner: "Evaluator",
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
    owner: "Applicant",
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
    owner: "Applicant",
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
    owner: "Applicant",
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

function isPatentSubmission(submission) {
  return (
    submission?.type === "Patent" ||
    submission?.type === "Utility Model" ||
    submission?.type === "Industrial Design"
  );
}

function getIPOPHLOperationFlow(submission) {
  return isPatentSubmission(submission)
    ? getPatentDisplayFlow(submission?.type)
    : IPOPHL_OPERATION_FLOW;
}

function normalizePatentStageKey(key) {
  const aliases = {
    "inventor-submission": "advisory-disclosure",
    "technical-review": "under-review",
    "mis-recording": "acknowledgement-application",
    "payment-slip-issued": "payment-slip-generated",
    "cashier-receipt": "or-upload",
    "receipt-submitted": "payment-ack-psu",
    "mis-forwarding": "application-drafting",
    "ip-director-action": "application-submitted",
    "certificate-received": "substantial-examination-report",
    "certificate-released": "certificate-registration-withdrawal",
  };
  return aliases[key] || key;
}

function getCopyrightStageKey(submission) {
  if (submission.copyrightStage) return submission.copyrightStage;
  if (submission.status === "Approved") return "certificate-released";
  if (submission.status === "Payment Requested") return "payment-slip-issued";
  if (submission.status === "Validated") return "ip-director-action";
  if (submission.status === "Under Review" || submission.status === "Awaiting Documents")
    return "technical-review";
  return "author-submission";
}

function getCopyrightStageIndex(submission) {
  const key = getCopyrightStageKey(submission);
  const idx = COPYRIGHT_OPERATION_FLOW.findIndex((step) => step.key === key);
  return idx < 0 ? 0 : idx;
}

function getPatentDisplayFlow(typeLabel = getPatentIntakeTypeLabel()) {
  if (typeLabel !== "Industrial Design") return PATENT_OPERATION_FLOW;

  return PATENT_OPERATION_FLOW.map((step) => {
    if (step.key === "advisory-disclosure") {
      return {
        ...step,
        title: "Advisory Sheet (to PSU)",
        description: "Applicant completes the Advisory Service Sheet for PSU intake.",
      };
    }
    if (step.key === "optional-documents") {
      return {
        ...step,
        title: "Required Drawings to Upload",
        description:
          "Applicant uploads the industrial design drawings as one PDF file or as individual JPEG files.",
        subitems: [
          "Figure 1 - Perspective View",
          "Figure 2 - Front View",
          "Figure 3 - Back View",
          "Figure 4 - Left Side View",
          "Figure 5 - Right Side View",
          "Figure 6 - Top View",
          "Figure 7 - Bottom View",
        ],
      };
    }
    return step;
  });
}

function syncSubmissionWorkflowState(submission) {
  normalizeUnassignedSubmissionStatus(submission);
  if (IPOPHL_TYPES.has(submission.type)) {
    syncIPOPHLWorkflowState(submission);
    return;
  }
  if (submission.type !== "Copyright") return;
  if (submission.status === "Approved") {
    submission.copyrightStage = "certificate-released";
    return;
  }
  if (
    submission.status === "Awaiting Documents" ||
    submission.status === "Under Review"
  ) {
    submission.copyrightStage = "technical-review";
    return;
  }
  if (submission.status === "Payment Requested") {
    submission.copyrightStage = "payment-slip-issued";
    return;
  }
  if (submission.status === "Validated") {
    submission.copyrightStage = "ip-director-action";
    return;
  }
  if (submission.status === "Pending") {
    submission.copyrightStage = "author-submission";
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

// ===== IPOPHL STAGE MANAGEMENT (Patent, Utility Model, Industrial Design) =====
function getIPOPHLStageKey(submission) {
  if (isPatentSubmission(submission)) {
    if (submission.ipophlStage) {
      return normalizePatentStageKey(submission.ipophlStage);
    }
    if (submission.status === "Approved") return "certificate-registration-withdrawal";
    if (submission.status === "Validated") return "application-submitted";
    if (submission.status === "Payment Requested") return "payment-slip-generated";
    if (submission.status === "Under Review" || submission.status === "Awaiting Documents")
      return "under-review";
    return "advisory-disclosure";
  }
  if (submission.ipophlStage) return submission.ipophlStage;
  if (submission.status === "Approved") return "certificate-released";
  if (submission.status === "Payment Requested") return "payment-slip-issued";
  if (submission.status === "Validated") return "ip-director-action";
  if (submission.status === "Under Review" || submission.status === "Awaiting Documents")
    return "technical-review";
  return "inventor-submission";
}

function getIPOPHLStageIndex(submission) {
  const key = getIPOPHLStageKey(submission);
  const idx = getIPOPHLOperationFlow(submission).findIndex((step) => step.key === key);
  return idx < 0 ? 0 : idx;
}

function syncIPOPHLWorkflowState(submission) {
  if (isPatentSubmission(submission)) {
    if (submission.status === "Approved") {
      submission.ipophlStage = "certificate-registration-withdrawal";
      return;
    }
    if (
      submission.status === "Awaiting Documents" ||
      submission.status === "Under Review"
    ) {
      submission.ipophlStage = "under-review";
      return;
    }
    if (submission.status === "Payment Requested") {
      submission.ipophlStage = "payment-slip-generated";
      return;
    }
    if (submission.status === "Validated") {
      submission.ipophlStage = "application-submitted";
      return;
    }
    if (submission.status === "Pending") {
      submission.ipophlStage = "advisory-disclosure";
    }
    return;
  }
  if (submission.status === "Approved") {
    submission.ipophlStage = "certificate-released";
    return;
  }
  if (
    submission.status === "Awaiting Documents" ||
    submission.status === "Under Review"
  ) {
    submission.ipophlStage = "technical-review";
    return;
  }
  if (submission.status === "Payment Requested") {
    submission.ipophlStage = "payment-slip-issued";
    return;
  }
  if (submission.status === "Validated") {
    submission.ipophlStage = "ip-director-action";
    return;
  }
  if (submission.status === "Pending") {
    submission.ipophlStage = "inventor-submission";
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
  if (submission.paymentExempt) {
    return {
      theme: "blue",
      icon: "fa-file-signature",
      title: "Fee-waived route recorded",
      detail:
        "An approved fee-waiver route is on file, so no applicant payment upload is needed for this case.",
      actionLabel: "",
    };
  }

  if (submission.paymentVerified === true) {
    return {
      theme: "green",
      icon: "fa-circle-check",
      title: "Payment verified",
      detail: `${submission.officialReceiptNumber || "Proof of payment"} has been verified for this application.`,
      actionLabel: "Verified",
    };
  }

  if (submission.paymentRequested === true && submission.paymentProofUploaded) {
    return {
      theme: "blue",
      icon: "fa-file-invoice-dollar",
      title: "Proof of payment uploaded",
      detail:
        "The applicant has uploaded proof of payment. Admin or Super Admin can now verify it.",
      actionLabel: "Verify Payment",
    };
  }

  if (submission.paymentRequested === true) {
    return {
      theme: "red",
      icon: "fa-receipt",
      title: "Payment requested",
      detail:
        "The evaluator requested payment. The applicant must upload proof of payment before verification can continue.",
      actionLabel: "",
    };
  }

  return {
    theme: "blue",
    icon: "fa-circle-info",
    title: "Payment not requested yet",
    detail:
      "Payment is not part of the initial submission. This field stays inactive until an evaluator requests payment.",
    actionLabel: "",
  };
}

function renderCopyrightOperationTimeline(submission) {
  const activeIdx = getCopyrightStageIndex(submission);
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";

  return `
    <div class="workflow-note">
      Evaluator = technical expert lane, PITBI Admin = Admin Staff / MIS lane, and Super Admin = IP Director approval authority inside this prototype.
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

function renderPatentFlowItem(step, idx, activeIdx, closed) {
  let state = "pending";
  if (closed) state = idx === 0 ? "completed" : "pending";
  else if (idx < activeIdx) state = "completed";
  else if (idx === activeIdx) state = "active";

  return `
    <div class="patent-flow-item ${state}">
      <span class="patent-flow-num">${step.step}.</span>
      <div class="patent-flow-copy">
        <div class="patent-flow-title">${escapeHtml(step.title)}</div>
        ${
          step.subitems?.length
            ? `<ul>${step.subitems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderPatentFlowItems(startStep, endStep, activeIdx, closed, flow = PATENT_OPERATION_FLOW) {
  return flow.filter(
    (step) => step.step >= startStep && step.step <= endStep,
  )
    .map((step) =>
      renderPatentFlowItem(
        step,
        flow.findIndex((entry) => entry.key === step.key),
        activeIdx,
        closed,
      ),
    )
    .join("");
}

function renderPatentProgressGroup(startStep, endStep, activeIdx, closed, flow = PATENT_OPERATION_FLOW) {
  return `
    <div class="patent-flow-progress-group">
      <div class="patent-flow-progress-label">Progress</div>
      <div class="patent-flow-progress-brace"></div>
      <div class="patent-flow-progress-items">
        ${renderPatentFlowItems(startStep, endStep, activeIdx, closed, flow)}
      </div>
    </div>
  `;
}

function renderPatentFlowReference({ submission = null, activeIndex = null } = {}) {
  const activeIdx =
    activeIndex !== null
      ? activeIndex
      : submission
        ? getIPOPHLStageIndex(submission)
        : 0;
  const closed =
    submission?.status === "Rejected" || submission?.status === "Archived";
  const heading = (submission?.type || getPatentIntakeTypeLabel()).toUpperCase();
  const flow = getPatentDisplayFlow(submission?.type || getPatentIntakeTypeLabel());

  return `
    <div class="patent-flow-paper">
      <h3>${escapeHtml(heading)}</h3>
      <div class="patent-flow-list">
        ${renderPatentFlowItems(1, 6, activeIdx, closed, flow)}
        ${renderPatentProgressGroup(7, 10, activeIdx, closed, flow)}
        ${renderPatentFlowItems(11, 14, activeIdx, closed, flow)}
        ${renderPatentProgressGroup(15, 18, activeIdx, closed, flow)}
      </div>
    </div>
  `;
}

function renderIPOPHLOperationTimeline(submission) {
  if (isPatentSubmission(submission)) {
    return renderPatentFlowReference({ submission });
  }

  const activeIdx = getIPOPHLStageIndex(submission);
  const closed =
    submission.status === "Rejected" || submission.status === "Archived";
  const feeWaived = submission.paymentExempt;

  return `
    <div class="workflow-note">
      Evaluator = Technical Expert lane, PITBI Admin = Admin Staff / MIS lane, and Super Admin = IP Director approval authority inside this prototype.
      ${feeWaived ? "<br><strong>Fee-waived route:</strong> Steps 4\u20136 are bypassed because an approved letter-request is on file." : ""}
    </div>
    <div class="copyright-flow-grid">
      ${getIPOPHLOperationFlow(submission).map((step, idx) => {
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
    showToast("Only Admin or Super Admin can verify payment.");
    return;
  }
  if (submission.paymentExempt) {
    showToast("This case uses a fee-waived route.");
    return;
  }

  if (submission.paymentVerified) {
    submission.paymentVerified = false;
    submission.paymentRequested = true;
    submission.status = "Payment Requested";
    submission.officialReceiptNumber = "Pending payment verification";
    showToast(`${submission.id} payment verification was reverted.`);
  } else {
    if (!submission.paymentProofUploaded) {
      showToast("No proof of payment has been uploaded yet.");
      return;
    }
    submission.paymentVerified = true;
    submission.paymentRequested = false;
    submission.status = "Validated";
    submission.officialReceiptNumber =
      submission.officialReceiptNumber &&
      !submission.officialReceiptNumber.includes("Pending")
        ? submission.officialReceiptNumber
        : "Official Receipt #2026-0404";
    showToast(`${submission.id} payment verified.`);
  }

  syncSubmissionWorkflowState(submission);
  navigateTo("submission-detail");
}

// ===== IP SEARCH PAGE =====
function renderIPSearchPage() {
  const normalizedRole = normalizeRole(currentRole);
  const results = (
    normalizedRole === "evaluator"
      ? getVisibleSubmissions(currentRole)
      : submissions
  )
    .filter(
      (item) => item.status === "Approved" || normalizedRole === "evaluator",
    )
    .slice(0, 5);
  return `
    <div class="page-header">
      <h1><i class="fa-solid fa-magnifying-glass"></i> Search</h1>
      <p>${normalizedRole === "evaluator" ? "Search assigned and approved records for manual review support." : "Search through approved PSU innovations and internal reference records."}</p>
    </div>
    <div class="detail-panel" style="margin-bottom:24px">
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <input type="text" placeholder="Search keywords, inventor name, or reference ID..." style="flex:1; padding:12px; border:1px solid var(--gray-200); border-radius:8px; outline:none;" />
        <button class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
      </div>
      <div style="display:flex; gap:20px; font-size:0.85rem; color:var(--gray-500);">
        <span><i class="fa-solid fa-sliders"></i> Filter:</span>
        <label><input type="checkbox" checked /> PSU Internal</label>
        <label><input type="checkbox" ${normalizedRole === "evaluator" ? "" : "checked"} /> IPOPHL Records</label>
        <label><input type="checkbox" /> Public Marketplace</label>
      </div>
    </div>
    <div class="table-container">
      <div class="table-header"><h3>Recent Results</h3></div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference</th><th>Type</th><th>Title</th><th>Status</th><th>Scope</th></tr></thead><tbody>
        ${results.map((item) => `<tr><td>${item.id}</td><td>${typeBadge(item.type)}</td><td>${item.title}</td><td>${statusBadge(item.status)}</td><td>${normalizedRole === "evaluator" ? "Assigned / Internal" : "Internal / Approved"}</td></tr>`).join("")}
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
  const certifiedMetadataEditable = frozen && canEditCertifiedRecords();
  const paymentVerified = s.paymentVerified === true;
  const formTypeKey = getFormTypeKeyFromSubmissionType(s.type);
  const requiredUploadedCount = getUploadedRequiredCount(formTypeKey, s);
  const requiredDocCount = getRequiredDocumentCount(formTypeKey);
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
    ? getIPOPHLOperationFlow(s).find((step) => step.key === getIPOPHLStageKey(s))
    : null;
  const assignedReviewer = getAssignedReviewer(s);
  const assignedReviewerName = assignedReviewer?.name || "Unassigned";
  const reviewerCanTake = canTakeSubmission(s);
  const reviewerCanAdvance = canAdvanceSubmission(s);
  const reviewerReadOnly =
    normalizeRole(currentRole) === "reviewer" && !reviewerCanAdvance;
  const archived = isSubmissionArchived(s);
  const showInternalOperationalFlow =
    normalizedRole === "superadmin" || normalizedRole === "admin";
  const showCopyrightOperationalFlow =
    showInternalOperationalFlow && s.type === "Copyright";
  const timelineTitle =
    normalizedRole === "reviewer"
      ? "Activity Timeline"
      : showCopyrightOperationalFlow
        ? "Copyright Operational Flow"
        : "Activity Timeline";

  return `
    ${renderBackNav()}
    <div class="page-header">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <h1 style="margin:0">${s.title}</h1>
        ${frozen ? `<span class="badge ${certifiedMetadataEditable ? "badge-review" : "badge-frozen"}"><i class="fa-solid fa-${certifiedMetadataEditable ? "unlock" : "lock"}"></i> ${certifiedMetadataEditable ? "Integrity Unlocked" : "Frozen for Certification"}</span>` : ""}
        ${renderCaseChatButton(s)}
      </div>
      <p style="margin-top:8px">Submission Detail - ${s.id} &bull; Filed ${s.date}</p>
    </div>

    ${
      s.status === "Cancelled" && s.cancellationReason
        ? `
      <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.2); border-radius:12px; padding:16px; margin-bottom:24px; display:flex; gap:16px; align-items:center;">
        <i class="fa-solid fa-circle-info" style="color:var(--red); font-size:1.5rem;"></i>
        <div>
          <div style="font-weight:700; color:var(--navy); font-size:0.9rem; margin-bottom:4px;">Cancellation Reason Provided:</div>
          <div style="color:var(--gray-600); font-size:0.85rem; font-style:italic;">"${s.cancellationReason}"</div>
        </div>
      </div>
    `
        : ""
    }

    ${
      frozen
        ? `<div style="padding:14px 20px; background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:12px; justify-content:space-between; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:12px;">
        <i class="fa-solid fa-${certifiedMetadataEditable ? "unlock" : "lock"}" style="color:#6366f1; font-size:1.2rem;"></i>
        <div><strong style="color:#4f46e5;">${certifiedMetadataEditable ? "Metadata Editing Enabled" : "Metadata Frozen"}</strong><p style="font-size:.85rem; color:var(--gray-500); margin:2px 0 0;">${certifiedMetadataEditable ? "The integrity layer is unlocked. Authorized admins can edit approved record metadata, and changes are audit logged." : "Per system policy, the core technical metadata of this approved submission has been locked and cannot be altered by administrators."}</p></div>
      </div>
      ${""}
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
          <h3><i class="fa-solid fa-paperclip"></i> ${normalizedRole === "applicant" ? "Documents" : "Documents & Payment"}</h3>
          <div style="padding:16px;background:var(--gray-50);border-radius:8px;margin-bottom:12px">
            <div style="font-size:0.76rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:10px;">Required Documents</div>
            <div style="font-size:0.9rem; font-weight:700; color:var(--navy); margin-bottom:12px;">${requiredUploadedCount} of ${requiredDocCount} required files uploaded</div>
            ${renderRequirementChecklistPanel(formTypeKey, { data: s, compact: true })}
          </div>
          <div class="detail-actions" style="margin-top:0; margin-bottom:12px;">
            ${canUploadDocuments(s) ? `<button class="btn btn-secondary btn-sm" onclick="showToast('Document upload slot opened for ${s.id}')"><i class="fa-solid fa-upload"></i> Upload Documents</button>` : ""}
            ${confidentialAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading confidential packet for ${s.id}')"><i class="fa-solid fa-download"></i> Download Confidential</button>` : ""}
            ${topSecretAccess === "allow" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Downloading top secret annex for ${s.id}')"><i class="fa-solid fa-shield-halved"></i> Download Top Secret</button>` : ""}
            ${topSecretAccess === "approval" ? `<button class="btn btn-outline-navy btn-sm" onclick="showToast('Top secret download for ${s.id} requires super admin approval.')"><i class="fa-solid fa-key"></i> Top Secret Approval</button>` : ""}
            
            ${
              normalizeRole(currentRole) === "applicant" &&
              (s.status === "Pending" || s.status === "Under Review" || s.status === "Validated" || s.status === "Payment Requested" || s.status === "Draft" || s.status === "Awaiting Documents")
                ? `<button class="btn btn-outline-danger btn-sm" onclick="handleCancelSubmission('${s.id}')">
                    <i class="fa-solid ${s.status === "Draft" ? "fa-trash-can" : "fa-ban"}"></i> 
                    ${s.status === "Draft" ? "Discard Draft" : "Cancel Application"}
                   </button>`
                : ""
            }
          </div>
          ${
            normalizedRole === "applicant" && s.paymentRequested && s.type !== "Copyright"
              ? `<div style="margin-bottom:12px;">${renderConditionalPaymentUploadPanel(s, {
                  inputId: `submission-payment-proof-${s.id}`,
                  onChange: `handleSubmissionPaymentProofUpload('${s.id}', this)`,
                })}</div>`
              : ""
          }
          <div style="padding:14px;background:${paymentStyles.bg};border:1px solid ${paymentStyles.border};border-radius:8px;display:flex;align-items:center;gap:10px">
            <i class="fa-solid ${paymentMeta.icon}" style="color:${paymentStyles.color};font-size:1.2rem"></i>
            <div><div style="font-weight:700;font-size:.9rem;color:${paymentStyles.color}">${paymentMeta.title}</div><div style="font-size:.8rem;color:var(--gray-400)">${paymentMeta.detail}</div></div>
            ${(normalizedRole === "admin" || normalizedRole === "superadmin") && paymentMeta.actionLabel ? `<button class="btn btn-sm btn-success" style="margin-left:auto" onclick="togglePaymentStatus('${s.id}')"><i class="fa-solid fa-${paymentVerified ? "rotate-left" : "check"}"></i> ${paymentMeta.actionLabel}</button>` : ""}
          </div>
        </div>
      </div>
      <div>
        <div class="detail-panel">
          <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
          <div style="margin-bottom:16px">${statusBadge(s.status)}</div>
          <div style="margin-bottom:16px; padding:14px 16px; background:${reviewerReadOnly ? "rgba(148,163,184,0.12)" : "rgba(59,130,246,0.06)"}; border:1px solid ${reviewerReadOnly ? "rgba(148,163,184,0.28)" : "rgba(59,130,246,0.18)"}; border-radius:10px;">
            <div style="font-size:.76rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:${reviewerReadOnly ? "var(--gray-500)" : "#1d4ed8"}; margin-bottom:6px;">Assignment</div>
            <div style="font-size:.95rem; font-weight:700; color:var(--navy);">${assignedReviewerName}</div>
            <div style="font-size:.8rem; color:var(--gray-500); margin-top:4px;">
              ${
                archived
                  ? "This case is archived and read-only."
                  : reviewerCanTake
                    ? "This case is currently unassigned. Take the case to unlock status actions."
                    : reviewerCanAdvance
                      ? "You are the assigned evaluator for this case."
                      : normalizeRole(currentRole) === "reviewer"
                        ? `Read-only view. Only ${assignedReviewerName} can update this case.`
                        : "Assignment and action state are shown here for traceability."
              }
            </div>
          </div>
          <div style="margin-bottom:16px; padding:16px; background:var(--gray-50); border:1px solid var(--gray-100); border-radius:10px;">
            ${renderApplicantStatusLegend(s.status)}
            <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--gray-100);">
              <a href="#" onclick="showPaymentGuideModal()" style="font-size:0.75rem; font-weight:700; color:var(--gold-dark); display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-map-location-dot"></i> View Payment Guide & Map
              </a>
            </div>
          </div>
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
            ipophlStageObj && normalizedRole !== "reviewer" && !showInternalOperationalFlow
              ? `<div style="padding:12px 14px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.18); border-radius:10px; margin-bottom:16px;">
            <div style="font-size:.78rem; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:.08em;">Current IPOPHL Step</div>
            <div style="font-size:.95rem; font-weight:700; color:var(--navy); margin-top:4px;">Step ${ipophlStageObj.step}: ${ipophlStageObj.title}</div>
            <div style="font-size:.8rem; color:var(--gray-500); margin-top:4px;">${ipophlStageObj.owner} - ${ipophlStageObj.lane}</div>
          </div>`
              : ""
          }
          ${
            reviewerCanAdvance && !frozen
              ? `
          <label class="form-group" style="margin-bottom:12px">
            <span style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px">Update Status</span>
            <select onchange="changeStatus('${s.id}', this.value)" style="width:100%">
              <option ${s.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${s.status === "Under Review" ? "selected" : ""}>Under Review</option>
              <option ${s.status === "Validated" ? "selected" : ""}>Validated</option>
              <option ${s.status === "Payment Requested" ? "selected" : ""}>Payment Requested</option>
              <option ${s.status === "Awaiting Documents" ? "selected" : ""}>Awaiting Documents</option>
              <option ${s.status === "Approved" ? "selected" : ""}>Approved</option>
              <option ${s.status === "Rejected" ? "selected" : ""}>Rejected</option>
              ${canArchiveSubmission(s) ? `<option ${s.status === "Archived" ? "selected" : ""}>Archived</option>` : ""}
            </select>
          </label>`
              : reviewerCanTake
                ? '<p style="font-size:.8rem;color:#1d4ed8;background:rgba(59,130,246,0.06);padding:10px;border-radius:6px;"><i class="fa-solid fa-hand-holding-hand"></i> Take this case to enable status updates.</p>'
              : frozen
                ? '<p style="font-size:.8rem;color:#6366f1;background:rgba(99,102,241,0.06);padding:10px;border-radius:6px;"><i class="fa-solid fa-lock"></i> Status changes are locked for certified submissions.</p>'
                : reviewerReadOnly
                  ? `<p style="font-size:.8rem;color:var(--gray-500);background:rgba(148,163,184,0.12);padding:10px;border-radius:6px;"><i class="fa-solid fa-eye"></i> Read-only mode. Only ${assignedReviewerName} can perform actions on this case.</p>`
                  : archived
                    ? '<p style="font-size:.8rem;color:var(--gray-500);background:rgba(148,163,184,0.12);padding:10px;border-radius:6px;"><i class="fa-solid fa-box-archive"></i> Archived cases are locked and remain view-only.</p>'
                    : ""
          }
          ${
            (reviewerCanAdvance || reviewerCanTake || canArchiveSubmission(s) || canUnarchiveSubmission(s)) && !frozen
              ? `<div class="detail-actions">
            ${
              reviewerCanTake
                ? `<button class="btn btn-primary btn-sm" onclick="takeCase('${s.id}')"><i class="fa-solid fa-hand-holding-hand"></i> Take Case</button>`
                : `
            ${canArchiveSubmission(s) ? `<button class="btn btn-secondary btn-sm" onclick="archiveSubmission('${s.id}')"><i class="fa-solid fa-box-archive"></i> Archive</button>` : ""}
            ${canUnarchiveSubmission(s) ? `<button class="btn btn-primary btn-sm" onclick="unarchiveSubmission('${s.id}')"><i class="fa-solid fa-box-open"></i> Unarchive</button>` : ""}
            `
            }
          </div>` 
              : ""
          }
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-comment"></i> Evaluator Notes</h3>
          <div class="admin-notes">
            <textarea placeholder="Add internal notes about this submission..." ${frozen || !canEditSubmission(s) ? "disabled" : ""}></textarea>
            ${!frozen && canEditSubmission(s) ? `<button class="btn btn-sm btn-primary" onclick="showToast('Notes saved')">Save Notes</button>` : ""}
          </div>
        </div>
        <div class="detail-panel" style="margin-top:20px">
          <h3><i class="fa-solid fa-timeline"></i> ${timelineTitle}</h3>
          ${
            normalizedRole === "reviewer"
              ? `<div class="timeline">
            ${s.status === "Approved" ? '<div class="timeline-item"><div class="time">Mar 29, 2026 - 11:00 AM</div><div class="event"><i class="fa-solid fa-lock" style="color:#6366f1"></i> Metadata frozen for certification</div></div>' : ""}
            <div class="timeline-item"><div class="time">Mar 27, 2026 - 2:32 PM</div><div class="event">Status changed to ${s.status} by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">Mar 26, 2026 - 9:45 AM</div><div class="event"><i class="fa-solid fa-receipt" style="color:var(--gold)"></i> Proof of payment verified</div></div>
            <div class="timeline-item"><div class="time">Mar 25, 2026 - 10:15 AM</div><div class="event">Documents reviewed by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">${s.date} - 9:00 AM</div><div class="event">Application submitted by ${s.applicant}</div></div>
          </div>`
              : showCopyrightOperationalFlow
              ? renderCopyrightOperationTimeline(s)
              : `<div class="timeline">
            ${s.status === "Approved" ? '<div class="timeline-item"><div class="time">Mar 29, 2026 - 11:00 AM</div><div class="event"><i class="fa-solid fa-lock" style="color:#6366f1"></i> Metadata frozen for certification</div></div>' : ""}
            <div class="timeline-item"><div class="time">Mar 27, 2026 - 2:32 PM</div><div class="event">Status changed to ${s.status} by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">Mar 26, 2026 - 9:45 AM</div><div class="event"><i class="fa-solid fa-receipt" style="color:var(--gold)"></i> Proof of payment verified</div></div>
            <div class="timeline-item"><div class="time">Mar 25, 2026 - 10:15 AM</div><div class="event">Documents reviewed by Admin Garcia</div></div>
            <div class="timeline-item"><div class="time">${s.date} - 9:00 AM</div><div class="event">Application submitted by ${s.applicant}</div></div>
          </div>`
          }
        </div>
      </div>
    </div>`;
}

function renderIpGuidelines(filterId = null) {
  let types = [
    {
      id: "patent",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      title: "Patent",
      subtitle: "Protect original inventions & technical breakthroughs",
      term: "20 years from filing date",
      requirements: [
        "Global Novelty — never before disclosed",
        "Inventive Step — non-obvious to experts",
        "Industrial Applicability — can be manufactured",
      ],
      process: [
        { n: 1, t: "Disclosure", d: "Document technical details and field of use." },
        { n: 2, t: "Verification", d: "IP Office checks for novelty and completeness." },
        { n: 3, t: "Drafting", d: "Prepare formal claims and technical drawings." },
        { n: 4, t: "Filing", d: "Submit the finalized packet for evaluator review." },
        { n: 5, t: "Endorsement", d: "IP Office forwards to IPOPHL for registration." }
      ],
      docs: [
        "Invention Disclosure Form (PSU-IPO-PAT-01)",
        "Technical Drawings / Schematics (PDF)",
        "Claims & Abstract Document",
        "Abstract and Claims Statement"
      ]
    },
    {
      id: "utility",
      icon: "fa-gears",
      color: "#6366f1",
      gradient: "linear-gradient(135deg,#6366f1,#4338ca)",
      title: "Utility Model",
      subtitle: "Rapid protection for practical innovations",
      term: "7 years (non-renewable)",
      requirements: [
        "Novelty — new to the world",
        "Industrial Applicability",
        "Lower 'Inventive Step' threshold than patents"
      ],
      process: [
        { n: 1, t: "Prototype", d: "Ensure the model is functional and documented." },
        { n: 2, t: "Drawings", d: "Prepare technical illustrations of the model." },
        { n: 3, t: "Application", d: "Fill form with specific use-case descriptions." },
        { n: 4, t: "Review", d: "IP Office verifies the novelty of the model." },
        { n: 5, t: "Submission", d: "Direct forwarding to IPOPHL registry." }
      ],
      docs: [
        "UM Application Form (PSU-IPO-UM-01)",
        "Technical Description of Utility",
        "Functional Drawings / Photos",
        "Claims Statement"
      ]
    },
    {
      id: "industrial",
      icon: "fa-pen-nib",
      color: "#ec4899",
      gradient: "linear-gradient(135deg,#ec4899,#be185d)",
      title: "Industrial Design",
      subtitle: "Safeguard the unique visual style of products",
      term: "5 years (renewable up to 15)",
      requirements: [
        "Ornamental Novelty — unique visual appeal",
        "Applied to a practical article",
        "Non-functional aesthetics only"
      ],
      process: [
        { n: 1, t: "Photography", d: "Capture high-res photos from 7 standard angles." },
        { n: 2, t: "Statement", d: "Describe the specific ornamental features." },
        { n: 3, t: "Checklist", d: "Finalize high-fidelity 3D renders or images." },
        { n: 4, t: "Submission", d: "Upload visual representations to the hub." },
        { n: 5, t: "Registration", d: "Verified design is sent for national protection." }
      ],
      docs: [
        "ID Application Form (PSU-IPO-ID-01)",
        "7-Angle Representation (Front, Back, Top, etc)",
        "Description of Ornamental Aspects",
        "Description of Design"
      ]
    },

    {
      id: "copyright",
      icon: "fa-copyright",
      color: "#10b981",
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      title: "Copyright",
      subtitle: "Protect creative works, code, and literature",
      term: "Lifetime + 50 years",
      requirements: [
        "Originality — must be your own creation",
        "Fixation in tangible form",
        "Creative expression (not just logic)"
      ],
      process: [
        { n: 1, t: "Finalization", d: "Ensure the work is complete in its final form." },
        { n: 2, t: "Compilation", d: "Prepare the 'Best Copy' of the work for filing." },
        { n: 3, t: "Review", d: "IP Office verifies author IDs and affiliations." },
        { n: 4, t: "Submission", d: "Send the filing packet for evaluator review and validation." },
        { n: 5, t: "Certified", d: "Forwarded to the National Library after validation and any requested payment." }
      ],
      docs: [
        "CR Registration Form (PSU-IPO-CR-01)",
        "Full Digital Copy of the Work",
        "Valid Philippine ID (Digitized)",
        "Complete Copy of the Work"
      ]
    }
  ];

  return `

    <div class="page-header" style="margin-bottom:36px">
      <span class="m-eyebrow" style="display:block; margin-bottom:12px;">Pre-Filing Intelligence</span>
      <h1 style="color:var(--navy); font-weight:800; font-size:2.2rem;"><i class="fa-solid fa-book-open" style="color:var(--gold);margin-right:12px"></i>${filterId ? types.find(t => t.id === filterId).title + ' Guidelines' : 'IP Application Guidelines'}</h1>
      <p style="color:var(--gray-500); font-size:1.05rem;">A comprehensive guide to Intellectual Property protection and filing procedures at Palawan State University.</p>
    </div>

    ${filterId ? `
      <div style="margin-bottom: 24px;">
        <button class="btn btn-outline btn-sm" onclick="navigateTo('guidelines')">
          <i class="fa-solid fa-arrow-left"></i> View All Guidelines
        </button>
      </div>
    ` : ''}

    <div style="background:linear-gradient(135deg, var(--navy-dark), var(--navy)); border-radius:24px; padding:32px 40px; margin-bottom:48px; color:white; position:relative; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.1);">
      <div style="position:absolute; top:-40px; right:-40px; width:200px; height:200px; background:rgba(255,127,80,0.1); border-radius:50%;"></div>
      <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px; color:var(--gold); display:flex; align-items:center; gap:10px;">
        <i class="fa-solid fa-shield-halved"></i> Institutional Protocol
      </h2>
      <ul style="color:rgba(255,255,255,0.85); font-size:0.92rem; line-height:1.8; padding-left:20px; list-style:none; margin-bottom:20px;">
        <li style="margin-bottom:8px;"><i class="fa-solid fa-circle-check" style="color:var(--gold); margin-right:10px;"></i> This system is a <strong>pre-filing optimization engine</strong>. Verified packets are forwarded to <strong>IPOPHL</strong> or the <strong>National Library</strong>.</li>
        <li style="margin-bottom:8px;"><i class="fa-solid fa-circle-check" style="color:var(--gold); margin-right:10px;"></i> Payment is <strong>conditional</strong> and only requested after evaluator review when needed.</li>
        <li><i class="fa-solid fa-circle-check" style="color:var(--gold); margin-right:10px;"></i> Review is performed <strong>manually</strong> by PSU IP Office specialists.</li>
      </ul>
    </div>

    <div style="display:flex; flex-direction:column; gap:32px; padding-bottom:80px;">
      ${(filterId ? types.filter(t => t.id === filterId) : types).map(t => `
        <div style="background:white; border-radius:24px; border:1px solid var(--gray-200); overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.03); transition:transform 0.3s ease;">
          <div style="background:${t.gradient}; padding:28px 36px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <div style="width:60px; height:60px; border-radius:18px; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; color:white; font-size:1.6rem;">
              <i class="fa-solid ${t.icon}"></i>
            </div>
            <div style="flex:1">
              <h3 style="color:white; font-size:1.4rem; font-weight:800; margin:0;">${t.title}</h3>
              <p style="color:rgba(255,255,255,0.85); font-size:0.9rem; margin:4px 0 0;">${t.subtitle}</p>
            </div>
            <div style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); padding:8px 18px; border-radius:50px; color:white; font-size:0.8rem; font-weight:700;">
              Protection: ${t.term}
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:0;">
            <div style="padding:32px; border-right:1px solid var(--gray-100);">
              <h4 style="font-size:0.85rem; font-weight:800; color:var(--navy); text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                <i class="fa-solid fa-clipboard-check" style="color:${t.color}"></i> Qualification
              </h4>
              <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:12px;">
                ${t.requirements.map(r => `
                  <li style="display:flex; gap:10px; font-size:0.9rem; color:var(--gray-700);">
                    <i class="fa-solid fa-circle" style="color:${t.color}; font-size:0.4rem; margin-top:8px;"></i> ${r}
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div style="padding:32px; border-right:1px solid var(--gray-100); background:rgba(250,250,250,0.5);">
              <h4 style="font-size:0.85rem; font-weight:800; color:var(--navy); text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                <i class="fa-solid fa-stairs" style="color:${t.color}"></i> Filing Procedure
              </h4>
              <div style="display:flex; flex-direction:column; gap:16px;">
                ${t.process.map(p => `
                  <div style="display:flex; gap:14px;">
                    <span style="width:24px; height:24px; border-radius:6px; background:${t.color}; color:white; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${p.n}</span>
                    <div>
                      <strong style="display:block; font-size:0.88rem; color:var(--navy);">${p.t}</strong>
                      <span style="font-size:0.82rem; color:var(--gray-500); line-height:1.4;">${p.d}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="padding:32px;">
              <h4 style="font-size:0.85rem; font-weight:800; color:var(--navy); text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                <i class="fa-solid fa-file-invoice" style="color:${t.color}"></i> Documentation
              </h4>
              <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
                ${t.docs.map(d => `
                  <div style="display:flex; align-items:center; gap:10px; font-size:0.88rem; color:var(--gray-600); background:var(--gray-50); padding:10px 14px; border-radius:10px; border:1px solid var(--gray-200);">
                    <i class="fa-solid fa-file-lines" style="color:${t.color}; font-size:0.9rem;"></i> ${d}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
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
  g.steps = FORM_GUIDE_STEPS[currentFormType] || g.steps;
  g.docs = getRequiredDocumentsForType(currentFormType);
  const requiredCount = getRequiredDocumentCount(currentFormType);
  return `<div class="form-guide-panel">
    <div class="form-guide-toggle" onclick="this.parentElement.classList.toggle('open')">
      <span><i class="fa-solid fa-${g.icon}" style="color:${g.color}"></i> <strong>${g.title}</strong> &mdash; Required documents & steps</span>
      <i class="fa-solid fa-chevron-down"></i>
    </div>
    <div class="form-guide-body">
      <div class="form-guide-cols">
        <div><h4><i class="fa-solid fa-list-ol"></i> Steps</h4><ol class="guide-steps-list">${g.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>
        <div><h4><i class="fa-solid fa-file-lines"></i> Required Documents</h4><ul class="guide-docs-list">${g.docs.map((doc, i) => `<li><i class="fa-solid fa-${i < requiredCount ? "check-circle" : "circle"}" style="color:${i < requiredCount ? "var(--green)" : "var(--gray-300)"};font-size:.8rem"></i> ${doc.name}</li>`).join("")}</ul></div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isPatentGoogleFlow() {
  return currentFormType === "patent" && submissionMethod === "online";
}

function isPatentIntakeFlow() {
  return (
    (currentFormType === "patent" ||
      currentFormType === "utility" ||
      currentFormType === "industrial") &&
    submissionMethod === "online"
  );
}

function isCopyrightGoogleFlow() {
  return currentFormType === "copyright" && submissionMethod === "online";
}

function isUtilityGoogleFlow() {
  return currentFormType === "utility" && submissionMethod === "online";
}

function isIndustrialGoogleFlow() {
  return currentFormType === "industrial" && submissionMethod === "online";
}

function isAdvancedGuidedFlow() {
  return (
    isPatentIntakeFlow() ||
    isCopyrightGoogleFlow() ||
    isUtilityGoogleFlow() ||
    isIndustrialGoogleFlow()
  );
}

function renderActiveGuidedForm(
  backTarget = "filing-hub",
  backLabel = "Filing Hub",
) {
  if (isPatentIntakeFlow()) {
    return renderPatentGoogleForm(backTarget, backLabel);
  }
  if (isCopyrightGoogleFlow()) {
    return renderCopyrightGoogleForm(backTarget, backLabel);
  }
  if (isUtilityGoogleFlow()) {
    return renderUtilityGoogleForm(backTarget, backLabel);
  }
  if (isIndustrialGoogleFlow()) {
    return renderIndustrialGoogleForm(backTarget, backLabel);
  }
  return "";
}

function getWizardArray(name) {
  return Array.isArray(wizardData[name]) ? wizardData[name] : [];
}

function getCheckedValuesByName(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`),
  ).map((input) => input.value);
}

function renderPatentChoice(name, value, label) {
  const checked = wizardData[name] === value ? "checked" : "";
  return `
    <label class="patent-choice">
      <input type="radio" name="${name}" value="${value}" ${checked} />
      <span>${label}</span>
    </label>
  `;
}

function renderCopyrightChoice(
  name,
  value,
  label,
  { multiple = false } = {},
) {
  const checked = multiple
    ? getWizardArray(name).includes(value)
    : wizardData[name] === value;
  return `
    <label class="patent-choice">
      <input type="${multiple ? "checkbox" : "radio"}" name="${name}" value="${value}" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}

const COPYRIGHT_CLASSIFICATION_GROUPS = {
  copyOrPhoto: {
    value: "copy-or-photo",
    label:
      "Electronic copy or photo of the work in JPG or PDF format. For 3-Dimensional objects, photographs of all sides of the work.",
  },
  performanceRecording: {
    value: "performance-recording",
    label:
      "Electronic copy of the music sheet, labanotation (for Class E), or audiovisual or sound recording, broadcast, or audiovisual recording in MP3, WAV, MPEG-4, AVI, or other prescribed formats.",
  },
  sourceCode: {
    value: "source-code-only",
    label:
      "Manually-coded source codes in PDF or text format only. A reasonable amount of redactions on submitted codes may be made to protect trade secrets. An executable copy of the computer program is not acceptable.",
  },
};

const COPYRIGHT_CLASSIFICATIONS = [
  { value: "A", label: "Class A - Books, writings", claimGroup: "copyOrPhoto" },
  { value: "B", label: "Class B - Periodicals/newspapers", claimGroup: "copyOrPhoto" },
  { value: "C", label: "Class C - Lectures/speeches", claimGroup: "copyOrPhoto" },
  { value: "D", label: "Class D - Letters/emails", claimGroup: "copyOrPhoto" },
  { value: "E", label: "Class E - Dramatic/choreographic works", claimGroup: "performanceRecording" },
  { value: "F", label: "Class F - Musical compositions", claimGroup: "performanceRecording" },
  { value: "G", label: "Class G - Artworks", claimGroup: "copyOrPhoto" },
  { value: "H", label: "Class H - Ornamental designs/applied art", claimGroup: "copyOrPhoto" },
  { value: "I", label: "Class I - Maps, plans, sketches", claimGroup: "copyOrPhoto" },
  { value: "J", label: "Class J - Scientific/technical drawings", claimGroup: "copyOrPhoto" },
  { value: "K", label: "Class K - Photographs", claimGroup: "copyOrPhoto" },
  { value: "L", label: "Class L - Audiovisual works", claimGroup: "performanceRecording" },
  { value: "M", label: "Class M - Advertisements/packaging designs", claimGroup: "copyOrPhoto" },
  { value: "N", label: "Class N - Computer programs", claimGroup: "sourceCode" },
  { value: "O", label: "Class O - Other literary/scientific/artistic works", claimGroup: "copyOrPhoto" },
  { value: "P", label: "Class P - Sound recordings", claimGroup: "performanceRecording" },
  { value: "Q", label: "Class Q - Broadcast recordings", claimGroup: "performanceRecording" },
  { value: "R", label: "Class R - Audiovisual performance", claimGroup: "performanceRecording" },
];

function getCopyrightClassificationMeta(value = wizardData.copyrightWorkClassification) {
  return COPYRIGHT_CLASSIFICATIONS.find((entry) => entry.value === value) || null;
}

function getCopyrightClassificationLabel(value = wizardData.copyrightWorkClassification) {
  return getCopyrightClassificationMeta(value)?.label || "";
}

function getCopyrightAuthorshipClaimOptionsForClassification(
  value = wizardData.copyrightWorkClassification,
) {
  const meta = getCopyrightClassificationMeta(value);
  if (!meta) return [];
  const claim = COPYRIGHT_CLASSIFICATION_GROUPS[meta.claimGroup];
  return claim ? [claim] : [];
}

function getCopyrightCopyWorkRequirementMeta(
  value = wizardData?.copyrightWorkClassification,
) {
  const meta = getCopyrightClassificationMeta(value);
  if (!meta) {
    return {
      description:
        "Select a Classification of Works above so the accepted copy-of-work format can be shown.",
      accept: ".pdf,.jpg,.jpeg,.png,.txt,.mp3,.wav,.mp4,.mpeg,.mpeg4,.avi,.mov",
      acceptLabel: "Select classification first",
      multiple: true,
    };
  }

  if (meta.claimGroup === "copyOrPhoto") {
    return {
      description:
        "Electronic copy or photo of the work in JPG or PDF format. For 3-Dimensional objects, upload photographs of all sides of the work.",
      accept: ".pdf,.jpg,.jpeg",
      acceptLabel: "JPG or PDF",
      multiple: true,
    };
  }

  if (meta.claimGroup === "performanceRecording") {
    return {
      description:
        "Electronic copy of the music sheet, labanotation (for Class E), or audiovisual, sound, broadcast, or audiovisual performance recording.",
      accept: ".pdf,.jpg,.jpeg,.mp3,.wav,.mp4,.mpeg,.mpeg4,.avi,.mov",
      acceptLabel: "PDF, JPG, MP3, WAV, MPEG-4, AVI",
      multiple: true,
    };
  }

  return {
    description:
      "Manually-coded source codes in PDF or text format only. Redactions may be made to protect trade secrets. Executable program files are not acceptable.",
    accept: ".pdf,.txt",
    acceptLabel: "PDF or TXT only",
    multiple: true,
  };
}

function renderCopyrightClassificationSelect() {
  const selected = wizardData.copyrightWorkClassification || "";
  const options = [
    `<option value="">Select classification</option>`,
    ...COPYRIGHT_CLASSIFICATIONS.map(
      (item) =>
        `<option value="${escapeHtml(item.value)}" ${selected === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`,
    ),
  ].join("");

  return renderPatentEditorFieldShell(
    "Classification of Works",
    `<select class="patent-editor-field__control patent-editor-field__control--select" id="copyright-work-classification" required onchange="captureWizardData(); refreshWizard()">${options}</select>`,
    true,
  );
}

function renderCopyrightClassificationGate() {
  const selectedLabel = getCopyrightClassificationLabel();
  const claimOptions = getCopyrightAuthorshipClaimOptionsForClassification();

  return `
    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Classification of Works</div>
          ${renderCopyrightClassificationSelect()}
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Related Authorship Claim</span>
            ${
              claimOptions.length
                ? `<div class="patent-choice-grid">${claimOptions
                    .map((claim) =>
                      renderCopyrightChoice("copyrightAuthorshipClaims", claim.value, claim.label, {
                        multiple: true,
                      }),
                    )
                    .join("")}</div>`
                : `<div class="patent-preview-note"><i class="fa-solid fa-circle-info"></i> Select a classification to show the related authorship claim.</div>`
            }
          </div>
          ${
            selectedLabel
              ? `<div class="patent-preview-note"><i class="fa-solid fa-tag"></i> Selected: ${escapeHtml(selectedLabel)}</div>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

function renderCopyrightAuthorshipClaimChoices() {
  const claimOptions = getCopyrightAuthorshipClaimOptionsForClassification();
  if (!claimOptions.length) {
    return `<div class="patent-preview-note"><i class="fa-solid fa-circle-info"></i> Select a classification of works first to show the related authorship claim.</div>`;
  }

  return `
    <div class="patent-choice-grid">
      ${claimOptions
        .map((claim) =>
          renderCopyrightChoice("copyrightAuthorshipClaims", claim.value, claim.label, {
            multiple: true,
          }),
        )
        .join("")}
    </div>
  `;
}

function getCopyrightSelectedAuthorshipClaimText() {
  const selectedClaims = getWizardArray("copyrightAuthorshipClaims");
  const claimOptions = getCopyrightAuthorshipClaimOptionsForClassification();
  const selectedText = claimOptions
    .filter((claim) => selectedClaims.includes(claim.value))
    .map((claim) => claim.label);
  return selectedText.join("; ");
}

function renderCopyrightPublicationIdentifierPreviewRows() {
  const type = wizardData.copyrightReferenceType || "";
  if (!type) return "";

  const typeLabel = getCopyrightReferenceTypeLabel(type);
  const referenceNoLabel = type === "other"
    ? wizardData.copyrightOtherReferenceType || "Reference Number"
    : `${typeLabel} Number`;
  const common =
    renderCopyrightOfficialField("Identifier Type", typeLabel) +
    renderCopyrightOfficialField(referenceNoLabel, wizardData.copyrightWorkReference);

  if (type === "isbn") {
    return renderCopyrightOfficialRow(
      common +
        renderCopyrightOfficialField("NBDB / ISBN Status", wizardData.copyrightIsbnStatus) +
        renderCopyrightOfficialField("NBDB Author / Publisher Name", wizardData.copyrightNbdbName),
      "copyright-grid--4",
    );
  }

  if (type === "issn") {
    return renderCopyrightOfficialRow(
      common +
        renderCopyrightOfficialField("ID / Company ID Reference", wizardData.copyrightIssnIdReference) +
        renderCopyrightOfficialField("Account Type", wizardData.applicantTypeGroup || "Individual"),
      "copyright-grid--4",
    );
  }

  if (type === "ismn") {
    return renderCopyrightOfficialRow(
      common +
        renderCopyrightOfficialField("Publisher Name to Use", wizardData.copyrightIsmnPublisherName) +
        renderCopyrightOfficialField("Publisher Name", wizardData.copyrightPublisherName),
      "copyright-grid--4",
    );
  }

  return renderCopyrightOfficialRow(
    common +
      renderCopyrightOfficialField("Reference Type", wizardData.copyrightOtherReferenceType) +
      renderCopyrightOfficialField("Notes", ""),
    "copyright-grid--4",
  );
}

function getCopyrightReferenceTypeLabel(value = wizardData.copyrightReferenceType) {
  const labels = {
    isbn: "ISBN",
    issn: "ISSN",
    ismn: "ISMN",
    other: "Other reference number",
  };
  return labels[value] || "No publication identifier";
}

function renderCopyrightReferenceGuidance() {
  const type = wizardData.copyrightReferenceType || "";
  if (type === "isbn") {
    return `
      <div class="patent-preview-note">
        <i class="fa-solid fa-book"></i>
        For first-time applicants, make sure you are registered with NBDB as an Author or Publisher. There is no need to register again if you previously obtained an ISBN.
      </div>
      <div class="patent-editor-inline-group">
        <span class="patent-editor-inline-group__label">NBDB / ISBN Status</span>
        <div class="patent-choice-grid patent-choice-grid--two">
          ${renderCopyrightChoice("copyrightIsbnStatus", "first-time", "First-time applicant")}
          ${renderCopyrightChoice("copyrightIsbnStatus", "previous-isbn", "Previously obtained an ISBN")}
        </div>
      </div>
      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorInput("NBDB Author / Publisher Name", "copyright-nbdb-name", wizardData.copyrightNbdbName, { placeholder: "Registered author or publisher name" })}
        ${renderPatentEditorInput("ISBN Number", "copyright-work-reference", wizardData.copyrightWorkReference, { placeholder: "If already issued" })}
      </div>
    `;
  }

  if (type === "issn") {
    const accountText =
      wizardData.applicantTypeGroup === "Institution"
        ? "For institutional accounts, prepare a company ID."
        : "For individual accounts, prepare a valid ID.";
    return `
      <div class="patent-preview-note">
        <i class="fa-solid fa-newspaper"></i>
        ISSN requirement: ${escapeHtml(accountText)}
      </div>
      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorInput("ISSN Number", "copyright-work-reference", wizardData.copyrightWorkReference, { placeholder: "If already issued" })}
        ${renderPatentEditorInput("ID / Company ID Reference", "copyright-issn-id-reference", wizardData.copyrightIssnIdReference, { placeholder: wizardData.applicantTypeGroup === "Institution" ? "Company ID reference" : "Valid ID reference" })}
      </div>
    `;
  }

  if (type === "ismn") {
    return `
      <div class="patent-preview-note">
        <i class="fa-solid fa-music"></i>
        ISMN requirement: supply only the name of the publisher you would like to use.
      </div>
      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorInput("Publisher Name to Use", "copyright-ismn-publisher-name", wizardData.copyrightIsmnPublisherName || wizardData.copyrightPublisherName, { placeholder: "Publisher name" })}
        ${renderPatentEditorInput("ISMN Number", "copyright-work-reference", wizardData.copyrightWorkReference, { placeholder: "If already issued" })}
      </div>
    `;
  }

  if (type === "other") {
    return `
      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorInput("Reference Type", "copyright-other-reference-type", wizardData.copyrightOtherReferenceType, { placeholder: "ISRC, ISWC, ISAN, etc." })}
        ${renderPatentEditorInput("Reference Number", "copyright-work-reference", wizardData.copyrightWorkReference, { placeholder: "Reference number" })}
      </div>
    `;
  }

  return `<div class="patent-preview-note"><i class="fa-solid fa-circle-info"></i> Select ISBN, ISSN, ISMN, or another reference type if the work already has a publication identifier.</div>`;
}

function renderCopyrightPublicationIdentifierSection() {
  const selectedType = wizardData.copyrightReferenceType || "";
  const referenceTypeOptions = [
    ["", "No identifier / Not applicable"],
    ["isbn", "ISBN"],
    ["issn", "ISSN"],
    ["ismn", "ISMN"],
    ["other", "Other reference number"],
  ]
    .map(
      ([value, label]) =>
        `<option value="${escapeHtml(value)}" ${selectedType === value ? "selected" : ""}>${escapeHtml(label)}</option>`,
    )
    .join("");

  return `
    <div class="patent-editor-section">
      <div class="patent-paper__section-title">Publication Identifier</div>
      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorFieldShell(
          "Identifier Type",
          `<select class="patent-editor-field__control patent-editor-field__control--select" id="copyright-reference-type" onchange="captureWizardData(); refreshWizard()">${referenceTypeOptions}</select>`,
        )}
        ${renderPatentEditorInput("Selected Identifier", "copyright-reference-type-display", getCopyrightReferenceTypeLabel(), { disabled: true })}
      </div>
      ${renderCopyrightReferenceGuidance()}
    </div>
  `;
}

function renderPatentCountryOptions(selectedValue) {
  const options = [
    "Philippines",
    "United States",
    "Japan",
    "Singapore",
    "Korea",
    "China",
    "Germany",
    "Australia",
  ];

  return [
    `<option value="" ${selectedValue ? "" : "selected"}>Select country</option>`,
    ...options.map(
      (option) =>
        `<option value="${option}" ${selectedValue === option ? "selected" : ""}>${option}</option>`,
    ),
  ]
    .join("");
}

function renderPatentEditorFieldShell(label, body, fullWidth = false) {
  const modifier = fullWidth ? " patent-editor-field--full" : "";
  return `
    <label class="patent-editor-field${modifier}">
      <span class="patent-editor-field__label">${label}</span>
      ${body}
    </label>
  `;
}

function renderPatentEditorInput(
  label,
  id,
  value,
  {
    type = "text",
    placeholder = "",
    fullWidth = false,
    disabled = false,
    required = false,
  } = {},
) {
  return renderPatentEditorFieldShell(
    label,
    `<input class="patent-editor-field__control" type="${type}" id="${id}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder)}" ${disabled ? "disabled" : ""} ${required ? "required" : ""} />`,
    fullWidth,
  );
}

function renderPatentEditorTextarea(
  label,
  id,
  value,
  { placeholder = "", fullWidth = false, required = false } = {},
) {
  return renderPatentEditorFieldShell(
    label,
    `<textarea class="patent-editor-field__control patent-editor-field__control--textarea" id="${id}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}>${escapeHtml(value || "")}</textarea>`,
    fullWidth,
  );
}

function renderPatentEditorSelect(
  label,
  id,
  value,
  options,
  { fullWidth = false, required = false } = {},
) {
  const optionMarkup = options
    .map(
      (option) =>
        `<option value="${escapeHtml(option.value)}" ${value === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
    )
    .join("");

  return renderPatentEditorFieldShell(
    label,
    `<select class="patent-editor-field__control patent-editor-field__control--select" id="${id}" ${required ? "required" : ""}>${optionMarkup}</select>`,
    fullWidth,
  );
}

function renderPatentEditorHeader(title, subtitle) {
  return `
    <div class="patent-editor-header">
      <div>
        <p class="patent-paper__eyebrow">Patent Application Request</p>
        <h2>${title}</h2>
        <p class="patent-paper__sub">${subtitle}</p>
      </div>
      <div class="patent-editor-office">
        ${renderPatentEditorInput("Application No.", "patent-office-app-no", "", { disabled: true })}
        ${renderPatentEditorInput("Date Received", "patent-office-date-received", "", { type: "text", disabled: true })}
        ${renderPatentEditorInput("Date Mailed", "patent-office-date-mailed", "", { type: "text", disabled: true })}
        ${renderPatentEditorInput("IPSO / ITSO Code", "patent-office-code", "", { disabled: true })}
      </div>
    </div>
  `;
}

function getPatentFormSteps() {
  if (currentFormType === "industrial") {
    return [
      "Advisory Sheet",
      "Required Drawings",
      "Preview & Submit",
    ];
  }

  return [
    "Advisory Sheet",
    "IP Disclosure",
    "Optional Documents",
    "Preview & Submit",
  ];
}

function getPatentIntakeTypeLabel() {
  if (currentFormType === "copyright") return "Copyright";
  if (currentFormType === "utility") return "Utility Model";
  if (currentFormType === "industrial") return "Industrial Design";
  return "Patent";
}

function getPatentIntakeServiceDefault() {
  if (currentFormType === "copyright") return "copyright";
  if (currentFormType === "utility") return "utility";
  if (currentFormType === "industrial") return "industrial";
  return "patent";
}

function getLockedAdvisoryServiceAvailed() {
  return [getPatentIntakeServiceDefault()];
}

function getLockedDisclosureFundingSource() {
  return ["psu-funded"];
}

function getPatentProgressPercent() {
  const stepsCount = getPatentFormSteps().length;
  const stepSize = 100 / stepsCount;
  return Math.max(stepSize, Math.min(100, currentWizardStep * stepSize));
}

function renderPatentGoogleForm(
  backTarget = "filing-hub",
  backLabel = "Filing Hub",
) {
  const steps = getPatentFormSteps();
  const activeStepTitle = steps[currentWizardStep - 1] || steps[0];
  const typeLabel = getPatentIntakeTypeLabel();
  const isIndustrial = currentFormType === "industrial";
  const heroCopy = isIndustrial
    ? "Complete the Advisory Service Sheet, upload the required industrial design drawings, then review the finished paper-style form before submission."
    : `Complete the Advisory Service Sheet and IP Disclosure Form first, attach optional ${typeLabel.toLowerCase()} documents, then review the finished paper-style forms before submission.`;
  const previewMeta = isIndustrial
    ? "Advisory and drawing previews"
    : "Advisory and disclosure previews";
  const finalButtonLabel = `Submit ${typeLabel} Intake`;

  return `
    ${renderBackNav(backTarget, backLabel)}
    <div class="patent-gform-shell">
      <div class="patent-gform-header">
        <div class="patent-gform-header-bar"></div>
        <div class="patent-gform-card patent-gform-card--hero">
          <span class="patent-gform-kicker">PSU ${typeLabel} Intake</span>
          <h1>${typeLabel} Fill-Up Forms</h1>
          <p>${heroCopy}</p>
          <div class="patent-gform-meta">
            <span><i class="fa-solid fa-file-lines"></i> ${steps.length} guided sections</span>
            <span><i class="fa-solid fa-table-cells-large"></i> ${previewMeta}</span>
            <span><i class="fa-solid fa-diagram-project"></i> 18-step ${typeLabel.toLowerCase()} progress map</span>
          </div>
        </div>
      </div>

      <div class="patent-gform-layout">
        <div class="patent-gform-main">
          <div class="patent-step-strip">
            ${steps
              .map(
                (step, index) => `
                  <div class="patent-step-chip ${index + 1 === currentWizardStep ? "active" : ""} ${index + 1 < currentWizardStep ? "done" : ""}">
                    <span class="patent-step-chip__num">${index + 1}</span>
                    <span class="patent-step-chip__label">${step}</span>
                  </div>
                `,
              )
              .join("")}
          </div>

          ${renderPatentGoogleStep()}

          <div class="patent-gform-actions">
            <div class="patent-gform-actions__left">
              ${
                currentWizardStep > 1
                  ? `<button class="btn btn-secondary" onclick="prevWizardStep()"><i class="fa-solid fa-arrow-left"></i> Previous</button>`
                  : ""
              }
            </div>
            <div class="patent-gform-actions__right">
              <button class="btn btn-outline-navy" onclick="saveFormDraft()"><i class="fa-solid fa-floppy-disk"></i> Save Draft</button>
              ${
                currentWizardStep < steps.length
                  ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next Section <i class="fa-solid fa-arrow-right"></i></button>`
                  : `<button class="btn btn-success" onclick="submitForm()">${finalButtonLabel} <i class="fa-solid fa-paper-plane"></i></button>`
              }
            </div>
          </div>
        </div>

        <aside class="patent-gform-sidebar">
          <div class="patent-gform-card">
            <span class="patent-gform-side-label">Current Section</span>
            <h3>${activeStepTitle}</h3>
            <div class="patent-progress-bar">
              <span style="width:${getPatentProgressPercent()}%"></span>
            </div>
            <p>Step ${currentWizardStep} of ${steps.length}. You can go back anytime and the final form preview will update.</p>
          </div>

          <div class="patent-gform-card">
            <span class="patent-gform-side-label">How This Works</span>
            <ul class="patent-gform-note-list">
              <li>The first form mirrors the PSU Advisory Service Sheet layout from your reference.</li>
              ${
                isIndustrial
                  ? `<li>Industrial design filings go from advisory intake directly to drawing uploads.</li>
                     <li>The required drawings can be submitted as one PDF or as individual JPEG views.</li>`
                  : `<li>The disclosure section follows the 2026 IP Disclosure Form fields.</li>
                     <li>Technical drawings, abstract, and claims remain optional uploads at intake.</li>`
              }
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderPatentGoogleStep() {
  if (currentWizardStep === 1) return renderPatentAdvisorySheetStep();
  if (currentFormType === "industrial") {
    if (currentWizardStep === 2) return renderPatentOptionalDocumentsStep();
    return renderPatentPreviewStep();
  }
  if (currentWizardStep === 2) return renderPatentDisclosureStep();
  if (currentWizardStep === 3) return renderPatentOptionalDocumentsStep();
  return renderPatentPreviewStep();
}

function getPatentTodayValue() {
  return new Date().toISOString().split("T")[0];
}

function getPatentUserNameParts() {
  const name = String(getCurrentUser().name || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  return {
    first: parts[0],
    middle: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    last: parts[parts.length - 1],
  };
}

function getPatentAdvisoryFullName() {
  return [
    wizardData.advisoryFirstName || wizardData.applicantFirstName,
    wizardData.advisoryMiddleName || wizardData.applicantMiddleName,
    wizardData.advisoryLastName || wizardData.applicantLastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function renderPatentCheckbox(name, value, label, { defaultChecked = false } = {}) {
  const selectedValues = getWizardArray(name);
  const checked =
    selectedValues.includes(value) || (!selectedValues.length && defaultChecked)
      ? "checked"
      : "";
  return `
    <label class="patent-choice patent-choice--check">
      <input type="checkbox" name="${name}" value="${value}" ${checked} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderLockedAdvisoryServiceChoice(value, label) {
  const checked = getPatentIntakeServiceDefault() === value;
  return `
    <label class="patent-choice patent-choice--check ${checked ? "checked" : ""}" aria-disabled="true">
      <input type="checkbox" name="advisoryServiceAvailed" value="${value}" ${checked ? "checked" : ""} disabled tabindex="-1" />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderLockedDisclosureFundingChoice(value, label) {
  const checked = value === "psu-funded";
  return `
    <label class="patent-choice patent-choice--check ${checked ? "checked" : ""}" aria-disabled="true">
      <input type="checkbox" name="disclosureFundingSource" value="${value}" ${checked ? "checked" : ""} disabled tabindex="-1" />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderPatentAdvisorySheetStep() {
  const typeLabel = getPatentIntakeTypeLabel();
  wizardData.advisoryServiceAvailed = getLockedAdvisoryServiceAvailed();

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 1 - Advisory Service Sheet</span>
      <h2>Fill Up the Advisory Service Sheet</h2>
      <p>This is the first PSU intake form in the ${typeLabel.toLowerCase()} process. The final preview will render it in the same table-style layout as the form reference.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Client Type</div>
          <div class="patent-choice-grid">
            ${renderPatentChoice("advisoryClientType", "individual", "Individual / Single Proprietor")}
            ${renderPatentChoice("advisoryClientType", "company", "Company / Corporation")}
            ${renderPatentChoice("advisoryClientType", "school", "School")}
            ${renderPatentChoice("advisoryClientType", "government", "Government")}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Client Information</div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Name of Company / Business / Government Agency / School", "advisory-company", wizardData.advisoryCompany || wizardData.applicantCompany || "", { placeholder: "Leave blank for individual clients" })}
            ${renderPatentEditorInput("Date", "advisory-date", wizardData.advisoryDate || "", { type: "date" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Position / Designation", "advisory-position", wizardData.advisoryPosition || wizardData.applicantPosition || "", { placeholder: "Position or designation" })}
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("advisorySex", "male", "Male")}
                ${renderPatentChoice("advisorySex", "female", "Female")}
              </div>
            </div>
            ${renderPatentEditorInput("Age", "advisory-age", wizardData.advisoryAge || "", { type: "number", placeholder: "Age" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Last Name", "advisory-last-name", wizardData.advisoryLastName || wizardData.applicantLastName || "", { placeholder: "Surname" })}
            ${renderPatentEditorInput("First Name", "advisory-first-name", wizardData.advisoryFirstName || wizardData.applicantFirstName || "", { placeholder: "Given name" })}
            ${renderPatentEditorInput("Middle Name", "advisory-middle-name", wizardData.advisoryMiddleName || wizardData.applicantMiddleName || "", { placeholder: "Optional" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "advisory-address", wizardData.advisoryAddress || wizardData.applicantAddress || "", { placeholder: "Complete address", fullWidth: true })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Contact No.", "advisory-contact", wizardData.advisoryContact || wizardData.applicantContact || wizardData.contact || "", { placeholder: "Mobile or landline" })}
            ${renderPatentEditorInput("Email Address", "advisory-email", wizardData.advisoryEmail || wizardData.applicantEmail || "", { type: "email", placeholder: "name@example.com" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Title of Material / Technology / Invention", "advisory-title", wizardData.advisoryTitle || wizardData.title || "", { placeholder: "Exact invention title", fullWidth: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Service Availed</div>
          <div class="patent-choice-grid">
            ${renderLockedAdvisoryServiceChoice("copyright", "Copyright / Related Rights")}
            ${renderLockedAdvisoryServiceChoice("patent", "Patent")}
            ${renderLockedAdvisoryServiceChoice("utility", "Utility Model")}
            ${renderLockedAdvisoryServiceChoice("industrial", "Industrial Design")}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Signature Names</div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Technical Advisor Name", "advisory-technical-advisor", wizardData.advisoryTechnicalAdvisor || "", { placeholder: "Optional, may be completed by PSU" })}
            ${renderPatentEditorInput("Client Printed Name", "advisory-client-signature", wizardData.advisoryClientSignature || "", { placeholder: "Name shown under client signature line" })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentDisclosureStep() {
  const disclosureDate = wizardData.disclosureDate || "";
  wizardData.disclosureFundingSource = getLockedDisclosureFundingSource();

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 2 - IP Disclosure Form</span>
      <h2>Fill Up the IP Disclosure Form</h2>
      <p>These fields follow the 2026 IP Disclosure Form: general information, technical disclosure, funding, prior disclosure, and ownership declaration.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">General Information</div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Name of Inventor(s)", "disclosure-inventors", wizardData.disclosureInventors || "", { placeholder: "List inventor names" })}
            ${renderPatentEditorInput("Job Title / Position", "disclosure-job-title", wizardData.disclosureJobTitle || "", { placeholder: "Job title or position" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("College / Unit / Department", "disclosure-college", wizardData.disclosureCollege || "", { placeholder: "College, unit, or department" })}
            ${renderPatentEditorInput("Contact Details", "disclosure-contact", wizardData.disclosureContact || "", { placeholder: "Phone and/or email" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Title of Invention", "disclosure-title", wizardData.disclosureTitle || "", { placeholder: "Exact invention title" })}
            ${renderPatentEditorInput("Date of Disclosure", "disclosure-date", disclosureDate, { type: "date" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Technical Disclosure</div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Background and Problem Statement", "disclosure-background", wizardData.disclosureBackground || "", { placeholder: "Describe the existing problem, limitation, or gap that led to this invention.", fullWidth: true })}
            ${renderPatentEditorTextarea("Description of the Intellectual Property", "disclosure-description", wizardData.disclosureDescription || "", { placeholder: "Provide a clear and complete description of the invention, its parts, and how it works.", fullWidth: true })}
            ${renderPatentEditorTextarea("Novel Features", "disclosure-novel-features", wizardData.disclosureNovelFeatures || "", { placeholder: "Identify what is original, new, and different from existing inventions.", fullWidth: true })}
            ${renderPatentEditorTextarea("Inventiveness and Advantages", "disclosure-advantages", wizardData.disclosureAdvantages || "", { placeholder: "Describe distinctive aspects and advantages over existing solutions.", fullWidth: true })}
            ${renderPatentEditorTextarea("Potential Applications and Uses", "disclosure-applications", wizardData.disclosureApplications || "", { placeholder: "State practical, commercial, or societal applications.", fullWidth: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Funding and University Resources</div>
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Was this IP developed using PSU resources?</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("disclosureUsedPsuResources", "yes", "Yes")}
              ${renderPatentChoice("disclosureUsedPsuResources", "no", "No")}
            </div>
          </div>
          <div class="patent-choice-grid">
            ${renderPatentCheckbox("disclosureResourcesUsed", "facilities", "University facilities")}
            ${renderPatentCheckbox("disclosureResourcesUsed", "research-funds", "Research funds")}
            ${renderPatentCheckbox("disclosureResourcesUsed", "equipment", "Equipment")}
            ${renderPatentCheckbox("disclosureResourcesUsed", "assistance", "Staff or student assistance")}
            ${renderPatentCheckbox("disclosureResourcesUsed", "others", "Others")}
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Other PSU Resource Details", "disclosure-resource-other", wizardData.disclosureResourceOther || "", { placeholder: "Specify other resources, if any", fullWidth: true })}
          </div>
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Source of Funding</span>
            <div class="patent-choice-grid">
              ${renderLockedDisclosureFundingChoice("psu-funded", "PSU-funded")}
              ${renderLockedDisclosureFundingChoice("externally-funded", "Externally funded")}
              ${renderLockedDisclosureFundingChoice("self-funded", "Self-funded")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("External Funding Details", "disclosure-external-funding", wizardData.disclosureExternalFunding || "", { placeholder: "Specify external funder, if applicable", fullWidth: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Prior Disclosure</div>
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Has any part of this IP been publicly disclosed?</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("disclosurePriorPublic", "no", "No")}
              ${renderPatentChoice("disclosurePriorPublic", "yes", "Yes")}
            </div>
          </div>
          <div class="patent-choice-grid">
            ${renderPatentCheckbox("disclosurePriorTypes", "thesis", "Thesis / Dissertation")}
            ${renderPatentCheckbox("disclosurePriorTypes", "conference", "Conference presentation")}
            ${renderPatentCheckbox("disclosurePriorTypes", "journal", "Journal publication")}
            ${renderPatentCheckbox("disclosurePriorTypes", "demonstration", "Demonstration / Exhibit")}
            ${renderPatentCheckbox("disclosurePriorTypes", "online", "Online posting")}
            ${renderPatentCheckbox("disclosurePriorTypes", "others", "Others")}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Other Prior Disclosure Details", "disclosure-prior-other", wizardData.disclosurePriorOther || "", { placeholder: "Specify other disclosure" })}
            ${renderPatentEditorInput("Date and Venue of Disclosure", "disclosure-prior-date-venue", wizardData.disclosurePriorDateVenue || "", { placeholder: "Date and venue, if applicable" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Ownership Declaration Signatories</div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Creator / Representative 1", "disclosure-creator-1", wizardData.disclosureCreator1 || "", { placeholder: "Name" })}
            ${renderPatentEditorInput("Creator / Representative 2", "disclosure-creator-2", wizardData.disclosureCreator2 || "", { placeholder: "Name" })}
            ${renderPatentEditorInput("Creator / Representative 3", "disclosure-creator-3", wizardData.disclosureCreator3 || "", { placeholder: "Name" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("IPTTO Representative", "disclosure-iptto-representative", wizardData.disclosureIpttoRepresentative || "", { placeholder: "For IPTTO use" })}
            ${renderPatentEditorInput("Head, TTPU", "disclosure-ttpu-head", wizardData.disclosureTtpuHead || "", { placeholder: "For noting" })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentOptionalDocumentsStep() {
  const uploads = ensureRequirementUploads(wizardData);
  const uploadedCount = Object.keys(uploads).length;
  const isIndustrial = currentFormType === "industrial";
  const formType = currentFormType === "industrial"
    ? "industrial"
    : currentFormType === "utility"
      ? "utility"
      : "patent";
  const typeLabel = getPatentIntakeTypeLabel();
  const stepNumber = currentWizardStep;
  const entries = getRequirementUploadEntries(formType);
  const sectionTitle = isIndustrial ? "Required Drawing Uploads" : "Optional Upload Checklist";
  const headerTitle = isIndustrial
    ? "Upload Required Industrial Design Drawings"
    : `Upload Optional ${typeLabel} Documents`;
  const headerCopy = isIndustrial
    ? "Submit the required design drawings either as one PDF file containing all views or as individual JPEG files."
    : "Your reference flow lists these as optional attachments. Accepted formats are PDF, DOCX, JPG, and PNG.";

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step ${stepNumber} - ${isIndustrial ? "Required Drawings" : "Optional Documents"}</span>
      <h2>${headerTitle}</h2>
      <p>${headerCopy}</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">${sectionTitle}</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:20px;">
            ${entries
              .map((entry) => {
                const uploaded = Boolean(uploads[entry.key]);
                const formats = entry.doc.acceptLabel || "PDF, DOCX, JPG, PNG";
                return `
                  <div class="patent-upload-pill ${uploaded ? "success" : ""}" style="align-items:flex-start;">
                    <i class="fa-solid fa-${uploaded ? "circle-check" : "file-arrow-up"}"></i>
                    <span>
                      <strong style="display:block; margin:0 0 4px; color:inherit;">${escapeHtml(entry.doc.name)}</strong>
                      <small style="color:var(--gray-500);">${escapeHtml(formats)}</small>
                    </span>
                  </div>
                `;
              })
              .join("")}
          </div>
          ${renderDynamicRequirementUploaders(formType)}
          <div id="uploadStatus" style="margin-top:20px;">
            ${uploadedCount > 0 ? renderUploadedFiles() : ""}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">Attachment Notes</div>
          ${renderPatentEditorTextarea("Notes for PSU / IPTTO", "patent-supporting-notes", wizardData.supportingNotes || "", { placeholder: "Optional notes about uploaded files or missing attachments.", fullWidth: true })}
        </div>
      </div>
    </div>
  `;
}

function renderPatentFilingDetailsStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 1</span>
      <h2>Filing Details</h2>
      <p>Fill the top block of Form 100. This section is editable and follows the order of the patent form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${renderPatentEditorHeader("FORM 100", "Editable filing block based on the patent request form. Office-use fields stay blank.")}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">1. Filing Details</div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Title of Invention", "patent-title", wizardData.title, { placeholder: "Enter the exact invention title used in Form 100", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Application Route</span>
            <div class="patent-choice-grid">
              ${renderPatentChoice("applicationRoute", "direct", "Direct")}
              ${renderPatentChoice("applicationRoute", "pct", "PCT")}
              ${renderPatentChoice("applicationRoute", "divisional", "Divisional")}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">With Claim of Priority</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("priorityClaim", "yes", "Yes")}
              ${renderPatentChoice("priorityClaim", "no", "No")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Parent Application No.", "patent-div-parent-no", wizardData.divisionalParentApplicationNo, { placeholder: "For divisional applications only" })}
            ${renderPatentEditorInput("Parent Filing Date", "patent-div-parent-date", wizardData.divisionalParentFilingDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Priority Number", "patent-priority-number", wizardData.priorityNumber, { placeholder: "If claiming priority, enter the number" })}
            ${renderPatentEditorInput("Priority Filing Date", "patent-priority-date", wizardData.priorityDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Priority Country", "patent-priority-country", wizardData.priorityCountry, { placeholder: "Country of the earlier filing" })}
            ${renderPatentEditorSelect(
              "Certified Copy Attached",
              "patent-priority-certified",
              wizardData.priorityCertifiedCopy || "",
            )}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Application No.", "patent-intl-app-no", wizardData.internationalAppNo, { placeholder: "Optional" })}
            ${renderPatentEditorInput("International Filing Date", "patent-intl-file-date", wizardData.internationalFileDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Publication No.", "patent-intl-pub-no", wizardData.internationalPublicationNo, { placeholder: "Optional" })}
            ${renderPatentEditorInput("International Publication Date", "patent-intl-pub-date", wizardData.internationalPublicationDate, { type: "date" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">2. Applicant Classification</div>
          <p class="patent-gform-section-copy">These boxes match the applicant-type and entity fields from the patent form.</p>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Applicant Type</span>
            <div class="patent-choice-grid">
              ${renderPatentChoice("applicantType", "individual", "Individual")}
              ${renderPatentChoice("applicantType", "company", "Company / Corporation")}
              ${renderPatentChoice("applicantType", "school", "School / University")}
              ${renderPatentChoice("applicantType", "government", "Government")}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Entity Status</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("entityStatus", "big", "Big Entity")}
              ${renderPatentChoice("entityStatus", "small", "Small Entity")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Company / Institution Name", "patent-app-company", wizardData.applicantCompany, { placeholder: "Use when filing as an organization or institution" })}
            ${renderPatentEditorInput("Position / Title", "patent-app-position", wizardData.applicantPosition, { placeholder: "Applicant's official position, if applicable" })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentApplicantInventorStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 2</span>
      <h2>Applicant and Inventor</h2>
      <p>Fill the applicant and inventor blocks exactly like the patent paper form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">3. Applicant Information</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Applicant Sex</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("applicantSex", "male", "Male")}
              ${renderPatentChoice("applicantSex", "female", "Female")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Last Name", "patent-app-last-name", wizardData.applicantLastName, { placeholder: "Surname" })}
            ${renderPatentEditorInput("First Name", "patent-app-first-name", wizardData.applicantFirstName, { placeholder: "Given name" })}
            ${renderPatentEditorInput("Middle Name", "patent-app-middle-name", wizardData.applicantMiddleName, { placeholder: "Optional" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "patent-app-address", wizardData.applicantAddress, { placeholder: "Street address or mailing address", fullWidth: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Town / City", "patent-app-town", wizardData.applicantTown, { placeholder: "City or municipality" })}
            ${renderPatentEditorInput("Province / State", "patent-app-province", wizardData.applicantProvince, { placeholder: "Province or state" })}
            ${renderPatentEditorInput("ZIP / Postal Code", "patent-app-zip", wizardData.applicantZip, { placeholder: "Postal code" })}
            ${renderPatentEditorSelect(
              "Country of Residence",
              "patent-app-country",
              wizardData.applicantCountry || "",
              [{ value: "", label: "Select country" }].concat(
                [
                  "Philippines",
                  "United States",
                  "Japan",
                  "Singapore",
                  "Korea",
                  "China",
                  "Germany",
                  "Australia",
                ].map((country) => ({ value: country, label: country })),
              ),
            )}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Contact Number", "patent-app-contact", wizardData.applicantContact, { placeholder: "Mobile or landline" })}
            ${renderPatentEditorInput("Email Address", "patent-app-email", wizardData.applicantEmail || "", { type: "email", placeholder: "name@example.com" })}
            ${renderPatentEditorInput("Nationality", "patent-app-nationality", wizardData.applicantNationality, { placeholder: "e.g. Filipino" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">4. Inventor Information</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Inventor Sex</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("inventorSex", "male", "Male")}
              ${renderPatentChoice("inventorSex", "female", "Female")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Last Name", "patent-inv-last-name", wizardData.inventorLastName, { placeholder: "Surname" })}
            ${renderPatentEditorInput("First Name", "patent-inv-first-name", wizardData.inventorFirstName, { placeholder: "Given name" })}
            ${renderPatentEditorInput("Middle Name", "patent-inv-middle-name", wizardData.inventorMiddleName, { placeholder: "Optional" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "patent-inv-address", wizardData.inventorAddress, { placeholder: "Street address or mailing address", fullWidth: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Town / City", "patent-inv-town", wizardData.inventorTown, { placeholder: "City or municipality" })}
            ${renderPatentEditorInput("Province / State", "patent-inv-province", wizardData.inventorProvince, { placeholder: "Province or state" })}
            ${renderPatentEditorInput("ZIP / Postal Code", "patent-inv-zip", wizardData.inventorZip, { placeholder: "Postal code" })}
            ${renderPatentEditorSelect(
              "Country of Residence",
              "patent-inv-country",
              wizardData.inventorCountry || "",
              [{ value: "", label: "Select country" }].concat(
                [
                  "Philippines",
                  "United States",
                  "Japan",
                  "Singapore",
                  "Korea",
                  "China",
                  "Germany",
                  "Australia",
                ].map((country) => ({ value: country, label: country })),
              ),
            )}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Contact Number", "patent-inv-contact", wizardData.inventorContact, { placeholder: "Mobile or landline" })}
            ${renderPatentEditorInput("Email Address", "patent-inv-email", wizardData.inventorEmail, { type: "email", placeholder: "name@example.com" })}
            ${renderPatentEditorInput("Nationality", "patent-inv-nationality", wizardData.inventorNationality, { placeholder: "e.g. Filipino" })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentRepresentativeUploadsStep() {
  const requiredCount = getRequiredDocumentCount("patent");
  const uploadedCount = getUploadedRequiredCount("patent");

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 3</span>
      <h2>Representative and Uploads</h2>
      <p>Fill the representative block if needed, then attach the filing packet that goes with the patent form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">5. Agent / Representative</div>
          <p class="patent-gform-section-copy">Leave this section blank if the applicant is filing without an agent.</p>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Registration No.", "patent-agent-no", wizardData.agentRegistrationNo, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Company / Office", "patent-agent-company", wizardData.agentCompany, { placeholder: "Law office or representative organization" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Position / Title", "patent-agent-position", wizardData.agentPosition, { placeholder: "Optional" })}
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("agentSex", "male", "Male")}
                ${renderPatentChoice("agentSex", "female", "Female")}
              </div>
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Last Name", "patent-agent-last-name", wizardData.agentLastName, { placeholder: "Surname" })}
            ${renderPatentEditorInput("First Name", "patent-agent-first-name", wizardData.agentFirstName, { placeholder: "Given name" })}
            ${renderPatentEditorInput("Middle Name", "patent-agent-middle-name", wizardData.agentMiddleName, { placeholder: "Optional" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "patent-agent-address", wizardData.agentAddress, { placeholder: "Street address or mailing address", fullWidth: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Town / City", "patent-agent-town", wizardData.agentTown, { placeholder: "City or municipality" })}
            ${renderPatentEditorInput("Province / State", "patent-agent-province", wizardData.agentProvince, { placeholder: "Province or state" })}
            ${renderPatentEditorInput("ZIP / Postal Code", "patent-agent-zip", wizardData.agentZip, { placeholder: "Postal code" })}
            ${renderPatentEditorSelect(
              "Country of Residence",
              "patent-agent-country",
              wizardData.agentCountry || "",
              [{ value: "", label: "Select country" }].concat(
                [
                  "Philippines",
                  "United States",
                  "Japan",
                  "Singapore",
                  "Korea",
                  "China",
                  "Germany",
                  "Australia",
                ].map((country) => ({ value: country, label: country })),
              ),
            )}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Contact Number", "patent-agent-contact", wizardData.agentContact, { placeholder: "Mobile or landline" })}
            ${renderPatentEditorInput("Email Address", "patent-agent-email", wizardData.agentEmail, { type: "email", placeholder: "name@example.com" })}
            ${renderPatentEditorInput("Nationality", "patent-agent-nationality", wizardData.agentNationality, { placeholder: "Optional" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">6. Filing Packet</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:20px;">
            <div style="padding:16px; background:var(--gray-50); border:1px solid var(--gray-100); border-radius:14px;">
              <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-400); margin-bottom:8px;">Required Uploads</div>
              <div style="font-size:1.7rem; font-weight:800; color:var(--navy);">${uploadedCount}/${requiredCount}</div>
              <div style="font-size:0.8rem; color:var(--gray-500); margin-top:6px;">Patent requirement files uploaded</div>
            </div>
            <div style="padding:16px; background:var(--gray-50); border:1px solid var(--gray-100); border-radius:14px;">
              <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-400); margin-bottom:8px;">Payment Status</div>
              <div style="font-size:1rem; font-weight:800; color:var(--navy);">${wizardData.paymentRequested ? "Payment Requested" : "Not Requested"}</div>
              <div style="font-size:0.8rem; color:var(--gray-500); margin-top:6px;">Validation happens before any payment request</div>
            </div>
          </div>

          <div style="margin-bottom:20px;">
            ${renderRequirementChecklistPanel("patent")}
          </div>

          <div style="margin-bottom:20px;">
            ${renderDynamicRequirementUploaders("patent")}
          </div>

          <div id="uploadStatus" style="margin-top:20px;">
            ${renderUploadedFiles()}
          </div>

          <div style="margin-top:20px;">
            ${renderConditionalPaymentUploadPanel(wizardData, {
              inputId: "patent-deposit-input",
              onChange: "handleDepositUpload(this)",
            })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two" style="margin-top:20px;">
            ${renderPatentEditorInput("Number of Drawings", "patent-drawings-count", wizardData.drawingsCount, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Number of Claims", "patent-claims-count", wizardData.claimsCount, { placeholder: "Optional" })}
          </div>

        <div class="patent-editor-grid patent-editor-grid--one">
          ${renderPatentEditorTextarea("Notes for the Filing Packet", "patent-supporting-notes", wizardData.supportingNotes, { placeholder: "Optional internal notes or attachment remarks...", fullWidth: true })}
        </div>
      </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">7. Additional Declarations</div>
          <p class="patent-gform-section-copy">These answers populate the second page of the final Form 100 preview.</p>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Figure Number Suggested for Abstract Publication", "patent-figure-number", wizardData.figureNumber, { placeholder: "Optional" })}
            ${renderPatentEditorInput(
              "Signature Over Printed Name",
              "patent-signature-name",
              wizardData.signaturePrintedName || "",
              { placeholder: "Printed name for the declaration block" },
            )}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Certificate Delivery Preference</span>
            <div class="patent-choice-grid">
              ${renderPatentChoice("certificateDelivery", "pickup", "Pickup at IPOPHL")}
              ${renderPatentChoice("certificateDelivery", "applicant-mail", "Mail to Applicant")}
              ${renderPatentChoice("certificateDelivery", "agent-mail", "Mail to Agent / Representative")}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Biological Materials / Genetic Resources</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("biologicalMaterial", "yes", "Yes")}
              ${renderPatentChoice("biologicalMaterial", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Nature / Source of Origin", "patent-bio-details", wizardData.biologicalMaterialDetails, { placeholder: "If yes, specify the nature and source of origin of the biological materials or genetic resources.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Traditional Knowledge</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("traditionalKnowledge", "yes", "Yes")}
              ${renderPatentChoice("traditionalKnowledge", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Traditional Knowledge Details", "patent-traditional-details", wizardData.traditionalKnowledgeDetails, { placeholder: "If yes, specify the nature and source or origin of the traditional knowledge.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Indigenous Knowledge Systems and Practices</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("indigenousKnowledge", "yes", "Yes")}
              ${renderPatentChoice("indigenousKnowledge", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Indigenous Knowledge Details", "patent-indigenous-details", wizardData.indigenousKnowledgeDetails, { placeholder: "If yes, describe the indigenous knowledge systems and practices involved.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Privacy Statement</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("privacyAgreement", "agree", "Agree")}
              ${renderPatentChoice("privacyAgreement", "disagree", "Disagree")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentPaperField(label, value, fullWidth = false) {
  const modifier = fullWidth ? " patent-paper-field--full" : "";
  return `
    <div class="patent-paper-field${modifier}">
      <span class="patent-paper-field__label">${label}</span>
      <span class="patent-paper-field__value">${escapeHtml(value || " ")}</span>
    </div>
  `;
}

function formatPatentOfficialDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.replace(/-/g, "/");
  }
  return value;
}

function buildPatentIdentityKey(parts) {
  return (parts || [])
    .map((part) => String(part || "").trim().toLowerCase())
    .filter(Boolean)
    .join("|");
}

function renderPatentOfficialSectionBar(title, note = "") {
  return `
    <div class="patent-official-section-bar">
      <span>${escapeHtml(title)}</span>
      ${note ? `<span class="patent-official-section-bar__note">${escapeHtml(note)}</span>` : ""}
    </div>
  `;
}

function renderPatentOfficialMark(label, checked, { round = false } = {}) {
  return `
    <span class="patent-official-mark ${checked ? "checked" : ""} ${round ? "patent-official-mark--round" : ""}">
      <span class="patent-official-mark__box"></span>
      <span>${escapeHtml(label)}</span>
    </span>
  `;
}

function renderPatentOfficialCell(
  label,
  value,
  { span = 1, raw = false, cellClass = "", valueClass = "" } = {},
) {
  const spanClass = span > 1 ? ` patent-official-cell--span-${span}` : "";
  const output = raw ? value : escapeHtml(value || " ");
  return `
    <div class="patent-official-cell${spanClass}${cellClass ? ` ${cellClass}` : ""}">
      <div class="patent-official-cell__label">${escapeHtml(label)}</div>
      <div class="patent-official-cell__value${valueClass ? ` ${valueClass}` : ""}">${output || "&nbsp;"}</div>
    </div>
  `;
}

function renderPatentOfficialOfficeRow(label, value) {
  return `
    <div class="patent-official-office-row">
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(value || " ")}</span>
    </div>
  `;
}

function renderPatentSubmissionList() {
  const files = wizardData.files || [];
  const items = [];

  if (files.length) {
    items.push(...files.map((file) => `Attachment: ${file.name}`));
  }

  if (getPaymentProofFile(wizardData)?.name) {
    items.push(`Proof of payment: ${getPaymentProofFile(wizardData).name}`);
  } else if (wizardData.paymentRequested) {
    items.push("Proof of payment: awaiting applicant upload");
  }

  if (wizardData.drawingsCount) {
    items.push(`Drawings count: ${wizardData.drawingsCount}`);
  }

  if (wizardData.claimsCount) {
    items.push(`Claims count: ${wizardData.claimsCount}`);
  }

  if (!items.length) {
    return `<div class="patent-preview-note"><i class="fa-solid fa-circle-info"></i> No attachments were listed in this preview yet.</div>`;
  }

  return `
    <ul class="patent-preview-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function formatPatentHumanDate(value) {
  if (!value) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderPsuPaperValue(value, { multiline = false } = {}) {
  const text = escapeHtml(value || " ");
  return `<div class="psu-paper-value ${multiline ? "psu-paper-value--multi" : ""}">${text}</div>`;
}

function renderPsuCheck(label, checked) {
  return `
    <span class="psu-paper-check ${checked ? "checked" : ""}">
      <span class="psu-paper-check__box"></span>
      <span>${escapeHtml(label)}</span>
    </span>
  `;
}

function getPatentSelectedValues(name, fallback = []) {
  const values = getWizardArray(name);
  return values.length ? values : fallback;
}

function renderPatentAdvisoryServiceSheetPaper() {
  const clientType = wizardData.advisoryClientType || "";
  const sex = wizardData.advisorySex || "";
  const serviceValues = getLockedAdvisoryServiceAvailed();
  const hasService = (value) => serviceValues.includes(value);
  const company =
    wizardData.advisoryCompany || wizardData.applicantCompany || "";
  const title =
    wizardData.advisoryTitle || wizardData.disclosureTitle || wizardData.title || "";
  const clientSignature = wizardData.advisoryClientSignature || "";

  return `
    <div class="psu-form-paper psu-advisory-paper">
      <div class="psu-advisory-head">
        <div class="psu-advisory-logo-cell">
          <img src="images/psu_logo_main.png" alt="Palawan State University logo" />
        </div>
        <div class="psu-advisory-title-cell">
          <div class="psu-advisory-title">ADVISORY SERVICE SHEET</div>
          <div class="psu-advisory-office">Intellectual Property and Technology Transfer Office</div>
          <div class="psu-advisory-sub">(An IPOPHL-accredited ITSO)</div>
        </div>
        <div class="psu-advisory-meta">
          <div><span>Doc. Ref No.:</span><strong>PSU-ITSO-001</strong></div>
          <div><span>Effectivity Date:</span><strong>14 May 2024</strong></div>
          <div><span>Revision No.:</span><strong>0</strong></div>
          <div><span>Page No.:</span><strong>Page 1 of 1</strong></div>
        </div>
      </div>

      <div class="psu-form-redbar"></div>
      <div class="psu-advisory-row psu-advisory-row--client">
        <strong>Client type</strong>
        ${renderPsuCheck("Individual/Single Proprietor", clientType === "individual")}
        ${renderPsuCheck("Company/Corporation", clientType === "company")}
        ${renderPsuCheck("School", clientType === "school")}
        ${renderPsuCheck("Government", clientType === "government")}
      </div>
      <div class="psu-advisory-grid psu-advisory-grid--company">
        <div>
          <span>Name of the Company/Business/Government Agency/School</span>
          ${renderPsuPaperValue(company)}
        </div>
        <div>
          <span>Date</span>
          ${renderPsuPaperValue(formatPatentHumanDate(wizardData.advisoryDate))}
        </div>
      </div>
      <div class="psu-advisory-grid psu-advisory-grid--position">
        <div>
          <span>Position/Designation</span>
          ${renderPsuPaperValue(wizardData.advisoryPosition)}
        </div>
        <div>
          <div class="psu-advisory-inline-head">
            <span>SEX</span>
            <span>AGE</span>
          </div>
          <div class="psu-paper-inline">
            ${renderPsuCheck("Male", sex === "male")}
            ${renderPsuCheck("Female", sex === "female")}
            ${renderPsuPaperValue(wizardData.advisoryAge)}
          </div>
        </div>
      </div>
      <div class="psu-advisory-grid psu-advisory-grid--names">
        <div><span>Last Name</span>${renderPsuPaperValue(wizardData.advisoryLastName)}</div>
        <div><span>First Name</span>${renderPsuPaperValue(wizardData.advisoryFirstName)}</div>
        <div><span>Middle Name</span>${renderPsuPaperValue(wizardData.advisoryMiddleName)}</div>
      </div>
      <div class="psu-advisory-full">
        <span>Address</span>
        ${renderPsuPaperValue(wizardData.advisoryAddress)}
      </div>
      <div class="psu-advisory-grid psu-advisory-grid--contact">
        <div><span>Contact No.</span>${renderPsuPaperValue(wizardData.advisoryContact)}</div>
        <div><span>Email Address</span>${renderPsuPaperValue(wizardData.advisoryEmail)}</div>
      </div>
      <div class="psu-advisory-title-line">
        <span>Title of Material/Technology/Invention</span>
        ${renderPsuPaperValue(title)}
      </div>
      <div class="psu-advisory-services">
        <strong>Service Availed</strong>
        <div class="psu-advisory-service-grid">
          ${renderPsuCheck("Copyright/Related Rights", hasService("copyright"))}
          ${renderPsuCheck("Patent", hasService("patent"))}
          ${renderPsuCheck("Utility Model", hasService("utility"))}
          ${renderPsuCheck("Industrial Design", hasService("industrial"))}
        </div>
      </div>

      <div class="psu-advisory-signatures">
        <div>
          <div class="psu-sign-line">${escapeHtml(wizardData.advisoryTechnicalAdvisor || " ")}</div>
          <span>(Name and Signature of Technical Advisor)</span>
        </div>
        <div>
          <div class="psu-sign-line">${escapeHtml(clientSignature || " ")}</div>
          <span>(Name and Signature of Client)</span>
        </div>
      </div>
    </div>
  `;
}

function renderPatentDisclosureSection(title, value) {
  return `
    <div class="psu-disclosure-section">
      <div class="psu-disclosure-section-title">${escapeHtml(title)}</div>
      ${renderPsuPaperValue(value, { multiline: true })}
    </div>
  `;
}

function renderPatentDisclosureFormPaper() {
  const resources = getPatentSelectedValues("disclosureResourcesUsed");
  const funding = getLockedDisclosureFundingSource();
  const priorTypes = getPatentSelectedValues("disclosurePriorTypes");
  const hasResource = (value) => resources.includes(value);
  const hasFunding = (value) => funding.includes(value);
  const hasPriorType = (value) => priorTypes.includes(value);
  const disclosureTitle =
    wizardData.disclosureTitle || wizardData.advisoryTitle || wizardData.title || "";

  return `
    <div class="psu-form-paper psu-disclosure-paper">
      <div class="psu-disclosure-head">
        <img src="images/psu_logo_main.png" alt="Palawan State University logo" />
        <div>
          <div class="psu-disclosure-kicker">Palawan State University</div>
          <h2>IP Disclosure Form 2026</h2>
          <p>Intellectual Property and Technology Transfer Office</p>
        </div>
      </div>

      <div class="psu-disclosure-section">
        <div class="psu-disclosure-section-title">GENERAL INFORMATION</div>
        <div class="psu-disclosure-grid">
          <div><span>Name of inventor(s):</span>${renderPsuPaperValue(wizardData.disclosureInventors)}</div>
          <div><span>Job Title / Position:</span>${renderPsuPaperValue(wizardData.disclosureJobTitle)}</div>
          <div><span>College / Unit / Department:</span>${renderPsuPaperValue(wizardData.disclosureCollege)}</div>
          <div><span>Contact details:</span>${renderPsuPaperValue(wizardData.disclosureContact)}</div>
          <div><span>Title of invention:</span>${renderPsuPaperValue(disclosureTitle)}</div>
          <div><span>Date of disclosure:</span>${renderPsuPaperValue(formatPatentHumanDate(wizardData.disclosureDate))}</div>
        </div>
      </div>

      ${renderPatentDisclosureSection("BACKGROUND AND PROBLEM STATEMENT", wizardData.disclosureBackground)}
      ${renderPatentDisclosureSection("DESCRIPTION OF THE INTELLECTUAL PROPERTY", wizardData.disclosureDescription)}
      ${renderPatentDisclosureSection("NOVEL FEATURES", wizardData.disclosureNovelFeatures)}
      ${renderPatentDisclosureSection("INVENTIVENESS AND ADVANTAGES", wizardData.disclosureAdvantages)}
      ${renderPatentDisclosureSection("POTENTIAL APPLICATIONS AND USES", wizardData.disclosureApplications)}

      <div class="psu-disclosure-section">
        <div class="psu-disclosure-section-title">FUNDING AND USE OF UNIVERSITY RESOURCES</div>
        <div class="psu-paper-choice-line">
          <span>Was this IP developed using PSU resources?</span>
          ${renderPsuCheck("Yes", wizardData.disclosureUsedPsuResources === "yes")}
          ${renderPsuCheck("No", wizardData.disclosureUsedPsuResources === "no")}
        </div>
        <div class="psu-paper-choice-grid">
          ${renderPsuCheck("University facilities", hasResource("facilities"))}
          ${renderPsuCheck("Research funds", hasResource("research-funds"))}
          ${renderPsuCheck("Equipment", hasResource("equipment"))}
          ${renderPsuCheck("Staff or student assistance", hasResource("assistance"))}
          ${renderPsuCheck("Others", hasResource("others"))}
        </div>
        ${renderPsuPaperValue(wizardData.disclosureResourceOther, { multiline: true })}
        <div class="psu-paper-choice-line">
          <span>Source of Funding:</span>
          ${renderPsuCheck("PSU-funded", hasFunding("psu-funded"))}
          ${renderPsuCheck("Externally funded", hasFunding("externally-funded"))}
          ${renderPsuCheck("Self-funded", hasFunding("self-funded"))}
        </div>
        ${renderPsuPaperValue(wizardData.disclosureExternalFunding, { multiline: true })}
      </div>

      <div class="psu-disclosure-section">
        <div class="psu-disclosure-section-title">PRIOR DISCLOSURE</div>
        <div class="psu-paper-choice-line">
          <span>Has any part of this IP been publicly disclosed?</span>
          ${renderPsuCheck("No", wizardData.disclosurePriorPublic === "no")}
          ${renderPsuCheck("Yes", wizardData.disclosurePriorPublic === "yes")}
        </div>
        <div class="psu-paper-choice-grid">
          ${renderPsuCheck("Thesis / Dissertation", hasPriorType("thesis"))}
          ${renderPsuCheck("Conference presentation", hasPriorType("conference"))}
          ${renderPsuCheck("Journal publication", hasPriorType("journal"))}
          ${renderPsuCheck("Demonstration / Exhibit", hasPriorType("demonstration"))}
          ${renderPsuCheck("Online posting", hasPriorType("online"))}
          ${renderPsuCheck("Others", hasPriorType("others"))}
        </div>
        <div class="psu-disclosure-grid">
          <div><span>Other details:</span>${renderPsuPaperValue(wizardData.disclosurePriorOther)}</div>
          <div><span>Date and venue:</span>${renderPsuPaperValue(wizardData.disclosurePriorDateVenue)}</div>
        </div>
      </div>

      <div class="psu-disclosure-section">
        <div class="psu-disclosure-section-title">OWNERSHIP DECLARATION</div>
        <p class="psu-disclosure-declaration">
          The undersigned creator(s) declare that this intellectual property was created in accordance with the Palawan State University Intellectual Property Policy, 2025 Edition, and that all information provided herein is true and complete to the best of their knowledge. The creator(s) agree to cooperate with the Technology Transfer and Patent Unit (TTPU) in the evaluation, protection, and possible commercialization of the disclosed IP.
        </p>
        <div class="psu-disclosure-sign-grid">
          ${[wizardData.disclosureCreator1, wizardData.disclosureCreator2, wizardData.disclosureCreator3]
            .map(
              (name, index) => `
                <div>
                  <span>Name & Signature ${index + 1}</span>
                  <div class="psu-sign-line">${escapeHtml(name || " ")}</div>
                </div>
              `,
            )
            .join("")}
          <div>
            <span>Intellectual Property and Technology Transfer Office</span>
            <div class="psu-sign-line">${escapeHtml(wizardData.disclosureIpttoRepresentative || " ")}</div>
          </div>
          <div>
            <span>Noted by: Head, TTPU</span>
            <div class="psu-sign-line">${escapeHtml(wizardData.disclosureTtpuHead || " ")}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPatentIntakeFormBundle({ includeFlow = false } = {}) {
  const showDisclosure = currentFormType !== "industrial";
  return `
    <div class="patent-paper-stack psu-form-stack">
      ${renderPatentAdvisoryServiceSheetPaper()}
      ${showDisclosure ? renderPatentDisclosureFormPaper() : ""}
      ${includeFlow ? renderPatentFlowReference({ activeIndex: 0 }) : ""}
    </div>
  `;
}

function renderPatentFormSheet() {
  const applicantKey = buildPatentIdentityKey([
    wizardData.applicantLastName,
    wizardData.applicantFirstName,
    wizardData.applicantMiddleName,
  ]);
  const inventorKey = buildPatentIdentityKey([
    wizardData.inventorLastName,
    wizardData.inventorFirstName,
    wizardData.inventorMiddleName,
  ]);
  const applicantIsInventor =
    Boolean(applicantKey) &&
    Boolean(inventorKey) &&
    applicantKey === inventorKey;
  const applicationRoute =
    wizardData.applicationRoute ||
    (wizardData.divisionalParentApplicationNo ||
    wizardData.divisionalParentFilingDate
      ? "divisional"
      : wizardData.internationalAppNo ||
          wizardData.internationalFileDate ||
          wizardData.internationalPublicationNo ||
          wizardData.internationalPublicationDate
        ? "pct"
        : "direct");
  const hasPriorityClaim =
    wizardData.priorityClaim === "yes" ||
    Boolean(
      wizardData.priorityNumber ||
        wizardData.priorityDate ||
        wizardData.priorityCountry,
    );
  const priorityRows = [
    {
      number: wizardData.priorityNumber,
      date: formatPatentOfficialDate(wizardData.priorityDate),
      country: wizardData.priorityCountry,
      certified: wizardData.priorityCertifiedCopy,
    },
    { number: "", date: "", country: "", certified: "" },
    { number: "", date: "", country: "", certified: "" },
  ];
  const priorityCertifiedMarkup = (value) => `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Yes", value === "yes", { round: true })}
      ${renderPatentOfficialMark("No", value === "no", { round: true })}
    </div>
  `;
  const applicantTypeMarkup = [
    ["individual", "Individual"],
    ["company", "Company / Corporation"],
    ["school", "School"],
    ["government", "Government"],
  ]
    .map(([value, label]) =>
      renderPatentOfficialMark(label, wizardData.applicantType === value),
    )
    .join("");
  const entityMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Big", wizardData.entityStatus === "big", { round: true })}
      ${renderPatentOfficialMark("Small", wizardData.entityStatus === "small", { round: true })}
    </div>
  `;
  const applicantSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", wizardData.applicantSex === "male", { round: true })}
      ${renderPatentOfficialMark("Female", wizardData.applicantSex === "female", { round: true })}
    </div>
  `;
  const inventorSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", wizardData.inventorSex === "male", { round: true })}
      ${renderPatentOfficialMark("Female", wizardData.inventorSex === "female", { round: true })}
    </div>
  `;
  const agentSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", wizardData.agentSex === "male", { round: true })}
      ${renderPatentOfficialMark("Female", wizardData.agentSex === "female", { round: true })}
    </div>
  `;

  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official">
        <div class="patent-official-header">
          <div class="patent-official-brand">
            <img src="images/ipophl_logo.png" alt="IPOPHL logo" class="patent-official-brand__logo" />
            <div class="patent-official-brand__copy">
              <div class="patent-official-brand__agency">Intellectual Property Office of the Philippines</div>
              <div class="patent-official-brand__meta">28 Upper McKinley Rd., Fort Bonifacio, Taguig City 1634 PH</div>
              <div class="patent-official-brand__meta">+63 (2) 7238-6300 | ask@ipophil.gov.ph</div>
              <div class="patent-official-brand__title">PATENT APPLICATION REQUEST</div>
            </div>
          </div>

          <div class="patent-official-office">
            <div class="patent-official-office__form">IPOPHL Form 100</div>
            <div class="patent-official-office__label">For IPOPHL use only</div>
            <div class="patent-official-office__table">
              ${renderPatentOfficialOfficeRow("Application No.", "")}
              ${renderPatentOfficialOfficeRow("Date Received", "")}
              ${renderPatentOfficialOfficeRow("Date Mailed", "")}
              ${renderPatentOfficialOfficeRow("IPSO / ITSO Code", "")}
            </div>
          </div>
        </div>

        <div class="patent-official-route">
          ${renderPatentOfficialMark("Direct", applicationRoute === "direct")}
          ${renderPatentOfficialMark("PCT", applicationRoute === "pct")}
          ${renderPatentOfficialMark("Divisional", applicationRoute === "divisional")}
          ${renderPatentOfficialMark("w/ Claim of Priority", hasPriorityClaim)}
        </div>

        ${renderPatentOfficialSectionBar("TITLE OF INVENTION")}
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Title of Invention", wizardData.title)}
        </div>

        ${renderPatentOfficialSectionBar("DIVISIONAL INFORMATION", "For divisional applications, if applicable")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Parent Application No.", wizardData.divisionalParentApplicationNo)}
          ${renderPatentOfficialCell("Parent Application Filing Date (yyyy/mm/dd)", formatPatentOfficialDate(wizardData.divisionalParentFilingDate))}
        </div>

        ${renderPatentOfficialSectionBar("PCT INFORMATION", "For National Phase Entry applications, if applicable")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("International Application Number", wizardData.internationalAppNo)}
          ${renderPatentOfficialCell("International Filing Date (yyyy/mm/dd)", formatPatentOfficialDate(wizardData.internationalFileDate))}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("International Publication Number", wizardData.internationalPublicationNo)}
          ${renderPatentOfficialCell("International Publication Date (yyyy/mm/dd)", formatPatentOfficialDate(wizardData.internationalPublicationDate))}
        </div>

        ${renderPatentOfficialSectionBar("PRIORITY CLAIM/S", "If applicable")}
        <div class="patent-official-row patent-official-row--priority-head">
          <div class="patent-official-head-cell">Prior Foreign Application Number/s</div>
          <div class="patent-official-head-cell">Foreign Filing Date (yyyy/mm/dd)</div>
          <div class="patent-official-head-cell">Country</div>
          <div class="patent-official-head-cell">Certified Copy Attached?</div>
        </div>
        ${priorityRows
          .map(
            (row) => `
              <div class="patent-official-row patent-official-row--priority">
                ${renderPatentOfficialCell("", row.number, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", row.date, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", row.country, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", priorityCertifiedMarkup(row.certified), {
                  raw: true,
                  cellClass: "patent-official-cell--compact",
                  valueClass: "patent-official-cell__value--choices",
                })}
              </div>
            `,
          )
          .join("")}
        <div class="patent-official-note-line">To add more priority claim/s, use IPOPHL Form 120 - Supplemental Priority Form</div>

        ${renderPatentOfficialSectionBar("APPLICANT INFORMATION", "For individual applicants, you may skip Name of Company/Government/School and Position fields")}
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Type of Applicant", applicantTypeMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Name of Company / Corporation / Government Agency / School", wizardData.applicantCompany, { span: 3 })}
          ${renderPatentOfficialCell("Entity", entityMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Position", wizardData.applicantPosition)}
          ${renderPatentOfficialCell("Sex", applicantSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Last Name", wizardData.applicantLastName)}
          ${renderPatentOfficialCell("First Name", wizardData.applicantFirstName)}
          ${renderPatentOfficialCell("Middle Name", wizardData.applicantMiddleName)}
          ${renderPatentOfficialCell("The Applicant is also the Inventor", renderPatentOfficialMark("Yes", applicantIsInventor), {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", wizardData.applicantAddress)}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", wizardData.applicantTown)}
          ${renderPatentOfficialCell("Province / State", wizardData.applicantProvince)}
          ${renderPatentOfficialCell("Zip Code", wizardData.applicantZip)}
          ${renderPatentOfficialCell("Country of Residence", wizardData.applicantCountry)}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", wizardData.applicantContact)}
          ${renderPatentOfficialCell("Email Address", wizardData.applicantEmail)}
          ${renderPatentOfficialCell("Nationality", wizardData.applicantNationality)}
        </div>
        <div class="patent-official-note-line">At least one applicant is mandatory. The applicant with no agent or authorized representative must inform the office of any changes in the contact information.</div>

        ${renderPatentOfficialSectionBar("INVENTOR INFORMATION", "If the inventor is not the same as the applicant")}
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Last Name", wizardData.inventorLastName)}
          ${renderPatentOfficialCell("First Name", wizardData.inventorFirstName)}
          ${renderPatentOfficialCell("Middle Name", wizardData.inventorMiddleName)}
          ${renderPatentOfficialCell("Sex", inventorSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", wizardData.inventorAddress)}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", wizardData.inventorTown)}
          ${renderPatentOfficialCell("Province / State", wizardData.inventorProvince)}
          ${renderPatentOfficialCell("Zip Code", wizardData.inventorZip)}
          ${renderPatentOfficialCell("Country of Residence", wizardData.inventorCountry)}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", wizardData.inventorContact)}
          ${renderPatentOfficialCell("Email Address", wizardData.inventorEmail)}
          ${renderPatentOfficialCell("Nationality", wizardData.inventorNationality)}
        </div>
        <div class="patent-official-note-line">At least one inventor is mandatory. To add more inventors, use IPOPHL Form 110 - Supplemental Sheet.</div>

        ${renderPatentOfficialSectionBar("RESIDENT AGENT / AUTHORIZED REPRESENTATIVE", "If supplied, all correspondences will be sent to this contact")}
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Agent Number (if available)", wizardData.agentRegistrationNo)}
          ${renderPatentOfficialCell("Company Name (The law firm, if applicable)", wizardData.agentCompany, { span: 3 })}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Position", wizardData.agentPosition)}
          ${renderPatentOfficialCell("Sex", agentSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Last Name", wizardData.agentLastName)}
          ${renderPatentOfficialCell("First Name", wizardData.agentFirstName)}
          ${renderPatentOfficialCell("Middle Name", wizardData.agentMiddleName)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", wizardData.agentAddress)}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", wizardData.agentTown)}
          ${renderPatentOfficialCell("Province / State", wizardData.agentProvince)}
          ${renderPatentOfficialCell("Zip Code", wizardData.agentZip)}
          ${renderPatentOfficialCell("Country of Residence", wizardData.agentCountry)}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", wizardData.agentContact)}
          ${renderPatentOfficialCell("Email Address", wizardData.agentEmail)}
          ${renderPatentOfficialCell("Nationality", wizardData.agentNationality)}
        </div>
        <div class="patent-official-note-line">Agent or authorized representative must inform the office of any changes in the contact information.</div>

        ${renderPatentOfficialSectionBar("FILING PACKET", "System-only summary for this guided submission")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Number of Drawings", wizardData.drawingsCount)}
          ${renderPatentOfficialCell("Number of Claims", wizardData.claimsCount)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Supporting Notes", wizardData.supportingNotes)}
        </div>
        <div class="patent-official-note-line">Rendered from the guided online patent form using the Form 100 layout style shown in your reference.</div>
        ${renderPatentOfficialFooter(1)}
      </div>
    </div>
  `;
}

function renderPatentPreviewStep() {
  const isIndustrial = currentFormType === "industrial";
  const stepCount = getPatentFormSteps().length;
  const title = isIndustrial
    ? "Review the Completed Industrial Design Intake"
    : "Review the Completed PSU Forms";
  const copy = isIndustrial
    ? "The Advisory Service Sheet below is generated from your fill-up answers, and the required drawing uploads are summarized for checking before submission."
    : "The Advisory Service Sheet and IP Disclosure Form below are generated from your fill-up answers. Go back to any section if you need to correct the final paper version.";

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step ${stepCount} - Preview and Submit</span>
      <h2>${title}</h2>
      <p>${copy}</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      ${renderPatentIntakeFormBundle({ includeFlow: true })}
    </div>

    <div class="patent-gform-card">
      <h3>${isIndustrial ? "Required Drawing Summary" : "Optional Document Summary"}</h3>
      ${renderPatentSubmissionList()}
      ${
        wizardData.supportingNotes
          ? `<div class="patent-preview-note"><i class="fa-solid fa-note-sticky"></i> ${escapeHtml(wizardData.supportingNotes)}</div>`
          : ""
      }
    </div>
  `;
}

function renderCopyrightEditorHeader(title, subtitle) {
  return `
    <div class="patent-editor-header">
      <div>
        <p class="patent-paper__eyebrow">Bureau of Copyright and Related Rights</p>
        <h2>${title}</h2>
        <p class="patent-paper__sub">${subtitle}</p>
      </div>
      <div class="patent-editor-office">
        ${renderPatentEditorInput("Submission Type", "copyright-office-submission-type", wizardData.copyrightSubmissionType || "", { disabled: true })}
        ${renderPatentEditorInput("Region / IPSO", "copyright-office-region", "", { disabled: true })}
        ${renderPatentEditorInput("ITSO", "copyright-office-itso", "", { disabled: true })}
        ${renderPatentEditorInput("Form Tag", "copyright-office-form-tag", "BCRR FORM 2025-1", { disabled: true })}
      </div>
    </div>
  `;
}

function getCopyrightFormSteps() {
  return [
    "Advisory Sheet",
    "Upload Requirements",
    "BCRR Form 2025-1",
    "Preview & Submit",
  ];
}

function getCopyrightProgressPercent() {
  const stepsCount = getCopyrightFormSteps().length;
  const stepSize = 100 / stepsCount;
  return Math.max(stepSize, Math.min(100, currentWizardStep * stepSize));
}

function renderCopyrightFirstTimeApplicantNote() {
  return `
    <div style="background:#fff7ed; border:1px solid #ffedd5; padding:20px; border-radius:14px; margin-bottom:24px; display:flex; gap:14px; align-items:flex-start;">
      <i class="fa-solid fa-triangle-exclamation" style="color:#f97316; margin-top:3px; font-size:1.05rem;"></i>
      <div>
        <h4 style="color:#c2410c; margin:0 0 8px; font-size:1rem; font-weight:800;">First-time Applicants Note</h4>
        <p style="color:#c2410c; font-size:0.95rem; line-height:1.55; margin:0;">You must be registered in the NBDB (National Book Development Board) as an Author or Publisher. If you are not yet registered, please register with NBDB before continuing.</p>
      </div>
    </div>
  `;
}

function renderCopyrightGoogleForm(
  backTarget = "filing-hub",
  backLabel = "Filing Hub",
) {
  const steps = getCopyrightFormSteps();
  const activeStepTitle = steps[currentWizardStep - 1] || steps[0];

  return `
    ${renderBackNav(backTarget, backLabel)}
    <div class="patent-gform-shell">
      <div class="patent-gform-header">
        <div class="patent-gform-header-bar" style="background:linear-gradient(135deg, #10b981, #0f766e);"></div>
        <div class="patent-gform-card patent-gform-card--hero">
          <span class="patent-gform-kicker">${wizardData.applicantTypeGroup === 'Institution' ? 'BCRR FORM 2025-2' : 'BCRR FORM 2025-1'}</span>
          <h1>${wizardData.applicantTypeGroup === 'Institution' ? 'Institutional Copyright Registration' : 'Fillable Copyright Form'}</h1>
          <p>Complete the Advisory Service Sheet first, choose the work classification while uploading requirements, then fill out the Copyright Registry Enrollment Form before the final preview.</p>
          <div class="patent-gform-meta">
            <span><i class="fa-solid fa-copyright"></i> ${steps.length} guided sections</span>
            <span><i class="fa-solid fa-file-lines"></i> Advisory + BCRR previews</span>
            <span><i class="fa-solid fa-building-shield"></i> BCRR enrollment layout</span>
          </div>
        </div>
      </div>

      <div class="patent-gform-layout">
        <div class="patent-gform-main">
          <div class="patent-step-strip">
            ${steps
              .map(
                (step, index) => `
                  <div class="patent-step-chip ${index + 1 === currentWizardStep ? "active" : ""} ${index + 1 < currentWizardStep ? "done" : ""}">
                    <span class="patent-step-chip__num">${index + 1}</span>
                    <span class="patent-step-chip__label">${step}</span>
                  </div>
                `,
              )
              .join("")}
          </div>

          ${currentWizardStep === 1 ? renderCopyrightFirstTimeApplicantNote() : ""}
          ${renderCopyrightGoogleStep()}

          <div class="patent-gform-actions">
            <div class="patent-gform-actions__left">
              ${
                currentWizardStep > 1
                  ? `<button class="btn btn-secondary" onclick="prevWizardStep()"><i class="fa-solid fa-arrow-left"></i> Previous</button>`
                  : ""
              }
            </div>
            <div class="patent-gform-actions__right">
              <button class="btn btn-outline-navy" onclick="saveFormDraft()"><i class="fa-solid fa-floppy-disk"></i> Save Draft</button>
              ${
                currentWizardStep < steps.length
                  ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next Section <i class="fa-solid fa-arrow-right"></i></button>`
                  : `<button class="btn btn-success" onclick="submitForm()">Submit Copyright Form <i class="fa-solid fa-paper-plane"></i></button>`
              }
            </div>
          </div>
        </div>

        <aside class="patent-gform-sidebar">
          <div class="patent-gform-card">
            <span class="patent-gform-side-label">Current Section</span>
            <h3>${activeStepTitle}</h3>
            <div class="patent-progress-bar">
              <span style="width:${getCopyrightProgressPercent()}%; background:linear-gradient(135deg, #10b981, #0f766e);"></span>
            </div>
            <p>Step ${currentWizardStep} of ${steps.length}. The final step shows your completed advisory sheet and copyright registry form.</p>
          </div>

          <div class="patent-gform-card">
            <span class="patent-gform-side-label">How This Works</span>
            <ul class="patent-gform-note-list">
              <li>The first section mirrors the PSU Advisory Service Sheet.</li>
              <li>The upload section uses the selected Classification of Works to guide the copy-of-work file format.</li>
              <li>The BCRR fields map to the enrollment form sections in your screenshots.</li>
              <li>The last step composes the advisory and registry-style previews for final checking.</li>
              <li>Required uploads still follow the system checklist before submission is allowed.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderCopyrightGoogleStep() {
  if (currentWizardStep === 1) return renderPatentAdvisorySheetStep();
  if (currentWizardStep === 2) return renderCopyrightVerificationUploadStep();
  if (currentWizardStep === 3) {
    if (wizardData.applicantTypeGroup === 'Institution') return renderCopyrightSupplementalStep();
    return renderCopyrightFillFormStep();
  }
  return renderCopyrightPreviewStep();
}


// ===== NEW COPYRIGHT STEPS =====

function renderCopyrightPrepareDocumentsStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 1</span>
      <h2>Prepare Required Documents</h2>
      <p>Before proceeding, ensure you have all the following documents ready. This is the standard checklist for copyright registration with IPOPHL.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">

        <div class="patent-editor-section">
          <div class="patent-paper__section-title" style="display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-circle-check" style="color:var(--green);"></i>
            Mandatory Documents
          </div>
          <div style="display:flex; flex-direction:column; gap:14px; margin-top:12px;">
            ${[
              { icon: "fa-file-contract", label: "Complete BCRR Form", sub: "Copyright Registration Form (BCRR FORM 2025-1 for Individual / BCRR FORM 2025-2 for Institution)", required: true },
              { icon: "fa-id-card", label: "Proof of Identity", sub: "Any valid government-issued ID — required if the author is different from the applicant", required: true },
              { icon: "fa-file-pdf", label: "Copy of the Work Being Registered", sub: "Scanned or digital copy of your copyright work (PDF preferred)", required: true },
              { icon: "fa-scroll", label: "Affidavit of Ownership", sub: "Executed by the owner/author/creator. This is a mandatory requirement.", required: true },
            ].map(doc => `
              <div style="display:flex; gap:14px; align-items:flex-start; padding:16px; border-radius:14px; background:var(--gray-50); border:1px solid var(--gray-100);">
                <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#10b981,#0f766e); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; font-size:1rem;">
                  <i class="fa-solid ${doc.icon}"></i>
                </div>
                <div style="flex:1;">
                  <div style="font-weight:700; color:var(--navy); font-size:0.92rem; display:flex; align-items:center; gap:8px;">
                    ${doc.label}
                    ${doc.required ? '<span style="font-size:0.68rem; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:999px; padding:2px 8px; font-weight:700;">REQUIRED</span>' : ''}
                  </div>
                  <div style="font-size:0.82rem; color:var(--gray-500); margin-top:4px; line-height:1.5;">${doc.sub}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title" style="display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-circle-info" style="color:var(--gold);"></i>
            Supporting Documents (If Applicable)
          </div>
          <div style="display:flex; flex-direction:column; gap:14px; margin-top:12px;">
            ${[
              { icon: "fa-file-signature", label: "Deed of Assignment", sub: "Required if applicant is a company or organization and the work was assigned to them by the creator." },
              { icon: "fa-handshake", label: "License Agreement", sub: "If copyright is being registered under a licensing arrangement." },
              { icon: "fa-building", label: "SEC / DTI Registration", sub: "For institutional applicants — proof of business or organization registration." },
            ].map(doc => `
              <div style="display:flex; gap:14px; align-items:flex-start; padding:16px; border-radius:14px; background:var(--gray-50); border:1px dashed var(--gray-200);">
                <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#f59e0b,#d97706); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; font-size:1rem;">
                  <i class="fa-solid ${doc.icon}"></i>
                </div>
                <div style="flex:1;">
                  <div style="font-weight:700; color:var(--navy); font-size:0.92rem;">${doc.label}</div>
                  <div style="font-size:0.82rem; color:var(--gray-500); margin-top:4px; line-height:1.5;">${doc.sub}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="patent-editor-section">
          <div style="padding:16px; border-radius:14px; background:linear-gradient(135deg, rgba(16,185,129,0.06), rgba(15,118,110,0.08)); border:1px solid rgba(16,185,129,0.2);">
            <div style="font-weight:800; color:#0f766e; font-size:0.9rem; margin-bottom:8px;"><i class="fa-solid fa-lightbulb"></i> Before You Continue</div>
            <ul style="font-size:0.82rem; color:var(--gray-600); line-height:1.8; margin:0; padding-left:16px;">
              <li>Scan all documents clearly and save them in <strong>PDF format</strong>.</li>
              <li>Each file should be <strong>under 10 MB</strong>.</li>
              <li>The Affidavit of Ownership must be <strong>notarized</strong> before uploading.</li>
              <li>Click <strong>Next Section</strong> when all documents are ready.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderCopyrightFillFormStep() {
  // Combines all form sections into one scrollable step
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 3 - BCRR FORM 2025-1</span>
      <h2>Complete the Fillable Copyright Form</h2>
      <p>Fill in all fields below. These map directly to the BCRR Form sections and will populate the final preview.</p>
    </div>
    ${renderCopyrightSubmissionOwnerBody()}
    ${renderCopyrightAuthorWorkBody()}
    ${renderCopyrightDeclarationsUploadsBody()}
  `;
}

function renderCopyrightPaymentStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 3</span>
      <h2>Payment of Filing Fees</h2>
      <p>After IPOPHL receives your application, they will send an Electronic Statement of Account (eSOA) to your email. Use the details below to complete payment.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">

        <div class="patent-editor-section">
          <div class="patent-paper__section-title"><i class="fa-solid fa-receipt" style="margin-right:6px; color:var(--green);"></i> Filing Fee Schedule</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px;">
            <div style="padding:20px; border-radius:14px; background:var(--gray-50); border:1px solid var(--gray-100); text-align:center;">
              <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-400); margin-bottom:8px;">Small Entity</div>
              <div style="font-size:2rem; font-weight:900; color:var(--navy);">₱450</div>
              <div style="font-size:0.8rem; color:var(--gray-500); margin-top:4px;">Individuals, Micro/Small businesses, Non-profits</div>
            </div>
            <div style="padding:20px; border-radius:14px; background:var(--gray-50); border:1px solid var(--gray-100); text-align:center;">
              <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-400); margin-bottom:8px;">Big Entity</div>
              <div style="font-size:2rem; font-weight:900; color:var(--navy);">₱625</div>
              <div style="font-size:0.8rem; color:var(--gray-500); margin-top:4px;">Corporations, large institutions, multinational companies</div>
            </div>
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title"><i class="fa-solid fa-credit-card" style="margin-right:6px; color:var(--gold);"></i> Payment Methods</div>
          <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
            ${[
              { icon: "fa-globe", label: "Online Payment Gateway", sub: "Pay via the official IPOPHL online portal (COPS)." },
              { icon: "fa-credit-card", label: "Credit / Debit Card", sub: "Visa, Mastercard accepted through IPOPHL's secure payment page." },
              { icon: "fa-mobile-screen-button", label: "GCash / Maya", sub: "Available via the IPOPHL payment gateway." },
              { icon: "fa-building-columns", label: "Over-the-Counter (Partner Banks)", sub: "Land Bank of the Philippines and other accredited banks." },
            ].map(pm => `
              <div style="display:flex; gap:14px; align-items:center; padding:14px 16px; border-radius:12px; background:var(--gray-50); border:1px solid var(--gray-100);">
                <div style="width:36px; height:36px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#4f46e5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.9rem; flex-shrink:0;">
                  <i class="fa-solid ${pm.icon}"></i>
                </div>
                <div>
                  <div style="font-weight:700; color:var(--navy); font-size:0.88rem;">${pm.label}</div>
                  <div style="font-size:0.78rem; color:var(--gray-500); margin-top:2px;">${pm.sub}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="patent-editor-section">
          <div style="padding:16px; border-radius:14px; background:linear-gradient(135deg, rgba(99,102,241,0.06), rgba(79,70,229,0.08)); border:1px solid rgba(99,102,241,0.2);">
            <div style="font-weight:800; color:#4f46e5; font-size:0.9rem; margin-bottom:8px;"><i class="fa-solid fa-envelope"></i> What Happens Next?</div>
            <p style="font-size:0.82rem; color:var(--gray-600); line-height:1.7; margin:0;">
              IPOPHL will send an <strong>Electronic Statement of Account (eSOA)</strong> to your registered email address after reviewing your submitted documents. 
              Use the details in the eSOA to complete your payment, then proceed to the next step to upload your proof of payment.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderCopyrightVerificationUploadStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Step 2 - Upload Requirements</span>
      <h2>Upload the Copyright Requirements</h2>
      <p>Select the Classification of Works first. The copy-of-work upload requirement will update to the correct format for that class.</p>
    </div>
    ${renderCopyrightClassificationGate()}
    ${renderStep3()}
  `;
}

// Body helpers used by renderCopyrightFillFormStep (call full step minus intro card)
function renderCopyrightSubmissionOwnerBody() {
  return renderCopyrightSubmissionOwnerStep().replace(/<div class="patent-gform-card">[\s\S]*?<\/div>\s*(?=<div class="patent-gform-card patent-gform-card--sheet">)/, '');
}
function renderCopyrightAuthorWorkBody() {
  return renderCopyrightAuthorWorkStep().replace(/<div class="patent-gform-card">[\s\S]*?<\/div>\s*(?=<div class="patent-gform-card patent-gform-card--sheet">)/, '');
}
function renderCopyrightDeclarationsUploadsBody() {
  return renderCopyrightDeclarationsUploadsStep().replace(/<div class="patent-gform-card">[\s\S]*?<\/div>\s*(?=<div class="patent-gform-card patent-gform-card--sheet">)/, '');
}

function renderCopyrightSubmissionOwnerStep() {

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 1</span>
      <h2>Submission and Copyright Owner</h2>
      <p>Fill the filing route, applicant profile, and copyright owner block from page 1 of the BCRR form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${renderCopyrightEditorHeader("Copyright Registry Enrollment Form", "Editable page 1 header and ownership details based on the BCRR form.")}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">1. Filing Route</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Submission Type</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightSubmissionType", "electronic", "Electronic filing")}
              ${renderCopyrightChoice("copyrightSubmissionType", "ipso", "Through IPSO")}
              ${renderCopyrightChoice("copyrightSubmissionType", "itso", "Through ITSO")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Region / IPSO", "copyright-submission-region", wizardData.copyrightSubmissionRegion, { placeholder: "If routed through IPSO" })}
            ${renderPatentEditorInput("ITSO / Office", "copyright-submission-itso", wizardData.copyrightSubmissionItso, { placeholder: "If routed through ITSO" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Type of Application</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderCopyrightChoice("copyrightApplicationScale", "single", "Single Filing")}
              ${renderCopyrightChoice("copyrightApplicationScale", "bulk", "Bulk Filing")}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Application Scope</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderCopyrightChoice("copyrightApplicationScope", "local", "Local Filing")}
              ${renderCopyrightChoice("copyrightApplicationScope", "international", "International Filing")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Hard Copy Certificate Requested</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightHardCopyRequested", "no", "No")}
                ${renderCopyrightChoice("copyrightHardCopyRequested", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Quantity", "copyright-hard-copy-qty", wizardData.copyrightHardCopyQty, { placeholder: "If yes, indicate quantity" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">2. Applicant Profile</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Type of Applicant</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightApplicantTypes", "author", "Author / Creator / Rights Holder", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "licensee", "Licensee", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "employer", "Employer", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "heirs", "Heirs", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "owner", "Copyright Owner / Assignee", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "mortgagee", "Mortgagee", { multiple: true })}
              ${renderCopyrightChoice("copyrightApplicantTypes", "agent", "Agent / Representative", { multiple: true })}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Asset Size of Copyright Owner</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightAssetSize", "small", "Small")}
                ${renderCopyrightChoice("copyrightAssetSize", "big", "Big")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Owner Mode</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightOwnerMode", "individual", "Individual Owner")}
                ${renderCopyrightChoice("copyrightOwnerMode", "institutional", "Institutional Owner")}
              </div>
            </div>
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">3. Individual Copyright Owner</div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("First Name", "copyright-owner-first-name", wizardData.copyrightOwnerFirstName, { placeholder: "Required for individual owner" })}
            ${renderPatentEditorInput("Middle Name", "copyright-owner-middle-name", wizardData.copyrightOwnerMiddleName, { placeholder: "Put N/A if not applicable" })}
            ${renderPatentEditorInput("Surname", "copyright-owner-surname", wizardData.copyrightOwnerSurname, { placeholder: "Required for individual owner" })}
            ${renderPatentEditorInput("Suffix", "copyright-owner-suffix", wizardData.copyrightOwnerSuffix, { placeholder: "Optional" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Standard Name Identifier (ISNI)", "copyright-owner-isni", wizardData.copyrightOwnerIsni, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Pseudonym / ISNI Number", "copyright-owner-pseudonym", wizardData.copyrightOwnerPseudonym, { placeholder: "If using pseudonym" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Name appearing in IPOPHL's Copyright Search</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightOwnerNameType", "original", "Original Name")}
              ${renderCopyrightChoice("copyrightOwnerNameType", "anonymous", "Anonymous")}
              ${renderCopyrightChoice("copyrightOwnerNameType", "pseudonym", "Pseudonym")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Nationality", "copyright-owner-nationality", wizardData.copyrightOwnerNationality, { placeholder: "e.g. Filipino" })}
            ${renderPatentEditorInput("Alien Certificate No.", "copyright-owner-alien-cert", wizardData.copyrightOwnerAlienCertNo, { placeholder: "If applicable" })}
            ${renderPatentEditorInput("Date of Birth", "copyright-owner-birthdate", wizardData.copyrightOwnerBirthDate, { type: "date" })}
            ${renderPatentEditorSelect("Civil Status", "copyright-owner-civil-status", wizardData.copyrightOwnerCivilStatus || "", [
              { value: "", label: "Select status" },
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "widow", label: "Widow" },
              { value: "separated", label: "Separated / Divorced" },
            ])}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightOwnerSex", "male", "Male")}
                ${renderCopyrightChoice("copyrightOwnerSex", "female", "Female")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Owner is also the author / creator / performer</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightOwnerAlsoAuthor", "yes", "Yes")}
                ${renderCopyrightChoice("copyrightOwnerAlsoAuthor", "no", "No")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCopyrightAuthorWorkStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 2</span>
      <h2>Author and Work Information</h2>
      <p>Fill the contact, author, and work/creation details that appear across pages 1 and 2 of the BCRR form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">5. Copyright Owner Contact Information</div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "copyright-owner-address", wizardData.copyrightOwnerAddress, { placeholder: "Street, Village, Subdivision, Barangay", fullWidth: true })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Municipality / City", "copyright-owner-city", wizardData.copyrightOwnerCity, { placeholder: "City / Municipality" })}
            ${renderPatentEditorInput("Province / State", "copyright-owner-province", wizardData.copyrightOwnerProvince, { placeholder: "Province / State" })}
            ${renderPatentEditorInput("Region", "copyright-owner-region", wizardData.copyrightOwnerRegion, { placeholder: "Region" })}
            ${renderPatentEditorSelect("Country", "copyright-owner-country", wizardData.copyrightOwnerCountry || "", [
              { value: "", label: "Select country" },
              { value: "Philippines", label: "Philippines" },
              { value: "United States", label: "United States" },
              { value: "Japan", label: "Japan" },
              { value: "Singapore", label: "Singapore" },
              { value: "Australia", label: "Australia" },
            ])}
          </div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("ZIP Code", "copyright-owner-zip", wizardData.copyrightOwnerZip, { placeholder: "ZIP / Postal Code" })}
            ${renderPatentEditorInput("Email Address", "copyright-owner-email", wizardData.copyrightOwnerEmail, { type: "email", placeholder: "owner@example.com" })}
            ${renderPatentEditorInput("Contact Number", "copyright-owner-contact", wizardData.copyrightOwnerContact, { placeholder: "Mobile / Landline" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">6. Author / Creator / Performer</div>
          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("First Name", "copyright-author-first-name", wizardData.copyrightAuthorFirstName, { placeholder: "Required" })}
            ${renderPatentEditorInput("Middle Name", "copyright-author-middle-name", wizardData.copyrightAuthorMiddleName, { placeholder: "Put N/A if not applicable" })}
            ${renderPatentEditorInput("Surname", "copyright-author-surname", wizardData.copyrightAuthorSurname, { placeholder: "Required" })}
            ${renderPatentEditorInput("Suffix", "copyright-author-suffix", wizardData.copyrightAuthorSuffix, { placeholder: "Optional" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Standard Name Identifier (ISNI)", "copyright-author-isni", wizardData.copyrightAuthorIsni, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Pseudonym / ISNI Number", "copyright-author-pseudonym", wizardData.copyrightAuthorPseudonym, { placeholder: "If using pseudonym" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Name appearing in IPOPHL's Copyright Search</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightAuthorNameType", "original", "Original Name")}
              ${renderCopyrightChoice("copyrightAuthorNameType", "anonymous", "Anonymous")}
              ${renderCopyrightChoice("copyrightAuthorNameType", "pseudonym", "Pseudonym")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Nationality", "copyright-author-nationality", wizardData.copyrightAuthorNationality, { placeholder: "e.g. Filipino" })}
            ${renderPatentEditorInput("Alien Certificate No.", "copyright-author-alien-cert", wizardData.copyrightAuthorAlienCertNo, { placeholder: "If applicable" })}
            ${renderPatentEditorInput("Date of Birth", "copyright-author-birthdate", wizardData.copyrightAuthorBirthDate, { type: "date" })}
            ${renderPatentEditorSelect("Civil Status", "copyright-author-civil-status", wizardData.copyrightAuthorCivilStatus || "", [
              { value: "", label: "Select status" },
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "widow", label: "Widow" },
              { value: "separated", label: "Separated / Divorced" },
            ])}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightAuthorSex", "male", "Male")}
                ${renderCopyrightChoice("copyrightAuthorSex", "female", "Female")}
              </div>
            </div>
            ${renderPatentEditorInput("Province / State", "copyright-author-province", wizardData.copyrightAuthorProvince, { placeholder: "Province / State" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Address", "copyright-author-address", wizardData.copyrightAuthorAddress, { placeholder: "Street, Village, Subdivision, Barangay", fullWidth: true })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Municipality / City", "copyright-author-city", wizardData.copyrightAuthorCity, { placeholder: "City / Municipality" })}
            ${renderPatentEditorInput("Region", "copyright-author-region", wizardData.copyrightAuthorRegion, { placeholder: "Region" })}
            ${renderPatentEditorSelect("Country", "copyright-author-country", wizardData.copyrightAuthorCountry || "", [
              { value: "", label: "Select country" },
              { value: "Philippines", label: "Philippines" },
              { value: "United States", label: "United States" },
              { value: "Japan", label: "Japan" },
              { value: "Singapore", label: "Singapore" },
              { value: "Australia", label: "Australia" },
            ])}
            ${renderPatentEditorInput("ZIP Code", "copyright-author-zip", wizardData.copyrightAuthorZip, { placeholder: "ZIP / Postal Code" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Email Address", "copyright-author-email", wizardData.copyrightAuthorEmail, { type: "email", placeholder: "author@example.com" })}
            ${renderPatentEditorInput("Contact Number", "copyright-author-contact", wizardData.copyrightAuthorContact, { placeholder: "Mobile / Landline" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">7. Work / Creation / Performance / Broadcast</div>
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Title of the Work", "copyright-work-title", wizardData.copyrightWorkTitle || wizardData.title, { placeholder: "Title of work / creation / broadcast / performance", fullWidth: true, required: true })}
            ${renderPatentEditorInput("Date of Creation / Performance", "copyright-work-date", wizardData.copyrightWorkDate, { type: "date", required: true })}
          </div>
          ${renderCopyrightPublicationIdentifierSection()}
          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Place of Creation / Performance", "copyright-work-place", wizardData.copyrightWorkPlace, { placeholder: "City & Country" })}
            ${renderPatentEditorInput("Classification of the Work", "copyright-work-classification-display", getCopyrightClassificationLabel(), { disabled: true, placeholder: "Selected above" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Disclaimers</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightDisclaimers", "none", "None", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "text", "Text", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "photos", "Photographs", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "script", "Script", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "choreography", "Choreographic work", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "public-domain", "Previously published / public domain work", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "source-code", "Source code", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "lyrics", "Lyrics", { multiple: true })}
              ${renderCopyrightChoice("copyrightDisclaimers", "drawings", "Drawings", { multiple: true })}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Authorship Claim</span>
            ${renderCopyrightAuthorshipClaimChoices()}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCopyrightDeclarationsUploadsStep() {

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 3</span>
      <h2>Declarations, Documents, and Signature</h2>
      <p>Complete the declaration block, upload the required files, and prepare the page 2 signature section.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">8. Disclosure Questions</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Is the author / creator deceased?</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightAuthorDeceased", "no", "No")}
                ${renderCopyrightChoice("copyrightAuthorDeceased", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Date of Death", "copyright-author-death-date", wizardData.copyrightAuthorDeathDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">With co-author / co-creator?</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightHasCoAuthor", "no", "No")}
                ${renderCopyrightChoice("copyrightHasCoAuthor", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Co-author note", "copyright-coauthor-note", wizardData.copyrightCoAuthorNote, { placeholder: "If yes, note the co-author details / use supplemental form" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Is the work published?</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightPublished", "no", "No")}
                ${renderCopyrightChoice("copyrightPublished", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Name of Publisher", "copyright-publisher-name", wizardData.copyrightPublisherName, { placeholder: "If published" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Publisher ISNI No.", "copyright-publisher-isni", wizardData.copyrightPublisherIsni, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Date of First Publication", "copyright-publication-date", wizardData.copyrightPublicationDate, { type: "date" })}
            ${renderPatentEditorInput("Country of First Publication", "copyright-publication-country", wizardData.copyrightPublicationCountry, { placeholder: "Country" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Is the work derivative?</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightDerivativeWork", "no", "No")}
                ${renderCopyrightChoice("copyrightDerivativeWork", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Name of Original Work", "copyright-original-work-name", wizardData.copyrightOriginalWorkName, { placeholder: "If derivative" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Type of Derivative Work", "copyright-derivative-type", wizardData.copyrightDerivativeType, { placeholder: "Adaptation, arrangement, abridgment, etc." })}
            ${renderPatentEditorInput("Programming Language", "copyright-programming-language", wizardData.copyrightProgrammingLanguage, { placeholder: "For class N applications" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Indigenous Knowledge / Traditional Practice Source</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightIndigenousSource", "no", "No")}
                ${renderCopyrightChoice("copyrightIndigenousSource", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("Community / Source Details", "copyright-indigenous-details", wizardData.copyrightIndigenousDetails, { placeholder: "If yes, indicate the source / community" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Was generative AI used?</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightAiAssisted", "no", "No")}
                ${renderCopyrightChoice("copyrightAiAssisted", "yes", "Yes")}
              </div>
            </div>
            ${renderPatentEditorInput("AI system / extent of use", "copyright-ai-details", wizardData.copyrightAiDetails, { placeholder: "Indicate AI program and describe extent of AI use" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">9. Certificate / Agreement Details</div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Copyright Certificate Number", "copyright-certificate-number", wizardData.copyrightCertificateNumber, { placeholder: "If applicable" })}
            ${renderPatentEditorInput("Certificate Issuance Date", "copyright-certificate-date", wizardData.copyrightCertificateDate, { type: "date" })}
            ${renderPatentEditorInput("Issued by", "copyright-certificate-issued-by", wizardData.copyrightCertificateIssuedBy, { placeholder: "IPOPHL / NLP / Others" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Documents Submitted</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("copyrightSubmittedDocs", "copy-of-work", "Copy of the Work", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "sec-dti", "SEC / DTI Registration Certificate", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "appointment-letter", "Appointment / Designation Letter", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "board-resolution", "Board Resolution / Secretary's Certificate", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "id-card", "ID Card", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "spa", "Special Power of Attorney", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "contract", "Contract / Agreement", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "deed-assignment", "Deed of Assignment / License / Mortgage", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "copyright-certificate", "Previous Copyright Certificate", { multiple: true })}
              ${renderCopyrightChoice("copyrightSubmittedDocs", "others", "Others", { multiple: true })}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Affidavit / Terms</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightTermsAgreement", "agree", "Yes, I / We Agree")}
                ${renderCopyrightChoice("copyrightTermsAgreement", "disagree", "No, I / We Disagree")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Privacy Statement</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderCopyrightChoice("copyrightPrivacyAgreement", "agree", "We Agree")}
                ${renderCopyrightChoice("copyrightPrivacyAgreement", "disagree", "We Disagree")}
              </div>
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Applicant's Signature Over Printed Name", "copyright-signature-name", wizardData.copyrightSignatureName || "", { placeholder: "Printed name for signature block", required: true })}
            ${renderPatentEditorInput("Signature Date", "copyright-signature-date", wizardData.copyrightSignatureDate || "", { type: "date", required: true })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function captureCopyrightSupplementalData() {
  if (!wizardData.copyrightSupplementalEntries) {
    wizardData.copyrightSupplementalEntries = [];
  }
  const entries = document.querySelectorAll('.copyright-supplemental-entry');
  if (entries.length > 0) {
    wizardData.copyrightSupplementalEntries = Array.from(entries).map((entry, index) => {
      const getVal = (idBase) => document.getElementById(`${idBase}-${index}`)?.value || "";
      const getRadio = (namePrefix) => document.querySelector(`input[name="${namePrefix}-${index}"]:checked`)?.value || "";
      const getChecks = (namePrefix) => Array.from(document.querySelectorAll(`input[name="${namePrefix}-${index}"]:checked`)).map(el => el.value);

      return {
        roles: getChecks("supp-role"),
        // Individual
        firstName: getVal("supp-first-name"),
        middleName: getVal("supp-middle-name"),
        surname: getVal("supp-surname"),
        suffix: getVal("supp-suffix"),
        isni: getVal("supp-isni"),
        pseudonym: getVal("supp-pseudonym"),
        pseudonymIsni: getVal("supp-pseudonym-isni"),
        nameType: getRadio("supp-name-type"),
        nationality: getVal("supp-nationality"),
        alienCert: getVal("supp-alien-cert"),
        birthDate: getVal("supp-birthdate"),
        sex: getRadio("supp-sex"),
        civilStatus: getVal("supp-civil-status"),
        deceased: getRadio("supp-deceased"),
        deathDate: getVal("supp-death-date"),
        // Institutional
        institutionName: getVal("supp-institution-name"),
        institutionIsni: getVal("supp-institution-isni"),
        businessReg: getChecks("supp-business-reg"),
        businessRegOther: getVal("supp-business-reg-other"),
        // Contact
        address: getVal("supp-address"),
        city: getVal("supp-city"),
        province: getVal("supp-province"),
        region: getVal("supp-region"),
        country: getVal("supp-country"),
        zip: getVal("supp-zip"),
        email: getVal("supp-email"),
        contactNumber: getVal("supp-contact")
      };
    });
  }
}

window.addCopyrightSupplementalEntry = function() {
  captureWizardData();
  if (!wizardData.copyrightSupplementalEntries) {
    wizardData.copyrightSupplementalEntries = [];
  }
  wizardData.copyrightSupplementalEntries.push({});
  refreshWizard();
};

window.removeCopyrightSupplementalEntry = function(index) {
  captureWizardData();
  if (wizardData.copyrightSupplementalEntries && wizardData.copyrightSupplementalEntries.length > index) {
    wizardData.copyrightSupplementalEntries.splice(index, 1);
  }
  refreshWizard();
};

function renderCopyrightSupplementalStep() {
  if (!wizardData.copyrightSupplementalEntries || wizardData.copyrightSupplementalEntries.length === 0) {
    wizardData.copyrightSupplementalEntries = [{}];
  }

  const entriesHtml = wizardData.copyrightSupplementalEntries.map((entry, index) => {
    // helper for radio/checkbox
    const renderChoice = (type, name, val, label, checkedState) => {
      const isChecked = Array.isArray(checkedState) ? checkedState.includes(val) : checkedState === val;
      return `<label class="patent-choice">
        <input type="${type}" name="${name}-${index}" value="${val}" ${isChecked ? "checked" : ""} />
        <span>${label}</span>
      </label>`;
    };

    return `
      <div class="patent-editor-section copyright-supplemental-entry" style="margin-top: 24px; padding: 20px; border: 2px dashed var(--gray-200); border-radius: 12px; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="patent-paper__section-title" style="margin-bottom: 0;">${index === 0 ? 'Primary Institutional Owner' : `Supplemental Entry #${index + 1}`}</div>
          ${index > 0 ? `<button class="btn btn-sm btn-danger" onclick="removeCopyrightSupplementalEntry(${index})"><i class="fa-solid fa-trash"></i> Remove</button>` : ""}
        </div>

        <div class="patent-editor-inline-group">
          <span class="patent-editor-inline-group__label">The following information is for (Tick one box only)</span>
          <div class="patent-choice-grid">
            ${renderChoice("radio", "supp-role", "coauthor", "Co-author(s)", entry.roles || [])}
            ${renderChoice("radio", "supp-role", "copyright_owner", "Additional Copyright owner(s)", entry.roles || [])}
            ${renderChoice("radio", "supp-role", "licensee", "Additional Licensee", entry.roles || [])}
            ${renderChoice("radio", "supp-role", "mortgagee", "Additional Mortgagee", entry.roles || [])}
          </div>
        </div>

        <div class="patent-paper__section-title" style="font-size: 0.9rem; background: var(--gray-100); padding: 8px; border-radius: 6px; margin-top: 24px;">FOR INDIVIDUAL INFORMATION USE ONLY</div>

        <div class="patent-editor-grid patent-editor-grid--four">
          ${renderPatentEditorInput("First Name", `supp-first-name-${index}`, entry.firstName)}
          ${renderPatentEditorInput("Middle Name", `supp-middle-name-${index}`, entry.middleName)}
          ${renderPatentEditorInput("Surname", `supp-surname-${index}`, entry.surname)}
          ${renderPatentEditorInput("Suffix", `supp-suffix-${index}`, entry.suffix, { placeholder: "Put N/A if not applicable" })}
        </div>
        <div class="patent-editor-grid patent-editor-grid--two">
          ${renderPatentEditorInput("ISNI", `supp-isni-${index}`, entry.isni)}
          ${renderPatentEditorInput("Nationality", `supp-nationality-${index}`, entry.nationality)}
        </div>
        <div class="patent-editor-inline-group">
          <span class="patent-editor-inline-group__label">Name appearing in IPOPHL'S Copyright Search</span>
          <div class="patent-choice-grid">
            ${renderChoice("radio", "supp-name-type", "orig", "Original Name", entry.nameType)}
            ${renderChoice("radio", "supp-name-type", "anon", "Anonymous", entry.nameType)}
            ${renderChoice("radio", "supp-name-type", "pseudo", "Pseudonym", entry.nameType)}
          </div>
        </div>
        <div class="patent-editor-grid patent-editor-grid--two">
          ${renderPatentEditorInput("Pseudonym", `supp-pseudonym-${index}`, entry.pseudonym)}
          ${renderPatentEditorInput("Pseudonym's ISNI Number", `supp-pseudonym-isni-${index}`, entry.pseudonymIsni)}
        </div>
        <div class="patent-editor-grid patent-editor-grid--two">
          ${renderPatentEditorInput("Alien Certificate of Reg. No.", `supp-alien-cert-${index}`, entry.alienCert)}
          ${renderPatentEditorInput("Date of Birth", `supp-birthdate-${index}`, entry.birthDate, { type: "date" })}
        </div>
        <div class="patent-editor-grid patent-editor-grid--two">
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Sex</span>
            <div class="patent-choice-grid">
              ${renderChoice("radio", "supp-sex", "m", "Male", entry.sex)}
              ${renderChoice("radio", "supp-sex", "f", "Female", entry.sex)}
            </div>
          </div>
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Civil Status</span>
            <div class="patent-choice-grid">
              ${renderChoice("radio", "supp-civil-status", "single", "Single", entry.civilStatus)}
              ${renderChoice("radio", "supp-civil-status", "married", "Married", entry.civilStatus)}
              ${renderChoice("radio", "supp-civil-status", "widow", "Widow", entry.civilStatus)}
              ${renderChoice("radio", "supp-civil-status", "sep", "Separated/Divorced", entry.civilStatus)}
            </div>
          </div>
        </div>
        <div class="patent-editor-grid patent-editor-grid--two">
          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Is the author/creator/performer deceased?</span>
            <div class="patent-choice-grid">
              ${renderChoice("radio", "supp-deceased", "no", "No", entry.deceased)}
              ${renderChoice("radio", "supp-deceased", "yes", "Yes", entry.deceased)}
            </div>
          </div>
          ${renderPatentEditorInput("Date of Death", `supp-death-date-${index}`, entry.deathDate, { type: "date" })}
        </div>

        <div class="patent-paper__section-title" style="font-size: 0.9rem; background: var(--gray-100); padding: 8px; border-radius: 6px; margin-top: 24px;">INSTITUTIONAL INFORMATION</div>

        <div class="patent-editor-grid patent-editor-grid--two">
          ${renderPatentEditorInput("Institution / Organization Name", `supp-institution-name-${index}`, entry.institutionName)}
          ${renderPatentEditorInput("Institution ISNI", `supp-institution-isni-${index}`, entry.institutionIsni)}
        </div>
        <div class="patent-editor-inline-group">
          <span class="patent-editor-inline-group__label">Business Registration</span>
          <div class="patent-choice-grid">
            ${renderChoice("checkbox", "supp-business-reg", "dti", "Registered with DTI", entry.businessReg)}
            ${renderChoice("checkbox", "supp-business-reg", "sec", "Registered with SEC", entry.businessReg)}
            ${renderChoice("checkbox", "supp-business-reg", "not-applicable", "Not applicable", entry.businessReg)}
            ${renderChoice("checkbox", "supp-business-reg", "other", "Other", entry.businessReg)}
          </div>
        </div>
        <div class="patent-editor-grid patent-editor-grid--one">
          ${renderPatentEditorInput("Other Business Registration Details", `supp-business-reg-other-${index}`, entry.businessRegOther)}
        </div>

        <div class="patent-paper__section-title" style="font-size: 0.9rem; background: var(--gray-100); padding: 8px; border-radius: 6px; margin-top: 24px;">CONTACT INFORMATION</div>

        <div class="patent-editor-grid patent-editor-grid--one">
          ${renderPatentEditorInput("Address", `supp-address-${index}`, entry.address, { placeholder: "Street, Village, Subdivision, Barangay", fullWidth: true })}
        </div>
        <div class="patent-editor-grid patent-editor-grid--four">
          ${renderPatentEditorInput("Municipality / City", `supp-city-${index}`, entry.city)}
          ${renderPatentEditorInput("Province / State", `supp-province-${index}`, entry.province)}
          ${renderPatentEditorInput("Region", `supp-region-${index}`, entry.region)}
          ${renderPatentEditorSelect("Country", `supp-country-${index}`, entry.country || "Philippines", [
            { value: "", label: "Select country" },
            { value: "Philippines", label: "Philippines" },
            { value: "United States", label: "United States" },
            { value: "Japan", label: "Japan" },
            { value: "Singapore", label: "Singapore" },
            { value: "Australia", label: "Australia" },
          ])}
        </div>
        <div class="patent-editor-grid patent-editor-grid--three">
          ${renderPatentEditorInput("ZIP Code", `supp-zip-${index}`, entry.zip)}
          ${renderPatentEditorInput("Email Address", `supp-email-${index}`, entry.email, { type: "email" })}
          ${renderPatentEditorInput("Contact Number", `supp-contact-${index}`, entry.contactNumber)}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 1</span>
      <h2>Institutional Registration (BCRR FORM 2025-2)</h2>
      <p>Use this form to register an institutional copyright owner. You can also add additional authors, creators, licensees, or mortgagees.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${entriesHtml}
        
        <div style="margin-top: 24px; text-align: center;">
          <button class="btn btn-secondary" onclick="addCopyrightSupplementalEntry()">
            <i class="fa-solid fa-plus"></i> Add Another Entry
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCopyrightPreviewStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section ${currentWizardStep}</span>
      <h2>Final Advisory and BCRR Preview</h2>
      <p>This is the completed Advisory Service Sheet and BCRR-style output based on your samples. Go back to any section if you want to revise the final forms before submitting.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      ${renderCopyrightIntakeFormBundle()}
    </div>

    <div class="patent-gform-card">
      <h3>Submission Summary</h3>
      ${renderCopyrightSubmissionList()}
    </div>
  `;
}

function renderCopyrightIntakeFormBundle() {
  return `
    <div class="patent-paper-stack psu-form-stack">
      ${renderPatentAdvisoryServiceSheetPaper()}
      ${renderCopyrightFormSheetBundle()}
    </div>
  `;
}

function renderCopyrightSubmissionList() {
  if (wizardData.applicantTypeGroup === 'Institution') {
    const mainEntry = wizardData.copyrightSupplementalEntries?.[0];
    const summary = [
      `Main Institution: ${mainEntry?.institutionName || "Unknown"}`,
      `Entries Count: ${wizardData.copyrightSupplementalEntries?.length || 0}`,
      `Submission type: ${wizardData.copyrightSubmissionType || "electronic"}`,
      `Required uploads: ${getUploadedRequiredCount("copyright", wizardData)}/${getRequiredDocumentCount("copyright")}`,
    ];
    return `
      <ul class="patent-preview-list">
        ${summary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  const summary = [
    `Work title: ${wizardData.copyrightWorkTitle || wizardData.title || "Untitled work"}`,
    `Owner mode: ${wizardData.copyrightOwnerMode || "individual"}`,
    `Classification: ${wizardData.copyrightWorkClassification || "Not yet selected"}`,
    `Submission type: ${wizardData.copyrightSubmissionType || "electronic"}`,
    `Required uploads: ${getUploadedRequiredCount("copyright", wizardData)}/${getRequiredDocumentCount("copyright")}`,
  ];

  return `
    <ul class="patent-preview-list">
      ${summary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderCopyrightOfficialField(
  label,
  value,
  { span = 1, raw = false, valueClass = "" } = {},
) {
  return `
    <div class="copyright-cell ${span > 1 ? `copyright-cell--span-${span}` : ""}">
      <div class="copyright-cell__label">${escapeHtml(label)}</div>
      <div class="copyright-cell__value ${valueClass}">${raw ? value : escapeHtml(value || " ")}</div>
    </div>
  `;
}

function renderCopyrightOfficialRow(content, modifier = "") {
  return `<div class="copyright-grid ${modifier}">${content}</div>`;
}

function renderCopyrightOfficialMarks(
  value,
  options,
  { multiple = false, round = false } = {},
) {
  const selected = multiple ? getWizardArray(value) : wizardData[value];
  return `
    <div class="patent-official-choice-row">
      ${options
        .map(([optionValue, label]) =>
          renderPatentOfficialMark(
            label,
            multiple
              ? Array.isArray(selected) && selected.includes(optionValue)
              : selected === optionValue,
            { round },
          ),
        )
        .join("")}
    </div>
  `;
}

function renderCopyrightSectionBar(title, note = "") {
  return `
    <div class="copyright-section-bar">
      <span>${escapeHtml(title)}</span>
      ${note ? `<span class="copyright-section-bar__note">${escapeHtml(note)}</span>` : ""}
    </div>
  `;
}

function renderCopyrightOwnerPrintedName() {
  return wizardData.copyrightSignatureName || " ";
}

function renderCopyrightFormSheetBundle() {
  if (wizardData.applicantTypeGroup === 'Institution') {
    return renderCopyrightSupplementalSheetBundle();
  }

  return `
    <div class="copyright-paper-stack">
      ${renderCopyrightFormSheetPage1()}
      ${renderCopyrightFormSheetPage2()}
      ${renderCopyrightReferencePage3()}
    </div>
  `;
}

function renderCopyrightSupplementalSheetBundle() {
  const entries = wizardData.copyrightSupplementalEntries || [];
  
  if (entries.length === 0) {
    return `<div class="copyright-paper-stack"><div class="copyright-paper"><div style="padding: 40px; text-align: center;">No entries found.</div></div></div>`;
  }

  const chunks = [];
  for (let i = 0; i < entries.length; i += 2) {
    chunks.push(entries.slice(i, i + 2));
  }

  const pages = chunks.map((chunk, index) => {
    const renderLocalMarks = (valueArray, options, round = false) => {
      return `
        <div class="patent-official-choice-row">
          ${options.map(([optVal, label]) => 
            renderPatentOfficialMark(label, Array.isArray(valueArray) ? valueArray.includes(optVal) : valueArray === optVal, { round })
          ).join("")}
        </div>
      `;
    };

    const renderBlock = (entry) => {
      if (!entry) {
        entry = { institutionName: "", institutionIsni: "", businessReg: "", businessRegOther: "", address: "", city: "", province: "", region: "", country: "", zip: "", email: "", contactNumber: "" };
      }
      return `
          <div style="background: #000; color: #fff; display: flex; align-items: center; padding: 4px 8px; font-size: 0.7rem; margin-top: 8px; border: 1px solid #000;">
            <div style="display: flex; align-items: center; margin-right: 15px;">
              <span style="font-weight: 800; margin-right: 6px;">Number</span>
              <div style="background: #fff; width: 40px; height: 16px;"></div>
            </div>
            <div style="font-weight: 600; margin-right: 15px;">The following information is for (Tick one box only)</div>
            <div style="display: flex; gap: 12px; align-items: center; margin-left: 20px;">
              ${renderLocalMarks(entry.roles || [], [
                ["coauthor", "Co-author(s)"],
                ["copyright_owner", "Additional Copyright owner(s)"],
                ["licensee", "Additional Licensee"],
                ["mortgagee", "Additional Mortgagee"]
              ])}
            </div>
          </div>
          
          <div style="background: #d1d5db; border: 1px solid #000; border-top: 0; padding: 4px; font-size: 0.75rem; font-weight: 800; text-align: center;">FOR INDIVIDUAL INFORMATION USE ONLY</div>
          ${renderCopyrightOfficialRow(
            renderCopyrightOfficialField("First Name", entry.firstName) +
            renderCopyrightOfficialField("Middle Name (Put N/A if not applicable)", entry.middleName) +
            renderCopyrightOfficialField("Surname", entry.surname) +
            renderCopyrightOfficialField("Suffix (Put N/A if not applicable)", entry.suffix),
            "copyright-grid--4"
          )}
          ${renderCopyrightOfficialRow(
            renderCopyrightOfficialField("International Standard Name Identifier Number (ISNI)", entry.isni, { span: 1 }) +
            `<div class="copyright-cell copyright-cell--span-3">
              <div class="copyright-cell__label">Name appearing in IPOPHL'S Copyright Search</div>
              <div class="copyright-cell__value copyright-cell__value--choices" style="display: flex; width: 100%;">
                ${renderLocalMarks(entry.nameType || "", [["orig", "Original Name"], ["anon", "Anonymous"], ["pseudo", "Pseudonym (Please indicate):"]], false)}
                <div style="flex: 1; border-bottom: 1px solid #000; margin: 0 10px; height: 14px; font-weight: normal; overflow: hidden;">${entry.pseudonym || ''}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">Pseudonym's ISNI Number: <div style="border-bottom: 1px solid #000; width: 120px; margin-left: 5px; height: 14px; font-weight: normal; overflow: hidden;">${entry.pseudonymIsni || ''}</div></div>
              </div>
            </div>`,
            "copyright-grid--4"
          )}
          <div class="copyright-grid" style="grid-template-columns: 1fr 1fr 1fr 1.5fr;">
            <div class="copyright-cell">
              <div class="copyright-cell__label">Nationality</div>
              <div class="copyright-cell__value">${escapeHtml(entry.nationality || '')}</div>
            </div>
            <div class="copyright-cell">
              <div class="copyright-cell__label" style="line-height: 1.1;">Alien Certificate of Reg. No.<br><i style="font-weight:normal">(Put N/A if not applicable)</i></div>
              <div class="copyright-cell__value">${escapeHtml(entry.alienCert || '')}</div>
            </div>
            <div class="copyright-cell">
              <div class="copyright-cell__label" style="line-height: 1.1;">Date of Birth<br><i style="font-weight:normal">(YYYY/MM/DD)</i></div>
              <div class="copyright-cell__value">${escapeHtml(entry.birthDate || '')}</div>
            </div>
            <div class="copyright-cell" style="padding: 0; display: flex; flex-direction: row;">
              <div style="display: flex; flex-direction: column; flex: 1; padding: 4px 6px;">
                <div class="copyright-cell__label">Sex</div>
                <div class="copyright-cell__value copyright-cell__value--choices" style="border: none; background: transparent; padding: 0;">${renderLocalMarks(entry.sex || "", [["m", "Male"], ["f", "Female"]])}</div>
              </div>
              <div style="display: flex; flex-direction: column; flex: 2; padding: 4px 6px; border-left: 1px solid #000;">
                <div class="copyright-cell__label">Civil Status</div>
                <div class="copyright-cell__value copyright-cell__value--choices" style="border: none; background: transparent; padding: 0;">${renderLocalMarks(entry.civilStatus || "", [["single", "Single"], ["married", "Married"], ["widow", "Widow"], ["sep", "Separated/Divorced"]])}</div>
              </div>
            </div>
          </div>
          ${renderCopyrightOfficialRow(
            `<div style="padding: 6px 10px; display: flex; align-items: center; gap: 12px; font-size: 0.67rem; font-weight: 700; width: 100%;">
              Is the author/creator/performer deceased? 
              ${renderLocalMarks(entry.deceased || "", [["no", "No"], ["yes", "Yes"]])}
              <span style="margin-left: 10px;">Date of Death <i style="font-weight:normal">(YYYY/MM/DD)</i>:</span> 
              <div style="border-bottom: 1px solid #000; width: 120px; height: 14px; font-weight: normal; overflow: hidden;">${escapeHtml(entry.deathDate || '')}</div>
            </div>`,
            "copyright-grid"
          )}

          <div style="background: #d1d5db; border: 1px solid #000; border-top: 0; padding: 4px; font-size: 0.75rem; font-weight: 800; text-align: center;">FOR INSTITUTIONAL INFORMATION USE ONLY</div>
          ${renderCopyrightOfficialRow(
            renderCopyrightOfficialField("Name Of School/Company/Organization/Broadcaster", entry.institutionName) +
            renderCopyrightOfficialField("International Standard Name Identifier Number (ISNI)", entry.institutionIsni),
            "copyright-grid--2"
          )}
          ${renderCopyrightOfficialRow(
            `<div class="copyright-cell copyright-cell--span-2">
              <div class="copyright-cell__label">Business Registration</div>
              <div class="copyright-cell__value copyright-cell__value--choices" style="display: flex; align-items: center;">
                ${renderLocalMarks(entry.businessReg || "", [
                  ["dti", "Registered with DTI"],
                  ["sec", "Registered with SEC"],
                  ["not-applicable", "Not applicable"]
                ])}
                <div style="display: flex; align-items: center; margin-left: 10px;">
                  ${renderLocalMarks(entry.businessReg || "", [["other", "Other:"]])}
                  <div style="border-bottom: 1px solid #000; width: 100px; margin-left: 4px; font-weight: normal;">${entry.businessRegOther || ''}</div>
                </div>
              </div>
            </div>`,
            "copyright-grid"
          )}

          <div style="background: #d1d5db; border: 1px solid #000; border-top: 0; padding: 4px; font-size: 0.75rem; font-weight: 800; text-align: center;">CONTACT INFORMATION AND ADDRESS OF INDIVIDUAL OR INSTITUTION</div>
          ${renderCopyrightOfficialRow(
            renderCopyrightOfficialField("Address (Street, Village, Subdivision, Barangay)", entry.address, { span: 2 }) +
            renderCopyrightOfficialField("Municipality/City", entry.city) +
            renderCopyrightOfficialField("Province/State", entry.province),
            "copyright-grid--4"
          )}
          <div class="copyright-grid" style="grid-template-columns: 1fr 1fr 1fr 1.5fr 1.5fr;">
            ${renderCopyrightOfficialField("Region", entry.region)}
            ${renderCopyrightOfficialField("Country", entry.country)}
            ${renderCopyrightOfficialField("ZIP Code", entry.zip)}
            ${renderCopyrightOfficialField("Email Address", entry.email)}
            ${renderCopyrightOfficialField("Contact Number", entry.contactNumber)}
          </div>
      `;
    };

    return `
      <div class="copyright-paper-wrap">
        <div class="copyright-paper">
          <div class="copyright-paper__header">
            <div class="copyright-paper__brand">
              <img src="images/ipophl_logo.png" alt="IPOPHL logo" class="copyright-paper__logo" />
              <div>
                <div class="copyright-paper__meta">Republic of the Philippines</div>
                <div class="copyright-paper__agency">Intellectual Property Office of the Philippines</div>
                <div class="copyright-paper__bureau">Bureau of Copyright and Related Rights</div>
              </div>
            </div>
            <div class="copyright-paper__office">
              <div class="copyright-paper__office-copy">Intellectual Property Center<br>#28 Upper McKinley Rd., Fort Bonifacio<br>Taguig City 1634 PH<br>+63 (2) 7238-6300<br>copyright_registration@ipophil.gov.ph</div>
              <div class="copyright-paper__tag" style="margin-top: 6px;">BCRR FORM 2025-2</div>
            </div>
          </div>
          
          <div class="copyright-paper__title" style="margin-top: 15px; font-weight: 800; font-size: 1.2rem; text-align: center; line-height: 1.2;">
            Supplemental Form<br>for Additional Author/Creator/Copyright Owner/Licensee/Mortgagee
          </div>
          
          <div style="background: #000; color: #fff; font-weight: 800; padding: 4px 8px; font-size: 0.75rem; margin-top: 15px;">INSTRUCTIONS:</div>
          <div style="border: 1px solid #000; border-top: 0; padding: 6px 8px; font-size: 0.7rem; line-height: 1.4;">
            1. This form must be used for a single copyright work only with more than one author, copyright owner, licensee, or mortgagee.<br>
            2. Put (N/A) in the fields which are not applicable. For fields with boxes, use a checkmark (✓) to choose the applicable box.<br>
            3. Use additional BCRR FORM 2025-2 as needed.
          </div>

          ${renderBlock(chunk[0])}
          
          <div style="height: 12px;"></div>

          ${renderBlock(chunk[1])}
          
          <div class="copyright-paper__footer" style="margin-top: 40px; border-top: 1px solid #000; padding-top: 4px; text-align: center; font-size: 0.8rem;">
            <span>Page ${index + 1} of ${chunks.length}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="copyright-paper-stack">
      ${pages}
    </div>
  `;
}

function renderCopyrightPaperHeader(pageNumber) {
  const submissionType = wizardData.copyrightSubmissionType || "electronic";
  const submissionTypeMarkup = `
    <div class="copyright-submission-box">
      <div class="copyright-submission-box__title">Submission Type:</div>
      <div>${renderPatentOfficialMark("Electronic filing", submissionType === "electronic")}</div>
      <div>${renderPatentOfficialMark("Through IPSO (Region)", submissionType === "ipso")} <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightSubmissionRegion || "")}</span></div>
      <div>${renderPatentOfficialMark("Through ITSO", submissionType === "itso")} <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightSubmissionItso || "")}</span></div>
    </div>
  `;

  return `
    <div class="copyright-paper__header">
      <div class="copyright-paper__brand">
        <img src="images/ipophl_logo.png" alt="IPOPHL logo" class="copyright-paper__logo" />
        <div>
          <div class="copyright-paper__meta">Republic of the Philippines</div>
          <div class="copyright-paper__agency">Intellectual Property Office of the Philippines</div>
          <div class="copyright-paper__bureau">Bureau of Copyright and Related Rights</div>
        </div>
      </div>
      <div class="copyright-paper__office">
        <div class="copyright-paper__office-copy">Intellectual Property Center<br>#28 Upper McKinley Rd., Fort Bonifacio, Taguig City 1634 PH<br>+63 (2) 7238-6300 | copyright_registration@ipophil.gov.ph</div>
        <div class="copyright-paper__tag">BCRR FORM 2025-1</div>
        ${pageNumber === 1 ? submissionTypeMarkup : ""}
      </div>
    </div>
  `;
}

function renderCopyrightPaperFooter(pageNumber) {
  return `
    <div class="copyright-paper__footer">
      <span>Page ${pageNumber} of 3</span>
    </div>
  `;
}

function renderCopyrightFormSheetPage1() {
  return `
    <div class="copyright-paper-wrap">
      <div class="copyright-paper">
        ${renderCopyrightPaperHeader(1)}
        <div class="copyright-paper__title">Copyright Registry Enrollment Form</div>

        ${renderCopyrightSectionBar("INSTRUCTIONS:")}
        <div class="copyright-note-block">
          <div>1. Fill out the form completely and legibly. Do not leave any field blank. Definition of terms, requirements, and fees are indicated at the back of this form for reference.</div>
          <div>2. Use N/A for fields that are not applicable. For fields with boxes, use a checkmark (/) to choose the applicable box.</div>
          <div>3. To check whether an author, institution, or other copyright holder already has an ISNI number, search using IPOPHL's copyright database.</div>
        </div>

        <div class="copyright-two-col">
          <div class="copyright-panel">
            <div class="copyright-panel__title">TYPE OF APPLICATION</div>
            <div class="copyright-option-list">
              ${renderPatentOfficialMark("Single Filing", (wizardData.copyrightApplicationScale || "single") === "single")}
              ${renderPatentOfficialMark("Bulk Filing", wizardData.copyrightApplicationScale === "bulk")}
            </div>
            <div class="copyright-panel__title">TYPE OF APPLICATION</div>
            <div class="copyright-option-list">
              ${renderPatentOfficialMark("Local Filing", (wizardData.copyrightApplicationScope || "local") === "local")}
              ${renderPatentOfficialMark("International Filing", wizardData.copyrightApplicationScope === "international")}
            </div>
            <div class="copyright-panel__title">HARD COPY OF COPYRIGHT CERTIFICATE REQUESTED?</div>
            <div class="copyright-option-list">
              ${renderPatentOfficialMark("No", (wizardData.copyrightHardCopyRequested || "no") === "no")}
              ${renderPatentOfficialMark("Yes", wizardData.copyrightHardCopyRequested === "yes")}
              <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightHardCopyQty || "")}</span>
            </div>
          </div>
          <div class="copyright-panel">
            <div class="copyright-panel__title">TYPE OF APPLICANT</div>
            <div class="copyright-option-grid">
              ${renderCopyrightOfficialMarks("copyrightApplicantTypes", [
                ["author", "Author / Creator / Rights Holder"],
                ["licensee", "Licensee"],
                ["employer", "Employer"],
                ["heirs", "Heirs"],
                ["owner", "Copyright Owner / Assignee"],
                ["mortgagee", "Mortgagee"],
              ], { multiple: true })}
            </div>
            <div class="copyright-panel__title">ASSET SIZE OF COPYRIGHT OWNER</div>
            <div class="copyright-option-list">
              ${renderPatentOfficialMark("Small", (wizardData.copyrightAssetSize || "small") === "small")}
              ${renderPatentOfficialMark("Big", wizardData.copyrightAssetSize === "big")}
            </div>
          </div>
        </div>

        ${renderCopyrightSectionBar("COPYRIGHT OWNER INFORMATION", "Fill out either individual or institutional copyright owner.")}
        <div class="copyright-subhead">FOR INDIVIDUAL COPYRIGHT OWNER USE ONLY</div>
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("First Name", wizardData.copyrightOwnerFirstName) +
          renderCopyrightOfficialField("Middle Name", wizardData.copyrightOwnerMiddleName) +
          renderCopyrightOfficialField("Surname", wizardData.copyrightOwnerSurname) +
          renderCopyrightOfficialField("Suffix", wizardData.copyrightOwnerSuffix),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("International Standard Name Identifier (ISNI)", wizardData.copyrightOwnerIsni) +
          renderCopyrightOfficialField("Name appearing in IPOPHL's Copyright Search", renderCopyrightOfficialMarks("copyrightOwnerNameType", [
            ["original", "Original Name"],
            ["anonymous", "Anonymous"],
          ]), { raw: true, span: 2, valueClass: "copyright-cell__value--choices" }) +
          renderCopyrightOfficialField("Pseudonym's ISNI Number", wizardData.copyrightOwnerPseudonym),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Nationality", wizardData.copyrightOwnerNationality) +
          renderCopyrightOfficialField("Alien Certificate of Reg. No.", wizardData.copyrightOwnerAlienCertNo) +
          renderCopyrightOfficialField("Date of Birth (YYYY/MM/DD)", wizardData.copyrightOwnerBirthDate) +
          renderCopyrightOfficialField("Sex", renderCopyrightOfficialMarks("copyrightOwnerSex", [["male", "Male"], ["female", "Female"]], { round: true }), { raw: true, valueClass: "copyright-cell__value--choices" }) +
          renderCopyrightOfficialField("Civil Status", renderCopyrightOfficialMarks("copyrightOwnerCivilStatus", [["single", "Single"], ["married", "Married"], ["widow", "Widow"], ["separated", "Separated/Divorced"]]), { raw: true, valueClass: "copyright-cell__value--choices" }),
          "copyright-grid--5",
        )}
        <div class="copyright-inline-row">
          Is the copyright owner also the author/creator/performer?
          ${renderPatentOfficialMark("Yes", (wizardData.copyrightOwnerAlsoAuthor || "yes") === "yes")}
          ${renderPatentOfficialMark("No", wizardData.copyrightOwnerAlsoAuthor === "no")}
        </div>

        <div class="copyright-subhead">FOR INSTITUTIONAL COPYRIGHT OWNER USE ONLY</div>
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Name of School / Company / Organization / Broadcaster", wizardData.copyrightOwnerInstitutionName, { span: 2 }) +
          renderCopyrightOfficialField("International Standard Name Identifier Number (ISNI)", wizardData.copyrightOwnerInstitutionIsni) +
          renderCopyrightOfficialField("Business Registration", wizardData.copyrightOwnerBusinessRegistration),
          "copyright-grid--4",
        )}

        <div class="copyright-subhead">COPYRIGHT OWNER'S CONTACT INFORMATION</div>
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Address (Street, Village, Subdivision, Barangay)", wizardData.copyrightOwnerAddress, { span: 2 }) +
          renderCopyrightOfficialField("Municipality / City", wizardData.copyrightOwnerCity) +
          renderCopyrightOfficialField("Province / State", wizardData.copyrightOwnerProvince),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Region", wizardData.copyrightOwnerRegion) +
          renderCopyrightOfficialField("Country", wizardData.copyrightOwnerCountry) +
          renderCopyrightOfficialField("ZIP Code", wizardData.copyrightOwnerZip) +
          renderCopyrightOfficialField("Email Address", wizardData.copyrightOwnerEmail) +
          renderCopyrightOfficialField("Contact Number", wizardData.copyrightOwnerContact),
          "copyright-grid--5",
        )}

        ${renderCopyrightSectionBar("AUTHOR/CREATOR/PERFORMER INFORMATION")}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("First Name", wizardData.copyrightAuthorFirstName) +
          renderCopyrightOfficialField("Middle Name", wizardData.copyrightAuthorMiddleName) +
          renderCopyrightOfficialField("Surname", wizardData.copyrightAuthorSurname) +
          renderCopyrightOfficialField("Suffix", wizardData.copyrightAuthorSuffix),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("International Standard Name Identifier (ISNI)", wizardData.copyrightAuthorIsni) +
          renderCopyrightOfficialField("Name appearing in IPOPHL's Copyright Search", renderCopyrightOfficialMarks("copyrightAuthorNameType", [
            ["original", "Original Name"],
            ["anonymous", "Anonymous"],
          ]), { raw: true, span: 2, valueClass: "copyright-cell__value--choices" }) +
          renderCopyrightOfficialField("Pseudonym's ISNI Number", wizardData.copyrightAuthorPseudonym),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Nationality", wizardData.copyrightAuthorNationality) +
          renderCopyrightOfficialField("Alien Certificate of Reg. No.", wizardData.copyrightAuthorAlienCertNo) +
          renderCopyrightOfficialField("Date of Birth (YYYY/MM/DD)", wizardData.copyrightAuthorBirthDate) +
          renderCopyrightOfficialField("Sex", renderCopyrightOfficialMarks("copyrightAuthorSex", [["male", "Male"], ["female", "Female"]], { round: true }), { raw: true, valueClass: "copyright-cell__value--choices" }) +
          renderCopyrightOfficialField("Civil Status", renderCopyrightOfficialMarks("copyrightAuthorCivilStatus", [["single", "Single"], ["married", "Married"], ["widow", "Widow"], ["separated", "Separated/Divorced"]]), { raw: true, valueClass: "copyright-cell__value--choices" }),
          "copyright-grid--5",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Address (Street, Village, Subdivision, Barangay)", wizardData.copyrightAuthorAddress, { span: 2 }) +
          renderCopyrightOfficialField("Municipality / City", wizardData.copyrightAuthorCity) +
          renderCopyrightOfficialField("Province / State", wizardData.copyrightAuthorProvince),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Region", wizardData.copyrightAuthorRegion) +
          renderCopyrightOfficialField("Country", wizardData.copyrightAuthorCountry) +
          renderCopyrightOfficialField("ZIP Code", wizardData.copyrightAuthorZip) +
          renderCopyrightOfficialField("Email Address", wizardData.copyrightAuthorEmail) +
          renderCopyrightOfficialField("Contact Number", wizardData.copyrightAuthorContact),
          "copyright-grid--5",
        )}

        ${renderCopyrightPaperFooter(1)}
      </div>
    </div>
  `;
}

function renderCopyrightFormSheetPage2() {
  const uploadedDocs = new Set([
    ...getWizardArray("copyrightSubmittedDocs"),
    ...(wizardData.requirementUploads?.["complete-copy-of-the-work"] ? ["copy-of-work"] : []),
    ...(wizardData.requirementUploads?.["valid-philippine-id"] ? ["id-card"] : []),
  ]);

  return `
    <div class="copyright-paper-wrap">
      <div class="copyright-paper">
        <div class="copyright-paper__header copyright-paper__header--compact">
          <div class="copyright-paper__title copyright-paper__title--small">Copyright Registry Enrollment Form</div>
          <div class="copyright-paper__tag">BCRR FORM 2025-1</div>
        </div>

        ${renderCopyrightSectionBar("WORK/CREATION/PERFORMANCE/BROADCAST INFORMATION")}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Title of the Work/Creation/Broadcast/Performance", wizardData.copyrightWorkTitle || wizardData.title, { span: 2 }) +
          renderCopyrightOfficialField("Date of Creation/Broadcast/Performance", wizardData.copyrightWorkDate) +
          renderCopyrightOfficialField("Classification of the Work", getCopyrightClassificationLabel(wizardData.copyrightWorkClassification) || wizardData.copyrightWorkClassification),
          "copyright-grid--4",
        )}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Disclaimers", renderCopyrightOfficialMarks("copyrightDisclaimers", [
            ["none", "None"],
            ["text", "Text"],
            ["photos", "Photographs"],
            ["script", "Script"],
            ["choreography", "Choreographic work"],
            ["public-domain", "Previously published/public domain work"],
            ["source-code", "Source code"],
            ["lyrics", "Lyrics"],
          ], { multiple: true }), { raw: true, span: 2, valueClass: "copyright-cell__value--choices" }) +
          renderCopyrightOfficialField("Place of Creation/Broadcast/Performance", wizardData.copyrightWorkPlace) +
          renderCopyrightOfficialField(
            `${getCopyrightReferenceTypeLabel(wizardData.copyrightReferenceType)}${wizardData.copyrightReferenceType ? " No." : ""}`,
            wizardData.copyrightWorkReference,
          ),
          "copyright-grid--4",
        )}
        ${renderCopyrightPublicationIdentifierPreviewRows()}
        ${renderCopyrightOfficialRow(
          renderCopyrightOfficialField("Authorship Claim", getCopyrightSelectedAuthorshipClaimText(), { span: 4 }),
          "copyright-grid--4",
        )}

        <div class="copyright-question-strip">For the following questions, kindly put a checkmark (/) in the applicable box. If you answered YES, kindly indicate the needed information in the space provided.</div>

        <div class="copyright-inline-grid">
          <div class="copyright-inline-grid__row">Is the author/creator/performer deceased? ${renderPatentOfficialMark("No", (wizardData.copyrightAuthorDeceased || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightAuthorDeceased === "yes")} Date of Death: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightAuthorDeathDate || "")}</span></div>
          <div class="copyright-inline-grid__row">With co-author(s)? ${renderPatentOfficialMark("No", (wizardData.copyrightHasCoAuthor || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightHasCoAuthor === "yes")} <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightCoAuthorNote || "")}</span></div>
          <div class="copyright-inline-grid__row">Is the work published? ${renderPatentOfficialMark("No", (wizardData.copyrightPublished || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightPublished === "yes")} Name of Publisher: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightPublisherName || "")}</span></div>
          <div class="copyright-inline-grid__row">ISNI No.: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightPublisherIsni || "")}</span> Date of First Publication: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightPublicationDate || "")}</span> Country of First Publication: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightPublicationCountry || "")}</span></div>
          <div class="copyright-inline-grid__row">Is the work derivative work? ${renderPatentOfficialMark("No", (wizardData.copyrightDerivativeWork || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightDerivativeWork === "yes")} Name of the original work: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightOriginalWorkName || "")}</span></div>
          <div class="copyright-inline-grid__row">Type of Derivative Work: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightDerivativeType || "")}</span></div>
          <div class="copyright-inline-grid__row">Is the work derived from an indigenous knowledge, system, and practice (IKSP)? ${renderPatentOfficialMark("No", (wizardData.copyrightIndigenousSource || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightIndigenousSource === "yes")} <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightIndigenousDetails || "")}</span></div>
          <div class="copyright-inline-grid__row">Was generative artificial intelligence (AI) used in making the work? ${renderPatentOfficialMark("No", (wizardData.copyrightAiAssisted || "no") === "no")} ${renderPatentOfficialMark("Yes", wizardData.copyrightAiAssisted === "yes")} <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightAiDetails || "")}</span></div>
          <div class="copyright-inline-grid__row">For Class N applications, programming language(s) used: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightProgrammingLanguage || "")}</span></div>
          <div class="copyright-inline-grid__row">Copyright Certificate Number: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightCertificateNumber || "")}</span> Certificate Issuance Date: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightCertificateDate || "")}</span> Issued by: <span class="copyright-inline-fill">${escapeHtml(wizardData.copyrightCertificateIssuedBy || "")}</span></div>
        </div>

        <div class="copyright-declaration-list">
          <div>1. I declare that I am duly authorized to file this copyright registration/recordation application for and in behalf of all the copyright owner/s.</div>
          <div>2. I/We agreed to consult and obtain the public's or my/our contact details, to be contacted, and to receive technical advice from IPOPHL staff to discuss rights and permissions for the licensing/commercialization of my/our registered work.</div>
          <div>3. I/We authorize publishing, and I/we are giving my/our consent to the enrollment, posting of images/previews of the registered work in IPOPHL's website, IP Depot, or its authorized partner's platform for the licensing or commercialization of our work.</div>
          <div>4. I/We understand that I/We have the option to terminate said authority conferred upon IPOPHL upon written notice to the latter within 60 days upon posting of my/our work in the IP Depot.</div>
          <div>5. I/We agree to hold IPOPHL and its authorized partner/s harmless from any infringement and/or cancellation, or from any liability arising from the posting of the registered work in the IP Depot, IPOPHL or authorized partner's website or platform.</div>
          <div class="copyright-declaration-choice">${renderPatentOfficialMark("Yes, I/We Agree", (wizardData.copyrightTermsAgreement || "agree") === "agree")} ${renderPatentOfficialMark("No, I/We Disagree", wizardData.copyrightTermsAgreement === "disagree")}</div>
        </div>

        ${renderCopyrightSectionBar("DOCUMENTS SUBMITTED:")}
        <div class="copyright-doc-grid">
          ${[
            ["copy-of-work", "Copy of the Work"],
            ["sec-dti", "SEC or DTI Registration Certificate"],
            ["appointment-letter", "Appointment / Designation / Authorization Letter"],
            ["board-resolution", "Board Resolution / Secretary's Certificate"],
            ["id-card", "ID Card"],
            ["spa", "Special Power of Attorney (SPA)"],
            ["contract", "Contract / Agreement"],
            ["deed-assignment", "Deed of Assignment / License / Mortgage Agreement"],
            ["copyright-certificate", "Copyright Certificate"],
            ["others", "Others"],
          ]
            .map(([value, label]) => `<div>${renderPatentOfficialMark(label, uploadedDocs.has(value))}</div>`)
            .join("")}
        </div>

        ${renderCopyrightSectionBar("IPOPHL DATA PRIVACY STATEMENT AS PER R.A. 10173 (DATA PRIVACY ACT OF 2012) AND SIGNATURE")}
        <div class="copyright-privacy-grid">
          <div class="copyright-privacy-panel">
            <p>By ticking "WE AGREE" and affixing my signature on this form, I/We understand that I/We are giving consent for the collection, storage, sharing, publishing and other necessary processing of the personal information contained in this application, lawfully to the Intellectual Property Office of the Philippines (IPOPHL) and its partners, in the exercise of its mandate as the lead government agency for the protection of IP rights and in compliance with the provisions of RA 10173, also known as the Data Privacy Act of 2012.</p>
            <div class="copyright-declaration-choice">${renderPatentOfficialMark("WE AGREE", (wizardData.copyrightPrivacyAgreement || "agree") === "agree")} ${renderPatentOfficialMark("WE DISAGREE", wizardData.copyrightPrivacyAgreement === "disagree")}</div>
          </div>
          <div class="copyright-privacy-panel copyright-privacy-panel--signature">
            <p>I/We declare that all the information provided above and in all the requirements submitted are true and correct to the best of my/our knowledge.</p>
            <div class="copyright-signature-line"></div>
            <div class="copyright-signature-caption">APPLICANT'S SIGNATURE OVER PRINTED NAME AND DATE</div>
            <div class="copyright-signature-name">${escapeHtml(renderCopyrightOwnerPrintedName())}</div>
            <div class="copyright-signature-name">${escapeHtml(wizardData.copyrightSignatureDate || "")}</div>
          </div>
        </div>

        ${renderCopyrightPaperFooter(2)}
      </div>
    </div>
  `;
}

function renderCopyrightReferencePage3() {
  const classificationRows = COPYRIGHT_CLASSIFICATIONS.map((item) => {
    const claim = COPYRIGHT_CLASSIFICATION_GROUPS[item.claimGroup]?.label || "";
    return [item.value, item.label.replace(/^Class [A-R] - /, ""), claim];
  });

  const applicationRequirements = [
    "Filled out and signed BCRR Form 2025-1.",
    "Copy of a government-issued ID of applicant owner/s and/or author/s.",
    "For heirs: certificate of authority or affidavit.",
    "Copy of the work in the filing format.",
    "For Class A-D, G-K, M, O: electronic copy or photo of the work.",
    "For Class N: manually-coded source code in PDF or text format.",
  ];

  const fees = [
    ["Copyright Enrollment / Recordation (Region)", "PHP 550", "PHP 750"],
    ["Copyright Enrollment & Recordation (Combo-NCR)", "PHP 700", "PHP 1,050"],
    ["Discounted rate for 10-49 works of the same class and by the same author", "10-19: PHP 500", "PHP 700"],
    ["Hardcopy of Original Certificate", "PHP 70", "PHP 50"],
    ["Mailing/Courier", "Per actual charge", "Per actual charge"],
  ];

  return `
    <div class="copyright-paper-wrap">
      <div class="copyright-paper copyright-paper--reference">
        <div class="copyright-paper__header copyright-paper__header--compact">
          <div class="copyright-paper__title copyright-paper__title--small">BCRR Reference Page</div>
          <div class="copyright-paper__tag">Page 3 Reference</div>
        </div>

        <div class="copyright-reference-columns">
          <div class="copyright-reference-panel">
            <div class="copyright-reference-title">Definition of Terms / Classification of Works</div>
            <div class="copyright-reference-copy">
              <p><strong>Author:</strong> The natural person who has created the work.</p>
              <p><strong>Derivative Work:</strong> A work based upon one or more pre-existing works.</p>
              <p><strong>Published:</strong> A work offered to the public with the consent of the owner.</p>
              <p><strong>Pseudonym:</strong> A name used by the author other than the legal name.</p>
            </div>

            <table class="copyright-reference-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Classification of Works</th>
                  <th>Acceptable Authorship Claim</th>
                </tr>
              </thead>
              <tbody>
                ${classificationRows
                  .map(
                    ([code, work, claim]) => `
                      <tr>
                        <td>${code}</td>
                        <td>${escapeHtml(work)}</td>
                        <td>${escapeHtml(claim)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="copyright-reference-panel">
            <div class="copyright-reference-title">Application Requirements / Schedule of Fees</div>
            <ul class="copyright-reference-list">
              ${applicationRequirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>

            <div class="copyright-reference-subtitle">Types of Derivative Works</div>
            <div class="copyright-reference-copy">
              <p>A. Dramatization</p>
              <p>B. Abridgment</p>
              <p>C. Arrangement</p>
              <p>D. Adaptation</p>
              <p>E. Collection / Compilation</p>
            </div>

            <div class="copyright-reference-subtitle">Schedule of Fees</div>
            <table class="copyright-reference-table">
              <thead>
                <tr>
                  <th>Type of Fee</th>
                  <th>Small Entity</th>
                  <th>Big Entity</th>
                </tr>
              </thead>
              <tbody>
                ${fees
                  .map(
                    ([label, small, big]) => `
                      <tr>
                        <td>${escapeHtml(label)}</td>
                        <td>${escapeHtml(small)}</td>
                        <td>${escapeHtml(big)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${renderCopyrightPaperFooter(3)}
      </div>
    </div>
  `;
}

function captureCopyrightGoogleData() {
  captureAdvisoryServiceSheetData();

  const countries = ["Philippines", "United States", "Japan", "Singapore", "Australia"];
  const getValue = (id, fallback = "") =>
    document.getElementById(id)?.value || wizardData[fallback] || "";
  const getCheckedArray = (name, key) =>
    document.querySelector(`input[name="${name}"]`)
      ? getCheckedValuesByName(name)
      : getWizardArray(key);

  wizardData.copyrightSubmissionType =
    document.querySelector('input[name="copyrightSubmissionType"]:checked')?.value ||
    wizardData.copyrightSubmissionType ||
    "electronic";
  wizardData.copyrightSubmissionRegion = getValue("copyright-submission-region", "copyrightSubmissionRegion");
  wizardData.copyrightSubmissionItso = getValue("copyright-submission-itso", "copyrightSubmissionItso");
  wizardData.copyrightApplicationScale =
    document.querySelector('input[name="copyrightApplicationScale"]:checked')?.value ||
    wizardData.copyrightApplicationScale ||
    "single";
  wizardData.copyrightApplicationScope =
    document.querySelector('input[name="copyrightApplicationScope"]:checked')?.value ||
    wizardData.copyrightApplicationScope ||
    "local";
  wizardData.copyrightHardCopyRequested =
    document.querySelector('input[name="copyrightHardCopyRequested"]:checked')?.value ||
    wizardData.copyrightHardCopyRequested ||
    "no";
  wizardData.copyrightHardCopyQty = getValue("copyright-hard-copy-qty", "copyrightHardCopyQty");
  wizardData.copyrightApplicantTypes = getCheckedArray("copyrightApplicantTypes", "copyrightApplicantTypes");
  wizardData.copyrightAssetSize =
    document.querySelector('input[name="copyrightAssetSize"]:checked')?.value ||
    wizardData.copyrightAssetSize ||
    "small";
  wizardData.copyrightOwnerMode =
    document.querySelector('input[name="copyrightOwnerMode"]:checked')?.value ||
    wizardData.copyrightOwnerMode ||
    "individual";

  [
    ["copyright-owner-first-name", "copyrightOwnerFirstName"],
    ["copyright-owner-middle-name", "copyrightOwnerMiddleName"],
    ["copyright-owner-surname", "copyrightOwnerSurname"],
    ["copyright-owner-suffix", "copyrightOwnerSuffix"],
    ["copyright-owner-isni", "copyrightOwnerIsni"],
    ["copyright-owner-pseudonym", "copyrightOwnerPseudonym"],
    ["copyright-owner-nationality", "copyrightOwnerNationality"],
    ["copyright-owner-alien-cert", "copyrightOwnerAlienCertNo"],
    ["copyright-owner-birthdate", "copyrightOwnerBirthDate"],
    ["copyright-owner-institution-name", "copyrightOwnerInstitutionName"],
    ["copyright-owner-institution-isni", "copyrightOwnerInstitutionIsni"],
    ["copyright-owner-address", "copyrightOwnerAddress"],
    ["copyright-owner-city", "copyrightOwnerCity"],
    ["copyright-owner-province", "copyrightOwnerProvince"],
    ["copyright-owner-region", "copyrightOwnerRegion"],
    ["copyright-owner-country", "copyrightOwnerCountry"],
    ["copyright-owner-zip", "copyrightOwnerZip"],
    ["copyright-owner-email", "copyrightOwnerEmail"],
    ["copyright-owner-contact", "copyrightOwnerContact"],
    ["copyright-author-first-name", "copyrightAuthorFirstName"],
    ["copyright-author-middle-name", "copyrightAuthorMiddleName"],
    ["copyright-author-surname", "copyrightAuthorSurname"],
    ["copyright-author-suffix", "copyrightAuthorSuffix"],
    ["copyright-author-isni", "copyrightAuthorIsni"],
    ["copyright-author-pseudonym", "copyrightAuthorPseudonym"],
    ["copyright-author-nationality", "copyrightAuthorNationality"],
    ["copyright-author-alien-cert", "copyrightAuthorAlienCertNo"],
    ["copyright-author-birthdate", "copyrightAuthorBirthDate"],
    ["copyright-author-address", "copyrightAuthorAddress"],
    ["copyright-author-city", "copyrightAuthorCity"],
    ["copyright-author-province", "copyrightAuthorProvince"],
    ["copyright-author-region", "copyrightAuthorRegion"],
    ["copyright-author-country", "copyrightAuthorCountry"],
    ["copyright-author-zip", "copyrightAuthorZip"],
    ["copyright-author-email", "copyrightAuthorEmail"],
    ["copyright-author-contact", "copyrightAuthorContact"],
    ["copyright-work-title", "copyrightWorkTitle"],
    ["copyright-work-date", "copyrightWorkDate"],
    ["copyright-reference-type", "copyrightReferenceType"],
    ["copyright-work-reference", "copyrightWorkReference"],
    ["copyright-nbdb-name", "copyrightNbdbName"],
    ["copyright-issn-id-reference", "copyrightIssnIdReference"],
    ["copyright-ismn-publisher-name", "copyrightIsmnPublisherName"],
    ["copyright-other-reference-type", "copyrightOtherReferenceType"],
    ["copyright-work-place", "copyrightWorkPlace"],
    ["copyright-work-classification", "copyrightWorkClassification"],
    ["copyright-author-death-date", "copyrightAuthorDeathDate"],
    ["copyright-coauthor-note", "copyrightCoAuthorNote"],
    ["copyright-publisher-name", "copyrightPublisherName"],
    ["copyright-publisher-isni", "copyrightPublisherIsni"],
    ["copyright-publication-date", "copyrightPublicationDate"],
    ["copyright-publication-country", "copyrightPublicationCountry"],
    ["copyright-original-work-name", "copyrightOriginalWorkName"],
    ["copyright-derivative-type", "copyrightDerivativeType"],
    ["copyright-programming-language", "copyrightProgrammingLanguage"],
    ["copyright-indigenous-details", "copyrightIndigenousDetails"],
    ["copyright-ai-details", "copyrightAiDetails"],
    ["copyright-certificate-number", "copyrightCertificateNumber"],
    ["copyright-certificate-date", "copyrightCertificateDate"],
    ["copyright-certificate-issued-by", "copyrightCertificateIssuedBy"],
    ["copyright-signature-name", "copyrightSignatureName"],
  ].forEach(([id, key]) => {
    wizardData[key] = getValue(id, key);
  });

  wizardData.copyrightOwnerNameType =
    document.querySelector('input[name="copyrightOwnerNameType"]:checked')?.value ||
    wizardData.copyrightOwnerNameType ||
    "original";
  wizardData.copyrightOwnerSex =
    document.querySelector('input[name="copyrightOwnerSex"]:checked')?.value ||
    wizardData.copyrightOwnerSex ||
    "";
  wizardData.copyrightOwnerCivilStatus =
    document.getElementById("copyright-owner-civil-status")?.value ||
    wizardData.copyrightOwnerCivilStatus ||
    "";
  wizardData.copyrightOwnerAlsoAuthor =
    document.querySelector('input[name="copyrightOwnerAlsoAuthor"]:checked')?.value ||
    wizardData.copyrightOwnerAlsoAuthor ||
    "yes";
  wizardData.copyrightIsbnStatus =
    document.querySelector('input[name="copyrightIsbnStatus"]:checked')?.value ||
    wizardData.copyrightIsbnStatus ||
    "";

  wizardData.copyrightAuthorNameType =
    document.querySelector('input[name="copyrightAuthorNameType"]:checked')?.value ||
    wizardData.copyrightAuthorNameType ||
    "original";
  wizardData.copyrightAuthorSex =
    document.querySelector('input[name="copyrightAuthorSex"]:checked')?.value ||
    wizardData.copyrightAuthorSex ||
    "";
  wizardData.copyrightAuthorCivilStatus =
    document.getElementById("copyright-author-civil-status")?.value ||
    wizardData.copyrightAuthorCivilStatus ||
    "";

  wizardData.copyrightDisclaimers = getCheckedArray("copyrightDisclaimers", "copyrightDisclaimers");
  wizardData.copyrightAuthorshipClaims = getCheckedArray("copyrightAuthorshipClaims", "copyrightAuthorshipClaims");
  const allowedAuthorshipClaims = getCopyrightAuthorshipClaimOptionsForClassification(
    wizardData.copyrightWorkClassification,
  ).map((claim) => claim.value);
  if (allowedAuthorshipClaims.length) {
    wizardData.copyrightAuthorshipClaims = wizardData.copyrightAuthorshipClaims.filter((claim) =>
      allowedAuthorshipClaims.includes(claim),
    );
  }

  wizardData.copyrightAuthorDeceased =
    document.querySelector('input[name="copyrightAuthorDeceased"]:checked')?.value ||
    wizardData.copyrightAuthorDeceased ||
    "no";
  wizardData.copyrightHasCoAuthor =
    document.querySelector('input[name="copyrightHasCoAuthor"]:checked')?.value ||
    wizardData.copyrightHasCoAuthor ||
    "no";
  wizardData.copyrightPublished =
    document.querySelector('input[name="copyrightPublished"]:checked')?.value ||
    wizardData.copyrightPublished ||
    "no";
  wizardData.copyrightDerivativeWork =
    document.querySelector('input[name="copyrightDerivativeWork"]:checked')?.value ||
    wizardData.copyrightDerivativeWork ||
    "no";
  wizardData.copyrightIndigenousSource =
    document.querySelector('input[name="copyrightIndigenousSource"]:checked')?.value ||
    wizardData.copyrightIndigenousSource ||
    "no";
  wizardData.copyrightAiAssisted =
    document.querySelector('input[name="copyrightAiAssisted"]:checked')?.value ||
    wizardData.copyrightAiAssisted ||
    "no";
  wizardData.copyrightSubmittedDocs = getCheckedArray("copyrightSubmittedDocs", "copyrightSubmittedDocs");
  wizardData.copyrightTermsAgreement =
    document.querySelector('input[name="copyrightTermsAgreement"]:checked')?.value ||
    wizardData.copyrightTermsAgreement ||
    "agree";
  wizardData.copyrightPrivacyAgreement =
    document.querySelector('input[name="copyrightPrivacyAgreement"]:checked')?.value ||
    wizardData.copyrightPrivacyAgreement ||
    "agree";

  if (!countries.includes(wizardData.copyrightOwnerCountry)) {
    wizardData.copyrightOwnerCountry = "";
  }
  if (!countries.includes(wizardData.copyrightAuthorCountry)) {
    wizardData.copyrightAuthorCountry = "";
  }

  wizardData.copyrightOwnerBusinessRegistration = getCheckedArray("copyrightOwnerBusinessRegistration", "copyrightOwnerBusinessRegistration");
  wizardData.copyrightOwnerBusinessRegistrationOther = document.getElementById("copyright-owner-business-registration-other")?.value || wizardData.copyrightOwnerBusinessRegistrationOther || "";
  wizardData.copyrightOwnerInstitutionAddress = document.getElementById("copyright-owner-institution-address")?.value || wizardData.copyrightOwnerInstitutionAddress || "";
  wizardData.copyrightOwnerInstitutionCity = document.getElementById("copyright-owner-institution-city")?.value || wizardData.copyrightOwnerInstitutionCity || "";
  wizardData.copyrightOwnerInstitutionProvince = document.getElementById("copyright-owner-institution-province")?.value || wizardData.copyrightOwnerInstitutionProvince || "";
  wizardData.copyrightOwnerInstitutionRegion = document.getElementById("copyright-owner-institution-region")?.value || wizardData.copyrightOwnerInstitutionRegion || "";
  wizardData.copyrightOwnerInstitutionCountry = document.getElementById("copyright-owner-institution-country")?.value || wizardData.copyrightOwnerInstitutionCountry || "";
  wizardData.copyrightOwnerInstitutionZip = document.getElementById("copyright-owner-institution-zip")?.value || wizardData.copyrightOwnerInstitutionZip || "";
  wizardData.copyrightOwnerInstitutionEmail = document.getElementById("copyright-owner-institution-email")?.value || wizardData.copyrightOwnerInstitutionEmail || "";
  wizardData.copyrightOwnerInstitutionContact = document.getElementById("copyright-owner-institution-contact")?.value || wizardData.copyrightOwnerInstitutionContact || "";

  captureCopyrightSupplementalData();

  const ownerName =
    wizardData.copyrightOwnerMode === "institutional"
      ? wizardData.copyrightOwnerInstitutionName
      : [
          wizardData.copyrightOwnerFirstName,
          wizardData.copyrightOwnerMiddleName,
          wizardData.copyrightOwnerSurname,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
  const authorName = [
    wizardData.copyrightAuthorFirstName,
    wizardData.copyrightAuthorMiddleName,
    wizardData.copyrightAuthorSurname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  wizardData.name =
    ownerName || authorName || getPatentAdvisoryFullName() || wizardData.copyrightSignatureName || wizardData.name || "";
  wizardData.email =
    wizardData.copyrightOwnerEmail ||
    wizardData.copyrightAuthorEmail ||
    wizardData.advisoryEmail ||
    wizardData.email ||
    "";
  wizardData.contact =
    wizardData.copyrightOwnerContact ||
    wizardData.copyrightAuthorContact ||
    wizardData.advisoryContact ||
    "";
  wizardData.dept =
    wizardData.copyrightOwnerInstitutionName || wizardData.advisoryCompany || wizardData.dept || "Copyright Filing";
  wizardData.title =
    wizardData.copyrightWorkTitle || wizardData.advisoryTitle || wizardData.title || "Untitled Copyright Work";
  wizardData.worktype =
    wizardData.copyrightWorkClassification || wizardData.worktype || "";
  wizardData.description =
    wizardData.copyrightAiDetails ||
    wizardData.copyrightDerivativeType ||
    wizardData.copyrightWorkPlace ||
    wizardData.title;
  wizardData.copyrightSignatureName = wizardData.copyrightSignatureName || "";
  wizardData.copyrightSignatureDate = wizardData.copyrightSignatureDate || "";

  syncRequirementUploadsToFiles("copyright");
}

function renderPatentOfficialFooter(pageNumber) {
  return `
    <div class="patent-official-footer">
      <span>IPOPHL Form 100 - Patent Application Request</span>
      <span>IPOPHL is an ISO 9001:2015 QMS Certified government agency</span>
      <span>Page ${pageNumber} of 2</span>
    </div>
  `;
}

function renderPatentChecklistSheetRow(label, value = "") {
  return `
    <div class="patent-official-checklist-row">
      <span>${label}</span>
      <span class="patent-official-checklist-row__box">${escapeHtml(value || "")}</span>
      <span>sheets</span>
    </div>
  `;
}

function renderPatentOfficialYesNo(value) {
  return `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Yes", value === "yes", { round: true })}
      ${renderPatentOfficialMark("No", value === "no", { round: true })}
    </div>
  `;
}

function renderPatentFormSheetBundle() {
  return `
    <div class="patent-paper-stack">
      ${renderPatentFormSheet()}
      ${renderPatentFormSheetPage2()}
    </div>
  `;
}

function renderPatentFormSheetPage2() {
  const uploads = ensureRequirementUploads(wizardData);
  const patentDocs = getRequiredDocumentsForType("patent");
  const applicationRoute = wizardData.applicationRoute || "direct";
  const hasPriorityClaim =
    wizardData.priorityClaim === "yes" ||
    Boolean(
      wizardData.priorityNumber ||
        wizardData.priorityDate ||
        wizardData.priorityCountry,
    );
  const hasAgent = Boolean(
    wizardData.agentLastName ||
      wizardData.agentFirstName ||
      wizardData.agentCompany ||
      wizardData.agentRegistrationNo,
  );
  const sheetCounts = {
    request: uploads["patent-application-form"] ? "1" : "",
    description: uploads["invention-disclosure-statement"] ? "1" : "",
    claims: uploads["claims-statement"] ? "1" : "",
    abstract: uploads.abstract ? "1" : "",
    drawings:
      uploads["technical-drawings-diagrams"] ?
        wizardData.drawingsCount || "1"
      : "",
    sequence: "",
    printout: "",
    electronic: "",
  };
  const totalSheets = Object.values(sheetCounts)
    .map((value) => Number.parseInt(value || "0", 10) || 0)
    .reduce((sum, value) => sum + value, 0);
  const applicantPrintedName = wizardData.signaturePrintedName || "";
  const mailingPreference = wizardData.certificateDelivery || "pickup";
  const otherDocumentLabel =
    (wizardData.supportingNotes || "").trim() || "____________________________";
  const hasPctAnnex = applicationRoute === "pct";
  const hasDivisionalAnnex = applicationRoute === "divisional";
  const attachmentUploadsCount = Object.keys(uploads).length;

  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official patent-paper--official-page2">
        <div class="patent-official-page-head">
          <div class="patent-official-page-head__form">IPOPHL Form 100</div>
        </div>

        ${renderPatentOfficialSectionBar("CHECKLIST", "To be filled up by Applicant")}
        <div class="patent-official-checklist-grid">
          <div class="patent-official-checklist-col">
            <div class="patent-official-checklist-note">This application contains the number of sheets:</div>
            ${renderPatentChecklistSheetRow("1. Request", sheetCounts.request)}
            ${renderPatentChecklistSheetRow("2. Description", sheetCounts.description)}
            ${renderPatentChecklistSheetRow("3. Claims", sheetCounts.claims)}
            ${renderPatentChecklistSheetRow("4. Abstract", sheetCounts.abstract)}
            ${renderPatentChecklistSheetRow("5. Drawings", sheetCounts.drawings)}
            ${renderPatentChecklistSheetRow("6. Sequence listings", sheetCounts.sequence)}
            ${renderPatentChecklistSheetRow("Print-out", sheetCounts.printout)}
            ${renderPatentChecklistSheetRow("Electronic copy (PDF)", sheetCounts.electronic)}
            <div class="patent-official-checklist-total">
              <span>TOTAL</span>
              <span class="patent-official-checklist-row__box">${totalSheets || ""}</span>
              <span>sheets</span>
            </div>
          </div>

          <div class="patent-official-checklist-col patent-official-checklist-col--attachments">
            <div class="patent-official-checklist-note">This application as filed is accompanied by the items checked below:</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Separate notarized power of attorney", hasAgent)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Copy of general power of attorney", hasAgent)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Priority document/s (see Priority Claim)", hasPriorityClaim)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Deed of assignment", wizardData.applicantType && wizardData.applicantType !== "individual")}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Checklist for the payment of fees", wizardData.paymentRequested || wizardData.paymentProofUploaded || wizardData.paymentVerified)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Physical data carrier containing Sequence Listing in PDF OCR", false)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Statement of compliance to requirements of Free and Prior Informed Consent of Indigenous Cultural Community", wizardData.indigenousKnowledge === "yes")}</div>

            <div class="patent-official-checklist-subtitle">For PCT applications</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Amendments", hasPctAnnex)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Under PCT Article 19", hasPctAnnex)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Under PCT Article 34", false)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("International Search Report", hasPctAnnex)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("International Preliminary Examination", false)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("POA / ARA", hasAgent && hasPctAnnex)}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("PCT/IB/304, if applicable", false)}</div>

            <div class="patent-official-checklist-subtitle">For Divisional Applications</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Certified true copy of the parent application, if applicable", hasDivisionalAnnex)}</div>

            <div class="patent-official-checklist-subtitle">Other document/s</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark(`Other document/s (${attachmentUploadsCount} upload${attachmentUploadsCount === 1 ? "" : "s"} captured)`, attachmentUploadsCount > patentDocs.length)}</div>
            <div class="patent-official-question-detail">${escapeHtml(otherDocumentLabel)}</div>
          </div>
        </div>

        <div class="patent-official-inline-copy">
          Figure number <span class="patent-inline-box">${escapeHtml(wizardData.figureNumber || "")}</span> of the drawing (if any) is suggested to accompany the abstract for publication.
        </div>
        <div class="patent-official-inline-copy">
          <strong>Total Number of Claims:</strong> <span class="patent-inline-box">${escapeHtml(wizardData.claimsCount || "")}</span>
        </div>
        <div class="patent-official-inline-copy">If the Application for Patent is granted, Certificate of Registration to be:</div>
        <div class="patent-official-choices-line">
          ${renderPatentOfficialMark("Pickup at IPOPHL", mailingPreference === "pickup", { round: true })}
          ${renderPatentOfficialMark("Mail to Applicant", mailingPreference === "applicant-mail", { round: true })}
          ${renderPatentOfficialMark("Mail to Agent / Authorized Representative", mailingPreference === "agent-mail", { round: true })}
        </div>
        <div class="patent-official-note-line">Mailing may be subject to additional mailing fees.</div>

        ${renderPatentOfficialSectionBar("ADDITIONAL INFORMATION", "Mandatory")}
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>1.</span><span>The subject matter of the application consists of, or relates to, biological materials and/or genetic resources. (RA 10055; EO 247)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.biologicalMaterial || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.biologicalMaterialDetails || " ")}</div>
        </div>
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>2.</span><span>The subject matter of the application consists of, or relates to, traditional knowledge. (RA 10055)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.traditionalKnowledge || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.traditionalKnowledgeDetails || " ")}</div>
        </div>
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>3.</span><span>The subject matter of the application consists of, or relates to, Indigenous Knowledge Systems and Practices. (RA 10055; IPOPHL-NCIP J.A.O. No. 1, 2016)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.indigenousKnowledge || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.indigenousKnowledgeDetails || " ")}</div>
        </div>

        ${renderPatentOfficialSectionBar('IPOPHL PRIVACY STATEMENT AS PER RA 10173 ALSO KNOWN AS "DATA PRIVACY ACT OF 2012" AND SIGNATURE')}
        <div class="patent-official-signature-grid">
          <div class="patent-official-signature-panel">
            <div class="patent-official-signature-choice">
              ${renderPatentOfficialMark("Agree", (wizardData.privacyAgreement || "agree") === "agree", { round: true })}
              ${renderPatentOfficialMark("Disagree", wizardData.privacyAgreement === "disagree", { round: true })}
            </div>
            <p>By ticking the AGREE box and affixing my signature to the right, I understand that I am giving consent for the collection, storage, sharing and other necessary processing of the personal information contained in this application, lawfully to the Intellectual Property Office of the Philippines (IPOPHL) and its partners, in the exercise of its mandate as the lead government agency for the protection of IP rights and in compliance with the provisions of RA 10173, also known as the Data Privacy Act of 2012.</p>
          </div>
          <div class="patent-official-signature-panel patent-official-signature-panel--center">
            <p>I declare that all the information provided above are true and correct to the best of my knowledge.</p>
            <div class="patent-official-sign-line"></div>
            <div class="patent-official-sign-caption">SIGNATURE OVER PRINTED NAME</div>
            <div class="patent-official-sign-name">${escapeHtml(applicantPrintedName || " ")}</div>
          </div>
        </div>

        <div class="patent-official-disclaimer">
          NOTE: Submission of this Application Form and Payment of the Filing Fees do not mean that the application process is already complete. The application review process involves several stages and IPOPHL may require additional supporting documents, as needed, during said stages. This application is subject to the periods prior to the publication prescribed, if any, in the IP Code and implementing rules to which the Philippines is a signatory. An application shall be deemed complete only upon completion of all stages and requirements, and payment of all required fees.
        </div>

        ${renderPatentOfficialFooter(2)}
      </div>
    </div>
  `;
}

function renderUploadedFiles() {
  const requirementFiles = Object.values(ensureRequirementUploads(wizardData));
  const files = requirementFiles.length ? requirementFiles : wizardData.files || [];
  if (!files.length) {
    return `<div class="patent-upload-pill"><i class="fa-solid fa-folder-open"></i> No filing files attached yet</div>`;
  }

  return `
    <div class="patent-upload-list">
      ${files
        .map(
          (file) => `
            <div class="patent-upload-pill">
              <i class="fa-solid fa-file-lines"></i>
              <span>${escapeHtml(file.requirementName || file.name)}</span>
              <strong>${(file.size / 1024).toFixed(1)} KB</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderGuidedEditorHeader({
  bureau = "Bureau of Patents",
  title,
  subtitle,
  officeFields = [],
}) {
  return `
    <div class="patent-editor-header">
      <div>
        <p class="patent-paper__eyebrow">${escapeHtml(bureau)}</p>
        <h2>${escapeHtml(title)}</h2>
        <p class="patent-paper__sub">${escapeHtml(subtitle)}</p>
      </div>
      <div class="patent-editor-office">
        ${officeFields
          .map((field) =>
            renderPatentEditorInput(
              field.label,
              field.id,
              field.value || "",
              { disabled: true },
            ),
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderGuidedPartyEditorSection({
  title,
  idBase,
  keyBase,
  organizationLabel = "Organization / Institution",
  requiredName = false,
  requiredEmail = false,
}) {
  return `
    <div class="patent-editor-section">
      <div class="patent-paper__section-title">${escapeHtml(title)}</div>

      <div class="patent-editor-grid patent-editor-grid--two">
        ${renderPatentEditorInput(
          organizationLabel,
          `${idBase}-organization`,
          wizardData[`${keyBase}Organization`],
          { placeholder: "If filing through an organization" },
        )}
        ${renderPatentEditorInput(
          "Position / Title",
          `${idBase}-position`,
          wizardData[`${keyBase}Position`],
          { placeholder: "Optional" },
        )}
      </div>

      <div class="patent-editor-grid patent-editor-grid--three">
        ${renderPatentEditorInput(
          "Last Name",
          `${idBase}-last-name`,
          wizardData[`${keyBase}LastName`],
          { placeholder: "Surname", required: requiredName },
        )}
        ${renderPatentEditorInput(
          "First Name",
          `${idBase}-first-name`,
          wizardData[`${keyBase}FirstName`],
          { placeholder: "Given name", required: requiredName },
        )}
        ${renderPatentEditorInput(
          "Middle Name",
          `${idBase}-middle-name`,
          wizardData[`${keyBase}MiddleName`],
          { placeholder: "Optional" },
        )}
      </div>

      <div class="patent-editor-grid patent-editor-grid--one">
        ${renderPatentEditorInput(
          "Address",
          `${idBase}-address`,
          wizardData[`${keyBase}Address`],
          {
            placeholder: "Street, village, subdivision, barangay",
            fullWidth: true,
          },
        )}
      </div>

      <div class="patent-editor-grid patent-editor-grid--four">
        ${renderPatentEditorInput(
          "Town / City",
          `${idBase}-town`,
          wizardData[`${keyBase}Town`],
          { placeholder: "City / Municipality" },
        )}
        ${renderPatentEditorInput(
          "Province / State",
          `${idBase}-province`,
          wizardData[`${keyBase}Province`],
          { placeholder: "Province / State" },
        )}
        ${renderPatentEditorInput(
          "ZIP / Postal Code",
          `${idBase}-zip`,
          wizardData[`${keyBase}Zip`],
          { placeholder: "Postal code" },
        )}
        ${renderPatentEditorFieldShell(
          "Country of Residence",
          `<select class="patent-editor-field__control patent-editor-field__control--select" id="${idBase}-country">${renderPatentCountryOptions(
            wizardData[`${keyBase}Country`] || "",
          )}</select>`,
        )}
      </div>

      <div class="patent-editor-grid patent-editor-grid--three">
        ${renderPatentEditorInput(
          "Contact Number",
          `${idBase}-contact`,
          wizardData[`${keyBase}Contact`],
          { placeholder: "Mobile or landline" },
        )}
        ${renderPatentEditorInput(
          "Email Address",
          `${idBase}-email`,
          wizardData[`${keyBase}Email`],
          {
            type: "email",
            placeholder: "name@example.com",
            required: requiredEmail,
          },
        )}
        ${renderPatentEditorInput(
          "Nationality",
          `${idBase}-nationality`,
          wizardData[`${keyBase}Nationality`],
          { placeholder: "e.g. Filipino" },
        )}
      </div>
    </div>
  `;
}

function renderGuidedPartyOfficialSection(
  title,
  keyBase,
  organizationLabel = "Organization / Institution",
) {
  return `
    ${renderPatentOfficialSectionBar(title)}
    <div class="patent-official-row patent-official-row--two">
      ${renderPatentOfficialCell(
        organizationLabel,
        wizardData[`${keyBase}Organization`],
      )}
      ${renderPatentOfficialCell(
        "Position / Title",
        wizardData[`${keyBase}Position`],
      )}
    </div>
    <div class="patent-official-row patent-official-row--three">
      ${renderPatentOfficialCell("Last Name", wizardData[`${keyBase}LastName`])}
      ${renderPatentOfficialCell("First Name", wizardData[`${keyBase}FirstName`])}
      ${renderPatentOfficialCell(
        "Middle Name",
        wizardData[`${keyBase}MiddleName`],
      )}
    </div>
    <div class="patent-official-row patent-official-row--one">
      ${renderPatentOfficialCell(
        "Address",
        wizardData[`${keyBase}Address`],
      )}
    </div>
    <div class="patent-official-row patent-official-row--four">
      ${renderPatentOfficialCell("Town / City", wizardData[`${keyBase}Town`])}
      ${renderPatentOfficialCell(
        "Province / State",
        wizardData[`${keyBase}Province`],
      )}
      ${renderPatentOfficialCell("ZIP Code", wizardData[`${keyBase}Zip`])}
      ${renderPatentOfficialCell(
        "Country",
        wizardData[`${keyBase}Country`],
      )}
    </div>
    <div class="patent-official-row patent-official-row--three">
      ${renderPatentOfficialCell(
        "Contact Number",
        wizardData[`${keyBase}Contact`],
      )}
      ${renderPatentOfficialCell(
        "Email Address",
        wizardData[`${keyBase}Email`],
      )}
      ${renderPatentOfficialCell(
        "Nationality",
        wizardData[`${keyBase}Nationality`],
      )}
    </div>
  `;
}

function renderGuidedOfficialHeader(formNo, title) {
  return `
    <div class="patent-official-header">
      <div class="patent-official-brand">
        <img src="images/ipophl_logo.png" alt="IPOPHL logo" class="patent-official-brand__logo" />
        <div class="patent-official-brand__copy">
          <div class="patent-official-brand__agency">Intellectual Property Office of the Philippines</div>
          <div class="patent-official-brand__meta">28 Upper McKinley Rd., Fort Bonifacio, Taguig City 1634 PH</div>
          <div class="patent-official-brand__meta">+63 (2) 7238-6300 | bop@ipophil.gov.ph</div>
          <div class="patent-official-brand__title">${escapeHtml(title)}</div>
        </div>
      </div>

      <div class="patent-official-office">
        <div class="patent-official-office__form">${escapeHtml(formNo)}</div>
        <div class="patent-official-office__label">For IPOPHL use only</div>
        <div class="patent-official-office__table">
          ${renderPatentOfficialOfficeRow("Application No.", "")}
          ${renderPatentOfficialOfficeRow("Date Received", "")}
          ${renderPatentOfficialOfficeRow("Date Mailed", "")}
          ${renderPatentOfficialOfficeRow("IPSO / ITSO Code", "")}
        </div>
      </div>
    </div>
  `;
}

function renderGuidedOfficialFooter(formNo, title, pageNumber, totalPages = 2) {
  return `
    <div class="patent-official-footer">
      <span>${escapeHtml(formNo)} - ${escapeHtml(title)}</span>
      <span>IPOPHL is an ISO 9001:2015 QMS Certified government agency</span>
      <span>Page ${pageNumber} of ${totalPages}</span>
    </div>
  `;
}

function renderGuidedChecklistMetric(label, value, suffix = "") {
  return `
    <div class="patent-official-checklist-row">
      <span>${escapeHtml(label)}</span>
      <span class="patent-official-checklist-row__box">${escapeHtml(value || "")}</span>
      <span>${escapeHtml(suffix)}</span>
    </div>
  `;
}

function renderGuidedUploadChecklist(formType) {
  const uploads = ensureRequirementUploads(wizardData);
  return getRequiredDocumentsForType(formType)
    .map(
      (doc) => `
        <div class="patent-official-check-item">
          ${renderPatentOfficialMark(doc.name, Boolean(uploads[doc.key]))}
        </div>
      `,
    )
    .join("");
}

function getPartyPrintedName(keyBase) {
  const named = [
    wizardData[`${keyBase}FirstName`],
    wizardData[`${keyBase}MiddleName`],
    wizardData[`${keyBase}LastName`],
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return named || wizardData[`${keyBase}Organization`] || "";
}

function renderSimpleGuidedSummary(items) {
  return `
    <ul class="patent-gform-note-list">
      ${items
        .filter((item) => item && item.value)
        .map(
          (item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</li>`,
        )
        .join("")}
    </ul>
  `;
}

function renderUtilityEditorHeader(title, subtitle) {
  return renderGuidedEditorHeader({
    title,
    subtitle,
    officeFields: [
      { label: "Application No.", id: "utility-office-app-no" },
      { label: "Date Received", id: "utility-office-date-received" },
      { label: "Date Mailed", id: "utility-office-date-mailed" },
      { label: "Form Tag", id: "utility-office-form-tag", value: "IPOPHL Form 200" },
    ],
  });
}

function getUtilityPartyValue(keyBase, field) {
  const directValue = wizardData[`${keyBase}${field}`];
  if (directValue) return directValue;

  if (
    keyBase === "utilityMaker" &&
    (wizardData.utilityApplicantIsMaker || "no") === "yes"
  ) {
    return wizardData[`utilityApplicant${field}`] || "";
  }

  return "";
}

function getUtilityPartyPrintedName(keyBase) {
  const named = [
    getUtilityPartyValue(keyBase, "FirstName"),
    getUtilityPartyValue(keyBase, "MiddleName"),
    getUtilityPartyValue(keyBase, "LastName"),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return named || getUtilityPartyValue(keyBase, "Organization");
}

function hasUtilityPriorityClaim() {
  return (
    (wizardData.utilityPriorityClaim || "no") === "yes" ||
    Boolean(
      wizardData.utilityPriorityNumber ||
        wizardData.utilityPriorityDate ||
        wizardData.utilityPriorityCountry,
    )
  );
}

function getUtilityFormSteps() {
  return [
    "Route, Title & Applicant",
    "Maker & Representative",
    "Checklist, Mailing & Uploads",
    "Final Form 200 Preview",
  ];
}

function getUtilityProgressPercent() {
  return Math.max(25, Math.min(100, currentWizardStep * 25));
}

function renderUtilityGoogleForm(
  backTarget = "filing-hub",
  backLabel = "Filing Hub",
) {
  const steps = getUtilityFormSteps();
  const activeStepTitle = steps[currentWizardStep - 1] || steps[0];

  return `
    ${renderBackNav(backTarget, backLabel)}
    <div class="patent-gform-shell">
      <div class="patent-gform-header">
        <div class="patent-gform-header-bar" style="background:linear-gradient(135deg, #6366f1, #4338ca);"></div>
        <div class="patent-gform-card patent-gform-card--hero">
          <span class="patent-gform-kicker">IPOPHL FORM 200</span>
          <h1>Fillable Utility Model Form</h1>
          <p>Complete the Utility Model registration request online, then review a paper-style Form 200 preview before submission.</p>
          <div class="patent-gform-meta">
            <span><i class="fa-solid fa-gears"></i> 4 guided sections</span>
            <span><i class="fa-solid fa-file-lines"></i> 2-page office preview</span>
            <span><i class="fa-solid fa-building-shield"></i> IPOPHL Form 200 layout</span>
          </div>
        </div>
      </div>

      <div class="patent-gform-layout">
        <div class="patent-gform-main">
          <div class="patent-step-strip">
            ${steps
              .map(
                (step, index) => `
                  <div class="patent-step-chip ${index + 1 === currentWizardStep ? "active" : ""} ${index + 1 < currentWizardStep ? "done" : ""}">
                    <span class="patent-step-chip__num">${index + 1}</span>
                    <span class="patent-step-chip__label">${step}</span>
                  </div>
                `,
              )
              .join("")}
          </div>

          ${renderUtilityGoogleStep()}

          <div class="patent-gform-actions">
            <div class="patent-gform-actions__left">
              ${
                currentWizardStep > 1
                  ? `<button class="btn btn-secondary" onclick="prevWizardStep()"><i class="fa-solid fa-arrow-left"></i> Previous</button>`
                  : ""
              }
            </div>
            <div class="patent-gform-actions__right">
              <button class="btn btn-outline-navy" onclick="saveFormDraft()"><i class="fa-solid fa-floppy-disk"></i> Save Draft</button>
              ${
                currentWizardStep < 4
                  ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next Section <i class="fa-solid fa-arrow-right"></i></button>`
                  : `<button class="btn btn-success" onclick="submitForm()">Submit Utility Model Form <i class="fa-solid fa-paper-plane"></i></button>`
              }
            </div>
          </div>
        </div>

        <aside class="patent-gform-sidebar">
          <div class="patent-gform-card">
            <span class="patent-gform-side-label">Current Section</span>
            <h3>${activeStepTitle}</h3>
            <div class="patent-progress-bar">
              <span style="width:${getUtilityProgressPercent()}%; background:linear-gradient(135deg, #6366f1, #4338ca);"></span>
            </div>
            <p>Step ${currentWizardStep} of 4. The last step renders your completed Form 200-style preview.</p>
          </div>

          <div class="patent-gform-card">
            <span class="patent-gform-side-label">How This Works</span>
            <ul class="patent-gform-note-list">
              <li>The guided fields are arranged around the same major sections shown on IPOPHL Form 200.</li>
              <li>The last screen renders the Utility Model Registration Request as a paper-style two-page preview.</li>
              <li>Required uploads still need to be attached before submission is allowed.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderUtilityGoogleStep() {
  if (currentWizardStep === 1) return renderUtilityRouteApplicantStep();
  if (currentWizardStep === 2) return renderUtilityMakerSpecificationStep();
  if (currentWizardStep === 3) return renderUtilityUploadsStep();
  return renderUtilityPreviewStep();
}

function renderUtilityRouteApplicantStep() {
  wizardData.utilityApplicationRoute =
    wizardData.utilityApplicationRoute || "direct";
  wizardData.utilityPriorityClaim =
    wizardData.utilityPriorityClaim || (hasUtilityPriorityClaim() ? "yes" : "no");
  wizardData.utilityApplicantType =
    wizardData.utilityApplicantType || "individual";
  wizardData.utilityEntityStatus =
    wizardData.utilityEntityStatus || "small";
  wizardData.utilityApplicantIsMaker =
    wizardData.utilityApplicantIsMaker || "no";

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 1</span>
      <h2>Route, Title, and Applicant</h2>
      <p>Fill out the filing route, title, and applicant details that appear on page 1 of the Utility Model Form 200 preview.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${renderUtilityEditorHeader("Utility Model Registration Request", "Editable filing route, title, and applicant details based on IPOPHL Form 200.")}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">1. Filing Route and Title</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Application Route</span>
            <div class="patent-choice-grid patent-choice-grid--three">
              ${renderPatentChoice("utilityApplicationRoute", "direct", "Direct Filing")}
              ${renderPatentChoice("utilityApplicationRoute", "pct", "PCT")}
              ${renderPatentChoice("utilityApplicationRoute", "divisional", "Divisional")}
            </div>
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">With Claim of Priority</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("utilityPriorityClaim", "yes", "Yes")}
              ${renderPatentChoice("utilityPriorityClaim", "no", "No")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Title of Utility Model", "utility-title", wizardData.title, { placeholder: "Enter the exact title used in filing", fullWidth: true, required: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">2. Divisional, PCT, and Priority Details</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Parent Application No.", "utility-divisional-parent-no", wizardData.utilityDivisionalParentNo, { placeholder: "For divisional applications" })}
            ${renderPatentEditorInput("Parent Filing Date", "utility-divisional-parent-date", wizardData.utilityDivisionalParentDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Application Number", "utility-pct-application-no", wizardData.utilityPctApplicationNo, { placeholder: "For PCT national phase entry" })}
            ${renderPatentEditorInput("International Filing Date", "utility-pct-filing-date", wizardData.utilityPctFilingDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("International Publication Number", "utility-pct-publication-no", wizardData.utilityPctPublicationNo, { placeholder: "If applicable" })}
            ${renderPatentEditorInput("International Publication Date", "utility-pct-publication-date", wizardData.utilityPctPublicationDate, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Prior Foreign Application Number/s", "utility-priority-number", wizardData.utilityPriorityNumber, { placeholder: "If claiming priority" })}
            ${renderPatentEditorInput("Foreign Filing Date", "utility-priority-date", wizardData.utilityPriorityDate, { type: "date" })}
            ${renderPatentEditorInput("Country", "utility-priority-country", wizardData.utilityPriorityCountry, { placeholder: "Country of earlier filing" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorSelect(
              "Certified Copy Attached?",
              "utility-priority-certified",
              wizardData.utilityPriorityCertifiedCopy || "",
              [
                { value: "", label: "Select answer" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ],
              { fullWidth: true },
            )}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">3. Applicant Status</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Type of Applicant</span>
              <div class="patent-choice-grid">
                ${renderPatentChoice("utilityApplicantType", "individual", "Individual")}
                ${renderPatentChoice("utilityApplicantType", "company", "Company / Corporation")}
                ${renderPatentChoice("utilityApplicantType", "school", "School")}
                ${renderPatentChoice("utilityApplicantType", "government", "Government")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Entity Size</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("utilityEntityStatus", "big", "Big")}
                ${renderPatentChoice("utilityEntityStatus", "small", "Small")}
              </div>
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("utilityApplicantSex", "male", "Male")}
                ${renderPatentChoice("utilityApplicantSex", "female", "Female")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">The Applicant is also the Maker</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("utilityApplicantIsMaker", "yes", "Yes")}
                ${renderPatentChoice("utilityApplicantIsMaker", "no", "No")}
              </div>
            </div>
          </div>
        </div>

        ${renderGuidedPartyEditorSection({
          title: "4. Applicant Contact Details",
          idBase: "utility-applicant",
          keyBase: "utilityApplicant",
          organizationLabel: "Name of Company / Corporation / Government Agency / School",
          requiredName: true,
          requiredEmail: true,
        })}
      </div>
    </div>
  `;
}

function renderUtilityMakerSpecificationStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 2</span>
      <h2>Maker and Authorized Representative</h2>
      <p>Complete the maker and resident agent or authorized representative blocks that appear on page 1 of the finished form.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">5. Maker Information</div>
          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Maker Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("utilityMakerSex", "male", "Male")}
                ${renderPatentChoice("utilityMakerSex", "female", "Female")}
              </div>
            </div>
            <div class="patent-gform-note" style="margin:0;">
              If the applicant is also the maker, you can leave the maker fields blank and the final preview will reuse the applicant details.
            </div>
          </div>
        </div>

        ${renderGuidedPartyEditorSection({
          title: "6. Maker Contact Details",
          idBase: "utility-maker",
          keyBase: "utilityMaker",
          organizationLabel: "Institution / Department (optional)",
        })}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">7. Resident Agent / Authorized Representative</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Agent Number", "utility-agent-number", wizardData.utilityAgentNumber, { placeholder: "If available" })}
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Sex</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("utilityAgentSex", "male", "Male")}
                ${renderPatentChoice("utilityAgentSex", "female", "Female")}
              </div>
            </div>
          </div>
        </div>

        ${renderGuidedPartyEditorSection({
          title: "8. Representative Contact Details",
          idBase: "utility-agent",
          keyBase: "utilityAgent",
          organizationLabel: "Company Name / Law Firm",
        })}
      </div>
    </div>
  `;
}

function renderUtilityUploadsStep() {
  wizardData.utilityCertificateDelivery =
    wizardData.utilityCertificateDelivery || wizardData.certificateDelivery || "pickup";
  wizardData.utilityBiologicalMaterial =
    wizardData.utilityBiologicalMaterial || wizardData.biologicalMaterial || "no";
  wizardData.utilityTraditionalKnowledge =
    wizardData.utilityTraditionalKnowledge || wizardData.traditionalKnowledge || "no";
  wizardData.utilityIndigenousKnowledge =
    wizardData.utilityIndigenousKnowledge || wizardData.indigenousKnowledge || "no";
  wizardData.utilityPrivacyAgreement =
    wizardData.utilityPrivacyAgreement || wizardData.privacyAgreement || "agree";

  const uploadedCount = getUploadedRequiredCount("utility", wizardData);
  const totalRequired = getRequiredDocumentCount("utility");

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 3</span>
      <h2>Checklist, Mailing, and Uploads</h2>
      <p>Complete the second-page checklist details, mailing preference, privacy declaration, and required uploads.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">9. Checklist Sheet Counts</div>

          <div class="patent-editor-grid patent-editor-grid--four">
            ${renderPatentEditorInput("Request", "utility-request-sheets", wizardData.utilityRequestSheets, { placeholder: "Sheets" })}
            ${renderPatentEditorInput("Description", "utility-description-sheets", wizardData.utilityDescriptionSheets, { placeholder: "Sheets" })}
            ${renderPatentEditorInput("Claims", "utility-claims-sheets", wizardData.utilityClaimsSheets, { placeholder: "Sheets" })}
            ${renderPatentEditorInput("Abstract", "utility-abstract-sheets", wizardData.utilityAbstractSheets, { placeholder: "Sheets" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Drawing/s", "utility-drawings-sheets", wizardData.utilityDrawingsSheets, { placeholder: "Sheets" })}
            ${renderPatentEditorInput("Sequence Listings Print-out", "utility-sequence-printout-sheets", wizardData.utilitySequencePrintoutSheets, { placeholder: "Sheets" })}
            ${renderPatentEditorInput("Sequence Listings Electronic Copy (PDF)", "utility-sequence-electronic-sheets", wizardData.utilitySequenceElectronicSheets, { placeholder: "Sheets" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Figure Number", "utility-figure-number", wizardData.utilityFigureNumber, { placeholder: "If any" })}
            ${renderPatentEditorInput("Total Number of Claims", "utility-claims-total", wizardData.utilityClaimsTotal, { placeholder: "If any" })}
            ${renderPatentEditorInput("Printed Name for Signature", "utility-signature-name", wizardData.signaturePrintedName || "", { placeholder: "Printed name for signature block" })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Certificate of Registration Delivery</span>
            <div class="patent-choice-grid">
              ${renderPatentChoice("utilityCertificateDelivery", "pickup", "Pickup at IPOPHL")}
              ${renderPatentChoice("utilityCertificateDelivery", "applicant-mail", "Mail to Applicant")}
              ${renderPatentChoice("utilityCertificateDelivery", "agent-mail", "Mail to Agent / Authorized Representative")}
            </div>
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">10. Filing Packet Items</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Accompanying Documents</span>
            <div class="patent-choice-grid">
              ${renderCopyrightChoice("utilityAccompanyingItems", "notarized-poa", "Separate notarized power of attorney", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "general-poa", "Copy of general power of attorney", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "priority-docs", "Priority document/s", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "deed-assignment", "Deed of assignment", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "payment-fees", "Cheques for the payment of fees", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "sequence-carrier", "Physical data carrier containing sequence listing in PDF OCR", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "free-prior-informed-consent", "Statement of compliance to Free and Prior Informed Consent requirements", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-amendments", "PCT Amendments", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-article-19", "PCT Article 19", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-article-34", "PCT Article 34", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-search-report", "International Search Report", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-prelim-exam", "International Preliminary Examination", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-poa-ara", "POA / ARA", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "pct-ib-304", "PCT/IB/304", { multiple: true })}
              ${renderCopyrightChoice("utilityAccompanyingItems", "divisional-certified-copy", "Certified true copy of the parent application", { multiple: true })}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorInput("Other document/s (please specify)", "utility-other-documents", wizardData.utilityOtherDocuments, { placeholder: "Optional", fullWidth: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">11. Additional Information and Signature</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Biological materials and/or genetic resources</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("utilityBiologicalMaterial", "yes", "Yes")}
              ${renderPatentChoice("utilityBiologicalMaterial", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Nature and source of origin of the biological materials and/or genetic resources", "utility-biological-details", wizardData.biologicalMaterialDetails, { placeholder: "If yes, provide details.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Traditional knowledge</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("utilityTraditionalKnowledge", "yes", "Yes")}
              ${renderPatentChoice("utilityTraditionalKnowledge", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Nature and source of origin of the traditional knowledge", "utility-traditional-details", wizardData.traditionalKnowledgeDetails, { placeholder: "If yes, provide details.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Indigenous Knowledge Systems and Practices</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("utilityIndigenousKnowledge", "yes", "Yes")}
              ${renderPatentChoice("utilityIndigenousKnowledge", "no", "No")}
            </div>
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Nature and source of origin of the indigenous knowledge systems and practices", "utility-indigenous-details", wizardData.indigenousKnowledgeDetails, { placeholder: "If yes, provide details.", fullWidth: true })}
          </div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">IPOPHL Privacy Statement</span>
            <div class="patent-choice-grid patent-choice-grid--two">
              ${renderPatentChoice("utilityPrivacyAgreement", "agree", "Agree")}
              ${renderPatentChoice("utilityPrivacyAgreement", "disagree", "Disagree")}
            </div>
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">12. Required Uploads</div>
          <p class="patent-gform-section-copy" style="margin-top:0;">${uploadedCount} of ${totalRequired} required documents uploaded.</p>
          <div style="margin-top:18px;">${renderRequirementChecklistPanel("utility")}</div>
          <div style="margin-top:24px;">${renderDynamicRequirementUploaders("utility")}</div>
          <div id="uploadStatus" style="margin-top:24px;">${uploadedCount > 0 ? renderUploadedFiles() : ""}</div>
          <div style="margin-top:24px;">${renderConditionalPaymentUploadPanel(wizardData, { infoOnly: true })}</div>
        </div>
      </div>
    </div>
  `;
}

function renderUtilityPreviewStep() {
  const route = wizardData.utilityApplicationRoute || "direct";
  const routeLabel =
    route === "pct" ? "PCT" : route === "divisional" ? "Divisional" : "Direct";

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 4</span>
      <h2>Final Form 200 Preview</h2>
      <p>The preview below composes your utility model submission into a paper-style layout based on the IPOPHL Form 200 Utility Model Registration Request.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      ${renderUtilityFormSheetBundle()}
    </div>

    <div class="patent-gform-card">
      <h3>Submission Summary</h3>
      ${renderSimpleGuidedSummary([
        { label: "Applicant", value: getPartyPrintedName("utilityApplicant") },
        { label: "Maker", value: getUtilityPartyPrintedName("utilityMaker") },
        { label: "Title", value: wizardData.title },
        { label: "Route", value: hasUtilityPriorityClaim() ? `${routeLabel} / w/ Claim of Priority` : routeLabel },
        { label: "Uploaded Requirements", value: `${getUploadedRequiredCount("utility", wizardData)} / ${getRequiredDocumentCount("utility")}` },
      ])}
    </div>
  `;
}

function renderUtilityFormSheetBundle() {
  return `
    <div class="patent-paper-stack">
      ${renderUtilityFormSheetPage1()}
      ${renderUtilityFormSheetPage2()}
    </div>
  `;
}

function renderUtilityFormSheetPage1() {
  const route = wizardData.utilityApplicationRoute || "direct";
  const applicantType = wizardData.utilityApplicantType || "individual";
  const entityStatus = wizardData.utilityEntityStatus || "small";
  const priorityRows = [
    {
      number: wizardData.utilityPriorityNumber,
      date: formatPatentOfficialDate(wizardData.utilityPriorityDate),
      country: wizardData.utilityPriorityCountry,
      certified: wizardData.utilityPriorityCertifiedCopy,
    },
    { number: "", date: "", country: "", certified: "" },
    { number: "", date: "", country: "", certified: "" },
  ];
  const applicantTypeMarkup = [
    ["individual", "Individual"],
    ["company", "Company / Corporation"],
    ["school", "School"],
    ["government", "Government"],
  ]
    .map(([value, label]) =>
      renderPatentOfficialMark(label, applicantType === value),
    )
    .join("");
  const entityMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Big", entityStatus === "big", { round: true })}
      ${renderPatentOfficialMark("Small", entityStatus === "small", { round: true })}
    </div>
  `;
  const applicantSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", wizardData.utilityApplicantSex === "male", { round: true })}
      ${renderPatentOfficialMark("Female", wizardData.utilityApplicantSex === "female", { round: true })}
    </div>
  `;
  const makerSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", getUtilityPartyValue("utilityMaker", "Sex") === "male", { round: true })}
      ${renderPatentOfficialMark("Female", getUtilityPartyValue("utilityMaker", "Sex") === "female", { round: true })}
    </div>
  `;
  const agentSexMarkup = `
    <div class="patent-official-choice-row">
      ${renderPatentOfficialMark("Male", wizardData.utilityAgentSex === "male", { round: true })}
      ${renderPatentOfficialMark("Female", wizardData.utilityAgentSex === "female", { round: true })}
    </div>
  `;

  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official">
        <div class="patent-official-header">
          <div class="patent-official-brand">
            <img src="images/ipophl_logo.png" alt="IPOPHL logo" class="patent-official-brand__logo" />
            <div class="patent-official-brand__copy">
              <div class="patent-official-brand__agency">Intellectual Property Office of the Philippines</div>
              <div class="patent-official-brand__meta">28 Upper McKinley Rd, Fort Bonifacio, Taguig City 1634 PH</div>
              <div class="patent-official-brand__meta">+63 (2) 7238-6300 | ask@ipophil.gov.ph</div>
              <div class="patent-official-brand__title">UTILITY MODEL REGISTRATION REQUEST</div>
            </div>
          </div>

          <div class="patent-official-office">
            <div class="patent-official-office__form">IPOPHL Form 200</div>
            <div class="patent-official-office__label">For IPOPHL use only</div>
            <div class="patent-official-office__table">
              ${renderPatentOfficialOfficeRow("Application No.", "")}
              ${renderPatentOfficialOfficeRow("Date Received", "")}
              ${renderPatentOfficialOfficeRow("Date Mailed", "")}
              ${renderPatentOfficialOfficeRow("IPSO / ITSO Code", "")}
            </div>
          </div>
        </div>

        <div class="patent-official-route">
          ${renderPatentOfficialMark("Direct", route === "direct")}
          ${renderPatentOfficialMark("PCT", route === "pct")}
          ${renderPatentOfficialMark("Divisional", route === "divisional")}
          ${renderPatentOfficialMark("w/ Claim of Priority", hasUtilityPriorityClaim())}
        </div>

        ${renderPatentOfficialSectionBar("TITLE OF UTILITY MODEL")}
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("", wizardData.title, { cellClass: "patent-official-cell--compact" })}
        </div>

        ${renderPatentOfficialSectionBar("DIVISIONAL INFORMATION", "For Divisional Applications, if applicable")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Parent Application No.", wizardData.utilityDivisionalParentNo)}
          ${renderPatentOfficialCell("Parent Filing Date", formatPatentOfficialDate(wizardData.utilityDivisionalParentDate))}
        </div>

        ${renderPatentOfficialSectionBar("PCT INFORMATION", "For National Phase Entry Applications, if applicable")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("International Application Number", wizardData.utilityPctApplicationNo)}
          ${renderPatentOfficialCell("International Filing Date (yyyy/mm/dd)", formatPatentOfficialDate(wizardData.utilityPctFilingDate))}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("International Publication Number", wizardData.utilityPctPublicationNo)}
          ${renderPatentOfficialCell("International Publication Date (yyyy/mm/dd)", formatPatentOfficialDate(wizardData.utilityPctPublicationDate))}
        </div>

        ${renderPatentOfficialSectionBar("PRIORITY CLAIM/S", "If applicable")}
        <div class="patent-official-row patent-official-row--priority-head">
          <div class="patent-official-head-cell">Prior Foreign Application Number/s</div>
          <div class="patent-official-head-cell">Foreign Filing Date (yyyy/mm/dd)</div>
          <div class="patent-official-head-cell">Country</div>
          <div class="patent-official-head-cell">Certified Copy attached?</div>
        </div>
        ${priorityRows
          .map(
            (row) => `
              <div class="patent-official-row patent-official-row--priority">
                ${renderPatentOfficialCell("", row.number, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", row.date, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", row.country, { cellClass: "patent-official-cell--compact" })}
                ${renderPatentOfficialCell("", renderPatentOfficialYesNo(row.certified), {
                  raw: true,
                  cellClass: "patent-official-cell--compact",
                  valueClass: "patent-official-cell__value--choices",
                })}
              </div>
            `,
          )
          .join("")}
        <div class="patent-official-note-line">To add more priority claim/s, please use IPOPHL Form 120 - Supplemental Priority Form</div>

        ${renderPatentOfficialSectionBar("APPLICANT INFORMATION", "For individual applicants, you may skip Name of Company/Government/School and Position fields")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Type of Applicant", applicantTypeMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
          ${renderPatentOfficialCell(
            "Name of Company / Corporation / Government Agency / School",
            `
              <div>${escapeHtml(wizardData.utilityApplicantOrganization || " ")}</div>
              <div style="margin-top:6px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <strong>Entity</strong>
                ${entityMarkup}
              </div>
            `,
            { raw: true },
          )}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Position", wizardData.utilityApplicantPosition)}
          ${renderPatentOfficialCell("Sex", applicantSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Last Name", wizardData.utilityApplicantLastName)}
          ${renderPatentOfficialCell("First Name", wizardData.utilityApplicantFirstName)}
          ${renderPatentOfficialCell("Middle Name", wizardData.utilityApplicantMiddleName)}
          ${renderPatentOfficialCell("The Applicant is also the Maker", renderPatentOfficialYesNo(wizardData.utilityApplicantIsMaker || "no"), {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", wizardData.utilityApplicantAddress)}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", wizardData.utilityApplicantTown)}
          ${renderPatentOfficialCell("Province / State", wizardData.utilityApplicantProvince)}
          ${renderPatentOfficialCell("Zip Code", wizardData.utilityApplicantZip)}
          ${renderPatentOfficialCell("Country of Residence", wizardData.utilityApplicantCountry)}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", wizardData.utilityApplicantContact)}
          ${renderPatentOfficialCell("Email Address (Required)", wizardData.utilityApplicantEmail)}
          ${renderPatentOfficialCell("Nationality", wizardData.utilityApplicantNationality)}
        </div>
        <div class="patent-official-note-line">At least one Applicant is mandatory. The applicant with no agent or authorized representative must inform the office of any changes in the contact information.</div>

        ${renderPatentOfficialSectionBar("MAKER INFORMATION", "If the maker is not the same as the applicant")}
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Last Name", getUtilityPartyValue("utilityMaker", "LastName"))}
          ${renderPatentOfficialCell("First Name", getUtilityPartyValue("utilityMaker", "FirstName"))}
          ${renderPatentOfficialCell("Middle Name", getUtilityPartyValue("utilityMaker", "MiddleName"))}
          ${renderPatentOfficialCell("Sex", makerSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", getUtilityPartyValue("utilityMaker", "Address"))}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", getUtilityPartyValue("utilityMaker", "Town"))}
          ${renderPatentOfficialCell("Province / State", getUtilityPartyValue("utilityMaker", "Province"))}
          ${renderPatentOfficialCell("Zip Code", getUtilityPartyValue("utilityMaker", "Zip"))}
          ${renderPatentOfficialCell("Country of Residence", getUtilityPartyValue("utilityMaker", "Country"))}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", getUtilityPartyValue("utilityMaker", "Contact"))}
          ${renderPatentOfficialCell("Email Address (Required)", getUtilityPartyValue("utilityMaker", "Email"))}
          ${renderPatentOfficialCell("Nationality", getUtilityPartyValue("utilityMaker", "Nationality"))}
        </div>
        <div class="patent-official-note-line">At least one Maker is mandatory. To add more makers, please use IPOPHL Form 110 - Supplemental Sheet</div>

        ${renderPatentOfficialSectionBar("RESIDENT AGENT / AUTHORIZED REPRESENTATIVE", "If supplied, all correspondences will be sent to this contact")}
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Agent Number (if available)", wizardData.utilityAgentNumber)}
          ${renderPatentOfficialCell("Company Name (The law firm, if applicable)", wizardData.utilityAgentOrganization)}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Position", wizardData.utilityAgentPosition)}
          ${renderPatentOfficialCell("Sex", agentSexMarkup, {
            raw: true,
            valueClass: "patent-official-cell__value--choices",
          })}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Last Name", wizardData.utilityAgentLastName)}
          ${renderPatentOfficialCell("First Name", wizardData.utilityAgentFirstName)}
          ${renderPatentOfficialCell("Middle Name", wizardData.utilityAgentMiddleName)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Address (Complete street info, village, subdivision, barangay)", wizardData.utilityAgentAddress)}
        </div>
        <div class="patent-official-row patent-official-row--four">
          ${renderPatentOfficialCell("Town / City", wizardData.utilityAgentTown)}
          ${renderPatentOfficialCell("Province / State", wizardData.utilityAgentProvince)}
          ${renderPatentOfficialCell("Zip Code", wizardData.utilityAgentZip)}
          ${renderPatentOfficialCell("Country of Residence", wizardData.utilityAgentCountry)}
        </div>
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Contact No.", wizardData.utilityAgentContact)}
          ${renderPatentOfficialCell("Email Address (Required)", wizardData.utilityAgentEmail)}
          ${renderPatentOfficialCell("Nationality", wizardData.utilityAgentNationality)}
        </div>
        <div class="patent-official-note-line">Agent or authorized representative must inform the office of any changes in the contact information.</div>

        ${renderGuidedOfficialFooter(
          "IPOPHL Form 200",
          "Utility Model Registration Request",
          1,
        )}
      </div>
    </div>
  `;
}

function renderUtilityFormSheetPage2() {
  const selectedItems = new Set(getWizardArray("utilityAccompanyingItems"));
  const sheetCounts = {
    request: wizardData.utilityRequestSheets || "",
    description: wizardData.utilityDescriptionSheets || "",
    claims: wizardData.utilityClaimsSheets || "",
    abstract: wizardData.utilityAbstractSheets || "",
    drawings: wizardData.utilityDrawingsSheets || "",
    printout: wizardData.utilitySequencePrintoutSheets || "",
    electronic: wizardData.utilitySequenceElectronicSheets || "",
  };
  const totalSheets = Object.values(sheetCounts)
    .map((value) => Number.parseInt(value || "0", 10) || 0)
    .reduce((sum, value) => sum + value, 0);
  const mailingPreference = wizardData.certificateDelivery || "pickup";
  const applicantPrintedName = wizardData.signaturePrintedName || "";

  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official patent-paper--official-page2">
        <div class="patent-official-page-head">
          <span class="patent-official-page-head__form">UTILITY MODEL REGISTRATION REQUEST</span>
          <span>IPOPHL Form 200</span>
        </div>

        ${renderPatentOfficialSectionBar("CHECKLIST", "To be filled up by Applicant")}
        <div class="patent-official-checklist-grid">
          <div class="patent-official-checklist-col">
            <div class="patent-official-checklist-note">This application contains the number of sheets:</div>
            ${renderPatentChecklistSheetRow("1. Request", sheetCounts.request)}
            ${renderPatentChecklistSheetRow("2. Description", sheetCounts.description)}
            ${renderPatentChecklistSheetRow("3. Claims", sheetCounts.claims)}
            ${renderPatentChecklistSheetRow("4. Abstract", sheetCounts.abstract)}
            ${renderPatentChecklistSheetRow("5. Drawing/s", sheetCounts.drawings)}
            <div class="patent-official-checklist-row">
              <span>6. Sequence Listings:</span>
              <span class="patent-official-checklist-row__box"></span>
              <span></span>
            </div>
            ${renderPatentChecklistSheetRow("Print-out", sheetCounts.printout)}
            ${renderPatentChecklistSheetRow("Electronic copy (PDF)", sheetCounts.electronic)}
            <div class="patent-official-checklist-total">
              <span>TOTAL</span>
              <span class="patent-official-checklist-row__box">${totalSheets || ""}</span>
              <span>sheets</span>
            </div>
          </div>

          <div class="patent-official-checklist-col patent-official-checklist-col--attachments">
            <div class="patent-official-checklist-note">This application as filed is accompanied by the items checked below:</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Separate notarized power of attorney", selectedItems.has("notarized-poa"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Copy of general power of attorney", selectedItems.has("general-poa"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Priority document/s (see Priority Claim)", selectedItems.has("priority-docs"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Deed of assignment", selectedItems.has("deed-assignment"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Cheques for the payment of fees", selectedItems.has("payment-fees"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Physical data carrier containing Sequence Listing in PDF OCR", selectedItems.has("sequence-carrier"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Statement of compliance to requirements of Free and Prior Informed Consent of Indigenous Cultural Community", selectedItems.has("free-prior-informed-consent"))}</div>

            <div class="patent-official-checklist-subtitle">For PCT Applications</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Amendments", selectedItems.has("pct-amendments"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Under PCT Article 19", selectedItems.has("pct-article-19"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Under PCT Article 34", selectedItems.has("pct-article-34"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("International Search Report", selectedItems.has("pct-search-report"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("International Preliminary Examination", selectedItems.has("pct-prelim-exam"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("POA / ARA", selectedItems.has("pct-poa-ara"))}</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("PCT/IB/304, if applicable", selectedItems.has("pct-ib-304"))}</div>

            <div class="patent-official-checklist-subtitle">For Divisional Applications</div>
            <div class="patent-official-check-item">${renderPatentOfficialMark("Certified true copy of the parent application, if applicable", selectedItems.has("divisional-certified-copy"))}</div>

            <div class="patent-official-checklist-subtitle">Other document/s (please specify)</div>
            <div class="patent-official-question-detail">${escapeHtml(wizardData.utilityOtherDocuments || " ")}</div>
          </div>
        </div>

        <div class="patent-official-inline-copy">
          Figure number <span class="patent-inline-box">${escapeHtml(wizardData.utilityFigureNumber || "")}</span> of the drawing (if any) is suggested to accompany the abstract for publication.
        </div>
        <div class="patent-official-inline-copy">
          <strong>Total Number of Claims:</strong> <span class="patent-inline-box">${escapeHtml(wizardData.utilityClaimsTotal || "")}</span>
        </div>
        <div class="patent-official-inline-copy">If the Application for Utility Model is granted, Certificate of Registration to be:</div>
        <div class="patent-official-choices-line">
          ${renderPatentOfficialMark("Pickup at IPOPHL", mailingPreference === "pickup", { round: true })}
          ${renderPatentOfficialMark("Mail to Applicant", mailingPreference === "applicant-mail", { round: true })}
          ${renderPatentOfficialMark("Mail to Agent / Authorized Representative", mailingPreference === "agent-mail", { round: true })}
        </div>
        <div class="patent-official-note-line">Mailings may be subject to additional mailing fees.</div>

        ${renderPatentOfficialSectionBar("ADDITIONAL INFORMATION", "Mandatory")}
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>1.</span><span>The subject matter of the application consists of, or relates to, biological materials and/or genetic resources. (RA 10055; EO 247)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.biologicalMaterial || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.biologicalMaterialDetails || " ")}</div>
        </div>
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>2.</span><span>The subject matter of the application consists of, or relates to, traditional knowledge. (RA 10055)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.traditionalKnowledge || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.traditionalKnowledgeDetails || " ")}</div>
        </div>
        <div class="patent-official-question-block">
          <div class="patent-official-question-title"><span>3.</span><span>The subject matter of the application consists of, or relates to, Indigenous Knowledge Systems and Practices. (RA 10055; IPOPHL-NCIP J.A.O. No. 1, 2016)</span></div>
          <div class="patent-official-question-meta">${renderPatentOfficialYesNo(wizardData.indigenousKnowledge || "no")}</div>
          <div class="patent-official-question-detail">${escapeHtml(wizardData.indigenousKnowledgeDetails || " ")}</div>
        </div>

        ${renderPatentOfficialSectionBar('IPOPHL PRIVACY STATEMENT AS PER RA 10173 ALSO KNOWN AS "DATA PRIVACY ACT OF 2012" AND SIGNATURE')}
        <div class="patent-official-signature-grid">
          <div class="patent-official-signature-panel">
            <div class="patent-official-signature-choice">
              ${renderPatentOfficialMark("Agree", (wizardData.privacyAgreement || "agree") === "agree", { round: true })}
              ${renderPatentOfficialMark("Disagree", wizardData.privacyAgreement === "disagree", { round: true })}
            </div>
            <p>By ticking the AGREE box and affixing my signature to the right, I understand that I am giving consent for the collection, storage, sharing and other necessary processing of the personal information contained in this application, freely and voluntarily, to the Intellectual Property Office of the Philippines (IPOPHL) and its partners, in the exercise of its mandate as the lead government agency for the protection of IP rights and in compliance with the provisions of RA 10173, also known as the Data Privacy Act of 2012.</p>
          </div>
          <div class="patent-official-signature-panel patent-official-signature-panel--center">
            <p>I declare that all the information provided above are true and correct to the best of my knowledge.</p>
            <div class="patent-official-sign-line"></div>
            <div class="patent-official-sign-caption">SIGNATURE OVER PRINTED NAME</div>
            <div class="patent-official-sign-name">${escapeHtml(applicantPrintedName || " ")}</div>
          </div>
        </div>

        <div class="patent-official-disclaimer">
          NOTE: Submission of this Application Form and Payment of the Filing Fees do not mean that the application process is already complete. The application review process involves several stages and IPOPHL may request additional supporting documents, as needed, during said stages. This application is subject to the periods prior to the publication prescribed, if any, in the IP Code and international treaties to which the Philippines is a signatory. An application shall be deemed complete only upon completion of all stages and requirements, and payment of all required fees.
        </div>

        ${renderGuidedOfficialFooter(
          "IPOPHL Form 200",
          "Utility Model Registration Request",
          2,
        )}
      </div>
    </div>
  `;
}

function captureUtilityGoogleData() {
  wizardData.utilityApplicationRoute =
    document.querySelector('input[name="utilityApplicationRoute"]:checked')?.value ||
    wizardData.utilityApplicationRoute ||
    "direct";
  wizardData.utilityPriorityClaim =
    document.querySelector('input[name="utilityPriorityClaim"]:checked')?.value ||
    wizardData.utilityPriorityClaim ||
    (hasUtilityPriorityClaim() ? "yes" : "no");
  wizardData.utilityApplicantType =
    document.querySelector('input[name="utilityApplicantType"]:checked')?.value ||
    wizardData.utilityApplicantType ||
    "individual";
  wizardData.utilityEntityStatus =
    document.querySelector('input[name="utilityEntityStatus"]:checked')?.value ||
    wizardData.utilityEntityStatus ||
    "small";
  wizardData.utilityApplicantSex =
    document.querySelector('input[name="utilityApplicantSex"]:checked')?.value ||
    wizardData.utilityApplicantSex ||
    "";
  wizardData.utilityApplicantIsMaker =
    document.querySelector('input[name="utilityApplicantIsMaker"]:checked')?.value ||
    wizardData.utilityApplicantIsMaker ||
    "no";
  wizardData.utilityMakerSex =
    document.querySelector('input[name="utilityMakerSex"]:checked')?.value ||
    wizardData.utilityMakerSex ||
    "";
  wizardData.utilityAgentSex =
    document.querySelector('input[name="utilityAgentSex"]:checked')?.value ||
    wizardData.utilityAgentSex ||
    "";
  wizardData.utilityDivisionalParentNo =
    document.getElementById("utility-divisional-parent-no")?.value ||
    wizardData.utilityDivisionalParentNo ||
    "";
  wizardData.utilityDivisionalParentDate =
    document.getElementById("utility-divisional-parent-date")?.value ||
    wizardData.utilityDivisionalParentDate ||
    "";
  wizardData.utilityPctApplicationNo =
    document.getElementById("utility-pct-application-no")?.value ||
    wizardData.utilityPctApplicationNo ||
    "";
  wizardData.utilityPctFilingDate =
    document.getElementById("utility-pct-filing-date")?.value ||
    wizardData.utilityPctFilingDate ||
    "";
  wizardData.utilityPctPublicationNo =
    document.getElementById("utility-pct-publication-no")?.value ||
    wizardData.utilityPctPublicationNo ||
    "";
  wizardData.utilityPctPublicationDate =
    document.getElementById("utility-pct-publication-date")?.value ||
    wizardData.utilityPctPublicationDate ||
    "";
  wizardData.utilityPriorityNumber =
    document.getElementById("utility-priority-number")?.value ||
    wizardData.utilityPriorityNumber ||
    "";
  wizardData.utilityPriorityDate =
    document.getElementById("utility-priority-date")?.value ||
    wizardData.utilityPriorityDate ||
    "";
  wizardData.utilityPriorityCountry =
    document.getElementById("utility-priority-country")?.value ||
    wizardData.utilityPriorityCountry ||
    "";
  wizardData.utilityPriorityCertifiedCopy =
    document.getElementById("utility-priority-certified")?.value ||
    wizardData.utilityPriorityCertifiedCopy ||
    "";
  wizardData.utilityAgentNumber =
    document.getElementById("utility-agent-number")?.value ||
    wizardData.utilityAgentNumber ||
    "";
  wizardData.certificateDelivery =
    document.querySelector('input[name="utilityCertificateDelivery"]:checked')?.value ||
    wizardData.certificateDelivery ||
    "pickup";
  wizardData.utilityCertificateDelivery = wizardData.certificateDelivery;
  wizardData.utilityAccompanyingItems =
    getCheckedValuesByName("utilityAccompanyingItems");
  wizardData.biologicalMaterial =
    document.querySelector('input[name="utilityBiologicalMaterial"]:checked')?.value ||
    wizardData.biologicalMaterial ||
    "no";
  wizardData.utilityBiologicalMaterial = wizardData.biologicalMaterial;
  wizardData.traditionalKnowledge =
    document.querySelector('input[name="utilityTraditionalKnowledge"]:checked')?.value ||
    wizardData.traditionalKnowledge ||
    "no";
  wizardData.utilityTraditionalKnowledge = wizardData.traditionalKnowledge;
  wizardData.indigenousKnowledge =
    document.querySelector('input[name="utilityIndigenousKnowledge"]:checked')?.value ||
    wizardData.indigenousKnowledge ||
    "no";
  wizardData.utilityIndigenousKnowledge = wizardData.indigenousKnowledge;
  wizardData.privacyAgreement =
    document.querySelector('input[name="utilityPrivacyAgreement"]:checked')?.value ||
    wizardData.privacyAgreement ||
    "agree";
  wizardData.utilityPrivacyAgreement = wizardData.privacyAgreement;

  [
    ["utilityApplicantOrganization", "utility-applicant-organization"],
    ["utilityApplicantPosition", "utility-applicant-position"],
    ["utilityApplicantLastName", "utility-applicant-last-name"],
    ["utilityApplicantFirstName", "utility-applicant-first-name"],
    ["utilityApplicantMiddleName", "utility-applicant-middle-name"],
    ["utilityApplicantAddress", "utility-applicant-address"],
    ["utilityApplicantTown", "utility-applicant-town"],
    ["utilityApplicantProvince", "utility-applicant-province"],
    ["utilityApplicantZip", "utility-applicant-zip"],
    ["utilityApplicantCountry", "utility-applicant-country"],
    ["utilityApplicantContact", "utility-applicant-contact"],
    ["utilityApplicantEmail", "utility-applicant-email"],
    ["utilityApplicantNationality", "utility-applicant-nationality"],
    ["utilityMakerOrganization", "utility-maker-organization"],
    ["utilityMakerPosition", "utility-maker-position"],
    ["utilityMakerLastName", "utility-maker-last-name"],
    ["utilityMakerFirstName", "utility-maker-first-name"],
    ["utilityMakerMiddleName", "utility-maker-middle-name"],
    ["utilityMakerAddress", "utility-maker-address"],
    ["utilityMakerTown", "utility-maker-town"],
    ["utilityMakerProvince", "utility-maker-province"],
    ["utilityMakerZip", "utility-maker-zip"],
    ["utilityMakerCountry", "utility-maker-country"],
    ["utilityMakerContact", "utility-maker-contact"],
    ["utilityMakerEmail", "utility-maker-email"],
    ["utilityMakerNationality", "utility-maker-nationality"],
    ["utilityAgentOrganization", "utility-agent-organization"],
    ["utilityAgentPosition", "utility-agent-position"],
    ["utilityAgentLastName", "utility-agent-last-name"],
    ["utilityAgentFirstName", "utility-agent-first-name"],
    ["utilityAgentMiddleName", "utility-agent-middle-name"],
    ["utilityAgentAddress", "utility-agent-address"],
    ["utilityAgentTown", "utility-agent-town"],
    ["utilityAgentProvince", "utility-agent-province"],
    ["utilityAgentZip", "utility-agent-zip"],
    ["utilityAgentCountry", "utility-agent-country"],
    ["utilityAgentContact", "utility-agent-contact"],
    ["utilityAgentEmail", "utility-agent-email"],
    ["utilityAgentNationality", "utility-agent-nationality"],
    ["utilityRequestSheets", "utility-request-sheets"],
    ["utilityDescriptionSheets", "utility-description-sheets"],
    ["utilityClaimsSheets", "utility-claims-sheets"],
    ["utilityAbstractSheets", "utility-abstract-sheets"],
    ["utilityDrawingsSheets", "utility-drawings-sheets"],
    ["utilitySequencePrintoutSheets", "utility-sequence-printout-sheets"],
    ["utilitySequenceElectronicSheets", "utility-sequence-electronic-sheets"],
    ["utilityFigureNumber", "utility-figure-number"],
    ["utilityClaimsTotal", "utility-claims-total"],
    ["utilityOtherDocuments", "utility-other-documents"],
    ["biologicalMaterialDetails", "utility-biological-details"],
    ["traditionalKnowledgeDetails", "utility-traditional-details"],
  ].forEach(([key, id]) => {
    wizardData[key] =
      document.getElementById(id)?.value || wizardData[key] || "";
  });

  wizardData.title =
    document.getElementById("utility-title")?.value || wizardData.title || "";
  wizardData.signaturePrintedName =
    document.getElementById("utility-signature-name")?.value ||
    wizardData.signaturePrintedName ||
    "";

  wizardData.utilityApplicantCountry = wizardData.utilityApplicantCountry || "";
  wizardData.utilityMakerCountry = wizardData.utilityMakerCountry || "";
  wizardData.utilityAgentCountry = wizardData.utilityAgentCountry || "";
  wizardData.field = wizardData.field || "";
  wizardData.drawingsCount =
    wizardData.utilityDrawingsSheets || wizardData.drawingsCount || "";
  wizardData.claimsCount =
    wizardData.utilityClaimsTotal || wizardData.claimsCount || "";
  wizardData.figureNumber =
    wizardData.utilityFigureNumber || wizardData.figureNumber || "";
  wizardData.utilityNaturePurpose =
    wizardData.utilityNaturePurpose ||
    wizardData.utilityOtherDocuments ||
    wizardData.title ||
    "";
  wizardData.desc =
    wizardData.desc || wizardData.utilityOtherDocuments || wizardData.title || "";
  wizardData.claims =
    wizardData.claims || wizardData.utilityClaimsTotal || "";
  wizardData.abstract = wizardData.abstract || wizardData.title || "";

  wizardData.name = getPartyPrintedName("utilityApplicant") || wizardData.name || "";
  wizardData.email = wizardData.utilityApplicantEmail || wizardData.email || "";
  wizardData.contact = wizardData.utilityApplicantContact || "";
  wizardData.dept =
    wizardData.utilityApplicantOrganization ||
    wizardData.dept ||
    "Utility Model Filing";
  wizardData.description =
    wizardData.utilityOtherDocuments ||
    wizardData.utilityNaturePurpose ||
    wizardData.title ||
    "";
  wizardData.signaturePrintedName = wizardData.signaturePrintedName || "";

  syncRequirementUploadsToFiles("utility");
}

function renderIndustrialEditorHeader(title, subtitle) {
  return renderGuidedEditorHeader({
    title,
    subtitle,
    officeFields: [
      { label: "Application No.", id: "industrial-office-app-no" },
      { label: "Date Received", id: "industrial-office-date-received" },
      { label: "Date Mailed", id: "industrial-office-date-mailed" },
      { label: "Form Tag", id: "industrial-office-form-tag", value: "IPOPHL Form 300" },
    ],
  });
}

function getIndustrialFormSteps() {
  return [
    "Route & Applicant",
    "Designer & Design Details",
    "Uploads & Representations",
    "Final Form 300 Preview",
  ];
}

function getIndustrialProgressPercent() {
  return Math.max(25, Math.min(100, currentWizardStep * 25));
}

function renderIndustrialGoogleForm(
  backTarget = "filing-hub",
  backLabel = "Filing Hub",
) {
  const steps = getIndustrialFormSteps();
  const activeStepTitle = steps[currentWizardStep - 1] || steps[0];

  return `
    ${renderBackNav(backTarget, backLabel)}
    <div class="patent-gform-shell">
      <div class="patent-gform-header">
        <div class="patent-gform-header-bar" style="background:linear-gradient(135deg, #ec4899, #be185d);"></div>
        <div class="patent-gform-card patent-gform-card--hero">
          <span class="patent-gform-kicker">IPOPHL FORM 300</span>
          <h1>Fillable Industrial Design Form</h1>
          <p>Complete the Industrial Design application online, then review a Form 300-style preview before submission.</p>
          <div class="patent-gform-meta">
            <span><i class="fa-solid fa-pen-nib"></i> 4 guided sections</span>
            <span><i class="fa-solid fa-file-lines"></i> 2-page office preview</span>
            <span><i class="fa-solid fa-building-shield"></i> Bureau of Patents layout</span>
          </div>
        </div>
      </div>

      <div class="patent-gform-layout">
        <div class="patent-gform-main">
          <div class="patent-step-strip">
            ${steps
              .map(
                (step, index) => `
                  <div class="patent-step-chip ${index + 1 === currentWizardStep ? "active" : ""} ${index + 1 < currentWizardStep ? "done" : ""}">
                    <span class="patent-step-chip__num">${index + 1}</span>
                    <span class="patent-step-chip__label">${step}</span>
                  </div>
                `,
              )
              .join("")}
          </div>

          ${renderIndustrialGoogleStep()}

          <div class="patent-gform-actions">
            <div class="patent-gform-actions__left">
              ${
                currentWizardStep > 1
                  ? `<button class="btn btn-secondary" onclick="prevWizardStep()"><i class="fa-solid fa-arrow-left"></i> Previous</button>`
                  : ""
              }
            </div>
            <div class="patent-gform-actions__right">
              <button class="btn btn-outline-navy" onclick="saveFormDraft()"><i class="fa-solid fa-floppy-disk"></i> Save Draft</button>
              ${
                currentWizardStep < 4
                  ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next Section <i class="fa-solid fa-arrow-right"></i></button>`
                  : `<button class="btn btn-success" onclick="submitForm()">Submit Industrial Design Form <i class="fa-solid fa-paper-plane"></i></button>`
              }
            </div>
          </div>
        </div>

        <aside class="patent-gform-sidebar">
          <div class="patent-gform-card">
            <span class="patent-gform-side-label">Current Section</span>
            <h3>${activeStepTitle}</h3>
            <div class="patent-progress-bar">
              <span style="width:${getIndustrialProgressPercent()}%; background:linear-gradient(135deg, #ec4899, #be185d);"></span>
            </div>
            <p>Step ${currentWizardStep} of 4. The last step renders your completed Form 300-style preview.</p>
          </div>

          <div class="patent-gform-card">
            <span class="patent-gform-side-label">How This Works</span>
            <ul class="patent-gform-note-list">
              <li>The guided fields follow IPOPHL's published industrial design filing requirements.</li>
              <li>The preview focuses on applicant, designer, design specification, claim, and representation details.</li>
              <li>Required uploads still need to be attached before submission is allowed.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderIndustrialGoogleStep() {
  if (currentWizardStep === 1) return renderIndustrialRouteApplicantStep();
  if (currentWizardStep === 2) return renderIndustrialDesignerDetailsStep();
  if (currentWizardStep === 3) return renderIndustrialUploadsStep();
  return renderIndustrialPreviewStep();
}

function renderIndustrialRouteApplicantStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 1</span>
      <h2>Filing Route and Applicant</h2>
      <p>Fill the filing route and applicant block that will appear on the Form 300 preview.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${renderIndustrialEditorHeader("Industrial Design Application", "Editable filing route and applicant details based on IPOPHL Form 300.")}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">1. Filing Route</div>

          <div class="patent-editor-inline-group">
            <span class="patent-editor-inline-group__label">Application Route</span>
            <div class="patent-choice-grid patent-choice-grid--three">
              ${renderPatentChoice("industrialApplicationRoute", "direct", "Direct Filing")}
              ${renderPatentChoice("industrialApplicationRoute", "priority", "With Claim of Priority")}
              ${renderPatentChoice("industrialApplicationRoute", "divisional", "Divisional")}
            </div>
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Priority Number", "industrial-priority-number", wizardData.industrialPriorityNumber, { placeholder: "If claiming priority" })}
            ${renderPatentEditorInput("Priority Filing Date", "industrial-priority-date", wizardData.industrialPriorityDate, { type: "date" })}
            ${renderPatentEditorInput("Priority Country", "industrial-priority-country", wizardData.industrialPriorityCountry, { placeholder: "Country of earlier filing" })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">2. Applicant Profile</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Type of Applicant</span>
              <div class="patent-choice-grid">
                ${renderPatentChoice("industrialApplicantType", "individual", "Individual")}
                ${renderPatentChoice("industrialApplicantType", "company", "Company")}
                ${renderPatentChoice("industrialApplicantType", "school", "School")}
                ${renderPatentChoice("industrialApplicantType", "government", "Government")}
              </div>
            </div>
            <div class="patent-editor-inline-group" style="margin:0;">
              <span class="patent-editor-inline-group__label">Entity Size</span>
              <div class="patent-choice-grid patent-choice-grid--two">
                ${renderPatentChoice("industrialEntityStatus", "small", "Small")}
                ${renderPatentChoice("industrialEntityStatus", "big", "Big")}
              </div>
            </div>
          </div>
        </div>

        ${renderGuidedPartyEditorSection({
          title: "3. Applicant Information",
          idBase: "industrial-applicant",
          keyBase: "industrialApplicant",
          organizationLabel: "Company / School / Government Office",
          requiredName: true,
          requiredEmail: true,
        })}
      </div>
    </div>
  `;
}

function renderIndustrialDesignerDetailsStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 2</span>
      <h2>Designer and Design Details</h2>
      <p>Complete the designer, representative, and design specification sections for the industrial design filing packet.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        ${renderGuidedPartyEditorSection({
          title: "4. Designer Information",
          idBase: "industrial-designer",
          keyBase: "industrialDesigner",
          organizationLabel: "Institution / Department",
          requiredName: true,
        })}

        ${renderGuidedPartyEditorSection({
          title: "5. Agent / Representative",
          idBase: "industrial-agent",
          keyBase: "industrialAgent",
          organizationLabel: "Law Firm / Representative Office",
        })}

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">6. Industrial Design Specification</div>

          <div class="patent-editor-grid patent-editor-grid--two">
            ${renderPatentEditorInput("Title of Industrial Design", "industrial-title", wizardData.title, { placeholder: "Enter the exact design title", required: true })}
            ${renderPatentEditorInput("Article / Product Name", "industrial-article-name", wizardData.industrialArticleName, { placeholder: "Product embodying the design", required: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorSelect("Product Category", "industrial-product-category", wizardData.prodcat || "", [
              { value: "", label: "Select category" },
              { value: "Furniture", label: "Furniture" },
              { value: "Packaging", label: "Packaging" },
              { value: "Tools & Equipment", label: "Tools & Equipment" },
              { value: "Fashion & Accessories", label: "Fashion & Accessories" },
              { value: "Household Items", label: "Household Items" },
              { value: "Electronics Housing", label: "Electronics Housing" },
              { value: "Transportation", label: "Transportation" },
              { value: "Other", label: "Other" },
            ], { required: true })}
            ${renderPatentEditorSelect("Design Type", "industrial-design-type", wizardData.designtype || "", [
              { value: "", label: "Select design type" },
              { value: "3D (Shape/Form)", label: "3D (Shape/Form)" },
              { value: "2D (Pattern/Lines/Color)", label: "2D (Pattern/Lines/Color)" },
              { value: "Combination (3D + 2D)", label: "Combination (3D + 2D)" },
            ], { required: true })}
            ${renderPatentEditorInput("Date Created", "industrial-date-created", wizardData.industrialDateCreated, { type: "date" })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Brief Explanation of the Drawings / Views", "industrial-views-explanation", wizardData.industrialViewsExplanation, { placeholder: "Explain the perspective, front, rear, side, top, bottom, or plan views submitted.", fullWidth: true, required: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Characteristic Features of the Design", "industrial-characteristic-features", wizardData.industrialCharacteristicFeatures, { placeholder: "Describe the distinguishing ornamental features of the design.", fullWidth: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Description of Design", "industrial-description", wizardData.desc, { placeholder: "Provide the written specification or overall aesthetic description of the design.", fullWidth: true, required: true })}
          </div>

          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Omnibus Claim", "industrial-claim", wizardData.industrialClaim || 'I claim the new and ornamental design for the article substantially as shown and described.', { placeholder: "State the omnibus claim for the industrial design.", fullWidth: true, required: true })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderIndustrialUploadsStep() {
  const uploadedCount = getUploadedRequiredCount("industrial", wizardData);
  const totalRequired = getRequiredDocumentCount("industrial");

  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 3</span>
      <h2>Uploads and Representations</h2>
      <p>Attach the design drawings and finalize the representation counts that will appear in your filing packet.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      <div class="patent-editor-sheet">
        <div class="patent-editor-section">
          <div class="patent-paper__section-title">7. Representation Summary</div>
          <div class="patent-editor-grid patent-editor-grid--three">
            ${renderPatentEditorInput("Number of Views", "industrial-views-count", wizardData.industrialViewsCount, { placeholder: "e.g. 7" })}
            ${renderPatentEditorInput("Number of Embodiments", "industrial-embodiments-count", wizardData.industrialEmbodimentsCount, { placeholder: "Optional" })}
            ${renderPatentEditorInput("Printed Name for Signature", "industrial-signature-name", wizardData.signaturePrintedName || "", { placeholder: "Printed name for signature block" })}
          </div>
          <div class="patent-editor-grid patent-editor-grid--one">
            ${renderPatentEditorTextarea("Internal Notes / Remarks", "industrial-supporting-notes", wizardData.supportingNotes, { placeholder: "Optional notes for the design filing packet.", fullWidth: true })}
          </div>
        </div>

        <div class="patent-editor-section">
          <div class="patent-paper__section-title">8. Required Uploads</div>
          <p class="patent-gform-section-copy" style="margin-top:0;">${uploadedCount} of ${totalRequired} required documents uploaded.</p>
          <div style="margin-top:18px;">${renderRequirementChecklistPanel("industrial")}</div>
          <div style="margin-top:24px;">${renderDynamicRequirementUploaders("industrial")}</div>
          <div id="uploadStatus" style="margin-top:24px;">${uploadedCount > 0 ? renderUploadedFiles() : ""}</div>
          <div style="margin-top:24px;">${renderConditionalPaymentUploadPanel(wizardData, { infoOnly: true })}</div>
        </div>
      </div>
    </div>
  `;
}

function renderIndustrialPreviewStep() {
  return `
    <div class="patent-gform-card">
      <span class="patent-gform-kicker">Section 4</span>
      <h2>Final Form 300 Preview</h2>
      <p>The preview below composes your industrial design submission into a paper-style layout inspired by the IPOPHL Form 300 filing sheet.</p>
    </div>

    <div class="patent-gform-card patent-gform-card--sheet">
      ${renderIndustrialFormSheetBundle()}
    </div>

    <div class="patent-gform-card">
      <h3>Submission Summary</h3>
      ${renderSimpleGuidedSummary([
        { label: "Applicant", value: getPartyPrintedName("industrialApplicant") },
        { label: "Designer", value: getPartyPrintedName("industrialDesigner") },
        { label: "Title", value: wizardData.title },
        { label: "Article / Product", value: wizardData.industrialArticleName },
        { label: "Uploaded Requirements", value: `${getUploadedRequiredCount("industrial", wizardData)} / ${getRequiredDocumentCount("industrial")}` },
      ])}
    </div>
  `;
}

function renderIndustrialFormSheetBundle() {
  return `
    <div class="patent-paper-stack">
      ${renderIndustrialFormSheetPage1()}
      ${renderIndustrialFormSheetPage2()}
    </div>
  `;
}

function renderIndustrialFormSheetPage1() {
  const route = wizardData.industrialApplicationRoute || "direct";
  const applicantType = wizardData.industrialApplicantType || "individual";
  const entityStatus = wizardData.industrialEntityStatus || "small";

  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official">
        ${renderGuidedOfficialHeader("IPOPHL Form 300", "INDUSTRIAL DESIGN APPLICATION")}

        <div class="patent-official-route">
          ${renderPatentOfficialMark("Direct", route === "direct")}
          ${renderPatentOfficialMark("With Claim of Priority", route === "priority")}
          ${renderPatentOfficialMark("Divisional", route === "divisional")}
          ${renderPatentOfficialMark("Small Entity", entityStatus === "small")}
          ${renderPatentOfficialMark("Big Entity", entityStatus === "big")}
        </div>

        ${renderPatentOfficialSectionBar("DESIGN TITLE")}
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Title of Industrial Design", wizardData.title)}
        </div>

        ${renderPatentOfficialSectionBar("FILING ROUTE DETAILS")}
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell(
            "Type of Applicant",
            applicantType === "company"
              ? "Company"
              : applicantType === "school"
                ? "School"
                : applicantType === "government"
                  ? "Government"
                  : "Individual",
          )}
          ${renderPatentOfficialCell(
            "Entity Size",
            entityStatus === "big" ? "Big" : "Small",
          )}
          ${renderPatentOfficialCell("Priority Country", wizardData.industrialPriorityCountry)}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Priority Number", wizardData.industrialPriorityNumber)}
          ${renderPatentOfficialCell("Priority Filing Date", formatPatentOfficialDate(wizardData.industrialPriorityDate))}
        </div>

        ${renderGuidedPartyOfficialSection(
          "APPLICANT INFORMATION",
          "industrialApplicant",
          "Company / School / Government Office",
        )}
        ${renderGuidedPartyOfficialSection(
          "DESIGNER INFORMATION",
          "industrialDesigner",
          "Institution / Department",
        )}

        ${renderGuidedOfficialFooter(
          "IPOPHL Form 300",
          "Industrial Design Application",
          1,
        )}
      </div>
    </div>
  `;
}

function renderIndustrialFormSheetPage2() {
  return `
    <div class="patent-paper-wrap patent-paper-wrap--official">
      <div class="patent-paper patent-paper--official patent-paper--official-page2">
        <div class="patent-official-page-head">
          <span class="patent-official-page-head__form">INDUSTRIAL DESIGN APPLICATION - SPECIFICATION SHEET</span>
          <span>IPOPHL Form 300</span>
        </div>

        ${renderGuidedPartyOfficialSection(
          "AGENT / REPRESENTATIVE",
          "industrialAgent",
          "Law Firm / Representative Office",
        )}

        ${renderPatentOfficialSectionBar("DESIGN SPECIFICATION")}
        <div class="patent-official-row patent-official-row--three">
          ${renderPatentOfficialCell("Article / Product", wizardData.industrialArticleName)}
          ${renderPatentOfficialCell("Product Category", wizardData.prodcat)}
          ${renderPatentOfficialCell("Design Type", wizardData.designtype)}
        </div>
        <div class="patent-official-row patent-official-row--two">
          ${renderPatentOfficialCell("Date Created", formatPatentOfficialDate(wizardData.industrialDateCreated))}
          ${renderPatentOfficialCell("Number of Views", wizardData.industrialViewsCount)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Brief Explanation of Drawings / Views", wizardData.industrialViewsExplanation)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Characteristic Features", wizardData.industrialCharacteristicFeatures)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Description of Design", wizardData.desc)}
        </div>
        <div class="patent-official-row patent-official-row--one">
          ${renderPatentOfficialCell("Omnibus Claim", wizardData.industrialClaim)}
        </div>

        ${renderPatentOfficialSectionBar("DOCUMENTS SUBMITTED")}
        <div class="patent-official-checklist-grid">
          <div class="patent-official-checklist-col patent-official-checklist-col--attachments">
            ${renderGuidedUploadChecklist("industrial")}
          </div>
          <div class="patent-official-checklist-col">
            ${renderGuidedChecklistMetric("Views submitted", wizardData.industrialViewsCount, "views")}
            ${renderGuidedChecklistMetric("Embodiments", wizardData.industrialEmbodimentsCount, "sets")}
            ${renderGuidedChecklistMetric("Signature name", wizardData.signaturePrintedName)}
            ${wizardData.supportingNotes ? `<div class="patent-official-checklist-note">${escapeHtml(wizardData.supportingNotes)}</div>` : ""}
          </div>
        </div>

        ${renderGuidedOfficialFooter(
          "IPOPHL Form 300",
          "Industrial Design Application",
          2,
        )}
      </div>
    </div>
  `;
}

function captureIndustrialGoogleData() {
  wizardData.industrialApplicationRoute =
    document.querySelector('input[name="industrialApplicationRoute"]:checked')?.value ||
    wizardData.industrialApplicationRoute ||
    "direct";
  wizardData.industrialApplicantType =
    document.querySelector('input[name="industrialApplicantType"]:checked')?.value ||
    wizardData.industrialApplicantType ||
    "individual";
  wizardData.industrialEntityStatus =
    document.querySelector('input[name="industrialEntityStatus"]:checked')?.value ||
    wizardData.industrialEntityStatus ||
    "small";
  wizardData.industrialPriorityNumber =
    document.getElementById("industrial-priority-number")?.value ||
    wizardData.industrialPriorityNumber ||
    "";
  wizardData.industrialPriorityDate =
    document.getElementById("industrial-priority-date")?.value ||
    wizardData.industrialPriorityDate ||
    "";
  wizardData.industrialPriorityCountry =
    document.getElementById("industrial-priority-country")?.value ||
    wizardData.industrialPriorityCountry ||
    "";

  [
    ["industrialApplicantOrganization", "industrial-applicant-organization"],
    ["industrialApplicantPosition", "industrial-applicant-position"],
    ["industrialApplicantLastName", "industrial-applicant-last-name"],
    ["industrialApplicantFirstName", "industrial-applicant-first-name"],
    ["industrialApplicantMiddleName", "industrial-applicant-middle-name"],
    ["industrialApplicantAddress", "industrial-applicant-address"],
    ["industrialApplicantTown", "industrial-applicant-town"],
    ["industrialApplicantProvince", "industrial-applicant-province"],
    ["industrialApplicantZip", "industrial-applicant-zip"],
    ["industrialApplicantCountry", "industrial-applicant-country"],
    ["industrialApplicantContact", "industrial-applicant-contact"],
    ["industrialApplicantEmail", "industrial-applicant-email"],
    ["industrialApplicantNationality", "industrial-applicant-nationality"],
    ["industrialDesignerOrganization", "industrial-designer-organization"],
    ["industrialDesignerPosition", "industrial-designer-position"],
    ["industrialDesignerLastName", "industrial-designer-last-name"],
    ["industrialDesignerFirstName", "industrial-designer-first-name"],
    ["industrialDesignerMiddleName", "industrial-designer-middle-name"],
    ["industrialDesignerAddress", "industrial-designer-address"],
    ["industrialDesignerTown", "industrial-designer-town"],
    ["industrialDesignerProvince", "industrial-designer-province"],
    ["industrialDesignerZip", "industrial-designer-zip"],
    ["industrialDesignerCountry", "industrial-designer-country"],
    ["industrialDesignerContact", "industrial-designer-contact"],
    ["industrialDesignerEmail", "industrial-designer-email"],
    ["industrialDesignerNationality", "industrial-designer-nationality"],
    ["industrialAgentOrganization", "industrial-agent-organization"],
    ["industrialAgentPosition", "industrial-agent-position"],
    ["industrialAgentLastName", "industrial-agent-last-name"],
    ["industrialAgentFirstName", "industrial-agent-first-name"],
    ["industrialAgentMiddleName", "industrial-agent-middle-name"],
    ["industrialAgentAddress", "industrial-agent-address"],
    ["industrialAgentTown", "industrial-agent-town"],
    ["industrialAgentProvince", "industrial-agent-province"],
    ["industrialAgentZip", "industrial-agent-zip"],
    ["industrialAgentCountry", "industrial-agent-country"],
    ["industrialAgentContact", "industrial-agent-contact"],
    ["industrialAgentEmail", "industrial-agent-email"],
  ].forEach(([key, id]) => {
    wizardData[key] =
      document.getElementById(id)?.value || wizardData[key] || "";
  });

  wizardData.title =
    document.getElementById("industrial-title")?.value || wizardData.title || "";
  wizardData.industrialArticleName =
    document.getElementById("industrial-article-name")?.value ||
    wizardData.industrialArticleName ||
    "";
  wizardData.prodcat =
    document.getElementById("industrial-product-category")?.value ||
    wizardData.prodcat ||
    "";
  wizardData.designtype =
    document.getElementById("industrial-design-type")?.value ||
    wizardData.designtype ||
    "";
  wizardData.industrialDateCreated =
    document.getElementById("industrial-date-created")?.value ||
    wizardData.industrialDateCreated ||
    "";
  wizardData.industrialViewsExplanation =
    document.getElementById("industrial-views-explanation")?.value ||
    wizardData.industrialViewsExplanation ||
    "";
  wizardData.industrialCharacteristicFeatures =
    document.getElementById("industrial-characteristic-features")?.value ||
    wizardData.industrialCharacteristicFeatures ||
    "";
  wizardData.desc =
    document.getElementById("industrial-description")?.value ||
    wizardData.desc ||
    "";
  wizardData.industrialClaim =
    document.getElementById("industrial-claim")?.value ||
    wizardData.industrialClaim ||
    "";
  wizardData.industrialViewsCount =
    document.getElementById("industrial-views-count")?.value ||
    wizardData.industrialViewsCount ||
    "";
  wizardData.industrialEmbodimentsCount =
    document.getElementById("industrial-embodiments-count")?.value ||
    wizardData.industrialEmbodimentsCount ||
    "";
  wizardData.signaturePrintedName =
    document.getElementById("industrial-signature-name")?.value ||
    wizardData.signaturePrintedName ||
    "";
  wizardData.supportingNotes =
    document.getElementById("industrial-supporting-notes")?.value ||
    wizardData.supportingNotes ||
    "";

  wizardData.industrialApplicantCountry =
    wizardData.industrialApplicantCountry || "";
  wizardData.industrialDesignerCountry =
    wizardData.industrialDesignerCountry || "";
  wizardData.industrialAgentCountry =
    wizardData.industrialAgentCountry || "";

  wizardData.name =
    getPartyPrintedName("industrialApplicant") || wizardData.name || "";
  wizardData.email =
    wizardData.industrialApplicantEmail || wizardData.email || "";
  wizardData.contact = wizardData.industrialApplicantContact || "";
  wizardData.dept =
    wizardData.industrialApplicantOrganization ||
    wizardData.dept ||
    "Industrial Design Filing";
  wizardData.description =
    wizardData.industrialViewsExplanation ||
    wizardData.desc ||
    wizardData.title ||
    "";
  wizardData.signaturePrintedName = wizardData.signaturePrintedName || "";

  syncRequirementUploadsToFiles("industrial");
}

function renderFormWizard(title) {
  if (isPatentIntakeFlow()) {
    return renderPatentGoogleForm();
  }
  if (isCopyrightGoogleFlow()) {
    return renderCopyrightGoogleForm();
  }
  if (isUtilityGoogleFlow()) {
    return renderUtilityGoogleForm();
  }
  if (isIndustrialGoogleFlow()) {
    return renderIndustrialGoogleForm();
  }

  let steps = [
    "Applicant Info",
    getStep2Label(),
    "Upload Documents",
    "Review & Submit",
  ];
  
  if ((currentFormType === "copyright" || currentFormType === "patent") && submissionMethod === "upload") {
    steps = [
      "Applicant Information",
      "Upload Requirements",
      "Review & Submit",
    ];
  }
  
  const roleMeta = getRoleMeta();
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) greeting = "Good afternoon";
  else if (currentHour >= 17) greeting = "Good evening";

  return `
    ${renderBackNav('filing-hub', 'Filing Hub')}
    <div class="page-header" style="margin-bottom: 8px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="color:var(--navy); font-weight:800; font-size:1.8rem; margin-bottom:4px;">${title}</h1>
          <p style="color:var(--gray-500); font-size:0.95rem;">${greeting}, ${getCurrentUser().name}. Please complete the institutional pre-filing requirements below.</p>
        </div>
        <div style="display:none;"></div>
      </div>
    </div>

    ${getFormGuideContent()}
    
    <div class="wizard-container" style="margin-top:8px; box-shadow:0 20px 40px rgba(0,0,0,0.04); border-radius:20px;">
      <div class="wizard-progress" style="background:white; border-bottom:1px solid var(--gray-100); padding:10px 0;">
        ${steps
          .map(
            (s, i) => `
          <div class="wizard-step ${i + 1 === currentWizardStep ? "active" : ""} ${i + 1 < currentWizardStep ? "completed" : ""}" id="wizStep${i + 1}" style="padding:8px 6px;">
            <div class="step-num" style="width:32px; height:32px; font-size:0.85rem; margin-bottom:6px;">${i + 1 < currentWizardStep ? '<i class="fa-solid fa-check"></i>' : i + 1}</div>
            <span class="step-text" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">${s}</span>
          </div>`,
          )
          .join("")}
      </div>

      <div class="wizard-body" id="wizardBody" style="padding:15px; min-height:auto;">
        ${renderWizardStep()}
      </div>

      <div class="wizard-footer" style="padding:12px 15px; background:var(--gray-50); border-top:1px solid var(--gray-100); display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:16px;">
          ${
            currentWizardStep > 1
              ? `<button class="btn btn-secondary" onclick="prevWizardStep()" style="padding:12px 24px;">
                  <i class="fa-solid fa-arrow-left"></i> Previous
                </button>`
              : ""
          }
          <button class="btn btn-outline-navy" onclick="showToast('Progress saved as draft.')" style="padding:12px 24px;">
            <i class="fa-solid fa-file-pen"></i> Save as Draft
          </button>
        </div>
        
        <div style="display:flex; gap:16px; align-items:center;">
          <span style="font-size:0.8rem; color:var(--gray-400); font-weight:600; text-transform:uppercase;">Step ${currentWizardStep} of ${getMaxWizardSteps()}</span>
          ${
            currentWizardStep < getMaxWizardSteps()
              ? `<button class="btn btn-primary" onclick="nextWizardStep()" style="padding:12px 32px; font-weight:700;">Next Step <i class="fa-solid fa-arrow-right"></i></button>`
              : `<button class="btn btn-success" id="finalSubmitBtn" onclick="submitForm()" style="padding:12px 32px; font-weight:800;" disabled>Finalize & Submit Application <i class="fa-solid fa-paper-plane"></i></button>`
          }
        </div>
      </div>
    </div>

    <div style="margin-top:32px; display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
      <div style="background:rgba(59,130,246,0.05); padding:20px; border-radius:16px; border:1.5px solid rgba(59,130,246,0.1); display:flex; gap:16px;">
        <i class="fa-solid fa-circle-info" style="color:var(--blue); font-size:1.2rem; margin-top:2px;"></i>
        <div>
          <h4 style="font-size:0.9rem; color:var(--navy); margin-bottom:4px;">Pro Tip</h4>
          <p style="font-size:0.82rem; color:var(--gray-600); line-height:1.5;">You can save your progress as a draft and return to it later from the "My Cases" page.</p>
        </div>
      </div>
      <div style="background:rgba(245,158,11,0.05); padding:20px; border-radius:16px; border:1.5px solid rgba(245,158,11,0.1); display:flex; gap:16px;">
        <i class="fa-solid fa-user-shield" style="color:var(--gold-dark); font-size:1.2rem; margin-top:2px;"></i>
        <div>
          <h4 style="font-size:0.9rem; color:var(--navy); margin-bottom:4px;">Confidentiality</h4>
          <p style="font-size:0.82rem; color:var(--gray-600); line-height:1.5;">All data provided is encrypted and accessible only to authorized university IP personnel.</p>
        </div>
      </div>
    </div>
  `;
}

function getStep2Label() {
  if (currentFormType === "patent" || currentFormType === "utility")
    return "Invention Details";
  if (currentFormType === "industrial") return "Design Details";
  return "Work Details";
}

function renderWizardStep() {
  const content = (() => {
    if ((currentFormType === "copyright" || currentFormType === "patent") && submissionMethod === "upload") {
      if (currentWizardStep === 1) return renderStep1();
      if (currentWizardStep === 2) return renderStep3();
      if (currentWizardStep === 3) return renderStep4Review();
      return "";
    }
    if (currentWizardStep === 1) return renderStep1();
    if (currentWizardStep === 2) return renderStep2();
    if (currentWizardStep === 3) return renderStep3();
    if (currentWizardStep === 4) return renderStep4Review();
    return "";
  })();

  const tips = {
    1: "Ensure your institutional email is correct as all legal notifications will be sent there.",
    2: "The title should be technical and concise. Avoid using overly flowery language.",
    3: "Combine multiple pages into a single PDF if possible to stay within the file limit.",
    4: "Double-check all names and dates. Once submitted, changes may require PITBI admin approval."
  };

  return `
    <div style="display:grid; grid-template-columns: 1fr 280px; gap:24px; align-items: start;">
      <div class="wizard-main-content">
        ${content}
      </div>
      <div class="wizard-sidebar" style="border-left:1px solid var(--gray-100); padding-left:24px;">
        <div style="background:linear-gradient(to right, #f8fafc, #ffffff); border:1px solid var(--gray-100); border-radius:16px; padding:18px; margin-bottom:20px;">
          <h4 style="font-size:0.82rem; color:var(--navy); font-weight:800; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.08em;">Required Documents</h4>
          ${renderRequirementChecklistPanel(currentFormType, { compact: true })}
        </div>

        <h4 style="font-size:0.85rem; color:var(--navy); text-transform:uppercase; letter-spacing:1px; margin-bottom:20px;">Guide & Tips</h4>
        
        <div style="background:var(--gray-50); padding:20px; border-radius:16px; border:1px solid var(--gray-100); margin-bottom:24px;">
          <div style="width:32px; height:32px; border-radius:50%; background:white; color:var(--gold-dark); display:flex; align-items:center; justify-content:center; font-size:0.9rem; margin-bottom:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <p style="font-size:0.82rem; color:var(--gray-600); line-height:1.6; font-style:italic;">"${tips[currentWizardStep]}"</p>
        </div>

        <div style="padding:0 4px;">
          <h5 style="font-size:0.75rem; color:var(--gray-400); font-weight:700; text-transform:uppercase; margin-bottom:12px;">Need Help?</h5>
          <a href="#" onclick="showToast('Connecting to PITBI Live Support...')" style="display:flex; align-items:center; gap:10px; font-size:0.82rem; color:var(--navy); font-weight:600; text-decoration:none; margin-bottom:12px;">
            <i class="fa-solid fa-headset" style="color:var(--gold);"></i> Chat with Admin
          </a>
          <a href="#" onclick="navigateTo('ip-guidelines')" style="display:flex; align-items:center; gap:10px; font-size:0.82rem; color:var(--navy); font-weight:600; text-decoration:none;">
            <i class="fa-solid fa-book" style="color:var(--gold);"></i> Filing Manual
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderStep1() {
  const selectedCollege = wizardData.college || "";
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">Applicant Information</h3>
      <span style="font-size:0.8rem; color:var(--gray-400); font-weight:600;"><i class="fa-solid fa-lock" style="margin-right:4px;"></i> Secure & Encrypted</span>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Full Name *</label>
        <input type="text" id="wiz-name" value="${wizardData.name || ""}" placeholder="Enter full name" required style="background:var(--gray-50);" />
        <small style="color:var(--gray-400); font-size:0.75rem; margin-top:4px; display:block;">Primary applicant or lead researcher.</small>
      </div>
      <div class="form-group">
        <label>Institutional Email *</label>
        <input type="email" id="wiz-email" value="${wizardData.email || ""}" placeholder="your.email@psu.edu.ph" required style="background:var(--gray-50);" />
        <small style="color:var(--gray-400); font-size:0.75rem; margin-top:4px; display:block;">Used for all official PITBI correspondence.</small>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Unit / College *</label>
        <select id="wiz-college" required>
          <option value="">Select College</option>
          <option value="College of Engineering" ${selectedCollege.includes('Engineering') ? 'selected' : ''}>College of Engineering</option>
          <option value="College of Sciences" ${selectedCollege.includes('Sciences') ? 'selected' : ''}>College of Sciences</option>
          <option value="College of Agriculture" ${selectedCollege.includes('Agriculture') ? 'selected' : ''}>College of Agriculture</option>
          <option value="College of Arts" ${selectedCollege.includes('Arts') ? 'selected' : ''}>College of Arts</option>
          <option value="Research Office" ${selectedCollege.includes('Research') ? 'selected' : ''}>Research Office</option>
        </select>
      </div>
      <div class="form-group">
        <label>Employee / Student ID</label>
        <input type="text" id="wiz-id" value="${wizardData.applicantId || ''}" placeholder="PSU-XXXX-XXXX" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group" style="flex:1;">
        <label>Contact Number *</label>
        <input type="tel" id="wiz-contact" value="${wizardData.contact || ''}" placeholder="09XX XXX XXXX" required />
      </div>
    </div>
  `;
}

function renderStep2() {
  if (currentFormType === "patent") {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Invention Details</h3>
        <span class="badge badge-patent">TECHNICAL DISCLOSURE</span>
      </div>

      <div class="form-group">
        <label>Full Title of Invention *</label>
        <input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="e.g., Solar-Powered Water Purification System using Bamboo Filtration" required />
        <small style="color:var(--gray-400); font-size:0.75rem; margin-top:4px; display:block;">A concise, technical name that identifies the invention's nature.</small>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Technical Field *</label>
          <input type="text" id="wiz-field" value="${wizardData.field || ''}" placeholder="e.g., Environmental Engineering / Renewable Energy" required />
        </div>
        <div class="form-group">
          <label>Date of Conception *</label>
          <input type="date" id="wiz-date" value="${wizardData.date || ''}" required />
        </div>
      </div>

      <div class="form-group">
        <label>Technical Abstract (max 150 words) *</label>
        <textarea id="wiz-abstract" placeholder="Summarize the technical problem and your proposed solution..." maxlength="900" style="min-height:120px;" required>${wizardData.abstract || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Detailed Description *</label>
        <textarea id="wiz-desc" placeholder="Describe how the invention works, its components, and the steps to reproduce it..." style="min-height:180px;" required>${wizardData.description || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Initial Claims Statement *</label>
        <textarea id="wiz-claims" placeholder="What specific features make this invention unique? List them as clear, numbered points..." style="min-height:120px;" required></textarea>
      </div>
    `;
  } else if (currentFormType === "") {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Mark Details</h3>
        <span class="badge badge-">BRAND PROTECTION</span>
      </div>

      <div class="form-group">
        <label>Mark / Brand Name *</label>
        <input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="Enter the exact brand name or mark" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Mark Classification *</label>
          <select id="wiz-marktype" required>
            <option value="">Select Type</option>
            <option ${wizardData.marktype === "Word Mark (Text only)" ? "selected" : ""}>Word Mark (Text only)</option>
            <option ${wizardData.marktype === "Logo / Figurative (Image only)" ? "selected" : ""}>Logo / Figurative (Image only)</option>
            <option ${wizardData.marktype === "Combined (Word + Image)" ? "selected" : ""}>Combined (Word + Image)</option>
            <option ${wizardData.marktype === "3D / Shape" ? "selected" : ""}>3D / Shape</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date of First Commercial Use</label>
          <input type="date" id="wiz-date" value="${wizardData.date || ''}" />
          <small style="color:var(--gray-400); font-size:0.75rem; margin-top:4px; display:block;">Leave blank if "Intent-to-Use".</small>
        </div>
      </div>

      <div class="form-group">
        <label>Color Claim & Distinctive Elements</label>
        <textarea id="wiz-colorclaim" placeholder="Describe specific colors, fonts, or symbols that are essential to this mark's identity..." style="min-height:100px;">${wizardData.colorclaim || ''}</textarea>
      </div>
    `;
  } else if (currentFormType === "copyright") {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Work Details</h3>
        <span class="badge badge-copyright">CREATIVE WORK</span>
      </div>

      <div class="form-group">
        <label>Title of Work *</label>
        <input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="e.g., Handbook on Palawan Endemic Flora" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Category of Work *</label>
          <select id="wiz-worktype" required>
            <option value="">Select Category</option>
            <option ${wizardData.worktype === "Literary (Books, Thesis, Code)" ? "selected" : ""}>Literary (Books, Thesis, Code)</option>
            <option ${wizardData.worktype === "Artistic (Drawings, Designs)" ? "selected" : ""}>Artistic (Drawings, Designs)</option>
            <option ${wizardData.worktype === "Musical (Compositions, Lyrics)" ? "selected" : ""}>Musical (Compositions, Lyrics)</option>
            <option ${wizardData.worktype === "Audiovisual (Videos, Multimedia)" ? "selected" : ""}>Audiovisual (Videos, Multimedia)</option>
            <option ${wizardData.worktype === "Lectures / Presentations" ? "selected" : ""}>Lectures / Presentations</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date of Completion *</label>
          <input type="date" id="wiz-date" value="${wizardData.date || ''}" required />
        </div>
      </div>

      <div class="form-group">
        <label>Brief Description *</label>
        <textarea id="wiz-desc" placeholder="Provide a short overview of the work's content and creative purpose..." style="min-height:120px;" required>${wizardData.desc || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Registration Lane *</label>
        <select id="wiz-reglane" required>
          <option value="PSU Internal" ${wizardData.reglane === "PSU Internal" ? "selected" : ""}>PSU Internal (Record Only)</option>
          <option value="PSU-NL-IPOPHL" ${wizardData.reglane === "PSU-NL-IPOPHL" ? "selected" : ""}>PSU + NL + IPOPHL (Official)</option>
        </select>
      </div>
    `;
  } else if (currentFormType === "utility") {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <h3 style="margin:0;">Utility Model Details</h3>
        <span class="badge" style="background:var(--gray-100); color:var(--navy);">PRACTICAL IMPROVEMENT</span>
      </div>

      <div class="form-group">
        <label>Title of Utility Model *</label>
        <input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="Enter title of the improvement" required />
      </div>

      <div class="form-row">
        <div class="form-group"><label>Technical Field *</label><input type="text" id="wiz-field" value="${wizardData.field || ''}" placeholder="e.g., Agricultural Machinery" /></div>
        <div class="form-group"><label>Date Conceived *</label><input type="date" id="wiz-date" value="${wizardData.date || ''}" /></div>
      </div>
      <div class="form-group"><label>Technical Description *</label><textarea id="wiz-desc" placeholder="Describe your utility model in detail, including its novel technical aspects...">${wizardData.desc || ''}</textarea></div>
      <div class="form-group"><label>Claims Statement *</label><textarea id="wiz-claims" placeholder="Define the specific claims of your utility model...">${wizardData.claims || ''}</textarea></div>
      <div class="form-group"><label>Industrial Applicability *</label><textarea id="wiz-industrial" placeholder="Explain how this model can be industrially produced or used...">${wizardData.industrial || ''}</textarea></div>
      <div class="form-group"><label>Novelty Statement *</label><textarea id="wiz-novelty" placeholder="Describe what makes this model new compared to existing solutions...">${wizardData.novelty || ''}</textarea></div>`;
  } else if (currentFormType === "industrial") {
    return `<h3 style="margin-bottom:24px">Industrial Design Details</h3>
      <div class="form-group"><label>Design Title *</label><input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="Enter design title" /></div>
      <div class="form-row">
        <div class="form-group"><label>Product Category *</label>
          <select id="wiz-prodcat"><option value="">Select Category</option><option ${wizardData.prodcat === "Furniture" ? "selected" : ""}>Furniture</option><option ${wizardData.prodcat === "Packaging" ? "selected" : ""}>Packaging</option><option ${wizardData.prodcat === "Tools & Equipment" ? "selected" : ""}>Tools & Equipment</option><option ${wizardData.prodcat === "Fashion & Accessories" ? "selected" : ""}>Fashion & Accessories</option><option ${wizardData.prodcat === "Household Items" ? "selected" : ""}>Household Items</option><option ${wizardData.prodcat === "Electronics Housing" ? "selected" : ""}>Electronics Housing</option><option ${wizardData.prodcat === "Transportation" ? "selected" : ""}>Transportation</option><option ${wizardData.prodcat === "Other" ? "selected" : ""}>Other</option></select></div>
        <div class="form-group"><label>Design Type *</label>
          <select id="wiz-designtype"><option value="">Select Type</option><option ${wizardData.designtype === "3D (Shape/Form)" ? "selected" : ""}>3D (Shape/Form)</option><option ${wizardData.designtype === "2D (Pattern/Lines/Color)" ? "selected" : ""}>2D (Pattern/Lines/Color)</option><option ${wizardData.designtype === "Combination (3D + 2D)" ? "selected" : ""}>Combination (3D + 2D)</option></select></div>
      </div>
      <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" value="${wizardData.date || ''}" /></div>
      <div class="form-group"><label>Design Statement *</label><textarea id="wiz-desc" placeholder="Describe the ornamental or aesthetic aspects of your design that give it a special appearance...">${wizardData.desc || ''}</textarea></div>
      `;
  } else {
    return `<h3 style="margin-bottom:24px">Work Details</h3>
      <div class="form-group"><label>Title of Work *</label><input type="text" id="wiz-title" value="${wizardData.title || ''}" placeholder="Enter title of work" /></div>
      <div class="form-row">
        <div class="form-group"><label>Type of Work *</label>
          <select id="wiz-worktype"><option value="">Select Type</option><option ${wizardData.worktype === "Literary Work" ? "selected" : ""}>Literary Work</option><option ${wizardData.worktype === "Musical Work" ? "selected" : ""}>Musical Work</option><option ${wizardData.worktype === "Software Application" ? "selected" : ""}>Software Application</option><option ${wizardData.worktype === "Artistic Work" ? "selected" : ""}>Artistic Work</option><option ${wizardData.worktype === "Audio/Visual Work" ? "selected" : ""}>Audio/Visual Work</option></select></div>
        <div class="form-group"><label>Date of Creation *</label><input type="date" id="wiz-date" value="${wizardData.date || ''}" /></div>
      </div>
      <div class="form-group"><label>Description *</label><textarea id="wiz-desc" placeholder="Describe your creative work...">${wizardData.desc || ''}</textarea></div>
      <div class="form-group"><label>Declaration of Originality *</label><textarea id="wiz-originality" placeholder="I hereby declare that this work is an original creation..."></textarea></div>`;
  }
}

function renderStep3() {
  const uploadedCount = getUploadedRequiredCount(currentFormType, wizardData);
  const totalRequired = getRequiredDocumentCount(currentFormType);
  const showPaymentControls = currentFormType !== "copyright";
  const currentStatus = wizardData.paymentRequested
    ? "Payment Requested"
    : "Pending";
  const paymentFile = getPaymentProofFile(wizardData);
  const paymentLabel = wizardData.paymentRequested
    ? paymentFile
      ? "Proof uploaded"
      : "Awaiting upload"
    : "Not requested";
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">Required Documents and Steps</h3>
      <div style="background:var(--gray-50); padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:700; color:var(--gray-500); border:1px solid var(--gray-200);">
        ${uploadedCount} of ${totalRequired} REQUIRED UPLOADED
      </div>
    </div>
    
    ${currentFormType === 'copyright' ? renderCopyrightFirstTimeApplicantNote() : ''}

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:28px;">
      <div style="padding:18px; background:white; border:1px solid var(--gray-100); border-radius:14px;">
        <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Submission Progress</div>
        <div style="font-size:1.75rem; font-weight:800; color:var(--navy);">${uploadedCount}/${totalRequired}</div>
        <div style="font-size:0.82rem; color:var(--gray-500); margin-top:6px;">Required documents uploaded</div>
      </div>
      <div style="padding:18px; background:white; border:1px solid var(--gray-100); border-radius:14px;">
        <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Current Status</div>
        <div style="font-size:1.1rem; font-weight:800; color:var(--navy);">${currentStatus}</div>
        <div style="font-size:0.82rem; color:var(--gray-500); margin-top:6px;">Visible to the applicant throughout submission</div>
      </div>
      ${
        showPaymentControls
          ? `<div style="padding:18px; background:white; border:1px solid var(--gray-100); border-radius:14px;">
              <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Payment Step</div>
              <div style="font-size:1.1rem; font-weight:800; color:var(--navy);">${paymentLabel}</div>
            </div>`
          : ""
      }
    </div>

    <div style="border:1.5px solid var(--gray-100); background:white; border-radius:20px; padding:24px;">
      <div>
        <h4 style="color:var(--navy); margin-bottom:6px;">Dynamic Requirement Uploads</h4>
        <p style="color:var(--gray-500); font-size:0.88rem; line-height:1.6; margin:0 0 20px;">Upload one file for each listed requirement. This behavior is shared across all application types for consistency.</p>
        ${renderDynamicRequirementUploaders(currentFormType)}
      </div>

    <div id="uploadStatus" style="margin-top:24px;">
      ${uploadedCount > 0 ? renderUploadedFiles() : ""}
    </div>

      <div style="margin-top:24px;">
        ${showPaymentControls ? renderConditionalPaymentUploadPanel(wizardData) : ""}
      </div>
    </div>
  `;
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
        <div class="review-item"><span class="label">College</span>${val(wizardData.college)}</div>
        ${wizardData.applicantId ? `<div class="review-item"><span class="label">Employee / Student ID</span>${val(wizardData.applicantId)}</div>` : ""}
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
    <div class="review-section"><h4><i class="fa-solid fa-paperclip" style="color:var(--gold);margin-right:6px"></i>Documents</h4>
      <p style="color:var(--gray-500);font-size:.9rem; margin-bottom:14px;">Required uploads are summarized below. Proof of payment stays hidden unless an evaluator requests it later in the review flow.</p>
      <div style="margin-bottom:16px;">${renderRequirementChecklistPanel(currentFormType, { compact: true })}</div>
      ${renderConditionalPaymentUploadPanel(wizardData, { infoOnly: true })}
    </div>
    <div style="padding:16px 20px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;margin-top:4px;font-size:.85rem;color:#92400e;display:flex;gap:10px;align-items:flex-start">
      <i class="fa-solid fa-person-chalkboard" style="color:#d97706;margin-top:2px"></i>
      <div><strong>Manual Review Policy:</strong> Your submission will be reviewed by PSU IP Office staff. No AI-driven assessment occurs. You will be notified at your registered email once review is complete.</div>
    </div>
    <div style="margin-top: 24px; padding: 20px; background: white; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
      <label style="display: flex; gap: 14px; align-items: flex-start; cursor: pointer; margin: 0; text-align: left;">
        <input type="checkbox" id="reviewTermsConfirm" onchange="toggleSubmitButton()" style="margin-top: 4px; width: 18px; height: 18px; flex-shrink: 0;">
        <span style="font-size: 0.9rem; color: var(--gray-700); line-height: 1.6;">
          I confirm that all submitted information is accurate and complies with the <a href="javascript:void(0)" onclick="event.stopPropagation(); showTermsModal();" style="color: var(--navy); font-weight: 800; text-decoration: underline;">Terms &amp; Conditions</a>
        </span>
      </label>
    </div>`;
}

function saveFormDraft() {
  captureWizardData();
  const typeMap = { patent: "Patent",   copyright: "Copyright", utility: "Utility Model", industrial: "Industrial Design" };
  const typeLabel = typeMap[currentFormType] || "Draft";
  
  if (!wizardData.draftId) {
    wizardData.draftId = `DRAFT-${Date.now()}`;
    const draftSub = {
      id: wizardData.draftId,
      type: typeLabel,
      title: wizardData.title || "(Untitled Draft)",
      applicant: wizardData.name || "Current User",
      status: "Draft",
      date: new Date().toISOString().split('T')[0],
      isDraft: true
    };
    submissions.unshift(draftSub);
  } else {
    const d = submissions.find(s => s.id === wizardData.draftId);
    if (d) {
      d.title = wizardData.title || "(Untitled Draft)";
      d.type = typeLabel;
    }
  }
  showToast("Application draft saved successfully!", "success");
}

function captureAdvisoryServiceSheetData() {
  const captureValue = (key, id, fallback = "") => {
    const el = document.getElementById(id);
    if (el) wizardData[key] = el.value || fallback;
  };
  const captureRadio = (key, name, fallback = "") => {
    const input = document.querySelector(`input[name="${name}"]:checked`);
    if (input) wizardData[key] = input.value;
    else if (!wizardData[key] && fallback) wizardData[key] = fallback;
  };
  const captureChecks = (key, name, fallback = []) => {
    const inputs = document.querySelectorAll(`input[name="${name}"]`);
    if (inputs.length) {
      const values = getCheckedValuesByName(name);
      wizardData[key] = values.length ? values : fallback;
    } else if (!Array.isArray(wizardData[key]) && fallback.length) {
      wizardData[key] = fallback;
    }
  };

  captureRadio("advisoryClientType", "advisoryClientType");
  captureRadio("advisorySex", "advisorySex");
  wizardData.advisoryServiceAvailed = getLockedAdvisoryServiceAvailed();
  [
    ["advisoryCompany", "advisory-company"],
    ["advisoryDate", "advisory-date"],
    ["advisoryPosition", "advisory-position"],
    ["advisoryAge", "advisory-age"],
    ["advisoryLastName", "advisory-last-name"],
    ["advisoryFirstName", "advisory-first-name"],
    ["advisoryMiddleName", "advisory-middle-name"],
    ["advisoryAddress", "advisory-address"],
    ["advisoryContact", "advisory-contact"],
    ["advisoryEmail", "advisory-email"],
    ["advisoryTitle", "advisory-title"],
    ["advisoryTechnicalAdvisor", "advisory-technical-advisor"],
    ["advisoryClientSignature", "advisory-client-signature"],
  ].forEach(([key, id]) => captureValue(key, id, wizardData[key] || ""));

  wizardData.advisoryServiceAvailed = getLockedAdvisoryServiceAvailed();
}

function validateWizardStep() {
  return true; // Bypassed for prototyping
  const stepContainer = document.getElementById('wizardBody');
  if (!stepContainer) return true;
  
  const requiredFields = stepContainer.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.border = '1.5px solid var(--red)';
      isValid = false;
    } else {
      field.style.border = '1px solid var(--gray-200)';
    }
  });

  if (!isValid) {
    showToast("Please fill in all required fields (*) before proceeding.", "error");
  }
  return isValid;
}

function captureWizardData() {
  if (isCopyrightGoogleFlow()) {
    captureCopyrightGoogleData();
    return;
  }

  if (isPatentIntakeFlow()) {
    const captureValue = (key, id, fallback = "") => {
      const el = document.getElementById(id);
      if (el) wizardData[key] = el.value || fallback;
    };
    const captureRadio = (key, name, fallback = "") => {
      const input = document.querySelector(`input[name="${name}"]:checked`);
      if (input) wizardData[key] = input.value;
      else if (!wizardData[key] && fallback) wizardData[key] = fallback;
    };
    const captureChecks = (key, name, fallback = []) => {
      const inputs = document.querySelectorAll(`input[name="${name}"]`);
      if (inputs.length) {
        const values = getCheckedValuesByName(name);
        wizardData[key] = values.length ? values : fallback;
      } else if (!Array.isArray(wizardData[key]) && fallback.length) {
        wizardData[key] = fallback;
      }
    };

    captureRadio("advisoryClientType", "advisoryClientType");
    captureRadio("advisorySex", "advisorySex");
    wizardData.advisoryServiceAvailed = getLockedAdvisoryServiceAvailed();
    [
      ["advisoryCompany", "advisory-company"],
      ["advisoryDate", "advisory-date"],
      ["advisoryPosition", "advisory-position"],
      ["advisoryAge", "advisory-age"],
      ["advisoryLastName", "advisory-last-name"],
      ["advisoryFirstName", "advisory-first-name"],
      ["advisoryMiddleName", "advisory-middle-name"],
      ["advisoryAddress", "advisory-address"],
      ["advisoryContact", "advisory-contact"],
      ["advisoryEmail", "advisory-email"],
      ["advisoryTitle", "advisory-title"],
      ["advisoryTechnicalAdvisor", "advisory-technical-advisor"],
      ["advisoryClientSignature", "advisory-client-signature"],
    ].forEach(([key, id]) => captureValue(key, id, wizardData[key] || ""));

    captureRadio("disclosureUsedPsuResources", "disclosureUsedPsuResources");
    captureRadio("disclosurePriorPublic", "disclosurePriorPublic");
    captureChecks("disclosureResourcesUsed", "disclosureResourcesUsed");
    wizardData.disclosureFundingSource = getLockedDisclosureFundingSource();
    captureChecks("disclosurePriorTypes", "disclosurePriorTypes");
    [
      ["disclosureInventors", "disclosure-inventors"],
      ["disclosureJobTitle", "disclosure-job-title"],
      ["disclosureCollege", "disclosure-college"],
      ["disclosureContact", "disclosure-contact"],
      ["disclosureTitle", "disclosure-title"],
      ["disclosureDate", "disclosure-date"],
      ["disclosureBackground", "disclosure-background"],
      ["disclosureDescription", "disclosure-description"],
      ["disclosureNovelFeatures", "disclosure-novel-features"],
      ["disclosureAdvantages", "disclosure-advantages"],
      ["disclosureApplications", "disclosure-applications"],
      ["disclosureResourceOther", "disclosure-resource-other"],
      ["disclosureExternalFunding", "disclosure-external-funding"],
      ["disclosurePriorOther", "disclosure-prior-other"],
      ["disclosurePriorDateVenue", "disclosure-prior-date-venue"],
      ["disclosureCreator1", "disclosure-creator-1"],
      ["disclosureCreator2", "disclosure-creator-2"],
      ["disclosureCreator3", "disclosure-creator-3"],
      ["disclosureIpttoRepresentative", "disclosure-iptto-representative"],
      ["disclosureTtpuHead", "disclosure-ttpu-head"],
      ["supportingNotes", "patent-supporting-notes"],
    ].forEach(([key, id]) => captureValue(key, id, wizardData[key] || ""));

    wizardData.title =
      document.getElementById("patent-title")?.value ||
      wizardData.disclosureTitle ||
      wizardData.advisoryTitle ||
      wizardData.title ||
      "";
    wizardData.applicationRoute =
      document.querySelector('input[name="applicationRoute"]:checked')?.value ||
      wizardData.applicationRoute ||
      "direct";
    wizardData.priorityClaim =
      document.querySelector('input[name="priorityClaim"]:checked')?.value ||
      wizardData.priorityClaim ||
      "no";
    wizardData.divisionalParentApplicationNo =
      document.getElementById("patent-div-parent-no")?.value ||
      wizardData.divisionalParentApplicationNo ||
      "";
    wizardData.divisionalParentFilingDate =
      document.getElementById("patent-div-parent-date")?.value ||
      wizardData.divisionalParentFilingDate ||
      "";
    wizardData.priorityNumber =
      document.getElementById("patent-priority-number")?.value ||
      wizardData.priorityNumber ||
      "";
    wizardData.priorityDate =
      document.getElementById("patent-priority-date")?.value ||
      wizardData.priorityDate ||
      "";
    wizardData.priorityCountry =
      document.getElementById("patent-priority-country")?.value ||
      wizardData.priorityCountry ||
      "";
    wizardData.priorityCertifiedCopy =
      document.getElementById("patent-priority-certified")?.value ||
      wizardData.priorityCertifiedCopy ||
      "";
    wizardData.internationalAppNo =
      document.getElementById("patent-intl-app-no")?.value ||
      wizardData.internationalAppNo ||
      "";
    wizardData.internationalFileDate =
      document.getElementById("patent-intl-file-date")?.value ||
      wizardData.internationalFileDate ||
      "";
    wizardData.internationalPublicationNo =
      document.getElementById("patent-intl-pub-no")?.value ||
      wizardData.internationalPublicationNo ||
      "";
    wizardData.internationalPublicationDate =
      document.getElementById("patent-intl-pub-date")?.value ||
      wizardData.internationalPublicationDate ||
      "";
    wizardData.applicantType =
      document.querySelector('input[name="applicantType"]:checked')?.value ||
      wizardData.applicantType ||
      "individual";
    wizardData.entityStatus =
      document.querySelector('input[name="entityStatus"]:checked')?.value ||
      wizardData.entityStatus ||
      "small";
    wizardData.applicantCompany =
      document.getElementById("patent-app-company")?.value ||
      wizardData.applicantCompany ||
      "";
    wizardData.applicantPosition =
      document.getElementById("patent-app-position")?.value ||
      wizardData.applicantPosition ||
      "";

    wizardData.applicantSex =
      document.querySelector('input[name="applicantSex"]:checked')?.value ||
      wizardData.applicantSex ||
      "";
    wizardData.applicantLastName =
      document.getElementById("patent-app-last-name")?.value ||
      wizardData.applicantLastName ||
      "";
    wizardData.applicantFirstName =
      document.getElementById("patent-app-first-name")?.value ||
      wizardData.applicantFirstName ||
      "";
    wizardData.applicantMiddleName =
      document.getElementById("patent-app-middle-name")?.value ||
      wizardData.applicantMiddleName ||
      "";
    wizardData.applicantAddress =
      document.getElementById("patent-app-address")?.value ||
      wizardData.applicantAddress ||
      "";
    wizardData.applicantTown =
      document.getElementById("patent-app-town")?.value ||
      wizardData.applicantTown ||
      "";
    wizardData.applicantProvince =
      document.getElementById("patent-app-province")?.value ||
      wizardData.applicantProvince ||
      "";
    wizardData.applicantZip =
      document.getElementById("patent-app-zip")?.value ||
      wizardData.applicantZip ||
      "";
    wizardData.applicantCountry =
      document.getElementById("patent-app-country")?.value ||
      wizardData.applicantCountry ||
      "";
    wizardData.applicantContact =
      document.getElementById("patent-app-contact")?.value ||
      wizardData.applicantContact ||
      "";
    wizardData.applicantEmail =
      document.getElementById("patent-app-email")?.value ||
      wizardData.applicantEmail ||
      "";
    wizardData.applicantNationality =
      document.getElementById("patent-app-nationality")?.value ||
      wizardData.applicantNationality ||
      "";

    wizardData.inventorSex =
      document.querySelector('input[name="inventorSex"]:checked')?.value ||
      wizardData.inventorSex ||
      "";
    wizardData.inventorLastName =
      document.getElementById("patent-inv-last-name")?.value ||
      wizardData.inventorLastName ||
      "";
    wizardData.inventorFirstName =
      document.getElementById("patent-inv-first-name")?.value ||
      wizardData.inventorFirstName ||
      "";
    wizardData.inventorMiddleName =
      document.getElementById("patent-inv-middle-name")?.value ||
      wizardData.inventorMiddleName ||
      "";
    wizardData.inventorAddress =
      document.getElementById("patent-inv-address")?.value ||
      wizardData.inventorAddress ||
      "";
    wizardData.inventorTown =
      document.getElementById("patent-inv-town")?.value ||
      wizardData.inventorTown ||
      "";
    wizardData.inventorProvince =
      document.getElementById("patent-inv-province")?.value ||
      wizardData.inventorProvince ||
      "";
    wizardData.inventorZip =
      document.getElementById("patent-inv-zip")?.value ||
      wizardData.inventorZip ||
      "";
    wizardData.inventorCountry =
      document.getElementById("patent-inv-country")?.value ||
      wizardData.inventorCountry ||
      "";
    wizardData.inventorContact =
      document.getElementById("patent-inv-contact")?.value ||
      wizardData.inventorContact ||
      "";
    wizardData.inventorEmail =
      document.getElementById("patent-inv-email")?.value ||
      wizardData.inventorEmail ||
      "";
    wizardData.inventorNationality =
      document.getElementById("patent-inv-nationality")?.value ||
      wizardData.inventorNationality ||
      "";

    wizardData.agentRegistrationNo =
      document.getElementById("patent-agent-no")?.value ||
      wizardData.agentRegistrationNo ||
      "";
    wizardData.agentCompany =
      document.getElementById("patent-agent-company")?.value ||
      wizardData.agentCompany ||
      "";
    wizardData.agentPosition =
      document.getElementById("patent-agent-position")?.value ||
      wizardData.agentPosition ||
      "";
    wizardData.agentSex =
      document.querySelector('input[name="agentSex"]:checked')?.value ||
      wizardData.agentSex ||
      "";
    wizardData.agentLastName =
      document.getElementById("patent-agent-last-name")?.value ||
      wizardData.agentLastName ||
      "";
    wizardData.agentFirstName =
      document.getElementById("patent-agent-first-name")?.value ||
      wizardData.agentFirstName ||
      "";
    wizardData.agentMiddleName =
      document.getElementById("patent-agent-middle-name")?.value ||
      wizardData.agentMiddleName ||
      "";
    wizardData.agentAddress =
      document.getElementById("patent-agent-address")?.value ||
      wizardData.agentAddress ||
      "";
    wizardData.agentTown =
      document.getElementById("patent-agent-town")?.value ||
      wizardData.agentTown ||
      "";
    wizardData.agentProvince =
      document.getElementById("patent-agent-province")?.value ||
      wizardData.agentProvince ||
      "";
    wizardData.agentZip =
      document.getElementById("patent-agent-zip")?.value ||
      wizardData.agentZip ||
      "";
    wizardData.agentCountry =
      document.getElementById("patent-agent-country")?.value ||
      wizardData.agentCountry ||
      "";
    wizardData.agentContact =
      document.getElementById("patent-agent-contact")?.value ||
      wizardData.agentContact ||
      "";
    wizardData.agentEmail =
      document.getElementById("patent-agent-email")?.value ||
      wizardData.agentEmail ||
      "";
    wizardData.agentNationality =
      document.getElementById("patent-agent-nationality")?.value ||
      wizardData.agentNationality ||
      "";

    wizardData.drawingsCount =
      document.getElementById("patent-drawings-count")?.value ||
      wizardData.drawingsCount ||
      "";
    wizardData.claimsCount =
      document.getElementById("patent-claims-count")?.value ||
      wizardData.claimsCount ||
      "";
    wizardData.supportingNotes =
      document.getElementById("patent-supporting-notes")?.value ||
      wizardData.supportingNotes ||
      "";

    wizardData.name = [
      wizardData.advisoryFirstName || wizardData.applicantFirstName,
      wizardData.advisoryMiddleName || wizardData.applicantMiddleName,
      wizardData.advisoryLastName || wizardData.applicantLastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    wizardData.email =
      wizardData.advisoryEmail || wizardData.applicantEmail || wizardData.email || "";
    wizardData.contact = wizardData.advisoryContact || wizardData.applicantContact || "";
    wizardData.dept =
      wizardData.disclosureCollege ||
      wizardData.advisoryCompany ||
      wizardData.applicantCompany ||
      wizardData.dept ||
      "";
    wizardData.description =
      wizardData.disclosureDescription ||
      wizardData.disclosureBackground ||
      wizardData.supportingNotes ||
      wizardData.title ||
      "";
    wizardData.applicantFirstName =
      wizardData.applicantFirstName || "";
    wizardData.applicantMiddleName =
      wizardData.applicantMiddleName || "";
    wizardData.applicantLastName =
      wizardData.applicantLastName || "";
    wizardData.applicantCompany =
      wizardData.applicantCompany || "";
    wizardData.applicantPosition =
      wizardData.applicantPosition || "";
    wizardData.applicantAddress =
      wizardData.applicantAddress || "";
    wizardData.applicantContact =
      wizardData.applicantContact || "";
    wizardData.applicantEmail =
      wizardData.applicantEmail || "";
    wizardData.advisoryServiceAvailed = getLockedAdvisoryServiceAvailed();
    syncRequirementUploadsToFiles(currentFormType);
    return;
  }

  if (isUtilityGoogleFlow()) {
    captureUtilityGoogleData();
    return;
  }

  if (isIndustrialGoogleFlow()) {
    captureIndustrialGoogleData();
    return;
  }

  if (currentWizardStep === 1) {
    wizardData.name =
      document.getElementById("wiz-name")?.value || wizardData.name || "";
    wizardData.email =
      document.getElementById("wiz-email")?.value || wizardData.email || "";
    wizardData.college =
      document.getElementById("wiz-college")?.value || wizardData.college || "";
    wizardData.dept = wizardData.college || wizardData.dept || "";
    wizardData.applicantId =
      document.getElementById("wiz-id")?.value || wizardData.applicantId || "";
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
    wizardData.colorclaim =
      document.getElementById("wiz-colorclaim")?.value ||
      wizardData.colorclaim ||
      "";
    wizardData.worktype =
      document.getElementById("wiz-worktype")?.value ||
      wizardData.worktype ||
      "";
    wizardData.reglane =
      document.getElementById("wiz-reglane")?.value || wizardData.reglane || "";
    wizardData.prodcat =
      document.getElementById("wiz-prodcat")?.value || wizardData.prodcat || "";
    wizardData.designtype =
      document.getElementById("wiz-designtype")?.value ||
      wizardData.designtype ||
      "";
    wizardData.industrial =
      document.getElementById("wiz-industrial")?.value ||
      wizardData.industrial ||
      "";
    wizardData.novelty =
      document.getElementById("wiz-novelty")?.value || wizardData.novelty || "";
    wizardData.description = wizardData.desc || wizardData.description || wizardData.title || "";
  }
}

function getMaxWizardSteps() {
  if (isCopyrightGoogleFlow()) return getCopyrightFormSteps().length;
  if ((currentFormType === "copyright" || currentFormType === "patent") && submissionMethod === "upload") return 3;
  if (isPatentIntakeFlow()) return getPatentFormSteps().length;
  if (isUtilityGoogleFlow()) return 4;
  if (isIndustrialGoogleFlow()) return 4;
  return 4;
}

function nextWizardStep() {
  captureWizardData();
  const maxSteps = getMaxWizardSteps();
  if (currentWizardStep < maxSteps) {
    if (currentWizardStep === 1 && submissionMethod === "upload" && currentFormType !== "copyright") {
      currentWizardStep = maxSteps - 1; // Fast-track to upload step
    } else {
      currentWizardStep++;
    }
    refreshWizard();
  }
}
function prevWizardStep() {
  if (currentWizardStep > 1) {
    if (currentWizardStep === 3 && submissionMethod === "upload" && currentFormType !== "copyright") {
      currentWizardStep = 1; // Back to start from fast-track
    } else {
      currentWizardStep--;
    }
    refreshWizard();
  }
}
function refreshWizard() {
  if (isAdvancedGuidedFlow()) {
    const target =
      currentPage === "forms"
        ? document.getElementById("formsPublicContent")
        : document.getElementById("main-content");
    if (target) {
      if (currentPage === "forms") {
        target.innerHTML = renderActiveGuidedForm("forms", "Forms");
      } else {
        target.innerHTML = renderFormWizard(
          currentFormType === "patent"
            ? "Patent Application"
            : currentFormType === "copyright"
              ? "Copyright Registration"
              : currentFormType === "utility"
                ? "Utility Model Application"
                : "Industrial Design Registration",
        );
      }
    }
    return;
  }

  document.querySelectorAll(".wizard-step").forEach((s, i) => {
    s.classList.remove("active", "completed");
    if (i + 1 === currentWizardStep) s.classList.add("active");
    else if (i + 1 < currentWizardStep) s.classList.add("completed");
  });
  document.getElementById("wizardBody").innerHTML = renderWizardStep();
  const footer = document.querySelector(".wizard-footer");
  footer.innerHTML = `
    <div style="display: flex; gap: 12px;">
      <button class="btn btn-secondary" onclick="prevWizardStep()" ${currentWizardStep === 1 ? "disabled" : ""}>
        <i class="fa-solid fa-arrow-left"></i> Previous
      </button>
      <button class="btn btn-outline-navy" onclick="handleSaveDraft()">
        <i class="fa-solid fa-floppy-disk"></i> Save Draft
      </button>
    </div>
    ${
      currentWizardStep < getMaxWizardSteps()
        ? `<button class="btn btn-primary" onclick="nextWizardStep()">Next <i class="fa-solid fa-arrow-right"></i></button>`
        : `<button class="btn btn-success" id="finalSubmitBtn" onclick="submitForm()" ${currentFormType === 'copyright' && submissionMethod === 'upload' ? 'disabled' : ''}><i class="fa-solid fa-paper-plane"></i> Submit Application</button>`
    }
  `;
}

window.handleSaveDraft = function() {
  syncWizardData();
  saveDraft();
};

function syncWizardData() {
  // Capture basic info
  const name = document.getElementById("wiz-name");
  const email = document.getElementById("wiz-email");
  const contact = document.getElementById("wiz-contact");
  const id = document.getElementById("wiz-id");
  
  if (name) wizardData.applicantName = name.value;
  if (email) wizardData.applicantEmail = email.value;
  if (contact) wizardData.applicantPhone = contact.value;
  if (id) wizardData.applicantId = id.value;

  // Capture step-specific patent info
  const title = document.getElementById("p-title");
  const field = document.getElementById("p-field");
  const desc = document.getElementById("p-desc");
  
  if (title) wizardData.title = title.value;
  if (field) wizardData.field = field.value;
  if (desc) wizardData.description = desc.value;

  // Capture authorship
  const authorType = document.querySelector('input[name="authorType"]:checked');
  if (authorType) wizardData.authorType = authorType.value;
}

function saveDraft() {
  const draftId = selectedSubmissionId || `DRAFT-${Date.now()}`;
  const draft = {
    id: draftId,
    type: currentFormType,
    step: currentWizardStep,
    data: { ...wizardData },
    date: new Date().toISOString().split('T')[0],
    status: "Draft",
    title: wizardData.title || "Untitled Application"
  };

  // Find existing or add new
  const idx = submissions.findIndex(s => s.id === draftId);
  if (idx !== -1) {
    submissions[idx] = { ...submissions[idx], ...draft };
  } else {
    submissions.push(draft);
  }
  
  showToast("Draft saved successfully!");
  navigateTo("user-dashboard");
}

window.resumeDraft = function(id) {
  const s = submissions.find(sub => sub.id === id);
  if (!s) return;
  
  currentFormType = s.type;
  currentWizardStep = s.step || 1;
  wizardData = { ...s.data };
  selectedSubmissionId = s.id;
  
  navigateTo("filing-wizard");
};

window.handleCancelSubmission = function (id) {
  const s = submissions.find((sub) => sub.id === id);
  if (!s) return;

  const isDraft = s.status === "Draft";
  if (isDraft) {
    showDiscardDraftModal(id);
  } else {
    showCancellationModal(id);
  }
};

window.showDiscardDraftModal = function(id) {
  const overlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  
  modalTitle.innerText = "Discard this Draft?";
  modalTitle.style.display = "block";

  modalBody.innerHTML = `
    <div style="padding: 0 8px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 1.8rem;">
        <i class="fa-solid fa-trash-can"></i>
      </div>
      <p style="color: var(--gray-700); font-weight: 600; margin-bottom: 8px;">Are you sure you want to discard this draft?</p>
      <p style="color: var(--gray-500); font-size: 0.9rem; margin-bottom: 32px;">This action cannot be undone. All unsaved progress on this filing will be permanently lost.</p>
      
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-outline-navy" style="flex: 1; justify-content: center;" onclick="closeModal()">Keep Draft</button>
        <button class="btn btn-danger" style="flex: 1; justify-content: center; background: #ef4444; color: white;" onclick="confirmDiscardDraft('${id}')">Discard Permanently</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');
};

window.confirmDiscardDraft = function(id) {
  const idx = submissions.findIndex((sub) => sub.id === id);
  if (idx !== -1) {
    submissions.splice(idx, 1);
    showToast("Draft discarded successfully.");
    closeModal();
    navigateTo("user-dashboard");
  }
};

window.showCancellationModal = function(id) {
  const s = submissions.find(sub => sub.id === id);
  if (!s) return;

  const overlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  
  modalTitle.innerText = "Why are you cancelling?";
  modalTitle.style.display = "block";

  modalBody.innerHTML = `
    <div style="padding: 0 8px;">
      <p style="color: var(--gray-500); font-size: 0.9rem; margin-bottom: 20px;">Please select the most accurate reason for withdrawing this application. This helps us improve our filing process.</p>
      
      <div class="reason-list">
        <div class="reason-option" onclick="selectCancellationReason(this, 'Change of mind / No longer interested')">
          <div class="reason-dot"></div>
          <div class="reason-text">Change of mind / No longer interested</div>
        </div>
        <div class="reason-option" onclick="selectCancellationReason(this, 'Incorrect information provided')">
          <div class="reason-dot"></div>
          <div class="reason-text">Incorrect information provided</div>
        </div>
        <div class="reason-option" onclick="selectCancellationReason(this, 'Duplicate application')">
          <div class="reason-dot"></div>
          <div class="reason-text">Duplicate application</div>
        </div>
        <div class="reason-option" onclick="selectCancellationReason(this, 'Found a better alternative')">
          <div class="reason-dot"></div>
          <div class="reason-text">Found a better alternative</div>
        </div>
        <div class="reason-option" onclick="selectCancellationReason(this, 'Other')">
          <div class="reason-dot"></div>
          <div class="reason-text">Other (Please specify below)</div>
        </div>
      </div>

      <div id="otherReasonWrapper" style="display: none; margin-top: 16px; animation: slideInUp 0.3s ease;">
        <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--gray-500); margin-bottom: 8px; text-transform: uppercase;">Specify Reason</label>
        <textarea id="customCancellationReason" placeholder="Please tell us more..." 
                  style="width: 100%; min-height: 100px; padding: 12px; border: 2px solid var(--gray-200); border-radius: 12px; font-family: inherit; resize: none; outline: none; transition: border-color 0.2s;"></textarea>
      </div>

      <div style="margin-top: 32px; display: flex; gap: 12px;">
        <button class="btn btn-outline-navy" style="flex: 1; justify-content: center;" onclick="closeModal()">Nevermind</button>
        <button class="btn btn-primary" id="confirmCancelBtn" style="flex: 1; justify-content: center;" disabled onclick="confirmCancellation('${id}')">Confirm Cancellation</button>
      </div>
    </div>
  `;

  overlay.classList.add('active');
};

function getCancellationDocumentConfig(submission, reason) {
  const applicantName = submission.applicant || getCurrentUser().name || "";
  const safeReason = reason || "Voluntary cancellation requested by the applicant.";
  const configs = {
    Patent: {
      mode: "cancellation",
      title: "Petition for Cancellation / Voluntary Surrender",
      formNo: "IPAS FORM NO. 018",
      office: "The Director, Bureau of Patents",
      matterLabel: "Letters Patent",
      pdfPath: "file:///C:/Users/Owen/Downloads/patent%20for%20Cancellation.pdf",
      recordLabel: "Patent/Registration No.",
      recordValue: submission.id,
      titleLabel: "Title of the Invention",
      titleValue: submission.title,
      applicantName,
      filingDate: submission.date,
      reason: safeReason,
    },
    "Utility Model": {
      mode: "cancellation",
      title: "Petition for Cancellation / Voluntary Surrender",
      formNo: "IPAS FORM NO. 018",
      office: "The Director, Bureau of Patents",
      matterLabel: "Utility Model Registration",
      pdfPath: "file:///C:/Users/Owen/Downloads/utility%20model%20Cancellation-018.pdf",
      recordLabel: "Patent/Registration No.",
      recordValue: submission.id,
      titleLabel: "Title of the Invention",
      titleValue: submission.title,
      applicantName,
      filingDate: submission.date,
      reason: safeReason,
    },
    "Industrial Design": {
      mode: "cancellation",
      title: "Petition for Cancellation / Voluntary Surrender",
      formNo: "BOP FORM NO. (v01): P018",
      office: "The Director, Bureau of Patents",
      matterLabel: "Industrial Design Registration",
      pdfPath: "file:///C:/Users/Owen/Downloads/industrial%20design%20for%20Cancellation-P018.pdf",
      recordLabel: "Application No.",
      recordValue: submission.id,
      titleLabel: "Title of the Invention",
      titleValue: submission.title,
      applicantName,
      filingDate: submission.date,
      reason: safeReason,
    },
  };
  return configs[submission.type] || configs.Patent;
}

function renderCancellationChecklistItem(label, checked) {
  return `<div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
    <span style="font-size:1rem; color:${checked ? "var(--navy)" : "var(--gray-400)"};">${checked ? "☑" : "☐"}</span>
    <span style="font-size:0.9rem; color:var(--gray-700); line-height:1.6;">${escapeHtml(label)}</span>
  </div>`;
}

window.showCancellationDocumentModal = function(id, finalReason) {
  const submission = submissions.find((sub) => sub.id === id);
  if (!submission) return;
  const config = getCancellationDocumentConfig(submission, finalReason);
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const overlay = document.getElementById("modalOverlay");
  const modalCard = document.querySelector("#modalOverlay .modal-card");
  if (modalCard) modalCard.classList.add("xl");
  modalTitle.innerText = config.title;
  modalTitle.style.display = "block";

  const isSuspension = config.mode === "suspension";
  const reasonLower = String(finalReason || "").toLowerCase();
  const oppositionChecked =
    reasonLower.includes("cancellation") || reasonLower.includes("duplicate");
  const negotiationChecked =
    reasonLower.includes("negotiat") || reasonLower.includes("settle");

  modalBody.innerHTML = `
    <div style="padding:0 8px;">
      <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap; margin-bottom:20px;">
        <div>
          <div style="font-size:.78rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--gray-400);">${escapeHtml(config.formNo)}</div>
          <div style="font-size:1.15rem; font-weight:800; color:var(--navy); margin-top:6px;">${escapeHtml(config.title)}</div>
          <div style="font-size:.86rem; color:var(--gray-500); margin-top:4px;">${escapeHtml(config.office)}</div>
        </div>
        <button class="btn btn-outline-navy btn-sm" type="button" onclick="window.open('${config.pdfPath}', '_blank')"><i class="fa-solid fa-file-pdf"></i> Open Reference PDF</button>
      </div>

      <div style="background:linear-gradient(to right, #f8fafc, #ffffff); border:1px solid var(--gray-100); border-radius:18px; padding:22px; margin-bottom:18px;">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px 18px;">
          <div><div style="font-size:.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">${escapeHtml(config.recordLabel)}</div><div style="font-size:.95rem; color:var(--navy); font-weight:700; margin-top:4px;">${escapeHtml(config.recordValue)}</div></div>
          <div><div style="font-size:.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">Date Filed</div><div style="font-size:.95rem; color:var(--navy); font-weight:700; margin-top:4px;">${escapeHtml(config.filingDate || "")}</div></div>
          <div><div style="font-size:.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">Applicant</div><div style="font-size:.95rem; color:var(--navy); font-weight:700; margin-top:4px;">${escapeHtml(config.applicantName)}</div></div>
          <div><div style="font-size:.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">${escapeHtml(config.titleLabel)}</div><div style="font-size:.95rem; color:var(--navy); font-weight:700; margin-top:4px;">${escapeHtml(config.titleValue)}</div></div>
        </div>
      </div>

      <div style="border:1px solid var(--gray-100); border-radius:18px; padding:22px; background:white;">
        <div style="font-size:.78rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:12px;">Form Preview</div>
        <div style="font-size:.92rem; color:var(--gray-700); line-height:1.75;">
          ${
            isSuspension
              ? `
          <p style="margin:0 0 14px;">This is to request for suspension of action in connection with the above-mentioned application on the ground that:</p>
          ${renderCancellationChecklistItem("Applicant will file an Opposition/Petition for Cancellation against the applicant/registrant of the cited mark.", oppositionChecked)}
          ${renderCancellationChecklistItem("Applicant will negotiate/is negotiating with the applicant/registrant of the cited mark.", negotiationChecked)}
          ${renderCancellationChecklistItem(`Others, please state: ${finalReason}`, !oppositionChecked && !negotiationChecked)}
          <div style="margin-top:14px; padding:14px; background:rgba(59,130,246,0.06); border-radius:12px; border:1px solid rgba(59,130,246,0.15);">
            <div style="font-size:.76rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#1d4ed8; margin-bottom:8px;">Applicant Statement</div>
            <div>I/We will pay the corresponding suspension of examination fee.</div>
            <div style="margin-top:8px;">I/We hope for your kind consideration and approval.</div>
          </div>`
              : `
          <p style="margin:0 0 14px;">In the matter of:</p>
          ${renderCancellationChecklistItem("Letters Patent, in accordance with Sec. 56 of R.A. 8293, as amended", config.matterLabel === "Letters Patent")}
          ${renderCancellationChecklistItem("Utility Model Registration in accordance with Sec. 109.4 of R.A. 8293, as amended", config.matterLabel === "Utility Model Registration")}
          ${renderCancellationChecklistItem("Industrial Design Registration in accordance with Sec. 120 of R.A. 8293, as amended", config.matterLabel === "Industrial Design Registration")}
          <div style="margin-top:14px; padding:14px; background:rgba(245,158,11,0.06); border-radius:12px; border:1px solid rgba(245,158,11,0.15);">
            <div style="font-size:.76rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#b45309; margin-bottom:8px;">Grounds</div>
            <div>${escapeHtml(finalReason)}</div>
          </div>
          <div style="margin-top:14px;">
            <div style="font-size:.76rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--gray-400); margin-bottom:8px;">Attached are the following</div>
            ${renderCancellationChecklistItem("Certified and verified copies of documents supporting my petition", true)}
            ${renderCancellationChecklistItem("Other supporting documents, if any", false)}
          </div>
          <div style="margin-top:14px;">Full payment of the required fee(s): <span style="display:inline-block; min-width:140px; border-bottom:1px solid var(--gray-300);">&nbsp;</span></div>`
          }
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end; flex-wrap:wrap;">
        <button class="btn btn-outline-navy" type="button" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" type="button" onclick="showToast('${escapeHtml(config.title)} ready for ${escapeHtml(submission.id)}')"><i class="fa-solid fa-print"></i> Prepare Form</button>
      </div>
    </div>
  `;
  overlay.classList.add("active");
};

window.selectCancellationReason = function(el, reason) {
  document.querySelectorAll('.reason-option').forEach(opt => opt.classList.remove('selected'));
  el.classList.add('selected');
  
  const wrapper = document.getElementById('otherReasonWrapper');
  const confirmBtn = document.getElementById('confirmCancelBtn');
  confirmBtn.disabled = false;
  
  if (reason === 'Other') {
    wrapper.style.display = 'block';
    setTimeout(() => {
      document.getElementById('customCancellationReason').focus();
    }, 100);
  } else {
    wrapper.style.display = 'none';
  }
  
  window.selectedReasonType = reason;
};

window.confirmCancellation = function(id) {
  const s = submissions.find(sub => sub.id === id);
  if (!s) return;

  let finalReason = window.selectedReasonType;
  if (finalReason === 'Other') {
    const custom = document.getElementById('customCancellationReason').value.trim();
    if (!custom) {
      alert("Please specify your reason in the text area.");
      return;
    }
    finalReason = custom;
  }

  s.status = "Cancelled";
  s.cancellationReason = finalReason;

  showCancellationDocumentModal(id, finalReason);
  showToast("Cancellation request captured. Matching form opened.");
};

// ===== SUBMISSION METHOD SELECTION =====
window.showSubmissionMethodModal = function(typeId) {
  startSubmissionFlow(typeId, "online");
};

window.showApplicantTypeModal = function(typeId, method) {
  startSubmissionFlow(typeId, method, "Individual");
  return;
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');

  modalTitle.innerText = "Select Applicant Type";
  
  modalBody.innerHTML = `
    <div style="padding: 0 8px;">
      <div class="method-selection-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
        <div class="method-card" onclick="setApplicantTypeAndStart('${typeId}', '${method}', 'Individual')" style="border: 2px solid var(--gray-100); border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.3s ease; text-align: center; background: white;">
          <div style="width: 56px; height: 56px; background: var(--gray-50); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--navy); font-size: 1.5rem;">
            👤
          </div>
          <h4 style="color: var(--navy); font-weight: 800; margin-bottom: 8px; font-size: 1rem;">Individual</h4>
          <p style="font-size: 0.8rem; color: var(--gray-500); line-height: 1.5;">For personal copyright applications</p>
        </div>

        <div class="method-card" onclick="setApplicantTypeAndStart('${typeId}', '${method}', 'Institution')" style="border: 2px solid var(--gray-100); border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.3s ease; text-align: center; background: white;">
          <div style="width: 56px; height: 56px; background: var(--gray-50); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--navy); font-size: 1.5rem;">
            🏢
          </div>
          <h4 style="color: var(--navy); font-weight: 800; margin-bottom: 8px; font-size: 1rem;">Institution / Organization</h4>
          <p style="font-size: 0.8rem; color: var(--gray-500); line-height: 1.5;">For companies, schools, or groups</p>
        </div>
      </div>
    </div>
  `;
};

window.setApplicantTypeAndStart = function(typeId, method, applicantType) {
  startSubmissionFlow(typeId, method, applicantType);
};

window.initiateDirectRegistration = function(typeId, method) {
  // Always force signup for prototype testing of the flow
  isLoggedIn = false; 
  updateTopbarRole();
  
  pendingAction = {
    type: 'registration',
    typeId: typeId,
    method: method
  };
  
  showToast(`Starting ${method} registration — please create your account.`, "info");
  navigateTo('signup');
};

function createSubmissionWizardSeed() {
  return {
    requirementUploads: {},
    paymentRequested: false,
    paymentVerified: false,
    paymentProofUploaded: false,
    certificateDelivery: "pickup",
    privacyAgreement: "agree",
  };
}

window.launchPatentOnlineForm = function() {
  wizardData = createSubmissionWizardSeed();
  selectedSubmissionId = null;
  currentWizardStep = 1;
  currentFormType = "patent";
  submissionMethod = "online";

  if (isLoggedIn) {
    navigateTo("patent-form");
    return;
  }

  navigateTo("forms", false, { formView: "patent-online" });
};

window.launchCopyrightOnlineForm = function() {
  wizardData = createSubmissionWizardSeed();
  wizardData.applicantTypeGroup = "Individual";
  selectedSubmissionId = null;
  currentWizardStep = 1;
  currentFormType = "copyright";
  submissionMethod = "online";

  if (isLoggedIn) {
    navigateTo("copyright-form");
    return;
  }

  navigateTo("forms", false, { formView: "copyright-online" });
};

window.launchUtilityOnlineForm = function() {
  wizardData = createSubmissionWizardSeed();
  selectedSubmissionId = null;
  currentWizardStep = 1;
  currentFormType = "utility";
  submissionMethod = "online";

  if (isLoggedIn) {
    navigateTo("utility-form");
    return;
  }

  navigateTo("forms", false, { formView: "utility-online" });
};

window.launchIndustrialOnlineForm = function() {
  wizardData = createSubmissionWizardSeed();
  selectedSubmissionId = null;
  currentWizardStep = 1;
  currentFormType = "industrial";
  submissionMethod = "online";

  if (isLoggedIn) {
    navigateTo("industrial-form");
    return;
  }

  navigateTo("forms", false, { formView: "industrial-online" });
};




function renderFormsPublicContent() {
  if (currentParams.formView === "patent-online") {
    currentFormType = "patent";
    submissionMethod = "online";
    return renderPatentGoogleForm("forms", "Forms");
  }

  if (currentParams.formView === "copyright-online") {
    currentFormType = "copyright";
    submissionMethod = "online";
    wizardData.applicantTypeGroup = "Individual";
    return renderCopyrightGoogleForm("forms", "Forms");
  }

  if (currentParams.formView === "utility-online") {
    currentFormType = "utility";
    submissionMethod = "online";
    return renderPatentGoogleForm("forms", "Forms");
  }

  if (currentParams.formView === "industrial-online") {
    currentFormType = "industrial";
    submissionMethod = "online";
    return renderPatentGoogleForm("forms", "Forms");
  }

  if (false) {
    
    submissionMethod = "online";
    return renderForms();
  }


  return renderForms();
}

window.startSubmissionFlow = function(typeId, method, applicantType = null) {
  if (typeId === "copyright-form") {
    method = "online";
    applicantType = "Individual";
  }
  wizardData = createSubmissionWizardSeed();
  if (applicantType) {
    wizardData.applicantTypeGroup = applicantType;
  }
  selectedSubmissionId = null;
  currentWizardStep = 1;
  submissionMethod = method;
  closeModal();
  navigateTo(typeId);
};

function handleFileUpload(input) {
  wizardData.files = Array.from(input.files || []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));

  const list =
    document.getElementById("uploadStatus") || document.getElementById("fileList");
  if (list) {
    list.innerHTML = renderUploadedFiles();
  }
}

window.handleRequirementUpload = function(key, input, formType = currentFormType) {
  if (!input?.files?.length) return;
  captureWizardData();
  const files = Array.from(input.files);
  const file = files[0];
  const uploads = ensureRequirementUploads(wizardData);
  uploads[key] = {
    name: files.length > 1 ? files.map((item) => item.name).join(", ") : file.name,
    size: files.reduce((total, item) => total + item.size, 0),
    type: files.length > 1 ? "multiple" : file.type,
    fileCount: files.length,
    files: files.map((item) => ({
      name: item.name,
      size: item.size,
      type: item.type,
      uploadedAt: new Date().toISOString(),
    })),
    uploadedAt: new Date().toISOString(),
  };
  syncRequirementUploadsToFiles(formType, wizardData);
  refreshWizard();
  showToast(`Uploaded ${files.length > 1 ? `${files.length} files` : file.name} for the selected requirement.`, "success");
};

function handleDepositUpload(input) {
  if (!input.files.length) return;
  captureWizardData();
  const f = input.files[0];
  wizardData.depositFile = {
    name: f.name,
    size: f.size,
    type: f.type,
  };
  wizardData.paymentProofUploaded = true;
  wizardData.paymentVerified = false;
  refreshWizard();
  showToast("Proof of payment uploaded. Awaiting evaluator verification.", "success");
  return;
  status.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);border-radius:8px">
    <i class="fa-solid fa-circle-check" style="color:var(--green);font-size:1.2rem"></i>
    <div style="flex:1">
      <div style="font-size:.9rem;font-weight:600;color:var(--navy)">${f.name}</div>
      <div style="font-size:.8rem;color:var(--gray-400)">${(f.size / 1024).toFixed(1)} KB — Proof of payment uploaded</div>
    </div>
    <span class="badge badge-approved" style="font-size:.65rem">VERIFIED</span>
  </div>`;
}

window.handleSubmissionPaymentProofUpload = function(id, input) {
  if (!input?.files?.length) return;
  const submission = submissions.find((entry) => entry.id === id);
  if (!submission) return;
  if (!getAssignedReviewerId(submission)) {
    showToast(
      "This case must remain Pending until it is assigned or taken by a specialist.",
    );
    return;
  }
  const file = input.files[0];
  submission.depositFile = {
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
  submission.paymentRequested = true;
  submission.paymentProofUploaded = true;
  submission.paymentVerified = false;
  submission.status = "Payment Requested";
  syncSubmissionWorkflowState(submission);
  showToast("Proof of payment uploaded and sent for verification.", "success");
  navigateTo("submission-detail");
};

function submitForm() {
  captureWizardData();

  const typeMap = {
    patent: "Patent",
     
    copyright: "Copyright",
    utility: "Utility Model",
    industrial: "Industrial Design",
  };
  const prefix = {
    patent: "PAT",
    
    copyright: "COP",
    utility: "UM",
    industrial: "ID",
  };
  const refNum = `PSU-${prefix[currentFormType]}-2026-${String(submissions.length + 1).padStart(3, "0")}`;

  if (isPatentIntakeFlow()) {
    const typeLabel = typeMap[currentFormType] || "Patent";
    const formTypeKey =
      currentFormType === "industrial"
        ? "industrial"
        : currentFormType === "utility"
          ? "utility"
          : "patent";
    const applicantName = [
      wizardData.applicantFirstName,
      wizardData.applicantMiddleName,
      wizardData.applicantLastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const newPatentSubmission = {
      id: refNum,
      type: typeLabel,
      title: wizardData.title || `Untitled ${typeLabel} Application`,
      applicant: wizardData.name || applicantName || "Unnamed Applicant",
      department: wizardData.dept || wizardData.applicantCompany || `${typeLabel} Filing`,
      email: wizardData.email || wizardData.applicantEmail || "",
      contact: wizardData.contact || wizardData.applicantContact || "",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      description:
        wizardData.disclosureDescription ||
        wizardData.supportingNotes ||
        (currentFormType === "industrial"
          ? `${typeLabel} intake generated through the Advisory Service Sheet and required drawing upload workflow.`
          : `${typeLabel} intake generated through the Advisory Service Sheet and IP Disclosure workflow.`),
      paymentRequested: false,
      paymentProofUploaded: false,
      paymentVerified: false,
      frozen: false,
      formStyle: `PSU ${typeLabel} Intake`,
      filingMethod: "Guided Online Form",
      requirementUploads: { ...ensureRequirementUploads(wizardData) },
      files: [...(wizardData.files || [])],
      requiredDocuments: getRequiredDocumentsForType(formTypeKey),
      formData: { ...wizardData },
    };

    submissions.unshift(newPatentSubmission);

    const patentConfirmationTarget =
      currentPage === "forms"
        ? document.getElementById("formsPublicContent")
        : document.getElementById("main-content");
    if (!patentConfirmationTarget) return;

    patentConfirmationTarget.innerHTML = `
      <div class="patent-confirmation-shell">
        <div class="confirmation-screen">
          <div class="check-circle"><i class="fa-solid fa-check"></i></div>
          <h2>${typeLabel} intake submitted</h2>
          <p style="color:var(--gray-500)">${
            currentFormType === "industrial"
              ? "The Advisory Service Sheet and required drawing uploads were received and are now queued for PSU review. The completed paper-style form is shown below."
              : "The Advisory Service Sheet and IP Disclosure Form were received and are now queued for PSU review. The completed paper-style forms are shown below."
          }</p>
          <div class="ref-number">${refNum}</div>
          <p style="font-size:.85rem;color:var(--gray-400);margin-bottom:24px">Internal tracking reference for this guided submission.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            ${
              currentPage === "forms"
                ? `<button class="btn btn-primary" onclick="navigateTo('forms')"><i class="fa-solid fa-arrow-left"></i> Back to Forms</button>
                   <button class="btn btn-outline-navy" onclick="navigateTo('login')"><i class="fa-solid fa-right-to-bracket"></i> Login to Track</button>`
                : `<button class="btn btn-primary" onclick="navigateTo('user-dashboard')"><i class="fa-solid fa-chart-line"></i> Go to Dashboard</button>
                   <button class="btn btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-file-lines"></i> View Submissions</button>`
            }
          </div>
        </div>

        <div class="patent-gform-card patent-gform-card--sheet" style="margin-top:24px;">
          ${renderPatentIntakeFormBundle({ includeFlow: true })}
        </div>
      </div>`;
    return;
  }

  const newSub = {
    id: refNum,
    type: typeMap[currentFormType],
    title: wizardData.title || `${typeMap[currentFormType]} Submission`,
    applicant: wizardData.name || "Unnamed Applicant",
    department: wizardData.college || wizardData.dept || "PSU Applicant",
    email: wizardData.email || "",
    contact: wizardData.contact || "",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    description: wizardData.desc || wizardData.description || wizardData.title || "Newly submitted application.",
    paymentRequested: false,
    paymentProofUploaded: false,
    paymentVerified: false,
    frozen: false,
    requirementUploads: { ...ensureRequirementUploads(wizardData) },
    files: [...(wizardData.files || [])],
    requiredDocuments: getRequiredDocumentsForType(currentFormType),
    registrationLane: wizardData.reglane || "",
    formData: { ...wizardData },
  };
  submissions.unshift(newSub);

  const confirmationTarget =
    currentPage === "forms"
      ? document.getElementById("formsPublicContent")
      : document.getElementById("main-content");

  if (!confirmationTarget) return;

  if (isCopyrightGoogleFlow()) {
    confirmationTarget.innerHTML = `
      <div class="patent-confirmation-shell">
        <div class="confirmation-screen">
          <div class="check-circle"><i class="fa-solid fa-check"></i></div>
          <h2>Copyright form submitted</h2>
          <p style="color:var(--gray-500)">The Advisory Service Sheet and BCRR copyright form were received and are now pending evaluator review. The completed paper-style forms are shown below.</p>
          <div class="ref-number">${refNum}</div>
          <p style="font-size:.85rem;color:var(--gray-400);margin-bottom:24px">Please save this reference number for tracking purposes.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            ${
              currentPage === "forms"
                ? `<button class="btn btn-primary" onclick="navigateTo('forms')"><i class="fa-solid fa-arrow-left"></i> Back to Forms</button>
                   <button class="btn btn-outline-navy" onclick="navigateTo('login')"><i class="fa-solid fa-right-to-bracket"></i> Login to Track</button>`
                : `<button class="btn btn-primary" onclick="navigateTo('user-dashboard')"><i class="fa-solid fa-chart-line"></i> Go to Dashboard</button>
                   <button class="btn btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-file-lines"></i> View Submissions</button>`
            }
          </div>
        </div>

        <div class="patent-gform-card patent-gform-card--sheet" style="margin-top:24px;">
          ${renderCopyrightIntakeFormBundle()}
        </div>
      </div>`;
    return;
  }

  confirmationTarget.innerHTML = `
    <div class="confirmation-screen">
      <div class="check-circle"><i class="fa-solid fa-check"></i></div>
      <h2>Application Submitted Successfully!</h2>
      <p style="color:var(--gray-500)">Your ${typeMap[currentFormType]} application has been received and is pending evaluator review.</p>
      <div class="ref-number">${refNum}</div>
      <p style="font-size:.85rem;color:var(--gray-400);margin-bottom:24px">Please save this reference number for tracking purposes.</p>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-primary" onclick="navigateTo('user-dashboard')"><i class="fa-solid fa-chart-line"></i> Go to Dashboard</button>
        <button class="btn btn-outline-navy" onclick="navigateTo('user-submissions')"><i class="fa-solid fa-file-lines"></i> View Submissions</button>
      </div>
    </div>`;
}

// ===== MARKETPLACE =====
function renderAdminMarketplacePage() {
  const activeListings = marketplaceItems.filter((item) => !item.archived);
  const archivedListings = marketplaceItems.filter((item) => item.archived);
  const visibleListings =
    adminMarketplaceView === "archived" ? archivedListings : activeListings;
  return `
    <div class="page-header">
      <h1>Market Listing</h1>
      <p>Manage innovation listings that appear in the public marketplace.</p>
    </div>

    <div class="stats-cards" style="margin-bottom:24px;">
      <div class="stat-card">
        <div class="stat-card-icon blue"><i class="fa-solid fa-store"></i></div>
        <div class="stat-card-info"><h3>${activeListings.length}</h3><p>Active Listings</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green"><i class="fa-solid fa-certificate"></i></div>
        <div class="stat-card-info"><h3>${activeListings.filter((item) => item.type === "Patent").length}</h3><p>Patent Listings</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon yellow"><i class="fa-solid fa-bullhorn"></i></div>
        <div class="stat-card-info"><h3>${archivedListings.length}</h3><p>Archived Listings</p></div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h3>${adminMarketplaceView === "archived" ? "Archived Product Listings" : "Active Product Listings"}</h3>
        <button class="btn btn-primary" onclick="showMarketListingModal()"><i class="fa-solid fa-plus"></i> Add Listing</button>
      </div>
      <div style="padding:0 24px 14px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="filter-btn ${adminMarketplaceView === "active" ? "active" : ""}" onclick="setAdminMarketplaceView('active')">Listings (${activeListings.length})</button>
        <button class="filter-btn ${adminMarketplaceView === "archived" ? "active" : ""}" onclick="setAdminMarketplaceView('archived')">Archived (${archivedListings.length})</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Title</th>
              <th>IP Type</th>
              <th>Inventor / Lead</th>
              <th>College / External</th>
              <th>Actions</th>
            </tr>
          </thead>
            <tbody>
            ${
              visibleListings.length
                ? visibleListings
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map(
                      (item) => `
                <tr>
                  <td><strong>#${item.id}</strong></td>
                  <td>${item.title}</td>
                  <td>${typeBadge(item.type)}</td>
                  <td>${item.inventor}</td>
                  <td>${item.college}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn btn-sm btn-outline-navy" onclick="showInnovationDetail(${item.id})"><i class="fa-solid fa-eye"></i> View</button>
                      ${item.archived ? `<button class="btn btn-sm btn-secondary" disabled><i class="fa-solid fa-lock"></i> Read Only</button>` : `<button class="btn btn-sm btn-secondary" onclick="archiveMarketListing(${item.id})"><i class="fa-solid fa-box-archive"></i> Archive</button>`}
                    </div>
                  </td>
                </tr>`,
                    )
                    .join("")
                : `<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--gray-400);">No ${adminMarketplaceView === "archived" ? "archived" : "active"} market listings available.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setAdminMarketplaceView(view) {
  adminMarketplaceView = view;
  renderDashboardContent("admin-marketplace");
}

function getMarketplaceIconForType(type) {
  const icons = {
    Patent: "fa-solid fa-lightbulb",
    
    Copyright: "fa-solid fa-copyright",
    "Utility Model": "fa-solid fa-gears",
    "Industrial Design": "fa-solid fa-pen-ruler",
  };
  return icons[type] || "fa-solid fa-store";
}

function getMarketplaceImageForType(type) {
  const images = {
    Patent: "images/solar_rice_dryer.png",
    Copyright: "images/ecolearn_app.png",
    "Utility Model": "images/bamboo_filtration.png",
    "Industrial Design": "images/palawan_honey.png",
  };
  return images[type] || "images/psu_logo_main.png";
}

function findMarketplaceListingByRecordId(recordId) {
  return marketplaceItems.find((item) => item.sourceRecordId === recordId);
}

function getLatestMarketplaceApprovalRequest(recordId) {
  return marketplaceApprovalRequests
    .slice()
    .reverse()
    .find((request) => request.recordId === recordId);
}

function getNextMarketplaceRequestId() {
  const nextNumber =
    marketplaceApprovalRequests.reduce((max, request) => {
      const match = String(request.id || "").match(/(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
  return `MKT-REQ-${String(nextNumber).padStart(3, "0")}`;
}

function normalizePersonLookup(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(dr|engr|prof|atty|mr|mrs|ms)\.?\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getCertifiedRecordApplicantUser(record) {
  const ownerKey = normalizePersonLookup(record.applicant);
  return (
    systemUsers.find(
      (user) =>
        normalizeRole(user.role) === "applicant" &&
        (user.email === record.email ||
          normalizePersonLookup(user.name) === ownerKey ||
          ownerKey.includes(normalizePersonLookup(user.name)) ||
          normalizePersonLookup(user.name).includes(ownerKey)),
    ) ||
    systemUsers.find((user) => normalizeRole(user.role) === "applicant")
  );
}

function getCertifiedRecordOwnerEmail(record) {
  const owner = systemUsers.find(
    (user) =>
      user.name === record.applicant ||
      user.accountName === record.applicant ||
      user.email === record.email,
  );
  return record.email || owner?.email || "techtransfer@psu.edu.ph";
}

function buildMarketplaceListingFromCertifiedRecord(record, id) {
  const description =
    record.description ||
    `Certified ${record.type} record available for commercialization review.`;
  return {
    id,
    title: record.title,
    fullTitle: record.title.toUpperCase(),
    type: record.type,
    inventor: record.applicant,
    college: record.department,
    description,
    longDescription: description,
    features: [
      `Certified ${record.type} record ${record.id}.`,
      "Reviewed and locked in the IP Records archive for integrity.",
      "Available for licensing, collaboration, or technology transfer inquiry.",
    ],
    businessPotential:
      "Commercial potential assessment may be expanded by the technology transfer office after publication.",
    contactPerson: record.applicant,
    contactEmail: getCertifiedRecordOwnerEmail(record),
    year: record.date
      ? Number(String(record.date).slice(0, 4)) || new Date().getFullYear()
      : new Date().getFullYear(),
    icon: getMarketplaceIconForType(record.type),
    image: getMarketplaceImageForType(record.type),
    archived: false,
    sourceRecordId: record.id,
  };
}

function createMarketplaceListingFromCertifiedRecord(record) {
  const existingListing = findMarketplaceListingByRecordId(record.id);
  if (existingListing) return existingListing;

  const nextId = marketplaceItems.length
    ? Math.max(...marketplaceItems.map((item) => item.id)) + 1
    : 1;
  const listing = buildMarketplaceListingFromCertifiedRecord(record, nextId);
  marketplaceItems.push(listing);
  return listing;
}

function createMarketplaceApprovalRequest(record) {
  const applicantUser = getCertifiedRecordApplicantUser(record);
  const currentUser = getCurrentUser();
  const request = {
    id: getNextMarketplaceRequestId(),
    recordId: record.id,
    applicantUserId: applicantUser?.id || null,
    requestedByUserId: currentUser?.id || null,
    requestedByName: currentUser?.name || "Admin",
    status: "pending",
    requestedAt: new Date().toISOString(),
    respondedAt: null,
    listingId: null,
  };

  marketplaceApprovalRequests.push(request);
  pushRoleNotification("applicant", {
    userId: request.applicantUserId,
    icon: "fa-store",
    color: "#f97316",
    title: "Marketplace Approval Request",
    body: `${request.requestedByName} requests approval to publish ${record.title} in the marketplace.`,
    type: "marketplace-approval",
    requestId: request.id,
  });

  addAuditLog({
    accountName: request.requestedByName,
    action: "Requested Marketplace Approval",
    record: record.id,
    details: `Requested applicant approval to publish "${record.title}" to the marketplace.`,
    module: "Market Listing",
  });

  return request;
}

window.showMarketListingModal = function(id = null) {
  const isEdit = id !== null;
  const item = isEdit
    ? marketplaceItems.find((entry) => entry.id === id)
    : {
        title: "",
        type: "Patent",
        inventor: "",
        college: "College of Engineering",
        description: "",
        contactPerson: "",
        contactEmail: "",
        image: "",
        archived: false,
      };
  if (!item) return;
  const readOnly = Boolean(item.archived);

  document.getElementById("modalTitle").textContent = isEdit
    ? "Edit Market Listing"
    : "Add Market Listing";
  document.getElementById("modalBody").innerHTML = `
    <form onsubmit="saveMarketListing(event, ${id === null ? "null" : id})">
      <div class="form-row">
        <div class="form-group">
          <label>Product Title *</label>
          <input type="text" id="marketTitle" value="${escapeHtml(item.title || "")}" ${readOnly ? "disabled" : ""} required />
        </div>
        <div class="form-group">
          <label>IP Type *</label>
          <select id="marketType" ${readOnly ? "disabled" : ""} required>
            <option value="Patent" ${item.type === "Patent" ? "selected" : ""}>Patent</option>
            
            <option value="Copyright" ${item.type === "Copyright" ? "selected" : ""}>Copyright</option>
            <option value="Utility Model" ${item.type === "Utility Model" ? "selected" : ""}>Utility Model</option>
            <option value="Industrial Design" ${item.type === "Industrial Design" ? "selected" : ""}>Industrial Design</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Inventor / Lead *</label>
          <input type="text" id="marketInventor" value="${escapeHtml(item.inventor || "")}" ${readOnly ? "disabled" : ""} required />
        </div>
        <div class="form-group">
          <label>College / External *</label>
          <input type="text" id="marketCollege" value="${escapeHtml(item.college || "")}" ${readOnly ? "disabled" : ""} required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Contact Person</label>
          <input type="text" id="marketContactPerson" value="${escapeHtml(item.contactPerson || item.inventor || "")}" ${readOnly ? "disabled" : ""} />
        </div>
        <div class="form-group">
          <label>Contact Email</label>
          <input type="email" id="marketContactEmail" value="${escapeHtml(item.contactEmail || "")}" ${readOnly ? "disabled" : ""} />
        </div>
      </div>
      <div class="form-group">
        <label>Short Description *</label>
        <textarea id="marketDescription" rows="4" ${readOnly ? "disabled" : ""} required>${escapeHtml(item.description || "")}</textarea>
      </div>
      <div class="form-group">
        <label>Image Path / URL</label>
        <input type="text" id="marketImage" value="${escapeHtml(item.image || "")}" ${readOnly ? "disabled" : ""} placeholder="images/your-image.png" />
      </div>
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
        <button type="button" class="btn btn-outline-navy" onclick="closeModal()">Cancel</button>
        ${readOnly ? "" : `<button type="submit" class="btn btn-primary">${isEdit ? "Save Changes" : "Create Listing"}</button>`}
      </div>
    </form>
  `;
  document.getElementById("modalOverlay").classList.add("active");
};

window.saveMarketListing = function(event, id) {
  event.preventDefault();

  const title = document.getElementById("marketTitle").value.trim();
  const type = document.getElementById("marketType").value;
  const inventor = document.getElementById("marketInventor").value.trim();
  const college = document.getElementById("marketCollege").value.trim();
  const description = document.getElementById("marketDescription").value.trim();
  const contactPerson =
    document.getElementById("marketContactPerson").value.trim() || inventor;
  const contactEmail = document.getElementById("marketContactEmail").value.trim();
  const image = document.getElementById("marketImage").value.trim();

  if (!title || !type || !inventor || !college || !description) {
    showToast("Please complete all required listing fields.");
    return;
  }

  const currentUser = getCurrentUser();
  if (id !== null && id !== undefined && id !== "null") {
    const entry = marketplaceItems.find((item) => item.id === id);
    if (!entry) return;
    Object.assign(entry, {
      title,
      fullTitle: entry.fullTitle || title.toUpperCase(),
      type,
      inventor,
      college,
      description,
      longDescription: entry.longDescription || description,
      contactPerson,
      contactEmail: contactEmail || entry.contactEmail || "techtransfer@psu.edu.ph",
      image: image || entry.image || "images/psu_logo_main.png",
      icon: entry.icon || getMarketplaceIconForType(type),
      archived: Boolean(entry.archived),
    });
    addAuditLog({
      accountName: currentUser.name,
      action: "Updated Listing",
      record: `Listing #${entry.id}`,
      details: `Updated the market listing for ${entry.title}.`,
      module: "Market Listing",
    });
    showToast("Market listing updated successfully.");
  } else {
    const nextId = marketplaceItems.length
      ? Math.max(...marketplaceItems.map((item) => item.id)) + 1
      : 1;
    marketplaceItems.push({
      id: nextId,
      title,
      fullTitle: title.toUpperCase(),
      type,
      inventor,
      college,
      description,
      longDescription: description,
      features: [],
      businessPotential:
        "Commercial potential assessment is pending admin enrichment.",
      contactPerson,
      contactEmail: contactEmail || "techtransfer@psu.edu.ph",
      year: new Date().getFullYear(),
      icon: getMarketplaceIconForType(type),
      image: image || "images/psu_logo_main.png",
      archived: false,
    });
    addAuditLog({
      accountName: currentUser.name,
      action: "Added Listing",
      record: `Listing #${nextId}`,
      details: `Added a new market listing for ${title}.`,
      module: "Market Listing",
    });
    showToast("Market listing added successfully.");
  }

  closeModal();
  renderDashboardContent("admin-marketplace");
};

window.publishCertifiedRecordToMarketplace = function(recordId) {
  const normalizedRole = normalizeRole(currentRole);
  if (normalizedRole !== "superadmin" && normalizedRole !== "admin") {
    showToast("Only administrators can request marketplace publication.");
    return;
  }

  const match = findCertifiedRecord(recordId);
  if (!match) {
    showToast("Certified record not found.");
    return;
  }

  const existingListing = findMarketplaceListingByRecordId(recordId);
  if (existingListing) {
    showToast("This certified record is already connected to a marketplace listing.");
    showInnovationDetail(existingListing.id);
    return;
  }

  const latestRequest = getLatestMarketplaceApprovalRequest(recordId);
  if (latestRequest?.status === "pending") {
    showToast("Marketplace approval request is already pending with the applicant.");
    renderDashboardContent("admin-records");
    return;
  }
  if (latestRequest?.status === "declined") {
    showToast("Applicant declined marketplace publication. You cannot request again.");
    renderDashboardContent("admin-records");
    return;
  }

  createMarketplaceApprovalRequest(match.record);

  closeModal();
  showToast("Marketplace approval request sent to the applicant.");
  renderDashboardContent("admin-records");
};

window.acceptMarketplaceApproval = function(requestId) {
  const request = marketplaceApprovalRequests.find((item) => item.id === requestId);
  if (!request) {
    showToast("Marketplace approval request not found.");
    return;
  }
  const currentUser = getCurrentUser();
  if (
    normalizeRole(currentRole) !== "applicant" ||
    (request.applicantUserId && currentUser.id !== request.applicantUserId)
  ) {
    showToast("Only the applicant owner can approve this marketplace request.");
    return;
  }
  if (request.status !== "pending") {
    showToast("This marketplace request has already been answered.");
    return;
  }

  const match = findCertifiedRecord(request.recordId);
  if (!match) {
    showToast("Certified record not found.");
    return;
  }

  const listing = createMarketplaceListingFromCertifiedRecord(match.record);
  request.status = "accepted";
  request.respondedAt = new Date().toISOString();
  request.listingId = listing.id;

  updateNotificationByRequestId(request.id, {
    icon: "fa-circle-check",
    color: "#22c55e",
    title: "Marketplace Publication Approved",
    body: `${match.record.title} has been published in the marketplace.`,
    read: true,
  });

  pushRoleNotification("superadmin", {
    userId: request.requestedByUserId,
    icon: "fa-store",
    color: "#22c55e",
    title: "Marketplace Request Approved",
    body: `${currentUser.name} approved publication of ${match.record.title}. Listing #${listing.id} is now active.`,
    recordId: match.record.id,
  });

  addAuditLog({
    accountName: currentUser.name,
    action: "Approved Marketplace Listing",
    record: match.record.id,
    details: `Approved marketplace publication for "${match.record.title}".`,
    module: "Market Listing",
  });

  showToast("Approved. The record is now live in the marketplace.");
  renderNotifications();
};

window.declineMarketplaceApproval = function(requestId) {
  const request = marketplaceApprovalRequests.find((item) => item.id === requestId);
  if (!request) {
    showToast("Marketplace approval request not found.");
    return;
  }
  const currentUser = getCurrentUser();
  if (
    normalizeRole(currentRole) !== "applicant" ||
    (request.applicantUserId && currentUser.id !== request.applicantUserId)
  ) {
    showToast("Only the applicant owner can decline this marketplace request.");
    return;
  }
  if (request.status !== "pending") {
    showToast("This marketplace request has already been answered.");
    return;
  }

  const match = findCertifiedRecord(request.recordId);
  const recordTitle = match?.record?.title || request.recordId;
  request.status = "declined";
  request.respondedAt = new Date().toISOString();

  updateNotificationByRequestId(request.id, {
    icon: "fa-circle-xmark",
    color: "#ef4444",
    title: "Marketplace Publication Declined",
    body: `You declined marketplace publication for ${recordTitle}.`,
    read: true,
  });

  pushRoleNotification("superadmin", {
    userId: request.requestedByUserId,
    icon: "fa-circle-xmark",
    color: "#ef4444",
    title: "Marketplace Request Declined",
    body: `${currentUser.name} declined publication of ${recordTitle}.`,
    recordId: request.recordId,
  });

  addAuditLog({
    accountName: currentUser.name,
    action: "Declined Marketplace Listing",
    record: request.recordId,
    details: `Declined marketplace publication for "${recordTitle}".`,
    module: "Market Listing",
  });

  showToast("Declined. The admin has been notified.");
  renderNotifications();
};

window.archiveMarketListing = function(id) {
  const entry = marketplaceItems.find((item) => item.id === id);
  if (!entry) return;
  if (!confirm(`Archive market listing "${entry.title}"?`)) return;
  entry.archived = true;
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Archived Listing",
    record: `Listing #${id}`,
    details: `Archived the market listing for ${entry.title}.`,
    module: "Market Listing",
  });
  showToast("Market listing archived.");
  renderDashboardContent("admin-marketplace");
};

function renderMarketplace() {
  const activeMarketplaceItems = marketplaceItems.filter((item) => !item.archived);
  return `
    <div class="page-header">

      <h1>Innovation Marketplace</h1>
      <p>Discover and connect with PSU innovations and research outputs.</p>
    </div>

    <div class="mp-type-filters">
      <button class="mp-type-btn ${currentMpType === 'All' ? 'active' : ''}" data-type="All" onclick="setMpType('All')">
        <i class="fa-solid fa-layer-group"></i> All Types
      </button>
      <button class="mp-type-btn ${currentMpType === 'Patent' ? 'active' : ''}" data-type="Patent" onclick="setMpType('Patent')">
        <i class="fa-solid fa-lightbulb"></i> Patent
      </button>
      <button class="mp-type-btn ${currentMpType === 'Utility Model' ? 'active' : ''}" data-type="Utility Model" onclick="setMpType('Utility Model')">
        <i class="fa-solid fa-gears"></i> Utility Model
      </button>
      <button class="mp-type-btn ${currentMpType === 'Industrial Design' ? 'active' : ''}" data-type="Industrial Design" onclick="setMpType('Industrial Design')">
        <i class="fa-solid fa-pen-nib"></i> Industrial Design
      </button>
      <button class="mp-type-btn ${currentMpType === 'Copyright' ? 'active' : ''}" data-type="Copyright" onclick="setMpType('Copyright')">
        <i class="fa-solid fa-copyright"></i> Copyright
      </button>
    </div>

    <div class="marketplace-layout no-sidebar">
      <div>
        <div class="search-box marketplace-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="mpSearch" placeholder="Search by title, inventor, or description..." oninput="filterMarketplace()" />
        </div>
        <div class="innovation-grid" id="innovationGrid">${renderInnovationCards(activeMarketplaceItems)}</div>
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
  const type = currentMpType;
  const college = "All";

  const search = document.getElementById("mpSearch")?.value.toLowerCase() || "";
  let filtered = marketplaceItems.filter((item) => {
    if (item.archived) return false;
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
  const grid = document.getElementById("innovationGrid");
  if (!grid) return;

  grid.innerHTML = filtered.length
    ? renderInnovationCards(filtered)
    : '<p style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:60px 0">No innovations found matching your criteria.</p>';
}

// In-memory store for expressed interests (prototype only)
let userInterests = [];

function showInnovationDetail(id) {
  const item = marketplaceItems.find((i) => i.id === id);
  if (!item) return;

  const isInterested = userInterests.includes(id);
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCard = document.querySelector("#modalOverlay .modal-card");
  if (modalOverlay) modalOverlay.classList.add("marketplace-detail-overlay");
  if (modalCard) modalCard.classList.add("xl", "marketplace-detail-modal");

  document.getElementById("modalTitle").style.display = "none"; // Custom title inside body
  document.getElementById("modalBody").innerHTML = `
    <div class="ip-detail-scroll">
      <div class="ip-detail-grid">
        <!-- Main Content -->
        <div class="ip-detail-main">
          <div class="ip-detail-header-group">
            <h1 class="ip-detail-title-large">${item.fullTitle || item.title}</h1>
            <div class="ip-detail-badges">
              ${typeBadge(item.type)}
              <span class="interest-badge"><i class="fa-solid fa-eye"></i> 124 Views</span>
              ${isInterested ? '<span class="badge badge-approved"><i class="fa-solid fa-check-double"></i> Interest Sent</span>' : ''}
            </div>
          </div>

          <section>
            <span class="ip-detail-section-label">Description</span>
            <p class="ip-detail-text">${item.longDescription || item.description}</p>
          </section>

          <section>
            <span class="ip-detail-section-label">Innovative Features and Benefits:</span>
            <ul class="ip-detail-features-list">
              ${(item.features || []).map((f) => `<li class="ip-detail-text"><i class="fa-solid fa-circle-check" style="color:var(--green); margin-right:10px;"></i> ${f}</li>`).join("")}
            </ul>
          </section>

          <section>
            <span class="ip-detail-section-label">Business Potential:</span>
            <p class="ip-detail-text">${item.businessPotential || "High potential for commercialization and industry licensing within its respective sector."}</p>
          </section>

          <footer class="detail-footer-contact">
            Interested in this technology? Connect with the inventors to discuss licensing, partnerships, or acquisition.
          </footer>
        </div>

        <!-- Sidebar / Visuals -->
        <div class="ip-detail-side">
          <div class="ip-product-visual" style="background-image: url('${item.image}')"></div>
          <p class="ip-visual-caption">
            ${item.title.split(" ").slice(0, 2).join(" ")} visual
          </p>

          <div class="inquiry-box">
            <h4>Express Commercial Interest</h4>
            <p class="inquiry-copy">Send an official notification to <strong>${item.inventor}</strong> expressing your interest in this IP.</p>
            
            <button class="interest-btn ${isInterested ? 'active' : ''}" style="width:100%; justify-content:center;" onclick="toggleInterest(${item.id})">
              <i class="fa-solid ${isInterested ? 'fa-check' : 'fa-handshake'}"></i>
              ${isInterested ? 'Interest Expressed' : 'Express Interest'}
            </button>
            
            <div class="inquiry-contact">
              <span>Contact Person:</span>
              <div>${item.contactPerson || item.inventor}</div>
              <a href="mailto:${item.contactEmail || "techtransfer@psu.edu.ph"}">${item.contactEmail || "techtransfer@psu.edu.ph"}</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  modalOverlay.classList.add("active");
}

window.toggleInterest = function(id) {
  const idx = userInterests.indexOf(id);
  if (idx === -1) {
    userInterests.push(id);
    showToast("Commercial interest notification sent to inventor!");
  } else {
    userInterests.splice(idx, 1);
    showToast("Interest notification withdrawn.");
  }
  showInnovationDetail(id);
};


function closeModal() {
  if (unlockedCertifiedRecordId || unlockedCertifiedRecordType) {
    const recordId = unlockedCertifiedRecordId || `${unlockedCertifiedRecordType} IP Records`;
    integrityFreezeUnlocked = false;
    unlockedCertifiedRecordId = null;
    unlockedCertifiedRecordType = null;
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Locked IP Record",
      record: recordId,
      details: "Certified IP record was automatically frozen again after the modal closed.",
      module: "IP Records",
    });
  }
  document.getElementById("modalOverlay").classList.remove("active", "marketplace-detail-overlay");
  const modalCard = document.querySelector("#modalOverlay .modal-card");
  if (modalCard) modalCard.classList.remove("xl", "marketplace-detail-modal");
  // Reset title display for regular modals
  document.getElementById("modalTitle").style.display = "block";
}

// ===== AUDIT LOG =====
function renderAuditTableRows(logs) {
  if (!logs.length) {
    return '<tr><td colspan="5" style="text-align:center;padding:48px;color:var(--gray-400);">No audit entries match the current filters.</td></tr>';
  }

  return logs
    .map(
      (log) => `
        <tr>
          <td>${log.timestamp}</td>
          <td>${getAuditAccountName(log)}</td>
          <td><span class="badge badge-review">${log.action}</span></td>
          <td>${getAuditRecord(log)}</td>
          <td>${getAuditDetails(log)}</td>
        </tr>`,
    )
    .join("");
}

function renderAuditLog() {
  const visibleLogs = getVisibleAuditLogs(currentRole);
  const actions = Array.from(new Set(visibleLogs.map((log) => log.action))).sort();
  const people = Array.from(
    new Set(visibleLogs.map((log) => getAuditAccountName(log))),
  ).sort();
  return `
    <div class="page-header"><h1>Audit Log</h1><p>Track account activity, case handling, listings, and announcement updates.</p></div>
    <div class="audit-filters">
      <div class="form-group"><label>From Date</label><input type="date" id="auditFrom" /></div>
      <div class="form-group"><label>To Date</label><input type="date" id="auditTo" /></div>
      <div class="form-group"><label>Action</label>
        <select id="auditAction" onchange="filterAudit()"><option value="All">All Actions</option>${actions
          .map((action) => `<option value="${action}">${action}</option>`)
          .join("")}</select></div>
      <div class="form-group"><label>People</label>
        <select id="auditPeople" onchange="filterAudit()"><option value="All">All People</option>${people
          .map((person) => `<option value="${person}">${person}</option>`)
          .join("")}</select></div>
      ${canExportAudit() ? '<button class="btn btn-primary btn-sm" style="margin-top:auto" onclick="exportCSV()"><i class="fa-solid fa-download"></i> Export CSV</button>' : ""}
    </div>
    <div class="table-container"><div class="table-responsive"><table class="data-table" id="auditTable"><thead><tr><th>Timestamp</th><th>Account Name</th><th>Action</th><th>Record</th><th>Details</th></tr></thead><tbody>
      ${renderAuditTableRows(visibleLogs)}
    </tbody></table></div></div>`;
}

function filterAudit() {
  const from = document.getElementById("auditFrom").value;
  const to = document.getElementById("auditTo").value;
  const action = document.getElementById("auditAction").value;
  const people = document.getElementById("auditPeople").value;
  const filtered = getVisibleAuditLogs(currentRole).filter((log) => {
    const logDate = String(log.timestamp || "").slice(0, 10);
    if (from && logDate < from) return false;
    if (to && logDate > to) return false;
    if (action !== "All" && log.action !== action) return false;
    if (people !== "All" && getAuditAccountName(log) !== people) return false;
    return true;
  });
  const tbody = document.querySelector("#auditTable tbody");
  if (tbody) {
    tbody.innerHTML = renderAuditTableRows(filtered);
  }
}

function exportCSV() {
  if (!canExportAudit()) {
    showToast("Only the admin can export the audit trail.");
    return;
  }
  let csv = "Timestamp,Account Name,Action,Record,Details\n";
  getVisibleAuditLogs(currentRole).forEach((log) => {
    csv += `"${log.timestamp}","${getAuditAccountName(log)}","${log.action}","${getAuditRecord(log)}","${getAuditDetails(log)}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "audit_log.csv";
  a.click();
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Exported Audit",
    record: "audit_log.csv",
    details: "Exported the current audit log to CSV.",
    module: "Audit Log",
  });
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
    Validated: 3,
    "Payment Requested": 1,
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
  const flow = isCR ? COPYRIGHT_OPERATION_FLOW : getIPOPHLOperationFlow(s);
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

function getStatusCounts() {
  const visible = getVisibleSubmissions("applicant");
  const counts = {
    All: visible.length,
    Pending: 0,
    "Under Review": 0,
    Validated: 0,
    "Payment Requested": 0,
    Approved: 0,
    Rejected: 0,
    "Awaiting Documents": 0,
    Draft: 0,
    ActionRequired: 0,
  };
  visible.forEach((s) => {
    if (counts[s.status] !== undefined) counts[s.status]++;
    if (s.status === "Awaiting Documents")
      counts.ActionRequired++;
  });
  return counts;
}

function renderUserSubmissions() {
  const counts = getStatusCounts();
  const statuses = [
    { id: "All", label: "All" },
    { id: "Draft", label: "Draft" },
    { id: "Pending", label: "Submitted" },
    { id: "Under Review", label: "Under Review" },
    { id: "ActionRequired", label: "Action Required" },
    { id: "Payment Requested", label: "For Payment" },
    { id: "Approved", label: "Approved" },
    { id: "Rejected", label: "Rejected" },
  ];

  return `
    ${renderBackNav()}
    <div class="page-header">
      <h1>My IP Applications</h1>
      <p>Manage and track your innovations through the university's filing pipeline.</p>
    </div>
    
    <div class="user-controls-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:20px; flex-wrap:wrap; background:white; padding:16px 20px; border-radius:12px; border:1px solid var(--gray-100);">
      <div style="display:flex; gap:12px; align-items:center; flex:1; flex-wrap:wrap;">
        <div class="search-box" style="max-width:300px; width:100%; position:relative;">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--gray-400);"></i>
          <input type="text" id="userSearchInput" placeholder="Search title or ID..." value="${userSearchQuery}" 
                 oninput="userSearchQuery=this.value; renderUserSubmissionsTable()"
                 style="padding-left:42px; width:100%; height:42px; border-radius:10px; border:1.5px solid var(--gray-200); outline:none;">
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <select id="userPeriodSelect" onchange="userPeriod=this.value; renderUserSubmissionsTable()" 
                  style="height:42px; border-radius:10px; border:1.5px solid var(--gray-200); padding:0 12px; font-weight:600; color:var(--navy); outline:none; background:var(--gray-50);">
            <option value="All" ${userPeriod === "All" ? "selected" : ""}>All Time</option>
            <option value="Recent" ${userPeriod === "Recent" ? "selected" : ""}>Recent (30 Days)</option>
            <option value="ThisYear" ${userPeriod === "ThisYear" ? "selected" : ""}>This Year</option>
            <option value="Custom" ${userPeriod === "Custom" ? "selected" : ""}>Custom Range...</option>
          </select>

          <div id="customDateRange" style="display:${userPeriod === "Custom" ? "flex" : "none"}; align-items:center; gap:8px; background:white; padding:0 12px; border:1.5px solid var(--gold-light); border-radius:10px; height:42px;">
            <span style="font-size:0.7rem; font-weight:700; color:var(--gray-400); text-transform:uppercase;">From:</span>
            <input type="date" id="dateFrom" style="border:none; background:none; font-size:0.8rem; font-weight:600; color:var(--navy); outline:none;" onchange="renderUserSubmissionsTable()">
            <span style="font-size:0.7rem; font-weight:700; color:var(--gray-400); text-transform:uppercase;">To:</span>
            <input type="date" id="dateTo" style="border:none; background:none; font-size:0.8rem; font-weight:600; color:var(--navy); outline:none;" onchange="renderUserSubmissionsTable()">
          </div>
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <select class="filter-select" onchange="userFilterType=this.value; renderUserSubmissionsTable()" 
                style="height:42px; border-radius:10px; border:1.5px solid var(--gray-200); padding:0 12px; font-weight:600; color:var(--navy); outline:none;">
          <option value="All" ${userFilterType === "All" ? "selected" : ""}>All IP Types</option>
          <option value="Patent" ${userFilterType === "Patent" ? "selected" : ""}>Patent</option>
          
          <option value="Copyright" ${userFilterType === "Copyright" ? "selected" : ""}>Copyright</option>
          <option value="Utility Model" ${userFilterType === "Utility Model" ? "selected" : ""}>Utility Model</option>
          <option value="Industrial Design" ${userFilterType === "Industrial Design" ? "selected" : ""}>Industrial Design</option>
        </select>
      </div>
    </div>

    <div class="status-hub-container">
      <div class="status-hub-bar">
        ${statuses
          .map(
            (st) => `
          <div class="status-tab ${userFilterStatus === st.id ? "active" : ""}" 
               onclick="filterUserStatus('${st.id}')">
            ${st.label} <span class="tab-count">${counts[st.id]}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <div id="userSubmissionsList">
      ${renderUserSubmissionsTable()}
    </div>
  `;
}

function renderUserSubmissionsTable(filterType, filterStatus, searchQuery) {
  try {
    let filtered = [...getVisibleSubmissions("applicant")];

    const ft = filterType || userFilterType;
    const fs = filterStatus || userFilterStatus;
    const sq = searchQuery !== undefined ? searchQuery : userSearchQuery;

    // Period filtering
    const customRange = document.getElementById('customDateRange');
    if (customRange) customRange.style.display = userPeriod === "Custom" ? "flex" : "none";

    let dateLimit = null;
    if (userPeriod === "Recent") {
      dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);
    } else if (userPeriod === "ThisYear") {
      dateLimit = new Date(new Date().getFullYear(), 0, 1);
    }

    if (dateLimit) {
      filtered = filtered.filter(s => new Date(s.date) >= dateLimit);
    }

    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;

    if (userPeriod === "Custom") {
      if (dateFrom) {
        filtered = filtered.filter(s => new Date(s.date) >= new Date(dateFrom));
      }
      if (dateTo) {
        filtered = filtered.filter(s => new Date(s.date) <= new Date(dateTo));
      }
    }

    if (ft && ft !== "All") filtered = filtered.filter((s) => s.type === ft);
    
    if (fs === "ActionRequired") {
      filtered = filtered.filter((s) => s.status === "Awaiting Documents");
    } else if (fs && fs !== "All") {
      filtered = filtered.filter((s) => s.status === fs);
    }

    if (sq) {
      const q = sq.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(s => new Date(s.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(s => new Date(s.date) <= new Date(dateTo));
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
        const flow = isCR ? COPYRIGHT_OPERATION_FLOW : getIPOPHLOperationFlow(s);
        const stageIdx = isCR
          ? getCopyrightStageIndex(s)
          : getIPOPHLStageIndex(s);
        const steps = getPreciseSubmissionSteps(s);
        const totalStages = flow.length;
        const currentStepObj = flow[stageIdx] || (flow.length ? flow[0] : null);

        const frozen = s.status === "Approved";
        const needsAction =
          s.status === "Awaiting Documents" || s.status === "Payment Requested";

        return `
      <div class="case-card ${needsAction ? "needs-action" : ""}" style="margin-bottom:20px; background:white; border-radius:12px; border:1px solid var(--gray-200); overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div class="case-card-header" style="padding:20px 24px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:${needsAction ? "rgba(239, 68, 68, 0.02)" : "white"}" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.chevron-icon').classList.toggle('fa-rotate-180')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div class="case-type-icon" style="width:40px; height:40px; border-radius:10px; background:var(--gray-50); display:flex; align-items:center; justify-content:center; color:var(--navy);">
              <i class="fa-solid ${isCR ? "fa-copyright" : "fa-lightbulb"}"></i>
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
                  <span style="color:var(--gray-500);">Assigned Specialist</span>
                  <span style="font-weight:600; color:var(--navy);">${getAssignedReviewerName(s)}</span>
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
                  <button class="btn btn-sm btn-outline-navy" style="width:100%; justify-content:center; margin-top:8px;" onclick="openCaseChat('${s.id}')">
                    <i class="fa-solid fa-comments"></i> Chat
                    ${getUnreadChatCountForCase(s.id) ? `<span class="chat-button-badge">${getUnreadChatCountForCase(s.id)}</span>` : ""}
                  </button>
                  ${
                    s.status === "Draft"
                      ? `
                    <button class="btn btn-sm btn-primary" style="width:100%; justify-content:center; margin-top:8px;" onclick="resumeDraft('${s.id}')">
                      <i class="fa-solid fa-play"></i> Resume Application
                    </button>
                  `
                      : ""
                  }
                  ${
                    needsAction
                      ? `
                    <button class="btn btn-sm btn-primary" style="width:100%; justify-content:center; margin-top:8px;" onclick="viewSubmission('${s.id}')">
                      <i class="fa-solid fa-upload"></i> ${s.status === "Payment Requested" ? (isCR ? "View Details" : "Upload Proof of Payment") : "Upload Requirements"}
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
  const role = getRoleMeta().label;
  const normalizedRole = normalizeRole(currentRole);
  const isAdminProfile =
    normalizedRole === "admin" || normalizedRole === "superadmin";
  
  return `
    ${renderBackNav()}
    <div class="page-header">
      <h1>Researcher Profile</h1>
      <p>Manage your academic identity and account security.</p>
    </div>

    <div class="profile-layout" style="display:grid; grid-template-columns: 1fr 2fr; gap:32px; align-items:start;">
      <div class="profile-side-col">
        <div class="profile-card" style="text-align:center; padding:40px 24px;">
          <div class="profile-avatar" style="width:120px; height:120px; border-radius:50%; background:var(--navy-dark); color:var(--gold); display:inline-flex; align-items:center; justify-content:center; font-size:3.5rem; margin-bottom:24px; border:4px solid white; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--navy); margin-bottom:8px;">${user.name}</h2>
          <p style="color:var(--gold-dark); font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:0.85rem; margin-bottom:20px;">${role}</p>
          <div style="background:var(--gray-50); border-radius:12px; padding:12px; display:flex; justify-content:center; gap:20px;">
            <div style="text-align:center;">
              <div style="font-size:1.1rem; font-weight:800; color:var(--navy);">${getVisibleSubmissions().length}</div>
              <div style="font-size:0.7rem; color:var(--gray-400); text-transform:uppercase;">Filings</div>
            </div>
            <div style="border-left:1px solid var(--gray-200);"></div>
            <div style="text-align:center;">
              <div style="font-size:1.1rem; font-weight:800; color:var(--navy);">${getVisibleSubmissions().filter(s=>s.status==='Approved').length}</div>
              <div style="font-size:0.7rem; color:var(--gray-400); text-transform:uppercase;">Certified</div>
            </div>
          </div>
        </div>

        <div class="detail-panel" style="margin-top:24px; padding:24px;">
          <h3 style="font-size:1rem; margin-bottom:16px;"><i class="fa-solid fa-shield-halved" style="color:var(--gold); margin-right:8px;"></i> Security Status</h3>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.85rem; color:var(--gray-500);">Two-Factor Auth</span>
              <span class="badge badge-approved" style="font-size:0.65rem;">ACTIVE</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.85rem; color:var(--gray-500);">Last Password Reset</span>
              <span style="font-size:0.85rem; font-weight:600; color:var(--navy);">3 months ago</span>
            </div>
            <button class="btn btn-outline-navy btn-sm" style="width:100%; margin-top:8px;">Update Security Settings</button>
          </div>
        </div>
      </div>

      <div class="profile-main-col">
        <div class="detail-panel" style="padding:32px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
            <h3 style="margin:0;"><i class="fa-solid fa-id-card" style="color:var(--gold); margin-right:10px;"></i> Institutional Identity</h3>
            <button class="btn btn-primary" onclick="showToast('Profile identity updated!')"><i class="fa-solid fa-save"></i> Save Changes</button>
          </div>
          
          <div class="form-row">
            <div class="form-group"><label>Full Name</label><input type="text" value="${user.name}" style="background:var(--gray-50);" /></div>
            <div class="form-group"><label>Email Address</label><input type="email" value="${user.email}" disabled style="background:var(--gray-100); cursor:not-allowed;" /></div>
          </div>

          <div class="form-row">
            <div class="form-group"><label>College / Department</label>
              <select>
                <option ${user.dept === 'College of Engineering' ? 'selected' : ''}>College of Engineering</option>
                <option ${user.dept === 'College of Sciences' ? 'selected' : ''}>College of Sciences</option>
                <option ${user.dept === 'College of Agriculture' ? 'selected' : ''}>College of Agriculture</option>
                <option ${user.dept === 'College of Arts' ? 'selected' : ''}>College of Arts</option>
                <option ${user.dept === 'Research Office' ? 'selected' : ''}>Research Office</option>
                <option ${user.dept === 'External Partner' ? 'selected' : ''}>External Partner</option>
              </select>
            </div>
            <div class="form-group"><label>Employee / Student ID</label><input type="text" value="PSU-2026-8842" /></div>
          </div>

          <div class="form-row">
            <div class="form-group"><label>ORCID ID <span style="font-weight:400; color:var(--gray-400); font-size:0.75rem;">(Recommended)</span></label><input type="text" value="0000-0002-1825-0097" placeholder="xxxx-xxxx-xxxx-xxxx" /></div>
            <div class="form-group"><label>Contact Number</label><input type="tel" value="0918 123 4567" /></div>
          </div>

          <div class="form-group">
            <label>Primary Research Areas</label>
            <textarea placeholder="e.g., Renewable Energy, Marine Biodiversity, Sustainable Materials..." style="min-height:100px;">Environmental Science, Sustainable Water Filtration Systems, Palawan Endemic Flora.</textarea>
          </div>
        </div>

        ${
          isAdminProfile
            ? ""
            : `<div class="detail-panel" style="margin-top:32px; padding:32px;">
          <h3 style="margin-bottom:24px;"><i class="fa-solid fa-handshake" style="color:var(--gold); margin-right:10px;"></i> My Commercial Interests</h3>
          <div class="interests-list">
            ${renderInterestsList()}
          </div>
          <button class="btn btn-text" style="margin-top:24px; padding:0; color:var(--gold-dark); font-weight:700;" onclick="navigateTo('marketplace-dash')">Browse More Innovations <i class="fa-solid fa-arrow-right" style="margin-left:4px; font-size:0.8rem;"></i></button>
        </div>`
        }

        ${
          isAdminProfile
            ? ""
            : `<div class="detail-panel" style="margin-top:32px; padding:32px;">
          <h3 style="margin-bottom:24px;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--gold); margin-right:10px;"></i> Recent Account Activity</h3>
          <div class="activity-log" style="display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; gap:16px; align-items:start;">
              <div style="width:10px; height:10px; border-radius:50%; background:var(--green); margin-top:6px; flex-shrink:0;"></div>
              <div>
                <div style="font-size:0.9rem; font-weight:700; color:var(--navy);">Successful Login (MFA Verified)</div>
                <div style="font-size:0.8rem; color:var(--gray-500); margin-top:2px;">Today at 09:12 AM &bull; IP: 192.168.1.45</div>
              </div>
            </div>
            <div style="display:flex; gap:16px; align-items:start;">
              <div style="width:10px; height:10px; border-radius:50%; background:var(--blue); margin-top:6px; flex-shrink:0;"></div>
              <div>
                <div style="font-size:0.9rem; font-weight:700; color:var(--navy);">New Submission Initiated</div>
                <div style="font-size:0.8rem; color:var(--gray-500); margin-top:2px;">Yesterday &bull; Reference: PSU-COP-2026-014</div>
              </div>
            </div>
            <div style="display:flex; gap:16px; align-items:start;">
              <div style="width:10px; height:10px; border-radius:50%; background:var(--gold); margin-top:6px; flex-shrink:0;"></div>
              <div>
                <div style="font-size:0.9rem; font-weight:700; color:var(--navy);">Profile Metadata Updated</div>
                <div style="font-size:0.8rem; color:var(--gray-500); margin-top:2px;">April 15, 2026 &bull; Research areas updated</div>
              </div>
            </div>
          </div>
          <button class="btn btn-text" style="margin-top:24px; padding:0; color:var(--gold-dark); font-weight:700;">View Full Security Log <i class="fa-solid fa-arrow-right" style="margin-left:4px; font-size:0.8rem;"></i></button>
        </div>`
        }
      </div>
    </div>`;
}

function renderAdminRecords() {
  return `<div class="page-header"><h1>IP Records</h1><p>All certified intellectual properties - metadata is read-only for integrity.</p></div>
    <div class="ip-records-security-banner">
      <i class="fa-solid fa-shield-halved"></i>
      <div class="ip-records-security-copy">
        <p><strong>Certified Records Archive</strong> - All records below have been certified and their metadata is <strong>frozen for protection</strong>. Certified records can be viewed and published to the marketplace, but cannot be edited.</p>
      </div>
      ${renderCertifiedRecordUnlockControls()}
    </div>
    ${renderAdminRecordsTable()}`;
}

function renderCertifiedRecordUnlockControls() {
  return `<div class="ip-records-unlock-controls">
    <div class="certified-record-type-entry">
      <select id="certifiedRecordUnlockType" aria-label="Select IP type to unlock">
        <option value="" ${!unlockedCertifiedRecordType ? "selected" : ""}>IP Type to unlock</option>
        <option value="Patent" ${unlockedCertifiedRecordType === "Patent" ? "selected" : ""}>Patent</option>
        <option value="Copyright" ${unlockedCertifiedRecordType === "Copyright" ? "selected" : ""}>Copyright</option>
        <option value="Industrial Design" ${unlockedCertifiedRecordType === "Industrial Design" ? "selected" : ""}>Industrial Design</option>
        <option value="Utility Model" ${unlockedCertifiedRecordType === "Utility Model" ? "selected" : ""}>Utility Model</option>
      </select>
    </div>
    <div class="certified-archive-key-entry">
      <input id="certifiedArchiveEncryptionKey" type="password" placeholder="Encryption Key" autocomplete="off" onkeydown="if(event.key === 'Enter') unlockCertifiedRecordFromArchive()" />
      <div id="certifiedArchiveKeyError" class="error-msg certified-record-key-error">Invalid Encryption Key.</div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="unlockCertifiedRecordFromArchive()"><i class="fa-solid fa-unlock-keyhole"></i> Unlock & View</button>
  </div>`;
}

function getSortedCertifiedAdminRecords() {
  const records = getCertifiedAdminRecords();
  return records.sort((a, b) => compareText(a.id, b.id));
}

function getFilteredCertifiedAdminRecords() {
  const records = getSortedCertifiedAdminRecords();
  if (!adminRecordsTypeFilter || adminRecordsTypeFilter === "All") return records;
  return records.filter((record) => record.type === adminRecordsTypeFilter);
}

function renderAdminRecordsTable() {
  const approved = getFilteredCertifiedAdminRecords();
  return `<div class="table-container" id="adminRecordsTable">
      <div class="table-header">
        <h3>Certified Records <span style="font-size:.8rem;font-weight:400;color:var(--gray-400);">(${approved.length} record${approved.length !== 1 ? "s" : ""})</span></h3>
        <select class="filter-select" aria-label="Filter IP records by type" onchange="setAdminRecordsTypeFilter(this.value)">
          <option value="All" ${adminRecordsTypeFilter === "All" ? "selected" : ""}>All IP Types</option>
          <option value="Patent" ${adminRecordsTypeFilter === "Patent" ? "selected" : ""}>Patent</option>
          <option value="Copyright" ${adminRecordsTypeFilter === "Copyright" ? "selected" : ""}>Copyright</option>
          <option value="Utility Model" ${adminRecordsTypeFilter === "Utility Model" ? "selected" : ""}>Utility Model</option>
          <option value="Industrial Design" ${adminRecordsTypeFilter === "Industrial Design" ? "selected" : ""}>Industrial Design</option>
        </select>
      </div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>Reference</th><th>Type</th><th>Title</th><th>Owner</th><th>Department</th><th>Status</th><th>Integrity</th><th>Actions</th></tr></thead><tbody>
        ${
          approved.length === 0
            ? `<tr><td colspan="8" style="text-align:center;padding:48px;color:var(--gray-400);">No certified ${escapeHtml(adminRecordsTypeFilter)} records available.</td></tr>`
            : approved
              .map(
                (s) => {
              const marketplaceListing = findMarketplaceListingByRecordId(s.id);
              const marketplaceRequest = getLatestMarketplaceApprovalRequest(s.id);

              return `<tr>
        <td>${escapeHtml(s.id)}</td>
        <td>${typeBadge(s.type)}</td>
        <td>${escapeHtml(s.title)}</td>
        <td>${escapeHtml(s.applicant)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${statusBadge(s.status)}</td>
        <td><span class="badge badge-frozen"><i class="fa-solid fa-lock"></i> Read-only</span></td>
        <td><div class="action-btns">
          ${
            !marketplaceListing
              ? marketplaceRequest?.status === "pending"
                ? `<span class="table-action-note"><i class="fa-solid fa-clock"></i> Marketplace request pending</span>`
                : marketplaceRequest?.status === "declined"
                  ? `<span class="table-action-note"><i class="fa-solid fa-ban"></i> Marketplace declined</span>`
                  : `<button class="btn btn-sm btn-primary" onclick="publishCertifiedRecordToMarketplace('${s.id}')"><i class="fa-solid fa-store"></i> Add to Marketplace</button>`
              : `<span class="table-action-note"><i class="fa-solid fa-store"></i> Listed</span>`
          }
        </div></td>
      </tr>`;
                },
              )
              .join("")
        }
    </tbody></table></div></div>`;
}

window.setAdminRecordsTypeFilter = function(typeValue) {
  adminRecordsTypeFilter = typeValue;
  const container = document.getElementById("adminRecordsTable");
  if (container) container.outerHTML = renderAdminRecordsTable();
};

function canEditCertifiedRecords() {
  return false;
}

function getCertifiedAdminRecords() {
  const approvedSubmissions = submissions
    .filter((s) => s.status === "Approved")
    .map((s) => ({ ...s, source: "submission" }));
  return [
    ...approvedSubmissions,
    ...certifiedDemoRecords.map((record) => ({
      ...record,
      source: "certified-demo",
    })),
  ];
}

function findCertifiedRecord(id) {
  const submission = submissions.find((s) => s.id === id && s.status === "Approved");
  if (submission) return { record: submission, source: "submission" };
  const demoRecord = certifiedDemoRecords.find((record) => record.id === id);
  if (demoRecord) return { record: demoRecord, source: "certified-demo" };
  return null;
}

window.viewCertifiedRecord = function(id) {
  if (unlockedCertifiedRecordId && unlockedCertifiedRecordId !== id) {
    integrityFreezeUnlocked = false;
    unlockedCertifiedRecordId = null;
  }

  const match = findCertifiedRecord(id);
  if (!match) {
    showToast("Certified record not found.");
    return;
  }
  const record = match.record;
  const recordUnlocked =
    integrityFreezeUnlocked &&
    (unlockedCertifiedRecordId === record.id ||
      unlockedCertifiedRecordType === record.type);
  const canUnlockCertifiedRecord = ["superadmin", "admin"].includes(
    normalizeRole(currentRole),
  );
  if (!recordUnlocked) {
    const typeSelect = document.getElementById("certifiedRecordUnlockType");
    const keyInput = document.getElementById("certifiedArchiveEncryptionKey");
    if (typeSelect) typeSelect.value = record.type;
    keyInput?.focus();
    showToast("Select the IP Type and enter the Encryption Key to unlock and view records.");
    return;
  }
  const marketplaceListing = findMarketplaceListingByRecordId(record.id);
  const marketplaceRequest = getLatestMarketplaceApprovalRequest(record.id);
  const marketplaceStatus = marketplaceListing
    ? `<span class="badge ${marketplaceListing.archived ? "badge-frozen" : "badge-approved"}"><i class="fa-solid fa-${marketplaceListing.archived ? "box-archive" : "store"}"></i> ${marketplaceListing.archived ? "Archived Listing" : "Listed"}</span>`
    : marketplaceRequest?.status === "pending"
      ? '<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending Applicant Approval</span>'
      : marketplaceRequest?.status === "declined"
        ? '<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i> Declined by Applicant</span>'
        : '<span class="badge badge-pending"><i class="fa-solid fa-store-slash"></i> Not Listed</span>';
  const marketplaceAction = marketplaceListing
    ? `<button class="btn btn-outline-navy" onclick="showInnovationDetail(${marketplaceListing.id})"><i class="fa-solid fa-store"></i> View Listing</button>`
    : marketplaceRequest?.status === "pending"
      ? '<button class="btn btn-secondary" disabled><i class="fa-solid fa-clock"></i> Awaiting Applicant</button>'
      : marketplaceRequest?.status === "declined"
        ? '<button class="btn btn-secondary" disabled><i class="fa-solid fa-ban"></i> Declined by Applicant</button>'
        : `<button class="btn btn-primary" onclick="publishCertifiedRecordToMarketplace('${record.id}')"><i class="fa-solid fa-store"></i> Add to Marketplace</button>`;
  document.getElementById("modalTitle").textContent = "Certified IP Record";
  document.getElementById("modalBody").innerHTML = `
    <div class="detail-panel" style="box-shadow:none; border:1px solid var(--gray-100);">
      <div class="detail-row"><span class="label">Reference</span><span class="value">${escapeHtml(record.id)}</span></div>
      <div class="detail-row"><span class="label">Type</span><span class="value">${typeBadge(record.type)}</span></div>
      <div class="detail-row"><span class="label">Title</span><span class="value">${escapeHtml(record.title)}</span></div>
      <div class="detail-row"><span class="label">Owner</span><span class="value">${escapeHtml(record.applicant)}</span></div>
      <div class="detail-row"><span class="label">Department</span><span class="value">${escapeHtml(record.department)}</span></div>
      <div class="detail-row"><span class="label">Date Filed</span><span class="value">${escapeHtml(record.date || "Not recorded")}</span></div>
      <div class="detail-row"><span class="label">Status</span><span class="value">${statusBadge(record.status)}</span></div>
      <div class="detail-row"><span class="label">Integrity</span><span class="value">${recordUnlocked ? '<span class="badge badge-review"><i class="fa-solid fa-unlock"></i> Unlocked</span>' : '<span class="badge badge-frozen"><i class="fa-solid fa-lock"></i> Frozen</span>'}</span></div>
      <div class="detail-row"><span class="label">Marketplace</span><span class="value">${marketplaceStatus}</span></div>
      <div class="detail-row"><span class="label">Description</span><span class="value">${escapeHtml(record.description || "No description recorded.")}</span></div>
    </div>
    <div class="detail-actions" style="justify-content:flex-end; margin-top:18px;">
      <button class="btn btn-outline-navy" onclick="closeModal()">Close</button>
      ${
        canUnlockCertifiedRecord
          ? `<button class="btn btn-secondary" onclick="lockCertifiedIPRecord('${record.id}')"><i class="fa-solid fa-lock"></i> Lock IP</button>`
          : ""
      }
      ${marketplaceAction}
    </div>`;
  document.getElementById("modalOverlay").classList.add("active");
};

function showUnlockedCertifiedTypeRecords(type) {
  const records = getSortedCertifiedAdminRecords().filter(
    (record) => record.type === type,
  );
  if (records.length === 0) {
    showToast(`No certified ${type} records available.`);
    return;
  }

  document.getElementById("modalTitle").textContent = `${type} Records Unlocked`;
  document.getElementById("modalBody").innerHTML = `
    <div class="detail-panel" style="box-shadow:none; border:1px solid var(--gray-100);">
      <h3><i class="fa-solid fa-unlock"></i> Select a certified ${escapeHtml(type)} record to view</h3>
      <div class="table-responsive" style="margin-top:14px;">
        <table class="data-table">
          <thead><tr><th>Reference</th><th>Title</th><th>Owner</th><th>Action</th></tr></thead>
          <tbody>
            ${records
              .map(
                (record) => `<tr>
                  <td>${escapeHtml(record.id)}</td>
                  <td>${escapeHtml(record.title)}</td>
                  <td>${escapeHtml(record.applicant)}</td>
                  <td><button class="btn btn-sm btn-outline-navy" onclick="viewCertifiedRecord('${record.id}')"><i class="fa-solid fa-eye"></i> Open Record</button></td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="detail-actions" style="justify-content:flex-end; margin-top:18px;">
      <button class="btn btn-secondary" onclick="closeModal()"><i class="fa-solid fa-lock"></i> Lock IP Type</button>
    </div>`;
  document.getElementById("modalOverlay").classList.add("active");
}

window.unlockCertifiedRecordFromArchive = function() {
  const typeSelect = document.getElementById("certifiedRecordUnlockType");
  const keyInput = document.getElementById("certifiedArchiveEncryptionKey");
  const keyError = document.getElementById("certifiedArchiveKeyError");
  const selectedType = typeSelect?.value;
  const records = getCertifiedAdminRecords().filter(
    (record) => record.type === selectedType,
  );
  if (!selectedType) {
    typeSelect?.focus();
    showToast("Select an IP type to unlock.");
    return;
  }
  if (records.length === 0) {
    showToast(`No certified ${selectedType} records available.`);
    return;
  }
  if (!verifyEncryptionKey(keyInput?.value)) {
    keyInput?.classList.add("input-error");
    keyError?.classList.add("show");
    keyInput?.focus();
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Failed IP Record Unlock",
      record: `${selectedType} IP Records`,
      details: `Admin entered an invalid encryption key while unlocking ${selectedType} records.`,
      module: "IP Records",
    });
    showToast("Invalid Encryption Key.");
    return;
  }

  keyInput?.classList.remove("input-error");
  keyError?.classList.remove("show");
  integrityFreezeUnlocked = true;
  unlockedCertifiedRecordId = null;
  unlockedCertifiedRecordType = selectedType;
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Unlocked IP Records",
    record: `${selectedType} IP Records`,
    details: `${selectedType} certified records were unlocked from the archive header for admin review.`,
    module: "IP Records",
  });
  showToast(`${selectedType} records unlocked.`);
  showUnlockedCertifiedTypeRecords(selectedType);
};

window.unlockCertifiedIPRecord = function(id) {
  const match = findCertifiedRecord(id);
  if (!match) {
    showToast("Certified record not found.");
    return;
  }

  const keyInput = document.getElementById("certifiedRecordEncryptionKey");
  const keyError = document.getElementById("certifiedRecordKeyError");
  if (!verifyEncryptionKey(keyInput?.value)) {
    keyInput?.classList.add("input-error");
    keyError?.classList.add("show");
    keyInput?.focus();
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Failed IP Record Unlock",
      record: id,
      details: "Admin entered an invalid encryption key for a certified IP record.",
      module: "IP Records",
    });
    showToast("Invalid Encryption Key.");
    return;
  }

  integrityFreezeUnlocked = true;
  unlockedCertifiedRecordId = id;
  unlockedCertifiedRecordType = null;
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Unlocked IP Record",
    record: id,
    details: "Certified IP record was temporarily unfrozen for admin review.",
    module: "IP Records",
  });
  showToast("IP record temporarily unlocked.");
  viewCertifiedRecord(id);
};

window.lockCertifiedIPRecord = function(id) {
  integrityFreezeUnlocked = false;
  unlockedCertifiedRecordId = null;
  unlockedCertifiedRecordType = null;
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Locked IP Record",
    record: id,
    details: "Certified IP record was manually frozen again.",
    module: "IP Records",
  });
  showToast("IP record frozen and locked.");
  closeModal();
};

window.editCertifiedRecord = function(id) {
  const match = findCertifiedRecord(id);
  if (!match) {
    showToast("Certified record not found.");
    return;
  }
  showToast("Certified IP records are read-only and cannot be edited.");
};

window.saveCertifiedRecordEdit = function(event, id) {
  if (event) event.preventDefault();
  showToast("Certified IP records are read-only and cannot be edited.");
};

function renderInterestsList() {
  if (userInterests.length === 0) {
    return `
      <div style="text-align:center; padding:24px; background:var(--gray-50); border-radius:12px; border:1.5px dashed var(--gray-200);">
        <p style="font-size:0.85rem; color:var(--gray-400); margin:0;">You haven't expressed interest in any innovations yet.</p>
      </div>`;
  }

  return userInterests.map(id => {
    const item = marketplaceItems.find(i => i.id === id);
    if (!item || item.archived) return '';
    return `
      <div style="display:flex; align-items:center; gap:16px; padding:16px; background:white; border-radius:12px; border:1px solid var(--gray-100); margin-bottom:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02); cursor:pointer;" onclick="showInnovationDetail(${item.id})">
        <div style="width:48px; height:48px; border-radius:10px; background:var(--gray-50); display:flex; align-items:center; justify-content:center; color:var(--navy); font-size:1.2rem; flex-shrink:0;">
          <i class="fa-solid ${item.type === 'Patent' ? 'fa-lightbulb' : 'fa-copyright'}"></i>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.9rem; font-weight:700; color:var(--navy); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</div>
          <div style="font-size:0.75rem; color:var(--gray-500);">${item.type} &bull; ${item.inventor}</div>
        </div>
        <div class="interest-badge" style="font-size:0.65rem;">INTEREST SENT</div>
      </div>
    `;
  }).join('');
}


function legacyRenderAdminUsers() {
  const roleBadge = (r, u) => {
    const m = {
      superadmin: "badge-rejected",
      admin: "badge-review",
      specialist: "badge-pending",
      applicant: "badge-approved",
      "Super Admin": "badge-rejected",
      Admin: "badge-review",
      Reviewer: "badge-pending",
      Applicant: "badge-approved",
    };
    let label = r;
    if (r === "superadmin") label = "Super Admin";
    if (r === "admin") label = "Admin";
    if (r === "specialist") label = "Specialist";
    if (r === "applicant") label = "Applicant";

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
        <option value="specialist" selected>Specialist</option>
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
  return `<div class="page-header"><h1>System Settings</h1><p>Configure global application settings.</p></div>
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
      <th style="text-align:center;color:var(--gold)">EVALUATOR</th>
      <th style="text-align:center;color:var(--gold-dark)">APPLICANT</th>
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
        <div class="form-group"><label>First Name *</label><input type="text" id="newUserFirstName" placeholder="Enter first name" /></div>
        <div class="form-group"><label>Middle Name <span style="font-weight:500; color:var(--gray-400);">(optional)</span></label><input type="text" id="newUserMiddleName" placeholder="Enter middle name" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Last Name *</label><input type="text" id="newUserLastName" placeholder="Enter last name" /></div>
        <div class="form-group"><label>Suffix <span style="font-weight:500; color:var(--gray-400);">(optional)</span></label><input type="text" id="newUserSuffix" placeholder="Jr., Sr., III" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email *</label><input type="email" id="newUserEmail" placeholder="user@psu.edu.ph" /></div>
      </div>
      <div class="form-row">
        <div class="form-group" id="dept-group"><label>Department *</label>
          <select id="newUserDept"><option value="">Select Department</option><option>IT Office</option><option>IP Office</option><option>Research Office</option><option>College of Engineering</option><option>College of Sciences</option><option>College of Agriculture</option><option>College of Arts</option></select></div>
        <div class="form-group" id="role-group"><label>Assign Role *</label>
          <select id="newUserRole" onchange="toggleDeptField(this.value)"><option value="">Select Role</option><option value="reviewer">Specialist</option></select></div>
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
  const firstName = document.getElementById("newUserFirstName").value.trim();
  const middleName = document.getElementById("newUserMiddleName").value.trim();
  const lastName = document.getElementById("newUserLastName").value.trim();
  const suffix = document.getElementById("newUserSuffix").value.trim();
  const name = buildDisplayName(firstName, middleName, lastName, suffix);
  const email = document.getElementById("newUserEmail").value;
  const dept = document.getElementById("newUserDept").value;
  const role = document.getElementById("newUserRole").value;
  const pass = document.getElementById("newUserPass").value;
  const passC = document.getElementById("newUserPassConfirm").value;

  if (!firstName || !lastName || !email || !role || !pass) {
    showToast("Please fill in all required fields");
    return;
  }
  if (!dept) {
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

  const finalDept = normalizeRole(role) === "reviewer" ? "Specialist Pool" : dept;
  const newUser = {
    id: systemUsers.length + 1,
    name,
    firstName,
    middleName,
    lastName,
    suffix,
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
    applicant: "badge-approved",
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

  const caseTypes = ["Patent",  "Copyright", "Utility Model", "Industrial Design"];
  const currentAllowed = user.allowedCaseTypes || [];
  const checkboxes = caseTypes.map(type => `
    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
      <input type="checkbox" name="editSpecialistCaseType" value="${type}" ${currentAllowed.includes(type) ? "checked" : ""} /> ${type}
    </label>
  `).join("");

  document.getElementById("modalTitle").textContent = "Edit User Role";
  document.getElementById("modalBody").innerHTML = `
    <div class="form-group"><label>Account</label><input type="text" value="${user.name}" disabled style="background:var(--gray-50)" /></div>
    <div class="form-group"><label>Assign Role</label>
      <select id="newRoleSelect" onchange="toggleEditSpecialistTypeVisibility(this.value)">${options}</select>
    </div>
    
    <div id="editSpecialistTypeGroup" style="display:${normalizeRole(user.role) === "reviewer" ? "block" : "none"}; margin-bottom:20px; padding:16px; background:var(--gray-50); border-radius:12px; border:1px solid var(--gray-200);">
      <label style="display:block; margin-bottom:12px; font-weight:700; color:var(--navy); font-size:0.85rem;">
        <i class="fa-solid fa-list-check" style="margin-right:6px; color:var(--gold);"></i> Assign Case Types
      </label>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        ${checkboxes}
      </div>
    </div>

    <button class="btn btn-primary btn-block" onclick="applyRoleChange(${user.id})"><i class="fa-solid fa-save"></i> Save Changes</button>`;
  document.getElementById("modalOverlay").classList.add("active");
}

window.toggleEditSpecialistTypeVisibility = function(role) {
  const group = document.getElementById("editSpecialistTypeGroup");
  if (group) {
    group.style.display = normalizeRole(role) === "reviewer" ? "block" : "none";
  }
};

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

  const previousRole = formatRoleLabel(user.role);
  user.role = newRole;
  
  if (newRole === "reviewer") {
    user.dept = "Specialist Pool";
    const checkboxes = document.querySelectorAll('input[name="editSpecialistCaseType"]:checked');
    user.allowedCaseTypes = Array.from(checkboxes).map(cb => cb.value);
    if (user.allowedCaseTypes.length === 0) {
      showToast("Please assign at least one case type for the Specialist.");
      return;
    }
  } else {
    delete user.allowedCaseTypes;
  }

  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Updated Account Role",
    record: user.email,
    details: `Changed role from ${previousRole} to ${formatRoleLabel(newRole)}${user.allowedCaseTypes ? ` with types: ${user.allowedCaseTypes.join(", ")}` : ""}.`,
    module: "Accounts",
  });
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
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Updated Account Status",
    record: user.email,
    details: `Marked ${user.name} as ${user.status}.`,
    module: "Accounts",
  });
  showToast(`${user.name} status changed to ${user.status}.`);
  navigateTo("admin-users");
}

function toggleDeptField(role) {
  return normalizeRole(role);
}

function renderCreateAccount() {
  const roleOptions = getCreatableRoleOptions()
    .map((role) => `<option value="${role}">${formatRoleLabel(role)}</option>`)
    .join("");
  
  const caseTypes = [
    "Patent",  "Copyright", "Utility Model", "Industrial Design"
  ];
  const caseCheckboxes = caseTypes.map(type => `
    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
      <input type="checkbox" name="specialistCaseType" value="${type}" /> ${type}
    </label>
  `).join("");

  return `<div class="page-header"><h1><i class="fa-solid fa-user-plus"></i> Create New Account</h1><p>Create only the accounts allowed by the current RBAC role.</p></div>
    <div class="detail-panel" style="max-width:640px">
      <h3><i class="fa-solid fa-id-card"></i> New User Details</h3>
      <div class="form-row">
        <div class="form-group"><label>First Name *</label><input type="text" id="newUserFirstName" placeholder="Enter first name" /></div>
        <div class="form-group"><label>Middle Name <span style="font-weight:500; color:var(--gray-400);">(optional)</span></label><input type="text" id="newUserMiddleName" placeholder="Enter middle name" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Last Name *</label><input type="text" id="newUserLastName" placeholder="Enter last name" /></div>
        <div class="form-group"><label>Suffix <span style="font-weight:500; color:var(--gray-400);">(optional)</span></label><input type="text" id="newUserSuffix" placeholder="Jr., Sr., III" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email *</label><input type="email" id="newUserEmail" placeholder="user@psu.edu.ph" /></div>
      </div>
      <div class="form-group">
        <label>Assigned Role *</label>
        <select id="newUserRole" onchange="toggleSpecialistTypeVisibility(this.value)">
          <option value="">Select Role</option>
          ${roleOptions}
        </select>
      </div>

      <div id="specialistTypeGroup" style="display:none; margin-bottom:20px; padding:16px; background:var(--gray-50); border-radius:12px; border:1px solid var(--gray-200);">
        <label style="display:block; margin-bottom:12px; font-weight:700; color:var(--navy); font-size:0.85rem;">
          <i class="fa-solid fa-list-check" style="margin-right:6px; color:var(--gold);"></i> Assign Case Types
        </label>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:12px;">
          ${caseCheckboxes}
        </div>
        <p style="margin-top:12px; font-size:0.75rem; color:var(--gray-500);">Specialists will only see unassigned cases matching these selected types.</p>
      </div>

      <div class="form-row">
        <div class="form-group"><label>Password *</label><input type="password" id="newUserPass" placeholder="Min 8 characters" /></div>
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

window.toggleSpecialistTypeVisibility = function(role) {
  const group = document.getElementById("specialistTypeGroup");
  if (group) {
    group.style.display = normalizeRole(role) === "reviewer" ? "block" : "none";
  }
};

function buildDisplayName(firstName, middleName, lastName, suffix) {
  const baseName = [firstName, middleName, lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const trimmedSuffix = suffix.trim();
  return trimmedSuffix ? `${baseName} ${trimmedSuffix}` : baseName;
}

function createNewAccount() {
  const firstName = document.getElementById("newUserFirstName").value.trim();
  const middleName = document.getElementById("newUserMiddleName").value.trim();
  const lastName = document.getElementById("newUserLastName").value.trim();
  const suffix = document.getElementById("newUserSuffix").value.trim();
  const name = buildDisplayName(firstName, middleName, lastName, suffix);
  const email = document.getElementById("newUserEmail").value.trim();
  const rawRole = document.getElementById("newUserRole").value;
  const role = rawRole ? normalizeRole(rawRole) : "";
  const pass = document.getElementById("newUserPass").value;
  const passC = document.getElementById("newUserPassConfirm").value;

  if (!firstName || !lastName || !email || !role || !pass) {
    showToast("Please fill in all required fields");
    return;
  }
  if (!getCreatableRoleOptions().includes(role)) {
    showToast("This role cannot be created from the current account.");
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

  let allowedCaseTypes = undefined;
  if (role === "reviewer") {
    const checkboxes = document.querySelectorAll('input[name="specialistCaseType"]:checked');
    allowedCaseTypes = Array.from(checkboxes).map(cb => cb.value);
    if (allowedCaseTypes.length === 0) {
      showToast("Please assign at least one case type for the Specialist.");
      return;
    }
  }

  const newUser = {
    id: Math.max(...systemUsers.map((user) => user.id)) + 1,
    name,
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    role,
    dept: role === "reviewer" ? "Specialist Pool" : "Unassigned",
    status: "Active",
    dateCreated: new Date().toISOString().split("T")[0],
    allowedCaseTypes
  };
  systemUsers.push(newUser);
  addAuditLog({
    accountName: getCurrentUser().name,
    action: "Created Account",
    record: email,
    details: `Created a ${formatRoleLabel(role)} account for ${name}${allowedCaseTypes ? ` with access to: ${allowedCaseTypes.join(", ")}` : ""}.`,
    module: "Accounts",
  });
  showToast(`Account created successfully for ${name}.`);
  navigateTo("admin-users");
}

window.toggleContactQuickLinks = function() {
  const panel = document.getElementById("contactQuickLinksPanel");
  const bubble = document.getElementById("contactQuickLinksBubble");
  if (!panel || !bubble) return;
  const isOpen = panel.classList.toggle("open");
  bubble.classList.toggle("active", isOpen);
};

function renderContactUs() {
  const campusCoordinates = `9°46′40″N 118°44′00″E`;
  const mapLink =
    "https://www.google.com/maps/search/?api=1&query=9%C2%B046%E2%80%B240%E2%80%B3N%20118%C2%B044%E2%80%B200%E2%80%B3E";
  const facebookLink = "https://www.facebook.com/PalawanStateUniversity/";
  return `
    <div class="page-header" style="text-align:center;">
      <h1 style="color:var(--navy); font-weight:800;">Contact Us</h1>
      <p style="color:var(--gray-500); max-width:600px; margin:0 auto;">Have questions about IP protection or need assistance with your application? Our team is ready to guide you.</p>
    </div>
    
    <div class="contact-shell" style="position:relative;">
    <div class="contact-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:40px; margin-top:50px;">
      <div class="contact-info-card" style="background:white; padding:40px; border-radius:24px; border:1px solid var(--gray-200); box-shadow:0 15px 40px -15px rgba(0,0,0,0.08);">
        <h3 style="color:var(--navy); margin-bottom:32px; font-weight:800; font-size:1.5rem;">Information Hub</h3>
        <div style="display:flex; flex-direction:column; gap:24px;">
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="width:56px; height:56px; border-radius:14px; background:rgba(99,102,241,0.1); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h5 style="margin:0 0 4px 0; color:var(--navy); font-weight:700; font-size:1rem;">Campus Address</h5>
              <p style="margin:0; color:var(--gray-500); font-size:0.9rem; line-height:1.5;">Palawan State University - IPO<br>Santa Monica, Puerto Princesa City<br><strong style="color:var(--navy);">${campusCoordinates}</strong></p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="width:56px; height:56px; border-radius:14px; background:rgba(245,158,11,0.1); color:var(--gold-dark); display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <div>
              <h5 style="margin:0 0 4px 0; color:var(--navy); font-weight:700; font-size:1rem;">Email Channel</h5>
              <p style="margin:0; color:var(--gray-500); font-size:0.9rem;">ipo@psu.palawan.edu.ph</p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="width:56px; height:56px; border-radius:14px; background:rgba(34,197,94,0.1); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
              <i class="fa-solid fa-phone"></i>
            </div>
            <div>
              <h5 style="margin:0 0 4px 0; color:var(--navy); font-weight:700; font-size:1rem;">Institutional Support</h5>
              <p style="margin:0; color:var(--gray-500); font-size:0.9rem;">+63 (048) 433 2162</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contact-form-card" style="background:white; padding:40px; border-radius:24px; border:1px solid var(--gray-200); box-shadow:0 15px 40px -15px rgba(0,0,0,0.08);">
        <h3 style="color:var(--navy); margin-bottom:32px; font-weight:800; font-size:1.5rem;">Direct Message</h3>
        <form onsubmit="event.preventDefault(); showToast('Your inquiry has been logged. We will contact you via email shortly.')">
          <div class="form-group">
            <label style="font-weight:700; font-size:0.85rem; color:var(--navy-dark);">Sender Profile</label>
            <input type="text" placeholder="Your full name" required style="border-radius:12px; border:1px solid var(--gray-200); padding:12px 16px;">
          </div>
          <div class="form-group">
            <label style="font-weight:700; font-size:0.85rem; color:var(--navy-dark);">Connectivity Lead</label>
            <input type="email" placeholder="your@email.com" required style="border-radius:12px; border:1px solid var(--gray-200); padding:12px 16px;">
          </div>
          <div class="form-group">
            <label style="font-weight:700; font-size:0.85rem; color:var(--navy-dark);">Inquiry Details</label>
            <textarea placeholder="Describe your technical or legal concern..." style="border-radius:12px; border:1px solid var(--gray-200); padding:12px 16px; min-height:140px; resize:vertical;" required></textarea>
          </div>
          <button class="btn btn-primary" style="width:100%; justify-content:center; padding:16px; border-radius:12px; font-weight:700; font-size:1rem; margin-top:8px;">
            <i class="fa-solid fa-paper-plane" style="margin-right:8px;"></i> Broadcast Inquiry
          </button>
        </form>
      </div>
    </div>
      <div class="contact-chat-widget">
        <div class="contact-chat-panel" id="contactQuickLinksPanel">
          <div class="contact-chat-title"><i class="fa-solid fa-circle-info"></i> Quick Contact Links</div>
          <p>Open the PSU campus location or visit the Facebook page.</p>
          <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="contact-chat-link">
            <i class="fa-solid fa-location-dot"></i>
            <span>${campusCoordinates}</span>
          </a>
          <a href="${facebookLink}" target="_blank" rel="noopener noreferrer" class="contact-chat-link">
            <i class="fa-brands fa-facebook"></i>
            <span>Palawan State University Facebook</span>
          </a>
        </div>
        <button class="contact-chat-bubble" id="contactQuickLinksBubble" type="button" onclick="toggleContactQuickLinks()" aria-label="Open location and Facebook links">
          <i class="fa-solid fa-comments"></i>
        </button>
      </div>
    </div>
  `;
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
      return '<span style="color:var(--red);font-size:1.1rem">✗</span>';
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
      <th style="text-align:center;color:var(--gold)">EVALUATOR</th>
      <th style="text-align:center;color:var(--gold-dark)">APPLICANT</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderAdminSettings() {
  const primaryKey = getDisplaySecurityKey("primary");
  const backupKey = getDisplaySecurityKey("backup");
  return `<div class="page-header"><h1>System Settings</h1><p>Administrative configuration and security controls.</p></div>
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
        <div class="detail-row"><span class="label">Primary Key</span><span class="value" style="display:flex; align-items:center; gap:10px;">${primaryKey}<button class="btn btn-sm btn-outline-navy" type="button" onclick="toggleSecurityKeyVisibility('primary')"><i class="fa-solid fa-${securityKeyVisibility.primary ? "eye-slash" : "eye"}"></i></button></span></div>
        <div class="detail-row"><span class="label">Backup Key</span><span class="value" style="display:flex; align-items:center; gap:10px;">${backupKey}<button class="btn btn-sm btn-outline-navy" type="button" onclick="toggleSecurityKeyVisibility('backup')"><i class="fa-solid fa-${securityKeyVisibility.backup ? "eye-slash" : "eye"}"></i></button></span></div>
        <div class="detail-row"><span class="label">Rotation Policy</span><span class="value">Quarterly</span></div>
        <div class="detail-actions">
          <button class="btn btn-primary btn-sm" onclick="showToast('Key rotation scheduled')"><i class="fa-solid fa-arrows-rotate"></i> Rotate Keys</button>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Key escrow report generated')"><i class="fa-solid fa-file-shield"></i> Escrow Report</button>
        </div>
      </div>
    </div>`;
}

window.toggleSecurityKeyVisibility = function(type) {
  securityKeyVisibility[type] = !securityKeyVisibility[type];
  renderDashboardContent("admin-settings");
};

window.unlockIntegrityFreeze = function() {
  integrityFreezeUnlocked = false;
  showToast("Certified IP records are read-only and cannot be edited.");
  renderDashboardContent(currentPage === "submission-detail" ? "submission-detail" : "admin-records");
};

window.filterAnnouncementCategory = function(category) {
  announcementCategoryFilter = category;
  renderDashboardContent("admin-announcements");
};

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



function isCopyrightFeeWaivedRoute() {
  return (
    currentFormType === "copyright" &&
    wizardData.officialDuty === "Yes" &&
    wizardData.letterRequest === "Approved"
  );
}


function renderForms() {
  const categories = [
    {
      title: "Patent",
      id: "patent",
      icon: "fa-lightbulb",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      forms: ["Request Form"],
      onlineAction: "launchPatentOnlineForm()",
    },
    {
      title: "Utility Model",
      id: "utility",
      icon: "fa-gears",
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1, #4338ca)",
      forms: ["Registration Form"],
      onlineAction: "launchUtilityOnlineForm()",
    },
    {
      title: "Industrial Design",
      id: "design",
      icon: "fa-pen-nib",
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899, #be185d)",
      forms: ["Registration Form"],
      onlineAction: "launchIndustrialOnlineForm()",
    },

    {
      title: "Copyright",
      id: "copyright",
      icon: "fa-copyright",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      forms: [
        "Registration Form", "Supplemental Form", "Other Services"
      ],
      onlineAction: "launchCopyrightOnlineForm()",
    }
  ];

  return `
    <div class="page-header" style="margin-bottom:24px; text-align:center;">

      <span class="m-eyebrow" style="display:inline-block; margin-bottom:12px;">Official Documentation</span>
      <h1 style="color:var(--navy); font-weight:900; font-size:2.8rem; margin:0; letter-spacing:-0.5px;">Institutional Forms</h1>
      <p style="color:var(--gray-500); font-size:1.1rem; margin-top:12px; max-width:600px; margin-left:auto; margin-right:auto;">Access the complete repository of pre-filing documents and official registration forms for all IP categories.</p>
    </div>

    <div style="display: flex; gap: 16px; scroll-behavior: smooth; justify-content: center; align-items: flex-start; flex-wrap: wrap; max-width: 1200px; margin: 0 auto;">
      ${categories.map(cat => `
        <div style="flex: 1; min-width: 200px; max-width: 230px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid var(--gray-200); padding: 24px 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); transition: transform 0.3s ease; display: flex; flex-direction: column;"
             onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='${cat.color}66'"
             onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--gray-200)'">
          
          <div style="width: 42px; height: 42px; border-radius: 12px; background: ${cat.gradient}; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 16px; align-self: center; box-shadow: 0 4px 12px ${cat.color}33;">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          
          <h2 style="color:var(--navy); font-size: 0.95rem; font-weight: 800; text-align: center; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${cat.title}</h2>
          
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            ${cat.forms.map(form => `
              <div style="background: var(--gray-50); color: var(--gray-700); padding: 10px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-align: center; line-height: 1.3; cursor: pointer; border: 1px solid transparent; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; min-height: 44px;"
                   onmouseover="this.style.background='white'; this.style.borderColor='${cat.color}44'; this.style.color='var(--navy)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.04)'"
                   onmouseout="this.style.background='var(--gray-50)'; this.style.borderColor='transparent'; this.style.color='var(--gray-700)'; this.style.boxShadow='none'"
                   onclick="showToast('Downloading: ${form}')">
                ${form}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top:20px; padding: 40px; background: white; border-top: 1px solid var(--gray-100); border-radius: 24px; text-align: center; box-shadow: 0 -10px 40px rgba(0,0,0,0.02);">
      <p style="color:var(--gray-400); font-size: 0.8rem; font-weight: 500;">&copy; 2026 PSU Intellectual Property Office — Authorized Document Repository</p>
    </div>
  `;
}


// ===== NOTIFICATIONS =====
window.toggleNotifications = function () {
  notifOpen = !notifOpen;
  const dropdown = document.getElementById("notifDropdown");
  const bell = document.getElementById("notifBell");
  if (dropdown) dropdown.classList.toggle("open", notifOpen);
  if (bell) bell.classList.toggle("active", notifOpen);

  if (notifOpen) {
    renderNotifications();
    // Mark as read for current role after 2 seconds
    setTimeout(() => {
      const roleNotifs = getCurrentRoleNotifications();
      roleNotifs.forEach((n) => (n.read = true));
      renderNotifications();
    }, 2000);
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

let profileDropdownOpen = false;
window.toggleProfileDropdown = function () {
  profileDropdownOpen = !profileDropdownOpen;
  const dropdown = document.getElementById("profileDropdown");
  const trigger = document.getElementById("profileDropdownWrap");
  
  if (dropdown) dropdown.classList.toggle("open", profileDropdownOpen);
  if (trigger) trigger.classList.toggle("active", profileDropdownOpen);

  updateBodyRoleClass();
  updateProfileDropdownRoleVisibility();

  // Populate dynamic name if available
  const nameEl = document.getElementById("dropdownFullUserName");
  const topName = document.getElementById("topbarUserName");
  if (nameEl && topName) {
    nameEl.textContent = topName.textContent;
  }

  if (profileDropdownOpen) {
    setTimeout(() => {
      document.addEventListener("click", function closeProfile(e) {
        const wrap = document.getElementById("profileDropdownWrap");
        if (wrap && !wrap.contains(e.target)) {
          profileDropdownOpen = false;
          document.getElementById("profileDropdown")?.classList.remove("open");
          wrap.classList.remove("active");
          document.removeEventListener("click", closeProfile);
        }
      });
    }, 10);
  }
};

// ===== ANNOUNCEMENTS =====
function renderAdminAnnouncementsPage() {
  const categories = Array.from(
    new Set(announcements.map((item) => item.category)),
  ).sort();
  const visibleAnnouncements =
    announcementCategoryFilter === "All"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.category === announcementCategoryFilter,
        );
  return `
    <div class="page-header" style="margin-bottom:32px;">
      <h1>Manage Announcements</h1>
      <p>Create and edit news, events, and alerts for the landing page.</p>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h3>All Announcements</h3>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <select class="filter-select" onchange="filterAnnouncementCategory(this.value)">
            <option value="All">All Categories</option>
            ${categories
              .map(
                (category) =>
                  `<option value="${category}" ${announcementCategoryFilter === category ? "selected" : ""}>${category}</option>`,
              )
              .join("")}
          </select>
          <button class="btn btn-primary" onclick="showAnnouncementModal()"><i class="fa-solid fa-plus"></i> Add New Announcement</button>
        </div>
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
            ${visibleAnnouncements.length ? visibleAnnouncements.map(a => `
              <tr>
                <td>${a.date}</td>
                <td><span class="badge ${a.category === "Alert" ? "badge-rejected" : a.category === "Event" ? "badge-review" : "badge-approved"}">${a.category}</span></td>
                <td><strong>${a.title}</strong></td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-outline-navy" onclick="showAnnouncementModal(${a.id})"><i class="fa-solid fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement(${a.id})"><i class="fa-solid fa-trash"></i> Delete</button>
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
  const a = isEdit ? announcements.find(item => item.id === id) : { title: '', content: '', category: 'News', date: new Date().toISOString().split('T')[0], image: '' };
  const isAdmin = normalizeRole(currentRole) === 'admin' || normalizeRole(currentRole) === 'superadmin';

  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const modalOverlay = document.getElementById('modalOverlay');

  if (!isAdmin && isEdit) {
    // Applicant viewing an announcement
    modalTitle.innerText = 'Announcement Notice';
    modalBody.innerHTML = `
      <div style="padding: 10px;">
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <span class="ann-badge ${a.category.toLowerCase()}">${a.category}</span>
          <span style="font-size: 0.85rem; color: var(--gray-400); font-weight: 600;">Published on ${a.date}</span>
        </div>
        <h2 style="font-size: 1.5rem; color: var(--navy); margin-bottom: 16px; font-weight: 800; line-height: 1.3;">${a.title}</h2>
        <div style="background: var(--gray-50); padding: 24px; border-radius: 16px; color: var(--gray-700); line-height: 1.8; font-size: 1rem; border: 1px solid var(--gray-100);">
          ${a.content.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top: 30px; text-align: right;">
          <button class="btn btn-navy" onclick="closeModal()">Close Notice</button>
        </div>
      </div>
    `;
    modalOverlay.classList.add('active');
    return;
  }

  modalTitle.innerText = isEdit ? 'Edit Announcement' : 'Add New Announcement';
  modalBody.innerHTML = `
    <form id="announcementForm" onsubmit="saveAnnouncement(event, ${id === null ? 'null' : id})">
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--navy);">Title</label>
        <input type="text" id="annTitle" value="${a.title}" required style="width: 100%; padding: 10px; border: 1.5px solid var(--gray-200); border-radius: 8px;" />
      </div>
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--navy);">Category</label>
        <select id="annCategory" style="width: 100%; padding: 10px; border: 1.5px solid var(--gray-200); border-radius: 8px;">
          <option ${a.category === 'News' ? 'selected' : ''}>News</option>
          <option ${a.category === 'Event' ? 'selected' : ''}>Event</option>
          <option ${a.category === 'Alert' ? 'selected' : ''}>Alert</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--navy);">Date</label>
        <input type="date" id="annDate" value="${a.date}" required style="width: 100%; padding: 10px; border: 1.5px solid var(--gray-200); border-radius: 8px;" />
      </div>
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--navy);">Announcement Image</label>
        <div class="file-upload-zone" onclick="document.getElementById('annImageInput').click()" style="padding: 20px; border: 2px dashed var(--gray-200); border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.3s ease;">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--gold); margin-bottom: 12px;"></i>
          <p id="annImageStatus" style="margin: 0; font-size: 0.9rem; color: var(--gray-500);">${a.image ? 'Image selected: ' + a.image.split('/').pop() : 'Click to upload or drag and drop image'}</p>
          <input type="file" id="annImageInput" hidden accept="image/*" onchange="handleAnnImageUpload(this)" />
          <input type="hidden" id="annImageUrl" value="${a.image || ''}" />
        </div>
        ${a.image ? `<img id="annImagePreview" src="${a.image}" style="margin-top: 10px; max-width: 100%; border-radius: 8px; height: 120px; object-fit: cover;" />` : `<img id="annImagePreview" style="margin-top: 10px; max-width: 100%; border-radius: 8px; height: 120px; object-fit: cover; display: none;" />`}
      </div>
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--navy);">Content</label>
        <textarea id="annContent" rows="4" required style="width: 100%; padding: 10px; border: 1.5px solid var(--gray-200); border-radius: 8px; font-family: inherit;">${a.content}</textarea>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
        <button type="button" class="btn btn-outline-navy" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Announcement'}</button>
      </div>
    </form>
  `;
  modalOverlay.classList.add('active');
};

window.handleAnnImageUpload = function(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('annImageUrl').value = e.target.result;
      document.getElementById('annImageStatus').innerText = 'Image uploaded: ' + input.files[0].name;
      const preview = document.getElementById('annImagePreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    reader.readAsDataURL(input.files[0]);
  }
};

window.saveAnnouncement = function(e, id) {
  e.preventDefault();
  const title = document.getElementById('annTitle').value;
  const category = document.getElementById('annCategory').value;
  const date = document.getElementById('annDate').value;
  const content = document.getElementById('annContent').value;
  const image = document.getElementById('annImageUrl').value || 'images/psu_logo_main.png';
  let savedAnnouncement = null;
  let shouldNotifyAlert = false;

  if (id !== null && id !== undefined && id !== 'null') {
    const idx = announcements.findIndex(a => a.id == id);
    if (idx !== -1) {
      const previous = announcements[idx];
      announcements[idx] = { ...announcements[idx], title, category, date, content, image };
      savedAnnouncement = announcements[idx];
      shouldNotifyAlert =
        category === "Alert" &&
        (previous.category !== category ||
          previous.title !== title ||
          previous.content !== content ||
          previous.date !== date);
      addAuditLog({
        accountName: getCurrentUser().name,
        action: "Updated Announcement",
        record: announcements[idx].title,
        details: `Updated the ${category.toLowerCase()} announcement scheduled for ${date}.`,
        module: "Announcements",
      });
      showToast('Announcement updated successfully');
    }
  } else {
    const newId = announcements.length ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
    savedAnnouncement = { id: newId, title, category, date, content, image };
    announcements.push(savedAnnouncement);
    shouldNotifyAlert = category === "Alert";
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Added Announcement",
      record: title,
      details: `Added a new ${category.toLowerCase()} announcement.`,
      module: "Announcements",
    });
    showToast('Announcement created successfully');
  }

  if (category === "Alert") {
    dismissedTopAlertId = null;
  }
  if (shouldNotifyAlert && savedAnnouncement) {
    pushRoleNotification("applicant", {
      icon: "fa-triangle-exclamation",
      color: "#ef4444",
      title: `Alert: ${savedAnnouncement.title}`,
      body: savedAnnouncement.content,
      type: "announcement-alert",
      announcementId: savedAnnouncement.id,
    });
  }

  closeModal();
  renderLandingAnnouncements();
  refreshSystemAlertForCurrentPage();
  renderDashboardContent('admin-announcements');
};

window.deleteAnnouncement = function(id) {
  if (confirm('Are you sure you want to delete this announcement?')) {
    const idx = announcements.findIndex(a => a.id === id);
    const deleted = announcements[idx];
    announcements.splice(idx, 1);
    if (deleted) {
      addAuditLog({
        accountName: getCurrentUser().name,
        action: "Deleted Announcement",
        record: deleted.title,
        details: `Deleted the ${deleted.category.toLowerCase()} announcement dated ${deleted.date}.`,
        module: "Announcements",
      });
    }
    showToast('Announcement deleted');
    renderLandingAnnouncements();
    if (deleted?.category === "Alert") dismissedTopAlertId = null;
    refreshSystemAlertForCurrentPage();
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
        <a href="#" class="ann-link" onclick="event.preventDefault(); ${a.title.toLowerCase().includes('guidelines') ? 'navigateTo(\'guidelines\')' : 'showAnnouncementModal(' + a.id + ')' }">${(normalizeRole(currentRole) === 'admin' || normalizeRole(currentRole) === 'superadmin') ? 'Edit Notice' : 'View Details'} <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </div>
  `).join('');
}

window.assignEvaluator = function(submissionId, evaluatorId) {
  const submission = submissions.find(s => String(s.id) === String(submissionId));
  if (!submission) return;
  const previousSpecialist = getAssignedReviewer(submission);
  const nextId = evaluatorId ? parseInt(evaluatorId, 10) : null;
  submission.assignedReviewerId = Number.isFinite(nextId) ? nextId : null;
  submission.assignedEvaluatorId = submission.assignedReviewerId;
  const specialist = getAssignedReviewer(submission);

  if (specialist) {
    setActiveUserForRole("reviewer", specialist.id);
    pushReviewerNotification(
      specialist.id,
      "New Specialist Assignment",
      `${submission.id} has been assigned to you for evaluation.`,
    );
    addAuditLog({
      accountName: getCurrentUser().name,
      action: previousSpecialist ? "Reassigned Specialist" : "Assigned Specialist",
      record: submission.id,
      details: `${submission.title} is now assigned to ${specialist.name}.`,
      module: submission.type,
    });
  } else {
    normalizeUnassignedSubmissionStatus(submission);
    syncSubmissionWorkflowState(submission);
    addAuditLog({
      accountName: getCurrentUser().name,
      action: "Removed Specialist",
      record: submission.id,
      details: `Cleared the specialist assignment for ${submission.title}.`,
      module: submission.type,
    });
  }

  showToast(specialist ? `Assigned to ${specialist.name}` : `Assignment removed`);
  renderDashboardContent('submission-detail');
};

function getFormTypeKeyFromSubmissionType(type) {
  const map = {
    Patent: "patent",
    Copyright: "copyright",
    "Utility Model": "utility",
    "Industrial Design": "industrial",
  };
  return map[type] || "patent";
}

function normalizeSubmissionWorkflowDefaults() {
  submissions = submissions.map((submission) => {
    const paymentStageActive =
      ["payment-slip-issued", "cashier-receipt", "receipt-submitted"].includes(
        submission.ipophlStage,
      ) ||
      ["payment-slip-issued", "cashier-receipt", "receipt-submitted"].includes(
        submission.copyrightStage,
      );

    return {
      ...submission,
      formType: submission.formType || getFormTypeKeyFromSubmissionType(submission.type),
      requirementUploads: submission.requirementUploads || {},
      paymentRequested:
        submission.paymentExempt
          ? false
          : (submission.paymentRequested ??
              (submission.status === "Payment Requested" ||
                paymentStageActive ||
                (submission.paymentVerified === false &&
                  (submission.officialReceiptNumber || "")
                    .toLowerCase()
                    .includes("pending")))),
      paymentProofUploaded:
        submission.paymentProofUploaded ?? Boolean(submission.paymentProofFile),
      paymentProofFile: submission.paymentProofFile || null,
    };
  });
}

normalizeSubmissionWorkflowDefaults();

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  if (currentRole === "applicant" && isLoggedIn) {
    navigateTo("user-dashboard");
  } else if (isLoggedIn) {
    navigateTo("admin-dashboard");
  } else {
    navigateTo("landing");
  }
});

window.showPaymentGuideModal = function() {
  const overlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');

  modalTitle.innerText = "PSU Campus Map";
  modalTitle.style.display = "block";

  modalBody.innerHTML = `
    <div style="padding: 0 10px;">
      <p style="color: var(--gray-500); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.6;">
        To complete your submission, please follow these steps to pay the filing fee:
      </p>
      
      <div style="display: grid; gap: 16px; margin-bottom: 24px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; background: var(--gold-light); color: var(--gold-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;">1</div>
          <div style="font-size: 0.88rem; color: var(--navy); font-weight: 600;">Visit the <strong>PSU Cashier's Office</strong> located at the Administration Building.</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; background: var(--gold-light); color: var(--gold-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;">2</div>
          <div style="font-size: 0.88rem; color: var(--navy); font-weight: 600;">Present your <strong>Application Reference Number</strong> or the printed payment slip.</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; background: var(--gold-light); color: var(--gold-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;">3</div>
          <div style="font-size: 0.88rem; color: var(--navy); font-weight: 600;">Secure your <strong>Official Receipt (OR)</strong> and take a clear photo or scan of it.</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; background: var(--gold-light); color: var(--gold-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;">4</div>
          <div style="font-size: 0.88rem; color: var(--navy); font-weight: 600;">Upload the receipt in your dashboard to proceed with the evaluation.</div>
        </div>
      </div>

      <div style="margin-top: 24px; border: 1px solid var(--gray-200); border-radius: 12px; overflow: hidden; background: white;">
        <div style="padding: 12px 16px; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--navy);"><i class="fa-solid fa-map-location-dot" style="margin-right: 6px;"></i> PSU Campus Map Guide</span>
          <span style="font-size: 0.72rem; color: var(--gray-500);">Administration Bldg. (Cashier)</span>
        </div>
        <div style="padding: 10px; background: white; text-align: center;">
          <img src="images/psu-map-real.png" alt="PSU Campus Map" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" />
        </div>
      </div>

      <div style="margin-top: 20px; padding: 12px; background: rgba(59,130,246,0.05); border-radius: 10px; display: flex; gap: 10px; align-items: center;">
        <i class="fa-solid fa-clock" style="color: #2563eb; font-size: 0.9rem;"></i>
        <div style="font-size: 0.8rem; color: #1e40af; line-height: 1.4;">
          <strong>Cashier Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM (No Noon Break)
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');
};



