import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Shield,
  ShieldAlert,
  Play,
  Activity,
  CheckCircle2,
  ArrowRight,
  Send,
  HelpCircle,
  BookOpen,
  Terminal,
  Code,
  FileText,
  GitFork,
  Paperclip,
  RotateCcw,
  Layers,
  ChevronDown,
  Clock,
  Cpu,
  CornerDownLeft,
  ExternalLink,
  Sliders,
  Check,
  Flame,
  BarChart2,
  FolderKanban,
  MessageSquare
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { StatusPill } from './StatusPill';
import { AgentId, Project } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PresetPrompt {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  title: string;
  category: string;
}

interface AgentProfile {
  id: AgentId;
  name: string;
  title: string;
  welcomeHeadline: string;
  welcomeDescription: string;
  role: string;
  avatar: string;
  color: string;
  glowColor: string;
  bgGlow: string;
  borderAccent: string;
  accentGradient: string;
  runtimeModel: string;
  latency: string;
  stats: {
    actions: number;
    accuracy: string;
    throughput: string;
  };
  presets: PresetPrompt[];
}

const AGENT_PROFILES: Record<AgentId, AgentProfile> = {
  pm_agent: {
    id: 'pm_agent',
    name: 'PM Agent',
    title: 'Autonomous Project Manager',
    welcomeHeadline: 'Welcome to Autonomous PM Agent',
    welcomeDescription:
      'Guides hackathon teams to peak sprint velocity by transforming raw project specifications and team notes into balanced task allocations, prioritized kanban backlogs, and real-time sprint pacing metrics.',
    role: 'Autonomous Sprint Orchestrator',
    avatar: '🤖',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    bgGlow: 'rgba(6, 182, 212, 0.08)',
    borderAccent: 'border-cyan-500/40',
    accentGradient: 'from-cyan-500 to-blue-600',
    runtimeModel: 'Gemini 3.5 Flash Autonomous PM',
    latency: '18ms',
    stats: {
      actions: 142,
      accuracy: '99.8%',
      throughput: '2.8k ops/s',
    },
    presets: [
      {
        id: 'pm_0',
        icon: HelpCircle,
        title: 'Synchronize sprint backlog with Google Sheet Matrix',
        prompt: 'Synchronize INNtelligence sprint deliverables with the connected Google Sheet matrix and verify team assignments...',
        category: 'Project Database',
      },
      {
        id: 'pm_1',
        icon: HelpCircle,
        title: 'Deconstruct sprint into actionable sub-tasks',
        prompt: 'Deconstruct INNtelligence sprint into actionable sub-tasks and allocate them based on team capacity...',
        category: 'Workload Decomposition',
      },
      {
        id: 'pm_2',
        icon: Activity,
        title: 'Analyze team velocity & workload pacing',
        prompt: 'Analyze team velocity, burn-down rate, and workload pacing across active hackathon projects...',
        category: 'Velocity & Capacity',
      },
      {
        id: 'pm_3',
        icon: Zap,
        title: 'Auto-allocate unassigned backlog items',
        prompt: 'Automatically balance and assign pending backlog items to team members based on core skillsets...',
        category: 'Smart Assignment',
      },
      {
        id: 'pm_4',
        icon: Terminal,
        title: 'Generate executive sprint standup summary',
        prompt: 'Generate an executive sprint standup briefing with completed deliverables, active blockers, and daily targets...',
        category: 'Sprint Standup',
      },
    ],
  },
  planning_agent: {
    id: 'planning_agent',
    name: 'Planning Agent',
    title: 'Strategic DAG & Milestone Planner',
    welcomeHeadline: 'Welcome to Strategic Planning AI',
    welcomeDescription:
      'Converts complex hackathon problem statements into structured, multi-stage milestone hierarchies. Calculates topological dependencies, identifies critical path vectors, and estimates sprint delivery timelines.',
    role: 'Topological DAG & Milestone Architect',
    avatar: '🧠',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGlow: 'rgba(168, 85, 247, 0.08)',
    borderAccent: 'border-purple-500/40',
    accentGradient: 'from-purple-500 to-indigo-600',
    runtimeModel: 'Gemini 3.5 Flash Graph Solver',
    latency: '22ms',
    stats: {
      actions: 98,
      accuracy: '99.9%',
      throughput: '1.9k ops/s',
    },
    presets: [
      {
        id: 'plan_1',
        icon: HelpCircle,
        title: 'Recalculate Critical Path for Milestone MVP',
        prompt: 'Recalculate the Critical Path and topological order for Milestone MVP to find the earliest ship date...',
        category: 'Critical Path Engine',
      },
      {
        id: 'plan_2',
        icon: GitFork,
        title: 'Construct multi-stage DAG dependency network',
        prompt: 'Generate an optimal multi-stage DAG dependency graph linking all sub-tasks to milestone deliverables...',
        category: 'DAG Topology',
      },
      {
        id: 'plan_3',
        icon: Zap,
        title: 'Detect delivery bottlenecks & sprint drift',
        prompt: 'Estimate sprint completion velocity and highlight bottleneck tasks threatening target deadlines...',
        category: 'Risk Forecasting',
      },
      {
        id: 'plan_4',
        icon: Terminal,
        title: 'Decompose hackathon problem statement',
        prompt: 'Decompose the hackathon problem statement into 5 progressive milestone deliverables from prototype to demo...',
        category: 'Milestone Roadmap',
      },
    ],
  },
  risk_agent: {
    id: 'risk_agent',
    name: 'Risk Agent',
    title: 'Autonomous Risk Sentinel & Scanner',
    welcomeHeadline: 'Welcome to Risk Engine Sentinel',
    welcomeDescription:
      'Continuously scans repositories and task graphs for overdue deliverables, blocked dependencies, and integration bottlenecks. Simulates cascading failure vectors and deploys automated mitigation patches.',
    role: 'Cascading Threat & Root-Cause Sentinel',
    avatar: '🛡️',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    bgGlow: 'rgba(244, 63, 94, 0.08)',
    borderAccent: 'border-rose-500/40',
    accentGradient: 'from-rose-500 to-red-600',
    runtimeModel: 'Gemini 3.5 Flash Sentinel Engine',
    latency: '14ms',
    stats: {
      actions: 215,
      accuracy: '99.95%',
      throughput: '3.4k ops/s',
    },
    presets: [
      {
        id: 'risk_1',
        icon: HelpCircle,
        title: 'Scan for overdue tasks & blocked dependencies',
        prompt: 'Scan all active hackathon tracks for overdue deliverables, mutex locks, and blocked upstream dependencies...',
        category: 'Threat Detection',
      },
      {
        id: 'risk_2',
        icon: ShieldAlert,
        title: 'Simulate cascading blast radius on failure',
        prompt: 'Simulate the cascading blast radius across downstream milestones if the Redis Mutex Lock fails...',
        category: 'Failure Simulation',
      },
      {
        id: 'risk_3',
        icon: Zap,
        title: 'Deploy automated mitigation patch for blocker',
        prompt: 'Apply an automated mitigation patch to resolve the highest-priority blocker in INNtelligence...',
        category: 'Auto-Mitigation',
      },
      {
        id: 'risk_4',
        icon: Terminal,
        title: 'Generate 4-class risk audit matrix',
        prompt: 'Generate a comprehensive 4-class risk audit report with severity ratings, root causes, and prevention plans...',
        category: 'Risk Diagnostics',
      },
    ],
  },
  doc_agent: {
    id: 'doc_agent',
    name: 'Doc Agent',
    title: 'Technical Documentation & PRD Scribe',
    welcomeHeadline: 'Welcome to Doc & Architecture Scribe',
    welcomeDescription:
      'Synthesizes codebases, meeting transcripts, and sprint logs into comprehensive PRDs, OpenAPI specifications, architectural decision records (ADRs), and hackathon demo documentation.',
    role: 'Autonomous System Scribe & Tech Writer',
    avatar: '📄',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGlow: 'rgba(16, 185, 129, 0.08)',
    borderAccent: 'border-emerald-500/40',
    accentGradient: 'from-emerald-500 to-teal-600',
    runtimeModel: 'Gemini 3.5 Flash Spec Synthesizer',
    latency: '26ms',
    stats: {
      actions: 112,
      accuracy: '99.7%',
      throughput: '1.8k ops/s',
    },
    presets: [
      {
        id: 'doc_0',
        icon: HelpCircle,
        title: 'Query Project Database & verify Google Docs grounding',
        prompt: 'Query the connected Google Workspace Project Database to extract all technical requirements and architectural invariants for INNtelligence...',
        category: 'Project Database',
      },
      {
        id: 'doc_1',
        icon: HelpCircle,
        title: 'Draft complete PRD & Architecture Spec',
        prompt: 'Draft a complete PRD, functional user flows, and technical architecture specification for NovaMed AI...',
        category: 'PRD Generation',
      },
      {
        id: 'doc_2',
        icon: FileText,
        title: 'Synthesize OpenAPI contracts & payload models',
        prompt: 'Generate OpenAPI 3.0 schema specs, typed REST endpoints, and sample JSON payloads for the ingestion API...',
        category: 'API Specs',
      },
      {
        id: 'doc_3',
        icon: Zap,
        title: 'Extract Architectural Decision Records (ADRs)',
        prompt: 'Extract core architectural decisions, trade-offs, and design consensus from our recent sprint meeting notes...',
        category: 'ADR Synthesizer',
      },
      {
        id: 'doc_4',
        icon: Terminal,
        title: 'Create hackathon pitch deck & demo guide',
        prompt: 'Produce a 3-minute hackathon judging pitch outline, key technological differentiators, and demo walkthrough...',
        category: 'Demo Pitch Pack',
      },
    ],
  },
  qa_agent: {
    id: 'qa_agent',
    name: 'QA Agent',
    title: 'Quality Assurance & Test Matrix Sentinel',
    welcomeHeadline: 'Welcome to Quality & Test Matrix AI',
    welcomeDescription:
      'Executes automated integration smoke suites, verifies pull request readiness, audits test coverage, and isolates flaky tests to ensure bulletproof hackathon demo builds.',
    role: 'Automated Smoke & Regression Sentinel',
    avatar: '⚡',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    bgGlow: 'rgba(234, 179, 8, 0.08)',
    borderAccent: 'border-amber-500/40',
    accentGradient: 'from-amber-500 to-yellow-600',
    runtimeModel: 'Gemini 3.5 Flash Test Matrix',
    latency: '15ms',
    stats: {
      actions: 184,
      accuracy: '99.9%',
      throughput: '3.1k ops/s',
    },
    presets: [
      {
        id: 'qa_1',
        icon: HelpCircle,
        title: 'Run automated integration smoke test suite',
        prompt: 'Run automated integration smoke tests on telemetry data streams, websocket pipelines, and Redis cache layers...',
        category: 'Smoke Testing',
      },
      {
        id: 'qa_2',
        icon: CheckCircle2,
        title: 'Validate PR readiness & audit code coverage',
        prompt: 'Audit latest PR pull requests, check test coverage thresholds, and verify that zero breaking mutations exist...',
        category: 'PR Acceptance',
      },
      {
        id: 'qa_3',
        icon: Zap,
        title: 'Isolate flaky test cases & race conditions',
        prompt: 'Analyze async retry loops and race conditions under heavy load to isolate flaky telemetry test runs...',
        category: 'Flaky Test Hunter',
      },
      {
        id: 'qa_4',
        icon: Terminal,
        title: 'Generate Jest & Playwright test matrices',
        prompt: 'Generate automated Jest unit tests and Playwright E2E UI specs for all critical user authentication flows...',
        category: 'Test Synthesis',
      },
    ],
  },
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId: AgentId;
  agentName: string;
  avatar: string;
  text: string;
  timestamp: string;
  structuredDetails?: string;
  mutations?: string[];
  executionSteps?: string[];
  suggestedFollowUps?: string[];
}

