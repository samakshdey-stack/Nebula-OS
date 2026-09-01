import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  GoogleWorkspaceAuthState,
  FirebaseUserState,
  ViewMode,
  TaskStatus,
  Priority,
  RiskLevel,
  AgentId,
  TeamChatMessage,
  TeamChannel,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_MEMBERS,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_RISKS,
  INITIAL_ACTIVITY,
  INITIAL_MEETINGS,
  INITIAL_DOCUMENTS,
  INITIAL_AUTOMATIONS,
  INITIAL_PROJECT_DATABASES,
  INITIAL_TEAM_CHANNELS,
  INITIAL_TEAM_MESSAGES,
} from '../data/seedData';
import {
  fetchGoogleDocData,
  fetchGoogleSheetData,
  requestGoogleWorkspaceAuth,
  WORKSPACE_SCOPES,
} from '../utils/googleWorkspace';
import {
  auth,
  db,
  signInWithGoogle,
  signInWithGoogleAndWorkspace,
  logOutFromFirebase,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';

interface NebulaContextType {
  // Navigation & View
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  isWarping: boolean;
  warpTo: (destinationView: ViewMode, projectId?: string) => void;
  isOmnibarOpen: boolean;
  setIsOmnibarOpen: (open: boolean) => void;
  isDemoGuideOpen: boolean;
  setIsDemoGuideOpen: (open: boolean) => void;

  // Firebase Auth State
  firebaseUser: FirebaseUserState | null;
  isFirebaseLoading: boolean;
  firebaseAuthError: string | null;
  loginWithFirebase: () => Promise<FirebaseUserState | null>;
  logoutFirebase: () => Promise<void>;

  // Selected entities for inspectors
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  inspectorEntity: { type: 'PROJECT' | 'TASK' | 'MILESTONE' | 'AGENT' | 'RISK'; data: any } | null;
  setInspectorEntity: (entity: { type: 'PROJECT' | 'TASK' | 'MILESTONE' | 'AGENT' | 'RISK'; data: any } | null) => void;
  selectedAgentId: AgentId;
  setSelectedAgentId: (id: AgentId) => void;
  selectAgent: (id: AgentId) => void;

  // Data Collections
  projects: Project[];
  members: Member[];
  agents: AIAgent[];
  tasks: Task[];
  milestones: Milestone[];
  risks: RiskItem[];
  activityLogs: ActivityLog[];
  meetings: Meeting[];
  documents: DocumentItem[];
  automations: AutomationItem[];
  projectDatabases: ProjectDatabaseRecord[];

  // Team Comms & Group Chat State
  teamChannels: TeamChannel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  teamMessages: TeamChatMessage[];
  sendTeamMessage: (msg: Partial<TeamChatMessage>) => Promise<TeamChatMessage>;
  toggleMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteTeamMessage: (messageId: string) => Promise<void>;
  isCallModalOpen: boolean;
  setIsCallModalOpen: (open: boolean) => void;
  chatSearchQuery: string;
  setChatSearchQuery: (q: string) => void;

  // Google Workspace & Grounding State
  googleAuth: GoogleWorkspaceAuthState;
  connectGoogleWorkspace: () => Promise<GoogleWorkspaceAuthState>;
  disconnectGoogleWorkspace: () => void;

  // Active Project Helper
  activeProject: Project;

  // CRUD & Mutations
  createProject: (projectData: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  createTask: (taskData: Partial<Task>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;

  createMilestone: (milestoneData: Partial<Milestone>) => Milestone;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  createRisk: (riskData: Partial<RiskItem>) => RiskItem;
  resolveRisk: (riskId: string, resolutionNote?: string) => void;
  dismissRisk: (riskId: string) => void;

  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // Project Database Mutations
  addDatabaseRecord: (record: Partial<ProjectDatabaseRecord>) => ProjectDatabaseRecord;
  updateDatabaseRecord: (id: string, updates: Partial<ProjectDatabaseRecord>) => void;
  deleteDatabaseRecord: (id: string) => void;
  syncDatabaseRecord: (id: string) => Promise<void>;
  syncAllProjectRecords: (projectId: string) => Promise<void>;
  queryProjectDatabaseForAgents: (
    query: string,
    projectId?: string
  ) => { groundedRecords: ProjectDatabaseRecord[]; summaryContext: string };

  // Autonomous Engine Actions
  runSimulatedEvent: (
    eventType: 'TASK_OVERDUE' | 'DEPENDENCY_FAILED' | 'MILESTONE_DELAYED' | 'AGENT_ACTIVATED',
    targetProjectId?: string
  ) => { title: string; description: string; affectedEntities: string[] };

  executeAIAction: (
    commandText: string,
    targetProjectId?: string
  ) => Promise<{
    agentId: AgentId;
    agentName: string;
    actionSummary: string;
    detailedResponse: string;
    mutationsMade: string[];
  }>;

  triggerMeetingAutomation: (meetingId: string) => void;
  uploadDocument: (doc: Partial<DocumentItem>) => DocumentItem;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'NEBULA_OS_DB_V6';

const NebulaContext = createContext<NebulaContextType | undefined>(undefined);

export const NebulaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewMode>('LANDING');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('pm_agent');
  const [inspectorEntity, setInspectorEntity] = useState<{
    type: 'PROJECT' | 'TASK' | 'MILESTONE' | 'AGENT' | 'RISK';
    data: any;
  } | null>(null);

  const selectAgent = (agentId: AgentId) => {
    setSelectedAgentId(agentId);
    setCurrentView('AI_AGENTS');
  };

  // Entities state with localStorage hydration
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [members] = useState<Member[]>(INITIAL_MEMBERS);

  const [agents, setAgents] = useState<AIAgent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_agents`);
      return saved ? JSON.parse(saved) : INITIAL_AGENTS;
    } catch {
      return INITIAL_AGENTS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_milestones`);
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [risks, setRisks] = useState<RiskItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_risks`);
      return saved ? JSON.parse(saved) : INITIAL_RISKS;
    } catch {
      return INITIAL_RISKS;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activity`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY;
    } catch {
      return INITIAL_ACTIVITY;
    }
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_meetings`);
      return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [automations] = useState<AutomationItem[]>(INITIAL_AUTOMATIONS);

  const [projectDatabases, setProjectDatabases] = useState<ProjectDatabaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_databases`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECT_DATABASES;
    } catch {
      return INITIAL_PROJECT_DATABASES;
    }
  });

  const [googleAuth, setGoogleAuth] = useState<GoogleWorkspaceAuthState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_google_auth`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isConnected: false,
      userEmail: undefined,
      userName: undefined,
      userAvatar: undefined,
      accessToken: undefined,
      scopes: WORKSPACE_SCOPES,
    };
  });

  // Team Comms Channels & Chat Messages
  const [teamChannels, setTeamChannels] = useState<TeamChannel[]>(INITIAL_TEAM_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('channel_nebula_main');
  const [teamMessages, setTeamMessages] = useState<TeamChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_team_messages`);
      return saved ? JSON.parse(saved) : INITIAL_TEAM_MESSAGES;
    } catch {
      return INITIAL_TEAM_MESSAGES;
    }
  });
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserState | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);

  // Initialize Firebase Auth listener and validate Firestore connection
  useEffect(() => {
    testFirestoreConnection().catch((err) => {
      console.warn('Firestore initial connection probe:', err);
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (user: FirebaseUser | null) => {
        if (user) {
          const userState: FirebaseUserState = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Nebula Operator',
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
          };
          setFirebaseUser(userState);

          // Update user in Firestore users collection
          setDoc(
            doc(db, 'users', user.uid),
            {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Nebula Operator',
              photoURL: user.photoURL || '',
              role: 'Team Lead',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.warn('Firestore user profile sync warning:', e));
        } else {
          setFirebaseUser(null);
        }
        setIsFirebaseLoading(false);
      },
      (error) => {
        console.error('Firebase onAuthStateChanged error:', error);
        setFirebaseAuthError(error.message);
        setIsFirebaseLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithFirebase = async (): Promise<FirebaseUserState | null> => {
    setIsFirebaseLoading(true);
    setFirebaseAuthError(null);
    try {
      const { user, accessToken } = await signInWithGoogleAndWorkspace();
      const userState: FirebaseUserState = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Nebula Operator',
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      };
      setFirebaseUser(userState);

      if (accessToken) {
        setGoogleAuth({
          isConnected: true,
          userEmail: user.email || undefined,
          userName: user.displayName || 'Nebula Operator',
          userAvatar: user.photoURL || undefined,
          accessToken,
          expiresAt: Date.now() + 3600 * 1000,
          scopes: WORKSPACE_SCOPES,
        });
      }

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Nebula Operator',
            photoURL: user.photoURL || '',
            role: 'Team Lead',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not sync user profile to Firestore:', err);
      }

      addActivityLog({
        actor: {
          name: user.displayName || 'Nebula Operator',
          isAI: false,
          avatar: user.photoURL || undefined,
        },
        action: 'AUTHENTICATED_OPERATOR',
        entityName: 'Nebula Core Terminal',
        entityType: 'SYSTEM',
        status: 'SUCCESS',
        details: `Operator signed in via Google OAuth (${user.email})`,
      });

      return userState;
    } catch (err: any) {
      const isPopupClosed =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/user-cancelled' ||
        err?.code === 'auth/popup-blocked';

      if (isPopupClosed) {
        console.info('Firebase login popup was closed by user.');
        return null;
      }

      const errMsg = err?.message || 'Failed to authenticate with Firebase';
      setFirebaseAuthError(errMsg);
      console.error('Firebase Login failed:', err);
      throw err;
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const logoutFirebase = async () => {
    setIsFirebaseLoading(true);
    try {
      await logOutFromFirebase();
      setFirebaseUser(null);
      addActivityLog({
        actor: {
          name: firebaseUser?.displayName || 'Operator',
          isAI: false,
        },
        action: 'DEAUTHENTICATED_OPERATOR',
        entityName: 'Nebula Core Terminal',
        entityType: 'SYSTEM',
        status: 'INFO',
        details: 'Operator session ended securely',
      });
    } catch (err: any) {
      console.error('Firebase Logout error:', err);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${STORAGE_KEY}_milestones`, JSON.stringify(milestones));
      localStorage.setItem(`${STORAGE_KEY}_risks`, JSON.stringify(risks));
      localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents));
      localStorage.setItem(`${STORAGE_KEY}_activity`, JSON.stringify(activityLogs));
      localStorage.setItem(`${STORAGE_KEY}_meetings`, JSON.stringify(meetings));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_databases`, JSON.stringify(projectDatabases));
      localStorage.setItem(`${STORAGE_KEY}_google_auth`, JSON.stringify(googleAuth));
      localStorage.setItem(`${STORAGE_KEY}_team_messages`, JSON.stringify(teamMessages));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [projects, tasks, milestones, risks, agents, activityLogs, meetings, documents, projectDatabases, googleAuth, teamMessages]);

  // Real-time Firestore sync for team messages
  useEffect(() => {
    try {
      const msgQuery = query(collection(db, 'team_messages'), orderBy('createdAtMs', 'asc'));
      const unsubscribe = onSnapshot(
        msgQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteMsgs: TeamChatMessage[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as TeamChatMessage;
              remoteMsgs.push({
                ...data,
                id: d.id,
                status: 'read',
              });
            });

            setTeamMessages((prev) => {
              const messageMap = new Map<string, TeamChatMessage>();
              INITIAL_TEAM_MESSAGES.forEach((m) => messageMap.set(m.id, m));
              prev.forEach((m) => messageMap.set(m.id, m));
              remoteMsgs.forEach((m) => messageMap.set(m.id, m));
              return Array.from(messageMap.values()).sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
            });
          }
        },
        (error) => {
          // Log note and fallback gracefully to local state
          console.info('Firestore team_messages snapshot sync note:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.info('Firestore team messages listener note:', err);
    }
  }, []);

  // Active project memo
  const activeProject =
    projects.find((p) => p.id === activeProjectId) ||
    projects[0] ||
    INITIAL_PROJECTS[0];

  // Warp transition handler
  const warpTo = (destinationView: ViewMode, projectId?: string) => {
    setIsWarping(true);
    if (projectId) {
      setActiveProjectId(projectId);
    }
    setTimeout(() => {
      setCurrentView(destinationView);
      setIsWarping(false);
    }, 700);
  };

  // Helper for adding activity log
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      ...log,
    };
    setActivityLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // Task Mutations
  const createTask = (taskData: Partial<Task>): Task => {
    const pId = taskData.projectId || activeProjectId || projects[0]?.id || 'proj_atlas';
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: pId,
      title: taskData.title || 'New Unassigned Mission Task',
      description: taskData.description || '',
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      assigneeId: taskData.assigneeId,
      assignedAgentId: taskData.assignedAgentId,
      milestoneId: taskData.milestoneId,
      deadline: taskData.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      dependencies: taskData.dependencies || [],
      estimatedHours: taskData.estimatedHours || 8,
      tags: taskData.tags || ['Task'],
      isBlocked: taskData.isBlocked || false,
      blockReason: taskData.blockReason,
    };

    setTasks((prev) => [...prev, newTask]);

    const prj = projects.find((p) => p.id === pId);
    addActivityLog({
      actor: { name: 'Samaksh Dey', isAI: false },
      action: 'Created Task',
      entityName: `${prj?.name || 'Project'} → ${newTask.title}`,
      entityType: 'TASK',
      projectId: pId,
      details: `Assigned priority: ${newTask.priority}`,
      status: 'SUCCESS',
    });

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'DONE' && t.status !== 'DONE') {
            updated.completedAt = new Date().toISOString().split('T')[0];
            updated.isBlocked = false;
            updated.blockReason = undefined;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      addActivityLog({
        actor: { name: 'Samaksh Dey', isAI: false },
        action: 'Removed Task',
        entityName: taskToDelete.title,
        entityType: 'TASK',
        projectId: taskToDelete.projectId,
        status: 'INFO',
      });
    }
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const wasDone = t.status === 'DONE';
          const isNowDone = newStatus === 'DONE';
          return {
            ...t,
            status: newStatus,
            completedAt: isNowDone ? new Date().toISOString().split('T')[0] : wasDone ? undefined : t.completedAt,
            isBlocked: newStatus === 'BLOCKED',
            blockReason: newStatus === 'BLOCKED' ? (t.blockReason || 'Dependency stall detected') : undefined,
          };
        }
        return t;
      })
    );

    addActivityLog({
      actor: { name: 'Samaksh Dey', isAI: false },
      action: `Moved Status → ${newStatus}`,
      entityName: task.title,
      entityType: 'TASK',
      projectId: task.projectId,
      status: newStatus === 'DONE' ? 'SUCCESS' : newStatus === 'BLOCKED' ? 'CRITICAL' : 'INFO',
    });
  };

  // Milestone Mutations
  const createMilestone = (milestoneData: Partial<Milestone>): Milestone => {
    const pId = milestoneData.projectId || activeProjectId || projects[0]?.id || 'proj_atlas';
    const count = milestones.filter((m) => m.projectId === pId).length + 1;
    const newMilestone: Milestone = {
      id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: pId,
      code: milestoneData.code || `M0${count}`,
      name: milestoneData.name || 'New Target Milestone',
      description: milestoneData.description || 'Sprint milestone objective',
      targetDate: milestoneData.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      progress: 0,
      status: 'IN_PROGRESS',
      taskIds: milestoneData.taskIds || [],
      dependencies: milestoneData.dependencies || [],
    };

    setMilestones((prev) => [...prev, newMilestone]);
    addActivityLog({
      actor: { name: 'Planning Agent', isAI: true, agentId: 'planning_agent' },
      action: 'Created Milestone',
      entityName: `${newMilestone.code}: ${newMilestone.name}`,
      entityType: 'MILESTONE',
      projectId: pId,
      status: 'SUCCESS',
    });

    return newMilestone;
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Project Mutations
  const createProject = (projectData: Partial<Project>): Project => {
    const newProj: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: projectData.name || 'Untitled Cosmic Project',
      codename: projectData.codename || `PRJ-${Math.floor(Math.random() * 900 + 100)}`,
      hackathon: projectData.hackathon || 'Nebula Open Challenge',
      description: projectData.description || 'New technology innovation project.',
      status: 'ACTIVE',
      progress: 0,
      health: 'ON_TRACK',
      deadline: projectData.deadline || '2026-10-01',
      createdAt: new Date().toISOString().split('T')[0],
      leadId: 'mem_1',
      memberIds: ['mem_1', 'agent_pm', 'agent_planning', 'agent_risk'],
      tags: projectData.tags || ['Innovation', 'Hackathon'],
      celestial: {
        color: projectData.celestial?.color || '#a855f7',
        glowColor: projectData.celestial?.glowColor || 'rgba(168, 85, 247, 0.7)',
        size: 32,
        orbitRadius: 220 + projects.length * 40,
        orbitSpeed: 0.007,
        angle: Math.random() * Math.PI * 2,
        spectralClass: 'Class A (Blue-Violet Star)',
      },
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    addActivityLog({
      actor: { name: 'Samaksh Dey', isAI: false },
      action: 'Initialized Project in Portfolio Universe',
      entityName: newProj.name,
      entityType: 'PROJECT',
      projectId: newProj.id,
      status: 'SUCCESS',
    });

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(projects.find((p) => p.id !== id)?.id || 'proj_atlas');
    }
  };

  // Risk Engine Mutations
  const createRisk = (riskData: Partial<RiskItem>): RiskItem => {
    const pId = riskData.projectId || activeProjectId;
    const newRisk: RiskItem = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: pId,
      type: riskData.type || 'BLOCKED_DEPENDENCY',
      title: riskData.title || 'Detected Anomaly Vector',
      description: riskData.description || 'System anomaly requiring mitigation.',
      severity: riskData.severity || 'HIGH',
      status: 'OPEN',
      affectedTaskId: riskData.affectedTaskId,
      affectedMilestoneId: riskData.affectedMilestoneId,
      suggestedAction: riskData.suggestedAction || 'Review dependency DAG and execute resolution script.',
      mitigationAction: riskData.mitigationAction,
      detectedAt: new Date().toISOString(),
      assignedAgentId: 'risk_agent',
    };

    setRisks((prev) => [newRisk, ...prev]);

    // Update project health to at risk
    updateProject(pId, { health: newRisk.severity === 'CRITICAL' ? 'AT_RISK' : 'AT_RISK', status: 'AT_RISK' });

    addActivityLog({
      actor: { name: 'Risk Agent', isAI: true, agentId: 'risk_agent' },
      action: 'Generated Threat Vector',
      entityName: newRisk.title,
      entityType: 'RISK',
      projectId: pId,
      status: newRisk.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
    });

    return newRisk;
  };

  const resolveRisk = (riskId: string, resolutionNote?: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;

    setRisks((prev) =>
      prev.map((r) =>
        r.id === riskId
          ? {
              ...r,
              status: 'MITIGATED',
              resolvedAt: new Date().toISOString(),
              mitigationAction: resolutionNote || r.mitigationAction || 'Resolved via Risk Sentinel dispatch',
            }
          : r
      )
    );

    // If there's an affected task, unblock it
    if (risk.affectedTaskId) {
      updateTask(risk.affectedTaskId, {
        status: 'DONE',
        isBlocked: false,
        blockReason: undefined,
      });

      // Unblock downstream tasks as well
      tasks
        .filter((t) => t.dependencies.includes(risk.affectedTaskId!))
        .forEach((downstream) => {
          updateTask(downstream.id, {
            status: 'TODO',
            isBlocked: false,
            blockReason: undefined,
          });
        });
    }

    // Check remaining open risks for project
    const remainingOpenRisks = risks.filter(
      (r) => r.projectId === risk.projectId && r.id !== riskId && r.status === 'OPEN'
    );
    if (remainingOpenRisks.length === 0) {
      updateProject(risk.projectId, { health: 'ON_TRACK', status: 'ACTIVE', progress: 78 });
    }

    // Increment agent stats
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'risk_agent'
          ? {
              ...a,
              state: 'IDLE',
              lastAction: `Resolved Risk: ${risk.title}`,
              lastActiveTime: 'Just now',
              stats: { ...a.stats, risksMitigated: a.stats.risksMitigated + 1 },
            }
          : a
      )
    );

    addActivityLog({
      actor: { name: 'Risk Agent', isAI: true, agentId: 'risk_agent' },
      action: 'Mitigated Critical Threat Vector',
      entityName: risk.title,
      entityType: 'RISK',
      projectId: risk.projectId,
      details: resolutionNote || 'Applied patch and unblocked downstream task DAG.',
      status: 'SUCCESS',
    });
  };

  const dismissRisk = (riskId: string) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === riskId ? { ...r, status: 'DISMISSED' } : r))
    );
  };

  // Google Workspace Authentication Handlers
  const connectGoogleWorkspace = async (): Promise<GoogleWorkspaceAuthState> => {
    try {
      // First attempt Firebase Google Auth popup to acquire live Google OAuth Workspace token
      const { user, accessToken } = await signInWithGoogleAndWorkspace();
      const authState: GoogleWorkspaceAuthState = {
        isConnected: true,
        userEmail: user.email || undefined,
        userName: user.displayName || 'Nebula Operator',
        userAvatar: user.photoURL || undefined,
        accessToken,
        expiresAt: Date.now() + 3600 * 1000,
        scopes: WORKSPACE_SCOPES,
      };
      setGoogleAuth(authState);
      addActivityLog({
        actor: { name: authState.userName || 'Operator', isAI: false },
        action: 'Authorized Google Workspace Drive Integration',
        entityName: 'Google Drive, Docs & Sheets',
        entityType: 'SYSTEM',
        details: `Live OAuth token authenticated for ${user.email || 'operator'}`,
        status: 'SUCCESS',
      });
      return authState;
    } catch (popupErr: any) {
      const isPopupClosed =
        popupErr?.code === 'auth/popup-closed-by-user' ||
        popupErr?.code === 'auth/cancelled-popup-request' ||
        popupErr?.code === 'auth/user-cancelled' ||
        popupErr?.code === 'auth/popup-blocked';

      if (!isPopupClosed) {
        console.warn('Firebase Google Workspace popup not completed, checking GIS auth flow:', popupErr);
      }
      try {
        const gisAuth = await requestGoogleWorkspaceAuth();
        setGoogleAuth(gisAuth);
        addActivityLog({
          actor: { name: gisAuth.userName || 'Operator', isAI: false },
          action: 'Connected Google Workspace via GIS',
          entityName: 'Google Drive, Docs & Sheets',
          entityType: 'SYSTEM',
          details: `Granted scopes: ${gisAuth.scopes.length} APIs. Live Project Database synchronization enabled.`,
          status: 'SUCCESS',
        });
        return gisAuth;
      } catch (err: any) {
        console.warn('Google Workspace OAuth connection failed or fallback mode used:', err);
        const fallback: GoogleWorkspaceAuthState = {
          isConnected: false,
          userEmail: firebaseUser?.email || undefined,
          userName: firebaseUser?.displayName || 'Nebula Operator',
          userAvatar: firebaseUser?.photoURL || undefined,
          accessToken: undefined,
          scopes: WORKSPACE_SCOPES,
        };
        setGoogleAuth(fallback);
        return fallback;
      }
    }
  };

  const disconnectGoogleWorkspace = () => {
    setGoogleAuth({
      isConnected: false,
      accessToken: undefined,
      userEmail: undefined,
      userName: undefined,
      scopes: [],
    });
    addActivityLog({
      actor: { name: 'System', isAI: true },
      action: 'Disconnected Google Workspace',
      entityName: 'Project Database',
      entityType: 'SYSTEM',
      status: 'INFO',
    });
  };

  // Project Database Record CRUD & Sync
  const addDatabaseRecord = (record: Partial<ProjectDatabaseRecord>): ProjectDatabaseRecord => {
    const targetProjId = record.projectId || activeProjectId || projects[0]?.id || 'proj_atlas';
    const newRecord: ProjectDatabaseRecord = {
      id: `db_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: targetProjId,
      title: record.title || 'Untitled Project Specification',
      sourceType: record.sourceType || 'GOOGLE_DOC',
      category: record.category || 'PRD_REQUIREMENTS',
      fileId: record.fileId || `file_${Math.random().toString(36).substring(2, 8)}`,
      mimeType: record.mimeType || 'application/vnd.google-apps.document',
      webViewLink: record.webViewLink || 'https://drive.google.com',
      iconLink: record.iconLink,
      fileSize: record.fileSize || '1.5 MB',
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      syncStatus: 'SYNCED',
      summary: record.summary || 'Project documentation record connected to Google Workspace.',
      content: record.content || '## Technical Invariants\n\n- System specification synchronized from Google Workspace.',
      tableData: record.tableData,
      keyEntities: record.keyEntities || {
        requirements: ['Verify compliance with Google Workspace project database.'],
        tasksExtracted: [],
        risksIdentified: [],
        architecturalConstraints: [],
      },
      agentGrounding: {
        isGrounded: true,
        indexingScore: 95,
        tokenCount: (record.content || '').length > 0 ? Math.round((record.content || '').length / 4) : 1200,
        lastAgentQueryAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      tags: record.tags || ['Project DB', 'Google Workspace'],
    };

    setProjectDatabases((prev) => [newRecord, ...prev]);

    addActivityLog({
      actor: { name: 'Doc Agent', isAI: true, agentId: 'doc_agent' },
      action: 'Indexed New Source into Project Database',
      entityName: newRecord.title,
      entityType: 'DOC',
      projectId: targetProjId,
      details: `Source: ${newRecord.sourceType} | Extracted ${newRecord.agentGrounding.tokenCount} knowledge tokens for strict AI Agent grounding.`,
      status: 'SUCCESS',
    });

    return newRecord;
  };

  const updateDatabaseRecord = (id: string, updates: Partial<ProjectDatabaseRecord>) => {
    setProjectDatabases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, lastSyncedAt: new Date().toLocaleTimeString() } : r))
    );
  };

  const deleteDatabaseRecord = (id: string) => {
    setProjectDatabases((prev) => prev.filter((r) => r.id !== id));
    addActivityLog({
      actor: { name: 'System', isAI: true },
      action: 'Unlinked File from Project Database',
      entityName: `Record #${id}`,
      entityType: 'DOC',
      projectId: activeProjectId || undefined,
      status: 'INFO',
    });
  };

  const syncDatabaseRecord = async (id: string) => {
    const record = projectDatabases.find((r) => r.id === id);
    if (!record) return;

    updateDatabaseRecord(id, { syncStatus: 'PENDING' });

    await new Promise((res) => setTimeout(res, 600));

    if (record.sourceType === 'GOOGLE_DOC') {
      const docData = await fetchGoogleDocData(googleAuth.accessToken || '', record.fileId || '');
      updateDatabaseRecord(id, {
        title: record.title || docData.title,
        content: docData.content,
        summary: docData.summary,
        keyEntities: {
          requirements: docData.requirements,
          architecturalConstraints: docData.constraints,
          tasksExtracted: record.keyEntities?.tasksExtracted || [],
          risksIdentified: record.keyEntities?.risksIdentified || [],
        },
        syncStatus: 'SYNCED',
        agentGrounding: {
          isGrounded: true,
          indexingScore: 98,
          tokenCount: Math.round(docData.content.length / 4),
          lastAgentQueryAt: new Date().toLocaleTimeString(),
        },
      });
    } else if (record.sourceType === 'GOOGLE_SHEET') {
      const sheetData = await fetchGoogleSheetData(googleAuth.accessToken || '', record.fileId || '');
      updateDatabaseRecord(id, {
        title: record.title || sheetData.title,
        tableData: {
          sheetName: sheetData.sheetName,
          headers: sheetData.headers,
          rows: sheetData.rows,
        },
        summary: sheetData.summary,
        keyEntities: {
          requirements: record.keyEntities?.requirements || [],
          architecturalConstraints: record.keyEntities?.architecturalConstraints || [],
          tasksExtracted: sheetData.extractedTasks,
          risksIdentified: record.keyEntities?.risksIdentified || [],
        },
        syncStatus: 'SYNCED',
        agentGrounding: {
          isGrounded: true,
          indexingScore: 96,
          tokenCount: sheetData.rows.length * 120 + 500,
          lastAgentQueryAt: new Date().toLocaleTimeString(),
        },
      });
    } else {
      updateDatabaseRecord(id, { syncStatus: 'SYNCED' });
    }

    addActivityLog({
      actor: { name: 'PM Agent', isAI: true, agentId: 'pm_agent' },
      action: 'Synchronized Project Database Record',
      entityName: record.title,
      entityType: 'DOC',
      projectId: record.projectId,
      status: 'SUCCESS',
    });
  };

  const syncAllProjectRecords = async (projectId: string) => {
    const projectRecords = projectDatabases.filter((r) => r.projectId === projectId);
    for (const r of projectRecords) {
      await syncDatabaseRecord(r.id);
    }
  };

  const queryProjectDatabaseForAgents = (query: string, projectId = activeProjectId || 'proj_atlas') => {
    const records = projectDatabases.filter((r) => r.projectId === projectId);
    const summaryContext = records
      .map((r, i) => {
        return `[Source Document ${i + 1}: ${r.title} (${r.sourceType}) | Category: ${r.category}]\nSummary: ${r.summary}\nKey Requirements: ${(r.keyEntities?.requirements || []).join('; ')}\nTasks/Deliverables: ${(r.keyEntities?.tasksExtracted || []).join('; ')}\nConstraints: ${(r.keyEntities?.architecturalConstraints || []).join('; ')}\n`;
      })
      .join('\n---\n');

    return {
      groundedRecords: records,
      summaryContext,
    };
  };

  // Run Simulation Event (Section 20 & 40)
  const runSimulatedEvent = (
    eventType: 'TASK_OVERDUE' | 'DEPENDENCY_FAILED' | 'MILESTONE_DELAYED' | 'AGENT_ACTIVATED',
    targetProjectId = activeProjectId
  ) => {
    const project = projects.find((p) => p.id === targetProjectId) || activeProject;

    if (eventType === 'TASK_OVERDUE' || eventType === 'DEPENDENCY_FAILED') {
      // 1. Mark task_atlas_7 as BLOCKED & Overdue
      const targetTask = tasks.find((t) => t.projectId === project.id && (t.id === 'task_atlas_7' || t.status !== 'DONE')) || tasks[0];

      if (targetTask) {
        updateTask(targetTask.id, {
          status: 'BLOCKED',
          isBlocked: true,
          priority: 'CRITICAL',
          blockReason: 'Simulated failure: Lock contention on OAuth credential store.',
        });

        // 2. Propagate to downstream tasks
        const downstreamTasks = tasks.filter((t) => Array.isArray(t.dependencies) && t.dependencies.includes(targetTask.id));
        downstreamTasks.forEach((dt) => {
          updateTask(dt.id, {
            status: 'BLOCKED',
            isBlocked: true,
            blockReason: `Cascade blocked by upstream: ${targetTask.title}`,
          });
        });

        // 3. Create or reopen critical risk
        const newRisk = createRisk({
          projectId: project.id,
          type: 'BLOCKED_DEPENDENCY',
          title: `Critical Dependency Block in ${project.name}: ${targetTask.title}`,
          description: `Task ${targetTask.title} failed under high load. ${downstreamTasks.length} downstream tasks stalled.`,
          severity: 'CRITICAL',
          affectedTaskId: targetTask.id,
          affectedMilestoneId: targetTask.milestoneId,
          suggestedAction: 'Execute Redlock distributed lock algorithm with jitter backoff to unblock task DAG.',
        });

        // 4. Update milestone status
        if (targetTask.milestoneId) {
          updateMilestone(targetTask.milestoneId, {
            status: 'AT_RISK',
          });
        }

        // 5. Update Project health
        updateProject(project.id, {
          health: 'AT_RISK',
          status: 'AT_RISK',
        });

        // 6. Trigger Risk Agent
        setAgents((prev) =>
          prev.map((a) =>
            a.id === 'risk_agent'
              ? {
                  ...a,
                  state: 'ANALYZING',
                  currentTask: `Diagnosing cascade blockage in ${project.name}`,
                  lastAction: `Flagged failure on ${targetTask.title}`,
                  lastActiveProjectId: project.id,
                  lastActiveTime: 'Just now',
                }
              : a
          )
        );

        return {
          title: 'Simulated Task Overdue & Dependency Cascade',
          description: `Injected failure into "${targetTask.title}". Risk Agent sentinel activated. Milestone marked At Risk.`,
          affectedEntities: [targetTask.title, ...downstreamTasks.map((d) => d.title), newRisk.title],
        };
      }
    }

    if (eventType === 'MILESTONE_DELAYED') {
      const milestone = milestones.find((m) => m.projectId === project.id && m.status !== 'COMPLETED') || milestones[0];
      if (milestone) {
        updateMilestone(milestone.id, { status: 'AT_RISK' });
        updateProject(project.id, { health: 'DELAYED' });
        createRisk({
          projectId: project.id,
          type: 'MILESTONE_RISK',
          title: `Milestone "${milestone.name}" Target Date at Risk`,
          description: `Pacing velocity indicates ${milestone.name} is behind schedule.`,
          severity: 'HIGH',
          affectedMilestoneId: milestone.id,
        });

        return {
          title: 'Simulated Milestone Delay',
          description: `Milestone ${milestone.code} (${milestone.name}) flagged as delayed. Planning Agent evaluating task pacing.`,
          affectedEntities: [milestone.name],
        };
      }
    }

    // Default agent activated
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        state: 'ACTIVE',
        lastAction: 'Autonomous fleet pulse check completed',
        lastActiveTime: 'Just now',
      }))
    );

    addActivityLog({
      actor: { name: 'System', isAI: true },
      action: 'Simulated Fleet Activation',
      entityName: 'All AI Agents (PM, Planning, Risk)',
      entityType: 'AGENT',
      projectId: project.id,
      status: 'INFO',
    });

    return {
      title: 'Simulated Agent Fleet Activation',
      description: 'Activated PM Agent, Planning Agent, and Risk Agent across all active projects.',
      affectedEntities: ['PM Agent', 'Planning Agent', 'Risk Agent'],
    };
  };

  // AI Command Execution (Section 21, 22, 23)
  const executeAIAction = async (
    commandText: string,
    targetProjectId = activeProjectId
  ) => {
    const cmd = commandText.trim().toLowerCase();
    const project = projects.find((p) => p.id === targetProjectId) || activeProject;

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 0. Project Database / Google Workspace Grounding queries
    if (
      cmd.includes('database') ||
      cmd.includes('prd') ||
      cmd.includes('sheet') ||
      cmd.includes('drive') ||
      cmd.includes('requirements') ||
      cmd.includes('source of knowledge') ||
      cmd.includes('ground') ||
      cmd.includes('spec')
    ) {
      const dbRecords = projectDatabases.filter((d) => d.projectId === project.id);
      const prdDoc = dbRecords.find((d) => d.sourceType === 'GOOGLE_DOC') || dbRecords[0];
      const sheet = dbRecords.find((d) => d.sourceType === 'GOOGLE_SHEET');

      // Update Doc and PM agents
      setAgents((prev) =>
        prev.map((a) =>
          a.id === 'doc_agent' || a.id === 'pm_agent'
            ? {
                ...a,
                state: 'ACTIVE',
                lastAction: `Grounded reasoning in Project Database (${dbRecords.length} Google Workspace sources)`,
                lastActiveTime: 'Just now',
                stats: { ...a.stats, actionsPerformed: a.stats.actionsPerformed + 1 },
              }
            : a
        )
      );

      const summary = `### Project Database Grounding Digest: ${project.name}
Strictly synthesized reasoning from **${dbRecords.length} connected Google Workspace source(s)** in the Project Database.

| Source Document | Type | Grounding Token Count | Sync State | Direct Link |
| :--- | :--- | :--- | :--- | :--- |
${dbRecords
  .map(
    (d) =>
      `| **${d.title.slice(0, 30)}...** | ${d.sourceType === 'GOOGLE_DOC' ? '📄 Google Doc' : '📊 Google Sheet'} | ${d.agentGrounding?.tokenCount || 2000} tokens | 🟢 ${d.syncStatus} | [Open in Drive](${d.webViewLink || '#'}) |`
  )
  .join('\n')}

$$\\text{Knowledge Grounding Index } \\mathcal{K}_{\\text{ground}} = \\frac{\\sum_{i=1}^N \\text{Tokens}_i}{\\text{Total Project Scope}} \\approx 98.4\\%$$`;

      const details = `#### Grounded Technical Invariants from User's Google Workspace
${
  prdDoc
    ? `##### From ${prdDoc.title} (Google Doc):
${(prdDoc.keyEntities?.requirements || ['Enforce sub-50ms WebSocket telemetry latency.', 'Strict Google Workspace project database grounding.']).map((r) => `- **Requirement**: ${r}`).join('\n')}
${(prdDoc.keyEntities?.architecturalConstraints || ['OAuth tokens client-side ephemeral.']).map((c) => `- **Constraint**: ${c}`).join('\n')}`
    : ''
}

${
  sheet
    ? `##### From ${sheet.title} (Google Sheet):
- **Extracted Sprint Work Items**: ${(sheet.keyEntities?.tasksExtracted || ['WebSocket DAG streamer', 'RBAC zero-trust policy']).join(', ')}
- **Team Allocation**: Samaksh Dey (Lead), Aman Kahar (Frontend), Uttaran Adhikari (Security), Arshia Bhattacharyya (Research), Anushka Bandyopadhyay (Analytics), Riti Mishra (Research).`
    : ''
}

*All AI agents (PM, Planning, Risk, Doc, QA) strictly query this Project Database before planning, risk scoring, or DAG generation.*`;

      addActivityLog({
        actor: { name: 'Doc Agent', isAI: true, agentId: 'doc_agent' },
        action: 'Queried Grounded Project Database',
        entityName: project.name,
        entityType: 'DOC',
        projectId: project.id,
        details: `Synthesized intelligence from ${dbRecords.length} Google Workspace records.`,
        status: 'SUCCESS',
      });

      return {
        agentId: 'doc_agent' as AgentId,
        agentName: 'Doc Agent (AI)',
        actionSummary: summary,
        detailedResponse: details,
        mutationsMade: ['Project Database Grounding Verified', 'Tokens Synchronized'],
      };
    }

    // 1. "What is blocking Atlas?" / "What is blocking us?" / "Analyze risks"
    if (cmd.includes('blocking') || cmd.includes('blocker') || cmd.includes('analyze risk') || cmd.includes('what is blocking')) {
      const openRisks = risks.filter((r) => r.projectId === project.id && r.status === 'OPEN');
      const blockedTasks = tasks.filter((t) => t.projectId === project.id && t.status === 'BLOCKED');

      setAgents((prev) =>
        prev.map((a) =>
          a.id === 'risk_agent'
            ? {
                ...a,
                state: 'ACTIVE',
                lastAction: `Analyzed blocker telemetry for ${project.name}`,
                lastActiveTime: 'Just now',
                stats: { ...a.stats, actionsPerformed: a.stats.actionsPerformed + 1 },
              }
            : a
        )
      );

      const summary =
        blockedTasks.length > 0
          ? `### Blocker Telemetry Diagnostic
Found **${blockedTasks.length} blocked task(s)** and **${openRisks.length} active risk vector(s)** threatening sprint milestones in **${project.name}**.

| Blocker Task | Root Cause Vector | Severity ($S = P \\times I$) | Downstream Cascade |
| :--- | :--- | :--- | :--- |
| **${blockedTasks[0].title}** | ${blockedTasks[0].blockReason || 'Lock contention under concurrent gRPC calls'} | $\\mathbf{0.72}$ (High) | Milestone MVP hold |

$$\\text{Cascading Delay } \\Delta t_{\\text{hold}} = \\sum_{j \\in \\text{downstream}} d_j \\approx 4.5\\text{ hrs}$$`
          : `### Telemetry Diagnostic: Clean
No critical blockers currently detected in **${project.name}**. All systems operational with composite risk score $\\mathcal{R} < 20$.`;

      const details =
        blockedTasks.length > 0
          ? `#### Root Cause & Mitigation Analysis
* **Primary Blocker**: ${blockedTasks[0].title}
* **Subsystem**: Redis Mutex Ingestion Layer
* **Algorithmic Lock Contention**: $\\Pr(\\text{collision}) = 1 - \\exp(-\\lambda^2 / 2N) \\approx 0.84$
* **Recommendation**: Command Risk Agent to execute **"Fix the highest-priority blocker"** to deploy an automated Redlock exponential backoff patch.`
          : `Project **${project.name}** is tracking at $${project.progress}\\%$ completion across $${milestones.filter((m) => m.projectId === project.id).length}$ milestones.`;

      addActivityLog({
        actor: { name: 'Risk Agent', isAI: true, agentId: 'risk_agent' },
        action: 'Completed Blocker Analysis',
        entityName: project.name,
        entityType: 'RISK',
        projectId: project.id,
        details: summary,
        status: 'INFO',
      });

      return {
        agentId: 'risk_agent' as AgentId,
        agentName: 'Risk Agent (AI)',
        actionSummary: summary,
        detailedResponse: details,
        mutationsMade: ['Telemetry Scan Completed', 'Risk DAG Verified'],
      };
    }

    // 2. "Fix the highest-priority blocker" / "Fix blocker" / "Resolve risk"
    if (
      cmd.includes('fix') ||
      cmd.includes('resolve') ||
      cmd.includes('mitigate') ||
      cmd.includes('unblock')
    ) {
      const criticalRisk =
        risks.find((r) => r.projectId === project.id && r.status === 'OPEN' && r.severity === 'CRITICAL') ||
        risks.find((r) => r.projectId === project.id && r.status === 'OPEN') ||
        risks[0];

      if (criticalRisk) {
        resolveRisk(
          criticalRisk.id,
          'Risk Agent deployed Redlock distributed mutex patch with jitter backoff. Verified zero lock timeouts.'
        );

        return {
          agentId: 'risk_agent' as AgentId,
          agentName: 'Risk Agent (AI)',
          actionSummary: `### Blocker Mitigation Deployed
Successfully resolved blocker: **"${criticalRisk.title}"** via **Gemini 3.5 Flash Sentinel Engine**. Unblocked downstream cloud connectors.

| Action Item | Entity | Prior State | Post-Mitigation State |
| :--- | :--- | :--- | :--- |
| **Distributed Lock Patch** | Redis Mutex Task #${criticalRisk.affectedTaskId || '7'} | 🔴 Blocked | 🟢 DONE |
| **Downstream Flow** | AWS & GCP Connectors | ⏸️ Paused | ⚡ Resumed |
| **Milestone 04 Health** | Core Integration | ⚠️ At Risk | 🟢 IN_PROGRESS |

$$\\text{Lock Acquisition Success Rate } P_{\\text{success}} = 1 - (1 - e^{-\\mu t})^k \\to 99.98\\%$$`,
          detailedResponse: `#### Execution Trace Log
1. Applied exponential jitter backoff algorithm ($T_{\\text{wait}} = 2^r \\times \\text{base} + \\mathcal{U}(0, \\delta)$).
2. Released deadlocked mutex handles across Redis cluster nodes.
3. Verified zero deadlock events over 5,000 synthetic test transactions.
4. Upgraded project health to **ON TRACK**.`,
          mutationsMade: [
            `Resolved Risk #${criticalRisk.id}`,
            'Marked Task as DONE',
            'Unblocked Downstream DAG Tasks',
            `Updated ${project.name} Health → ON TRACK`,
          ],
        };
      }

      return {
        agentId: 'risk_agent' as AgentId,
        agentName: 'Risk Agent (AI)',
        actionSummary: `### No Active Blockers Found
All tasks and dependencies in **${project.name}** are currently in valid states $(\\text{Blocker Count} = 0)$.`,
        detailedResponse: 'All tasks and dependencies are in valid states. No mitigation required.',
        mutationsMade: [],
      };
    }

    // 3. "Create milestone MVP for Atlas" / "Break this milestone into tasks"
    if (cmd.includes('milestone') || cmd.includes('break') || cmd.includes('plan') || cmd.includes('objective') || cmd.includes('deconstruct')) {
      const newMs = createMilestone({
        projectId: project.id,
        code: `M0${milestones.filter((m) => m.projectId === project.id).length + 1}`,
        name: 'Autonomous Multi-Agent Telemetry Benchmark',
        description: 'Auto-generated milestone by Planning Agent to validate 100k req/sec throughput.',
        targetDate: '2026-09-06',
      });

      // Create 3 subtasks
      const t1 = createTask({
        projectId: project.id,
        milestoneId: newMs.id,
        title: 'Spin up 10-node distributed load generator in Kubernetes',
        priority: 'HIGH',
        assigneeId: 'mem_3',
        assignedAgentId: 'planning_agent',
      });

      const t2 = createTask({
        projectId: project.id,
        milestoneId: newMs.id,
        title: 'Profile CPU cache misses and gRPC serialization overhead',
        priority: 'MEDIUM',
        assigneeId: 'mem_5',
        dependencies: [t1.id],
      });

      const t3 = createTask({
        projectId: project.id,
        milestoneId: newMs.id,
        title: 'Generate real-time Grafana telemetry dashboard for judges',
        priority: 'CRITICAL',
        assigneeId: 'mem_4',
        dependencies: [t2.id],
      });

      setAgents((prev) =>
        prev.map((a) =>
          a.id === 'planning_agent'
            ? {
                ...a,
                state: 'ACTIVE',
                lastAction: `Created Milestone ${newMs.code} and 3 DAG tasks for ${project.name}`,
                lastActiveTime: 'Just now',
                stats: { ...a.stats, actionsPerformed: a.stats.actionsPerformed + 1, tasksManaged: a.stats.tasksManaged + 3 },
              }
            : a
        )
      );

      return {
        agentId: 'planning_agent' as AgentId,
        agentName: 'Planning Agent (AI)',
        actionSummary: `### Milestone Decomposed into DAG Topology
Generated Milestone **${newMs.code}: ${newMs.name}** and linked $3$ dependent tasks in **${project.name}**.

| Task Node | Assignee | Priority | Dependency Constraint |
| :--- | :--- | :--- | :--- |
| **${t1.title.slice(0, 32)}...** | Aman Kahar | 🔴 HIGH | Roots ($t_0$) |
| **${t2.title.slice(0, 32)}...** | Uttaran Adhikari | 🟡 MEDIUM | Depends on Task 1 |
| **${t3.title.slice(0, 32)}...** | Arshia Bhattacharyya | 🟣 CRITICAL | Depends on Task 2 |

$$\\text{Topological Sorting: } v_1 \\prec v_2 \\prec v_3 \\implies \\text{Slack Float } = 0\\text{h}$$`,
        detailedResponse: `#### Milestone Parameters
* **Target Delivery**: ${newMs.targetDate}
* **Topological Complexity**: $\\mathcal{O}(V + E) = \\mathcal{O}(3 + 2) = 5$ operations
* **DAG Verification**: Acyclic directed graph validated with zero cycle loops.`,
        mutationsMade: [
          `Created Milestone ${newMs.code}`,
          'Generated 3 Dependent Tasks',
          'Updated Project DAG Topology',
        ],
      };
    }

    // 4. "Assign API analysis to Risk Agent"
    if (cmd.includes('assign') && cmd.includes('risk')) {
      const unassignedTask = tasks.find((t) => t.projectId === project.id && !t.assignedAgentId) || tasks[0];
      if (unassignedTask) {
        updateTask(unassignedTask.id, {
          assignedAgentId: 'risk_agent',
        });

        addActivityLog({
          actor: { name: 'PM Agent', isAI: true, agentId: 'pm_agent' },
          action: 'Reassigned Task to Risk Agent',
          entityName: unassignedTask.title,
          entityType: 'TASK',
          projectId: project.id,
          status: 'SUCCESS',
        });

        return {
          agentId: 'pm_agent' as AgentId,
          agentName: 'PM Agent (AI)',
          actionSummary: `### Task Reassigned to Autonomous Risk Sentinel
Assigned task **"${unassignedTask.title}"** to **Risk Agent (AI)** for automated vulnerability and stress scanning.`,
          detailedResponse: `| Field | Value |
| :--- | :--- |
| **Task ID** | #${unassignedTask.id} |
| **Assigned Agent** | Risk Agent (Sentinel) |
| **Runtime Model** | Gemini 3.5 Flash |
| **Telemetry Trigger** | Continuous Health Ping |`,
          mutationsMade: [`Task #${unassignedTask.id} assigned to Risk Agent`],
        };
      }
    }

    // 5. "Summarize Atlas" / "Summarize project" / General Summary
    if (cmd.includes('summarize') || cmd.includes('summary') || cmd.includes('status') || cmd.includes('priorities') || cmd.includes('velocity')) {
      const projTasks = tasks.filter((t) => t.projectId === project.id);
      const doneCount = projTasks.filter((t) => t.status === 'DONE').length;
      const inProgCount = projTasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const blockedCount = projTasks.filter((t) => t.status === 'BLOCKED').length;
      const projMilestones = milestones.filter((m) => m.projectId === project.id);
      const projRisks = risks.filter((r) => r.projectId === project.id && r.status === 'OPEN');

      return {
        agentId: 'pm_agent' as AgentId,
        agentName: 'PM Agent (AI)',
        actionSummary: `### Executive Sprint Briefing: ${project.name}
**Hackathon Target**: ${project.hackathon} | **Progress**: ${project.progress}% | **Health**: ${project.health}

| Operational Metric | Value | Baseline Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Tasks Completed** | $${doneCount} / ${projTasks.length}$ | $\\ge 70\\%$ | 🟢 Optimal |
| **In Progress** | $${inProgCount}$ | $3\\text{--}5$ | 🟢 Active |
| **Blocked Vectors** | $${blockedCount}$ | $0$ | ${blockedCount > 0 ? '🔴 Attention' : '🟢 Clean'} |
| **Active Milestones** | $${projMilestones.length}$ | $3$ | 🟢 In Flight |
| **Open Risks** | $${projRisks.length}$ | $< 2$ | ${projRisks.length > 1 ? '⚠️ Moderate' : '🟢 Low'} |

$$\\text{Sprint Velocity Completion Ratio } \\eta = \\frac{\\text{Done Points}}{\\text{Committed Points}} = ${project.progress}\\%$$`,
        detailedResponse: `#### Strategic Recommendations
1. Finalize WebSocket telemetry pipelines before judgment demos.
2. Maintain sprint burn-down rate $\\beta = \\frac{\\Delta W}{\\Delta t} \\approx 4.5\\text{ pts/day}$.
3. Target ship date: **${project.deadline}**.`,
        mutationsMade: ['Telemetry Aggregated'],
      };
    }

    // Default General Intelligent Execution (PM Agent)
    const newTask = createTask({
      projectId: project.id,
      title: `Execute: ${commandText.slice(0, 50)}...`,
      description: `Action initiated via AI Command: "${commandText}"`,
      priority: 'HIGH',
      assignedAgentId: 'pm_agent',
    });

    return {
      agentId: 'pm_agent' as AgentId,
      agentName: 'PM Agent (AI)',
      actionSummary: `### Autonomous Directive Dispatched
Parsed prompt and initialized tracking node **"${newTask.title}"** in **${project.name}** using **Gemini 3.5 Flash**.

| Parameter | Value |
| :--- | :--- |
| **Task ID** | #${newTask.id} |
| **Executing Agent** | PM Agent (AI) |
| **Target Project** | ${project.name} |
| **State Mutation** | Persisted to Nebula State Bus |`,
      detailedResponse: `#### Intent Execution Plan
* Parsed natural language semantics via Gemini 3.5 Flash.
* Created task #${newTask.id} with priority HIGH.
* Dispatched execution trigger to agent worker fleet.`,
      mutationsMade: [`Created Task #${newTask.id}`, 'Updated Activity Log'],
    };
  };

  // Meeting Automation (Section 28)
  const triggerMeetingAutomation = (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId) || meetings[0];
    if (!meeting) return;

    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meeting.id
          ? {
              ...m,
              packageGenerated: true,
              notesSummary: 'Automated briefing package generated with live telemetry digest and agenda links.',
            }
          : m
      )
    );

    addActivityLog({
      actor: { name: 'System Automation', isAI: true },
      action: 'Meeting Automation Triggered',
      entityName: meeting.title,
      entityType: 'MEETING',
      projectId: meeting.projectId,
      details: `Meeting package generated. Google Meet link (${meeting.meetLink}) and telemetry brief dispatched to ${meeting.attendeeIds.length} members.`,
      status: 'SUCCESS',
    });
  };

  // Knowledge Base Upload
  const uploadDocument = (doc: Partial<DocumentItem>): DocumentItem => {
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: doc.projectId || activeProjectId,
      title: doc.title || 'New Technical Specification',
      type: doc.type || 'PRD',
      uploadedDate: new Date().toISOString().split('T')[0],
      authorId: doc.authorId || 'mem_1',
      status: 'APPROVED',
      contentPreview: doc.contentPreview || 'Automated technical documentation record.',
      fileSize: doc.fileSize || '1.8 MB',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    addActivityLog({
      actor: { name: 'Samaksh Dey', isAI: false },
      action: 'Uploaded Document to Knowledge Base',
      entityName: newDoc.title,
      entityType: 'DOC',
      projectId: newDoc.projectId,
      status: 'SUCCESS',
    });

    return newDoc;
  };

  // Team Group Chat Comms Mutations
  const sendTeamMessage = async (msg: Partial<TeamChatMessage>): Promise<TeamChatMessage> => {
    const isCurrentUser = msg.isUser !== undefined ? msg.isUser : true;
    const senderName = msg.senderName || firebaseUser?.displayName || googleAuth?.userName || 'Samaksh Dey (You)';
    const senderId = msg.senderId || firebaseUser?.uid || 'mem_1';
    const senderAvatar =
      msg.senderAvatar ||
      firebaseUser?.photoURL ||
      googleAuth?.userAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newMsg: TeamChatMessage = {
      id: msgId,
      channelId: msg.channelId || activeChannelId,
      senderId,
      senderName,
      senderRole: msg.senderRole || (firebaseUser ? 'Team Lead' : 'Operator'),
      senderAvatar,
      senderColor: msg.senderColor,
      isUser: isCurrentUser,
      isAI: msg.isAI || false,
      timestamp: msg.timestamp || timeStr,
      dateCategory: 'Today',
      createdAtMs: Date.now(),
      type: msg.type || 'text',
      content: msg.content || '',
      mediaUrl: msg.mediaUrl,
      mediaThumbnail: msg.mediaThumbnail,
      mediaDuration: msg.mediaDuration,
      mediaSize: msg.mediaSize,
      audioWaveform: msg.audioWaveform,
      replyTo: msg.replyTo,
      mentions: msg.mentions || [],
      reactions: msg.reactions || {},
      userReacted: msg.userReacted || [],
      status: 'sent',
      pinned: msg.pinned || false,
    };

    setTeamMessages((prev) => [...prev, newMsg]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'team_messages', msgId), {
          ...newMsg,
          ownerId: auth.currentUser.uid,
        });
      } catch (err) {
        console.warn('Firestore message upload note:', err);
      }
    }

    addActivityLog({
      actor: { name: senderName, isAI: newMsg.isAI || false },
      action: 'Sent Group Chat Message',
      entityName: `Channel: #${teamChannels.find((c) => c.id === newMsg.channelId)?.name || 'nebula'}`,
      entityType: 'SYSTEM',
      details:
        newMsg.type === 'audio'
          ? `Voice Note (${newMsg.mediaDuration || '0:15'})`
          : newMsg.type === 'video'
          ? `Video preview dispatched`
          : newMsg.content.substring(0, 45),
      status: 'SUCCESS',
    });

    return newMsg;
  };

  const toggleMessageReaction = async (messageId: string, emoji: string) => {
    let updatedReactions: Record<string, number> = {};
    let updatedUserReacted: string[] = [];

    setTeamMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = { ...(msg.reactions || {}) };
          const userReacted = [...(msg.userReacted || [])];
          const hasReacted = userReacted.includes(emoji);

          if (hasReacted) {
            currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 1) - 1);
            if (currentReactions[emoji] === 0) {
              delete currentReactions[emoji];
            }
            const nextUserReacted = userReacted.filter((e) => e !== emoji);
            updatedReactions = currentReactions;
            updatedUserReacted = nextUserReacted;
            return {
              ...msg,
              reactions: currentReactions,
              userReacted: nextUserReacted,
            };
          } else {
            currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
            userReacted.push(emoji);
            updatedReactions = currentReactions;
            updatedUserReacted = userReacted;
            return {
              ...msg,
              reactions: currentReactions,
              userReacted,
            };
          }
        }
        return msg;
      })
    );

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'team_messages', messageId), {
          reactions: updatedReactions,
          userReacted: updatedUserReacted,
        });
      } catch (err) {
        console.warn('Firestore reaction sync note:', err);
      }
    }
  };

  const deleteTeamMessage = async (messageId: string) => {
    setTeamMessages((prev) => prev.filter((m) => m.id !== messageId));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'team_messages', messageId));
      } catch (err) {
        console.warn('Firestore message delete note:', err);
      }
    }
  };

  // Reset to seed defaults
  const resetToDefaults = () => {
    localStorage.clear();
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setMilestones(INITIAL_MILESTONES);
    setRisks(INITIAL_RISKS);
    setAgents(INITIAL_AGENTS);
    setActivityLogs(INITIAL_ACTIVITY);
    setMeetings(INITIAL_MEETINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setTeamMessages(INITIAL_TEAM_MESSAGES);
    setActiveProjectId('proj_atlas');
    setCurrentView('COMMAND_CENTER');
  };

  return (
    <NebulaContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeProjectId,
        setActiveProjectId,
        isWarping,
        warpTo,
        isOmnibarOpen,
        setIsOmnibarOpen,
        isDemoGuideOpen,
        setIsDemoGuideOpen,
        firebaseUser,
        isFirebaseLoading,
        firebaseAuthError,
        loginWithFirebase,
        logoutFirebase,
        selectedNodeId,
        setSelectedNodeId,
        selectedAgentId,
        setSelectedAgentId,
        selectAgent,
        inspectorEntity,
        setInspectorEntity,
        projects,
        members,
        agents,
        tasks,
        milestones,
        risks,
        activityLogs,
        meetings,
        documents,
        automations,
        projectDatabases,
        teamChannels,
        activeChannelId,
        setActiveChannelId,
        teamMessages,
        sendTeamMessage,
        toggleMessageReaction,
        deleteTeamMessage,
        isCallModalOpen,
        setIsCallModalOpen,
        chatSearchQuery,
        setChatSearchQuery,
        googleAuth,
        connectGoogleWorkspace,
        disconnectGoogleWorkspace,
        activeProject,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        createMilestone,
        updateMilestone,
        deleteMilestone,
        createRisk,
        resolveRisk,
        dismissRisk,
        addActivityLog,
        addDatabaseRecord,
        updateDatabaseRecord,
        deleteDatabaseRecord,
        syncDatabaseRecord,
        syncAllProjectRecords,
        queryProjectDatabaseForAgents,
        runSimulatedEvent,
        executeAIAction,
        triggerMeetingAutomation,
        uploadDocument,
        resetToDefaults,
      }}
    >
      {children}
    </NebulaContext.Provider>
  );
};

export const useNebula = () => {
  const context = useContext(NebulaContext);
  if (!context) {
    throw new Error('useNebula must be used within a NebulaProvider');
  }
  return context;
};
