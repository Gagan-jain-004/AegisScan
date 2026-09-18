# AegisScan — Web Application Security Monitoring & Assessment Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS%20%26%20SOC%20Design-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![npm version](https://img.shields.io/npm/v/aegisscan-node.svg?color=0284c7&logo=npm)](https://www.npmjs.com/package/aegisscan-node)

AegisScan is an **enterprise-grade, authorized Web Application Security Monitoring & Assessment Platform** designed for developers, DevOps teams, and security engineers.

---

## 1. Core Architecture & Philosophy

AegisScan operates as a **strictly defensive cybersecurity product**:
1. **Target Authorization Required**: Explicit user confirmation is required before running external scans.
2. **SSRF Guard Protection**: Built-in IP sanitization and DNS validation prevents requests against `localhost`, RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
3. **Passive & Non-Destructive**: All posture checks analyze publicly observable transport configurations, TLS validity, and HTTP response headers without destructive payloads.
4. **Real-Time Telemetry Correlation**: Ingests security event streams from connected web applications and automatically detects anomalies (brute force, auth sequences, SQLi/XSS probe signatures).

---

## 2. Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Next.js Route Handlers, Node.js, Zod Validation, Cryptographic SHA-256 Hashing
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk Authentication with secure session management
- **Reporting**: High-fidelity Executive Security Reports (Printable / PDF)
- **Developer SDK**: [`aegisscan-node`](https://www.npmjs.com/package/aegisscan-node) on npm

---

## 3. Database Architecture (PostgreSQL)

- `UserProfile`: Synchronized user profile with admin access.
- `Project`: Registered target application scopes with ownership verification.
- `Assessment`: Historical posture scans, security scores (0-100), and check counts.
- `Finding`: Cataloged posture vulnerabilities with evidence and remediation guides.
- `SecurityEvent`: Real-time ingested authentication and request telemetry logs.
- `Incident`: Correlated threat alerts (brute force, SQLi probes, rate-limit bursts).
- `ApiKey`: Cryptographically hashed SHA-256 keys (`aeg_live_...`) with one-time display.
- `AuditLog`: Immutable audit trail tracking administrative and triage actions.
- `Report`: Formal executive security assessment summary records.

---

## 4. Getting Started

### Local Setup with PostgreSQL

1. **Clone and Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your local PostgreSQL database URL:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aegisscan?schema=public"
   ```

3. **Start PostgreSQL with Docker (Optional)**:
   ```bash
   docker compose up -d postgres
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access AegisScan.

---

## 5. Security Assessment Engine Modules

Located in `lib/security/`:
- `ssrf.ts`: Strict DNS lookup & private IP rejection filter.
- `https.ts`: HTTPS enforcement and TLS certificate validity checks.
- `headers.ts`: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy evaluation.
- `cookies.ts`: Safe inspection of `Secure`, `HttpOnly`, and `SameSite` attributes.
- `redirects.ts`: Max-hop tracer for HTTP-to-HTTPS upgrade chains.
- `metadata.ts`: Passive inspection of `robots.txt`, `security.txt` (RFC 9116), and server banners.
- `score.ts`: Weighted 0-100 scoring algorithm across categories.

---

## 6. Defensive Threat Detection Engine

Located in `lib/detection/`:
- `bruteForce.ts`: Identifies surges of >5 failed login events in 60 seconds from the same IP/account.
- `authAnomaly.ts`: Detects authentication sequences where repeated failures precede privilege escalation.
- `suspiciousRequest.ts`: Intercepts SQL injection and XSS regex payload patterns in query telemetry without executing them.
- `accessControl.ts`: Detects bursts of HTTP 401/403 unauthorized access probing.
- `rateLimit.ts`: Flags persistent rate-limit trigger bursts.

---

## 7. Developer SDK ([`aegisscan-node`](https://www.npmjs.com/package/aegisscan-node))

Install the lightweight client library from [npm registry](https://www.npmjs.com/package/aegisscan-node):
```bash
npm install aegisscan-node
```

Usage in your backend auth routes:
```javascript
const { AegisScan } = require("aegisscan-node");

const security = new AegisScan({
  apiKey: process.env.AEGISSCAN_API_KEY,
  endpoint: "http://localhost:3000"
});

// Report a failed login attempt
await security.loginFailed({
  userId: "admin@domain.com",
  sourceIp: req.ip,
  endpoint: "/api/auth/login"
});
```

---

## 8. Responsible Use & Legal Notice

AegisScan is built solely for authorized security assessment, posture evaluation, and defensive telemetry monitoring. It does not perform destructive actions, bypass authentication, or facilitate unauthorized penetration.
