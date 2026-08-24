import React, { useState, useEffect } from 'react';
import { History, Trash2, RotateCcw, Equal, Delete } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { CalculationHistory } from '../../types';

export const CalculatorApp: React.FC = () => {
  const { t } = useOS();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [isRad, setIsRad] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    try {
      const saved = localStorage.getItem('novaos_calc_hist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('novaos_calc_hist_v1', JSON.stringify(history));
    } catch {}
  }, [history]);

  const handleNumber = (digit: string) => {
    sounds.playTap();
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    sounds.playTap();
    if (display === 'Error') return;
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    sounds.playTap();
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    sounds.playTap();
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleToggleSign = () => {
    sounds.playTap();
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  const handlePercent = () => {
    sounds.playTap();
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
    }
  };

  const handleScientific = (func: string) => {
    sounds.playTap();
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    const angle = isRad ? val : (val * Math.PI) / 180;

    switch (func) {
      case 'sin':
        res = Math.sin(angle);
        break;
      case 'cos':
        res = Math.cos(angle);
        break;
      case 'tan':
        res = Math.tan(angle);
        break;
      case 'sqrt':
        res = val >= 0 ? Math.sqrt(val) : NaN;
        break;
      case 'sqr':
        res = Math.pow(val, 2);
        break;
      case 'log':
        res = val > 0 ? Math.log10(val) : NaN;
        break;
      case 'ln':
        res = val > 0 ? Math.log(val) : NaN;
        break;
      case 'pi':
        setDisplay(Math.PI.toString());
        return;
      case 'e':
        setDisplay(Math.E.toString());
        return;
    }

    if (isNaN(res)) {
      setDisplay('Error');
    } else {
      const formatted = Number(res.toFixed(8)).toString();
      setDisplay(formatted);
      setHistory((prev) => [
        {
          id: Math.random().toString(),
          expression: `${func}(${display})`,
          result: formatted,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 30),
      ]);
    }
  };

  const handleCalculate = () => {
    sounds.playTap();
    if (!equation) return;

    try {
      const fullExpr = `${equation}${display}`;
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      // Safe arithmetic evaluation
      const computed = Function(`"use strict"; return (${sanitized})`)();
      if (typeof computed === 'number' && !isNaN(computed) && isFinite(computed)) {
        const resStr = Number(computed.toFixed(10)).toString();
        setHistory((prev) => [
          {
            id: Math.random().toString(),
            expression: fullExpr,
            result: resStr,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 30),
        ]);
        setDisplay(resStr);
        setEquation('');
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div id="calculator-app" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-4 select-none">
      {/* Top Bar with Mode Toggle & History */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setIsScientific(!isScientific)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              isScientific ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {isScientific ? t('calc', 'scientific') : t('calc', 'standard')}
          </button>
          {isScientific && (
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-[10px] font-mono text-cyan-400"
            >
              {isRad ? 'RAD' : 'DEG'}
            </button>
          )}
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title={t('calc', 'history')}
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* History Drawer Overlay */}
      {showHistory && (
        <div className="absolute inset-x-4 top-14 bottom-4 z-20 bg-zinc-900/95 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold">{t('calc', 'history')}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-rose-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('calc', 'clearHistory')}</span>
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-zinc-400 hover:text-white px-2"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 scrollbar-thin">
            {history.length > 0 ? (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setDisplay(h.result);
                    setShowHistory(false);
                  }}
                  className="p-2.5 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors text-right"
                >
                  <p className="text-[11px] text-zinc-400 font-mono">{h.expression} =</p>
                  <p className="text-sm font-bold text-amber-400 font-mono">{h.result}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-zinc-500 my-auto">{t('calc', 'emptyHistory')}</p>
            )}
          </div>
        </div>
      )}

      {/* Calculator Display */}
      <div className="flex-1 flex flex-col justify-end items-end px-2 py-4 space-y-1">
        <span className="text-xs font-mono text-zinc-400 h-4">{equation}</span>
        <h2 className="text-4xl sm:text-5xl font-light font-mono text-white tracking-tight break-all">
          {display}
        </h2>
      </div>

      {/* Scientific Keys Row */}
      {isScientific && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {['sin', 'cos', 'tan', 'sqrt', 'sqr', 'log', 'pi', 'e'].map((fn) => (
            <button
              key={fn}
              onClick={() => handleScientific(fn)}
              className="h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-xs font-medium text-cyan-300 transition-all"
            >
              {fn}
            </button>
          ))}
        </div>
      )}

      {/* Standard Keypad Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={handleClear}
          className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold active:scale-95 transition-all text-sm"
        >
          AC
        </button>
        <button
          onClick={handleToggleSign}
          className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium active:scale-95 transition-all text-sm"
        >
          +/-
        </button>
        <button
          onClick={handlePercent}
          className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium active:scale-95 transition-all text-sm"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold active:scale-95 transition-all text-xl"
        >
          ÷
        </button>

        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium active:scale-95 transition-all text-xl"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold active:scale-95 transition-all text-xl"
        >
          ×
        </button>

        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium active:scale-95 transition-all text-xl"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('−')}
          className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold active:scale-95 transition-all text-xl"
        >
          −
        </button>

        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium active:scale-95 transition-all text-xl"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold active:scale-95 transition-all text-xl"
        >
          +
        </button>

        <button
          onClick={() => handleNumber('0')}
          className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium active:scale-95 transition-all text-xl"
        >
          0
        </button>
        <button
          onClick={() => handleNumber('.')}
          className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold active:scale-95 transition-all text-xl"
        >
          .
        </button>
        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center active:scale-95 transition-all"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={handleCalculate}
          className="h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-bold active:scale-95 transition-all text-2xl shadow-lg shadow-orange-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
};
