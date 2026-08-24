import React from 'react';
import { useOS } from '../../context/OSContext';
import { AppIcon } from './AppIcon';
import { AppId } from '../../types';

export const Dock: React.FC = () => {
  const { installedApps } = useOS();

  // Favorite apps for the bottom dock
  const dockAppIds: AppId[] = ['terminal', 'notepad', 'files', 'settings', 'camera'];
  const dockApps = dockAppIds
    .map((id) => installedApps.find((app) => app.id === id))
    .filter(Boolean);

  return (
    <div id="home-dock" className="w-full px-4 pb-2 z-30 select-none">
      <div className="w-full max-w-sm mx-auto bg-white/15 dark:bg-black/35 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[28px] px-3 py-2.5 flex items-center justify-around shadow-2xl shadow-black/30">
        {dockApps.map((app) => (
          <AppIcon key={app!.id} app={app!} size="md" showLabel={false} />
        ))}
      </div>
    </div>
  );
};
