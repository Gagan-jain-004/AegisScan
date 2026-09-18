import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-keys";

const createKeySchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  name: z.string().min(2, "Key name must be at least 2 characters."),
});

const revokeKeySchema = z.object({
  keyId: z.string().min(1, "Key ID required."),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const keys = db.getApiKeys(projectId);
  // Never expose hashedKey or rawKey in list responses
  const sanitized = keys.map((k) => ({
    id: k.id,
    projectId: k.projectId,
    name: k.name,
    keyPrefix: k.keyPrefix,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    revokedAt: k.revokedAt,
    createdAt: k.createdAt,
  }));
  return NextResponse.json({ keys: sanitized });
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("OWNER", user.role)) {
      return NextResponse.json({ error: "Forbidden: Only OWNER can generate API keys." }, { status: 403 });
    }

    const body = await req.json();
    const validated = createKeySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const { rawKey, keyPrefix, hashedKey } = generateApiKey();
    const createdKey = db.createApiKey(
      validated.data.projectId,
      validated.data.name,
      keyPrefix,
      hashedKey
    );

    return NextResponse.json({
      message: "API key generated successfully. Copy it now — it will not be shown again.",
      rawKey,
      key: {
        id: createdKey.id,
        projectId: createdKey.projectId,
        name: createdKey.name,
        keyPrefix: createdKey.keyPrefix,
        createdAt: createdKey.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate API key." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("OWNER", user.role)) {
      return NextResponse.json({ error: "Forbidden: Only OWNER can revoke API keys." }, { status: 403 });
    }

    const body = await req.json();
    const validated = revokeKeySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const revoked = db.revokeApiKey(validated.data.keyId);
    if (!revoked) {
      return NextResponse.json({ error: "Key not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `API Key ${revoked.keyPrefix}... revoked.` });
  } catch {
    return NextResponse.json({ error: "Failed to revoke API key." }, { status: 500 });
  }
}
