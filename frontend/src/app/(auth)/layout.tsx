import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MessageCircle, Star } from 'lucide-react';

const features = [
  { icon: ShieldCheck, text: 'Verified listings with fraud protection' },
  { icon: MessageCircle, text: 'Chat directly with landlords via WhatsApp' },
  { icon: Star, text: 'Honest tenant reviews — water, power, security' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-900 p-10 lg:flex">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"
          alt=""
          fill
          className="object-cover opacity-20"
          unoptimized
        />

        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="text-sm font-bold tracking-tight text-white">
            Rentas
          </Link>
          <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Nigeria&apos;s rental platform
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              Find your home,<br />without the stress.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              No fake listings. No agent wahala. Connect directly with verified landlords across Nigeria.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-zinc-600">
          © {new Date().getFullYear()} Rentas Ltd. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Link href="/" className="text-base font-bold tracking-tight text-foreground">
            Rentas
          </Link>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
