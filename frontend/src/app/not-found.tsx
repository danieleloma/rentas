import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-center text-gray-600">This page could not be found.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Back to home
      </Link>
    </div>
  );
}
