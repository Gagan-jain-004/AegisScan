import { SecurityEvent } from "../types";
import { DetectionResult } from "./bruteForce";

const SQLI_PATTERNS = [
  /(\b(union(\s+all)?)\s+select\b)/i,
  /(\bselect\b.+\bfrom\b)/i,
  /((\%27|\')(\s*or\s*|\s*and\s*).+=.+)/i,
  /(\bdrop\s+table\b|\bexec(\s|\+)+(s|x)p\b)/i,
  /(;\s*select\b|;\s*insert\b|;\s*update\b|;\s*delete\b)/i,
  /(\b sleep\(\d+\)|\b waitfor\s+delay\b)/i,
  /(\'\s*or\s*\'1\'\s*=\s*\'1)/i,
  /(\'\s*or\s*1\s*=\s*1)/i,
  /(--|#|\/\*)/,
];

const XSS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  /javascript\s*:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /<img\b[^>]+src\s*=\s*['"]?[^'"]*['"]?[^>]*onerror/i,
  /<svg\b[^>]*onload/i,
  /document\.(cookie|location|domain)/i,
];

export function detectSuspiciousRequest(incomingEvent: SecurityEvent): DetectionResult {
  if (incomingEvent.type === "SQLI_PATTERN_DETECTED") {
    return {
      triggered: true,
      title: "SQL Injection Probe Pattern in Request Telemetry",
      description: `Target application intercepted a database injection payload signature targeting endpoint: ${incomingEvent.endpoint || "unknown"}.`,
      severity: "CRITICAL",
      matchedEvents: [incomingEvent],
    };
  }

  if (incomingEvent.type === "XSS_PATTERN_DETECTED") {
    return {
      triggered: true,
      title: "Cross-Site Scripting (XSS) Pattern Intercepted",
      description: `Script injection signature detected in request telemetry submitted to endpoint: ${incomingEvent.endpoint || "unknown"}.`,
      severity: "HIGH",
      matchedEvents: [incomingEvent],
    };
  }

  if (incomingEvent.type === "SUSPICIOUS_REQUEST") {
    const textToCheck = `${incomingEvent.endpoint || ""} ${incomingEvent.metadata || ""}`;

    for (const pattern of SQLI_PATTERNS) {
      if (pattern.test(textToCheck)) {
        return {
          triggered: true,
          title: "SQL Injection Pattern Identified in Request Path/Query",
          description: `Payload matching SQL injection regex signature detected on endpoint '${incomingEvent.endpoint || "/"}' from source IP ${incomingEvent.sourceIp || "unknown"}.`,
          severity: "CRITICAL",
          matchedEvents: [incomingEvent],
        };
      }
    }

    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(textToCheck)) {
        return {
          triggered: true,
          title: "Cross-Site Scripting (XSS) Vector Identified in Request Telemetry",
          description: `Payload matching XSS script tag or event handler signature intercepted on endpoint '${incomingEvent.endpoint || "/"}' from IP ${incomingEvent.sourceIp || "unknown"}.`,
          severity: "HIGH",
          matchedEvents: [incomingEvent],
        };
      }
    }

    return {
      triggered: true,
      title: "Anomalous or Suspicious HTTP Request Signature",
      description: `Suspicious request reported on endpoint: ${incomingEvent.endpoint || "/"}.`,
      severity: "MEDIUM",
      matchedEvents: [incomingEvent],
    };
  }

  return { triggered: false };
}
