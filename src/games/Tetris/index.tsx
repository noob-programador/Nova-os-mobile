import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, RotateCw, ArrowDownToLine, Hand } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';

const COLS = 10;
const ROWS = 20;

const SHAPES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
};

const SHAPE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const TetrisGame: React.FC = () => {
  const { t } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    color: string;
    type: string;
    x: number;
    y: number;
  } | null>(null);
  const [nextPieceType, setNextPieceType] = useState<string>(() =>
    SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]
  );
  const [holdPieceType, setHoldPieceType] = useState<string | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getRandomPiece = () => {
    const type = nextPieceType;
    const next = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    setNextPieceType(next);
    const pieceDef = SHAPES[type];
    return {
      shape: pieceDef.shape,
      color: pieceDef.color,
      type,
      x: Math.floor((COLS - pieceDef.shape[0].length) / 2),
      y: 0,
    };
  };

  const checkCollision = (shape: number[][], x: number, y: number, currentGrid: string[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && currentGrid[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]) => {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  };

  const resetGame = () => {
    sounds.playTap();
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setHoldPieceType(null);
    setCanHold(true);
    setCurrentPiece(getRandomPiece());
    setIsPlaying(true);
  };

  const moveLeft = () => {
    if (!currentPiece || !isPlaying) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x - 1, currentPiece.y, grid)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x - 1 });
      sounds.playGameBeep('move');
    }
  };

  const moveRight = () => {
    if (!currentPiece || !isPlaying) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x + 1, currentPiece.y, grid)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + 1 });
      sounds.playGameBeep('move');
    }
  };

  const rotatePiece = () => {
    if (!currentPiece || !isPlaying) return;
    const rotated = rotate(currentPiece.shape);
    if (!checkCollision(rotated, currentPiece.x, currentPiece.y, grid)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
      sounds.playGameBeep('rotate');
    } else if (!checkCollision(rotated, currentPiece.x - 1, currentPiece.y, grid)) {
      setCurrentPiece({ ...currentPiece, shape: rotated, x: currentPiece.x - 1 });
      sounds.playGameBeep('rotate');
    } else if (!checkCollision(rotated, currentPiece.x + 1, currentPiece.y, grid)) {
      setCurrentPiece({ ...currentPiece, shape: rotated, x: currentPiece.x + 1 });
      sounds.playGameBeep('rotate');
    }
  };

  const dropPiece = () => {
    if (!currentPiece || !isPlaying) return;
    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, grid)) {
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    } else {
      lockPiece();
    }
  };

  const hardDrop = () => {
    if (!currentPiece || !isPlaying) return;
    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, newY + 1, grid)) {
      newY++;
    }
    setCurrentPiece({ ...currentPiece, y: newY });
    setTimeout(lockPiece, 10);
  };

  const holdPiece = () => {
    if (!currentPiece || !canHold || !isPlaying) return;
    sounds.playTap();
    setCanHold(false);
    if (!holdPieceType) {
      setHoldPieceType(currentPiece.type);
      setCurrentPiece(getRandomPiece());
    } else {
      const prevHold = holdPieceType;
      setHoldPieceType(currentPiece.type);
      const pieceDef = SHAPES[prevHold];
      setCurrentPiece({
        shape: pieceDef.shape,
        color: pieceDef.color,
        type: prevHold,
        x: Math.floor((COLS - pieceDef.shape[0].length) / 2),
        y: 0,
      });
    }
  };

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;
    sounds.playGameBeep('flag');

    const newGrid = grid.map((row) => [...row]);
    currentPiece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const y = currentPiece.y + r;
          const x = currentPiece.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            newGrid[y][x] = currentPiece.color;
          }
        }
      });
    });

    // Check line clears
    let cleared = 0;
    const remainingRows = newGrid.filter((row) => {
      const isFull = row.every((cell) => cell !== '');
      if (isFull) cleared++;
      return !isFull;
    });

    while (remainingRows.length < ROWS) {
      remainingRows.unshift(Array(COLS).fill(''));
    }

    if (cleared > 0) {
      sounds.playGameBeep('clear');
      const pts = [0, 100, 300, 500, 800][cleared] * level;
      setScore((s) => s + pts);
      setLines((l) => {
        const nextLines = l + cleared;
        setLevel(Math.floor(nextLines / 10) + 1);
        return nextLines;
      });
    }

    setGrid(remainingRows);
    setCanHold(true);

    const nextP = getRandomPiece();
    if (checkCollision(nextP.shape, nextP.x, nextP.y, remainingRows)) {
      setIsGameOver(true);
      setIsPlaying(false);
      sounds.playGameBeep('die');
    } else {
      setCurrentPiece(nextP);
    }
  }, [currentPiece, grid, level]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        moveLeft();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        moveRight();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        rotatePiece();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        dropPiece();
      } else if (e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        holdPiece();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Game loop tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const speed = Math.max(120, 800 - (level - 1) * 60);
    const timer = setInterval(dropPiece, speed);
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, level, currentPiece, grid]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        } else {
          ctx.strokeStyle = '#18181b';
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        }
      });
    });

    // Draw Current Falling Piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      currentPiece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            ctx.fillRect(
              (currentPiece.x + c) * cellW + 1,
              (currentPiece.y + r) * cellH + 1,
              cellW - 2,
              cellH - 2
            );
          }
        });
      });
    }
  }, [grid, currentPiece]);

  return (
    <div id="tetris-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-xs">
        <h2 className="font-bold text-purple-400">🧱 Tetris Arcade</h2>
        <div className="flex space-x-3 font-mono">
          <span>PTS: <strong className="text-amber-400">{score}</strong></span>
          <span>LINHAS: <strong className="text-cyan-400">{lines}</strong></span>
          <span>NV: <strong className="text-emerald-400">{level}</strong></span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex items-center justify-center space-x-3 my-1">
        {/* Hold Preview Box */}
        <div className="w-16 flex flex-col items-center p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] space-y-1">
          <span className="font-bold text-zinc-400">HOLD</span>
          <div className="w-10 h-10 flex items-center justify-center">
            {holdPieceType && (
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: SHAPES[holdPieceType].color }}
              />
            )}
          </div>
        </div>

        {/* Tetris Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={180}
            height={360}
            className="rounded-2xl border-2 border-zinc-800 shadow-2xl"
          />
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-3 text-center space-y-3">
              <h3 className="text-base font-bold">{isGameOver ? 'Game Over' : 'Tetris'}</h3>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
              >
                {isGameOver ? 'Jogar Novamente' : 'Iniciar'}
              </button>
            </div>
          )}
        </div>

        {/* Next Preview Box */}
        <div className="w-16 flex flex-col items-center p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] space-y-1">
          <span className="font-bold text-zinc-400">NEXT</span>
          <div className="w-10 h-10 flex items-center justify-center">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: SHAPES[nextPieceType].color }}
            />
          </div>
        </div>
      </div>

      {/* Touch Controls Bar */}
      <div className="grid grid-cols-6 gap-1.5 pt-1">
        <button
          onClick={holdPiece}
          className="h-11 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
          title="Hold"
        >
          <Hand className="w-4 h-4" />
        </button>
        <button
          onClick={moveLeft}
          className="h-11 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={rotatePiece}
          className="h-11 rounded-xl bg-purple-600 active:scale-90 flex items-center justify-center text-white shadow"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={moveRight}
          className="h-11 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={dropPiece}
          className="h-11 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={hardDrop}
          className="h-11 rounded-xl bg-amber-500 text-zinc-950 font-bold active:scale-90 flex items-center justify-center"
        >
          <ArrowDownToLine className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
