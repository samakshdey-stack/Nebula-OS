import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Send,
  ExternalLink,
  Bot,
  Shield,
  Layers,
  Calendar,
  User,
  Activity,
  ChevronRight,
  TrendingUp,
  Cpu,
  Flame,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { CommandMeetDispatcher } from './CommandMeetDispatcher';

export const CommandCenterView: React.FC = () => {
  const {
    projects,
    agents,
    tasks,
    milestones,
    risks,
    activeProjectId,
    setActiveProjectId,
    setCurrentView,
    warpTo,
    executeAIAction,
    activityLogs,
  } = useNebula();

  const [velocityTimeframe, setVelocityTimeframe] = useState<'7D' | '30D' | '90D'>('30D');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExecutingAi, setIsExecutingAi] = useState(false);
  const [aiOutput, setAiOutput] = useState<{ summary: string; agent: string } | null>(null);
  const [activeDockTab, setActiveDockTab] = useState<'COMMAND' | 'BUILD' | 'AUTOMATE' | 'ANALYZE' | 'INNOVATE'>('COMMAND');

  // Canvas ref for Project Health Spiral Galaxy
  const galaxyCanvasRef = useRef<HTMLCanvasElement>(null);
  // Canvas ref for Cosmic Nebula Core (Nebula OS)
  const nebulaCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Densely Animated Rotating Spiral Galaxy Canvas
  useEffect(() => {
    const canvas = galaxyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate high-density stars & cosmic gas particles (950+ particles)
    const numStars = 850;
    const colors = [
      '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', 
      '#fbbf24', '#f87171', '#22d3ee', '#a7f3d0', '#ffffff',
      '#60a5fa', '#e879f9', '#fde047'
    ];

    interface GalaxyStar {
      r: number;
      theta: number;
      size: number;
      color: string;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      arm: number;
    }

    const stars: GalaxyStar[] = [];

    for (let i = 0; i < numStars; i++) {
      // 5-arm logarithmic spiral galaxy with core bulge
      const isCoreBulge = i < 180;
      let dist: number;
      let armOffset: number;
      let spiralAngle: number;
      const arm = i % 5;

      if (isCoreBulge) {
        dist = Math.random() * 22 + 2;
        armOffset = Math.random() * Math.PI * 2;
        spiralAngle = armOffset;
      } else {
        armOffset = (arm * 2 * Math.PI) / 5;
        dist = Math.pow(Math.random(), 1.35) * 58 + 14;
        const scatter = (Math.random() - 0.5) * (0.35 + dist * 0.005);
        spiralAngle = dist * 0.14 + armOffset + scatter;
      }

      stars.push({
        r: dist,
        theta: spiralAngle,
        size: isCoreBulge ? Math.random() * 1.8 + 0.8 : Math.random() * 1.4 + 0.4,
        color: isCoreBulge 
          ? (Math.random() > 0.4 ? '#fef08a' : '#fed7aa') 
          : colors[Math.floor(Math.random() * colors.length)],
        speed: (0.005 + (1 / (dist + 5)) * 0.08) * (Math.random() * 0.4 + 0.8),
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        arm,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Multi-layer Glowing Galaxy Core Accretion
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      grad.addColorStop(0.15, 'rgba(251, 146, 60, 0.45)');
      grad.addColorStop(0.35, 'rgba(168, 85, 247, 0.3)');
      grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(0.85, 'rgba(16, 185, 129, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 64, 0, Math.PI * 2);
      ctx.fill();

      // Cosmic dust nebulas in spiral arms
      angle += 0.012;
      
      // Draw stars with Keplerian differential rotation
      stars.forEach((star) => {
        const curTheta = star.theta + angle * star.speed * 8;
        const x = cx + star.r * Math.cos(curTheta);
        const y = cy + star.r * 0.68 * Math.sin(curTheta); // Tilted ellipse

        star.twinklePhase += star.twinkleSpeed;
        const alpha = 0.5 + Math.sin(star.twinklePhase) * 0.5;

        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha + 0.2);
        ctx.fillStyle = star.color;
        
        if (star.size > 1.2) {
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 6;
        }

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ultra-Luminous Core Flare
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Swirling Multidimensional Cosmic Nebula Core (Nebula OS) with Purple, Pink & Orange Plasma Clouds
  useEffect(() => {
    const canvas = nebulaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Generate volumetric interstellar gas clouds and dust filaments
    interface NebulaPuff {
      angle: number;
      dist: number;
      baseRadius: number;
      speed: number;
      radialSpeed: number;
      color: 'purple' | 'pink' | 'orange' | 'gold' | 'magenta';
      alpha: number;
      oscPhase: number;
    }

    const puffs: NebulaPuff[] = [];
    const numPuffs = 72;
    const colorPalette = ['purple', 'pink', 'orange', 'gold', 'magenta'] as const;

    for (let i = 0; i < numPuffs; i++) {
      puffs.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.pow(Math.random(), 0.9) * 44 + 4,
        baseRadius: Math.random() * 24 + 18,
        speed: (Math.random() * 0.008 + 0.004) * (Math.random() > 0.4 ? 1 : -0.7),
        radialSpeed: (Math.random() * 0.02 + 0.01),
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        alpha: Math.random() * 0.35 + 0.25,
        oscPhase: Math.random() * Math.PI * 2,
      });
    }

    // Generate embedded proto-stars that sparkle within the nebula
    interface ProtoStar {
      x: number;
      y: number;
      size: number;
      twinkle: number;
      speed: number;
      color: string;
    }

    const protoStars: ProtoStar[] = [];
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 1.2) * 50;
      protoStars.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        size: Math.random() * 1.6 + 0.6,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.08 + 0.03,
        color: Math.random() > 0.5 ? '#ffffff' : (Math.random() > 0.5 ? '#fed7aa' : '#f472b6'),
      });
    }

    const colorGradients: Record<string, { r: number; g: number; b: number }> = {
      purple: { r: 168, g: 85, b: 247 }, // #a855f7
      pink: { r: 236, g: 72, b: 153 },   // #ec4899
      orange: { r: 249, g: 115, b: 22 }, // #f97316
      gold: { r: 251, g: 191, b: 36 },   // #fbbf24
      magenta: { r: 217, g: 70, b: 239 },// #d946ef
    };

    const renderNebula = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.014;

      // 1. Deep Core Gravitational Well Background (Dark void glow)
      const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
      baseGrad.addColorStop(0, 'rgba(255, 237, 213, 0.25)');
      baseGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.35)');
      baseGrad.addColorStop(0.6, 'rgba(217, 70, 239, 0.3)');
      baseGrad.addColorStop(0.85, 'rgba(147, 51, 234, 0.2)');
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();

      // Use 'screen' blending to make gas clouds superimpose luminously
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 2. Render Swirling Nebula Gas Clouds (Purple, Pink, Orange & Gold)
      puffs.forEach((puff, idx) => {
        puff.angle += puff.speed;
        const curDist = puff.dist + Math.sin(time * puff.radialSpeed + puff.oscPhase) * 6;
        const px = cx + Math.cos(puff.angle) * curDist;
        const py = cy + Math.sin(puff.angle) * (curDist * 0.85); // Organic elliptical warp

        const currentRadius = puff.baseRadius + Math.sin(time * 1.5 + idx) * 4;
        const rgb = colorGradients[puff.color];

        const puffGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius);
        puffGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${puff.alpha * 0.9})`);
        puffGrad.addColorStop(0.45, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${puff.alpha * 0.45})`);
        puffGrad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Central Ionized Plasma Core Tendrils (Electric Filament Vortex)
      for (let i = 0; i < 3; i++) {
        const rot = time * (0.8 + i * 0.3) * (i % 2 === 0 ? 1 : -1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        const filamentGrad = ctx.createLinearGradient(-35, -15, 35, 15);
        if (i === 0) {
          filamentGrad.addColorStop(0, 'rgba(249, 115, 22, 0)');
          filamentGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.7)');
          filamentGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        } else if (i === 1) {
          filamentGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
          filamentGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.7)');
          filamentGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else {
          filamentGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
          filamentGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.65)');
          filamentGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        }

        ctx.fillStyle = filamentGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32 + i * 6, 12 + i * 4, (i * Math.PI) / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Embedded Proto-Stars & Stellar Ignition Sparks
      protoStars.forEach((star) => {
        star.twinkle += star.speed;
        const alpha = 0.4 + Math.sin(star.twinkle) * 0.6;
        if (alpha <= 0.05) return;

        // Micro orbit drift around nebula core
        const cos = Math.cos(0.008);
        const sin = Math.sin(0.008);
        const nx = star.x * cos - star.y * sin;
        const ny = star.x * sin + star.y * cos;
        star.x = nx;
        star.y = ny;

        const sx = cx + star.x;
        const sy = cy + star.y;

        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Ultra-Hot White-Gold Starburst Singularity Nucleus
      const nucleusGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      nucleusGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      nucleusGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.9)');
      nucleusGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.6)');
      nucleusGrad.addColorStop(0.85, 'rgba(236, 72, 153, 0.3)');
      nucleusGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = nucleusGrad;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Core Star Flare Cross
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy);
      ctx.lineTo(cx + 16, cy);
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx, cy + 16);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(renderNebula);
    };

    renderNebula();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleQuickPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    setIsExecutingAi(true);
    setAiOutput(null);

    const res = await executeAIAction(prompt, activeProjectId || undefined);
    setAiOutput({ summary: res.actionSummary, agent: res.agentName });
    setIsExecutingAi(false);
  };

  const handleCustomAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsExecutingAi(true);
    setAiOutput(null);

    const res = await executeAIAction(aiPrompt, activeProjectId || undefined);
    setAiOutput({ summary: res.actionSummary, agent: res.agentName });
    setIsExecutingAi(false);
  };

  // Planetary Nodes on the Orbital Map with Distinct Vibrant Energy Colors (Red, Emerald, Cyan, Yellow, Orange, Purple, Pink)
  const orbitalPlanets = [
    {
      id: 'proj_innd',
      name: 'INNtelligence',
      color: '#f59e0b', // Radiant Amber
      glow: 'shadow-[0_0_16px_#f59e0b]',
      style: { top: '15%', left: '26%' },
      tag: 'Defense & Intel',
    },
    {
      id: 'proj_novamed',
      name: 'NovaMed AI',
      color: '#06b6d4', // Cyan
      glow: 'shadow-[0_0_16px_#06b6d4]',
      style: { top: '7%', left: '48%' },
      tag: 'Healthcare',
    },
    {
      id: 'proj_aquagrid',
      name: 'AquaGrid',
      color: '#38bdf8', // Electric Sky Blue
      glow: 'shadow-[0_0_16px_#38bdf8]',
      style: { top: '48%', right: '3%' },
      tag: 'CleanTech',
    },
    {
      id: 'proj_roadsense',
      name: 'RoadSense',
      color: '#10b981', // Vivid Emerald
      glow: 'shadow-[0_0_16px_#10b981]',
      style: { top: '38%', left: '11%' },
      tag: 'Smart City',
    },
    {
      id: 'proj_ledger',
      name: 'LEDGER',
      color: '#f97316', // Blaze Orange
      glow: 'shadow-[0_0_16px_#f97316]',
      style: { top: '33%', right: '13%' },
      tag: 'Fintech',
    },
    {
      id: 'proj_verdant',
      name: 'VERDANT',
      color: '#eab308', // Gold
      glow: 'shadow-[0_0_16px_#eab308]',
      style: { top: '18%', right: '22%' },
      tag: 'AgriTech',
    },
    {
      id: 'proj_axiom',
      name: 'AXIOM',
      color: '#a855f7', // Radiant Purple
      glow: 'shadow-[0_0_16px_#a855f7]',
      style: { top: '56%', right: '23%' },
      tag: 'AI Core',
    },
    {
      id: 'proj_ecopack',
      name: 'ECOPACK JUTE',
      color: '#14b8a6', // Radiant Teal/Emerald
      glow: 'shadow-[0_0_16px_#14b8a6]',
      style: { bottom: '11%', left: '46%' },
      tag: 'Bio-Tech',
    },
  ];

  return (
    <div id="command-center-container" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1560px] mx-auto relative pb-28">
      {/* Top Layout: Welcome & Stats Header + Hero Orbital Section + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left & Center Main Stage (8 cols on lg, 9 cols on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Greeting Header & 5-Metric Pill Container */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white font-sans">
                Welcome back, <span className="font-bold text-[#f59e0b]">Samaksh Dey</span>.
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-sans mt-0.5">
                The Universe of Nebula is alive.
              </p>
              <p className="text-slate-500 text-xs font-sans">
                Let's create something extraordinary today.
              </p>
            </div>

            {/* 5-Metrics Glass Pill Container */}
            <div className="flex items-center rounded-2xl bg-[#080d24]/80 border border-cyan-500/30 backdrop-blur-xl px-4 py-2.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] divide-x divide-white/10 overflow-x-auto scrollbar-none">
              <div className="px-3.5 first:pl-1 text-center shrink-0">
                <div className="text-lg font-bold text-white font-tech leading-tight">{projects.length}</div>
                <div className="text-[10px] text-slate-400 font-sans whitespace-nowrap">Total Projects</div>
              </div>
              <div className="px-3.5 text-center shrink-0">
                <div className="text-lg font-bold text-cyan-400 font-tech leading-tight">
                  {projects.filter((p) => p.status === 'ACTIVE' || !p.status).length}
                </div>
                <div className="text-[10px] text-slate-400 font-sans whitespace-nowrap">Active Projects</div>
              </div>
              <div className="px-3.5 text-center shrink-0">
                <div className="text-lg font-bold text-purple-400 font-tech leading-tight">{agents.length}</div>
                <div className="text-[10px] text-slate-400 font-sans whitespace-nowrap">AI Sentinels</div>
              </div>
              <div className="px-3.5 text-center shrink-0">
                <div className="text-lg font-bold text-amber-400 font-tech leading-tight">{milestones.length}</div>
                <div className="text-[10px] text-slate-400 font-sans whitespace-nowrap">Milestones</div>
              </div>
              <div className="px-3.5 last:pr-1 text-center shrink-0">
                <div className="text-lg font-bold text-emerald-400 font-tech leading-tight">
                  {tasks.filter((t) => t.status === 'DONE').length}/{tasks.length || 0}
                </div>
                <div className="text-[10px] text-slate-400 font-sans whitespace-nowrap">Tasks Done</div>
              </div>
            </div>
          </div>

          {/* Central Interactive Galaxy Orbital Visualizer (Borderless, Seamless Canvas) */}
          <div className="relative w-full h-[470px] sm:h-[510px] rounded-3xl overflow-visible flex items-center justify-center group select-none">
            {/* Subtle central nebula atmospheric glow (seamless, no card background) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,rgba(168,85,247,0.06)_40%,transparent_75%)] pointer-events-none" />

            {/* Elliptical Tilted Orbit Rings with glowing cyan/purple tracks */}
            {/* Outer Orbit */}
            <div
              className="absolute w-[580px] sm:w-[700px] lg:w-[780px] h-[310px] sm:h-[370px] lg:h-[410px] rounded-[50%] border border-cyan-400/25 border-dashed animate-spin pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              style={{ animationDuration: '140s' }}
            />
            {/* Middle Orbit */}
            <div
              className="absolute w-[430px] sm:w-[510px] lg:w-[570px] h-[230px] sm:h-[270px] lg:h-[310px] rounded-[50%] border border-purple-400/30 border-dashed animate-spin pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              style={{ animationDuration: '90s', animationDirection: 'reverse' }}
            />
            {/* Inner Orbit */}
            <div
              className="absolute w-[290px] sm:w-[350px] lg:w-[390px] h-[155px] sm:h-[185px] lg:h-[205px] rounded-[50%] border border-cyan-300/35 border-dashed animate-spin pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              style={{ animationDuration: '50s' }}
            />

            {/* Central Cosmic Nebula Core (Nebula OS) with Purple, Pink & Orange Glow */}
            <div
              className="relative z-10 flex items-center justify-center cursor-pointer group/core"
              onClick={() => warpTo('PORTFOLIO')}
            >
              {/* Outer Radiant Cosmic Nebula Corona Bloom (Purple, Pink & Orange) */}
              <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-purple-600/45 via-pink-500/40 to-orange-500/35 blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute w-40 h-40 rounded-full bg-gradient-to-bl from-orange-400/30 via-fuchsia-500/35 to-purple-700/40 blur-xl pointer-events-none" />
              
              {/* Expanding Cosmic Energy Shockwave Rings (Pink & Orange) */}
              <div className="absolute w-36 h-36 rounded-full border border-pink-400/45 animate-energy-ring pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-orange-400/35 animate-energy-ring pointer-events-none" style={{ animationDelay: '1.2s' }} />
              <div className="absolute w-48 h-48 rounded-full border border-purple-400/30 animate-energy-ring pointer-events-none" style={{ animationDelay: '2.4s' }} />

              {/* Swirling Interstellar Gas Accretion Halo */}
              <div
                className="absolute w-44 h-24 rounded-[50%] border-2 border-dashed border-orange-400/50 animate-spin pointer-events-none shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                style={{ animationDuration: '18s', transform: 'rotate(-20deg)' }}
              />
              <div
                className="absolute w-40 h-20 rounded-[50%] border border-pink-400/60 animate-spin pointer-events-none shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                style={{ animationDuration: '12s', animationDirection: 'reverse', transform: 'rotate(35deg)' }}
              />

              {/* Procedural Dynamic Cosmic Nebula Canvas (Swirling Interstellar Gas & Proto-Stars) */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.7),0_0_25px_rgba(249,115,22,0.5),inset_0_0_20px_rgba(168,85,247,0.6)] border border-pink-400/50 flex items-center justify-center transition-transform duration-300 group-hover/core:scale-115">
                <canvas
                  ref={nebulaCanvasRef}
                  width={150}
                  height={150}
                  className="w-full h-full rounded-full pointer-events-none"
                />

                {/* Subtle centered luminous core ring */}
                <div className="absolute inset-0 rounded-full border border-orange-300/30 pointer-events-none" />
              </div>

              {/* Center Nebula Brand Pill (Purple, Pink & Orange Accent) */}
              <div className="absolute -bottom-7 flex flex-col items-center pointer-events-none transition-transform group-hover/core:translate-y-0.5">
                <div className="px-2.5 py-0.5 rounded-md bg-[#070518]/90 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.45)] backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 shadow-[0_0_8px_#ec4899] animate-pulse" />
                  <span className="text-[9px] font-brand font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-pink-300 to-purple-200 tracking-widest leading-none">
                    NEBULA OS
                  </span>
                </div>
              </div>
            </div>

            {/* Orbiting Planetary Energy Orbs */}
            {orbitalPlanets.map((planet) => (
              <div
                key={planet.id}
                onClick={() => {
                  setActiveProjectId(planet.id);
                  warpTo('PROJECTS', planet.id);
                }}
                style={planet.style}
                className="absolute z-20 cursor-pointer group/planet transition-all duration-300 hover:scale-125 flex flex-col items-center"
              >
                {/* Energy Orb with Multi-Layer Glow & Corona Flares */}
                <div className="relative flex items-center justify-center">
                  {/* Expanding Radiant Energy Ripple Wave */}
                  <div
                    className="absolute w-8 h-8 rounded-full border animate-energy-ring pointer-events-none"
                    style={{ borderColor: planet.color }}
                  />

                  {/* Outer Diffused Energy Bloom Aura */}
                  <div
                    className="absolute w-7 h-7 rounded-full blur-md opacity-75 group-hover/planet:opacity-100 group-hover/planet:scale-150 transition-all pointer-events-none animate-pulse"
                    style={{ backgroundColor: planet.color }}
                  />

                  {/* Rotating Corona Halo Ring */}
                  <div
                    className="absolute w-6 h-6 rounded-full border border-dashed opacity-60 animate-energy-corona pointer-events-none"
                    style={{ borderColor: planet.color }}
                  />

                  {/* Incandescent Plasma Orb */}
                  <div
                    className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center transition-transform group-hover/planet:scale-110 shadow-lg"
                    style={{
                      backgroundColor: planet.color,
                      boxShadow: `0 0 10px ${planet.color}, 0 0 20px ${planet.color}, 0 0 35px ${planet.color}, inset 0 0 4px #ffffff`,
                    }}
                  >
                    {/* Hot White High-Energy Core Point */}
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-pulse" />

                    {/* Micro Light Spark Cross Ray */}
                    <div
                      className="absolute w-6 h-[1px] bg-white/70 opacity-40 group-hover/planet:opacity-80 transition-opacity pointer-events-none"
                      style={{ boxShadow: `0 0 4px ${planet.color}` }}
                    />
                    <div
                      className="absolute h-6 w-[1px] bg-white/70 opacity-40 group-hover/planet:opacity-80 transition-opacity pointer-events-none"
                      style={{ boxShadow: `0 0 4px ${planet.color}` }}
                    />
                  </div>
                </div>

                {/* Glass Name Pill Badge */}
                <div className="mt-2 px-2.5 py-0.5 rounded-md bg-[#050920]/80 border border-white/15 backdrop-blur-md text-[10px] font-tech text-slate-200 group-hover/planet:border-cyan-400 group-hover/planet:text-white group-hover/planet:shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all shadow-md whitespace-nowrap flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: planet.color, boxShadow: `0 0 6px ${planet.color}` }}
                  />
                  <span>{planet.name}</span>
                </div>
              </div>
            ))}

            {/* +40 more constellations indicator orb */}
            <div
              onClick={() => warpTo('PORTFOLIO')}
              style={{ bottom: '24%', right: '12%' }}
              className="absolute z-20 cursor-pointer hover:scale-110 transition-transform flex items-center gap-2 group"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-6 h-6 rounded-full bg-purple-500/40 blur-sm animate-pulse" />
                <div className="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc,inset_0_0_3px_#fff] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#050920]/80 border border-purple-500/40 text-[10px] font-mono text-purple-300 group-hover:text-white group-hover:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] backdrop-blur-md">
                +40 constellations →
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Stage (4 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Card 1: Live Mission Feed */}
          <div className="rounded-2xl frosty-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs font-bold text-white tracking-wide">
                  Live Mission Feed
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Live</span>
              </div>
            </div>

            {/* Feed List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5 scrollbar-none">
              {activityLogs.length === 0 ? (
                <div className="py-6 text-center text-xs font-tech text-slate-500">
                  Telemetry idle. Activity logs will stream in real-time as tasks execute.
                </div>
              ) : (
                activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        log.status === 'CRITICAL'
                          ? 'bg-rose-500/20 border-rose-400/40 text-rose-400'
                          : log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                          : log.actor.isAI
                          ? 'bg-purple-500/20 border-purple-400/40 text-purple-400'
                          : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                      }`}
                    >
                      {log.actor.isAI ? <Bot className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate text-[11px]">
                          {log.actor.name} – {log.action}
                        </span>
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                          {log.timestamp ? log.timestamp.split('T')[1]?.substring(0, 5) || 'now' : 'now'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{log.entityName}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setCurrentView('ACTIVITY')}
              className="w-full text-left text-[11px] font-sans text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-1 group cursor-pointer"
            >
              <span>View Full Activity</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Inspirational Space Horizon Banner */}
          <div className="relative rounded-2xl overflow-hidden frosty-card p-4 flex items-center justify-center min-h-[90px]">
            {/* Glowing curvature atmosphere line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]" />
            <p className="text-center text-xs sm:text-[13px] text-cyan-200/90 italic font-serif tracking-wide leading-relaxed">
              “Dream beyond the stars.<br />Build beyond the limits.”
            </p>
          </div>

          {/* Card 3: Nebula Intelligence AI Assistant Card */}
          <div className="rounded-2xl frosty-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-sans text-xs font-bold text-white tracking-wide">
                  Nebula Intelligence
                </span>
              </div>
              <button
                onClick={() => setCurrentView('AI_COMMAND')}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Open AI Command Terminal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat greeting bubble */}
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed font-sans backdrop-blur-sm">
              I can help you plan, track, analyze and operate your projects.
            </div>

            {/* Quick 2x2 Prompts */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                'Summarize INNtelligence',
                'Show today\'s priorities',
                'Plan MVP for new ideas',
                'Analyze risks',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-[10px] font-sans text-slate-300 hover:text-white transition-colors text-left truncate cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleCustomAiSubmit} className="relative mt-2">
              <Sparkles className="absolute left-3 top-2.5 w-3.5 h-3.5 text-cyan-400" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Nebula anything..."
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-black/30 border border-white/10 focus:border-cyan-400 text-xs font-sans text-white placeholder-slate-500 focus:outline-none shadow-inner backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={isExecutingAi || !aiPrompt.trim()}
                className="absolute right-1.5 top-1.5 w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-[0_0_8px_rgba(37,99,235,0.6)] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* AI execution state */}
            {isExecutingAi && (
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-2 backdrop-blur-sm">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Nebula AI running autonomous analysis...</span>
              </div>
            )}

            {aiOutput && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/40 text-xs space-y-1 backdrop-blur-sm">
                <div className="text-purple-300 font-bold font-tech text-[11px]">{aiOutput.agent}</div>
                <div className="text-slate-200 text-[11px] leading-relaxed">{aiOutput.summary}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Meet & Gmail Dispatcher Section (Command Page Only) */}
      <CommandMeetDispatcher />

      {/* Bottom Row: 3 Widget Cards (Project Health Galaxy + Active Hackathon Projects + Team Velocity) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Project Health Galaxy */}
        <div className="rounded-2xl frosty-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white tracking-wide font-sans">
              Project Health <span className="text-[#f59e0b] italic font-serif">Galaxy</span>
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            {/* Rotating Spiral Galaxy Canvas (High-Density Animated Core) */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md pointer-events-none animate-pulse" />
              <canvas
                ref={galaxyCanvasRef}
                width={160}
                height={160}
                className="w-full h-full rounded-full"
              />
            </div>

            {/* Health Status Legend */}
            <div className="space-y-2.5 flex-1 pl-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="text-slate-300 font-medium">On Track</span>
                </div>
                <span className="font-tech font-bold text-white text-sm">
                  {projects.filter((p) => (p.health || p.healthStatus) === 'ON_TRACK' || (!p.health && !p.healthStatus)).length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                  <span className="text-slate-300 font-medium">At Risk</span>
                </div>
                <span className="font-tech font-bold text-white text-sm">
                  {projects.filter((p) => (p.health || p.healthStatus) === 'AT_RISK').length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
                  <span className="text-slate-300 font-medium">Delayed</span>
                </div>
                <span className="font-tech font-bold text-white text-sm">
                  {projects.filter((p) => (p.health || p.healthStatus) === 'DELAYED').length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => warpTo('PORTFOLIO')}
            className="text-left text-xs font-sans text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-2 border-t border-white/10 group cursor-pointer"
          >
            <span>View Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Active Projects Fleet */}
        <div className="rounded-2xl frosty-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white tracking-wide font-sans">
              Active Project Fleet
            </h2>
            <button
              onClick={() => setCurrentView('PROJECTS')}
              className="text-xs font-sans text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Dynamic Projects list */}
          <div className="space-y-3.5">
            {projects.slice(0, 3).map((prj, idx) => {
              const colors = ['#2dd4bf', '#60a5fa', '#fbbf24', '#ec4899', '#a855f7'];
              const col = colors[idx % colors.length];
              return (
                <div
                  key={prj.id}
                  onClick={() => warpTo('PROJECTS', prj.id)}
                  className="cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col, boxShadow: `0 0 6px ${col}` }} />
                      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors truncate">
                        {prj.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{prj.progress || 0}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans pl-4 truncate">{prj.category || 'General Mission'}</div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-400 shadow-[0_0_6px_rgba(6,182,212,0.4)] transition-all duration-500"
                      style={{ width: `${prj.progress || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Team Velocity */}
        <div className="rounded-2xl frosty-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white tracking-wide font-sans">
              Team Velocity
            </h2>
            {/* 7D / 30D / 90D Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
              {(['7D', '30D', '90D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setVelocityTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[10px] font-tech transition-colors cursor-pointer ${
                    velocityTimeframe === tf
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Smooth Multi-Wave Graph */}
          <div className="h-20 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
              <defs>
                <linearGradient id="wave1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="300" y2="45" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

              {/* Shaded Area */}
              <path
                d="M 0 50 Q 50 20 100 35 T 200 15 T 300 10 L 300 70 L 0 70 Z"
                fill="url(#wave1Grad)"
              />
              {/* Cyan Wave */}
              <path
                d="M 0 50 Q 50 20 100 35 T 200 15 T 300 10"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_6px_#38bdf8]"
              />
              {/* Magenta Wave */}
              <path
                d="M 0 58 Q 60 40 120 48 T 220 28 T 300 22"
                fill="none"
                stroke="#ec4899"
                strokeWidth="1.8"
                className="drop-shadow-[0_0_6px_#ec4899]"
              />
            </svg>
          </div>

          {/* 3 Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center divide-x divide-white/10">
            <div className="first:pl-0">
              <div className="text-base font-bold text-white font-tech">32</div>
              <div className="text-[9px] text-slate-400 font-sans">Tasks Done</div>
              <div className="text-[9px] text-emerald-400 font-tech">↗ +18%</div>
            </div>

            <div className="pl-1">
              <div className="text-base font-bold text-white font-tech">11</div>
              <div className="text-[9px] text-slate-400 font-sans">Milestones</div>
              <div className="text-[9px] text-emerald-400 font-tech">↗ +27%</div>
            </div>

            <div className="pl-1">
              <div className="text-base font-bold text-white font-tech">128</div>
              <div className="text-[9px] text-slate-400 font-sans">Agent Runs</div>
              <div className="text-[9px] text-emerald-400 font-tech">↗ +42%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Center Dock & Operating System Label */}
      <div className="fixed bottom-4 left-0 right-0 z-30 pointer-events-none flex items-center justify-between px-6 md:px-10">
        {/* Left placeholder for spacing */}
        <div className="hidden lg:block w-40" />

        {/* Center Floating Dock */}
        <div className="pointer-events-auto mx-auto flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl frosty-card border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <button
            onClick={() => {
              setActiveDockTab('COMMAND');
              setCurrentView('COMMAND_CENTER');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
              activeDockTab === 'COMMAND'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/60'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Command</span>
          </button>

          <button
            onClick={() => {
              setActiveDockTab('BUILD');
              setCurrentView('PROJECTS');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
              activeDockTab === 'BUILD'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/60'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-300" />
            <span>Build</span>
          </button>

          <button
            onClick={() => {
              setActiveDockTab('AUTOMATE');
              setCurrentView('WORKFLOW');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
              activeDockTab === 'AUTOMATE'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/60'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-slate-300" />
            <span>Automate</span>
          </button>

          <button
            onClick={() => {
              setActiveDockTab('ANALYZE');
              setCurrentView('ACTIVITY');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
              activeDockTab === 'ANALYZE'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/60'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
            <span>Analyze</span>
          </button>

          <button
            onClick={() => {
              setActiveDockTab('INNOVATE');
              warpTo('PORTFOLIO');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
              activeDockTab === 'INNOVATE'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-blue-400/60'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <span>Innovate</span>
          </button>
        </div>

        {/* Right Label */}
        <div className="hidden lg:block text-right pointer-events-auto">
          <span className="text-[10px] font-mono tracking-widest text-slate-500">
            NEBULA // ORGANIZATIONAL OPERATING SYSTEM
          </span>
        </div>
      </div>
    </div>
  );
};
