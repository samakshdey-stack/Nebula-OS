import {
  Project,
  Member,
  Task,
  Milestone,
  AIAgent,
  RiskItem,
  ActivityLog,
  Meeting,
  DocumentItem,
  AutomationItem,
  ProjectDatabaseRecord,
  TeamChatMessage,
  TeamChannel,
} from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_1',
    name: 'Samaksh Dey',
    role: 'Team Lead',
    avatar: '',
    email: 'samaksh.dey@nebula.team',
  },
  {
    id: 'mem_2',
    name: 'Aman Kahar',
    role: 'Frontend specialist',
    avatar: '',
    email: 'aman.kahar@nebula.team',
  },
  {
    id: 'mem_3',
    name: 'Uttaran Adhikari',
    role: 'Cybersecurity',
    avatar: '',
    email: 'uttaran.adhikari@nebula.team',
  },
  {
    id: 'mem_4',
    name: 'Arshia Bhattacharyya',
    role: 'Researcher',
    avatar: '',
    email: 'arshia.bhattacharyya@nebula.team',
  },
  {
    id: 'mem_5',
    name: 'Anushka Bandyopadhyay',
    role: 'Data Analytics',
    avatar: '',
    email: 'anushka.bandyopadhyay@nebula.team',
  },
  {
    id: 'mem_6',
    name: 'Riti Mishra',
    role: 'Researcher',
    avatar: '',
    email: 'riti.mishra@nebula.team',
  },
];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'pm_agent',
    name: 'PM Agent',
    title: 'Autonomous Project Management Sentinel',
    role: 'Autonomous Project Manager',
    avatar: '🤖',
    state: 'ACTIVE',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    description: 'Creates, breaks down, assigns, and tracks project tasks. Updates states and generates sprint summaries.',
    capabilities: ['Sprint Decomposition', 'Workload Balancing', 'Standup Extraction', 'Progress Telemetry'],
    currentTask: 'Standby for instructions',
    lastAction: 'Initialized',
    lastActiveTime: 'Ready',
    stats: {
      actionsPerformed: 0,
      tasksManaged: 0,
      risksMitigated: 0,
    },
  },
  {
    id: 'planning_agent',
    name: 'Planning Agent',
    title: 'Strategic DAG & Objective Decomposer',
    role: 'Strategic DAG & Milestone Planner',
    avatar: '🧠',
    state: 'IDLE',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Converts high-level hackathon objectives into multi-stage milestones, builds dependency DAGs, and estimates sprint velocity.',
    capabilities: ['Objective Decomposition', 'DAG Topology Calculation', 'Critical Path Detection', 'Milestone Projection'],
    currentTask: 'Standby for instructions',
    lastAction: 'Initialized',
    lastActiveTime: 'Ready',
    stats: {
      actionsPerformed: 0,
      tasksManaged: 0,
      risksMitigated: 0,
    },
  },
  {
    id: 'risk_agent',
    name: 'Risk Agent',
    title: 'Autonomous Risk Detector & Sentinel',
    role: 'Risk Engine Sentinel',
    avatar: '🛡️',
    state: 'IDLE',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    description: 'Scans for overdue tasks, detects blocked upstream dependencies, models cascading failure vectors, and triggers automated mitigations.',
    capabilities: ['Cascade Failure Detection', 'Dependency Anomaly Scanning', 'Automated Patch Deployment', 'Root-Cause Analysis'],
    currentTask: 'Standby for instructions',
    lastAction: 'Initialized',
    lastActiveTime: 'Ready',
    stats: {
      actionsPerformed: 0,
      tasksManaged: 0,
      risksMitigated: 0,
    },
  },
  {
    id: 'doc_agent',
    name: 'Doc Agent',
    title: 'Autonomous Technical Documenter & PRD Scribe',
    role: 'Technical Documentation Scribe',
    avatar: '📄',
    state: 'IDLE',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'Generates PRDs, API contract specs, post-mortems, meeting notes, and architectural decision records automatically.',
    capabilities: ['PRD Generation', 'API Contract Synthesizer', 'Changelog Extraction', 'Architecture Diagrams'],
    currentTask: 'Standby for instructions',
    lastAction: 'Initialized',
    lastActiveTime: 'Ready',
    stats: {
      actionsPerformed: 0,
      tasksManaged: 0,
      risksMitigated: 0,
    },
  },
  {
    id: 'qa_agent',
    name: 'QA Agent',
    title: 'Quality Assurance & Test Matrix Sentinel',
    role: 'Quality & Test Suite Validator',
    avatar: '⚡',
    state: 'IDLE',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    description: 'Runs automated integration smoke checks, verifies PR readiness, tests edge cases, and audits build reliability.',
    capabilities: ['Automated Test Runner', 'Regression Sentinel', 'PR Acceptance Checks', 'Flaky Test Detection'],
    currentTask: 'Standby for instructions',
    lastAction: 'Initialized',
    lastActiveTime: 'Ready',
    stats: {
      actionsPerformed: 0,
      tasksManaged: 0,
      risksMitigated: 0,
    },
  },
];

