"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/helpers";

/**
 * Month picker plus the two download buttons.
 *
 * The downloads go through fetch rather than a plain link because the endpoint
 * answers with either a file or a JSON error — a refusal on a link would
 * navigate the admin to raw JSON instead of showing them what went wrong.
 */
export function StatementControls({
  month,
  months,
  labels,
}: {
  month: string;
  months: string[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);

  async function download(format: "xlsx" | "pdf") {
    setBusy(format);
    try {
      const res = await fetch(`/api/admin/statement?month=${month}&format=${format}`);
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: null }));
        toast.error(error ?? "Could not build the statement. Please try again.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const fileName =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? `statement.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not build the statement. Please check your connection.");
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={month}
        onChange={(e) => router.push(`${pathname}?month=${e.target.value}`)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-400 focus:outline-none"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {labels[m] ?? m}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => download("xlsx")}
        disabled={busy !== null}
        className={cn(btn, "bg-brand-500 text-white hover:bg-brand-600")}
      >
        {busy === "xlsx" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        {busy === "xlsx" ? "Preparing…" : "Download Excel"}
      </button>

      <button
        type="button"
        onClick={() => download("pdf")}
        disabled={busy !== null}
        className={cn(btn, "border border-gray-200 text-gray-700 hover:bg-gray-50")}
      >
        {busy === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {busy === "pdf" ? "Preparing…" : "Download PDF"}
      </button>
    </div>
  );
}
