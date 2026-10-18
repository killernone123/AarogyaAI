/**
 * AarogyaAI Client Fallback Synthetic Data
 * Ensures seamless display while backend telemetry connects.
 */

export const IS_SYNTHETIC = true;

export const fallbackSummary = {
  totalHealthCenters: 8,
  dhCount: 1,
  chcCount: 3,
  phcCount: 4,
  totalBeds: 294,
  occupiedBeds: 232,
  bedOccupancyRate: 78.9,
  totalDoctorsSanctioned: 55,
  doctorsOnDuty: 44,
  doctorAttendanceRate: 80.0,
  activeCriticalStockouts: 3,
  lowStockAlerts: 8,
  todayTotalFootfall: 1267,
  weeklyAvgFootfall: 1228,
  averageVulnerabilityScore: 43.4
};

export const fallbackCenters = [
  {
    id: "DH-01",
    name: "Ramanagar District Hospital",
    nameHi: "रामनगर जिला अस्पताल",
    type: "DH",
    block: "Central",
    beds: { total: 180, occupied: 148, breakdown: { general: { total: 100, occupied: 82 }, oxygen: { total: 40, occupied: 36 }, icu: { total: 20, occupied: 17 }, maternity: { total: 20, occupied: 13 } } },
    doctors: { sanctioned: 24, onDuty: 20, absent: 4 },
    footfallToday: 512,
    vulnerabilityScore: 28,
    stockStatus: { critical: 1, low: 3, optimal: 38, surplus: 6 },
    diagnosticsStatus: "Operational"
  },
  {
    id: "CHC-01",
    name: "CHC Anandpur South",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र आनंदपुर दक्षिण",
    type: "CHC",
    block: "Anandpur",
    beds: { total: 30, occupied: 27, breakdown: { general: { total: 16, occupied: 15 }, oxygen: { total: 6, occupied: 6 }, icu: { total: 4, occupied: 3 }, maternity: { total: 4, occupied: 3 } } },
    doctors: { sanctioned: 8, onDuty: 5, absent: 3 },
    footfallToday: 184,
    vulnerabilityScore: 68,
    stockStatus: { critical: 4, low: 6, optimal: 28, surplus: 2 },
    diagnosticsStatus: "Partial"
  },
  {
    id: "CHC-02",
    name: "CHC Malgudi Hill",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र मालगुडी हिल",
    type: "CHC",
    block: "Malgudi",
    beds: { total: 30, occupied: 19, breakdown: { general: { total: 18, occupied: 12 }, oxygen: { total: 6, occupied: 4 }, icu: { total: 2, occupied: 1 }, maternity: { total: 4, occupied: 2 } } },
    doctors: { sanctioned: 7, onDuty: 6, absent: 1 },
    footfallToday: 128,
    vulnerabilityScore: 35,
    stockStatus: { critical: 0, low: 2, optimal: 34, surplus: 4 },
    diagnosticsStatus: "Operational"
  },
  {
    id: "PHC-01",
    name: "PHC Bilikere Rural",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र बिलिकेरे ग्रामीण",
    type: "PHC",
    block: "Anandpur",
    beds: { total: 6, occupied: 5, breakdown: { general: { total: 4, occupied: 3 }, oxygen: { total: 1, occupied: 1 }, icu: { total: 0, occupied: 0 }, maternity: { total: 1, occupied: 1 } } },
    doctors: { sanctioned: 2, onDuty: 1, absent: 1 },
    footfallToday: 82,
    vulnerabilityScore: 84,
    stockStatus: { critical: 5, low: 4, optimal: 18, surplus: 0 },
    diagnosticsStatus: "Critical Deficit"
  },
  {
    id: "PHC-02",
    name: "PHC Kadur Junction",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र कदूर जंक्शन",
    type: "PHC",
    block: "Central",
    beds: { total: 6, occupied: 3, breakdown: { general: { total: 4, occupied: 2 }, oxygen: { total: 1, occupied: 0 }, icu: { total: 0, occupied: 0 }, maternity: { total: 1, occupied: 1 } } },
    doctors: { sanctioned: 2, onDuty: 2, absent: 0 },
    footfallToday: 64,
    vulnerabilityScore: 32,
    stockStatus: { critical: 1, low: 1, optimal: 24, surplus: 2 },
    diagnosticsStatus: "Operational"
  },
  {
    id: "PHC-03",
    name: "PHC Honnali Riverside",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र होन्नाली रिवरसाइड",
    type: "PHC",
    block: "Honnali",
    beds: { total: 6, occupied: 6, breakdown: { general: { total: 4, occupied: 4 }, oxygen: { total: 1, occupied: 1 }, icu: { total: 0, occupied: 0 }, maternity: { total: 1, occupied: 1 } } },
    doctors: { sanctioned: 2, onDuty: 1, absent: 1 },
    footfallToday: 95,
    vulnerabilityScore: 76,
    stockStatus: { critical: 3, low: 5, optimal: 19, surplus: 1 },
    diagnosticsStatus: "Partial"
  },
  {
    id: "PHC-04",
    name: "PHC Nelamangala East",
    nameHi: "प्राथमिक स्वास्थ्य केंद्र नेलमंगला पूर्व",
    type: "PHC",
    block: "East Corridor",
    beds: { total: 6, occupied: 2, breakdown: { general: { total: 4, occupied: 2 }, oxygen: { total: 1, occupied: 0 }, icu: { total: 0, occupied: 0 }, maternity: { total: 1, occupied: 0 } } },
    doctors: { sanctioned: 2, onDuty: 2, absent: 0 },
    footfallToday: 54,
    vulnerabilityScore: 24,
    stockStatus: { critical: 0, low: 2, optimal: 26, surplus: 3 },
    diagnosticsStatus: "Operational"
  },
  {
    id: "CHC-03",
    name: "CHC Ramanagar West",
    nameHi: "सामुदायिक स्वास्थ्य केंद्र रामनगर पश्चिम",
    type: "CHC",
    block: "Central",
    beds: { total: 30, occupied: 22, breakdown: { general: { total: 18, occupied: 14 }, oxygen: { total: 6, occupied: 5 }, icu: { total: 2, occupied: 1 }, maternity: { total: 4, occupied: 2 } } },
    doctors: { sanctioned: 8, onDuty: 7, absent: 1 },
    footfallToday: 148,
    vulnerabilityScore: 30,
    stockStatus: { critical: 1, low: 2, optimal: 32, surplus: 5 },
    diagnosticsStatus: "Operational"
  }
];