// Project profiles with rich dedicated properties for each mission
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_innd',
    name: 'INNtelligence',
    codename: 'INNT-01',
    hackathon: 'Global Defense & AI Summit',
    description: 'Autonomous multi-domain defense intelligence, signals analytics, and real-time topological DAG threat containment engine.',
    status: 'ACTIVE',
    progress: 42,
    health: 'ON_TRACK',
    deadline: '2026-09-15',
    createdAt: '2026-08-01',
    leadId: 'mem_1',
    memberIds: ['mem_1', 'mem_2', 'mem_3'],
    tags: ['Defense AI', 'Threat Intel', 'DAG', 'Multi-Agent', 'Google Workspace'],
    repositoryUrl: 'https://github.com/nebula-org/inntelligence-core',
    demoUrl: 'https://inntelligence.nebula.team',
    celestial: {
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.7)',
      size: 42,
      orbitRadius: 190,
      orbitSpeed: 0.008,
      angle: 0.35,
      spectralClass: 'Class K (Orange Giant)',
    },
  },
  {
    id: 'proj_novamed',
    name: 'NovaMed AI',
    codename: 'NOVA-02',
    hackathon: 'BioTech Innovators 2026',
    description: 'Clinical decision-support diagnostic platform with multi-modal medical imaging and HIPAA-compliant grounding.',
    status: 'ACTIVE',
    progress: 68,
    health: 'ON_TRACK',
    deadline: '2026-09-22',
    createdAt: '2026-08-05',
    leadId: 'mem_4',
    memberIds: ['mem_4', 'mem_5', 'mem_1'],
    tags: ['Healthcare', 'Clinical AI', 'BioTech', 'HIPAA'],
    repositoryUrl: 'https://github.com/nebula-org/novamed-ai',
    demoUrl: 'https://novamed.nebula.team',
    celestial: {
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.8)',
      size: 38,
      orbitRadius: 130,
      orbitSpeed: 0.012,
      angle: 1.8,
      spectralClass: 'Class B (Cyan Subgiant)',
    },
  },
  {
    id: 'proj_aquagrid',
    name: 'AquaGrid',
    codename: 'AQUA-03',
    hackathon: 'CleanTech World Cup',
    description: 'Decentralized municipal water grid telemetry with predictive leak detection sensors and IoT edge nodes.',
    status: 'ACTIVE',
    progress: 55,
    health: 'ON_TRACK',
    deadline: '2026-10-01',
    createdAt: '2026-08-10',
    leadId: 'mem_5',
    memberIds: ['mem_5', 'mem_2'],
    tags: ['Smart City', 'IoT', 'CleanTech', 'Telemetry'],
    repositoryUrl: 'https://github.com/nebula-org/aquagrid',
    demoUrl: 'https://aquagrid.nebula.team',
    celestial: {
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.75)',
      size: 34,
      orbitRadius: 260,
      orbitSpeed: 0.006,
      angle: 3.4,
      spectralClass: 'Class A (Blue Star)',
    },
  },
  {
    id: 'proj_roadsense',
    name: 'RoadSense',
    codename: 'ROAD-04',
    hackathon: 'Mobility & Urban AI',
    description: 'Real-time edge computer vision for municipal traffic safety, hazard detection, and V2X urban infrastructure.',
    status: 'ACTIVE',
    progress: 35,
    health: 'NEEDS_ATTENTION',
    deadline: '2026-10-15',
    createdAt: '2026-08-12',
    leadId: 'mem_2',
    memberIds: ['mem_2', 'mem_3'],
    tags: ['Computer Vision', 'Edge AI', 'V2X', 'Urban Safety'],
    repositoryUrl: 'https://github.com/nebula-org/roadsense',
    demoUrl: 'https://roadsense.nebula.team',
    celestial: {
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.75)',
      size: 32,
      orbitRadius: 320,
      orbitSpeed: 0.005,
      angle: 5.1,
      spectralClass: 'Class F (Emerald Main Sequence)',
    },
  },
  {
    id: 'proj_ledger',
    name: 'LEDGER',
    codename: 'LEDG-05',
    hackathon: 'FinTech Future 2026',
    description: 'High-throughput zero-knowledge multi-asset settlement and automated cryptographic transaction verification.',
    status: 'ACTIVE',
    progress: 78,
    health: 'ON_TRACK',
    deadline: '2026-09-30',
    createdAt: '2026-08-03',
    leadId: 'mem_3',
    memberIds: ['mem_3', 'mem_1'],
    tags: ['FinTech', 'Zero Knowledge', 'Cryptography', 'High-Frequency'],
    repositoryUrl: 'https://github.com/nebula-org/ledger-zk',
    demoUrl: 'https://ledger.nebula.team',
    celestial: {
      color: '#e0e7ff',
      glowColor: 'rgba(224, 231, 255, 0.9)',
      size: 28,
      orbitRadius: 80,
      orbitSpeed: 0.016,
      angle: 0.9,
      spectralClass: 'Class O (Superluminous White Dwarf)',
    },
  },
  {
    id: 'proj_verdant',
    name: 'VERDANT',
    codename: 'VERD-06',
    hackathon: 'AgriTech Climate Summit',
    description: 'Satellite multi-spectral imagery pipeline for predictive agricultural yield and soil health monitoring.',
    status: 'ACTIVE',
    progress: 60,
    health: 'ON_TRACK',
    deadline: '2026-10-20',
    createdAt: '2026-08-14',
    leadId: 'mem_6',
    memberIds: ['mem_6', 'mem_5'],
    tags: ['AgriTech', 'Satellite GIS', 'Carbon Credits', 'Ecology'],
    repositoryUrl: 'https://github.com/nebula-org/verdant-agro',
    demoUrl: 'https://verdant.nebula.team',
    celestial: {
      color: '#d97706',
      glowColor: 'rgba(217, 119, 6, 0.65)',
      size: 26,
      orbitRadius: 380,
      orbitSpeed: 0.004,
      angle: 2.2,
      spectralClass: 'Class M (Amber Dwarf)',
    },
  },
  {
    id: 'proj_ecopack',
    name: 'ECOPACK JUTE',
    codename: 'ECO-07',
    hackathon: 'Circular Economy Challenge',
    description: 'Bio-degradable polymer formulation and supply chain tracking for sustainable commercial packaging.',
    status: 'ACTIVE',
    progress: 48,
    health: 'ON_TRACK',
    deadline: '2026-11-05',
    createdAt: '2026-08-18',
    leadId: 'mem_6',
    memberIds: ['mem_6', 'mem_4'],
    tags: ['Bio-Polymer', 'Sustainability', 'Circular Economy', 'Materials'],
    repositoryUrl: 'https://github.com/nebula-org/ecopack-jute',
    demoUrl: 'https://ecopack.nebula.team',
    celestial: {
      color: '#059669',
      glowColor: 'rgba(5, 150, 105, 0.7)',
      size: 24,
      orbitRadius: 430,
      orbitSpeed: 0.0035,
      angle: 4.2,
      spectralClass: 'Class G (Yellow-Green Planetoid)',
    },
  },
  {
    id: 'proj_axiom',
    name: 'AXIOM',
    codename: 'AXM-08',
    hackathon: 'Foundation Models & Agents',
    description: 'Multi-model LLM consensus engine with sub-millisecond semantic cache and autonomous safety firewalls.',
    status: 'ACTIVE',
    progress: 82,
    health: 'ON_TRACK',
    deadline: '2026-09-18',
    createdAt: '2026-07-28',
    leadId: 'mem_1',
    memberIds: ['mem_1', 'mem_2', 'mem_3', 'mem_4'],
    tags: ['LLM Orchestration', 'Agent Consensus', 'Semantic Cache', 'Safety'],
    repositoryUrl: 'https://github.com/nebula-org/axiom-core',
    demoUrl: 'https://axiom.nebula.team',
    celestial: {
      color: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.8)',
      size: 30,
      orbitRadius: 480,
      orbitSpeed: 0.003,
      angle: 5.8,
      spectralClass: 'Class V (Violet Pulsar)',
    },
  },
  {
    id: 'proj_nebula_os',
    name: 'Nebula OS',
    codename: 'NEB-00',
    hackathon: 'Interstellar Systems',
    description: 'Core galactic operating system unifying all hackathons, multi-agent sentinels, and Google Workspace databases.',
    status: 'ACTIVE',
    progress: 90,
    health: 'ON_TRACK',
    deadline: '2026-12-31',
    createdAt: '2026-07-15',
    leadId: 'mem_1',
    memberIds: ['mem_1', 'mem_2', 'mem_3', 'mem_4', 'mem_5', 'mem_6'],
    tags: ['Core OS', 'Autonomous Fleet', 'Google Workspace', 'DAG Kernel'],
    repositoryUrl: 'https://github.com/nebula-org/nebula-os',
    demoUrl: 'https://nebula.team',
    celestial: {
      color: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.95)',
      size: 48,
      orbitRadius: 0,
      orbitSpeed: 0,
      angle: 0,
      spectralClass: 'Galactic Core (Magenta Supermassive Star)',
    },
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms_innd_01',
    projectId: 'proj_innd',
    name: 'Autonomous Threat Detection & DAG v1.0',
    description: 'Production release of the multi-domain signals ingestion scheduler and defense orchestration bus.',
    targetDate: '2026-09-08',
    progress: 80,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_1',
  },
  {
    id: 'ms_novamed_01',
    projectId: 'proj_novamed',
    name: 'Clinical Inference Model Validation',
    description: 'Complete cross-validation across 10,000 anonymized radiology records.',
    targetDate: '2026-09-18',
    progress: 65,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_4',
  },
  {
    id: 'ms_aquagrid_01',
    projectId: 'proj_aquagrid',
    name: 'Sensor Mesh Deployment & Calibration',
    description: 'Deploy 50 IoT flow sensors across pilot municipal test zone.',
    targetDate: '2026-09-25',
    progress: 50,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_5',
  },
  {
    id: 'ms_roadsense_01',
    projectId: 'proj_roadsense',
    name: 'Edge Vision Inference Pipeline',
    description: 'Benchmarking 60 FPS object tracking on low-power municipal edge gateways.',
    targetDate: '2026-10-05',
    progress: 30,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_2',
  },
  {
    id: 'ms_ledger_01',
    projectId: 'proj_ledger',
    name: 'ZK-SNARK Prover Optimization',
    description: 'Sub-50ms cryptographic proof generation for high-frequency settlement.',
    targetDate: '2026-09-20',
    progress: 85,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_3',
  },
  {
    id: 'ms_verdant_01',
    projectId: 'proj_verdant',
    name: 'Sentinel-2 Satellite Feed Ingestion',
    description: 'Automated NDVI spectral computation and soil moisture indexing pipeline.',
    targetDate: '2026-10-10',
    progress: 55,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_6',
  },
  {
    id: 'ms_ecopack_01',
    projectId: 'proj_ecopack',
    name: 'Tensile Strength & Biodegradation Audit',
    description: 'ASTM D6400 certification for 100% compostable packaging polymer.',
    targetDate: '2026-10-28',
    progress: 45,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_6',
  },
  {
    id: 'ms_axiom_01',
    projectId: 'proj_axiom',
    name: 'Multi-LLM Consensus Protocol v2',
    description: 'Distributed voting mechanism across 5 foundation models with semantic caching.',
    targetDate: '2026-09-14',
    progress: 90,
    status: 'IN_PROGRESS',
    dependencies: [],
    assignedMemberId: 'mem_1',
  },
];

