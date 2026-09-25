import React, { useState } from 'react';
import { MunicipalAuthority, Language } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Building2, Phone, MessageSquare, Mail, ExternalLink, MapPin, AlertCircle, Copy, Check, Printer, Languages, FileText } from 'lucide-react';

interface MunicipalOfficeCardProps {
  authority: MunicipalAuthority;
  complaintText?: string;
  complaintTranslations?: {
    en: string;
    hi: string;
    te: string;
  };
  initialLang?: Language;
  reportId?: string;
}

export const MunicipalOfficeCard: React.FC<MunicipalOfficeCardProps> = ({
  authority,
  complaintText,
  complaintTranslations,
  initialLang = 'en',
  reportId,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(initialLang);

  const getActiveComplaintText = () => {
    if (complaintTranslations) {
      if (selectedLang === 'hi' && complaintTranslations.hi) return complaintTranslations.hi;
      if (selectedLang === 'te' && complaintTranslations.te) return complaintTranslations.te;
      if (complaintTranslations.en) return complaintTranslations.en;
    }
    return complaintText || '';
  };

  const currentComplaint = getActiveComplaintText();

  const handleCopy = () => {
    if (currentComplaint) {
      navigator.clipboard.writeText(currentComplaint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (currentComplaint) {
      const langTitle = selectedLang === 'hi' ? 'औपचारिक नगर निगम शिकायत पत्र' : selectedLang === 'te' ? 'అధికారిక పురపాలక సంఘ ఫిర్యాదు పత్రం' : 'Formal Civic Grievance Letter';
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${langTitle} - ${reportId || 'Nagaravaani'}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
                pre { white-space: pre-wrap; font-family: monospace; background: #f8fafc; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; }
                .footer { margin-top: 30px; font-size: 12px; color: #64748b; }
              </style>
            </head>
            <body>
              <h2>Nagaravaani Smart City Grievance Document (${selectedLang.toUpperCase()})</h2>
              <p><strong>Report Reference:</strong> ${reportId || 'NGV-PENDING'}</p>
              <p><strong>Target Municipal Office:</strong> ${authority.authorityName} (${authority.address})</p>
              <pre>${currentComplaint}</pre>
              <div class="footer">Generated via Nagaravaani Civic Triage Platform for In-Person & Official Submission.</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const hasAnyContact = Boolean(authority.email || authority.whatsapp || authority.phone);

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 transition-all ${
      isDark
        ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)] text-slate-100'
        : 'bg-white border-slate-200 shadow-xs text-slate-900'
    }`}>
      
      {/* Header with explicit DEMO/MOCK tag */}
      <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
            }`}>
              Responsible Municipal Office
            </span>
          </div>
          <h4 className={`text-lg font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {authority.authorityName}
          </h4>
          <p className={`text-xs font-semibold ${isDark ? 'text-cyan-300' : 'text-emerald-700'}`}>
            {authority.department} · {authority.area}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {authority.isDemoData && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              DEMO AUTHORITY DATA
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded border shrink-0 ${
            isDark
              ? 'bg-slate-950 text-cyan-300 border-slate-800 font-mono'
              : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}>
            {authority.shortName}
          </span>
        </div>
      </div>

      {/* Officer & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className={`space-y-1 p-3 rounded-xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`font-bold uppercase tracking-wider block text-[10px] ${
            isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
          }`}>
            Designated Officer
          </span>
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {authority.designatedOfficer}
          </p>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Jurisdiction: {authority.area}
          </p>
        </div>

        <div className={`space-y-1 p-3 rounded-xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`font-bold uppercase tracking-wider block text-[10px] ${
            isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
          }`}>
            Zonal Office Address
          </span>
          <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {authority.address}
          </p>
        </div>
      </div>

      {/* Contact Channels or "Contact information unavailable" */}
      {hasAnyContact ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          
          {authority.phone ? (
            <a
              href={`tel:${authority.phone.replace(/[^0-9+]/g, '')}`}
              className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-950/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <Phone className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <div className="overflow-hidden">
                <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number</span>
                <span className={`font-semibold truncate block ${isDark ? 'text-white' : 'text-slate-800'}`}>{authority.phone}</span>
              </div>
            </a>
          ) : (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${
              isDark ? 'border-slate-800/80 bg-slate-950/40 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}>
              <Phone className="w-4 h-4 shrink-0" />
              <span className="text-[11px]">Phone not configured</span>
            </div>
          )}

          {authority.whatsapp ? (
            <a
              href={`https://wa.me/${authority.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="overflow-hidden">
                <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Official WhatsApp</span>
                <span className={`font-semibold truncate block ${isDark ? 'text-white' : 'text-slate-800'}`}>{authority.whatsapp}</span>
              </div>
            </a>
          ) : (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${
              isDark ? 'border-slate-800/80 bg-slate-950/40 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}>
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-[11px]">WhatsApp unavailable</span>
            </div>
          )}

          {authority.email ? (
            <a
              href={`mailto:${authority.email}`}
              className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-800 hover:border-sky-500/40 hover:bg-slate-950/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="overflow-hidden">
                <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Official Email</span>
                <span className={`font-semibold truncate block ${isDark ? 'text-white' : 'text-slate-800'}`}>{authority.email}</span>
              </div>
            </a>
          ) : (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${
              isDark ? 'border-slate-800/80 bg-slate-950/40 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}>
              <Mail className="w-4 h-4 shrink-0" />
              <span className="text-[11px]">Email unavailable</span>
            </div>
          )}

        </div>
      ) : (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
          isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Contact information unavailable for direct electronic submission.</span>
            <p>
              Please use the copy or print tools below to present the formal complaint at the zonal office counter.
            </p>
          </div>
        </div>
      )}

      {/* Formal Grievance Letter & Multilingual Translation Tabs */}
      {(complaintText || complaintTranslations) && (
        <div className={`pt-4 border-t space-y-3 text-xs ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <span className={`font-bold uppercase tracking-wider text-[11px] ${
                isDark ? 'text-cyan-400 font-mono' : 'text-slate-700'
              }`}>
                Formal Grievance Document
              </span>
            </div>

            {/* Language Selection Tabs */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === 'en'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === 'hi'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('te')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === 'te'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          {/* Letter preview */}
          <pre className={`p-4 rounded-xl border text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto ${
            isDark
              ? 'bg-slate-950/90 border-slate-800 text-slate-300'
              : 'bg-slate-50/80 border-slate-200 text-slate-800'
          }`}>
            {currentComplaint}
          </pre>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className={`text-[11px] italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Displaying complaint in {selectedLang === 'hi' ? 'Hindi (हिन्दी)' : selectedLang === 'te' ? 'Telugu (తెలుగు)' : 'English'}. Copy or print for official submission.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF ({selectedLang.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
