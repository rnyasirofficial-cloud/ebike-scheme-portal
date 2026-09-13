# Chief Minister Punjab E-Bike Scheme Portal

A production-grade, full-stack government web application for the **Government of the Punjab Green Transport Initiative for Students**. The platform enables regular, on-campus students across Punjab to apply for, track, and receive subsidized/loan-financed electric bikes with automated eligibility verification, transparent e-balloting, and dealer handover tracking.

---

## Architecture & Technology Stack

- **Frontend (`apps/web`)**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend (`apps/api`)**: Node.js + Express REST API (TypeScript), Prisma ORM, JWT authentication with RBAC, Multer document uploads.
- **Database**: SQLite for instant zero-dependency local development (`dev.db`), PostgreSQL container configuration for production (`docker-compose.yml` & `schema.postgresql.prisma`).
- **Design System**: Mandatory Green + Blue Government Identity:
  - `--color-green: #1FA37B` (Eco Green)
  - `--color-blue: #1565C0` (Trust Blue)
  - `--color-teal: #0E8C82` (Primary Blended)
  - `--gradient-primary: linear-gradient(135deg, #1FA37B 0%, #0E8C82 45%, #1565C0 100%)`
  - `--gradient-bg-soft: linear-gradient(160deg, #E4F5F1 0%, #EAF3F8 50%, #E8F0FB 100%)`
- **Testing**: Vitest unit test suite for the 9 statutory eligibility rules, Playwright end-to-end integration tests.

---

## 9 Statutory Eligibility Criteria

The portal encodes the following rules in `apps/api/src/services/eligibility.service.ts`:

1. **Age ≥ 18**: Verified against applicant's CNIC / B-Form date of birth (`AGE_BELOW_18`).
2. **Valid CNIC / B-Form**: Verified against mock NADRA Verisys interface (`INVALID_NADRA_CNIC`).
3. **Punjab Domicile**: Verified against uploaded certificate and district record (`NON_PUNJAB_DOMICILE`).
4. **Motorcycle Driving License**: Valid learner's permit or permanent license verified via mock Punjab Excise & Taxation database (`INVALID_DRIVING_LICENSE`).
5. **Regular Student Enrollment**: Must be an actively enrolled on-campus student; distance learning is strictly ineligible (`NON_REGULAR_STUDENT`).
6. **HEC-Recognized Punjab Institution**: University must be in the synchronized Punjab HEC registry with `hecRecognized = true` (`UNRECOGNIZED_HEC_INSTITUTION`).
7. **Good Academic Standing**: No active academic probation and minimum 75% attendance rate attested by coordinator (`ACADEMIC_PROBATION_FAILED`).
8. **One Bike per CNIC**: System de-duplication check ensuring applicant has not previously received a scheme bike (`DUPLICATE_BENEFICIARY_CNIC`).
9. **Active Bank Account / Mobile Wallet**: Valid Pakistani IBAN or registered JazzCash/Easypaisa mobile wallet (`INVALID_FINANCIAL_ACCOUNT`).

---

## Quick Start & Setup

### Prerequisites
- Node.js v18+ (Tested on v24)
- npm v9+

### 1. Install Dependencies
```bash
# In the root ebike-scheme-portal directory:
npm install
```

### 2. Configure Environment Variables
Create `.env` in `apps/api`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="ebike_punjab_gov_jwt_secret_key_2026_super_secure"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

Create `.env.local` in `apps/web`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 3. Initialize & Seed Database
Seeds 52 Punjab HEC-recognized universities (public and private sectors) and 4 role demo accounts:
```bash
cd apps/api
npx prisma generate
npx prisma db push
npx tsx src/prisma/seed.ts
```

### 4. Run Development Servers
```bash
# Terminal 1: Run Express REST API (Port 5000)
npm run dev:api

# Terminal 2: Run Next.js Frontend (Port 3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts (1-Click Login Available)

| Role | Email / CNIC | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@punjab.gov.pk` / `35201-1234567-1` | `DemoPass123!` | Ali Raza (Roll# BSCS-2023-114, PU Lahore) |
| **Coordinator** | `coordinator@pu.edu.pk` | `DemoPass123!` | Prof. Dr. Tariq Mahmood (Univ. of the Punjab) |
| **Admin** | `admin@transport.punjab.gov.pk` | `AdminPass123!` | Muhammad Usman (Director Transport) |
| **Dealer** | `dealer@honda-ebikes.pk` | `DealerPass123!` | Metro E-Bikes Authorized Center (Lahore) |

---

## HEC University Sync & Import Tool

To keep the university directory up-to-date with HEC's official registry ([hec.gov.pk](https://www.hec.gov.pk/english/universities/pages/recognised.aspx)):

### Automatic Web Sync:
1. Log in as **Admin** at `/login` (using `admin@transport.punjab.gov.pk`).
2. Navigate to the **Admin Command Center** -> **HEC Directory** tab.
3. Click **"Sync from HEC Registry"**. The system fetches updates, logs results, and automatically falls back to the last-known-good directory if network interruptions occur.

### Manual CSV Upload Fallback:
1. On the same HEC Directory tab, choose a `.csv` file.
2. Required CSV column format:
   ```csv
   name,city,sector,province,hecRecognized
   University of Sialkot,Sialkot,Private,Punjab,true
   ```
3. Click **"Upload CSV"**. The importer updates or creates institution records and refreshes the student application dropdown.

---

## Running Automated Tests

### Unit Tests (Statutory Eligibility Rules)
Runs 10 unit tests validating all Section 4 rejection rules:
```bash
npm test --prefix apps/api
```

### Playwright End-to-End Test
Runs the full lifecycle happy path: Student Registration → 5-Step Application Wizard → Coordinator Attestation → Admin E-Balloting Draw → Selected Beneficiary Voucher:
```bash
npx playwright test
```
