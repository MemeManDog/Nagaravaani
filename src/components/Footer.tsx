import React from 'react';
import { Building2, ShieldCheck, Heart, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t mt-16 py-10 px-4 sm:px-6 lg:px-8 text-xs transition-colors ${
      isDark
        ? 'bg-[#030612] border-slate-800 text-slate-400'
        : 'bg-white border-slate-200 text-slate-500'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className={`flex items-center gap-2 font-bold font-heading text-sm ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Building2 className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <span>Nagaravaani Civic Platform</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Autonomous civic grievance reporting and municipal routing. Built to bridge citizens and local municipal corporations.
            </p>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center gap-2 font-bold text-sm ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <span>Trust & Safety Transparency</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              AI classifications and severity ratings are advisory triage estimates. Precise geolocation is optional and never exposed on public leaderboards.
            </p>
          </div>

          <div className="space-y-2">
            <span className={`font-bold text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Supported Municipal Jurisdictions
            </span>
            <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              GHMC (Hyderabad) · BBMP (Bengaluru) · MCD (Delhi) · HMWSSB (Water & Sewerage). Configurable for Indian and global smart cities.
            </p>
          </div>
        </div>

        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 text-slate-500 font-mono text-[11px]' : 'border-slate-100 text-slate-400'
        }`}>
          <div>
            © {new Date().getFullYear()} Nagaravaani Platform. Designed for Smart City Citizen Empowerment.
          </div>
          <div className="flex items-center gap-4">
            {isDark && (
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="w-3 h-3 animate-pulse" />
                CYBER GRID MODE ACTIVE
              </span>
            )}
            <span>English · हिन्दी · తెలుగు Supported</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
