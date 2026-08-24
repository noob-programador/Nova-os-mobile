import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  FolderPlus,
  FilePlus,
  Upload,
  ChevronRight,
  Home,
  LayoutGrid,
  List,
  Search,
  Trash2,
  Edit2,
  Download,
  Info,
  X,
  Save,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { vfs } from '../../utils/fileSystem';
import { VirtualItem } from '../../types';

export const FileExplorerApp: React.FC = () => {
  const { t, sendNotification } = useOS();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<VirtualItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<VirtualItem | null>(null);
  const [editingFile, setEditingFile] = useState<VirtualItem | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshItems = () => {
    if (searchTerm.trim()) {
      const all = vfs.getAll();
      setItems(all.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setItems(vfs.getItems(currentFolderId));
    }
  };

  useEffect(() => {
    refreshItems();
  }, [currentFolderId, searchTerm]);

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Raiz' }];
    if (!currentFolderId) return crumbs;

    let curr = vfs.getItemById(currentFolderId);
    const trail: { id: string; name: string }[] = [];
    while (curr) {
      trail.unshift({ id: curr.id, name: curr.name });
      curr = curr.parentId ? vfs.getItemById(curr.parentId) : undefined;
    }
    return [...crumbs, ...trail];
  };

  const handleOpenFolder = (folderId: string) => {
    sounds.playTap();
    setCurrentFolderId(folderId);
    setSearchTerm('');
    setSelectedItem(null);
  };

  const handleCreateFolder = () => {
    sounds.playTap();
    const name = prompt(t('files', 'folderName'), 'Nova Pasta');
    if (name) {
      vfs.createFolder(name, currentFolderId);
      refreshItems();
    }
  };

  const handleCreateFile = () => {
    sounds.playTap();
    const name = prompt(t('files', 'fileName'), 'documento.txt');
    if (name) {
      vfs.createFile(name, 'Novo documento de texto...', currentFolderId);
      refreshItems();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playTap();
    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        vfs.createFile(file.name, event.target?.result as string, currentFolderId, file.type);
        refreshItems();
        sendNotification({
          appId: 'files',
          title: 'Arquivo Carregado',
          message: `${file.name} salvo no sistema de arquivos.`,
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        vfs.createFile(file.name, (event.target?.result as string) || '', currentFolderId, file.type);
        refreshItems();
        sendNotification({
          appId: 'files',
          title: 'Arquivo Carregado',
          message: `${file.name} salvo no sistema de arquivos.`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleDelete = (item: VirtualItem) => {
    sounds.playTap();
    if (confirm(`${t('files', 'delete')} "${item.name}"?`)) {
      vfs.deleteItem(item.id);
      if (selectedItem?.id === item.id) setSelectedItem(null);
      refreshItems();
    }
  };

  const handleStartRename = (item: VirtualItem) => {
    sounds.playTap();
    setRenamingId(item.id);
    setNewName(item.name);
  };

  const handleFinishRename = (id: string) => {
    sounds.playTap();
    if (newName.trim()) {
      vfs.renameItem(id, newName.trim());
      refreshItems();
    }
    setRenamingId(null);
  };

  const handleOpenFile = (item: VirtualItem) => {
    sounds.playTap();
    if (item.type === 'folder') {
      handleOpenFolder(item.id);
    } else {
      setEditingFile(item);
      setFileContent(item.content || '');
    }
  };

  const handleSaveFileContent = () => {
    if (!editingFile) return;
    sounds.playTap();
    vfs.updateContent(editingFile.id, fileContent);
    sendNotification({
      appId: 'files',
      title: 'Arquivo Salvo',
      message: `${editingFile.name} atualizado com sucesso.`,
    });
    setEditingFile(null);
    refreshItems();
  };

  const getItemIcon = (item: VirtualItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-amber-400 fill-amber-400/20" />;
    }
    if (item.mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-purple-400" />;
    }
    return <FileText className="w-8 h-8 text-blue-400" />;
  };

  return (
    <div id="file-explorer-app" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between select-none overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* Top Toolbar */}
      <div className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight">{t('apps', 'files')}</h2>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleCreateFolder}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={t('files', 'newFolder')}
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={handleCreateFile}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={t('files', 'newFile')}
            >
              <FilePlus className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={t('files', 'upload')}
            >
              <Upload className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search Bar & Breadcrumbs */}
        <div className="flex items-center space-x-2">
          {/* Breadcrumbs trail */}
          <div className="flex-1 flex items-center space-x-1 overflow-x-auto text-xs text-zinc-400 scrollbar-none py-1">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />}
                <button
                  onClick={() => {
                    sounds.playTap();
                    setCurrentFolderId(crumb.id);
                  }}
                  className="hover:text-cyan-400 whitespace-nowrap font-medium"
                >
                  {crumb.id === null ? <Home className="w-3.5 h-3.5 inline" /> : crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="relative w-36 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-zinc-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Main Files View (Grid / List) */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {items.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => handleOpenFile(item)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-500/20 border-blue-500 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div onClick={() => handleOpenFile(item)} className="p-2 cursor-pointer">
                    {getItemIcon(item)}
                  </div>

                  {renamingId === item.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => handleFinishRename(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(item.id)}
                      autoFocus
                      className="w-full bg-zinc-800 text-xs text-center border border-blue-400 rounded px-1"
                    />
                  ) : (
                    <span className="text-xs font-medium text-zinc-200 truncate w-full mt-1">
                      {item.name}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                    {item.type === 'folder' ? 'Pasta' : `${item.size} B`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => handleOpenFile(item)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'bg-blue-500/20 text-white' : 'hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    {getItemIcon(item)}
                    <span className="text-xs font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-zinc-500 font-mono">
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    <span>{item.type === 'folder' ? '-' : `${item.size} B`}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
            <Folder className="w-10 h-10 opacity-30" />
            <p className="text-xs">{t('files', 'emptyFolder')}</p>
          </div>
        )}
      </div>

      {/* Selected Item Actions Footer */}
      {selectedItem && (
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="truncate max-w-[140px] font-bold">{selectedItem.name}</span>
            <span className="text-zinc-500 font-mono">({selectedItem.size} bytes)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleOpenFile(selectedItem)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Abrir
            </button>
            <button
              onClick={() => handleStartRename(selectedItem)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Renomear"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(selectedItem)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* In-App File Editor / Viewer Modal */}
      {editingFile && (
        <div className="absolute inset-0 z-30 bg-zinc-950/95 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold">{editingFile.name}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveFileContent}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
              <button
                onClick={() => setEditingFile(null)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 py-3 overflow-hidden">
            {editingFile.mimeType?.startsWith('image/') ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={editingFile.content}
                  alt={editingFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 resize-none focus:outline-none focus:border-blue-400"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
