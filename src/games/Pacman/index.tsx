import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Heart, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';

// 15x15 Maze layout: 1 = Wall, 0 = Dot, 2 = Power Pellet, 3 = Empty/Spawn
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 3, 1, 1, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 3, 3, 3, 1, 0, 1, 0, 1, 1],
  [3, 0, 0, 1, 0, 1, 3, 3, 3, 1, 0, 1, 0, 0, 3],
  [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 2, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const PacmanGame: React.FC = () => {
  const { t } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mapData, setMapData] = useState<number[][]>(() => MAZE.map((r) => [...r]));
  const [pacman, setPacman] = useState({ x: 7, y: 8, dirX: 0, dirY: 0, mouth: 0.2 });
  const [ghosts, setGhosts] = useState([
    { x: 6, y: 5, color: '#ef4444', dirX: 1, dirY: 0 },
    { x: 7, y: 5, color: '#ec4899', dirX: -1, dirY: 0 },
    { x: 8, y: 5, color: '#06b6d4', dirX: 0, dirY: 1 },
    { x: 7, y: 6, color: '#f97316', dirX: 0, dirY: -1 },
  ]);
  const [frightenedTime, setFrightenedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const nextDirRef = useRef({ x: 0, y: 0 });

  const resetGame = () => {
    sounds.playTap();
    setMapData(MAZE.map((r) => [...r]));
    setPacman({ x: 7, y: 8, dirX: 0, dirY: 0, mouth: 0.2 });
    setGhosts([
      { x: 6, y: 5, color: '#ef4444', dirX: 1, dirY: 0 },
      { x: 7, y: 5, color: '#ec4899', dirX: -1, dirY: 0 },
      { x: 8, y: 5, color: '#06b6d4', dirX: 0, dirY: 1 },
      { x: 7, y: 6, color: '#f97316', dirX: 0, dirY: -1 },
    ]);
    setScore(0);
    setLives(3);
    setFrightenedTime(0);
    setIsGameOver(false);
    setIsPlaying(true);
    nextDirRef.current = { x: 0, y: 0 };
  };

  const handleSetDir = (dx: number, dy: number) => {
    nextDirRef.current = { x: dx, y: dy };
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleSetDir(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleSetDir(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleSetDir(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleSetDir(1, 0);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Main game tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      // 1. Move Pacman
      setPacman((prev) => {
        let nDir = nextDirRef.current;
        let newX = prev.x + nDir.x;
        let newY = prev.y + nDir.y;

        // Wrap around left-right tunnel
        if (newX < 0) newX = 14;
        if (newX > 14) newX = 0;

        if (mapData[newY] && mapData[newY][newX] !== 1) {
          // valid next dir
          return { x: newX, y: newY, dirX: nDir.x, dirY: nDir.y, mouth: prev.mouth > 0 ? 0 : 0.25 };
        } else {
          // keep current dir if possible
          let currX = prev.x + prev.dirX;
          let currY = prev.y + prev.dirY;
          if (currX < 0) currX = 14;
          if (currX > 14) currX = 0;
          if (mapData[currY] && mapData[currY][currX] !== 1) {
            return { ...prev, x: currX, y: currY, mouth: prev.mouth > 0 ? 0 : 0.25 };
          }
          return prev;
        }
      });

      // 2. Move Ghosts
      setGhosts((prev) =>
        prev.map((g) => {
          const possibleDirs = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
          ].filter((d) => {
            const nx = g.x + d.x;
            const ny = g.y + d.y;
            return mapData[ny] && mapData[ny][nx] !== 1 && !(d.x === -g.dirX && d.y === -g.dirY);
          });

          const chosen = possibleDirs.length > 0
            ? possibleDirs[Math.floor(Math.random() * possibleDirs.length)]
            : { x: -g.dirX, y: -g.dirY };

          return { ...g, x: g.x + chosen.x, y: g.y + chosen.y, dirX: chosen.x, dirY: chosen.y };
        })
      );

      // Decrement frightened timer
      setFrightenedTime((t) => Math.max(0, t - 1));
    }, 220);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, mapData]);

  // Dot eating & Ghost collision check
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    // Eat dot / power pellet
    const cell = mapData[pacman.y]?.[pacman.x];
    if (cell === 0) {
      sounds.playGameBeep('eat');
      setScore((s) => s + 10);
      setMapData((prev) => {
        const next = prev.map((r) => [...r]);
        next[pacman.y][pacman.x] = 3;
        return next;
      });
    } else if (cell === 2) {
      sounds.playGameBeep('win');
      setScore((s) => s + 50);
      setFrightenedTime(25); // ~5 seconds
      setMapData((prev) => {
        const next = prev.map((r) => [...r]);
        next[pacman.y][pacman.x] = 3;
        return next;
      });
    }

    // Ghost collision
    ghosts.forEach((g, idx) => {
      if (g.x === pacman.x && g.y === pacman.y) {
        if (frightenedTime > 0) {
          sounds.playGameBeep('clear');
          setScore((s) => s + 200);
          setGhosts((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, x: 7, y: 5 } : item))
          );
        } else {
          sounds.playGameBeep('die');
          setLives((l) => {
            if (l <= 1) {
              setIsGameOver(true);
              setIsPlaying(false);
              return 0;
            }
            setPacman({ x: 7, y: 8, dirX: 0, dirY: 0, mouth: 0.2 });
            return l - 1;
          });
        }
      }
    });
  }, [pacman, ghosts, mapData, frightenedTime, isPlaying, isGameOver]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellW = canvas.width / 15;
    const cellH = canvas.height / 15;

    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Maze
    mapData.forEach((row, r) => {
      row.forEach((cell, c) => {
        const x = c * cellW;
        const y = r * cellH;

        if (cell === 1) {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        } else if (cell === 0) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 2) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });

    // Draw Ghosts
    ghosts.forEach((g) => {
      const gx = g.x * cellW + cellW / 2;
      const gy = g.y * cellH + cellH / 2;
      ctx.fillStyle = frightenedTime > 0 ? '#3b82f6' : g.color;
      ctx.beginPath();
      ctx.arc(gx, gy - 2, cellW / 2.4, Math.PI, 0, false);
      ctx.lineTo(gx + cellW / 2.4, gy + cellH / 2.4);
      ctx.lineTo(gx - cellW / 2.4, gy + cellH / 2.4);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Pac-Man
    const px = pacman.x * cellW + cellW / 2;
    const py = pacman.y * cellH + cellH / 2;
    let angle = 0;
    if (pacman.dirX === 1) angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    if (pacman.dirY === 1) angle = Math.PI / 2;
    if (pacman.dirY === -1) angle = -Math.PI / 2;

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(
      px,
      py,
      cellW / 2.2,
      angle + pacman.mouth * Math.PI,
      angle + (2 - pacman.mouth) * Math.PI
    );
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
  }, [mapData, pacman, ghosts, frightenedTime]);

  return (
    <div id="pacman-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-xs">
        <h2 className="font-bold text-yellow-400">👻 Pac-Man Arcade</h2>
        <div className="flex items-center space-x-3 font-mono">
          <span>PTS: <strong className="text-amber-400">{score}</strong></span>
          <div className="flex space-x-1">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Game Stage */}
      <div className="flex-1 flex items-center justify-center relative my-1">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-2xl border-2 border-blue-900 shadow-2xl aspect-square"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-3 text-center space-y-3">
            <h3 className="text-base font-bold">{isGameOver ? 'Game Over' : 'Pac-Man'}</h3>
            <button
              onClick={resetGame}
              className="px-5 py-2 rounded-xl bg-yellow-400 text-zinc-950 font-bold text-xs shadow-lg"
            >
              {isGameOver ? 'Jogar de Novo' : 'Iniciar'}
            </button>
          </div>
        )}
      </div>

      {/* Touch D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto pt-1">
        <div />
        <button
          onClick={() => handleSetDir(0, -1)}
          className="w-10 h-10 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button
          onClick={() => handleSetDir(-1, 0)}
          className="w-10 h-10 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSetDir(0, 1)}
          className="w-10 h-10 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSetDir(1, 0)}
          className="w-10 h-10 rounded-xl bg-zinc-800 active:scale-90 flex items-center justify-center text-zinc-300"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
