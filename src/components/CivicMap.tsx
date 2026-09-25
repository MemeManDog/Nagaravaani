import React, { useState } from 'react';
import { CivicReport, IssueCategory, Language } from '../types';
import { useTheme } from '../context/ThemeContext';
import { MapPin, ShieldAlert, Users, ExternalLink, Filter, Radio } from 'lucide-react';

interface CivicMapProps {
  currentLang: Language;
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
}

export const CivicMap: React.FC<CivicMapProps> = ({ reports, onSelectReport }) => {
  const { isDark } = useTheme();
  const [selectedCity, setSelectedCity] = useState<'All' | 'Hyderabad' | 'Bengaluru' | 'Delhi'>('All');
  const [activePin, setActivePin] = useState<CivicReport | null>(null);

  const filteredReports = reports.filter((r) => {
    if (selectedCity !== 'All' && !r.location.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getMarkerColor = (cat: IssueCategory) => {
    switch (cat) {
      case 'Pothole / Road Damage':
        return '#f59e0b';
      case 'Flooding / Waterlogging':
        return '#06b6d4';
      case 'Open Sewage / Drainage':
        return '#10b981';
      case 'Broken Streetlight':
        return '#eab308';
      case 'Road Blockage / Rubble':
        return '#ea580c';
      case 'Garbage / Waste':
        return '#14b8a6';
      case 'Foul Smell / Sanitation':
        return '#84cc16';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and City Filter */}
      <div className={`rounded-2xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Live Smart City Spatial Triage Map
            </h2>
            {isDark && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                <Radio className="w-3 h-3 animate-pulse" />
                RADAR ONLINE
              </span>
            )}
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time visual map of citizen-reported infrastructure hazards across smart city zones.
          </p>
        </div>

        {/* City Filter */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl text-xs font-bold ${
          isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'
        }`}>
          {['All', 'Hyderabad', 'Bengaluru', 'Delhi'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedCity(c as any);
                setActivePin(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCity === c
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Visualizer */}
      <div className={`relative rounded-2xl overflow-hidden border min-h-[480px] flex items-center justify-center transition-all ${
        isDark 
          ? 'border-cyan-500/30 bg-[#040714] shadow-[0_0_30px_rgba(0,0,0,0.8)]' 
          : 'border-slate-200 bg-slate-900 shadow-md'
      }`}>
        
        {/* Subtle Map Roads & Grid Background */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-25 cyber-grid' : 'opacity-20'}`}
          style={!isDark ? {
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          } : undefined}
        />

        {/* Major Arterial Highway Lines */}
        <svg className={`absolute inset-0 w-full h-full pointer-events-none ${isDark ? 'opacity-40' : 'opacity-30'}`}>
          <path d="M 0,240 Q 300,180 600,260 T 1200,200" stroke={isDark ? '#06b6d4' : '#38bdf8'} strokeWidth="5" fill="none" />
          <path d="M 200,0 Q 280,240 320,500" stroke={isDark ? '#10b981' : '#64748b'} strokeWidth="4" fill="none" />
          <path d="M 750,0 Q 700,280 820,500" stroke={isDark ? '#3b82f6' : '#64748b'} strokeWidth="4" fill="none" />
          <path d="M 0,380 L 1200,320" stroke={isDark ? '#a855f7' : '#475569'} strokeWidth="3" fill="none" strokeDasharray="8 4" />
        </svg>

        {/* Radar beam animation in dark mode */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
            <div className="w-[500px] h-[500px] rounded-full border border-cyan-400/40 animate-ping" />
            <div className="w-[300px] h-[300px] rounded-full border border-cyan-400/30" />
            <div className="w-[150px] h-[150px] rounded-full border border-cyan-400/20" />
          </div>
        )}

        {/* Interactive Map Pins */}
        <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
          {filteredReports.map((report, idx) => {
            const color = getMarkerColor(report.category);
            const topOffset = 18 + ((idx * 27) % 65);
            const leftOffset = 10 + ((idx * 23) % 78);

            return (
              <div
                key={report.id}
                style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                onClick={() => setActivePin(report)}
              >
                {/* Ping pulse for CRITICAL or HIGH */}
                {(report.severity === 'CRITICAL' || report.severity === 'HIGH') && (
                  <span 
                    className="absolute -top-1 -left-1 w-8 h-8 rounded-full opacity-70 animate-ping"
                    style={{ backgroundColor: color }}
                  />
                )}

                <div 
                  className={`relative w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-125 ${
                    isDark ? 'shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={`${report.category} (${report.severity})`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                <div className={`hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-30 pointer-events-none ${
                  isDark
                    ? 'bg-slate-950 text-cyan-300 border border-cyan-500/40 font-mono'
                    : 'bg-slate-900 text-white'
                }`}>
                  {report.category} · {report.severity}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Pin Detailed Popover */}
        {activePin && (
          <div className={`absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 z-40 rounded-2xl p-5 shadow-2xl border animate-in fade-in slide-in-from-bottom-3 duration-200 space-y-3 ${
            isDark
              ? 'bg-slate-900/95 border-cyan-500/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-slate-100 backdrop-blur-md'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-start justify-between gap-2 border-b pb-2 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
              }`}>
                {activePin.category}
              </span>
              <button
                onClick={() => setActivePin(null)}
                className={`text-xs font-bold ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-bold leading-snug font-heading ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {activePin.title}
              </h4>
              <p className={`text-xs line-clamp-2 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {activePin.description}
              </p>
            </div>

            <div className={`flex items-center justify-between text-xs pt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className={`font-semibold truncate max-w-[200px] ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {activePin.location.address}
              </span>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40 font-mono'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {activePin.status}
              </span>
            </div>

            <div className={`pt-2 border-t flex items-center justify-between ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className={`text-[11px] font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {activePin.crowdReportCount} Confirmations
              </span>
              <button
                type="button"
                onClick={() => onSelectReport(activePin)}
                className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  isDark ? 'text-cyan-400 hover:text-cyan-300 font-mono' : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span>View Full Ticket</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className={`absolute top-4 right-4 backdrop-blur-md border rounded-xl p-3 text-[11px] space-y-1.5 hidden sm:block ${
          isDark
            ? 'bg-slate-950/90 border-cyan-500/30 text-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.6)] font-mono'
            : 'bg-slate-900/90 border-slate-700 text-white'
        }`}>
          <span className={`font-bold uppercase tracking-wider block mb-1 ${
            isDark ? 'text-cyan-400' : 'text-slate-400'
          }`}>
            Category Legend
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
            <span>Pothole / Road Damage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span>Flooding / Waterlogging</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span>Open Sewage / Drainage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#eab308]" />
            <span>Broken Streetlight</span>
          </div>
        </div>

      </div>

    </div>
  );
};
