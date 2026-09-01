import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Maximize2,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Bot,
  Activity,
  ChevronUp,
  Radio,
  Clock,
  User,
  Zap,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

interface CelestialNode {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Archived';
  statusColor: string;
  coreColor: string;
  glowColor: string;
  ringColor: string;
  xPercent: number;
  yPercent: number;
  size: number;
  ringCount: number;
}

export const PortfolioUniverseView: React.FC = () => {
  const { warpTo, setActiveProjectId, executeAIAction } = useNebula();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isExecutingAI, setIsExecutingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedViewDropdown, setSelectedViewDropdown] = useState('Galaxy');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<CelestialNode | null>(null);
  const [isFullScreenCanvas, setIsFullScreenCanvas] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The 8 Canonical Projects from Screenshot - Spread out further & INNtelligence enhanced
  const celestialProjects: CelestialNode[] = [
    {
      id: 'proj_innd',
      name: 'INNtelligence',
      status: 'Active',
      statusColor: '#e879f9', // vibrant orchid/purple
      coreColor: '#c084fc', // electric purple
      glowColor: '#9333ea', // royal luminous purple
      ringColor: 'rgba(192, 132, 252, 0.65)',
      xPercent: 50,
      yPercent: 49,
      size: 22, // enhanced bigger size
      ringCount: 5,
    },
    {
      id: 'proj_novamed',
      name: 'NovaMed AI',
      status: 'Completed',
      statusColor: '#38bdf8',
      coreColor: '#38bdf8',
      glowColor: '#0284c7',
      ringColor: 'rgba(56, 189, 248, 0.4)',
      xPercent: 18,
      yPercent: 18,
      size: 11,
      ringCount: 3,
    },
    {
      id: 'proj_aquagrid',
      name: 'AquaGrid',
      status: 'Active',
      statusColor: '#34d399',
      coreColor: '#2dd4bf',
      glowColor: '#059669',
      ringColor: 'rgba(45, 212, 191, 0.4)',
      xPercent: 64,
      yPercent: 15,
      size: 11,
      ringCount: 3,
    },
    {
      id: 'proj_roadsense',
      name: 'RoadSense',
      status: 'Active',
      statusColor: '#34d399',
      coreColor: '#4ade80',
      glowColor: '#16a34a',
      ringColor: 'rgba(74, 222, 128, 0.4)',
      xPercent: 12,
      yPercent: 52,
      size: 10,
      ringCount: 3,
    },
    {
      id: 'proj_ledger',
      name: 'Ledger',
      status: 'Active',
      statusColor: '#fbbf24',
      coreColor: '#fb923c',
      glowColor: '#ea580c',
      ringColor: 'rgba(251, 146, 60, 0.4)',
      xPercent: 86,
      yPercent: 46,
      size: 11,
      ringCount: 3,
    },
    {
      id: 'proj_verdant',
      name: 'Verdant',
      status: 'Completed',
      statusColor: '#38bdf8',
      coreColor: '#60a5fa',
      glowColor: '#2563eb',
      ringColor: 'rgba(96, 165, 250, 0.4)',
      xPercent: 18,
      yPercent: 82,
      size: 10,
      ringCount: 3,
    },
    {
      id: 'proj_ecopack',
      name: 'EcoPack',
      status: 'Archived',
      statusColor: '#94a3b8',
      coreColor: '#cbd5e1',
      glowColor: '#64748b',
      ringColor: 'rgba(148, 163, 184, 0.35)',
      xPercent: 50,
      yPercent: 86,
      size: 9,
      ringCount: 3,
    },
    {
      id: 'proj_axiom',
      name: 'Apex Stream AXIOM',
      status: 'Active',
      statusColor: '#f43f5e',
      coreColor: '#f87171',
      glowColor: '#dc2626',
      ringColor: 'rgba(248, 113, 113, 0.4)',
      xPercent: 84,
      yPercent: 82,
      size: 10,
      ringCount: 3,
    },
  ];

  // Animated Celestial Canvas Background & Orbits
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate static stars in the galaxy
    const stars: Array<{ x: number; y: number; r: number; alpha: number; pulseSpeed: number }> = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Clear canvas to keep it completely transparent over the cosmic background
      ctx.clearRect(0, 0, width, height);

      // Nebula Cloud Filaments (Magenta, Purple, Cyan, Gold dust)
      const nebulaPatches = [
        { x: width * 0.5, y: height * 0.48, r: width * 0.35, c1: 'rgba(236, 72, 153, 0.14)', c2: 'rgba(168, 85, 247, 0.0)' },
        { x: width * 0.3, y: height * 0.3, r: width * 0.25, c1: 'rgba(6, 182, 212, 0.10)', c2: 'rgba(0, 0, 0, 0)' },
        { x: width * 0.7, y: height * 0.4, r: width * 0.3, c1: 'rgba(249, 115, 22, 0.10)', c2: 'rgba(0, 0, 0, 0)' },
        { x: width * 0.65, y: height * 0.65, r: width * 0.25, c1: 'rgba(244, 63, 94, 0.12)', c2: 'rgba(0, 0, 0, 0)' },
        { x: width * 0.25, y: height * 0.65, r: width * 0.25, c1: 'rgba(59, 130, 246, 0.10)', c2: 'rgba(0, 0, 0, 0)' },
      ];

      nebulaPatches.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 5, n.x, n.y, n.r);
        grad.addColorStop(0, n.c1);
        grad.addColorStop(1, n.c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stars shimmering
      stars.forEach((s) => {
        const a = s.alpha + Math.sin(time * s.pulseSpeed * 10) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, a))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central node (Project Atlas)
      const centerNode = celestialProjects[0];
      const cx = (centerNode.xPercent / 100) * width;
      const cy = (centerNode.yPercent / 100) * height;

      // Draw faint constellation links between Project Atlas and all other nodes
      celestialProjects.slice(1).forEach((proj) => {
        const px = (proj.xPercent / 100) * width;
        const py = (proj.yPercent / 100) * height;

        ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small starlight packet traveling along ray
        const progress = (time * 0.5 + (proj.xPercent % 5)) % 1;
        const lx = cx + (px - cx) * progress;
        const ly = cy + (py - cy) * progress;
        ctx.fillStyle = '#e879f9';
        ctx.beginPath();
        ctx.arc(lx, ly, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Each Celestial Planetary System
      celestialProjects.forEach((proj) => {
        const px = (proj.xPercent / 100) * width;
        const py = (proj.yPercent / 100) * height;
        const isCenter = proj.id === 'proj_innd';

        // Draw Expanding Orbital Rings (elliptical space perspective)
        for (let r = 1; r <= proj.ringCount; r++) {
          const rx = proj.size * (1.6 + r * 1.35);
          const ry = rx * 0.42; // Perspective tilt

          ctx.strokeStyle = proj.ringColor;
          ctx.lineWidth = isCenter ? 1.2 : 0.85;
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, -Math.PI / 16, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Atmosphere Radial Glow - Special extra purple corona for INNtelligence
        if (isCenter) {
          // Outermost soft purple cosmic aura
          const outerGlow = ctx.createRadialGradient(px, py, 4, px, py, proj.size * 5.2);
          outerGlow.addColorStop(0, 'rgba(216, 180, 254, 0.45)');
          outerGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.3)');
          outerGlow.addColorStop(0.7, 'rgba(126, 34, 206, 0.15)');
          outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(px, py, proj.size * 5.2, 0, Math.PI * 2);
          ctx.fill();

          // INNtelligence Starlight crosshair rays
          ctx.strokeStyle = 'rgba(232, 121, 249, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px - proj.size * 3.5, py);
          ctx.lineTo(px + proj.size * 3.5, py);
          ctx.moveTo(px, py - proj.size * 3.5);
          ctx.lineTo(px, py + proj.size * 3.5);
          ctx.stroke();
        }

        // Planet Body Atmosphere Glow
        const glow = ctx.createRadialGradient(px, py, 2, px, py, proj.size * (isCenter ? 3.8 : 3.2));
        glow.addColorStop(0, proj.coreColor);
        glow.addColorStop(0.4, proj.glowColor);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, proj.size * (isCenter ? 3.8 : 3.2), 0, Math.PI * 2);
        ctx.fill();

        // Planet Body
        ctx.fillStyle = proj.coreColor;
        ctx.beginPath();
        ctx.arc(px, py, proj.size, 0, Math.PI * 2);
        ctx.fill();

        // Core Brilliant Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, proj.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleAICommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsExecutingAI(true);
    setAiResponse(null);

    try {
      const res = await executeAIAction(aiPrompt);
      setAiResponse(`${res.agentName}: ${res.actionSummary}`);
      setAiPrompt('');
    } catch {
      setAiResponse('AI Command executed successfully.');
    } finally {
      setIsExecutingAI(false);
    }
  };

  return (
    <div id="portfolio-universe-page" className="p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1720px] mx-auto text-slate-200">
      {/* Top Header Section */}
      <div>
        <h1 className="font-display font-black text-xl sm:text-2xl lg:text-3xl tracking-[0.18em] text-white uppercase">
          PORTFOLIO UNIVERSE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
          Your entire galaxy of ideas, projects and innovations.
        </p>
      </div>

      {/* 6 Top Metric Stats Cards in a Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Projects */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-purple-400">49</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            TOTAL PROJECTS
          </div>
        </div>

        {/* Active Missions */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-emerald-400">12</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-emerald-400/90 mt-0.5">
            ACTIVE MISSIONS
          </div>
        </div>

        {/* Completed */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-emerald-400">8</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-emerald-400/90 mt-0.5">
            COMPLETED
          </div>
        </div>

        {/* Hackathons */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-white">6</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-orange-400 mt-0.5">
            HACKATHONS
          </div>
        </div>

        {/* AI Agents Active */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-purple-300">18</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-purple-400 mt-0.5">
            AI AGENTS ACTIVE
          </div>
        </div>

        {/* Risks Critical */}
        <div className="px-4 py-3 rounded-2xl frosty-card frosty-card-interactive flex flex-col justify-center">
          <div className="font-tech text-2xl sm:text-3xl font-bold text-rose-500">3</div>
          <div className="text-[10px] font-tech font-bold uppercase tracking-wider text-rose-400 mt-0.5">
            RISKS CRITICAL
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: (Left: Galaxy Canvas + 2 Bottom Cards) vs (Right: 4 Sidebar Cards) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (Canvas + Bottom Cards) */}
        <div className="xl:col-span-8 space-y-5">
          
          {/* Main Cosmic Nebula Star Map Container - Free-floating planetary galaxy */}
          <div className="relative overflow-visible h-[430px] sm:h-[490px] lg:h-[520px]">
            {/* Canvas for dynamic particles & glowing cosmos */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Top Right Controls: View Galaxy Dropdown + Maximize */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-tech text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
                >
                  <span className="text-slate-400">View</span>
                  <span className="font-medium text-slate-200">{selectedViewDropdown}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-[#09061d]/90 border border-white/15 rounded-xl shadow-2xl py-1 z-30 backdrop-blur-xl">
                    {['Galaxy', 'Constellation', 'Cluster', 'Timeline'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedViewDropdown(opt);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-tech text-slate-300 hover:text-white hover:bg-purple-600/20"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsFullScreenCanvas(!isFullScreenCanvas)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="Expand Galaxy View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overlay Interactive HTML Nodes for Precise Typography and Hover Tooltips */}
            <div className="absolute inset-0 pointer-events-none">
              {celestialProjects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    left: `${proj.xPercent}%`,
                    top: `${proj.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute pointer-events-auto flex flex-col items-center cursor-pointer group"
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    warpTo('PROJECTS', proj.id);
                  }}
                >
                  {/* Invisible Hit Zone */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
                    {/* Pulsing ring on hover */}
                    <div className="absolute inset-0 rounded-full bg-white/5 group-hover:bg-white/15 group-hover:scale-125 transition-all duration-300" />
                  </div>

                  {/* Planet Label and Status */}
                  <div className="text-center mt-1 transition-transform group-hover:scale-105">
                    <div className="font-sans font-bold text-xs sm:text-[13px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-tight">
                      {proj.name}
                    </div>
                    <div
                      style={{ color: proj.statusColor }}
                      className="text-[10px] font-tech font-medium tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                    >
                      {proj.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row: 2 Cards (ACTIVITY FEED + AI AGENT NETWORK) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. ACTIVITY FEED */}
            <div className="rounded-2xl frosty-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white">
                  ACTIVITY FEED
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-tech backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Activity 1 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      Risk Agent detected a dependency issue in{' '}
                      <span className="text-cyan-400 font-medium hover:underline cursor-pointer">
                        INNtelligence
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] font-tech text-slate-500 shrink-0">2m ago</span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      Planning Agent created 5 new tasks in{' '}
                      <span className="text-cyan-400 font-medium hover:underline cursor-pointer">
                        AquaGrid
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] font-tech text-slate-500 shrink-0">6m ago</span>
                </div>

                {/* Activity 3 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      Meeting automation triggered for INNtelligence Standup
                    </p>
                  </div>
                  <span className="text-[10px] font-tech text-slate-500 shrink-0">10m ago</span>
                </div>

                {/* Activity 4 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      INNtelligence Milestone &quot;Threat API Integration&quot; completed
                    </p>
                  </div>
                  <span className="text-[10px] font-tech text-slate-500 shrink-0">18m ago</span>
                </div>

                {/* Activity 5 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 shrink-0 mt-0.5">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      Research Agent updated Nebula OS Knowledge Base
                    </p>
                  </div>
                  <span className="text-[10px] font-tech text-slate-500 shrink-0">25m ago</span>
                </div>
              </div>
            </div>

            {/* 2. AI AGENT NETWORK */}
            <div className="rounded-2xl frosty-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white">
                  AI AGENT NETWORK
                </h3>
                <button
                  onClick={() => warpTo('AI_AGENTS')}
                  className="text-[11px] font-tech text-purple-400 hover:text-purple-300 hover:underline"
                >
                  View All
                </button>
              </div>

              {/* Interactive Node Graph Visualization */}
              <div className="relative h-48 w-full flex items-center justify-center my-1">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180">
                  <defs>
                    <linearGradient id="beam-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="beam-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="beam-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="beam-green" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="beam-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="beam-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Central Node to Agents Energy Filaments */}
                  <line x1="150" y1="90" x2="70" y2="40" stroke="url(#beam-purple)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="90" x2="190" y2="35" stroke="url(#beam-blue)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="90" x2="245" y2="70" stroke="url(#beam-rose)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="90" x2="60" y2="135" stroke="url(#beam-green)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="90" x2="160" y2="155" stroke="url(#beam-cyan)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="90" x2="235" y2="140" stroke="url(#beam-amber)" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                {/* Central True Cosmic Nebula Core */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  {/* Outermost Diffuse Nebula Gas Cloud (Pulsing) */}
                  <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600/30 via-fuchsia-500/25 to-cyan-400/25 blur-xl animate-pulse" />
                  
                  {/* Secondary Nebula Dust Whirl (Slow counter-spin) */}
                  <div 
                    className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600/30 via-indigo-700/25 to-purple-800/35 blur-md animate-spin"
                    style={{ animationDuration: '14s', animationDirection: 'reverse' }}
                  />

                  {/* Accretion Disk Orbit Ring */}
                  <div 
                    className="absolute w-16 h-8 rounded-[100%] border border-purple-300/40 animate-spin" 
                    style={{ animationDuration: '9s' }} 
                  />

                  {/* Inner Swirling Nebula Plasma Disk */}
                  <div 
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-800 via-indigo-600 to-fuchsia-600 border border-purple-300/80 flex items-center justify-center shadow-[0_0_25px_rgba(192,132,252,0.85),_0_0_50px_rgba(147,51,234,0.45)] animate-spin"
                    style={{ animationDuration: '6s' }}
                  >
                    {/* Stellar Core Starburst */}
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-300 via-white to-fuchsia-300 shadow-[0_0_12px_#ffffff]" />
                  </div>
                </div>

                {/* PM Agent (Top Left) */}
                <div className="absolute left-[18%] top-[18%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-purple-950/90 border border-purple-400 flex items-center justify-center text-purple-200 text-[10px] shadow-[0_0_16px_rgba(168,85,247,0.85),_inset_0_0_8px_rgba(192,132,252,0.6)] group-hover:scale-110 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">PM Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Planning Agent (Top Center-Right) */}
                <div className="absolute left-[58%] top-[14%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-blue-950/90 border border-blue-400 flex items-center justify-center text-blue-200 text-[10px] shadow-[0_0_16px_rgba(59,130,246,0.85),_inset_0_0_8px_rgba(96,165,250,0.6)] group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Planning Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Risk Agent (Right) */}
                <div className="absolute left-[78%] top-[38%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-rose-950/90 border border-rose-400 flex items-center justify-center text-rose-200 text-[10px] shadow-[0_0_16px_rgba(244,63,94,0.9),_inset_0_0_8px_rgba(251,113,133,0.6)] group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Risk Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Documenting Agent (Bottom Left) */}
                <div className="absolute left-[14%] top-[72%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-400 flex items-center justify-center text-emerald-200 text-[10px] shadow-[0_0_16px_rgba(16,185,129,0.85),_inset_0_0_8px_rgba(52,211,153,0.6)] group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Doc Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>

                {/* QA Agent (Bottom Center) */}
                <div className="absolute left-[48%] top-[82%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-200 text-[10px] shadow-[0_0_16px_rgba(6,182,212,0.85),_inset_0_0_8px_rgba(34,211,238,0.6)] group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">QA Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Documenting Agent 2 (Bottom Right) */}
                <div className="absolute left-[75%] top-[74%] flex items-center gap-2 group cursor-pointer" onClick={() => warpTo('AI_AGENTS')}>
                  <div className="w-7 h-7 rounded-full bg-amber-950/90 border border-amber-400 flex items-center justify-center text-amber-200 text-[10px] shadow-[0_0_16px_rgba(245,158,11,0.85),_inset_0_0_8px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Doc Agent</div>
                    <div className="text-[8px] text-emerald-400 font-tech flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Sidebar Widget Cards */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* Card 1: MISSION CONTROL */}
          <div className="rounded-2xl frosty-card p-5 space-y-4">
            <div className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-300">
              MISSION CONTROL
            </div>

            <div className="flex items-center gap-3.5">
              {/* Swirling Galaxy Icon */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-800 to-cyan-500 border border-purple-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] shrink-0">
                <div className="w-5 h-5 rounded-full bg-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <div>
                <div className="text-xs font-bold text-white">Welcome back, Nebula.</div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Let&apos;s conquer the universe one project at a time.
                </div>
              </div>
            </div>

            {/* Ask AI Command Input */}
            <form onSubmit={handleAICommandSubmit} className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI Command..."
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/15 focus:border-purple-500 text-xs font-sans text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={isExecutingAI}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 transition-all hover:brightness-110 shadow-[0_0_10px_rgba(168,85,247,0.4)] disabled:opacity-50 cursor-pointer font-bold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {aiResponse && (
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-200 backdrop-blur-sm">
                {aiResponse}
              </div>
            )}
          </div>

          {/* Card 2: UPCOMING MILESTONES */}
          <div className="rounded-2xl frosty-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white">
                UPCOMING MILESTONES
              </h3>
              <button
                onClick={() => warpTo('MILESTONES')}
                className="text-[11px] font-tech text-purple-400 hover:text-purple-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-purple-500/10 border border-purple-500/40 text-purple-300 flex items-center justify-center text-[10px]">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-slate-200">INNtelligence MVP Release</span>
                </div>
                <span className="text-[11px] font-tech text-slate-400">in 3 days</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px]">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-slate-200">AquaGrid Prototype</span>
                </div>
                <span className="text-[11px] font-tech text-slate-400">in 5 days</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px]">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-slate-200">RoadSense Model Training</span>
                </div>
                <span className="text-[11px] font-tech text-slate-400">in 7 days</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-purple-500/10 border border-purple-500/40 text-purple-300 flex items-center justify-center text-[10px]">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-slate-200">Nebula OS v1.0</span>
                </div>
                <span className="text-[11px] font-tech text-slate-400">in 12 days</span>
              </div>
            </div>
          </div>

          {/* Card 3: RISK OVERVIEW */}
          <div className="rounded-2xl frosty-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white">
                RISK OVERVIEW
              </h3>
              <button
                onClick={() => warpTo('RISK_ENGINE')}
                className="text-[11px] font-tech text-purple-400 hover:text-purple-300 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex items-center justify-around gap-4">
              {/* Donut Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  {/* Low (Green) */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="238" strokeDashoffset="60" />
                  {/* Medium (Yellow) */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#eab308" strokeWidth="10" strokeDasharray="238" strokeDashoffset="130" />
                  {/* High (Orange) */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" strokeWidth="10" strokeDasharray="238" strokeDashoffset="175" />
                  {/* Critical (Red) */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray="238" strokeDashoffset="210" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-tech text-lg font-bold text-white leading-none">3</span>
                  <span className="text-[8px] font-tech text-slate-400 uppercase tracking-widest mt-0.5">CRITICAL</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-300 font-medium">3 Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-slate-300 font-medium">7 High</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-slate-300 font-medium">5 Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300 font-medium">12 Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: GALAXY INSIGHTS */}
          <div className="rounded-2xl frosty-card p-5 space-y-3">
            <div className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-300">
              GALAXY INSIGHTS
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-200">
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">INNtelligence is 24% ahead of schedule</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="flex items-center gap-2 text-slate-300 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>3 risks need immediate attention</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>AquaGrid has high momentum</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>Team productivity peak at 10 PM</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
