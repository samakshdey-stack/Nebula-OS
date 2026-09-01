import React, { useState } from 'react';
import {
  Terminal,
  Bot,
  Sparkles,
  Send,
  ShieldAlert,
  CheckCircle2,
  Zap,
  ArrowRight,
  Code,
  Layers,
  Cpu,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { MarkdownRenderer } from './MarkdownRenderer';

export const AICommandCenterView: React.FC = () => {
  const { activeProject, activeProjectId, projects, executeAIAction } = useNebula();

  const [inputCommand, setInputCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId);

  const [history, setHistory] = useState<
    Array<{
      id: string;
      prompt: string;
      timestamp: string;
      agentName: string;
      actionSummary: string;
      mutatedEntities: string[];
      steps: string[];
    }>
  >([
    {
      id: 'trace_01',
      prompt: 'What is blocking INNtelligence?',
      timestamp: '10:42 AM',
      agentName: 'Risk Mitigation Agent',
      actionSummary:
        'Detected high-severity blocker on Task #7 (WebSocket Single-Point Contention on Threat Stream). Causing cascade hold on Stage 2 and downstream Milestone MVP.',
      mutatedEntities: ['Task #7', 'Risk #R-102', 'DAG Vector #4'],
      steps: [
        'Parsing natural language intent via Gemini semantic router',
        'Loading INNtelligence dependency DAG and telemetry state',
        'Identified task_07 in BLOCKED state with threat stream socket failure',
        'Evaluated downstream blast radius: 3 tasks, 1 milestone at risk',
      ],
    },
  ]);

  const handleExecute = async (promptToRun?: string) => {
    const query = promptToRun || inputCommand;
    if (!query.trim()) return;

    setIsExecuting(true);

    try {
      const res = await executeAIAction(query, selectedProjectId);
      setHistory((prev) => [
        {
          id: `trace_${Date.now()}`,
          prompt: query,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: res.agentName,
          actionSummary: res.actionSummary,
          mutatedEntities:
            (res as any).mutatedEntities ||
            (res as any).mutationsMade || [
              'Task State Synchronized',
              'Activity Stream Updated',
            ],
          steps:
            (res as any).executionPlan ||
            (res.detailedResponse
              ? res.detailedResponse
                  .split('\n')
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0 && !s.startsWith('EXECUTIVE BRIEFING') && !s.startsWith('RISK ENGINE DIAGNOSTIC'))
              : ['Intent parsed via Gemini engine', 'Autonomous dispatch executed', 'State persisted']),
        },
        ...prev,
      ]);
      setInputCommand('');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div id="ai-command-center-view" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-2xl frosty-card shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.4em] text-purple-400 font-bold mb-1 font-tech">
              AUTONOMOUS AGENT ORCHESTRATION // GEMINI RUNTIME
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
              AI COMMAND{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                CENTER
              </span>
            </h1>
            <p className="text-white/40 text-xs sm:text-sm font-sans max-w-2xl">
              Dispatch autonomous agents to mutate database state, generate DAG topologies, resolve blockers, and orchestrate project lifecycles.
            </p>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-tech text-white/40">Target:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-tech text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#09061c] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset Command Pills */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <span className="text-[10px] font-tech uppercase text-white/40 tracking-wider">
            HIGH-PRIORITY DIRECTIVES:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Query Project Database & PRD',
              'What is blocking INNtelligence?',
              'Fix the highest-priority blocker',
              'Summarize INNtelligence sprint status',
              'Create milestone MVP for INNtelligence',
              'Assign threat analysis to Risk Agent',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => handleExecute(preset)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-xs font-tech text-white/70 hover:text-purple-200 transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <span>{preset}</span>
                <ArrowRight className="w-3 h-3 text-purple-400 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Input Box */}
      <section className="p-6 rounded-2xl frosty-card space-y-4 shadow-2xl">
        <div className="flex items-center justify-between text-xs font-tech text-purple-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>NEBULA PROMPT TERMINAL</span>
          </div>
          <span className="text-white/40">Autonomous Execution Mode: ACTIVE</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecute();
          }}
          className="relative"
        >
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            placeholder="Type any command: e.g. 'Fix the highest-priority blocker in INNtelligence'..."
            className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 focus:border-purple-400 text-sm font-tech text-white placeholder-white/30 focus:outline-none shadow-inner backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={isExecuting || !inputCommand.trim()}
            className="absolute right-2 top-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-bold text-xs font-tech disabled:opacity-40 transition-all hover:brightness-110 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
          >
            {isExecuting ? 'DISPATCHING...' : 'EXECUTE'}
          </button>
        </form>
      </section>

      {/* Execution Telemetry Traces */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-tech">
          EXECUTION TELEMETRY STREAM
        </h2>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl frosty-card space-y-4 shadow-xl animate-in fade-in"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold text-xs font-tech">DIRECTIVE:</span>
                    <span className="font-tech text-sm text-white font-bold">
                      "{item.prompt}"
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-tech text-white/50">
                    <span>AGENT: {item.agentName}</span>
                    <span>•</span>
                    <span>TIMESTAMP: {item.timestamp}</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-tech backdrop-blur-sm">
                  MUTATION SUCCESSFUL
                </div>
              </div>

              {/* Action Summary */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-sans text-white/90 leading-relaxed backdrop-blur-sm overflow-x-auto">
                <MarkdownRenderer content={item.actionSummary} />
              </div>

              {/* Execution Steps */}
              <div className="space-y-1.5 text-xs font-tech">
                <span className="text-white/40 uppercase text-[10px] tracking-wider">
                  EXECUTION TRACE LOGS:
                </span>
                <div className="space-y-1">
                  {(item.steps || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-white/70 flex items-center gap-2 backdrop-blur-sm"
                    >
                      <span className="text-purple-400 font-mono">0{idx + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mutated Entities Badges */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs font-tech">
                <span className="text-white/40">Mutated State:</span>
                {(item.mutatedEntities || []).map((ent) => (
                  <span
                    key={ent}
                    className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] backdrop-blur-sm"
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
