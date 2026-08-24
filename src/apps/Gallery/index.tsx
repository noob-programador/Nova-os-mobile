import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Download, Wallpaper, Heart, X } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { sounds } from '../../utils/sound';
import { GalleryPhoto } from '../../types';

export const GalleryApp: React.FC = () => {
  const { updateSettings, sendNotification, t } = useOS();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('novaos_gallery_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('novaos_gallery_v1', JSON.stringify(photos));
    } catch {}
  }, [photos]);

  const handleDelete = (id: string) => {
    sounds.playTap();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  const handleSetAsWallpaper = (photo: GalleryPhoto) => {
    sounds.playUnlock();
    updateSettings({ customWallpaper: photo.url });
    sendNotification({
      appId: 'settings',
      title: 'Plano de Fundo Atualizado',
      message: 'Foto definida como wallpaper do sistema.',
    });
    setSelectedPhoto(null);
  };

  return (
    <div id="gallery-app" className="w-full h-full bg-zinc-950 text-white flex flex-col p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold tracking-tight">{t('apps', 'gallery')}</h2>
        </div>
        <span className="text-xs text-zinc-400 font-mono">{photos.length} fotos</span>
      </div>

      {/* Grid of photos */}
      <div className="flex-1 overflow-y-auto my-3 scrollbar-thin">
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedPhoto(photo);
                }}
                className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 relative group cursor-pointer hover:border-purple-400 transition-colors"
              >
                <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 text-zinc-500 space-y-2">
            <ImageIcon className="w-10 h-10 opacity-30" />
            <p className="text-xs">Nenhuma foto na galeria.</p>
            <p className="text-[10px]">Tire fotos com o app Câmera para vê-las aqui.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono truncate max-w-[200px]">{selectedPhoto.name}</span>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-1 rounded-full bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-around py-2 border-t border-zinc-800 bg-zinc-900/60 rounded-2xl">
            <button
              onClick={() => handleSetAsWallpaper(selectedPhoto)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              <Wallpaper className="w-4 h-4" />
              <span>Definir Wallpaper</span>
            </button>
            <button
              onClick={() => handleDelete(selectedPhoto.id)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
