import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileText, Music, Video } from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AssetPreview = ({ asset }) => {
  if (!asset) return null;

  if (asset.mimeType?.startsWith('image/')) {
    return (
      <img
        src={asset.url}
        alt={asset.filename}
        className="max-h-full max-w-full object-contain"
        draggable={false}
      />
    );
  }

  if (asset.mimeType?.startsWith('video/')) {
    return <video src={asset.url} controls className="max-h-full max-w-full" />;
  }

  if (asset.mimeType?.startsWith('audio/')) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Music size={64} className="text-white/20" />
        <audio src={asset.url} controls className="w-72" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <FileText size={64} className="text-white/20" />
      <p className="font-mono text-sm text-white/40 uppercase">Preview unavailable</p>
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 border border-white/30 font-mono text-xs text-white uppercase hover:bg-white hover:text-black transition-colors"
      >
        <Download size={14} />
        Open file
      </a>
    </div>
  );
};

export default function Lightbox({ assets, index, onClose, onNavigate }) {
  const asset = assets[index];
  const hasPrev = index > 0;
  const hasNext = index < assets.length - 1;

  const prev = useCallback(() => { if (hasPrev) onNavigate(index - 1); }, [hasPrev, index, onNavigate]);
  const next = useCallback(() => { if (hasNext) onNavigate(index + 1); }, [hasNext, index, onNavigate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/60">
        <div className="min-w-0 flex-1 mr-4">
          <p className="font-mono text-[10px] text-white/40 uppercase">
            {index + 1} / {assets.length}
          </p>
          <p className="font-mono text-xs text-white/80 truncate mt-0.5">{asset.filename}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {asset.size && (
            <span className="font-mono text-[10px] text-white/30 uppercase hidden sm:block">{formatBytes(asset.size)}</span>
          )}
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-white/50 hover:text-white transition-colors"
          >
            <Download size={18} />
          </a>
          {/* Explicit close button — large tap target for mobile */}
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Backdrop tap-to-close zone */}
      <button
        aria-label="Close lightbox"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{ zIndex: -1 }}
      />

      {/* Main preview */}
      <div className="flex-1 flex items-center justify-center relative px-14 min-h-0">
        <div onClick={e => e.stopPropagation()}>
          <AssetPreview asset={asset} />
        </div>

        {hasPrev && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {hasNext && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {assets.length > 1 && (
        <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto bg-black/60">
          {assets.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onNavigate(i)}
              className={`shrink-0 w-12 h-12 border-2 overflow-hidden transition-colors ${
                i === index ? 'border-[#FF4500]' : 'border-white/20 hover:border-white/50'
              }`}
            >
              {a.thumbnailUrl || a.mimeType?.startsWith('image/') ? (
                <img src={a.thumbnailUrl || a.url} alt={a.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  {a.mimeType?.startsWith('video/') ? <Video size={14} className="text-white/40" /> :
                   a.mimeType?.startsWith('audio/') ? <Music size={14} className="text-white/40" /> :
                   <FileText size={14} className="text-white/40" />}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
