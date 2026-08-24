import React, { useState, useEffect, useRef } from 'react';
import { Camera, SwitchCamera, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { GalleryPhoto } from '../../types';

export const CameraApp: React.FC = () => {
  const { sendNotification, launchApp } = useOS();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [filter, setFilter] = useState<'none' | 'mono' | 'vintage' | 'cyberpunk' | 'warm'>('none');
  const [flashAnim, setFlashAnim] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode }, audio: false })
        .then((s) => {
          localStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to simulated camera canvas
        });
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const getFilterStyle = () => {
    switch (filter) {
      case 'mono':
        return 'grayscale(100%) contrast(120%)';
      case 'vintage':
        return 'sepia(60%) contrast(110%) brightness(95%)';
      case 'cyberpunk':
        return 'hue-rotate(180deg) saturate(180%)';
      case 'warm':
        return 'sepia(30%) saturate(140%)';
      case 'none':
      default:
        return 'none';
    }
  };

  const handleCapture = () => {
    sounds.playCameraShutter();
    setFlashAnim(true);
    setTimeout(() => setFlashAnim(false), 200);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    canvas.width = 480;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = getFilterStyle();

    if (video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw simulated camera snapshot
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#3b0764');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NovaOS Camera Shot 📸', canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 20);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Save to gallery localStorage
    try {
      const existing: GalleryPhoto[] = JSON.parse(localStorage.getItem('novaos_gallery_v1') || '[]');
      const newPhoto: GalleryPhoto = {
        id: 'photo-' + Date.now(),
        url: dataUrl,
        name: `Foto_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.jpg`,
        date: Date.now(),
        filter,
      };
      localStorage.setItem('novaos_gallery_v1', JSON.stringify([newPhoto, ...existing]));
      sendNotification({
        appId: 'gallery',
        title: 'Foto Capturada',
        message: 'A foto foi salva na sua Galeria do NovaOS.',
      });
    } catch {}
  };

  return (
    <div id="camera-app" className="w-full h-full bg-black text-white flex flex-col justify-between p-4 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewfinder */}
      <div className="flex-1 relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Camera className="w-12 h-12 text-zinc-600 animate-pulse" />
            <p className="text-xs text-zinc-400">Visor de Câmera Virtual Ativo</p>
            <p className="text-[10px] text-zinc-500">Toque no botão do obturador para capturar.</p>
          </div>
        )}

        {/* Shutter Flash Animation */}
        {flashAnim && <div className="absolute inset-0 bg-white z-20 animate-fade-out" />}
      </div>

      {/* Filter Selector */}
      <div className="flex items-center justify-center space-x-2 py-3 overflow-x-auto">
        {(['none', 'mono', 'vintage', 'cyberpunk', 'warm'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              sounds.playTap();
              setFilter(f);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-pink-500 text-white font-bold shadow-md' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => launchApp('gallery')}
          className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Galeria"
        >
          <ImageIcon className="w-6 h-6" />
        </button>

        {/* Big Shutter Button */}
        <button
          onClick={handleCapture}
          className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition-transform shadow-xl"
        >
          <div className="w-full h-full rounded-full bg-white active:bg-zinc-300" />
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
          }}
          className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Inverter Câmera"
        >
          <SwitchCamera className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