export const fallbackMedicineInventory = [
  { id: "MED-001", name: "Anti-Snake Venom (ASV)", nameHi: "एंटी-स्नेक वेनम", category: "Critical", daysRemaining: 7.7, stock: 48, status: "low" },
  { id: "MED-002", name: "Amoxicillin 500mg", nameHi: "एमोक्सिसिलिन", category: "Antibiotics", daysRemaining: 12.8, stock: 820, status: "optimal" },
  { id: "MED-003", name: "Paracetamol 650mg", nameHi: "पैरासिटामोल", category: "Analgesic", daysRemaining: 12.7, stock: 1850, status: "optimal" },
  { id: "MED-004", name: "ORS Sachets", nameHi: "ओआरएस", category: "Maternal & Child", daysRemaining: 5.9, stock: 520, status: "low" },
  { id: "MED-005", name: "Oxytocin 10 IU", nameHi: "ऑक्सीटोसिन", category: "Maternal", daysRemaining: 8.6, stock: 190, status: "optimal" },
  { id: "MED-006", name: "Metformin 500mg", nameHi: "मेटफॉर्मिन", category: "Chronic", daysRemaining: 17.7, stock: 1280, status: "optimal" }
];

export const fallbackFootfallTrends = [
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

export const fallbackAlerts = [
  {
    id: "ALT-801",
    severity: "critical",
    category: "Stock-out Warning",
    title: "Anti-Snake Venom Stock Depletion",
    titleHi: "एंटी-स्नेक वेनम स्टॉक अत्यधिक कम",
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
    centerName: "CHC Anandpur South",
    centerNameHi: "सामुदायिक स्वास्थ्य केंद्र आनंदपुर दक्षिण",
    description: "1 on-duty pediatrician managing 42 pediatric OPD visits today. Recommended ratio exceeded by 180%.",
    timestamp: "18 Oct 2026, 08:45 AM",
    actionSuggested: "Depute secondary physician from DH Ramanagar for evening shift."
  }
];
