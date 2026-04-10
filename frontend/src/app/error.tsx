'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Something went wrong</h2>
      <p className="mt-2 max-w-md text-center text-sm text-gray-600 sm:text-base">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
