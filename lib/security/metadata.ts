import { CheckResult } from "../types";
import { validateTargetUrl } from "./ssrf";

export async function checkMetadataAndDisclosure(
  targetUrl: string,
  headers: Record<string, string | string[] | undefined>
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const parsed = new URL(targetUrl);

  const getHeader = (name: string): string | undefined => {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) return undefined;
    const val = headers[key];
    return Array.isArray(val) ? val.join("; ") : val;
  };

  // 1. Server Header Banner Disclosure
  const server = getHeader("Server");
  if (server) {
    const hasVersion = /\d+\.\d+/.test(server);
    if (hasVersion) {
      results.push({
        checkId: "metadata-server-version",
        category: "METADATA",
        title: "Server Version Banner Disclosure",
        status: "WARNING",
        severity: "LOW",
        description: `The web server discloses its software and version number in the Server header (${server}), which helps adversaries map specific known CVEs.`,
        evidence: `Server: ${server}`,
        recommendation: "Disable server version tokens in web server or reverse proxy configuration.",
      });
    } else {
      results.push({
        checkId: "metadata-server-banner",
        category: "METADATA",
        title: "Generic Server Header Present",
        status: "INFO",
        severity: "INFO",
        description: `Server header is present without revealing exact software version.`,
        evidence: `Server: ${server}`,
        recommendation: "Consider completely suppressing the Server header if not required.",
      });
    }
  }

  // 2. X-Powered-By Technology Leak
  const poweredBy = getHeader("X-Powered-By");
  if (poweredBy) {
    results.push({
      checkId: "metadata-x-powered-by",
      category: "METADATA",
      title: "Technology Stack Disclosed via 'X-Powered-By'",
      status: "WARNING",
      severity: "LOW",
      description: `The application leaks backend runtime or framework details via 'X-Powered-By: ${poweredBy}'.`,
      evidence: `X-Powered-By: ${poweredBy}`,
      recommendation: "Suppress the 'X-Powered-By' header in framework settings (e.g. `app.disable('x-powered-by')` or `poweredByHeader: false` in next.config).",
    });
  }

  // 3. Security.txt (RFC 9116)
  try {
    const secTxtUrl = `${parsed.origin}/.well-known/security.txt`;
    const ssrfCheck = await validateTargetUrl(secTxtUrl);
    if (ssrfCheck.isValid) {
      const resp = await fetch(secTxtUrl, { method: "GET", signal: AbortSignal.timeout(3000) });
      if (resp.status === 200) {
        const text = await resp.text();
        if (text.toLowerCase().includes("contact:")) {
          results.push({
            checkId: "metadata-security-txt",
            category: "METADATA",
            title: "security.txt Policy Published (RFC 9116)",
            status: "PASS",
            severity: "INFO",
            description: "A standard security vulnerability disclosure policy is published at /.well-known/security.txt.",
            evidence: `Found Contact directive in /.well-known/security.txt`,
            recommendation: "Keep security.txt expiration date updated.",
          });
        }
      } else {
        results.push({
          checkId: "metadata-security-txt-missing",
          category: "METADATA",
          title: "security.txt File Not Found (RFC 9116)",
          status: "INFO",
          severity: "INFO",
          description: "No standard security disclosure file found at /.well-known/security.txt.",
          evidence: `GET /.well-known/security.txt -> ${resp.status}`,
          recommendation: "Publish a security.txt file to provide security researchers with an authorized reporting channel.",
        });
      }
    }
  } catch {
    // Non-critical network error
  }

  return results;
}
