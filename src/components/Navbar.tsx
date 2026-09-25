import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, 
  Globe, 
  Award, 
  Sun, 
  Zap, 
  MapPin, 
  BarChart3, 
  PlusCircle, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'report' | 'dashboard' | 'map' | 'leaderboard' | 'directory';
  onTabChange: (tab: 'report' | 'dashboard' | 'map' | 'leaderboard' | 'directory') => void;
  userPoints: number;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  userPoints,
  userName,
  onUpdateUserName,
}) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const { isDark, toggleTheme } = useTheme();
  const t = translations[currentLang];

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setIsEditingUser(false);
    }
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
      isDark
        ? 'bg-slate-950/85 border-cyan-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]'
        : 'bg-white/95 border-slate-200 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onTabChange('report')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-300 group-hover:scale-105 ${
              isDark
                ? 'bg-slate-900 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-amber-400 shadow-sm'
            }`}>
              <Building2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-xl tracking-tight font-heading transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Nagara<span className={isDark ? 'text-cyan-400 neon-text-cyan' : 'text-emerald-600'}>vaani</span>
                </span>
                <span className={`hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border transition-colors ${
                  isDark
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isDark ? 'CIVIC GRID v2.5' : 'Smart City Portal'}
                </span>
              </div>
              <p className={`text-xs hidden md:block transition-colors ${
                isDark ? 'text-slate-400 font-mono text-[11px]' : 'text-slate-500'
              }`}>
                {isDark ? 'Neural Civic Triage & Municipal Routing' : 'Civic Triage & Municipal Reporting'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'report'
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${isDark && activeTab === 'report' ? 'text-cyan-400' : ''}`} />
              <span>{t.startReportBtn}</span>
            </button>

            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${isDark && activeTab === 'dashboard' ? 'text-cyan-400' : ''}`} />
              <span>{t.viewDashboardBtn}</span>
            </button>

            <button
              onClick={() => onTabChange('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'map'
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className={`w-4 h-4 ${isDark && activeTab === 'map' ? 'text-cyan-400' : ''}`} />
              <span>{t.liveMapBtn}</span>
            </button>

            <button
              onClick={() => onTabChange('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className={`w-4 h-4 ${isDark && activeTab === 'leaderboard' ? 'text-cyan-400' : ''}`} />
              <span>{t.leaderboardBtn}</span>
            </button>

            <button
              onClick={() => onTabChange('directory')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'directory'
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 text-white shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isDark && activeTab === 'directory' ? 'text-cyan-400' : ''}`} />
              <span>{t.municipalOfficesBtn}</span>
            </button>
          </nav>

          {/* Right Area: Theme Switcher, Language Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* FUTURISTIC / STANDARD THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none ${
                isDark
                  ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/50 shadow-[0_0_14px_rgba(6,182,212,0.4)] hover:border-cyan-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
              }`}
              title={isDark ? 'Switch to Standard Light Mode' : 'Switch to Futuristic Cyber Dark Mode'}
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
                  <span className="font-mono tracking-wider uppercase text-[11px] hidden sm:inline">CYBER</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="tracking-wider text-[11px] hidden sm:inline">LIGHT</span>
                </>
              )}
            </button>

            {/* Language Selector */}
            <div className={`relative flex items-center rounded-lg p-1 border transition-colors ${
              isDark
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <Globe className={`w-3.5 h-3.5 ml-1 mr-1 hidden sm:inline ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  currentLang === 'en'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  currentLang === 'hi'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी (Hindi)"
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('te')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  currentLang === 'te'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title="తెలుగు (Telugu)"
              >
                తెలుగు
              </button>
            </div>

            {/* Citizen Points & Profile */}
            <div className={`flex items-center gap-2 pl-2 border-l ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div 
                onClick={() => setIsEditingUser(!isEditingUser)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border ${
                  isDark
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                }`}
                title="Click to change your display name"
              >
                <Award className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className="text-xs font-bold font-mono tabular-nums">
                  {userPoints} <span className={`font-normal hidden sm:inline ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>pts</span>
                </span>
                <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
                <span className={`text-xs font-semibold max-w-[85px] sm:max-w-[110px] truncate ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className={`flex lg:hidden overflow-x-auto py-2 gap-2 border-t no-scrollbar text-xs ${
          isDark ? 'border-slate-800/80' : 'border-slate-100'
        }`}>
          <button
            onClick={() => onTabChange('report')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'report' 
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-white' 
                : isDark ? 'text-slate-400 bg-slate-900/60' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.startReportBtn}
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'dashboard' 
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-white' 
                : isDark ? 'text-slate-400 bg-slate-900/60' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.viewDashboardBtn}
          </button>
          <button
            onClick={() => onTabChange('map')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'map' 
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-white' 
                : isDark ? 'text-slate-400 bg-slate-900/60' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.liveMapBtn}
          </button>
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'leaderboard' 
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-white' 
                : isDark ? 'text-slate-400 bg-slate-900/60' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.leaderboardBtn}
          </button>
          <button
            onClick={() => onTabChange('directory')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'directory' 
                ? isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-white' 
                : isDark ? 'text-slate-400 bg-slate-900/60' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.municipalOfficesBtn}
          </button>
        </div>

        {/* User Display Name Popover */}
        {isEditingUser && (
          <div className={`absolute right-4 top-18 z-50 p-4 rounded-xl shadow-xl border w-72 backdrop-blur-md ${
            isDark
              ? 'bg-slate-900/95 border-cyan-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isDark ? 'text-cyan-300 font-mono' : 'text-slate-800'
            }`}>
              Citizen Profile & Privacy
            </h4>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Choose a public display name. Your exact location will remain protected.
            </p>
            <form onSubmit={handleNameSave} className="space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter display name"
                className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-cyan-500/40 text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                    : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                }`}
                maxLength={25}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingUser(false)}
                  className={`px-2.5 py-1 text-xs transition-colors ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    isDark
                      ? 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
