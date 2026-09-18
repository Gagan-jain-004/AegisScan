/**
 * AegisScan Defensive Node.js SDK
 */
class AegisScan {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.AEGISSCAN_API_KEY;
    this.endpoint = (options.endpoint || process.env.AEGISSCAN_ENDPOINT || "http://localhost:3000").replace(/\/$/, "");
    if (!this.apiKey) {
      console.warn("[AegisScan SDK] Warning: No API Key supplied.");
    }
  }

  async sendEvent(eventData) {
    if (!this.apiKey) return { error: "Missing API Key" };

    try {
      const res = await fetch(`${this.endpoint}/api/security-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...eventData,
          timestamp: eventData.timestamp || new Date().toISOString(),
        }),
      });

      return await res.json();
    } catch (err) {
      return { error: err.message };
    }
  }

  async loginFailed(data) {
    return this.sendEvent({ type: "LOGIN_FAILED", ...data });
  }

  async loginSuccess(data) {
    return this.sendEvent({ type: "LOGIN_SUCCESS", ...data });
  }

  async unauthorizedAccess(data) {
    return this.sendEvent({ type: "UNAUTHORIZED_ACCESS", ...data });
  }

  async adminAccess(data) {
    return this.sendEvent({ type: "ADMIN_ACCESS", ...data });
  }

  async rateLimitTriggered(data) {
    return this.sendEvent({ type: "RATE_LIMIT_TRIGGERED", ...data });
  }

  async suspiciousRequest(data) {
    return this.sendEvent({ type: "SUSPICIOUS_REQUEST", ...data });
  }
}

module.exports = { AegisScan };
