import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppConfig,
  AppId,
  BootState,
  DeviceViewMode,
  Language,
  SystemNotification,
  SystemSettings,
  UserProfile,
  Wallpaper,
  WidgetItemConfig,
  WindowState,
  ThemePreset,
  AccentColor,
} from '../types';
import { sounds } from '../utils/sound';
import { getTranslation } from '../i18n/translations';
import { vfs } from '../utils/fileSystem';
import { THEME_PRESETS } from '../utils/themes';

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'nebula-dark',
    name: 'Cosmic Nebula',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    value: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 45%, #3b0764 75%, #0f172a 100%)',
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #064e3b 0%, #0f766e 40%, #0369a1 100%)',
    value: 'linear-gradient(135deg, #022c22 0%, #064e3b 30%, #0f766e 65%, #0284c7 100%)',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #831843 0%, #c2410c 50%, #eab308 100%)',
    value: 'linear-gradient(135deg, #500724 0%, #831843 35%, #ea580c 75%, #f59e0b 100%)',
  },
  {
    id: 'deep-ocean',
    name: 'Pacific Abyss',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #082f49 0%, #0284c7 50%, #0e7490 100%)',
    value: 'linear-gradient(135deg, #030712 0%, #082f49 35%, #0369a1 70%, #0284c7 100%)',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Neon Matrix',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #18181b 0%, #831843 50%, #065f46 100%)',
    value: 'linear-gradient(135deg, #09090b 0%, #4c0519 40%, #1e1b4b 70%, #042f2e 100%)',
  },
  {
    id: 'minimal-light',
    name: 'Silk Pearl',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 40%, #cbd5e1 75%, #94a3b8 100%)',
  },
  {
    id: 'amoled-void',
    name: 'AMOLED Void',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #000000 0%, #09090b 100%)',
    value: 'radial-gradient(circle at 50% 40%, #18181b 0%, #09090b 50%, #000000 100%)',
  },
];

export const DEFAULT_WIDGETS: WidgetItemConfig[] = [
  { id: 'w-digital-clock', type: 'digitalClock', enabled: true, size: 'small', order: 0 },
  { id: 'w-weather', type: 'weather', enabled: true, size: 'medium', order: 1 },
  { id: 'w-calendar', type: 'calendar', enabled: true, size: 'medium', order: 2 },
  { id: 'w-music', type: 'musicPlayer', enabled: true, size: 'small', order: 3 },
  { id: 'w-system-stats', type: 'systemStats', enabled: true, size: 'small', order: 4 },
  { id: 'w-pomodoro', type: 'pomodoro', enabled: true, size: 'small', order: 5 },
  { id: 'w-sticky-notes', type: 'stickyNotes', enabled: true, size: 'small', order: 6 },
  { id: 'w-storage', type: 'storage', enabled: true, size: 'small', order: 7 },
  { id: 'w-analog-clock', type: 'analogClock', enabled: false, size: 'small', order: 8 },
  { id: 'w-currency', type: 'currencyConverter', enabled: false, size: 'small', order: 9 },
];

