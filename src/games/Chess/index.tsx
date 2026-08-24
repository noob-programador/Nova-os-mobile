import React, { useState, useEffect } from 'react';
import { RotateCcw, User, Bot, Award } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import confetti from 'canvas-confetti';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

const INITIAL_BOARD: (ChessPiece | null)[][] = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8).fill({ type: 'p', color: 'b' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'p', color: 'w' }),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '♔',
  'w-q': '♕',
  'w-r': '♖',
  'w-b': '♗',
  'w-n': '♘',
  'w-p': '♙',
  'b-k': '♚',
  'b-q': '♛',
  'b-r': '♜',
  'b-b': '♝',
  'b-n': '♞',
  'b-p': '♟',
};

export const ChessGame: React.FC = () => {
  const { t } = useOS();
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(() =>
    INITIAL_BOARD.map((r) => [...r])
  );
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [vsAI, setVsAI] = useState(true);
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const [status, setStatus] = useState<string>('Vez das Brancas');

  const resetGame = () => {
    sounds.playTap();
    setBoard(INITIAL_BOARD.map((r) => [...r]));
    setTurn('w');
    setSelectedSquare(null);
    setValidMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setStatus('Vez das Brancas');
  };

  const getMoves = (r: number, c: number, currentBoard: (ChessPiece | null)[][]): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];
    const color = piece.color;
    const enemy = color === 'w' ? 'b' : 'w';

    const addMove = (nr: number, nc: number) => {
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const dest = currentBoard[nr][nc];
        if (!dest) {
          moves.push([nr, nc]);
          return true; // continue ray
        } else if (dest.color === enemy) {
          moves.push([nr, nc]);
          return false; // hit enemy, stop ray
        }
      }
      return false; // hit friend or edge, stop ray
    };

    switch (piece.type) {
      case 'p': {
        const forward = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        // Step forward 1
        if (r + forward >= 0 && r + forward < 8 && !currentBoard[r + forward][c]) {
          moves.push([r + forward, c]);
          // Step forward 2
          if (r === startRow && !currentBoard[r + forward * 2][c]) {
            moves.push([r + forward * 2, c]);
          }
        }
        // Diagonal attacks
        [-1, 1].forEach((dc) => {
          const nc = c + dc;
          const nr = r + forward;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (currentBoard[nr][nc]?.color === enemy) {
              moves.push([nr, nc]);
            }
          }
        });
        break;
      }
      case 'n': {
        const knightJumps = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        knightJumps.forEach(([dr, dc]) => addMove(r + dr, c + dc));
        break;
      }
      case 'b': {
        const diags = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        diags.forEach(([dr, dc]) => {
          let step = 1;
          while (addMove(r + dr * step, c + dc * step)) step++;
        });
        break;
      }
      case 'r': {
        const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        straights.forEach(([dr, dc]) => {
          let step = 1;
          while (addMove(r + dr * step, c + dc * step)) step++;
        });
        break;
      }
      case 'q': {
        const allDirs = [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1],
        ];
        allDirs.forEach(([dr, dc]) => {
          let step = 1;
          while (addMove(r + dr * step, c + dc * step)) step++;
        });
        break;
      }
      case 'k': {
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1],
        ];
        kingMoves.forEach(([dr, dc]) => addMove(r + dr, c + dc));
        break;
      }
    }
    return moves;
  };

  const makeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    sounds.playGameBeep('move');
    const newBoard = board.map((r) => [...r]);
    const piece = newBoard[fromR][fromC]!;
    const captured = newBoard[toR][toC];

    if (captured) {
      sounds.playGameBeep('clear');
      if (captured.color === 'w') {
        setCapturedWhite((prev) => [...prev, captured.type]);
      } else {
        setCapturedBlack((prev) => [...prev, captured.type]);
      }

      if (captured.type === 'k') {
        setStatus(`Fim de Jogo! ${piece.color === 'w' ? 'Brancas' : 'Pretas'} venceram!`);
        sounds.playGameBeep('win');
        confetti({ particleCount: 100, spread: 70 });
        setBoard(newBoard);
        return;
      }
    }

    // Pawn Promotion
    if (piece.type === 'p' && (toR === 0 || toR === 7)) {
      newBoard[toR][toC] = { type: 'q', color: piece.color };
    } else {
      newBoard[toR][toC] = piece;
    }
    newBoard[fromR][fromC] = null;

    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    const nextTurn = turn === 'w' ? 'b' : 'w';
    setTurn(nextTurn);
    setStatus(`Vez das ${nextTurn === 'w' ? 'Brancas' : 'Pretas'}`);
  };

  const handleSquareClick = (r: number, c: number) => {
    if (turn === 'b' && vsAI) return;

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isMoveValid = validMoves.some(([vr, vc]) => vr === r && vc === c);

      if (isMoveValid) {
        makeMove(sr, sc, r, c);
        return;
      }
    }

    const clickedPiece = board[r][c];
    if (clickedPiece && clickedPiece.color === turn) {
      sounds.playTap();
      setSelectedSquare([r, c]);
      setValidMoves(getMoves(r, c, board));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // AI Move calculation
  useEffect(() => {
    if (turn === 'b' && vsAI) {
      const timer = setTimeout(() => {
        // Collect all possible moves for Black
        const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

        board.forEach((row, r) => {
          row.forEach((p, c) => {
            if (p && p.color === 'b') {
              const moves = getMoves(r, c, board);
              moves.forEach(([tr, tc]) => {
                const target = board[tr][tc];
                let moveScore = Math.random() * 5;
                if (target) {
                  const values: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
                  moveScore += values[target.type];
                }
                allMoves.push({ from: [r, c], to: [tr, tc], score: moveScore });
              });
            }
          });
        });

        if (allMoves.length > 0) {
          allMoves.sort((a, b) => b.score - a.score);
          const best = allMoves[0];
          makeMove(best.from[0], best.from[1], best.to[0], best.to[1]);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [turn, vsAI, board]);

  return (
    <div id="chess-game" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
        <div>
          <h2 className="font-bold text-amber-400">♟ Xadrez NovaOS</h2>
          <p className="text-[10px] text-zinc-400 font-mono">{status}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVsAI(!vsAI)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              vsAI ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {vsAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{vsAI ? 'vs IA' : '2 Jogadores'}</span>
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Captured Black Pieces */}
      <div className="h-6 flex items-center space-x-1 px-2 text-lg text-zinc-400">
        {capturedBlack.map((p, i) => (
          <span key={i}>{PIECE_SYMBOLS[`b-${p}`]}</span>
        ))}
      </div>

      {/* Chess Board */}
      <div className="flex-1 flex items-center justify-center my-1">
        <div className="grid grid-cols-8 border-2 border-amber-900/60 rounded-2xl overflow-hidden shadow-2xl bg-amber-950/40 aspect-square max-w-[320px] max-h-[320px] w-full">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
              const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  className={`relative flex items-center justify-center text-2xl sm:text-3xl transition-colors ${
                    isSelected
                      ? 'bg-amber-400/60'
                      : isDark
                      ? 'bg-amber-900/80 text-amber-100'
                      : 'bg-amber-200/90 text-zinc-900'
                  }`}
                >
                  {piece && (
                    <span
                      className={`select-none leading-none ${
                        piece.color === 'w' ? 'text-zinc-100 drop-shadow-md' : 'text-zinc-950 font-bold'
                      }`}
                    >
                      {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                    </span>
                  )}
                  {isValid && (
                    <div className="absolute w-3 h-3 rounded-full bg-emerald-500/80 pointer-events-none ring-2 ring-emerald-300" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Captured White Pieces */}
      <div className="h-6 flex items-center space-x-1 px-2 text-lg text-zinc-200">
        {capturedWhite.map((p, i) => (
          <span key={i}>{PIECE_SYMBOLS[`w-${p}`]}</span>
        ))}
      </div>
    </div>
  );
};
