import dns from "dns/promises";
import net from "net";

/**
 * Defensive SSRF Protection Utility:
 * Validates external target URLs to strictly prevent requests targeting:
 * - Localhost / Loopback (127.0.0.0/8, ::1)
 * - Private / RFC 1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Link-local / Cloud Metadata services (169.254.0.0/16, AWS/GCP 169.254.169.254)
 * - Internal broadcast / Multicast (224.0.0.0/4, 255.255.255.255)
 */

export interface SSRFValidationResult {
  isValid: boolean;
  resolvedIp?: string;
  error?: string;
}

export function isPrivateOrReservedIP(ip: string): boolean {
  if (!net.isIP(ip)) return true;

  if (ip === "::1" || ip === "0.0.0.0" || ip.startsWith("fe80:") || ip.startsWith("fc00:") || ip.startsWith("fd00:")) {
    return true;
  }

  // Parse IPv4 octets
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local & Cloud metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 0.0.0.0/8
  if (a === 0) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  return false;
}

export async function validateTargetUrl(rawUrl: string): Promise<SSRFValidationResult> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      return { isValid: false, error: "Malformed or invalid target URL." };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Only HTTP and HTTPS assessment protocols are permitted." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block common local hostnames
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    ) {
      return { isValid: false, error: "Assessment of localhost and private network targets is prohibited." };
    }

    // Resolve DNS safely
    try {
      const lookup = await dns.lookup(hostname, { all: true });
      for (const record of lookup) {
        if (isPrivateOrReservedIP(record.address)) {
          return {
            isValid: false,
            resolvedIp: record.address,
            error: `Target host resolved to a prohibited private/reserved IP address: ${record.address}`,
          };
        }
      }
      return { isValid: true, resolvedIp: lookup[0]?.address };
    } catch (dnsErr: unknown) {
      const msg = dnsErr instanceof Error ? dnsErr.message : "DNS resolution failure";
      return { isValid: false, error: `Could not resolve target hostname: ${msg}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Validation error";
    return { isValid: false, error: msg };
  }
}
