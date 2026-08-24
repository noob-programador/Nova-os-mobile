import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { AppId } from '../../types';
import { ErrorBoundary } from './ErrorBoundary';
import { FloatingWindow } from '../multitasking/WindowManager';

// Apps
import { CalculatorApp } from '../../apps/Calculator';
import { NotepadApp } from '../../apps/Notepad';
import { FileExplorerApp } from '../../apps/FileExplorer';
import { SettingsApp } from '../../apps/Settings';
import { TerminalApp } from '../../apps/Terminal';
import { CameraApp } from '../../apps/Camera';
import { GalleryApp } from '../../apps/Gallery';
import { ClockApp } from '../../apps/Clock';

// Games
import { SnakeGame } from '../../games/Snake';
import { TetrisGame } from '../../games/Tetris';
import { PacmanGame } from '../../games/Pacman';
import { MinesweeperGame } from '../../games/Minesweeper';
import { ChessGame } from '../../games/Chess';
import { TicTacToeGame } from '../../games/TicTacToe';

const APP_COMPONENTS: Record<AppId, React.FC> = {
  calculator: CalculatorApp,
  notepad: NotepadApp,
  files: FileExplorerApp,
  settings: SettingsApp,
  terminal: TerminalApp,
  camera: CameraApp,
  gallery: GalleryApp,
  clock: ClockApp,
  snake: SnakeGame,
  tetris: TetrisGame,
  pacman: PacmanGame,
  minesweeper: MinesweeperGame,
  chess: ChessGame,
  tictactoe: TicTacToeGame,
};

export const AppContainer: React.FC = () => {
  const { activeApp, closeApp, minimizeApp, t, settings, windows } = useOS();

  // If in floating window mode, render all open windows
  if (settings.windowMode === 'windowed') {
    return (
      <div className="absolute inset-0 top-7 bottom-12 z-20 pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto">
          {windows.map((win) => (
            <FloatingWindow key={win.appId} window={win} />
          ))}
        </div>
      </div>
    );
  }

  if (!activeApp) {
    return null;
  }

  const Component = APP_COMPONENTS[activeApp];

  return (
    <AnimatePresence>
      <motion.div
        key={activeApp}
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="absolute inset-0 top-7 bottom-12 z-20 flex flex-col bg-zinc-950/95 backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        {/* App Title Bar */}
        <div className="h-10 px-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-zinc-200 tracking-tight">
              {t('apps', activeApp)}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                sounds.playTap();
                minimizeApp();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-colors"
              title="Minimizar"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                closeApp(activeApp);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-colors"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* App Content Canvas with ErrorBoundary Protection */}
        <div className="flex-1 relative overflow-hidden bg-zinc-950">
          <ErrorBoundary appName={activeApp}>
            {Component ? <Component /> : <div className="p-4 text-xs text-zinc-400">App não encontrado</div>}
          </ErrorBoundary>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
