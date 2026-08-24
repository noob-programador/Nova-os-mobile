import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDriveDownload,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { BeforeInstallPromptEvent, isRunningStandalone, isIOS, isAndroid } from '../../utils/pwa';
import { sounds } from '../../utils/sound';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'android' | 'qr'>('auto');
  const [showCopiedUrl, setShowCopiedUrl] = useState(false);

  useEffect(() => {
    setIsInstalled(isRunningStandalone());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      sounds.playSuccess();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playTap();
    if (!deferredPrompt) {
      if (isIOS()) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        sounds.playSuccess();
      }
    } catch (err) {
      console.warn('[NovaOS PWA] Install error:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    sounds.playTap();
    navigator.clipboard.writeText(window.location.href);
    setShowCopiedUrl(true);
    setTimeout(() => setShowCopiedUrl(false), 2500);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=090d16&color=06b6d4`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <img src="/favicon.svg" alt="NovaOS Logo" className="w-full h-full rounded-[14px]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">Instalar NovaOS Mobile</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> PWA
              </span>
            </div>
            <p className="text-xs text-zinc-400">Instale como aplicativo nativo no seu smartphone</p>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-800 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'auto' ? 'bg-cyan-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Instalação Direta
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'android' ? 'bg-cyan-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'ios' ? 'bg-cyan-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            iPhone / iPad
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'qr' ? 'bg-cyan-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            QR Code
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isInstalled ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-emerald-200">NovaOS Já Instalado!</h3>
              <p className="text-xs text-emerald-300/80 mt-1">
                O aplicativo está operando em modo tela cheia standalone no seu dispositivo.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'auto' && (
                <div className="space-y-3">
                  <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3.5 space-y-2.5">
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Vantagens do PWA no Celular:
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pl-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Tela cheia imersiva sem barras do navegador</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Ícone nativo com inicialização instantânea</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Cache offline e persistência segura de dados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Jogos e utilitários 100% responsivos ao toque</span>
                      </li>
                    </ul>
                  </div>

                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isInstalling ? 'Instalando...' : 'Instalar Agora no Dispositivo'}</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 text-center">
                        Selecione seu sistema operacional para ver o passo a passo:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setActiveTab('android')}
                          className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 flex flex-col items-center justify-center text-center transition-all"
                        >
                          <Smartphone className="w-5 h-5 text-emerald-400 mb-1" />
                          <span className="text-xs font-semibold text-zinc-200">Android (Chrome)</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('ios')}
                          className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 flex flex-col items-center justify-center text-center transition-all"
                        >
                          <Share2 className="w-5 h-5 text-sky-400 mb-1" />
                          <span className="text-xs font-semibold text-zinc-200">iPhone / iOS (Safari)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl flex items-center space-x-2.5">
                    <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-300">Google Chrome / Edge no Android</span>
                      <p className="text-[11px] text-zinc-400">Instalação em 2 passos rápidos</p>
                    </div>
                  </div>

                  {deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar com 1 Clique</span>
                    </button>
                  )}

                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold text-[11px] shrink-0">
                        1
                      </span>
                      <span>
                        Abra o menu do Chrome tocando nos <strong>três pontinhos (⋮)</strong> no canto superior direito.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold text-[11px] shrink-0">
                        2
                      </span>
                      <span>
                        Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold text-[11px] shrink-0">
                        3
                      </span>
                      <span>
                        Confirme clicando em <strong>"Instalar"</strong>. O ícone do NovaOS aparecerá junto com seus outros apps!
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-3 text-xs text-zinc-300">
                  <div className="bg-sky-950/30 border border-sky-500/30 p-3 rounded-2xl flex items-center space-x-2.5">
                    <Share2 className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-sky-300">Safari no iPhone / iPad (iOS)</span>
                      <p className="text-[11px] text-zinc-400">Como adicionar à Tela de Início</p>
                    </div>
                  </div>

                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sky-400 font-bold text-[11px] shrink-0">
                        1
                      </span>
                      <span>
                        No Safari, toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima 
                        <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" />) na barra inferior.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sky-400 font-bold text-[11px] shrink-0">
                        2
                      </span>
                      <span>
                        Role a lista para baixo e toque em{' '}
                        <strong>"Adicionar à Tela de Início"</strong> (ícone{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sky-400 font-bold text-[11px] shrink-0">
                        3
                      </span>
                      <span>
                        Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'qr' && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-zinc-300">
                    Aponte a câmera do seu celular para abrir e instalar diretamente:
                  </p>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl inline-block shadow-inner mx-auto">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code NovaOS"
                      className="w-40 h-40 rounded-xl mx-auto"
                      onError={(e) => {
                        // Fallback if external QR API is unreachable
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <button
                      onClick={handleCopyLink}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{showCopiedUrl ? 'Link Copiado!' : 'Copiar Link do App'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Seguro & Gratuito
          </span>
          <span className="flex items-center gap-1">
            <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" /> Modo Offline Ativo
          </span>
        </div>
      </div>
    </div>
  );
};
