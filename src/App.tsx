/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NebulaProvider, useNebula } from './context/NebulaContext';
import { CosmicBackground } from './components/CosmicBackground';
import { NavigationRail } from './components/NavigationRail';
import { HeaderOmnibar } from './components/HeaderOmnibar';
import { LandingPage } from './components/LandingPage';
import { CommandCenterView } from './components/CommandCenterView';
import { PortfolioUniverseView } from './components/PortfolioUniverseView';
import { ProjectWorkspaceView } from './components/ProjectWorkspaceView';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AICommandCenterView } from './components/AICommandCenterView';
import { AIAgentsView } from './components/AIAgentsView';
import { RiskEngineView } from './components/RiskEngineView';
import { ActivityView } from './components/ActivityView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ProjectDatabaseView } from './components/ProjectDatabaseView';
import { MeetingAutomationView } from './components/MeetingAutomationView';
import { TeamChatView } from './components/TeamChatView';
import { SettingsView } from './components/SettingsView';
import { MvpDemoGuideModal } from './components/MvpDemoGuideModal';

const AppInner: React.FC = () => {
  const { currentView, isWarping } = useNebula();

  const renderActiveView = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage />;
      case 'COMMAND_CENTER':
        return <CommandCenterView />;
      case 'PORTFOLIO':
        return <PortfolioUniverseView />;
      case 'PROJECTS':
      case 'KANBAN':
      case 'MILESTONES':
        return <ProjectWorkspaceView />;
      case 'PROJECT_DATABASE':
        return <ProjectDatabaseView />;
      case 'TEAM_CHAT':
        return <TeamChatView />;
      case 'WORKFLOW':
        return (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-100 tracking-tight">
                WORKFLOW CANVAS & DAG TOPOLOGY
              </h1>
              <p className="text-xs sm:text-sm font-tech text-cyan-400/80 mt-1">
                Visual node graph modeling project tasks, agents, milestones, and cascading risks.
              </p>
            </div>
            <WorkflowCanvas />
          </div>
        );
      case 'AI_COMMAND':
        return <AICommandCenterView />;
      case 'AI_AGENTS':
        return <AIAgentsView />;
      case 'RISK_ENGINE':
        return <RiskEngineView />;
      case 'ACTIVITY':
        return <ActivityView />;
      case 'KNOWLEDGE_BASE':
        return <KnowledgeBaseView />;
      case 'MEETINGS':
        return <MeetingAutomationView />;
      case 'SETTINGS':
        return <SettingsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#02010a] text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Layer 1: Persistent Cosmic Background Simulation */}
      <CosmicBackground isWarping={isWarping} />

      {/* Warp Speed Acceleration Overlay */}
      {isWarping && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-purple-950/20 backdrop-blur-[2px] animate-pulse">
          <div className="text-purple-300 font-tech font-bold text-sm tracking-widest bg-[#09061c]/90 px-6 py-2.5 rounded-full border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.6)]">
            WARP TRANSITION ACTIVE // HYPERSPACE ENGAGED
          </div>
        </div>
      )}

      {/* Main UI Layout */}
      {currentView === 'LANDING' ? (
        <div className="relative z-10">
          <LandingPage />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Top Full-Width Holographic Omnibar Header */}
          <HeaderOmnibar />

          {/* Body Container with Sidebar & Main Content */}
          <div className="flex-1 flex min-w-0">
            {/* Left Holographic Navigation Rail */}
            <NavigationRail />

            {/* Main Dynamic Content Area */}
            <main className="flex-1 ml-16 md:ml-[210px] xl:ml-[220px] min-w-0 pb-12 transition-all duration-300">
              {renderActiveView()}
            </main>
          </div>
        </div>
      )}


      {/* Interactive 7-Step MVP Demonstration Walkthrough Guide Modal */}
      <MvpDemoGuideModal />
    </div>
  );
};

export default function App() {
  return (
    <NebulaProvider>
      <AppInner />
    </NebulaProvider>
  );
}
