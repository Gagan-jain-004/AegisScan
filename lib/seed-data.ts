import { UserProfile, Project, Assessment, Finding, SecurityEvent, Incident, ApiKey, AuditLog, Report } from "./types";

export const initialUserProfile: UserProfile = {
  id: "usr_lead_sec_01",
  clerkUserId: "user_primary_owner",
  name: "Gagan Jain (Lead SOC Analyst)",
  email: "analyst@aegisscan.dev",
  role: "OWNER",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Completely fresh and clean state — No pre-seeded mock projects
export const initialProjects: Project[] = [];
export const initialAssessments: Assessment[] = [];
export const initialFindings: Finding[] = [];
export const initialSecurityEvents: SecurityEvent[] = [];
export const initialIncidents: Incident[] = [];
export const initialApiKeys: ApiKey[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialReports: Report[] = [];
