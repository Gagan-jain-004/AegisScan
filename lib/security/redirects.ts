import { CheckResult } from "../types";
import { validateTargetUrl } from "./ssrf";

export interface RedirectStep {
  url: string;
  statusCode: number;
}

export interface RedirectChainResult {
  chain: RedirectStep[];
  finalUrl: string;
  tooManyRedirects: boolean;
  checks: CheckResult[];
}

export async function analyzeRedirects(initialUrl: string, maxHops = 5): Promise<RedirectChainResult> {
  const chain: RedirectStep[] = [];
  const checks: CheckResult[] = [];
  let currentUrl = initialUrl;
  let tooManyRedirects = false;

  for (let hop = 0; hop < maxHops; hop++) {
    // SSRF re-check on each redirect hop
    const ssrf = await validateTargetUrl(currentUrl);
    if (!ssrf.isValid) {
      checks.push({
        checkId: "redirect-ssrf-block",
        category: "HTTPS",
        title: "Redirect Target Destination Blocked (SSRF Protection)",
        status: "FAIL",
        severity: "CRITICAL",
        description: `Redirect hop attempted navigation to prohibited IP or private address: ${currentUrl}`,
        evidence: `Hop ${hop + 1} blocked: ${ssrf.error}`,
        recommendation: "Ensure application redirection logic validates destination hosts against whitelist.",
      });
      break;
    }

    try {
      const resp = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
      });

      chain.push({ url: currentUrl, statusCode: resp.status });

      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get("location");
        if (!location) break;

        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
      } else {
        break;
      }
    } catch {
      break;
    }

    if (hop === maxHops - 1) {
      tooManyRedirects = true;
    }
  }

  if (tooManyRedirects) {
    checks.push({
      checkId: "redirect-loop-limit",
      category: "HTTPS",
      title: "Excessive Redirect Hops Detected",
      status: "WARNING",
      severity: "LOW",
      description: `Redirect chain exceeded safe limit of ${maxHops} hops. This may degrade performance or indicate misconfigured routing loops.`,
      evidence: `Chain length: ${chain.length} hops`,
      recommendation: "Consolidate redirect hops into a single canonical target.",
    });
  }

  return { chain, finalUrl: currentUrl, tooManyRedirects, checks };
}
