import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Globe, AlarmClock, Timer as TimerIcon, Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';

export const ClockApp: React.FC = () => {
  const { t, sendNotification } = useOS();
  const [activeTab, setActiveTab] = useState<'world' | 'alarm' | 'stopwatch' | 'timer'>('world');

  // World clock state
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch state
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: any;
    if (swRunning) {
      interval = setInterval(() => setSwTime((prev) => prev + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  const handleLap = () => {
    sounds.playTap();
    setLaps([swTime, ...laps]);
  };

  const handleResetStopwatch = () => {
    sounds.playTap();
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [timerLeft, setTimerLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timerLeft > 0) {
      interval = setInterval(() => setTimerLeft((prev) => prev - 1), 1000);
    } else if (timerRunning && timerLeft === 0) {
      setTimerRunning(false);
      sounds.playNotification();
      sendNotification({
        appId: 'clock',
        title: 'Temporizador Concluído! ⏰',
        message: 'O tempo definido no temporizador terminou.',
        priority: 'high',
      });
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerLeft, sendNotification]);

  const worldCities = [
    { city: 'São Paulo', offset: 0 },
    { city: 'Nova York', offset: -1 },
    { city: 'Londres', offset: 4 },
    { city: 'Tóquio', offset: 12 },
  ];

  return (
    <div id="clock-app" className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between p-4 select-none overflow-hidden">
      {/* Tab bar navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs">
        {[
          { id: 'world', label: 'Mundo', icon: Globe },
          { id: 'alarm', label: 'Alarme', icon: AlarmClock },
          { id: 'stopwatch', label: 'Cronômetro', icon: ClockIcon },
          { id: 'timer', label: 'Timer', icon: TimerIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                setActiveTab(tab.id as any);
              }}
              className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-1 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto my-4 flex flex-col justify-center items-center scrollbar-thin">
        {activeTab === 'world' && (
          <div className="w-full space-y-3 px-2">
            {worldCities.map((item) => {
              const cityTime = new Date(now.getTime() + item.offset * 3600000);
              return (
                <div
                  key={item.city}
                  className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm"
                >
                  <div>
                    <h3 className="text-sm font-bold">{item.city}</h3>
                    <p className="text-[10px] text-zinc-400">
                      {item.offset === 0 ? 'Horário local' : `${item.offset > 0 ? '+' : ''}${item.offset} horas`}
                    </p>
                  </div>
                  <span className="text-2xl font-light font-mono text-cyan-400">
                    {cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'alarm' && (
          <div className="w-full space-y-3 px-2">
            {[
              { time: '07:00', label: 'Despertar', active: true },
              { time: '08:30', label: 'Reunião Daily', active: false },
              { time: '22:30', label: 'Hora de Dormir', active: true },
            ].map((al, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <span className="text-3xl font-light font-mono">{al.time}</span>
                  <p className="text-xs text-zinc-400">{al.label}</p>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors ${al.active ? 'bg-cyan-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 ${al.active ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stopwatch' && (
          <div className="w-full flex flex-col items-center justify-between h-full space-y-6">
            <div className="text-5xl sm:text-6xl font-mono font-light text-cyan-400 my-auto tracking-wider">
              {formatStopwatch(swTime)}
            </div>

            {/* Laps list */}
            <div className="w-full max-h-40 overflow-y-auto space-y-1 px-4 scrollbar-thin">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-xs font-mono text-zinc-400 py-1 border-b border-zinc-800">
                  <span>Volta {laps.length - i}</span>
                  <span className="text-white font-bold">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-6 pb-2">
              <button
                onClick={handleResetStopwatch}
                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setSwRunning(!swRunning);
                }}
                className={`w-18 h-18 rounded-full flex items-center justify-center text-zinc-950 font-bold transition-all active:scale-95 shadow-lg ${
                  swRunning ? 'bg-amber-400 shadow-amber-400/30' : 'bg-cyan-400 shadow-cyan-400/30'
                }`}
              >
                {swRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
              {swRunning && (
                <button
                  onClick={handleLap}
                  className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-cyan-300 flex items-center justify-center transition-all active:scale-95 text-xs font-bold font-mono"
                >
                  Volta
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="w-full flex flex-col items-center justify-between h-full space-y-6">
            <div className="relative w-48 h-48 flex items-center justify-center my-auto">
              <div className="text-5xl font-mono font-light text-amber-400">
                {Math.floor(timerLeft / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(timerLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Presets */}
            <div className="flex space-x-2">
              {[60, 180, 300, 600].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    sounds.playTap();
                    setTimerSeconds(s);
                    setTimerLeft(s);
                    setTimerRunning(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
                >
                  {s / 60}m
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-6 pb-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setTimerRunning(false);
                  setTimerLeft(timerSeconds);
                }}
                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setTimerRunning(!timerRunning);
                }}
                className={`w-18 h-18 rounded-full flex items-center justify-center text-zinc-950 font-bold transition-all active:scale-95 shadow-lg ${
                  timerRunning ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              >
                {timerRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
