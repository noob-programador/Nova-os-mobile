import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import confetti from 'canvas-confetti';

const GRID_SIZE = 20;

export const SnakeGame: React.FC = () => {
  const { t } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number; isGold?: boolean }>({ x: 5, y: 5 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('novaos_snake_hs') || '0');
    } catch {
      return 0;
    }
  });

  const nextDirRef = useRef(dir);

  const getSpeed = () => {
    switch (difficulty) {
      case 'easy':
        return 160;
      case 'hard':
        return 80;
      case 'medium':
      default:
        return 120;
    }
  };

  const spawnFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newFood: { x: number; y: number; isGold?: boolean };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        isGold: Math.random() < 0.2,
      };
      if (!currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    sounds.playTap();
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDir({ x: 0, y: -1 });
    nextDirRef.current = { x: 0, y: -1 };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnFood(initialSnake);
  };

  const changeDirection = (newDir: { x: number; y: number }) => {
    if (dir.x !== 0 && newDir.x !== 0) return;
    if (dir.y !== 0 && newDir.y !== 0) return;
    nextDirRef.current = newDir;
    setDir(newDir);
    sounds.playGameBeep('move');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        changeDirection({ x: 0, y: -1 });
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        changeDirection({ x: 0, y: 1 });
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        changeDirection({ x: -1, y: 0 });
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        changeDirection({ x: 1, y: 0 });
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isGameOver) resetGame();
        else setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, isGameOver]);

  // Main game tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const currentDir = nextDirRef.current;
        head.x += currentDir.x;
        head.y += currentDir.y;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          setIsPlaying(false);
          sounds.playGameBeep('die');
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          sounds.playGameBeep('die');
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          sounds.playGameBeep('eat');
          const points = food.isGold ? 30 : 10;
          setScore((s) => {
            const nextScore = s + points;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              try {
                localStorage.setItem('novaos_snake_hs', nextScore.toString());
              } catch {}
            }
            return nextScore;
          });
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, getSpeed());

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, food, difficulty, highScore, spawnFood]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = food.isGold ? '#eab308' : '#ef4444';
    ctx.shadowColor = food.isGold ? '#eab308' : '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      const r = i === 0 ? cellSize / 2.8 : cellSize / 3.5;
      ctx.roundRect(seg.x * cellSize + 2, seg.y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
      ctx.fill();
    });
  }, [snake, food]);

  return (
    <div id="snake-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-emerald-400">🐍 Cobrinha (Snake)</h2>
          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
            <span>{t('games', 'score')}: <strong className="text-white">{score}</strong></span>
            <span className="flex items-center space-x-1 text-amber-400">
              <Trophy className="w-3 h-3" />
              <span>{highScore}</span>
            </span>
          </div>
        </div>

        {/* Difficulty pills */}
        <div className="flex space-x-1">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                sounds.playTap();
                setDifficulty(d);
                if (!isPlaying) resetGame();
              }}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                difficulty === d ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {t('games', d)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-2xl border-2 border-zinc-800 shadow-2xl max-w-full max-h-[320px] aspect-square"
        />

        {/* Start / Game Over Overlay */}
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-3 p-4 text-center">
            <h3 className="text-xl font-bold text-white">
              {isGameOver ? t('games', 'gameOver') : 'Cobrinha Retrô'}
            </h3>
            {isGameOver && (
              <p className="text-xs font-mono text-zinc-300">
                Pontuação Final: <span className="text-emerald-400 font-bold">{score}</span>
              </p>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isGameOver ? t('games', 'playAgain') : 'Iniciar Jogo'}</span>
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Touch D-Pad */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto">
          <div />
          <button
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onClick={() => changeDirection({ x: -1, y: 0 })}
            className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection({ x: 0, y: 1 })}
            className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection({ x: 1, y: 0 })}
            className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
