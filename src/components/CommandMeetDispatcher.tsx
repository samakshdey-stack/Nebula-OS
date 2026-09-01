import React, { useState } from 'react';
import {
  Video,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  Eye,
  X,
  Check,
  Link,
  ChevronDown,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import {
  createGoogleMeetSpace,
  generateGoogleMeetUrl,
  normalizeMeetUrl,
  sendGmailMeetingInvitation,
  generateCalendarEventUrl,
  generateMeetInvitationHtml,
  generateGmailWebComposeUrl,
  SendMeetingInviteParams,
} from '../utils/googleWorkspace';
import { Meeting } from '../types';

export const CommandMeetDispatcher: React.FC = () => {
  const {
    projects,
    activeProjectId,
    members,
    googleAuth,
    firebaseUser,
    connectGoogleWorkspace,
    addActivityLog,
  } = useNebula();

  const [isOpen, setIsOpen] = useState(true);
  const [meetingTopic, setMeetingTopic] = useState('Nebula Constellation & Architecture Sync');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects[0]?.id || 'proj_innd');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('16:30');
  const [durationMinutes, setDurationMinutes] = useState(45);
  // Real Google Meet Room URL - pre-initialized so it is instantly ready
  const [meetUrl, setMeetUrl] = useState(() => generateGoogleMeetUrl());
  const [meetSpaceName, setMeetSpaceName] = useState('');
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [isRealProvisioned, setIsRealProvisioned] = useState(false);
  const [autoStartOnDispatch, setAutoStartOnDispatch] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Error & Status Feedback
  const [sendError, setSendError] = useState<string | null>(null);

  // Recipients - Empty by default (no hardcoded presets)
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState('');

  // Helper to parse single or multiple/pasted emails (comma, space, semicolon, newline separated)
  const parseAndAddEmails = (input: string) => {
    const raw = input.trim();
    if (!raw) return;

    // Split by commas, semicolons, newlines, spaces
    const tokens = raw.split(/[\s,;]+/).map((t) => t.trim().replace(/^<|>$/g, '')).filter(Boolean);
    const valid: string[] = [];
    const invalid: string[] = [];

    tokens.forEach((token) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token) || (token.includes('@') && token.includes('.'));
      if (isEmail) {
        valid.push(token.toLowerCase());
      } else {
        invalid.push(token);
      }
    });

    if (valid.length === 0 && invalid.length > 0) {
      setSendError(`"${invalid.join(', ')}" is not a valid email address.`);
      return;
    }

    setRecipients((prev) => {
      const next = [...prev];
      valid.forEach((em) => {
        if (!next.includes(em)) {
          next.push(em);
        }
      });
      return next;
    });

    setNewRecipientInput('');
    setSendError(null);
  };

  const handleToggleTeamMember = (memberEmail: string) => {
    if (!memberEmail) return;
    const lower = memberEmail.toLowerCase();
    setRecipients((prev) => {
      if (prev.includes(lower)) {
        return prev.filter((e) => e !== lower);
      } else {
        return [...prev, lower];
      }
    });
    setSendError(null);
  };

  const handleClearAllRecipients = () => {
    setRecipients([]);
    setSendError(null);
  };

  // Agenda
  const [agenda, setAgenda] = useState<string[]>([
    'Review critical path dependency DAG & WebSocket performance',
    'Assign real-time Risk Sentinel blocker mitigations',
    'Verify Google Meet, Gmail and Project Database sync',
  ]);
  const [newAgendaInput, setNewAgendaInput] = useState('');

  const [hostNotes, setHostNotes] = useState('Please review the active Constellation specs and Project Database PRD before joining.');

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendSuccessResult, setSendSuccessResult] = useState<{
    messageId?: string;
    recipientsCount: number;
    meetUrl: string;
    timestamp: string;
    autoStarted?: boolean;
  } | null>(null);

  // Quick Preset Handlers
  const applyPreset = (preset: {
    topic: string;
    duration: number;
    agenda: string[];
    notes: string;
  }) => {
    setMeetingTopic(preset.topic);
    setDurationMinutes(preset.duration);
    setAgenda(preset.agenda);
    setHostNotes(preset.notes);
  };

  const handleGenerateMeet = async () => {
    setIsGeneratingMeet(true);
    setSendError(null);
    try {
      let token = googleAuth.accessToken;
      if (!token) {
        const authRes = await connectGoogleWorkspace();
        token = authRes.accessToken;
      }
      const result = await createGoogleMeetSpace(token, { topic: meetingTopic });
      setMeetUrl(result.meetingUri);
      setMeetSpaceName(result.name);
      setIsRealProvisioned(result.isRealProvisioned);

      if (result.isRealProvisioned) {
        addActivityLog({
          actor: { name: googleAuth.userName || firebaseUser?.displayName || 'Operator', isAI: false },
          action: 'Provisioned Google Meet Shared Space',
          entityName: meetingTopic,
          entityType: 'MEETING',
          projectId: selectedProjectId,
          details: `Provisioned genuine Google Meet room on Google servers: ${result.meetingUri}`,
          status: 'SUCCESS',
        });
      } else {
        addActivityLog({
          actor: { name: googleAuth.userName || firebaseUser?.displayName || 'Operator', isAI: false },
          action: 'Configured Google Meet Room Link',
          entityName: meetingTopic,
          entityType: 'MEETING',
          projectId: selectedProjectId,
          details: `Configured meeting room: ${result.meetingUri}`,
          status: 'SUCCESS',
        });
      }
    } catch (err: any) {
      console.warn('Could not generate Meet space automatically:', err);
      const fallbackUrl = generateGoogleMeetUrl();
      setMeetUrl(fallbackUrl);
      setIsRealProvisioned(false);
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const handleOpenMeetNew = () => {
    window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
  };

  const handleStartHostMeeting = () => {
    const url = meetUrl ? normalizeMeetUrl(meetUrl) : generateGoogleMeetUrl();
    if (!meetUrl) setMeetUrl(url);
    
    // Open room in a new browser tab
    try {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        // Direct fallback if popup blocker was triggered
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }

    addActivityLog({
      actor: { name: googleAuth.userName || firebaseUser?.displayName || 'Operator', isAI: false },
      action: 'Launched Live Google Meet Session',
      entityName: meetingTopic,
      entityType: 'MEETING',
      projectId: selectedProjectId,
      details: `Active host session started at ${url}`,
      status: 'SUCCESS',
    });
  };

  const handleCopyLink = () => {
    if (!meetUrl) return;
    const cleanUrl = normalizeMeetUrl(meetUrl);
    navigator.clipboard.writeText(cleanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyBriefing = () => {
    const targetProject = projects.find((p) => p.id === selectedProjectId);
    const activeUrl = meetUrl ? normalizeMeetUrl(meetUrl) : 'https://meet.google.com/new';
    const text = `📅 NEBULA SYNC: ${meetingTopic}
🚀 Project: ${targetProject?.name || 'Nebula OS Mission'}
🕒 Scheduled: ${scheduledDate} at ${scheduledTime} (${durationMinutes} mins)
📹 Google Meet: ${activeUrl}

Agenda:
${agenda.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Notes: ${hostNotes}`;

    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2000);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    parseAndAddEmails(newRecipientInput);
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove));
  };

  const handleAddAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item = newAgendaInput.trim();
    if (item && !agenda.includes(item)) {
      setAgenda([...agenda, item]);
      setNewAgendaInput('');
    }
  };

  const handleRemoveAgendaItem = (indexToRemove: number) => {
    setAgenda(agenda.filter((_, i) => i !== indexToRemove));
  };

  // Trigger confirmation dialog before sending
  const handleInitiateSend = () => {
    setSendError(null);
    if (recipients.length === 0) {
      setSendError('Please add at least one recipient email address before dispatching Gmail invitations.');
      return;
    }
    if (!meetUrl.trim()) {
      setSendError('Please provide or generate a Google Meet room URL before dispatching invitations.');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Perform actual Gmail send upon confirmation
  const handleConfirmAndSendViaGmail = async () => {
    if (recipients.length === 0) {
      setSendError('Please add at least one recipient email address.');
      setIsConfirmModalOpen(false);
      return;
    }

    if (!meetUrl.trim()) {
      setSendError('Please provide or generate a Google Meet room URL.');
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSendingEmail(true);
    setSendError(null);

    let activeToken = googleAuth.accessToken;
    if (!activeToken || activeToken.startsWith('nebula_')) {
      try {
        const authRes = await connectGoogleWorkspace();
        activeToken = authRes.accessToken;
      } catch (authErr: any) {
        setIsSendingEmail(false);
        setSendError('Google Workspace authorization required to send emails via Gmail API. Please click "Authorize Account" below or use "Draft in Gmail Web".');
        return;
      }
    }

    let activeMeetLink = normalizeMeetUrl(meetUrl);

    // If meeting link is generic 'meet.google.com/new' and we have an authorized Google account,
    // automatically provision a real Google Calendar Meet space so everyone receives the same registered room URL!
    if ((activeMeetLink.endsWith('/new') || !isRealProvisioned) && activeToken && !activeToken.startsWith('nebula_')) {
      try {
        const provRes = await createGoogleMeetSpace(activeToken, { topic: meetingTopic });
        if (provRes.isRealProvisioned && provRes.meetingUri) {
          activeMeetLink = provRes.meetingUri;
          setMeetUrl(provRes.meetingUri);
          setMeetSpaceName(provRes.name);
          setIsRealProvisioned(true);
        }
      } catch (e) {
        console.warn('Could not auto-provision room before email dispatch:', e);
      }
    }

    setMeetUrl(activeMeetLink);

    const targetProject = projects.find((p) => p.id === selectedProjectId);
    const hostEmail = firebaseUser?.email || googleAuth.userEmail || 'operator@nebula.team';
    const hostName = firebaseUser?.displayName || googleAuth.userName || 'Nebula Operator';

    const inviteParams: SendMeetingInviteParams = {
      to: recipients,
      subject: `[Nebula OS] Google Meet Invite: ${meetingTopic}`,
      meetingTitle: meetingTopic,
      projectName: targetProject?.name || 'Nebula Hackathon Team',
      meetUrl: activeMeetLink,
      scheduledTime: `${scheduledDate} at ${scheduledTime}`,
      durationMinutes,
      agenda,
      hostName,
      hostEmail,
      notes: hostNotes,
    };

    try {
      let res = await sendGmailMeetingInvitation(activeToken || '', inviteParams);

      // Handle 401 / expired token with automatic re-authorization attempt
      if (!res.success && (res.isAuthError || res.statusCode === 401)) {
        try {
          const freshAuth = await connectGoogleWorkspace();
          if (freshAuth.accessToken && !freshAuth.accessToken.startsWith('nebula_')) {
            activeToken = freshAuth.accessToken;
            res = await sendGmailMeetingInvitation(activeToken, inviteParams);
          }
        } catch (reauthErr) {
          console.warn('Re-authentication prompt not completed:', reauthErr);
        }
      }

      if (!res.success) {
        if (res.isAuthError || res.statusCode === 401) {
          setSendError('Gmail API access token is expired or requires re-authentication. Click "Authorize Account" below or use "Draft in Gmail Web" to send without permissions.');
        } else {
          setSendError(res.error || 'Gmail API failed to dispatch emails. Please check recipients or try "Draft in Gmail Web".');
        }
        return;
      }

      setIsConfirmModalOpen(false);
      setSendSuccessResult({
        messageId: res.messageId,
        recipientsCount: inviteParams.to.length,
        meetUrl: activeMeetLink,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        autoStarted: autoStartOnDispatch,
      });

      // AUTO-START MEETING: Launch the Google Meet room for the host the moment email is successfully dispatched!
      if (autoStartOnDispatch && activeMeetLink) {
        try {
          const openedWindow = window.open(activeMeetLink, '_blank', 'noopener,noreferrer');
          if (!openedWindow) {
            console.warn('Browser blocked popup for automatic meeting start');
          }
        } catch (openErr) {
          console.error('Failed to auto-launch Google Meet:', openErr);
        }
      }

      addActivityLog({
        actor: { name: hostName, isAI: false },
        action: 'Dispatched Google Meet Invitations & Started Meeting',
        entityName: meetingTopic,
        entityType: 'MEETING',
        projectId: selectedProjectId,
        details: `Dispatched to ${inviteParams.to.length} recipients via Gmail API. Active room: ${activeMeetLink}`,
        status: 'SUCCESS',
      });
    } catch (err: any) {
      console.error('Failed to send email via Gmail API:', err);
      setSendError(err?.message || 'Failed to dispatch email via Gmail API');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const selectedProj = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeHostEmail = firebaseUser?.email || googleAuth.userEmail || 'operator@nebula.team';

  const calUrl = generateCalendarEventUrl({
    title: `Nebula Sync: ${meetingTopic}`,
    description: `Google Meet Session for ${selectedProj?.name || 'Nebula OS Mission'}.\n\nShared Meeting Link: ${meetUrl}\n\nAgenda:\n${agenda.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n${hostNotes}`,
    location: meetUrl,
    startDateIso: `${scheduledDate}T${scheduledTime}:00`,
    durationMinutes,
  });

  return (
    <section
      id="command-google-meet-gmail-section"
      className="rounded-3xl frosty-card border border-cyan-500/30 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all"
    >
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d153a] via-[#150e38] to-[#0d153a] border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-tech font-bold uppercase tracking-widest text-cyan-400">
                GOOGLE WORKSPACE DISPATCHER
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-semibold">
                Command Page Only
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Google Meet & Gmail Dispatcher</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate instant Google Meet spaces and dispatch branded invitation packages directly via Gmail.
            </p>
          </div>
        </div>

        {/* Right Auth / Quick Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {googleAuth.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {googleAuth.userEmail || 'Connected to Google'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => connectGoogleWorkspace()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Connect Workspace</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isOpen ? 'Minimize' : 'Open Dispatcher'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {sendError && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Google Workspace / Gmail Notice</span>
              </div>
              <div className="text-[11px] text-rose-200 mt-0.5 leading-relaxed">
                {sendError}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => connectGoogleWorkspace()}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(244,63,94,0.6)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Authorize Account</span>
            </button>
            <a
              href={generateGmailWebComposeUrl({
                to: recipients.length > 0 ? recipients : (activeHostEmail ? [activeHostEmail] : []),
                subject: `[Nebula OS] Google Meet Invite: ${meetingTopic}`,
                meetingTitle: meetingTopic,
                projectName: selectedProj?.name,
                meetUrl: meetUrl ? normalizeMeetUrl(meetUrl) : generateGoogleMeetUrl(),
                scheduledTime: `${scheduledDate} at ${scheduledTime}`,
                durationMinutes,
                agenda,
                hostName: googleAuth.userName || firebaseUser?.displayName || 'Nebula Operator',
                hostEmail: activeHostEmail,
                notes: hostNotes,
              })}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-cyan-700/60 hover:bg-cyan-600 border border-cyan-400/40 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Draft in Gmail Web</span>
            </a>
            <a
              href={calUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-purple-700/60 hover:bg-purple-600 border border-purple-400/40 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar Sync</span>
            </a>
            <button
              onClick={() => setSendError(null)}
              className="p-1.5 rounded-lg text-rose-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {sendSuccessResult && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#062024]/90 to-cyan-950/90 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Google Meet Invitations Sent Successfully via Gmail!</span>
                <span className="text-[10px] text-emerald-400 font-mono">({sendSuccessResult.timestamp})</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Dispatched to <strong>{sendSuccessResult.recipientsCount} recipient(s)</strong>.
                {sendSuccessResult.autoStarted ? (
                  <span className="text-cyan-300 font-medium ml-1">
                    🚀 Live Google Meet call launched in a new tab for host.
                  </span>
                ) : (
                  <span className="text-slate-300 ml-1">
                    Ready to join whenever you are.
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={sendSuccessResult.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.7)] cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Enter Host Room</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setSendSuccessResult(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dispatcher Workspace Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Presets Row */}
          <div>
            <div className="text-[11px] font-tech text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Sync Presets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                {
                  label: '🚀 Sprint Alignment',
                  topic: 'Sprint Architecture & DAG Execution Sync',
                  duration: 45,
                  agenda: [
                    'Review critical path dependency DAG',
                    'Assign real-time WebSocket tasks',
                    'Verify deployment milestone readiness',
                  ],
                  notes: 'High-priority engineering standup for all constellation leads.',
                },
                {
                  label: '🛡️ Threat & Risk Review',
                  topic: 'Risk Sentinel Anomaly & Cascade Mitigation',
                  duration: 30,
                  agenda: [
                    'Analyze critical path blockers flagged by Risk Agent',
                    'Apply mutex lock optimizations',
                    'Re-evaluate project health scores',
                  ],
                  notes: 'Focus on automated risk mitigation and error budget.',
                },
                {
                  label: '⚡ Architecture Invariants',
                  topic: 'API Protocol Contract & Grounding Review',
                  duration: 60,
                  agenda: [
                    'Examine Google Docs PRD requirement grounding',
                    'Validate sub-50ms latency threshold invariants',
                    'Verify RBAC token security schemas',
                  ],
                  notes: 'System architecture review with lead operators.',
                },
                {
                  label: '🎯 Final Demo Briefing',
                  topic: 'Hackathon Submission & Walkthrough Rehearsal',
                  duration: 30,
                  agenda: [
                    'Test 7-step MVP interactive demo flow',
                    'Review project portfolio galaxy visuals',
                    'Finalize Google Meet and Gmail recording demo',
                  ],
                  notes: 'All hands required for submission walkthrough.',
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
                    <span>{p.label}</span>
                    <span className="text-[10px] font-mono text-purple-400">{p.duration}m</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">{p.topic}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Core Dispatch Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Meeting Details & Google Meet Link Generator (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Meeting Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Meeting Topic / Title</label>
                <input
                  type="text"
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  placeholder="e.g. Autonomous Sentinel Architecture Review"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white placeholder-slate-500 focus:outline-none shadow-inner"
                />
              </div>

              {/* Project & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Associated Project */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0b091f] text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white focus:outline-none"
                  />
                </div>

                {/* Time & Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Time & Duration</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-2/3 px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white focus:outline-none"
                    />
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-1/3 px-1.5 py-2 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-[11px] font-sans text-white focus:outline-none"
                    >
                      <option value={15} className="bg-[#0b091f]">15m</option>
                      <option value={30} className="bg-[#0b091f]">30m</option>
                      <option value={45} className="bg-[#0b091f]">45m</option>
                      <option value={60} className="bg-[#0b091f]">60m</option>
                      <option value={90} className="bg-[#0b091f]">90m</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Google Meet Space Generator Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-indigo-950/40 border border-cyan-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Google Meet Call Space</span>
                    {isRealProvisioned && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Google Verified</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={handleGenerateMeet}
                      disabled={isGeneratingMeet}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-700/60 hover:bg-cyan-600 text-cyan-100 hover:text-white text-xs font-semibold border border-cyan-500/40 disabled:opacity-50 transition-all cursor-pointer"
                      title="Provision real Google Meet Space via Google Calendar / Meet API"
                    >
                      {isGeneratingMeet ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Provisioning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Provision Space</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenMeetNew}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                      title="Open meet.google.com/new to create an instant room and grab the link"
                    >
                      <span>meet.new</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={handleStartHostMeeting}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all cursor-pointer shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Host Meeting</span>
                    </button>
                  </div>
                </div>

                {/* Editable / Generated URL Box */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-cyan-400/50">
                  <Link className="w-4 h-4 text-cyan-400 shrink-0 ml-1.5" />
                  <input
                    type="text"
                    value={meetUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMeetUrl(val);
                      if (val.includes('meet.google.com') || val.includes('-')) {
                        setIsRealProvisioned(false);
                      }
                    }}
                    placeholder="https://meet.google.com/new or https://meet.google.com/xxx-yyyy-zzz"
                    className="font-mono text-xs text-cyan-200 bg-transparent flex-1 focus:outline-none border-none placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text && (text.includes('meet.google.com') || text.includes('-'))) {
                          const normalized = normalizeMeetUrl(text);
                          setMeetUrl(normalized);
                          setIsRealProvisioned(false);
                        }
                      } catch {
                        // ignore clipboard read permission error
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Paste room code from clipboard"
                  >
                    <span>Paste</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!meetUrl}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                    title="Copy meeting URL"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                  {meetUrl && (
                    <a
                      href={normalizeMeetUrl(meetUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shrink-0"
                      title="Open Google Meet Space in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isRealProvisioned ? (
                      <span>Google Verified Space: <span className="font-mono font-bold text-white">{normalizeMeetUrl(meetUrl).replace('https://meet.google.com/', '')}</span> (Registered on Google Servers)</span>
                    ) : meetUrl.endsWith('/new') || meetUrl === 'https://meet.google.com/new' ? (
                      <span>Instant Room Engine: <span className="font-mono font-bold text-cyan-300">meet.google.com/new</span> (Google assigns code upon host launch)</span>
                    ) : (
                      <span>Custom Room Code: <span className="font-mono font-bold text-white">{normalizeMeetUrl(meetUrl).replace('https://meet.google.com/', '')}</span></span>
                    )}
                  </div>
                  {meetUrl && (
                    <a
                      href={calUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 shrink-0"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Add to Google Calendar</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Agenda Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Agenda & Objectives ({agenda.length})</label>
                </div>
                <div className="space-y-1.5">
                  {agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-cyan-400 font-tech font-bold">0{idx + 1}.</span>
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAgendaItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add agenda form */}
                <form onSubmit={handleAddAgendaItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newAgendaInput}
                    onChange={(e) => setNewAgendaInput(e.target.value)}
                    placeholder="Add agenda bullet item..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newAgendaInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Recipients, Host Notes & Dispatch Action (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Recipients Manager */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Gmail Invite Recipients ({recipients.length})</span>
                  </label>
                  {recipients.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllRecipients}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Recipient list */}
                {recipients.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-none">
                    {recipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-cyan-500/20 text-xs hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="text-slate-200 truncate font-mono text-[11px]">{email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(email)}
                          className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                          title="Remove email"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-slate-400 text-xs">
                    No recipients added yet. Enter email addresses below or click a team member.
                  </div>
                )}

                {/* Add recipient form */}
                <form onSubmit={handleAddRecipient} className="flex gap-2">
                  <input
                    type="text"
                    value={newRecipientInput}
                    onChange={(e) => setNewRecipientInput(e.target.value)}
                    placeholder="Enter email or comma-separated emails..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newRecipientInput.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Quick Add Team Members & Self */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase font-tech font-bold text-slate-400 tracking-wider">
                    <span>Quick Add Attendees</span>
                    {activeHostEmail && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!recipients.includes(activeHostEmail.toLowerCase())) {
                            setRecipients([...recipients, activeHostEmail.toLowerCase()]);
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-sans normal-case text-[11px] font-medium transition-colors"
                      >
                        + Add Myself ({activeHostEmail})
                      </button>
                    )}
                  </div>
                  {members && members.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const allMemberEmails = members
                            .map((m) => m.email?.toLowerCase())
                            .filter(Boolean) as string[];
                          const merged = Array.from(new Set([...recipients, ...allMemberEmails]));
                          setRecipients(merged);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-sans transition-all bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-600/50 hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Add all team member email addresses"
                      >
                        <Users className="w-3 h-3 text-indigo-300" />
                        <span>All Team ({members.length})</span>
                      </button>
                      {members.map((m) => {
                        const isAdded = m.email ? recipients.includes(m.email.toLowerCase()) : false;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => m.email && handleToggleTeamMember(m.email)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans transition-all flex items-center gap-1 cursor-pointer ${
                              isAdded
                                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                            title={m.email || m.name}
                          >
                            {isAdded && <Check className="w-3 h-3 text-cyan-300" />}
                            <span>{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Host Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Host Notes / Briefing</label>
                <textarea
                  value={hostNotes}
                  onChange={(e) => setHostNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional context or links for attendees..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 focus:border-cyan-400 text-xs font-sans text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              {/* Dispatch Action Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#12082b] to-[#0a1435] border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Sender Account</span>
                  <span className="font-mono text-purple-300 font-bold truncate max-w-[170px]">
                    {activeHostEmail}
                  </span>
                </div>

                {/* Auto Start Meeting Toggle */}
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={autoStartOnDispatch}
                    onChange={(e) => setAutoStartOnDispatch(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-black/40 border-white/20 focus:ring-cyan-400 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-200">
                    <span className="font-medium text-white">Auto-launch Google Meet for host</span>
                    <span className="text-slate-400 block text-[10px]">Opens the meeting room automatically when emails are sent</span>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateSend}
                    className="flex-[1.4] py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(37,99,235,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch via Gmail</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleCopyBriefing}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedBriefing ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBriefing ? 'Copied Briefing' : 'Copy Text Briefing'}</span>
                  </button>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Explicit confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Explicit User Confirmation Dialog (Required by Workspace Integration Guidelines) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#09061c] border border-purple-500/50 p-6 space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirm Gmail Invitation Dispatch</h3>
                  <p className="text-xs text-slate-400">This operation will send real emails via Gmail API.</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Summary Box */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Meeting Topic:</span>
                <span className="font-semibold text-white truncate max-w-[260px]">{meetingTopic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scheduled Time:</span>
                <span className="font-mono text-cyan-300">{scheduledDate} at {scheduledTime} ({durationMinutes} mins)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Google Meet URL:</span>
                <span className="font-mono text-purple-300 truncate max-w-[260px]">
                  {meetUrl ? normalizeMeetUrl(meetUrl) : 'Provisioning real room space'}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 shrink-0">Recipients ({recipients.length}):</span>
                <span className="font-mono text-slate-200 text-right truncate max-w-[260px]">
                  {recipients.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-cyan-300">
                <span className="text-slate-400">Host Room Auto-Launch:</span>
                <span className="font-medium">{autoStartOnDispatch ? '⚡ Will launch automatically on dispatch' : 'Manual launch'}</span>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={generateGmailWebComposeUrl({
                  to: recipients,
                  subject: `[Nebula OS] Google Meet Invite: ${meetingTopic}`,
                  meetingTitle: meetingTopic,
                  projectName: selectedProj?.name || 'Nebula Hackathon Team',
                  meetUrl: meetUrl ? normalizeMeetUrl(meetUrl) : generateGoogleMeetUrl(),
                  scheduledTime: `${scheduledDate} at ${scheduledTime}`,
                  durationMinutes,
                  agenda,
                  hostName: firebaseUser?.displayName || googleAuth.userName || 'Nebula Operator',
                  hostEmail: activeHostEmail,
                  notes: hostNotes,
                })}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Draft directly in your personal Gmail client"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Draft in Web Gmail</span>
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isSendingEmail}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndSendViaGmail}
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(37,99,235,0.7)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending via Gmail API & Starting Call...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Send via Gmail API</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Email Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#09061c] border border-cyan-500/50 p-6 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Gmail HTML Template Preview</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rendered HTML Container */}
            <div className="flex-1 overflow-y-auto my-4 p-4 rounded-2xl bg-[#03010c] border border-white/10">
              <div
                dangerouslySetInnerHTML={{
                  __html: generateMeetInvitationHtml({
                    to: recipients.length > 0 ? recipients : ['invitee@example.com'],
                    subject: `[Nebula OS] Google Meet Invite: ${meetingTopic}`,
                    meetingTitle: meetingTopic,
                    projectName: selectedProj?.name || 'Nebula OS Mission',
                    meetUrl: meetUrl || 'https://meet.google.com/xyz-1234-abc',
                    scheduledTime: `${scheduledDate} at ${scheduledTime}`,
                    durationMinutes,
                    agenda,
                    hostName: firebaseUser?.displayName || googleAuth.userName || 'Nebula Operator',
                    hostEmail: firebaseUser?.email || googleAuth.userEmail || 'operator@nebula.team',
                    notes: hostNotes,
                  }),
                }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
