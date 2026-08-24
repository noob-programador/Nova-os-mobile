import React from 'react';
import {
  Calculator,
  FileText,
  Folder,
  Settings,
  Terminal,
  Clock,
  Camera,
  Image,
  Gamepad2,
  Blocks,
  Ghost,
  Bomb,
  Crown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { AppConfig } from '../../types';
import { useOS } from '../../context/OSContext';

interface AppIconProps {
  app: AppConfig;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const getIconComponent = (iconName: string, className: string = 'w-6 h-6') => {
  switch (iconName) {
    case 'Calculator':
      return <Calculator className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Folder':
      return <Folder className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    case 'Terminal':
      return <Terminal className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Image':
      return <Image className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Blocks':
      return <Blocks className={className} />;
    case 'Ghost':
      return <Ghost className={className} />;
    case 'Bomb':
      return <Bomb className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export const AppIcon: React.FC<AppIconProps> = ({
  app,
  size = 'md',
  showLabel = true,
  onContextMenu,
}) => {
  const { launchApp, settings, t } = useOS();

  const getShapeClass = () => {
    switch (settings.iconShape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-xl';
      case 'squircle':
      default:
        return 'rounded-[20px]';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 text-xs';
      case 'lg':
        return 'w-16 h-16 text-base';
      case 'md':
      default:
        return 'w-14 h-14 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-7 h-7';
    }
  };

  const appTitle = t('apps', app.titleKey) || app.defaultTitle;

  return (
    <button
      id={`app-icon-${app.id}`}
      onClick={() => launchApp(app.id)}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          onContextMenu(e);
        }
      }}
      className="flex flex-col items-center justify-start space-y-1.5 focus:outline-none group transition-transform active:scale-90"
      title={appTitle}
    >
      <div className="relative">
        <div
          className={`${getSizeClass()} ${getShapeClass()} bg-gradient-to-tr ${
            app.gradient
          } flex items-center justify-center text-white shadow-md shadow-black/25 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg border border-white/20`}
        >
          {getIconComponent(app.icon, getIconSize())}
        </div>

        {/* Unread badge */}
        {app.badge && app.badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-sm animate-pulse">
            {app.badge}
          </span>
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-medium text-white drop-shadow-md text-center max-w-[68px] truncate leading-tight tracking-tight">
          {appTitle}
        </span>
      )}
    </button>
  );
};
