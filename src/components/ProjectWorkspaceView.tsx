import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Columns3,
  ListTodo,
  Flag,
  GitFork,
  ShieldAlert,
  Bot,
  Database,
  FileText,
  Settings as SettingsIcon,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  X,
  Play,
  Edit2,
  Save,
  Tag,
  Globe,
  Github,
  Calendar,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { Task, TaskStatus, Milestone, Project, ProjectHealth } from '../types';
import { StatusPill } from './StatusPill';
import { KanbanDashboard } from './KanbanDashboard';
import { TaskListView } from './TaskListView';
import { MilestonesView } from './MilestonesView';
import { WorkflowCanvas } from './WorkflowCanvas';
import { ProjectDatabaseView } from './ProjectDatabaseView';

type WorkspaceTab =
  | 'OVERVIEW'
  | 'DATABASE'
  | 'KANBAN'
  | 'TASKS'
  | 'MILESTONES'
  | 'WORKFLOW'
  | 'RISKS'
  | 'AGENT_ACTIVITY';

export const ProjectWorkspaceView: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    updateProject,
    tasks,
    milestones,
    risks,
    agents,
    members,
    activityLogs,
    createTask,
    updateTask,
    deleteTask,
    resolveRisk,
    setInspectorEntity,
  } = useNebula();

  // Initialize active tab based on current global view if applicable
  const getInitialTab = (): WorkspaceTab => {
    if (currentView === 'KANBAN') return 'KANBAN';
    if (currentView === 'PROJECTS') return 'TASKS';
    if (currentView === 'MILESTONES') return 'MILESTONES';
    if (currentView === 'WORKFLOW') return 'WORKFLOW';
    return 'KANBAN';
  };

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(getInitialTab());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(activeProject.name || '');
  const [editCodename, setEditCodename] = useState(activeProject.codename || '');
  const [editHackathon, setEditHackathon] = useState(activeProject.hackathon || '');
  const [editDescription, setEditDescription] = useState(activeProject.description || '');
  const [editDeadline, setEditDeadline] = useState(activeProject.deadline || '');
  const [editHealth, setEditHealth] = useState<ProjectHealth>(activeProject.health || 'ON_TRACK');
  const [editTags, setEditTags] = useState((activeProject.tags || []).join(', '));
  const [editRepo, setEditRepo] = useState(activeProject.repositoryUrl || '');
  const [editDemo, setEditDemo] = useState(activeProject.demoUrl || '');
  const [editLeadId, setEditLeadId] = useState(activeProject.leadId || members[0]?.id || '');

  // Keep edit state updated when active project switches
  useEffect(() => {
    setEditName(activeProject.name || '');
    setEditCodename(activeProject.codename || '');
    setEditHackathon(activeProject.hackathon || '');
    setEditDescription(activeProject.description || '');
    setEditDeadline(activeProject.deadline || '');
    setEditHealth(activeProject.health || 'ON_TRACK');
    setEditTags((activeProject.tags || []).join(', '));
    setEditRepo(activeProject.repositoryUrl || '');
    setEditDemo(activeProject.demoUrl || '');
    setEditLeadId(activeProject.leadId || members[0]?.id || '');
  }, [activeProject]);

  // Sync tab when global view changes
  useEffect(() => {
    if (currentView === 'KANBAN') setActiveTab('KANBAN');
    else if (currentView === 'PROJECTS') setActiveTab('TASKS');
    else if (currentView === 'MILESTONES') setActiveTab('MILESTONES');
    else if (currentView === 'WORKFLOW') setActiveTab('WORKFLOW');
  }, [currentView]);

  const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);
  const projectMilestones = milestones.filter((m) => m.projectId === activeProject.id);
  const projectRisks = risks.filter((r) => r.projectId === activeProject.id);
  const projectLogs = activityLogs.filter((l) => l.projectId === activeProject.id);

  const completedTasksCount = projectTasks.filter((t) => t.status === 'DONE').length;
  const computedProgress =
    projectTasks.length > 0
      ? Math.round((completedTasksCount / projectTasks.length) * 100)
      : activeProject.progress || 0;

  const handleTabChange = (tabId: WorkspaceTab) => {
    setActiveTab(tabId);
    if (tabId === 'KANBAN') setCurrentView('KANBAN');
    else if (tabId === 'TASKS') setCurrentView('PROJECTS');
    else if (tabId === 'MILESTONES') setCurrentView('MILESTONES');
    else if (tabId === 'WORKFLOW') setCurrentView('WORKFLOW');
  };

  const handleSaveProjectDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateProject(activeProject.id, {
      name: editName,
      codename: editCodename,
      hackathon: editHackathon,
      description: editDescription,
      deadline: editDeadline,
      health: editHealth,
      tags: parsedTags,
      repositoryUrl: editRepo,
      demoUrl: editDemo,
      leadId: editLeadId,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div id="project-workspace-container" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Project Header Banner */}
      <section className="p-5 sm:p-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px] shrink-0"
                style={{
                  backgroundColor: activeProject.celestial.color,
                  boxShadow: `0 0 12px ${activeProject.celestial.color}`,
                }}
              />
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white truncate">
                {activeProject.name}
              </h1>
              {activeProject.codename && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/70">
                  {activeProject.codename}
                </span>
              )}
              <StatusPill status={activeProject.health} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-tech text-white/50">
              <span>HACKATHON: {activeProject.hackathon || 'Not set'}</span>
              <span>•</span>
              <span>DEADLINE: {activeProject.deadline || 'TBD'}</span>
              <span>•</span>
              <span>LEAD: {members.find((m) => m.id === activeProject.leadId)?.name || 'Samaksh Dey'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-tech shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            >
              <Edit2 className="w-3.5 h-3.5 text-purple-300" />
              <span>EDIT PROFILE</span>
            </button>
            <span className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300">
              {activeProject.celestial.spectralClass}
            </span>
          </div>
        </div>

        {/* Tags and Links (if configured) */}
        {((activeProject.tags && activeProject.tags.length > 0) || activeProject.repositoryUrl || activeProject.demoUrl) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-tech">
            <div className="flex flex-wrap items-center gap-1.5">
              {activeProject.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {activeProject.repositoryUrl && (
                <a
                  href={activeProject.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repo</span>
                </a>
              )}
              {activeProject.demoUrl && (
                <a
                  href={activeProject.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs font-tech">
            <span className="text-white/40">
              Mission Progress ({completedTasksCount}/{projectTasks.length} Deliverables)
            </span>
            <span className="text-purple-300 font-bold">{computedProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)] transition-all duration-500"
              style={{ width: `${computedProgress}%` }}
            />
          </div>
        </div>

        {/* Workspace Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/10 scrollbar-none">
          {[
            { id: 'DATABASE', label: 'PROJECT DATABASE & DOCS', icon: Database, badge: 'DATABASE' },
            { id: 'KANBAN', label: 'KANBAN DASHBOARD', icon: Columns3, count: projectTasks.length },
            { id: 'TASKS', label: 'TASK LIST BY MEMBER', icon: ListTodo, count: members.length + agents.length },
            { id: 'MILESTONES', label: 'MILESTONES ROADMAP', icon: Flag, count: projectMilestones.length },
            { id: 'WORKFLOW', label: 'n8n/CrewAI WORKFLOW', icon: GitFork, badge: 'CANVAS' },
            { id: 'OVERVIEW', label: 'BRIEFING & SPECS', icon: FolderKanban },
            { id: 'RISKS', label: 'RISK RADAR', icon: ShieldAlert, count: projectRisks.length },
            { id: 'AGENT_ACTIVITY', label: 'SENTINEL LOGS', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`workspace-tab-${tab.id.toLowerCase()}`}
                onClick={() => handleTabChange(tab.id as WorkspaceTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-tech font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-white border border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/80 font-bold">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* RENDER ACTIVE TAB CONTENT */}

      {/* TAB 0: DEDICATED PROJECT DATABASE & DOCS */}
      {activeTab === 'DATABASE' && <ProjectDatabaseView />}

      {/* TAB 1: KANBAN DASHBOARD */}
      {activeTab === 'KANBAN' && <KanbanDashboard />}

      {/* TAB 2: TASK LIST BY MEMBER */}
      {activeTab === 'TASKS' && <TaskListView />}

      {/* TAB 3: MILESTONES ROADMAP & PIPELINE */}
      {activeTab === 'MILESTONES' && <MilestonesView />}

      {/* TAB 4: WORKFLOW CANVAS (n8n / CrewAI) */}
      {activeTab === 'WORKFLOW' && <WorkflowCanvas />}

      {/* TAB 5: OVERVIEW BRIEFING */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white/70">
                  MISSION BRIEFING
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-purple-400 hover:text-purple-300 text-xs font-tech flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              {activeProject.description ? (
                <p className="text-xs text-white/80 leading-relaxed font-sans">
                  {activeProject.description}
                </p>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-tech">No mission briefing written yet.</p>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-tech border border-purple-500/40 hover:bg-purple-500/30"
                  >
                    + Add Mission Briefing
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-tech">
                <div className="flex justify-between">
                  <span className="text-white/40">Celestial Class:</span>
                  <span className="text-purple-300">{activeProject.celestial.spectralClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Total Linked Tasks:</span>
                  <span className="text-white font-bold">{projectTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Open Threats:</span>
                  <span className="text-rose-400 font-bold">
                    {projectRisks.filter((r) => r.status === 'OPEN').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white/70">
                ACTIVE MILESTONE PIPELINE
              </h3>
              {projectMilestones.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-tech">No milestones defined yet.</p>
                  <button
                    onClick={() => handleTabChange('MILESTONES')}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-tech border border-cyan-500/40 hover:bg-cyan-500/30"
                  >
                    + Define Milestones
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectMilestones.slice(0, 3).map((ms) => (
                    <div key={ms.id} className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex justify-between text-xs font-tech">
                        <span className="text-white font-medium">{ms.name}</span>
                        <span className="text-purple-300">{ms.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: `${ms.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white/70">
                ACTIVE AUTONOMOUS FLEET
              </h3>
              <div className="space-y-2">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-tech"
                  >
                    <div className="flex items-center gap-2">
                      <span>{ag.avatar}</span>
                      <span className="text-white font-medium">{ag.name}</span>
                    </div>
                    <StatusPill status={ag.state} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RISKS */}
      {activeTab === 'RISKS' && (
        <div className="space-y-4">
          {projectRisks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-tech text-sm font-bold text-white">No Active Threats</h4>
              <p className="text-xs text-white/50 font-sans max-w-md mx-auto">
                No open risks or dependency blockers recorded for this project profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectRisks.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3 backdrop-blur-xl shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <h4 className="font-tech text-sm font-bold text-white">{r.title}</h4>
                    </div>
                    <StatusPill status={r.severity} size="sm" />
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">{r.description}</p>
                  {(r.mitigationAction || r.suggestedAction) && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-tech text-purple-300">
                      <span className="font-bold">Autonomous Mitigation:</span> {r.mitigationAction || r.suggestedAction}
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => resolveRisk(r.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-tech font-bold transition-colors cursor-pointer"
                    >
                      Auto-Mitigate Risk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AGENT ACTIVITY */}
      {activeTab === 'AGENT_ACTIVITY' && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white/70">
            AUTONOMOUS AGENT AUDIT LOGS
          </h3>
          {projectLogs.length === 0 ? (
            <div className="py-8 text-center text-xs font-tech text-slate-500">
              No audit logs recorded for this project profile yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10 space-y-3">
              {projectLogs.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 space-y-1 text-xs font-tech">
                  <div className="flex justify-between">
                    <span className="text-purple-300 font-bold">{log.actor.name}</span>
                    <span className="text-white/40">{log.timestamp}</span>
                  </div>
                  <div className="text-white">{log.action}</div>
                  <div className="text-white/50">{log.entityName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT PROJECT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0a071e]/90 border border-white/20 p-6 shadow-2xl space-y-5 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-widest">
                  PROJECT SPECIFICATION
                </span>
                <h3 className="font-tech text-lg font-bold text-white">Edit Project Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectDetails} className="space-y-4 text-xs font-tech">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="e.g. Project Atlas"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Codename / ID</label>
                  <input
                    type="text"
                    value={editCodename}
                    onChange={(e) => setEditCodename(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="e.g. ATLAS-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Hackathon / Challenge</label>
                  <input
                    type="text"
                    value={editHackathon}
                    onChange={(e) => setEditHackathon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="e.g. Frontier AI Hackathon 2026"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Deadline</label>
                  <input
                    type="text"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="e.g. 2026-09-15 or Sep 15, 2026"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Mission Briefing / Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md font-sans text-xs"
                  placeholder="Describe the architectural goals, deliverables, and technical scope..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Health Status</label>
                  <select
                    value={editHealth}
                    onChange={(e) => setEditHealth(e.target.value as ProjectHealth)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="ON_TRACK">ON_TRACK (Green)</option>
                    <option value="AT_RISK">AT_RISK (Amber)</option>
                    <option value="DELAYED">DELAYED (Red)</option>
                    <option value="COMPLETED">COMPLETED (Blue)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mission Lead</label>
                  <select
                    value={editLeadId}
                    onChange={(e) => setEditLeadId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    {members.filter((m) => !m.isAI).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  placeholder="e.g. AI, Kafka, Rust, Multi-Cloud"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">GitHub / Repository URL</label>
                  <input
                    type="url"
                    value={editRepo}
                    onChange={(e) => setEditRepo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="https://github.com/org/repo"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Live Demo URL</label>
                  <input
                    type="url"
                    value={editDemo}
                    onChange={(e) => setEditDemo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                    placeholder="https://demo.app"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-tech font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>SAVE PROJECT PROFILE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
