import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GitFork,
  Bot,
  User,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Cpu,
  ArrowRight,
  Settings2,
  Workflow,
  Wrench,
  Check,
  X,
  Maximize2,
  Search,
  Code,
  Radio,
  Sliders,
  ZoomIn,
  ZoomOut,
  Move,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { AgentId } from '../types';

export type NodeType = 'AGENT' | 'HUMAN' | 'TRIGGER' | 'TOOL' | 'ROUTER';

export interface CanvasNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  role?: string;
  model?: string;
  tools?: string[];
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'WAITING_APPROVAL' | 'ALERT';
  agentId?: AgentId;
  humanName?: string;
  x: number;
  y: number;
  outputPayload?: string;
  config: {
    description?: string;
    temperature?: number;
    memory?: boolean;
    systemPrompt?: string;
    triggerCondition?: string;
  };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

const INITIAL_NODES: CanvasNode[] = [
  {
    id: 'node-trigger',
    type: 'TRIGGER',
    title: 'Event Trigger // Telemetry Stream',
    subtitle: 'High-Frequency Telemetry Ingestion',
    status: 'IDLE',
    x: 40,
    y: 180,
    config: {
      description: 'Listens for GitHub PRs, milestone threshold events, and telemetry anomaly signals.',
      triggerCondition: 'ON_ANOMALY_OR_PR',
    },
  },
  {
    id: 'node-pm-agent',
    type: 'AGENT',
    title: 'PM Agent // Orchestrator',
    subtitle: 'CrewAI Lead Planner',
    role: 'Autonomous Project Orchestration',
    model: 'Gemini 3.5 Flash',
    agentId: 'pm_agent',
    tools: ['Task Parser', 'Milestone Gater', 'Context Store'],
    status: 'IDLE',
    x: 340,
    y: 90,
    config: {
      description: 'Deconstructs project scope into sub-tasks and delegates to specialized sentinels.',
      temperature: 0.2,
      memory: true,
      systemPrompt: 'You are the Autonomous Project Orchestrator. Coordinate fleet sentinels with deterministic DAG execution.',
    },
  },
  {
    id: 'node-risk-agent',
    type: 'AGENT',
    title: 'Risk Sentinel // Threat Scanner',
    subtitle: 'CrewAI Risk Specialist',
    role: 'Predictive Threat Analysis',
    model: 'Gemini 3.5 Flash',
    agentId: 'risk_agent',
    tools: ['Dependency DAG Tracer', 'Burn Rate Model', 'SLO Tracker'],
    status: 'IDLE',
    x: 340,
    y: 320,
    config: {
      description: 'Simulates cascading block risks, overdue milestones, and critical architectural bottlenecks.',
      temperature: 0.1,
      memory: true,
      systemPrompt: 'You are the Risk Sentinel. Evaluate all project paths and flag probability of delay.',
    },
  },
  {
    id: 'node-router',
    type: 'ROUTER',
    title: 'Conditional Gatekeeper',
    subtitle: 'Risk Threshold Gate (Score > 65)',
    status: 'IDLE',
    x: 680,
    y: 200,
    config: {
      description: 'Branches workflow to Human Security Officer if threat severity exceeds safety thresholds.',
    },
  },
  {
    id: 'node-human-architect',
    type: 'HUMAN',
    title: 'Team Lead // Samaksh Dey',
    subtitle: 'Human-in-the-Loop Sign-off',
    humanName: 'Samaksh Dey (Team Lead)',
    status: 'IDLE',
    x: 980,
    y: 90,
    config: {
      description: 'Human authorization gate for mission-critical deployments, architectural pivots, and budget shifts.',
    },
  },
  {
    id: 'node-qa-agent',
    type: 'AGENT',
    title: 'QA Sentinel // Autonomous Verifier',
    subtitle: 'CrewAI Validation Unit',
    role: 'E2E Testing & Proof Verification',
    model: 'Gemini 3.5 Flash',
    agentId: 'qa_agent',
    tools: ['ZKP Verifier', 'Chaos Simulator', 'API Sandbox'],
    status: 'IDLE',
    x: 980,
    y: 320,
    config: {
      description: 'Runs automated integration suites, sanity tests, and deployment verification proofs.',
      temperature: 0.1,
      memory: false,
    },
  },
  {
    id: 'node-tool-deploy',
    type: 'TOOL',
    title: 'Action // Canary Rollout & PRD Sync',
    subtitle: 'Orbital Container Deployment',
    tools: ['Docker Ingress', 'Doc Agent Sync', 'Discord Webhook'],
    status: 'IDLE',
    x: 1300,
    y: 200,
    config: {
      description: 'Executes canary deployment, updates persistent PRD in Knowledge Base, and alerts the hackathon squad.',
    },
  },
];

