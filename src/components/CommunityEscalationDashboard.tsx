import React, { useState, useEffect } from 'react';
import {
  CommunityEscalationCluster,
  Language,
  SocialPostDraft,
  PressOutletOption,
  PressEmailDraft,
} from '../types';
import {
  fetchEscalationClusters,
  fetchPressOutlets,
  generateEscalationPost,
  generatePressEmail,
  recordEscalationAmplification,
} from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import {
  Megaphone,
  AlertTriangle,
  Users,
  Calendar,
  MapPin,
  Building2,
  Share2,
  Twitter,
  Instagram,
  Copy,
  Check,
  ShieldAlert,
  Info,
  ExternalLink,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Newspaper,
  Tv,
  Mail,
  FileText,
  Flame,
  Send,
  ChevronRight,
} from 'lucide-react';

interface CommunityEscalationProps {
  currentLang: Language;
  onRefreshData?: () => void;
}

const FALLBACK_PRESS_OUTLETS: PressOutletOption[] = [
  {
    id: 'the-hindu',
    name: 'The Hindu',
    type: 'NEWSPAPER',
    desk: 'Hyderabad Bureau & Letters to the Editor',
    defaultEmail: 'letters@thehindu.co.in, hyderabad@thehindu.co.in',
    cityCoverage: 'Hyderabad & National Metro',
    circulationOrReach: 'Major English National Daily (Est. 1878)',
  },
  {
    id: 'times-of-india',
    name: 'The Times of India (Hyderabad Times)',
    type: 'NEWSPAPER',
    desk: "City Editor & Readers' Grievance Cell",
    defaultEmail: 'timesofindia.hyd@gmail.com, toieditorial@timesgroup.com',
    cityCoverage: 'Hyderabad & Pan-India',
    circulationOrReach: 'Largest Circulated English Daily',
  },
  {
    id: 'ndtv',
    name: 'NDTV (Civic & Ground Report Bureau)',
    type: 'NEWS_CHANNEL',
    desk: 'Citizen Watch & Special Reports Desk',
    defaultEmail: 'feedback@ndtv.com, specialreports@ndtv.com',
    cityCoverage: 'National Television & Digital Bureau',
    circulationOrReach: 'Major 24x7 Broadcast News Network',
  },
  {
    id: 'india-today',
    name: 'India Today / Aaj Tak',
    type: 'NEWS_CHANNEL',
    desk: 'Metro Investigation & Civic Grievance Cell',
    defaultEmail: 'metro@intoday.com, investigation@aajtak.com',
    cityCoverage: 'National News & Urban Issues Desk',
    circulationOrReach: 'Leading Television & Multimedia Network',
  },
  {
    id: 'deccan-chronicle',
    name: 'Deccan Chronicle',
    type: 'NEWSPAPER',
    desk: 'City Bureau & Chief Editor',
    defaultEmail: 'editor@deccanchronicle.com, citydesk@deccanchronicle.com',
    cityCoverage: 'Telangana & Andhra Pradesh Hub',
    circulationOrReach: 'Leading Regional English Daily',
  },
  {
    id: 'indian-express',
    name: 'The Indian Express',
    type: 'NEWSPAPER',
    desk: 'Investigative & City Reporter Desk',
    defaultEmail: 'express.hyd@expressindia.com, editor@indianexpress.com',
    cityCoverage: 'Telangana, South & National',
    circulationOrReach: 'Pioneering Investigative Journalism Daily',
  },
  {
    id: 'eenadu',
    name: 'Eenadu (ఈనాడు)',
    type: 'REGIONAL_DAILY',
    desk: 'City Central Desk & Readers Forum (నగర సంపాదక విభాగం)',
    defaultEmail: 'feedback@eenadu.net, editor@eenadu.net',
    cityCoverage: 'Hyderabad & Entire Telugu Region',
    circulationOrReach: 'Largest Circulated Telugu Daily Newspaper',
  },
  {
    id: 'sakshi',
    name: 'Sakshi (సాక్షి)',
    type: 'REGIONAL_DAILY',
    desk: 'Greater Hyderabad City Bureau (గ్రేటర్ హైదరాబాద్ డెస్క్)',
    defaultEmail: 'editorial@sakshi.com',
    cityCoverage: 'Greater Hyderabad & Telangana State',
    circulationOrReach: 'Leading Telugu Daily & 24x7 News Channel',
  },
];

