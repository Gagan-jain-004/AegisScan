import { describe, it, expect } from "vitest";
import { checkSecurityHeaders } from "../lib/security/headers";
import { detectBruteForce } from "../lib/detection/bruteForce";
import { detectSuspiciousRequest } from "../lib/detection/suspiciousRequest";
import { generateApiKey, hashApiKey, verifyApiKey } from "../lib/api-keys";
import { SecurityEvent } from "../lib/types";

describe("Security Headers Assessment Engine", () => {
  it("should detect missing Content-Security-Policy header", () => {
    const results = checkSecurityHeaders({});
    const cspCheck = results.find((r) => r.checkId === "security-header-csp");
    expect(cspCheck?.status).toBe("FAIL");
    expect(cspCheck?.severity).toBe("HIGH");
  });

  it("should pass when HSTS and CSP are configured", () => {
    const results = checkSecurityHeaders({
      "content-security-policy": "default-src 'self'",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    });

    const csp = results.find((r) => r.checkId === "security-header-csp");
    const hsts = results.find((r) => r.checkId === "security-header-hsts");
    const xcto = results.find((r) => r.checkId === "security-header-xcto");

    expect(csp?.status).toBe("PASS");
    expect(hsts?.status).toBe("PASS");
    expect(xcto?.status).toBe("PASS");
  });
});

describe("Defensive Threat Detection Rules", () => {
  it("should trigger brute force alert on rapid failed logins", () => {
    const incoming: SecurityEvent = {
      id: "evt_test",
      projectId: "proj_1",
      type: "LOGIN_FAILED",
      severity: "HIGH",
      sourceIp: "198.51.100.42",
      timestamp: new Date().toISOString(),
    };

    const priorEvents: SecurityEvent[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `evt_prior_${i}`,
      projectId: "proj_1",
      type: "LOGIN_FAILED",
      severity: "HIGH",
      sourceIp: "198.51.100.42",
      timestamp: new Date(Date.now() - 1000 * (i + 1)).toISOString(),
    }));

    const result = detectBruteForce(incoming, priorEvents);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("HIGH");
  });

  it("should detect SQL injection signatures in query telemetry", () => {
    const incoming: SecurityEvent = {
      id: "evt_sqli",
      projectId: "proj_1",
      type: "SUSPICIOUS_REQUEST",
      severity: "MEDIUM",
      endpoint: "/api/search?q=' OR 1=1--",
      timestamp: new Date().toISOString(),
    };

    const result = detectSuspiciousRequest(incoming);
    expect(result.triggered).toBe(true);
    expect(result.severity).toBe("CRITICAL");
  });
});

describe("API Key Hashing & Verification", () => {
  it("should generate prefix and cryptographically verify raw key against hash", () => {
    const { rawKey, keyPrefix, hashedKey } = generateApiKey();
    expect(rawKey.startsWith("aeg_live_")).toBe(true);
    expect(keyPrefix.startsWith("aeg_live_")).toBe(true);
    expect(verifyApiKey(rawKey, hashedKey)).toBe(true);
    expect(verifyApiKey("aeg_live_invalid_key", hashedKey)).toBe(false);
  });
});
