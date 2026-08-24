import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  CloudRain,
  CloudSun,
  Calendar,
  HardDrive,
  Play,
  Pause,
  SkipForward,
  Music,
  Activity,
  Timer,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock as ClockIcon,
  Sparkles,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../utils/fileSystem';
import { sounds } from '../../utils/sound';
import { WidgetItemConfig, WidgetType } from '../../types';

// ==========================================
// 1. WEATHER WIDGET
// ==========================================
export const WeatherWidget: React.FC = () => {
  const { t, launchApp } = useOS();
  const [temp, setTemp] = useState(24);
  const [condition, setCondition] = useState<'sunny' | 'partlyCloudy' | 'rainy'>('partlyCloudy');

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp((prev) => Math.min(32, Math.max(18, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-cyan-400" />;
      case 'partlyCloudy':
      default:
        return <CloudSun className="w-8 h-8 text-yellow-300" />;
    }
  };

  return (
    <div
      onClick={() => launchApp('clock')}
      className="col-span-2 bg-black/30 hover:bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg cursor-pointer transition-all active:scale-98 group"
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-xs text-white/80">
          <span className="font-semibold tracking-wide">São Paulo</span>
          <span className="text-[10px] opacity-70">• {t('widgets', 'today')}</span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-bold tracking-tight">{temp}°</span>
          <span className="text-xs text-white/70 font-medium">{t('widgets', condition)}</span>
        </div>
        <p className="text-[10px] text-white/60">H: 28° L: 19° • {t('widgets', 'humidity')} 65%</p>
      </div>

      <div className="p-2 rounded-2xl bg-white/10 group-hover:scale-110 transition-transform flex items-center justify-center">
        {getWeatherIcon()}
      </div>
    </div>
  );
};

// ==========================================
// 2. CALENDAR WIDGET
// ==========================================
export const CalendarWidget: React.FC = () => {
  const { t, settings, launchApp } = useOS();
  const now = new Date();
  const dayName = now.toLocaleDateString(settings.language === 'en-US' ? 'en-US' : 'pt-BR', { weekday: 'short' });
  const dayNumber = now.getDate();
  const monthName = now.toLocaleDateString(settings.language === 'en-US' ? 'en-US' : 'pt-BR', { month: 'short' });

  return (
    <div
      onClick={() => launchApp('notepad')}
      className="col-span-2 bg-gradient-to-br from-indigo-900/40 to-black/30 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg cursor-pointer transition-all active:scale-98 group"
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-1 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dayName}</span>
        </div>
        <p className="text-sm font-semibold truncate text-white/95">Reunião de Vibe Coding</p>
        <p className="text-[10px] text-white/60">17:00 • 2 compromissos hoje</p>
      </div>

      <div className="w-12 h-14 bg-white/10 rounded-2xl border border-white/20 flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
        <span className="text-[10px] uppercase font-bold text-rose-400">{monthName}</span>
        <span className="text-xl font-bold">{dayNumber}</span>
      </div>
    </div>
  );
};

