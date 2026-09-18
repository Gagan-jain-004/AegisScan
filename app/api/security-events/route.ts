import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-keys";
import { processSecurityEvent } from "@/lib/detection/engine";
import { SecurityEventType, Severity } from "@/lib/types";

const eventSchema = z.object({
  type: z.enum([
    "LOGIN_SUCCESS",
    "LOGIN_FAILED",
    "PASSWORD_RESET",
    "ACCOUNT_LOCKED",
    "RATE_LIMIT_TRIGGERED",
    "UNAUTHORIZED_ACCESS",
    "ADMIN_ACCESS",
    "SUSPICIOUS_REQUEST",
    "SQLI_PATTERN_DETECTED",
    "XSS_PATTERN_DETECTED",
    "PRIVILEGE_CHANGE",
  ]),
  userId: z.string().optional(),
  sourceIp: z.string().optional(),
  ip: z.string().optional(), // alias
  endpoint: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

// Server-side severity derivation (never trust client-supplied severity)
function deriveServerSeverity(type: SecurityEventType, metadata?: Record<string, unknown>): Severity {
  switch (type) {
    case "SQLI_PATTERN_DETECTED":
      return "CRITICAL";
    case "XSS_PATTERN_DETECTED":
    case "ACCOUNT_LOCKED":
    case "LOGIN_FAILED":
    case "RATE_LIMIT_TRIGGERED":
      return "HIGH";
    case "UNAUTHORIZED_ACCESS":
    case "PRIVILEGE_CHANGE":
    case "SUSPICIOUS_REQUEST":
      return "MEDIUM";
    case "PASSWORD_RESET":
    case "ADMIN_ACCESS":
      return "LOW";
    case "LOGIN_SUCCESS":
    default:
      return "INFO";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const events = db.getSecurityEvents(projectId);
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  try {
    // 1. Bearer Token API Key Authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Bearer API Key required in Authorization header." },
        { status: 401 }
      );
    }

    const rawKey = authHeader.replace("Bearer ", "").trim();
    const allKeys = db.getApiKeys();

    // Verify key against active, unrevoked hashed keys
    const matchedKey = allKeys.find((k) => !k.revokedAt && verifyApiKey(rawKey, k.hashedKey));
    if (!matchedKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or revoked API Key." },
        { status: 401 }
      );
    }

    // Update lastUsedAt
    matchedKey.lastUsedAt = new Date().toISOString();

    // 2. Validate Request Body
    const body = await req.json();
    const validated = eventSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const data = validated.data;
    const project = db.getProjectById(matchedKey.projectId);
    const ip = data.sourceIp || data.ip || "127.0.0.1";
    const timestamp = data.timestamp || new Date().toISOString();
    const severity = deriveServerSeverity(data.type, data.metadata);

    // 3. Persist Event
    const savedEvent = db.addSecurityEvent({
      projectId: matchedKey.projectId,
      type: data.type,
      severity,
      sourceIp: ip,
      userId: data.userId || null,
      endpoint: data.endpoint || null,
      userAgent: data.userAgent || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      timestamp,
      projectName: project?.name,
    });

    // 4. Run Detection Engine
    const detection = processSecurityEvent(savedEvent);

    return NextResponse.json(
      {
        success: true,
        eventId: savedEvent.id,
        severity,
        incidentCreated: !!detection.createdIncident,
        incidentUpdated: !!detection.updatedIncident,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to ingest security event." }, { status: 500 });
  }
}
