import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Play, MapPin, MessageSquare, Star, Calendar } from 'lucide-react';
import { FeaturedListingsSection } from '@/components/home/featured-listings-section';

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

// Mini UI preview components for each feature pillar
function TourPreview() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-800 flex items-center justify-center select-none">
      <Image
        src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60"
        alt="Virtual tour preview"
        fill
        className="object-cover opacity-60"
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur">
          <Play className="h-6 w-6 fill-white text-white ml-0.5" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">360° Tour</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        {['Living room', 'Kitchen', 'Bedroom'].map((room) => (
          <span key={room} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] text-white/80 backdrop-blur">
            {room}
          </span>
        ))}
      </div>
    </div>
  );
}

function MapPreview() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 select-none">
      {/* Stylised map base */}
      <div className="absolute inset-0 bg-[#e8e0d5]">
        <div className="absolute left-1/3 top-0 bottom-0 w-5 bg-[#f0e8dc]" />
        <div className="absolute top-2/5 left-0 right-0 h-4 bg-[#f0e8dc]" />
        <div className="absolute left-1/5 top-0 bottom-0 w-2 bg-[#d4c9bb]" />
      </div>
      {/* POI chips */}
      {[
        { label: 'Grocery', color: 'bg-green-700', x: '20%', y: '30%' },
        { label: 'School', color: 'bg-blue-700', x: '55%', y: '55%' },
        { label: 'Transit', color: 'bg-orange-600', x: '65%', y: '25%' },
        { label: 'Hospital', color: 'bg-red-700', x: '30%', y: '65%' },
      ].map(({ label, color, x, y }) => (
        <div key={label} className="absolute flex items-center gap-1" style={{ left: x, top: y }}>
          <div className={`h-2 w-2 rounded-full ${color}`} />
          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold text-stone-700 shadow-sm">{label}</span>
        </div>
      ))}
      {/* Listing pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 shadow-md">
            <MapPin className="h-4 w-4 fill-white text-white" />
          </div>
          <div className="h-2 w-0.5 bg-stone-900" />
        </div>
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="aspect-[4/3] w-full bg-white border border-stone-100 flex flex-col select-none overflow-hidden">
      <div className="border-b border-stone-100 px-4 py-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-stone-200" />
        <div>
          <div className="h-2.5 w-24 rounded bg-stone-200" />
          <div className="mt-1 h-2 w-16 rounded bg-stone-100" />
        </div>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-stone-900 px-3 py-2 text-[11px] text-white">
            Is it still available for next month?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-stone-100 px-3 py-2 text-[11px] text-stone-800">
            Yes! I&apos;d love to schedule a showing.
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-stone-900 px-3 py-2 text-[11px] text-white">
            Great, how about Thursday at 2pm?
          </div>
        </div>
      </div>
      <div className="border-t border-stone-100 flex items-center gap-2 px-4 py-2.5">
        <div className="flex-1 rounded-full bg-stone-50 border border-stone-200 px-3 py-1.5 text-[11px] text-stone-400">
          Type a message…
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900">
          <MessageSquare className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ReviewsPreview() {
  const stars = [5, 4, 5];
  return (
    <div className="aspect-[4/3] w-full bg-white border border-stone-100 p-5 flex flex-col justify-between select-none overflow-hidden">
      <div>
        <div className="flex items-end gap-2 mb-4">
          <p className="text-4xl font-light text-stone-900">4.8</p>
          <div className="mb-1">
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-stone-700 text-stone-700" />
              ))}
            </div>
            <p className="text-[11px] text-stone-400">24 verified reviews</p>
          </div>
        </div>
        <div className="space-y-3">
          {stars.map((rating, i) => (
            <div key={i} className="border-t border-stone-50 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-2 w-20 rounded bg-stone-100" />
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= rating ? 'fill-stone-600 text-stone-600' : 'text-stone-200'}`} />
                  ))}
                </div>
              </div>
              <div className="h-2 w-full rounded bg-stone-50" />
              <div className="mt-1 h-2 w-3/4 rounded bg-stone-50" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Calendar className="h-3.5 w-3.5 text-stone-400" />
        <span className="text-[11px] text-stone-400">Book a mover for your move-in date</span>
      </div>
    </div>
  );
}

const pillarPreviews = [TourPreview, MapPreview, ChatPreview, ReviewsPreview];

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

        <FeaturedListingsSection />

        <section
          id="platform"
          className="border-t border-stone-200 bg-white px-5 py-20 sm:px-8 sm:py-28"
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
              {pillars.map((item, i) => {
                const Preview = pillarPreviews[i];
                return (
                  <div
                    key={item.label}
                    className={`grid gap-10 md:grid-cols-2 md:items-center md:gap-16 ${
                      i % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''
                    }`}
                  >
                    <div className="overflow-hidden shadow-sm">
                      <Preview />
                    </div>
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
                );
              })}
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
            <Link href="/register" className="hover:text-stone-900">
              Create account
            </Link>
            <Link href="/login" className="hover:text-stone-900">
              Sign in
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