// ==========================================
// 3. STORAGE WIDGET
// ==========================================
export const StorageWidget: React.FC = () => {
  const { t, launchApp } = useOS();
  const totalFiles = vfs.getAll().length;
  const usedBytes = vfs.getTotalSize();
  const usedMB = (usedBytes / 1024).toFixed(1);

  return (
    <div
      onClick={() => launchApp('files')}
      className="col-span-2 bg-black/30 hover:bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-white space-y-2 shadow-lg cursor-pointer transition-all active:scale-98"
    >
      <div className="flex items-center justify-between text-xs text-white/80">
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{t('widgets', 'storage')}</span>
        </div>
        <span className="text-[10px] text-cyan-300 font-mono">{totalFiles} {t('files', 'items')}</span>
      </div>

      <div className="space-y-1">
        <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full w-[28%]" />
        </div>
        <div className="flex justify-between text-[10px] text-white/60 font-mono">
          <span>{usedMB} KB {t('widgets', 'used')}</span>
          <span>5.0 MB quota</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. DIGITAL CLOCK WIDGET
// ==========================================
export const DigitalClockWidget: React.FC = () => {
  const { launchApp } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div
      onClick={() => launchApp('clock')}
      className="col-span-2 bg-black/30 hover:bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg cursor-pointer transition-all active:scale-98"
    >
      <div>
        <div className="flex items-baseline space-x-1 font-mono">
          <span className="text-3xl font-bold tracking-tight text-cyan-400">{hours}:{minutes}</span>
          <span className="text-xs text-white/50">{seconds}</span>
        </div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <ClockIcon className="w-5 h-5 animate-pulse" />
      </div>
    </div>
  );
};

// ==========================================
// 5. MUSIC PLAYER WIDGET (SYNTHESIZED BEATS)
// ==========================================
export const MusicPlayerWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState<'lofi' | 'cyberpunk' | 'chill'>('lofi');
  const [progress, setProgress] = useState(0);

  const trackTitles = {
    lofi: 'Nova Chillwave',
    cyberpunk: 'Cyberpunk Run',
    chill: 'Nebula Dreaming',
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      sounds.stopSynthTrack();
      setIsPlaying(false);
    } else {
      sounds.playSynthTrack(track, (p) => setProgress(p * 100));
      setIsPlaying(true);
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tracks: ('lofi' | 'cyberpunk' | 'chill')[] = ['lofi', 'cyberpunk', 'chill'];
    const next = tracks[(tracks.indexOf(track) + 1) % tracks.length];
    setTrack(next);
    if (isPlaying) {
      sounds.playSynthTrack(next, (p) => setProgress(p * 100));
    }
  };

  useEffect(() => {
    return () => {
      sounds.stopSynthTrack();
    };
  }, []);

  return (
    <div className="col-span-2 bg-gradient-to-br from-purple-950/40 to-black/35 backdrop-blur-xl border border-white/15 rounded-3xl p-3.5 text-white flex flex-col justify-between shadow-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/95 leading-tight">{trackTitles[track]}</p>
            <p className="text-[10px] text-purple-300">NovaOS Synthesizer</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleTogglePlay}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>
          <button
            onClick={handleNextTrack}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-all active:scale-95"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${progress || (isPlaying ? 50 : 0)}%` }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 6. POMODORO TIMER WIDGET
// ==========================================
export const PomodoroWidget: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      sounds.playChimeGong();
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => {
    sounds.playTap();
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    sounds.playTap();
    setIsRunning(false);
    setSecondsLeft(25 * 60);
  };

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="col-span-2 bg-gradient-to-br from-rose-950/40 to-black/35 backdrop-blur-xl border border-white/15 rounded-3xl p-3.5 text-white flex items-center justify-between shadow-lg">
      <div className="space-y-0.5">
        <div className="flex items-center space-x-1.5 text-xs text-rose-300 font-semibold">
          <Timer className="w-3.5 h-3.5" />
          <span>Pomodoro Focus</span>
        </div>
        <p className="text-2xl font-mono font-bold tracking-tight text-white">{mins}:{secs}</p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTimer}
          className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-rose-500/20"
        >
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 7. SYSTEM STATS WIDGET (CPU/RAM)
// ==========================================
export const SystemStatsWidget: React.FC = () => {
  const [cpu, setCpu] = useState(18);
  const [ram, setRam] = useState(44);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 25) + 12);
      setRam(Math.floor(Math.random() * 8) + 40);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="col-span-2 bg-black/30 backdrop-blur-xl border border-white/15 rounded-3xl p-3.5 text-white flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/95">Nebula Kernel 3.5</p>
          <p className="text-[10px] text-emerald-300 font-mono">60 FPS • 12ms Latência</p>
        </div>
      </div>

      <div className="flex space-x-3 text-right">
        <div>
          <p className="text-[9px] text-white/50 uppercase font-mono">CPU</p>
          <p className="text-xs font-mono font-bold text-cyan-400">{cpu}%</p>
        </div>
        <div>
          <p className="text-[9px] text-white/50 uppercase font-mono">RAM</p>
          <p className="text-xs font-mono font-bold text-purple-400">{ram}%</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. STICKY NOTES WIDGET
// ==========================================
export const StickyNotesWidget: React.FC = () => {
  const { launchApp } = useOS();
  const [note, setNote] = useState(() => {
    return localStorage.getItem('novaos_quick_sticky') || 'Comprar café ☕\nTerminar módulo de temas 🚀';
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem('novaos_quick_sticky', e.target.value);
  };

  return (
    <div className="col-span-2 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-3 text-amber-100 flex flex-col justify-between shadow-lg space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
        <span>Lembrete Rápido</span>
        <button onClick={() => launchApp('notepad')} className="text-[10px] text-amber-400 hover:underline">
          Abrir Notas
        </button>
      </div>
      <textarea
        value={note}
        onChange={handleChange}
        className="w-full bg-transparent text-xs text-amber-100 placeholder-amber-300/40 resize-none outline-none font-sans h-12 leading-relaxed"
        placeholder="Escreva algo rápido..."
      />
    </div>
  );
};

// ==========================================
// 9. WIDGET MANAGER COMPONENT
// ==========================================
export const DynamicWidgetsContainer: React.FC = () => {
  const { settings } = useOS();
  const widgets = settings.widgets || [];

  const renderWidget = (item: WidgetItemConfig) => {
    if (!item.enabled) return null;

    switch (item.type) {
      case 'weather':
        return <WeatherWidget key={item.id} />;
      case 'calendar':
        return <CalendarWidget key={item.id} />;
      case 'storage':
        return <StorageWidget key={item.id} />;
      case 'digitalClock':
        return <DigitalClockWidget key={item.id} />;
      case 'musicPlayer':
        return <MusicPlayerWidget key={item.id} />;
      case 'pomodoro':
        return <PomodoroWidget key={item.id} />;
      case 'systemStats':
        return <SystemStatsWidget key={item.id} />;
      case 'stickyNotes':
        return <StickyNotesWidget key={item.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-4">
      {widgets
        .filter((w) => w.enabled)
        .sort((a, b) => a.order - b.order)
        .map(renderWidget)}
    </div>
  );
};
