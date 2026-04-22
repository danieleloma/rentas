export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
