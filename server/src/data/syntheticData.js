/**
 * AAROGYA-AI SYNTHETIC HEALTHCARE DATA SOURCE
 * 
 * DISCLAIMER & NOTICE:
 * All records, facilities, staff rosters, patient counts, bed occupancies,
 * and medicine supply data contained herein are entirely SYNTHETIC DEMO DATA.
 * They are created strictly for hackathon simulation, technology validation,
 * and user-interface design. No actual patient-identifying data or private
 * government healthcare records are utilized.
 * 
 * Data Schema Version: 1.0.0
 * Region Topology: Synthetic District "Ramanagar District Health Mission"
 */

export const IS_SYNTHETIC = true;
export const SYNTHETIC_DATA_VERSION = "1.0.0";
export const LAST_UPDATED = new Date().toISOString();

export const healthCenters = [
  {
    id: "DH-01",
    name: "Ramanagar District Hospital",
    nameHi: "रामनगर जिला अस्पताल",
    type: "DH", // District Hospital
    tier: "Tertiary / Referral",
    block: "Central",
    address: "Hospital Road, Civil Lines, Ramanagar",
    contact: "+91 80 2345 6701",
    coordinates: { lat: 12.7209, lng: 77.2799 },
    beds: {
      total: 180,
      occupied: 148,
      breakdown: {
        general: { total: 100, occupied: 82 },
        oxygen: { total: 40, occupied: 36 },
        icu: { total: 20, occupied: 17 },
        maternity: { total: 20, occupied: 13 }
      }
    },
    doctors: {
      sanctioned: 24,
      onDuty: 20,
      absent: 4,
      specialties: [
        { name: "General Medicine", onDuty: 6, required: 6 },
        { name: "Pediatrics", onDuty: 3, required: 4 },
        { name: "Gynecology & Obstetrics", onDuty: 4, required: 4 },
        { name: "Anesthesia / Critical Care", onDuty: 3, required: 4 },
        { name: "Orthopedics", onDuty: 2, required: 3 },
        { name: "General Surgery", onDuty: 2, required: 3 }
      ]
    },
    footfallToday: 512,
    footfallWeeklyAvg: 480,
    vulnerabilityScore: 28, // Low vulnerability (0-100)
    stockStatus: { critical: 1, low: 3, optimal: 38, surplus: 6 },
    diagnosticsStatus: "Operational",
    distanceFromHQKm: 0.0
  },
  {
    id: "CHC-01",
    name: "CHC Anandpur South",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र आनंदपुर दक्षिण",
    type: "CHC", // Community Health Centre
    tier: "Secondary Care",
    block: "Anandpur",
    address: "National Highway 75, Near Bus Stand, Anandpur",
    contact: "+91 80 2345 8812",
    coordinates: { lat: 12.6512, lng: 77.1895 },
    beds: {
      total: 30,
      occupied: 27,
      breakdown: {
        general: { total: 16, occupied: 15 },
        oxygen: { total: 6, occupied: 6 },
        icu: { total: 4, occupied: 3 },
        maternity: { total: 4, occupied: 3 }
      }
    },
    doctors: {
      sanctioned: 8,
      onDuty: 5,
      absent: 3,
      specialties: [
        { name: "General Medicine", onDuty: 2, required: 3 },
        { name: "Pediatrics", onDuty: 1, required: 2 },
        { name: "Gynecology & Obstetrics", onDuty: 1, required: 2 },
        { name: "Anesthesia", onDuty: 1, required: 1 }
      ]
    },
    footfallToday: 184,
    footfallWeeklyAvg: 165,
    vulnerabilityScore: 68, // Moderate-High vulnerability
    stockStatus: { critical: 4, low: 6, optimal: 28, surplus: 2 },
    diagnosticsStatus: "Partial",
    distanceFromHQKm: 14.8
  },
  {
    id: "CHC-02",
    name: "CHC Malgudi Hill",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र मालगुडी हिल",
    type: "CHC",
    tier: "Secondary Care",
    block: "Malgudi",
    address: "Malgudi Hill Station Road, Malgudi",
    contact: "+91 80 2345 8844",
    coordinates: { lat: 12.8341, lng: 77.3411 },
    beds: {
      total: 30,
      occupied: 19,
      breakdown: {
        general: { total: 18, occupied: 12 },
        oxygen: { total: 6, occupied: 4 },
        icu: { total: 2, occupied: 1 },
        maternity: { total: 4, occupied: 2 }
      }
    },
    doctors: {
      sanctioned: 7,
      onDuty: 6,
      absent: 1,
      specialties: [
        { name: "General Medicine", onDuty: 3, required: 3 },
        { name: "Pediatrics", onDuty: 1, required: 1 },
        { name: "Gynecology & Obstetrics", onDuty: 1, required: 2 },
        { name: "Anesthesia", onDuty: 1, required: 1 }
      ]
    },
    footfallToday: 128,
    footfallWeeklyAvg: 135,
    vulnerabilityScore: 35,
    stockStatus: { critical: 0, low: 2, optimal: 34, surplus: 4 },
    diagnosticsStatus: "Operational",
    distanceFromHQKm: 18.2
  },
  {
    id: "PHC-01",
    name: "PHC Bilikere Rural",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र बिलिकेरे ग्रामीण",
    type: "PHC", // Primary Health Centre
    tier: "Primary Care",
    block: "Anandpur",
    address: "Village Post Office Bilikere",
    contact: "+91 80 2345 1101",
    coordinates: { lat: 12.5891, lng: 77.1214 },
    beds: {
      total: 6,
      occupied: 5,
      breakdown: {
        general: { total: 4, occupied: 3 },
        oxygen: { total: 1, occupied: 1 },
        icu: { total: 0, occupied: 0 },
        maternity: { total: 1, occupied: 1 }
      }
    },
    doctors: {
      sanctioned: 2,
      onDuty: 1,
      absent: 1,
      specialties: [
        { name: "General Medicine", onDuty: 1, required: 2 }
      ]
    },
    footfallToday: 82,
    footfallWeeklyAvg: 76,
    vulnerabilityScore: 84, // Very High vulnerability
    stockStatus: { critical: 5, low: 4, optimal: 18, surplus: 0 },
    diagnosticsStatus: "Critical Deficit",
    distanceFromHQKm: 26.5
  },
  {
    id: "PHC-02",
    name: "PHC Kadur Junction",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र कदूर जंक्शन",
    type: "PHC",
    tier: "Primary Care",
    block: "Central",
    address: "Old Railway Crossing Road, Kadur",
    contact: "+91 80 2345 1102",
    coordinates: { lat: 12.7544, lng: 77.2411 },
    beds: {
      total: 6,
      occupied: 3,
      breakdown: {
        general: { total: 4, occupied: 2 },
        oxygen: { total: 1, occupied: 0 },
        icu: { total: 0, occupied: 0 },
        maternity: { total: 1, occupied: 1 }
      }
    },
    doctors: {
      sanctioned: 2,
      onDuty: 2,
      absent: 0,
      specialties: [
        { name: "General Medicine", onDuty: 2, required: 2 }
      ]
    },
    footfallToday: 64,
    footfallWeeklyAvg: 60,
    vulnerabilityScore: 32,
    stockStatus: { critical: 1, low: 1, optimal: 24, surplus: 2 },
    diagnosticsStatus: "Operational",
    distanceFromHQKm: 8.4
  },
  {
    id: "PHC-03",
    name: "PHC Honnali Riverside",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र होन्नाली रिवरसाइड",
    type: "PHC",
    tier: "Primary Care",
    block: "Honnali",
    address: "Riverbank Sector 4, Honnali",
    contact: "+91 80 2345 1103",
    coordinates: { lat: 12.8901, lng: 77.3892 },
    beds: {
      total: 6,
      occupied: 6,
      breakdown: {
        general: { total: 4, occupied: 4 },
        oxygen: { total: 1, occupied: 1 },
        icu: { total: 0, occupied: 0 },
        maternity: { total: 1, occupied: 1 }
      }
    },
    doctors: {
      sanctioned: 2,
      onDuty: 1,
      absent: 1,
      specialties: [
        { name: "General Medicine", onDuty: 1, required: 2 }
      ]
    },
    footfallToday: 95,
    footfallWeeklyAvg: 70,
    vulnerabilityScore: 76, // High vulnerability
    stockStatus: { critical: 3, low: 5, optimal: 19, surplus: 1 },
    diagnosticsStatus: "Partial",
    distanceFromHQKm: 29.1
  },
  {
    id: "PHC-04",
    name: "PHC Nelamangala East",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र नेलमंगला पूर्व",
    type: "PHC",
    tier: "Primary Care",
    block: "East Corridor",
    address: "Gram Panchayat Complex, Nelamangala East",
    contact: "+91 80 2345 1104",
    coordinates: { lat: 12.6991, lng: 77.3912 },
    beds: {
      total: 6,
      occupied: 2,
      breakdown: {
        general: { total: 4, occupied: 2 },
        oxygen: { total: 1, occupied: 0 },
        icu: { total: 0, occupied: 0 },
        maternity: { total: 1, occupied: 0 }
      }
    },
    doctors: {
      sanctioned: 2,
      onDuty: 2,
      absent: 0,
      specialties: [
        { name: "General Medicine", onDuty: 2, required: 2 }
      ]
    },
    footfallToday: 54,
    footfallWeeklyAvg: 58,
    vulnerabilityScore: 24,
    stockStatus: { critical: 0, low: 2, optimal: 26, surplus: 3 },
    diagnosticsStatus: "Operational",
    distanceFromHQKm: 16.0
  },
  {
    id: "CHC-03",
    name: "CHC Ramanagar West",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र रामनगर पश्चिम",
    type: "CHC",
    tier: "Secondary Care",
    block: "Central",
    address: "Bypass Junction, Ramanagar West",
    contact: "+91 80 2345 8899",
    coordinates: { lat: 12.7112, lng: 77.2144 },
    beds: {
      total: 30,
      occupied: 22,
      breakdown: {
        general: { total: 18, occupied: 14 },
        oxygen: { total: 6, occupied: 5 },
        icu: { total: 2, occupied: 1 },
        maternity: { total: 4, occupied: 2 }
      }
    },
    doctors: {
      sanctioned: 8,
      onDuty: 7,
      absent: 1,
      specialties: [
        { name: "General Medicine", onDuty: 3, required: 3 },
        { name: "Pediatrics", onDuty: 2, required: 2 },
        { name: "Gynecology & Obstetrics", onDuty: 1, required: 2 },
        { name: "Anesthesia", onDuty: 1, required: 1 }
      ]
    },
    footfallToday: 148,
    footfallWeeklyAvg: 142,
    vulnerabilityScore: 30,
    stockStatus: { critical: 1, low: 2, optimal: 32, surplus: 5 },
    diagnosticsStatus: "Operational",
    distanceFromHQKm: 6.2
  }
];

