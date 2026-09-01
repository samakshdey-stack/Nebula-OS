import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Waves,
  Play,
  Pause,
  RotateCcw,
  Bot,
  User,
  Shield,
  Zap,
  Sparkles,
  Search,
  Filter,
  Cpu,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

// BAR GRAPH DATA
const SPRINT_BAR_DATA = [
  { category: 'Architecture', completed: 18, inProgress: 6, blocked: 1 },
  { category: 'AI Sentinels', completed: 24, inProgress: 9, blocked: 2 },
  { category: 'Zero-Knowledge', completed: 14, inProgress: 8, blocked: 3 },
  { category: 'UI / UX Canvas', completed: 21, inProgress: 4, blocked: 0 },
  { category: 'Security & QA', completed: 16, inProgress: 5, blocked: 1 },
  { category: 'DevOps & CI', completed: 19, inProgress: 3, blocked: 0 },
];

// WORM GRAPH STREAM DATA (Epochs 1-10)
const WORM_STREAM_DATA = [
  { epoch: 'E01', aiFleet: 35, threatIndex: 18, humanReview: 42, netThroughput: 55 },
  { epoch: 'E02', aiFleet: 48, threatIndex: 22, humanReview: 38, netThroughput: 62 },
  { epoch: 'E03', aiFleet: 65, threatIndex: 15, humanReview: 50, netThroughput: 74 },
  { epoch: 'E04', aiFleet: 52, threatIndex: 30, humanReview: 60, netThroughput: 68 },
  { epoch: 'E05', aiFleet: 78, threatIndex: 12, humanReview: 45, netThroughput: 85 },
  { epoch: 'E06', aiFleet: 88, threatIndex: 25, humanReview: 55, netThroughput: 94 },
  { epoch: 'E07', aiFleet: 70, threatIndex: 19, humanReview: 65, netThroughput: 88 },
  { epoch: 'E08', aiFleet: 95, threatIndex: 14, humanReview: 58, netThroughput: 98 },
  { epoch: 'E09', aiFleet: 82, threatIndex: 28, humanReview: 72, netThroughput: 91 },
  { epoch: 'E10', aiFleet: 104, threatIndex: 16, humanReview: 68, netThroughput: 110 },
];

