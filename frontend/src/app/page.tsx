import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const pillars = [
  {
    label: 'Virtual tours',
    title: 'Walk the space before you step outside.',
    body: 'Panoramic tours, hotspots, and fullscreen viewing so you can feel the flow of a home from your phone or desktop.',
  },
  {
    label: 'Neighborhood intelligence',
    title: 'Context beyond the front door.',
    body: 'Maps with transit, schools, groceries, and care nearby—plus scores that summarize how the area fits daily life.',
  },
  {
    label: 'Visits & chat',
    title: 'Schedule, confirm, and keep talking.',
    body: 'Request tours, sync with landlords, and keep every question in one thread instead of scattered texts and emails.',
  },
  {
    label: 'Reviews & movers',
    title: 'Trust, then transition.',
    body: 'Read and leave tenant reviews, and book vetted moving help when you are ready to make the place yours.',
  },
];

const offerings = [
  { name: 'Smart search & filters', role: 'Listings' },
  { name: '360° tour viewer', role: 'Tours' },
  { name: 'In-app messaging', role: 'Connect' },
  { name: 'Calendar visits', role: 'Schedule' },
  { name: 'POI map layers', role: 'Explore' },
  { name: 'Mover marketplace', role: 'Move' },
];

export default function HomePage() {
  return (
    <div className={`${sans.className} min-h-screen bg-[#f7f6f4] text-stone-800 antialiased`}>
      <header className="sticky top-0 z-20 border-b border-stone-200/90 bg-[#f7f6f4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900"
          >
            Rentas
          </Link>
          <nav className="flex items-center gap-8 text-[13px] font-medium text-stone-600">
            <a href="#platform" className="transition hover:text-stone-900">
              Platform
            </a>
            <a href="#offerings" className="transition hover:text-stone-900">
              Offerings
            </a>
            <Link href="/listings" className="transition hover:text-stone-900">
              Listings
            </Link>
            <Link
              href="/login"
              className="text-stone-900 underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative min-h-[78vh] overflow-hidden px-5 pb-20 pt-16 sm:min-h-[82vh] sm:px-8 sm:pb-28 sm:pt-24 md:pt-32">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-stone-900/50"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-900/25 to-stone-950/70"
            aria-hidden
          />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-300">
              Rental marketplace
            </p>
            <h1
              className={`mt-8 text-[2.75rem] font-normal leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl ${display.className}`}
            >
              Find
              <br />
              <span className="text-stone-200">your next home</span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-stone-200/95 sm:text-base">
              Rentas connects renters and landlords with listings, virtual tours, neighborhood
              context, and tools to plan visits and moves—so the journey from search to keys stays
              clear and calm.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/listings"
                className="inline-flex min-w-[200px] items-center justify-center border border-white bg-white px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-100"
              >
                Browse homes
              </Link>
              <Link
                href="/register"
                className="inline-flex min-w-[200px] items-center justify-center border border-white/70 bg-transparent px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                List a property
              </Link>
            </div>
          </div>
        </section>

        <section id="intro" className="border-t border-stone-200 bg-white px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-500">
              Your search starts here
            </p>
            <p className="mt-8 text-lg leading-relaxed text-stone-600 sm:text-xl">
              Whether you are comparing neighborhoods or locking in a lease, Rentas keeps browsing,
              touring, and coordinating in one place—built for mobile-first renters and responsive
              landlords.
            </p>
          </div>
        </section>

        <section
          id="platform"
          className="border-t border-stone-200 bg-[#f7f6f4] px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-500">
              The platform
            </p>
            <h2
              className={`mt-4 max-w-2xl text-3xl font-normal leading-snug text-stone-900 sm:text-4xl md:text-[2.75rem] ${display.className}`}
            >
              Everything you need from first scroll to moving day.
            </h2>

            <div className="mt-16 space-y-24 md:space-y-32">
              {pillars.map((item, i) => (
                <div
                  key={item.label}
                  className={`grid gap-10 md:grid-cols-2 md:items-center md:gap-16 ${
                    i % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''
                  }`}
                >
                  <div
                    className="aspect-[4/3] w-full bg-stone-200 bg-[linear-gradient(135deg,rgba(168,162,158,0.35)_0%,transparent_50%,rgba(120,113,108,0.2)_100%)]"
                    aria-hidden
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-500">
                      {item.label}
                    </p>
                    <h3
                      className={`mt-4 text-2xl font-normal leading-snug text-stone-900 sm:text-3xl ${display.className}`}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-5 text-[15px] leading-relaxed text-stone-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="offerings"
          className="border-t border-stone-200 bg-white px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-500">
                  Capabilities
                </p>
                <h2
                  className={`mt-4 max-w-xl text-3xl font-normal leading-snug text-stone-900 sm:text-4xl ${display.className}`}
                >
                  Built for discovery—at your pace.
                </h2>
              </div>
              <p className="max-w-md text-[15px] leading-relaxed text-stone-600">
                Pick what matters first: refine listings, tour remotely, map the block, or line up
                movers. Each piece works alone or together.
              </p>
            </div>

            <ul className="mt-16 grid gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((o) => (
                <li
                  key={o.name}
                  className="flex flex-col justify-between bg-white p-8 transition hover:bg-[#fafaf9]"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                    {o.role}
                  </span>
                  <span
                    className={`mt-10 block text-xl font-normal text-stone-900 sm:text-2xl ${display.className}`}
                  >
                    {o.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-stone-900 px-5 py-20 text-center sm:px-8 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-400">
            Ready when you are
          </p>
          <h2
            className={`mx-auto mt-6 max-w-2xl text-3xl font-normal leading-snug text-[#f7f6f4] sm:text-4xl ${display.className}`}
          >
            Start with listings—or open your door to qualified renters.
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/listings"
              className="inline-flex min-w-[200px] items-center justify-center border border-[#f7f6f4] bg-[#f7f6f4] px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition hover:bg-white"
            >
              Explore listings
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center border border-stone-600 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f7f6f4] transition hover:border-[#f7f6f4]"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-[#f7f6f4] px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-900">
            Rentas
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-stone-600">
            <Link href="/listings" className="hover:text-stone-900">
              Listings
            </Link>
            <Link href="/messages" className="hover:text-stone-900">
              Messages
            </Link>
            <Link href="/visits" className="hover:text-stone-900">
              Visits
            </Link>
            <Link href="/profile" className="hover:text-stone-900">
              Profile
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-[12px] text-stone-500 sm:text-left">
          © {new Date().getFullYear()} Rentas. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
