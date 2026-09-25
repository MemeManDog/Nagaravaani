export type Language = 'en' | 'hi' | 'te';

export type IssueCategory =
  | 'Pothole / Road Damage'
  | 'Flooding / Waterlogging'
  | 'Open Sewage / Drainage'
  | 'Broken Streetlight'
  | 'Road Blockage / Rubble'
  | 'Garbage / Waste'
  | 'Foul Smell / Sanitation'
  | 'Other Civic Issue';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Requirement 4: Report status reflecting actual action
export type ReportLifecycleStatus =
  | 'DRAFTED'
  | 'READY TO REPORT'
  | 'REPORTED'
  | 'OFFICIALLY RECEIVED'
  | 'ACKNOWLEDGED'
  | 'IN PROGRESS'
  | 'RESOLVED';

export type ReportingMethod =
  | 'Email'
  | 'WhatsApp'
  | 'Personal Visit / In-Person'
  | 'Copy Grievance';

// Requirement 3: Configurable Municipal Authority database with explicit demo/mock tags
export interface MunicipalAuthority {
  id: string;
  authorityName: string;
  shortName: string;
  municipality: string;
  area: string;
  department: string;
  designatedOfficer: string;
  address: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  portalUrl: string | null;
  latitude: number;
  longitude: number;
  supportedCategories: IssueCategory[];
  isDemoData: boolean;
  hasDirectIntegration: boolean;
}

export interface CivicReport {
  id: string;
  ticketNumber: string; // e.g. NGV-00042
  title: string;
  description: string;
  originalLanguage: Language;
  detectedLanguageName?: string;
  category: IssueCategory;
  severity: SeverityLevel;
  severityReasons: string[];
  location: {
    address: string;
    landmark?: string;
    city: string;
    ward?: string;
    latitude?: number;
    longitude?: number;
    isApproximate: boolean;
  };
  photoUrls: string[];
  submittedAt: string;
  updatedAt: string;
  status: ReportLifecycleStatus;
  reportingMethod?: ReportingMethod;
  reportingActionInitiatedAt?: string;
  officialReferenceId?: string;
  citizenName: string;
  isAnonymous: boolean;
  crowdReportCount: number;
  pointsEarned: number;
  rewardEligible: boolean;
  rewardMessage: string;
  assignedAuthority: MunicipalAuthority;
  formalComplaintText: string;
  formalComplaintTranslations?: {
    en: string;
    hi: string;
    te: string;
  };
  aiConfidence?: number;
  statusHistory: {
    status: ReportLifecycleStatus;
    timestamp: string;
    note: string;
    updatedBy: 'Citizen Report' | 'AI Assessment' | 'Official Status';
  }[];
}

export interface AgentExecutionStep {
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  summary: string;
  details?: string;
}

export interface AgentAnalysisResponse {
  language: {
    detected: Language;
    name: string;
    confidence: number;
  };
  classification: {
    category: IssueCategory;
    confidence: number;
    tags: string[];
  };
  severity: {
    level: SeverityLevel;
    reasons: string[];
  };
  locationAnalysis: {
    resolvedAddress: string;
    ward: string;
    city: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
  };
  imageAnalysis?: {
    observedDefects: string[];
    visualSeverityFactors: string[];
    confidenceAssessment: string;
    disclaimer: string;
  };
  duplicateCheck: {
    hasSimilarReports: boolean;
    similarReportCount: number;
    similarReportId?: string;
    message: string;
    qualifyingCount: number;
    isRewardEligible: boolean;
  };
  authority: MunicipalAuthority;
  formalComplaint: {
    subject: string;
    recipient: string;
    body: string;
    translations?: {
      en: string;
      hi: string;
      te: string;
    };
  };
  potentialPoints: {
    categoryBase: number;
    isRewardEligible: boolean;
    explanation: string;
  };
  executionSteps: AgentExecutionStep[];
  whatsappMessage: string;
  emailBody: string;
  hasOfficialEmail: boolean;
  hasOfficialWhatsApp: boolean;
}

export interface AwardPointsResult {
  report: CivicReport;
  pointsAwarded: number;
  userTotalPoints: number;
  isRewardEligible: boolean;
  message: string;
  reportingMethod: ReportingMethod;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  avatarSeed: string;
  issuesReported: number;
  points: number;
  resolvedCount: number;
  badge: string;
  joinedDate: string;
}
