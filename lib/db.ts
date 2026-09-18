import {
  Project,
  Assessment,
  Finding,
  SecurityEvent,
  Incident,
  ApiKey,
  AuditLog,
  Report,
  UserProfile,
} from "./types";
import {
  initialUserProfile,
  initialProjects,
  initialAssessments,
  initialFindings,
  initialSecurityEvents,
  initialIncidents,
  initialApiKeys,
  initialAuditLogs,
  initialReports,
} from "./seed-data";

// In-Memory / Global State Store with Seed Initialization
declare global {
  // eslint-disable-next-line no-var
  var __aegis_store__: {
    user: UserProfile;
    projects: Project[];
    assessments: Assessment[];
    findings: Finding[];
    events: SecurityEvent[];
    incidents: Incident[];
    apiKeys: ApiKey[];
    auditLogs: AuditLog[];
    reports: Report[];
  } | undefined;
}

if (!global.__aegis_store__) {
  global.__aegis_store__ = {
    user: { ...initialUserProfile },
    projects: [...initialProjects],
    assessments: [...initialAssessments],
    findings: [...initialFindings],
    events: [...initialSecurityEvents],
    incidents: [...initialIncidents],
    apiKeys: [...initialApiKeys],
    auditLogs: [...initialAuditLogs],
    reports: [...initialReports],
  };
}

export const store = global.__aegis_store__;

