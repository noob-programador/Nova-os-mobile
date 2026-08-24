import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Power,
  Volume2,
  VolumeX,
  Smartphone,
  Download,
} from 'lucide-react';
import { OSProvider, useOS } from './context/OSContext';
import { sounds } from './utils/sound';

// System Shell Components
import { BootScreen } from './components/boot/BootScreen';
import { LockScreen } from './components/lock/LockScreen';
import { StatusBar } from './components/common/StatusBar';
import { NavigationBar } from './components/common/NavigationBar';
import { HomeScreen } from './components/home/HomeScreen';
import { AppDrawer } from './components/drawer/AppDrawer';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { MultitaskingView } from './components/multitasking/MultitaskingView';
import { AppContainer } from './components/common/AppContainer';
import { EdgeLighting } from './components/common/EdgeLighting';
import { PWAInstallModal } from './components/common/PWAInstallModal';

const MainScreen: React.FC = () => {
  const {
    bootState,
    settings,
    lockOS,
    unlockOS,
    updateSettings,
    getActiveWallpaper,
    isPwaInstallModalOpen,
    openPwaInstallModal,
    closePwaInstallModal,
  } = useOS();

  const [frameMode, setFrameMode] = useState<'mobile-frame' | 'fullscreen'>('mobile-frame');

  // Compute wallpaper style
  const wallpaperBg = getActiveWallpaper();

  const handleToggleLock = () => {
    sounds.playLock();
    if (bootState === 'unlocked') {
      lockOS();
    } else if (bootState === 'locked') {
      unlockOS();
    }
  };

  // Compute Color Blind Filter Style
  const getColorBlindFilter = () => {
    switch (settings.colorBlindMode) {
      case 'protanopia':
        return 'contrast(1.15) hue-rotate(25deg)';
      case 'deuteranopia':
        return 'contrast(1.1) hue-rotate(60deg)';
      case 'tritanopia':
        return 'contrast(1.1) hue-rotate(180deg)';
      case 'monochrome':
        return 'grayscale(100%)';
      default:
        return 'none';
    }
  };

  // Font size modifier class
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      case 'xlarge':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="w-screen h-screen bg-neutral-950 text-white flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />

      {/* Top Desktop Controls Bar (visible on desktop viewports) */}
      <header className="absolute top-3 inset-x-6 z-40 hidden md:flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 px-4 py-2 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
          <span className="font-bold text-zinc-200">NovaOS Mobile</span>
          <span className="text-[11px] text-zinc-500 font-mono">v3.5 Pro "Nebula"</span>
        </div>

        {/* Quick Simulator Utilities */}
        <div className="flex items-center space-x-2">
          <button
            onClick={openPwaInstallModal}
            className="p-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 flex items-center space-x-1.5 transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
            title="Instalar NovaOS como PWA no Celular"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Instalar no Celular</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              updateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            className={`p-1.5 rounded-xl border flex items-center space-x-1.5 transition-colors ${
              settings.soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
            title="Alternar Áudio"
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">{settings.soundEnabled ? 'Som Ativado' : 'Mudo'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setFrameMode(frameMode === 'mobile-frame' ? 'fullscreen' : 'mobile-frame');
            }}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center space-x-1.5 transition-colors"
            title="Alternar Moldura"
          >
            {frameMode === 'mobile-frame' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">
              {frameMode === 'mobile-frame' ? 'Tela Cheia' : 'Moldura Celular'}
            </span>
          </button>

          <button
            onClick={handleToggleLock}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex items-center space-x-1.5 transition-colors"
            title="Bloquear / Desbloquear"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Power</span>
          </button>
        </div>
      </header>

      {/* Main Smartphone Shell Container */}
      <main
        className={`relative transition-all duration-300 flex items-center justify-center ${
          frameMode === 'mobile-frame'
            ? 'w-full max-w-[420px] h-[92vh] max-h-[860px] rounded-[48px] p-3.5 bg-zinc-900 border-[6px] border-zinc-700/80 shadow-2xl shadow-black/90 ring-1 ring-white/10'
            : 'w-full h-full rounded-none p-0 border-none'
        }`}
      >
        {/* Hardware Frame Buttons (Visible in mobile-frame mode) */}
        {frameMode === 'mobile-frame' && (
          <>
            {/* Power Button on the right edge */}
            <button
              onClick={handleToggleLock}
              className="absolute -right-3.5 top-28 w-1.5 h-12 bg-zinc-600 rounded-r-md hover:bg-zinc-500 active:scale-95 transition-colors cursor-pointer"
              title="Botão Power"
            />
            {/* Volume Up Button on left edge */}
            <button
              onClick={() => sounds.playTap()}
              className="absolute -left-3.5 top-24 w-1.5 h-10 bg-zinc-600 rounded-l-md hover:bg-zinc-500 active:scale-95 transition-colors cursor-pointer"
              title="Volume +"
            />
            {/* Volume Down Button on left edge */}
            <button
              onClick={() => sounds.playTap()}
              className="absolute -left-3.5 top-38 w-1.5 h-10 bg-zinc-600 rounded-l-md hover:bg-zinc-500 active:scale-95 transition-colors cursor-pointer"
              title="Volume -"
            />
          </>
        )}

        {/* Screen Display Glass Canvas */}
        <div
          id="novaos-screen-display"
          className={`w-full h-full relative overflow-hidden bg-black flex flex-col justify-between transition-all ${
            frameMode === 'mobile-frame' ? 'rounded-[40px]' : 'rounded-none'
          } ${getFontSizeClass()} ${settings.highContrast ? 'border-2 border-white' : ''}`}
          style={{
            background: wallpaperBg,
            filter: getColorBlindFilter(),
          }}
        >
          {/* Dynamic Island / Speaker Pill Notch at Top */}
          <div className="absolute top-2 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="w-24 h-4 rounded-full bg-black/90 border border-zinc-800/80 flex items-center justify-between px-2.5 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-cyan-950/60 border border-cyan-800/40" />
            </div>
          </div>

          {/* System Status Bar */}
          <StatusBar />

          {/* Core OS Views Stack */}
          <div className="flex-1 relative overflow-hidden">
            {/* 1. Boot Sequence */}
            {bootState === 'booting' && <BootScreen />}

            {/* 2. Lock Screen */}
            {bootState === 'locked' && <LockScreen />}

            {/* 3. Unlocked OS Environment */}
            {bootState === 'unlocked' && (
              <>
                {/* Home Screen with Widgets, Icon Grid, and Dock */}
                <HomeScreen />

                {/* Open Application Window Overlay */}
                <AppContainer />

                {/* Multitasking Recents Overview */}
                <MultitaskingView />

                {/* App Drawer (Swipe up from bottom or tap icon) */}
                <AppDrawer />

                {/* Notification Center & Quick Toggles */}
                <NotificationCenter />
              </>
            )}
          </div>

          {/* System Bottom Navigation Bar (Back, Home, Recents / Gesture bar) */}
          <NavigationBar />

          {/* Edge Lighting Notification Glow & Heads-up Toast */}
          <EdgeLighting />
        </div>
      </main>

      {/* PWA Install Modal / Drawer Guide */}
      <PWAInstallModal isOpen={isPwaInstallModalOpen} onClose={closePwaInstallModal} />
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <MainScreen />
    </OSProvider>
  );
}
