// PWA helper and service worker registration

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('[NovaOS PWA] Service Worker registered with scope:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[NovaOS PWA] New update available.');
            }
          });
        }
      });
    } catch (error) {
      console.warn('[NovaOS PWA] Service Worker registration failed:', error);
    }
  }
};

export const isRunningStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isIOS = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export const isAndroid = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};
