import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Sparkles, X, ChevronRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { AppId } from '../../types';

const APP_ACCENT_COLORS: Partial<Record<AppId, { border: string; glow: string; gradient: string }>> = {
  notepad: { border: '#38bdf8', glow: 'rgba(56, 189, 248, 0.65)', gradient: 'from-cyan-400 via-sky-500 to-indigo-500' },
  calculator: { border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)', gradient: 'from-amber-400 via-orange-500 to-rose-500' },
  files: { border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.65)', gradient: 'from-blue-400 via-indigo-500 to-violet-600' },
  settings: { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.65)', gradient: 'from-purple-400 via-fuchsia-500 to-pink-500' },
  terminal: { border: '#10b981', glow: 'rgba(16, 185, 129, 0.65)', gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
  camera: { border: '#ec4899', glow: 'rgba(236, 72, 153, 0.65)', gradient: 'from-pink-400 via-rose-500 to-red-500' },
  gallery: { border: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.65)', gradient: 'from-violet-400 via-purple-500 to-indigo-600' },
  clock: { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.65)', gradient: 'from-cyan-400 via-teal-500 to-emerald-500' },
  snake: { border: '#22c55e', glow: 'rgba(34, 197, 94, 0.65)', gradient: 'from-green-400 via-emerald-500 to-teal-600' },
  tetris: { border: '#d946ef', glow: 'rgba(217, 70, 239, 0.65)', gradient: 'from-fuchsia-400 via-purple-500 to-pink-600' },
  pacman: { border: '#eab308', glow: 'rgba(234, 179, 8, 0.65)', gradient: 'from-yellow-400 via-amber-500 to-orange-500' },
  minesweeper: { border: '#ef4444', glow: 'rgba(239, 68, 68, 0.65)', gradient: 'from-red-400 via-rose-500 to-pink-600' },
  chess: { border: '#6366f1', glow: 'rgba(99, 102, 241, 0.65)', gradient: 'from-indigo-400 via-blue-500 to-purple-600' },
  tictactoe: { border: '#14b8a6', glow: 'rgba(20, 184, 166, 0.65)', gradient: 'from-teal-400 via-cyan-500 to-blue-500' },
};

const DEFAULT_GLOW = {
  border: '#06b6d4',
  glow: 'rgba(6, 182, 212, 0.7)',
  gradient: 'from-cyan-400 via-indigo-500 to-fuchsia-500',
};

export const EdgeLighting: React.FC = () => {
  const {
    lastNotificationTrigger,
    activeToastNotification,
    dismissToast,
    launchApp,
    settings,
    installedApps,
    t,
  } = useOS();

  const [isLightingActive, setIsLightingActive] = useState(false);

  useEffect(() => {
    if (lastNotificationTrigger > 0 && settings.edgeLighting !== false) {
      setIsLightingActive(true);
      const timer = setTimeout(() => {
        setIsLightingActive(false);
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [lastNotificationTrigger, settings.edgeLighting]);

  // Auto dismiss toast after 5 seconds
  useEffect(() => {
    if (activeToastNotification) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToastNotification, dismissToast]);

  const currentAppId = activeToastNotification?.appId;
  const currentApp = installedApps.find((a) => a.id === currentAppId);
  const colorScheme = (currentAppId && APP_ACCENT_COLORS[currentAppId]) || DEFAULT_GLOW;

  return (
    <>
      {/* 1. Subtle Edge Lighting Border Pulse */}
      <AnimatePresence>
        {isLightingActive && (
          <motion.div
            id="novaos-edge-lighting-overlay"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.5, 0.9, 0.3, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3.5,
              times: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1],
              ease: 'easeInOut',
            }}
            className="absolute inset-0 z-40 pointer-events-none rounded-[inherit] overflow-hidden"
          >
            {/* Ambient Inner Glowing Perimeter */}
            <div
              className="absolute inset-0 rounded-[inherit] border-2 transition-all duration-300"
              style={{
                borderColor: colorScheme.border,
                boxShadow: `inset 0 0 20px 3px ${colorScheme.glow}, 0 0 15px 2px ${colorScheme.glow}`,
              }}
            />

            {/* Radiant Corner Beam Highlights */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-400/40 to-transparent rounded-tl-[inherit] blur-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-400/40 to-transparent rounded-tr-[inherit] blur-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fuchsia-400/40 to-transparent rounded-bl-[inherit] blur-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-400/40 to-transparent rounded-br-[inherit] blur-sm pointer-events-none" />

            {/* Sweeping Light Tracer around the edges */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '200% 200%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.4,
                ease: 'linear',
              }}
              className="absolute inset-0 rounded-[inherit] opacity-60 pointer-events-none"
              style={{
                padding: '2px',
                background: `linear-gradient(90deg, transparent, ${colorScheme.border}, transparent)`,
                backgroundSize: '200% 200%',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Heads-up Notification Toast Banner */}
      <AnimatePresence>
        {activeToastNotification && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-8 inset-x-3.5 z-50 pointer-events-auto"
          >
            <div
              onClick={() => {
                sounds.playTap();
                if (currentAppId) {
                  launchApp(currentAppId);
                }
                dismissToast();
              }}
              className="bg-zinc-900/95 hover:bg-zinc-900 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-start space-x-3 cursor-pointer transition-all active:scale-[0.98] group"
              style={{
                boxShadow: `0 10px 25px -5px rgba(0,0,0,0.8), 0 0 15px 0px ${colorScheme.glow}`,
              }}
            >
              {/* App Icon Pill */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-tr ${
                  currentApp?.gradient || colorScheme.gradient
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 truncate">
                    {currentApp ? t('apps', currentApp.id) : 'NovaOS'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">agora</span>
                </div>
                <h4 className="text-xs font-semibold text-white truncate mt-0.5">
                  {activeToastNotification.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                  {activeToastNotification.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playTap();
                  dismissToast();
                }}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
