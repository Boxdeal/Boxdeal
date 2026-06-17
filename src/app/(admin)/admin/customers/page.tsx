import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { CustomersTable, type CustomerRow } from "@/components/admin/CustomersTable";

export const metadata: Metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage() {
  const admin = getSupabaseAdminClient();

  const [{ data: profiles }, { data: orders }, usersResult] = await Promise.all([
    admin
      .from("user_profiles")
      .select("id, full_name, phone, created_at, is_admin")
      .eq("is_admin", false)
      .order("created_at", { ascending: false }),
    admin.from("orders").select("user_id, total_amount, payment_status"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  // Map auth emails by user id.
  const emailById = new Map<string, string>();
  for (const u of usersResult.data?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email);
  }

  // Aggregate order count + paid spend per customer.
  const stats = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    const s = stats.get(o.user_id) ?? { count: 0, spent: 0 };
    s.count += 1;
    if (o.payment_status === "paid") s.spent += Number(o.total_amount) || 0;
    stats.set(o.user_id, s);
  }

  const customers: CustomerRow[] = (profiles ?? []).map((p) => {
    const s = stats.get(p.id) ?? { count: 0, spent: 0 };
    return {
      id:         p.id,
      name:       p.full_name ?? "",
      email:      emailById.get(p.id) ?? "",
      phone:      p.phone,
      joined:     p.created_at,
      orderCount: s.count,
      totalSpent: s.spent,
    };
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <CustomersTable customers={customers} />
    </div>
  );
}