export const CommunityEscalationDashboard: React.FC<CommunityEscalationProps> = ({
  currentLang,
  onRefreshData,
}) => {
  const { isDark } = useTheme();
  const [clusters, setClusters] = useState<CommunityEscalationCluster[]>([]);
  const [pressOutlets, setPressOutlets] = useState<PressOutletOption[]>(FALLBACK_PRESS_OUTLETS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCluster, setSelectedCluster] = useState<CommunityEscalationCluster | null>(null);

  // Top-of-page 7-Day Continuous High-Priority Letter to the Editor Studio state
  const [pressSelectedClusterId, setPressSelectedClusterId] = useState<string>('');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('the-hindu');
  const [customOutletName, setCustomOutletName] = useState<string>('');
  const [customEditorEmail, setCustomEditorEmail] = useState<string>('');
  const [storyAngle, setStoryAngle] = useState<'LETTER_TO_EDITOR' | 'HAZARD_ALERT' | 'INVESTIGATIVE_PITCH'>('LETTER_TO_EDITOR');
  const [pressDraft, setPressDraft] = useState<PressEmailDraft | null>(null);
  const [editedPressSubject, setEditedPressSubject] = useState<string>('');
  const [editedPressBody, setEditedPressBody] = useState<string>('');
  const [isGeneratingPress, setIsGeneratingPress] = useState<boolean>(false);
  const [pressApproved, setPressApproved] = useState<boolean>(true);
  const [pressCopyFeedback, setPressCopyFeedback] = useState<boolean>(false);
  const [pressStatusBanner, setPressStatusBanner] = useState<string | null>(null);

  // Social Post Modal / Drawer State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeDraft, setActiveDraft] = useState<SocialPostDraft | null>(null);
  const [editedXPost, setEditedXPost] = useState<string>('');
  const [editedInstaPost, setEditedInstaPost] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<'X' | 'INSTAGRAM'>('X');
  const [userHasApproved, setUserHasApproved] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [modalValidationNotice, setModalValidationNotice] = useState<string | null>(null);

  const loadEscalationData = async () => {
    try {
      setIsLoading(true);
      const [clustersRes, outletsRes] = await Promise.all([
        fetchEscalationClusters(),
        fetchPressOutlets().catch(() => ({ outlets: FALLBACK_PRESS_OUTLETS, total: FALLBACK_PRESS_OUTLETS.length })),
      ]);

      if (outletsRes.outlets && outletsRes.outlets.length > 0) {
        setPressOutlets(outletsRes.outlets);
      }

      if (clustersRes.clusters && clustersRes.clusters.length > 0) {
        setClusters(clustersRes.clusters);
        // Pick the first 7-day continuous high-priority cluster by default
        const qualified = clustersRes.clusters.filter(
          (c) =>
            c.qualifiesForPressEscalation ||
            (c.daysActive >= 7 && c.distinctReporterCount >= 2 && (c.aiSeverity === 'HIGH' || c.aiSeverity === 'CRITICAL'))
        );
        const initialCluster = qualified[0] || clustersRes.clusters[0];
        if (initialCluster) {
          setPressSelectedClusterId(initialCluster.communityIssueId);
          if (initialCluster.pressEmailDraft) {
            setPressDraft(initialCluster.pressEmailDraft);
            setEditedPressSubject(initialCluster.pressEmailDraft.subject);
            setEditedPressBody(initialCluster.pressEmailDraft.body);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load escalation clusters:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEscalationData();
  }, []);

  // Filter clusters that qualify for the 7-day continuous high-priority rule
  const qualifiedPressClusters = clusters.filter(
    (c) =>
      c.qualifiesForPressEscalation ||
      (c.daysActive >= 7 && c.distinctReporterCount >= 2 && (c.aiSeverity === 'HIGH' || c.aiSeverity === 'CRITICAL'))
  );

  const activePressCluster =
    clusters.find((c) => c.communityIssueId === pressSelectedClusterId) ||
    qualifiedPressClusters[0] ||
    clusters[0] ||
    null;

  const activeOutlet =
    pressOutlets.find((o) => o.id === selectedOutletId) || pressOutlets[0] || FALLBACK_PRESS_OUTLETS[0];

  const handleGenerateLetterToEditor = async (
    targetCluster: CommunityEscalationCluster | null = activePressCluster,
    outletIdOverride: string = selectedOutletId,
    angleOverride: 'LETTER_TO_EDITOR' | 'HAZARD_ALERT' | 'INVESTIGATIVE_PITCH' = storyAngle,
    useAiFlag: boolean = true
  ) => {
    if (!targetCluster) return;
    setIsGeneratingPress(true);
    setPressStatusBanner(null);

    try {
      const draft = await generatePressEmail({
        communityIssueId: targetCluster.communityIssueId,
        category: targetCluster.category,
        approximateLocation: targetCluster.approximateLocation,
        totalReportCount: targetCluster.totalReportCount,
        distinctReporterCount: targetCluster.distinctReporterCount,
        daysActive: targetCluster.daysActive,
        aiSeverity: targetCluster.aiSeverity,
        severityReasons: targetCluster.severityReasons,
        authorityName: targetCluster.authorityName || targetCluster.ward || 'Municipal Engineering Wing',
        outletId: outletIdOverride,
        customOutletName: outletIdOverride === 'custom' ? customOutletName : undefined,
        customEditorEmail: customEditorEmail.trim() || undefined,
        storyAngle: angleOverride,
        useAi: useAiFlag,
      });

      setPressDraft(draft);
      setEditedPressSubject(draft.subject);
      setEditedPressBody(draft.body);
      setPressStatusBanner(
        `Drafted formal ${
          angleOverride === 'LETTER_TO_EDITOR'
            ? 'Letter to the Editor'
            : angleOverride === 'HAZARD_ALERT'
            ? 'TV Broadcast Hazard Alert'
            : 'Investigative Pitch'
        } for ${draft.outletName} covering ${targetCluster.daysActive} continuous days of citizen reports.`
      );
    } catch (err) {
      console.error('Error generating Letter to the Editor:', err);
    } finally {
      setIsGeneratingPress(false);
    }
  };

  const handleSelectPressCluster = (cluster: CommunityEscalationCluster) => {
    setPressSelectedClusterId(cluster.communityIssueId);
    handleGenerateLetterToEditor(cluster, selectedOutletId, storyAngle, false);
  };

  const handleSelectOutlet = (outletId: string) => {
    setSelectedOutletId(outletId);
    if (activePressCluster) {
      handleGenerateLetterToEditor(activePressCluster, outletId, storyAngle, false);
    }
  };

  const handleSelectAngle = (newAngle: 'LETTER_TO_EDITOR' | 'HAZARD_ALERT' | 'INVESTIGATIVE_PITCH') => {
    setStoryAngle(newAngle);
    if (activePressCluster) {
      handleGenerateLetterToEditor(activePressCluster, selectedOutletId, newAngle, false);
    }
  };

  const handleCopyLetterToEditor = async () => {
    if (!pressApproved) {
      setPressStatusBanner('Please check the editorial verification box below before copying or dispatching.');
      return;
    }

    const fullLetter = `To: ${pressDraft?.editorDesk || activeOutlet.desk} (${pressDraft?.outletName || activeOutlet.name})\nEmail: ${
      customEditorEmail.trim() || pressDraft?.recipientEmail || activeOutlet.defaultEmail
    }\nSubject: ${editedPressSubject}\n\n${editedPressBody}`;

    await navigator.clipboard.writeText(fullLetter);
    setPressCopyFeedback(true);

    if (activePressCluster) {
      await recordEscalationAmplification({
        communityIssueId: activePressCluster.communityIssueId,
        platform: 'PRESS_EMAIL',
      }).catch(() => {});

      setClusters((prev) =>
        prev.map((c) => {
          if (c.communityIssueId === activePressCluster.communityIssueId) {
            const set = new Set([...c.amplifiedPlatforms, 'PRESS_EMAIL' as const]);
            return {
              ...c,
              amplifiedPlatforms: Array.from(set),
              escalationStatus: 'PRESS_ESCALATED',
            };
          }
          return c;
        })
      );
    }

    setPressStatusBanner(
      `Copied Letter to the Editor for ${pressDraft?.outletName || activeOutlet.name} & recorded Press Escalation!`
    );
    setTimeout(() => setPressCopyFeedback(false), 3000);
  };

  const handleRecordMailtoClick = async () => {
    if (!activePressCluster) return;
    await recordEscalationAmplification({
      communityIssueId: activePressCluster.communityIssueId,
      platform: 'PRESS_EMAIL',
    }).catch(() => {});

    setClusters((prev) =>
      prev.map((c) => {
        if (c.communityIssueId === activePressCluster.communityIssueId) {
          const set = new Set([...c.amplifiedPlatforms, 'PRESS_EMAIL' as const]);
          return {
            ...c,
            amplifiedPlatforms: Array.from(set),
            escalationStatus: 'PRESS_ESCALATED',
          };
        }
        return c;
      })
    );
  };

  const handleOpenAmplificationModal = async (cluster: CommunityEscalationCluster) => {
    setSelectedCluster(cluster);
    setUserHasApproved(false);
    setModalValidationNotice(null);

    if (cluster.socialPostDraft) {
      setActiveDraft(cluster.socialPostDraft);
      setEditedXPost(cluster.socialPostDraft.xPost);
      setEditedInstaPost(cluster.socialPostDraft.instagramCaption);
    } else {
      try {
        const draft = await generateEscalationPost({
          communityIssueId: cluster.communityIssueId,
          category: cluster.category,
          approximateLocation: cluster.approximateLocation,
          totalReportCount: cluster.totalReportCount,
          distinctReporterCount: cluster.distinctReporterCount,
          daysActive: cluster.daysActive,
          aiSeverity: cluster.aiSeverity,
          severityReasons: cluster.severityReasons,
          authorityName: cluster.authorityName || cluster.ward || 'Municipal Ward Cell',
        });
        setActiveDraft(draft);
        setEditedXPost(draft.xPost);
        setEditedInstaPost(draft.instagramCaption);
      } catch (err) {
        console.error(err);
      }
    }
    setShowModal(true);
  };

  const handleCopyOrShare = async (platform: 'X' | 'INSTAGRAM') => {
    if (!userHasApproved) {
      setModalValidationNotice('Please check the confirmation box below to verify you have reviewed and approved this civic post.');
      return;
    }

    setModalValidationNotice(null);
    const textToCopy = platform === 'X' ? editedXPost : editedInstaPost;
    await navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(platform);

    if (selectedCluster) {
      await recordEscalationAmplification({
        communityIssueId: selectedCluster.communityIssueId,
        platform,
      });

      setClusters((prev) =>
        prev.map((c) => {
          if (c.communityIssueId === selectedCluster.communityIssueId) {
            const set = new Set([...c.amplifiedPlatforms, platform]);
            return {
              ...c,
              amplifiedPlatforms: Array.from(set),
              escalationStatus: c.escalationStatus === 'PRESS_ESCALATED' ? 'PRESS_ESCALATED' : 'SOCIAL_AMPLIFIED',
            };
          }
          return c;
        })
      );
    }

    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const recipientEmailForMailto = (
    customEditorEmail.trim() ||
    pressDraft?.recipientEmail ||
    activeOutlet.defaultEmail ||
    'editor@thehindu.co.in'
  )
    .split(',')[0]
    .trim();

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmailForMailto)}?subject=${encodeURIComponent(
    editedPressSubject
  )}&body=${encodeURIComponent(editedPressBody)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ===================================================================== */}
      {/* TOP OF PAGE FEATURE: 7-DAY (1-WEEK) CONTINUOUS HIGH-PRIORITY          */}
      {/* LETTER TO THE EDITOR (BIG NEWS CHANNELS & NEWSPAPERS)                 */}
      {/* ===================================================================== */}
      <div
        id="top-press-escalation-studio"
        className={`rounded-2xl border p-6 sm:p-8 transition-all space-y-6 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-rose-950/30 border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.15)] text-slate-100'
            : 'bg-gradient-to-br from-white via-rose-50/30 to-amber-50/40 border-rose-200 shadow-md text-slate-900'
        }`}
      >
        {/* Top Feature Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                isDark
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                  : 'bg-rose-600 text-white shadow-sm'
              }`}
            >
              <Newspaper className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  7-Day (1-Week) Continuous High-Priority Media Escalation
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                    isDark
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {qualifiedPressClusters.length} High-Priority Issues Qualified (7+ Continuous Days)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                📰 Automatic Letter to the Editor — Big News Channels & Newspapers
              </h1>
              <p className={`text-xs sm:text-sm leading-relaxed max-w-4xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                When a <strong>HIGH or CRITICAL priority civic issue</strong> from <strong>one location</strong> is
                reported on <strong>multiple different days continuously by different citizens for 7 days (1 full week)</strong>{' '}
                without municipal resolution, Nagaravaani automatically drafts an official{' '}
                <strong>Letter to the Editor / Broadcast Bureau Alert</strong> for major national & regional newspapers
                and TV news channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={loadEscalationData}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-950 border-slate-800 hover:border-cyan-400 text-slate-200'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan 7-Day Logs</span>
            </button>
          </div>
        </div>

        {/* 4-Step Verification Rule Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              01
            </div>
            <div>
              <div className="text-xs font-bold">High / Critical Priority</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                AI-triaged as HIGH or CRITICAL public safety or sanitation hazard.
              </p>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              02
            </div>
            <div>
              <div className="text-xs font-bold">Single Pinpointed Location</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Clustered at the same ward sector / street corridor without resolution.
              </p>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <div className="text-xs font-bold">7 Continuous Days (1 Week)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reported across multiple different days continuously for 7+ days (1 full week).
              </p>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              04
            </div>
            <div>
              <div className="text-xs font-bold">Different Citizen Reporters</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Corroborated independently by multiple distinct citizens & drafted for Editors.
              </p>
            </div>
          </div>
        </div>

        {/* Main Interactive Studio Grid */}
        {activePressCluster && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* LEFT COLUMN (5 cols): Select 7-Day Issue, Inspect 7-Day Continuous Log, Pick Newspaper/News Channel */}
            <div className="lg:col-span-5 space-y-5">
              {/* Step 1: Qualified 7-Day Continuous High-Priority Issues */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>1. Select 7-Day Continuous High-Priority Issue:</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    1 Week+ Unresolved
                  </span>
                </div>

                <div className="space-y-2">
                  {(qualifiedPressClusters.length > 0 ? qualifiedPressClusters : clusters).map((cluster) => {
                    const isSelected = cluster.communityIssueId === activePressCluster.communityIssueId;
                    const continuousDays = cluster.continuousDaysReported || cluster.daysActive;
                    return (
                      <div
                        key={cluster.communityIssueId}
                        onClick={() => handleSelectPressCluster(cluster)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                              : 'bg-rose-50/90 border-rose-500 shadow-xs'
                            : isDark
                            ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded uppercase ${
                              cluster.aiSeverity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {cluster.aiSeverity} PRIORITY • {continuousDays} DAYS CONTINUOUS (1+ WK)
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{cluster.communityIssueId}</span>
                        </div>
                        <div className="font-bold text-xs sm:text-sm leading-snug">
                          {cluster.category} — {cluster.approximateLocation}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                            <Users className="w-3 h-3" />
                            {cluster.distinctReporterCount} Different Citizens
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Calendar className="w-3 h-3" />
                            {cluster.daysActive} Days Active
                          </span>
                          <span>•</span>
                          <span>{cluster.totalReportCount} Reports</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: 7-Day (1-Week) Continuous Multi-Citizen Reporting Log */}
              {activePressCluster.dailyReportLog && activePressCluster.dailyReportLog.length > 0 && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>7-Day (1-Week) Continuous Citizen Log at Location</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      7/7 Days Verified
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {activePressCluster.dailyReportLog.map((entry) => (
                      <div
                        key={`${entry.dayNumber}-${entry.ticketNumber}`}
                        className={`p-2 rounded-lg border text-[11px] flex items-start justify-between gap-2 ${
                          entry.dayNumber >= 7
                            ? isDark
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                            : isDark
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] ${
                                entry.dayNumber >= 7
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              Day {entry.dayNumber}
                            </span>
                            <span>{entry.date}</span>
                            <span className="text-emerald-400">• {entry.reporterName}</span>
                          </div>
                          <p className="text-[10px] opacity-85 leading-snug">{entry.summary}</p>
                        </div>
                        <span className="font-mono text-[10px] opacity-75 shrink-0">{entry.ticketNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Big News Channel or Newspaper */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" />
                  <span>2. Select Big News Channel or Major Newspaper:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pressOutlets.map((outlet) => {
                    const isSelected = outlet.id === selectedOutletId;
                    return (
                      <button
                        key={outlet.id}
                        type="button"
                        onClick={() => handleSelectOutlet(outlet.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-amber-50 border-amber-500 text-slate-900'
                            : isDark
                            ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {outlet.type === 'NEWS_CHANNEL' ? (
                            <Tv className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Newspaper className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{outlet.name}</div>
                          <div className="text-[10px] font-mono opacity-75 truncate">{outlet.desk}</div>
                          <span
                            className={`inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                              outlet.type === 'NEWS_CHANNEL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {outlet.type === 'NEWS_CHANNEL' ? 'TV News Channel' : outlet.type === 'REGIONAL_DAILY' ? 'Regional Daily' : 'National Newspaper'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Editor Email Override */}
                <div className="pt-1">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Optional Custom Editor / Newsroom Email Override:
                  </label>
                  <input
                    type="email"
                    value={customEditorEmail}
                    onChange={(e) => setCustomEditorEmail(e.target.value)}
                    placeholder={`Default: ${activeOutlet.defaultEmail}`}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Live Drafted Letter to the Editor & Dispatch Controls */}
            <div
              className={`lg:col-span-7 rounded-2xl border p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
                isDark
                  ? 'bg-slate-950/90 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {/* Editorial Format Tabs + AI Re-Draft Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectAngle('LETTER_TO_EDITOR')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        storyAngle === 'LETTER_TO_EDITOR'
                          ? isDark
                            ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                            : 'bg-rose-600 text-white'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Letter to the Editor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAngle('HAZARD_ALERT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        storyAngle === 'HAZARD_ALERT'
                          ? isDark
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-amber-600 text-white'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>TV Newsroom Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAngle('INVESTIGATIVE_PITCH')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        storyAngle === 'INVESTIGATIVE_PITCH'
                          ? isDark
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-900 text-white'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Investigative Story Pitch</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingPress}
                    onClick={() => handleGenerateLetterToEditor(activePressCluster, selectedOutletId, storyAngle, true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPress ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingPress ? 'Drafting with AI...' : 'Tailor Letter with AI'}</span>
                  </button>
                </div>

                {/* Recipient Desk Metadata Bar */}
                <div
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        To: The Editor — {pressDraft?.outletName || activeOutlet.name} ({pressDraft?.editorDesk || activeOutlet.desk})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Desk Email: {customEditorEmail.trim() || pressDraft?.recipientEmail || activeOutlet.defaultEmail}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-1 rounded border shrink-0 ${
                      isDark
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    ✓ 7-Day Multi-Citizen Dossier Attached
                  </span>
                </div>

                {/* Subject Line */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                    Formal Editorial Subject Line:
                  </label>
                  <input
                    type="text"
                    value={editedPressSubject}
                    onChange={(e) => setEditedPressSubject(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-rose-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                    }`}
                  />
                </div>

                {/* Letter to the Editor Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                      Drafted Letter to the Editor (Includes 7-Day Continuous Multi-Citizen Log):
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">{editedPressBody.length} chars</span>
                  </div>
                  <textarea
                    rows={13}
                    value={editedPressBody}
                    onChange={(e) => setEditedPressBody(e.target.value)}
                    className={`w-full p-3.5 rounded-xl border text-xs font-mono leading-relaxed focus:outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-rose-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Approval & Action Footer */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                {pressStatusBanner && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                      isDark
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pressStatusBanner}</span>
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pressApproved}
                    onChange={(e) => setPressApproved(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-0"
                  />
                  <span className="text-[11px] leading-relaxed opacity-90">
                    I confirm this Letter to the Editor accurately cites the <strong>7-day (1-week) continuous multi-citizen reports</strong> at{' '}
                    <strong>{activePressCluster.approximateLocation}</strong> and maintains a factual, non-defamatory civic tone.
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCopyLetterToEditor}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-100'
                        : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    {pressCopyFeedback ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied Letter to Editor!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Letter to the Editor</span>
                      </>
                    )}
                  </button>

                  <a
                    href={pressApproved ? mailtoHref : undefined}
                    onClick={(e) => {
                      if (!pressApproved) {
                        e.preventDefault();
                        setPressStatusBanner('Please check the confirmation box above before dispatching to the Editor.');
                        return;
                      }
                      handleRecordMailtoClick();
                    }}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      pressApproved
                        ? isDark
                          ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Letter to Editor ({pressDraft?.outletName || activeOutlet.name})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Banner: Community Escalation & Social Amplification */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] text-slate-100'
            : 'bg-white border-slate-200 shadow-sm text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black font-heading tracking-tight">
                    ALL MONITORED & ESCALATED CIVIC CLUSTERS
                  </h2>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      isDark
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Press + Social Amplification
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tracks multi-resident location clusters across 7+ continuous days for Newspaper/TV Editor letters and X/Instagram amplification.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadEscalationData}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 hover:border-cyan-500 text-slate-300'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Detection</span>
          </button>
        </div>
      </div>

      {/* Clusters List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-slate-400">
          Scanning civic grievance database for 7-day continuous community issues...
        </div>
      ) : clusters.length === 0 ? (
        <div className="p-12 text-center border rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-400">
            No persistent unresolved issues detected matching the 7+ day multi-reporter threshold.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clusters.map((cluster) => {
            const qualifiesPress =
              cluster.qualifiesForPressEscalation ||
              (cluster.daysActive >= 7 &&
                cluster.distinctReporterCount >= 2 &&
                (cluster.aiSeverity === 'HIGH' || cluster.aiSeverity === 'CRITICAL'));

            return (
              <div
                key={cluster.communityIssueId}
                className={`p-6 rounded-2xl border transition-all space-y-4 relative ${
                  qualifiesPress
                    ? isDark
                      ? 'bg-slate-900/90 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] text-slate-100'
                      : 'bg-white border-rose-400 shadow-sm text-slate-900'
                    : cluster.isPersistent
                    ? isDark
                      ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-100'
                      : 'bg-white border-amber-400 shadow-sm text-slate-900'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Badge: 7-Day Continuous High-Priority Press Escalation Header */}
                {qualifiesPress ? (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-between gap-2 ${
                      isDark
                        ? 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                      <span>
                        7-Day (1-Week) Continuous High-Priority — Qualified for Letter to Editor ({cluster.daysActive} days, {cluster.distinctReporterCount} citizens)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-800 text-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>
                      Monitoring Window: {cluster.daysActive}/7 continuous days toward Media Escalation threshold
                    </span>
                    <span className="font-bold">{Math.min(100, Math.round((cluster.daysActive / 7) * 100))}%</span>
                  </div>
                )}

                {/* Title & Category */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        isDark ? 'text-cyan-400' : 'text-emerald-700'
                      }`}
                    >
                      {cluster.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {cluster.communityIssueId}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg leading-tight">
                    {cluster.category} at {cluster.approximateLocation}
                  </h3>
                </div>

                {/* 4 Metadata Metrics in Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" /> CITIZENS
                    </span>
                    <span className="font-bold text-sm">{cluster.distinctReporterCount} distinct</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Copy className="w-3 h-3 text-cyan-400" /> REPORTS
                    </span>
                    <span className="font-bold text-sm">{cluster.totalReportCount} total</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> CONTINUOUS
                    </span>
                    <span className={`font-bold text-sm ${cluster.daysActive >= 7 ? 'text-rose-400 font-black' : ''}`}>
                      {cluster.daysActive} days
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" /> PRIORITY
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        cluster.aiSeverity === 'CRITICAL'
                          ? 'text-red-400'
                          : cluster.aiSeverity === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {cluster.aiSeverity}
                    </span>
                  </div>
                </div>

                {/* Distinct Reporters & Location */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium opacity-90 truncate">
                      Location: {cluster.approximateLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Authority: {cluster.authorityName || cluster.ward} | Reporters: {cluster.distinctReporters.slice(0, 4).join(', ')}
                      {cluster.distinctReporters.length > 4 ? ` +${cluster.distinctReporters.length - 4} more` : ''}
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">Status:</span>
                    <span
                      className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        cluster.escalationStatus === 'PRESS_ESCALATED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : cluster.escalationStatus === 'SOCIAL_AMPLIFIED'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : cluster.isPersistent
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {cluster.escalationStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectPressCluster(cluster);
                        const studioEl = document.getElementById('top-press-escalation-studio');
                        studioEl?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        qualifiesPress
                          ? isDark
                            ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                          : isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Draft Letter to Editor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAmplificationModal(cluster)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cluster.isPersistent
                          ? isDark
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                          : isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Social Post</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* SOCIAL MEDIA REVIEW & APPROVAL MODAL                      */}
      {/* ========================================================= */}
      {showModal && selectedCluster && activeDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-cyan-500/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Civic Social Amplification Review</h3>
                  <p className="text-xs text-slate-400">
                    Review, edit, and approve citizen post before sharing publicly.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                onClick={() => setActivePlatformTab('X')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activePlatformTab === 'X'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>X / Twitter (280 Chars)</span>
              </button>

              <button
                onClick={() => setActivePlatformTab('INSTAGRAM')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activePlatformTab === 'INSTAGRAM'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram Caption</span>
              </button>
            </div>

            {/* Editable Post Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-400">
                  {activePlatformTab === 'X' ? 'Edit X (Twitter) Post Draft:' : 'Edit Instagram Post Draft:'}
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {activePlatformTab === 'X' ? `${editedXPost.length} chars` : `${editedInstaPost.length} chars`}
                </span>
              </div>

              {activePlatformTab === 'X' ? (
                <textarea
                  rows={6}
                  value={editedXPost}
                  onChange={(e) => setEditedXPost(e.target.value)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
              ) : (
                <textarea
                  rows={8}
                  value={editedInstaPost}
                  onChange={(e) => setEditedInstaPost(e.target.value)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-sans leading-relaxed focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
              )}
            </div>

            {/* Legal Safeguard & Anti-Accusation Disclaimer */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-200 dark:text-slate-300">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Responsible Amplification Principles</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
                <li>Never exposes names, phone numbers, exact addresses or GPS coordinates publicly.</li>
                <li>
                  Clearly states that information comes from citizen reports and AI-assisted assessment, not an official
                  municipal determination.
                </li>
                <li>Factual, constructive tone: No accusations or claims that a municipality ignored an issue.</li>
              </ul>
            </div>

            {modalValidationNotice && (
              <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-200 text-xs">
                {modalValidationNotice}
              </div>
            )}

            {/* Mandatory User Approval Checkbox */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                userHasApproved
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : isDark
                  ? 'bg-slate-950/50 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={userHasApproved}
                onChange={(e) => {
                  setUserHasApproved(e.target.checked);
                  if (e.target.checked) setModalValidationNotice(null);
                }}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-0"
              />
              <span className="text-xs font-semibold leading-relaxed">
                I have reviewed this community post draft. I confirm it adheres to civic privacy standards, contains no
                private citizen information, and respectfully requests municipal attention.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              {activePlatformTab === 'X' && (
                <a
                  href={
                    userHasApproved
                      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(editedXPost)}`
                      : undefined
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!userHasApproved) {
                      e.preventDefault();
                      setModalValidationNotice('Please check the confirmation box above to approve the text first.');
                      return;
                    }
                    handleCopyOrShare('X');
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    userHasApproved
                      ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Open on X (Twitter)</span>
                </a>
              )}

              <button
                type="button"
                disabled={!userHasApproved}
                onClick={() => handleCopyOrShare(activePlatformTab)}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userHasApproved
                    ? isDark
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied & Amplification Recorded!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Approved Text for {activePlatformTab === 'X' ? 'X' : 'Instagram'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
