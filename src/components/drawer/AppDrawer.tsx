import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, X, Grid, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppIcon } from '../home/AppIcon';
import { AppCategory } from '../../types';

export const AppDrawer: React.FC = () => {
  const { installedApps, isAppDrawerOpen, toggleAppDrawer, t } = useOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all');

  const categories: { id: AppCategory | 'all'; labelKey: string }[] = [
    { id: 'all', labelKey: 'all' },
    { id: 'productivity', labelKey: 'productivity' },
    { id: 'games', labelKey: 'games' },
    { id: 'utilities', labelKey: 'utilities' },
    { id: 'system', labelKey: 'system' },
  ];

  const filteredApps = useMemo(() => {
    return installedApps
      .filter((app) => {
        const appTitle = t('apps', app.titleKey) || app.defaultTitle;
        const matchesSearch =
          appTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const titleA = t('apps', a.titleKey) || a.defaultTitle;
        const titleB = t('apps', b.titleKey) || b.defaultTitle;
        return titleA.localeCompare(titleB);
      });
  }, [installedApps, searchTerm, selectedCategory, t]);

  if (!isAppDrawerOpen) return null;

  return (
    <motion.div
      id="app-drawer"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 z-40 bg-zinc-950/85 backdrop-blur-2xl text-white flex flex-col p-5 select-none overflow-hidden"
    >
      {/* Header & Search Bar */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold tracking-tight">{t('system', 'allApps')}</h2>
          </div>
          <button
            onClick={() => toggleAppDrawer(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Search input field */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="app-drawer-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('system', 'search')}
            className="w-full bg-white/10 border border-white/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400/80 transition-colors"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              {t('categories', cat.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin">
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-3 py-2">
            {filteredApps.map((app) => (
              <AppIcon key={app.id} app={app} size="md" showLabel={true} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400 space-y-2">
            <Sparkles className="w-8 h-8 text-zinc-600 animate-pulse" />
            <p className="text-xs">{t('system', 'noResults')}</p>
          </div>
        )}
      </div>

      {/* Bottom swipe indicator */}
      <div
        onClick={() => toggleAppDrawer(false)}
        className="w-full flex flex-col items-center justify-center pt-2 cursor-pointer"
      >
        <div className="w-24 h-1 bg-white/40 rounded-full" />
      </div>
    </motion.div>
  );
};
