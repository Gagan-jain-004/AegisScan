import { SecurityEvent } from "../types";
import { DetectionResult } from "./bruteForce";

export function detectAccessControlBreaches(
  incomingEvent: SecurityEvent,
  recentEvents: SecurityEvent[]
): DetectionResult {
  if (incomingEvent.type !== "UNAUTHORIZED_ACCESS") {
    return { triggered: false };
  }

  const now = new Date(incomingEvent.timestamp).getTime();
  const windowMs = 3 * 60 * 1000; // 3 minutes

  const prior403s = recentEvents.filter((e) => {
    if (e.type !== "UNAUTHORIZED_ACCESS") return false;
    const t = new Date(e.timestamp).getTime();
    if (now - t > windowMs || now - t < 0) return false;

    return incomingEvent.sourceIp && e.sourceIp === incomingEvent.sourceIp;
  });

  prior403s.push(incomingEvent);

  if (prior403s.length >= 4) {
    return {
      triggered: true,
      title: `Repeated Unauthorized Access Probing (${prior403s.length} Blocked Requests)`,
      description: `Source IP ${incomingEvent.sourceIp || "unknown"} triggered ${prior403s.length} unauthorized access violations (HTTP 401/403) across privileged routes within 3 minutes.`,
      severity: prior403s.length >= 8 ? "HIGH" : "MEDIUM",
      matchedEvents: prior403s,
    };
  }

  return { triggered: false };
}
