import { BrowseAuthSync } from '@/components/browse/browse-auth-sync';
import { BrowseHeader } from '@/components/browse/browse-header';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-800 antialiased">
      <BrowseAuthSync />
      <BrowseHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {children}
      </main>
      <footer className="mt-16 border-t border-stone-200 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900">
            Rentas
          </p>
          <p className="text-[12px] text-stone-400">
            © {new Date().getFullYear()} Rentas
          </p>
        </div>
      </footer>
    </div>
  );
}
