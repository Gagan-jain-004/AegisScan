import { SecurityEvent } from "../types";
import { DetectionResult } from "./bruteForce";

export function detectRateLimitSpikes(
  incomingEvent: SecurityEvent,
  recentEvents: SecurityEvent[]
): DetectionResult {
  if (incomingEvent.type !== "RATE_LIMIT_TRIGGERED") {
    return { triggered: false };
  }

  const now = new Date(incomingEvent.timestamp).getTime();
  const windowMs = 2 * 60 * 1000; // 2 minutes

  const priorTriggers = recentEvents.filter((e) => {
    if (e.type !== "RATE_LIMIT_TRIGGERED") return false;
    const t = new Date(e.timestamp).getTime();
    if (now - t > windowMs || now - t < 0) return false;

    return incomingEvent.sourceIp && e.sourceIp === incomingEvent.sourceIp;
  });

  priorTriggers.push(incomingEvent);

  if (priorTriggers.length >= 3) {
    return {
      triggered: true,
      title: `Persistent Rate Limit Violations / DoS Pattern (${priorTriggers.length} Triggers)`,
      description: `Client IP ${incomingEvent.sourceIp || "unknown"} continuously exceeded rate limits across protected API routes.`,
      severity: "HIGH",
      matchedEvents: priorTriggers,
    };
  }

  return { triggered: false };
}
