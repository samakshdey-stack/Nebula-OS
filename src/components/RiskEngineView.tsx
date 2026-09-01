import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Zap,
  ArrowRight,
  GitFork,
  Bot,
  Activity,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { StatusPill } from './StatusPill';

export const RiskEngineView: React.FC = () => {
  const { risks, projects, tasks, resolveRisk, runSimulatedEvent, executeAIAction } = useNebula();

  const openRisks = risks.filter((r) => r.status === 'OPEN');
  const resolvedRisks = risks.filter((r) => r.status === 'MITIGATED');

  const handleMitigateAll = () => {
    executeAIAction('Fix all high-priority blockers and resolve cascading risk vectors');
  };

  return (
    <div id="risk-engine-view" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-2xl frosty-card border border-rose-500/20 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.4em] text-rose-400 font-bold mb-1 font-tech">
              THREAT RADAR // 4-CLASS CASCADING RISK ENGINE
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
              RISK ENGINE &{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-rose-400">
                THREAT RADAR
              </span>
            </h1>
            <p className="text-white/40 text-xs sm:text-sm font-sans max-w-2xl">
              Proactive threat detection modeling blast radius, downstream dependency propagation, and autonomous auto-mitigation algorithms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runSimulatedEvent('TASK_OVERDUE')}
              className="px-4 py-2 rounded-xl font-tech text-xs text-rose-300 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Trigger Anomaly</span>
            </button>
            <button
              onClick={handleMitigateAll}
              className="px-5 py-2.5 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>AUTO-MITIGATE ALL</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Risk Classes Overview Bar (Section 25) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: '1. OVERDUE TASK RISK',
            desc: 'Task exceeds deadline and delays next immediate predecessor.',
            severity: 'MEDIUM',
            color: 'text-amber-400',
            cardClass: 'frosty-card-amber',
          },
          {
            title: '2. BLOCKED DEPENDENCY',
            desc: 'Critical path blocker freezing multiple downstream executors.',
            severity: 'HIGH',
            color: 'text-orange-400',
            cardClass: 'frosty-card-amber',
          },
          {
            title: '3. MILESTONE RISK',
            desc: 'Aggregate delivery pace threatens hackathon target demo.',
            severity: 'HIGH',
            color: 'text-purple-400',
            cardClass: 'frosty-card-violet',
          },
          {
            title: '4. CRITICAL FAILURE',
            desc: 'Unmitigated blocker causing cascade failure of mission delivery.',
            severity: 'CRITICAL',
            color: 'text-rose-400',
            cardClass: 'frosty-card-rose',
          },
        ].map((rc) => (
          <div
            key={rc.title}
            className={`p-4 rounded-xl ${rc.cardClass} space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-tech text-xs font-bold ${rc.color}`}>{rc.title}</span>
              <StatusPill status={rc.severity} size="sm" />
            </div>
            <p className="text-[11px] font-sans text-white/50 leading-relaxed">{rc.desc}</p>
          </div>
        ))}
      </section>

      {/* Active Threats List with Blast Radius */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-tech">
          ACTIVE THREATS & PROPAGATION BLAST RADIUS ({openRisks.length})
        </h2>

        <div className="space-y-4">
          {openRisks.length === 0 ? (
            <div className="p-8 rounded-2xl frosty-card text-center space-y-3 border border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-tech text-sm font-bold text-white">All Systems Operational</h3>
              <p className="text-xs text-white/50 font-sans max-w-md mx-auto">
                No active threats or blocked dependencies detected across your project portfolio.
              </p>
            </div>
          ) : (
            openRisks.map((risk) => {
            const proj = projects.find((p) => p.id === risk.projectId);
            return (
              <div
                key={risk.id}
                className="p-6 rounded-2xl frosty-card-rose space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 backdrop-blur-md">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-tech text-sm font-bold text-white">{risk.title}</h3>
                      <span className="text-xs font-tech text-purple-400">
                        Project: {proj?.name || risk.projectId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={risk.severity} size="sm" />
                    <button
                      onClick={() => resolveRisk(risk.id)}
                      className="px-4 py-1.5 rounded-xl font-tech text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      Resolve Threat
                    </button>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed font-sans">{risk.description}</p>

                {/* Risk Propagation Flow Tree (Section 26) */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 backdrop-blur-sm">
                  <span className="text-[10px] font-tech text-white/40 uppercase tracking-wider">
                    PROPAGATION PATHWAY:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-tech">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300">
                      Task #7 (Ingestion Failure)
                    </span>
                    <ArrowRight className="w-4 h-4 text-rose-400" />
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300">
                      Downstream Tasks (3 Blocked)
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/40 text-purple-300">
                      Milestone MVP (Delayed)
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/40 text-indigo-300">
                      Project Atlas (At Risk)
                    </span>
                  </div>
                </div>

                {/* Recommended Mitigation */}
                {(risk.mitigationAction || risk.suggestedAction) && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs font-tech text-purple-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{risk.mitigationAction || risk.suggestedAction}</span>
                    </div>
                    <button
                      onClick={() => resolveRisk(risk.id)}
                      className="text-purple-400 hover:text-purple-200 underline shrink-0 pl-2 cursor-pointer"
                    >
                      Apply Patch →
                    </button>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </section>

      {/* Resolved Mitigations History */}
      {resolvedRisks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 font-tech">
            RESOLVED THREAT HISTORY ({resolvedRisks.length})
          </h2>
          <div className="space-y-2">
            {resolvedRisks.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl frosty-card-emerald flex items-center justify-between text-xs font-tech"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 font-bold">{r.title}</span>
                </div>
                <StatusPill status="RESOLVED" size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
