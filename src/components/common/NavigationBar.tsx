import React from 'react';
import { ChevronLeft, Circle, Square } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface NavigationBarProps {
  onBack?: () => void;
  show3Buttons?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ onBack, show3Buttons = false }) => {
  const { minimizeApp, toggleMultitasking, activeApp } = useOS();

  return (
    <nav
      id="navigation-bar"
      className="w-full h-8 flex items-center justify-center relative select-none z-40"
    >
      {show3Buttons || activeApp ? (
        <div className="w-full flex items-center justify-around px-8 py-1">
          {/* Back button */}
          <button
            id="nav-back-btn"
            onClick={onBack || minimizeApp}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Home button */}
          <button
            id="nav-home-btn"
            onClick={minimizeApp}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Home"
          >
            <Circle className="w-4 h-4" />
          </button>

          {/* Multitasking / Recents button */}
          <button
            id="nav-recents-btn"
            onClick={toggleMultitasking}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/80 hover:text-white"
            title="Multitasking"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Modern Gesture Home Pill */
        <div
          onClick={minimizeApp}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleMultitasking();
          }}
          className="group py-2 px-6 cursor-pointer"
          title="Click to go Home, Right-click or long-press for Multitasking"
        >
          <div className="w-32 h-1 bg-white/60 group-hover:bg-white/90 rounded-full transition-all group-active:w-28 group-active:h-1.5 shadow-sm" />
        </div>
      )}
    </nav>
  );
};
