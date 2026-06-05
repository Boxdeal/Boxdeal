"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-red-400" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-1 text-gray-500">An unexpected error occurred. Please try again.</p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-brand-500 px-6 py-3 font-bold text-white hover:bg-brand-600"
      >
        Try Again
      </button>
    </div>
  );
}
