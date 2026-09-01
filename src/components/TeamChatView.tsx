import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Phone,
  Video,
  Search,
  MoreVertical,
  Play,
  Pause,
  CheckCheck,
  CornerDownRight,
  X,
  Volume2,
  VolumeX,
  Plus,
  FileText,
  Sparkles,
  Bot,
  Shield,
  Users,
  ChevronDown,
  Trash2,
  Share2,
  Info,
  Maximize2,
  Radio,
  Cpu,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { TeamChatMessage, ChatMessageType, AIAgent } from '../types';
import { generateGoogleMeetUrl, createGoogleMeetSpace } from '../utils/googleWorkspace';

export const TeamChatView: React.FC = () => {
  const {
    teamChannels,
    activeChannelId,
    setActiveChannelId,
    teamMessages,
    sendTeamMessage,
    toggleMessageReaction,
    deleteTeamMessage,
    firebaseUser,
    googleAuth,
    members,
    agents,
    warpTo,
  } = useNebula();

  // Active channel
  const activeChannel = teamChannels.find((c) => c.id === activeChannelId) || teamChannels[0];

  // Filter messages for active channel
  const channelMessages = teamMessages.filter(
    (m) => m.channelId === activeChannelId || (!m.channelId && activeChannelId === 'channel_nebula_main')
  );

  // States
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TeamChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<Record<string, number>>({});
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Auto scroll to bottom when channel messages change
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeChannelId]);

  useEffect(() => {
    if (channelMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [channelMessages.length]);

  // Voice recording simulation timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Audio waveform playback simulation
  useEffect(() => {
    if (activeAudioPlayingId) {
      audioIntervalRef.current = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          const current = prev[activeAudioPlayingId] || 0;
          if (current >= 100) {
            setActiveAudioPlayingId(null);
            return { ...prev, [activeAudioPlayingId]: 0 };
          }
          return { ...prev, [activeAudioPlayingId]: current + 4 };
        });
      }, 200);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [activeAudioPlayingId]);

  const handleSendMessage = async (type: ChatMessageType = 'text', customPayload: Partial<TeamChatMessage> = {}) => {
    if (type === 'text' && !inputText.trim()) return;

    const payload: Partial<TeamChatMessage> = {
      channelId: activeChannel.id,
      type,
      content: inputText.trim(),
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.type === 'audio' ? 'Voice message' : replyingTo.content,
            type: replyingTo.type,
            mediaDuration: replyingTo.mediaDuration,
          }
        : undefined,
      ...customPayload,
    };

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    await sendTeamMessage(payload);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSendVoiceNote = async () => {
    setIsRecordingVoice(false);
    const durationMins = Math.floor(recordingDuration / 60);
    const durationSecs = (recordingDuration % 60).toString().padStart(2, '0');
    const formattedDuration = `${durationMins}:${durationSecs}`;

    // Generate random synthetic waveform
    const randomWaveform = Array.from({ length: 24 }, () => Math.floor(Math.random() * 70) + 25);

    await handleSendMessage('audio', {
      content: `Voice message (${formattedDuration})`,
      mediaDuration: formattedDuration,
      audioWaveform: randomWaveform,
    });
  };

  const handleSendSticker = async (emoji: string) => {
    await handleSendMessage('sticker', {
      content: emoji,
    });
    setSelectedSticker(null);
  };

  const handleSendVideoCard = async () => {
    await handleSendMessage('video', {
      content: 'Nebula Core Terminal & Mission Telemetry Stream 🌌✨',
      mediaThumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      mediaDuration: '0:13',
    });
    setShowAttachMenu(false);
  };

  const handleSendDriveDocSnippet = async () => {
    await handleSendMessage('file', {
      content: 'Shared Google Doc: Interstellar Unified Operating System PRD v1.0',
      mediaSize: '4.2 MB',
    });
    setShowAttachMenu(false);
  };

  const handleTriggerAIPing = async (agentName = 'PM Agent') => {
    const matchedAgent = agents.find((a) => a.name.toLowerCase().includes(agentName.toLowerCase())) || agents[0];

    await handleSendMessage('text', {
      content: `@${matchedAgent.name} Can you provide an autonomous status briefing for the fleet?`,
      mentions: [matchedAgent.name],
    });

    // Simulate instant AI Sentinel automated response
    setTimeout(async () => {
      await sendTeamMessage({
        channelId: activeChannel.id,
        senderId: matchedAgent.id,
        senderName: `${matchedAgent.name} (AI)`,
        senderRole: matchedAgent.role,
        senderColor: matchedAgent.color,
        senderAvatar: matchedAgent.avatar,
        isUser: false,
        isAI: true,
        type: 'text',
        content: `🌌 **${matchedAgent.title} Briefing**: Real-time telemetry confirmed across all 9 constellation projects. Google Workspace sheets and Firestore security rules are synchronized. Ready for deployment.`,
        reactions: { '🚀': 2, '💡': 1 },
      });
    }, 1000);
  };

  const filteredMessages = channelMessages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    return (
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const commonEmojis = ['❤️', '👍', '🚀', '🔥', '🛡️', '💡', '🗿', '👏', '✨', '⚡'];
  const stickerEmojis = ['🗿', '🚀', '🔥', '🪐', '🌌', '👾', '🎉', '☕', '👀', '💯'];

  // Human members only (6 teammates)
  const humanMembers = members.filter((m) => !m.isAI && !m.id.startsWith('agent_'));

  return (
    <div id="team-chat-page-root" className="flex h-[calc(100vh-4rem)] w-full bg-transparent overflow-hidden">
      {/* 1. LEFT SIDEBAR: CHANNELS & DIRECT COMMS */}
      <div
        id="chat-sidebar"
        className="w-80 md:w-96 flex-shrink-0 border-r border-cyan-500/20 bg-slate-950/40 backdrop-blur-2xl flex flex-col z-20"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Initials Badge (No photo avatar) */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-900/60 to-blue-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-200 font-bold font-mono shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                {getInitials(firebaseUser?.displayName || googleAuth?.userName || 'Samaksh Dey')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                {firebaseUser?.displayName || googleAuth?.userName || 'Samaksh Dey'}
              </h2>
              <p className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                Team Lead • Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => warpTo('COMMAND_CENTER')}
              title="Command Center"
              className="p-2 hover:text-cyan-400 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVoiceCallActive(true)}
              title="Join Voice Lounge"
              className="p-2 hover:text-emerald-400 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-cyan-500/20 bg-slate-950/20">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3" />
            <input
              type="text"
              placeholder="Search channels & comms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/5'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/5'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/5'
              }`}
            >
              Sentinels & Teams
            </button>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
          {teamChannels.map((channel) => {
            const isSelected = channel.id === activeChannelId;
            const channelLatestMsgs = teamMessages.filter((m) => m.channelId === channel.id);
            const latestMsg = channelLatestMsgs[channelLatestMsgs.length - 1];

            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition-all duration-150 relative cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/10 border-l-4 border-cyan-400'
                    : 'hover:bg-white/[0.04] border-l-4 border-transparent'
                }`}
              >
                {/* Channel Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    {channel.avatar}
                  </div>
                  {channel.isVoiceActive && (
                    <span
                      title="Voice Channel Active"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse"
                    >
                      <Mic className="w-2.5 h-2.5 text-slate-950 font-bold" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-cyan-300' : 'text-slate-100'
                      }`}
                    >
                      {channel.displayName}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {latestMsg?.timestamp || 'Ready'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-1">
                    {latestMsg ? (
                      <span>
                        <strong className="text-slate-300">{latestMsg.senderName.split(' ')[0]}: </strong>
                        {latestMsg.type === 'audio'
                          ? `🎤 Voice note (${latestMsg.mediaDuration || '0:21'})`
                          : latestMsg.type === 'video'
                          ? `🎥 Video preview`
                          : latestMsg.type === 'sticker'
                          ? `Sticker ${latestMsg.content}`
                          : latestMsg.content}
                      </span>
                    ) : (
                      channel.description
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-600" />
                      {channel.memberNames.length} members
                    </span>

                    {channel.unreadCount && channel.unreadCount > 0 ? (
                      <span className="ml-auto bg-cyan-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-cyan-950">
                        {channel.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Audio Room Floating Pill in Sidebar */}
        <div className="p-3 border-t border-cyan-500/20 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Nebula Voice Lounge</p>
              <p className="text-[10px] text-emerald-400">Ready for connection</p>
            </div>
          </div>
          <button
            onClick={() => setIsVoiceCallActive(true)}
            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3 h-3" />
            Join
          </button>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA (Transparent & Glassmorphic) */}
      <div id="chat-main-stream" className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
        {/* Subtle Cosmic Chat Wallpaper Grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#06b6d4 0.75px, transparent 0.75px), radial-gradient(#3b82f6 0.75px, transparent 0.75px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        />

        {/* Chat Top Header */}
        <div
          id="chat-header-bar"
          className="h-16 px-5 border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between z-10"
        >
          {/* Channel Info */}
          <div
            className="flex items-center gap-3.5 cursor-pointer"
            onClick={() => setShowChannelInfo(!showChannelInfo)}
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              {activeChannel.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">{activeChannel.displayName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                  #{activeChannel.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {activeChannel.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Search inside chat button */}
            <button
              onClick={() => setIsSearchingInChat(!isSearchingInChat)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSearchingInChat
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Search Messages"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* AI Sentinel Query Trigger */}
            <button
              onClick={() => handleTriggerAIPing('PM Agent')}
              className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Trigger Automated PM Sentinel Status"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask PM Sentinel
            </button>

            {/* Voice Call Button */}
            <button
              onClick={() => setIsVoiceCallActive(true)}
              className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl transition-colors cursor-pointer"
              title="Start Voice Lounge"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Google Meet Video Call Button */}
            <button
              onClick={async () => {
                let meetUrl = 'https://meet.google.com/new';
                try {
                  if (googleAuth.accessToken) {
                    const space = await createGoogleMeetSpace(googleAuth.accessToken, { topic: `#${activeChannel.name}` });
                    if (space.meetingUri) {
                      meetUrl = space.meetingUri;
                    }
                  }
                } catch (e) {
                  console.warn('Could not provision Meet space:', e);
                }
                window.open(meetUrl, '_blank', 'noopener,noreferrer');
                sendTeamMessage({
                  content: `📹 Started a Google Meet session for #${activeChannel.name}: ${meetUrl}`,
                  type: 'system',
                  channelId: activeChannel.id,
                });
              }}
              className="p-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 rounded-xl transition-colors cursor-pointer"
              title="Launch Google Meet Room"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Info toggle */}
            <button
              onClick={() => setShowChannelInfo(!showChannelInfo)}
              className="p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Channel Information & Roster"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-Chat Search Bar (Collapsible) */}
        <AnimatePresence>
          {isSearchingInChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 py-2.5 bg-slate-950/60 border-b border-cyan-500/20 backdrop-blur-xl flex items-center gap-3 z-10"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Find in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-mono">
                {filteredMessages.length} results
              </span>
              <button
                onClick={() => {
                  setIsSearchingInChat(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Feed (Transparent with Sleek Glass Cards) */}
        <div
          id="messages-scroll-container"
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar relative z-0"
        >
          {/* Zero-State / Welcome Beacon Card when no messages exist */}
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                {activeChannel.avatar}
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide mb-1">
                Secure Comms Uplink • #{activeChannel.name}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                {activeChannel.topic}. All messages, voice dispatches, and attachments are transmitted in real-time.
              </p>

              {/* Quick Action Suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                <button
                  onClick={() => handleTriggerAIPing('PM Agent')}
                  className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask PM Agent for status
                </button>
                <button
                  onClick={() => setIsRecordingVoice(true)}
                  className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Record voice dispatch
                </button>
                <button
                  onClick={handleSendDriveDocSnippet}
                  className="px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Attach Google PRD
                </button>
              </div>
            </div>
          )}

          {/* Date Badge */}
          {filteredMessages.length > 0 && (
            <div className="flex justify-center my-3">
              <span className="px-3 py-1 rounded-full bg-slate-900/40 border border-white/10 text-[11px] font-medium text-slate-400 shadow-md backdrop-blur-md">
                LIVE TRANSMISSION FEED
              </span>
            </div>
          )}

          {filteredMessages.map((msg) => {
            const isUser = msg.isUser || msg.senderId === firebaseUser?.uid || msg.senderId === 'mem_1';
            const isAI = msg.isAI || msg.senderId?.startsWith('agent_') || msg.senderId?.endsWith('_agent');
            const isHovered = hoveredMessageId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex flex-col group relative ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Floating Quick Reaction Toolbar */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`absolute -top-7 z-30 flex items-center gap-1 bg-slate-950/90 border border-cyan-500/30 rounded-full px-2 py-0.5 shadow-xl backdrop-blur-md ${
                      isUser ? 'right-2' : 'left-2'
                    }`}
                  >
                    {commonEmojis.slice(0, 6).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleMessageReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform p-1 text-xs cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
                    <button
                      onClick={() => setReplyingTo(msg)}
                      title="Reply"
                      className="p-1 hover:text-cyan-400 text-slate-400 text-xs cursor-pointer"
                    >
                      <CornerDownRight className="w-3 h-3" />
                    </button>
                    {isUser && (
                      <button
                        onClick={() => deleteTeamMessage(msg.id)}
                        title="Delete Message"
                        className="p-1 hover:text-red-400 text-slate-400 text-xs cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Message Bubble Container (Transparent Glass Card) */}
                <div
                  className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-2xl p-3 shadow-lg relative transition-all backdrop-blur-xl ${
                    isUser
                      ? 'bg-cyan-950/30 border border-cyan-500/40 text-cyan-50 shadow-[0_0_20px_rgba(6,182,212,0.12)] rounded-tr-xs'
                      : isAI
                      ? 'bg-purple-950/30 border border-purple-500/40 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.12)] rounded-tl-xs'
                      : 'bg-slate-900/30 border border-white/10 text-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.04)] rounded-tl-xs'
                  }`}
                >
                  {/* Quoted / Reply Preview */}
                  {msg.replyTo && (
                    <div className="mb-2 p-2 rounded-xl bg-slate-950/40 border-l-4 border-cyan-400 flex items-center justify-between text-xs backdrop-blur-sm">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-cyan-300 block truncate">
                          {msg.replyTo.senderName}
                        </span>
                        <span className="text-slate-400 truncate block">
                          {msg.replyTo.type === 'audio' ? `🎤 Voice message` : msg.replyTo.content}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sender Header for Incoming Messages */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-md bg-white/[0.08] border border-white/10 flex items-center justify-center text-[9px] font-bold font-mono text-cyan-300">
                          {isAI ? 'AI' : getInitials(msg.senderName)}
                        </div>
                        <span
                          className="text-xs font-bold tracking-wide"
                          style={{ color: msg.senderColor || (isAI ? '#c084fc' : '#38bdf8') }}
                        >
                          {msg.senderName}
                        </span>
                      </div>
                      {msg.senderRole && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.senderRole}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 1. STICKER MESSAGE */}
                  {msg.type === 'sticker' && (
                    <div className="py-1">
                      <span className="text-4xl filter drop-shadow-md select-none">{msg.content}</span>
                    </div>
                  )}

                  {/* 2. VIDEO MESSAGE CARD */}
                  {msg.type === 'video' && (
                    <div className="space-y-2">
                      <div
                        onClick={() =>
                          setActiveVideoModal({
                            url: msg.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            title: msg.content || 'Video Preview',
                          })
                        }
                        className="relative rounded-xl overflow-hidden border border-cyan-500/30 cursor-pointer group/vid aspect-video bg-slate-950/80 flex items-center justify-center shadow-inner"
                      >
                        <img
                          src={msg.mediaThumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'}
                          alt="Video thumbnail"
                          className="absolute inset-0 w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-300 opacity-80"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                        {/* Center Play Button */}
                        <div className="relative w-12 h-12 rounded-full bg-cyan-500/90 group-hover/vid:bg-cyan-400 flex items-center justify-center text-slate-950 shadow-xl group-hover/vid:scale-110 transition-all">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>

                        {/* Duration Pill */}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
                          {msg.mediaDuration || '0:13'}
                        </span>
                      </div>

                      {msg.content && (
                        <p className="text-xs text-slate-200 leading-relaxed font-normal">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. VOICE NOTE / AUDIO WAVEFORM */}
                  {msg.type === 'audio' && (
                    <div className="flex items-center gap-3 py-1 w-full min-w-[260px] md:min-w-[300px]">
                      {/* Play / Pause Toggle Button */}
                      <button
                        onClick={() => {
                          if (activeAudioPlayingId === msg.id) {
                            setActiveAudioPlayingId(null);
                          } else {
                            setActiveAudioPlayingId(msg.id);
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                          activeAudioPlayingId === msg.id
                            ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                        }`}
                      >
                        {activeAudioPlayingId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Waveform Scrubber Visualizer */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-[3px] h-8">
                          {(msg.audioWaveform || [40, 60, 80, 50, 90, 70, 45, 85, 95, 60, 40, 75, 80, 55, 65, 90, 45, 60]).map(
                            (height, barIdx) => {
                              const progress = audioPlaybackProgress[msg.id] || 0;
                              const barProgress = (barIdx / 20) * 100;
                              const isPast = progress >= barProgress;

                              return (
                                <div
                                  key={barIdx}
                                  className={`w-[3px] rounded-full transition-all duration-150 ${
                                    isPast
                                      ? 'bg-cyan-400'
                                      : 'bg-slate-600/60 group-hover:bg-slate-500'
                                  }`}
                                  style={{
                                    height: `${Math.max(20, Math.min(100, height))}%`,
                                  }}
                                />
                              );
                            }
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>
                            {activeAudioPlayingId === msg.id
                              ? `${Math.floor(((audioPlaybackProgress[msg.id] || 0) / 100) * 21)}s`
                              : msg.mediaDuration || '0:21'}
                          </span>
                          <span>Voice Dispatch</span>
                        </div>
                      </div>

                      {/* Sender Initials Badge with Mic Indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-400/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-200">
                          {getInitials(msg.senderName)}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center ring-1 ring-slate-950">
                          <Mic className="w-2 h-2 text-slate-950 font-bold" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 4. FILE / GOOGLE DOC ATTACHMENT */}
                  {msg.type === 'file' && (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{msg.content}</p>
                        <p className="text-[10px] text-cyan-400 font-mono">{msg.mediaSize || '4.2 MB'} • Google Workspace Synced</p>
                      </div>
                    </div>
                  )}

                  {/* 5. STANDARD TEXT MESSAGE */}
                  {msg.type === 'text' && (
                    <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {/* Highlight @mentions with stylish pill */}
                      {msg.content.split(' ').map((word, wIdx) => {
                        if (word.startsWith('@')) {
                          return (
                            <span
                              key={wIdx}
                              className="font-bold text-cyan-300 bg-cyan-500/20 px-1 py-0.5 rounded mr-1"
                            >
                              {word}{' '}
                            </span>
                          );
                        }
                        return word + ' ';
                      })}
                    </div>
                  )}

                  {/* Bottom Meta Bar: Timestamp & Checkmarks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono select-none">
                    <span>{msg.timestamp}</span>
                    {isUser && (
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Emoji Reactions Pill Bar */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div
                      className={`flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-white/5 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {Object.entries(msg.reactions).map(([emoji, count]) => {
                        const hasReacted = msg.userReacted?.includes(emoji);
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleMessageReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20 scale-105'
                                : 'bg-slate-950/60 text-slate-300 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[10px] font-semibold">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Replying Banner */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 py-2 bg-slate-950/60 border-t border-cyan-500/30 backdrop-blur-xl flex items-center justify-between z-10"
            >
              <div className="flex items-center gap-2 text-xs">
                <CornerDownRight className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Replying to</span>
                <strong className="text-cyan-300">{replyingTo.senderName}</strong>
                <span className="text-slate-400 truncate max-w-xs">
                  : {replyingTo.type === 'audio' ? 'Voice message' : replyingTo.content}
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji / Sticker Drawer */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-slate-950/80 border-t border-cyan-500/20 backdrop-blur-2xl z-20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-300">Quick Emojis & Stickers</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stickers row */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {stickerEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendSticker(emoji)}
                    className="text-3xl p-2 hover:bg-white/10 hover:scale-125 transition-all rounded-xl cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Quick Emoticons */}
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Menu Popup */}
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-20 left-6 z-30 w-64 bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl space-y-1"
            >
              <button
                onClick={handleSendVideoCard}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Video Terminal Card</p>
                  <p className="text-[10px] text-slate-400">Share 0:13 telemetry preview</p>
                </div>
              </button>

              <button
                onClick={handleSendDriveDocSnippet}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Google Workspace PRD</p>
                  <p className="text-[10px] text-slate-400">Attach synced Drive doc</p>
                </div>
              </button>

              <button
                onClick={() => handleTriggerAIPing('PM Agent')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">PM Sentinel Digest</p>
                  <p className="text-[10px] text-slate-400">Autonomous status brief</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Input Bar (Transparent & Sleek) */}
        <div
          id="chat-input-bar"
          className="p-3 md:p-4 bg-slate-950/40 border-t border-cyan-500/20 backdrop-blur-2xl z-10"
        >
          {isRecordingVoice ? (
            /* Active Live Voice Recording Bar */
            <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-red-500/40 rounded-2xl px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-mono text-red-400 font-semibold">
                  Recording audio dispatch... 0:{recordingDuration.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendVoiceNote}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Dispatch
                </button>
              </div>
            </div>
          ) : (
            /* Standard Message Composer */
            <div className="flex items-center gap-2 md:gap-3">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showEmojiPicker
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Emojis & Stickers"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Attachment Button */}
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showAttachMenu
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Attach Media & Drive Documents"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Textarea Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage('text');
                    }
                  }}
                  placeholder="Type a message or @mention teammate... (Enter to send)"
                  rows={1}
                  className="w-full bg-slate-900/40 border border-white/10 focus:border-cyan-500/60 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none max-h-32 transition-all leading-normal backdrop-blur-md"
                />
              </div>

              {/* Voice Note Button or Send Button */}
              {inputText.trim().length === 0 ? (
                <button
                  onClick={() => setIsRecordingVoice(true)}
                  className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-2xl transition-all hover:scale-105 shadow-md shadow-cyan-950 cursor-pointer"
                  title="Click to record voice dispatch"
                >
                  <Mic className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage('text')}
                  className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/20 cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: CHANNEL INFO & ROSTER (Transparent & No Profile Photos) */}
      <AnimatePresence>
        {showChannelInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-cyan-500/20 bg-slate-950/50 backdrop-blur-2xl flex flex-col z-20 overflow-hidden"
          >
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Channel Info</h3>
              <button
                onClick={() => setShowChannelInfo(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {/* Channel Profile Header */}
              <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-md">
                <div className="w-16 h-16 rounded-3xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-3xl mb-2 shadow-xl">
                  {activeChannel.avatar}
                </div>
                <h4 className="text-base font-bold text-white">{activeChannel.displayName}</h4>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">#{activeChannel.name}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{activeChannel.topic}</p>
              </div>

              {/* Team Members Roster (Initials Only, No Profile Pictures) */}
              <div>
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Team Engineers ({humanMembers.length})</span>
                  <span className="text-[10px] text-cyan-400 font-mono">HUMAN</span>
                </h5>
                <div className="space-y-2">
                  {humanMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-950/50 border border-cyan-400/40 flex items-center justify-center text-xs font-bold font-mono text-cyan-200">
                          {getInitials(member.name)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-slate-950" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Sentinels Roster (5 Distinct Autonomous Agents, No Duplicates) */}
              <div>
                <h5 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>AI Sentinels ({agents.length})</span>
                  <span className="text-[10px] text-purple-400 font-mono">AUTONOMOUS</span>
                </h5>
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => handleTriggerAIPing(agent.name)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/40 transition-colors cursor-pointer"
                      title={`Ping ${agent.name}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-sm flex-shrink-0">
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-purple-200 truncate">{agent.name}</p>
                        <p className="text-[10px] text-purple-400 truncate">{agent.role}</p>
                      </div>
                      <Bot className="w-3.5 h-3.5 text-purple-400 opacity-60 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. INTERACTIVE VIDEO PLAYER MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-900/90 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl"
            >
              <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">{activeVideoModal.title}</h3>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  src={activeVideoModal.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE LIVE VOICE LOUNGE MODAL (Transparent & Initials-based) */}
      <AnimatePresence>
        {isVoiceCallActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-slate-900/70 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Nebula Voice Lounge</h3>
                    <p className="text-xs text-emerald-400 font-mono">● Active Audio Link • Low Latency</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVoiceCallActive(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Call Participants with Dynamic Sound Waves (Initials Only) */}
              <div className="grid grid-cols-2 gap-4 my-6">
                {/* User */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-emerald-500/30 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/50 border border-emerald-400/60 flex items-center justify-center text-xl font-bold font-mono text-emerald-200 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {getInitials(firebaseUser?.displayName || googleAuth?.userName || 'Samaksh Dey')}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {firebaseUser?.displayName || googleAuth?.userName || 'Samaksh Dey'}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    {isMuted ? 'Muted 🔇' : 'Speaking 🎙️'}
                  </span>
                  {!isMuted && (
                    <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl animate-ping pointer-events-none opacity-20" />
                  )}
                </div>

                {/* Teammate */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-cyan-500/30 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-400/60 flex items-center justify-center text-xl font-bold font-mono text-cyan-200 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    AK
                  </div>
                  <span className="text-sm font-semibold text-white">Aman Kahar</span>
                  <span className="text-xs text-cyan-400 font-mono">Listening 🎧</span>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDeafened
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isDeafened ? 'Undeafen' : 'Deafen Audio'}
                >
                  {isDeafened ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVoiceCallActive(false)}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-5 h-5 rotate-135" />
                  Leave Lounge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamChatView;
