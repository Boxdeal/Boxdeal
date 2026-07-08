"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

// Ye errors tab aate hain jab page purana JS chunk load karne ki koshish karta
// hai jo naye deploy ke baad server par exist nahi karta (version skew). Inhe
// ek clean reload theek kar deta hai — user ko error dikhane ki zaroorat nahi.
const CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
];

const RELOAD_GUARD_KEY = "bd-chunk-reload-at";

function isChunkError(error: Error): boolean {
  const haystack = `${error?.name ?? ""} ${error?.message ?? ""}`;
  return CHUNK_ERROR_PATTERNS.some((p) => haystack.includes(p));
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Jab tak decide na ho jaaye ki reload karna hai ya UI dikhana hai, kuch mat
  // dikhao — warna chunk error par bhi ek pal ke liye flash ho jaata.
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    console.error(error);

    if (isChunkError(error) && typeof window !== "undefined") {
      // Loop se bachne ke liye: agar abhi-abhi (10s ke andar) reload kar chuke
      // hain to dobara reload mat karo — tab asli error UI dikhao.
      let lastReload = 0;
      try {
        lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY)) || 0;
      } catch {
        // sessionStorage unavailable (private mode etc.) — reload skip karke UI dikha do
      }

      if (Date.now() - lastReload > 10000) {
        try {
          sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        window.location.reload();
        return;
      }
    }

    setShowFallback(true);
  }, [error]);

  if (!showFallback) return null;

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
