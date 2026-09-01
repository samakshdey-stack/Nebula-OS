import React, { useState } from 'react';
import { CalendarCheck, Play, Sparkles, Clock, CheckCircle2, Bot, Video, FileText } from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { CommandMeetDispatcher } from './CommandMeetDispatcher';

export const MeetingAutomationView: React.FC = () => {
  const { executeAIAction } = useNebula();
  const [isRunning, setIsRunning] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    summary: string;
    actionItems: string[];
    riskPatched: string;
  } | null>(null);

  const handleSimulateMeetingExtraction = async () => {
    setIsRunning(true);
    setTranscriptResult(null);

    await executeAIAction('Summarize meeting transcript and extract autonomous tasks');

    setTimeout(() => {
      setIsRunning(false);
      setTranscriptResult({
        summary:
          'INNtelligence Sprint Alignment: Team reviewed WebSocket single-point contention on Live Threat Stream. Risk Agent identified mitigation strategy and assigned fix to Sentinel Core.',
        actionItems: [
          'Sentinel Core: Deploy redundant WebSocket failover cluster to unblock Task #7',
          'Samaksh Dey: Verify downstream integration with Analytics Sink',
          'Planning Agent: Recalculate MVP milestone target delivery',
        ],
        riskPatched: 'Risk #R-102 auto-mitigation scheduled for immediate deployment.',
      });
    }, 1200);
  };

  return (
    <div id="meeting-automation-view" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <section className="p-6 sm:p-8 rounded-2xl frosty-card shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.4em] text-purple-400 font-bold mb-1 font-tech">
              AUTOMATED STANDUP INGESTION // DAG GENERATOR
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
              MEETING{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                AUTOMATION
              </span>
            </h1>
            <p className="text-white/40 text-xs sm:text-sm font-sans max-w-2xl">
              Extract technical action items, update DAG dependencies, and dispatch AI sentinels directly from audio transcripts and standup logs.
            </p>
          </div>

          <button
            onClick={handleSimulateMeetingExtraction}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isRunning ? 'EXTRACTING...' : 'RUN STANDUP INGESTION'}</span>
          </button>
        </div>
      </section>

      {/* Live Google Meet Session & Gmail Dispatcher Section */}
      <CommandMeetDispatcher />

      {/* Output Card */}
      {transcriptResult && (
        <section className="p-6 rounded-2xl frosty-card space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center gap-2 text-purple-300 font-tech text-sm font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            <span>STANDUP INGESTION & DAG MUTATION COMPLETE</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-tech uppercase text-white/40">Executive Summary:</span>
            <p className="text-xs font-sans text-white/80 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
              {transcriptResult.summary}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-tech uppercase text-white/40">
              Extracted Autonomous Action Items:
            </span>
            <div className="space-y-1.5">
              {(transcriptResult.actionItems || []).map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-tech text-white/80 flex items-center gap-2 backdrop-blur-sm"
                >
                  <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-tech text-emerald-300 backdrop-blur-sm">
            {transcriptResult.riskPatched}
          </div>
        </section>
      )}

      {/* Recent Meeting Transcripts List */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-tech">
          RECENT HACKATHON STANDUP LOGS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Atlas Core Sync #14',
              date: 'Today, 9:00 AM',
              duration: '18 min',
              attendees: 'Samaksh Dey, Aman Kahar, PM Agent',
              status: 'Extracted & Mutated',
            },
            {
              title: 'NovaMed Clinical Checkpoint',
              date: 'Yesterday, 4:30 PM',
              duration: '25 min',
              attendees: 'Marcus, AI Sentinel',
              status: 'Processed',
            },
          ].map((m) => (
            <div
              key={m.title}
              className="p-5 rounded-2xl frosty-card space-y-2 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-tech text-sm font-bold text-white">{m.title}</h3>
                <span className="text-[10px] font-tech px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {m.status}
                </span>
              </div>
              <div className="text-xs font-tech text-white/40 flex gap-4">
                <span>{m.date}</span>
                <span>•</span>
                <span>{m.duration}</span>
              </div>
              <div className="text-xs font-tech text-white/70 pt-2 border-t border-white/10">
                Attendees: {m.attendees}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
