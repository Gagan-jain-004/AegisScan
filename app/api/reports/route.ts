import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";

const createReportSchema = z.object({
  projectId: z.string().min(1, "Project ID required."),
  assessmentId: z.string().optional(),
  reportType: z.string().default("EXECUTIVE"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const reports = db.getReports(projectId);
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("SECURITY_ANALYST", user.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges." }, { status: 403 });
    }

    const body = await req.json();
    const validated = createReportSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const report = db.createReport(
      validated.data.projectId,
      validated.data.assessmentId,
      validated.data.reportType
    );

    return NextResponse.json({ report, message: "Security report generated." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to generate report." }, { status: 500 });
  }
}
