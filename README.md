# Angren Ixtisoslashtirilgan Maktabi — House System Platform

The official digital competition and house championship platform for **Angren Specialized School** (*Angren Ixtisoslashtirilgan Maktabi*), powering the academic, athletic, intellectual, and civic rivalry between **Astra House** and **Terra House**.

---

## Features

- **Real-Time Dual Rivalry Battle Arena**: Live house leaderboard tracking scores, score margins, and leader status.
- **Strict Scoring Derivation**: House totals are mathematically calculated from verified event transactions with permanent audit trails.
- **Multi-Tier Verification & Anti-Abuse**: Two-step approval workflow with anti-self-approval blocks.
- **Student Honor Roll & MVP Roster**: Detailed student directories, grade-level filters, and individual contribution histories.
- **Competitions & Fixtures**: Registration workflows, participant rosters, match schedules, and podium results.
- **Bilingual Experience (UZ / EN)**: 100% pure Uzbek or English across all pages, navigation, badges, and components.
- **Responsive Mobile First UX**: Optimized for all devices from 360px mobile viewports to desktop monitors.
- **Administrative Back-Office**: Point requests, CSV roster imports, student house transfers/archivals, and audit logs.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19 & TypeScript
- **Styling**: Curated Vanilla CSS Design System with custom dark glassmorphism and tokens
- **Database**: PostgreSQL (Supabase Cloud) with Prisma ORM
- **Authentication**: Signed JWT with HTTP-only cookies and role-based access control (RBAC)

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database

### 2. Configuration
Copy the environment template and configure your database and authentication secrets:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL connection URL and JWT secret.

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Integrity Verification

Run the automated test suite verifying score calculation, point approvals, reversals, and anti-abuse safeguards:
```bash
npx tsx tests/system_integrity.test.ts
```

---

## License
Proprietary & Confidential &copy; 2026&ndash;2027 Angren Ixtisoslashtirilgan Maktabi. All rights reserved.
