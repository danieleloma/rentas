'use client';

import { X, Maximize2 } from 'lucide-react';
import { Manrope } from 'next/font/google';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

interface VirtualTourModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

  // Matterport — swap /show/ for /embed/
  if (url.includes('matterport.com')) {
    return url.includes('/embed/') ? url : url.replace('/show/', '/embed/');
  }

  // Raw 360° equirectangular image → Pannellum CDN viewer
  return `https://pannellum.org/api/viewer/?panorama=${encodeURIComponent(url)}&autoLoad=true&autoRotate=-2&showFullscreenCtrl=true`;
}

export function VirtualTourModal({ url, title, onClose }: VirtualTourModalProps) {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
        aria-label="Close tour"
      />

      <div className={`${sans.className} relative w-full max-w-5xl`}>
        {/* Header bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-3.5 w-3.5 text-stone-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              360° Virtual tour · {title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewer */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; autoplay"
            allowFullScreen
            title="Virtual tour"
          />
        </div>
      </div>
    </div>
  );
}
