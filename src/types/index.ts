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

// -------------------------------------------------------------
// VOICE HELPLINE (Exotel 04041895372)
// -------------------------------------------------------------
export type CallStatus =
  | 'RINGING'
  | 'CONNECTED'
  | 'IVR_LANGUAGE_SELECTION'
  | 'TRANSCRIBING'
  | 'AI_TRIAGING'
  | 'COMPLAINT_GENERATED'
  | 'COMPLETED'
  | 'FAILED';

export interface VoicePipelineStep {
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details: string;
  timestamp?: string;
}

export interface VoiceCallSession {
  callSid: string;
  exotelNumber: string; // '04041895372'
  callerNumberMasked: string; // e.g. '+91 98*** **412'
  startedAt: string;
  durationSeconds: number;
  status: CallStatus;
  selectedLanguage: Language;
  languageInputMethod: 'DTMF_1_EN' | 'DTMF_2_HI' | 'DTMF_3_TE' | 'VOICE_PROMPT';
  liveTranscript: string;
  analysis?: AgentAnalysisResponse;
  generatedComplaint?: string;
  ticketNumber?: string;
  reportId?: string;
  recordingUrl?: string;
  audioBase64?: string;
  audioListenedByGemini?: boolean;
  englishTranslation?: string;
  citizenUrgencyNotes?: string;
  source?: 'EXOTEL_WEBHOOK' | 'EXOTEL_REST_API' | 'SIMULATION';
  streamIntegrationStatus: 'STREAM_PENDING_EXOTEL_CONFIG' | 'STREAM_ACTIVE';
  pipelineSteps: VoicePipelineStep[];
}

// -------------------------------------------------------------
// COMMUNITY ESCALATION & SOCIAL / MEDIA AMPLIFICATION
// -------------------------------------------------------------
export interface SocialPostDraft {
  xPost: string;
  instagramCaption: string;
  disclaimer: string;
  suggestedHashtags: string[];
}

export interface PressOutletOption {
  id: string;
  name: string;
  type: 'NEWSPAPER' | 'NEWS_CHANNEL' | 'REGIONAL_DAILY';
  desk: string;
  defaultEmail: string;
  cityCoverage: string;
  circulationOrReach: string;
}

export interface PressEmailDraft {
  outletName: string;
  editorDesk: string;
  recipientEmail: string;
  subject: string;
  body: string;
  storyAngle: 'INVESTIGATIVE_PITCH' | 'LETTER_TO_EDITOR' | 'HAZARD_ALERT';
  keyFacts?: {
    daysUnaddressed: number;
    corroboratedReports: number;
    distinctResidents: number;
    authorityInvolved: string;
    location: string;
    publicImpact: string;
  };
  pressReleaseNotice?: string;
}

export interface DailyContinuousReportEntry {
  dayNumber: number;
  date: string;
  reporterName: string;
  ticketNumber: string;
  summary: string;
  severity: SeverityLevel;
}

export interface CommunityEscalationCluster {
  communityIssueId: string;
  category: IssueCategory;
  approximateLocation: string;
  ward: string;
  city: string;
  authorityName?: string;
  reportIds: string[];
  distinctReporters: string[];
  distinctReporterCount: number;
  totalReportCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  daysActive: number;
  continuousDaysReported?: number;
  dailyReportLog?: DailyContinuousReportEntry[];
  qualifiesForPressEscalation?: boolean; // High/Critical priority + 1 location + 7+ continuous days by different people
  aiSeverity: SeverityLevel;
  severityReasons: string[];
  officialStatus: ReportLifecycleStatus;
  escalationStatus: 'MONITORING' | 'ESCALATED' | 'SOCIAL_AMPLIFIED' | 'PRESS_ESCALATED';
  amplifiedPlatforms: ('X' | 'INSTAGRAM' | 'PRESS_EMAIL')[];
  socialPostDraft?: SocialPostDraft;
  pressEmailDraft?: PressEmailDraft;
  lastAmplifiedAt?: string;
  isPersistent: boolean; // >= 7 days active, >= 2 distinct users, not resolved
}

// -------------------------------------------------------------
// REFERRAL SYSTEM (20 Points on 1st genuine report)
// -------------------------------------------------------------
export interface ReferralRecord {
  id: string;
  referrerName: string;
  referralCode: string;
  refereeName: string;
  status: 'pending' | 'first_report_completed' | 'rewarded';
  firstReportTicketNumber?: string;
  createdAt: string;
  rewardedAt?: string;
  pointsAwarded: number;
}

export interface ReferralStats {
  userReferralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingCount: number;
  completedCount: number;
  totalBonusPointsEarned: number;
  records: ReferralRecord[];
}
