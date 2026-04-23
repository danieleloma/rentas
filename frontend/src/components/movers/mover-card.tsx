'use client';

import Link from 'next/link';
import { Star, ShieldCheck, MapPin, Truck } from 'lucide-react';
import type { Mover } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MoverCardProps {
  mover: Mover;
}

export function MoverCard({ mover }: MoverCardProps) {
  const price = mover.hourlyRate
    ? `₦${mover.hourlyRate.toLocaleString()}/hr`
    : mover.fixedPrice
      ? `From ₦${mover.fixedPrice.toLocaleString()}`
      : 'Contact for price';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {mover.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mover.logoUrl} alt={mover.companyName} className="h-full w-full rounded-lg object-cover" />
            ) : (
              <Truck className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-foreground">{mover.companyName}</h3>
              {mover.isVerified && (
                <span title="Verified mover">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              {mover.rating != null && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {mover.rating.toFixed(1)}
                  {mover.reviewCount != null && (
                    <span className="text-muted-foreground"> ({mover.reviewCount})</span>
                  )}
                </span>
              )}
              <span className="text-xs font-medium text-foreground">{price}</span>
            </div>
          </div>
        </div>

        {/* Service areas */}
        {mover.serviceArea.length > 0 && (
          <div className="mt-3 flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{mover.serviceArea.slice(0, 3).join(' · ')}</p>
          </div>
        )}

        {/* Services */}
        {mover.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {mover.services.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
            ))}
            {mover.services.length > 3 && (
              <Badge variant="outline" className="text-[10px]">+{mover.services.length - 3} more</Badge>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4">
          <Link href={`/movers/${mover.id}`} className="block">
            <Button size="sm" className="w-full">View & Book</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
