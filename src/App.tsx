import React, { useState, useEffect } from 'react';
import { CivicReport, Language, LeaderboardUser, MunicipalAuthority } from './types';
import { INITIAL_REPORTS, INITIAL_LEADERBOARD, MUNICIPAL_AUTHORITIES } from './data/mockData';
import { fetchReports, fetchLeaderboard, fetchMunicipalOffices } from './services/agentApi';
import { useTheme } from './context/ThemeContext';
import { Navbar, NavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ReportWizard } from './components/ReportWizard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { LiveVoiceDashboard } from './components/LiveVoiceDashboard';
import { CommunityEscalationDashboard } from './components/CommunityEscalationDashboard';
import { CivicMap } from './components/CivicMap';
import { Leaderboard } from './components/Leaderboard';
import { MunicipalDirectory } from './components/MunicipalDirectory';
import { Footer } from './components/Footer';
import { SupportModal } from './components/SupportModal';
import { ReferralModal } from './components/ReferralModal';

export default function App() {
  const { isDark } = useTheme();
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<NavTab>('report');
  const [highlightedTicket, setHighlightedTicket] = useState<string | null>(null);
  
  // Modals state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);

  // User profile state
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('civicai_username') || 'Ayush D.';
  });
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('civicai_points');
    return saved ? parseInt(saved, 10) : 180;
  });

  // Data states
  const [reports, setReports] = useState<CivicReport[]>(INITIAL_REPORTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [municipalOffices, setMunicipalOffices] = useState<MunicipalAuthority[]>(MUNICIPAL_AUTHORITIES);

  // Detect referral code from URL param (?ref=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('civicai_referral_code', refCode.trim().toUpperCase());
      }
    } catch (e) {
      // ignore in non-browser envs
    }
  }, []);

  // Load live data from server API
  const loadData = async () => {
    try {
      const reportsRes = await fetchReports();
      if (reportsRes.reports && reportsRes.reports.length > 0) {
        setReports(reportsRes.reports);
      }
    } catch (e) {
      console.warn('Using local seed reports:', e);
    }

    try {
      const leaderRes = await fetchLeaderboard();
      if (leaderRes.leaderboard && leaderRes.leaderboard.length > 0) {
        setLeaderboard(leaderRes.leaderboard);
      }
    } catch (e) {
      console.warn('Using local seed leaderboard:', e);
    }

    try {
      const officesRes = await fetchMunicipalOffices();
      if (officesRes.offices && officesRes.offices.length > 0) {
        setMunicipalOffices(officesRes.offices);
      }
    } catch (e) {
      console.warn('Using local seed offices:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    localStorage.setItem('civicai_username', newName);
  };

  const handleReportSubmitted = (newReport: CivicReport, pointsAwarded: number, userTotalPoints: number) => {
    // Update local state
    setReports((prev) => [newReport, ...prev]);
    setUserPoints(userTotalPoints);
    localStorage.setItem('civicai_points', userTotalPoints.toString());

    // Refresh data from server
    loadData();
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#030712] text-slate-100 cyber-grid' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Fixed Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userPoints={userPoints}
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
        onOpenReferralModal={() => setIsReferralModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Render Tab Content */}
        {activeTab === 'report' && (
          <div>
            <HeroSection
              currentLang={currentLang}
              onStartReport={() => {
                const el = document.getElementById('report-wizard-container');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreDashboard={() => setActiveTab('dashboard')}
              totalActiveReports={reports.length}
            />

            <div id="report-wizard-container" className="pt-4">
              <ReportWizard
                currentLang={currentLang}
                userName={userName}
                onReportSubmitted={handleReportSubmitted}
                onViewDashboard={() => setActiveTab('dashboard')}
                onViewDirectory={() => setActiveTab('directory')}
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <CitizenDashboard
            currentLang={currentLang}
            reports={reports}
            userPoints={userPoints}
            userName={userName}
            highlightedTicket={highlightedTicket}
            onRefreshReports={loadData}
            onNewReportClick={() => setActiveTab('report')}
          />
        )}

        {/* 1. VOICE HELPLINE (Exotel 04041895372) */}
        {activeTab === 'voice' && (
          <LiveVoiceDashboard
            currentLang={currentLang}
            onRefreshAllData={loadData}
            onViewReportDetails={(ticketNumber) => {
              setHighlightedTicket(ticketNumber || null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* 2. COMMUNITY ESCALATION & SOCIAL AMPLIFICATION */}
        {activeTab === 'escalation' && (
          <CommunityEscalationDashboard
            currentLang={currentLang}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'map' && (
          <CivicMap
            currentLang={currentLang}
            reports={reports}
            onSelectReport={(report) => {
              setHighlightedTicket(report.ticketNumber);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentLang={currentLang}
            leaderboard={leaderboard}
            currentUserName={userName}
            onUpdateUserName={handleUpdateUserName}
          />
        )}

        {activeTab === 'directory' && (
          <MunicipalDirectory
            currentLang={currentLang}
            offices={municipalOffices}
          />
        )}

      </main>

      {/* Global Clean Footer */}
      <Footer
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
        onOpenReferralModal={() => setIsReferralModalOpen(true)}
      />

      {/* 3. SUPPORT / DONATE MODAL */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* 4. REFER A FRIEND MODAL */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        userName={userName}
        onRefreshPoints={loadData}
      />

    </div>
  );
}
