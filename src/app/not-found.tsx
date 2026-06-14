import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <SearchX className="h-20 w-20 text-gray-300" />
      <div>
        <h1 className="text-6xl font-black text-gray-900">404</h1>
        <p className="mt-2 text-xl font-semibold text-gray-600">Page not found</p>
        <p className="mt-1 text-gray-400">
          The page you are looking for does not exist or was moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-brand-500 px-6 py-3 font-bold text-white hover:bg-brand-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
