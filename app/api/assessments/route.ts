import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";
import { runSecurityAssessment } from "@/lib/security/runner";

const startAssessmentSchema = z.object({
  projectId: z.string().min(1, "Project ID required."),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const assessments = db.getAssessments(projectId);
  return NextResponse.json({ assessments });
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("SECURITY_ANALYST", user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only OWNER and SECURITY_ANALYST roles can execute security assessments." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = startAssessmentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    const result = await runSecurityAssessment(validated.data.projectId);

    if (result.status === "FAILED") {
      return NextResponse.json(
        { error: result.error || "Assessment failed to complete.", result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Security posture assessment executed successfully.",
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal assessment error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
