import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { AppId, WindowState } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';

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

interface WindowItemProps {
  window: WindowState;
}

export const FloatingWindow: React.FC<WindowItemProps> = ({ window: win }) => {
  const { closeApp, bringWindowToFront, updateWindowState, t } = useOS();
  const Component = APP_COMPONENTS[win.appId];

  const handlePointerDown = () => {
    bringWindowToFront(win.appId);
  };

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    updateWindowState(win.appId, { maximized: !win.maximized });
  };

  if (win.minimized) return null;

  return (
    <motion.div
      drag={!win.maximized}
      dragMomentum={false}
      onPointerDown={handlePointerDown}
      style={{
        zIndex: win.zIndex,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        top: win.maximized ? 28 : win.y,
        left: win.maximized ? 0 : win.x,
        width: win.maximized ? '100%' : win.width,
        height: win.maximized ? 'calc(100% - 76px)' : win.height,
      }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`absolute flex flex-col bg-zinc-950/95 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl overflow-hidden shadow-2xl ${
        win.maximized ? 'rounded-none border-x-0' : ''
      }`}
    >
      {/* Window Header / Titlebar Drag Handle */}
      <div className="h-9 px-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none cursor-move">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 animate-pulse" />
          <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">
            {t('apps', win.appId)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleMaximize}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {win.maximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playTap();
              closeApp(win.appId);
            }}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        <ErrorBoundary appName={win.appId}>
          {Component ? <Component /> : null}
        </ErrorBoundary>
      </div>
    </motion.div>
  );
};
