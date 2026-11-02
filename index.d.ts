export declare const VERSION: string;
export declare const ALL_ENGINE_SLUGS: string[];
export declare const RAPIDAPI_PUBLIC_SLUGS: string[];

export interface AuditResult {
  engine: string;
  provider: string;
  status: string;
  records: Record<string, unknown>[];
  upgradeUrl: string;
}

export declare class B2BComplianceClient {
  constructor(opts?: { rapidapiKey?: string; apifyToken?: string });
  runEngine(engineSlug: string, payload?: Record<string, unknown>): Promise<AuditResult>;
}
