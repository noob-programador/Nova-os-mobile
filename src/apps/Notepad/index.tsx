import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Download,
  Upload,
  Eye,
  Edit3,
  ChevronLeft,
  Tag,
  Share2,
  FileText,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { NoteItem } from '../../types';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: '📱 Bem-vindo ao NovaOS Mobile',
    content: `# Bem-vindo ao NovaOS! 🚀

Este é o aplicativo de **Notas** oficial do NovaOS.

### ✨ Funcionalidades:
- Suporte a formatação **Markdown**
- *Modo de Pré-visualização* e Edição
- Salvamento automático com persistência
- Exportação e importação de arquivos
- Contador de palavras e caracteres em tempo real

*Dica:* Toque no ícone do olho para alternar a visualização renderizada!`,
    pinned: true,
    category: 'Geral',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 12,
    tags: ['introdução', 'dicas'],
  },
  {
    id: 'note-2',
    title: '📝 Ideias para Novos Aplicativos',
    content: `## Lista de Apps Futuros:
1. Reprodutor de Música com visualizador de ondas
2. Gravador de Áudio com microfone
3. Loja de Temas Personalizados
4. Emulador de Game Boy WebAssembly`,
    pinned: false,
    category: 'Ideias',
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
    tags: ['roadmap', 'dev'],
  },
];

export const NotepadApp: React.FC = () => {
  const { t, sendNotification } = useOS();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('novaos_notes_v1');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('novaos_notes_v1', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCreateNote = () => {
    sounds.playTap();
    const newNote: NoteItem = {
      id: 'note-' + Math.random().toString(36).substring(2, 9),
      title: 'Nova Nota',
      content: '',
      pinned: false,
      category: 'Geral',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsPreviewMode(false);
  };

  const handleUpdateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNoteId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? {
              ...n,
              ...updates,
              updatedAt: Date.now(),
              // derive title from first line if title is generic
              title:
                updates.content !== undefined
                  ? updates.content.split('\n')[0].replace(/^#+\s*/, '').trim() || n.title
                  : n.title,
            }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    sounds.playTap();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.find((n) => n.id !== id)?.id || null);
    }
  };

  const handleTogglePin = (id: string) => {
    sounds.playTap();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleExport = () => {
    if (!activeNote) return;
    sounds.playTap();
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    sendNotification({
      appId: 'notepad',
      title: 'Nota Exportada',
      message: `${activeNote.title} foi baixada como arquivo Markdown.`,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newNote: NoteItem = {
        id: 'note-' + Math.random().toString(36).substring(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: content || '',
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['importado'],
      };
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      sounds.playUnlock();
    };
    reader.readAsText(file);
  };

  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  // Calculate words and characters count
  const wordCount = activeNote?.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0;
  const charCount = activeNote?.content.length || 0;

  return (
    <div id="notepad-app" className="w-full h-full bg-zinc-950 text-white flex select-none overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".txt,.md,.json"
        className="hidden"
      />

      {/* Sidebar List of Notes */}
      <div
        className={`${
          activeNoteId ? 'hidden sm:flex' : 'flex'
        } w-full sm:w-64 border-r border-zinc-800 flex-col justify-between bg-zinc-900/60`}
      >
        <div className="p-3.5 space-y-3 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold tracking-tight">{t('apps', 'notepad')}</h2>
            </div>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all active:scale-95 shadow-md shadow-amber-500/20"
              title={t('notes', 'newNote')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('notes', 'searchPlaceholder')}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Note list items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                sounds.playTap();
                setActiveNoteId(note.id);
              }}
              className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                activeNoteId === note.id
                  ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                  : 'bg-zinc-800/40 border-transparent hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-bold truncate pr-2">{note.title || 'Sem título'}</h3>
                {note.pinned && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 fill-current" />}
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                {note.content.replace(/^#+\s*/, '') || 'Nota vazia...'}
              </p>
              <span className="text-[9px] text-zinc-500 mt-1 block font-mono">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <p className="text-center text-xs text-zinc-500 py-8">{t('notes', 'noNotes')}</p>
          )}
        </div>

        {/* Import button in sidebar */}
        <div className="p-2 border-t border-zinc-800 flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('notes', 'import')}</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Main Panel */}
      {activeNote ? (
        <div className={`${activeNoteId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col justify-between bg-zinc-950`}>
          {/* Note Editor Header */}
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveNoteId(null)}
                className="p-1 rounded-lg bg-zinc-800 sm:hidden text-zinc-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-amber-400 max-w-[160px] sm:max-w-xs truncate"
                placeholder={t('notes', 'titlePlaceholder')}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1 ${
                  isPreviewMode ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300'
                }`}
                title="Alternar Markdown Preview"
              >
                {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isPreviewMode ? 'Editar' : 'Visualizar'}</span>
              </button>

              <button
                onClick={() => handleTogglePin(activeNote.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  activeNote.pinned ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                }`}
                title="Fixar"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Exportar Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea or Markdown Render Container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!isPreviewMode ? (
              <textarea
                id="note-editor-textarea"
                value={activeNote.content}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder={t('notes', 'contentPlaceholder')}
                className="w-full h-full bg-transparent text-zinc-200 text-sm leading-relaxed resize-none focus:outline-none font-mono"
              />
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-zinc-200 space-y-2 whitespace-pre-wrap leading-relaxed">
                {activeNote.content || <span className="text-zinc-500 italic">Nota vazia</span>}
              </div>
            )}
          </div>

          {/* Footer with stats */}
          <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>{t('notes', 'saved')}</span>
            <span>
              {wordCount} {t('notes', 'words')} • {charCount} {t('notes', 'characters')}
            </span>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-zinc-500 space-y-2">
          <FileText className="w-10 h-10 opacity-30" />
          <p className="text-xs">{t('notes', 'noNotes')}</p>
        </div>
      )}
    </div>
  );
};
