import React from 'react';
import { IssueCategory, SeverityLevel } from '../types';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Users, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface IssueCardProps {
  category: IssueCategory;
  severity: SeverityLevel;
  explanation: string;
  location: string;
  crowdReportCount: number;
  reasons?: string[];
  photoUrl?: string;
  isDuplicate?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  category,
  severity,
  explanation,
  location,
  crowdReportCount,
  reasons = [],
  photoUrl,
  isDuplicate = false,
}) => {
  const { isDark } = useTheme();

  // Category-specific styles matching the prompt's instructions:
  // Pothole / Road Damage → Yellow/Brown/Amber
  // Flooding / Waterlogging → Blue/Cyan
  // Open Sewage / Drainage → Green/Emerald
  // Streetlight → Amber/Yellow
  // Road Blockage → Orange
  // Garbage → Gray/Teal/Green
  // Other → Neutral
  const getCategoryTheme = (cat: IssueCategory) => {
    switch (cat) {
      case 'Pothole / Road Damage':
        return {
          barColor: isDark ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]' : 'bg-amber-600',
          borderColor: isDark ? 'border-amber-500/50' : 'border-amber-400',
          indicator: '#f59e0b',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(245,158,11,0.15)]' : '',
        };
      case 'Flooding / Waterlogging':
        return {
          barColor: isDark ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]' : 'bg-sky-600',
          borderColor: isDark ? 'border-cyan-500/50' : 'border-sky-400',
          indicator: '#06b6d4',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(6,182,212,0.2)]' : '',
        };
      case 'Open Sewage / Drainage':
        return {
          barColor: isDark ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]' : 'bg-emerald-700',
          borderColor: isDark ? 'border-emerald-500/50' : 'border-emerald-400',
          indicator: '#10b981',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(16,185,129,0.2)]' : '',
        };
      case 'Broken Streetlight':
        return {
          barColor: isDark ? 'bg-yellow-400 shadow-[0_0_12px_#eab308]' : 'bg-yellow-500',
          borderColor: isDark ? 'border-yellow-500/50' : 'border-yellow-400',
          indicator: '#eab308',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(234,179,8,0.2)]' : '',
        };
      case 'Road Blockage / Rubble':
        return {
          barColor: isDark ? 'bg-orange-500 shadow-[0_0_12px_#ea580c]' : 'bg-orange-600',
          borderColor: isDark ? 'border-orange-500/50' : 'border-orange-400',
          indicator: '#ea580c',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(234,88,12,0.2)]' : '',
        };
      case 'Garbage / Waste':
        return {
          barColor: isDark ? 'bg-teal-400 shadow-[0_0_12px_#14b8a6]' : 'bg-teal-700',
          borderColor: isDark ? 'border-teal-500/50' : 'border-teal-400',
          indicator: '#14b8a6',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(20,184,166,0.2)]' : '',
        };
      case 'Foul Smell / Sanitation':
        return {
          barColor: isDark ? 'bg-lime-400 shadow-[0_0_12px_#84cc16]' : 'bg-lime-700',
          borderColor: isDark ? 'border-lime-500/50' : 'border-lime-400',
          indicator: '#84cc16',
          glowClass: isDark ? 'shadow-[0_0_25px_rgba(132,204,22,0.2)]' : '',
        };
      default:
        return {
          barColor: isDark ? 'bg-slate-400 shadow-[0_0_12px_#94a3b8]' : 'bg-slate-600',
          borderColor: isDark ? 'border-slate-700' : 'border-slate-300',
          indicator: '#94a3b8',
          glowClass: '',
        };
    }
  };

  const getSeverityStyle = (sev: SeverityLevel) => {
    if (isDark) {
      switch (sev) {
        case 'CRITICAL':
          return 'text-rose-400 bg-rose-950/60 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
        case 'HIGH':
          return 'text-orange-400 bg-orange-950/60 border-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
        case 'MEDIUM':
          return 'text-amber-400 bg-amber-950/60 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
        case 'LOW':
          return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      }
    }
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-300';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-300';
      case 'LOW':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    }
  };

  const theme = getCategoryTheme(category);

  return (
    <div className={`rounded-2xl border-2 ${theme.borderColor} ${theme.glowClass} ${
      isDark ? 'bg-slate-900/95 text-slate-100' : 'bg-white text-slate-900'
    } shadow-md overflow-hidden transition-all duration-300`}>
      
      {/* Top Category Color Bar Indicator */}
      <div className={`h-2.5 w-full ${theme.barColor}`} />

      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Category & Severity Header */}
        <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full inline-block shrink-0 shadow-xs" 
                style={{ backgroundColor: theme.indicator, boxShadow: isDark ? `0 0 10px ${theme.indicator}` : undefined }} 
              />
              <span className={`text-xs font-semibold tracking-wider uppercase ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Civic Classification
              </span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-black tracking-tight font-heading ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {category.toUpperCase()}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase border ${getSeverityStyle(severity)}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {severity} SEVERITY
            </span>
          </div>
        </div>

        {/* Short AI-Generated Explanation */}
        <div className={`rounded-xl p-4 border space-y-2 ${
          isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-bold ${
            isDark ? 'text-cyan-300 font-mono' : 'text-slate-700'
          }`}>
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
            <span>AI Assessment & Rationale</span>
          </div>
          <p className={`text-sm font-medium leading-relaxed ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            {explanation}
          </p>

          {/* Reasoning bullets */}
          {reasons.length > 0 && (
            <ul className={`pt-2 border-t space-y-1 text-xs ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-600'
            }`}>
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`}>·</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location & Crowd Reports Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Location Area */}
          <div className="space-y-1">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
              isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
            }`}>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            <p className={`text-sm font-semibold p-2.5 rounded-lg border ${
              isDark 
                ? 'bg-slate-950/80 text-slate-200 border-slate-800' 
                : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}>
              {location || 'Location provided by citizen'}
            </p>
          </div>

          {/* Crowd Reports Area */}
          <div className="space-y-1">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
              isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
            }`}>
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Crowd Verification
            </span>
            <div className={`flex items-center justify-between text-sm font-semibold p-2.5 rounded-lg border ${
              isDark 
                ? 'bg-slate-950/80 text-slate-200 border-slate-800' 
                : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}>
              <span>
                {crowdReportCount > 1 
                  ? `${crowdReportCount} citizens reported this issue`
                  : '1 citizen report (Initial discovery)'}
              </span>
              {crowdReportCount > 1 && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'text-emerald-700 bg-emerald-100 border-transparent'
                }`}>
                  Corroborated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Photographic Evidence Attachment */}
        {photoUrl && (
          <div className="pt-2">
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
              isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
            }`}>
              Photographic Evidence
            </span>
            <div className={`relative rounded-xl overflow-hidden border max-h-48 ${
              isDark ? 'border-cyan-500/30 bg-slate-950' : 'border-slate-200 bg-slate-900'
            }`}>
              <img
                src={photoUrl}
                alt="Civic Issue Proof"
                className="w-full h-44 object-cover hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded">
                Verified Civic Photo Attachment
              </div>
            </div>
          </div>
        )}

        {/* Anti-AI Slop Trust & Safety Disclaimer */}
        <div className={`text-[11px] italic pt-2 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-500'
        }`}>
          <span>AI-assisted evaluation for municipal prioritization. Does not replace official engineering tests.</span>
        </div>

      </div>
    </div>
  );
};
