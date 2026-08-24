import { VirtualItem } from '../types';

const STORAGE_KEY = 'novaos_virtual_fs_v1';

export const initialFileSystem: VirtualItem[] = [
  // Root directories
  {
    id: 'dir-docs',
    name: 'Documentos',
    type: 'folder',
    parentId: null,
    size: 4096,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    favorite: true,
  },
  {
    id: 'dir-pictures',
    name: 'Fotos',
    type: 'folder',
    parentId: null,
    size: 4096,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    favorite: true,
  },
  {
    id: 'dir-system',
    name: 'Sistema',
    type: 'folder',
    parentId: null,
    size: 4096,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'dir-games',
    name: 'Jogos',
    type: 'folder',
    parentId: null,
    size: 4096,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  // Sample files inside Documentos
  {
    id: 'file-welcome',
    name: 'Bem-vindo_ao_NovaOS.md',
    type: 'file',
    parentId: 'dir-docs',
    content: `# Bem-vindo ao NovaOS Mobile! 📱

NovaOS é uma experiência completa de Sistema Operacional Mobile simulada diretamente no navegador web.

## 🚀 Recursos Disponíveis:
- **Área de Trabalho Interativa**: Widgets ao vivo, múltiplas páginas, dock com blur.
- **Multitarefas em Cartões**: Navegue facilmente entre os apps abertos.
- **Central de Notificações e Quick Settings**: Controle brilho, volume, wifi e lanterna.
- **5 Aplicativos Essenciais**: Calculadora Científica, Notas em Markdown, Explorador de Arquivos, Ajustes e Terminal Unix.
- **6 Jogos Retrô**: Cobrinha (Snake), Tetris, Pac-Man, Campo Minado, Xadrez e Jogo da Velha.
- **Motor de Áudio WebAudio**: Efeitos sonoros fiéis sintetizados em tempo real.

Aproveite o sistema!`,
    size: 742,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    mimeType: 'text/markdown',
  },
  {
    id: 'file-todo',
    name: 'Metas_2026.txt',
    type: 'file',
    parentId: 'dir-docs',
    content: `[x] Finalizar projeto NovaOS Mobile
[x] Implementar 6 jogos clássicos
[x] Adicionar suporte a múltiplos idiomas
[ ] Criar novo wallpaper holográfico
[ ] Bater recorde no Tetris`,
    size: 198,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    mimeType: 'text/plain',
  },
  // Sample files inside Sistema
  {
    id: 'file-sysinfo',
    name: 'sys_info.json',
    type: 'file',
    parentId: 'dir-system',
    content: JSON.stringify(
      {
        os: 'NovaOS Mobile',
        version: '3.5.0-nebula',
        arch: 'wasm-v8',
        kernel: 'Nebula Microkernel 3.5',
        buildDate: '2026-08-23',
        status: 'stable',
      },
      null,
      2
    ),
    size: 210,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    mimeType: 'application/json',
  },
  {
    id: 'file-kernel-log',
    name: 'kernel.log',
    type: 'file',
    parentId: 'dir-system',
    content: `[0.000000] Linux NovaOS version 3.5-nebula (builder@nova)
[0.001200] Memory: 8192MB Virtual RAM initialized
[0.003400] WebAudio Synth driver attached
[0.005600] Virtual FS root mounted rw
[0.008900] GUI Compositor started with 60FPS target
[0.012000] System is ready.`,
    size: 320,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 8,
    mimeType: 'text/plain',
  },
  // Sample files inside Jogos
  {
    id: 'file-games-guide',
    name: 'Dicas_Jogos.txt',
    type: 'file',
    parentId: 'dir-games',
    content: `Dicas para os jogos do NovaOS:
1. Xadrez: A IA no modo Médio calcula 3 lances à frente. Tente controlar o centro do tabuleiro!
2. Tetris: Salve a peça "I" longa no Hold para quando precisar de um Tetris de 4 linhas.
3. Campo Minado: Toque longo ou use o modo bandeira para marcar minas suspeitas.
4. Cobrinha: Maçãs douradas dão o triplo de pontos!`,
    size: 380,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    mimeType: 'text/plain',
  },
];

export class VirtualFileSystem {
  private items: VirtualItem[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...initialFileSystem];
        this.save();
      }
    } catch {
      this.items = [...initialFileSystem];
    }
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Failed to save VFS to localStorage', e);
    }
  }

  public getItems(parentId: string | null = null): VirtualItem[] {
    return this.items.filter((i) => i.parentId === parentId);
  }

  public getAll(): VirtualItem[] {
    return [...this.items];
  }

  public getItemById(id: string): VirtualItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  public getItemByPath(path: string): VirtualItem | undefined {
    const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
    if (!cleanPath) return undefined;
    const parts = cleanPath.split('/');

    let currentParent: string | null = null;
    let foundItem: VirtualItem | undefined;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      foundItem = this.items.find((it) => it.parentId === currentParent && it.name.toLowerCase() === part.toLowerCase());
      if (!foundItem) return undefined;
      currentParent = foundItem.id;
    }

    return foundItem;
  }

  public getPath(item: VirtualItem): string {
    const parts: string[] = [item.name];
    let parentId = item.parentId;

    while (parentId) {
      const parent = this.getItemById(parentId);
      if (parent) {
        parts.unshift(parent.name);
        parentId = parent.parentId;
      } else {
        break;
      }
    }

    return '/' + parts.join('/');
  }

  public createFolder(name: string, parentId: string | null = null): VirtualItem {
    const newFolder: VirtualItem = {
      id: 'dir-' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Nova Pasta',
      type: 'folder',
      parentId,
      size: 4096,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.items.push(newFolder);
    this.save();
    return newFolder;
  }

  public createFile(name: string, content: string = '', parentId: string | null = null, mimeType: string = 'text/plain'): VirtualItem {
    const newFile: VirtualItem = {
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'novo_arquivo.txt',
      type: 'file',
      parentId,
      content,
      size: content.length || 128,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mimeType,
    };
    this.items.push(newFile);
    this.save();
    return newFile;
  }

  public updateContent(id: string, content: string): boolean {
    const item = this.getItemById(id);
    if (!item || item.type !== 'file') return false;
    item.content = content;
    item.size = content.length;
    item.updatedAt = Date.now();
    this.save();
    return true;
  }

  public renameItem(id: string, newName: string): boolean {
    const item = this.getItemById(id);
    if (!item || !newName.trim()) return false;
    item.name = newName.trim();
    item.updatedAt = Date.now();
    this.save();
    return true;
  }

  public deleteItem(id: string): boolean {
    const toDeleteIds = new Set<string>([id]);
    
    // recursively collect child ids if folder
    const collectChildren = (pId: string) => {
      const children = this.items.filter((i) => i.parentId === pId);
      for (const child of children) {
        toDeleteIds.add(child.id);
        if (child.type === 'folder') {
          collectChildren(child.id);
        }
      }
    };

    collectChildren(id);
    this.items = this.items.filter((i) => !toDeleteIds.has(i.id));
    this.save();
    return true;
  }

  public resetToDefault() {
    this.items = [...initialFileSystem];
    this.save();
  }

  public getTotalSize(): number {
    return this.items.reduce((sum, it) => sum + it.size, 0);
  }
}

export const vfs = new VirtualFileSystem();
