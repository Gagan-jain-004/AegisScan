# aegisscan-node

> Official lightweight Node.js SDK for **AegisScan** — Web Application Security Telemetry & SOC Ingestion Platform.

[![npm version](https://img.shields.io/npm/v/aegisscan-node.svg?color=0284c7)](https://www.npmjs.com/package/aegisscan-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

`aegisscan-node` enables backend applications (Express, Next.js, Fastify, NestJS) to stream defensive security telemetry, failed authentications, privilege escalations, suspicious payloads, and rate limit triggers directly into your **AegisScan SOC Engine** with zero performance overhead.

---

## 📦 Installation

```bash
npm install aegisscan-node
```

or with yarn / pnpm / bun:

```bash
yarn add aegisscan-node
pnpm add aegisscan-node
bun add aegisscan-node
```

---

## 🚀 Quick Start

### 1. Initialize the Client

```javascript
// CommonJS
const { AegisScan } = require("aegisscan-node");

// or ES Modules / TypeScript
import { AegisScan } from "aegisscan-node";

const security = new AegisScan({
  apiKey: process.env.AEGISSCAN_API_KEY, // Or pass your Project API Key from AegisScan Dashboard
  endpoint: "https://your-aegisscan-domain.com" // Defaults to http://localhost:3000
});
```

---

## 🛡️ Usage Examples

### 1. Track Failed Login (Brute-Force & Credential Stuffing Detection)

Send telemetry whenever an authentication attempt fails. AegisScan's correlation engine automatically detects brute-force attacks and spikes.

```javascript
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  if (!user) {
    // 🚨 Report failed login to AegisScan SOC
    await security.loginFailed({
      userId: email,
      sourceIp: req.ip || req.headers["x-forwarded-for"],
      endpoint: "/api/auth/login",
      metadata: { reason: "invalid_credentials" }
    });

    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Report successful login
  await security.loginSuccess({
    userId: user.id,
    sourceIp: req.ip,
    endpoint: "/api/auth/login"
  });

  return res.json({ token: "jwt-token" });
});
```

---

### 2. Detect Unauthorized & Privilege Escalation (BOLA / IDOR)

Report unauthorized attempts to access protected or administrative endpoints.

```javascript
// In your authorization middleware
if (user.role !== "ADMIN") {
  await security.unauthorizedAccess({
    userId: user.id,
    sourceIp: req.ip,
    endpoint: req.originalUrl,
    metadata: { requiredRole: "ADMIN", userRole: user.role }
  });

  return res.status(403).json({ error: "Forbidden" });
}
```

---

### 3. Log Suspicious WAF / Injection Requests

Catch SQL injection probes, XSS payloads, or traversal patterns in request query params/bodies:

```javascript
await security.suspiciousRequest({
  userId: req.user?.id,
  sourceIp: req.ip,
  endpoint: req.originalUrl,
  metadata: {
    matchedPattern: "SQLi_UNION_SELECT",
    payload: req.query.search
  }
});
```

---

### 4. Rate Limit Bursts

When your API rate limiter trips for a suspicious IP:

```javascript
await security.rateLimitTriggered({
  sourceIp: req.ip,
  endpoint: req.path,
  metadata: { limit: 100, windowMs: 60000 }
});
```

---

## 📚 API Reference

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `security.loginFailed(data)` | `{ userId?, sourceIp?, endpoint?, metadata? }` | Reports a failed authentication attempt. |
| `security.loginSuccess(data)` | `{ userId?, sourceIp?, endpoint?, metadata? }` | Reports a successful authentication event. |
| `security.unauthorizedAccess(data)` | `{ userId?, sourceIp?, endpoint?, metadata? }` | Flags a 401/403 access control violation. |
| `security.adminAccess(data)` | `{ userId?, sourceIp?, endpoint?, metadata? }` | Logs administrative privilege usage. |
| `security.rateLimitTriggered(data)` | `{ sourceIp?, endpoint?, metadata? }` | Logs a 429 rate limit violation. |
| `security.suspiciousRequest(data)` | `{ sourceIp?, endpoint?, metadata? }` | Reports detected malicious payloads or scan signatures. |
| `security.sendEvent(eventData)` | `{ type, userId?, sourceIp?, endpoint?, metadata? }` | Generic telemetry ingestion dispatcher. |

---

## ⚙️ Configuration Options

```typescript
interface AegisScanOptions {
  apiKey?: string;    // AegisScan Project API Key (falls back to process.env.AEGISSCAN_API_KEY)
  endpoint?: string;  // Base URL of your AegisScan server (defaults to http://localhost:3000)
}
```

---

## 📄 License

MIT © [AegisScan](https://github.com/aegisscan)
