import { Landmark } from "lucide-react";
import { getCodRemittances, type CodRemittance } from "@/lib/shiprocket";
import { formatPrice, formatDate } from "@/lib/utils/format";

/** Payouts between two instants (inclusive); a Shiprocket outage must not break the page. */
export async function loadCodRemittances(
  start: Date, end: Date,
): Promise<{ rows: CodRemittance[]; error: string | null }> {
  try {
    const rows = await getCodRemittances(start, end);
    return { rows: rows.filter((r) => r.createdAt >= start.toISOString() && r.createdAt <= end.toISOString()), error: null };
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : "unknown error" };
  }
}

/** Sums a list of payouts; `pending` is anything Shiprocket has not settled yet. */
export function sumRemittances(rows: CodRemittance[]) {
  const t = { payouts: rows.length, codPayable: 0, deduction: 0, walletRecharge: 0, remitted: 0, pending: 0 };
  for (const r of rows) {
    t.codPayable += r.codPayable;
    t.deduction += r.deduction;
    t.walletRecharge += r.walletRecharge;
    if (r.settled) t.remitted += r.remitted;
    else t.pending += r.remitted;
  }
  return t;
}

/**
 * Shiprocket COD payouts for a period: what it collected for us, what it kept,
 * and what reached the bank. `codCollected` (optional) is our own figure for
 * COD delivered in the same period, shown alongside for comparison.
 */
export function CodRemittancePanel({
  rows, error, label, codCollected,
}: {
  rows: CodRemittance[];
  error?: string | null;
  label: string;
  codCollected?: number;
}) {
  const t = sumRemittances(rows);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Landmark className="h-4 w-4 text-gray-400" /> Shiprocket COD Remittance · {label}
      </p>
      <p className="mb-3 text-xs text-gray-400">
        COD cash Shiprocket sent to the bank in this period, by payout date. Live from Shiprocket.
      </p>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not load from Shiprocket: {error}
        </p>
      ) : (
        <>
          <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {codCollected !== undefined && (
              <Stat label="Our COD collected" value={formatPrice(codCollected)} note="COD delivered in this period" />
            )}
            <Stat label="COD in payouts" value={formatPrice(t.codPayable)} note={`${t.payouts} payout${t.payouts === 1 ? "" : "s"}`} />
            <Stat label="Shiprocket fee" value={`− ${formatPrice(t.deduction)}`} note="COD charges" />
            {t.walletRecharge > 0 && (
              <Stat label="Wallet recharge" value={`− ${formatPrice(t.walletRecharge)}`} note="kept for shipping" />
            )}
            <Stat label="Reached bank" value={formatPrice(t.remitted)} note="Remittance success" strong />
            {t.pending > 0 && (
              <Stat label="On the way" value={formatPrice(t.pending)} note="initiated, not in bank yet" />
            )}
          </dl>

          {rows.length === 0 ? (
            <p className="py-2 text-sm text-gray-400">No payouts in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-right font-medium">COD</th>
                    <th className="pb-2 text-right font-medium">Fee</th>
                    <th className="pb-2 text-right font-medium">Wallet</th>
                    <th className="pb-2 text-right font-medium">To bank</th>
                    <th className="pb-2 pl-4 text-left font-medium">UTR</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-50">
                      <td className="py-1.5 text-gray-700">{formatDate(r.createdAt)}</td>
                      <td className="py-1.5 text-right tabular-nums text-gray-700">{formatPrice(r.codPayable)}</td>
                      <td className="py-1.5 text-right tabular-nums text-gray-400">{formatPrice(r.deduction)}</td>
                      <td className="py-1.5 text-right tabular-nums text-gray-400">
                        {r.walletRecharge > 0 ? formatPrice(r.walletRecharge) : "—"}
                      </td>
                      <td className="py-1.5 text-right font-semibold tabular-nums text-gray-900">{formatPrice(r.remitted)}</td>
                      <td className="py-1.5 pl-4 font-mono text-xs text-gray-500">{r.utr ?? "—"}</td>
                      <td className="py-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.settled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.settled ? "In bank" : r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Stat({ label, value, note, strong }: { label: string; value: string; note: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`text-base tabular-nums ${strong ? "font-black text-green-700" : "font-bold text-gray-900"}`}>{value}</dd>
      <dd className="text-[11px] text-gray-400">{note}</dd>
    </div>
  );
}
