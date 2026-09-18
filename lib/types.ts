export type UserRole = "OWNER" | "SECURITY_ANALYST" | "VIEWER";

export interface UserProfile {
  id: string;
  clerkUserId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  targetUrl: string;
  ownershipConfirmed: boolean;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assessments: number;
    findings: number;
    securityEvents: number;
    incidents: number;
  };
}

export type AssessmentStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface Assessment {
  id: string;
  projectId: string;
  status: AssessmentStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  securityScore?: number | null;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  createdAt: string;
  findings?: Finding[];
}

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type FindingCategory = "HEADERS" | "HTTPS" | "COOKIES" | "TLS" | "CONFIG" | "METADATA";
export type FindingStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "FALSE_POSITIVE";

export interface Finding {
  id: string;
  assessmentId?: string | null;
  projectId: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: Severity;
  evidence?: string | null;
  recommendation?: string | null;
  status: FindingStatus;
  createdAt: string;
  projectName?: string;
}

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET"
  | "ACCOUNT_LOCKED"
  | "RATE_LIMIT_TRIGGERED"
  | "UNAUTHORIZED_ACCESS"
  | "ADMIN_ACCESS"
  | "SUSPICIOUS_REQUEST"
  | "SQLI_PATTERN_DETECTED"
  | "XSS_PATTERN_DETECTED"
  | "PRIVILEGE_CHANGE";

export interface SecurityEvent {
  id: string;
  projectId: string;
  type: SecurityEventType;
  severity: Severity;
  sourceIp?: string | null;
  userId?: string | null;
  endpoint?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
  timestamp: string;
  projectName?: string;
}

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";

export interface Incident {
  id: string;
  incidentCode: string; // e.g. INC-000421
  projectId: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  sourceIp?: string | null;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  events?: SecurityEvent[];
}

export interface ApiKey {
  id: string;
  projectId: string;
  name: string;
  keyPrefix: string;
  hashedKey: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  projectId?: string | null;
  actorId: string;
  action: string;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  projectName?: string;
}

export interface Report {
  id: string;
  projectId: string;
  assessmentId?: string | null;
  generatedBy: string;
  reportType: string;
  createdAt: string;
  projectName?: string;
}

export interface CheckResult {
  checkId: string;
  category: FindingCategory;
  title: string;
  status: "PASS" | "WARNING" | "FAIL" | "INFO";
  severity: Severity;
  description: string;
  evidence: string;
  recommendation: string;
}
