import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = db.getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const assessments = db.getAssessments(id);
  const findings = db.getFindings(id);
  const events = db.getSecurityEvents(id);
  const incidents = db.getIncidents(id);
  const apiKeys = db.getApiKeys(id);
  const reports = db.getReports(id);

  return NextResponse.json({
    project,
    assessments,
    findings,
    events,
    incidents,
    apiKeys,
    reports,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getCurrentUser();
  if (!checkPermission("OWNER", user.role)) {
    return NextResponse.json({ error: "Forbidden: Only OWNER can delete projects." }, { status: 403 });
  }

  const { id } = await params;
  const deleted = db.deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Project deleted successfully." });
}