export const INITIAL_TASKS: Task[] = [
  // INNtelligence Tasks
  {
    id: 'task_innd_101',
    projectId: 'proj_innd',
    title: 'Core WebSocket Threat Streamer',
    description: 'Implement real-time WebSocket state distribution for reactive multi-domain threat graphs with sub-50ms latency.',
    assignedMemberId: 'mem_2',
    assignedAgentId: 'pm_agent',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    deadline: '2026-09-05',
    dependencies: [],
    tags: ['WebSocket', 'Threat Intel', 'Frontend'],
    estimatedHours: 8.5,
    order: 1,
  },
  {
    id: 'task_innd_102',
    projectId: 'proj_innd',
    title: 'Zero-Trust RBAC Policy Enforcement',
    description: 'Enforce cryptographic access token verification across autonomous threat sentinel mutations.',
    assignedMemberId: 'mem_3',
    assignedAgentId: 'risk_agent',
    priority: 'HIGH',
    status: 'TODO',
    deadline: '2026-09-07',
    dependencies: ['task_innd_101'],
    tags: ['Cybersecurity', 'RBAC', 'Auth'],
    estimatedHours: 6.0,
    order: 2,
  },
  {
    id: 'task_innd_103',
    projectId: 'proj_innd',
    title: 'Distributed Signals Telemetry Aggregator',
    description: 'Telemetry sink collecting signals analysis metrics across all 5 autonomous AI defense sentinels.',
    assignedMemberId: 'mem_1',
    assignedAgentId: 'planning_agent',
    priority: 'HIGH',
    status: 'DONE',
    deadline: '2026-09-02',
    dependencies: [],
    tags: ['Telemetry', 'Signals', 'Core Engine'],
    estimatedHours: 12.0,
    order: 3,
  },

  // NovaMed AI Tasks
  {
    id: 'task_novamed_201',
    projectId: 'proj_novamed',
    title: 'Multi-Modal DICOM Image Parser',
    description: 'Build fast WebAssembly streaming parser for CT/MRI scan volumetrics.',
    assignedMemberId: 'mem_4',
    assignedAgentId: 'pm_agent',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    deadline: '2026-09-12',
    dependencies: [],
    tags: ['Healthcare', 'DICOM', 'Wasm'],
    estimatedHours: 10.0,
    order: 1,
  },
  {
    id: 'task_novamed_202',
    projectId: 'proj_novamed',
    title: 'HIPAA Audit Trail Logger',
    description: 'Immutable cryptographically chained access log for all patient diagnostic lookups.',
    assignedMemberId: 'mem_3',
    assignedAgentId: 'risk_agent',
    priority: 'HIGH',
    status: 'DONE',
    deadline: '2026-09-08',
    dependencies: [],
    tags: ['Compliance', 'HIPAA', 'Security'],
    estimatedHours: 7.0,
    order: 2,
  },

  // AquaGrid Tasks
  {
    id: 'task_aquagrid_301',
    projectId: 'proj_aquagrid',
    title: 'Hydrodynamic Pressure Telemetry Stream',
    description: 'MQTT broker pipeline receiving sensor readings from 50 municipal pressure nodes.',
    assignedMemberId: 'mem_5',
    assignedAgentId: 'planning_agent',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    deadline: '2026-09-20',
    dependencies: [],
    tags: ['IoT', 'MQTT', 'Telemetry'],
    estimatedHours: 9.0,
    order: 1,
  },

  // RoadSense Tasks
  {
    id: 'task_roadsense_401',
    projectId: 'proj_roadsense',
    title: 'YOLOv11 Edge Quantization Matrix',
    description: 'INT8 quantization for real-time edge vehicle and pedestrian bounding box detection.',
    assignedMemberId: 'mem_2',
    assignedAgentId: 'qa_agent',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    deadline: '2026-09-28',
    dependencies: [],
    tags: ['Computer Vision', 'Edge AI', 'TensorRT'],
    estimatedHours: 14.0,
    order: 1,
  },

  // LEDGER Tasks
  {
    id: 'task_ledger_501',
    projectId: 'proj_ledger',
    title: 'Halo2 Recursive Proof Aggregation',
    description: 'Batch 1,000 asset transfer proofs into a single verifiable cryptographic root in <20ms.',
    assignedMemberId: 'mem_3',
    assignedAgentId: 'planning_agent',
    priority: 'CRITICAL',
    status: 'DONE',
    deadline: '2026-09-10',
    dependencies: [],
    tags: ['ZK-SNARK', 'Cryptography', 'FinTech'],
    estimatedHours: 16.0,
    order: 1,
  },

  // VERDANT Tasks
  {
    id: 'task_verdant_601',
    projectId: 'proj_verdant',
    title: 'NDVI Vegetation Index Shader',
    description: 'WebGL GPU pipeline for real-time false-color rendering of satellite agro-imagery.',
    assignedMemberId: 'mem_6',
    assignedAgentId: 'doc_agent',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    deadline: '2026-10-02',
    dependencies: [],
    tags: ['Satellite', 'WebGL', 'AgriTech'],
    estimatedHours: 8.0,
    order: 1,
  },

  // ECOPACK JUTE Tasks
  {
    id: 'task_ecopack_701',
    projectId: 'proj_ecopack',
    title: 'Tensile Stress Strain Matrix Model',
    description: 'Empirical database of tensile strength for jute polymer under varied thermal conditions.',
    assignedMemberId: 'mem_6',
    assignedAgentId: 'qa_agent',
    priority: 'HIGH',
    status: 'DONE',
    deadline: '2026-09-15',
    dependencies: [],
    tags: ['Material Science', 'Bio-Polymer'],
    estimatedHours: 11.0,
    order: 1,
  },

  // AXIOM Tasks
  {
    id: 'task_axiom_801',
    projectId: 'proj_axiom',
    title: 'Vector Similarity Semantic Routing Engine',
    description: 'HNSW index routing queries to specialized SLMs vs Frontier LLMs with 99.4% cache accuracy.',
    assignedMemberId: 'mem_1',
    assignedAgentId: 'pm_agent',
    priority: 'CRITICAL',
    status: 'DONE',
    deadline: '2026-09-04',
    dependencies: [],
    tags: ['LLM', 'Vector DB', 'Semantic Cache'],
    estimatedHours: 15.0,
    order: 1,
  },
];

