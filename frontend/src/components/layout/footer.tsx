import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Rentas</p>
            <p className="mt-2 max-w-xs text-sm text-gray-600">
              Your marketplace for rentals, visits, and conversations.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/listings" className="text-gray-600 hover:text-gray-900">
              Listings
            </Link>
            <Link href="/messages" className="text-gray-600 hover:text-gray-900">
              Messages
            </Link>
            <Link href="/visits" className="text-gray-600 hover:text-gray-900">
              Visits
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-8 text-center text-xs text-gray-500 sm:text-left">
          © {new Date().getFullYear()} Rentas. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
