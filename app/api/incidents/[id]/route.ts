import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";

const updateIncidentSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = db.getIncidentById(id);
  if (!incident) {
    return NextResponse.json({ error: "Incident not found." }, { status: 404 });
  }

  // Correlate related events matching this incident (by source IP and project)
  const allEvents = db.getSecurityEvents(incident.projectId);
  const relatedEvents = allEvents.filter(
    (e) => incident.sourceIp && e.sourceIp === incident.sourceIp
  );

  return NextResponse.json({ incident, relatedEvents });
}

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
    const validated = updateIncidentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const incident = db.getIncidentById(id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found." }, { status: 404 });
    }

    const updated = db.updateIncidentStatus(
      id,
      validated.data.status || incident.status,
      validated.data.notes
    );

    return NextResponse.json({ incident: updated, message: "Incident updated successfully." });
  } catch {
    return NextResponse.json({ error: "Failed to update incident." }, { status: 500 });
  }
}
