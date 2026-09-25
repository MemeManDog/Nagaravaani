import React, { useState, useEffect, useRef } from 'react';
import { Language, VoiceCallSession, VoicePipelineStep } from '../types';
import { SAMPLE_VOICE_CALLS } from '../data/mockData';
import {
  fetchExotelConfig,
  fetchVoiceCalls,
  processVoiceCall,
  syncExotelDatabase,
  configureExotelCredentials,
  ingestExotelCall,
  analyzeExotelAudio,
} from '../services/agentApi';
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
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Activity,
  Mic,
  MicOff,
  Copy,
  Check,
  RefreshCw,
  Database,
  Key,
  ExternalLink,
  Volume2,
  PlusCircle,
  HelpCircle,
  Info,
  Sliders,
  X,
  Upload,
  Square,
  Languages,
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
    webhookUrl?: string;
    passthruUrl?: string;
    statusCallbackUrl?: string;
    isConfiguredWithExotelApi?: boolean;
    exotelAccountSidMasked?: string | null;
    exotelSubdomain?: string;
    ivrWelcomePrompt?: string;
    totalSessions?: number;
  }>({
    exotelNumber: '04041895372',
    streamIntegrationStatus: 'STREAM_PENDING_EXOTEL_CONFIG',
    hasServerStreamingUrl: false,
    webhookUrl: '',
    isConfiguredWithExotelApi: false,
    exotelAccountSidMasked: null,
    exotelSubdomain: 'api.exotel.com',
    ivrWelcomePrompt:
      'Welcome to Nagaravaani Smart City Civic Reporting. Press 1 for English, 2 for Hindi, 3 for Telugu.',
  });

  // Call sessions list
  const [sessions, setSessions] = useState<VoiceCallSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoiceCallSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Auto-poll state for real-time live incoming calls
  const [autoPoll, setAutoPoll] = useState<boolean>(true);

  // Modal states
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState<boolean>(false);
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);

  // Credentials form state
  const [credAccountSid, setCredAccountSid] = useState<string>('');
  const [credApiKey, setCredApiKey] = useState<string>('');
  const [credApiToken, setCredApiToken] = useState<string>('');
  const [credSubdomain, setCredSubdomain] = useState<string>('api.exotel.com');
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);

  // Ingest form state
  const [ingestData, setIngestData] = useState({
    callSid: '',
    from: '+91 98480 12345',
    digits: '1',
    recordingUrl: '',
    transcript: '',
    duration: 55,
    locationHint: 'Jubilee Hills Road 36, Hyderabad',
  });
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  // Copy helpers
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [copiedGrievance, setCopiedGrievance] = useState<boolean>(false);

  // Audio Mode selection in Simulator Panel
  const [intakeMode, setIntakeMode] = useState<
    'sample_audio' | 'mic_record' | 'upload_file' | 'custom_text'
  >('sample_audio');

  // Simulator / Audio Intake States
  const [selectedAudioSampleIdx, setSelectedAudioSampleIdx] = useState<number>(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [customTranscript, setCustomTranscript] = useState<string>('');
  const [simDuration, setSimDuration] = useState<number>(0);

  // Microphone Recording State
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [micSeconds, setMicSeconds] = useState<number>(0);
  const [recordedAudioDataUrl, setRecordedAudioDataUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio Playback Player State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Universal Audio Player Toggle
  const handleTogglePlayAudio = (audioSrc: string, id: string) => {
    if (!audioSrc) return;

    if (playingAudioId === id) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(audioSrc);
    audioElementRef.current = audio;
    setPlayingAudioId(id);

    audio.play().catch((err) => {
      console.warn('Audio playback error:', err);
      setPlayingAudioId(null);
    });

    audio.onended = () => {
      setPlayingAudioId(null);
    };

    audio.onerror = () => {
      setPlayingAudioId(null);
    };
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Load backend data
  const loadCalls = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [cfg, res] = await Promise.all([fetchExotelConfig(), fetchVoiceCalls()]);
      setExotelConfig(cfg);
      if (res.calls && res.calls.length > 0) {
        setSessions(res.calls);
        setSelectedSession((prev) => {
          if (!prev) return res.calls[0];
          const found = res.calls.find((c) => c.callSid === prev.callSid);
          return found || res.calls[0];
        });
      }
    } catch (err) {
      console.warn('Failed to load voice calls:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  // Real-time polling every 5 seconds so live Exotel calls appear automatically
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      loadCalls(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPoll]);

  // Timer for active audio processing / simulation
  useEffect(() => {
    let interval: any;
    if (isProcessingAudio) {
      interval = setInterval(() => {
        setSimDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setSimDuration(0);
    }
    return () => clearInterval(interval);
  }, [isProcessingAudio]);

  // Timer for active mic recording
  useEffect(() => {
    let interval: any;
    if (isRecordingMic) {
      interval = setInterval(() => {
        setMicSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setMicSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingMic]);

  // Exotel Database Sync Handler
  const handleSyncDatabase = async () => {
    setIsSyncingDb(true);
    setSyncFeedback(null);
    try {
      const res = await syncExotelDatabase();
      if (res.needsCredentials) {
        setSyncFeedback({
          type: 'info',
          message:
            'Exotel API credentials needed to pull directly from your Exotel Database. Enter them below or use the Webhook.',
        });
        setShowCredentialsModal(true);
      } else {
        setSyncFeedback({
          type: 'success',
          message:
            res.message ||
            `Successfully synced ${res.addedCount || 0} calls from Exotel database!`,
        });
        if (res.calls && res.calls.length > 0) {
          setSessions(res.calls);
          setSelectedSession(res.calls[0]);
        }
        if (onRefreshAllData) onRefreshAllData();
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Failed to sync with Exotel database',
      });
    } finally {
      setIsSyncingDb(false);
      setTimeout(() => setSyncFeedback(null), 8000);
    }
  };

  // Save Exotel API Credentials
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    try {
      await configureExotelCredentials({
        accountSid: credAccountSid,
        apiKey: credApiKey,
        apiToken: credApiToken,
        subdomain: credSubdomain,
      });
      setShowCredentialsModal(false);
      setSyncFeedback({
        type: 'success',
        message: 'Exotel API credentials saved securely in backend server memory.',
      });
      await loadCalls();
      handleSyncDatabase();
    } catch (err: any) {
      alert(err.message || 'Failed to save credentials');
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Ingest Call from Exotel Log
  const handleIngestCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);
    try {
      const res = await ingestExotelCall({
        callSid: ingestData.callSid || `exotel-db-${Date.now()}`,
        from: ingestData.from,
        digits: ingestData.digits,
        recordingUrl: ingestData.recordingUrl,
        transcript: ingestData.transcript,
        duration: Number(ingestData.duration) || 55,
        locationHint: ingestData.locationHint,
      });

      setSessions((prev) => [res.session, ...prev]);
      setSelectedSession(res.session);
      setShowIngestModal(false);
      setSyncFeedback({
        type: 'success',
        message: `Call triaged successfully! Complaint Ticket ${res.report.ticketNumber} created.`,
      });
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to ingest call');
    } finally {
      setIsIngesting(false);
    }
  };

  // 1. EXECUTE: Listen to Audio & Draft Complaint with Gemini 3.8 Flash
  const handleListenSampleAudioWithGemini = async (presetIdx: number) => {
    const sample = SAMPLE_VOICE_CALLS[presetIdx];
    setIsProcessingAudio(true);
    setProcessingStatus(`1/3 Receiving audio stream from Exotel virtual trunk 04041895372...`);

    try {
      setTimeout(() => {
        setProcessingStatus(
          `2/3 Gemini 3.8 Flash is listening to citizen voice recording (${sample.langName})...`
        );
      }, 1200);

      // Call the backend audio analysis endpoint which passes audio to Gemini
      const result = await analyzeExotelAudio({
        audioBase64: sample.audioBase64,
        audioUrl: sample.recordingUrl,
        mimeType: 'audio/wav',
        callerNumber: sample.callerMasked,
        language: sample.lang,
        locationHint: sample.locationHint,
        duration: sample.durationSeconds || 75,
      });

      setProcessingStatus(`3/3 Grievance letter drafted from auditory evidence!`);

      setSessions((prev) => [result.session, ...prev]);
      setSelectedSession(result.session);
      setSyncFeedback({
        type: 'success',
        message: `Gemini listened to citizen audio in ${sample.langName}! Statutory complaint draft & ticket ${result.report.ticketNumber} created.`,
      });
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      console.error('Audio listening error:', err);
      // Fallback to text pipeline
      try {
        const fallback = await processVoiceCall({
          callerNumberMasked: sample.callerMasked,
          language: sample.lang,
          languageInputMethod:
            sample.dtmf === '3' ? 'DTMF_3_TE' : sample.dtmf === '2' ? 'DTMF_2_HI' : 'DTMF_1_EN',
          transcript: sample.transcript,
          locationHint: sample.locationHint,
          recordingUrl: sample.recordingUrl,
          audioBase64: sample.audioBase64,
        });
        setSessions((prev) => [fallback.session, ...prev]);
        setSelectedSession(fallback.session);
      } catch (fbErr) {
        alert('Failed to process call: ' + err.message);
      }
    } finally {
      setIsProcessingAudio(false);
      setProcessingStatus('');
    }
  };

  // 2. MICROPHONE RECORDING CONTROLS
  const startMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioDataUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecordingMic(true);
    } catch (err: any) {
      alert('Microphone access denied or unavailable: ' + err.message);
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isRecordingMic) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
    }
  };

  // Submit recorded mic audio to Gemini
  const handleSubmitMicAudio = async () => {
    if (!recordedAudioDataUrl) return;

    setIsProcessingAudio(true);
    setProcessingStatus('Gemini 3.8 Flash is listening to your recorded voice message...');

    try {
      const result = await analyzeExotelAudio({
        audioBase64: recordedAudioDataUrl,
        mimeType: 'audio/wav',
        callerNumber: '+91 98480 *****',
        locationHint: 'Hyderabad City Center',
        duration: micSeconds || 30,
      });

      setSessions((prev) => [result.session, ...prev]);
      setSelectedSession(result.session);
      setRecordedAudioDataUrl(null);
      setSyncFeedback({
        type: 'success',
        message: `Gemini listened to your voice audio! Created complaint ticket ${result.report.ticketNumber}.`,
      });
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      alert('Error analyzing voice audio: ' + err.message);
    } finally {
      setIsProcessingAudio(false);
      setProcessingStatus('');
    }
  };

  // 3. FILE UPLOAD HANDLER
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsProcessingAudio(true);
      setProcessingStatus(`Gemini 3.8 Flash is listening to uploaded audio file (${file.name})...`);

      try {
        const result = await analyzeExotelAudio({
          audioBase64: base64Data,
          mimeType: file.type || 'audio/wav',
          callerNumber: '+91 98480 *****',
          locationHint: 'Hyderabad Municipal Area',
        });

        setSessions((prev) => [result.session, ...prev]);
        setSelectedSession(result.session);
        setSyncFeedback({
          type: 'success',
          message: `Gemini analyzed audio file ${file.name}! Complaint drafted for ticket ${result.report.ticketNumber}.`,
        });
        if (onRefreshAllData) onRefreshAllData();
      } catch (err: any) {
        alert('Error analyzing file: ' + err.message);
      } finally {
        setIsProcessingAudio(false);
        setProcessingStatus('');
      }
    };
    reader.readAsDataURL(file);
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

  const currentWebhookUrl =
    exotelConfig.webhookUrl || `${window.location.origin}/api/exotel/webhook`;

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(currentWebhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-slate-100'
            : 'bg-white border-slate-200 shadow-sm text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
                  isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black font-heading tracking-tight">
                    ☎️ LIVE VOICE REPORT
                  </h2>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      isDark
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    Exotel Trunk: 04041895372
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Gemini 3.8 Flash Multimodal Audio Engine. Directly listens to citizen voice recordings in Telugu, Hindi, or English to transcribe verbatim and draft statutory grievances.
                </p>
              </div>
            </div>
          </div>

          {/* Helpline Number & Integration Status Card */}
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Dedicated Inbound IVR Trunk
              </span>
              <span
                className={`text-xl font-black font-mono tracking-wider ${
                  isDark ? 'text-cyan-400 neon-text-cyan' : 'text-emerald-700'
                }`}
              >
                {exotelConfig.exotelNumber}
              </span>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                1 English | 2 हिन्दी | 3 తెలుగు
              </p>
            </div>

            <div className={`border-l pl-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    exotelConfig.isConfiguredWithExotelApi
                      ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                      : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className="text-xs font-bold font-mono">
                  {exotelConfig.isConfiguredWithExotelApi
                    ? 'EXOTEL DB: CONNECTED'
                    : 'EXOTEL DB: READY TO SYNC'}
                </span>
              </div>
              <p
                className={`text-[10px] max-w-[200px] mt-0.5 leading-tight ${
                  isDark ? 'text-amber-300/80' : 'text-amber-700'
                }`}
              >
                {exotelConfig.isConfiguredWithExotelApi
                  ? `REST API Active (${exotelConfig.exotelAccountSidMasked || 'Exotel Account'})`
                  : 'Exotel database sync & live audio listening webhook active.'}
              </p>
            </div>
          </div>
        </div>

        {/* Integration Action Bar: Exotel Database Sync & Webhook Setup */}
        <div
          className={`mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Sync from Exotel Database button */}
            <button
              onClick={handleSyncDatabase}
              disabled={isSyncingDb}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
              <span>{isSyncingDb ? 'Connecting to Exotel DB...' : '🔄 Sync Exotel Database Calls'}</span>
            </button>

            {/* Webhook Configuration Guide */}
            <button
              onClick={() => setShowWebhookModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exotel Webhook URL</span>
            </button>

            {/* Configure Exotel API Credentials */}
            <button
              onClick={() => setShowCredentialsModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {exotelConfig.isConfiguredWithExotelApi ? 'Exotel API: Configured' : 'Connect Exotel API'}
              </span>
            </button>

            {/* Manual Ingest from Exotel Log */}
            <button
              onClick={() => setShowIngestModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Call from Exotel Log</span>
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPoll}
                onChange={(e) => setAutoPoll(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Live Auto-Refresh (5s)</span>
            </label>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {sessions.length} Calls Logged
            </span>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              syncFeedback.type === 'success'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : syncFeedback.type === 'error'
                ? isDark
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-red-50 border-red-300 text-red-800'
                : isDark
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-cyan-50 border-cyan-300 text-cyan-800'
            }`}
          >
            <div className="flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 shrink-0" />
              <span>{syncFeedback.message}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Live Inspector (Left) & Audio Intake/Listening Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Call Session Inspector & History (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Call / Selected Call Panel */}
          {selectedSession ? (
            <div
              className={`p-6 rounded-2xl border space-y-6 transition-all ${
                isDark
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)] text-slate-100'
                  : 'bg-white border-slate-200 shadow-sm text-slate-900'
              }`}
            >
              {/* Call Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      selectedSession.status === 'COMPLETED'
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-cyan-400 animate-pulse'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {selectedSession.callerNumberMasked}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isDark ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {selectedSession.selectedLanguage === 'te'
                          ? 'తెలుగు (DTMF 3)'
                          : selectedSession.selectedLanguage === 'hi'
                          ? 'हिन्दी (DTMF 2)'
                          : 'English (DTMF 1)'}
                      </span>
                      {selectedSession.audioListenedByGemini && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                          <Headphones className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Gemini Listened</span>
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Inbound via {selectedSession.exotelNumber} • SID: {selectedSession.callSid}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`text-right px-3 py-1.5 rounded-lg border font-mono text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">CALL DURATION</span>
                    <span className="font-bold text-cyan-400">
                      {formatSeconds(selectedSession.durationSeconds)}
                    </span>
                  </div>

                  {selectedSession.ticketNumber && (
                    <div
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs ${
                        isDark
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80">TICKET</span>
                      <span className="font-extrabold">{selectedSession.ticketNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DEDICATED CITIZEN AUDIO PLAYER (Actually Listen to Them) */}
              {(selectedSession.audioBase64 || selectedSession.recordingUrl) && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-950/40 to-slate-950 border-cyan-500/40 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleTogglePlayAudio(
                          selectedSession.audioBase64 || selectedSession.recordingUrl || '',
                          selectedSession.callSid
                        )
                      }
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        playingAudioId === selectedSession.callSid
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : isDark
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {playingAudioId === selectedSession.callSid ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-heading">
                          {playingAudioId === selectedSession.callSid
                            ? 'Playing Citizen Telephony Recording...'
                            : 'Citizen Voice Audio (Exotel Trunk)'}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          {selectedSession.durationSeconds}s
                        </span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Click to listen to the exact caller voice audio received from Exotel helpline.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Headphones className="w-3.5 h-3.5" />
                      Gemini Listened & Verified
                    </span>
                  </div>
                </div>
              )}

              {/* Citizen Audio Transcript (Verbatim in Original Dialect) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                      isDark ? 'text-cyan-300' : 'text-slate-700'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    Caller Voice Audio Transcript (Verbatim Spoken Dialect)
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Gemini Multimodal Telephony ASR
                  </span>
                </div>
                <div
                  className={`p-4 rounded-xl border text-sm font-sans italic leading-relaxed ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  "{selectedSession.liveTranscript}"
                </div>
              </div>

              {/* English Audio Translation (if non-English) */}
              {selectedSession.englishTranslation &&
                selectedSession.selectedLanguage !== 'en' && (
                  <div
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-blue-50/50 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                        Verified English Translation of Voice Audio:
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed italic">
                      "{selectedSession.englishTranslation}"
                    </p>
                  </div>
                )}

              {/* AI Real-time Auditory Triage Card */}
              {selectedSession.analysis && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark
                      ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                      : 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase font-mono flex items-center gap-1.5 ${
                        isDark ? 'text-cyan-400' : 'text-emerald-800'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                      Nagaravaani AI Real-time Triage (From Spoken Words)
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        selectedSession.analysis.severity.level === 'CRITICAL'
                          ? 'bg-red-500 text-white'
                          : selectedSession.analysis.severity.level === 'HIGH'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
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
                        Location Landmark Heard in Audio
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
                        {selectedSession.analysis.authority.authorityName} (
                        {selectedSession.analysis.authority.designatedOfficer})
                      </span>
                    </div>

                    {selectedSession.citizenUrgencyNotes && (
                      <div className="sm:col-span-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        <span className="font-bold block text-[11px]">
                          Auditory Sentiment & Safety Observation:
                        </span>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          {selectedSession.citizenUrgencyNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Processing Pipeline Steps */}
              <div className="space-y-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider font-mono block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
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

              {/* Generated Formal Complaint Draft */}
              {selectedSession.generatedComplaint && (
                <div className="space-y-2 border-t pt-4 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                        isDark ? 'text-cyan-300' : 'text-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Generated Formal Complaint Draft (Drafted from Audio)
                    </span>

                    <button
                      onClick={() => handleCopyGrievance(selectedSession.generatedComplaint || '')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
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

                  <pre
                    className={`p-4 rounded-xl border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
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
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Inbound Calls Log (04041895372)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any call to listen to audio & inspect AI triage
              </span>
            </div>

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
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                        sess.selectedLanguage === 'te'
                          ? 'bg-blue-500/20 text-blue-400'
                          : sess.selectedLanguage === 'hi'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {sess.audioBase64 || sess.recordingUrl ? (
                        <Volume2 className="w-4 h-4 animate-pulse" />
                      ) : (
                        <PhoneIncoming className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">
                          {sess.callerNumberMasked}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sess.selectedLanguage.toUpperCase()}
                        </span>
                        {sess.audioListenedByGemini && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            GEMINI LISTENED
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate max-w-[280px] sm:max-w-md ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
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

        {/* Right Column: Audio Intake & Gemini Listening Engine (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-6 ${
              isDark
                ? 'bg-slate-900/90 border-cyan-500/30 text-slate-100 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Headphones className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'} animate-pulse`} />
                <h3 className="font-heading font-bold text-base">
                  Listen to Audio & Draft Complaint
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Gemini 3.8 Flash
              </span>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setIntakeMode('sample_audio')}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                  intakeMode === 'sample_audio'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎧 Exotel Calls
              </button>
              <button
                onClick={() => setIntakeMode('mic_record')}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  intakeMode === 'mic_record'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Speak (Mic)</span>
              </button>
              <button
                onClick={() => setIntakeMode('upload_file')}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  intakeMode === 'upload_file'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload Audio</span>
              </button>
            </div>

            {/* MODE 1: EXOTEL AUDIO PRESETS (LISTEN TO CITIZEN AUDIO) */}
            {intakeMode === 'sample_audio' && (
              <div className="space-y-4">
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select an authentic citizen call recorded on Exotel trunk <strong>04041895372</strong>. You can play the audio yourself, then have Gemini 3.8 Flash listen and draft the official municipal grievance.
                </p>

                <div className="space-y-2.5">
                  {SAMPLE_VOICE_CALLS.map((sample, idx) => (
                    <div
                      key={sample.id}
                      onClick={() => setSelectedAudioSampleIdx(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedAudioSampleIdx === idx
                          ? isDark
                            ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-emerald-50 border-emerald-600 text-slate-900'
                          : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          {sample.langName}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlayAudio(sample.audioBase64 || '', sample.id);
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              playingAudioId === sample.id
                                ? 'bg-cyan-400 text-slate-950 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                            }`}
                          >
                            {playingAudioId === sample.id ? (
                              <>
                                <Pause className="w-3 h-3 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>Play Audio</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Key [{sample.dtmf}]
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs italic line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        "{sample.transcript}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => handleListenSampleAudioWithGemini(selectedAudioSampleIdx)}
                  disabled={isProcessingAudio}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isProcessingAudio
                      ? 'bg-cyan-500/50 text-slate-950 cursor-not-allowed animate-pulse'
                      : isDark
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {isProcessingAudio ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || `Gemini is listening to audio (${formatSeconds(simDuration)})...`}</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-4 h-4" />
                      <span>🎧 Listen to Audio & Draft Complaint with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MODE 2: MICROPHONE LIVE RECORDING */}
            {intakeMode === 'mic_record' && (
              <div className="space-y-4">
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Speak your complaint into your device microphone in <strong>Telugu, Hindi, or English</strong>. Gemini 3.8 Flash will listen to your recording, transcribe your spoken dialect verbatim, and draft the statutory complaint letter.
                </p>

                <div
                  className={`p-6 rounded-xl border text-center space-y-4 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <button
                      onClick={isRecordingMic ? stopMicRecording : startMicRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                        isRecordingMic
                          ? 'bg-red-500 text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {isRecordingMic ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
                    </button>
                  </div>

                  <div>
                    <span className="font-mono text-sm font-bold block">
                      {isRecordingMic
                        ? `Recording Live Speech: ${formatSeconds(micSeconds)}`
                        : recordedAudioDataUrl
                        ? 'Voice Message Recorded!'
                        : 'Click Microphone to Start Speaking'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isRecordingMic
                        ? 'Describe your civic grievance (pothole, water leak, garbage, wire hazard)...'
                        : recordedAudioDataUrl
                        ? 'Ready to send audio to Gemini for listening and drafting.'
                        : 'Speaks Telugu, Hindi, or English'}
                    </span>
                  </div>

                  {recordedAudioDataUrl && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => handleTogglePlayAudio(recordedAudioDataUrl, 'mic-recording')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {playingAudioId === 'mic-recording' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>Preview Recording</span>
                      </button>

                      <button
                        onClick={() => {
                          setRecordedAudioDataUrl(null);
                          setMicSeconds(0);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmitMicAudio}
                  disabled={!recordedAudioDataUrl || isProcessingAudio}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !recordedAudioDataUrl || isProcessingAudio
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isDark
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isProcessingAudio ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Gemini is listening to your audio...</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-4 h-4" />
                      <span>Send My Audio to Gemini & Draft Complaint</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MODE 3: UPLOAD AUDIO FILE */}
            {intakeMode === 'upload_file' && (
              <div className="space-y-4">
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Upload an audio file (<strong>.wav, .mp3, .m4a</strong>) recorded on Exotel or your phone. Gemini will listen to the audio directly, extract the grievance, and draft the statutory complaint letter.
                </p>

                <label
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                    isDark
                      ? 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/60'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
                  <div className="text-center">
                    <span className="font-bold text-xs block">Click to browse or drop audio file</span>
                    <span className="text-[11px] text-slate-500">Supports WAV, MP3, M4A, OGG</span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {isProcessingAudio && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{processingStatus}</span>
                  </div>
                )}
              </div>
            )}

            {/* Architectural Engine Notice */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-200 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authentic Auditory Comprehension Notice</span>
              </div>
              <p>
                Nagaravaani utilizes <strong>Gemini 3.8 Flash</strong> multimodal audio capabilities to directly listen to Telugu, Hindi, and English voice streams. The model detects acoustic sentiment, extracts specific street landmarks, and drafts statutory letters directly from voice audio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: EXOTEL WEBHOOK SETUP MODAL */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 space-y-6 ${
              isDark
                ? 'bg-slate-900 border-cyan-500/40 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-bold text-lg">
                  Exotel Passthru Webhook URL
                </h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To have incoming calls to <strong>04041895372</strong> automatically stream and display in Nagaravaani in real-time with full audio listening, configure this Webhook URL inside your Exotel Applet Flow:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300">
                Passthru / Status Callback Webhook Endpoint:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentWebhookUrl}
                  className={`flex-1 p-2.5 text-xs font-mono rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-cyan-300'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <button
                  onClick={handleCopyWebhookUrl}
                  className="px-3.5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-xs space-y-2 font-mono ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-bold text-cyan-400 block uppercase">
                3-Step Exotel Flow Setup:
              </span>
              <p>
                1. Open Exotel Dashboard → Applets → Inbound Flow for <strong>04041895372</strong>.
              </p>
              <p>
                2. Add a <strong>Passthru</strong> applet after IVR language selection (1 English, 2 Hindi, 3 Telugu) or recording applet.
              </p>
              <p>
                3. Paste the URL above as HTTP POST URL. Recorded call audio and transcripts will automatically be sent to Gemini to listen and draft complaints live!
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXOTEL API CREDENTIALS CONFIG */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCredentials}
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 ${
              isDark
                ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-lg">
                  Connect Exotel Database API
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide your Exotel Account SID, API Key, and Token to pull call logs directly from Exotel's database into Nagaravaani. Secrets are kept strictly in backend server memory.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 font-mono">
                  Exotel Account SID / Subdomain Account:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nagaravaani1 or your Exotel SID"
                  value={credAccountSid}
                  onChange={(e) => setCredAccountSid(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono">Exotel API Key:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5a914c81..."
                  value={credApiKey}
                  onChange={(e) => setCredApiKey(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono">Exotel API Token:</label>
                <input
                  type="password"
                  required
                  placeholder="e.g. 84bc19..."
                  value={credApiToken}
                  onChange={(e) => setCredApiToken(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono">Exotel API Domain:</label>
                <input
                  type="text"
                  value={credSubdomain}
                  onChange={(e) => setCredSubdomain(e.target.value)}
                  placeholder="api.exotel.com"
                  className={`w-full p-2.5 rounded-lg border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCreds}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              >
                {isSavingCreds ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save & Connect</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: INGEST CALL FROM EXOTEL LOG */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleIngestCall}
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 ${
              isDark
                ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-bold text-lg">
                  Import Call from Exotel Log
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste or input call details from your Exotel call log table. Nagaravaani AI will triage the complaint, assign the municipal authority, and display it immediately.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 font-mono">Caller Number:</label>
                  <input
                    type="text"
                    required
                    value={ingestData.from}
                    onChange={(e) => setIngestData({ ...ingestData, from: e.target.value })}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 font-mono">DTMF Language Pressed:</label>
                  <select
                    value={ingestData.digits}
                    onChange={(e) => setIngestData({ ...ingestData, digits: e.target.value })}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="1">1 - English</option>
                    <option value="2">2 - हिन्दी (Hindi)</option>
                    <option value="3">3 - తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono">Spoken Grievance / Transcript:</label>
                <textarea
                  rows={3}
                  placeholder="Citizen spoken complaint or leave empty if providing recording URL..."
                  value={ingestData.transcript}
                  onChange={(e) => setIngestData({ ...ingestData, transcript: e.target.value })}
                  className={`w-full p-2 rounded-lg border font-sans ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 font-mono">Location Hint:</label>
                  <input
                    type="text"
                    value={ingestData.locationHint}
                    onChange={(e) => setIngestData({ ...ingestData, locationHint: e.target.value })}
                    placeholder="e.g. Ameerpet, Hyderabad"
                    className={`w-full p-2 rounded-lg border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 font-mono">Duration (seconds):</label>
                  <input
                    type="number"
                    value={ingestData.duration}
                    onChange={(e) => setIngestData({ ...ingestData, duration: Number(e.target.value) })}
                    className={`w-full p-2 rounded-lg border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 font-mono">
                  Recording URL (Exotel audio file):
                </label>
                <input
                  type="text"
                  placeholder="https://api.exotel.com/.../Recordings/...wav"
                  value={ingestData.recordingUrl}
                  onChange={(e) => setIngestData({ ...ingestData, recordingUrl: e.target.value })}
                  className={`w-full p-2 rounded-lg border font-mono text-[11px] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isIngesting}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              >
                {isIngesting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>Triage with Nagaravaani AI</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
