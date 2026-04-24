'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Search } from 'lucide-react';
import { getMoversApi } from '@/lib/api/movers';
import { MoverCard } from '@/components/movers/mover-card';
import { Skeleton } from '@/components/ui/skeleton';

const CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
  'Enugu', 'Warri', 'Owerri', 'Kaduna', 'Ogun',
];

export default function MoversPage() {
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['movers', city],
    queryFn: () => getMoversApi(city || undefined),
  });

  const movers = data?.data ?? [];

  const filtered = search
    ? movers.filter((m) =>
        m.companyName.toLowerCase().includes(search.toLowerCase()) ||
        m.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : movers;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Moving Services</h1>
        </div>
        <p className="ml-12 text-sm text-muted-foreground">
          Find trusted, verified movers across Nigeria — compare prices and book in minutes.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movers or services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} mover{filtered.length !== 1 ? 's' : ''} found
          {city ? ` in ${city}` : ''}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No movers found</p>
          <p className="text-sm text-muted-foreground">Try a different city or search term.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mover) => (
            <MoverCard key={mover.id} mover={mover} />
          ))}
        </div>
      )}
    </div>
  );
}