export const INITIAL_RISKS: RiskItem[] = [
  {
    id: 'risk_innd_01',
    projectId: 'proj_innd',
    title: 'WebSocket Single-Point Contention on Threat Stream',
    description: 'High concurrency bursts of agent telemetry could overwhelm the unbuffered socket pipe during cyber assault simulations.',
    severity: 'HIGH',
    category: 'TECHNICAL',
    status: 'OPEN',
    impact: 'Increased client state synchronization latency >150ms.',
    mitigation: 'Implement Redis Pub/Sub multiplexing and client-side message batching.',
    identifiedBy: 'risk_agent',
    createdAt: '2026-08-30',
  },
  {
    id: 'risk_novamed_01',
    projectId: 'proj_novamed',
    title: 'DICOM Large Payload Memory Overhead',
    description: '3D volumetric scans exceeding 250MB could cause browser tab memory thrashing.',
    severity: 'CRITICAL',
    category: 'TECHNICAL',
    status: 'OPEN',
    impact: 'Client-side render crashes during complex multi-planar reconstructions.',
    mitigation: 'Implement chunked slice streaming and WebGPU texture compression.',
    identifiedBy: 'risk_agent',
    createdAt: '2026-08-29',
  },
  {
    id: 'risk_roadsense_01',
    projectId: 'proj_roadsense',
    title: 'Thermal Throttling on Municipal Gateways',
    description: 'Edge camera nodes in outdoor direct sunlight can experience 40% inference FPS drops.',
    severity: 'HIGH',
    category: 'EXTERNAL',
    status: 'OPEN',
    impact: 'Delayed vehicle hazard detection in peak afternoon heat.',
    mitigation: 'Dynamic model pruning and adaptive frame-rate downsampling under thermal alarms.',
    identifiedBy: 'risk_agent',
    createdAt: '2026-08-28',
  },
  {
    id: 'risk_ledger_01',
    projectId: 'proj_ledger',
    title: 'Zero-Knowledge Proof Verification Gas Spike',
    description: 'Ethereum L1 gas price surges could make on-chain proof verification economically unviable.',
    severity: 'MEDIUM',
    category: 'FINANCIAL',
    status: 'MITIGATED',
    impact: 'Delayed transaction finality during network congestion.',
    mitigation: 'Deploy rollup verification on Arbitrum and Base L2 contracts.',
    identifiedBy: 'risk_agent',
    createdAt: '2026-08-25',
  },
];

export const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: 'act_01',
    actor: { name: 'PM Agent', isAI: true, agentId: 'pm_agent' },
    action: 'Grounded Project Databases from Google Drive',
    entityName: 'All Missions Indexed',
    entityType: 'PROJECT',
    projectId: 'proj_innd',
    timestamp: 'Just now',
    details: 'Synchronized PRDs, Sprint matrices, and Architecture specs across all 9 canonical missions.',
    status: 'SUCCESS',
  },
  {
    id: 'act_02',
    actor: { name: 'Risk Agent', isAI: true, agentId: 'risk_agent' },
    action: 'Completed Vulnerability & Invariant Scan',
    entityName: 'System Health Check',
    entityType: 'RISK',
    projectId: 'proj_innd',
    timestamp: '5 mins ago',
    details: 'Verified DAG acyclicity and verified Google Workspace OAuth client security boundaries.',
    status: 'SUCCESS',
  },
];