export const DEFAULT_APPS: AppConfig[] = [
  {
    id: 'calculator',
    titleKey: 'calculator',
    defaultTitle: 'Calculadora',
    icon: 'Calculator',
    category: 'utilities',
    color: '#f97316',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'notepad',
    titleKey: 'notepad',
    defaultTitle: 'Notas',
    icon: 'FileText',
    category: 'productivity',
    color: '#eab308',
    gradient: 'from-yellow-400 to-amber-500',
    badge: 2,
  },
  {
    id: 'files',
    titleKey: 'files',
    defaultTitle: 'Arquivos',
    icon: 'Folder',
    category: 'system',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'settings',
    titleKey: 'settings',
    defaultTitle: 'Ajustes',
    icon: 'Settings',
    category: 'system',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    id: 'terminal',
    titleKey: 'terminal',
    defaultTitle: 'Terminal',
    icon: 'Terminal',
    category: 'system',
    color: '#10b981',
    gradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'clock',
    titleKey: 'clock',
    defaultTitle: 'Relógio',
    icon: 'Clock',
    category: 'utilities',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'camera',
    titleKey: 'camera',
    defaultTitle: 'Câmera',
    icon: 'Camera',
    category: 'media',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'gallery',
    titleKey: 'gallery',
    defaultTitle: 'Galeria',
    icon: 'Image',
    category: 'media',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600',
  },
  // Games
  {
    id: 'snake',
    titleKey: 'snake',
    defaultTitle: 'Cobrinha',
    icon: 'Gamepad2',
    category: 'games',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-700',
    isGame: true,
  },
  {
    id: 'tetris',
    titleKey: 'tetris',
    defaultTitle: 'Tetris',
    icon: 'Blocks',
    category: 'games',
    color: '#a855f7',
    gradient: 'from-purple-500 to-pink-600',
    isGame: true,
  },
  {
    id: 'pacman',
    titleKey: 'pacman',
    defaultTitle: 'Pac-Man',
    icon: 'Ghost',
    category: 'games',
    color: '#eab308',
    gradient: 'from-amber-400 to-yellow-600',
    isGame: true,
  },
  {
    id: 'minesweeper',
    titleKey: 'minesweeper',
    defaultTitle: 'Campo Minado',
    icon: 'Bomb',
    category: 'games',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-700',
    isGame: true,
  },
  {
    id: 'chess',
    titleKey: 'chess',
    defaultTitle: 'Xadrez',
    icon: 'Crown',
    category: 'games',
    color: '#6366f1',
    gradient: 'from-indigo-600 to-violet-800',
    isGame: true,
  },
  {
    id: 'tictactoe',
    titleKey: 'tictactoe',
    defaultTitle: 'Jogo da Velha',
    icon: 'Sparkles',
    category: 'games',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-cyan-700',
    isGame: true,
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  theme: 'default',
  accentColor: 'cyan',
  wallpaperId: 'nebula-dark',
  liveWallpaper: 'none',
  iconShape: 'squircle',
  soundEnabled: true,
  soundVolume: 75,
  hapticEnabled: true,
  language: 'pt-BR',
  brightness: 90,
  volume: 75,
  wifi: true,
  bluetooth: true,
  airplaneMode: false,
  flashlight: false,
  dnd: false,
  autoRotate: true,
  batteryLevel: 88,
  isCharging: false,
  pinLockEnabled: false,
  pinCode: '1234',
  edgeLighting: true,
  windowMode: 'fullscreen',
  fontSize: 'medium',
  colorBlindMode: 'none',
  reduceMotion: false,
  highContrast: false,
  screenReader: false,
  parentalControl: {
    enabled: false,
    lockedAppIds: [],
    maxDailyMinutes: 120,
  },
  widgets: DEFAULT_WIDGETS,
};

const INITIAL_USER: UserProfile = {
  id: 'usr-primary',
  name: 'Luis Developer',
  avatar: '👨‍💻',
  role: 'owner',
  isGuest: false,
  stats: {
    screenTimeMinutes: 42,
    appsLaunchedCount: 15,
    gamesPlayedCount: 8,
    photosTakenCount: 3,
    notesCreatedCount: 2,
  },
};

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    appId: 'notepad',
    title: 'NovaOS 3.5 Pro Ready',
    message: 'Sistema atualizado com Widgets Dinâmicos, Temas Avançados e Modo Janelas.',
    timestamp: Date.now() - 60000 * 5,
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-2',
    appId: 'settings',
    title: 'Dica de Personalização',
    message: 'Toque em Ajustes para alterar planos de fundo, temas e idioma (11 idiomas suportados).',
    timestamp: Date.now() - 60000 * 20,
    read: false,
    priority: 'normal',
  },
];

interface OSContextType {
  bootState: BootState;
  settings: SystemSettings;
  user: UserProfile;
  activeApp: AppId | null;
  openApps: AppId[];
  isMultitaskingOpen: boolean;
  isNotificationCenterOpen: boolean;
  isAppDrawerOpen: boolean;
  notifications: SystemNotification[];
  homePage: number;
  deviceViewMode: DeviceViewMode;
  installedApps: AppConfig[];
  windows: WindowState[];
  launchApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  closeAllApps: () => void;
  minimizeApp: () => void;
  toggleMultitasking: () => void;
  toggleNotificationCenter: (force?: boolean) => void;
  toggleAppDrawer: (force?: boolean) => void;
  unlockOS: () => void;
  lockOS: () => void;
  reboot: () => void;
  sendNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  triggerEdgeLighting: () => void;
  lastNotificationTrigger: number;
  activeToastNotification: SystemNotification | null;
  dismissToast: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  setHomePage: (page: number) => void;
  setDeviceViewMode: (mode: DeviceViewMode) => void;
  factoryReset: () => void;
  t: (section: any, key: string) => string;
  getActiveWallpaper: () => string;
  bringWindowToFront: (appId: AppId) => void;
  updateWindowState: (appId: AppId, partial: Partial<WindowState>) => void;
  switchUserProfile: (role: 'owner' | 'guest' | 'kid') => void;
}

