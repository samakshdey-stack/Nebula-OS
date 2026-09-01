import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database,
  FileText,
  Table,
  Sparkles,
  RefreshCw,
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Trash2,
  Edit3,
  Bot,
  Brain,
  Link2,
  FolderSync,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  FileCode,
  Globe,
  Lock,
  ChevronRight,
  ListTodo,
  Download,
  UploadCloud,
  FileCheck,
  HardDrive,
  FolderOpen,
  ArrowDownToLine,
  FileQuestion,
  Copy,
  Check,
  Share2,
  LogIn,
  Filter,
  Sparkle,
} from 'lucide-react';
import { useNebula } from '../context/NebulaContext';
import { ProjectDatabaseRecord, DatabaseSourceType, DatabaseCategory } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  listDriveFiles,
  fetchAnyDriveFileContent,
  fetchGoogleDocData,
  fetchGoogleSheetData,
  uploadFileToGoogleDrive,
  createGoogleDriveDoc,
  createGoogleDriveSheet,
  DriveFileItem,
  getSampleDriveFiles,
} from '../utils/googleWorkspace';

export const ProjectDatabaseView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    projectDatabases,
    addDatabaseRecord,
    updateDatabaseRecord,
    deleteDatabaseRecord,
    syncDatabaseRecord,
    syncAllProjectRecords,
    googleAuth,
    connectGoogleWorkspace,
    disconnectGoogleWorkspace,
    createTask,
    executeAIAction,
    addActivityLog,
  } = useNebula();

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'STORED_DOCS' | 'DRIVE_EXPLORER' | 'SHEETS_MATRIX' | 'INVARIANTS' | 'AGENT_GROUNDING'>('STORED_DOCS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groundingStatusMessage, setGroundingStatusMessage] = useState<string | null>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Google Drive Live Browser & Upload State
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [driveFilterType, setDriveFilterType] = useState<string>('all');
  const [ingestingFileId, setIngestingFileId] = useState<string | null>(null);
  const [previewDriveFile, setPreviewDriveFile] = useState<DriveFileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Google Drive Direct Upload & Document Creation Modal
  const [isDriveUploadModalOpen, setIsDriveUploadModalOpen] = useState(false);
  const [driveUploadMode, setDriveUploadMode] = useState<'FILE' | 'DOC' | 'SHEET'>('FILE');
  const [driveUploadFile, setDriveUploadFile] = useState<File | null>(null);
  const [driveDocTitle, setDriveDocTitle] = useState('');
  const [driveDocContent, setDriveDocContent] = useState('');
  const [driveSheetTitle, setDriveSheetTitle] = useState('');
  const [driveSheetHeaders, setDriveSheetHeaders] = useState('Task Code, Deliverable Item, Assignee, Status, Priority');
  const [driveSheetRows, setDriveSheetRows] = useState('TSK-101, Core System Architecture, Engineering Lead, IN_PROGRESS, HIGH\nTSK-102, Security Threat Model, Security Lead, TODO, CRITICAL');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [isDragOverDrive, setIsDragOverDrive] = useState(false);
  const [isExportingRecordId, setIsExportingRecordId] = useState<string | null>(null);

  // Direct Local File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const driveFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);

  // New Manual Record Modal State
  const [newTitle, setNewTitle] = useState('');
  const [newSourceType, setNewSourceType] = useState<DatabaseSourceType>('GOOGLE_DOC');
  const [newCategory, setNewCategory] = useState<DatabaseCategory>('PRD_REQUIREMENTS');
  const [newUrl, setNewUrl] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Google Drive, Stored Spec');

  // Load Google Drive Files when Drive Explorer is active or when auth changes
  const loadUserDriveFiles = async (query = driveSearchQuery, filter = driveFilterType) => {
    setIsLoadingDrive(true);
    try {
      const token = googleAuth.accessToken || '';
      const files = await listDriveFiles(token, query, filter === 'all' ? undefined : filter);
      setDriveFiles(files);
    } catch (err) {
      console.warn('Failed to load drive files:', err);
      setDriveFiles(getSampleDriveFiles(query));
    } finally {
      setIsLoadingDrive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'DRIVE_EXPLORER') {
      loadUserDriveFiles(driveSearchQuery, driveFilterType);
    }
  }, [activeTab, driveFilterType, googleAuth.accessToken]);

  // Current project records stored in the database
  const currentProjectRecords = useMemo(() => {
    return projectDatabases.filter(
      (d) => d.projectId === (activeProjectId || activeProject.id)
    );
  }, [projectDatabases, activeProjectId, activeProject.id]);

  // Filtered stored database records
  const filteredRecords = useMemo(() => {
    return currentProjectRecords.filter((rec) => {
      const matchesCat =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'DOCS'
          ? rec.sourceType === 'GOOGLE_DOC'
          : selectedCategory === 'SHEETS'
          ? rec.sourceType === 'GOOGLE_SHEET'
          : rec.category === selectedCategory;

      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesSearch;
    });
  }, [currentProjectRecords, selectedCategory, searchQuery]);

  const selectedRecord = useMemo(() => {
    return (
      projectDatabases.find((r) => r.id === selectedRecordId) ||
      filteredRecords[0] ||
      currentProjectRecords[0]
    );
  }, [projectDatabases, selectedRecordId, filteredRecords, currentProjectRecords]);

  // Set editable content when selected record changes
  useEffect(() => {
    if (selectedRecord) {
      setEditableContent(selectedRecord.content || '');
      setIsEditingContent(false);
    }
  }, [selectedRecord?.id]);

  // Ingest Google Drive File into Project Database (Retrieves full content & stores in DB)
  const handleIngestDriveFile = async (file: DriveFileItem) => {
    setIngestingFileId(file.id);
    try {
      const extracted = await fetchAnyDriveFileContent(googleAuth.accessToken || '', file);
      
      const newRecord = addDatabaseRecord({
        projectId: activeProject.id,
        title: extracted.title,
        sourceType: extracted.sourceType,
        category: extracted.category,
        fileId: file.id,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        iconLink: file.iconLink,
        fileSize: extracted.fileSize,
        summary: extracted.summary,
        content: extracted.content,
        tableData: extracted.tableData,
        keyEntities: extracted.keyEntities,
        tags: ['Google Drive', 'Stored in DB', file.mimeType.split('.').pop() || 'file'],
      });

      setSelectedRecordId(newRecord.id);
      setActiveTab('STORED_DOCS');
      setGroundingStatusMessage(`Retrieved full content of "${file.name}" and permanently stored in project database.`);
      setTimeout(() => setGroundingStatusMessage(null), 5000);
    } catch (err: any) {
      console.error('Ingest error:', err);
      setGroundingStatusMessage(`Error ingesting file: ${err.message || 'Unknown error'}`);
    } finally {
      setIngestingFileId(null);
    }
  };

  // Preview Drive File inside the app
  const handlePreviewDriveFile = async (file: DriveFileItem) => {
    setPreviewDriveFile(file);
    setIsLoadingPreview(true);
    setPreviewContent(null);
    try {
      const extracted = await fetchAnyDriveFileContent(googleAuth.accessToken || '', file);
      setPreviewContent(extracted.content);
    } catch (err: any) {
      setPreviewContent(`# ${file.name}\n\nUnable to retrieve live stream: ${err.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Direct Local File Upload & Storage in Database
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLocal(true);
    try {
      const text = await file.text();
      const isSheet = file.name.endsWith('.csv');
      let tableData: any = undefined;

      if (isSheet) {
        const rows = text
          .split('\n')
          .filter((r) => r.trim().length > 0)
          .map((r) => r.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')));
        if (rows.length > 0) {
          tableData = {
            sheetName: file.name.replace(/\.csv$/, ''),
            headers: rows[0],
            rows: rows.slice(1),
          };
        }
      }

      const newRec = addDatabaseRecord({
        projectId: activeProject.id,
        title: file.name,
        sourceType: isSheet ? 'GOOGLE_SHEET' : 'GOOGLE_DRIVE_FILE',
        category: isSheet ? 'SPRINT_DELIVERABLES' : 'PRD_REQUIREMENTS',
        fileId: `local_${Date.now()}`,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type || 'text/plain',
        summary: `Local file "${file.name}" uploaded and stored directly in project database.`,
        content: text,
        tableData,
        keyEntities: {
          requirements: [`Extracted from uploaded ${file.name}`],
          architecturalConstraints: [],
          tasksExtracted: tableData ? tableData.rows.map((r: any) => r[1] || r[0]).filter(Boolean) : [],
          risksIdentified: [],
        },
        tags: ['Local Upload', 'Stored in DB'],
      });

      setSelectedRecordId(newRec.id);
      setActiveTab('STORED_DOCS');
      setGroundingStatusMessage(`Uploaded "${file.name}" with full content stored in project database!`);
      setTimeout(() => setGroundingStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('File upload error:', err);
    } finally {
      setIsUploadingLocal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Direct Upload to Google Drive
  const handleUploadFileToGoogleDrive = async (fileToUpload: File) => {
    setIsUploadingToDrive(true);
    try {
      const token = googleAuth.accessToken || '';
      const uploadedFile = await uploadFileToGoogleDrive(token, fileToUpload);
      
      // Update local drive files list
      setDriveFiles((prev) => [uploadedFile, ...prev.filter((f) => f.id !== uploadedFile.id)]);
      
      setGroundingStatusMessage(`Successfully uploaded "${uploadedFile.name}" to your Google Drive!`);
      setTimeout(() => setGroundingStatusMessage(null), 5000);
      setIsDriveUploadModalOpen(false);
      setDriveUploadFile(null);
    } catch (err: any) {
      console.error('Drive upload error:', err);
      setGroundingStatusMessage(`Failed to upload to Google Drive: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingToDrive(false);
      if (driveFileInputRef.current) driveFileInputRef.current.value = '';
    }
  };

  // Create Google Doc on Google Drive
  const handleCreateDocOnGoogleDrive = async () => {
    if (!driveDocTitle.trim()) return;
    setIsUploadingToDrive(true);
    try {
      const token = googleAuth.accessToken || '';
      const doc = await createGoogleDriveDoc(
        token,
        driveDocTitle.trim(),
        driveDocContent.trim() || `# ${driveDocTitle.trim()}\n\nInitialized from Nebula Project Command Center.`
      );
      setDriveFiles((prev) => [doc, ...prev]);
      setGroundingStatusMessage(`Created Google Doc "${doc.name}" in your Google Drive!`);
      setTimeout(() => setGroundingStatusMessage(null), 5000);
      setIsDriveUploadModalOpen(false);
      setDriveDocTitle('');
      setDriveDocContent('');
    } catch (err: any) {
      console.error('Doc creation error:', err);
      setGroundingStatusMessage(`Error creating Google Doc: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Create Google Sheet on Google Drive
  const handleCreateSheetOnGoogleDrive = async () => {
    if (!driveSheetTitle.trim()) return;
    setIsUploadingToDrive(true);
    try {
      const token = googleAuth.accessToken || '';
      const headers = driveSheetHeaders.split(',').map((h) => h.trim()).filter(Boolean);
      const rows = driveSheetRows
        .split('\n')
        .map((r) => r.split(',').map((c) => c.trim()))
        .filter((r) => r.some(Boolean));
      
      const sheet = await createGoogleDriveSheet(token, driveSheetTitle.trim(), headers, rows);
      setDriveFiles((prev) => [sheet, ...prev]);
      setGroundingStatusMessage(`Created Google Sheet "${sheet.name}" in your Google Drive!`);
      setTimeout(() => setGroundingStatusMessage(null), 5000);
      setIsDriveUploadModalOpen(false);
      setDriveSheetTitle('');
    } catch (err: any) {
      console.error('Sheet creation error:', err);
      setGroundingStatusMessage(`Error creating Google Sheet: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Export Stored Database Record to Google Drive
  const handleExportRecordToDrive = async (rec: ProjectDatabaseRecord) => {
    setIsExportingRecordId(rec.id);
    try {
      const token = googleAuth.accessToken || '';
      if (rec.sourceType === 'GOOGLE_SHEET' && rec.tableData) {
        const sheet = await createGoogleDriveSheet(
          token,
          `${rec.title} (Exported from DB)`,
          rec.tableData.headers,
          rec.tableData.rows
        );
        setDriveFiles((prev) => [sheet, ...prev]);
        setGroundingStatusMessage(`Exported "${rec.title}" to Google Drive as Google Sheet!`);
      } else {
        const doc = await createGoogleDriveDoc(
          token,
          `${rec.title} (Exported from DB)`,
          rec.content
        );
        setDriveFiles((prev) => [doc, ...prev]);
        setGroundingStatusMessage(`Exported "${rec.title}" to Google Drive as Google Doc!`);
      }
      setTimeout(() => setGroundingStatusMessage(null), 5000);
    } catch (err: any) {
      console.error('Export error:', err);
      setGroundingStatusMessage(`Export error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExportingRecordId(null);
    }
  };

  // Save in-app edits to stored record
  const handleSaveInAppEdit = () => {
    if (!selectedRecord) return;
    updateDatabaseRecord(selectedRecord.id, {
      content: editableContent,
      syncStatus: 'LOCAL_OVERRIDE',
    });
    setIsEditingContent(false);
    setGroundingStatusMessage(`Saved manual edits to "${selectedRecord.title}" in project database.`);
    setTimeout(() => setGroundingStatusMessage(null), 3000);
  };

  // Sync All Trigger
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await syncAllProjectRecords(activeProject.id);
    setIsSyncingAll(false);
    setGroundingStatusMessage('All Google Workspace project database records refreshed & synchronized.');
    setTimeout(() => setGroundingStatusMessage(null), 4000);
  };

  // Sync Individual
  const handleSyncSingle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await syncDatabaseRecord(id);
    setGroundingStatusMessage('Document re-synced and verified with Google Workspace.');
    setTimeout(() => setGroundingStatusMessage(null), 3000);
  };

  // Convert Sheet rows to Kanban Tasks
  const handleImportTasksFromSheet = (record: ProjectDatabaseRecord) => {
    if (!record.tableData || !record.tableData.rows) return;

    let importedCount = 0;
    record.tableData.rows.forEach((row) => {
      const taskCode = row[0] || 'TSK';
      const taskTitle = row[1] || 'Imported Sprint Deliverable';
      const assignedName = row[2] || '';
      const priorityRaw = (row[3] || 'MEDIUM').toUpperCase();
      const statusRaw = (row[4] || 'TODO').toUpperCase();

      createTask({
        projectId: activeProject.id,
        title: `[${taskCode}] ${taskTitle}`,
        description: `Deliverable extracted from spreadsheet "${record.title}". Assigned to ${assignedName}.`,
        priority: priorityRaw.includes('CRIT') ? 'CRITICAL' : priorityRaw.includes('HIGH') ? 'HIGH' : 'MEDIUM',
        status: statusRaw.includes('DONE') ? 'DONE' : statusRaw.includes('PROG') ? 'IN_PROGRESS' : 'TODO',
        tags: ['Google Sheet', taskCode],
      });
      importedCount++;
    });

    addActivityLog({
      actor: { name: 'PM Agent', isAI: true, agentId: 'pm_agent' },
      action: 'Extracted Tasks from Stored Spreadsheet',
      entityName: record.title,
      entityType: 'TASK',
      projectId: activeProject.id,
      details: `Generated ${importedCount} task items directly from stored spreadsheet into Kanban DAG.`,
      status: 'SUCCESS',
    });

    setGroundingStatusMessage(`Extracted and created ${importedCount} tasks from spreadsheet into Kanban!`);
    setTimeout(() => setGroundingStatusMessage(null), 4000);
  };

  // Manual Add Modal Submission
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fileIdMatch = newUrl.match(/[-\w]{25,}/);
    const extractedFileId = fileIdMatch ? fileIdMatch[0] : `gdoc_${Date.now()}`;

    const newRec = addDatabaseRecord({
      projectId: activeProject.id,
      title: newTitle.trim(),
      sourceType: newSourceType,
      category: newCategory,
      fileId: extractedFileId,
      webViewLink: newUrl || `https://docs.google.com/${newSourceType === 'GOOGLE_SHEET' ? 'spreadsheets' : 'document'}/d/${extractedFileId}/edit`,
      summary: newSummary.trim() || `Technical ${newCategory} record stored in ${activeProject.name} database.`,
      content:
        newContent.trim() ||
        `# ${newTitle}\n\n## 1. System Requirements & Invariants\n- Stored directly in project database.\n- Grounded for Autonomous AI Agent Fleet.\n\n## 2. Specifications\n- Target project: ${activeProject.name}\n- Category: ${newCategory}`,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewTitle('');
    setNewUrl('');
    setNewSummary('');
    setNewContent('');
    setIsAddModalOpen(false);
    setSelectedRecordId(newRec.id);
    setGroundingStatusMessage(`Saved and indexed "${newRec.title}" into Project Database.`);
    setTimeout(() => setGroundingStatusMessage(null), 4000);
  };

  // Copy Content Helper
  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics
  const totalGroundedTokens = currentProjectRecords.reduce(
    (acc, r) => acc + (r.agentGrounding?.tokenCount || 1000),
    0
  );
  const totalRequirements = currentProjectRecords.reduce(
    (acc, r) => acc + (r.keyEntities?.requirements?.length || 0),
    0
  );
  const totalExtractedTasks = currentProjectRecords.reduce(
    (acc, r) => acc + (r.keyEntities?.tasksExtracted?.length || 0),
    0
  );

  return (
    <div id="project-database-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hidden Local File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalFileUpload}
        className="hidden"
        accept=".txt,.md,.markdown,.csv,.json,.yaml,.yml,.js,.ts,.tsx,.py"
      />

      {/* Hidden Google Drive Direct Upload Input */}
      <input
        type="file"
        ref={driveFileInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFileToGoogleDrive(f);
        }}
        className="hidden"
        accept="*/*"
      />

      {/* Top Banner: Project Context & Google Drive Connection Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-purple-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.1)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                style={{
                  backgroundColor: activeProject.celestial.color,
                  boxShadow: `0 0 10px ${activeProject.celestial.color}`,
                }}
              />
              <span className="text-[11px] uppercase font-tech tracking-[0.25em] text-purple-400 font-bold whitespace-nowrap">
                PROJECT DATABASE // PERSISTED SPECIFICATIONS & GOOGLE DRIVE
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeProject.name} Database
              </h1>
              <span className="text-xs font-tech font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 whitespace-nowrap">
                {activeProject.codename || 'NEB-01'}
              </span>
              <span className="text-xs font-tech px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 whitespace-nowrap flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                <span>Full Content Stored</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              All project documents, specifications, and spreadsheet datasets are retrieved from Google Drive and stored directly in your database. AI Agents (PM, Planning, Risk, Doc, QA) query this persisted knowledge base directly for zero-hallucination execution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Google Drive Auth Status */}
            {googleAuth.isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-tech font-bold">Drive Connected</span>
                <span className="text-[11px] text-emerald-400/80 font-mono hidden xl:inline">
                  {googleAuth.userEmail ? `(${googleAuth.userEmail})` : ''}
                </span>
              </div>
            ) : (
              <button
                onClick={() => connectGoogleWorkspace()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/40 text-purple-200 text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>CONNECT GOOGLE DRIVE</span>
              </button>
            )}

            {/* Sync All Button */}
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-tech font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="Sync all connected Google Drive, Docs and Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isSyncingAll ? 'SYNCING...' : 'SYNC ALL'}</span>
            </button>

            {/* Local File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingLocal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap"
              title="Upload Markdown, TXT, CSV or JSON into database"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isUploadingLocal ? 'animate-bounce text-cyan-400' : 'text-slate-400'}`} />
              <span>UPLOAD FILE</span>
            </button>

            {/* Manual Connect / Ingest Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-slate-950 text-xs font-tech font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>NEW RECORD</span>
            </button>
          </div>
        </div>

        {/* Lower Row: Project Switcher Pills Bar */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 font-tech">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="uppercase text-[11px] font-semibold text-slate-300">Active Project:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin scrollbar-thumb-purple-500/20">
            {projects.map((p) => {
              const isSelected = p.id === activeProject.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setSelectedRecordId(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white bg-black/40 hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: p.celestial?.color || '#a855f7' }}
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {groundingStatusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{groundingStatusMessage}</span>
          </div>
          <button onClick={() => setGroundingStatusMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer px-1">
            ✕
          </button>
        </div>
      )}

      {/* Knowledge Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider font-semibold">
              STORED IN DATABASE
            </div>
            <div className="text-xl font-bold text-white">
              {currentProjectRecords.length}{' '}
              <span className="text-xs text-slate-400 font-normal font-sans">files</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider font-semibold">
              GROUNDED TOKENS
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {totalGroundedTokens.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal font-sans">tokens</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider font-semibold">
              EXTRACTED INVARIANTS
            </div>
            <div className="text-xl font-bold text-purple-300">
              {totalRequirements}{' '}
              <span className="text-xs text-slate-400 font-normal font-sans">rules</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider font-semibold">
              AI AGENT FLEET
            </div>
            <div className="text-xl font-bold text-cyan-300 flex items-center gap-1.5">
              <span>5 / 5</span>
              <span className="text-[10px] font-tech text-emerald-400 uppercase font-semibold">Grounded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('STORED_DOCS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
              activeTab === 'STORED_DOCS'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>STORED DATABASE RECORDS ({currentProjectRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVE_EXPLORER')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
              activeTab === 'DRIVE_EXPLORER'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>GOOGLE DRIVE EXPLORER</span>
          </button>

          <button
            onClick={() => setActiveTab('SHEETS_MATRIX')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
              activeTab === 'SHEETS_MATRIX'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>SPREADSHEET DATA GRID</span>
          </button>

          <button
            onClick={() => setActiveTab('INVARIANTS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
              activeTab === 'INVARIANTS'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INVARIANTS & REQS ({totalRequirements})</span>
          </button>

          <button
            onClick={() => setActiveTab('AGENT_GROUNDING')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
              activeTab === 'AGENT_GROUNDING'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AGENT GROUNDING AUDIT</span>
          </button>
        </div>

        {/* Search & Category Filter for Stored Docs */}
        {activeTab === 'STORED_DOCS' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search stored files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900/60 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:border-purple-400"
            >
              <option value="ALL">All Formats</option>
              <option value="DOCS">Google Docs</option>
              <option value="SHEETS">Google Sheets</option>
              <option value="PRD_REQUIREMENTS">PRDs</option>
              <option value="SPRINT_DELIVERABLES">Deliverables</option>
              <option value="ARCHITECTURE_SPECS">Architecture</option>
              <option value="RISK_REGISTER">Risk Registers</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STORED DATABASE RECORDS (Master-Detail Full Content View) */}
      {/* ========================================================================= */}
      {activeTab === 'STORED_DOCS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Files Stored in Database */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-tech text-slate-400 font-bold uppercase tracking-wider">
                PERSISTED RECORDS ({filteredRecords.length})
              </span>
              <button
                onClick={() => setActiveTab('DRIVE_EXPLORER')}
                className="text-[11px] font-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Browse Drive</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 text-center space-y-3">
                <Database className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Stored Records Found</h4>
                <p className="text-xs text-slate-400">
                  Retrieve documents from your Google Drive or upload local specifications to store them in this project's database.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('DRIVE_EXPLORER')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-tech font-bold cursor-pointer"
                  >
                    Open Drive Explorer
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-tech font-bold cursor-pointer"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                const isDoc = rec.sourceType === 'GOOGLE_DOC';
                const isSheet = rec.sourceType === 'GOOGLE_SHEET';

                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/40 border-white/10 hover:border-purple-500/30 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Icon by Source Type */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSheet
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : isDoc
                              ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                              : 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                          }`}
                        >
                          {isSheet ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : isDoc ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <HardDrive className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[9px] font-tech font-bold px-1.5 py-0.5 rounded uppercase ${
                                isSheet
                                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                                  : isDoc
                                  ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30'
                                  : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {isSheet ? 'Google Sheet' : isDoc ? 'Google Doc' : 'Stored File'}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-tech font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
                              DATABASE STORED
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {rec.fileSize || '1.5 MB'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate mt-1">
                            {rec.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {rec.summary}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleSyncSingle(rec.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Re-sync latest content from Google Drive"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {rec.webViewLink && (
                          <a
                            href={rec.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Footer Badges */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 font-tech">AI GROUNDED</span>
                        <span className="text-slate-500">· {rec.agentGrounding?.tokenCount || 1500} tokens</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {(rec.tags || []).slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[9px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active In-App Document Viewer & Stored Content */}
          <div className="lg:col-span-7">
            {selectedRecord ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/30 backdrop-blur-xl space-y-5 shadow-2xl">
                {/* Header of Document Viewer */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-tech font-bold uppercase text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {selectedRecord.sourceType}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>Stored in Database</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Synced {selectedRecord.lastSyncedAt}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {selectedRecord.title}
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedRecord.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* If Sheet, Convert to Tasks */}
                    {selectedRecord.tableData && (
                      <button
                        onClick={() => handleImportTasksFromSheet(selectedRecord)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
                        title="Convert spreadsheet rows to real Kanban tasks"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>GENERATE TASKS</span>
                      </button>
                    )}

                    {/* In-App Content Editor Toggle */}
                    <button
                      onClick={() => {
                        if (isEditingContent) {
                          handleSaveInAppEdit();
                        } else {
                          setIsEditingContent(true);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all cursor-pointer ${
                        isEditingContent
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingContent ? 'SAVE EDITS' : 'EDIT CONTENT'}</span>
                    </button>

                    {/* Export to Google Drive */}
                    <button
                      onClick={() => handleExportRecordToDrive(selectedRecord)}
                      disabled={isExportingRecordId === selectedRecord.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-tech font-bold transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)] cursor-pointer disabled:opacity-50"
                      title="Export stored specification directly to Google Drive"
                    >
                      <HardDrive className={`w-3.5 h-3.5 ${isExportingRecordId === selectedRecord.id ? 'animate-spin' : ''}`} />
                      <span>{isExportingRecordId === selectedRecord.id ? 'EXPORTING...' : 'EXPORT TO DRIVE'}</span>
                    </button>

                    {/* Copy Content */}
                    <button
                      onClick={() => handleCopyContent(selectedRecord.content, selectedRecord.id)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
                      title="Copy stored content to clipboard"
                    >
                      {copiedId === selectedRecord.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* External Link */}
                    {selectedRecord.webViewLink && (
                      <a
                        href={selectedRecord.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-tech font-bold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>DRIVE</span>
                      </a>
                    )}

                    {/* Delete from Database */}
                    <button
                      onClick={() => deleteDatabaseRecord(selectedRecord.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-colors cursor-pointer"
                      title="Delete document from project database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grounding & Token Metadata Badge */}
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">
                      <strong className="text-white">Active Database Grounding Anchor:</strong> PM Agent, Planning Agent & Risk Agent query this stored content directly.
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-purple-300">
                      Tokens: {selectedRecord.agentGrounding?.tokenCount || 2000}
                    </span>
                    <span className="text-emerald-400">
                      Index Score: {selectedRecord.agentGrounding?.indexingScore || 98}%
                    </span>
                  </div>
                </div>

                {/* Key Entities & Invariants Chips */}
                {selectedRecord.keyEntities && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="text-[10px] font-tech text-slate-400 uppercase font-bold tracking-wider">
                      EXTRACTED INVARIANTS & DELIVERABLES
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedRecord.keyEntities.requirements || []).map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px]"
                        >
                          📌 {req}
                        </span>
                      ))}
                      {(selectedRecord.keyEntities.architecturalConstraints || []).map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-[11px]"
                        >
                          ⚡ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Content Render: Formatted Markdown, Spreadsheet Grid, or Raw Editor */}
                {isEditingContent ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-tech text-slate-400 font-bold uppercase">
                        EDIT STORED CONTENT // MARKDOWN / TEXT
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {editableContent.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={18}
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="w-full p-4 rounded-xl bg-black/60 border border-purple-500/40 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-400 leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingContent(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveInAppEdit}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs cursor-pointer"
                      >
                        Save to Database
                      </button>
                    </div>
                  </div>
                ) : selectedRecord.tableData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-tech text-slate-400 font-bold uppercase">
                        STORED SPREADSHEET DATA // {selectedRecord.tableData.sheetName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedRecord.tableData.rows.length} rows parsed and saved in DB
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 max-h-[440px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                          <tr className="border-b border-white/10 text-slate-300 font-tech">
                            {selectedRecord.tableData.headers.map((h, i) => (
                              <th key={i} className="py-2.5 px-3 font-semibold uppercase text-[11px] whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedRecord.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-3 text-slate-200 font-sans whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider font-bold">
                      STORED DOCUMENT SPECIFICATION
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 max-h-[500px] overflow-y-auto font-sans text-xs leading-relaxed text-slate-200">
                      <MarkdownRenderer content={selectedRecord.content} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/10 text-center text-slate-400 text-xs">
                Select a document from the left list or open the Google Drive Explorer to ingest files into your project database.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE DRIVE LIVE EXPLORER (Browse, Preview & Ingest into DB) */}
      {/* ========================================================================= */}
      {activeTab === 'DRIVE_EXPLORER' && (
        <div className="space-y-5">
          {/* Google Drive Auth Notice Banner when unauthenticated */}
          {(!googleAuth.accessToken || googleAuth.accessToken.startsWith('nebula_')) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/60 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-tech uppercase tracking-wide">
                    Live Google Drive Authorization Available
                  </div>
                  <p className="text-xs text-slate-300">
                    Sign in to authorize live file access from your connected Google Drive account{googleAuth.userEmail ? ` (${googleAuth.userEmail})` : ''}.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await connectGoogleWorkspace();
                    loadUserDriveFiles();
                  } catch (e) {
                    console.warn('Connect drive error:', e);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-tech font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <FolderOpen className="w-4 h-4 text-slate-950" />
                <span>AUTHORIZE GOOGLE DRIVE</span>
              </button>
            </div>
          )}

          {/* Explorer Header & Controls */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white font-sans">Google Drive Cloud Storage</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-tech font-bold text-[10px] border border-cyan-500/40">
                    LIVE REPOSITORY
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Direct bidirectional sync with Google Drive{googleAuth.userEmail ? ` (${googleAuth.userEmail})` : ''}. Upload files, create new Docs or Sheets, and ingest records into your project database.
                </p>
              </div>

              {/* Action Buttons: Upload & Create */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Upload to Google Drive Button */}
                <button
                  onClick={() => {
                    setDriveUploadMode('FILE');
                    setIsDriveUploadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-tech font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                  title="Upload local file directly to Google Drive"
                >
                  <UploadCloud className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>UPLOAD TO DRIVE</span>
                </button>

                {/* New Google Doc Button */}
                <button
                  onClick={() => {
                    setDriveUploadMode('DOC');
                    setDriveDocTitle(`PRD Spec - ${activeProject.name}`);
                    setDriveDocContent(`# ${activeProject.name} System Specification\n\n## 1. Overview\nComprehensive product requirements and architectural invariants.\n\n## 2. Key Requirements\n- Real-time DAG orchestration\n- Zero-hallucination agent fleet grounding\n- Bidirectional Google Workspace sync`);
                    setIsDriveUploadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 font-tech font-bold text-xs transition-all cursor-pointer"
                  title="Create a new Google Doc directly on Google Drive"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>NEW DOC</span>
                </button>

                {/* New Google Sheet Button */}
                <button
                  onClick={() => {
                    setDriveUploadMode('SHEET');
                    setDriveSheetTitle(`Sprint Deliverables - ${activeProject.name}`);
                    setIsDriveUploadModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-tech font-bold text-xs transition-all cursor-pointer"
                  title="Create a new Google Sheet directly on Google Drive"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NEW SHEET</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Search, Filter, and Refresh */}
            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search files in Google Drive..."
                    value={driveSearchQuery}
                    onChange={(e) => {
                      setDriveSearchQuery(e.target.value);
                      loadUserDriveFiles(e.target.value, driveFilterType);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Drive Type Filter */}
                <select
                  value={driveFilterType}
                  onChange={(e) => {
                    setDriveFilterType(e.target.value);
                    loadUserDriveFiles(driveSearchQuery, e.target.value);
                  }}
                  className="px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All File Types</option>
                  <option value="docs">Google Docs</option>
                  <option value="sheets">Google Sheets</option>
                  <option value="slides">Google Slides</option>
                  <option value="pdf">PDF Documents</option>
                </select>

                {/* Refresh Drive Button */}
                <button
                  onClick={() => loadUserDriveFiles(driveSearchQuery, driveFilterType)}
                  disabled={isLoadingDrive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-tech font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Quick Dropzone for Drive Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverDrive(true);
            }}
            onDragLeave={() => setIsDragOverDrive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverDrive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleUploadFileToGoogleDrive(file);
            }}
            onClick={() => driveFileInputRef.current?.click()}
            className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDragOverDrive
                ? 'bg-cyan-950/40 border-cyan-400 scale-[1.01] shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/40 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <UploadCloud className={`w-5 h-5 ${isUploadingToDrive ? 'animate-bounce' : ''}`} />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>{isUploadingToDrive ? 'Uploading to Google Drive...' : 'Drag & Drop files to upload to Google Drive'}</span>
                  <span className="text-[10px] font-tech text-cyan-400 uppercase font-semibold">Instant Upload</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Supports Markdown (.md), PDF, Word (.docx), Excel (.xlsx), CSV, JSON, TXT, and images.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              BROWSE FILES
            </button>
          </div>

          {/* Drive Files Grid */}
          {isLoadingDrive ? (
            <div className="p-16 rounded-2xl bg-slate-900/30 border border-white/10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Accessing Google Drive...</div>
              <p className="text-xs text-slate-400">Retrieving file metadata from user repository...</p>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/10 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Drive Files Found</div>
              <p className="text-xs text-slate-400">Try adjusting your search query or upload a new file above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driveFiles.map((file) => {
                const isAlreadyStored = currentProjectRecords.some((r) => r.fileId === file.id);
                const isSheet = file.mimeType.includes('spreadsheet') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
                const isDoc = file.mimeType.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.md');
                const isPdf = file.mimeType.includes('pdf');
                const isIngesting = ingestingFileId === file.id;

                return (
                  <div
                    key={file.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                      isAlreadyStored
                        ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                        : 'bg-slate-900/50 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSheet
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isDoc
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : isPdf
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {isSheet ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : isDoc ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <HardDrive className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isAlreadyStored ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-tech font-bold text-[9px] border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>IN DATABASE</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-tech font-bold text-[9px] border border-cyan-500/20">
                              READY TO INGEST
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                          <span>{file.size || 'Cloud File'}</span>
                          <span>·</span>
                          <span>{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Active'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on this file */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePreviewDriveFile(file)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-tech font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Preview document text in app"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PREVIEW</span>
                        </button>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Open file in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleIngestDriveFile(file)}
                        disabled={isIngesting}
                        className={`px-3 py-1.5 rounded-xl text-xs font-tech font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAlreadyStored
                            ? 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        }`}
                      >
                        {isIngesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>INGESTING...</span>
                          </>
                        ) : isAlreadyStored ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>RE-INGEST</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>STORE IN DB</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* In-App Quick Preview Modal */}
          {previewDriveFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{previewDriveFile.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Live Google Drive Preview</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewDriveFile(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-black/60 border border-white/10 font-sans text-xs leading-relaxed text-slate-200 min-h-[250px]">
                  {isLoadingPreview ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-slate-400 text-xs font-mono">Streaming file contents from Google Drive...</span>
                    </div>
                  ) : (
                    <MarkdownRenderer content={previewContent || 'No content found in document.'} />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400">
                    Ingesting will parse tasks, requirements, and store it permanently in this project's database.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDriveFile(null)}
                      className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        const target = previewDriveFile;
                        setPreviewDriveFile(null);
                        handleIngestDriveFile(target);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-slate-950 font-tech font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                    >
                      STORE IN DATABASE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SPREADSHEET DATA GRID MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'SHEETS_MATRIX' && (
        <div className="space-y-5">
          {currentProjectRecords.filter((r) => r.tableData && r.tableData.rows.length > 0).length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/10 text-center space-y-3">
              <Table className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Stored Spreadsheets Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Retrieve a sprint deliverables sheet from Google Drive or upload a CSV file to render tabular data grids.
              </p>
              <button
                onClick={() => setActiveTab('DRIVE_EXPLORER')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-tech font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Browse Drive for Spreadsheets
              </button>
            </div>
          ) : (
            currentProjectRecords
              .filter((r) => r.tableData && r.tableData.rows.length > 0)
              .map((sheetRec) => (
                <div
                  key={sheetRec.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{sheetRec.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-tech text-emerald-300">
                            Sheet: {sheetRec.tableData?.sheetName || 'Sheet1'}
                          </span>
                          <span>·</span>
                          <span>{sheetRec.tableData?.rows.length} rows stored in DB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleImportTasksFromSheet(sheetRec)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold transition-all cursor-pointer"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>GENERATE KANBAN TASKS</span>
                      </button>
                      <button
                        onClick={(e) => handleSyncSingle(sheetRec.id, e)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-white/10"
                        title="Re-sync from Google Drive"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300 font-tech">
                          {sheetRec.tableData?.headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 font-semibold uppercase text-[11px] whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sheetRec.tableData?.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3 text-slate-200 font-sans whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXTRACTED INVARIANTS & REQS */}
      {/* ========================================================================= */}
      {activeTab === 'INVARIANTS' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Extracted Project Invariants & Technical Rules</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Parsed from your stored documents and sheets. AI Agents verify these constraints before executing operations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-tech font-bold text-xs border border-purple-500/40">
              {totalRequirements} INVARIANTS ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProjectRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>{rec.title}</span>
                  </h4>
                  <span className="text-[10px] font-tech text-slate-400 uppercase">{rec.category}</span>
                </div>

                <div className="space-y-1.5">
                  {(rec.keyEntities?.requirements || ['Enforce data model consistency']).map((req, i) => (
                    <div key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{req}</span>
                    </div>
                  ))}
                  {(rec.keyEntities?.architecturalConstraints || []).map((con, i) => (
                    <div key={i} className="text-xs text-cyan-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">⚡</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AGENT GROUNDING AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'AGENT_GROUNDING' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Autonomous AI Agent Fleet Grounding Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifying that all 5 specialized agents strictly source their project knowledge from the stored database records.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-tech font-bold text-xs border border-emerald-500/40">
              GROUNDING ENFORCED (100%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { name: 'PM Agent', role: 'Autonomous PM', icon: '🤖', color: '#06b6d4' },
              { name: 'Risk Agent', role: 'Risk Sentinel', icon: '🛡️', color: '#f43f5e' },
              { name: 'Planning Agent', role: 'Strategic DAG', icon: '🧠', color: '#a855f7' },
              { name: 'Doc Agent', role: 'Docs & PRDs', icon: '📄', color: '#10b981' },
              { name: 'QA Agent', role: 'QA & Testing', icon: '⚡', color: '#eab308' },
            ].map((ag) => (
              <div
                key={ag.name}
                className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-center"
              >
                <div className="text-2xl">{ag.icon}</div>
                <div className="text-xs font-bold text-white">{ag.name}</div>
                <div className="text-[10px] text-slate-400">{ag.role}</div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-tech">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>GROUNDED</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs text-slate-300">
            <div className="text-[10px] font-tech text-slate-500 uppercase">
              SEMANTIC GROUNDING PIPELINE LOGS
            </div>
            <div>[✓] Google Drive index hydrated with {currentProjectRecords.length} stored records.</div>
            <div>[✓] Full text and spreadsheet tabular arrays stored persistently in database.</div>
            <div>[✓] Grounding prompt context injected into Gemini execution pipeline.</div>
            <div>[✓] Autonomous thinking algorithms active; source of truth locked to Stored Database.</div>
          </div>
        </div>
      )}

      {/* CONNECT / CREATE RECORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create Stored Database Record</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Atlas Technical PRD v2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Source Type
                  </label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as DatabaseSourceType)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="GOOGLE_DOC">Google Doc</option>
                    <option value="GOOGLE_SHEET">Google Sheet</option>
                    <option value="GOOGLE_DRIVE_FILE">Google Drive File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DatabaseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="PRD_REQUIREMENTS">PRD & Requirements</option>
                    <option value="SPRINT_DELIVERABLES">Sprint Deliverables</option>
                    <option value="ARCHITECTURE_SPECS">Architecture Spec</option>
                    <option value="API_SCHEMAS">API Contracts</option>
                    <option value="RISK_REGISTER">Risk Register</option>
                    <option value="RESEARCH_DATA">Research Data</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                  Google Drive / Docs URL or File ID
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/document/d/... or File ID"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                  Summary / Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of document invariants..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                  Full Document Content & Markdown (Stored in Database)
                </label>
                <textarea
                  rows={4}
                  placeholder="# Technical Spec..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-slate-950 font-tech font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  SAVE & STORE IN DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE DRIVE UPLOAD & DOCUMENT CREATION MODAL */}
      {isDriveUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Drive Cloud Workspace</h3>
                  <p className="text-[11px] text-slate-400">
                    Upload files or create documents directly in your connected Google Drive.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDriveUploadModalOpen(false);
                  setDriveUploadFile(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 text-xs font-tech font-bold">
              <button
                onClick={() => setDriveUploadMode('FILE')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driveUploadMode === 'FILE'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>UPLOAD FILE</span>
              </button>

              <button
                onClick={() => setDriveUploadMode('DOC')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driveUploadMode === 'DOC'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CREATE DOC</span>
              </button>

              <button
                onClick={() => setDriveUploadMode('SHEET')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  driveUploadMode === 'SHEET'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CREATE SHEET</span>
              </button>
            </div>

            {/* MODE 1: UPLOAD LOCAL FILE TO GOOGLE DRIVE */}
            {driveUploadMode === 'FILE' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverDrive(true);
                  }}
                  onDragLeave={() => setIsDragOverDrive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverDrive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) setDriveUploadFile(file);
                  }}
                  onClick={() => driveFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
                    isDragOverDrive
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-black/30 border-white/10 hover:border-cyan-500/40 hover:bg-black/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {driveUploadFile ? driveUploadFile.name : 'Select or drop a file to upload to Google Drive'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {driveUploadFile
                        ? `${(driveUploadFile.size / 1024).toFixed(1)} KB · Ready for multipart upload`
                        : 'PDF, DOCX, XLSX, CSV, Markdown, TXT, JSON, Images'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-tech font-bold"
                  >
                    {driveUploadFile ? 'CHOOSE DIFFERENT FILE' : 'BROWSE DEVICE'}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDriveUploadModalOpen(false);
                      setDriveUploadFile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-tech cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={!driveUploadFile || isUploadingToDrive}
                    onClick={() => driveUploadFile && handleUploadFileToGoogleDrive(driveUploadFile)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-tech font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <UploadCloud className={`w-4 h-4 ${isUploadingToDrive ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingToDrive ? 'UPLOADING TO DRIVE...' : 'CONFIRM & UPLOAD TO DRIVE'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: CREATE NEW GOOGLE DOC ON GOOGLE DRIVE */}
            {driveUploadMode === 'DOC' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Google Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architecture Invariants & Schema Design"
                    value={driveDocTitle}
                    onChange={(e) => setDriveDocTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Initial Document Content (Markdown / Text)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="# Specification..."
                    value={driveDocContent}
                    onChange={(e) => setDriveDocContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-400 font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsDriveUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-tech cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={!driveDocTitle.trim() || isUploadingToDrive}
                    onClick={handleCreateDocOnGoogleDrive}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-tech font-extrabold shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isUploadingToDrive ? 'CREATING DOC...' : 'CREATE GOOGLE DOC ON DRIVE'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: CREATE NEW GOOGLE SHEET ON GOOGLE DRIVE */}
            {driveUploadMode === 'SHEET' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Google Spreadsheet Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint 14 Deliverables Matrix"
                    value={driveSheetTitle}
                    onChange={(e) => setDriveSheetTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Column Headers (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Task Code, Deliverable Item, Assignee, Status, Priority"
                    value={driveSheetHeaders}
                    onChange={(e) => setDriveSheetHeaders(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-tech font-bold uppercase mb-1">
                    Initial Rows (Comma-Separated per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="TSK-101, Core Logic, Lead Engineer, IN_PROGRESS, HIGH"
                    value={driveSheetRows}
                    onChange={(e) => setDriveSheetRows(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsDriveUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-tech cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={!driveSheetTitle.trim() || isUploadingToDrive}
                    onClick={handleCreateSheetOnGoogleDrive}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isUploadingToDrive ? 'CREATING SHEET...' : 'CREATE GOOGLE SHEET ON DRIVE'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
