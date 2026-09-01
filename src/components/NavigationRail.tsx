import React, { useState } from 'react';
import {
  LayoutGrid,
  FolderKanban,
  Columns3,
  Flag,
  GitFork,
  Shield,
  LineChart,
  Terminal,
  Globe,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  X,
  ListTodo,
  ChevronDown,
  Database,
  MessageSquare,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { ViewMode, AgentId } from '../types';

export const NavigationRail: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    warpTo,
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    agents,
    selectedAgentId,
    selectAgent,
  } = useNebula();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Global Primary Nav Items (Always available)
  const globalNavItems: Array<{
    id: ViewMode;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'COMMAND_CENTER', label: 'Command', sublabel: 'Operations Hub', icon: Terminal },
    { id: 'TEAM_CHAT', label: 'Team Chat', sublabel: 'Comms Network', icon: MessageSquare },
    { id: 'PORTFOLIO', label: 'Portfolio', sublabel: 'Galaxy Universe', icon: LayoutGrid },
  ];

  // Project-Specific Nav Items (Available only when a project is selected)
  const projectNavItems: Array<{
    id: ViewMode;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'PROJECT_DATABASE', label: 'Project DB', sublabel: 'Google Workspace', icon: Database },
    { id: 'KANBAN', label: 'Kanban', sublabel: 'Task Command', icon: Columns3 },
    { id: 'PROJECTS', label: 'Task List', sublabel: 'Mission Tasks', icon: ListTodo },
    { id: 'MILESTONES', label: 'Milestones', sublabel: 'Mission Targets', icon: Flag },
    { id: 'WORKFLOW', label: 'Workflow', sublabel: 'Galaxy DAG Map', icon: GitFork },
    { id: 'RISK_ENGINE', label: 'Risk Engine', sublabel: 'Threat Scanner', icon: Shield },
    { id: 'ACTIVITY', label: 'Analytics', sublabel: 'Telemetry & Logs', icon: LineChart },
  ];

  // 5 AI Agents to show on sidebar initially & permanently
  const aiWorkforce: Array<{
    id: AgentId;
    name: string;
    role: string;
    avatar: string;
    color: string;
    glow: string;
    state: string;
  }> = [
    {
      id: 'pm_agent',
      name: 'PM Agent',
      role: 'Autonomous PM',
      avatar: '🤖',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.5)',
      state: 'ACTIVE',
    },
    {
      id: 'risk_agent',
      name: 'Risk Agent',
      role: 'Risk Sentinel',
      avatar: '🛡️',
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.5)',
      state: 'ANALYZING',
    },
    {
      id: 'planning_agent',
      name: 'Planning Agent',
      role: 'Strategic DAG',
      avatar: '🧠',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.5)',
      state: 'IDLE',
    },
    {
      id: 'doc_agent',
      name: 'Doc Agent',
      role: 'Docs & PRDs',
      avatar: '📄',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.5)',
      state: 'ACTIVE',
    },
    {
      id: 'qa_agent',
      name: 'QA Agent',
      role: 'QA & Testing',
      avatar: '⚡',
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.5)',
      state: 'ACTIVE',
    },
  ];

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsProjectDropdownOpen(false);
    if (currentView === 'COMMAND_CENTER' || currentView === 'PORTFOLIO' || currentView === 'LANDING') {
      setCurrentView('KANBAN');
    }
  };

  const handleDeselectProject = () => {
    setActiveProjectId(null);
    setIsProjectDropdownOpen(false);
    if (
      currentView === 'PROJECT_DATABASE' ||
      currentView === 'KANBAN' ||
      currentView === 'PROJECTS' ||
      currentView === 'MILESTONES' ||
      currentView === 'WORKFLOW' ||
      currentView === 'RISK_ENGINE' ||
      currentView === 'ACTIVITY'
    ) {
      setCurrentView('COMMAND_CENTER');
    }
  };

  return (
    <aside
      id="nebula-navigation-rail"
      className={`fixed top-16 left-0 bottom-0 z-30 transition-all duration-300 flex flex-col justify-between bg-transparent border-r border-transparent ${
        isCollapsed ? 'w-16' : 'w-[200px] xl:w-[220px]'
      }`}
    >
      {/* Navigation Content */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-none">
        {/* Quick Return to Landing / Orbit Page */}
        <button
          id="nav-item-landing"
          onClick={() => warpTo('LANDING')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group relative cursor-pointer border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-300 hover:text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Return to Orbit / Landing Page"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Globe className="w-4 h-4 shrink-0 text-cyan-400 group-hover:rotate-45 transition-transform drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            {!isCollapsed && (
              <div className="text-left min-w-0">
                <div className="text-[13px] leading-tight font-medium text-cyan-200 group-hover:text-white flex items-center gap-1">
                  <span>Landing Page</span>
                  <ArrowLeft className="w-3 h-3 text-cyan-400 inline" />
                </div>
                <div className="text-[10px] leading-tight text-cyan-400/70">
                  Return to Orbit
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Global Primary Hubs: Command & Portfolio */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-tech uppercase tracking-wider text-slate-500 font-bold">
              GLOBAL HUBS
            </div>
          )}
          {globalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id.toLowerCase()}`}
                onClick={() => {
                  if (item.id === 'PORTFOLIO') {
                    warpTo('PORTFOLIO');
                  } else {
                    setCurrentView(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-purple-950/70 border border-purple-500/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="text-left min-w-0">
                      <div
                        className={`text-[13px] leading-tight font-medium ${
                          isActive ? 'text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] leading-tight ${
                          isActive ? 'text-purple-300/80' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Project Section: Either Project Picker (when none picked) or Project-Specific Tools (when picked) */}
        <div className="pt-1 space-y-1">
          {activeProjectId ? (
            /* PROJECT IS SELECTED: Display Active Project Badge + Kanban, Tasks, Milestones, Workflow, Risk Engine, Analytics */
            <>
              {!isCollapsed && (
                <div className="px-1.5 py-1 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/40 border border-purple-500/30 mb-1 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                      style={{
                        backgroundColor: activeProject.celestial.color,
                        boxShadow: `0 0 8px ${activeProject.celestial.color}`,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-tech uppercase tracking-wider text-purple-300/70 font-semibold truncate leading-tight">
                        ACTIVE PROJECT
                      </div>
                      <div className="text-xs font-bold text-white truncate leading-tight">
                        {activeProject.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDeselectProject}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Close project tools & return to global view"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {projectNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id.toLowerCase()}`}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-purple-950/70 border border-purple-500/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />

                      {!isCollapsed && (
                        <div className="text-left min-w-0">
                          <div
                            className={`text-[13px] leading-tight font-medium ${
                              isActive ? 'text-white font-semibold' : 'text-slate-300'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] leading-tight ${
                              isActive ? 'text-purple-300/80' : 'text-slate-500 group-hover:text-slate-400'
                            }`}
                          >
                            {item.sublabel}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            /* NO PROJECT SELECTED: Show clean Project Selector trigger so user can pick one */
            <div className="relative">
              {!isCollapsed ? (
                <div>
                  <div className="px-2 text-[10px] font-tech uppercase tracking-wider text-slate-500 font-bold mb-1">
                    MISSIONS
                  </div>
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/30 text-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderKanban className="w-4 h-4 text-slate-400 group-hover:text-purple-400 shrink-0" />
                      <span className="text-xs truncate font-medium">Pick a Project...</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Project Selector Dropdown List */}
                  {isProjectDropdownOpen && (
                    <div className="mt-1.5 p-1 rounded-xl bg-[#09071c] border border-purple-500/40 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProject(p.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-purple-950/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: p.celestial.color }}
                            />
                            <span className="text-slate-200 group-hover:text-white font-medium truncate text-xs">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-tech text-purple-400">{p.progress}%</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-full flex justify-center py-2 text-slate-400 hover:text-white"
                  title="Pick a project"
                >
                  <FolderKanban className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI WORKFORCE SECTION: 5 Specialized Sentinels (ALWAYS VISIBLE INITIALLY & PERMANENTLY) */}
        <div className="pt-2 border-t border-white/10 space-y-1">
          {!isCollapsed && (
            <div className="px-2 flex items-center justify-between mb-1">
              <span className="text-[10px] font-tech uppercase tracking-wider text-cyan-400 font-bold">
                AI WORKFORCE (5)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}

          {aiWorkforce.map((agent) => {
            const isAgentActiveInView = currentView === 'AI_AGENTS' && selectedAgentId === agent.id;

            return (
              <button
                key={agent.id}
                id={`nav-agent-${agent.id}`}
                onClick={() => selectAgent(agent.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all group relative cursor-pointer border ${
                  isAgentActiveInView
                    ? 'border-purple-500/50 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'border-transparent hover:border-white/10 hover:bg-white/[0.05]'
                } ${
                  isCollapsed ? 'justify-center px-0 py-2' : ''
                }`}
                title={`${agent.name} — ${agent.role}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Agent Avatar Badge with Glowing Halo */}
                  <div
                    className="relative w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${agent.color}15`,
                      border: `1px solid ${agent.color}40`,
                      boxShadow: `0 0 10px ${agent.glow}`,
                    }}
                  >
                    <span>{agent.avatar}</span>
                    {/* Live Beacon Dot */}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: agent.color }}
                    />
                  </div>

                  {!isCollapsed && (
                    <div className="text-left min-w-0">
                      <div className="text-[12px] leading-tight font-medium text-slate-200 group-hover:text-white truncate">
                        {agent.name}
                      </div>
                      <div
                        className="text-[9px] leading-tight font-tech truncate"
                        style={{ color: agent.color }}
                      >
                        {agent.role}
                      </div>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <span
                    className="text-[9px] font-tech uppercase px-1 py-0.2 rounded text-slate-400 group-hover:text-slate-200 bg-black/30"
                  >
                    {agent.state === 'ACTIVE' ? 'LIVE' : agent.state === 'ANALYZING' ? 'SCAN' : 'READY'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse / Expand toggle */}
      <div className="px-3 py-1 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Bottom System Status Widget */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-transparent bg-transparent space-y-1.5">
          <div className="text-[10px] font-tech uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>NEBULA SENTINELS</span>
            <span className="text-[9px] text-cyan-400 font-mono">5 ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-sans font-medium">Autonomous OS Online</span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-transparent bg-transparent flex flex-col items-center gap-1.5 py-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </div>
      )}
    </aside>
  );
};
