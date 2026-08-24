import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppIcon } from './AppIcon';
import { Dock } from './Dock';
import { DynamicWidgetsContainer } from './Widgets';
import { LiveWallpaper } from '../common/LiveWallpaper';

export const HomeScreen: React.FC = () => {
  const { installedApps, homePage, setHomePage, toggleAppDrawer, getActiveWallpaper, settings, launchApp } = useOS();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: string } | null>(null);

  const page0Apps = installedApps.filter((a) => !a.isGame);
  const page1Apps = installedApps.filter((a) => a.isGame);

  const totalPages = 2;

  const handleNextPage = () => {
    setHomePage((homePage + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setHomePage((homePage - 1 + totalPages) % totalPages);
  };

  return (
    <div
      id="home-screen"
      style={{ background: getActiveWallpaper() }}
      className="absolute inset-0 z-10 flex flex-col justify-between pt-8 pb-2 select-none overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* Dynamic Interactive Live Wallpaper Canvas */}
      {settings.liveWallpaper && settings.liveWallpaper !== 'none' && (
        <LiveWallpaper type={settings.liveWallpaper} />
      )}

      {/* Dynamic Animated Pages Container */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col z-10">
        <AnimatePresence mode="wait">
          {homePage === 0 ? (
            <motion.div
              key="home-page-0"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="flex-1 flex flex-col px-5 pt-2 space-y-4 overflow-y-auto scrollbar-none"
            >
              {/* Dynamic Modular Widgets Suite */}
              <DynamicWidgetsContainer />

              {/* Page 0 App Grid */}
              <div className="pt-1">
                <div className="grid grid-cols-4 gap-y-5 gap-x-3">
                  {page0Apps.map((app) => (
                    <AppIcon
                      key={app.id}
                      app={app}
                      size="md"
                      showLabel={true}
                      onContextMenu={(e) => {
                        setContextMenu({ x: e.clientX, y: e.clientY, appId: app.id });
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="home-page-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="flex-1 flex flex-col px-5 pt-4 space-y-4 overflow-y-auto scrollbar-none"
            >
              {/* Games Section Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-cyan-900/50 backdrop-blur-xl border border-white/15 text-white shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold tracking-tight">🎮 Arcade Retrô</h3>
                  <p className="text-xs text-white/70">6 Jogos Clássicos Completos em Canvas / WebGL</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-[10px] border border-cyan-400/30">
                  60 FPS
                </span>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-4 gap-y-6 gap-x-3 pt-2">
                {page1Apps.map((app) => (
                  <AppIcon
                    key={app.id}
                    app={app}
                    size="md"
                    showLabel={true}
                    onContextMenu={(e) => {
                      setContextMenu({ x: e.clientX, y: e.clientY, appId: app.id });
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Page Navigation Controls & Dots */}
      <div className="w-full flex items-center justify-center space-x-3 py-1 z-10">
        <button
          onClick={handlePrevPage}
          className="p-1 text-white/40 hover:text-white transition-colors"
          title="Página Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex space-x-2">
          {[0, 1].map((p) => (
            <button
              key={p}
              onClick={() => setHomePage(p)}
              className={`h-1.5 rounded-full transition-all ${
                homePage === p ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextPage}
          className="p-1 text-white/40 hover:text-white transition-colors"
          title="Próxima Página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Up to App Drawer Handle */}
      <div
        onClick={() => toggleAppDrawer(true)}
        className="w-full flex flex-col items-center justify-center cursor-pointer py-1 group z-10"
        title="Toque para abrir todos os aplicativos"
      >
        <ChevronUp className="w-4 h-4 text-white/60 group-hover:text-white transition-transform group-hover:-translate-y-0.5" />
      </div>

      {/* Bottom Frosted Glass Dock */}
      <Dock />
    </div>
  );
};
