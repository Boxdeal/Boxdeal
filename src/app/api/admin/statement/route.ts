import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMonthlyStatement } from "@/lib/statement/monthly";
import { statementToCsv } from "@/lib/statement/csv";
import { renderStatementPdf } from "@/lib/statement/pdf";

// The PDF renderer needs the Node runtime, and a statement must always be
// computed fresh — it is a financial report, never a cached snapshot.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { error: "Forbidden", status: 403 as const };
  return { ok: true as const };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const month = req.nextUrl.searchParams.get("month") ?? "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json(
      { error: "Pass a month as YYYY-MM, e.g. ?month=2026-09" },
      { status: 400 }
    );
  }

  const format = (req.nextUrl.searchParams.get("format") ?? "json").toLowerCase();
  const statement = await getMonthlyStatement(month);
  const base = `BoxDeal-Statement-${month}`;

  if (format === "csv") {
    return new NextResponse(statementToCsv(statement), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "pdf") {
    const pdf = await renderStatementPdf(statement);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${base}.pdf"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    });
  }

  // Default: the numbers themselves, for the on-screen preview.
  return NextResponse.json({ data: statement }, {
    headers: { "Cache-Control": "no-store" },
  });
}
