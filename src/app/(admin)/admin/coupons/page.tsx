import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { CouponsManager, type Coupon } from "@/components/admin/CouponsManager";

export const metadata: Metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  const admin = getSupabaseAdminClient();
  const { data: coupons } = await admin
    .from("coupons")
    .select("id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, expires_at, is_active, eligibility")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
      <p className="text-sm text-gray-500">Create discount codes and choose who can use them.</p>
      <CouponsManager initial={(coupons ?? []) as Coupon[]} />
    </div>
  );
}
