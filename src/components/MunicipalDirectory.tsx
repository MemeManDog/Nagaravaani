import React, { useState } from 'react';
import { MunicipalAuthority, Language } from '../types';
import { MunicipalOfficeCard } from './MunicipalOfficeCard';
import { useTheme } from '../context/ThemeContext';
import { Building2, Search, MapPin, Phone, ExternalLink } from 'lucide-react';

interface MunicipalDirectoryProps {
  currentLang: Language;
  offices: MunicipalAuthority[];
}

export const MunicipalDirectory: React.FC<MunicipalDirectoryProps> = ({ offices }) => {
  const { isDark } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filtered = offices.filter((off) => {
    if (selectedCity !== 'All' && !off.municipality.toLowerCase().includes(selectedCity.toLowerCase()) && !off.area.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        off.authorityName.toLowerCase().includes(q) ||
        off.department.toLowerCase().includes(q) ||
        off.area.toLowerCase().includes(q) ||
        off.municipality.toLowerCase().includes(q) ||
        off.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className={`rounded-2xl border p-6 sm:p-8 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Building2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
            }`}>
              Smart City Public Administration
            </span>
          </div>
          <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Municipal Authority & Zonal Office Directory
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Official jurisdictional records mapped to Nagaravaani automated dispatch system.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl text-xs font-bold ${
          isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'
        }`}>
          {['All', 'Hyderabad', 'Bengaluru', 'Delhi'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCity === c
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
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

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((office) => (
          <MunicipalOfficeCard key={office.id} authority={office} />
        ))}
      </div>

    </div>
  );
};