export const medicineInventory = [
  {
    id: "MED-001",
    name: "Anti-Snake Venom (ASV)",
    nameHi: "एंटी-स्नेक वेनम (सर्पदंश रोधी)",
    category: "Critical / Antidote",
    unit: "Vials",
    minThresholdTotal: 50,
    totalDistrictStock: 48,
    dailyDistrictBurnRate: 6.2,
    overallDaysRemaining: 7.7,
    status: "low",
    centerBreakdown: [
      { centerId: "DH-01", stock: 32, burnRate: 2.8, daysRemaining: 11.4, status: "optimal" },
      { centerId: "CHC-01", stock: 4, burnRate: 1.2, daysRemaining: 3.3, status: "low" },
      { centerId: "CHC-02", stock: 6, burnRate: 0.8, daysRemaining: 7.5, status: "optimal" },
      { centerId: "PHC-01", stock: 1, burnRate: 0.9, daysRemaining: 1.1, status: "critical" },
      { centerId: "PHC-02", stock: 2, burnRate: 0.3, daysRemaining: 6.6, status: "low" },
      { centerId: "PHC-03", stock: 1, burnRate: 0.7, daysRemaining: 1.4, status: "critical" },
      { centerId: "PHC-04", stock: 2, burnRate: 0.3, daysRemaining: 6.6, status: "low" },
      { centerId: "CHC-03", stock: 8, burnRate: 0.7, daysRemaining: 11.4, status: "optimal" }
    ]
  },
  {
    id: "MED-002",
    name: "Amoxicillin 500mg",
    nameHi: "एमोक्सिसिलिन 500mg",
    category: "Antibiotics",
    unit: "Strips (10s)",
    minThresholdTotal: 600,
    totalDistrictStock: 820,
    dailyDistrictBurnRate: 64,
    overallDaysRemaining: 12.8,
    status: "optimal",
    centerBreakdown: [
      { centerId: "DH-01", stock: 420, burnRate: 28, daysRemaining: 15.0, status: "optimal" },
      { centerId: "CHC-01", stock: 90, burnRate: 14, daysRemaining: 6.4, status: "low" },
      { centerId: "CHC-02", stock: 140, burnRate: 9, daysRemaining: 15.5, status: "optimal" },
      { centerId: "PHC-01", stock: 15, burnRate: 6, daysRemaining: 2.5, status: "critical" },
      { centerId: "PHC-02", stock: 35, burnRate: 4, daysRemaining: 8.7, status: "optimal" },
      { centerId: "PHC-03", stock: 20, burnRate: 5, daysRemaining: 4.0, status: "low" },
      { centerId: "PHC-04", stock: 40, burnRate: 3, daysRemaining: 13.3, status: "optimal" },
      { centerId: "CHC-03", stock: 120, burnRate: 8, daysRemaining: 15.0, status: "optimal" }
    ]
  },
  {
    id: "MED-003",
    name: "Paracetamol 650mg",
    nameHi: "पैरासिटामोल 650mg",
    category: "Analgesic / Antipyretic",
    unit: "Strips (10s)",
    minThresholdTotal: 1200,
    totalDistrictStock: 1850,
    dailyDistrictBurnRate: 145,
    overallDaysRemaining: 12.7,
    status: "optimal",
    centerBreakdown: [
      { centerId: "DH-01", stock: 950, burnRate: 65, daysRemaining: 14.6, status: "optimal" },
      { centerId: "CHC-01", stock: 220, burnRate: 26, daysRemaining: 8.4, status: "optimal" },
      { centerId: "CHC-02", stock: 280, burnRate: 18, daysRemaining: 15.5, status: "optimal" },
      { centerId: "PHC-01", stock: 35, burnRate: 14, daysRemaining: 2.5, status: "critical" },
      { centerId: "PHC-02", stock: 85, burnRate: 9, daysRemaining: 9.4, status: "optimal" },
      { centerId: "PHC-03", stock: 50, burnRate: 12, daysRemaining: 4.1, status: "low" },
      { centerId: "PHC-04", stock: 90, burnRate: 8, daysRemaining: 11.2, status: "optimal" },
      { centerId: "CHC-03", stock: 240, burnRate: 17, daysRemaining: 14.1, status: "optimal" }
    ]
  },
  {
    id: "MED-004",
    name: "ORS (Oral Rehydration Salts)",
    nameHi: "ओआरएस (जीवन रक्षक घोल)",
    category: "Maternal & Child Health",
    unit: "Sachets",
    minThresholdTotal: 800,
    totalDistrictStock: 520,
    dailyDistrictBurnRate: 88,
    overallDaysRemaining: 5.9,
    status: "low",
    centerBreakdown: [
      { centerId: "DH-01", stock: 280, burnRate: 35, daysRemaining: 8.0, status: "optimal" },
      { centerId: "CHC-01", stock: 45, burnRate: 18, daysRemaining: 2.5, status: "critical" },
      { centerId: "CHC-02", stock: 90, burnRate: 12, daysRemaining: 7.5, status: "optimal" },
      { centerId: "PHC-01", stock: 12, burnRate: 9, daysRemaining: 1.3, status: "critical" },
      { centerId: "PHC-02", stock: 25, burnRate: 6, daysRemaining: 4.1, status: "low" },
      { centerId: "PHC-03", stock: 18, burnRate: 8, daysRemaining: 2.2, status: "critical" },
      { centerId: "PHC-04", stock: 30, burnRate: 5, daysRemaining: 6.0, status: "low" },
      { centerId: "CHC-03", stock: 70, burnRate: 11, daysRemaining: 6.3, status: "low" }
    ]
  },
  {
    id: "MED-005",
    name: "Oxytocin 10 IU",
    nameHi: "ऑक्सीटोसिन 10 IU",
    category: "Maternal & Child Health",
    unit: "Ampoules",
    minThresholdTotal: 250,
    totalDistrictStock: 190,
    dailyDistrictBurnRate: 22,
    overallDaysRemaining: 8.6,
    status: "optimal",
    centerBreakdown: [
      { centerId: "DH-01", stock: 110, burnRate: 12, daysRemaining: 9.1, status: "optimal" },
      { centerId: "CHC-01", stock: 25, burnRate: 4, daysRemaining: 6.2, status: "low" },
      { centerId: "CHC-02", stock: 35, burnRate: 3, daysRemaining: 11.6, status: "optimal" },
      { centerId: "PHC-01", stock: 2, burnRate: 1.5, daysRemaining: 1.3, status: "critical" },
      { centerId: "PHC-02", stock: 6, burnRate: 0.8, daysRemaining: 7.5, status: "optimal" },
      { centerId: "PHC-03", stock: 3, burnRate: 1.2, daysRemaining: 2.5, status: "critical" },
      { centerId: "PHC-04", stock: 7, burnRate: 0.6, daysRemaining: 11.6, status: "optimal" },
      { centerId: "CHC-03", stock: 32, burnRate: 3.5, daysRemaining: 9.1, status: "optimal" }
    ]
  },
  {
    id: "MED-006",
    name: "Metformin 500mg",
    nameHi: "मेटफॉर्मिन 500mg",
    category: "Chronic Diseases",
    unit: "Strips (10s)",
    minThresholdTotal: 900,
    totalDistrictStock: 1280,
    dailyDistrictBurnRate: 72,
    overallDaysRemaining: 17.7,
    status: "optimal",
    centerBreakdown: [
      { centerId: "DH-01", stock: 700, burnRate: 35, daysRemaining: 20.0, status: "optimal" },
      { centerId: "CHC-01", stock: 160, burnRate: 12, daysRemaining: 13.3, status: "optimal" },
      { centerId: "CHC-02", stock: 180, burnRate: 10, daysRemaining: 18.0, status: "optimal" },
      { centerId: "PHC-01", stock: 24, burnRate: 5, daysRemaining: 4.8, status: "low" },
      { centerId: "PHC-02", stock: 55, burnRate: 4, daysRemaining: 13.7, status: "optimal" },
      { centerId: "PHC-03", stock: 30, burnRate: 4, daysRemaining: 7.5, status: "optimal" },
      { centerId: "PHC-04", stock: 51, burnRate: 3, daysRemaining: 17.0, status: "optimal" },
      { centerId: "CHC-03", stock: 180, burnRate: 11, daysRemaining: 16.3, status: "optimal" }
    ]
  }
];

