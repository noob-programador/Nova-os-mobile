import React, { useRef, useState } from 'react';
import {
  Palette,
  Image,
  Volume2,
  Globe,
  HardDrive,
  Info,
  Shield,
  RotateCcw,
  Sparkles,
  Check,
  Upload,
  Download,
  Users,
  Eye,
  Layout,
  Maximize2,
  Lock,
  Smartphone,
  Trash2,
  Activity,
} from 'lucide-react';
import { useOS, WALLPAPERS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import {
  AccentColor,
  IconShape,
  Language,
  ThemePreset,
  FontSize,
  ColorBlindMode,
  LiveWallpaperType,
  WindowMode,
  AppId,
} from '../../types';
import { THEME_PRESETS, ACCENT_PALETTES } from '../../utils/themes';
import { StorageManager } from '../../utils/storage';

export const SettingsApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    user,
    switchUserProfile,
    factoryReset,
    reboot,
    t,
    sendNotification,
  } = useOS();

  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const backupImportInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'accessibility' | 'parental' | 'storage' | 'users' | 'system'>('themes');

  const accentColors: AccentColor[] = ['cyan', 'blue', 'purple', 'emerald', 'rose', 'amber', 'indigo', 'fuchsia'];
  const storageInfo = StorageManager.getStorageEstimate();

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playTap();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateSettings({ customWallpaper: dataUrl, liveWallpaper: 'none' });
      sendNotification({
        appId: 'settings',
        title: 'Plano de Fundo Atualizado',
        message: 'Seu wallpaper personalizado foi aplicado com sucesso.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    sounds.playTap();
    const backupJson = StorageManager.exportFullSystem();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novaos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    sendNotification({
      appId: 'settings',
      title: 'Backup Exportado com Sucesso',
      message: 'O arquivo de configuração do NovaOS foi salvo.',
      priority: 'normal',
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const jsonStr = ev.target?.result as string;
      const res = StorageManager.importFullSystem(jsonStr);
      if (res.success) {
        alert(res.message);
        window.location.reload();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm(t('settings', 'factoryResetWarning'))) {
      factoryReset();
    }
  };

  const languages: { id: Language; label: string }[] = [
    { id: 'pt-BR', label: '🇧🇷 Português (Brasil)' },
    { id: 'pt-PT', label: '🇵🇹 Português (Portugal)' },
    { id: 'en-US', label: '🇺🇸 English (US)' },
    { id: 'en-UK', label: '🇬🇧 English (UK)' },
    { id: 'es-ES', label: '🇪🇸 Español' },
    { id: 'fr-FR', label: '🇫🇷 Français' },
    { id: 'de-DE', label: '🇩🇪 Deutsch' },
    { id: 'it-IT', label: '🇮🇹 Italiano' },
    { id: 'ja-JP', label: '🇯🇵 日本語' },
    { id: 'zh-CN', label: '🇨🇳 简体中文' },
    { id: 'ar-SA', label: '🇸🇦 العربية (RTL)' },
  ];

  return (
    <div id="settings-app" className="w-full h-full bg-zinc-950 text-white flex flex-col p-4 select-none overflow-y-auto scrollbar-thin space-y-5">
      <input
        type="file"
        ref={wallpaperInputRef}
        onChange={handleCustomWallpaperUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={backupImportInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-700 text-white">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">{t('apps', 'settings')}</h2>
            <p className="text-[11px] text-zinc-400">NovaOS Pro Nebula 3.5</p>
          </div>
        </div>

        {/* User Pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs">
          <span>{user.avatar}</span>
          <span className="font-semibold text-zinc-300 truncate max-w-[80px]">{user.name}</span>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'themes', label: 'Temas & Visual', icon: Palette },
          { id: 'accessibility', label: 'Acessibilidade', icon: Eye },
          { id: 'parental', label: 'Controle Parental', icon: Shield },
          { id: 'storage', label: 'Backup & Armazenamento', icon: HardDrive },
          { id: 'users', label: 'Perfis de Usuário', icon: Users },
          { id: 'system', label: 'Sistema & Idioma', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                setActiveTab(tab.id as any);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                isActive
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: THEMES & PERSONALIZATION
      ======================================================== */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          {/* Theme Presets */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>9 Presets de Temas do Sistema</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(Object.keys(THEME_PRESETS) as ThemePreset[]).filter(k => k !== 'custom').map((presetKey) => {
                const preset = THEME_PRESETS[presetKey];
                const isSelected = settings.theme === presetKey;
                return (
                  <button
                    key={presetKey}
                    onClick={() => {
                      sounds.playTap();
                      updateSettings({
                        theme: presetKey,
                        highContrast: presetKey === 'high-contrast',
                      });
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs text-left font-medium flex flex-col justify-between transition-all h-16 relative overflow-hidden ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-md'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                    }`}
                    style={{ background: preset.gradientBg }}
                  >
                    <span className="font-bold text-[11px] text-white drop-shadow truncate">{preset.name}</span>
                    <div className="flex space-x-1 mt-auto">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Palettes */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <label className="text-xs font-semibold text-zinc-300">{t('settings', 'accentColor')}</label>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {accentColors.map((colorKey) => {
                const item = ACCENT_PALETTES[colorKey];
                const isSelected = settings.accentColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    onClick={() => {
                      sounds.playTap();
                      updateSettings({ accentColor: colorKey });
                    }}
                    className={`py-2 px-2 rounded-xl border text-xs flex items-center space-x-2 transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-white font-bold text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${item.class}`} />
                    <span className="truncate text-[11px]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Wallpapers Canvas */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Live Wallpapers Interativos (Canvas)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { id: 'starfield', label: '🚀 Starfield 3D' },
                { id: 'matrix', label: '🟢 Matrix Rain' },
                { id: 'waves', label: '🌊 Quantum Waves' },
                { id: 'orbs', label: '🔮 Floating Orbs' },
                { id: 'none', label: '🚫 Nenhum (Estático)' },
              ].map((lw) => (
                <button
                  key={lw.id}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ liveWallpaper: lw.id as LiveWallpaperType });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                    settings.liveWallpaper === lw.id
                      ? 'bg-purple-500 text-white font-bold border-purple-400 shadow-md shadow-purple-500/20'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {lw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Static Wallpapers */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Image className="w-4 h-4" />
                <span>{t('settings', 'wallpapers')}</span>
              </div>
              <button
                onClick={() => wallpaperInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-indigo-300 flex items-center space-x-1 border border-zinc-700"
              >
                <Upload className="w-3 h-3" />
                <span>{t('settings', 'uploadWallpaper')}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ wallpaperId: wp.id, customWallpaper: undefined, liveWallpaper: 'none' });
                  }}
                  className={`h-16 rounded-xl border overflow-hidden relative group transition-all ${
                    settings.wallpaperId === wp.id && !settings.customWallpaper && settings.liveWallpaper === 'none'
                      ? 'ring-2 ring-cyan-400 scale-105 border-transparent shadow-lg'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                  style={{ background: wp.thumbnail }}
                >
                  <span className="absolute bottom-1 inset-x-1 text-[8px] font-medium text-white bg-black/60 backdrop-blur-sm rounded py-0.5 px-1 truncate">
                    {wp.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Shapes */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <label className="text-xs font-semibold text-zinc-300">{t('settings', 'iconShape')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['squircle', 'circle', 'rounded'] as IconShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ iconShape: shape });
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center transition-all ${
                    settings.iconShape === shape
                      ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {t('settings', shape)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ACCESSIBILITY (WCAG 2.1 AA)
      ======================================================== */}
      {activeTab === 'accessibility' && (
        <div className="space-y-4">
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Filtros de Visão e Daltonismo</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'none', label: 'Padrão (Sem Filtro)' },
                { id: 'protanopia', label: 'Protanopia (Vermelho)' },
                { id: 'deuteranopia', label: 'Deuteranopia (Verde)' },
                { id: 'tritanopia', label: 'Tritanopia (Azul)' },
                { id: 'monochrome', label: 'Monocromático (Escala de Cinza)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ colorBlindMode: f.id as ColorBlindMode });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                    settings.colorBlindMode === f.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scaling */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <label className="text-xs font-semibold text-zinc-300">Tamanho da Fonte da Interface</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'small', label: 'Pequena' },
                { id: 'medium', label: 'Padrão' },
                { id: 'large', label: 'Grande' },
                { id: 'xlarge', label: 'Extra G' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ fontSize: size.id as FontSize });
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                    settings.fontSize === size.id
                      ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion & High Contrast */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-200">Reduzir Animações (Reduce Motion)</p>
                <p className="text-[10px] text-zinc-400">Minimiza efeitos de transição para maior conforto visual</p>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({ reduceMotion: !settings.reduceMotion });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.reduceMotion ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.reduceMotion ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div>
                <p className="text-xs font-medium text-zinc-200">Modo Alto Contraste (WCAG 2.1 AA)</p>
                <p className="text-[10px] text-zinc-400">Contornos fortes e contraste otimizado</p>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({
                    highContrast: !settings.highContrast,
                    theme: !settings.highContrast ? 'high-contrast' : 'default',
                  });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.highContrast ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.highContrast ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PARENTAL CONTROLS & APP LOCK
      ======================================================== */}
      {activeTab === 'parental' && (
        <div className="space-y-4">
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Controle Parental Ativo</span>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({
                    parentalControl: {
                      ...settings.parentalControl,
                      enabled: !settings.parentalControl?.enabled,
                    },
                  });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.parentalControl?.enabled ? 'bg-rose-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.parentalControl?.enabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Bloqueie o acesso a aplicativos específicos ou restrinja o tempo diário de uso em dispositivos compartilhados com crianças.
            </p>

            {settings.parentalControl?.enabled && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-zinc-300">Selecione Aplicativos para Bloquear:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['terminal', 'settings', 'files', 'camera'] as AppId[]).map((appId) => {
                    const isLocked = settings.parentalControl?.lockedAppIds.includes(appId);
                    return (
                      <button
                        key={appId}
                        onClick={() => {
                          sounds.playTap();
                          const currentLocked = settings.parentalControl?.lockedAppIds || [];
                          const updated = isLocked
                            ? currentLocked.filter((id) => id !== appId)
                            : [...currentLocked, appId];
                          updateSettings({
                            parentalControl: {
                              ...settings.parentalControl,
                              lockedAppIds: updated,
                            },
                          });
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isLocked
                            ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-semibold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <span className="capitalize">{t('apps', appId)}</span>
                        {isLocked && <Lock className="w-3.5 h-3.5 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: STORAGE & BACKUP RESTORE
      ======================================================== */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <HardDrive className="w-4 h-4" />
              <span>Armazenamento do Sistema Virtual</span>
            </div>

            {/* Storage bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, storageInfo.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>{(storageInfo.usedBytes / 1024).toFixed(1)} KB Usados</span>
                <span>5.0 MB Limite Seguro</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                StorageManager.cleanUpCaches();
                sendNotification({
                  appId: 'settings',
                  title: 'Cache Limpo',
                  message: 'Caches temporários foram liberados com sucesso.',
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Limpar Caches Não-Críticos</span>
            </button>
          </div>

          {/* Backup & Restore Full System */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Backup e Restauração (.json)</h4>
            <p className="text-[11px] text-zinc-400">
              Exporte todos os seus arquivos, notas, configurações e dados do sistema para um arquivo seguro.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup</span>
              </button>

              <button
                onClick={() => backupImportInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: USERS & PROFILES
      ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Alternar Perfil de Usuário</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'owner' as const, name: 'Luis Developer', avatar: '👨‍💻', desc: 'Administrador' },
                { id: 'guest' as const, name: 'Convidado', avatar: '👤', desc: 'Sessão Temporária' },
                { id: 'kid' as const, name: 'Modo Infantil', avatar: '🧒', desc: 'Restrito & Seguro' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchUserProfile(p.id)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                    user.role === p.id
                      ? 'bg-sky-500/20 border-sky-400 shadow-md ring-1 ring-sky-400'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <p className="text-xs font-bold text-white truncate w-full">{p.name}</p>
                  <p className="text-[9px] text-zinc-400">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* User Stats Card */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 text-xs">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Estatísticas de Uso do Perfil</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-zinc-400 font-mono text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span>Apps Iniciados:</span>
                <p className="text-sm font-bold text-cyan-400">{user.stats?.appsLaunchedCount || 15}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span>Tempo em Tela:</span>
                <p className="text-sm font-bold text-purple-400">{user.stats?.screenTimeMinutes || 42} min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: SYSTEM & LANGUAGES
      ======================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          {/* Window Manager Mode */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Layout className="w-4 h-4" />
              <span>{t('settings', 'windowManager')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({ windowMode: 'fullscreen' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  settings.windowMode === 'fullscreen'
                    ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400 shadow-md'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Modo Smartphone</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({ windowMode: 'windowed' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  settings.windowMode === 'windowed'
                    ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400 shadow-md'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Janelas Flutuantes</span>
              </button>
            </div>
          </div>

          {/* 11 Languages */}
          <div className="space-y-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>{t('settings', 'language')} (11 Idiomas)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    sounds.playTap();
                    updateSettings({ language: lang.id });
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs text-left font-medium transition-all ${
                    settings.language === lang.id
                      ? 'bg-sky-500 text-zinc-950 font-bold border-sky-400 shadow-md'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Lighting */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Iluminação de Borda</span>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  updateSettings({ edgeLighting: !settings.edgeLighting });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.edgeLighting ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.edgeLighting ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                sendNotification({
                  appId: 'settings',
                  title: 'Edge Lighting Ativo 🌟',
                  message: 'Pulsando suavemente as bordas com iluminação ambiente.',
                  priority: 'high',
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testar Pulso de Notificação</span>
            </button>
          </div>

          {/* Reset & Reboot */}
          <div className="space-y-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 text-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>{t('settings', 'about')}</span>
            </div>

            <div className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Versão:</span>
                <span className="text-cyan-400">NovaOS Pro 3.5 Nebula</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Engine:</span>
                <span>React 19 + TypeScript + Motion</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={reboot}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
              >
                {t('system', 'reboot')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-colors"
              >
                {t('settings', 'factoryReset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
