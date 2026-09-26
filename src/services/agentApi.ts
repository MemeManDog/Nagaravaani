import {
  AgentAnalysisResponse,
  CivicReport,
  LeaderboardUser,
  MunicipalAuthority,
  ReportingMethod,
  AwardPointsResult,
  Language,
  VoiceCallSession,
  CommunityEscalationCluster,
  SocialPostDraft,
  PressOutletOption,
  PressEmailDraft,
  ReferralStats,
  ReferralRecord,
} from '../types';

export async function analyzeCivicIssue(payload: {
  description: string;
  imageBase64?: string;
  imageMimeType?: string;
  locationText?: string;
  coordinates?: { lat: number; lng: number };
  citizenName?: string;
  preferredLanguage?: string;
}): Promise<AgentAnalysisResponse> {
  const response = await fetch('/api/agent/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

export async function recordReportAction(payload: {
  title?: string;
  description?: string;
  originalLanguage?: string;
  detectedLanguageName?: string;
  category?: string;
  severity?: string;
  severityReasons?: string[];
  location?: {
    address: string;
    landmark?: string;
    city: string;
    ward?: string;
    latitude?: number;
    longitude?: number;
    isApproximate?: boolean;
  };
  photoUrls?: string[];
  citizenName: string;
  assignedAuthority?: MunicipalAuthority;
  formalComplaintText?: string;
  reportingMethod: ReportingMethod;
  editedComplaintText?: string;
  agentAnalysis?: AgentAnalysisResponse;
  referralCode?: string;
}): Promise<AwardPointsResult & { leaderboard: LeaderboardUser[]; referralNotice?: string }> {
  const bodyPayload = payload.agentAnalysis
    ? {
        title: `${payload.agentAnalysis.classification.category} at ${payload.agentAnalysis.locationAnalysis.resolvedAddress.slice(0, 40)}`,
        description: payload.description || payload.agentAnalysis.severity.reasons.join('. '),
        originalLanguage: payload.agentAnalysis.language.detected,
        detectedLanguageName: payload.agentAnalysis.language.name,
        category: payload.agentAnalysis.classification.category,
        severity: payload.agentAnalysis.severity.level,
        severityReasons: payload.agentAnalysis.severity.reasons,
        location: {
          address: payload.agentAnalysis.locationAnalysis.resolvedAddress,
          landmark: payload.agentAnalysis.locationAnalysis.landmark,
          city: payload.agentAnalysis.locationAnalysis.city,
          ward: payload.agentAnalysis.locationAnalysis.ward,
          latitude: payload.agentAnalysis.locationAnalysis.coordinates?.lat,
          longitude: payload.agentAnalysis.locationAnalysis.coordinates?.lng,
        },
        citizenName: payload.citizenName,
        assignedAuthority: payload.agentAnalysis.authority,
        formalComplaintText: payload.editedComplaintText || payload.agentAnalysis.formalComplaint.body,
        formalComplaintTranslations: payload.agentAnalysis.formalComplaint.translations,
        reportingMethod: payload.reportingMethod,
        referralCode: payload.referralCode,
      }
    : payload;

  const res = await fetch('/api/reports/record-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) throw new Error('Failed to record report action');
  return res.json();
}

export async function translateComplaintText(params: {
  text: string;
  targetLanguage: Language;
  category?: string;
  severity?: string;
  locationText?: string;
  citizenName?: string;
  authority?: MunicipalAuthority;
}): Promise<string> {
  try {
    const res = await fetch('/api/complaint/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return params.text;
    const data = await res.json();
    return data.translatedText || params.text;
  } catch (err) {
    console.warn('translateComplaintText error:', err);
    return params.text;
  }
}

export async function fetchReports(filters?: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<{ reports: CivicReport[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function endorseReport(reportId: string): Promise<{ success: boolean; crowdReportCount: number }> {
  const res = await fetch(`/api/reports/${reportId}/endorse`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to endorse report');
  return res.json();
}

export async function updateReportStatus(reportId: string, status: string, note?: string): Promise<{ report: CivicReport }> {
  const res = await fetch(`/api/reports/${reportId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardUser[] }> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchMunicipalOffices(): Promise<{ offices: MunicipalAuthority[] }> {
  const res = await fetch('/api/municipal-offices');
  if (!res.ok) throw new Error('Failed to fetch municipal offices');
  return res.json();
}

// -------------------------------------------------------------
// VOICE HELPLINE API (Exotel 04041895372)
// -------------------------------------------------------------

export async function fetchExotelConfig(): Promise<{
  exotelNumber: string;
  streamIntegrationStatus: 'STREAM_PENDING_EXOTEL_CONFIG' | 'STREAM_ACTIVE';
  hasServerStreamingUrl: boolean;
  webhookUrl: string;
  passthruUrl: string;
  statusCallbackUrl: string;
  incomingCallUrl: string;
  isConfiguredWithExotelApi: boolean;
  exotelAccountSidMasked: string | null;
  exotelSubdomain: string;
  supportedLanguages: { code: string; dtmf: string; name: string }[];
  ivrWelcomePrompt: string;
  totalSessions: number;
}> {
  const res = await fetch('/api/exotel/config');
  if (!res.ok) throw new Error('Failed to fetch Exotel config');
  return res.json();
}

export async function fetchVoiceCalls(): Promise<{ calls: VoiceCallSession[]; total: number }> {
  const res = await fetch('/api/exotel/calls');
  if (!res.ok) throw new Error('Failed to fetch voice calls');
  return res.json();
}

export async function processVoiceCall(payload: {
  callerNumberMasked?: string;
  citizenName?: string;
  language?: Language;
  languageInputMethod?: 'DTMF_1_EN' | 'DTMF_2_HI' | 'DTMF_3_TE' | 'VOICE_PROMPT';
  transcript?: string;
  englishTranslation?: string;
  locationHint?: string;
  recordingUrl?: string;
  audioBase64?: string;
  mimeType?: string;
}): Promise<{ session: VoiceCallSession; report: CivicReport }> {
  const res = await fetch('/api/exotel/process-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to process voice call');
  }
  return res.json();
}

export async function analyzeExotelAudio(payload: {
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
  callerNumber?: string;
  citizenName?: string;
  language?: string;
  transcript?: string;
  englishTranslation?: string;
  locationHint?: string;
  duration?: number;
}): Promise<{ session: VoiceCallSession; report: CivicReport; audioListened: boolean }> {
  const res = await fetch('/api/exotel/analyze-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze audio');
  }
  return res.json();
}

export async function syncExotelDatabase(credentials?: {
  accountSid?: string;
  apiKey?: string;
  apiToken?: string;
  subdomain?: string;
}): Promise<{
  success: boolean;
  needsCredentials?: boolean;
  message: string;
  addedCount?: number;
  totalCalls: number;
  calls: VoiceCallSession[];
}> {
  const res = await fetch('/api/exotel/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials || {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sync with Exotel database');
  }
  return data;
}

export async function configureExotelCredentials(credentials: {
  accountSid?: string;
  apiKey?: string;
  apiToken?: string;
  subdomain?: string;
}): Promise<{
  success: boolean;
  message: string;
  isConfigured: boolean;
  accountSidMasked: string | null;
  subdomain: string;
}> {
  const res = await fetch('/api/exotel/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Failed to update Exotel credentials');
  return res.json();
}

export async function ingestExotelCall(payload: {
  callSid?: string;
  from?: string;
  digits?: string;
  recordingUrl?: string;
  transcript?: string;
  duration?: number;
  locationHint?: string;
}): Promise<{ session: VoiceCallSession; report: CivicReport }> {
  const res = await fetch('/api/exotel/ingest-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to ingest call');
  }
  return res.json();
}

// -------------------------------------------------------------
// COMMUNITY ESCALATION & SOCIAL AMPLIFICATION API
// -------------------------------------------------------------

export async function fetchEscalationClusters(): Promise<{ clusters: CommunityEscalationCluster[]; total: number }> {
  const res = await fetch('/api/escalation/clusters');
  if (!res.ok) throw new Error('Failed to fetch escalation clusters');
  return res.json();
}

export async function generateEscalationPost(payload: {
  communityIssueId: string;
  category: string;
  approximateLocation: string;
  totalReportCount: number;
  distinctReporterCount: number;
  daysActive: number;
  aiSeverity: string;
  severityReasons: string[];
  authorityName: string;
}): Promise<SocialPostDraft> {
  const res = await fetch('/api/escalation/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate social draft');
  return res.json();
}

export async function fetchPressOutlets(): Promise<{ outlets: PressOutletOption[]; total: number }> {
  const res = await fetch('/api/escalation/press-outlets');
  if (!res.ok) throw new Error('Failed to fetch press outlets');
  return res.json();
}

export async function generatePressEmail(payload: {
  communityIssueId: string;
  category: string;
  approximateLocation: string;
  totalReportCount: number;
  distinctReporterCount: number;
  daysActive: number;
  aiSeverity: string;
  severityReasons: string[];
  authorityName: string;
  outletId?: string;
  customOutletName?: string;
  customEditorEmail?: string;
  storyAngle?: 'INVESTIGATIVE_PITCH' | 'LETTER_TO_EDITOR' | 'HAZARD_ALERT';
  useAi?: boolean;
}): Promise<PressEmailDraft> {
  const res = await fetch('/api/escalation/generate-press-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate press email draft');
  return res.json();
}

export async function recordEscalationAmplification(payload: {
  communityIssueId: string;
  platform: 'X' | 'INSTAGRAM' | 'PRESS_EMAIL';
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/escalation/record-amplification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record amplification');
  return res.json();
}

// -------------------------------------------------------------
// REFERRAL SYSTEM API
// -------------------------------------------------------------

export async function fetchReferrals(username: string): Promise<ReferralStats> {
  const res = await fetch(`/api/referrals?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error('Failed to fetch referrals');
  return res.json();
}

export async function createReferralInvite(referrerName: string, refereeName: string): Promise<{ referral: ReferralRecord }> {
  const res = await fetch('/api/referrals/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referrerName, refereeName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create referral');
  }
  return res.json();
}

// -------------------------------------------------------------
// SUPPORT / DONATE API
// -------------------------------------------------------------

export async function fetchDonationConfig(): Promise<{
  donationUrl: string;
  initiativeName: string;
  transparentNote: string;
}> {
  const res = await fetch('/api/donation/config');
  if (!res.ok) {
    return {
      donationUrl: 'https://rzp.io/l/nagaravaani-support',
      initiativeName: 'Nagaravaani Smart City Open Civic Technology Fund',
      transparentNote: 'Citizen-funded open source civic grievance platform.',
    };
  }
  return res.json();
}
