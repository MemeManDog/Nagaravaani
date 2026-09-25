import React, { useState, useEffect } from 'react';
import { fetchDonationConfig } from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import {
  Heart,
  ExternalLink,
  ShieldCheck,
  Zap,
  Building2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [donationUrl, setDonationUrl] = useState<string>('https://rzp.io/l/nagaravaani-support');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchDonationConfig()
        .then((res) => {
          if (res.donationUrl) setDonationUrl(res.donationUrl);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(donationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProceed = () => {
    window.open(donationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl border p-6 sm:p-7 space-y-6 shadow-2xl transition-all ${
        isDark
          ? 'bg-slate-900 border-cyan-500/40 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              isDark
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                : 'bg-pink-100 text-pink-700'
            }`}>
              <Heart className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl">
                Support Nagaravaani
              </h3>
              <p className="text-xs text-slate-400">
                Citizen-Funded Open Civic Technology Initiative
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

        {/* Core Transparency Notice */}
        <div className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${
          isDark
            ? 'bg-slate-950/70 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2 font-bold text-slate-100 dark:text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>How your voluntary support is utilized:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-90">
            <li>Zero commercial advertising or monetization of citizen grievance data.</li>
            <li>Covers server costs for 24/7 Exotel telephony gateway (04041895372).</li>
            <li>Powers multilingual speech-to-text inference in Telugu, Hindi & English.</li>
            <li>Maintains open, unpaywalled civic complaint routing to municipal corporations.</li>
          </ul>
        </div>

        {/* Security & Financial Integrity Guarantee */}
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
          isDark
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <p className="text-[11px] leading-tight">
            <strong>PCI-DSS Safe:</strong> Nagaravaani never requests, handles, or stores debit/credit card numbers or banking secrets. All voluntary contributions occur on certified external payment rails.
          </p>
        </div>

        {/* Configurable URL & Link Display */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
            Configurable Contribution Link:
          </label>
          <div className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
            isDark ? 'bg-slate-950 border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <span className="truncate max-w-[300px]">{donationUrl}</span>
            <button
              onClick={handleCopyLink}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-pink-500 hover:bg-pink-400 text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            <span>Proceed to Contribution Gateway</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
