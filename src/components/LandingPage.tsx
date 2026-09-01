import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Shield,
  Bot,
  GitFork,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Globe2,
  Terminal,
  ChevronRight,
  X,
  Rocket,
  Droplet,
  Share2,
  Radio,
  Atom,
  LayoutDashboard,
  Wrench,
  Database,
  Radar,
  ExternalLink,
  Target,
  AlertTriangle,
  CheckCircle2,
  Flame,
  LogIn,
  LogOut,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

export const LandingPage: React.FC = () => {
  const {
    warpTo,
    setIsDemoGuideOpen,
    projects,
    firebaseUser,
    isFirebaseLoading,
    loginWithFirebase,
    logoutFirebase,
  } = useNebula();
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>(null);
  const [selectedMapNode, setSelectedMapNode] = useState<{
    id: string;
    name: string;
    status: 'ACTIVE' | 'COMPLETED' | 'AT_RISK';
    health: number;
    team: string;
    coordinates: string;
    projectId?: string;
  } | null>(null);
  const [scanProgress, setScanProgress] = useState(64);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleEnterNebula = () => {
    setLoginError(null);
    warpTo('COMMAND_CENTER');
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const user = await loginWithFirebase();
      if (user) {
        warpTo('COMMAND_CENTER');
      }
    } catch (error: any) {
      const isUserCancelled =
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/user-cancelled' ||
        error?.code === 'auth/popup-blocked';

      if (!isUserCancelled) {
        setLoginError(
          error?.message || 'Authentication encountered an issue. Please try again.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Periodic subtle radar telemetry animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 98 ? 32 : prev + 2));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'COMMAND', view: 'COMMAND_CENTER' as const },
    { label: 'UNIVERSE', view: 'PORTFOLIO' as const, active: true },
    { label: 'MISSIONS', view: 'PROJECTS' as const },
    { label: 'AI AGENTS', view: 'AI_AGENTS' as const },
    { label: 'WORKFLOW', view: 'WORKFLOW' as const },
    { label: 'INTELLIGENCE', view: 'AI_COMMAND' as const },
  ];

  const operationalModules = [
    {
      id: 'COMMAND',
      title: 'COMMAND',
      description: 'Centralized control interface for all active missions and orbital assets.',
      icon: LayoutDashboard,
      view: 'COMMAND_CENTER' as const,
      accent: 'cyan',
    },
    {
      id: 'BUILD',
      title: 'BUILD',
      description: 'Rapid deployment environments for engineering and prototyping nodes.',
      icon: Wrench,
      view: 'PROJECTS' as const,
      accent: 'indigo',
    },
    {
      id: 'ORCHESTRATE',
      title: 'ORCHESTRATE',
      description: 'Automate complex multi-system interactions across the fleet.',
      icon: GitFork,
      view: 'WORKFLOW' as const,
      accent: 'purple',
    },
    {
      id: 'INTELLIGENCE',
      title: 'INTELLIGENCE',
      description: 'Autonomous agents processing telemetry data into actionable insights.',
      icon: Bot,
      view: 'AI_COMMAND' as const,
      accent: 'pink',
    },
    {
      id: 'REMEMBER',
      title: 'REMEMBER',
      description: 'Persistent archival storage forming the organizational neural network.',
      icon: Database,
      view: 'KNOWLEDGE_BASE' as const,
      accent: 'amber',
    },
  ];

  const universeMapNodes = [
    {
      id: 'node-kepler',
      name: 'Project Kepler // Deep Space Telescope',
      status: 'ACTIVE' as const,
      health: 94,
      team: 'Astro-Engineering',
      coordinates: 'RA 19h 50m / Dec +48°',
      top: '64%',
      left: '40%',
      size: 'large',
      projectId: 'prj-1',
    },
    {
      id: 'node-orbital-relay',
      name: 'Orbital Defense Relay Grid',
      status: 'AT_RISK' as const,
      health: 58,
      team: 'Sentinel Defense',
      coordinates: 'Sector 7G / L4 Lagrange',
      top: '38%',
      left: '80%',
      size: 'medium',
      projectId: 'prj-3',
    },
    {
      id: 'node-quantum-core',
      name: 'Quantum Core Propulsion V2',
      status: 'ACTIVE' as const,
      health: 98,
      team: 'Propulsion Dynamics',
      coordinates: 'Alpha Centauri Orbital',
      top: '72%',
      left: '64%',
      size: 'small',
      projectId: 'prj-2',
    },
    {
      id: 'node-solar-array',
      name: 'Helios Solar Array Deployment',
      status: 'COMPLETED' as const,
      health: 100,
      team: 'Energy Infrastructure',
      coordinates: 'Solar Sync Orbit 03',
      top: '30%',
      left: '32%',
      size: 'small',
      projectId: 'prj-4',
    },
    {
      id: 'node-genesis-archive',
      name: 'Genesis Archival Neural Net',
      status: 'ACTIVE' as const,
      health: 91,
      team: 'AI Cognitive Fleet',
      coordinates: 'Deep Memory Sector 09',
      top: '24%',
      left: '68%',
      size: 'small',
      projectId: 'prj-5',
    },
  ];

  return (
    <div id="nebula-landing-page" className="relative min-h-screen z-10 flex flex-col justify-between select-none">
      {/* Top Floating Glass Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => warpTo('LANDING')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="font-brand font-black text-2xl tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            NEBULA OS
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 font-tech text-xs tracking-widest text-slate-300">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => warpTo(item.view)}
              className={`relative py-1 transition-colors uppercase cursor-pointer hover:text-white ${
                item.active ? 'text-white font-bold' : 'text-slate-300/80'
              }`}
            >
              <span>{item.label}</span>
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full border border-purple-400/50"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-tech text-slate-200 max-w-[140px] truncate">
                  {firebaseUser.displayName || firebaseUser.email}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <button
                id="landing-logout-top-btn"
                onClick={logoutFirebase}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-300 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              <button
                id="landing-enter-top-cta"
                onClick={handleEnterNebula}
                className="px-5 py-2 rounded-lg font-tech text-xs font-semibold tracking-wider text-white bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500 border border-white/25 hover:border-white/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer backdrop-blur-md"
              >
                ENTER NEBULA ↗
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="landing-google-signin-top-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-tech text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-purple-400/40 transition-all cursor-pointer disabled:opacity-50"
                title="Sign In with Google Account"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                ) : (
                  <LogIn className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Sign In</span>
              </button>

              <button
                id="landing-enter-top-cta"
                onClick={handleEnterNebula}
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-tech text-xs font-semibold tracking-wider text-white/90 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500 border border-white/20 hover:border-white/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer backdrop-blur-md"
              >
                <span>ENTER NEBULA ↗</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Split Hero Section (Left Glass Card + Right Open Cosmic Constellation) */}
      <main className="w-full max-w-7xl mx-auto px-6 py-6 sm:py-10 flex flex-col gap-20">
        
        {/* Section 1: Hero Split View */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Seamless Transparent Command Area */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
            <div className="relative p-2 sm:p-4 lg:p-6 flex flex-col justify-between">
              
              {/* Status Pill Badge */}
              <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-100 text-[11px] font-tech tracking-wider uppercase mb-6 self-start backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.4)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span>SYSTEM ONLINE V.4.2 // FIREBASE AUTH ACTIVE</span>
              </div>

              {/* Main Headline (Stacked Bold Display Typography with High Contrast Glow) */}
              <h1 className="relative z-10 font-display font-black text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] tracking-tight leading-[1.05] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
                RUN YOUR
                <br />
                ORGANIZATION
                <br />
                LIKE A
                <br />
                UNIVERSE.
              </h1>

              {/* Subtitle Copy */}
              <p className="relative z-10 mt-6 text-sm sm:text-base text-slate-200/90 font-sans leading-relaxed max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                Nebula OS is the operational command system built for teams that build,
                hack, experiment and ship together. Coordinate infinite nodes across deep space.
              </p>

              {/* CTA Action Buttons */}
              <div className="relative z-10 mt-8 sm:mt-10 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    id="landing-enter-nebula-btn"
                    onClick={handleEnterNebula}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-tech text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-950 bg-[#e2e8f0] hover:bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {firebaseUser ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>ENTER NEBULA</span>
                        <ArrowRight className="w-4 h-4 text-purple-700" />
                      </>
                    ) : (
                      <>
                        <span>ENTER NEBULA</span>
                        <ArrowRight className="w-4 h-4 text-purple-700" />
                      </>
                    )}
                  </button>

                  {!firebaseUser && (
                    <button
                      id="landing-google-signin-hero-btn"
                      onClick={handleGoogleSignIn}
                      disabled={isLoggingIn}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-tech text-xs sm:text-sm tracking-wider uppercase text-white/90 bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span>SIGNING IN...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 text-purple-400" />
                          <span>SIGN IN WITH GOOGLE</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    id="landing-view-protocol-btn"
                    onClick={() => setIsProtocolModalOpen(true)}
                    className="flex items-center justify-center px-6 py-3.5 rounded-lg font-tech text-xs sm:text-sm tracking-wider uppercase text-white/80 hover:text-white bg-black/40 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                  >
                    <span>VIEW PROTOCOL</span>
                  </button>
                </div>

                {/* Status or Error Banner */}
                {loginError && (
                  <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-tech flex items-center justify-between max-w-md animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                    <button
                      onClick={() => handleEnterNebula()}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-[10px] font-bold uppercase underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {firebaseUser && !loginError && (
                  <div className="flex items-center gap-2 text-xs font-tech text-emerald-400/90">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Firebase Authenticated: <span className="font-semibold text-white">{firebaseUser.email}</span>
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Open Nebula with Floating Constellation Nodes */}
          <div className="lg:col-span-6 xl:col-span-6 w-full h-[380px] sm:h-[460px] lg:h-[500px] relative flex items-center justify-center">
            
            {/* SVG Constellation Connection Lines weaving across the 4 nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="constellationGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(236,72,153,0.6)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0.4)" />
                </linearGradient>
                <linearGradient id="constellationGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(249,115,22,0.6)" />
                  <stop offset="100%" stopColor="rgba(56,189,248,0.5)" />
                </linearGradient>
              </defs>

              {/* Dotted Constellation Network Lines */}
              <line
                x1="65%"
                y1="25%"
                x2="68%"
                y2="55%"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <line
                x1="68%"
                y1="55%"
                x2="35%"
                y2="70%"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <line
                x1="68%"
                y1="55%"
                x2="90%"
                y2="66%"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <line
                x1="65%"
                y1="25%"
                x2="90%"
                y2="66%"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1="35%"
                y1="70%"
                x2="65%"
                y2="25%"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Pulsing Energy Rings at Node Junctions */}
              <circle cx="65%" cy="25%" r="28" fill="none" stroke="rgba(236,72,153,0.2)" strokeWidth="1" />
              <circle cx="68%" cy="55%" r="36" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="1" />
              <circle cx="35%" cy="70%" r="26" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />
              <circle cx="90%" cy="66%" r="24" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
            </svg>

            {/* Node 1: Top Rocket Launch Node */}
            <div
              style={{ top: '16%', left: '58%' }}
              onMouseEnter={() => setActiveHoverNode('launch')}
              onMouseLeave={() => setActiveHoverNode(null)}
              onClick={() => warpTo('PROJECTS')}
              className="absolute z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-pink-500/30 blur-lg group-hover:bg-pink-500/50 transition-all" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0b0824]/75 border border-white/25 backdrop-blur-xl flex items-center justify-center text-pink-300 group-hover:text-white group-hover:border-pink-400/80 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all">
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
              {activeHoverNode === 'launch' && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-pink-400/50 text-[10px] font-tech text-pink-300 whitespace-nowrap backdrop-blur-md animate-in fade-in">
                  MISSIONS & LAUNCH
                </div>
              )}
            </div>

            {/* Node 2: Center Star/Cluster Network Hub */}
            <div
              style={{ top: '46%', left: '60%' }}
              onMouseEnter={() => setActiveHoverNode('cluster')}
              onMouseLeave={() => setActiveHoverNode(null)}
              onClick={() => warpTo('WORKFLOW')}
              className="absolute z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-purple-500/35 blur-xl group-hover:bg-purple-500/60 transition-all" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0b0824]/80 border border-white/30 backdrop-blur-xl flex items-center justify-center text-purple-300 group-hover:text-white group-hover:border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">
                  <Atom className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
              </div>
              {activeHoverNode === 'cluster' && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-purple-400/50 text-[10px] font-tech text-purple-300 whitespace-nowrap backdrop-blur-md animate-in fade-in">
                  DAG WORKFLOW MATRIX
                </div>
              )}
            </div>

            {/* Node 3: Bottom-Left Droplet Fuel/Resource Node */}
            <div
              style={{ top: '63%', left: '26%' }}
              onMouseEnter={() => setActiveHoverNode('fuel')}
              onMouseLeave={() => setActiveHoverNode(null)}
              onClick={() => warpTo('ACTIVITY')}
              className="absolute z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-orange-500/30 blur-lg group-hover:bg-orange-500/50 transition-all" />
                <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-[#0b0824]/75 border border-white/25 backdrop-blur-xl flex items-center justify-center text-orange-300 group-hover:text-white group-hover:border-orange-400/80 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                  <Droplet className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
                </div>
              </div>
              {activeHoverNode === 'fuel' && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-orange-400/50 text-[10px] font-tech text-orange-300 whitespace-nowrap backdrop-blur-md animate-in fade-in">
                  TELEMETRY & FUEL
                </div>
              )}
            </div>

            {/* Node 4: Far-Right Radar / Satellite Node */}
            <div
              style={{ top: '58%', left: '84%' }}
              onMouseEnter={() => setActiveHoverNode('radar')}
              onMouseLeave={() => setActiveHoverNode(null)}
              onClick={() => warpTo('PORTFOLIO')}
              className="absolute z-20 cursor-pointer group transition-all duration-300 hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-cyan-500/30 blur-lg group-hover:bg-cyan-500/50 transition-all" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0b0824]/75 border border-white/25 backdrop-blur-xl flex items-center justify-center text-cyan-300 group-hover:text-white group-hover:border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              {activeHoverNode === 'radar' && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-cyan-400/50 text-[10px] font-tech text-cyan-300 whitespace-nowrap backdrop-blur-md animate-in fade-in">
                  DEEP SPACE RADAR
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Section 2: OPERATIONAL MODULES (System Architecture 5-Card Matrix) */}
        <section id="operational-modules-section" className="w-full space-y-6 pt-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="font-tech text-[10px] sm:text-xs font-semibold text-slate-400 tracking-widest uppercase block">
                SYSTEM ARCHITECTURE
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
                OPERATIONAL MODULES
              </h2>
            </div>
            <div className="font-tech text-xs tracking-widest text-slate-400 font-semibold bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-md self-start sm:self-auto backdrop-blur-md">
              [05] ACTIVE NODES / 100% EFFICIENCY
            </div>
          </div>

          {/* 5-Column Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {operationalModules.map((module) => {
              const IconComp = module.icon;
              return (
                <div
                  key={module.id}
                  id={`module-card-${module.id.toLowerCase()}`}
                  onClick={() => warpTo(module.view)}
                  className="group relative p-5 rounded-xl frosty-card transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-[0_12px_35px_rgba(168,85,247,0.2)]"
                >
                  {/* Top Icon Box */}
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 group-hover:border-purple-400/60 group-hover:bg-purple-500/10 flex items-center justify-center text-slate-300 group-hover:text-purple-300 transition-all mb-5">
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* Title */}
                    <h3 className="font-tech font-bold text-xs tracking-widest text-white uppercase mb-2 group-hover:text-purple-200 transition-colors">
                      {module.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Subtle Node Indicator */}
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-tech text-white/30 group-hover:text-purple-400/70 transition-colors">
                    <span>SYS // {module.id}</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: YOUR WORK BECOMES A UNIVERSE (Cosmic Telemetry Radar & Map) */}
        <section id="universe-radar-section" className="w-full relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Background Cosmic Nebula Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 opacity-80"
            style={{ backgroundImage: 'url("/cosmic_nebula_bg.jpg")' }}
          />
          {/* Deep Space Gradient Overlays for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03020c]/70 via-transparent to-[#03020c]/85 pointer-events-none" />
          <div className="absolute inset-0 bg-[#02010a]/40 backdrop-blur-[1px] pointer-events-none" />

          {/* Section Inner Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-8">
            
            {/* Title & Subtitle */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
                YOUR WORK BECOMES A
                <br />
                UNIVERSE.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-200/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Map, track, and navigate through every project state in real-time telemetry.
              </p>
            </div>

            {/* Interactive Cosmic Radar Grid Overlay Container */}
            <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-2xl frosty-card border border-white/20 shadow-2xl overflow-hidden">
              
              {/* Coordinate Grid Lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Sweeping Radar Scanner Line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse"
                  style={{
                    position: 'absolute',
                    top: `${scanProgress}%`,
                    transition: 'top 0.6s ease-in-out',
                  }}
                />
              </div>

              {/* Map Legend (Top-Left) */}
              <div className="absolute top-6 left-6 z-20 space-y-3 bg-[#09071c]/75 p-3.5 sm:p-4 rounded-xl border border-white/15 backdrop-blur-md shadow-lg">
                <span className="font-tech text-[10px] tracking-widest text-slate-300 font-bold uppercase block">
                  MAP LEGEND
                </span>
                <div className="space-y-2 font-tech text-[11px] text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] inline-block" />
                    <span>ACTIVE MISSION</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-[0_0_6px_rgba(255,255,255,0.6)] inline-block" />
                    <span>COMPLETED</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] inline-block" />
                    <span>AT RISK</span>
                  </div>
                </div>
              </div>

              {/* Interactive Telemetry Nodes */}
              {universeMapNodes.map((node) => {
                const isSelected = selectedMapNode?.id === node.id;
                const nodeColor =
                  node.status === 'ACTIVE'
                    ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee] border-cyan-200'
                    : node.status === 'AT_RISK'
                    ? 'bg-amber-400 shadow-[0_0_18px_#f59e0b] border-amber-200'
                    : 'bg-slate-200 shadow-[0_0_10px_rgba(255,255,255,0.7)] border-white';

                const haloColor =
                  node.status === 'ACTIVE'
                    ? 'bg-cyan-500/30'
                    : node.status === 'AT_RISK'
                    ? 'bg-amber-500/30'
                    : 'bg-purple-500/25';

                return (
                  <div
                    key={node.id}
                    style={{ top: node.top, left: node.left }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    onClick={() => setSelectedMapNode(isSelected ? null : node)}
                  >
                    {/* Glowing Halo Aura */}
                    <div
                      className={`absolute -inset-3 rounded-full ${haloColor} blur-md animate-ping opacity-50 group-hover:opacity-100 transition-opacity`}
                      style={{ animationDuration: '3s' }}
                    />

                    {/* Outer Rotating Ring on Hover / Selected */}
                    <div
                      className={`absolute -inset-2 rounded-full border border-dashed transition-all ${
                        isSelected
                          ? 'border-cyan-400 scale-125 animate-spin'
                          : 'border-white/20 group-hover:border-white/60 group-hover:scale-110'
                      }`}
                      style={{ animationDuration: '10s' }}
                    />

                    {/* Center Glowing Node Body */}
                    <div
                      className={`relative rounded-full border transition-transform duration-300 group-hover:scale-125 ${nodeColor} ${
                        node.size === 'large'
                          ? 'w-4 h-4'
                          : node.size === 'medium'
                          ? 'w-3.5 h-3.5'
                          : 'w-2.5 h-2.5'
                      }`}
                    />

                    {/* Quick Label on Hover */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#09061c]/90 border border-white/20 text-[10px] font-tech text-white whitespace-nowrap backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                      {node.name.split('//')[0]}
                    </div>
                  </div>
                );
              })}

              {/* Selected Node Telemetry Modal Flyout */}
              {selectedMapNode && (
                <div className="absolute bottom-6 right-6 z-30 w-72 sm:w-80 bg-[#09061c]/95 border border-white/25 backdrop-blur-2xl rounded-xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-tech text-slate-400 tracking-wider">
                        {selectedMapNode.coordinates}
                      </span>
                      <h4 className="font-tech text-xs font-bold text-white leading-tight mt-0.5">
                        {selectedMapNode.name}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMapNode(null);
                      }}
                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-tech bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <div>
                      <span className="text-slate-400 block">STATUS</span>
                      <span
                        className={`font-bold ${
                          selectedMapNode.status === 'ACTIVE'
                            ? 'text-cyan-300'
                            : selectedMapNode.status === 'AT_RISK'
                            ? 'text-amber-400'
                            : 'text-emerald-300'
                        }`}
                      >
                        {selectedMapNode.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">HEALTH</span>
                      <span className="font-bold text-white">{selectedMapNode.health}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">TEAM</span>
                      <span className="font-semibold text-slate-200">{selectedMapNode.team}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => warpTo('PORTFOLIO')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-tech text-xs font-bold uppercase text-slate-950 bg-cyan-300 hover:bg-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                  >
                    <span>OPEN IN UNIVERSE VIEW</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bottom-Left Scanning Telemetry Gauge */}
              <div className="absolute bottom-6 left-6 z-20 space-y-1.5 bg-[#09071c]/75 p-3.5 sm:p-4 rounded-xl border border-white/15 backdrop-blur-md shadow-lg max-w-[240px] sm:max-w-xs">
                <div className="flex items-center justify-between font-tech text-[10px] tracking-wider text-slate-300 font-semibold">
                  <span>SCANNING SECTOR 7G...</span>
                  <span className="text-cyan-400">{scanProgress}%</span>
                </div>
                {/* Progress bar matching the screenshot line */}
                <div className="w-36 sm:w-48 h-1.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 shadow-[0_0_8px_#22d3ee] transition-all duration-500 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Clean Bottom Bar */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-tech text-white/40 gap-2">
        <div className="flex items-center gap-2">
          <span>NEBULA OS // SYS.V4.2</span>
          <span>•</span>
          <span className="text-purple-400">INNOVATE. HACK. CREATE.</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDemoGuideOpen(true)}
            className="text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            MVP DEMO WALKTHROUGH
          </button>
          <span>•</span>
          <span>MULTI-PROJECT CONSTELLATION RUNTIME</span>
        </div>
      </footer>

      {/* Protocol Modal */}
      {isProtocolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl frosty-card border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-white tracking-wider">
                    NEBULA OPERATIONAL PROTOCOL
                  </h3>
                  <p className="text-[11px] font-tech text-purple-400/80">
                    ARCHITECTURE SPECIFICATION & AUTONOMOUS DISPATCH MODEL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProtocolModalOpen(false)}
                className="text-white/40 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-tech text-white/70 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 backdrop-blur-sm">
                <div className="text-purple-300 font-bold uppercase tracking-wider">
                  1. The Cosmic Operating Environment
                </div>
                <p className="text-white/60 font-sans leading-relaxed">
                  Nebula OS rejects conventional flat SaaS metaphors. The universe is the
                  environment; the UI is the holographic instrumentation floating within it.
                  Three visual layers (Cosmos, Holographic Glass, Information) ensure zero
                  loss of data readability while maintaining deep spatial atmosphere.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 backdrop-blur-sm">
                <div className="text-indigo-300 font-bold uppercase tracking-wider">
                  2. Autonomous AI Command Model
                </div>
                <p className="text-white/60 font-sans leading-relaxed">
                  AI agents operate on the same unified PostgreSQL / relational state as human
                  engineers. Commands executed in the AI Command Center trigger real database
                  mutations (task creation, DAG dependency structuring, risk mitigation, and
                  telemetry logging).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 backdrop-blur-sm">
                <div className="text-amber-300 font-bold uppercase tracking-wider">
                  3. 4-Class Cascading Risk Engine
                </div>
                <p className="text-white/60 font-sans leading-relaxed">
                  Automatic detection for Overdue Tasks, Blocked Dependencies, Milestone
                  Risk, and Critical Failures. Risk propagation illuminates downstream DAG
                  vectors and triggers the Risk Agent sentinel with automated mitigation
                  patches.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsProtocolModalOpen(false);
                  handleEnterNebula();
                }}
                className="px-6 py-2.5 rounded-xl font-tech text-xs font-bold text-white bg-purple-500 hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                ENTER COMMAND CENTER →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
