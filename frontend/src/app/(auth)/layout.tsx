import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';

const features = [
  { icon: Building2, text: 'Browse thousands of verified listings' },
  { icon: MapPin, text: 'Explore neighborhoods before you move' },
  { icon: ShieldCheck, text: 'Secure messaging with landlords' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ── Left branding panel ─────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gray-900 p-12 lg:flex">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"
          alt=""
          fill
          className="object-cover opacity-25"
          unoptimized
        />

        {/* Content on top of image */}
        <div className="relative z-10">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Rentas
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              The rental marketplace
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-snug text-white">
              Find your next home,<br />faster than ever.
            </h2>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Rentas. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────── */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        {/* Mobile-only logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
            Rentas
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
