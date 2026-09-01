import React, { useState } from 'react';
import { FileText, Search, Plus, Sparkles, Folder, Tag, ExternalLink, X, Upload } from 'lucide-react';
import { useNebula } from '../context/NebulaContext';

export const KnowledgeBaseView: React.FC = () => {
  const { documents, uploadDocument, projects, activeProject } = useNebula();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Doc Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture Specification');
  const [newProjectId, setNewProjectId] = useState(activeProject?.id || projects[0]?.id || '');
  const [newSummary, setNewSummary] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.summary || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    uploadDocument({
      title: newTitle,
      category: newCategory,
      projectId: newProjectId,
      summary: newSummary,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      content: newContent,
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    setNewTitle('');
    setNewSummary('');
    setNewTags('');
    setNewContent('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="knowledge-base-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-purple-400 font-bold mb-1 font-tech">
            TECHNICAL REPOSITORY // SPECIFICATIONS
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            KNOWLEDGE{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
              BASE
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-sans text-white/40 mt-1">
            Technical PRDs, architectural specifications, and hackathon playbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
            <input
              type="text"
              placeholder="Search specs, PRDs, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-tech text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-tech text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>NEW SPEC</span>
          </button>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="p-12 rounded-2xl frosty-card text-center space-y-3 border border-white/10">
          <FileText className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="font-tech text-base font-bold text-white">Knowledge Base Empty</h3>
          <p className="text-xs text-white/50 font-sans max-w-md mx-auto">
            Upload technical PRDs, architecture specifications, API contracts, or meeting memos to ground your autonomous agent fleet.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-tech font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => {
            const docProj = projects.find((p) => p.id === doc.projectId);
            return (
              <div
                key={doc.id}
                className="p-6 rounded-2xl frosty-card frosty-card-interactive hover:border-purple-400/50 transition-all space-y-4 group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-tech text-purple-400 uppercase tracking-wider">
                      {doc.category || 'Specification'} • {docProj?.name || doc.projectId || 'General'}
                    </span>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-purple-300 transition-colors mt-1">
                      {doc.title}
                    </h3>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
                </div>

                <p className="text-xs text-white/60 font-sans leading-relaxed">{doc.summary || doc.content}</p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(doc.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.02] border border-white/10 text-[10px] font-tech text-white/60 backdrop-blur-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-tech text-white/40 pt-3 border-t border-white/10">
                  Last modified: {doc.lastUpdated || 'Recently'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#0a071e]/90 border border-white/20 p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-tech text-purple-400 font-bold uppercase tracking-widest">
                  DOCUMENT REPOSITORY
                </span>
                <h3 className="font-tech text-lg font-bold text-white">Create New Spec or PRD</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs font-tech">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Architecture Specification & API Contracts"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. PRD, Architecture, SOP"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Project</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Summary</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="High-level overview of this document..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Kafka, Redis, Architecture, Security"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Document Content / Markdown</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="# System Overview&#10;Detailed architecture specs and requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-tech font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
