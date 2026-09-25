import React, { useState } from 'react';
import { LeaderboardUser, Language } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Award, ShieldCheck, Trophy, Sparkles, User, Info, CheckCircle2, Zap } from 'lucide-react';

interface LeaderboardProps {
  currentLang: Language;
  leaderboard: LeaderboardUser[];
  currentUserName: string;
  onUpdateUserName: (name: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboard,
  currentUserName,
  onUpdateUserName,
}) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUserName);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className={`rounded-2xl border p-6 sm:p-8 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-cyan-400 font-mono' : 'text-slate-500'
            }`}>
              {isDark ? 'CIVIC LEAGUE STANDINGS' : 'Community Engagement'}
            </span>
          </div>
          <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Citizen Action Leaderboard
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Rewarding proactive citizens who report verified civic hazards in smart cities.
          </p>
        </div>

        {/* User Privacy & Display Name Card */}
        <div className={`p-3.5 rounded-xl border space-y-2 shrink-0 ${
          isDark
            ? 'bg-slate-950 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Your Display Name:
            </span>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`text-xs font-bold hover:underline cursor-pointer ${
                  isDark ? 'text-cyan-400' : 'text-emerald-700'
                }`}
              >
                Edit for Privacy
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`text-xs hover:underline cursor-pointer ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Cancel
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className={`flex items-center gap-2 text-sm font-extrabold ${
              isDark ? 'text-cyan-300 font-mono' : 'text-slate-900'
            }`}>
              <User className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              <span>{currentUserName}</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className={`px-2.5 py-1 text-xs rounded border focus:outline-none w-36 ${
                  isDark
                    ? 'bg-slate-900 border-cyan-500/40 text-slate-100 focus:border-cyan-400'
                    : 'border-slate-300 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                }`}
                maxLength={20}
              />
              <button
                type="submit"
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  isDark
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Point Rules Configuration Box */}
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all ${
        isDark
          ? 'bg-[#060c20] text-white border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'bg-emerald-950 text-white border-emerald-800'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold uppercase tracking-wider font-heading ${
            isDark ? 'text-cyan-300 font-mono' : 'text-emerald-300'
          }`}>
            Official Municipal Reward Criteria
          </h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
            isDark
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 font-mono'
              : 'bg-emerald-900 text-emerald-300 border-emerald-700'
          }`}>
            {isDark ? 'Civic XP Engine' : 'Prototype Gamification'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Pothole</span>
            <span className="text-amber-400 font-mono font-bold text-base">10 pts</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Streetlight</span>
            <span className="text-yellow-400 font-mono font-bold text-base">10 pts</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Sewage</span>
            <span className="text-emerald-400 font-mono font-bold text-base">20 pts</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Foul Smell</span>
            <span className="text-lime-400 font-mono font-bold text-base">20 pts</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Flooding</span>
            <span className="text-sky-400 font-mono font-bold text-base">50 pts</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-emerald-900/60 border-emerald-800'
          }`}>
            <span className="block text-slate-300 text-[11px]">Road Block</span>
            <span className="text-orange-400 font-mono font-bold text-base">50 pts</span>
          </div>
        </div>

        <p className={`text-xs leading-relaxed pt-1 ${
          isDark ? 'text-slate-300' : 'text-emerald-200/90'
        }`}>
          Anti-Spam Rule: Only the first three distinct reports for the same civic issue receive reward points. If an issue has already reached three qualifying reports, subsequent submissions add community evidence but receive no reward points.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className={`rounded-2xl border shadow-xs overflow-hidden transition-all ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider font-heading ${
            isDark ? 'text-cyan-300 font-mono' : 'text-slate-900'
          }`}>
            Top Citizen Rankings
          </h4>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>
            Active Participating Citizens
          </span>
        </div>

        <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
          {leaderboard.map((user) => {
            const isCurrentUser = user.displayName.toLowerCase() === currentUserName.toLowerCase();

            return (
              <div
                key={user.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  isCurrentUser 
                    ? isDark 
                      ? 'bg-cyan-950/30 border-l-4 border-l-cyan-400' 
                      : 'bg-emerald-50/60 border-l-4 border-l-emerald-600' 
                    : isDark 
                      ? 'hover:bg-slate-950/40' 
                      : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 ${
                    user.rank === 1
                      ? isDark
                        ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                        : 'bg-amber-400 text-slate-950 shadow-xs'
                      : user.rank === 2
                      ? isDark
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_#06b6d4]'
                        : 'bg-slate-300 text-slate-900'
                      : user.rank === 3
                      ? isDark
                        ? 'bg-purple-500 text-white shadow-[0_0_12px_#a855f7]'
                        : 'bg-amber-700 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-bold font-heading ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {user.displayName}
                      </span>
                      {isCurrentUser && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isDark
                            ? 'text-cyan-300 bg-cyan-950 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-mono'
                            : 'text-emerald-700 bg-emerald-100 border-transparent'
                        }`}>
                          You
                        </span>
                      )}
                    </div>
                    <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Badge: {user.badge} · Active since {user.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 sm:gap-10 text-right">
                  <div>
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Issues
                    </span>
                    <span className={`text-sm font-extrabold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.issuesReported} reports
                    </span>
                  </div>

                  <div className="min-w-[70px]">
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Points
                    </span>
                    <span className={`text-base sm:text-lg font-black font-mono ${
                      isDark ? 'text-cyan-300 neon-text-cyan' : 'text-emerald-600'
                    }`}>
                      {user.points} pts
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
