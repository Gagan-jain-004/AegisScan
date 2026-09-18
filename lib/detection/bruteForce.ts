import { SecurityEvent } from "../types";

export interface DetectionResult {
  triggered: boolean;
  title?: string;
  description?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  matchedEvents?: SecurityEvent[];
}

export function detectBruteForce(
  incomingEvent: SecurityEvent,
  recentEvents: SecurityEvent[]
): DetectionResult {
  if (incomingEvent.type !== "LOGIN_FAILED") {
    return { triggered: false };
  }

  const now = new Date(incomingEvent.timestamp).getTime();
  const windowMs = 60 * 1000; // 60 seconds

  // Filter failed logins from same source IP or targeting same user within 60 seconds
  const matchedEvents = recentEvents.filter((e) => {
    if (e.type !== "LOGIN_FAILED") return false;
    const t = new Date(e.timestamp).getTime();
    if (now - t > windowMs || now - t < -5000) return false;

    const matchIp = incomingEvent.sourceIp && e.sourceIp === incomingEvent.sourceIp;
    const matchUser = incomingEvent.userId && e.userId === incomingEvent.userId;
    return matchIp || matchUser;
  });

  // Include the current event
  matchedEvents.push(incomingEvent);

  if (matchedEvents.length >= 5) {
    const isCritical = matchedEvents.length >= 15;
    return {
      triggered: true,
      title: `Potential Brute-Force Authentication Activity (${matchedEvents.length} Attempts)`,
      description: `High surge of ${matchedEvents.length} consecutive failed login attempts detected within a 60-second window targeting user '${incomingEvent.userId || "unknown"}' from IP ${incomingEvent.sourceIp || "unknown"}.`,
      severity: isCritical ? "CRITICAL" : "HIGH",
      matchedEvents,
    };
  }

  return { triggered: false };
}
