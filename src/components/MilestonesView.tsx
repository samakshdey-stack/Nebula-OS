import React, { useState } from 'react';
import {
  Flag,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Target,
  FileCheck,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { Milestone, Task } from '../types';
import { StatusPill } from './StatusPill';

export const MilestonesView: React.FC = () => {
  const {
    activeProject,
    milestones,
    tasks,
    members,
    agents,
    updateTask,
    createMilestone,
    setInspectorEntity,
  } = useNebula();

  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state
  const [newCode, setNewCode] = useState('M01');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('Sep 15, 2026');

  const projectMilestones = milestones.filter((m) => m.projectId === activeProject.id);

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredMilestones = projectMilestones.filter((m) => {
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  const totalMilestones = projectMilestones.length;
  const completedMilestones = projectMilestones.filter((m) => m.status === 'COMPLETED').length;
  const overallProgress =
    totalMilestones > 0
      ? Math.round(
          projectMilestones.reduce((sum, m) => sum + m.progress, 0) / totalMilestones
        )
      : 0;

  return (
    <div id="milestones-view" className="space-y-6">
      {/* Top Banner & Progress Tally */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl frosty-card space-y-2 shadow-xl">
          <span className="text-[10px] font-tech uppercase tracking-widest text-slate-400 font-bold">
            OVERALL MILESTONE PROGRESS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-tech text-white">{overallProgress}%</span>
            <span className="text-xs font-tech text-purple-300">
              {completedMilestones} of {totalMilestones} Completed
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl frosty-card-cyan space-y-1 shadow-xl">
          <span className="text-[10px] font-tech uppercase tracking-widest text-cyan-300 font-bold">
            NEXT TARGET DATE
          </span>
          <div className="text-2xl font-bold font-tech text-white mt-1">
            {projectMilestones.find((m) => m.status === 'IN_PROGRESS')?.targetDate || 'Aug 31, 2026'}
          </div>
          <p className="text-xs font-tech text-cyan-400/80">
            Phase 1 Showcase & Hackathon Evaluation Submission
          </p>
        </div>

        <div className="p-5 rounded-2xl frosty-card-violet flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech uppercase tracking-widest text-purple-300 font-bold">
              ROADMAP PIPELINE
            </span>
            <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
              REAL-TIME GATING
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-tech text-slate-300">Target Launch Readiness:</span>
            <span className="text-sm font-bold font-tech text-emerald-400">92.4%</span>
          </div>
        </div>
      </div>

      {/* Filter & Controls Omnibar */}
      <div className="p-4 rounded-2xl frosty-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/10 p-1 text-xs font-tech backdrop-blur-md">
            {['ALL', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'PENDING'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>NEW MILESTONE</span>
        </button>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {filteredMilestones.length === 0 ? (
          <div className="p-10 rounded-2xl frosty-card text-center space-y-3 border border-white/10">
            <Target className="w-10 h-10 text-purple-400 mx-auto" />
            <h3 className="font-tech text-base font-bold text-white">No Milestones Defined Yet</h3>
            <p className="text-xs text-white/50 font-sans max-w-md mx-auto">
              Break down this project's roadmap into deliverable phases and link sub-tasks.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-tech font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Define First Milestone</span>
            </button>
          </div>
        ) : (
          filteredMilestones.map((milestone, idx) => {
          const linkedTasks = tasks.filter((t) => t.milestoneId === milestone.id);
          const completedTasks = linkedTasks.filter((t) => t.status === 'DONE').length;
          const isExpanded = expandedMilestones[milestone.id] !== false;

          return (
            <div
              key={milestone.id}
              id={`milestone-card-${milestone.id}`}
              className="rounded-2xl frosty-card overflow-hidden shadow-2xl transition-all hover:border-white/25"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(milestone.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-white/[0.015] hover:bg-white/[0.04] transition-colors border-b border-white/5"
              >
                <div className="flex items-start md:items-center gap-3.5">
                  <button className="text-slate-400 hover:text-white p-0.5 mt-0.5 md:mt-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center font-tech font-bold text-xs text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] backdrop-blur-md">
                    {milestone.code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-tech font-bold text-sm text-white">
                        {milestone.name}
                      </h3>
                      <StatusPill status={milestone.status} size="sm" />
                    </div>
                    <p className="text-xs font-sans text-slate-400 mt-0.5 max-w-xl">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Progress & Target Date */}
                <div className="flex items-center gap-6 self-end md:self-auto text-xs font-tech">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target: {milestone.targetDate}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {linkedTasks.length > 0
                        ? `${completedTasks}/${linkedTasks.length} Sub-Tasks Done`
                        : 'No tasks linked yet'}
                    </div>
                  </div>

                  <div className="w-28 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-purple-300">{milestone.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          milestone.status === 'COMPLETED'
                            ? 'bg-emerald-400'
                            : milestone.status === 'AT_RISK'
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-cyan-400 to-purple-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Sub-Tasks Checklist */}
              {isExpanded && (
                <div className="p-5 space-y-3">
                  <div className="text-[10px] font-tech uppercase tracking-widest text-slate-400 font-bold px-1">
                    LINKED MISSION DELIVERABLES & SUB-TASKS ({linkedTasks.length})
                  </div>

                  {linkedTasks.length === 0 ? (
                    <div className="py-6 text-center text-xs font-tech text-slate-500 border border-dashed border-white/10 rounded-xl">
                      No sub-tasks attached to this milestone milestone yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {linkedTasks.map((t) => {
                        const assigneeMember = members.find((m) => m.id === t.assigneeId);
                        const assignedAgent = agents.find((a) => a.id === t.assignedAgentId);

                        return (
                          <div
                            key={t.id}
                            onClick={() => setInspectorEntity({ type: 'TASK', data: t })}
                            className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                              t.status === 'DONE'
                                ? 'frosty-card-emerald'
                                : t.isBlocked
                                ? 'frosty-card-rose'
                                : 'frosty-card frosty-card-interactive hover:border-purple-400/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTask(t.id, {
                                    status: t.status === 'DONE' ? 'TODO' : 'DONE',
                                  });
                                }}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                  t.status === 'DONE'
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-white/30 hover:border-cyan-400 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </button>

                              <span
                                className={`font-tech text-xs font-bold truncate ${
                                  t.status === 'DONE'
                                    ? 'line-through text-slate-400'
                                    : 'text-white group-hover:text-cyan-200'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-[10px] font-tech text-slate-400">
                              {assignedAgent ? (
                                <span className="text-purple-300">🤖 {assignedAgent.name}</span>
                              ) : assigneeMember ? (
                                <span className="text-cyan-300">👤 {assigneeMember.name.split(' ')[0]}</span>
                              ) : null}
                              <StatusPill status={t.status} size="sm" />
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
        }))}
      </div>

      {/* Add Milestone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl frosty-card border border-white/20 p-6 shadow-2xl space-y-5 bg-[#09071c]/40 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-widest">
                  ROADMAP PROTOCOL
                </span>
                <h3 className="font-tech text-lg font-bold text-white">Create New Milestone</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                createMilestone({
                  projectId: activeProject.id,
                  code: newCode,
                  name: newName,
                  description: newDesc,
                  targetDate: newTargetDate,
                });
                setNewName('');
                setNewDesc('');
                setIsAddModalOpen(false);
              }}
              className="space-y-4 text-xs font-tech"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-300 block mb-1 font-semibold">Milestone Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Multi-Cluster Zero-Knowledge Testnet"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables, validation requirements, and sign-off criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Target Completion Date</label>
                <input
                  type="text"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-tech text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Deploy Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
