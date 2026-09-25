import React, { useState } from 'react';
import { CivicReport, IssueCategory, Language, ReportLifecycleStatus } from '../types';
import { translations } from '../i18n/translations';
import { endorseReport, updateReportStatus } from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MapPin,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Send,
  Mail,
  Share2,
  Zap,
} from 'lucide-react';

interface CitizenDashboardProps {
  currentLang: Language;
  reports: CivicReport[];
  userPoints: number;
  userName: string;
  onRefreshReports: () => void;
  onNewReportClick: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentLang,
  reports,
  userPoints,
  userName,
  onRefreshReports,
  onNewReportClick,
}) => {
  const { isDark } = useTheme();
  const t = translations[currentLang];
  const [selectedTab, setSelectedTab] = useState<'all' | 'my'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [endorsingId, setEndorsingId] = useState<string | null>(null);
  const [simulatingStatusId, setSimulatingStatusId] = useState<string | null>(null);

  const handleEndorse = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setEndorsingId(reportId);
      await endorseReport(reportId);
      onRefreshReports();
    } catch (err) {
      console.error(err);
    } finally {
      setEndorsingId(null);
    }
  };

  const handleSimulateStatus = async (reportId: string, nextStatus: ReportLifecycleStatus) => {
    try {
      setSimulatingStatusId(reportId);
      await updateReportStatus(reportId, nextStatus, `Status transitioned to ${nextStatus}.`);
      onRefreshReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingStatusId(null);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (selectedTab === 'my' && r.citizenName.toLowerCase() !== userName.toLowerCase()) {
      return false;
    }
    if (selectedStatus !== 'All' && r.status !== selectedStatus) {
      return false;
    }
    if (selectedCategory !== 'All' && r.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.address.toLowerCase().includes(q) ||
        r.ticketNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusColor = (st: ReportLifecycleStatus) => {
    if (isDark) {
      switch (st) {
        case 'DRAFTED':
          return 'bg-slate-900 text-slate-400 border-slate-700';
        case 'READY TO REPORT':
          return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
        case 'REPORTED':
          return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] font-bold';
        case 'OFFICIALLY RECEIVED':
          return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
        case 'ACKNOWLEDGED':
          return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
        case 'IN PROGRESS':
          return 'bg-orange-950/80 text-orange-300 border-orange-500/40';
        case 'RESOLVED':
          return 'bg-teal-950/80 text-teal-300 border-teal-500/50 shadow-[0_0_8px_rgba(20,184,166,0.3)]';
      }
    }
    switch (st) {
      case 'DRAFTED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'READY TO REPORT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REPORTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'OFFICIALLY RECEIVED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ACKNOWLEDGED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'IN PROGRESS':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-400';
    }
  };

  const getCategoryColor = (cat: IssueCategory) => {
    if (isDark) {
      switch (cat) {
        case 'Pothole / Road Damage':
          return 'text-amber-300 border-amber-500/40 bg-amber-950/50';
        case 'Flooding / Waterlogging':
          return 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50';
        case 'Open Sewage / Drainage':
          return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/50';
        case 'Broken Streetlight':
          return 'text-yellow-300 border-yellow-500/40 bg-yellow-950/50';
        case 'Road Blockage / Rubble':
          return 'text-orange-300 border-orange-500/40 bg-orange-950/50';
        case 'Garbage / Waste':
          return 'text-teal-300 border-teal-500/40 bg-teal-950/50';
        case 'Foul Smell / Sanitation':
          return 'text-lime-300 border-lime-500/40 bg-lime-950/50';
        default:
          return 'text-slate-300 border-slate-700 bg-slate-900/60';
      }
    }
    switch (cat) {
      case 'Pothole / Road Damage':
        return 'text-amber-800 border-amber-300 bg-amber-50';
      case 'Flooding / Waterlogging':
        return 'text-sky-800 border-sky-300 bg-sky-50';
      case 'Open Sewage / Drainage':
        return 'text-emerald-800 border-emerald-300 bg-emerald-50';
      case 'Broken Streetlight':
        return 'text-yellow-800 border-yellow-300 bg-yellow-50';
      case 'Road Blockage / Rubble':
        return 'text-orange-800 border-orange-300 bg-orange-50';
      case 'Garbage / Waste':
        return 'text-teal-800 border-teal-300 bg-teal-50';
      case 'Foul Smell / Sanitation':
        return 'text-lime-800 border-lime-300 bg-lime-50';
      default:
        return 'text-slate-800 border-slate-300 bg-slate-50';
    }
  };

  const reportedCount = reports.filter((r) => r.status === 'REPORTED').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN PROGRESS' || r.status === 'ACKNOWLEDGED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-2xl border space-y-1 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
          }`}>
            Total Issues Logged
          </span>
          <div className={`text-3xl font-extrabold font-heading ${
            isDark ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-slate-900'
          }`}>
            {reports.length}
          </div>
          <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Recorded in Nagaravaani
          </span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-1 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-emerald-400 font-mono' : 'text-emerald-700'
          }`}>
            Active Citizen Reports
          </span>
          <div className={`text-3xl font-extrabold font-heading ${
            isDark ? 'text-emerald-400 neon-text-emerald' : 'text-emerald-600'
          }`}>
            {reportedCount}
          </div>
          <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Reporting initiated by citizens
          </span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-1 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-amber-400 font-mono' : 'text-amber-700'
          }`}>
            Field Inspection Phase
          </span>
          <div className={`text-3xl font-extrabold font-heading ${
            isDark ? 'text-amber-400' : 'text-amber-600'
          }`}>
            {inProgressCount}
          </div>
          <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Active ward repair works
          </span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-1 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
          }`}>
            Your Total Points
          </span>
          <div className={`text-3xl font-extrabold font-heading font-mono ${
            isDark ? 'text-cyan-300 neon-text-cyan' : 'text-emerald-600'
          }`}>
            {userPoints}
          </div>
          <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Logged as {userName}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`rounded-2xl border p-4 space-y-3 transition-all ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className={`flex items-center gap-1 p-1 rounded-xl ${
            isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'
          }`}>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedTab === 'all'
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All City Issues ({reports.length})
            </button>
            <button
              onClick={() => setSelectedTab('my')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedTab === 'my'
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Reports ({reports.filter((r) => r.citizenName.toLowerCase() === userName.toLowerCase()).length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by street, ticket # or issue type..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-950 border-cyan-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400'
                  : 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              }`}
            />
          </div>

          <button
            onClick={onNewReportClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            + Report New Issue
          </button>
        </div>

        {/* Status Filter */}
        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t text-xs ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <span className={`font-bold uppercase text-[10px] ${isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'}`}>
            Status:
          </span>
          {['All', 'REPORTED', 'ACKNOWLEDGED', 'IN PROGRESS', 'RESOLVED', 'READY TO REPORT'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatus === st
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900 text-white font-bold'
                  : isDark
                    ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            onClick={() => setActiveReportId(activeReportId === report.id ? null : report.id)}
            className={`rounded-2xl border transition-all p-5 space-y-3 cursor-pointer flex flex-col justify-between ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-slate-100'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
            }`}
          >
            <div className="space-y-3">
              
              {/* Category & Status Header */}
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(report.category)}`}>
                  {report.category}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className={`text-sm font-bold leading-snug line-clamp-2 font-heading ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {report.title}
                </h4>
                <p className={`text-xs line-clamp-2 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {report.description}
                </p>
              </div>

              {/* Photo Preview if attached */}
              {report.photoUrls && report.photoUrls.length > 0 && (
                <div className={`h-32 rounded-xl overflow-hidden border bg-slate-950 ${
                  isDark ? 'border-cyan-500/20' : 'border-slate-100'
                }`}>
                  <img
                    src={report.photoUrls[0]}
                    alt={report.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Location & Authority */}
              <div className={`space-y-1 text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{report.location.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className={`truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{report.assignedAuthority.authorityName}</span>
                </div>
                {report.reportingMethod && (
                  <div className={`text-[11px] font-semibold pt-0.5 ${
                    isDark ? 'text-cyan-400 font-mono' : 'text-emerald-700'
                  }`}>
                    Reported via: {report.reportingMethod}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions and Status Simulator */}
            <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between text-xs">
                
                <button
                  type="button"
                  onClick={(e) => handleEndorse(report.id, e)}
                  disabled={endorsingId === report.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-cyan-500/40'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Corroborate this civic problem"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
                  <span>{report.crowdReportCount} Confirmations</span>
                </button>

                <span className={`text-[11px] font-mono ${isDark ? 'text-cyan-400/80' : 'text-slate-400'}`}>
                  {report.ticketNumber}
                </span>
              </div>

              {/* Expanded Timeline View & Prototype Simulator */}
              {activeReportId === report.id && (
                <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  
                  {/* Status History Timeline with Strict AI Safety Labels */}
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
                    }`}>
                      Status History & Provenance
                    </span>
                    <div className="space-y-2 text-xs">
                      {report.statusHistory.map((hist, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${
                          isDark
                            ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                            : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            hist.updatedBy === 'Official Status'
                              ? isDark ? 'bg-purple-950 text-purple-300 border-purple-500/40' : 'bg-purple-50 text-purple-700 border-purple-200'
                              : hist.updatedBy === 'AI Assessment'
                              ? isDark ? 'bg-blue-950 text-blue-300 border-blue-500/40' : 'bg-blue-50 text-blue-700 border-blue-200'
                              : isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {hist.updatedBy}
                          </span>
                          <div className="overflow-hidden">
                            <span className={`font-bold text-[11px] block ${isDark ? 'text-white' : 'text-slate-800'}`}>{hist.status}</span>
                            <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{hist.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prototype Status Simulator Control */}
                  <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-100 border-slate-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${
                      isDark ? 'text-cyan-400 font-mono' : 'text-slate-600'
                    }`}>
                      Prototype Demo: Advance Status
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['REPORTED', 'ACKNOWLEDGED', 'IN PROGRESS', 'RESOLVED'] as ReportLifecycleStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateStatus(report.id, st);
                          }}
                          disabled={report.status === st || simulatingStatusId === report.id}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            report.status === st
                              ? isDark
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-800 text-white border-slate-800'
                              : isDark
                                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          Mark as {st}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center space-y-3 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold">
            No matching civic issues found
          </h4>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Try adjusting your search criteria or report a new problem in Step 1.
          </p>
        </div>
      )}

    </div>
  );
};
