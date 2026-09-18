import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPermission, getCurrentUser } from "@/lib/auth";
import { validateTargetUrl } from "@/lib/security/ssrf";

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  description: z.string().optional(),
  targetUrl: z.string().url("Valid HTTP or HTTPS target URL required."),
  ownershipConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm that you own or are explicitly authorized to assess this target." }),
  }),
});

export async function GET() {
  const projects = db.getProjects();
  const assessments = db.getAssessments();
  const findings = db.getFindings();
  const events = db.getSecurityEvents();
  const incidents = db.getIncidents();

  // Attach aggregated counts
  const enriched = projects.map((p) => ({
    ...p,
    _count: {
      assessments: assessments.filter((a) => a.projectId === p.id).length,
      findings: findings.filter((f) => f.projectId === p.id && f.status === "OPEN").length,
      securityEvents: events.filter((e) => e.projectId === p.id).length,
      incidents: incidents.filter((i) => i.projectId === p.id && (i.status === "OPEN" || i.status === "INVESTIGATING")).length,
    },
  }));

  return NextResponse.json({ projects: enriched });
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    if (!checkPermission("OWNER", user.role)) {
      return NextResponse.json({ error: "Forbidden: Only OWNER can create projects." }, { status: 403 });
    }

    const body = await req.json();
    const validated = createProjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0]?.message }, { status: 400 });
    }

    // SSRF Check on project creation
    const ssrfCheck = await validateTargetUrl(validated.data.targetUrl);
    if (!ssrfCheck.isValid) {
      return NextResponse.json({ error: `Target URL rejected by SSRF guard: ${ssrfCheck.error}` }, { status: 400 });
    }

    const project = db.createProject({
      name: validated.data.name,
      description: validated.data.description || null,
      targetUrl: validated.data.targetUrl,
      ownershipConfirmed: validated.data.ownershipConfirmed,
      status: "ACTIVE",
      createdBy: user.id,
    });

    return NextResponse.json({ project, message: "Project registered successfully." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
