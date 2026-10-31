import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShoppingBag, IndianRupee, Wallet, AlertTriangle,
  Mail, Phone, MapPin, ShoppingCart, Heart, Package,
} from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { orderBucket } from "@/lib/admin/order-buckets";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils/format";
import { cn, getInitials } from "@/lib/utils/helpers";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "Customer — Admin" };

// Cart, orders and last login change all the time — always render fresh.
export const dynamic = "force-dynamic";

interface StoredCartItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

interface ProductInfo {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  mrp: number;
  stock_quantity: number;
  is_active: boolean;
  product_images: { image_url: string; is_primary: boolean | null; sort_order: number | null }[] | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  email:  "Email",
  phone:  "Phone OTP",
  google: "Google",
};

function productImage(p: ProductInfo | undefined): string | null {
  const imgs = p?.product_images ?? [];
  if (!imgs.length) return null;
  const primary = imgs.find((i) => i.is_primary);
  if (primary) return primary.image_url;
  return [...imgs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0].image_url;
}

function Section({
  title, icon: Icon, extra, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {extra && <div className="ml-auto text-xs text-gray-400">{extra}</div>}
      </div>
      {children}
    </section>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-900">{children}</dd>
    </div>
  );
}

function ProductThumb({ src }: { src: string | null }) {
  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
      {src && <Image src={src} alt="" fill sizes="48px" className="object-cover" />}
    </div>
  );
}

