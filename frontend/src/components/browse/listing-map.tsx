'use client';

import { ExternalLink } from 'lucide-react';
import { Manrope } from 'next/font/google';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

interface ListingMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function ListingMap({ latitude, longitude, address }: ListingMapProps) {
  const d = 0.013;
  const bbox = `${longitude - d},${latitude - d},${longitude + d},${latitude + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const mapsHref = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className={sans.className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
        Location
      </p>
      <p className="mt-2 text-[14px] text-stone-500">{address}</p>
      <div className="mt-4 overflow-hidden border border-stone-200">
        <iframe
          title="Listing location"
          src={src}
          width="100%"
          height="300"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
        />
      </div>
      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400 transition hover:text-stone-800"
      >
        Open in maps
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
