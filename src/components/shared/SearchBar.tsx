"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Search for products…",
  className,
  onClose,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      onClose?.();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex items-center", className)}
    >
      <Search className="absolute left-3.5 h-4 w-4 text-brand-400 pointer-events-none" />

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-full border border-brand-200 bg-white py-2.5 pl-10 pr-9 text-sm shadow-sm placeholder:text-gray-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:shadow-md"
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