export const patientFootfallTrends = [
  { date: "Oct 05", day: "Mon", opd: 1120, emergency: 142, maternal: 88, total: 1350 },
  { date: "Oct 06", day: "Tue", opd: 1180, emergency: 135, maternal: 92, total: 1407 },
  { date: "Oct 07", day: "Wed", opd: 1090, emergency: 128, maternal: 85, total: 1303 },
  { date: "Oct 08", day: "Thu", opd: 1210, emergency: 154, maternal: 96, total: 1460 },
  { date: "Oct 09", day: "Fri", opd: 1290, emergency: 168, maternal: 104, total: 1562 },
  { date: "Oct 10", day: "Sat", opd: 1340, emergency: 180, maternal: 110, total: 1630 },
  { date: "Oct 11", day: "Sun", opd: 780, emergency: 140, maternal: 60, total: 980 },
  { date: "Oct 12", day: "Mon", opd: 1240, emergency: 150, maternal: 94, total: 1484 },
  { date: "Oct 13", day: "Tue", opd: 1270, emergency: 162, maternal: 98, total: 1530 },
  { date: "Oct 14", day: "Wed", opd: 1215, emergency: 144, maternal: 91, total: 1450 },
  { date: "Oct 15", day: "Thu", opd: 1310, emergency: 172, maternal: 108, total: 1590 },
  { date: "Oct 16", day: "Fri", opd: 1380, emergency: 188, maternal: 114, total: 1682 },
  { date: "Oct 17", day: "Sat", opd: 1420, emergency: 195, maternal: 122, total: 1737 },
  { date: "Oct 18", day: "Sun", opd: 890, emergency: 160, maternal: 74, total: 1124 }
];

