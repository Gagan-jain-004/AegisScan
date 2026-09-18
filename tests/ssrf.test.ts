import { describe, it, expect } from "vitest";
import { isPrivateOrReservedIP, validateTargetUrl } from "../lib/security/ssrf";

describe("SSRF Defensive Security Guard", () => {
  it("should block loopback 127.0.0.1 and 127.0.0.0/8 range", () => {
    expect(isPrivateOrReservedIP("127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIP("127.255.255.254")).toBe(true);
  });

  it("should block RFC1918 private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)", () => {
    expect(isPrivateOrReservedIP("10.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIP("172.16.0.5")).toBe(true);
    expect(isPrivateOrReservedIP("172.31.255.254")).toBe(true);
    expect(isPrivateOrReservedIP("192.168.1.1")).toBe(true);
  });

  it("should block cloud metadata endpoint 169.254.169.254 and link-local ranges", () => {
    expect(isPrivateOrReservedIP("169.254.169.254")).toBe(true);
    expect(isPrivateOrReservedIP("169.254.1.1")).toBe(true);
  });

  it("should permit public IP addresses", () => {
    expect(isPrivateOrReservedIP("93.184.216.34")).toBe(false);
    expect(isPrivateOrReservedIP("1.1.1.1")).toBe(false);
    expect(isPrivateOrReservedIP("8.8.8.8")).toBe(false);
  });

  it("should reject localhost target URLs in validation", async () => {
    const result = await validateTargetUrl("http://localhost:3000");
    expect(result.isValid).toBe(false);
  });
});
