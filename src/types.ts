/**
 * NEBULA OS — Core Type Definitions
 * Native organizational operating system for the Nebula Hackathon Team
 */

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'AT_RISK' | 'CRITICAL' | 'ARCHIVED';

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'NEEDS_ATTENTION';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskType = 'OVERDUE_TASK' | 'BLOCKED_DEPENDENCY' | 'MILESTONE_RISK' | 'CRITICAL_FAILURE';

export type AgentId = 'pm_agent' | 'planning_agent' | 'risk_agent' | 'doc_agent' | 'qa_agent';

export type AgentState = 'ACTIVE' | 'IDLE' | 'ANALYZING' | 'EXECUTING';

export type DocType = 'PRD' | 'ASD' | 'RESEARCH' | 'REPORTS' | 'ARCHITECTURE' | 'MEETING_NOTES' | 'LESSONS_LEARNED';

export type ViewMode = 
  | 'LANDING'
  | 'COMMAND_CENTER'
  | 'PORTFOLIO'
  | 'PROJECTS'
  | 'PROJECT_DATABASE'
  | 'KANBAN'
  | 'MILESTONES'
  | 'WORKFLOW'
  | 'TEAM_CHAT'
  | 'AI_COMMAND'
  | 'AI_AGENTS'
  | 'RISK_ENGINE'
  | 'ACTIVITY'
  | 'KNOWLEDGE_BASE'
  | 'MEETINGS'
  | 'SETTINGS';

export type WorkflowMode = 'AGENT_ORCHESTRATION' | 'TASK_DEPENDENCY_DAG' | 'MILESTONE_FLOW';

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  isAI?: boolean;
  agentId?: AgentId;
}

