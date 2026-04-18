'use client';

import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { useAuthStore } from '@/store/authStore';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

export function BrowseHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className={`${sans.className} sticky top-0 z-20 border-b border-stone-200/90 bg-[#f7f6f4]/90 backdrop-blur-md`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900"
        >
          Rentas
        </Link>

        <nav className="flex items-center gap-8 text-[13px] font-medium text-stone-600">
          <Link href="/listings" className="text-stone-900 transition hover:text-stone-700">
            Listings
          </Link>
          {user ? (
            <Link
              href="/messages"
              className="transition hover:text-stone-900"
            >
              {user.firstName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-stone-900 underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
