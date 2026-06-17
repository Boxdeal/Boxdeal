import type { Metadata } from "next";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatPrice, formatCompactNumber } from "@/lib/utils/format";
import { getAdminDashboard, getTopProducts } from "@/lib/admin/stats";

export const metadata: Metadata = { title: "Analytics — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [{ chart }, topProducts] = await Promise.all([
    getAdminDashboard(),
    getTopProducts(10),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <RevenueChart data={chart} />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Product</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Units Sold</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Revenue</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(
                (p: { product_id: string; product_name: string; sold_count: number; revenue: number; rating: number }, i: number) => (
                  <tr key={p.product_id} className="border-b border-gray-50">
                    <td className="px-3 py-2.5 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{p.product_name}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{formatCompactNumber(p.sold_count)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                    <td className="px-3 py-2.5 text-right text-amber-600 font-medium">★ {Number(p.rating).toFixed(1)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
