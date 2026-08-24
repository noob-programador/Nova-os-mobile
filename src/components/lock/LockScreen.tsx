import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flashlight, Camera, ChevronUp, Lock, Delete } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';

export const LockScreen: React.FC = () => {
  const { unlockOS, user, settings, updateSettings, launchApp, notifications, t, getActiveWallpaper } = useOS();
  const [currentTime, setCurrentTime] = useState({ time: '', date: '' });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinPad, setShowPinPad] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: now.toLocaleDateString(settings.language === 'en-US' ? 'en-US' : settings.language === 'es-ES' ? 'es-ES' : 'pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
      });
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.language]);

  const handleNumClick = (num: string) => {
    sounds.playTap();
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      if (next.length === 4) {
        if (next === (settings.pinCode || '1234')) {
          unlockOS();
        } else {
          setPinError(true);
          sounds.playGameBeep('die');
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 600);
        }
      }
    }
  };

  const handleDeletePin = () => {
    sounds.playTap();
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleUnlockClick = () => {
    if (settings.pinLockEnabled) {
      setShowPinPad(true);
    } else {
      unlockOS();
    }
  };

  const toggleFlashlight = () => {
    sounds.playTap();
    updateSettings({ flashlight: !settings.flashlight });
  };

  return (
    <div
      id="lock-screen"
      style={{ background: getActiveWallpaper() }}
      className="absolute inset-0 z-40 flex flex-col justify-between p-6 select-none text-white overflow-hidden backdrop-blur-[2px]"
    >
      {/* Top Lock status */}
      <div className="w-full flex items-center justify-center pt-2">
        <Lock className="w-4 h-4 text-white/70" />
      </div>

      {/* Main Clock & Date */}
      {!showPinPad ? (
        <div className="flex flex-col items-center text-center space-y-1 my-auto">
          <h1 className="text-6xl sm:text-7xl font-light tracking-tight drop-shadow-md">
            {currentTime.time || '12:00'}
          </h1>
          <p className="text-sm font-medium capitalize text-white/90 drop-shadow">
            {currentTime.date}
          </p>

          {/* User profile capsule */}
          <div className="mt-4 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full flex items-center space-x-2 shadow-sm">
            <span className="text-base">{user.avatar}</span>
            <span className="text-xs font-medium">{user.name}</span>
          </div>

          {/* Notification previews on lockscreen */}
          {notifications.length > 0 && (
            <div className="w-full max-w-xs mt-6 space-y-2">
              {notifications.slice(0, 2).map((notif) => (
                <div
                  key={notif.id}
                  className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-3 text-left shadow-lg"
                >
                  <p className="text-xs font-semibold text-white/90">{notif.title}</p>
                  <p className="text-[11px] text-white/70 truncate">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PIN Lock Pad */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center my-auto w-full max-w-xs mx-auto space-y-4"
        >
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">{t('system', 'enterPin')}</p>
            {pinError && <p className="text-xs text-rose-400">PIN Incorreto (Padrão: 1234)</p>}
          </div>

          {/* PIN circles indicator */}
          <div className="flex space-x-3 my-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border border-white/60 transition-all ${
                  pinInput.length > i ? 'bg-white scale-110' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 transition-all text-xl font-medium flex items-center justify-center backdrop-blur-md"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setShowPinPad(false)}
              className="w-14 h-14 rounded-full text-xs font-medium text-white/70 flex items-center justify-center"
            >
              {t('system', 'cancel')}
            </button>
            <button
              onClick={() => handleNumClick('0')}
              className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 transition-all text-xl font-medium flex items-center justify-center backdrop-blur-md"
            >
              0
            </button>
            <button
              onClick={handleDeletePin}
              className="w-14 h-14 rounded-full text-white/70 flex items-center justify-center active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Bottom Shortcuts: Flashlight, Swipe to Unlock, Camera */}
      <div className="w-full flex items-center justify-between pt-4">
        {/* Flashlight button */}
        <button
          onClick={toggleFlashlight}
          className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90 ${
            settings.flashlight ? 'bg-white text-zinc-950 shadow-lg' : 'bg-black/30 text-white'
          }`}
          title="Lanterna"
        >
          <Flashlight className="w-5 h-5" />
        </button>

        {/* Swipe / Click to unlock pill */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          onClick={handleUnlockClick}
          className="flex flex-col items-center cursor-pointer px-4 py-1.5 rounded-full hover:bg-white/10 transition-all"
        >
          <ChevronUp className="w-4 h-4 text-white/70" />
          <span className="text-[11px] font-medium tracking-wide text-white/90">
            {t('system', 'swipeToUnlock')}
          </span>
        </motion.div>

        {/* Camera Shortcut button */}
        <button
          onClick={() => {
            unlockOS();
            launchApp('camera');
          }}
          className="w-11 h-11 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90"
          title="Câmera"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
