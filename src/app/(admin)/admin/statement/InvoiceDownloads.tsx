"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { downloadFromApi } from "./download";

/**
 * The month's invoices as one PDF: the issued ones, and drafts of the online
 * orders that are paid but not delivered (so not invoiced) yet.
 */
export function InvoiceDownloads({
  month, issued, pending,
}: {
  month: string;
  issued: number;
  pending: number;
}) {
  const [busy, setBusy] = useState<"issued" | "pending" | null>(null);

  async function download(kind: "issued" | "pending") {
    setBusy(kind);
    await downloadFromApi(`/api/admin/statement/invoices?month=${month}&kind=${kind}`, `invoices-${month}.pdf`);
    setBusy(null);
  }

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => download("issued")}
        disabled={busy !== null || issued === 0}
        className={cn(btn, "bg-brand-500 text-white hover:bg-brand-600")}
      >
        {busy === "issued" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {busy === "issued" ? "Preparing…" : `Download ${issued} invoice${issued === 1 ? "" : "s"}`}
      </button>

      {pending > 0 && (
        <button
          type="button"
          onClick={() => download("pending")}
          disabled={busy !== null}
          title="Online orders paid this month but not delivered yet. Printed as DRAFT with no invoice number — the real invoice is issued on delivery."
          className={cn(btn, "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100")}
        >
          {busy === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {busy === "pending" ? "Preparing…" : `Download ${pending} upcoming (draft)`}
        </button>
      )}
    </div>
  );
}
