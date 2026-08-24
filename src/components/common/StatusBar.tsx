import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryCharging, Bluetooth, Moon, VolumeX, Sparkles, Smartphone, Maximize2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface StatusBarProps {
  darkText?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ darkText = false }) => {
  const { settings, notifications, toggleNotificationCenter, deviceViewMode, setDeviceViewMode } = useOS();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isLightWallpaper = settings.wallpaperId === 'minimal-light' && settings.theme === 'light';
  const textColor = darkText || isLightWallpaper ? 'text-zinc-900' : 'text-white';

  return (
    <header
      id="status-bar"
      onClick={() => toggleNotificationCenter(true)}
      className={`w-full h-8 px-5 flex items-center justify-between text-xs font-semibold select-none z-40 transition-colors cursor-pointer ${textColor}`}
    >
      {/* Left side: Time & Notification Badge */}
      <div className="flex items-center space-x-2">
        <span className="tracking-tight font-medium text-[13px]">{timeStr || '12:00'}</span>
        {unreadCount > 0 && (
          <span className="flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Center: Dynamic Island / Notch capsule (indicates drop gesture) */}
      <div className="flex items-center justify-center">
        <div className="h-4 px-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center space-x-1.5 shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="text-[10px] text-zinc-300 font-medium hidden sm:inline tracking-wider">NovaOS</span>
        </div>
      </div>

      {/* Right side: Hardware status indicators */}
      <div className="flex items-center space-x-2 text-[11px]">
        {/* Toggle device view mode button on desktop */}
        <button
          title="Toggle Mobile Frame / Fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            setDeviceViewMode(deviceViewMode === 'phone-frame' ? 'fullscreen' : 'phone-frame');
          }}
          className="p-1 rounded hover:bg-white/20 transition-all opacity-80 hover:opacity-100"
        >
          {deviceViewMode === 'phone-frame' ? <Maximize2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
        </button>

        {settings.dnd && <Moon className="w-3 h-3 fill-current text-indigo-400" />}
        {settings.volume === 0 && <VolumeX className="w-3 h-3 text-rose-400" />}
        {settings.bluetooth && <Bluetooth className="w-3 h-3 text-sky-400" />}
        {settings.wifi ? (
          <Wifi className="w-3.5 h-3.5" />
        ) : (
          <span className="text-[10px] opacity-60">LTE</span>
        )}

        {/* Battery Indicator */}
        <div className="flex items-center space-x-1 font-mono text-[11px]">
          <span>{settings.batteryLevel}%</span>
          {settings.isCharging ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          ) : (
            <Battery className="w-4 h-4" />
          )}
        </div>
      </div>
    </header>
  );
};