function stockFlag(p: ProductInfo | undefined): { label: string; cls: string } | null {
  if (!p)               return { label: "Product deleted", cls: "bg-gray-100 text-gray-600" };
  if (!p.is_active)     return { label: "Hidden",          cls: "bg-gray-100 text-gray-600" };
  if (p.stock_quantity <= 0) return { label: "Out of stock", cls: "bg-red-100 text-red-700" };
  return null;
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const admin = getSupabaseAdminClient();

  const [
    { data: profile },
    authResult,
    { data: addresses },
    { data: ordersData },
    { data: cartRow },
    { data: wishlistRows },
  ] = await Promise.all([
    admin.from("user_profiles").select("*").eq("id", id).maybeSingle(),
    admin.auth.admin.getUserById(id),
    admin.from("addresses").select("*").eq("user_id", id)
      .order("is_default", { ascending: false }).order("created_at", { ascending: true }),
    admin.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("user_carts").select("items, updated_at").eq("user_id", id).maybeSingle(),
    admin.from("wishlists").select("product_id, created_at").eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const authUser = authResult.data?.user ?? null;
  if (!profile && !authUser) notFound();

  const orders = (ordersData ?? []) as Order[];
  const cartItems = ((cartRow?.items ?? []) as StoredCartItem[]);
  const wishlist = wishlistRows ?? [];

  // Current product data for everything in the cart and wishlist.
  const productIds = [...new Set([
    ...cartItems.map((i) => i.product_id),
    ...wishlist.map((w) => w.product_id),
  ])];
  const productById = new Map<string, ProductInfo>();
  if (productIds.length) {
    const { data: products } = await admin
      .from("products")
      .select("id, name, slug, selling_price, mrp, stock_quantity, is_active, product_images(image_url, is_primary, sort_order)")
      .in("id", productIds);
    for (const p of (products ?? []) as ProductInfo[]) productById.set(p.id, p);
  }

  // ── Order summary (same buckets as the dashboard) ──
  let revenueCount = 0, revenueValue = 0, paid = 0, cod = 0;
  let failed = 0, cancelled = 0, returned = 0;
  for (const o of orders) {
    const bucket = orderBucket(o);
    if (bucket === "revenue") {
      revenueCount += 1;
      revenueValue += Number(o.total_amount) || 0;
    } else if (bucket === "failed")    failed += 1;
    else if (bucket === "cancelled")   cancelled += 1;
    else if (bucket === "returned")    returned += 1;
    if (o.payment_method === "cod") cod += 1;
    if (o.payment_status === "paid") paid += Number(o.total_amount) || 0;
  }
  const avgOrder = revenueCount ? revenueValue / revenueCount : 0;
  const placedDates = orders.map((o) => o.placed_at ?? o.created_at).filter(Boolean).sort();
  const firstOrder = placedDates[0] ?? null;
  const lastOrder = placedDates[placedDates.length - 1] ?? null;

  // ── Customer details ──
  const name = profile?.full_name || (authUser?.user_metadata?.full_name as string | undefined) || "";
  const email = authUser?.email ?? "";
  const phone = profile?.phone || authUser?.phone || "";
  const providers = ((authUser?.app_metadata?.providers as string[] | undefined)
    ?? [authUser?.app_metadata?.provider].filter(Boolean)) as string[];
  const loginMethod = providers.length
    ? providers.map((p) => PROVIDER_LABELS[p] ?? p).join(", ")
    : "—";

  const cartTotal = cartItems.reduce((sum, i) => {
    const p = productById.get(i.product_id);
    return sum + (p ? Number(p.selling_price) : i.price) * i.quantity;
  }, 0);
  const cartUnits = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-6xl space-y-6 p-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> All customers
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
          {getInitials(name) || "U"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-gray-900">{name || "Unnamed customer"}</h1>
          <p className="text-sm text-gray-500">
            Customer since {formatDate(profile?.created_at ?? authUser!.created_at)}
          </p>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Orders (confirmed → delivered)"
          value={revenueCount}
          subtitle={`${orders.length} placed in total · ${cod} COD`}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Order value"
          value={formatPrice(revenueValue)}
          subtitle={`Average ${formatPrice(avgOrder)} per order`}
          icon={IndianRupee}
        />
        <StatsCard
          title="Money received"
          value={formatPrice(paid)}
          subtitle="Orders with payment marked paid"
          icon={Wallet}
          variant="success"
        />
        <StatsCard
          title="Failed / cancelled / returned"
          value={`${failed} / ${cancelled} / ${returned}`}
          subtitle={lastOrder ? `Last order ${formatDate(lastOrder)}` : "No orders yet"}
          icon={AlertTriangle}
          variant={failed + cancelled + returned > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Details ── */}
        <Section title="Customer details" icon={Package}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Name">{name || "—"}</Detail>
            <Detail label="Email">
              {email ? (
                <span className="flex flex-wrap items-center gap-2">
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {email}
                  </a>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    authUser?.email_confirmed_at ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {authUser?.email_confirmed_at ? "Verified" : "Not verified"}
                  </span>
                </span>
              ) : "—"}
            </Detail>
            <Detail label="Phone">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </a>
              ) : "—"}
            </Detail>
            <Detail label="Gender">
              <span className="capitalize">{profile?.gender ?? "—"}</span>
            </Detail>
            <Detail label="Date of birth">{profile?.date_of_birth ? formatDate(profile.date_of_birth) : "—"}</Detail>
            <Detail label="Login method">{loginMethod}</Detail>
            <Detail label="Joined">{formatDateTime(profile?.created_at ?? authUser!.created_at)}</Detail>
            <Detail label="Last login">{authUser?.last_sign_in_at ? formatDateTime(authUser.last_sign_in_at) : "—"}</Detail>
            <Detail label="First order">{firstOrder ? formatDateTime(firstOrder) : "—"}</Detail>
            <Detail label="Customer ID">
              <span className="font-mono text-xs text-gray-600">{id}</span>
            </Detail>
          </dl>
        </Section>

        {/* ── Addresses ── */}
        <Section title="Saved addresses" icon={MapPin} extra={`${addresses?.length ?? 0} saved`}>
          {!addresses?.length ? (
            <p className="text-sm text-gray-400">No saved addresses</p>
          ) : (
            <ul className="space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="rounded-xl border border-gray-100 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium text-gray-900">{a.full_name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600">
                      {a.address_type ?? "home"}
                    </span>
                    {a.is_default && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {[a.address_line1, a.address_line2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-gray-600">{a.city}, {a.state} – {a.pincode}</p>
                  <p className="mt-1 text-gray-500">{a.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* ── Cart ── */}
      <Section
        title="Cart right now"
        icon={ShoppingCart}
        extra={cartRow?.updated_at ? `Updated ${formatDateTime(cartRow.updated_at)}` : undefined}
      >
        {!cartItems.length ? (
          <p className="text-sm text-gray-400">
            Cart is empty{!cartRow && " (or the customer has not opened the site since cart tracking started)"}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-50">
              {cartItems.map((i) => {
                const p = productById.get(i.product_id);
                const nowPrice = p ? Number(p.selling_price) : null;
                const changed = nowPrice !== null && nowPrice !== i.price;
                const flag = stockFlag(p);
                return (
                  <li key={i.product_id} className="flex items-center gap-3 py-3">
                    <ProductThumb src={productImage(p)} />
                    <div className="min-w-0 flex-1">
                      {p ? (
                        <Link href={`/admin/products/${p.id}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-brand-600">
                          {p.name}
                        </Link>
                      ) : (
                        <p className="line-clamp-1 text-sm font-medium text-gray-900">{i.name || "Unknown product"}</p>
                      )}
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>Qty {i.quantity}</span>
                        <span>· {formatPrice(i.price)} each</span>
                        {changed && <span className="font-semibold text-amber-600">now {formatPrice(nowPrice!)}</span>}
                        {flag && <span className={cn("rounded-full px-2 py-0.5 font-semibold", flag.cls)}>{flag.label}</span>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice((nowPrice ?? i.price) * i.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">{cartUnits} item{cartUnits !== 1 ? "s" : ""} · at today&apos;s prices</span>
              <span className="font-bold text-gray-900">{formatPrice(cartTotal)}</span>
            </div>
          </>
        )}
      </Section>

      {/* ── Wishlist ── */}
      <Section title="Wishlist" icon={Heart} extra={`${wishlist.length} saved`}>
        {!wishlist.length ? (
          <p className="text-sm text-gray-400">No products in the wishlist</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {wishlist.map((w) => {
              const p = productById.get(w.product_id);
              const flag = stockFlag(p);
              return (
                <li key={w.product_id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <ProductThumb src={productImage(p)} />
                  <div className="min-w-0 flex-1">
                    {p ? (
                      <Link href={`/admin/products/${p.id}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-brand-600">
                        {p.name}
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-500">Product deleted</p>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {p && <span className="font-semibold text-gray-800">{formatPrice(Number(p.selling_price))}</span>}
                      <span>Saved {formatDate(w.created_at)}</span>
                      {flag && p && <span className={cn("rounded-full px-2 py-0.5 font-semibold", flag.cls)}>{flag.label}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Orders ── */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <ShoppingBag className="h-4 w-4 text-gray-400" /> All orders
          <span className="text-xs font-normal text-gray-400">
            {orders.length} — including failed and cancelled
          </span>
        </h2>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
