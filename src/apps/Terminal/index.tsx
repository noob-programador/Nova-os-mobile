import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { vfs } from '../../utils/fileSystem';
import { AppId } from '../../types';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
}

export const TerminalApp: React.FC = () => {
  const { user, reboot, updateSettings, launchApp, installedApps, sendNotification } = useOS();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'NovaOS Terminal v3.5 [Nebula Kernel]' },
    { type: 'system', content: 'Digite "help" para ver os comandos disponíveis.' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getCurrentPathStr = (): string => {
    if (!currentFolderId) return '~';
    const folder = vfs.getItemById(currentFolderId);
    return folder ? `~/${folder.name}` : '~';
  };

  const handleCommand = (rawCmd: string) => {
    const cmdStr = rawCmd.trim();
    if (!cmdStr) return;

    sounds.playTap();
    setHistory((prev) => [...prev, { type: 'input', content: `${user.name}@novaos:${getCurrentPathStr()}$ ${cmdStr}` }]);
    setCommandHistory((prev) => [cmdStr, ...prev]);
    setHistoryIndex(-1);

    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        setHistory((prev) => [
          ...prev,
          {
            type: 'output',
            content: `Comandos disponíveis:
  help               - Exibe esta lista de ajuda
  ls                 - Lista arquivos e pastas do diretório atual
  cd <pasta|..>      - Navega para um diretório
  pwd                - Mostra o caminho atual
  mkdir <nome>       - Cria uma nova pasta
  touch <nome>       - Cria um novo arquivo
  cat <arquivo>      - Exibe o conteúdo de um arquivo de texto
  rm <nome>          - Exclui um arquivo ou pasta
  echo <texto>       - Exibe um texto no terminal
  clear              - Limpa a tela do terminal
  open <app>         - Abre um aplicativo (ex: open snake, open calc)
  neofetch           - Exibe informações estilizadas do sistema
  theme <dark|light> - Altera o tema visual do sistema
  whoami             - Exibe o usuário ativo
  date               - Exibe a data e hora atual
  notify <msg>       - Dispara notificação com iluminação de borda
  reboot             - Reinicia o NovaOS
  history            - Mostra os comandos recentes`,
          },
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'ls': {
        const items = vfs.getItems(currentFolderId);
        if (items.length === 0) {
          setHistory((prev) => [...prev, { type: 'output', content: '(diretório vazio)' }]);
        } else {
          const list = items
            .map((it) => (it.type === 'folder' ? `📁 \x1b[34m${it.name}/\x1b[0m` : `📄 ${it.name} (${it.size}B)`))
            .join('    ');
          setHistory((prev) => [...prev, { type: 'output', content: list }]);
        }
        break;
      }

      case 'pwd':
        setHistory((prev) => [...prev, { type: 'output', content: getCurrentPathStr() }]);
        break;

      case 'cd': {
        const target = args[0];
        if (!target || target === '~' || target === '/') {
          setCurrentFolderId(null);
        } else if (target === '..') {
          if (currentFolderId) {
            const current = vfs.getItemById(currentFolderId);
            setCurrentFolderId(current?.parentId || null);
          }
        } else {
          const items = vfs.getItems(currentFolderId);
          const folder = items.find((i) => i.type === 'folder' && i.name.toLowerCase() === target.toLowerCase());
          if (folder) {
            setCurrentFolderId(folder.id);
          } else {
            setHistory((prev) => [...prev, { type: 'error', content: `cd: pasta "${target}" não encontrada.` }]);
          }
        }
        break;
      }

      case 'mkdir': {
        const name = args.join(' ');
        if (!name) {
          setHistory((prev) => [...prev, { type: 'error', content: 'Uso: mkdir <nome_da_pasta>' }]);
        } else {
          vfs.createFolder(name, currentFolderId);
          setHistory((prev) => [...prev, { type: 'success', content: `Pasta "${name}" criada.` }]);
        }
        break;
      }

      case 'touch': {
        const name = args[0];
        if (!name) {
          setHistory((prev) => [...prev, { type: 'error', content: 'Uso: touch <nome_do_arquivo>' }]);
        } else {
          vfs.createFile(name, '', currentFolderId);
          setHistory((prev) => [...prev, { type: 'success', content: `Arquivo "${name}" criado.` }]);
        }
        break;
      }

      case 'cat': {
        const name = args[0];
        if (!name) {
          setHistory((prev) => [...prev, { type: 'error', content: 'Uso: cat <nome_do_arquivo>' }]);
        } else {
          const items = vfs.getItems(currentFolderId);
          const file = items.find((i) => i.type === 'file' && i.name.toLowerCase() === name.toLowerCase());
          if (file) {
            setHistory((prev) => [...prev, { type: 'output', content: file.content || '(arquivo vazio)' }]);
          } else {
            setHistory((prev) => [...prev, { type: 'error', content: `cat: arquivo "${name}" não encontrado.` }]);
          }
        }
        break;
      }

      case 'rm': {
        const name = args[0];
        if (!name) {
          setHistory((prev) => [...prev, { type: 'error', content: 'Uso: rm <nome>' }]);
        } else {
          const items = vfs.getItems(currentFolderId);
          const item = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
          if (item) {
            vfs.deleteItem(item.id);
            setHistory((prev) => [...prev, { type: 'success', content: `Item "${name}" removido.` }]);
          } else {
            setHistory((prev) => [...prev, { type: 'error', content: `rm: "${name}" não encontrado.` }]);
          }
        }
        break;
      }

      case 'echo':
        setHistory((prev) => [...prev, { type: 'output', content: args.join(' ') }]);
        break;

      case 'whoami':
        setHistory((prev) => [...prev, { type: 'output', content: `${user.name} (${user.role || 'user'})` }]);
        break;

      case 'date':
        setHistory((prev) => [...prev, { type: 'output', content: new Date().toString() }]);
        break;

      case 'open': {
        const appTarget = args[0]?.toLowerCase();
        const found = installedApps.find(
          (a) =>
            a.id.toLowerCase() === appTarget ||
            a.defaultTitle.toLowerCase().replace(/\s+/g, '') === appTarget
        );
        if (found) {
          launchApp(found.id as AppId);
          setHistory((prev) => [...prev, { type: 'success', content: `Abrindo ${found.defaultTitle}...` }]);
        } else {
          setHistory((prev) => [
            ...prev,
            { type: 'error', content: `App "${appTarget}" não encontrado. Apps disponíveis: ${installedApps.map((a) => a.id).join(', ')}` },
          ]);
        }
        break;
      }

      case 'theme': {
        const tVal = args[0]?.toLowerCase();
        if (tVal === 'light' || tVal === 'dark' || tVal === 'amoled') {
          updateSettings({ theme: tVal });
          setHistory((prev) => [...prev, { type: 'success', content: `Tema alterado para ${tVal}.` }]);
        } else {
          setHistory((prev) => [...prev, { type: 'error', content: 'Uso: theme <light|dark|amoled>' }]);
        }
        break;
      }

      case 'neofetch':
        setHistory((prev) => [
          ...prev,
          {
            type: 'output',
            content: `
   .---.       \x1b[36m${user.name}@novaos\x1b[0m
  /     \\      ------------------
 | () () |     \x1b[33mOS:\x1b[0m NovaOS Mobile 3.5 "Nebula"
  \\  _  /      \x1b[33mHost:\x1b[0m WebAssembly Mobile Virtual Machine
   \`---\`       \x1b[33mKernel:\x1b[0m Nebula Microkernel 3.5.0-wasm
               \x1b[33mUptime:\x1b[0m 100%
               \x1b[33mPackages:\x1b[0m 14 Virtual Apps & Games
               \x1b[33mMemory:\x1b[0m 8192 MB (Virtual RAM)
               \x1b[33mCompositor:\x1b[0m React + TailwindCSS + Motion
            `,
          },
        ]);
        break;

      case 'history':
        setHistory((prev) => [
          ...prev,
          { type: 'output', content: commandHistory.map((c, i) => `${i + 1}  ${c}`).join('\n') },
        ]);
        break;

      case 'notify': {
        const message = args.join(' ') || 'Notificação enviada pelo Terminal!';
        sendNotification({
          appId: 'terminal',
          title: 'Terminal NovaOS',
          message,
          priority: 'normal',
        });
        setHistory((prev) => [
          ...prev,
          { type: 'success', content: `Notificação enviada. Efeito de borda pulsado na tela!` },
        ]);
        break;
      }

      case 'reboot':
        reboot();
        break;

      default:
        setHistory((prev) => [
          ...prev,
          { type: 'error', content: `Comando não reconhecido: "${command}". Digite "help" para ver a lista.` },
        ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const commands = ['help', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'rm', 'echo', 'clear', 'open', 'neofetch', 'theme', 'whoami', 'date', 'reboot'];
      const match = commands.find((c) => c.startsWith(inputVal.toLowerCase()));
      if (match) {
        setInputVal(match);
      }
    }
  };

  return (
    <div
      id="terminal-app"
      onClick={() => inputRef.current?.focus()}
      className="w-full h-full bg-black text-emerald-400 font-mono text-xs p-4 flex flex-col justify-between select-text overflow-hidden cursor-text"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-950 select-none">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">bash - novaos@nebula</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-zinc-500">
          <span>Tab: Auto</span>
          <span>↑/↓: Histórico</span>
        </div>
      </div>

      {/* Terminal History */}
      <div className="flex-1 overflow-y-auto my-2 space-y-1.5 scrollbar-thin">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === 'input'
                ? 'text-cyan-400 font-bold'
                : line.type === 'error'
                ? 'text-rose-400'
                : line.type === 'success'
                ? 'text-emerald-300 font-bold'
                : line.type === 'system'
                ? 'text-zinc-500 italic'
                : 'text-zinc-300'
            }`}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Prompt Input Row */}
      <div className="flex items-center space-x-2 pt-2 border-t border-emerald-950">
        <span className="text-cyan-400 font-bold whitespace-nowrap">
          {user.name.toLowerCase().replace(/\s+/g, '')}@novaos:{getCurrentPathStr()}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-emerald-300 focus:outline-none font-mono text-xs"
        />
        <button
          onClick={() => {
            handleCommand(inputVal);
            setInputVal('');
          }}
          className="p-1 rounded bg-emerald-950 text-emerald-400 sm:hidden"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
