import { SecurityEvent } from "../types";
import { DetectionResult } from "./bruteForce";

export function detectAuthAnomaly(
  incomingEvent: SecurityEvent,
  recentEvents: SecurityEvent[]
): DetectionResult {
  // Scenario 1: Repeated failed logins followed immediately by LOGIN_SUCCESS or ADMIN_ACCESS
  if (incomingEvent.type === "LOGIN_SUCCESS" || incomingEvent.type === "ADMIN_ACCESS" || incomingEvent.type === "PRIVILEGE_CHANGE") {
    const now = new Date(incomingEvent.timestamp).getTime();
    const windowMs = 5 * 60 * 1000; // 5 minutes

    const priorFailures = recentEvents.filter((e) => {
      if (e.type !== "LOGIN_FAILED") return false;
      const t = new Date(e.timestamp).getTime();
      if (now - t > windowMs || now - t < 0) return false;

      const matchIp = incomingEvent.sourceIp && e.sourceIp === incomingEvent.sourceIp;
      const matchUser = incomingEvent.userId && e.userId === incomingEvent.userId;
      return matchIp || matchUser;
    });

    if (priorFailures.length >= 4) {
      return {
        triggered: true,
        title: "Suspicious Authentication Sequence (Multiple Failures Preceding Privilege Grant)",
        description: `Source IP ${incomingEvent.sourceIp || "unknown"} executed ${priorFailures.length} failed login attempts immediately prior to triggering an authorized ${incomingEvent.type} event.`,
        severity: "HIGH",
        matchedEvents: [...priorFailures, incomingEvent],
      };
    }
  }

  // Scenario 2: Unexpected Account Lockout
  if (incomingEvent.type === "ACCOUNT_LOCKED") {
    return {
      triggered: true,
      title: "Target Account Locked Due to Security Violations",
      description: `User account '${incomingEvent.userId || "unknown"}' entered LOCKED state following security thresholds breach.`,
      severity: "MEDIUM",
      matchedEvents: [incomingEvent],
    };
  }

  return { triggered: false };
}