export const ActivityView: React.FC = () => {
  const { activityLogs, projects, tasks, members, agents } = useNebula();

  // Graph state
  const [activeBarMetric, setActiveBarMetric] = useState<'TASKS' | 'VELOCITY'>('TASKS');
  const [donutMode, setDonutMode] = useState<'STATUS' | 'WORKFORCE'>('STATUS');
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredWormEpoch, setHoveredWormEpoch] = useState<number | null>(null);

  // Live Continuous Graph State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedParameter, setSelectedParameter] = useState<
    'NEURAL_THROUGHPUT' | 'LATENCY' | 'THREAT_INDEX' | 'MEMORY_FLUX'
  >('NEURAL_THROUGHPUT');
  const [timeWindow, setTimeWindow] = useState<'1m' | '5m' | '15m'>('5m');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number } | null>(null);

  // Initial continuous buffer
  const [continuousData, setContinuousData] = useState<number[]>(() => {
    const initial: number[] = [];
    let base = 65;
    for (let i = 0; i < 30; i++) {
      base = Math.max(20, Math.min(95, base + (Math.random() * 16 - 8)));
      initial.push(Math.round(base));
    }
    return initial;
  });

  // Logs filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Continuous real-time stream ticker
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setContinuousData((prev) => {
        const last = prev[prev.length - 1] || 60;
        let delta = (Math.random() - 0.48) * 14;
        let nextVal = Math.max(15, Math.min(98, Math.round(last + delta)));
        const sliced = prev.slice(1);
        return [...sliced, nextVal];
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Donut Graph Slices Calculation
  const donutSlices = useMemo(() => {
    if (donutMode === 'STATUS') {
      const backlog = tasks.filter((t) => t.status === 'BACKLOG').length || 2;
      const todo = tasks.filter((t) => t.status === 'TODO').length || 4;
      const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length || 5;
      const blocked = tasks.filter((t) => t.status === 'BLOCKED').length || 2;
      const done = tasks.filter((t) => t.status === 'DONE').length || 8;
      const total = backlog + todo + inProgress + blocked + done;

      return [
        { label: 'Completed', value: done, color: '#10b981', percent: Math.round((done / total) * 100) },
        { label: 'In Progress', value: inProgress, color: '#a855f7', percent: Math.round((inProgress / total) * 100) },
        { label: 'Ready / To Do', value: todo, color: '#38bdf8', percent: Math.round((todo / total) * 100) },
        { label: 'Blocked / Threat', value: blocked, color: '#f43f5e', percent: Math.round((blocked / total) * 100) },
        { label: 'Backlog', value: backlog, color: '#94a3b8', percent: Math.round((backlog / total) * 100) },
      ];
    } else {
      const humanTasks = tasks.filter((t) => t.assigneeId).length || 8;
      const agentTasks = tasks.filter((t) => t.assignedAgentId).length || 11;
      const automated = 4;
      const total = humanTasks + agentTasks + automated;

      return [
        { label: 'AI Sentinels', value: agentTasks, color: '#c084fc', percent: Math.round((agentTasks / total) * 100) },
        { label: 'Human Engineers', value: humanTasks, color: '#22d3ee', percent: Math.round((humanTasks / total) * 100) },
        { label: 'Automated CI Gates', value: automated, color: '#fbbf24', percent: Math.round((automated / total) * 100) },
      ];
    }
  }, [donutMode, tasks]);

  // Filtered Activity Logs
  const filteredLogs = activityLogs.filter((log) => {
    const actorType = log.actor.isAI ? 'AI_AGENT' : 'HUMAN';
    if (filterType !== 'ALL' && actorType !== filterType) return false;
    if (
      search &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.entityName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // Continuous parameter metadata
  const paramConfig = {
    NEURAL_THROUGHPUT: {
      name: 'Neural Throughput',
      unit: 'req/s',
      multiplier: 32,
      color: '#38bdf8',
      desc: 'Token and task inference volume processed by Gemini fleet',
    },
    LATENCY: {
      name: 'Sentinel Latency',
      unit: 'ms',
      multiplier: 0.8,
      color: '#a855f7',
      desc: 'Round-trip response latency for DAG node execution',
    },
    THREAT_INDEX: {
      name: 'Vulnerability Index',
      unit: '%',
      multiplier: 0.4,
      color: '#f43f5e',
      desc: 'Real-time project dependency and block threat score',
    },
    MEMORY_FLUX: {
      name: 'Context Memory Flux',
      unit: 'MB',
      multiplier: 9.5,
      color: '#10b981',
      desc: 'Active memory context buffer across autonomous agents',
    },
  }[selectedParameter];

  const currentVal = Math.round(
    (continuousData[continuousData.length - 1] || 60) * paramConfig.multiplier
  );
  const avgVal = Math.round(
    (continuousData.reduce((a, b) => a + b, 0) / continuousData.length) * paramConfig.multiplier
  );

  return (
    <div id="analytics-telemetry-view" className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-bold mb-1 font-tech flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span>NEBULA MULTI-GRAPH OBSERVABILITY SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            ANALYTICS &{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              TELEMETRY ENGINE
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-sans text-white/50 mt-1">
            Real-time multi-dimensional parameter observation with Bar, Donut, Worm, and Continuous streaming visualizers.
          </p>
        </div>

        {/* Global Live Ticker Pill */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="p-3 rounded-2xl bg-[#09071c] border border-white/15 backdrop-blur-xl flex items-center gap-4 text-xs font-tech shadow-xl">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-white font-bold">{isStreaming ? 'STREAMING ACTIVE' : 'PAUSED'}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="text-slate-300">
              FPS: <span className="text-cyan-300 font-bold">60.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-GRAPH MATRIX: SECTION 1 (Bar Graph + Donut Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH 1: BAR GRAPH (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl frosty-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
                  Bar Graph // Sprint Throughput by Domain
                </h3>
                <span className="text-[11px] font-sans text-slate-400">
                  Completed vs In-Progress vs Blocked deliverables
                </span>
              </div>
            </div>

            <div className="flex items-center rounded-xl bg-black/20 border border-white/10 p-1 text-xs font-tech backdrop-blur-sm">
              <button
                onClick={() => setActiveBarMetric('TASKS')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeBarMetric === 'TASKS'
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Task Volume
              </button>
              <button
                onClick={() => setActiveBarMetric('VELOCITY')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeBarMetric === 'VELOCITY'
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Story Velocity
              </button>
            </div>
          </div>

          {/* Bar Graph SVG Chart */}
          <div className="h-64 w-full relative pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-white/40 w-full" />
              <div className="border-b border-dashed border-white/40 w-full" />
              <div className="border-b border-dashed border-white/40 w-full" />
              <div className="border-b border-dashed border-white/40 w-full" />
            </div>

            <div className="h-full flex items-end justify-around gap-2 px-2 pb-6 relative z-10">
              {SPRINT_BAR_DATA.map((item, idx) => {
                const total = item.completed + item.inProgress + item.blocked;
                const compHeight = (item.completed / 30) * 100;
                const progHeight = (item.inProgress / 30) * 100;
                const blockHeight = (item.blocked / 30) * 100;

                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={item.category}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-3 px-3 py-1.5 rounded-xl bg-black/90 border border-purple-400 text-[11px] font-tech text-white shadow-2xl z-30 pointer-events-none animate-in fade-in backdrop-blur-md">
                        <span className="font-bold text-cyan-300">{item.category}</span>
                        <div className="flex gap-2 text-[10px] text-slate-300 mt-0.5">
                          <span className="text-emerald-400">Done: {item.completed}</span>
                          <span className="text-purple-400">Active: {item.inProgress}</span>
                          <span className="text-rose-400">Risk: {item.blocked}</span>
                        </div>
                      </div>
                    )}

                    {/* Stacked Bars */}
                    <div className="w-full max-w-[38px] flex flex-col justify-end gap-1 h-full items-center">
                      {/* Blocked Top */}
                      {item.blocked > 0 && (
                        <div
                          style={{ height: `${blockHeight}%` }}
                          className="w-full rounded-t-sm bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] transition-all duration-300"
                        />
                      )}
                      {/* In Progress Middle */}
                      <div
                        style={{ height: `${progHeight}%` }}
                        className="w-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:brightness-125"
                      />
                      {/* Completed Base */}
                      <div
                        style={{ height: `${compHeight}%` }}
                        className="w-full rounded-b-md bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300 group-hover:brightness-125"
                      />
                    </div>

                    {/* X-Axis Category Label */}
                    <span className="text-[10px] font-tech text-slate-400 truncate w-full text-center mt-2 group-hover:text-white transition-colors">
                      {item.category.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bar Legend */}
          <div className="flex items-center justify-between text-xs font-tech pt-2 border-t border-white/10 text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shadow-[0_0_6px_#a855f7]" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span>Blocked / Risk</span>
              </div>
            </div>
            <span className="text-[11px] text-cyan-300">Sum Total: 102 Units</span>
          </div>
        </div>

        {/* GRAPH 2: DONUT GRAPH (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl frosty-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
                  Donut Graph // Allocation
                </h3>
                <span className="text-[11px] font-sans text-slate-400">
                  {donutMode === 'STATUS' ? 'Lifecycle Task Distribution' : 'Workforce Fleet Ratio'}
                </span>
              </div>
            </div>

            <div className="flex items-center rounded-xl bg-black/20 border border-white/10 p-1 text-xs font-tech backdrop-blur-sm">
              <button
                onClick={() => setDonutMode('STATUS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  donutMode === 'STATUS'
                    ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setDonutMode('WORKFORCE')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  donutMode === 'WORKFORCE'
                    ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fleet
              </button>
            </div>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="relative flex items-center justify-center h-52">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
              {(() => {
                let accumulatedPercent = 0;
                return donutSlices.map((slice, i) => {
                  const strokeDasharray = `${slice.percent * 5.02} 502`;
                  const strokeDashoffset = -accumulatedPercent * 5.02;
                  accumulatedPercent += slice.percent;
                  const isHovered = hoveredDonutIndex === i;

                  return (
                    <circle
                      key={slice.label}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? '24' : '18'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      onMouseEnter={() => setHoveredDonutIndex(i)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                      className="cursor-pointer transition-all duration-300 hover:opacity-100 opacity-90"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 10px ${slice.color})` : undefined,
                      }}
                    />
                  );
                });
              })()}
            </svg>

            {/* Donut Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">
                {hoveredDonutIndex !== null ? donutSlices[hoveredDonutIndex]?.label : 'Total Tasks'}
              </span>
              <span className="text-2xl font-black font-tech text-white">
                {hoveredDonutIndex !== null
                  ? `${donutSlices[hoveredDonutIndex]?.percent}%`
                  : tasks.length || '21'}
              </span>
              <span className="text-[9px] font-tech text-cyan-300">
                {hoveredDonutIndex !== null
                  ? `${donutSlices[hoveredDonutIndex]?.value} Items`
                  : 'Active Pipeline'}
              </span>
            </div>
          </div>

          {/* Donut Slices Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-tech pt-2 border-t border-white/10">
            {donutSlices.map((slice, i) => (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredDonutIndex(i)}
                onMouseLeave={() => setHoveredDonutIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                  hoveredDonutIndex === i ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: slice.color, boxShadow: `0 0 6px ${slice.color}` }}
                  />
                  <span className="text-slate-300 truncate max-w-[90px]">{slice.label}</span>
                </div>
                <span className="font-bold text-white">{slice.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-GRAPH MATRIX: SECTION 2 (Worm Graph + Continuous Streaming Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH 3: WORM GRAPH (ORGANIC RIBBON STREAMGRAPH) (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl frosty-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/40 text-pink-300">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
                  Worm Graph // Multi-Stream Telemetry Waves
                </h3>
                <span className="text-[11px] font-sans text-slate-400">
                  Organic undulating activity ribbons across historical Epochs
                </span>
              </div>
            </div>
            <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
              EPOCHS 1-10
            </span>
          </div>

          {/* Worm SVG Streamgraph Canvas */}
          <div className="h-60 w-full relative">
            <svg
              viewBox="0 0 500 200"
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredWormEpoch(null)}
            >
              <defs>
                <linearGradient id="worm-ai-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#e879f9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="worm-net-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="worm-human-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                </linearGradient>
                <filter id="worm-point-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="40" x2="480" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Stream 1: Network Throughput Ribbon */}
              <path
                d="M 25 160 C 75 140, 125 155, 175 130 C 225 110, 275 125, 325 95 C 375 80, 425 95, 475 65 L 475 190 L 25 190 Z"
                fill="url(#worm-net-grad)"
                className="opacity-50 hover:opacity-75 transition-opacity"
              />

              {/* Stream 2: Human Sign-off Worm */}
              <path
                d="M 25 140 C 75 115, 125 135, 175 105 C 225 80, 275 105, 325 75 C 375 55, 425 70, 475 50 L 475 130 C 425 140, 375 120, 325 150 C 275 160, 225 140, 175 165 C 125 175, 75 160, 25 175 Z"
                fill="url(#worm-human-grad)"
                className="opacity-65 hover:opacity-85 transition-opacity"
              />

              {/* Stream 3: AI Sentinel Core Primary Worm */}
              <path
                d="M 25 100 C 75 75, 125 95, 175 60 C 225 35, 275 70, 325 35 C 375 20, 425 40, 475 22 L 475 68 C 425 82, 375 60, 325 90 C 275 115, 225 80, 175 105 C 125 125, 75 100, 25 120 Z"
                fill="url(#worm-ai-grad)"
                stroke="#f472b6"
                strokeWidth="2"
                className="opacity-85 hover:opacity-100 transition-all filter drop-shadow-[0_0_12px_rgba(232,121,249,0.5)]"
              />

              {/* Interactive Vertical Hover Guides & Slices */}
              {WORM_STREAM_DATA.map((d, i) => {
                const cx = 25 + i * 50;
                // Calculate y based on AI Fleet value
                const cy = 135 - (d.aiFleet / 110) * 110;
                const isHovered = hoveredWormEpoch === i;

                return (
                  <g key={d.epoch}>
                    {/* Invisible Wide Hit Area for seamless hovering */}
                    <rect
                      x={cx - 25}
                      y={10}
                      width={50}
                      height={180}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWormEpoch(i)}
                    />

                    {/* Vertical Highlight Line when Hovered */}
                    {isHovered && (
                      <line
                        x1={cx}
                        y1={20}
                        x2={cx}
                        y2={185}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer Glow Halo for Hovered Point */}
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity={0.6}
                      />
                    )}

                    {/* Checkpoint Node Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#38bdf8' : '#ffffff'}
                      stroke={isHovered ? '#ffffff' : '#a855f7'}
                      strokeWidth={isHovered ? 2.5 : 2}
                      filter={isHovered ? 'url(#worm-point-glow)' : undefined}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredWormEpoch(i)}
                    />

                    {/* Epoch Label along baseline */}
                    <text
                      x={cx}
                      y={195}
                      textAnchor="middle"
                      className={`text-[9px] font-tech font-bold transition-colors cursor-pointer select-none ${
                        isHovered ? 'fill-cyan-300 font-extrabold' : 'fill-slate-500 hover:fill-slate-300'
                      }`}
                      onMouseEnter={() => setHoveredWormEpoch(i)}
                    >
                      {d.epoch}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Telemetry Tooltip on Hover */}
            {hoveredWormEpoch !== null && (
              <div
                className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-[#09071c]/95 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md text-xs font-tech space-y-1 transform -translate-x-1/2 transition-all duration-100"
                style={{
                  left: `${(hoveredWormEpoch / 9) * 90 + 5}%`,
                  top: '12px',
                }}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1">
                  <span className="text-cyan-300 font-bold">
                    EPOCH {WORM_STREAM_DATA[hoveredWormEpoch].epoch}
                  </span>
                  <span className="text-[10px] text-slate-400">TELEMETRY</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                  <div className="text-pink-300">
                    AI Fleet: <span className="text-white font-bold">{WORM_STREAM_DATA[hoveredWormEpoch].aiFleet}</span>
                  </div>
                  <div className="text-cyan-300">
                    Net: <span className="text-white font-bold">{WORM_STREAM_DATA[hoveredWormEpoch].netThroughput} req/s</span>
                  </div>
                  <div className="text-emerald-300">
                    Reviews: <span className="text-white font-bold">{WORM_STREAM_DATA[hoveredWormEpoch].humanReview}</span>
                  </div>
                  <div className="text-rose-300">
                    Threat: <span className="text-white font-bold">{WORM_STREAM_DATA[hoveredWormEpoch].threatIndex}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Worm Stream Legend */}
          <div className="flex items-center justify-between text-xs font-tech pt-2 border-t border-white/10 text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]" />
                <span className="text-pink-300">AI Sentinel Fleet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <span className="text-cyan-300">Net Throughput</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-emerald-300">Human Reviews</span>
              </div>
            </div>
            <span className="text-[11px] text-pink-300">Harmonic Wave Stream</span>
          </div>
        </div>

        {/* GRAPH 4: CONTINUOUS GRAPH (REAL-TIME SPLINE OSCILLOSCOPE) (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl frosty-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
                    Continuous Graph // Real-Time Signal
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[11px] font-sans text-slate-400">
                  {paramConfig.desc}
                </span>
              </div>
            </div>

            {/* Play/Pause & Parameter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value as any)}
                className="px-2.5 py-1 rounded-xl bg-black/20 border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-cyan-400 backdrop-blur-sm"
              >
                <option value="NEURAL_THROUGHPUT" className="bg-[#09071c]">Neural Throughput (req/s)</option>
                <option value="LATENCY" className="bg-[#09071c]">Sentinel Latency (ms)</option>
                <option value="THREAT_INDEX" className="bg-[#09071c]">Vulnerability Index (%)</option>
                <option value="MEMORY_FLUX" className="bg-[#09071c]">Context Memory (MB)</option>
              </select>

              <button
                onClick={() => setIsStreaming(!isStreaming)}
                title={isStreaming ? 'Pause Stream' : 'Resume Stream'}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
              >
                {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Current Parameter Metrics Ticker */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-tech backdrop-blur-sm">
            <div>
              <span className="text-slate-400 block text-[10px]">CURRENT VALUE</span>
              <span className="text-lg font-bold" style={{ color: paramConfig.color }}>
                {currentVal} <span className="text-xs">{paramConfig.unit}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ROLLING AVG</span>
              <span className="text-lg font-bold text-white">
                {avgVal} <span className="text-xs">{paramConfig.unit}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SAMPLING RATE</span>
              <span className="text-lg font-bold text-cyan-300">
                1.25 <span className="text-xs">Hz</span>
              </span>
            </div>
          </div>

          {/* Real-time Continuous SVG Area Graph */}
          <div className="h-44 w-full relative">
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="continuous-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={paramConfig.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={paramConfig.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

              {/* Smooth Continuous Spline Path */}
              {(() => {
                const step = 500 / (continuousData.length - 1);
                let pathPoints = continuousData.map((val, i) => {
                  const x = i * step;
                  const y = 160 - (val / 100) * 140;
                  return { x, y };
                });

                // Generate smooth SVG Catmull-Rom or Cubic Bezier path
                let pathString = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
                for (let i = 0; i < pathPoints.length - 1; i++) {
                  const p0 = pathPoints[i];
                  const p1 = pathPoints[i + 1];
                  const mx = (p0.x + p1.x) / 2;
                  pathString += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                }

                const areaString = `${pathString} L 500 160 L 0 160 Z`;

                return (
                  <g>
                    {/* Area Fill */}
                    <path d={areaString} fill="url(#continuous-area-grad)" />
                    {/* Line Stroke */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={paramConfig.color}
                      strokeWidth="2.5"
                      style={{ filter: `drop-shadow(0 0 8px ${paramConfig.color})` }}
                    />
                    {/* Pulsing Head Point */}
                    <circle
                      cx={pathPoints[pathPoints.length - 1].x}
                      cy={pathPoints[pathPoints.length - 1].y}
                      r="4"
                      fill="#ffffff"
                      stroke={paramConfig.color}
                      strokeWidth="2"
                      className="animate-ping"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Graph Footer */}
          <div className="flex items-center justify-between text-xs font-tech pt-2 border-t border-white/10 text-slate-400">
            <span className="text-emerald-300">● Live Spline Interpolation</span>
            <span>Window: Last 30 Continuous Samples</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME AUDIT LOG FEED */}
      <div className="rounded-2xl frosty-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-widest">
              TELEMETRY AUDIT TRAIL
            </span>
            <h2 className="text-lg font-bold font-tech text-white">Live Event & Execution Logs</h2>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-tech text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-purple-400"
            >
              <option value="ALL" className="bg-[#0a071d] text-white">All Actors</option>
              <option value="AI_AGENT" className="bg-[#0a071d] text-purple-300">AI Sentinels</option>
              <option value="USER" className="bg-[#0a071d] text-cyan-300">Human Engineers</option>
              <option value="SYSTEM" className="bg-[#0a071d] text-emerald-300">System Telemetry</option>
            </select>
          </div>
        </div>

        {/* List of Logs */}
        <div className="divide-y divide-white/10 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {filteredLogs.map((log) => {
            const isAgent = log.actor.isAI;
            const actorType = isAgent ? 'AI_AGENT' : 'HUMAN';
            return (
              <div key={log.id} className="py-3.5 first:pt-0 space-y-1.5 text-xs font-tech hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isAgent ? (
                      <div className="p-1 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="font-bold text-white">{log.actor.name}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/10 text-white/60">
                      {actorType}
                    </span>
                  </div>
                  <span className="text-white/40 font-mono text-[11px]">{log.timestamp}</span>
                </div>

                <div className="text-slate-200 text-xs font-sans pl-7">{log.action}</div>

                <div className="pl-7 flex items-center gap-3 text-[10px] text-white/40">
                  <span>TARGET: <span className="text-purple-300">{log.entityName}</span></span>
                  {log.projectId && (
                    <>
                      <span>•</span>
                      <span>PROJECT: {projects.find((p) => p.id === log.projectId)?.name || log.projectId}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
