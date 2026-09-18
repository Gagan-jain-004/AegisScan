import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const auditLogs = db.getAuditLogs(projectId);
  return NextResponse.json({ auditLogs });
}
