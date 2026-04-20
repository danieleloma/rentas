import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck, MessageCircle, Star, Calendar, Truck,
  Zap, Droplets, Lock, MapPin, ArrowRight, CheckCircle,
} from 'lucide-react';
import { FeaturedListingsSection } from '@/components/home/featured-listings-section';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80';

const stats = [
  { value: '12K+', label: 'Verified listings' },
  { value: '₦0', label: 'Hidden fees' },
  { value: '24hrs', label: 'Fraud review' },
  { value: '4.8★', label: 'Avg. rating' },
];

const steps = [
  { num: '01', title: 'Search & filter', body: 'Browse by city, price, property type, and what matters — borehole, prepaid meter, parking.' },
  { num: '02', title: 'View & verify', body: 'See 360° virtual tours, read tenant reviews scored on water, power, security, and flood risk.' },
  { num: '03', title: 'Contact directly', body: 'Chat with the landlord in-app or tap to open WhatsApp. No agents. No commissions.' },
];

const features = [
  { icon: ShieldCheck, title: 'Verified listings', body: 'Every property goes through our verification process. Spot fakes before they spot you.', color: 'text-primary bg-primary/10' },
  { icon: MessageCircle, title: 'Direct landlord chat', body: 'Message landlords directly via in-app chat or WhatsApp. No middlemen, no inflated fees.', color: 'text-green-700 bg-green-50' },
  { icon: Star, title: 'Honest reviews', body: 'Tenant reviews scored on what actually matters in Nigeria — NEPA, borehole, security, noise.', color: 'text-amber-700 bg-amber-50' },
  { icon: Calendar, title: 'Visit scheduling', body: 'Book property inspections and sync with landlords — all within the platform.', color: 'text-blue-700 bg-blue-50' },
  { icon: Truck, title: 'Mover marketplace', body: 'Compare vetted moving companies and book the right one for your move-in day.', color: 'text-purple-700 bg-purple-50' },
  { icon: MapPin, title: 'Area intelligence', body: 'See proximity to markets, schools, hospitals, and bus stops before you commit.', color: 'text-rose-700 bg-rose-50' },
];

const reviewTags = [
  { icon: Droplets, label: 'Water supply', cls: 'text-blue-700 bg-blue-50' },
  { icon: Zap, label: 'Power (NEPA)', cls: 'text-amber-700 bg-amber-50' },
  { icon: Lock, label: 'Security', cls: 'text-primary bg-primary/10' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight">Rentas</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/listings" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">Listings</Link>
            <Link href="/movers" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">Movers</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground md:block transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — inset rounded card */}
        <section className="px-4 pt-5 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '480px' }}>
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1152px"
              />
              {/* bottom-left gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent" />

              {/* Floating trust chip — centre-top area */}
              <div className="absolute left-1/2 top-7 -translate-x-1/2 hidden sm:flex">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Verified listings · No agent fees · Anti-fraud protection
                </div>
              </div>

              {/* Text — bottom left */}
              <div className="absolute bottom-0 left-0 max-w-lg p-8 sm:p-12">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                  Find Your Home
                  <span className="block text-primary">Anywhere in Nigeria</span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Verified rentals in Lagos, Abuja, Port Harcourt and more.
                  Direct landlord contact — no middlemen, no wahala.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/listings"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Browse properties
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    List your property
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="px-6 py-5 text-center">
                  <p className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem statement */}
        <section className="border-b border-border px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tired of fake listings and agent wahala?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Rentas connects you directly with landlords. Every listing is rated by real tenants
              on what actually matters — water supply, power, security, and flood risk — so you know
              exactly what you&apos;re walking into.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {reviewTags.map(({ icon: Icon, label, cls }) => (
                <span key={label} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
              <span className="text-xs text-muted-foreground">+ noise, flood risk</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/20 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                From search to keys in 3 steps
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map(({ num, title, body }) => (
                <div key={num} className="relative rounded-lg border border-border bg-card p-6">
                  <span className="text-5xl font-bold text-border">{num}</span>
                  <h3 className="mt-4 text-base font-bold text-card-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured listings */}
        <FeaturedListingsSection />

        {/* Feature grid */}
        <section className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Everything in one place
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body, color }) => (
                <div key={title} className="rounded-lg border border-border bg-card p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-card-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Ready to find your next home?
            </h2>
            <p className="mt-3 text-base text-primary-foreground/80">
              It&apos;s free to search. Sign up to save listings, schedule visits, and chat with landlords.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/listings"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-white/90"
              >
                <CheckCircle className="h-4 w-4" />
                Browse for free
              </Link>
              <Link
                href="/register"
                className="inline-flex min-w-[180px] items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-foreground">Rentas</span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Nigeria&apos;s trusted rental platform</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <Link href="/listings" className="hover:text-foreground transition-colors">Listings</Link>
              <Link href="/movers" className="hover:text-foreground transition-colors">Movers</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">List a property</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Rentas Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
