import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Smartphone, Sparkles } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { getIconComponent } from '../home/AppIcon';

export const MultitaskingView: React.FC = () => {
  const {
    openApps,
    installedApps,
    launchApp,
    closeApp,
    closeAllApps,
    isMultitaskingOpen,
    toggleMultitasking,
    t,
  } = useOS();

  if (!isMultitaskingOpen) return null;

  return (
    <motion.div
      id="multitasking-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 bg-zinc-950/80 backdrop-blur-2xl text-white flex flex-col justify-between p-6 select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-sm font-bold tracking-tight text-white/90">Multitarefas</h2>
        {openApps.length > 0 && (
          <button
            onClick={closeAllApps}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('system', 'closeAll')}</span>
          </button>
        )}
      </div>

      {/* Cards Horizontal Carousel */}
      {openApps.length > 0 ? (
        <div className="flex-1 flex items-center overflow-x-auto py-8 space-x-5 px-4 scrollbar-none snap-x snap-mandatory">
          <AnimatePresence>
            {openApps.map((appId) => {
              const app = installedApps.find((a) => a.id === appId);
              if (!app) return null;
              const appTitle = t('apps', app.titleKey) || app.defaultTitle;

              return (
                <motion.div
                  key={appId}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                  className="flex-shrink-0 w-60 h-[380px] bg-zinc-900/90 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col snap-center relative group cursor-pointer hover:border-cyan-400/50 transition-colors"
                  onClick={() => launchApp(appId)}
                >
                  {/* Card App Header */}
                  <div className="flex items-center justify-between p-3.5 bg-black/40 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-xs`}
                      >
                        {getIconComponent(app.icon, 'w-3.5 h-3.5')}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[120px]">{appTitle}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeApp(appId);
                      }}
                      className="p-1 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Fechar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* App Preview Simulation */}
                  <div className="flex-1 p-4 bg-zinc-950/60 flex flex-col items-center justify-center text-center space-y-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      {getIconComponent(app.icon, 'w-8 h-8')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/90">{appTitle}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">{app.category}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">
                      Ativo na memória
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-auto text-zinc-500 space-y-2">
          <Smartphone className="w-12 h-12 opacity-30" />
          <p className="text-xs">{t('system', 'noRecentApps')}</p>
        </div>
      )}

      {/* Bottom Dismiss Bar */}
      <div
        onClick={toggleMultitasking}
        className="w-full flex flex-col items-center justify-center pt-2 cursor-pointer"
      >
        <div className="w-24 h-1 bg-white/40 rounded-full hover:bg-white/70 transition-colors" />
      </div>
    </motion.div>
  );
};
