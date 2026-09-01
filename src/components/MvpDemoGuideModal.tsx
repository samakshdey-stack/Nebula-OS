import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  Globe2,
  GitFork,
  Zap,
  ShieldCheck,
  Bot,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

export const MvpDemoGuideModal: React.FC = () => {
  const {
    isDemoGuideOpen,
    setIsDemoGuideOpen,
    warpTo,
    setCurrentView,
    setActiveProjectId,
    runSimulatedEvent,
    executeAIAction,
    resetToDefaults,
  } = useNebula();

  const [currentStep, setCurrentStep] = useState(1);

  if (!isDemoGuideOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: The Cosmic Entrance',
      desc: 'Enter the operational universe of Nebula OS from the cinematic landing console.',
      actionLabel: 'Execute: Enter Nebula',
      action: () => {
        warpTo('COMMAND_CENTER');
        setCurrentStep(2);
      },
    },
    {
      step: 2,
      title: 'Step 2: Command Center Pacing',
      desc: 'Inspect real-time hackathon metrics, active projects, live mission feed, and team velocity flux.',
      actionLabel: 'Execute: Explore Universe',
      action: () => {
        warpTo('PORTFOLIO');
        setCurrentStep(3);
      },
    },
    {
      step: 3,
      title: 'Step 3: Celestial Portfolio Map',
      desc: 'Observe projects as orbiting planets with spectral glow states. Initiate hyperspace zoom into INNtelligence.',
      actionLabel: 'Execute: Zoom into INNtelligence',
      action: () => {
        setActiveProjectId('proj_innd');
        warpTo('PROJECTS', 'proj_innd');
        setCurrentStep(4);
      },
    },
    {
      step: 4,
      title: 'Step 4: Project Workspace & DAG',
      desc: 'Inspect INNtelligence Kanban, milestones, and switch to the holographic Workflow Canvas DAG.',
      actionLabel: 'Execute: Open Workflow Canvas',
      action: () => {
        setCurrentView('WORKFLOW');
        setCurrentStep(5);
      },
    },
    {
      step: 5,
      title: 'Step 5: Trigger Risk Simulation Anomaly',
      desc: 'Simulate an overdue threat ingestion task to witness cascading failure across downstream DAG nodes.',
      actionLabel: 'Execute: Trigger Task Overdue Anomaly',
      action: () => {
        runSimulatedEvent('TASK_OVERDUE', 'proj_innd');
        setCurrentStep(6);
      },
    },
    {
      step: 6,
      title: 'Step 6: Observe Cascading Risk Blast Radius',
      desc: 'Task #7 lights up with red hazard lines. Open the Risk Engine to inspect propagation pathway.',
      actionLabel: 'Execute: Open Risk Engine Radar',
      action: () => {
        setCurrentView('RISK_ENGINE');
        setCurrentStep(7);
      },
    },
    {
      step: 7,
      title: 'Step 7: Autonomous Sentinel Auto-Mitigation',
      desc: 'Dispatch the Risk Agent to auto-patch threat streams, unblock downstream tasks, and log resolution.',
      actionLabel: 'Execute: AI Auto-Mitigate Blocker',
      action: async () => {
        await executeAIAction('Fix the highest-priority blocker in INNtelligence', 'proj_innd');
        setCurrentView('COMMAND_CENTER');
      },
    },
  ];

  const activeStepObj = steps.find((s) => s.step === currentStep) || steps[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#09071c]/40 backdrop-blur-2xl frosty-card border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base sm:text-lg font-bold text-slate-100 tracking-wider">
                MVP DEMONSTRATION WALKTHROUGH
              </h3>
              <p className="text-xs font-tech text-purple-300/80">
                SECTION 40: COMPLETE 7-STEP OPERATIONAL CORE LOOP
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoGuideOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex-1 min-w-[32px] py-1 rounded-lg text-xs font-tech font-bold transition-all text-center cursor-pointer ${
                s.step === currentStep
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : s.step < currentStep
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-500 border border-white/5'
              }`}
            >
              0{s.step}
            </button>
          ))}
        </div>

        {/* Step Card Details */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold text-cyan-400 uppercase tracking-widest">
              ACTIVE STAGE {activeStepObj.step} OF 7
            </span>
            <span className="text-xs font-tech text-slate-400">
              {activeStepObj.step === 7 ? 'FINAL OBJECTIVE' : 'IN PROGRESS'}
            </span>
          </div>

          <h4 className="font-display font-bold text-lg text-slate-100">{activeStepObj.title}</h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">{activeStepObj.desc}</p>

          <button
            onClick={activeStepObj.action}
            className="w-full py-3 rounded-xl font-tech text-xs font-bold tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>{activeStepObj.actionLabel}</span>
          </button>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-tech">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={() => setIsDemoGuideOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
