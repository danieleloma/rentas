'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Manrope } from 'next/font/google';
import type { ListingImage } from '@/types';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  virtualTourUrl?: string;
  onTourClick?: () => void;
}

export function ListingGallery({ images, title, virtualTourUrl, onTourClick }: ListingGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() =>
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() =>
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, close, prev, next]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] w-full bg-stone-200 bg-[linear-gradient(135deg,rgba(168,162,158,0.35)_0%,transparent_50%,rgba(120,113,108,0.2)_100%)]" />
    );
  }

  const hero = images[0];

  return (
    <>
      {/* ── Gallery ─────────────────────────────────────────────── */}
      <div className="relative">
        {/* Hero image */}
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative block w-full overflow-hidden bg-stone-100"
        >
          <Image
            src={hero.url}
            alt={title}
            width={1280}
            height={720}
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            unoptimized
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/0 transition duration-300 group-hover:bg-stone-900/20">
            <span className="scale-90 border border-white/80 bg-stone-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100">
              View photos
            </span>
          </div>
        </button>

        {/* Horizontal thumbnail strip */}
        {images.length > 1 && (
          <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`group relative shrink-0 overflow-hidden bg-stone-100 transition ${
                  idx === 0 ? 'ring-2 ring-stone-900 ring-offset-0' : ''
                }`}
                style={{ width: 120, height: 80 }}
              >
                <Image
                  src={img.thumbnailUrl ?? img.url}
                  alt={`${title} — photo ${idx + 1}`}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.06]"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Virtual tour button */}
        {virtualTourUrl && (
          <button
            type="button"
            onClick={onTourClick}
            className="absolute bottom-[calc(80px+1.5rem+0.5rem)] left-4 flex items-center gap-2 border border-white/80 bg-stone-900/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:bg-stone-900"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            360° Virtual tour
          </button>
        )}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div className={`${sans.className} fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-sm`}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[12px] font-medium text-stone-400">
              {lightboxIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="text-stone-400 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex flex-1 items-center justify-center px-16">
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 flex h-10 w-10 items-center justify-center text-stone-400 transition hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="relative h-full max-h-[70vh] w-full">
              <Image
                src={images[lightboxIndex].url}
                alt={`${title} — photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <button
              type="button"
              onClick={next}
              className="absolute right-4 flex h-10 w-10 items-center justify-center text-stone-400 transition hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex justify-center gap-1.5 overflow-x-auto px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`relative shrink-0 overflow-hidden transition ${
                  idx === lightboxIndex
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-stone-950'
                    : 'opacity-50 hover:opacity-80'
                }`}
                style={{ width: 72, height: 48 }}
              >
                <Image
                  src={img.thumbnailUrl ?? img.url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
