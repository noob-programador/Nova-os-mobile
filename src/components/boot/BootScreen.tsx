import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';

export const BootScreen: React.FC = () => {
  const { unlockOS, settings, t } = useOS();
  const [progress, setProgress] = useState(5);
  const [bootStep, setBootStep] = useState(0);

  const bootLogs = [
    t('system', 'booting'),
    'Loading Nebula Kernel v3.5.0-wasm...',
    t('system', 'mountingFS'),
    t('system', 'initServices'),
    t('system', 'audioReady'),
    'Initializing display compositor 60fps...',
    t('system', 'guiReady'),
    t('system', 'welcome'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (settings.pinLockEnabled) {
              // go to locked
            }
            unlockOS();
          }, 400);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 12) + 5;
        const currentStep = Math.min(bootLogs.length - 1, Math.floor((next / 100) * bootLogs.length));
        setBootStep(currentStep);
        return Math.min(100, next);
      });
    }, 180);

    return () => clearInterval(interval);
  }, [unlockOS, settings.pinLockEnabled, bootLogs.length]);

  return (
    <div
      id="boot-screen"
      className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 bg-zinc-950 text-white font-sans select-none overflow-hidden"
    >
      {/* Background ambient glow effect */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between opacity-70 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>VIRTUAL_ARM64 // 8GB RAM</span>
        </div>
        <button
          onClick={unlockOS}
          className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-sans flex items-center space-x-1 transition-all"
        >
          <span>Pular Boot</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Center Animated Logo & Branding */}
      <div className="flex flex-col items-center space-y-6 text-center my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-0.5 shadow-2xl shadow-indigo-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950/90 rounded-[22px] flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-12 h-12 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
        </motion.div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
            NovaOS Mobile
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-wider">VERSION 3.5 "NEBULA"</p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-64 space-y-2">
          <div className="w-full h-2 bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>{progress === 100 ? 'PRONTO' : 'CARREGANDO...'}</span>
            <span className="font-bold text-cyan-400">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Terminal Boot Log Stream */}
      <div className="w-full max-w-sm bg-black/60 border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] text-zinc-300 space-y-1 shadow-inner backdrop-blur-sm">
        <div className="flex items-center space-x-1.5 pb-1 border-b border-zinc-800 text-zinc-400 text-[10px]">
          <Terminal className="w-3 h-3 text-emerald-400" />
          <span>System Boot Log</span>
        </div>
        <div className="h-16 overflow-hidden flex flex-col justify-end">
          <AnimatePresence mode="popLayout">
            {bootLogs.slice(0, bootStep + 1).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-1.5 truncate text-emerald-400/90"
              >
                <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 text-cyan-400" />
                <span className="truncate">{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
