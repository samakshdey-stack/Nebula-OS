import React, { useState } from 'react';
import {
  User,
  Bot,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  MoreVertical,
  Check,
  Zap,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { Task, TaskStatus, Priority } from '../types';
import { StatusPill } from './StatusPill';

export const TaskListView: React.FC = () => {
  const {
    activeProject,
    tasks,
    members,
    agents,
    milestones,
    updateTask,
    createTask,
    deleteTask,
    setInspectorEntity,
  } = useNebula();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'HUMANS' | 'AGENTS'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [collapsedMembers, setCollapsedMembers] = useState<Record<string, boolean>>({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMemberForTask, setSelectedMemberForTask] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('HIGH');
  const [newTaskAssignee, setNewTaskAssignee] = useState(members[0]?.id || 'm_lead');
  const [newTaskMilestone, setNewTaskMilestone] = useState(milestones[0]?.id || '');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Aug 31, 2026');
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState(8);

  const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);

  const humanMembers = members.filter((m) => !m.isAI);

  // Group team into human engineers and autonomous agents
  const allAssigneeEntities = [
    ...humanMembers.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      avatar: m.avatar,
      email: m.email,
      isAI: false,
      glow: 'rgba(6, 182, 212, 0.4)',
    })),
    ...agents.map((ag) => ({
      id: ag.id,
      name: ag.name,
      role: ag.title,
      avatar: ag.avatar,
      email: `${ag.id}@nebula.fleet`,
      isAI: true,
      glow: ag.glowColor || 'rgba(168, 85, 247, 0.4)',
    })),
  ];

  const toggleMemberCollapse = (memberId: string) => {
    setCollapsedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleOpenAssignModal = (memberId?: string) => {
    if (memberId) {
      setNewTaskAssignee(memberId);
    }
    setIsAssignModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const isAI = newTaskAssignee.startsWith('agent_') || newTaskAssignee.endsWith('_agent');

    createTask({
      projectId: activeProject.id,
      milestoneId: newTaskMilestone || undefined,
      title: newTaskTitle.trim(),
      status: 'TODO',
      priority: newTaskPriority,
      assigneeId: isAI ? undefined : newTaskAssignee,
      assignedAgentId: isAI ? (newTaskAssignee as any) : undefined,
      dependencies: [],
      deadline: newTaskDeadline,
      estimatedHours: newTaskEstimatedHours,
    });

    setIsAssignModalOpen(false);
    setNewTaskTitle('');
  };

  return (
    <div id="task-list-view" className="space-y-6">
      {/* Top Banner & Filter Omnibar */}
      <div className="p-5 rounded-2xl frosty-card flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-tech text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
            />
          </div>

          {/* Type Toggle: All / Humans / Agents */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/10 p-1 text-xs font-tech backdrop-blur-md">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Workforce ({allAssigneeEntities.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('HUMANS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRoleFilter === 'HUMANS'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 Engineers ({humanMembers.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('AGENTS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRoleFilter === 'AGENTS'
                  ? 'bg-pink-600 text-white font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🤖 AI Sentinels ({agents.length})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
          >
            <option value="ALL" className="bg-[#0a071d] text-white">All Statuses</option>
            <option value="IN_PROGRESS" className="bg-[#0a071d] text-purple-300">In Progress</option>
            <option value="BLOCKED" className="bg-[#0a071d] text-rose-300">Blocked</option>
            <option value="TODO" className="bg-[#0a071d] text-cyan-300">To Do</option>
            <option value="DONE" className="bg-[#0a071d] text-emerald-300">Done</option>
          </select>
        </div>

        {/* Global Dispatch Button */}
        <button
          onClick={() => handleOpenAssignModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>ASSIGN NEW TASK</span>
        </button>
      </div>

      {/* Team Member Task Grouping Cards */}
      <div className="space-y-5">
        {allAssigneeEntities
          .filter((entity) => {
            if (selectedRoleFilter === 'HUMANS' && entity.isAI) return false;
            if (selectedRoleFilter === 'AGENTS' && !entity.isAI) return false;
            return true;
          })
          .map((entity) => {
            // Find tasks assigned to this entity
            const assignedTasks = projectTasks.filter((t) => {
              if (entity.isAI) {
                if (t.assignedAgentId !== entity.id) return false;
              } else {
                if (t.assigneeId !== entity.id) return false;
              }

              if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
              }
              if (selectedStatusFilter !== 'ALL' && t.status !== selectedStatusFilter) {
                return false;
              }
              return true;
            });

            const isCollapsed = collapsedMembers[entity.id] || false;
            const completedCount = assignedTasks.filter((t) => t.status === 'DONE').length;
            const blockedCount = assignedTasks.filter((t) => t.status === 'BLOCKED').length;
            const completionRate =
              assignedTasks.length > 0
                ? Math.round((completedCount / assignedTasks.length) * 100)
                : 100;

            return (
              <div
                key={entity.id}
                id={`member-task-group-${entity.id}`}
                className="rounded-2xl frosty-card overflow-hidden shadow-2xl transition-all hover:border-white/25"
              >
                {/* Member Header Bar */}
                <div
                  onClick={() => toggleMemberCollapse(entity.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-white/[0.015] hover:bg-white/[0.04] transition-colors border-b border-white/5"
                >
                  <div className="flex items-center gap-3.5">
                    <button className="text-slate-400 hover:text-white p-0.5">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Avatar with status glow */}
                    <div className="relative">
                      {entity.isAI ? (
                        <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-400/50 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md">
                          {entity.avatar}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-400/50 flex items-center justify-center font-tech font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md">
                          {entity.name[0]}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          blockedCount > 0
                            ? 'bg-rose-500 animate-ping'
                            : 'bg-emerald-400'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-tech font-bold text-sm text-white">
                          {entity.name}
                        </h3>
                        <span
                          className={`text-[10px] font-tech px-2 py-0.5 rounded-full font-semibold ${
                            entity.isAI
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {entity.isAI ? 'AI SENTINEL' : 'ENGINEER'}
                        </span>
                      </div>
                      <p className="text-xs font-tech text-slate-400 mt-0.5">
                        {entity.role} • <span className="text-slate-500">{entity.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Workload Stats & Quick Assign */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="flex items-center gap-3 text-xs font-tech">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Assigned:</span>
                          <span className="font-bold text-white">{assignedTasks.length} Tasks</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="text-emerald-400">{completedCount} Done</span>
                          {blockedCount > 0 && (
                            <span className="text-rose-400 font-bold">• {blockedCount} Blocked</span>
                          )}
                        </div>
                      </div>

                      {/* Mini Capacity Bar */}
                      <div className="w-20 sm:w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            blockedCount > 0
                              ? 'bg-rose-500'
                              : completionRate === 100
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-cyan-400 to-purple-400'
                          }`}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAssignModal(entity.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-purple-600/50 text-white text-xs font-tech font-semibold transition-colors border border-white/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>

                {/* Sub-table: Assigned Tasks */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5">
                    {assignedTasks.length === 0 ? (
                      <div className="py-6 text-center text-xs font-tech text-slate-500 border border-dashed border-white/10 rounded-xl">
                        No active tasks currently assigned to {entity.name}.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {assignedTasks.map((task) => {
                          const linkedMilestone = milestones.find((m) => m.id === task.milestoneId);
                          return (
                            <div
                              key={task.id}
                              onClick={() => setInspectorEntity({ type: 'TASK', data: task })}
                              className={`p-3.5 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group ${
                                task.isBlocked
                                  ? 'frosty-card-rose hover:border-rose-400'
                                  : task.status === 'DONE'
                                  ? 'frosty-card-emerald hover:border-emerald-400'
                                  : 'frosty-card frosty-card-interactive hover:border-purple-400/50'
                              }`}
                            >
                              {/* Left: Checkbox + Title */}
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTask(task.id, {
                                      status: task.status === 'DONE' ? 'TODO' : 'DONE',
                                    });
                                  }}
                                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    task.status === 'DONE'
                                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                      : 'border-white/30 hover:border-cyan-400 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-tech text-slate-400">
                                      #{task.id.slice(-4)}
                                    </span>
                                    <h4
                                      className={`font-tech text-xs font-bold leading-tight ${
                                        task.status === 'DONE'
                                          ? 'line-through text-slate-400'
                                          : 'text-white group-hover:text-cyan-200'
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                  </div>

                                  {task.isBlocked && (
                                    <p className="text-[10px] font-tech text-rose-300 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                      <span>{task.blockReason || 'Dependency conflict flagged by Sentinel'}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Middle: Milestone & Priority Tag */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-tech">
                                {linkedMilestone && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300">
                                    🎯 {linkedMilestone.code}
                                  </span>
                                )}
                                <StatusPill status={task.priority} size="sm" />
                                <StatusPill status={task.status} size="sm" />
                              </div>

                              {/* Right: Deadline & Quick Status Selector */}
                              <div className="flex items-center gap-3 self-end md:self-auto text-xs font-tech text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{task.deadline}</span>
                                </div>

                                <select
                                  value={task.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as TaskStatus;
                                    updateTask(task.id, {
                                      status: nextStatus,
                                      isBlocked: nextStatus === 'BLOCKED',
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-tech text-white focus:outline-none focus:border-purple-400"
                                >
                                  <option value="BACKLOG" className="bg-[#0a071d] text-slate-300">Backlog</option>
                                  <option value="TODO" className="bg-[#0a071d] text-cyan-300">Ready</option>
                                  <option value="IN_PROGRESS" className="bg-[#0a071d] text-purple-300">In Progress</option>
                                  <option value="BLOCKED" className="bg-[#0a071d] text-rose-300">Blocked</option>
                                  <option value="DONE" className="bg-[#0a071d] text-emerald-300">Done</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Task Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl frosty-card border border-white/20 p-6 shadow-2xl space-y-5 bg-[#09071c]/40 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tech text-cyan-400 font-bold uppercase tracking-widest">
                  DELEGATION PROTOCOL
                </span>
                <h3 className="font-tech text-lg font-bold text-white">Assign Task to Member</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-tech">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Task Objective / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Zero-Knowledge Rollup Security Proofs"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Assignee (Human or AI)</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    <optgroup label="Human Engineers" className="bg-[#0a071d] text-cyan-400">
                      {members.filter((m) => !m.isAI).map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#0a071d] text-white">
                          👤 {m.name} ({m.role})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Autonomous AI Agents" className="bg-[#0a071d] text-purple-400">
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id} className="bg-[#0a071d] text-purple-200">
                          🤖 {ag.name} ({ag.title})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    <option value="CRITICAL" className="bg-[#0a071d] text-rose-400">Critical Priority</option>
                    <option value="HIGH" className="bg-[#0a071d] text-orange-400">High Priority</option>
                    <option value="MEDIUM" className="bg-[#0a071d] text-amber-400">Medium Priority</option>
                    <option value="LOW" className="bg-[#0a071d] text-slate-300">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Linked Milestone</label>
                  <select
                    value={newTaskMilestone}
                    onChange={(e) => setNewTaskMilestone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    {milestones.map((ms) => (
                      <option key={ms.id} value={ms.id} className="bg-[#0a071d] text-white">
                        {ms.code}: {ms.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Deadline</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-tech text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Delegate to Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
