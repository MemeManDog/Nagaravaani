import React, { useState, useRef, useEffect } from 'react';
import {
  AgentAnalysisResponse,
  CivicReport,
  Language,
  ReportingMethod,
  AwardPointsResult,
} from '../types';
import { translations } from '../i18n/translations';
import { SAMPLE_INPUT_PRESETS } from '../data/mockData';
import { analyzeCivicIssue, recordReportAction, translateComplaintText } from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import { IssueCard } from './IssueCard';
import { MunicipalOfficeCard } from './MunicipalOfficeCard';
import {
  Mic,
  MicOff,
  UploadCloud,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Share2,
  Mail,
  RefreshCw,
  Edit3,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  Printer,
  ExternalLink,
  Check,
  Building2,
  Info,
  Radio,
  Zap,
  Languages,
} from 'lucide-react';

interface ReportWizardProps {
  currentLang: Language;
  userName: string;
  onReportSubmitted: (report: CivicReport, pointsAwarded: number, userTotalPoints: number) => void;
  onViewDashboard: () => void;
  onViewDirectory: () => void;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  currentLang,
  userName,
  onReportSubmitted,
  onViewDashboard,
  onViewDirectory,
}) => {
  const { isDark } = useTheme();
  const t = translations[currentLang];

  // Wizard Step State (1: Describe, 2: Photo, 3: Location, 4: AI Analysis & Reporting Channels)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Description & Voice
  const [description, setDescription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Step 2: Photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 3: Location
  const [locationMode, setLocationMode] = useState<'prompt' | 'auto' | 'manual'>('prompt');
  const [locationText, setLocationText] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Step 4: AI Agent Analysis & Reporting Actions
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [agentResult, setAgentResult] = useState<AgentAnalysisResponse | null>(null);
  const [editableComplaint, setEditableComplaint] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [complaintLang, setComplaintLang] = useState<Language>(currentLang || 'en');
  const [isTranslatingComplaint, setIsTranslatingComplaint] = useState<boolean>(false);

  // Requirement 1 & 7: Reporting State and Dedicated Confirmation Screen
  const [isRecordingReport, setIsRecordingReport] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<(AwardPointsResult & { referralNotice?: string }) | null>(null);
  const [showOfficeDetail, setShowOfficeDetail] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>(() => {
    return localStorage.getItem('civicai_referral_code') || '';
  });

  // Speech Recognition setup (Web Speech API)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (currentLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (currentLang === 'te') {
        recognition.lang = 'te-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access denied. You can continue typing.');
        } else {
          setSpeechError('Could not capture audio. Please speak clearly or type.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert(t.speechUnsupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  // Image Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUsePreset = (preset: typeof SAMPLE_INPUT_PRESETS[0]) => {
    setDescription(preset.description);
    setLocationText(preset.locationText);
    setPhotoPreview(preset.photoUrl);
    setPhotoBase64(null);
    setCurrentStep(1);
  };

  // Geolocation Handler
  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocationMode('auto');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          const approxAddress = `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) · Khairatabad Ward`;
          setLocationText(approxAddress);
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsLocating(false);
          setLocationText('Jubilee Hills / Ameerpet Road 36, Hyderabad');
          setCoords({ lat: 17.4375, lng: 78.4483 });
        },
        { timeout: 7000 }
      );
    } else {
      setIsLocating(false);
      setLocationText('Main Municipal Avenue, Central Ward');
    }
  };

  // Step 4 Trigger: Run Agentic Pipeline (DOES NOT AWARD POINTS!)
  const handleRunAgent = async () => {
    if (!description.trim()) {
      alert('Please describe the problem in Step 1 first.');
      setCurrentStep(1);
      return;
    }

    setCurrentStep(4);
    setIsAnalyzing(true);
    setAgentResult(null);
    setConfirmationData(null);

    try {
      const result = await analyzeCivicIssue({
        description,
        imageBase64: photoBase64 || undefined,
        imageMimeType: photoMimeType,
        locationText: locationText || 'Smart City Municipal Ward',
        coordinates: coords,
        citizenName: userName,
        preferredLanguage: currentLang,
      });

      setAgentResult(result);
      const initialText = (result.formalComplaint.translations && result.formalComplaint.translations[currentLang])
        ? result.formalComplaint.translations[currentLang]
        : result.formalComplaint.body;
      setEditableComplaint(initialText);
      setComplaintLang(currentLang);
    } catch (err: any) {
      console.error('Agent analysis failed:', err);
      alert('Analysis encountered an issue. Re-running with local smart city edge rules.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSwitchComplaintLanguage = async (targetLang: Language) => {
    if (targetLang === complaintLang || !agentResult) return;
    setComplaintLang(targetLang);

    // If pre-generated translation is available, switch directly
    if (agentResult.formalComplaint.translations && agentResult.formalComplaint.translations[targetLang]) {
      setEditableComplaint(agentResult.formalComplaint.translations[targetLang]);
      return;
    }

    setIsTranslatingComplaint(true);
    try {
      const translated = await translateComplaintText({
        text: editableComplaint,
        targetLanguage: targetLang,
        category: agentResult.classification.category,
        severity: agentResult.severity.level,
        locationText: agentResult.locationAnalysis.resolvedAddress,
        citizenName: userName,
        authority: agentResult.authority,
      });
      setEditableComplaint(translated);
    } catch (e) {
      console.warn('Complaint translation failed:', e);
    } finally {
      setIsTranslatingComplaint(false);
    }
  };

  // Copy Complaint to Clipboard
  const handleCopyComplaint = () => {
    navigator.clipboard.writeText(editableComplaint);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Requirement 1 & 5: AWARD POINTS ONLY UPON INITIATING A REPORTING ACTION!
  const handleInitiateReporting = async (method: ReportingMethod) => {
    if (!agentResult) return;
    setIsRecordingReport(true);

    try {
      const result = await recordReportAction({
        citizenName: userName,
        reportingMethod: method,
        editedComplaintText: editableComplaint,
        agentAnalysis: agentResult,
        referralCode: referralCode.trim() || undefined,
      });

      // Update local confirmation state
      setConfirmationData(result);

      // Trigger callback to App root to update global state and award points
      onReportSubmitted(result.report, result.pointsAwarded, result.userTotalPoints);

      // Handle real protocol triggers
      if (method === 'Email' && agentResult.authority.email) {
        const mailtoUrl = `mailto:${encodeURIComponent(agentResult.authority.email)}?subject=${encodeURIComponent(
          agentResult.formalComplaint.subject
        )}&body=${encodeURIComponent(editableComplaint)}`;
        window.location.href = mailtoUrl;
      } else if (method === 'WhatsApp' && agentResult.authority.whatsapp) {
        const cleanPhone = agentResult.authority.whatsapp.replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(editableComplaint)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to record reporting action:', error);
      alert('Could not record report in municipal ledger. Please try again.');
    } finally {
      setIsRecordingReport(false);
    }
  };

  // Reset Form for New Report
  const handleStartFresh = () => {
    setCurrentStep(1);
    setDescription('');
    setPhotoPreview(null);
    setPhotoBase64(null);
    setLocationText('');
    setCoords(undefined);
    setLocationMode('prompt');
    setAgentResult(null);
    setConfirmationData(null);
    setShowOfficeDetail(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Step Progress Header */}
      {!confirmationData && (
        <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            
            <button
              onClick={() => setCurrentStep(1)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : currentStep > 1
                  ? isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isDark
                    ? 'text-slate-500 bg-slate-950/60'
                    : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400 font-mono' : 'text-slate-400'}`}>Step 1</span>
              <span className="truncate block font-heading">Describe</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 2
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : currentStep > 2
                  ? isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isDark
                    ? 'text-slate-500 bg-slate-950/60'
                    : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400 font-mono' : 'text-slate-400'}`}>Step 2</span>
              <span className="truncate block font-heading">Photo</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 3
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : currentStep > 3
                  ? isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isDark
                    ? 'text-slate-500 bg-slate-950/60'
                    : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400 font-mono' : 'text-slate-400'}`}>Step 3</span>
              <span className="truncate block font-heading">Location</span>
            </button>

            <button
              onClick={() => {
                if (description.trim()) handleRunAgent();
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStep === 4
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : isDark
                    ? 'text-slate-500 bg-slate-950/60'
                    : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span className={`block text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400 font-mono' : 'text-slate-400'}`}>Step 4</span>
              <span className="truncate block font-heading">AI Triage</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: DESCRIBE THE PROBLEM (TEXT & VOICE)                */}
      {/* ========================================================= */}
      {currentStep === 1 && !confirmationData && (
        <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className="space-y-1">
            <h2 className={`text-xl sm:text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.step1Title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.step1Subtitle}
            </p>
          </div>

          <div className="relative">
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.describePlaceholder}
              className={`w-full p-4 rounded-xl border text-base leading-relaxed resize-none transition-all ${
                isDark
                  ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                  : 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs'
              }`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? isDark
                        ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                        : 'bg-rose-600 text-white shadow-md animate-pulse'
                      : isDark
                        ? 'bg-slate-950 border border-cyan-500/40 text-cyan-300 hover:bg-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span>{t.speechStop}</span>
                    </>
                  ) : (
                    <>
                      <Mic className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
                      <span>{t.speechStart}</span>
                    </>
                  )}
                </button>

                {isListening && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-500 font-bold animate-pulse font-mono">
                      {t.speechListening}
                    </span>
                    {/* Futuristic audio waveform visualizer */}
                    <div className="flex items-center gap-1 h-5 px-2 bg-rose-950/60 rounded-md border border-rose-500/40">
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-1" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-2" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-3" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-1" />
                    </div>
                  </div>
                )}
                {speechError && (
                  <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {speechError}
                  </span>
                )}
              </div>

              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {description.length} characters
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
            }`}>
              {isDark ? '⚡ Quick Cyber Telemetry Presets' : t.samplePromptsLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_INPUT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleUsePreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs space-y-1 cursor-pointer ${
                    isDark
                      ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 text-slate-200'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-800'
                  }`}
                >
                  <div className={`font-bold ${isDark ? 'text-white font-heading' : 'text-slate-900'}`}>
                    {preset.label}
                  </div>
                  <div className={`line-clamp-1 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                if (!description.trim()) {
                  alert('Please enter a description or click a sample preset.');
                  return;
                }
                setCurrentStep(2);
              }}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>Continue to Step 2</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: UPLOAD PHOTOGRAPH (MULTIMODAL AI)                 */}
      {/* ========================================================= */}
      {currentStep === 2 && !confirmationData && (
        <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className="space-y-1">
            <h2 className={`text-xl sm:text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.step2Title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.step2Subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all overflow-hidden ${
                  isDark
                    ? 'border-cyan-500/40 hover:border-cyan-400 bg-slate-950/70 hover:bg-cyan-950/20'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                {/* Holographic scanner effect in dark mode */}
                {isDark && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent h-8 w-full animate-scanline" />
                )}

                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${
                  isDark
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white font-heading' : 'text-slate-800'}`}>
                  {t.uploadLabel}
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.uploadHint}
                </p>
                <button
                  type="button"
                  className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDark
                      ? 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Select File from Device
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`relative rounded-2xl overflow-hidden border max-h-72 bg-slate-950 ${
                  isDark ? 'border-cyan-500/40' : 'border-slate-200'
                }`}>
                  <img
                    src={photoPreview}
                    alt="Civic Issue Upload"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoBase64(null);
                      }}
                      className="p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`absolute bottom-3 left-3 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
                    isDark
                      ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300 font-mono shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-emerald-400'}`} />
                    <span>{t.photoAnalyzedBadge}</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Multimodal AI will assess structural damage and safety risks.</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`font-bold hover:underline ${isDark ? 'text-cyan-400' : 'text-emerald-700'}`}
                  >
                    Replace Photo
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Preset Photos */}
            <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
              }`}>
                Or select sample civic photo:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_INPUT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPhotoPreview(p.photoUrl);
                      setPhotoBase64(null);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left group transition-all ${
                      isDark
                        ? 'border-slate-800 hover:border-cyan-400 bg-slate-950'
                        : 'border-slate-200 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    <img
                      src={p.photoUrl}
                      alt={p.category}
                      className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className={`p-1.5 text-[10px] font-bold truncate ${
                      isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'
                    }`}>
                      {p.category.split('/')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.optionalNotice}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-4 py-2 text-xs font-bold ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Back to Description
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>Continue to Location</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: LOCATION IDENTIFICATION (PRIVACY FIRST)           */}
      {/* ========================================================= */}
      {currentStep === 3 && !confirmationData && (
        <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}>
          <div className="space-y-1">
            <h2 className={`text-xl sm:text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.step3Title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.locationPrompt}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleUseMyLocation}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                locationMode === 'auto'
                  ? isDark
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : isDark
                    ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isDark
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className={`text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.useMyLocationBtn}
              </h4>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Obtain GPS coordinates and automatically map to your smart city administrative ward.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setLocationMode('manual')}
              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                locationMode === 'manual'
                  ? isDark
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : isDark
                    ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isDark
                  ? 'bg-slate-900 text-slate-300 border border-slate-700'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                <Edit3 className="w-5 h-5" />
              </div>
              <h4 className={`text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.enterManuallyBtn}
              </h4>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter a street name, landmark, colony, or area without sharing device coordinates.
              </p>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {isLocating && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold animate-pulse ${
                isDark
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-mono'
                  : 'bg-emerald-50 text-emerald-800'
              }`}>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.locatingText}</span>
              </div>
            )}

            <label className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
            }`}>
              Civic Location / Landmark
            </label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => {
                setLocationText(e.target.value);
                setLocationMode('manual');
              }}
              placeholder={t.locationPlaceholder}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                isDark
                  ? 'bg-slate-950/90 border-cyan-500/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'
                  : 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              }`}
            />
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
            <p className="leading-relaxed">
              {t.privacyGuarantee}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`px-4 py-2 text-xs font-bold ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Back to Photo
            </button>

            <button
              type="button"
              onClick={handleRunAgent}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                isDark
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Civic Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: AI ANALYSIS & REPORTING ACTIONS (NO POINTS YET)   */}
      {/* ========================================================= */}
      {currentStep === 4 && !confirmationData && (
        <div className="space-y-6">
          
          {isAnalyzing && (
            <div className={`rounded-2xl border p-8 sm:p-12 text-center space-y-4 transition-all ${
              isDark
                ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-slate-100'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}>
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center animate-spin ${
                isDark
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.analyzingHeadline}
              </h3>
              <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {t.analyzingSub}
              </p>
            </div>
          )}

          {!isAnalyzing && agentResult && (
            <div className="space-y-6">
              
              {/* Duplicate / Crowd Warning Notice */}
              {agentResult.duplicateCheck.hasSimilarReports && (
                <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                  isDark
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h5 className={`font-bold text-sm ${isDark ? 'text-amber-300 font-heading' : 'text-amber-950'}`}>
                      {t.duplicateWarningTitle}
                    </h5>
                    <p className={`font-medium ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                      {agentResult.duplicateCheck.message}
                    </p>
                  </div>
                </div>
              )}

              {/* The Mandated Issue Card */}
              <IssueCard
                category={agentResult.classification.category}
                severity={agentResult.severity.level}
                explanation={agentResult.severity.reasons[0] || 'Civic infrastructure defect requiring attention.'}
                location={agentResult.locationAnalysis.resolvedAddress}
                crowdReportCount={agentResult.duplicateCheck.similarReportCount + 1}
                reasons={agentResult.severity.reasons}
                photoUrl={photoPreview || undefined}
                isDuplicate={agentResult.duplicateCheck.hasSimilarReports}
              />

              {/* Potential Reward Informative Notice (NO POINTS AWARDED YET!) */}
              <div className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                isDark
                  ? 'bg-slate-900/80 border-cyan-500/30'
                  : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono ${
                    isDark
                      ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800 text-amber-400'
                  }`}>
                    +{agentResult.potentialPoints.categoryBase}
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-cyan-300 font-mono' : 'text-slate-700'
                    }`}>
                      Potential Reward on Reporting
                    </h5>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {agentResult.potentialPoints.explanation}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${
                  isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
                }`}>
                  Awarded after reporting action
                </span>
              </div>

              {/* Formal Municipal Complaint Letter Generator */}
              <div className={`rounded-2xl border p-6 space-y-4 transition-all ${
                isDark
                  ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100'
                  : 'bg-white border-slate-200 shadow-xs text-slate-900'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
                      <h4 className={`text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t.formalComplaintTitle}
                      </h4>
                    </div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-emerald-700'}`}>
                      {t.complaintReadyNotice} {t.formalComplaintEditableNotice}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyComplaint}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-cyan-500/50'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {copyFeedback ? <Check className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copyFeedback ? t.copiedNotification : t.copyComplaintBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Multilingual Complaint Translation Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <Languages className={`w-3.5 h-3.5 ml-1.5 ${isDark ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                      isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
                    }`}>
                      Translate Draft:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSwitchComplaintLanguage('en')}
                      disabled={isTranslatingComplaint}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        complaintLang === 'en'
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
                      onClick={() => handleSwitchComplaintLanguage('hi')}
                      disabled={isTranslatingComplaint}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        complaintLang === 'hi'
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
                      onClick={() => handleSwitchComplaintLanguage('te')}
                      disabled={isTranslatingComplaint}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        complaintLang === 'te'
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

                  {isTranslatingComplaint && (
                    <div className={`flex items-center gap-1.5 text-xs font-semibold animate-pulse ${
                      isDark ? 'text-cyan-400 font-mono' : 'text-emerald-700'
                    }`}>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Translating grievance draft...</span>
                    </div>
                  )}
                </div>

                <textarea
                  rows={9}
                  value={editableComplaint}
                  onChange={(e) => setEditableComplaint(e.target.value)}
                  className={`w-full p-4 rounded-xl border font-mono text-xs leading-relaxed transition-all ${
                    isDark
                      ? 'bg-slate-950/90 border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400'
                      : 'bg-slate-50/70 border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  }`}
                />

                {/* AVAILABLE OFFICIAL REPORTING CHANNELS */}
                <div className="space-y-3 pt-2">
                  {/* Referral Code (Optional) */}
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Referred by a friend? Enter their referral code:
                      </span>
                    </div>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value);
                        localStorage.setItem('civicai_referral_code', e.target.value.trim().toUpperCase());
                      }}
                      placeholder="e.g. NAGARA-AYUSH-88"
                      className={`w-full sm:w-44 px-2.5 py-1 text-xs font-mono rounded-lg border uppercase focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-cyan-300' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${
                      isDark ? 'text-cyan-400 font-mono' : 'text-slate-600'
                    }`}>
                      Select Verified Reporting Channel to Submit & Claim Points:
                    </span>
                    {agentResult.authority.isDemoData && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isDark
                          ? 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        Configured Demo Contacts
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Channel 1: Email (If available) */}
                    {agentResult.hasOfficialEmail ? (
                      <button
                        type="button"
                        onClick={() => handleInitiateReporting('Email')}
                        disabled={isRecordingReport}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isDark
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        <Mail className={`w-4 h-4 ${isDark ? 'text-slate-950' : 'text-sky-400'}`} />
                        <span>{t.sendEmailBtn}</span>
                      </button>
                    ) : (
                      <div className={`p-3 rounded-xl border text-xs flex items-center justify-center ${
                        isDark ? 'border-slate-800 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}>
                        <span>Email unavailable</span>
                      </div>
                    )}

                    {/* Channel 2: WhatsApp (If available) */}
                    {agentResult.hasOfficialWhatsApp ? (
                      <button
                        type="button"
                        onClick={() => handleInitiateReporting('WhatsApp')}
                        disabled={isRecordingReport}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isDark
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{t.sendWhatsAppBtn}</span>
                      </button>
                    ) : (
                      <div className={`p-3 rounded-xl border text-xs flex items-center justify-center ${
                        isDark ? 'border-slate-800 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}>
                        <span>WhatsApp unavailable</span>
                      </div>
                    )}

                    {/* Channel 3: Copy / Personal In-Person Visit */}
                    <button
                      type="button"
                      onClick={() => handleInitiateReporting('Personal Visit / In-Person')}
                      disabled={isRecordingReport}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isDark
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Report in Person / Copy</span>
                    </button>
                  </div>

                  {/* Fallback if neither email nor whatsapp contact is available */}
                  {!agentResult.hasOfficialEmail && !agentResult.hasOfficialWhatsApp && (
                    <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                      isDark
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{t.contactUnavailableTitle}</span>
                      </div>
                      <p>
                        {t.contactUnavailableNotice}
                      </p>
                    </div>
                  )}

                  {/* Personal Visit Option */}
                  <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t.personalVisitPrompt}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOfficeDetail(!showOfficeDetail)}
                      className={`font-bold hover:underline flex items-center gap-1 ${
                        isDark ? 'text-cyan-400' : 'text-emerald-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{showOfficeDetail ? 'Hide Municipal Office' : t.viewOfficeBtn}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsible Municipal Office Card */}
              {showOfficeDetail && (
                <MunicipalOfficeCard
                  authority={agentResult.authority}
                  complaintText={editableComplaint}
                />
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* REQUIREMENT 7: DEDICATED REPORTING CONFIRMATION SCREEN    */}
      {/* ========================================================= */}
      {confirmationData && (
        <div className={`rounded-2xl border-2 p-6 sm:p-8 space-y-6 transition-all ${
          isDark
            ? 'bg-slate-900/95 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] text-slate-100'
            : 'bg-white border-emerald-500 shadow-md text-slate-900'
        }`}>
          
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                isDark
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  : 'bg-emerald-500 text-white'
              }`}>
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className={`text-2xl font-black font-heading tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {t.reportRecordedTitle}
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-emerald-400 font-mono' : 'text-emerald-700'}`}>
                  {t.reportingActionInitiatedNotice}
                </p>
              </div>
            </div>

            <div className={`text-right p-3 rounded-xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Report Identifier
              </span>
              <span className={`text-lg font-black font-mono ${
                isDark ? 'text-cyan-300' : 'text-slate-900'
              }`}>
                {confirmationData.report.ticketNumber}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className={`p-4 rounded-xl border space-y-1 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold uppercase tracking-wider block text-[10px] ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Issue Category
              </span>
              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {confirmationData.report.category}
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold uppercase tracking-wider block text-[10px] ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Reported Location
              </span>
              <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {confirmationData.report.location.address}
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold uppercase tracking-wider block text-[10px] ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Responsible Municipal Authority
              </span>
              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {confirmationData.report.assignedAuthority.authorityName}
              </p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {confirmationData.report.assignedAuthority.address}
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold uppercase tracking-wider block text-[10px] ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Reporting Method & Lifecycle Status
              </span>
              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Method: {confirmationData.reportingMethod}
              </p>
              <p className={`font-semibold text-[11px] ${
                isDark ? 'text-emerald-400 font-mono' : 'text-emerald-700'
              }`}>
                Status: Reporting initiated (Reported via {confirmationData.reportingMethod})
              </p>
            </div>
          </div>

          {/* Reward & Community Count Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400 font-mono' : 'text-slate-500'
              }`}>
                Community Reports
              </span>
              <span className={`text-2xl font-black font-mono ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {confirmationData.report.crowdReportCount}
              </span>
              <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Corroborating citizens
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${
              confirmationData.isRewardEligible
                ? isDark
                  ? 'bg-emerald-950/50 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-50 border-emerald-300'
                : isDark
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-emerald-400 font-mono' : 'text-slate-500'
              }`}>
                Reward Earned
              </span>
              <span className={`text-2xl font-black font-mono ${
                confirmationData.isRewardEligible 
                  ? isDark ? 'text-emerald-400 neon-text-emerald' : 'text-emerald-600'
                  : 'text-slate-500'
              }`}>
                {confirmationData.isRewardEligible ? `+${confirmationData.pointsAwarded}` : '0'} pts
              </span>
              <span className={`text-[10px] block truncate ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {confirmationData.isRewardEligible ? 'Qualified (First 3 reports)' : 'Reward limit reached (3+)'}
              </span>
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-slate-950 border border-cyan-500/30 text-white' : 'bg-slate-900 text-white'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-cyan-400 font-mono' : 'text-slate-400'
              }`}>
                Your Total Points
              </span>
              <span className={`text-2xl font-black font-mono ${
                isDark ? 'text-cyan-300 neon-text-cyan' : 'text-emerald-400'
              }`}>
                {confirmationData.userTotalPoints} pts
              </span>
              <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {userName}
              </span>
            </div>
          </div>

          {/* Referral Bonus Notice if applicable */}
          {confirmationData.referralNotice && (
            <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
              isDark
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              <Award className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{confirmationData.referralNotice}</span>
            </div>
          )}

          {/* Prompt Mandate: Clear Distinction between Recorded vs Officially Received */}
          <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${
            isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className={`flex items-center gap-2 font-bold ${
              isDark ? 'text-cyan-300 font-heading' : 'text-slate-800'
            }`}>
              <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <span>Status Transparency</span>
            </div>
            <p className="leading-relaxed">
              <strong>Report recorded by Nagaravaani:</strong> Your civic issue and complaint letter have been logged in the community database.
            </p>
            <p className={`leading-relaxed italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <strong>Officially received by municipal authority:</strong> Will only display if and when direct official API confirmation is received from the government portal.
            </p>
          </div>

          {/* Dedicated Multilingual Complaint Letter Translation Card on the Last Page */}
          <div className={`p-5 rounded-2xl border space-y-3 transition-all ${
            isDark
              ? 'bg-slate-950/80 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
                <div>
                  <h4 className={`text-sm font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Dispatched Grievance Letter & Multilingual Translation
                  </h4>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select a tab below to translate and view the formal complaint in your preferred language:
                  </p>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                  isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
                }`}>
                  Translate:
                </span>
                {(['en', 'hi', 'te'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleSwitchComplaintLanguage(lang)}
                    disabled={isTranslatingComplaint}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      complaintLang === lang
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900 text-white shadow-xs'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी (Hindi)' : 'తెలుగు (Telugu)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Text Preview */}
            <pre className={`p-4 rounded-xl border font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {editableComplaint || confirmationData.report.formalComplaintText}
            </pre>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className={`text-[11px] italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Active translation: {complaintLang === 'hi' ? 'Hindi (हिन्दी)' : complaintLang === 'te' ? 'Telugu (తెలుగు)' : 'English (Statutory standard)'}.
              </span>
              <button
                type="button"
                onClick={handleCopyComplaint}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copyFeedback ? 'Copied to Clipboard!' : 'Copy Translated Letter'}</span>
              </button>
            </div>
          </div>

          {/* Municipal Office Modal / View Section */}
          <div className="pt-2">
            <MunicipalOfficeCard
              authority={confirmationData.report.assignedAuthority}
              complaintText={editableComplaint || confirmationData.report.formalComplaintText}
              complaintTranslations={confirmationData.report.formalComplaintTranslations || agentResult?.formalComplaint.translations}
              initialLang={complaintLang}
              reportId={confirmationData.report.ticketNumber}
            />
          </div>

          {/* Action CTAs */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={handleStartFresh}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              Report Another Problem
            </button>

            <button
              type="button"
              onClick={onViewDashboard}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              Track in Citizen Dashboard
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
