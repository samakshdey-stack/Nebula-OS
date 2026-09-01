import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Play,
  Layers,
  FileCode,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { StatusPill } from './StatusPill';

export const WorkflowInspector: React.FC = () => {
  const {
    inspectorEntity,
    setInspectorEntity,
    activeProject,
    tasks,
    milestones,
    members,
    risks,
    updateTask,
    resolveRisk,
    executeAIAction,
  } = useNebula();

  if (!inspectorEntity) return null;

  const { type, data } = inspectorEntity;

  const handleQuickResolve = async () => {
    if (type === 'RISK') {
      resolveRisk(data.id);
      setInspectorEntity(null);
    } else if (type === 'TASK') {
      updateTask(data.id, { status: 'DONE', isBlocked: false, blockReason: undefined });
      setInspectorEntity(null);
    }
  };

  const handleAskAiAboutEntity = () => {
    executeAIAction(`Analyze and optimize ${type} ${data.title || data.name}`, activeProject.id);
  };

  return (
    <div
      id="workflow-inspector-panel"
      className="w-80 sm:w-96 bg-[#09061c]/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300 z-30"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-tech uppercase text-purple-400 tracking-widest">
              {type} INSPECTOR
            </div>
            <h3 className="font-display font-bold text-base text-white mt-1 leading-snug">
              {data.title || data.name}
            </h3>
          </div>
          <button
            onClick={() => setInspectorEntity(null)}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Health Pill */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-tech text-white/40">Current Status</span>
          <StatusPill status={data.status || data.health || data.severity || 'ACTIVE'} size="md" />
        </div>

        {/* Core Attributes */}
        <div className="space-y-3 text-xs font-tech">
          {data.priority && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
              <span className="text-white/40">Priority</span>
              <span className="font-bold text-amber-400">{data.priority}</span>
            </div>
          )}

          {data.progress !== undefined && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/40">Completion</span>
                <span className="text-purple-300 font-bold">{data.progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}

          {data.deadline && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
              <span className="text-white/40">Target Deadline</span>
              <span className="text-white/80">{data.deadline}</span>
            </div>
          )}

          {/* Assigned Agent or Human */}
          {(data.assignedAgentId || data.assigneeId) && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
              <span className="text-white/40">Operational Owner</span>
              <div className="flex items-center gap-2 pt-1">
                {data.assignedAgentId ? (
                  <>
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium capitalize">
                      {data.assignedAgentId.replace('_', ' ')} (Autonomous)
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80">
                      {members.find((m) => m.id === data.assigneeId)?.name || 'Team Member'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Incoming Predecessors / Dependencies */}
          {Array.isArray(data.dependencies) && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-white/40">Incoming Predecessors ({data.dependencies.length})</span>
              {data.dependencies.length === 0 ? (
                <div className="text-[11px] text-white/30 italic">No upstream dependencies (Root Node)</div>
              ) : (
                <div className="space-y-1">
                  {(data.dependencies || []).map((depId: string) => {
                    const depTask = tasks.find((t) => t.id === depId);
                    return (
                      <div
                        key={depId}
                        className="text-[11px] p-1.5 rounded-lg bg-black/50 border border-white/5 flex items-center justify-between text-white/70 truncate"
                      >
                        <span className="truncate">{depTask?.title || depId}</span>
                        <span className="text-[9px] px-1.5 rounded bg-white/10 text-white/50 shrink-0">
                          {depTask?.status || 'PREREQ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Outgoing Dependents */}
          {type === 'TASK' && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-white/40">
                Outgoing Dependents ({tasks.filter((t) => Array.isArray(t.dependencies) && t.dependencies.includes(data.id)).length})
              </span>
              <div className="space-y-1">
                {tasks
                  .filter((t) => Array.isArray(t.dependencies) && t.dependencies.includes(data.id))
                  .map((downstream) => (
                    <div
                      key={downstream.id}
                      className="text-[11px] p-1.5 rounded-lg bg-black/50 border border-white/5 flex items-center justify-between text-white/70 truncate"
                    >
                      <span className="truncate">{downstream.title}</span>
                      <span className="text-[9px] px-1.5 rounded bg-white/10 text-white/50 shrink-0">
                        {downstream.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Block Reason & Risk Telemetry */}
          {data.isBlocked && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1 text-rose-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>BLOCKER TELEMETRY DETECTED</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200">
                {data.blockReason || 'Cascade block active from upstream dependency failure.'}
              </p>
            </div>
          )}

          {/* Operational Payload Preview */}
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>OPERATIONAL JSON PAYLOAD</span>
            </div>
            <pre className="text-[9px] text-purple-300/80 font-mono overflow-x-auto max-h-24 p-1">
              {JSON.stringify(
                {
                  id: data.id,
                  type,
                  status: data.status || data.health,
                  priority: data.priority,
                  dependencies: data.dependencies,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleQuickResolve}
          className="w-full py-2.5 px-4 rounded-xl font-tech text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>MARK RESOLVED / COMPLETE</span>
        </button>

        <button
          onClick={handleAskAiAboutEntity}
          className="w-full py-2 px-4 rounded-xl font-tech text-xs text-purple-200 bg-purple-950/50 hover:bg-purple-950/80 border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI Sentinel to Optimize</span>
        </button>
      </div>
    </div>
  );
};