// Helper DB CRUD Accessors
export const db = {
  getUser: () => store.user,
  updateUserRole: (role: UserProfile["role"]) => {
    store.user.role = role;
    return store.user;
  },

  // Projects
  getProjects: () => store.projects,
  getProjectById: (id: string) => store.projects.find((p) => p.id === id),
  createProject: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...data,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.projects.unshift(newProject);
    db.logAudit({
      projectId: newProject.id,
      action: "PROJECT_CREATED",
      metadata: JSON.stringify({ name: newProject.name, targetUrl: newProject.targetUrl }),
    });
    return newProject;
  },
  deleteProject: (id: string) => {
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const removed = store.projects.splice(idx, 1)[0];
      db.logAudit({
        projectId: id,
        action: "PROJECT_DELETED",
        metadata: JSON.stringify({ name: removed.name }),
      });
      return true;
    }
    return false;
  },

  // Assessments
  getAssessments: (projectId?: string) => {
    if (projectId) {
      return store.assessments.filter((a) => a.projectId === projectId);
    }
    return store.assessments;
  },
  getAssessmentById: (id: string) => store.assessments.find((a) => a.id === id),
  createAssessment: (projectId: string) => {
    const newAssessment: Assessment = {
      id: `asm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      status: "RUNNING",
      startedAt: new Date().toISOString(),
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      createdAt: new Date().toISOString(),
    };
    store.assessments.unshift(newAssessment);
    db.logAudit({
      projectId,
      action: "ASSESSMENT_STARTED",
      metadata: JSON.stringify({ assessmentId: newAssessment.id }),
    });
    return newAssessment;
  },
  completeAssessment: (
    id: string,
    score: number,
    passedChecks: number,
    failedChecks: number,
    findings: Finding[]
  ) => {
    const asm = store.assessments.find((a) => a.id === id);
    if (asm) {
      asm.status = "COMPLETED";
      asm.completedAt = new Date().toISOString();
      asm.securityScore = score;
      asm.totalChecks = passedChecks + failedChecks;
      asm.passedChecks = passedChecks;
      asm.failedChecks = failedChecks;
      findings.forEach((f) => store.findings.unshift(f));
      db.logAudit({
        projectId: asm.projectId,
        action: "ASSESSMENT_COMPLETED",
        metadata: JSON.stringify({ assessmentId: id, score, findingsCount: findings.length }),
      });
    }
    return asm;
  },

  // Findings
  getFindings: (projectId?: string) => {
    if (projectId) {
      return store.findings.filter((f) => f.projectId === projectId);
    }
    return store.findings;
  },
  getFindingById: (id: string) => store.findings.find((f) => f.id === id),
  updateFindingStatus: (id: string, status: Finding["status"]) => {
    const finding = store.findings.find((f) => f.id === id);
    if (finding) {
      const oldStatus = finding.status;
      finding.status = status;
      db.logAudit({
        projectId: finding.projectId,
        action: "FINDING_STATUS_CHANGED",
        metadata: JSON.stringify({ findingId: id, oldStatus, newStatus: status, title: finding.title }),
      });
    }
    return finding;
  },

  // Security Events
  getSecurityEvents: (projectId?: string) => {
    if (projectId) {
      return store.events.filter((e) => e.projectId === projectId);
    }
    return store.events;
  },
  addSecurityEvent: (eventData: Omit<SecurityEvent, "id">) => {
    const newEvent: SecurityEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    store.events.unshift(newEvent);
    return newEvent;
  },

  // Incidents
  getIncidents: (projectId?: string) => {
    if (projectId) {
      return store.incidents.filter((i) => i.projectId === projectId);
    }
    return store.incidents;
  },
  getIncidentById: (id: string) => store.incidents.find((i) => i.id === id || i.incidentCode === id),
  createIncident: (data: Omit<Incident, "id" | "incidentCode" | "createdAt" | "updatedAt">) => {
    const nextCodeNum = 422 + store.incidents.length;
    const incidentCode = `INC-${String(nextCodeNum).padStart(6, "0")}`;
    const newIncident: Incident = {
      ...data,
      id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      incidentCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.incidents.unshift(newIncident);
    db.logAudit({
      projectId: data.projectId,
      action: "INCIDENT_CREATED",
      metadata: JSON.stringify({ incidentCode, title: data.title, severity: data.severity }),
    });
    return newIncident;
  },
  updateIncidentStatus: (id: string, status: Incident["status"], notes?: string) => {
    const incident = store.incidents.find((i) => i.id === id || i.incidentCode === id);
    if (incident) {
      const oldStatus = incident.status;
      incident.status = status;
      if (notes !== undefined) {
        incident.notes = notes;
      }
      incident.updatedAt = new Date().toISOString();
      db.logAudit({
        projectId: incident.projectId,
        action: "INCIDENT_STATUS_CHANGED",
        metadata: JSON.stringify({ incidentCode: incident.incidentCode, oldStatus, newStatus: status, notesUpdated: !!notes }),
      });
    }
    return incident;
  },

  // API Keys
  getApiKeys: (projectId?: string) => {
    if (projectId) {
      return store.apiKeys.filter((k) => k.projectId === projectId);
    }
    return store.apiKeys;
  },
  createApiKey: (projectId: string, name: string, keyPrefix: string, hashedKey: string) => {
    const newKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      name,
      keyPrefix,
      hashedKey,
      createdAt: new Date().toISOString(),
    };
    store.apiKeys.unshift(newKey);
    db.logAudit({
      projectId,
      action: "API_KEY_CREATED",
      metadata: JSON.stringify({ keyPrefix, name }),
    });
    return newKey;
  },
  revokeApiKey: (id: string) => {
    const key = store.apiKeys.find((k) => k.id === id);
    if (key) {
      key.revokedAt = new Date().toISOString();
      db.logAudit({
        projectId: key.projectId,
        action: "API_KEY_REVOKED",
        metadata: JSON.stringify({ keyPrefix: key.keyPrefix, name: key.name }),
      });
    }
    return key;
  },

  // Audit Logs
  getAuditLogs: (projectId?: string) => {
    if (projectId) {
      return store.auditLogs.filter((a) => a.projectId === projectId);
    }
    return store.auditLogs;
  },
  logAudit: (data: { projectId?: string | null; action: string; metadata?: string; ipAddress?: string }) => {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId: data.projectId || null,
      actorId: store.user.id,
      action: data.action,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || "127.0.0.1",
      createdAt: new Date().toISOString(),
    };
    store.auditLogs.unshift(log);
    return log;
  },

  // Reports
  getReports: (projectId?: string) => {
    if (projectId) {
      return store.reports.filter((r) => r.projectId === projectId);
    }
    return store.reports;
  },
  createReport: (projectId: string, assessmentId?: string, reportType = "EXECUTIVE") => {
    const report: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      assessmentId: assessmentId || null,
      generatedBy: store.user.name,
      reportType,
      createdAt: new Date().toISOString(),
    };
    store.reports.unshift(report);
    db.logAudit({
      projectId,
      action: "REPORT_GENERATED",
      metadata: JSON.stringify({ reportId: report.id, reportType }),
    });
    return report;
  },
};
