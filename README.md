# AarogyaAI: Smart Health & Supply Chain Management

> **AI-Driven Health Center Resource Allocation & Supply Chain Intelligence**  
> Built for District Health Administration, Primary Health Centres (PHCs), and Community Health Centres (CHCs).

---

## ⚠️ Synthetic Demo Data Disclaimer

**IMPORTANT NOTICE:**  
This application operates strictly on **synthetic demo data** generated for hackathon benchmarking, simulation, and technological evaluation. No real patient-identifying data, protected health information (PHI), or private government health records are stored, accessed, or transmitted. The dashboard is prominently watermarked as **DEMO DATA MODE** until official authorized health department APIs are connected.

---

## 🌟 Key Features Implemented (Phase 1)

1. **Responsive District Administrator Dashboard**:
   - Executive command room for District Health Officers (DHO).
   - Real-time KPIs: Monitored facilities count, Bed Occupancy rate, Doctor on-duty staffing ratio, Active critical stock alerts, and Daily Out-Patient footfall.
2. **Sidebar Navigation**:
   - Clean, accessible navigation for Facilities, Inventory, Footfall, Bed Capacity, Diagnostics, and Alerts.
3. **Medicine Inventory & Early Stock-out Alerts Chart**:
   - Recharts horizontal bar chart monitoring days of stock remaining for critical drugs (Anti-Snake Venom, Amoxicillin, Paracetamol, ORS, Oxytocin, Metformin).
   - Color-coded urgency levels: Critical (< 3 days), Low (3–7 days), and Optimal (> 7 days).
4. **14-Day Patient Footfall Surge Monitoring**:
   - Multi-area time-series chart showing Out-Patient (OPD), Emergency, and Maternal footfall trends.
   - Surge detection indicators (e.g. monsoon vector-borne disease spikes).
5. **Bed Availability & Saturation Visualization**:
   - Stacked bed capacity charts displaying Occupied vs. Vacant beds across General, Oxygen, ICU, and Maternity units for all 8 district facilities.
6. **Critical Alerts & Interventions Panel**:
   - Live stream of operational bottlenecks (stock-outs, staffing shortages, capacity saturation).
   - Recommended district-level interventions with action acknowledgments.
7. **Interactive Health Centres Telemetry Table**:
   - Searchable and block/tier-filterable directory of 1 District Hospital, 3 CHCs, and 4 PHCs.
   - Center Vulnerability Index (CVI Score 0–100) scoring.
   - Comprehensive facility drill-down drawer showing full bed breakdowns and doctor rosters.
8. **Bilingual Support (Hindi & English)**:
   - Instant language toggle (`English` / `हिन्दी`) with complete medical and administrative localization.
9. **Resilient Data Architecture**:
   - Backend health-check endpoint at `/api/health`.
   - Dual-mode telemetry: seamlessly syncs with Express REST API with graceful instant fallback to client cache.
   - Loading skeletons, empty search states, and error retry banners.

---

## 📂 Project Structure

```
AarogyaAI/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # DemoBadge, ErrorBanner, EmptyState, LoadingSkeleton
│   │   │   ├── dashboard/      # SummaryCards, MedicineChart, FootfallChart, BedChart, Alerts, CenterTable
│   │   │   └── layout/         # Header (bilingual toggle, sync status), Sidebar
│   │   ├── context/            # LanguageContext (hi/en), HealthDataContext (REST client)
│   │   ├── data/               # Fallback synthetic demo dataset
│   │   ├── pages/              # DashboardView
│   │   ├── App.jsx             # Main application layout
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind CSS directives & custom styling
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js          # API proxy to Express backend
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   └── data/
│   │       └── syntheticData.js# Documented synthetic healthcare data model
│   ├── server.js               # Express API with /api/health, /api/centers, /api/inventory, etc.
│   └── package.json
│
├── package.json                # Root automation scripts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher

### 1. Installation

Install dependencies for both the frontend and backend from the root directory:

```bash
# Option A: One-step install from root
npm run install:all

# Option B: Individual folder installation
cd server && npm install
cd ../client && npm install
```

### 2. Running the Application

You will run the backend server and frontend client in two terminal windows:

#### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```
- Server starts on `http://localhost:5000`
- Health check available at: `http://localhost:5000/api/health`

#### Terminal 2: Start Frontend Client
```bash
cd client
npm run dev
```
- Frontend starts on `http://localhost:5173`
- Open your browser at `http://localhost:5173` to view the AarogyaAI District Command Dashboard.

---

## 🔍 API Endpoints Implemented

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health-check, uptime, and synthetic data verification |
| `GET` | `/api/metrics/summary` | High-level district KPIs (occupancy, attendance, stock alerts) |
| `GET` | `/api/centers` | List of all 8 health centers with bed & staffing telemetry |
| `GET` | `/api/centers/:id` | Detailed telemetry and inventory for a specific facility |
| `GET` | `/api/inventory` | Search, filter, and sort medicine inventory with telemetry & risk reasoning |
| `GET` | `/api/inventory/:id` | Single medicine formulation details with multi-batch breakdown and audit trail |
| `POST` | `/api/inventory` | Create a new medicine formulation with input validation and audit logging |
| `PUT` | `/api/inventory/:id` | Update stock quantity, burn rate, threshold with audit logging |
| `GET` | `/api/inventory-audit-trail` | Immutable chronological ledger of all inventory transactions |
| `GET` | `/api/alerts` | Urgent operational alerts with severity ranking |
| `GET` | `/api/footfall/trends` | 14-day OPD, Emergency, and Maternal visit trends |
| `GET` | `/api/diagnostics/audits`| Diagnostic laboratory and test kit availability audits |

---

## 🧪 Automated Testing

To run the automated calculation logic and API test suite:

```bash
cd server
npm test
```
* **16 Unit Tests**: Tests pure calculation engine (`calculateDaysRemaining`, batch expiry exclusions, risk reason generation, input validation).
* **6 Integration Tests**: Tests in-memory store, search/filter/sort queries, create/update transactions, and immutable audit logging.

---

## 📋 Roadmap

- [x] **Phase 1 (Complete)**: Project scaffolding, responsive district dashboard, charts, alerts, Hindi/English toggle, Express backend, synthetic data engine.
- [x] **Phase 2 (Complete)**: Medicine Inventory & Stock-Risk Module:
  - Transparent calculation engine ($estimatedDays = usableStock / burnRate$)
  - Multi-batch tracking with strict exclusion of expired stock
  - Input validation for numeric fields and dates
  - Immutable audit trail ledger
  - Responsive UI with search, category/risk/facility filters, and sorting
  - Create & Update modals with live calculation preview
- [ ] **Phase 3**: AI-Driven Demand Forecasting with Google Gemini API & Multi-center Resource Redistribution Optimization.
- [ ] **Phase 4**: Automated Center Vulnerability Index (CVI) scoring triggers, DHO approval workflows, and compliance report exports.
