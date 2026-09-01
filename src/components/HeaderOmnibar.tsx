import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bell,
  Users,
  X,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  User,
  CheckCircle2,
  Loader2,
  Flame,
  MessageSquare,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

export const HeaderOmnibar: React.FC = () => {

  const {
    setCurrentView,
    warpTo,
    projects,
    activeProjectId,
    setActiveProjectId,
    activityLogs,
    isOmnibarOpen,
    setIsOmnibarOpen,
    executeAIAction,
    firebaseUser,
    isFirebaseLoading,
    loginWithFirebase,
    logoutFirebase,
  } = useNebula();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [aiExecuting, setAiExecuting] = useState(false);
  const [aiExecutionResult, setAiExecutionResult] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeaderLogin = async () => {
    setIsLoggingIn(true);
    try {
      const user = await loginWithFirebase();
      if (user) {
        setIsProfileMenuOpen(false);
      }
    } catch (e: any) {
      const isUserCancelled =
        e?.code === 'auth/popup-closed-by-user' ||
        e?.code === 'auth/cancelled-popup-request' ||
        e?.code === 'auth/user-cancelled' ||
        e?.code === 'auth/popup-blocked';

      if (!isUserCancelled) {
        console.error('Header login error:', e);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Global Ctrl + K / ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOmnibarOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOmnibarOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOmnibarOpen]);

  const handleRunCommand = async (customPrompt?: string) => {
    const query = customPrompt || searchQuery;
    if (!query.trim()) return;

    setAiExecuting(true);
    setAiExecutionResult(null);

    try {
      const res = await executeAIAction(query, activeProjectId);
      setAiExecutionResult(`${res.agentName}: ${res.actionSummary}`);
      setTimeout(() => {
        setIsOmnibarOpen(false);
        setAiExecuting(false);
        setSearchQuery('');
        setCurrentView('AI_COMMAND');
      }, 1200);
    } catch (e) {
      setAiExecuting(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hackathon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header
        id="nebula-global-header"
        className="sticky top-0 z-40 w-full h-16 border-b border-transparent bg-transparent px-4 sm:px-6 flex items-center justify-between"
      >
        {/* Left: Brand Identity with Vortex Icon */}
        <div
          onClick={() => setCurrentView('COMMAND_CENTER')}
          className="flex items-center gap-3 cursor-pointer group shrink-0 min-w-[200px]"
        >
          {/* Glowing Animated Celestial Spiral / Vortex */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 animate-spin blur-[2px] opacity-80" style={{ animationDuration: '8s' }} />
            <div className="relative w-7 h-7 rounded-full bg-[#070514] border border-purple-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.8)]">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="font-brand font-bold text-sm tracking-[0.18em] text-white flex items-center gap-1.5">
              <span>NEBULA OS</span>
            </div>
            <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-tech">
              INNOVATE. HACK. CREATE.
            </p>
          </div>
        </div>

        {/* Center: Search anything in Nebula OS... with ⌘K */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <button
            id="global-omnibar-button"
            onClick={() => setIsOmnibarOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[#09071c]/80 border border-white/10 hover:border-purple-500/40 text-slate-300 text-xs transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-purple-400 transition-colors" />
              <span className="truncate text-slate-400 font-normal text-xs">
                Search anything in Nebula OS...
              </span>
            </div>
            <div className="flex items-center shrink-0 pl-2">
              <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-tech text-slate-300 shadow-sm">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Orbit Return, Sparkle, Bell with 7, Profile dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Quick Exit to Landing / Orbit */}
          <button
            onClick={() => warpTo('LANDING')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-tech transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
            title="Return to Nebula Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline font-medium">Orbit View</span>
          </button>

          {/* AI Sparkle Star */}
          <button
            onClick={() => setCurrentView('AI_COMMAND')}
            className="p-2 rounded-xl bg-[#0b0c26]/90 border border-blue-500/30 hover:border-blue-400 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all cursor-pointer"
            title="AI Command Sentinel"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Team Comms Group Chat Quick Link */}
          <button
            id="header-team-chat-btn"
            onClick={() => setCurrentView('TEAM_CHAT')}
            className="relative p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
            title="Team Comms Network & Group Chat"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {/* Notifications Bell with Pink 7 Badge */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold font-mono flex items-center justify-center shadow-[0_0_8px_#ec4899]">
                7
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#080618]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-sans text-xs font-semibold text-white">
                    Live Mission Notifications
                  </span>
                  <span className="text-[10px] font-mono text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-500/30">
                    7 New
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-white/5 mt-2">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-tech text-purple-300 font-medium">{log.actor.name}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <div className="text-xs text-white/90">{log.action}</div>
                      <div className="text-[11px] text-slate-400 truncate">{log.entityName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nebula Operator / Firebase Auth Profile Pill & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#09071c]/90 border border-white/10 hover:border-purple-500/40 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
              title={firebaseUser ? `Authenticated: ${firebaseUser.displayName || firebaseUser.email}` : 'Sign In with Firebase'}
            >
              {/* Avatar or Swirling Galaxy Icon */}
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'User'}
                  className="w-7 h-7 rounded-lg border border-purple-400/50 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-900 to-indigo-700 border border-purple-400/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                  {firebaseUser ? (firebaseUser.displayName || 'Operator') : 'Log In'}
                </div>
                <div className="text-[10px] text-emerald-400 leading-tight">
                  {firebaseUser ? 'Connected' : 'Firebase Auth'}
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Profile & Auth Popover Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#080618]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="font-tech text-xs font-bold text-white uppercase tracking-wider">
                      FIREBASE AUTH
                    </span>
                  </div>
                  <span className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded-full ${
                    firebaseUser ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-white/10'
                  }`}>
                    {firebaseUser ? 'ONLINE' : 'GUEST'}
                  </span>
                </div>

                {firebaseUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                      {firebaseUser.photoURL ? (
                        <img
                          src={firebaseUser.photoURL}
                          alt={firebaseUser.displayName || 'User'}
                          className="w-10 h-10 rounded-xl border border-purple-400/50 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {firebaseUser.displayName || 'Operator'}
                        </div>
                        <div className="text-[11px] text-purple-300 font-mono truncate">
                          {firebaseUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1.5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setCurrentView('SETTINGS');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-tech font-bold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>System Settings</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={async () => {
                          await logoutFirebase();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-tech font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sign in with your Google account via Firebase to synchronize your projects, databases, and mission logs.
                    </p>
                    <button
                      onClick={handleHeaderLogin}
                      disabled={isLoggingIn}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-tech font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Sign In with Google</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Omnibar Dialog Overlay (Ctrl + K) */}
      {isOmnibarOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl bg-[#070b22]/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Input Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                id="omnibar-search-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunCommand();
                }}
                placeholder="Ask Nebula AI, search projects, tasks, agents, or plan milestones..."
                className="w-full bg-transparent text-sm font-sans text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setIsOmnibarOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Execution Feedback */}
            {aiExecuting && (
              <div className="p-4 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center gap-3 text-xs font-tech text-cyan-300">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Executing autonomous agent intent and updating project state...</span>
              </div>
            )}

            {aiExecutionResult && (
              <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center gap-3 text-xs font-tech text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiExecutionResult}</span>
              </div>
            )}

            {/* Suggestions & Quick Prompts */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <div className="text-[10px] font-tech uppercase text-slate-400 tracking-wider mb-2">
                  Suggested Autonomous Commands
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Query Project Database & PRD',
                    'What is blocking Atlas?',
                    'Fix the highest-priority blocker',
                    'Summarize Atlas sprint status',
                    'Create milestone MVP for Atlas',
                    'Assign API analysis to Risk Agent',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleRunCommand(prompt)}
                      className="text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/30 text-xs font-tech text-slate-300 hover:text-cyan-200 flex items-center justify-between group transition-all"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects Quick Jump */}
              <div>
                <div className="text-[10px] font-tech uppercase text-slate-400 tracking-wider mb-2">
                  Celestial Projects
                </div>
                <div className="space-y-1">
                  {filteredProjects.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setCurrentView('PROJECTS');
                        setIsOmnibarOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/60 text-xs font-tech flex items-center justify-between text-slate-300 hover:text-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.celestial.color }}
                        />
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-400">({p.hackathon})</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">{p.progress}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Omnibar Footer */}
            <div className="p-3 bg-[#030511] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-tech text-slate-500">
              <div className="flex items-center gap-3">
                <span>[Enter] Run AI Command</span>
                <span>[Esc] Close</span>
              </div>
              <span className="text-cyan-400/80">NEBULA AI CORE ACTIVE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

