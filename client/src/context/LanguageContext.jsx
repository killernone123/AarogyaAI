import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Brand & App
    appName: "AarogyaAI",
    appTagline: "Smart Health & Supply Chain Intelligence",
    governmentBadge: "National Health Mission - District Command Center",
    demoDataWarning: "DEMO DATA MODE: Synthetically generated for hackathon simulation. No real patient data.",
    
    // Navigation
    navDashboard: "District Dashboard",
    navCenters: "Health Centres",
    navInventory: "Medicine Inventory",
    navRedistribution: "Redistribution AI",
    navFootfall: "Footfall Analytics",
    navDiagnostics: "Diagnostic Audits",
    navSettings: "System Settings",
    navForecast: "Demand Forecast",

    // Dashboard Overview
    districtHeaderTitle: "Ramanagar District Health Mission",
    districtHeaderSubtitle: "Real-time command & predictive supply chain monitoring across 8 health centers",
    lastSynced: "Live Sync: Just now",
    refreshButton: "Refresh Data",

    // Summary Cards
    metricCenters: "Monitored Facilities",
    metricCentersSub: "1 DH • 3 CHCs • 4 PHCs",
    metricBedOccupancy: "Bed Occupancy Rate",
    metricBedOccupancySub: "232 / 294 Total Beds in Use",
    metricDoctorAttendance: "Doctor On-Duty Rate",
    metricDoctorAttendanceSub: "44 on duty out of 55 sanctioned",
    metricStockouts: "Critical Stock Alerts",
    metricStockoutsSub: "Require immediate replenishment",
    metricFootfall: "Today's Patient Footfall",
    metricFootfallSub: "+3.2% vs 7-day average",

    // Charts
    chartMedicineTitle: "Critical Medicine Stock & Burn-Rate",
    chartMedicineSubtitle: "Estimated days of stock remaining across district inventory",
    chartFootfallTitle: "14-Day Patient Footfall Trends",
    chartFootfallSubtitle: "Breakdown of Out-Patient (OPD), Emergency & Maternal visits",
    chartBedTitle: "Bed Occupancy by Facility",
    chartBedSubtitle: "General, Oxygen-supported, ICU and Maternity utilization",
    daysRemainingLabel: "Days of Stock Remaining",
    criticalThresholdLabel: "Critical Level (< 3 days)",
    warningThresholdLabel: "Re-order Point (7 days)",

    // Critical Alerts
    alertsTitle: "Urgent Administrative Alerts",
    alertsSubtitle: "Real-time operational bottlenecks requiring district intervention",
    viewAllAlerts: "Filter Alerts",
    takeAction: "Initiate Action",
    dismiss: "Acknowledge",
    actionRecommended: "Recommended Intervention:",

    // Health Centres Table
    centersTableTitle: "Health Centres Operational Status",
    centersTableSubtitle: "Live monitoring of bed saturation, doctor staffing, and inventory health",
    filterAll: "All Facilities",
    filterDH: "District Hospital",
    filterCHC: "CHCs",
    filterPHC: "PHCs",
    searchPlaceholder: "Search facility by name or block...",
    colCenterName: "Facility Name",
    colTier: "Type / Block",
    colBeds: "Bed Occupancy",
    colDoctors: "Doctor Staffing",
    colStockStatus: "Stock Health",
    colDiagnostics: "Diagnostics",
    colVulnerability: "CVI Score",
    colActions: "Action",
    viewDetails: "View Details",

    // Status Tags
    statusCritical: "Critical",
    statusLow: "Low Stock",
    statusOptimal: "Optimal",
    statusSurplus: "Surplus",
    statusOperational: "Operational",
    statusPartial: "Partial Deficit",

    // Common States
    loading: "Fetching district live telemetry...",
    errorTitle: "Unable to connect to Health Center Telemetry",
    errorRetry: "Retry Connection",
    emptyCenters: "No health facilities match the selected filters.",

    // Language Toggle
    currentLanguageLabel: "Language",
    english: "English",
    hindi: "हिन्दी"
  },
  hi: {
    // Brand & App
    appName: "आरोग्य AI",
    appTagline: "स्मार्ट स्वास्थ्य एवं आपूर्ति श्रृंखला नियंत्रण",
    governmentBadge: "राष्ट्रीय स्वास्थ्य मिशन - जिला कमान केंद्र",
    demoDataWarning: "डेमो डेटा मोड: हैकाथॉन सिमुलेशन हेतु संश्लेषित डेटा। कोई वास्तविक मरीज डेटा नहीं।",

    // Navigation
    navDashboard: "जिला डैशबोर्ड",
    navCenters: "स्वास्थ्य केंद्र",
    navInventory: "दवा सूची (इन्वेंटरी)",
    navRedistribution: "पुनर्वितरण AI",
    navFootfall: "मरीज संख्या (फुटफॉल)",
    navDiagnostics: "जांच एवं डायग्नोस्टिक्स",
    navSettings: "सिस्टम सेटिंग्स",
    navForecast: "मांग पूर्वानुमान",

    // Dashboard Overview
    districtHeaderTitle: "रामनगर जिला स्वास्थ्य मिशन",
    districtHeaderSubtitle: "8 स्वास्थ्य केंद्रों में वास्तविक समय निगरानी एवं पूर्वानुमान आपूर्ति प्रबंधन",
    lastSynced: "लाइव सिंक: अभी-अभी",
    refreshButton: "डेटा रीफ्रेश करें",

    // Summary Cards
    metricCenters: "निगरानी वाले केंद्र",
    metricCentersSub: "1 जिला अस्पताल • 3 CHC • 4 PHC",
    metricBedOccupancy: "बिस्तर उपयोग दर",
    metricBedOccupancySub: "कुल 294 में से 232 बिस्तर उपयोग में",
    metricDoctorAttendance: "डॉक्टर उपस्थिति दर",
    metricDoctorAttendanceSub: "स्वीकृत 55 में से 44 ड्यूटी पर",
    metricStockouts: "गंभीर दवा कमी अलर्ट",
    metricStockoutsSub: "तत्काल आपूर्ति की आवश्यकता",
    metricFootfall: "आज मरीजों की कुल संख्या",
    metricFootfallSub: "7-दिवसीय औसत से +3.2% अधिक",

    // Charts
    chartMedicineTitle: "महत्वपूर्ण दवाओं का स्टॉक एवं खपत दर",
    chartMedicineSubtitle: "जिले भर में शेष बचे दिनों का अनुमानित स्टॉक",
    chartFootfallTitle: "14-दिवसीय मरीज फुटफॉल रुझान",
    chartFootfallSubtitle: "ओपीडी, आपातकालीन एवं प्रसूति सेवाओं का दैनिक विवरण",
    chartBedTitle: "केंद्र-वार बिस्तर उपयोगिता",
    chartBedSubtitle: "सामान्य, ऑक्सीजन, आईसीयू और प्रसूति बिस्तर का विवरण",
    daysRemainingLabel: "शेष स्टॉक के दिन",
    criticalThresholdLabel: "गंभीर स्तर (< 3 दिन)",
    warningThresholdLabel: "पुनः ऑर्डर स्तर (7 दिन)",

    // Critical Alerts
    alertsTitle: "आपातकालीन प्रशासनिक अलर्ट",
    alertsSubtitle: "तत्काल जिला हस्तक्षेप की आवश्यकता वाली परिचालन समस्याएं",
    viewAllAlerts: "अलर्ट फ़िल्टर",
    takeAction: "कार्यवाही करें",
    dismiss: "स्वीकारें",
    actionRecommended: "अनुशंसित कार्यवाही:",

    // Health Centres Table
    centersTableTitle: "स्वास्थ्य केंद्रों की परिचालन स्थिति",
    centersTableSubtitle: "बिस्तर उपलब्धता, डॉक्टर उपस्थिति और दवा भंडार की सीधी निगरानी",
    filterAll: "सभी केंद्र",
    filterDH: "जिला अस्पताल",
    filterCHC: "सीएचसी (CHC)",
    filterPHC: "पीएचसी (PHC)",
    searchPlaceholder: "केंद्र का नाम या ब्लॉक खोजें...",
    colCenterName: "स्वास्थ्य केंद्र का नाम",
    colTier: "प्रकार / ब्लॉक",
    colBeds: "बिस्तर उपयोगिता",
    colDoctors: "डॉक्टर उपस्थिति",
    colStockStatus: "दवा स्टॉक स्थिति",
    colDiagnostics: "जांच सेवाएं",
    colVulnerability: "सुभेद्यता स्कोर (CVI)",
    colActions: "कार्यवाही",
    viewDetails: "विवरण देखें",

    // Status Tags
    statusCritical: "गंभीर",
    statusLow: "कम स्टॉक",
    statusOptimal: "पर्याप्त",
    statusSurplus: "अतिरिक्त",
    statusOperational: "सुचारू",
    statusPartial: "आंशिक कमी",

    // Common States
    loading: "जिला टेलीमेट्री डेटा लोड हो रहा है...",
    errorTitle: "स्वास्थ्य केंद्र नेटवर्क से संपर्क नहीं हो सका",
    errorRetry: "पुनः प्रयास करें",
    emptyCenters: "चुने गए फ़िल्टर के अनुसार कोई स्वास्थ्य केंद्र नहीं मिला।",

    // Language Toggle
    currentLanguageLabel: "भाषा",
    english: "English",
    hindi: "हिन्दी"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('aarogya_lang') || 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('aarogya_lang', next);
      return next;
    });
  };

  const setSpecificLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguage(lang);
      localStorage.setItem('aarogya_lang', lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setSpecificLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