const OSContext = createContext<OSContextType | null>(null);

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('novaos_settings_v1');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('novaos_user_v1');
      return saved ? { ...INITIAL_USER, ...JSON.parse(saved) } : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('novaos_notifs_v1');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [openApps, setOpenApps] = useState<AppId[]>([]);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [isMultitaskingOpen, setIsMultitaskingOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [homePage, setHomePage] = useState(0);
  const [deviceViewMode, setDeviceViewMode] = useState<DeviceViewMode>('phone-frame');
  const [installedApps] = useState<AppConfig[]>(DEFAULT_APPS);
  const [lastNotificationTrigger, setLastNotificationTrigger] = useState<number>(0);
  const [activeToastNotification, setActiveToastNotification] = useState<SystemNotification | null>(null);

  const dismissToast = useCallback(() => {
    setActiveToastNotification(null);
  }, []);

  const triggerEdgeLighting = useCallback(() => {
    setLastNotificationTrigger(Date.now());
  }, []);

  // Sync settings to localStorage and sound engine
  useEffect(() => {
    try {
      localStorage.setItem('novaos_settings_v1', JSON.stringify(settings));
    } catch {}
    sounds.setEnabled(settings.soundEnabled);
    sounds.setVolume(settings.volume);
  }, [settings]);

  // Sync user
  useEffect(() => {
    try {
      localStorage.setItem('novaos_user_v1', JSON.stringify(user));
    } catch {}
  }, [user]);

  // Sync notifications
  useEffect(() => {
    try {
      localStorage.setItem('novaos_notifs_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Battery simulation if available in browser
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setSettings((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          isCharging: battery.charging,
        }));

        const updateBattery = () => {
          setSettings((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateUser = useCallback((partial: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  const bringWindowToFront = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const maxZ = prev.reduce((m, w) => Math.max(m, w.zIndex), 10);
      return prev.map((w) => (w.appId === appId ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  const updateWindowState = useCallback((appId: AppId, partial: Partial<WindowState>) => {
    setWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, ...partial } : w))
    );
  }, []);

  const launchApp = useCallback(
    (id: AppId) => {
      // Check parental control lock
      if (settings.parentalControl?.enabled && settings.parentalControl.lockedAppIds.includes(id)) {
        sounds.playGameBeep('die');
        sendNotification({
          appId: 'settings',
          title: 'Bloqueio Parental',
          message: 'Este aplicativo está bloqueado pelas configurações de controle parental.',
          priority: 'high',
        });
        return;
      }

      sounds.playAppOpen();
      setActiveApp(id);
      setIsMultitaskingOpen(false);
      setIsAppDrawerOpen(false);
      setIsNotificationCenterOpen(false);

      setOpenApps((prev) => {
        if (!prev.includes(id)) {
          return [id, ...prev];
        }
        return [id, ...prev.filter((item) => item !== id)];
      });

      // Update Window State if in window mode
      setWindows((prev) => {
        const existing = prev.find((w) => w.appId === id);
        const maxZ = prev.reduce((m, w) => Math.max(m, w.zIndex), 10);
        if (existing) {
          return prev.map((w) => (w.appId === id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w));
        }
        const offset = (prev.length % 5) * 20;
        return [
          ...prev,
          {
            appId: id,
            x: 20 + offset,
            y: 50 + offset,
            width: 320,
            height: 480,
            minimized: false,
            maximized: false,
            zIndex: maxZ + 1,
          },
        ];
      });

      // Track usage stats
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats!,
          appsLaunchedCount: (prev.stats?.appsLaunchedCount || 0) + 1,
        },
      }));
    },
    [settings.parentalControl]
  );

  const closeApp = useCallback((id: AppId) => {
    sounds.playTap();
    setOpenApps((prev) => prev.filter((item) => item !== id));
    setWindows((prev) => prev.filter((w) => w.appId !== id));
    setActiveApp((current) => (current === id ? null : current));
  }, []);

  const closeAllApps = useCallback(() => {
    sounds.playTap();
    setOpenApps([]);
    setWindows([]);
    setActiveApp(null);
    setIsMultitaskingOpen(false);
  }, []);

  const minimizeApp = useCallback(() => {
    sounds.playTap();
    setActiveApp(null);
    setIsMultitaskingOpen(false);
    setIsAppDrawerOpen(false);
  }, []);

  const toggleMultitasking = useCallback(() => {
    sounds.playTap();
    setIsMultitaskingOpen((prev) => !prev);
    setIsAppDrawerOpen(false);
    setIsNotificationCenterOpen(false);
  }, []);

  const toggleNotificationCenter = useCallback((force?: boolean) => {
    sounds.playTap();
    setIsNotificationCenterOpen((prev) => (typeof force === 'boolean' ? force : !prev));
    if (!force) {
      setIsAppDrawerOpen(false);
    }
  }, []);

  const toggleAppDrawer = useCallback((force?: boolean) => {
    sounds.playTap();
    setIsAppDrawerOpen((prev) => (typeof force === 'boolean' ? force : !prev));
    if (!force) {
      setIsNotificationCenterOpen(false);
    }
  }, []);

  const unlockOS = useCallback(() => {
    sounds.playUnlock();
    setBootState('unlocked');
  }, []);

  const lockOS = useCallback(() => {
    sounds.playLock();
    setActiveApp(null);
    setIsMultitaskingOpen(false);
    setIsNotificationCenterOpen(false);
    setIsAppDrawerOpen(false);
    setBootState('locked');
  }, []);

  const reboot = useCallback(() => {
    sounds.playLock();
    setActiveApp(null);
    setOpenApps([]);
    setWindows([]);
    setIsMultitaskingOpen(false);
    setIsNotificationCenterOpen(false);
    setIsAppDrawerOpen(false);
    setBootState('booting');
  }, []);

  const sendNotification = useCallback(
    (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
      if (settings.dnd) return;
      sounds.playNotification();
      const newNotif: SystemNotification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        read: false,
        ...notif,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setLastNotificationTrigger(Date.now());
      setActiveToastNotification(newNotif);
    },
    [settings.dnd]
  );

  const dismissNotification = useCallback((id: string) => {
    sounds.playTap();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    sounds.playTap();
    setNotifications([]);
  }, []);

  const switchUserProfile = useCallback((role: 'owner' | 'guest' | 'kid') => {
    sounds.playTap();
    if (role === 'guest') {
      setUser({
        id: 'usr-guest',
        name: 'Convidado',
        avatar: '👤',
        role: 'guest',
        isGuest: true,
      });
    } else if (role === 'kid') {
      setUser({
        id: 'usr-kid',
        name: 'Modo Infantil',
        avatar: '🧒',
        role: 'kid',
        isGuest: false,
      });
      setSettings((prev) => ({
        ...prev,
        parentalControl: {
          ...prev.parentalControl,
          enabled: true,
          lockedAppIds: ['terminal', 'settings'],
        },
      }));
    } else {
      setUser(INITIAL_USER);
    }
  }, []);

  const factoryReset = useCallback(() => {
    sounds.playLock();
    localStorage.removeItem('novaos_settings_v1');
    localStorage.removeItem('novaos_user_v1');
    localStorage.removeItem('novaos_notifs_v1');
    localStorage.removeItem('novaos_virtual_fs_v1');
    localStorage.removeItem('novaos_notes_v1');
    localStorage.removeItem('novaos_calc_history_v1');
    localStorage.removeItem('novaos_snake_hs');
    localStorage.removeItem('novaos_tetris_hs');
    localStorage.removeItem('novaos_pacman_hs');
    vfs.resetToDefault();
    setSettings(INITIAL_SETTINGS);
    setUser(INITIAL_USER);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveApp(null);
    setOpenApps([]);
    setWindows([]);
    setBootState('booting');
  }, []);

  const t = useCallback(
    (section: any, key: string): string => {
      return getTranslation(settings.language, section, key);
    },
    [settings.language]
  );

  const getActiveWallpaper = useCallback(() => {
    if (settings.customWallpaper) {
      return `url("${settings.customWallpaper}") center/cover no-repeat`;
    }
    const found = WALLPAPERS.find((w) => w.id === settings.wallpaperId);
    return found ? found.value : WALLPAPERS[0].value;
  }, [settings.customWallpaper, settings.wallpaperId]);

  return (
    <OSContext.Provider
      value={{
        bootState,
        settings,
        user,
        activeApp,
        openApps,
        windows,
        isMultitaskingOpen,
        isNotificationCenterOpen,
        isAppDrawerOpen,
        notifications,
        homePage,
        deviceViewMode,
        installedApps,
        launchApp,
        closeApp,
        closeAllApps,
        minimizeApp,
        toggleMultitasking,
        toggleNotificationCenter,
        toggleAppDrawer,
        unlockOS,
        lockOS,
        reboot,
        sendNotification,
        triggerEdgeLighting,
        lastNotificationTrigger,
        activeToastNotification,
        dismissToast,
        dismissNotification,
        clearAllNotifications,
        updateSettings,
        updateUser,
        setHomePage,
        setDeviceViewMode,
        factoryReset,
        t,
        getActiveWallpaper,
        bringWindowToFront,
        updateWindowState,
        switchUserProfile,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
