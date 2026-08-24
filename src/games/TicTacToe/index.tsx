import React, { useState, useEffect } from 'react';
import { RotateCcw, Bot, User, Trophy, Sparkles } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import confetti from 'canvas-confetti';

type Player = 'X' | 'O' | null;

const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const TicTacToeGame: React.FC = () => {
  const { t } = useOS();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [vsAI, setVsAI] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const checkWinner = (currentBoard: Player[]) => {
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (turn === 'O' && vsAI)) return;

    sounds.playTap();
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      if (winResult.winner === 'draw') {
        setWinner('draw');
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);
        sounds.playGameBeep('win');
        confetti({ particleCount: 80, spread: 60 });
        setScores((s) => ({
          ...s,
          [winResult.winner as 'X' | 'O']: s[winResult.winner as 'X' | 'O'] + 1,
        }));
      }
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  // Minimax Unbeatable AI for 'O'
  const minimax = (newBoard: Player[], depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(newBoard);
    if (res?.winner === 'O') return 10 - depth;
    if (res?.winner === 'X') return depth - 10;
    if (res?.winner === 'draw') return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'O';
          const evaluation = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'X';
          const evaluation = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  };

  useEffect(() => {
    if (turn === 'O' && vsAI && !winner) {
      const timer = setTimeout(() => {
        let bestScore = -Infinity;
        let bestMove = -1;
        const currentBoard = [...board];

        for (let i = 0; i < 9; i++) {
          if (!currentBoard[i]) {
            currentBoard[i] = 'O';
            const score = minimax(currentBoard, 0, false);
            currentBoard[i] = null;
            if (score > bestScore) {
              bestScore = score;
              bestMove = i;
            }
          }
        }

        if (bestMove !== -1) {
          sounds.playGameBeep('move');
          currentBoard[bestMove] = 'O';
          setBoard(currentBoard);

          const winResult = checkWinner(currentBoard);
          if (winResult) {
            if (winResult.winner === 'draw') {
              setWinner('draw');
              setScores((s) => ({ ...s, draws: s.draws + 1 }));
            } else {
              setWinner(winResult.winner);
              setWinningLine(winResult.line);
              sounds.playGameBeep('die');
              setScores((s) => ({
                ...s,
                [winResult.winner as 'X' | 'O']: s[winResult.winner as 'X' | 'O'] + 1,
              }));
            }
          } else {
            setTurn('X');
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [turn, vsAI, winner, board]);

  const resetGame = () => {
    sounds.playTap();
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setTurn('X');
  };

  return (
    <div id="tictactoe-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-cyan-400">⭕ Jogo da Velha (Tic-Tac-Toe)</h2>
          <p className="text-[10px] text-zinc-400">
            {winner
              ? winner === 'draw'
                ? 'Empate!'
                : `Vitória do Jogador ${winner}!`
              : `Vez de: ${turn}`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVsAI(!vsAI)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              vsAI ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {vsAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{vsAI ? 'vs IA' : '2P'}</span>
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Score Tracker Cards */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-cyan-400 font-bold block">X (Você)</span>
          <span className="text-base font-extrabold">{scores.X}</span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-400 font-bold block">Empates</span>
          <span className="text-base font-extrabold">{scores.draws}</span>
        </div>
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 font-bold block">{vsAI ? 'O (IA)' : 'O (P2)'}</span>
          <span className="text-base font-extrabold">{scores.O}</span>
        </div>
      </div>

      {/* 3x3 Grid Board */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-zinc-900/80 p-3 rounded-3xl border border-zinc-800 shadow-2xl">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`rounded-2xl text-4xl font-extrabold flex items-center justify-center transition-all ${
                  cell
                    ? isWinningCell
                      ? 'bg-emerald-500 text-zinc-950 scale-105 shadow-lg'
                      : cell === 'X'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 active:scale-95 border border-transparent'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom status button */}
      {winner && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={resetGame}
            className="px-6 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
          >
            Jogar Novamente
          </button>
        </div>
      )}
    </div>
  );
};