export interface Project {
  id: string;
  name: string;
  codename?: string;
  hackathon: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  health: ProjectHealth;
  healthStatus?: ProjectHealth;
  category?: string;
  deadline: string;
  createdAt: string;
  leadId: string;
  memberIds: string[];
  currentMilestoneId?: string;
  tags: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  // Celestial visualization attributes
  celestial: {
    color: string;
    glowColor: string;
    size: number; // orbital radius or planet size
    orbitRadius: number;
    orbitSpeed: number;
    angle: number;
    spectralClass: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assignedMemberId?: string;
  assignedAgentId?: AgentId;
  milestoneId?: string;
  deadline: string;
  createdAt?: string;
  completedAt?: string;
  dependencies: string[]; // Task IDs this task depends on
  estimatedHours?: number;
  tags?: string[];
  isBlocked?: boolean;
  blockReason?: string;
  order?: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  code?: string; // e.g. "M01", "M04"
  name: string;
  description: string;
  targetDate: string;
  progress: number; // 0 - 100
  status: 'PENDING' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED';
  taskIds?: string[];
  dependencies?: string[]; // Milestone IDs
  assignedMemberId?: string;
}

export interface AIAgent {
  id: AgentId;
  name: string;
  title: string;
  role?: string;
  avatar: string;
  state: AgentState;
  color: string;
  glowColor: string;
  description: string;
  capabilities?: string[];
  currentTask?: string;
  lastAction?: string;
  lastActiveProjectId?: string;
  lastActiveTime: string;
  stats: {
    actionsPerformed: number;
    tasksManaged: number;
    risksMitigated: number;
  };
}

export interface RiskItem {
  id: string;
  projectId: string;
  type?: RiskType;
  category?: string;
  impact?: string;
  mitigation?: string;
  identifiedBy?: string;
  title: string;
  description: string;
  severity: RiskLevel;
  status: 'OPEN' | 'ANALYZING' | 'MITIGATED' | 'DISMISSED';
  affectedTaskId?: string;
  affectedMilestoneId?: string;
  suggestedAction?: string;
  mitigationAction?: string;
  detectedAt?: string;
  createdAt?: string;
  resolvedAt?: string;
  assignedAgentId?: AgentId;
}

export interface ActivityLog {
  id: string;
  actor: {
    name: string;
    isAI: boolean;
    avatar?: string;
    agentId?: AgentId;
  };
  action: string;
  entityName: string;
  entityType: 'PROJECT' | 'TASK' | 'MILESTONE' | 'RISK' | 'AGENT' | 'MEETING' | 'DOC' | 'SYSTEM';
  projectId?: string;
  timestamp: string;
  details?: string;
  status?: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO';
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  hostId: string;
  meetLink: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  agenda: string[];
  attendeeIds: string[];
  packageGenerated: boolean;
  notesSummary?: string;
}

export interface DocumentItem {
  id: string;
  projectId: string;
  title: string;
  type?: DocType;
  category?: string;
  uploadedDate?: string;
  lastUpdated?: string;
  authorId?: string;
  status?: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';
  contentPreview?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  fileSize?: string;
  downloadUrl?: string;
}

export interface AutomationItem {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'ACTIVE' | 'PAUSED';
  lastRun?: string;
  runCount: number;
}

export interface WorkflowNodeData {
  id: string;
  type: 'PROJECT' | 'TASK' | 'MILESTONE' | 'AGENT' | 'RISK';
  title: string;
  status?: string;
  priority?: Priority;
  assignee?: string;
  progress?: number;
  health?: string;
  target?: string;
  severity?: RiskLevel;
  agentState?: AgentState;
  projectId?: string;
  entityId: string;
  x: number;
  y: number;
  details?: Record<string, any>;
}

export interface WorkflowEdgeData {
  id: string;
  source: string;
  target: string;
  type: 'ACTIVE' | 'COMPLETED' | 'WARNING' | 'RISK' | 'AGENT';
  label?: string;
  animated?: boolean;
}

export type DatabaseSourceType = 'GOOGLE_DOC' | 'GOOGLE_SHEET' | 'GOOGLE_DRIVE_FILE' | 'SCHEMA_SPEC';

export type DatabaseCategory =
  | 'PRD_REQUIREMENTS'
  | 'ARCHITECTURE_SPECS'
  | 'SPRINT_DELIVERABLES'
  | 'RISK_REGISTER'
  | 'API_SCHEMAS'
  | 'RESEARCH_DATA'
  | 'GENERAL';

export interface ProjectDatabaseRecord {
  id: string;
  projectId: string;
  title: string;
  sourceType: DatabaseSourceType;
  category: DatabaseCategory;
  fileId?: string;
  mimeType?: string;
  webViewLink?: string;
  iconLink?: string;
  fileSize?: string;
  lastSyncedAt: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'ERROR' | 'LOCAL_OVERRIDE';
  summary: string;
  content: string; // Plaintext or Markdown extracted
  tableData?: {
    sheetName?: string;
    headers: string[];
    rows: string[][];
  };
  keyEntities: {
    requirements?: string[];
    tasksExtracted?: string[];
    risksIdentified?: string[];
    architecturalConstraints?: string[];
  };
  agentGrounding: {
    isGrounded: boolean;
    indexingScore: number; // 0 - 100
    tokenCount: number;
    lastAgentQueryAt?: string;
  };
  tags: string[];
}

export interface GoogleWorkspaceAuthState {
  isConnected: boolean;
  accessToken?: string;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  expiresAt?: number;
  scopes: string[];
}

export interface FirebaseUserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export type ChatMessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system' | 'sticker';

export interface ChatMessageReplyTo {
  id: string;
  senderName: string;
  type: ChatMessageType;
  content: string;
  mediaDuration?: string;
  senderAvatar?: string;
}

export interface TeamChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  senderColor?: string; // Hex or Tailwind color class for sender name
  isUser: boolean;
  isAI?: boolean;
  timestamp: string; // e.g. "2:58 PM"
  dateCategory: string; // e.g. "Today", "Yesterday", "Aug 31, 2026"
  createdAtMs: number;
  type: ChatMessageType;
  content: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaDuration?: string; // e.g. "0:13", "0:21"
  mediaSize?: string;
  audioWaveform?: number[];
  replyTo?: ChatMessageReplyTo;
  mentions?: string[]; // e.g. ['all', 'Aman Kahar']
  reactions?: Record<string, number>; // e.g. { '❤️': 3, '👍': 2, '🗿': 1 }
  userReacted?: string[]; // list of emojis current user reacted with
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  pinned?: boolean;
}

export interface TeamChannel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  isGroup: boolean;
  memberNames: string[];
  avatar?: string;
  unreadCount?: number;
  topic?: string;
  isVoiceActive?: boolean;
}


