export interface AegisScanOptions {
  apiKey?: string;
  endpoint?: string;
}

export interface SecurityEventPayload {
  userId?: string;
  sourceIp?: string;
  endpoint?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export declare class AegisScan {
  constructor(options?: AegisScanOptions);
  sendEvent(eventData: SecurityEventPayload & { type: string }): Promise<any>;
  loginFailed(data: SecurityEventPayload): Promise<any>;
  loginSuccess(data: SecurityEventPayload): Promise<any>;
  unauthorizedAccess(data: SecurityEventPayload): Promise<any>;
  adminAccess(data: SecurityEventPayload): Promise<any>;
  rateLimitTriggered(data: SecurityEventPayload): Promise<any>;
  suspiciousRequest(data: SecurityEventPayload): Promise<any>;
}
