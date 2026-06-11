import React, { useState, useEffect } from 'react';
import { UserProfile, ChatMessage, ActivityLog, AgentId, Agent } from './types';
import { AGENTS, MALAWI_SUBJECTS } from './data';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import AgentChat from './components/AgentChat';
import ParentDashboard from './components/ParentDashboard';
import { GraduationCap, LogOut, ChevronRight, BookOpen, Clock, PenTool, Layout, CheckCircle, FileText, ArrowRight } from 'lucide-react';

type Screen = 'landing' | 'auth' | 'dashboard' | 'chat' | 'parent-dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // 1. Recover active user registration status from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('learnfast_active_user');
    if (savedUser) {
      const profile: UserProfile = JSON.parse(savedUser);
      setUserProfile(profile);
      setCurrentScreen('dashboard');

      // Recover student logs for this phone profile
      const savedLogs = localStorage.getItem(`learnfast_logs_${profile.phone}`);
      if (savedLogs) {
        setActivityLogs(JSON.parse(savedLogs));
      }
    }
  }, []);

  // 2. Handle Login/Signup completions
  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('learnfast_active_user', JSON.stringify(profile));
    setCurrentScreen('dashboard');

    // Load logs for this specific phone number, if any exist
    const savedLogs = localStorage.getItem(`learnfast_logs_${profile.phone}`);
    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    } else {
      setActivityLogs([]);
    }
  };

  // 3. Clear user session
  const handleLogout = () => {
    localStorage.removeItem('learnfast_active_user');
    setUserProfile(null);
    setActivityLogs([]);
    setCurrentScreen('landing');
  };

  // 4. Save and append learning log traces
  const handleAddNewLog = (newLog: ActivityLog) => {
    if (!userProfile) return;
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem(`learnfast_logs_${userProfile.phone}`, JSON.stringify(updated));
  };

  // 5. Update direct log statuses inside parent panel
  const handleUpdateLogsList = (updatedLogs: ActivityLog[]) => {
    if (!userProfile) return;
    setActivityLogs(updatedLogs);
    localStorage.setItem(`learnfast_logs_${userProfile.phone}`, JSON.stringify(updatedLogs));
  };

  // 6. Navigate direct agent session from shortcut topic selection
  const handleFeaturedTopicClick = (agentId: AgentId, subjName: string, topicTitle: string) => {
    const agent = AGENTS.find(a => a.id === agentId);
    if (agent && userProfile) {
      setSelectedAgent(agent);
      setCurrentScreen('chat');
    }
  };

  // 7. Verify Grade Levels
  const isMSCE = userProfile?.grade === 'Form 3' || userProfile?.grade === 'Form 4';
  const gradeLevelToken = isMSCE ? 'MSCE' : 'JCE';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* 1. Landing View Router */}
      {currentScreen === 'landing' && (
        <LandingPage
          onStartLearning={() => setCurrentScreen('auth')}
          onGoToAuth={() => setCurrentScreen('auth')}
        />
      )}

      {/* 2. Login/Register View Router */}
      {currentScreen === 'auth' && (
        <AuthScreen
          onBack={() => setCurrentScreen('landing')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Main Student Classroom Hub */}
      {currentScreen === 'dashboard' && userProfile && (
        <div className="flex flex-col min-h-screen justify-between pb-12">
          {/* Dashboard Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-indigo-950">LearnFast</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded ml-2 font-mono text-slate-600 font-bold uppercase">Student Deck</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">{userProfile.school}</div>
                  <div className="text-sm font-bold text-slate-800">Welcome, {userProfile.name}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-700 text-xs font-semibold rounded-lg hover:bg-red-50/50 transition-all flex items-center space-x-1 cursor-pointer"
                  id="dashboard-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </header>

          {/* Student Center Workspace */}
          <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 space-y-10">
            
            {/* Visual Student Profile Header Banner */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 border border-indigo-100/60 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  Malawi Syllabus Tier: {gradeLevelToken} Level Study Active
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-905">Study Centre Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Select an academic learning agent below to solve your math exercises, explore JCE/MSCE subjects, or generate homework reports.
                </p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-28 shadow-xs">
                  <div className="text-2.5xl font-extrabold text-slate-900">{activityLogs.length}</div>
                  <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-0.5">Logs Logged</div>
                </div>
                <button
                  onClick={() => setCurrentScreen('parent-dashboard')}
                  className="px-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm shadow-indigo-150 cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-w-36 h-[76px]"
                  id="nav-parent-btn"
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span>Parent Portal Logs</span>
                </button>
              </div>
            </div>

            {/* AI Learning Agent Selection Deck */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Available AI Learning Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tutor Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500 transition-all duration-200 shadow-xs">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                        STUDENT COMPANION
                      </span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Curriculum Tutor</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">MSCE & JCE curriculum specialist. Direct curriculum-aligned explanations with local practice examples.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 mt-5">
                    <button
                      onClick={() => {
                        setSelectedAgent(AGENTS[0]);
                        setCurrentScreen('chat');
                      }}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      id="select-agent-btn-tutor"
                    >
                      <span>Consult Tutor Now</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Socratic Helper Card */}
                <div className="bg-white border-2 border-indigo-500 p-6 rounded-2xl flex flex-col justify-between shadow-xs relative">
                  <div className="absolute top-[-10px] right-4 bg-indigo-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">ACTIVE TUTORIAL</div>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                        SOCRATIC COACH
                      </span>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Homework Helper</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Uses step-by-step socratic nudging rather than giving solutions. Perfect for mathematics, physics and chemistry formulas.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 mt-5">
                    <button
                      onClick={() => {
                        setSelectedAgent(AGENTS[1]);
                        setCurrentScreen('chat');
                      }}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      id="select-agent-btn-homework"
                    >
                      <span>Engage Helper Coach</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Parent Report Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500 transition-all duration-200 shadow-xs">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                        PARENT SYNC
                      </span>
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Parent Report Agent</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Takes current study logs to formulate academic progress statements and bias-aware gap logs for guardians.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 mt-5">
                    <button
                      onClick={() => {
                        setCurrentScreen('parent-dashboard');
                      }}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      id="select-agent-btn-parent"
                    >
                      <span>Access Parent Center</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick study syllabus shortcuts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Featured Secondary Syllabus Topics ({gradeLevelToken})</h2>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                    {MALAWI_SUBJECTS.map((subj) => {
                      const topic = subj.topics.find(t => t.gradeLevel === gradeLevelToken);
                      if (!topic) return null;
                      return (
                        <div key={subj.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-bold text-indigo-600">{subj.name}</span>
                              <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-550 font-mono">{topic.gradeLevel}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 truncate">{topic.title}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{topic.description}</p>
                          </div>
                          <button
                            onClick={() => handleFeaturedTopicClick('tutor', subj.name, topic.title)}
                            className="px-3 py-1.5 text-[10px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 transition-all font-bold shrink-0 cursor-pointer flex items-center space-x-1"
                            id={`quick-topic-learn-${subj.id}`}
                          >
                            <span>Learn</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Log Highlights snippet */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Activity Summary Logs</h2>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[250px] shadow-xs">
                  {activityLogs.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3 py-8">
                      <Clock className="h-8 w-8 text-slate-200" />
                      <p className="text-xs text-slate-500 font-semibold">No active progress logs tracked yet.</p>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Ask any Subject Tutor first to auto-generate structured logs for your parent evaluator.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-grow overflow-y-auto max-h-56 pr-1">
                      {activityLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                          <div className="space-y-1 min-w-0">
                            <span className="text-[9px] bg-indigo-50 border border-indigo-100 font-mono font-bold text-indigo-750 px-2 py-0.5 rounded uppercase">
                              {log.subject}
                            </span>
                            <div className="text-xs font-bold text-slate-800 italic truncate pr-2">
                              &quot;{log.question}&quot;
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Logged on: {log.timestamp}
                            </div>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            log.status === 'Understood' 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Want to share this progress with your guardians?</span>
                    <button
                      onClick={() => setCurrentScreen('parent-dashboard')}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                      id="summary-parent-link"
                    >
                      Open Parent Panel
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </main>

          {/* Footer */}
          <footer className="max-w-6xl w-full mx-auto px-4 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div>LearnFast Malawi &bull; Form 1 - 4 JCE &amp; MSCE Active Guidance</div>
            <div className="font-mono text-[10px]">Active Session Account: {userProfile.phone}</div>
          </footer>
        </div>
      )}

      {/* 5. Active Chat View Router */}
      {currentScreen === 'chat' && selectedAgent && userProfile && (
        <AgentChat
          agent={selectedAgent}
          userProfile={userProfile}
          onBack={() => {
            setSelectedAgent(null);
            setCurrentScreen('dashboard');
          }}
          onNewLog={handleAddNewLog}
        />
      )}

      {/* 6. Parent Supervisor Dashboard Router */}
      {currentScreen === 'parent-dashboard' && userProfile && (
        <ParentDashboard
          userProfile={userProfile}
          activityLogs={activityLogs}
          onBack={() => setCurrentScreen('dashboard')}
          onUpdateLogs={handleUpdateLogsList}
          onAddManualLog={handleAddNewLog}
        />
      )}

    </div>
  );
}
