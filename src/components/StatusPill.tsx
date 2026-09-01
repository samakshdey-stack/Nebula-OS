import React from 'react';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  showPulse = true,
}) => {
  const norm = status.toUpperCase().replace(/\s+/g, '_');

  let style = 'border-slate-700 bg-slate-800/60 text-slate-300 shadow-slate-900/40';
  let dotColor = 'bg-slate-400';
  let label = status;

  switch (norm) {
    case 'ACTIVE':
    case 'ON_TRACK':
    case 'IN_PROGRESS':
      style = 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]';
      dotColor = 'bg-cyan-400';
      label = norm === 'ON_TRACK' ? 'On Track' : norm === 'IN_PROGRESS' ? 'In Progress' : 'Active';
      break;

    case 'COMPLETED':
    case 'DONE':
    case 'RESOLVED':
    case 'MITIGATED':
      style = 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
      dotColor = 'bg-emerald-400';
      label = norm === 'COMPLETED' ? 'Completed' : norm === 'DONE' ? 'Done' : 'Mitigated';
      break;

    case 'AT_RISK':
    case 'WARNING':
    case 'MEDIUM':
    case 'HIGH':
    case 'DELAYED':
      style = 'border-amber-500/40 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      dotColor = 'bg-amber-400';
      label = norm === 'AT_RISK' ? 'At Risk' : norm === 'DELAYED' ? 'Delayed' : status;
      break;

    case 'CRITICAL':
    case 'BLOCKED':
    case 'FAILED':
      style = 'border-rose-500/50 bg-rose-950/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]';
      dotColor = 'bg-rose-500';
      label = norm === 'BLOCKED' ? 'Blocked' : 'Critical';
      break;

    case 'ANALYZING':
    case 'PLANNING':
    case 'EXECUTING':
      style = 'border-purple-500/40 bg-purple-950/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]';
      dotColor = 'bg-purple-400';
      label = status;
      break;

    case 'BACKLOG':
    case 'TODO':
    case 'IDLE':
      style = 'border-slate-600/40 bg-slate-900/60 text-slate-300';
      dotColor = 'bg-slate-400';
      label = norm === 'TODO' ? 'Todo' : norm === 'BACKLOG' ? 'Backlog' : 'Idle';
      break;

    default:
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs gap-2'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      id={`status-pill-${status.toLowerCase()}`}
      className={`inline-flex items-center rounded-full font-tech font-medium uppercase tracking-wider border backdrop-blur-md whitespace-nowrap ${sizeClasses} ${style}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (norm === 'ACTIVE' || norm === 'CRITICAL' || norm === 'BLOCKED' || norm === 'AT_RISK' || norm === 'ANALYZING') && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      {label}
    </span>
  );
};
