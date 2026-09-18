import { CheckResult } from "../types";

export function checkSecurityHeaders(headers: Record<string, string | string[] | undefined>): CheckResult[] {
  const results: CheckResult[] = [];

  const getHeader = (name: string): string | undefined => {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) return undefined;
    const val = headers[key];
    return Array.isArray(val) ? val.join("; ") : val;
  };

  // 1. Content-Security-Policy
  const csp = getHeader("Content-Security-Policy");
  if (csp) {
    results.push({
      checkId: "security-header-csp",
      category: "HEADERS",
      title: "Content-Security-Policy (CSP) Configured",
      status: "PASS",
      severity: "INFO",
      description: "Content Security Policy is defined to control resource execution and mitigate XSS.",
      evidence: `Content-Security-Policy: ${csp.substring(0, 150)}${csp.length > 150 ? "..." : ""}`,
      recommendation: "Regularly review CSP directives to eliminate 'unsafe-inline' and 'unsafe-eval' where possible.",
    });
  } else {
    results.push({
      checkId: "security-header-csp",
      category: "HEADERS",
      title: "Content Security Policy (CSP) is Missing",
      status: "FAIL",
      severity: "HIGH",
      description: "The HTTP Content-Security-Policy header is absent. Without a restrictive CSP, the application lacks an essential defense-in-depth barrier against XSS and data exfiltration.",
      evidence: "Header 'Content-Security-Policy' was not present in the HTTP response.",
      recommendation: "Define an appropriate Content-Security-Policy restricting script-src, object-src, and frame-ancestors according to application needs.",
    });
  }

  // 2. Strict-Transport-Security (HSTS)
  const hsts = getHeader("Strict-Transport-Security");
  if (hsts) {
    const hasSubdomains = hsts.toLowerCase().includes("includesubdomains");
    const hasPreload = hsts.toLowerCase().includes("preload");
    const match = hsts.match(/max-age=(\d+)/i);
    const maxAge = match ? parseInt(match[1], 10) : 0;

    if (maxAge >= 15768000 && hasSubdomains) {
      results.push({
        checkId: "security-header-hsts",
        category: "HEADERS",
        title: "Strict-Transport-Security (HSTS) Fully Configured",
        status: "PASS",
        severity: "INFO",
        description: "HSTS is enabled with a high max-age and includeSubDomains directive.",
        evidence: `Strict-Transport-Security: ${hsts}`,
        recommendation: "Consider submitting to the HSTS preload list if eligible.",
      });
    } else {
      results.push({
        checkId: "security-header-hsts",
        category: "HEADERS",
        title: "Strict-Transport-Security (HSTS) Incomplete Directives",
        status: "WARNING",
        severity: "MEDIUM",
        description: "HSTS header is present but lacks either sufficient max-age (> 6 months) or the 'includeSubDomains' directive.",
        evidence: `Strict-Transport-Security: ${hsts}`,
        recommendation: "Configure `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.",
      });
    }
  } else {
    results.push({
      checkId: "security-header-hsts",
      category: "HEADERS",
      title: "Strict-Transport-Security (HSTS) Header Missing",
      status: "FAIL",
      severity: "MEDIUM",
      description: "HSTS header is absent. Browsers will not automatically enforce encrypted HTTPS connections on subsequent visits.",
      evidence: "Header 'Strict-Transport-Security' was not present in the HTTP response.",
      recommendation: "Add Strict-Transport-Security header with max-age of at least 31536000 seconds (1 year).",
    });
  }

  // 3. X-Content-Type-Options
  const xcto = getHeader("X-Content-Type-Options");
  if (xcto && xcto.toLowerCase().includes("nosniff")) {
    results.push({
      checkId: "security-header-xcto",
      category: "HEADERS",
      title: "X-Content-Type-Options Enforced",
      status: "PASS",
      severity: "INFO",
      description: "MIME type sniffing prevention is properly configured with 'nosniff'.",
      evidence: `X-Content-Type-Options: ${xcto}`,
      recommendation: "Keep 'nosniff' configured across all static and dynamic responses.",
    });
  } else {
    results.push({
      checkId: "security-header-xcto",
      category: "HEADERS",
      title: "X-Content-Type-Options Missing or Incomplete",
      status: "FAIL",
      severity: "LOW",
      description: "Missing 'X-Content-Type-Options: nosniff'. Browsers may attempt MIME-type sniffing, which can lead to unexpected script execution of uploaded files.",
      evidence: `Current value: ${xcto || "Not configured"}`,
      recommendation: "Set `X-Content-Type-Options: nosniff` on all HTTP responses.",
    });
  }

  // 4. X-Frame-Options / Frame Ancestors
  const xfo = getHeader("X-Frame-Options");
  if (xfo || (csp && csp.includes("frame-ancestors"))) {
    results.push({
      checkId: "security-header-xfo",
      category: "HEADERS",
      title: "Clickjacking Protection Configured",
      status: "PASS",
      severity: "INFO",
      description: "Framing protection is enforced via X-Frame-Options or CSP frame-ancestors directive.",
      evidence: xfo ? `X-Frame-Options: ${xfo}` : "CSP frame-ancestors defined",
      recommendation: "Prefer CSP frame-ancestors over legacy X-Frame-Options for modern clients.",
    });
  } else {
    results.push({
      checkId: "security-header-xfo",
      category: "HEADERS",
      title: "Clickjacking Protection Not Enforced",
      status: "FAIL",
      severity: "MEDIUM",
      description: "The application does not set X-Frame-Options (DENY/SAMEORIGIN) or CSP frame-ancestors, leaving pages potentially embeddable in malicious iframes.",
      evidence: "Neither 'X-Frame-Options' nor 'frame-ancestors' detected in response headers.",
      recommendation: "Set `X-Frame-Options: SAMEORIGIN` or CSP `frame-ancestors 'self'`.",
    });
  }

  // 5. Referrer-Policy
  const refPolicy = getHeader("Referrer-Policy");
  if (refPolicy) {
    results.push({
      checkId: "security-header-referrer",
      category: "HEADERS",
      title: "Referrer-Policy Defined",
      status: "PASS",
      severity: "INFO",
      description: "Referrer policy is configured to prevent leaking internal URLs and parameters to third-party domains.",
      evidence: `Referrer-Policy: ${refPolicy}`,
      recommendation: "Use `strict-origin-when-cross-origin` or `no-referrer` for maximum privacy.",
    });
  } else {
    results.push({
      checkId: "security-header-referrer",
      category: "HEADERS",
      title: "Referrer-Policy Header Missing",
      status: "WARNING",
      severity: "LOW",
      description: "Referrer-Policy is not explicitly defined. Browsers default behavior may leak paths in referer headers during outbound navigation.",
      evidence: "Header 'Referrer-Policy' was not present in the HTTP response.",
      recommendation: "Add `Referrer-Policy: strict-origin-when-cross-origin`.",
    });
  }

  // 6. Permissions-Policy
  const permPolicy = getHeader("Permissions-Policy");
  if (permPolicy) {
    results.push({
      checkId: "security-header-permissions",
      category: "HEADERS",
      title: "Permissions-Policy Configured",
      status: "PASS",
      severity: "INFO",
      description: "Browser feature delegations (camera, microphone, geolocation) are restricted via Permissions-Policy.",
      evidence: `Permissions-Policy: ${permPolicy.substring(0, 100)}...`,
      recommendation: "Regularly audit permitted origins for sensitive browser APIs.",
    });
  } else {
    results.push({
      checkId: "security-header-permissions",
      category: "HEADERS",
      title: "Permissions-Policy Not Configured",
      status: "INFO",
      severity: "LOW",
      description: "Permissions-Policy header is absent. It is recommended to explicitly disable unneeded browser features.",
      evidence: "Header 'Permissions-Policy' was not present.",
      recommendation: "Set `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`.",
    });
  }

  return results;
}
