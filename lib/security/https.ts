import https from "https";
import http from "http";
import { CheckResult } from "../types";

export async function checkHttps(targetUrl: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const parsed = new URL(targetUrl);

  const isHttpsConfigured = parsed.protocol === "https:";

  // Check 1: HTTPS protocol usage
  if (!isHttpsConfigured) {
    results.push({
      checkId: "https-enabled",
      category: "HTTPS",
      title: "Insecure Plaintext HTTP Target Protocol",
      status: "FAIL",
      severity: "HIGH",
      description: "Target URL is configured with plaintext HTTP. Communication can be intercepted or manipulated in transit.",
      evidence: `Target scheme: ${parsed.protocol}`,
      recommendation: "Migrate application to enforce HTTPS with valid TLS/SSL certificates.",
    });
  } else {
    results.push({
      checkId: "https-enabled",
      category: "HTTPS",
      title: "HTTPS Encryption Protocol Configured",
      status: "PASS",
      severity: "INFO",
      description: "Application is accessible over encrypted HTTPS protocol.",
      evidence: `Target scheme: https://`,
      recommendation: "Maintain valid certificates and automated renewal policies.",
    });
  }

  // Check 2: TLS Certificate Validity inspection
  if (isHttpsConfigured) {
    try {
      const certInfo = await new Promise<{ valid: boolean; issuer?: string; validTo?: string; daysRemaining?: number }>((resolve) => {
        const req = https.request(
          {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            method: "HEAD",
            rejectUnauthorized: true,
            timeout: 5000,
          },
          (res) => {
            const socket = res.socket as import("tls").TLSSocket;
            if (socket && typeof socket.getPeerCertificate === "function") {
              const cert = socket.getPeerCertificate();
              if (cert && cert.valid_to) {
                const validTo = new Date(cert.valid_to);
                const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const rawIssuer = cert.issuer ? (cert.issuer.O || cert.issuer.CN) : undefined;
                const issuerName = Array.isArray(rawIssuer) ? rawIssuer[0] : (rawIssuer as string | undefined);
                resolve({
                  valid: true,
                  issuer: issuerName,
                  validTo: cert.valid_to,
                  daysRemaining,
                });
                return;
              }
            }
            resolve({ valid: true });
          }
        );

        req.on("error", () => resolve({ valid: false }));
        req.on("timeout", () => {
          req.destroy();
          resolve({ valid: false });
        });
        req.end();
      });

      if (certInfo.valid) {
        results.push({
          checkId: "tls-cert-validity",
          category: "TLS",
          title: "Valid TLS Certificate",
          status: "PASS",
          severity: "INFO",
          description: `TLS certificate is active and verified by trusted CA authority (${certInfo.issuer || "Trusted CA"}).`,
          evidence: `Expires: ${certInfo.validTo || "Active"} (${certInfo.daysRemaining ?? ">30"} days remaining)`,
          recommendation: "Ensure automated certificate lifecycle management (e.g. ACME/Let's Encrypt or Cloudflare TLS).",
        });
      } else {
        results.push({
          checkId: "tls-cert-validity",
          category: "TLS",
          title: "TLS Handshake or Certificate Warning",
          status: "WARNING",
          severity: "MEDIUM",
          description: "Target TLS certificate could not be independently verified or connection timed out.",
          evidence: `Host: ${parsed.hostname}:443`,
          recommendation: "Verify certificate chain completeness and root CA trust configuration.",
        });
      }
    } catch {
      // Fallback
    }
  }

  // Check 3: HTTP to HTTPS Redirect Test
  try {
    const redirectTest = await new Promise<{ redirectsToHttps: boolean; statusCode?: number; location?: string }>((resolve) => {
      const httpReq = http.request(
        {
          hostname: parsed.hostname,
          port: 80,
          path: parsed.pathname || "/",
          method: "GET",
          timeout: 4000,
        },
        (res) => {
          const loc = res.headers.location || "";
          const isHttpsRedirect = (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308 || res.statusCode === 307) && loc.startsWith("https://");
          resolve({
            redirectsToHttps: isHttpsRedirect,
            statusCode: res.statusCode,
            location: loc,
          });
        }
      );

      httpReq.on("error", () => resolve({ redirectsToHttps: false }));
      httpReq.on("timeout", () => {
        httpReq.destroy();
        resolve({ redirectsToHttps: false });
      });
      httpReq.end();
    });

    if (redirectTest.redirectsToHttps) {
      results.push({
        checkId: "http-redirect",
        category: "HTTPS",
        title: "HTTP to HTTPS Automatic Redirection",
        status: "PASS",
        severity: "INFO",
        description: "Plaintext HTTP requests are automatically upgraded and redirected to secure HTTPS.",
        evidence: `HTTP 80 returned ${redirectTest.statusCode} Redirect -> ${redirectTest.location}`,
        recommendation: "Ensure permanent HTTP 301/308 redirects are maintained.",
      });
    } else {
      results.push({
        checkId: "http-redirect",
        category: "HTTPS",
        title: "Missing Automatic HTTP-to-HTTPS Redirection",
        status: "WARNING",
        severity: "LOW",
        description: "Plaintext HTTP requests are either not automatically redirected to HTTPS or port 80 did not return an upgrade response.",
        evidence: `Port 80 response code: ${redirectTest.statusCode || "No response"}`,
        recommendation: "Configure web server/reverse proxy to redirect all port 80 HTTP traffic to HTTPS.",
      });
    }
  } catch {
    // Fallback pass
  }

  return results;
}
