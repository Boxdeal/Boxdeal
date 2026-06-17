"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useUI } from "@/store/hooks";
import { closeSearch } from "@/store/slices/uiSlice";
import { SearchBar } from "@/components/shared/SearchBar";
import { cn } from "@/lib/utils/helpers";

// Full-width search sheet for small screens. The header's mobile search
// button dispatches openSearch(); this is what actually renders for it.
export function SearchOverlay() {
  const dispatch = useAppDispatch();
  const { searchOpen } = useUI();

  function close() {
    dispatch(closeSearch());
  }

  // Close on Escape.
  useEffect(() => {
    if (!searchOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dispatch(closeSearch());
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, dispatch]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200 lg:hidden",
          searchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      {/* Top sheet */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[70] bg-white shadow-lg transition-transform duration-200 lg:hidden",
          searchOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <div className="min-w-0 flex-1">
            {/* Mount the input only while open so autoFocus fires each time. */}
            {searchOpen && <SearchBar autoFocus onClose={close} />}
          </div>
          <button
            onClick={close}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