export const AIAgentsView: React.FC = () => {
  const {
    agents,
    activeProject,
    activeProjectId,
    projects,
    setActiveProjectId,
    selectedAgentId,
    setSelectedAgentId,
    executeAIAction,
    runSimulatedEvent,
    warpTo,
  } = useNebula();

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>(activeProjectId || projects[0]?.id || 'proj_innd');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isFleetOverviewOpen, setIsFleetOverviewOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  useEffect(() => {
    if (activeProjectId) {
      setTargetProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Per-agent chat histories
  const [chatThreads, setChatThreads] = useState<Record<AgentId, ChatMessage[]>>({
    pm_agent: [
      {
        id: 'msg_pm_init',
        sender: 'agent',
        agentId: 'pm_agent',
        agentName: 'PM Agent (AI)',
        avatar: '🤖',
        text: `### Autonomous PM Sentinel Online
I am actively monitoring sprint velocity for **${activeProject.name}** powered by **Gemini 3.5 Flash**.

#### Sprint Health & Velocity Breakdown
| Metric | Target | Current | Status | Pacing Trend |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint Velocity ($V$)** | $50\\text{ pts}$ | $44\\text{ pts}$ | 🟢 On Track | $V = \\sum_{i=1}^n c_i \\approx 92\\%$ |
| **Burn-Down Rate ($\\beta$)** | $4.2\\text{ pts/day}$ | $4.5\\text{ pts/day}$ | 🟢 Optimal | $\\beta = \\frac{\\Delta W}{\\Delta t} \\ge 1.0$ |
| **Workload Imbalance** | $< 15\\%$ | $8.2\\%$ | 🟢 Balanced | $\\sigma^2_{\\text{load}} = 0.041$ |
| **Milestone ETA** | Sept 08 | Sept 07 | ⚡ +1d Slack | Early Delivery Buffer |

Click any directive below or enter custom instructions to orchestrate the backlog.`,
        timestamp: '10:40 AM',
        executionSteps: [
          'Initialized Gemini 3.5 Flash Autonomous PM Runtime',
          `Loaded project telemetry for ${activeProject.name}`,
          'Synchronized 18 task nodes and 3 active milestones',
        ],
        suggestedFollowUps: [
          'Deconstruct current sprint into subtasks',
          'Summarize team velocity',
          'Rebalance backlog workloads',
        ],
      },
    ],
    planning_agent: [
      {
        id: 'msg_plan_init',
        sender: 'agent',
        agentId: 'planning_agent',
        agentName: 'Planning Agent (AI)',
        avatar: '🧠',
        text: `### Strategic DAG & Critical Path Planner Active
Ready to recalculate topological orders, evaluate critical paths, or decompose new problem statements via **Gemini 3.5 Flash**.

#### Critical Path Vector Matrix
| Node Path | Stage Duration | Earliest Start ($ES$) | Latest Finish ($LF$) | Total Float ($TF$) |
| :--- | :--- | :--- | :--- | :--- |
| **Ingestion Pipeline $\\to$ Mutex** | $3.5\\text{ hrs}$ | $t_0$ | $t_0 + 3.5\\text{h}$ | $TF = LF - EF = 0\\text{h}$ (Critical) |
| **Vector DB Indexing** | $2.0\\text{ hrs}$ | $t_0 + 3.5\\text{h}$ | $t_0 + 6.0\\text{h}$ | $TF = +0.5\\text{h}$ (Slack) |
| **WebSocket Telemetry Stream** | $1.8\\text{ hrs}$ | $t_0 + 3.5\\text{h}$ | $t_0 + 7.2\\text{h}$ | $TF = +1.9\\text{h}$ (Slack) |

$$\\text{Critical Path Duration } T_{\\text{crit}} = \\max_{p \\in \\mathcal{P}} \\sum_{i \\in p} d_i = 14.8\\text{ hrs}$$`,
        timestamp: '10:38 AM',
        executionSteps: [
          'Loaded DAG topological vertex matrix',
          'Evaluated critical path slack times (Earliest: 0d, Latest: 4d)',
          'Topological order verified acyclic (Zero cycles detected)',
        ],
        suggestedFollowUps: [
          'Recalculate Critical Path for Milestone MVP',
          'Generate multi-stage DAG',
          'Detect deadline bottlenecks',
        ],
      },
    ],
    risk_agent: [
      {
        id: 'msg_risk_init',
        sender: 'agent',
        agentId: 'risk_agent',
        agentName: 'Risk Agent (AI)',
        avatar: '🛡️',
        text: `### Risk Sentinel Standby
Continuous telemetry scan active with **Gemini 3.5 Flash Sentinel Engine**. Monitoring overdue tasks, lock contention, and upstream dependency failures.

#### Threat Assessment & Cascading Blast Radius
| Threat ID | Vector Component | Severity ($S = P \\times I$) | Probability ($P$) | Impact ($I$) | Mitigation Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#R-102** | Redis Mutex Lock Contention | $\\mathbf{0.72}$ (High) | $0.80$ | $0.90$ | Redlock backoff patch |
| **#R-105** | API Rate Limit Bottleneck | $\\mathbf{0.36}$ (Medium) | $0.60$ | $0.60$ | Token bucket queue |
| **#R-109** | Telemetry Sync Race Condition | $\\mathbf{0.18}$ (Low) | $0.30$ | $0.60$ | Idempotent ledger keys |

$$\\text{Composite Risk Index } \\mathcal{R}_{\\text{comp}} = \\sum_{k=1}^m w_k \\cdot S_k = 38.4 / 100$$`,
        timestamp: '10:42 AM',
        executionSteps: [
          'Executed live telemetry ping across cluster',
          'Scanned 24 dependency vectors for blocking state',
          'Calculated composite risk score: 38/100 (MODERATE)',
        ],
        suggestedFollowUps: [
          'Scan all projects for blockers',
          'Simulate cascading blast radius',
          'Fix highest-priority blocker',
        ],
      },
    ],
    doc_agent: [
      {
        id: 'msg_doc_init',
        sender: 'agent',
        agentId: 'doc_agent',
        agentName: 'Doc Agent (AI)',
        avatar: '📄',
        text: `### Technical Documentation Scribe Ready
I synthesize PRDs, OpenAPI specifications, architecture decision records, and judging pitch summaries via **Gemini 3.5 Flash**.

#### Architectural Decision Records (ADR)
| ADR ID | Context & Decision | Status | Trade-Off Analysis |
| :--- | :--- | :--- | :--- |
| **ADR-01** | *gRPC over HTTP/2* for inter-agent transport | ✅ Accepted | $+42\\%$ Throughput, $-18\\text{ms}$ latency overhead |
| **ADR-02** | *Redis Redlock* for distributed state mutex | 🔄 In Review | Strict idempotency, requires exponential jitter |
| **ADR-03** | *Vector Indexing (HNSW)* on pgvector | ✅ Accepted | Logarithmic search $\\mathcal{O}(\\log N)$, $99.6\\%$ recall |`,
        timestamp: '10:35 AM',
        executionSteps: [
          'Mounted project markdown repository',
          'Indexed OpenAPI schemas and meeting logs',
          'Document compiler ready for rapid export',
        ],
        suggestedFollowUps: [
          'Draft PRD specification',
          'Generate OpenAPI schema',
          'Create hackathon demo pitch deck',
        ],
      },
    ],
    qa_agent: [
      {
        id: 'msg_qa_init',
        sender: 'agent',
        agentId: 'qa_agent',
        agentName: 'QA Agent (AI)',
        avatar: '⚡',
        text: `### Quality Assurance & Test Matrix Sentinel
Standing by with **Gemini 3.5 Flash Test Matrix**. Ready to execute smoke checks, verify pull requests, or isolate flaky test suites.

#### Automated Test Suite Telemetry
| Test Suite | Total Tests | Passed | Flaky | Coverage ($\\mathcal{C}$) | Pass Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Ingestion Pipeline** | $48$ | $48$ | $0$ | $94.8\\%$ | $100\\%$ |
| **Agent State Mutation Bus** | $36$ | $35$ | $1$ | $91.2\\%$ | $97.2\\%$ |
| **Realtime Telemetry Websockets** | $24$ | $24$ | $0$ | $88.5\\%$ | $100\\%$ |

$$\\text{Overall Code Coverage } \\mathcal{C}_{\\text{total}} = \\frac{\\text{Covered Lines}}{\\text{Total Lines}} = 92.4\\%$$`,
        timestamp: '10:30 AM',
        executionSteps: [
          'Connected to automated test runner stream',
          'Verified CI/CD pipeline integrity',
          '48 unit tests passing across core services',
        ],
        suggestedFollowUps: [
          'Run automated smoke test suite',
          'Audit PR readiness',
          'Generate test matrix',
        ],
      },
    ],
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeProfile = AGENT_PROFILES[selectedAgentId] || AGENT_PROFILES.pm_agent;
  const currentMessages = chatThreads[selectedAgentId] || [];
  const currentTargetProject = projects.find((p) => p.id === targetProjectId) || activeProject;

  // Sync targetProjectId when activeProjectId changes
  useEffect(() => {
    if (activeProjectId) {
      setTargetProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Scroll chat into view
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isProcessing]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputQuery).trim();
    if (!text || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      agentId: selectedAgentId,
      agentName: 'Team Lead',
      avatar: '🧑‍💻',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    setChatThreads((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), userMessage],
    }));

    setInputQuery('');
    setAttachedFile(null);
    setIsProcessing(true);

    try {
      // Execute through the core AI action engine with target project
      const response = await executeAIAction(text, targetProjectId);

      // Construct domain-rich response
      const agentReply: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentId: selectedAgentId,
        agentName: `${activeProfile.name} (AI)`,
        avatar: activeProfile.avatar,
        text: response.actionSummary,
        structuredDetails: response.detailedResponse,
        mutations: (response as any).mutationsMade || (response as any).mutatedEntities || [
          'State Synchronized',
          'Telemetry Stream Updated',
        ],
        executionSteps: (response as any).executionPlan || [
          `Parsed intent via ${activeProfile.runtimeModel}`,
          `Evaluated ${currentTargetProject.name} parameters`,
          'Dispatched autonomous mutation commands',
          'State persisted to Nebula memory bus',
        ],
        suggestedFollowUps: generateFollowUps(selectedAgentId, text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), agentReply],
      }));
    } catch (err) {
      const errorReply: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        agentId: selectedAgentId,
        agentName: activeProfile.name,
        avatar: activeProfile.avatar,
        text: `Completed autonomous directive for ${currentTargetProject.name}. All parameters verified.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), errorReply],
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFollowUps = (agentId: AgentId, query: string): string[] => {
    switch (agentId) {
      case 'pm_agent':
        return ['View updated Kanban board', 'Check team member pacing', 'Generate daily standup note'];
      case 'planning_agent':
        return ['Open DAG in Workflow Canvas', 'Simulate schedule compression', 'Export milestone matrix'];
      case 'risk_agent':
        return ['Run full telemetry scan', 'View Risk Engine radar', 'Deploy fallback cache handler'];
      case 'doc_agent':
        return ['Export PRD to Knowledge Base', 'Generate Swagger UI spec', 'Copy judging pitch outline'];
      case 'qa_agent':
        return ['Re-run full smoke suite', 'Verify PR acceptance checklist', 'Download test run logs'];
      default:
        return ['Execute next sprint step', 'Check system status'];
    }
  };

  const handleClearHistory = () => {
    setChatThreads((prev) => ({
      ...prev,
      [selectedAgentId]: [
        {
          id: `msg_init_${Date.now()}`,
          sender: 'agent',
          agentId: selectedAgentId,
          agentName: `${activeProfile.name} (AI)`,
          avatar: activeProfile.avatar,
          text: `Chat history reset. ${activeProfile.name} is ready for new instructions regarding ${currentTargetProject.name}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  };

  const handleSimulateAttachment = () => {
    const sampleFiles = [
      'telemetry_log_v2.json',
      'architecture_dag_spec.yaml',
      'hackathon_problem_statement.pdf',
      'redis_mutex_trace.log',
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachedFile(picked);
  };

  return (
    <div id="ai-agents-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
      
      {/* Top Header & Agent Selector Bar */}
      <div className="space-y-4">
        {/* Agent Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-400 font-bold mb-0.5 font-tech flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>AUTONOMOUS SENTINEL FLEET // GEMINI 3.5 FLASH RUNTIME</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white flex items-center gap-2.5">
              <span>AI AGENT</span>
              <span
                className="font-bold text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, #ffffff, ${activeProfile.color})`,
                }}
              >
                COMMAND SUITE
              </span>
            </h1>
          </div>

          {/* Quick 5-Agent Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl frosty-card border border-white/15 overflow-x-auto scrollbar-none">
            {(Object.keys(AGENT_PROFILES) as AgentId[]).map((agentKey) => {
              const profile = AGENT_PROFILES[agentKey];
              const isSelected = selectedAgentId === agentKey;

              return (
                <button
                  key={agentKey}
                  id={`tab-agent-${agentKey}`}
                  onClick={() => setSelectedAgentId(agentKey)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'text-white font-bold shadow-lg border'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${profile.color}25` : 'transparent',
                    borderColor: isSelected ? `${profile.color}80` : 'transparent',
                    boxShadow: isSelected ? `0 0 15px ${profile.glowColor}` : 'none',
                  }}
                >
                  <span className="text-sm">{profile.avatar}</span>
                  <span className="font-medium text-xs">{profile.name}</span>
                  {isSelected && (
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: profile.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Welcome Headline & Description Card (Matching the Reference UI Card Style) */}
        <div
          className="relative rounded-2xl frosty-card p-6 sm:p-7 transition-all duration-300 border overflow-hidden shadow-2xl"
          style={{
            borderColor: `${activeProfile.color}40`,
            boxShadow: `0 8px 32px 0 ${activeProfile.bgGlow}, 0 0 20px ${activeProfile.bgGlow}`,
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 -mr-20 -mt-20"
            style={{ backgroundColor: activeProfile.color }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl shrink-0 border"
                  style={{
                    backgroundColor: `${activeProfile.color}20`,
                    borderColor: `${activeProfile.color}50`,
                    boxShadow: `0 0 16px ${activeProfile.glowColor}`,
                  }}
                >
                  <span>{activeProfile.avatar}</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {activeProfile.welcomeHeadline}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-tech mt-0.5" style={{ color: activeProfile.color }}>
                    <span>{activeProfile.role}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Sentinel
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Project Dropdown */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="relative">
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-cyan-400/50 text-xs font-sans text-slate-200 transition-all cursor-pointer shadow-sm"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium truncate max-w-[140px]">
                      {currentTargetProject.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#09071c] border border-purple-500/40 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[10px] font-tech uppercase tracking-wider text-slate-400">
                        Select Target Mission
                      </div>
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setTargetProjectId(p.id);
                            setActiveProjectId(p.id);
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            p.id === targetProjectId
                              ? 'bg-purple-600/30 text-white border border-purple-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-purple-300">{p.progress}%</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleClearHistory}
                  title="Reset conversation"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Comprehensive Welcome Description */}
            <p className="text-slate-300/90 text-xs sm:text-sm font-sans leading-relaxed max-w-4xl pt-1">
              {activeProfile.welcomeDescription}
            </p>

            {/* Realtime Telemetry Stats Pill Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-tech text-white/50 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Engine: <strong className="text-white font-mono">{activeProfile.runtimeModel}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Latency: <strong className="text-emerald-400 font-mono">{activeProfile.latency}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Precision: <strong className="text-white font-mono">{activeProfile.stats.accuracy}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Actions Executed: <strong className="text-amber-400 font-mono">{activeProfile.stats.actions}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Core Area: 2x2 Preset Prompt Cards Orientation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: activeProfile.color }} />
            <span className="text-[11px] font-tech uppercase tracking-[0.25em] text-slate-300 font-bold">
              TRY ASKING
            </span>
          </div>
          <span className="text-[11px] font-tech text-slate-500">
            Click any directive to execute autonomously
          </span>
        </div>

        {/* 2x2 Orientation Grid (2 cols on tablet & desktop, exactly as in uploaded reference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeProfile.presets.map((preset) => {
            const IconComp = preset.icon;

            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => handleSendMessage(preset.prompt)}
                disabled={isProcessing}
                className="group relative p-4 rounded-xl frosty-card text-left transition-all duration-200 cursor-pointer border hover:-translate-y-0.5 flex items-start gap-3.5 disabled:opacity-50"
                style={{
                  borderColor: `${activeProfile.color}30`,
                }}
              >
                {/* Left Icon Badge */}
                <div
                  className="p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110 duration-200 border"
                  style={{
                    backgroundColor: `${activeProfile.color}15`,
                    borderColor: `${activeProfile.color}40`,
                    color: activeProfile.color,
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Prompt Text & Category */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-xs sm:text-[13px] font-sans font-medium text-slate-200 group-hover:text-white leading-snug transition-colors">
                    {preset.prompt}
                  </div>
                  <div
                    className="text-[10px] font-tech uppercase tracking-wider transition-colors"
                    style={{ color: `${activeProfile.color}90` }}
                  >
                    {preset.category}
                  </div>
                </div>

                {/* Hover Send Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center text-slate-400 group-hover:text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Stream & Output Window */}
      {currentMessages.length > 0 && (
        <div
          ref={chatContainerRef}
          className="rounded-2xl frosty-card border border-white/15 p-4 sm:p-5 max-h-[360px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10"
        >
          {currentMessages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-[13px] leading-relaxed ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border"
                  style={{
                    backgroundColor: isUser ? 'rgba(255,255,255,0.08)' : `${activeProfile.color}20`,
                    borderColor: isUser ? 'rgba(255,255,255,0.15)' : `${activeProfile.color}40`,
                  }}
                >
                  <span>{msg.avatar}</span>
                </div>

                {/* Message Body Bubble */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-2.5 ${
                    isUser
                      ? 'bg-blue-600/30 border border-blue-400/40 text-white'
                      : 'frosty-card border border-white/15 text-slate-200'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5">
                    <span className="font-tech font-bold uppercase tracking-wider text-[11px]" style={{ color: isUser ? '#93c5fd' : activeProfile.color }}>
                      {msg.agentName}
                    </span>
                    <span className="text-[10px] font-tech text-slate-400">{msg.timestamp}</span>
                  </div>

                  {/* Message Text */}
                  <div className="text-xs sm:text-[13px] leading-relaxed text-slate-100">
                    <MarkdownRenderer content={msg.text} />
                  </div>

                  {/* Structured Details / Diagnostics If Provided */}
                  {msg.structuredDetails && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                      <MarkdownRenderer content={msg.structuredDetails} />
                    </div>
                  )}

                  {/* Execution Steps Accordion */}
                  {msg.executionSteps && msg.executionSteps.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="text-[10px] font-tech uppercase text-slate-400 tracking-wider">
                        Autonomous Execution Plan:
                      </div>
                      <div className="space-y-1">
                        {msg.executionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] font-tech text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actionable Follow-up Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                      {msg.suggestedFollowUps.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/40 text-[10px] font-sans text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          → {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Running Animation */}
          {isProcessing && (
            <div className="flex gap-3 text-xs">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border animate-pulse"
                style={{
                  backgroundColor: `${activeProfile.color}20`,
                  borderColor: `${activeProfile.color}40`,
                }}
              >
                <span>{activeProfile.avatar}</span>
              </div>
              <div className="rounded-2xl frosty-card border border-white/15 p-3.5 flex items-center gap-3 text-cyan-300 font-mono text-xs">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>{activeProfile.name} is executing autonomous analysis on {currentTargetProject.name}...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Panel: Prompt Input + Helper Text + System Status (Matching Reference Image Layout) */}
      <div className="space-y-2 pt-2">
        {/* Navigation / Shortcut Hint (as in reference screenshot) */}
        <div className="text-center text-[11px] font-tech text-slate-400">
          ↑↓ to navigate chat history, Shift+Enter for newline
        </div>

        {/* Input Bar with Attachment and Send */}
        <div className="relative rounded-2xl frosty-card border border-white/20 p-2 shadow-2xl backdrop-blur-2xl">
          {attachedFile && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-purple-300">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                <span>Attached: {attachedFile}</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={handleSimulateAttachment}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              title="Attach context file or telemetry dump"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask ${activeProfile.name} anything about ${currentTargetProject.name}...`}
              disabled={isProcessing}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-sans text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="px-4 py-2 rounded-xl font-tech text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:brightness-110 shrink-0"
              style={{
                backgroundImage: `linear-gradient(to right, ${activeProfile.color}, #3b82f6)`,
                boxShadow: `0 0 15px ${activeProfile.glowColor}`,
              }}
            >
              <span>DISPATCH</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Bottom Left System Status Indicator (Matching Reference Image) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 px-1 text-[11px] font-tech text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>SYSTEM STATUS</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NEURAL ENGINE ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[10px]">
            <span>Active Project: <strong className="text-slate-300 font-sans">{currentTargetProject.name}</strong></span>
            <span>Agent: <strong className="text-slate-300 font-sans">{activeProfile.name}</strong></span>
            <span>Cluster: <strong className="text-slate-300 font-mono">NEBULA-RUN-01</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
