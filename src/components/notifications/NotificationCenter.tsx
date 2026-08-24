import React from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Plane,
  Flashlight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Trash2,
  X,
  Bell,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';

export const NotificationCenter: React.FC = () => {
  const {
    isNotificationCenterOpen,
    toggleNotificationCenter,
    settings,
    updateSettings,
    notifications,
    dismissNotification,
    clearAllNotifications,
    t,
  } = useOS();

  if (!isNotificationCenterOpen) return null;

  const handleToggleSetting = (key: keyof typeof settings) => {
    sounds.playTap();
    updateSettings({ [key]: !settings[key] });
  };

  const handleBrightnessChange = (val: number) => {
    updateSettings({ brightness: val });
  };

  const handleVolumeChange = (val: number) => {
    updateSettings({ volume: val });
    sounds.setVolume(val);
  };

  return (
    <motion.div
      id="notification-center"
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 z-50 bg-zinc-950/85 backdrop-blur-2xl text-white flex flex-col p-5 select-none overflow-y-auto scrollbar-thin"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-3 pb-2">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-tight">{t('system', 'quickSettings')}</h2>
        </div>
        <button
          onClick={() => toggleNotificationCenter(false)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Quick Settings 4x2 Toggle Matrix */}
      <div className="grid grid-cols-4 gap-2.5 my-3">
        {/* Wi-Fi */}
        <button
          onClick={() => handleToggleSetting('wifi')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.wifi
              ? 'bg-indigo-600 border-indigo-400/50 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          {settings.wifi ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'wifi')}</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => handleToggleSetting('bluetooth')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.bluetooth
              ? 'bg-blue-600 border-blue-400/50 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          <Bluetooth className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'bluetooth')}</span>
        </button>

        {/* Airplane Mode */}
        <button
          onClick={() => handleToggleSetting('airplaneMode')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.airplaneMode
              ? 'bg-amber-600 border-amber-400/50 text-white shadow-lg shadow-amber-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'airplane')}</span>
        </button>

        {/* Flashlight */}
        <button
          onClick={() => handleToggleSetting('flashlight')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.flashlight
              ? 'bg-yellow-400 text-zinc-950 font-bold border-yellow-300 shadow-lg shadow-yellow-400/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          <Flashlight className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'flashlight')}</span>
        </button>

        {/* Theme Dark / Light Toggle */}
        <button
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.theme === 'dark'
              ? 'bg-purple-600 border-purple-400/50 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'darkMode')}</span>
        </button>

        {/* Do Not Disturb */}
        <button
          onClick={() => handleToggleSetting('dnd')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.dnd
              ? 'bg-rose-600 border-rose-400/50 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          <Moon className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'dnd')}</span>
        </button>

        {/* Sound Effects */}
        <button
          onClick={() => handleToggleSetting('soundEnabled')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
            settings.soundEnabled
              ? 'bg-emerald-600 border-emerald-400/50 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/15'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="text-[10px] font-medium mt-1.5">Sons</span>
        </button>

        {/* Clear All Notifications */}
        <button
          onClick={clearAllNotifications}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border bg-white/10 border-white/10 text-white/60 hover:bg-white/15 transition-all active:scale-95"
        >
          <CheckCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1.5">{t('system', 'clearAll')}</span>
        </button>
      </div>

      {/* Sliders: Brightness & Volume */}
      <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 my-2">
        {/* Brightness Slider */}
        <div className="flex items-center space-x-3">
          <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <input
              id="slider-brightness"
              type="range"
              min="20"
              max="100"
              value={settings.brightness}
              onChange={(e) => handleBrightnessChange(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
          <span className="text-[11px] font-mono w-8 text-right">{settings.brightness}%</span>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-3">
          {settings.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <input
              id="slider-volume"
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
          <span className="text-[11px] font-mono w-8 text-right">{settings.volume}%</span>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="flex-1 mt-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>Notificações ({notifications.length})</span>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="hover:text-rose-400 flex items-center space-x-1 text-[11px] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t('system', 'clearAll')}</span>
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 flex items-start justify-between space-x-3 transition-colors shadow-sm"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white/95">{notif.title}</p>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug">{notif.message}</p>
                </div>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-28 text-center text-zinc-500 space-y-1">
            <Bell className="w-6 h-6 opacity-30" />
            <p className="text-xs">{t('system', 'noNotifications')}</p>
          </div>
        )}
      </div>

      {/* Bottom Dismiss Bar */}
      <div
        onClick={() => toggleNotificationCenter(false)}
        className="w-full flex flex-col items-center justify-center pt-3 cursor-pointer"
      >
        <ChevronDown className="w-4 h-4 text-white/50" />
      </div>
    </motion.div>
  );
};