const INITIAL_EDGES: CanvasEdge[] = [
  { id: 'e1', source: 'node-trigger', target: 'node-pm-agent', label: 'Telemetry Stream' },
  { id: 'e2', source: 'node-trigger', target: 'node-risk-agent', label: 'Anomaly Payload' },
  { id: 'e3', source: 'node-pm-agent', target: 'node-router', label: 'DAG Plan' },
  { id: 'e4', source: 'node-risk-agent', target: 'node-router', label: 'Threat Metrics' },
  { id: 'e5', source: 'node-router', target: 'node-human-architect', label: 'High Risk Escalation' },
  { id: 'e6', source: 'node-router', target: 'node-qa-agent', label: 'Standard Validation' },
  { id: 'e7', source: 'node-human-architect', target: 'node-tool-deploy', label: 'Human Approved' },
  { id: 'e8', source: 'node-qa-agent', target: 'node-tool-deploy', label: 'Tests Passed' },
];

export const WorkflowCanvas: React.FC = () => {
  const { activeProject, agents, members } = useNebula();

  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<CanvasEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-pm-agent');
  const [isRunning, setIsRunning] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'agent' | 'human' | 'success' | 'alert' }>>([
    { time: '12:00:01', text: 'Autonomous Orchestration Engine initialized with Gemini 3.5 Flash models.', type: 'info' },
    { time: '12:00:04', text: 'Human-in-the-Loop gates registered for Lead Architect & Security.', type: 'human' },
  ]);

  // Screen Dragging / Panning and Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [zoom, setZoom] = useState<number>(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Fit View function: centers and scales all nodes so the whole workflow is visible
  const fitView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate bounding box of all nodes
    const nodeWidth = 230;
    const nodeHeight = 160;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + nodeWidth);
      maxY = Math.max(maxY, n.y + nodeHeight);
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const padding = 60;

    const availableWidth = rect.width - padding * 2;
    const availableHeight = rect.height - padding * 2;

    const scaleX = availableWidth / graphWidth;
    const scaleY = availableHeight / graphHeight;
    const newZoom = Math.min(1.1, Math.max(0.4, Math.min(scaleX, scaleY)));

    const newPanX = (rect.width - graphWidth * newZoom) / 2 - minX * newZoom;
    const newPanY = (rect.height - graphHeight * newZoom) / 2 - minY * newZoom;

    setZoom(Number(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [nodes]);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.35, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 40, y: 40 });
  };

  // Workflow Runner Engine
  const startWorkflowRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionStep(1);

    // Reset nodes status
    setNodes((prev) => prev.map((n) => ({ ...n, status: 'IDLE' })));

    setConsoleLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), text: '▶ WORKFLOW EXECUTION STARTED: Event Trigger received webhook payload.', type: 'info' },
    ]);

    // Step 1: Trigger fires
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === 'node-trigger' ? { ...n, status: 'SUCCESS' } : n))
      );
      setExecutionStep(2);

      // Step 2: PM Agent & Risk Sentinel execute in parallel
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'node-pm-agent' || n.id === 'node-risk-agent' ? { ...n, status: 'RUNNING' } : n
        )
      );
      setConsoleLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: '🤖 PM Agent [Gemini 3.5 Flash]: Parsing project tasks into DAG topology...', type: 'agent' },
        { time: new Date().toLocaleTimeString(), text: '🛡️ Risk Sentinel: Running Monte Carlo dependency failure simulation...', type: 'agent' },
      ]);
    }, 1200);

    // Step 3: PM & Risk Sentinel complete -> Router evaluates
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === 'node-pm-agent' || n.id === 'node-risk-agent') return { ...n, status: 'SUCCESS' };
          if (n.id === 'node-router') return { ...n, status: 'RUNNING' };
          return n;
        })
      );
      setExecutionStep(3);
      setConsoleLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: '🔀 Router: Threat score evaluated at 42 (SAFE). Routing to QA Sentinel & Architect gate.', type: 'info' },
      ]);
    }, 2800);

    // Step 4: Router complete -> Human approval & QA Agent
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === 'node-router') return { ...n, status: 'SUCCESS' };
          if (n.id === 'node-human-architect') return { ...n, status: 'WAITING_APPROVAL' };
          if (n.id === 'node-qa-agent') return { ...n, status: 'RUNNING' };
          return n;
        })
      );
      setExecutionStep(4);
      setConsoleLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: '⚡ QA Sentinel: 14/14 automated integration tests PASSED (0 regressions).', type: 'agent' },
        { time: new Date().toLocaleTimeString(), text: '👤 Human Sign-off: Auto-Approved by Team Lead (Samaksh Dey) via Gated Protocol.', type: 'human' },
      ]);
    }, 4400);

    // Step 5: Final Tool Action (Deployment)
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === 'node-human-architect' || n.id === 'node-qa-agent') return { ...n, status: 'SUCCESS' };
          if (n.id === 'node-tool-deploy') return { ...n, status: 'RUNNING' };
          return n;
        })
      );
      setExecutionStep(5);
      setConsoleLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: '🚀 Tool Action: Canary container deployed to Cluster 07G. PRD updated in Knowledge Base.', type: 'success' },
      ]);
    }, 6000);

    // Completed
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === 'node-tool-deploy' ? { ...n, status: 'SUCCESS' } : n))
      );
      setIsRunning(false);
      setExecutionStep(6);
      setConsoleLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: '✅ WORKFLOW RUN COMPLETE. Total tokens: 1,842. Duration: 6.4s.', type: 'success' },
      ]);
    }, 7200);
  };

  // Node Drag Handler
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setNodeDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  };

  // Canvas Screen Panning Handlers (Mouse)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start screen pan if clicking the canvas background
    if (e.button !== 0) return; // Left click
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    // 1. If dragging the canvas screen / background
    if (isPanning && !draggingNodeId) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // 2. If dragging an individual node
    if (draggingNodeId) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const newX = Math.round(mouseX - nodeDragOffset.x);
      const newY = Math.round(mouseY - nodeDragOffset.y);

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Touch Screen Panning Handlers (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1 && !draggingNodeId) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Wheel Zoom & Trackpad Pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(2.0, Math.max(0.35, Number((prev * zoomFactor).toFixed(2)))));
    } else {
      // Pan with trackpad or mouse wheel
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  return (
    <div id="workflow-canvas-container" className="space-y-4">
      {/* Top Action & Legend Bar */}
      <div className="p-4 rounded-2xl frosty-card flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-xl">
        {/* Left: Workflow Mode & Execution Control */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
            <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
              Workflow Canvas
            </h3>
          </div>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

          {/* Node Category Badges */}
          <div className="hidden xl:flex items-center gap-2 text-[10px] font-tech text-slate-300">
            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/40 text-purple-300">
              🤖 Agents
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-300">
              👤 Human Approval Gates
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300">
              ⚡ Triggers & Routers
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
              🛠️ Tools & Actions
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setNodes((prev) => prev.map((n) => ({ ...n, status: 'IDLE' })));
              setIsRunning(false);
              setExecutionStep(0);
            }}
            title="Reset Workflow Status"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={startWorkflowRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-tech text-xs font-bold transition-all shadow-lg ${
              isRunning
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40 cursor-wait'
                : 'bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer'
            }`}
          >
            {isRunning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-purple-300" />
                <span>ORCHESTRATING RUN...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950 fill-current" />
                <span>RUN WORKFLOW</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Area + Right Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* The Graph Canvas Stage (8/12 or 9/12) */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`lg:col-span-8 xl:col-span-9 relative w-full h-[620px] rounded-2xl bg-[#050314]/80 frosty-card overflow-hidden select-none border border-white/15 shadow-2xl ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* n8n Style Dotted Coordinate Grid Background (moves with pan) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)',
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          {/* Floating Pan/Zoom Control Bar (Top Right of Canvas) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#09071c]/90 border border-white/20 shadow-2xl backdrop-blur-xl">
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-white/20 mx-0.5" />
            <button
              onClick={fitView}
              title="Fit to View / Show Full Workflow"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-tech font-bold border border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>FIT ALL</span>
            </button>
            <button
              onClick={handleResetView}
              title="Reset Zoom to 100%"
              className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-tech transition-colors cursor-pointer"
            >
              100%
            </button>
          </div>

          {/* Floating Dragging/Canvas Navigation Helper Pill (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 text-[10px] font-tech text-white/70 bg-[#09071c]/90 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xl shadow-lg">
            <Move className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Drag anywhere to pan canvas • Scroll to zoom • Drag nodes to reposition</span>
            <span className="text-slate-500">|</span>
            <span className="text-purple-300 font-mono">Zoom: {Math.round(zoom * 100)}%</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300 font-mono">X:{pan.x} Y:{pan.y}</span>
          </div>

          {/* Unified Transform Container: Transforms both SVG connector lines and Nodes simultaneously */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '3200px',
              height: '2400px',
            }}
          >
            {/* SVG Connector Wires */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="wf-active-wire" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {edges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const srcX = src.x + 224; // right output handle
                const srcY = src.y + 45;
                const tgtX = tgt.x; // left input handle
                const tgtY = tgt.y + 45;

                const midX = (srcX + tgtX) / 2;
                const pathD = `M ${srcX} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${tgtX} ${tgtY}`;

                const isEdgeActive = isRunning && (src.status === 'RUNNING' || src.status === 'SUCCESS');

                return (
                  <g key={edge.id}>
                    {/* Background Track */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="2.5"
                    />
                    {/* Active / Glowing Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isEdgeActive ? 'url(#wf-active-wire)' : 'rgba(168, 85, 247, 0.4)'}
                      strokeWidth={isEdgeActive ? '3' : '2'}
                      strokeDasharray={isEdgeActive ? '6 4' : undefined}
                      className={isEdgeActive ? 'animate-pulse' : ''}
                      filter={isEdgeActive ? 'url(#wire-glow)' : undefined}
                    />
                    {/* Moving Particle Pulse */}
                    {isEdgeActive && (
                      <circle r="4" fill="#38bdf8" className="animate-ping">
                        <animateMotion path={pathD} dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Interactive Draggable Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isAgent = node.type === 'AGENT';
              const isHuman = node.type === 'HUMAN';
              const isTrigger = node.type === 'TRIGGER';
              const isTool = node.type === 'TOOL';
              const isRouter = node.type === 'ROUTER';

              return (
                <div
                  key={node.id}
                  id={`workflow-node-${node.id}`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{ top: node.y, left: node.x }}
                  className={`absolute z-20 w-56 rounded-2xl backdrop-blur-xl border transition-all duration-150 cursor-grab active:cursor-grabbing space-y-2.5 p-3.5 shadow-2xl pointer-events-auto ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 border-cyan-400 bg-[#0f0b24]/90 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                      : node.status === 'RUNNING'
                      ? 'border-purple-400 bg-[#160d38]/90 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse'
                      : node.status === 'SUCCESS'
                      ? 'border-emerald-400/80 bg-[#061e16]/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : node.status === 'WAITING_APPROVAL'
                      ? 'border-amber-400 bg-[#241705]/90 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-[#09071c]/75 border-white/15 hover:border-white/40 hover:bg-[#0f0a28]/90'
                  }`}
                >
                  {/* Left Input Port */}
                  {!isTrigger && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#050314] border-2 border-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}

                  {/* Right Output Port */}
                  {!isTool && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#050314] border-2 border-purple-400 shadow-[0_0_8px_#a855f7]" />
                  )}

                  {/* Node Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg border text-xs ${
                          isAgent
                            ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                            : isHuman
                            ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                            : isTrigger
                            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                            : isRouter
                            ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                            : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {isAgent ? (
                          <Bot className="w-3.5 h-3.5" />
                        ) : isHuman ? (
                          <User className="w-3.5 h-3.5" />
                        ) : isTrigger ? (
                          <Radio className="w-3.5 h-3.5" />
                        ) : isRouter ? (
                          <GitFork className="w-3.5 h-3.5" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] font-tech text-slate-400 uppercase tracking-widest block">
                          {node.type}
                        </span>
                        <h4 className="font-tech text-xs font-bold text-white leading-tight">
                          {node.title.split('//')[0]}
                        </h4>
                      </div>
                    </div>

                    {/* Status Indicator Pill */}
                    <span
                      className={`text-[8px] font-tech font-bold px-1.5 py-0.5 rounded uppercase ${
                        node.status === 'RUNNING'
                          ? 'bg-purple-500 text-slate-950 animate-ping'
                          : node.status === 'SUCCESS'
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : node.status === 'WAITING_APPROVAL'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* Subtitle / Role */}
                  <p className="text-[10px] font-sans text-slate-300/80 leading-relaxed line-clamp-2">
                    {node.subtitle}
                  </p>

                  {/* Model or Tools tags */}
                  {node.model && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-tech">
                      <span className="text-purple-300 font-semibold">✨ {node.model}</span>
                      <span className="text-slate-400">{node.tools?.length || 0} Tools</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Inspector & Settings Drawer (4/12 or 3/12) */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-2xl frosty-card p-5 space-y-4 flex flex-col justify-between border border-white/15 shadow-2xl">
          {selectedNode ? (
            <div className="space-y-4 text-xs font-tech">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-wider">
                    NODE INSPECTOR // {selectedNode.type}
                  </span>
                  <h3 className="font-tech text-sm font-bold text-white mt-0.5">
                    {selectedNode.title}
                  </h3>
                </div>
                <Settings2 className="w-4 h-4 text-slate-400" />
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-400 block mb-1">Functional Description</label>
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 text-slate-200 text-xs font-sans leading-relaxed backdrop-blur-sm">
                  {selectedNode.config.description || selectedNode.subtitle}
                </div>
              </div>

              {/* Model & Agent Specs (if Agent) */}
              {selectedNode.type === 'AGENT' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">LLM Engine</span>
                      <span className="font-bold text-purple-300">{selectedNode.model}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Temperature</span>
                      <span className="font-bold text-cyan-300">{selectedNode.config.temperature || 0.2}</span>
                    </div>
                  </div>

                  {/* System Prompt */}
                  {selectedNode.config.systemPrompt && (
                    <div>
                      <label className="text-slate-400 block mb-1">System Instruction / Backstory</label>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] font-mono text-purple-200 leading-relaxed max-h-24 overflow-y-auto backdrop-blur-sm">
                        {selectedNode.config.systemPrompt}
                      </div>
                    </div>
                  )}

                  {/* Enabled Tools */}
                  {selectedNode.tools && selectedNode.tools.length > 0 && (
                    <div>
                      <label className="text-slate-400 block mb-1">Enabled Tool Arsenal</label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.tools.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300"
                          >
                            🛠️ {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Human Gate Info */}
              {selectedNode.type === 'HUMAN' && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <User className="w-4 h-4" />
                    <span>Human Approval Gatekeeper</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Assigned to <span className="text-cyan-300 font-semibold">{selectedNode.humanName}</span>. Requires cryptographic approval token before downstream tool actuation.
                  </p>
                </div>
              )}

              {/* Output Payload JSON Preview */}
              <div>
                <label className="text-slate-400 block mb-1">Node State Telemetry</label>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 font-mono text-[10px] text-cyan-300 max-h-24 overflow-y-auto backdrop-blur-sm">
                  {JSON.stringify(
                    {
                      nodeId: selectedNode.id,
                      status: selectedNode.status,
                      executionStep,
                      memoryActive: selectedNode.config.memory ?? true,
                    },
                    null,
                    2
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs font-tech">
              Select any node on canvas to inspect
            </div>
          )}

          {/* Quick Node Trigger Test */}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => {
                if (selectedNode) {
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === selectedNode.id ? { ...n, status: n.status === 'RUNNING' ? 'SUCCESS' : 'RUNNING' } : n
                    )
                  );
                }
              }}
              className="w-full py-2 rounded-xl font-tech text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
            >
              Test Trigger Node Single Step
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Streaming Execution Console */}
      <div className="rounded-2xl frosty-card p-4 space-y-2 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-tech font-bold text-white tracking-wider uppercase">
              Autonomous Multi-Agent Telemetry Stream
            </span>
          </div>
          <span className="text-[10px] font-tech text-slate-400">
            Status: {isRunning ? 'ORCHESTRATING (Step ' + executionStep + '/5)' : 'READY'}
          </span>
        </div>

        <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-xs pr-1 scrollbar-thin">
          {consoleLogs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${
                log.type === 'agent'
                  ? 'text-purple-300'
                  : log.type === 'human'
                  ? 'text-cyan-300'
                  : log.type === 'success'
                  ? 'text-emerald-300'
                  : log.type === 'alert'
                  ? 'text-rose-300'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