export const diagnosticAudits = [
  { testName: "CBC (Complete Blood Count)", category: "Hematology", totalAudited: 8, operationalCenters: 6, kitStockAdequate: 5, status: "Warning" },
  { testName: "Malaria Rapid Diagnostic (RDT)", category: "Vector-borne", totalAudited: 8, operationalCenters: 8, kitStockAdequate: 4, status: "Critical" },
  { testName: "Dengue NS1 Antigen", category: "Vector-borne", totalAudited: 8, operationalCenters: 7, kitStockAdequate: 5, status: "Warning" },
  { testName: "ECG (Electrocardiogram)", category: "Cardiology", totalAudited: 5, operationalCenters: 4, kitStockAdequate: 4, status: "Good" },
  { testName: "X-Ray (Digital / Analog)", category: "Radiology", totalAudited: 4, operationalCenters: 3, kitStockAdequate: 3, status: "Good" },
  { testName: "Blood Glucose (Glucometer strips)", category: "Endocrine", totalAudited: 8, operationalCenters: 8, kitStockAdequate: 7, status: "Good" }
];

export const criticalAlerts = [
  {
    id: "ALT-801",
    severity: "critical",
    category: "Stock-out Warning",
    title: "Anti-Snake Venom Stock Depletion",
    titleHi: "एंटी-स्नेक वेनम स्टॉक अत्यधिक कम",
    centerId: "PHC-01",
    centerName: "PHC Bilikere Rural",
    centerNameHi: "प्राथमिक स्वास्थ्य केंद्र बिलिकेरे ग्रामीण",
    description: "Only 1 vial remaining with 0.9 daily burn rate (1.1 days left). High incidence of rural reptile bites reported.",
    timestamp: "18 Oct 2026, 09:30 AM",
    actionSuggested: "Redistribute 8 vials from DH Ramanagar (14km) or CHC-02."
  },
  {
    id: "ALT-802",
    severity: "critical",
    category: "Bed Capacity",
    title: "Bed Saturation at 100%",
    titleHi: "बिस्तर क्षमता 100% संतृप्त",
    centerId: "PHC-03",
    centerName: "PHC Honnali Riverside",
    centerNameHi: "प्राथमिक स्वास्थ्य केंद्र होन्नाली रिवरसाइड",
    description: "All 6 beds currently occupied (General: 4/4, Oxygen: 1/1, Maternity: 1/1). 4 patients awaiting observation.",
    timestamp: "18 Oct 2026, 10:15 AM",
    actionSuggested: "Divert incoming non-emergency cases to CHC Malgudi (11km)."
  },
  {
    id: "ALT-803",
    severity: "warning",
    category: "Staff Deficit",
    title: "Pediatrician Shift Absence",
    titleHi: "बाल रोग विशेषज्ञ ड्यूटी से अनुपस्थित",
    centerId: "CHC-01",
    centerName: "CHC Anandpur South",
    centerNameHi: "सामुदायिक स्वास्थ्य केंद्र आनंदपुर दक्षिण",
    description: "1 on-duty pediatrician managing 42 pediatric OPD visits today. Recommended ratio exceeded by 180%.",
    timestamp: "18 Oct 2026, 08:45 AM",
    actionSuggested: "Depute secondary physician from DH Ramanagar for evening shift."
  },
  {
    id: "ALT-804",
    severity: "warning",
    category: "Supply Chain",
    title: "ORS Sachet Depletion in Multiple PHCs",
    titleHi: "कई प्राथमिक स्वास्थ्य केंद्रों में ओआरएस की कमी",
    centerId: "DISTRICT-WIDE",
    centerName: "District-Wide Supply Alert",
    centerNameHi: "जिला स्तरीय आपूर्ति चेतावनी",
    description: "PHC Bilikere (1.3 days) & PHC Honnali (2.2 days) running dangerously low amidst acute gastroenteritis spike.",
    timestamp: "18 Oct 2026, 07:15 AM",
    actionSuggested: "Release emergency buffer stock from central drug warehouse."
  },
  {
    id: "ALT-805",
    severity: "info",
    category: "Diagnostics Audit",
    title: "Semi-Automated Analyzer Maintenance Due",
    titleHi: "अर्ध-स्वचालित विश्लेषक रखरखाव लंबित",
    centerId: "CHC-02",
    centerName: "CHC Malgudi Hill",
    centerNameHi: "सामुदायिक स्वास्थ्य केंद्र मालगुडी हिल",
    description: "Biochemistry analyzer calibration expired 48 hours ago. Quality control verification flagged.",
    timestamp: "17 Oct 2026, 04:30 PM",
    actionSuggested: "Biomedical engineer visit scheduled for tomorrow morning."
  }
];

export const districtSummary = {
  totalHealthCenters: 8,
  dhCount: 1,
  chcCount: 3,
  phcCount: 4,
  totalBeds: 294,
  occupiedBeds: 232,
  bedOccupancyRate: 78.9, // percentage
  totalDoctorsSanctioned: 55,
  doctorsOnDuty: 44,
  doctorAttendanceRate: 80.0, // percentage
  activeCriticalStockouts: 3,
  lowStockAlerts: 8,
  todayTotalFootfall: 1267,
  weeklyAvgFootfall: 1228,
  averageVulnerabilityScore: 43.4,
  underResourcedCentersCount: 2 // PHC Bilikere and PHC Honnali
};
