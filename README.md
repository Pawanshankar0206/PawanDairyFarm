# 🌾 DairyFlow — Enterprise Dairy Farm & Livestock Management System
## Buffalo Management | Calf Management | Breeding & Pregnancy | Deworming | Veterinary Records | SMS Alerts | Admin & RBAC

DairyFlow is a production-grade digital dairy farm management headquarters designed to monitor adult buffaloes, calves, and cows across their full lifecycle, automate breeding and health schedules, dispatch SMS veterinary alerts, track itemized medical billing without double-counting, and provide deep financial analytics.

---

## 🚀 Key Modules & Capabilities

### 1. 🐃 Buffalo Lifecycle Management
- **Detailed Registration**: Buffalo ID (e.g. `BFL-001`), tag number, photo, breed (*Murrah, Nili-Ravi, Jaffarabadi, Mehsana, Surti, Banni*), age, purchase price, supplier, lactation, milk yield, and health vitals.
- **7 Lifecycle Status Categories**: `Active`, `Pregnant`, `Lactating`, `Dry period`, `Not pregnant`, `Under treatment`, `Retired`.
- **Individual Buffalo Profile**: Basic information, breeding history, health records, daily morning/evening milk production, and an **organized chronological timeline** of lifetime events.

### 2. 🧬 Buffalo Breeding & Pregnancy Tracking
- **Permanent Insemination Records**: Semen straw ID, bull breed lineage, batch number, technician name, clinic, cost, and remarks with support for multiple attempts without overwriting.
- **Configurable Gestation & Delivery Estimation**: Configurable 310-day buffalo gestation period. Displays estimated calving dates with full veterinarian editability.
- **Visual Pregnancy Timeline**: Progress indicator tracking stages: *Insemination → Exam → Confirmation → Monitoring → Expected Calving → Calving*.
- **Automated Calving Workflow**: Recording a delivery automatically:
  1. Updates the buffalo's calving history and lactation number.
  2. Updates pregnancy status to `Delivered`.
  3. Registers the newborn calf profile in the Calf Registry.
  4. Links the calf to its mother.
  5. Updates herd statistics.
  6. Schedules the calf's first deworming.
  7. Preserves all historical breeding records.

### 3. 🐄 Dedicated Calf Management (Pediatric Module)
- **Isolated Calf Directory**: Kept completely distinct from adult herd listings.
- **Periodic Weight Growth Monitoring**: Interactive **Recharts growth curves**, monthly weight gain tracking, and milestone logging.
- **Pediatric Feeding Log**: Tracks mother's milk, colostrum, concentrate calf starter, and green fodder rations.

### 4. 💊 Deworming Management & Automated SMS Gateway
- **Multi-Species Support**: Dedicated tracking for Buffaloes, Calves, and Cows.
- **Color-Coded Deworming Calendar**:
  - 🟢 **Green**: Completed
  - 🟡 **Yellow**: Due soon (within 7 days)
  - 🔴 **Red**: Overdue (requires immediate dosing)
  - ⚪ **Grey**: Future scheduled
- **Automated Multi-Interval SMS Alerts**:
  - Dispatches reminders: 7 days before, 3 days before, 1 day before, on scheduled due date, and daily overdue alerts.
  - Background scheduler (`node-cron`) checks schedules every 15 minutes without requiring the browser to stay open.
  - Strict deduplication prevents duplicate alerts on the same date.
  - Supports **MSG91** (India DLT), **Twilio**, and **Custom Webhook** gateways with verified failure logging (zero fake sending when keys are absent).

### 5. 🩺 Veterinary & Medication Billing
- **Clinical Medication Log**: Tracks disease issues, medicine categories, dosages, frequencies, and follow-up checkup appointments.
- **Itemized Veterinary Billing**: Medicine purchases, consultation fees, lab testing, injections, and emergency expenses.
- **Financial Integrity**: Medical bills affect total farm expenses **exactly once** (`farm_expenses` linkage with zero duplicate entries).
- **Animal-Wise Expenditure Report**: Identifies which animals require the highest medical expenditure to optimize herd ROI.

### 6. 📅 Complete Farm Health & Breeding Master Calendar
- Unified schedule with **Month**, **Week**, **Day**, and **Agenda List** views.
- Color-coded events across all livestock categories with click-through links to animal profiles.

### 7. 🔐 Admin Login & Role-Based Access Control (RBAC)
- **Premium Aesthetics**: Dark charcoal background (`#0b1120`), forest emerald green (`#10b981`), and luxury gold (`#f59e0b`) accents with glassmorphism.
- **Initial Setup Protection**: Initial authorized account registers the farm owner, locking public registration.
- **6 Configured Roles**:
  1. `Owner / Super Admin`: Full control over finances, customers, livestock, users, and SMS settings.
  2. `Farm Manager`: Daily operations, milk deliveries, livestock production, and inventory.
  3. `Accountant`: Investments, expenses, revenues, customer billing, and financial reports.
  4. `Veterinary Staff`: Buffalo & calf health, breeding, deworming, vaccines, and medical bills.
  5. `Farm Worker`: Daily feeding and milking tasks.
  6. `Read-only Viewer`: View-only access to authorized dashboards.
- **Audit Logging**: Comprehensive security audit trail recording user actions.

---

## 🔑 Demo Account Credentials

| Role | Username | Password |
|---|---|---|
| **Owner / Super Admin** | `admin` | `admin123` |
| **Farm Manager** | `rajesh.mgr` | `manager123` |
| **Veterinary Doctor** | `dr.srinivas` | `vet123` |
| **Accountant** | `venkat.acc` | `admin123` |
| **Farm Worker** | `suresh.worker` | `admin123` |

---

## 🛠️ Project Structure

```
dairyflow/
├── backend/
│   ├── data/
│   │   └── dairyflow.json          # Persistent database file
│   ├── middleware/
│   │   └── auth.js                 # JWT verification & RBAC authorization
│   ├── uploads/                    # Receipts, prescriptions & animal photos
│   ├── db.js                       # Database engine with seed data
│   ├── server.js                   # Express REST API & Cron Scheduler
│   ├── smsService.js               # MSG91, Twilio & Webhook SMS gateway
│   ├── supabase_schema.sql         # PostgreSQL / Supabase migration schema
│   └── test-lifecycle.js           # 15-step automated verification suite
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components & Motivational banners
│   │   ├── context/                # AuthContext & role permissions
│   │   ├── pages/                  # Buffalo, Calf, Deworming, Vet, Calendar, Finance, SMS, Users
│   │   ├── services/api.ts         # Centralized API fetch wrapper
│   │   ├── types/index.ts          # TypeScript interfaces
│   │   ├── App.tsx                 # Main layout & router shell
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── package.json
```

---

## 🏃 Running the Application

### 1. Start the Backend API & Scheduler Server
```bash
npm run server
# DairyFlow Backend running on http://localhost:5000
# Background SMS & Deworming Scheduler: ACTIVE
```

### 2. Start the Frontend Development Server
```bash
npm run client
# Or: cd frontend && npm run dev
# Frontend accessible on http://localhost:5173
```

*(Note: In production mode, the backend automatically serves the built frontend directly from `http://localhost:5000`)*

---

## 🧪 Verification & Lifecycle Testing
To run the complete 15-step integration test:
```bash
node backend/test-lifecycle.js
```
Expected output:
```
================================================================
 🎉 ALL 15/15 LIFECYCLE & INTEGRATION VERIFICATION STEPS PASSED!
================================================================
```
