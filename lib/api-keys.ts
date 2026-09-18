import crypto from "crypto";

export function generateApiKey(): { rawKey: string; keyPrefix: string; hashedKey: string } {
  const entropy = crypto.randomBytes(24).toString("hex");
  const keyPrefix = `aeg_live_${entropy.substring(0, 6)}`;
  const rawKey = `${keyPrefix}_${entropy.substring(6)}`;
  const hashedKey = hashApiKey(rawKey);

  return {
    rawKey,
    keyPrefix,
    hashedKey,
  };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

export function verifyApiKey(rawKey: string, hashedKey: string): boolean {
  const computed = hashApiKey(rawKey);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hashedKey));
}
