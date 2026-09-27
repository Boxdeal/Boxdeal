"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/helpers";

/**
 * Pulls the order's tax invoice and saves it as a PDF.
 *
 * The invoice endpoint answers with either a PDF or a JSON error, so we can't
 * just point an <a download> at it — a refusal would navigate the user to raw
 * JSON. Fetching it lets us keep the error in a toast and hand the browser a
 * blob it will save under the invoice's own file name.
 */
export function InvoiceDownloadButton({
  orderId,
  label = "Download Invoice",
  variant = "solid",
  className,
}: {
  orderId: string;
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`);

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: null }));
        toast.error(error ?? "Could not generate the invoice. Please try again.");
        return;
      }

      const blob = await res.blob();
      // Prefer the file name the server chose, so the saved file carries the
      // real invoice number rather than the order's UUID.
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "invoice.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate the invoice. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
        variant === "solid"
          ? "bg-brand-500 text-white hover:bg-brand-600"
          : "border border-gray-200 text-gray-700 hover:bg-gray-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? "Preparing…" : label}
    </button>
  );
}
