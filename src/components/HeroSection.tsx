import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, Sparkles, MapPin, Zap, ArrowRight, Mic, Camera, Radio } from 'lucide-react';

interface HeroSectionProps {
  currentLang: Language;
  onStartReport: () => void;
  onExploreDashboard: () => void;
  totalActiveReports: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onStartReport,
  onExploreDashboard,
  totalActiveReports,
}) => {
  const { isDark } = useTheme();
  const t = translations[currentLang];

  return (
    <section className={`relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark
        ? 'bg-gradient-to-b from-slate-950 via-[#070b1a] to-[#040612] text-white border-b border-cyan-500/20'
        : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-b border-slate-700'
    }`}>
      
      {/* Background Cyber Grid Pattern */}
      <div 
        className={`absolute inset-0 pointer-events-none ${
          isDark ? 'cyber-grid opacity-30' : 'opacity-10'
        }`}
        style={!isDark ? {
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        } : undefined}
      />

      {/* Cyberpunk Top Accent Glow Line */}
      {isDark && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4]" />
      )}

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        
        {/* Anti-Slop Clean Editorial / Cyber Kicker */}
        <div className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3.5 py-1.5 rounded-full transition-all ${
          isDark
            ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-400'
        }`}>
          {isDark ? (
            <>
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NEURAL CIVIC GRID // ACTIVE · HYDERABAD · BENGALURU · DELHI</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nagaravaani Multilingual Civic Agent · Hyderabad · Bengaluru · Delhi</span>
            </>
          )}
        </div>

        {/* Primary Mandated Slogan */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading max-w-4xl mx-auto leading-tight sm:leading-tight">
          Report civic problems. <br className="hidden sm:inline" />
          <span className={`text-transparent bg-clip-text ${
            isDark
              ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400'
          }`}>
            Let AI understand them.
          </span> <br className="hidden sm:inline" />
          Get them to the right authority.
        </h1>

        {/* Subtitle */}
        <p className={`max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-normal ${
          isDark ? 'text-slate-300' : 'text-slate-300'
        }`}>
          {t.heroSubheadline}
        </p>

        {/* Input Methods Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-mono'
              : 'bg-slate-800/90 border-slate-700 text-slate-300'
          }`}>
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>Voice Input (English / हिन्दी / తెలుగు)</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-mono'
              : 'bg-slate-800/90 border-slate-700 text-slate-300'
          }`}>
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multimodal Vision Triage</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-mono'
              : 'bg-slate-800/90 border-slate-700 text-slate-300'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automated Ward & Zonal Routing</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onStartReport}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all transform active:scale-98 cursor-pointer ${
              isDark
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] font-mono tracking-wide'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
            }`}
          >
            {isDark && <Zap className="w-4 h-4 fill-slate-950" />}
            <span>{t.startReportBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDashboard}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer border ${
              isDark
                ? 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-600'
            }`}
          >
            <span>{t.viewDashboardBtn}</span>
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
            }`}>
              {totalActiveReports} Active
            </span>
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className={`pt-6 border-t max-w-2xl mx-auto flex items-center justify-between text-xs transition-colors ${
          isDark ? 'border-slate-800 text-slate-400 font-mono' : 'border-slate-800 text-slate-400'
        }`}>
          <div>
            <span className={`font-mono font-bold text-sm ${isDark ? 'text-cyan-300' : 'text-white'}`}>100%</span>
            <span className="block text-slate-400">Automated Triage</span>
          </div>
          <div className={`w-px h-6 ${isDark ? 'bg-cyan-500/20' : 'bg-slate-800'}`} />
          <div>
            <span className={`font-mono font-bold text-sm ${isDark ? 'text-emerald-300' : 'text-white'}`}>3 Languages</span>
            <span className="block text-slate-400">English · हिन्दी · తెలుగు</span>
          </div>
          <div className={`w-px h-6 ${isDark ? 'bg-cyan-500/20' : 'bg-slate-800'}`} />
          <div>
            <span className={`font-mono font-bold text-sm ${isDark ? 'text-amber-300' : 'text-white'}`}>Verified Routing</span>
            <span className="block text-slate-400">GHMC · BBMP · MCD</span>
          </div>
        </div>
      </div>
    </section>
  );
};
