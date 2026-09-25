import React, { useState, useEffect } from 'react';
import { Language, VoiceCallSession, VoicePipelineStep } from '../types';
import { SAMPLE_VOICE_CALLS } from '../data/mockData';
import { fetchExotelConfig, fetchVoiceCalls, processVoiceCall } from '../services/agentApi';
import { useTheme } from '../context/ThemeContext';
import {
  PhoneCall,
  PhoneIncoming,
  Radio,
  Clock,
  Globe,
  Bot,
  MapPin,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Activity,
  Mic,
  Copy,
  Check,
} from 'lucide-react';

interface LiveVoiceDashboardProps {
  currentLang: Language;
  onViewReportDetails?: (ticketNumber: string) => void;
  onRefreshAllData?: () => void;
}

export const LiveVoiceDashboard: React.FC<LiveVoiceDashboardProps> = ({
  currentLang,
  onViewReportDetails,
  onRefreshAllData,
}) => {
  const { isDark } = useTheme();

  // Exotel Config State
  const [exotelConfig, setExotelConfig] = useState<{
    exotelNumber: string;
    streamIntegrationStatus: 'STREAM_PENDING_EXOTEL_CONFIG' | 'STREAM_ACTIVE';
    hasServerStreamingUrl: boolean;
    ivrWelcomePrompt: string;
  }>({
    exotelNumber: '04041895372',
    streamIntegrationStatus: 'STREAM_PENDING_EXOTEL_CONFIG',
    hasServerStreamingUrl: false,
    ivrWelcomePrompt: 'Welcome to Nagaravaani Smart City Civic Reporting. Press 1 for English, 2 for Hindi, 3 for Telugu.',
  });

  // Call sessions list
  const [sessions, setSessions] = useState<VoiceCallSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoiceCallSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Live Simulator State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPreset, setSimulationPreset] = useState<number>(0);
  const [simulatedDtmf, setSimulatedDtmf] = useState<'1' | '2' | '3'>('3');
  const [customTranscript, setCustomTranscript] = useState<string>('');
  const [simDuration, setSimDuration] = useState<number>(0);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [copiedGrievance, setCopiedGrievance] = useState<boolean>(false);

  // Load backend data
  const loadCalls = async () => {
    try {
      setIsLoading(true);
      const [cfg, res] = await Promise.all([fetchExotelConfig(), fetchVoiceCalls()]);
      setExotelConfig(cfg);
      if (res.calls && res.calls.length > 0) {
        setSessions(res.calls);
        if (!selectedSession) {
          setSelectedSession(res.calls[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load voice calls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  // Timer for active simulation
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setSimDuration(0);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Execute Simulated Exotel Voice Pipeline
  const handleStartSimulation = async (presetIndex: number) => {
    const preset = SAMPLE_VOICE_CALLS[presetIndex];
    setIsSimulating(true);
    setSimulationPreset(presetIndex);
    setSimulatedDtmf(preset.dtmf);
    setSimStepIndex(1); // Gateway received

    setTimeout(() => {
      setSimStepIndex(2); // DTMF selected
    }, 1200);

    setTimeout(() => {
      setSimStepIndex(3); // STT Transcription
    }, 2400);

    setTimeout(async () => {
      setSimStepIndex(4); // Nagaravaani AI Triage & Complaint
      try {
        const transcriptText = customTranscript.trim() || preset.transcript;
        const result = await processVoiceCall({
          callerNumberMasked: preset.callerMasked,
          language: preset.lang,
          languageInputMethod: preset.dtmf === '3' ? 'DTMF_3_TE' : preset.dtmf === '2' ? 'DTMF_2_HI' : 'DTMF_1_EN',
          transcript: transcriptText,
          locationHint: preset.locationHint,
        });

        setSessions((prev) => [result.session, ...prev]);
        setSelectedSession(result.session);
        setSimStepIndex(6); // Done
        if (onRefreshAllData) onRefreshAllData();
      } catch (e) {
        console.error('Simulation error:', e);
      } finally {
        setIsSimulating(false);
      }
    }, 4200);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyGrievance = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGrievance(true);
    setTimeout(() => setCopiedGrievance(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 shadow-sm text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black font-heading tracking-tight">
                    ☎️ LIVE VOICE REPORT
                  </h2>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    isDark
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    Exotel Gateway
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Same Nagaravaani AI Core Agent. Multilingual telephony intake for citizens without smartphones or internet access.
                </p>
              </div>
            </div>
          </div>

          {/* Helpline Number & Integration Status Card */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Dedicated Inbound IVR Trunk
              </span>
              <span className={`text-xl font-black font-mono tracking-wider ${
                isDark ? 'text-cyan-400 neon-text-cyan' : 'text-emerald-700'
              }`}>
                {exotelConfig.exotelNumber}
              </span>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1 English | 2 हिन्दी | 3 తెలుగు
              </p>
            </div>

            <div className={`border-l pl-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  exotelConfig.streamIntegrationStatus === 'STREAM_ACTIVE'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    : 'bg-amber-400 animate-ping'
                }`} />
                <span className="text-xs font-bold font-mono">
                  {exotelConfig.streamIntegrationStatus === 'STREAM_ACTIVE'
                    ? 'EXOTEL STREAM ACTIVE'
                    : 'INTEGRATION: PENDING STREAM'}
                </span>
              </div>
              <p className={`text-[10px] max-w-[200px] mt-0.5 leading-tight ${
                isDark ? 'text-amber-300/80' : 'text-amber-700'
              }`}>
                {exotelConfig.streamIntegrationStatus === 'STREAM_ACTIVE'
                  ? 'Real-time WebSocket audio stream connected.'
                  : 'Telephony gateway ready. Audio stream webhook pending Exotel credentials in environment variables.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Test & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Call Session Inspector & History (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Call / Selected Call Panel */}
          {selectedSession ? (
            <div className={`p-6 rounded-2xl border space-y-6 transition-all ${
              isDark
                ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)] text-slate-100'
                : 'bg-white border-slate-200 shadow-sm text-slate-900'
            }`}>
              
              {/* Call Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    selectedSession.status === 'COMPLETED'
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-cyan-400 animate-pulse'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {selectedSession.callerNumberMasked}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isDark ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {selectedSession.selectedLanguage === 'te'
                          ? 'తెలుగు (DTMF 3)'
                          : selectedSession.selectedLanguage === 'hi'
                          ? 'हिन्दी (DTMF 2)'
                          : 'English (DTMF 1)'}
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Inbound via {selectedSession.exotelNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`text-right px-3 py-1.5 rounded-lg border font-mono text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">CALL DURATION</span>
                    <span className="font-bold text-cyan-400">
                      {formatSeconds(selectedSession.durationSeconds)}
                    </span>
                  </div>

                  {selectedSession.ticketNumber && (
                    <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs ${
                      isDark ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <span className="text-[10px] block opacity-80">TICKET</span>
                      <span className="font-extrabold">{selectedSession.ticketNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Transcript Stream */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                    isDark ? 'text-cyan-300' : 'text-slate-700'
                  }`}>
                    <Headphones className="w-3.5 h-3.5" />
                    Caller Voice Audio Transcript (STT)
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    High-Fidelity ASR
                  </span>
                </div>
                <div className={`p-4 rounded-xl border text-sm font-sans italic leading-relaxed ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  "{selectedSession.liveTranscript}"
                </div>
              </div>

              {/* AI Analysis Card */}
              {selectedSession.analysis && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                    : 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase font-mono flex items-center gap-1.5 ${
                      isDark ? 'text-cyan-400' : 'text-emerald-800'
                    }`}>
                      <Bot className="w-4 h-4" />
                      Nagaravaani AI Real-time Triage
                    </span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      selectedSession.analysis.severity.level === 'CRITICAL'
                        ? 'bg-red-500 text-white'
                        : selectedSession.analysis.severity.level === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {selectedSession.analysis.severity.level} PRIORITY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Category
                      </span>
                      <span className="font-bold">
                        {selectedSession.analysis.classification.category}
                      </span>
                    </div>

                    <div>
                      <span className={`font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Approximate Location
                      </span>
                      <span className="font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedSession.analysis.locationAnalysis.resolvedAddress}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className={`font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Assigned Municipal Wing
                      </span>
                      <span className="font-bold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedSession.analysis.authority.authorityName} ({selectedSession.analysis.authority.designatedOfficer})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Pipeline Steps */}
              <div className="space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider font-mono block ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Helpline Processing Pipeline
                </span>

                <div className="space-y-2">
                  {selectedSession.pipelineSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs transition-colors ${
                        step.status === 'completed'
                          ? isDark
                            ? 'bg-slate-950/60 border-emerald-500/30 text-slate-300'
                            : 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : step.status === 'running'
                          ? isDark
                            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 animate-pulse'
                            : 'bg-cyan-50 border-cyan-300 text-cyan-900'
                          : isDark
                          ? 'bg-slate-950/30 border-slate-800 text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="mt-0.5">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : step.status === 'running' ? (
                          <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{step.stepName}</span>
                          {step.timestamp && (
                            <span className="font-mono text-[10px] opacity-70">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] opacity-90 mt-0.5">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Complaint */}
              {selectedSession.generatedComplaint && (
                <div className="space-y-2 border-t pt-4 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                      isDark ? 'text-cyan-300' : 'text-slate-700'
                    }`}>
                      <FileText className="w-4 h-4" />
                      Generated Formal Complaint Draft
                    </span>

                    <button
                      onClick={() => handleCopyGrievance(selectedSession.generatedComplaint || '')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {copiedGrievance ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Formal Letter</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className={`p-4 rounded-xl border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {selectedSession.generatedComplaint}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center border rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm text-slate-500">No active voice helpline sessions found.</p>
            </div>
          )}

          {/* Previous Inbound Call History List */}
          <div className="space-y-3">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Recent Voice Helpline Calls (04041895372)
            </h3>

            <div className="space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.callSid}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedSession?.callSid === sess.callSid
                      ? isDark
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-emerald-50 border-emerald-500'
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      sess.selectedLanguage === 'te'
                        ? 'bg-blue-500/20 text-blue-400'
                        : sess.selectedLanguage === 'hi'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <PhoneIncoming className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">
                          {sess.callerNumberMasked}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sess.selectedLanguage.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-xs truncate max-w-[280px] sm:max-w-md ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {sess.liveTranscript}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-cyan-400 block">
                      {sess.ticketNumber || 'Triage Done'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatSeconds(sess.durationSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telephony Simulator & Exotel Test Trigger (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Radio className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'} animate-pulse`} />
                <h3 className="font-heading font-bold text-base">
                  Test Exotel Helpline Pipeline
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-100 text-slate-700'
              }`}>
                04041895372
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Simulate an incoming citizen call to 04041895372. Nagaravaani AI listens, performs DTMF language selection (1 English, 2 Hindi, 3 Telugu), speech-to-text, and executes the full complaint triage workflow.
            </p>

            {/* Test Presets */}
            <div className="space-y-3">
              <label className={`text-xs font-bold uppercase tracking-wider font-mono block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Select Dialect & Caller Scenario:
              </label>

              <div className="space-y-2">
                {SAMPLE_VOICE_CALLS.map((sample, idx) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      if (!isSimulating) {
                        setSimulationPreset(idx);
                        setSimulatedDtmf(sample.dtmf);
                        setCustomTranscript('');
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      simulationPreset === idx
                        ? isDark
                          ? 'bg-cyan-500/15 border-cyan-500 text-white'
                          : 'bg-emerald-50 border-emerald-600 text-slate-900'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        {sample.langName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        DTMF Key [{sample.dtmf}]
                      </span>
                    </div>
                    <p className={`text-xs italic line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{sample.transcript}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Custom Speech Input */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider font-mono block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Or Spoken Audio Input / Custom Speech:
              </label>
              <textarea
                rows={2}
                disabled={isSimulating}
                value={customTranscript}
                onChange={(e) => setCustomTranscript(e.target.value)}
                placeholder="Type or paste spoken sentence in English, Hindi, or Telugu..."
                className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>

            {/* Simulator Action Button */}
            <button
              onClick={() => handleStartSimulation(simulationPreset)}
              disabled={isSimulating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-cyan-500/50 text-slate-950 cursor-not-allowed animate-pulse'
                  : isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              {isSimulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Processing Call on 04041895372 ({formatSeconds(simDuration)})...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Trigger Inbound Call to 04041895372</span>
                </>
              )}
            </button>

            {/* Architectural Exotel Note */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2 font-bold text-slate-200 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Single AI Unified Engine Notice</span>
              </div>
              <p>
                Telephony inbound audio is routed directly to the same Nagaravaani AI classification, geocoding, severity scoring, and complaint drafting models. No redundant AI agent is initialized.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
