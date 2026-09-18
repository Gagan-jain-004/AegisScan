import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/types";

export async function GET() {
  const user = db.getUser();
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role } = body as { role: UserRole };
    if (role && ["OWNER", "SECURITY_ANALYST", "VIEWER"].includes(role)) {
      const updated = db.updateUserRole(role);
      return NextResponse.json({ user: updated, message: `Active workspace role updated to ${role}.` });
    }
    return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update user role." }, { status: 500 });
  }
}
