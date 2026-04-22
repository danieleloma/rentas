import { BrowseAuthSync } from '@/components/browse/browse-auth-sync';
import { BrowseHeader } from '@/components/browse/browse-header';
import Link from 'next/link';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrowseAuthSync />
      <BrowseHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer className="mt-12 border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">Rentas</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/listings" className="hover:text-foreground transition-colors">Listings</Link>
            <Link href="/movers" className="hover:text-foreground transition-colors">Movers</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">List property</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Rentas Ltd
          </p>
        </div>
      </footer>
    </div>
  );
}
