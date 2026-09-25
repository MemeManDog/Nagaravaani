import React, { useState, useEffect } from 'react';
import { CommunityEscalationCluster, Language, SocialPostDraft } from '../types';
import { fetchEscalationClusters, generateEscalationPost, recordEscalationAmplification } from '../services/agentApi';
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
  Edit3,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CommunityEscalationProps {
  currentLang: Language;
  onRefreshData?: () => void;
}

export const CommunityEscalationDashboard: React.FC<CommunityEscalationProps> = ({
  currentLang,
  onRefreshData,
}) => {
  const { isDark } = useTheme();
  const [clusters, setClusters] = useState<CommunityEscalationCluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCluster, setSelectedCluster] = useState<CommunityEscalationCluster | null>(null);

  // Social Post Modal / Drawer State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeDraft, setActiveDraft] = useState<SocialPostDraft | null>(null);
  const [editedXPost, setEditedXPost] = useState<string>('');
  const [editedInstaPost, setEditedInstaPost] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<'X' | 'INSTAGRAM'>('X');
  const [userHasApproved, setUserHasApproved] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const loadClusters = async () => {
    try {
      setIsLoading(true);
      const res = await fetchEscalationClusters();
      if (res.clusters) {
        setClusters(res.clusters);
      }
    } catch (e) {
      console.warn('Failed to load escalation clusters:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleOpenAmplificationModal = async (cluster: CommunityEscalationCluster) => {
    setSelectedCluster(cluster);
    setUserHasApproved(false);

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
          authorityName: cluster.ward || 'Municipal Ward Cell',
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
      alert('Please check the confirmation box below to verify you have reviewed and approved this civic post.');
      return;
    }

    const textToCopy = platform === 'X' ? editedXPost : editedInstaPost;
    await navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(platform);

    if (selectedCluster) {
      await recordEscalationAmplification({
        communityIssueId: selectedCluster.communityIssueId,
        platform,
      });

      // Update cluster amplified platforms locally
      setClusters((prev) =>
        prev.map((c) => {
          if (c.communityIssueId === selectedCluster.communityIssueId) {
            const set = new Set([...c.amplifiedPlatforms, platform]);
            return {
              ...c,
              amplifiedPlatforms: Array.from(set),
              escalationStatus: 'SOCIAL_AMPLIFIED',
            };
          }
          return c;
        })
      );
    }

    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleDirectTweet = () => {
    if (!userHasApproved) {
      alert('Please check the confirmation box below to approve the text first.');
      return;
    }
    const encoded = encodeURIComponent(editedXPost);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank', 'noopener,noreferrer');
    handleCopyOrShare('X');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 shadow-sm text-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
                isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <Megaphone className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black font-heading tracking-tight">
                    📢 COMMUNITY ESCALATION
                  </h2>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    isDark
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Social Amplification
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Detects persistent civic issues (7+ days active, multi-resident corroboration, unresolved). Prepares verified citizen social drafts for X and Instagram.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadClusters}
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

      {/* Persistence Filter Rule Explanation */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold">Algorithmic Escalation Criteria:</span>
          <p className="opacity-90 leading-relaxed">
            An issue qualifies for community escalation when: <strong>(1)</strong> Multiple DISTINCT citizens report the same problem; <strong>(2)</strong> Reports are concentrated in the approximate same sector/ward; <strong>(3)</strong> Issue has remained active for <strong>7+ days</strong>; <strong>(4)</strong> No confirmed resolution by authorities; <strong>(5)</strong> Prioritizes High/Critical AI-assisted severity.
          </p>
        </div>
      </div>

      {/* Clusters List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-slate-400">
          Scanning civic grievance database for persistent community issues...
        </div>
      ) : clusters.length === 0 ? (
        <div className="p-12 text-center border rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-400">
            No persistent unresolved issues detected matching the 7+ day multi-reporter threshold.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clusters.map((cluster) => (
            <div
              key={cluster.communityIssueId}
              className={`p-6 rounded-2xl border transition-all space-y-4 relative ${
                cluster.isPersistent
                  ? isDark
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-100'
                    : 'bg-white border-amber-400 shadow-sm text-slate-900'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Badge: Persistent Issue Detected Header */}
              {cluster.isPersistent && (
                <div className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
                  isDark
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                  <span>
                    Persistent Issue Detected — {cluster.totalReportCount} reports, {cluster.distinctReporterCount} users, {cluster.daysActive} days active, {cluster.aiSeverity} AI-assisted severity.
                  </span>
                </div>
              )}

              {/* Title & Category */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-cyan-400' : 'text-emerald-700'
                  }`}>
                    {cluster.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {cluster.communityIssueId}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg leading-tight">
                  {cluster.category} at {cluster.approximateLocation}
                </h3>
              </div>

              {/* 5 Metadata Metrics in Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" /> REPORTERS
                  </span>
                  <span className="font-bold text-sm">
                    {cluster.distinctReporterCount} distinct
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Copy className="w-3 h-3 text-cyan-400" /> TOTAL
                  </span>
                  <span className="font-bold text-sm">
                    {cluster.totalReportCount} reports
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> ACTIVE
                  </span>
                  <span className={`font-bold text-sm ${cluster.daysActive >= 7 ? 'text-amber-400 font-black' : ''}`}>
                    {cluster.daysActive} days
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" /> SEVERITY
                  </span>
                  <span className={`font-bold text-xs ${
                    cluster.aiSeverity === 'CRITICAL' ? 'text-red-400' : cluster.aiSeverity === 'HIGH' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {cluster.aiSeverity}
                  </span>
                </div>
              </div>

              {/* Approximate Location Notice */}
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-medium opacity-90 truncate">
                  Approx. Location: {cluster.approximateLocation}
                </span>
              </div>

              {/* Status and Amplification platforms */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">Status:</span>
                  <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                    cluster.escalationStatus === 'SOCIAL_AMPLIFIED'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                      : cluster.isPersistent
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {cluster.escalationStatus}
                  </span>

                  {cluster.amplifiedPlatforms.length > 0 && (
                    <span className="text-[10px] font-mono text-cyan-400">
                      ({cluster.amplifiedPlatforms.join(', ')})
                    </span>
                  )}
                </div>

                {/* Generate Social Post Button */}
                <button
                  onClick={() => handleOpenAmplificationModal(cluster)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cluster.isPersistent
                      ? isDark
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Generate Social Post</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* SOCIAL MEDIA REVIEW & APPROVAL MODAL                      */}
      {/* ========================================================= */}
      {showModal && selectedCluster && activeDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark
              ? 'bg-slate-900 border-cyan-500/40 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">
                    Civic Social Amplification Review
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review, edit, and approve citizen post before sharing publicly.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-mono p-1"
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
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2 font-bold text-slate-200 dark:text-slate-300">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Responsible Amplification Principles</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
                <li>Never exposes names, phone numbers, exact addresses or GPS coordinates publicly.</li>
                <li>Clearly states that information comes from citizen reports and AI-assisted assessment, not an official municipal determination.</li>
                <li>Factual, constructive tone: No accusations or claims that a municipality ignored an issue.</li>
              </ul>
            </div>

            {/* Mandatory User Approval Checkbox (Requirement 2: Never automatically post without approval) */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
              userHasApproved
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isDark
                ? 'bg-slate-950/50 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={userHasApproved}
                onChange={(e) => setUserHasApproved(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-0"
              />
              <span className="text-xs font-semibold leading-relaxed">
                I have reviewed this community post draft. I confirm it adheres to civic privacy standards, contains no private citizen information, and respectfully requests municipal attention.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              {activePlatformTab === 'X' && (
                <button
                  type="button"
                  disabled={!userHasApproved}
                  onClick={handleDirectTweet}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userHasApproved
                      ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Open on X (Twitter)</span>
                </button>
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
