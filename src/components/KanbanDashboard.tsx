import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  User,
  Bot,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Check,
  X,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { Task, TaskStatus, Priority } from '../types';
import { StatusPill } from './StatusPill';

const COLUMNS: Array<{ id: TaskStatus; label: string; color: string; bg: string }> = [
  { id: 'BACKLOG', label: 'Backlog', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
  { id: 'TODO', label: 'Ready / To Do', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  { id: 'BLOCKED', label: 'Blocked / Threat', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
  { id: 'DONE', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
];

export const KanbanDashboard: React.FC = () => {
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
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('ALL');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [quickAddColumn, setQuickAddColumn] = useState<TaskStatus | null>(null);

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('HIGH');
  const [newTaskAssignee, setNewTaskAssignee] = useState('agent_pm');
  const [newTaskMilestone, setNewTaskMilestone] = useState(milestones[0]?.id || '');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Aug 30, 2026');
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState(6);

  const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);

  // Filtered tasks
  const filteredTasks = projectTasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedAssignee !== 'ALL') {
      if (selectedAssignee.startsWith('agent_')) {
        if (task.assignedAgentId !== selectedAssignee) return false;
      } else {
        if (task.assigneeId !== selectedAssignee) return false;
      }
    }
    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
      return false;
    }
    if (selectedMilestone !== 'ALL' && task.milestoneId !== selectedMilestone) {
      return false;
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, {
        status: targetStatus,
        isBlocked: targetStatus === 'BLOCKED',
      });
    }
  };

  const handleQuickStatusMove = (taskId: string, currentStatus: TaskStatus, direction: 'PREV' | 'NEXT') => {
    const statusOrder: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = direction === 'NEXT' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < statusOrder.length) {
      const targetStatus = statusOrder[targetIndex];
      updateTask(taskId, {
        status: targetStatus,
        isBlocked: targetStatus === 'BLOCKED',
      });
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask({
      projectId: activeProject.id,
      milestoneId: newTaskMilestone || undefined,
      title: newTaskTitle.trim(),
      status: quickAddColumn || 'TODO',
      priority: newTaskPriority,
      assigneeId: newTaskAssignee.startsWith('agent_') ? undefined : newTaskAssignee,
      assignedAgentId: newTaskAssignee.startsWith('agent_') ? (newTaskAssignee as any) : undefined,
      dependencies: [],
      deadline: newTaskDeadline,
      estimatedHours: newTaskEstimatedHours,
    });

    setIsNewTaskModalOpen(false);
    setQuickAddColumn(null);
    setNewTaskTitle('');
  };

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED').length;

  return (
    <div id="kanban-dashboard-view" className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl frosty-card space-y-1">
          <span className="text-[11px] font-tech text-slate-400 uppercase tracking-wider">Total Tasks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-tech text-white">{totalTasks}</span>
            <span className="text-xs font-tech text-cyan-400">100% Volume</span>
          </div>
        </div>
        <div className="p-4 rounded-xl frosty-card-violet space-y-1">
          <span className="text-[11px] font-tech text-purple-300 uppercase tracking-wider">In Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-tech text-purple-200">{inProgressTasks}</span>
            <span className="text-xs font-tech text-purple-400">{Math.round((inProgressTasks / (totalTasks || 1)) * 100)}% Active</span>
          </div>
        </div>
        <div className="p-4 rounded-xl frosty-card-rose space-y-1">
          <span className="text-[11px] font-tech text-rose-300 uppercase tracking-wider">Blocked / Risks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-tech text-rose-300">{blockedTasks}</span>
            <span className="text-xs font-tech text-rose-400">{blockedTasks > 0 ? 'Requires Action' : 'Clear'}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl frosty-card-emerald space-y-1">
          <span className="text-[11px] font-tech text-emerald-300 uppercase tracking-wider">Done & Shipped</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-tech text-emerald-300">{completedTasks}</span>
            <span className="text-xs font-tech text-emerald-400">{Math.round((completedTasks / (totalTasks || 1)) * 100)}% Velocity</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Omnibar */}
      <div className="p-4 rounded-2xl frosty-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Filter tasks by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-tech text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors backdrop-blur-md"
            />
          </div>

          {/* Filter by Assignee */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
          >
            <option value="ALL" className="bg-[#0a071d] text-white">All Assignees (Humans & AI)</option>
            <optgroup label="Human Engineers" className="bg-[#0a071d] text-slate-400">
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

          {/* Filter by Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
          >
            <option value="ALL" className="bg-[#0a071d] text-white">All Priorities</option>
            <option value="CRITICAL" className="bg-[#0a071d] text-rose-400">Critical Priority</option>
            <option value="HIGH" className="bg-[#0a071d] text-orange-400">High Priority</option>
            <option value="MEDIUM" className="bg-[#0a071d] text-amber-400">Medium Priority</option>
            <option value="LOW" className="bg-[#0a071d] text-slate-400">Low Priority</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setQuickAddColumn('TODO');
            setIsNewTaskModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>ADD MISSION TASK</span>
        </button>
      </div>

      {/* 5-Column Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          const totalColHours = colTasks.reduce((acc, curr) => acc + (curr.estimatedHours || 4), 0);

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="flex flex-col rounded-2xl frosty-card p-3.5 space-y-3 min-h-[580px] shadow-2xl transition-colors hover:border-white/25"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: column.color, boxShadow: `0 0 8px ${column.color}` }}
                  />
                  <h3 className="font-tech text-xs font-bold text-white uppercase tracking-wider">
                    {column.label}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {colTasks.length}
                  </span>
                  <button
                    onClick={() => {
                      setQuickAddColumn(column.id);
                      setIsNewTaskModalOpen(true);
                    }}
                    title="Quick add task in this column"
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Workload Indicator */}
              <div className="text-[10px] font-tech text-slate-400 flex items-center justify-between px-1">
                <span>Est: {totalColHours}h</span>
                <span>{colTasks.length === 0 ? 'Empty Queue' : 'Active'}</span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="h-40 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs font-tech">
                    <span>Drop tasks here</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assigneeMember = members.find((m) => m.id === task.assigneeId);
                    const assignedAgent = agents.find((a) => a.id === task.assignedAgentId);
                    const linkedMilestone = milestones.find((m) => m.id === task.milestoneId);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setInspectorEntity({ type: 'TASK', data: task })}
                        className={`group relative p-3.5 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 space-y-2.5 shadow-lg ${
                          task.isBlocked
                            ? 'frosty-card-rose hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                            : task.status === 'DONE'
                            ? 'frosty-card-emerald hover:border-emerald-400/60'
                            : 'frosty-card frosty-card-interactive hover:border-purple-400/60'
                        }`}
                      >
                        {/* Top Meta Line: Priority & ID */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-tech text-slate-400">
                            #{task.id.slice(-4)}
                          </span>
                          <StatusPill status={task.priority} size="sm" />
                        </div>

                        {/* Task Title */}
                        <h4 className="font-tech text-xs font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                          {task.title}
                        </h4>

                        {/* Block Reason Warning */}
                        {task.isBlocked && (
                          <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-500/40 text-[10px] font-tech text-rose-300 flex items-start gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                            <span>{task.blockReason || 'Dependency conflict flagged by Sentinel'}</span>
                          </div>
                        )}

                        {/* Milestone Tag */}
                        {linkedMilestone && (
                          <div className="text-[10px] font-tech text-purple-300 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-md inline-block">
                            🎯 {linkedMilestone.code}: {linkedMilestone.name.slice(0, 20)}...
                          </div>
                        )}

                        {/* Assignee & Deadline Info */}
                        <div className="flex items-center justify-between text-[10px] font-tech pt-2 border-t border-white/10">
                          {assignedAgent ? (
                            <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                              <span>{assignedAgent.avatar}</span>
                              <span>{assignedAgent.name}</span>
                            </div>
                          ) : assigneeMember ? (
                            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                              <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[9px] text-cyan-200">
                                {assigneeMember.name[0]}
                              </span>
                              <span>{assigneeMember.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}

                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{task.deadline.slice(0, 10)}</span>
                          </div>
                        </div>

                        {/* Quick Step Buttons (Prev/Next column) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between pt-1 text-[10px] font-tech text-slate-400">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusMove(task.id, task.status, 'PREV');
                            }}
                            className="hover:text-white p-1 rounded hover:bg-white/10 flex items-center gap-0.5"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                            <span>Prev</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTask(task.id, {
                                status: task.status === 'DONE' ? 'TODO' : 'DONE',
                              });
                            }}
                            className="hover:text-emerald-300 p-1 rounded hover:bg-white/10 flex items-center gap-0.5"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>{task.status === 'DONE' ? 'Undo' : 'Done'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusMove(task.id, task.status, 'NEXT');
                            }}
                            className="hover:text-white p-1 rounded hover:bg-white/10 flex items-center gap-0.5"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl frosty-card border border-white/20 p-6 shadow-2xl space-y-5 bg-[#09071c]/40 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-widest">
                  TASK CREATION WIZARD
                </span>
                <h3 className="font-tech text-lg font-bold text-white">Create New Mission Task</h3>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-tech">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Quantum Telemetry Sync Pipeline"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    <optgroup label="AI Sentinels" className="bg-[#0a071d] text-purple-400">
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id} className="bg-[#0a071d] text-purple-300">
                          🤖 {ag.name} ({ag.title})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Human Engineers" className="bg-[#0a071d] text-cyan-400">
                      {members.filter((m) => !m.isAI).map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#0a071d] text-cyan-200">
                          👤 {m.name} ({m.role})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Milestone</label>
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
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-tech text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