export const INITIAL_MEETINGS: Meeting[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_AUTOMATIONS: AutomationItem[] = [];

// Complete, rich Project Database records for EACH mission
export const INITIAL_PROJECT_DATABASES: ProjectDatabaseRecord[] = [
  // 1. INNTELLIGENCE
  {
    id: 'db_innd_prd_01',
    projectId: 'proj_innd',
    title: 'INNtelligence — PRD & Threat Intelligence Architecture Spec v2.4',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    fileSize: '2.4 MB',
    lastSyncedAt: '2026-08-31 09:15:00',
    syncStatus: 'SYNCED',
    summary: 'Foundational PRD specifying autonomous multi-agent orchestration, DAG dependency threat containment algorithms, and sub-50ms signals telemetry invariants.',
    content: `# INNtelligence: Autonomous Defense Threat Intelligence & DAG Engine

## 1. Executive Mission & Scope
INNtelligence delivers an autonomous defense intelligence substrate where specialized AI agents (PM, Planning, Risk, Doc, QA) continuously monitor cyber threat indicators, resolve task bottlenecks, and synthesize real-time topological DAGs.

## 2. Core Functional Invariants
- **Real-Time Signals Telemetry Stream**: All threat state mutations MUST trigger WebSocket broadcasts with latency $\\tau < 50\\text{ms}$.
- **Topological Threat Sorting**: Task & threat dependency graphs MUST be acyclic ($G = (V, E)$ where $\\nexists \\text{ cycle}$).
- **Human-in-the-Loop Signoff**: Gated critical-path nodes require manual sign-off by the Defense Commander before automated execution.
- **Data Grounding Guarantee**: All agent reasoning and synthesized action items must strictly ground to the connected Project Database from Google Drive, Docs, and Sheets.

## 3. Technology Stack & Data Schemas
- Frontend: React 19, TypeScript, Tailwind CSS, Motion Animations.
- Real-Time Layer: Distributed Signals Event Bus with Redis Redlock mutexing.
- Grounding Source: Google Workspace APIs (Google Drive v3, Google Docs v1, Google Sheets v4).`,
    keyEntities: {
      requirements: [
        'Enforce sub-50ms WebSocket telemetry latency for threat streams.',
        'Acyclic DAG validation on threat containment task creation.',
        'Autonomous agent actions strictly grounded in Google Workspace documents.',
        'Human sign-off gates for high-risk defense path changes.',
      ],
      tasksExtracted: [
        'Deploy Redis Redlock mutex cluster',
        'Implement WebSocket Threat Streamer',
        'Integrate Google Drive Project Database sync',
      ],
      risksIdentified: [
        'Redis single-point contention on high-throughput bursts',
        'Stale Google Doc OAuth token expiration',
      ],
      architecturalConstraints: [
        'All client state backed by local persistence and synced to Google Drive.',
        'OAuth tokens stored client-side only via Google Identity Services.',
      ],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 98,
      tokenCount: 4200,
      lastAgentQueryAt: '2026-08-31 09:20:00',
    },
    tags: ['PRD', 'Threat Intel', 'Architecture', 'Google Doc', 'System Design'],
  },
  {
    id: 'db_innd_sheet_02',
    projectId: 'proj_innd',
    title: 'INNtelligence Master Sprint Deliverables & Threat Matrix',
    sourceType: 'GOOGLE_SHEET',
    category: 'SPRINT_DELIVERABLES',
    fileId: '1cAbCDefGHiJKLmnOPqrSTUVwxyz1234567890',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    webViewLink: 'https://docs.google.com/spreadsheets/d/1cAbCDefGHiJKLmnOPqrSTUVwxyz1234567890/edit',
    fileSize: '1.8 MB',
    lastSyncedAt: '2026-08-31 09:22:00',
    syncStatus: 'SYNCED',
    summary: 'Master Google Sheet mapping threat response sprint epics, work breakdown structure, assigned engineering roles, priorities, and hour estimations.',
    content: `| Task Code | Deliverable Work Item | Assigned Engineer / Specialist | Priority | Status | Est. Hours |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-101** | Core WebSocket Threat Streamer | Aman Kahar (Frontend specialist) | CRITICAL | IN_PROGRESS | 8.5h |
| **TSK-102** | Zero-Trust RBAC Policy Enforcement | Uttaran Adhikari (Cybersecurity) | HIGH | TODO | 6.0h |
| **TSK-103** | Distributed Signals Telemetry Aggregator | Samaksh Dey (Team Lead) | HIGH | DONE | 12.0h |
| **TSK-104** | Multi-Modal Research Benchmark | Arshia Bhattacharyya (Researcher) | MEDIUM | IN_PROGRESS | 5.0h |
| **TSK-105** | Live Operational Analytics Sink | Anushka Bandyopadhyay (Data Analytics) | HIGH | TODO | 7.5h |
| **TSK-106** | Autonomous Sentinel Stress Testing | Riti Mishra (Researcher) | HIGH | DONE | 4.0h |`,
    tableData: {
      sheetName: 'Threat_Master_Matrix',
      headers: ['Task Code', 'Deliverable Work Item', 'Assigned Specialist', 'Priority', 'Status', 'Est. Hours'],
      rows: [
        ['TSK-101', 'Core WebSocket Threat Streamer', 'Aman Kahar (Frontend specialist)', 'CRITICAL', 'IN_PROGRESS', '8.5h'],
        ['TSK-102', 'Zero-Trust RBAC Policy Enforcement', 'Uttaran Adhikari (Cybersecurity)', 'HIGH', 'TODO', '6.0h'],
        ['TSK-103', 'Distributed Signals Telemetry Aggregator', 'Samaksh Dey (Team Lead)', 'HIGH', 'DONE', '12.0h'],
        ['TSK-104', 'Multi-Modal Research Benchmark', 'Arshia Bhattacharyya (Researcher)', 'MEDIUM', 'IN_PROGRESS', '5.0h'],
        ['TSK-105', 'Live Operational Analytics Sink', 'Anushka Bandyopadhyay (Data Analytics)', 'HIGH', 'TODO', '7.5h'],
        ['TSK-106', 'Autonomous Sentinel Stress Testing', 'Riti Mishra (Researcher)', 'HIGH', 'DONE', '4.0h'],
      ],
    },
    keyEntities: {
      requirements: [
        'Team lead Samaksh Dey oversees signals telemetry and core integration.',
        'Aman Kahar executes frontend streaming components.',
        'Uttaran Adhikari guarantees cybersecurity compliance.',
      ],
      tasksExtracted: [
        'Core WebSocket Threat Streamer',
        'Zero-Trust RBAC Policy Enforcement',
        'Distributed Signals Telemetry Aggregator',
        'Multi-Modal Research Benchmark',
      ],
      risksIdentified: ['TSK-101 on critical path may bottleneck UI integration'],
      architecturalConstraints: ['Total sprint allocation capped at 43.0 engineering hours.'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 96,
      tokenCount: 2800,
      lastAgentQueryAt: '2026-08-31 09:25:00',
    },
    tags: ['Google Sheet', 'Sprint Backlog', 'WBS', 'Team Allocation'],
  },

  // 2. NOVAMED AI
  {
    id: 'db_novamed_prd_01',
    projectId: 'proj_novamed',
    title: 'NovaMed AI — Clinical Decision Support Substrate PRD v3.1',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1novamedDocFileID789ABCDEF0123456789',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1novamedDocFileID789ABCDEF0123456789/edit',
    fileSize: '3.1 MB',
    lastSyncedAt: '2026-08-31 09:30:00',
    syncStatus: 'SYNCED',
    summary: 'Clinical requirements and FDA SaMD Class II validation protocol for AI-assisted diagnostic triaging and DICOM volumetric segmentation.',
    content: `# NovaMed AI: Clinical Decision Support & Diagnostic Substrate

## 1. Clinical Objectives
NovaMed AI assists radiologists and oncologists with automated lesion detection, anatomical bounding, and confidence scoring.

## 2. Invariants & Regulatory Safeguards
- **Zero Hallucination Tolerance**: Diagnostic hypotheses must present explicit citations to grounded medical literature and DICOM pixel coordinate anchors.
- **HIPAA Audit Log**: Every pixel inference query is logged with SHA-256 cryptographic nonces.
- **DICOM Streaming**: Multi-planar reconstruction latency must stay below 100ms per 512x512 slice.`,
    keyEntities: {
      requirements: ['FDA Class II SaMD compliance', 'Sub-100ms DICOM slice streaming', 'Encrypted local FHIR cache'],
      tasksExtracted: ['Implement DICOM Wasm parser', 'Configure HIPAA cryptographic audit log'],
      risksIdentified: ['Large volumetric scan browser memory leaks'],
      architecturalConstraints: ['Zero plain-text patient health information in transit'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 99,
      tokenCount: 4800,
      lastAgentQueryAt: '2026-08-31 09:35:00',
    },
    tags: ['Clinical AI', 'Healthcare', 'PRD', 'HIPAA', 'Google Doc'],
  },
  {
    id: 'db_novamed_sheet_02',
    projectId: 'proj_novamed',
    title: 'NovaMed Clinical Trials & Validation Accuracy Matrix',
    sourceType: 'GOOGLE_SHEET',
    category: 'SPRINT_DELIVERABLES',
    fileId: '1novamedSheetMatrix9876543210ABCDEF',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    webViewLink: 'https://docs.google.com/spreadsheets/d/1novamedSheetMatrix9876543210ABCDEF/edit',
    fileSize: '2.1 MB',
    lastSyncedAt: '2026-08-31 09:32:00',
    syncStatus: 'SYNCED',
    summary: 'Sensitivity, specificity, and AUC-ROC validation metrics across 12 diagnostic hospital partner nodes.',
    content: `| Cohort ID | Anatomical Modality | Sample Size | Sensitivity (%) | Specificity (%) | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MED-A1** | Chest CT (Pulmonary) | 2,400 scans | 97.4% | 96.8% | 0.971 |
| **MED-B2** | Brain MRI (T1/T2 Axial) | 1,850 scans | 98.1% | 97.5% | 0.978 |
| **MED-C3** | Mammography (2D/3D) | 3,200 scans | 96.2% | 95.9% | 0.960 |
| **MED-D4** | Abdominal Ultrasound | 1,100 scans | 94.8% | 94.2% | 0.945 |`,
    tableData: {
      sheetName: 'Clinical_Trial_Metrics',
      headers: ['Cohort ID', 'Anatomical Modality', 'Sample Size', 'Sensitivity (%)', 'Specificity (%)', 'F1-Score'],
      rows: [
        ['MED-A1', 'Chest CT (Pulmonary)', '2,400 scans', '97.4%', '96.8%', '0.971'],
        ['MED-B2', 'Brain MRI (T1/T2 Axial)', '1,850 scans', '98.1%', '97.5%', '0.978'],
        ['MED-C3', 'Mammography (2D/3D)', '3,200 scans', '96.2%', '95.9%', '0.960'],
        ['MED-D4', 'Abdominal Ultrasound', '1,100 scans', '94.8%', '94.2%', '0.945'],
      ],
    },
    keyEntities: {
      requirements: ['Maintain >96% overall clinical sensitivity', 'Validate with external IRB-approved datasets'],
      tasksExtracted: ['Calibrate Brain MRI false-positive filter', 'Integrate ultrasound DICOM parser'],
      risksIdentified: ['Ultrasonic image speckle noise degradation'],
      architecturalConstraints: ['Models must execute in zero-retention inference mode'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 97,
      tokenCount: 3100,
      lastAgentQueryAt: '2026-08-31 09:36:00',
    },
    tags: ['Clinical Trials', 'Google Sheet', 'Validation', 'SaMD'],
  },

  // 3. AQUAGRID
  {
    id: 'db_aquagrid_prd_01',
    projectId: 'proj_aquagrid',
    title: 'AquaGrid — Smart Municipal Hydro-Telemetry & Leak Detection PRD',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1aquagridDocID000111222333444555',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1aquagridDocID000111222333444555/edit',
    fileSize: '1.9 MB',
    lastSyncedAt: '2026-08-31 09:40:00',
    syncStatus: 'SYNCED',
    summary: 'Technical architecture for distributed IoT flow sensors, predictive acoustic leak analysis, and hydraulic mesh routing.',
    content: `# AquaGrid: Municipal Smart Water Monitoring Engine

## 1. System Invariants
- **Real-Time Sampling**: Smart flow transducers sample pressure at 10Hz.
- **Acoustic Leak Triangulation**: Anomalous pressure differentials $\\Delta P > 0.4\\text{ bar}$ trigger automatic zone valve isolation recommendations within 12 seconds.
- **Low Power Profile**: IoT mesh battery life minimum 5 years using LoRaWAN.`,
    keyEntities: {
      requirements: ['10Hz pressure sampling rate', 'LoRaWAN Class A transceiver support', 'Automatic valve cutoff signals'],
      tasksExtracted: ['Deploy MQTT pressure ingestion bridge', 'Build acoustic FFT leak classifier'],
      risksIdentified: ['LoRaWAN packet loss during dense rainfall'],
      architecturalConstraints: ['Edge devices must buffer up to 48 hours of telemetry offline'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 95,
      tokenCount: 2600,
      lastAgentQueryAt: '2026-08-31 09:42:00',
    },
    tags: ['IoT', 'Smart Grid', 'CleanTech', 'PRD', 'Google Doc'],
  },
  {
    id: 'db_aquagrid_sheet_02',
    projectId: 'proj_aquagrid',
    title: 'AquaGrid Municipal Flow Sensor Deployment & Calibration Matrix',
    sourceType: 'GOOGLE_SHEET',
    category: 'SPRINT_DELIVERABLES',
    fileId: '1aquagridSheetID999888777666555',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    webViewLink: 'https://docs.google.com/spreadsheets/d/1aquagridSheetID999888777666555/edit',
    fileSize: '1.4 MB',
    lastSyncedAt: '2026-08-31 09:41:00',
    syncStatus: 'SYNCED',
    summary: 'Sensor node IDs, GPS coordinates, operating pressure ranges, and battery telemetry across Municipal Sector 4.',
    content: `| Node ID | Location / Pipe Intersection | Pressure (PSI) | Flow Rate (L/min) | Battery Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AQ-101** | North Sector Reservoir Main | 62.4 PSI | 1,420 L/min | 98% | NOMINAL |
| **AQ-102** | 5th Ave & Pine Distribution Hub | 58.1 PSI | 890 L/min | 94% | NOMINAL |
| **AQ-103** | East Industrial Park Junction | 44.2 PSI | 1,120 L/min | 89% | ANOMALY_LEAK |
| **AQ-104** | South Residential Loop A | 52.0 PSI | 450 L/min | 96% | NOMINAL |`,
    tableData: {
      sheetName: 'Sensor_Telemetry_Sector4',
      headers: ['Node ID', 'Location / Pipe Intersection', 'Pressure (PSI)', 'Flow Rate (L/min)', 'Battery Level', 'Status'],
      rows: [
        ['AQ-101', 'North Sector Reservoir Main', '62.4 PSI', '1,420 L/min', '98%', 'NOMINAL'],
        ['AQ-102', '5th Ave & Pine Distribution Hub', '58.1 PSI', '890 L/min', '94%', 'NOMINAL'],
        ['AQ-103', 'East Industrial Park Junction', '44.2 PSI', '1,120 L/min', '89%', 'ANOMALY_LEAK'],
        ['AQ-104', 'South Residential Loop A', '52.0 PSI', '450 L/min', '96%', 'NOMINAL'],
      ],
    },
    keyEntities: {
      requirements: ['Flag any pipe differential drop >10 PSI within 5 seconds'],
      tasksExtracted: ['Dispatch repair crew to Node AQ-103', 'Recalibrate North Sector pressure transducer'],
      risksIdentified: ['AQ-103 industrial leak severity escalating'],
      architecturalConstraints: ['Sync telemetry records to Google Sheets every 60 seconds'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 98,
      tokenCount: 2200,
      lastAgentQueryAt: '2026-08-31 09:43:00',
    },
    tags: ['Google Sheet', 'IoT', 'Telemetry', 'Sensor Grid'],
  },

  // 4. ROADSENSE
  {
    id: 'db_roadsense_prd_01',
    projectId: 'proj_roadsense',
    title: 'RoadSense — Autonomous Edge-Vision Traffic Sentinel PRD',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1roadsenseDocFileID1234567890ABC',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1roadsenseDocFileID1234567890ABC/edit',
    fileSize: '2.8 MB',
    lastSyncedAt: '2026-08-31 09:45:00',
    syncStatus: 'SYNCED',
    summary: 'PRD for edge neural processing units, pedestrian collision prevention algorithms, and adaptive green-wave light timing.',
    content: `# RoadSense: Edge-Vision Municipal Traffic Intelligence

## 1. System Mission
RoadSense converts existing city traffic cameras into real-time hazard detection sensors without streaming raw video to cloud servers.

## 2. Invariants
- **On-Device Anonymization**: Faces and license plates are blurred on hardware before embedding generation.
- **Inference Latency**: Hazard alerts MUST be broadcast via V2X radio in under 25ms.`,
    keyEntities: {
      requirements: ['Edge TensorRT inference <25ms', '100% on-device PII redaction', 'V2X SAE J2735 message standard'],
      tasksExtracted: ['Quantize YOLOv11 to TensorRT INT8', 'Benchmark V2X packet broadcast latency'],
      risksIdentified: ['Direct sunlight sensor saturation'],
      architecturalConstraints: ['No video frames leave local edge gateway storage'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 96,
      tokenCount: 3400,
      lastAgentQueryAt: '2026-08-31 09:47:00',
    },
    tags: ['Computer Vision', 'Edge AI', 'Smart City', 'PRD', 'Google Doc'],
  },

  // 5. LEDGER
  {
    id: 'db_ledger_prd_01',
    projectId: 'proj_ledger',
    title: 'LEDGER — High-Throughput Zero-Knowledge Settlement Protocol Spec',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1ledgerDocFileID999888777666',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1ledgerDocFileID999888777666/edit',
    fileSize: '3.5 MB',
    lastSyncedAt: '2026-08-31 09:50:00',
    syncStatus: 'SYNCED',
    summary: 'Cryptographic architecture specifying Halo2 recursive proof verification, multi-token liquidity pooling, and sub-second settlement.',
    content: `# LEDGER: Zero-Knowledge Multi-Asset Settlement

## 1. Cryptographic Invariants
- **Proof Aggregation**: Up to 1,000 transactions verified in a single ZK root.
- **Atomic Execution**: Cross-chain settlement occurs atomically or reverts fully.
- **Non-Custodial**: User balances secured by private cryptographic keypairs.`,
    keyEntities: {
      requirements: ['Sub-50ms prover time', 'Zero-knowledge balance concealment', 'Multi-chain EVM and SVM compatibility'],
      tasksExtracted: ['Optimize Halo2 polynomial commitment scheme', 'Run formal smart contract verification'],
      risksIdentified: ['L1 gas spikes during proof posting'],
      architecturalConstraints: ['Zero plain-text transaction amounts in public mempools'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 99,
      tokenCount: 4900,
      lastAgentQueryAt: '2026-08-31 09:52:00',
    },
    tags: ['FinTech', 'Zero Knowledge', 'Cryptography', 'PRD', 'Google Doc'],
  },

  // 6. VERDANT
  {
    id: 'db_verdant_prd_01',
    projectId: 'proj_verdant',
    title: 'VERDANT — Satellite Multi-Spectral Agro-Ecology Engine PRD',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1verdantDocFileID444555666777',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1verdantDocFileID444555666777/edit',
    fileSize: '2.2 MB',
    lastSyncedAt: '2026-08-31 09:55:00',
    syncStatus: 'SYNCED',
    summary: 'Satellite GIS raster processing for predictive nitrogen balance, NDVI spectral chlorophyll indexing, and carbon credit audits.',
    content: `# VERDANT: Satellite Agro-Ecology Platform

## 1. Core Invariants
- **Spectral Precision**: NDVI, EVI, and NDRE indices computed across 10m resolution Sentinel-2 bands.
- **Predictive Yield Forecast**: Multi-spectral machine learning estimates crop harvest yields with >92% accuracy 30 days in advance.`,
    keyEntities: {
      requirements: ['Sentinel-2 band 4/8 automated reflectance calibration', 'Automated carbon sequestration credit calculation'],
      tasksExtracted: ['Build WebGL NDVI false-color pipeline', 'Integrate weather radar precip forecasts'],
      risksIdentified: ['Cloud cover obstruction on tropical cropland'],
      architecturalConstraints: ['Raster geoTIFFs stored in cloud-optimized formats'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 95,
      tokenCount: 3100,
      lastAgentQueryAt: '2026-08-31 09:57:00',
    },
    tags: ['AgriTech', 'Satellite', 'GIS', 'Carbon Credits', 'PRD', 'Google Doc'],
  },

  // 7. ECOPACK JUTE
  {
    id: 'db_ecopack_prd_01',
    projectId: 'proj_ecopack',
    title: 'ECOPACK JUTE — Bio-Polymer Formulation & Supply Chain PRD',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1ecopackDocFileID111222333444',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1ecopackDocFileID111222333444/edit',
    fileSize: '1.7 MB',
    lastSyncedAt: '2026-08-31 10:00:00',
    syncStatus: 'SYNCED',
    summary: 'Specification of 100% marine-degradable jute-cellulose biocomposite polymers, tensile tensile tests, and commercial packaging supply chain.',
    content: `# ECOPACK JUTE: Sustainable Packaging Material

## 1. Material Invariants
- **Biodegradation**: Complete soil decomposition in 45 days under ambient conditions.
- **Tensile Strength**: Minimum 42 MPa tensile tolerance matching commercial low-density polyethylene (LDPE).`,
    keyEntities: {
      requirements: ['ASTM D6400 commercial compostability compliance', 'Water vapor transmission rate (WVTR) < 15 g/m2/day'],
      tasksExtracted: ['Perform tensile stress-strain test series', 'Log factory moisture barrier calibration'],
      risksIdentified: ['Raw jute fiber seasonal supply volatility'],
      architecturalConstraints: ['Lifecycle telemetry stored in tamper-evident traceability ledger'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 94,
      tokenCount: 2400,
      lastAgentQueryAt: '2026-08-31 10:02:00',
    },
    tags: ['Sustainability', 'Bio-Polymer', 'Circular Economy', 'PRD', 'Google Doc'],
  },

  // 8. AXIOM
  {
    id: 'db_axiom_prd_01',
    projectId: 'proj_axiom',
    title: 'AXIOM — Multi-Agent LLM Consensus & Semantic Routing Core PRD',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1axiomDocFileID777888999000',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1axiomDocFileID777888999000/edit',
    fileSize: '3.8 MB',
    lastSyncedAt: '2026-08-31 10:05:00',
    syncStatus: 'SYNCED',
    summary: 'Distributed multi-LLM consensus architecture with high-speed semantic embeddings caching and autonomous prompt safety firewalls.',
    content: `# AXIOM: Multi-Model Consensus & Intelligence Kernel

## 1. Architecture Invariants
- **Consensus Quorum**: Critical system operations require 3-of-5 model agreement (e.g. Gemini, Claude, GPT).
- **Sub-Millisecond Semantic Cache**: Repeated reasoning queries served from HNSW vector index in <2ms.
- **Safety Gate**: Zero jailbreak or adversarial prompt leakage allowed past the ingress firewall.`,
    keyEntities: {
      requirements: ['Sub-2ms semantic cache retrieval', '3-of-5 model consensus voting', 'Zero adversarial prompt bypass'],
      tasksExtracted: ['Implement vector semantic routing engine', 'Benchmark multi-LLM consensus latency'],
      risksIdentified: ['Model provider API rate limits during synchronous quorum'],
      architecturalConstraints: ['Tokens encrypted with AES-256 before vector indexing'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 99,
      tokenCount: 5200,
      lastAgentQueryAt: '2026-08-31 10:07:00',
    },
    tags: ['LLM', 'AI Consensus', 'Vector DB', 'PRD', 'Google Doc'],
  },

  // 9. NEBULA OS
  {
    id: 'db_nebula_prd_01',
    projectId: 'proj_nebula_os',
    title: 'Nebula OS — Interstellar Unified Operating System PRD v1.0',
    sourceType: 'GOOGLE_DOC',
    category: 'PRD_REQUIREMENTS',
    fileId: '1nebulaOSDocFileID999000111222',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1nebulaOSDocFileID999000111222/edit',
    fileSize: '4.2 MB',
    lastSyncedAt: '2026-08-31 10:10:00',
    syncStatus: 'SYNCED',
    summary: 'The master specification for the entire Nebula OS ecosystem: unifying all 9 hackathon missions, multi-agent sentinels, and live Google Workspace databases.',
    content: `# Nebula OS: Master Interstellar Operating System

## 1. Cosmic Architecture
Nebula OS manages the entire universe of hackathons and projects, providing an autonomous substrate for task orchestration, multi-agent automation, and Google Workspace database grounding.

## 2. Invariants
- **Multi-Project Isolation**: Each mission retains a dedicated workspace, database, task list, and risk register.
- **Fleet Collaboration**: 5 autonomous AI sentinels operate collaboratively across all project boundaries.`,
    keyEntities: {
      requirements: ['Dedicated page and database for every mission', 'Full Google Drive, Docs & Sheets integration', 'Sub-50ms reactive state transitions'],
      tasksExtracted: ['Maintain project state isolation', 'Broadcast live fleet telemetry'],
      risksIdentified: ['Cross-project state collision'],
      architecturalConstraints: ['Local persistence with automatic Google Drive replication'],
    },
    agentGrounding: {
      isGrounded: true,
      indexingScore: 100,
      tokenCount: 6000,
      lastAgentQueryAt: '2026-08-31 10:12:00',
    },
    tags: ['Core OS', 'PRD', 'Architecture', 'Google Doc', 'System Master'],
  },
];

export const INITIAL_TEAM_CHANNELS: TeamChannel[] = [
  {
    id: 'channel_nebula_main',
    name: 'nebula',
    displayName: 'Nebula Fleet',
    description: 'Samaksh, Aman, Uttaran, Arshia, Anushka, Riti',
    topic: 'Main Interstellar Operations & Hackathon Launch Comms',
    isGroup: true,
    avatar: '🌌',
    memberNames: ['Samaksh Dey', 'Aman Kahar', 'Uttaran Adhikari', 'Arshia Bhattacharyya', 'Anushka Bandyopadhyay', 'Riti Mishra'],
    unreadCount: 0,
    isVoiceActive: true,
  },
  {
    id: 'channel_ai_sentinels',
    name: 'ai-sentinels-uplink',
    displayName: 'AI Sentinels Uplink',
    description: 'Autonomous telemetry, risk alarms, and multi-agent synthesis streams',
    topic: 'Continuous neural sync between PM, Planning, Risk, QA, and Doc Sentinels',
    isGroup: true,
    avatar: '🤖',
    memberNames: ['PM Agent', 'Planning Agent', 'Risk Agent', 'Doc Agent', 'QA Agent', 'Samaksh Dey'],
    unreadCount: 0,
  },
  {
    id: 'channel_frontend_ops',
    name: 'frontend-canvas-ops',
    displayName: 'Frontend & UI/UX Ops',
    description: 'Cosmic shaders, waveform visualizers, and cyber glassmorphism design',
    topic: 'Interface polish & real-time responsiveness engineering',
    isGroup: true,
    avatar: '⚡',
    memberNames: ['Aman Kahar', 'Samaksh Dey'],
    unreadCount: 0,
  },
  {
    id: 'channel_cybersec_auth',
    name: 'cybersec-auth-stream',
    displayName: 'Security & OAuth Vault',
    description: 'Firestore security rules, OAuth token vaults, and Google Workspace scopes',
    topic: 'RBAC validation and token encryption telemetry',
    isGroup: true,
    avatar: '🛡️',
    memberNames: ['Uttaran Adhikari', 'Samaksh Dey'],
    unreadCount: 0,
  },
];

export const INITIAL_TEAM_MESSAGES: TeamChatMessage[] = [];



