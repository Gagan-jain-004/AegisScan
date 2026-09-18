import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";

const updateFindingSchema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED", "FALSE_POSITIVE"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("SECURITY_ANALYST", user.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateFindingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const finding = db.updateFindingStatus(id, validated.data.status);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    return NextResponse.json({ finding, message: `Finding status updated to ${validated.data.status}.` });
  } catch {
    return NextResponse.json({ error: "Failed to update finding." }, { status: 500 });
  }
}
