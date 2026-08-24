import React, { useState, useEffect } from 'react';
import { Flag, Bomb, RotateCcw, Trophy, Smile, Frown, Meh } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const MinesweeperGame: React.FC = () => {
  const { t } = useOS();
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [minesCount, setMinesCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  // Initialize board
  const initBoard = (rNum: number, cNum: number, mNum: number) => {
    sounds.playTap();
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rNum; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cNum; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setIsGameOver(false);
    setIsWon(false);
    setTimer(0);
    setTimerActive(false);
    setFirstClick(true);
  };

  useEffect(() => {
    initBoard(rows, cols, minesCount);
  }, [rows, cols, minesCount]);

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (timerActive && !isGameOver && !isWon) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isGameOver, isWon]);

  const populateMines = (clickedR: number, clickedC: number) => {
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    let placed = 0;

    while (placed < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      // Safe 3x3 surrounding first click
      if (Math.abs(r - clickedR) <= 1 && Math.abs(c - clickedC) <= 1) continue;
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }
    return newGrid;
  };

  const revealCell = (r: number, c: number) => {
    if (isGameOver || isWon) return;

    let currentGrid = grid;
    if (firstClick) {
      currentGrid = populateMines(r, c);
      setFirstClick(false);
      setTimerActive(true);
    }

    const cell = currentGrid[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    // Check if clicked a mine
    if (cell.isMine) {
      sounds.playGameBeep('die');
      setIsGameOver(true);
      setTimerActive(false);
      // reveal all mines
      const revealedGrid = currentGrid.map((row) =>
        row.map((item) => (item.isMine ? { ...item, isRevealed: true } : item))
      );
      setGrid(revealedGrid);
      return;
    }

    sounds.playGameBeep('move');

    // Flood fill empty neighbors
    const nextGrid = currentGrid.map((row) => row.map((item) => ({ ...item })));
    const queue = [[r, c]];
    nextGrid[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      if (nextGrid[currR][currC].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = nextGrid[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                if (neighbor.neighborMines === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }

    // Check victory
    let unrevealedSafe = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!nextGrid[r][c].isMine && !nextGrid[r][c].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      setIsWon(true);
      setTimerActive(false);
      sounds.playGameBeep('win');
      confetti({ particleCount: 80, spread: 60 });
    }

    setGrid(nextGrid);
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isGameOver || isWon) return;

    sounds.playGameBeep('flag');
    setGrid((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) =>
          ri === r && ci === c && !cell.isRevealed
            ? { ...cell, isFlagged: !cell.isFlagged }
            : cell
        )
      )
    );
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const remainingMines =
    minesCount - grid.reduce((acc, row) => acc + row.filter((c) => c.isFlagged).length, 0);

  const getNumberColor = (count: number) => {
    switch (count) {
      case 1:
        return 'text-blue-400 font-bold';
      case 2:
        return 'text-emerald-400 font-bold';
      case 3:
        return 'text-rose-400 font-bold';
      case 4:
        return 'text-purple-400 font-bold';
      case 5:
        return 'text-amber-400 font-bold';
      default:
        return 'text-cyan-300 font-bold';
    }
  };

  return (
    <div id="minesweeper-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h2 className="text-sm font-bold text-rose-400">💣 Campo Minado</h2>
        <div className="flex space-x-1">
          {(['easy', 'medium'] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                if (d === 'easy') {
                  setRows(9);
                  setCols(9);
                  setMinesCount(10);
                } else {
                  setRows(12);
                  setCols(12);
                  setMinesCount(20);
                }
              }}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                difficulty === d ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {d === 'easy' ? '9x9' : '12x12'}
            </button>
          ))}
        </div>
      </div>

      {/* Game LED Status Bar */}
      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between my-2 font-mono text-sm">
        <span className="text-rose-400 font-bold px-2 py-1 bg-black rounded-lg">
          {remainingMines.toString().padStart(3, '0')}
        </span>

        <button
          onClick={() => initBoard(rows, cols, minesCount)}
          className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-90"
        >
          {isGameOver ? (
            <Frown className="w-5 h-5 text-rose-400" />
          ) : isWon ? (
            <Smile className="w-5 h-5 text-emerald-400" />
          ) : (
            <Meh className="w-5 h-5 text-amber-400" />
          )}
        </button>

        <span className="text-cyan-400 font-bold px-2 py-1 bg-black rounded-lg">
          {Math.min(999, timer).toString().padStart(3, '0')}
        </span>
      </div>

      {/* Mines Grid Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-1">
        <div
          className="grid gap-1 bg-zinc-900/90 p-2 rounded-2xl border border-zinc-800"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono flex items-center justify-center transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-800 text-zinc-300'
                    : 'bg-zinc-700 hover:bg-zinc-650 active:scale-95 shadow'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb className="w-4 h-4" />
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag className="w-4 h-4 text-amber-400 fill-amber-400" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Flag / Tap Toggle Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => {
            sounds.playTap();
            setFlagMode(!flagMode);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            flagMode ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Modo Bandeira: {flagMode ? 'LIGADO' : 'DESLIGADO'}</span>
        </button>
      </div>
    </div>
  );
};
