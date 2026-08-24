export type AppId =
  | 'calculator'
  | 'notepad'
  | 'files'
  | 'settings'
  | 'terminal'
  | 'camera'
  | 'gallery'
  | 'clock'
  | 'snake'
  | 'tetris'
  | 'pacman'
  | 'minesweeper'
  | 'chess'
  | 'tictactoe';

export type AppCategory = 'system' | 'productivity' | 'games' | 'utilities' | 'media';

export interface AppConfig {
  id: AppId;
  titleKey: string;
  defaultTitle: string;
  icon: string;
  category: AppCategory;
  color: string;
  gradient: string;
  badge?: number;
  isGame?: boolean;
}

export type ThemePreset =
  | 'default'
  | 'dark'
  | 'light'
  | 'amoled'
  | 'midnight'
  | 'forest'
  | 'sunset'
  | 'ocean'
  | 'mono'
  | 'high-contrast'
  | 'cyberpunk'
  | 'custom';

export type ThemeMode = 'light' | 'dark' | 'amoled';

export type LiveWallpaperType = 'none' | 'starfield' | 'matrix' | 'waves' | 'orbs';

export type IconShape = 'squircle' | 'circle' | 'rounded';
export type Language =
  | 'pt-BR'
  | 'pt-PT'
  | 'en-US'
  | 'en-UK'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'ja-JP'
  | 'zh-CN'
  | 'ar-SA';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'indigo' | 'fuchsia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
export type WindowMode = 'fullscreen' | 'windowed';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
}

export interface CustomThemeConfig {
  name: string;
  colors: ThemeColors;
  borderRadius: 'small' | 'medium' | 'large';
  shadows: 'none' | 'soft' | 'glow';
}

export interface Wallpaper {
  id: string;
  name: string;
  thumbnail: string;
  type: 'gradient' | 'image' | 'pattern' | 'live';
  value: string;
  css?: string;
  liveType?: LiveWallpaperType;
}

export interface UserStats {
  screenTimeMinutes: number;
  appsLaunchedCount: number;
  gamesPlayedCount: number;
  photosTakenCount: number;
  notesCreatedCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role?: 'owner' | 'guest' | 'kid';
  pinCode?: string;
  isGuest?: boolean;
  themeId?: ThemePreset;
  wallpaperId?: string;
  stats?: UserStats;
}

export interface ParentalControlSettings {
  enabled: boolean;
  lockedAppIds: AppId[];
  maxDailyMinutes: number;
  restrictedHoursStart?: number; // e.g. 22 (10pm)
  restrictedHoursEnd?: number; // e.g. 7 (7am)
}

export interface NotificationAction {
  id: string;
  label: string;
  actionAppId?: AppId;
}

export interface SystemNotification {
  id: string;
  appId: AppId;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  category?: 'system' | 'message' | 'app' | 'alert';
  icon?: string;
  actions?: NotificationAction[];
}

export type WidgetType =
  | 'weather'
  | 'calendar'
  | 'storage'
  | 'analogClock'
  | 'digitalClock'
  | 'stickyNotes'
  | 'systemStats'
  | 'musicPlayer'
  | 'pomodoro'
  | 'currencyConverter';

export interface WidgetItemConfig {
  id: string;
  type: WidgetType;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  order: number;
}

export interface SystemSettings {
  theme: ThemePreset;
  customTheme?: CustomThemeConfig;
  accentColor: AccentColor;
  wallpaperId: string;
  customWallpaper?: string;
  liveWallpaper: LiveWallpaperType;
  iconShape: IconShape;
  soundEnabled: boolean;
  soundVolume: number;
  hapticEnabled: boolean;
  language: Language;
  brightness: number; // 0 - 100
  volume: number; // 0 - 100
  wifi: boolean;
  bluetooth: boolean;
  airplaneMode: boolean;
  flashlight: boolean;
  dnd: boolean;
  autoRotate: boolean;
  batteryLevel: number;
  isCharging: boolean;
  pinLockEnabled: boolean;
  pinCode: string;
  edgeLighting: boolean;
  windowMode: WindowMode;
  fontSize: FontSize;
  colorBlindMode: ColorBlindMode;
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  parentalControl: ParentalControlSettings;
  widgets: WidgetItemConfig[];
}

export interface VirtualItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  mimeType?: string;
  favorite?: boolean;
  inTrash?: boolean;
  trashedAt?: number;
  originalParentId?: string | null;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  category?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  date: number;
  favorite?: boolean;
  filter?: string;
}

export interface WindowState {
  appId: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

export type BootState = 'booting' | 'locked' | 'unlocked';
export type DeviceViewMode = 'phone-frame' | 'fullscreen';

