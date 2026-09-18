import { CheckResult } from "../types";

export interface ParsedCookie {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string; // Lax, Strict, None, or Missing
}

export function parseSetCookieHeaders(cookieHeaders: string[] | string | undefined): ParsedCookie[] {
  if (!cookieHeaders) return [];
  const list = Array.isArray(cookieHeaders) ? cookieHeaders : [cookieHeaders];

  return list.map((cStr) => {
    const parts = cStr.split(";").map((p) => p.trim());
    const namePart = parts[0] || "";
    const name = namePart.split("=")[0] || "unnamed_cookie";

    let secure = false;
    let httpOnly = false;
    let sameSite = "Missing";

    for (let i = 1; i < parts.length; i++) {
      const pLower = parts[i].toLowerCase();
      if (pLower === "secure") secure = true;
      if (pLower === "httponly") httpOnly = true;
      if (pLower.startsWith("samesite=")) {
        sameSite = parts[i].split("=")[1] || "Missing";
      }
    }

    return { name, secure, httpOnly, sameSite };
  });
}

export function checkCookieSecurity(cookieHeaders: string[] | string | undefined): CheckResult[] {
  const results: CheckResult[] = [];
  const cookies = parseSetCookieHeaders(cookieHeaders);

  if (cookies.length === 0) {
    results.push({
      checkId: "cookie-security-none",
      category: "COOKIES",
      title: "No Session Cookies Set on Root Response",
      status: "INFO",
      severity: "INFO",
      description: "Initial target landing page response did not transmit any Set-Cookie headers.",
      evidence: "Set-Cookie headers absent on target index response.",
      recommendation: "Ensure cookies issued during login flows enforce Secure, HttpOnly, and SameSite flags.",
    });
    return results;
  }

  for (const cookie of cookies) {
    // Check Secure flag
    if (!cookie.secure) {
      results.push({
        checkId: `cookie-secure-${cookie.name}`,
        category: "COOKIES",
        title: `Cookie '${cookie.name}' Lacks 'Secure' Flag`,
        status: "FAIL",
        severity: "HIGH",
        description: `Cookie '${cookie.name}' is transmitted without the Secure attribute, allowing it to be leaked over unencrypted connections.`,
        evidence: `Cookie name: ${cookie.name} | Flags: HttpOnly=${cookie.httpOnly}, SameSite=${cookie.sameSite}`,
        recommendation: `Add 'Secure' attribute to all cookies issued over HTTPS.`,
      });
    }

    // Check HttpOnly flag
    if (!cookie.httpOnly) {
      results.push({
        checkId: `cookie-httponly-${cookie.name}`,
        category: "COOKIES",
        title: `Cookie '${cookie.name}' Lacks 'HttpOnly' Flag`,
        status: "WARNING",
        severity: "MEDIUM",
        description: `Cookie '${cookie.name}' is accessible to client-side JavaScript, increasing vulnerability to credential theft if XSS is present.`,
        evidence: `Cookie name: ${cookie.name} | Flags: Secure=${cookie.secure}, SameSite=${cookie.sameSite}`,
        recommendation: `Set 'HttpOnly' flag for session and authentication tokens.`,
      });
    }

    // Check SameSite attribute
    if (cookie.sameSite === "Missing" || cookie.sameSite.toLowerCase() === "none") {
      results.push({
        checkId: `cookie-samesite-${cookie.name}`,
        category: "COOKIES",
        title: `Cookie '${cookie.name}' Has Insecure SameSite Policy`,
        status: "WARNING",
        severity: "MEDIUM",
        description: `Cookie '${cookie.name}' has SameSite=${cookie.sameSite}, providing insufficient defense against Cross-Site Request Forgery (CSRF).`,
        evidence: `Cookie name: ${cookie.name} | SameSite: ${cookie.sameSite}`,
        recommendation: `Configure SameSite=Lax or SameSite=Strict on all stateful session cookies.`,
      });
    }

    if (cookie.secure && cookie.httpOnly && (cookie.sameSite.toLowerCase() === "lax" || cookie.sameSite.toLowerCase() === "strict")) {
      results.push({
        checkId: `cookie-healthy-${cookie.name}`,
        category: "COOKIES",
        title: `Cookie '${cookie.name}' Fully Hardened`,
        status: "PASS",
        severity: "INFO",
        description: `Cookie '${cookie.name}' has Secure, HttpOnly, and SameSite=${cookie.sameSite} enabled.`,
        evidence: `Cookie name: ${cookie.name} | Secure ✓ | HttpOnly ✓ | SameSite ${cookie.sameSite} ✓`,
        recommendation: "Maintain hardened cookie configurations.",
      });
    }
  }

  return results;
}
