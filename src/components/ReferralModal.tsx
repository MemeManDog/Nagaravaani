import React, { useState, useEffect } from 'react';
import { ReferralRecord, ReferralStats } from '../types';
import { fetchReferrals, createReferralInvite } from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import {
  Gift,
  Copy,
  Check,
  Users,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onRefreshPoints?: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  userName,
  onRefreshPoints,
}) => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [inviteFriendName, setInviteFriendName] = useState<string>('');
  const [isCreatingInvite, setIsCreatingInvite] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const loadReferralData = async () => {
    try {
      const data = await fetchReferrals(userName);
      setStats(data);
    } catch (e) {
      console.warn('Failed to load referrals:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReferralData();
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (stats?.userReferralCode) {
      navigator.clipboard.writeText(stats.userReferralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFriendName.trim()) return;
    try {
      setIsCreatingInvite(true);
      setInviteError(null);
      await createReferralInvite(userName, inviteFriendName.trim());
      setInviteFriendName('');
      loadReferralData();
      if (onRefreshPoints) onRefreshPoints();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to create invitation');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border p-6 sm:p-7 space-y-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
        isDark
          ? 'bg-slate-900 border-cyan-500/40 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              isDark
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-xl">
                  Refer a Friend
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  +20 Points per Friend
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reward awarded ONLY when your referred friend submits their first genuine civic report.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-mono p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> TOTAL INVITED
            </span>
            <span className="font-bold text-lg">
              {stats?.totalReferrals || 0} friends
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> PENDING 1ST REPORT
            </span>
            <span className="font-bold text-lg text-amber-400">
              {stats?.pendingCount || 0}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" /> REWARDED POINTS
            </span>
            <span className="font-bold text-lg text-emerald-400">
              +{stats?.totalBonusPointsEarned || 0} pts
            </span>
          </div>
        </div>

        {/* Referral Link & Code Box */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono font-bold uppercase text-slate-400 block mb-1">
              Your Unique Referral Link:
            </label>
            <div className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span className="truncate max-w-[420px]">{stats?.referralLink}</span>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30' : 'bg-white text-slate-800 hover:bg-slate-200'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold uppercase text-slate-400 block mb-1">
              Referral Code:
            </label>
            <div className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span className="font-extrabold text-sm tracking-wider">{stats?.userReferralCode}</span>
              <button
                onClick={handleCopyCode}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30' : 'bg-white text-slate-800 hover:bg-slate-200'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Anti-Abuse Integrity Notice */}
        <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
          isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2 font-bold text-slate-200 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Abuse Verification Rules:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] leading-relaxed">
            <li>Self-referrals are automatically rejected by the triage engine.</li>
            <li>Points are awarded strictly after the referred friend records their <strong>first genuine civic report</strong>.</li>
            <li>Duplicate accounts and repeated reports for the same issue receive 0 referral bonus.</li>
          </ul>
        </div>

        {/* Send Direct Invite / Record Simulation */}
        <form onSubmit={handleCreateInvite} className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase text-slate-400 block">
            Add or Track an Invited Friend:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteFriendName}
              onChange={(e) => setInviteFriendName(e.target.value)}
              placeholder="Enter friend's full name (e.g. Ramesh Kumar)"
              className={`flex-1 p-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            <button
              type="submit"
              disabled={isCreatingInvite || !inviteFriendName.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          </div>
          {inviteError && (
            <p className="text-xs text-red-400 font-semibold">{inviteError}</p>
          )}
        </form>

        {/* Referral Tracker Table (pending -> first report completed -> rewarded) */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
            Referral Status Tracker:
          </span>

          <div className="space-y-2 max-h-44 overflow-y-auto">
            {stats?.records && stats.records.length > 0 ? (
              stats.records.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    r.status === 'rewarded'
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isDark
                      ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {r.status === 'rewarded' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <span className="font-bold block">{r.refereeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {r.status === 'rewarded'
                          ? `1st report completed (${r.firstReportTicketNumber || 'Verified'})`
                          : 'Pending: Waiting for 1st civic report'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs ${
                      r.status === 'rewarded' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {r.status === 'rewarded' ? '+20 pts rewarded' : '0 pts (Pending)'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                No friends referred yet. Share your referral link above to earn 20 points per friend!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
