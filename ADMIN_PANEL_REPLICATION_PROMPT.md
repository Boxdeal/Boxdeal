# Prompt: Build a full e-commerce Admin Panel (exact replica of the BoxDeal admin panel)

> Copy everything below this line and give it to Claude, in the repository of the new website.

---

## 0. Your job, and how to work

You are building the admin panel for an e-commerce website. It must match an existing, working admin panel (called "BoxDeal" below) **feature for feature**. Every page, card, filter, number, button, rule and edge case in this document exists in the original and must exist in yours. Do not drop, merge or "simplify away" anything. If something seems redundant, keep it: it was added to fix a real problem.

How to work:

1. **Read the target codebase first.** Find its framework, database, auth, payment gateway, courier/shipping integration, existing tables, and how a user is marked as admin. Map every table and column named in this document onto what already exists. Only create what is missing.
2. **Adapt names, not behaviour.** Brand name, colours, table names and the payment/courier provider may differ. The rules, numbers and screens must not.
3. **Ask before guessing on integrations.** If the target site uses a different payment gateway (not Razorpay) or courier aggregator (not Shiprocket), stop and ask the user which one, then build the same behaviour on that provider's API. If it has no courier integration at all, ask whether to build one or to skip only the provider-specific actions (keep the manual AWB entry and every report).
4. **Collect these values from the user** (they are placeholders below):
   - `{{BRAND}}`: brand name shown in the sidebar and on documents.
   - `{{TIMEZONE}}`: business timezone. BoxDeal uses `Asia/Kolkata` (IST). Every "day", "week", "month" in the panel is a calendar day in this zone, never server UTC.
   - `{{CURRENCY}}`: BoxDeal uses INR, formatted `₹1,23,456` (en-IN grouping).
   - Seller legal details for the GST invoice: legal name, address lines, city + PIN, state, GST state code, phone, GSTIN, CIN, website, email.
   - GST rate (BoxDeal: flat 18% on every product and on delivery, prices tax-inclusive).
   - Courier pickup location name, webhook token.
5. Build in the order of section 13. After each part, run type-check/build and fix errors before moving on.
6. When done, walk through the acceptance checklist in section 14 and report anything you could not build.

---

## 1. Reference stack (what BoxDeal uses)

Use the target site's stack if it differs; otherwise use this:

- **Next.js 15 (App Router)**, React 19, TypeScript, Tailwind CSS 3.
- **Supabase** (Postgres + Auth + Storage). Server code uses two clients: a normal server client tied to the logged-in user's cookies (for the auth check), and a **service-role admin client** (bypasses RLS) for every admin data query.
- `lucide-react` icons, `sonner` toasts, `recharts` charts, `date-fns` + `date-fns-tz`, `@react-pdf/renderer` (PDFs), `exceljs` (Excel), `sharp` (image resize).
- **Razorpay** for online payment + refunds. **Shiprocket** for shipping (order push, courier/AWB, tracking, cancel, webhook, COD remittance). **Resend** for "shipped" / "delivered" emails.
- Every admin page is a **server component** with `export const dynamic = "force-dynamic"` (never cached), except where interactivity needs a client component. All filters live in the **URL query string** (`?period=month&pay=cod&status=shipped`), so every view is shareable and survives refresh.

---

## 2. Data model the panel needs

Map these onto the target database. Column names matter only because the logic below refers to them.

### `orders`
`id` (uuid), `order_number` (text, e.g. `BD20260928-1835`), `user_id`, `status`, `payment_status`, `payment_method`, `placed_at`, `confirmed_at`, `packed_at`, `shipped_at`, `delivered_at`, `cancelled_at`, `updated_at`, `pack_deadline` (timestamp by which a confirmed order must be packed), `subtotal`, `discount_amount` (coupon), `admin_discount` (extra discount set from the panel, default 0), `shipping_charge`, `total_amount`, `coupon_code`, `notes`, shipping snapshot (`shipping_full_name`, `shipping_phone`, `shipping_address1`, `shipping_address2`, `shipping_city`, `shipping_state`, `shipping_pincode`), shipment fields (`tracking_number` = AWB, `tracking_url`, `courier_name`, `shiprocket_order_id`, `shiprocket_shipment_id`, `shiprocket_attempt` int default 0), payment ids (`razorpay_order_id`, `razorpay_payment_id`), invoice fields (`invoice_number`, `invoice_date`).

- `status` ∈ `placed`, `confirmed`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`.
- `payment_status` ∈ `pending`, `paid`, `failed`, `refunded`, `partially_refunded`.
- `payment_method` ∈ `razorpay` (online/prepaid), `cod`.

### `order_items`
`order_id`, `product_id`, `product_name`, `product_image`, `product_sku`, `quantity`, `selling_price` (tax-inclusive unit price), `total_price` (line total; may be null on old rows → fall back to qty × price), `hsn_code` (snapshot at order time; may be null on old rows → fall back to the product's current HSN).

### `order_status_history`
`id`, `order_id`, `status`, `note`, `updated_by` (user id; **null when the courier webhook wrote it**), `created_at`. Every status change, AWB change, discount change and sync writes one row here. It is also how "who cancelled" is worked out (section 3.6).

### `products`
`id`, `name`, `slug` (unique), `sku` (unique), `hsn_code`, `description`, `short_description`, `category_id`, `subcategory_id`, `brand_id`, `mrp`, `selling_price`, `discount_percent` (derived), `stock_quantity`, `low_stock_threshold` (default 5), `weight_grams`, `length_cm`, `breadth_cm`, `height_cm`, `is_active`, `is_featured`, `is_deal_of_day`, `cod_available` (bool, default true), `featured_position` (int, nullable), `deal_position` (int, nullable), `sold_count`, `rating`, `meta_title`, `meta_description`, `created_at`, `updated_at`.

### Others
- `product_images`: `product_id`, `image_url`, `thumbnail_url`, `is_primary`, `sort_order`.
- `product_specifications`: `product_id`, `spec_group`, `spec_name`, `spec_value`, `sort_order`.
- `categories`: `id`, `name`, `slug`, `description`, `image_url`, `sort_order`, `is_active`, `updated_at`.
- `subcategories`: `id`, `name`, `slug`, `category_id`, `image_url`, `sort_order`, `is_active`.
- `brands`: `id`, `name`.
- `coupons`: `id`, `code` (unique, uppercase), `discount_type` (`percentage` | `fixed`), `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `expires_at`, `is_active`, `eligibility` (`all` | `first_order`), `created_at`.
- `user_profiles`: `id` (= auth user id), `full_name`, `phone`, `is_admin` (bool), `created_at`. Customer email lives in the auth users table.
- `voided_invoices`: `invoice_number` (PK), `order_id`, `order_number`, `invoice_date`, `voided_at`, `reason`. RLS on, no policies (server-only).
- Sequence `invoice_seq`.
- DB function `restore_stock(p_product_id, p_quantity)`: adds quantity back to stock.
- Storage bucket `product-images` (public).

If the target DB requires explicit GRANTs for new tables (Supabase does for tables created after Oct 2026), add `GRANT ... TO service_role` (and other roles as needed) for every table you create.

### Invoice numbering (database)

1. `issue_invoice_number(p_order_id uuid) RETURNS TABLE(out_number text, out_date timestamptz)`, `SECURITY DEFINER`, executable only by service role:
   - If the order has no `delivered_at` → raise an exception ("not delivered — no invoice").
   - If it has no `invoice_number` yet → set `invoice_number = 'INV' || lpad(nextval('invoice_seq')::text, 5, '0')` (→ `INV00001`), and `invoice_date = placed_at` for online orders, `delivered_at` for COD.
   - Return the (now stable) number and date. A number, once issued, is never changed.
2. A `BEFORE UPDATE` trigger on `orders` (`issue_invoice_on_delivery`): when `NEW.status = 'delivered'`, set `delivered_at = coalesce(delivered_at, now())`, and if there is no invoice number yet, mint one with the same date rule. So **every delivered order gets an invoice automatically**.
3. Invoices issued on orders that were never delivered must be **voided, not deleted**: insert into `voided_invoices` with a reason ("Order cancelled before delivery" / "RTO — parcel never delivered") and clear the order's `invoice_number`/`invoice_date`.

---

## 3. Core business rules (the single source of truth)

Put these in **one shared module** (BoxDeal: `lib/admin/order-buckets.ts`) and use it everywhere. The dashboard, every tab, product sales, delivery stats and the monthly statement must call the same functions so their numbers can never disagree.

### 3.1 Order bucket: every order is in exactly one

```
REVENUE_STATUSES = [confirmed, packed, shipped, out_for_delivery, delivered]
LIVE_ORDER_STATUSES = REVENUE_STATUSES

orderBucket(o):
  if payment_status == "failed"  → "failed"     // checked FIRST: a dismissed online payment is stored as cancelled+failed
  if status == "placed"          → "failed"     // order row exists but was never paid/confirmed
  if status == "cancelled"       → "cancelled"
  if status == "returned"        → "returned"
  if status in REVENUE_STATUSES  → "revenue"
  else                           → "failed"

failureReason(o): payment failed → "Payment failed / abandoned"; status placed → "Awaiting payment — never confirmed"; else "Not confirmed".
```

Matching database filters (for queries that fetch one bucket directly):
- failed: `.or("payment_status.eq.failed,status.eq.placed")`
- cancelled: `status = cancelled AND payment_status != failed`
- revenue / live: `status IN REVENUE_STATUSES AND payment_status != failed`

### 3.2 "Estimated revenue"

Revenue = sum of `total_amount` of every order in the **revenue** bucket. COD counts from the moment it is **confirmed**, not when cash arrives. Order Placed, failed, cancelled and RTO/returned are excluded. The estimate splits into:
- **Collected** (already in hand) = revenue orders with `payment_status = paid`.
- **Yet to collect** (pending) = revenue orders not yet paid (mostly COD in transit).

### 3.3 Payment buckets

`prepaid` = `payment_method` in `[razorpay]`; `cod` = `[cod]`. Labels: "Prepaid", "COD". Anything not COD is prepaid.

### 3.4 Time

All date logic runs in `{{TIMEZONE}}`. Helpers:
- `istDayKey(date)` → `YYYY-MM-DD` in the zone.
- `istDayStart(ymd)` / `istDayEnd(ymd)` → UTC instants for 00:00:00.000 and 23:59:59.999 of that local day.
- `addDaysKey(ymd, n)` → pure calendar arithmetic.
- `prettyDay(ymd)` → "13 Aug 2026".
- Never slice `toISOString()` or use `new Date(y,m,d)` for boundaries (they resolve in server time).

**Period presets** (`getISTPeriodRange(period, {from, to})`), each with a label and a "previous window" of equal length immediately before it (for % trend):

| period | range | label |
|---|---|---|
| `today` | today | "Today" |
| `yesterday` | yesterday | "Yesterday" |
| `week` | Monday of this week → today | "This Week" |
| `month` | 1st of this month → today | "This Month" |
| `last_month` | whole previous month | "Last Month" |
| `custom` | `from`→`to` (validated `YYYY-MM-DD`, swapped if reversed, default today) | "13 Aug 2026" if one day, else "13 Aug 2026 → 20 Aug 2026" |
| `all` (default) | epoch → today | "All Time" (no previous window) |

`pctChange(cur, prev)` = rounded % change, or `null` when prev ≤ 0 (then no trend is shown).

Every period-scoped tab filters orders by **`placed_at`** (the date the order was placed), unless stated otherwise.

### 3.5 RTO vs customer return

Both end as `status = returned`. `returnKind(o)` = `"customer"` if `delivered_at` is set, else `"rto"`. Labels "RTO" / "Customer return"; hints "Never delivered — came back to origin" / "Delivered, then returned by the customer"; colours orange / gray.

### 3.6 Who cancelled

There is no `cancelled_by` column. Look up the newest `order_status_history` row with `status = cancelled` for each order:
- no history row → `system`
- `updated_by == order.user_id` → `customer`
- `updated_by` set (someone else, i.e. an admin) → `boxdeal` (label: `{{BRAND}}`)
- `updated_by` null (courier webhook) → `system` (label "System / Courier")

Return actor + the history note + time. Colours: customer amber, brand red, system gray.

### 3.7 Parcel state (Delivery tab)

```
parcelState(o): delivered → "delivered"; returned → (rto ? "rto" : "returned"); cancelled → "cancelled"; anything else → "transit"
PARCEL_STATES order: transit, delivered, rto, returned, cancelled
labels: In transit, Delivered, RTO, Customer return, Cancelled
colours: blue, green, red, gray, amber
hints: "Still moving — packed, shipped or out for delivery", "Reached the customer",
       "Never delivered — came back to origin", "Delivered, then returned by the customer",
       "Cancelled after the courier was assigned"
SETTLED_STATUSES = [delivered, returned, cancelled]
```

Each state needs a matching DB filter (so the pill count equals the list length): delivered `status=delivered`; cancelled `status=cancelled`; rto `status=returned AND delivered_at IS NULL`; returned `status=returned AND delivered_at IS NOT NULL`; transit `status NOT IN (SETTLED_STATUSES)`.

### 3.8 Order lifecycle side effects (shared by every path)

Put these in one module (BoxDeal: `lib/orders/fulfillment.ts`) and call them from the admin API, the courier webhook and the "Sync" action:

- `STOCK_TAKEN_STATUSES = [confirmed, packed, shipped, out_for_delivery, delivered]`.
- `restoreOrderStock(orderId)`: for each order item call `restore_stock`. Best-effort, log failures.
- `refundOrderPayment(order)`: only if `payment_status = paid` AND `payment_method = razorpay` AND a payment id exists AND total > 0 → refund the full `total_amount` (in paise) through the gateway. Never throws; returns `{refunded, error}`.
- `cancelOnShiprocket(order)`: if it has an AWB, cancel the shipment by AWB **first**, then cancel the courier order by id. "Already cancelled" counts as success. Never throws.
- `settleEndedOrder(order)`: refund (as above) + restore stock **only if** the order was in a stock-taken status. Call only on the transition INTO cancelled/returned.
- `collectCodOnDelivery(order)`: returns `{payment_status: "paid"}` for a COD order not yet paid, else `{}`. **Every** path that marks an order delivered (webhook, sync, manual) must apply it, or COD cash never shows as collected.
- `ENDED_STATUSES = [delivered, cancelled, returned]`: an order in one of these can never move backwards.

### 3.9 Courier status mapping

`mapShiprocketStatus(text)` (lower-cased, checked in this order so substrings are not misread):
`rto`/`return` → returned; `cancel` → cancelled; `undelivered` → null (keep state); `out for delivery` → out_for_delivery; `delivered` → delivered; `picked up`/`shipped`/`in transit` → shipped; else null.
Timestamp to stamp: shipped → `shipped_at`, delivered → `delivered_at`, cancelled → `cancelled_at`.

### 3.10 Display constants

- Status labels: placed "Order Placed", confirmed "Confirmed", packed "Packed", shipped "Shipped", out_for_delivery "Out for Delivery", delivered "Delivered", cancelled "Cancelled", returned "Returned".
- Status colours (pill bg/text): placed blue, confirmed indigo, packed yellow, shipped orange, out_for_delivery purple, delivered green, cancelled red, returned gray.
- Payment status labels: pending "Unpaid", paid "Paid", failed "Failed", refunded "Refunded", partially_refunded "Part refunded".
- Customer self-cancel: allowed within **12 hours** of placing, only while status is `placed` or `confirmed`.

---

## 4. Access control, layout, sidebar

- `/admin/*` layout (server): if not logged in → redirect `/login`; if `user_profiles.is_admin` is not true → redirect `/`. Metadata: title "Admin", `robots: noindex, nofollow, nocache`.
- Layout: full-height flex; left sidebar (width 14rem, white, right border) + scrolling main area on `bg-gray-50`.
- Sidebar header: `{{BRAND}}` logo text (part of it in brand colour) with "Admin Panel" under it.
- Nav items **in this exact order**, each with an icon; active = `pathname === "/admin"` for Dashboard, else `pathname.startsWith(href)`; active style brand-50 bg + brand-700 text:
  1. Dashboard `/admin` (LayoutDashboard)
  2. Orders `/admin/orders` (Package)
  3. Money Collected `/admin/dashboard/collected` (Wallet)
  4. Failed Orders `/admin/dashboard/failed` (XCircle)
  5. Cancelled Orders `/admin/dashboard/cancelled` (Ban)
  6. RTO & Returns `/admin/dashboard/rto` (Undo2)
  7. Delivery & Couriers `/admin/dashboard/delivery` (Truck)
  8. Product Sales `/admin/dashboard/products` (TrendingUp)
  9. Products `/admin/products` (ShoppingBag)
  10. Featured & Deals `/admin/featured` (Sparkles)
  11. Categories `/admin/categories` (Tag)
  12. Customers `/admin/customers` (Users)
  13. Coupons `/admin/coupons` (Ticket)
  14. Analytics `/admin/analytics` (BarChart3)
  15. Monthly Statement `/admin/statement` (FileSpreadsheet)
- Footer: red "Sign Out" button → sign out of auth, clear client auth state, hard-navigate to `/login`.
- Every admin API route re-checks admin with a shared `requireAdmin()` → 401 "Unauthorized" / 403 "Forbidden".

---

## 5. Shared UI components

### 5.1 StatsCard
Props: `title`, `value`, `icon`, optional `subtitle` (small grey line under value), optional `trend {value, label}` (green "+12%" / red "-5%" then label), `variant` (`default` blue, `success` green, `warning` yellow, `danger` red: tints the icon tile), optional `href` (whole card becomes a link, shows a small ↗ arrow next to the title, hover border + shadow). Look: white, rounded-2xl, thin border, p-5, value `text-2xl font-black`.

### 5.2 PeriodSelector (client)
URL-driven. Shows preset pills Today, Yesterday, This Week, This Month, Last Month, All Time; an **"Any day"** single-date input (sets `period=custom&from=d&to=d`); and a **from → to** range with an "Apply" button (disabled until both set). Highlights whichever is active (single-day box highlighted when from==to). Changing the period **keeps every other query param** already on the page. Each page passes its own default period.

### 5.3 OrdersTable (server-safe)
Props: `orders`, optional `extraColumn {header, render(order)}` inserted before the View link.
- Desktop (≥lg) table columns: Order (mono order number), Customer (shipping name), Amount, Payment (pill "COD" indigo / "Prepaid" brand + payment-status text, green if paid), Status (coloured pill), Date (date+time), [extra column], "View" → `/admin/orders/{id}`.
- Mobile (<lg): one card per order (order number, name, amount, status pill, COD/Prepaid pill, payment status, extra column under a divider, date). Whole card links to the order.
- **Overdue packing** highlight: `status = confirmed` and `pack_deadline < now` → red-tinted row + alert icon.
- Empty: "No orders found".

### 5.4 RevenueChart (client, recharts AreaChart, height 240)
Props `data` (points `{date, revenue, orders, prepaidRevenue, codRevenue}`), `title` (default "Revenue (Last 30 Days)"), `split`.
- `split=true`: two **stacked** areas, Prepaid (brand orange `#f97316`) and COD (indigo `#6366f1`), with a small legend; tooltip shows Prepaid, COD and Total.
- `split=false`: revenue area + orders line; tooltip shows Revenue and Orders.
- X axis "dd MMM"; Y axis "₹12K". Empty data → "No orders in this period."

### 5.5 Pills & style
Filter pills: rounded-full, `px-4 py-1.5 text-sm`; active brand-500 bg white text (payment pills use dark gray-800 when active); inactive white with border. Cards: `rounded-2xl border border-gray-100 bg-white shadow-sm`. Every drill-down page has a "← Dashboard" (or parent) back link at the top, the page title "Name · {period label}", and the PeriodSelector on the right. Any list cut at a row limit shows "Showing latest N — narrow the period to see more."

### 5.6 Formatting
`formatPrice` → `₹1,23,456` (en-IN). `formatCompactNumber` for big counts. `formatDateTime` / `formatDate` in the business zone.

---

## 6. Pages (build every one exactly)

### 6.1 Dashboard `/admin` (default period `today`)
Header "Overview" + PeriodSelector. Card links always carry the active period params.

1. **Period cards** (3 columns):
   - "Orders · {label}": count of revenue-bucket orders; subtitle "confirmed → delivered — failed, cancelled & RTO excluded"; trend vs previous window; links to `/admin/dashboard/orders`.
   - "Est. Revenue · {label}": revenue estimate; success; trend; links to `/admin/dashboard/revenue`.
   - "Avg Order Value · {label}": revenue ÷ revenue orders (rounded); links to revenue.
   - Trend's previous-window counts: skip failed and cancelled orders; previous revenue = revenue bucket only.
2. **Lost-money cards** (4 columns):
   - "Failed Orders · {label}": count; subtitle "₹X never converted"; danger if >0; → failed tab.
   - "RTO / Returned · {label}": count; subtitle "− ₹X off revenue" plus " · N RTO, M customer" when there are customer returns; danger if >0; → rto tab.
   - "Cancelled Orders · {label}": count; subtitle "₹X cancelled · by customer & {{BRAND}}"; warning if >0; → cancelled tab.
   - An info card: "Revenue counts — Confirmed · Packed · Shipped · Out for Delivery · Delivered. Order Placed, failed, cancelled and RTO / returned orders are excluded."
3. **"Prepaid vs COD · {label}"** section: 4 cards: Prepaid Revenue (→ revenue `&pay=prepaid`), COD Revenue (→ `&pay=cod`), Prepaid Orders (→ orders `&pay=prepaid`), COD Orders (→ orders `&pay=cod`). Prepaid + COD counts always add up to the Orders card. Under them a box with: "Already collected: ₹X (N orders paid) — where it came from →" linking to Money Collected, and (only if >0) "Yet to collect: ₹X (N live orders, mostly COD in transit)".
4. **Operations** (live, not period-scoped): Pending Orders (count of `status = confirmed`, → orders `?period=all&filter=pending`), Overdue Packing (confirmed AND `pack_deadline < now`, danger if >0, → `filter=overdue`), Low Stock Items (active AND stock > 0 AND stock ≤ low_stock_threshold, warning if >0, → `/admin/products?filter=low-stock`), Total Customers (non-admin profiles, → customers).
5. **Revenue chart** (split, "Revenue Trend · {label}") from the period's day buckets.
6. **Recent Orders**: latest 10 live orders (`status in LIVE`, not payment-failed) in OrdersTable.

Period aggregation (`getPeriodStats`) computes in one pass over orders placed in the window: total orders, revenue orders, revenue, collected/pending split, failed/cancelled/returned (+ rto/customer split) amounts and counts, per-status count+value, per-payment-bucket copies of all of the above (`byPayment.prepaid` / `byPayment.cod`, each with its own per-status counts), day buckets for the chart (revenue, orders, prepaidRevenue, codRevenue), avg order value, previous-window revenue and orders.

### 6.2 Orders drill-down `/admin/dashboard/orders` (default `today`)
Params: `period, from, to, status, filter (pending|overdue), pay (prepaid|cod)`.
- Title: "Pending Orders" / "Overdue Packing" / "{Prepaid|COD} Orders" / "Orders", then " · {label}". Next to it a "View product-wise →" link to Product Sales with the same period.
- 4 totals boxes (scoped to the `pay` bucket when set): Orders (+ "confirmed → delivered — failed, cancelled & RTO excluded"), Est. Revenue (+ "N confirmed → delivered orders"), Collected ("money already in hand"), Yet to collect (amber box, "N live orders").
- "Not in revenue:" strip (only if any): links "N failed (₹X) →", "N cancelled (₹X) →", "N RTO / returned (₹X) →".
- Payment pills: All (count) · Prepaid (count · ₹rev) · COD (count · ₹rev). Payment pills keep the status filter.
- Status pills: All (count) + one pill per revenue status that has orders, counts taken from the selected payment bucket. Status pills keep the payment bucket.
- List (latest 100): pending → `status=confirmed`; overdue → confirmed + past `pack_deadline`; status → that status; else live orders. `pay` narrows by payment method.

### 6.3 Revenue `/admin/dashboard/revenue` (default `month`)
- Title "Revenue[ · Prepaid|COD] · {label}" + description "Estimated revenue — confirmed, packed, shipped, out for delivery and delivered orders. Order Placed, failed, cancelled and RTO / returned orders are not counted."
- Payment pills: All (₹) · Prepaid (₹) · COD (₹).
- 4 cards following the bucket: Estimated Revenue (with "N orders · confirmed → delivered", trend only when no bucket), Already Collected (→ Money Collected, keeps `pay`), Yet to Collect ("live orders, mostly COD"), Avg Order Value.
- If any returns: orange box "RTO deducted from revenue": Shipped order value (revenue + returned) − RTO / returned (N, "· a RTO, b customer") = Estimated revenue, with "See every RTO / returned order →".
- "COD vs Prepaid · {label}": two big cards (Prepaid Revenue "N orders · paid online", COD Revenue "N orders · cash on delivery"), each links to its `pay` filter.
- "Where the money stands" table: rows Prepaid, COD, Total; columns Method, Orders, Collected (links to Money Collected), Yet to collect, Est. revenue. Under it "Excluded: ₹ failed (N) → · ₹ cancelled (N) → · ₹ RTO / returned (N) →".
- "Order value by status": every status with orders this period, count and value; non-revenue statuses greyed with "· not counted" and the amount struck through.
- Split chart "Daily estimated revenue — prepaid vs COD".
- "Orders behind this revenue" (latest 100 revenue-bucket orders, narrowed by `pay`) + "All orders in this period →".

### 6.4 Money Collected `/admin/dashboard/collected` (default `month`)
Back link goes to Revenue. Shows orders **placed** in the period whose money is already in hand (`status in REVENUE`, `payment_status = paid`, up to 10,000 rows).
- When collected: online → `placed_at`; COD → `delivered_at` (fallback `updated_at`).
- 4 cards: Already Collected (or "{bucket} Collected", "N orders paid · money in hand"), Paid online (Razorpay at checkout, → `pay=prepaid`), Cash on delivery (delivered & paid, → `pay=cod`), Yet to Collect (period estimate, → Revenue).
- "Source:" pills All / Prepaid / COD with amounts.
- **"Where the money came from — and where it goes"**: one box per bucket with amount, "N orders paid · ₹X still to come", and three fixed lines:
  - Prepaid: Came from "Customer paid online through Razorpay (UPI / card / netbanking)"; Collected when "At checkout, before the order is confirmed"; Ends up "Razorpay settles it to the {{BRAND}} bank account on its payout cycle, minus the gateway fee".
  - COD: Came from "Courier collected cash from the customer at the doorstep"; Collected when "On delivery — the shipment webhook marks it paid"; Ends up "Shiprocket holds the cash and remits it to the bank account on its COD remittance cycle, minus shipping / COD charges".
  - Footer (if any): "Went back out — refunded: ₹X (N)" (payment_status refunded/partially_refunded) and "Collected but came back (refund due): ₹X (N) →" (status returned AND still paid, links RTO tab), "Neither is part of the collected total above."
- **"Orders placed in {label} — which month they were paid"** table: rows per calendar month of collection (oldest first): Paid in, COD count, Online count, Orders, Amount, plus Total row.
- **"Who it came from"**: top 10 customers (group by user_id or phone) by amount: Customer name (links to `/admin/orders?q={phone}`) + phone, Orders, Online ₹, COD ₹, Paid us ₹.
- **"Every payment received"** (latest 500) with extra column "Paid via": pill "Cash at doorstep" (indigo) / "Razorpay online" (green), the reference (COD → "courier · AWB", online → payment id), and "Received {date time}". Link "Full revenue breakdown →".

### 6.5 Failed Orders `/admin/dashboard/failed` (default `month`)
Fetch failed bucket in period (latest 500). Two kinds: `payment` ("Payment failed") when payment_status failed, else `placed` ("Order Placed (unpaid)").
- Description: "Orders that never got confirmed — a failed or abandoned payment, or an order still sitting at "Order Placed". None of these count toward revenue."
- Cards: Failed Orders (count, "₹X never converted", danger), Payment failed (count, ₹), Order Placed (unpaid) (count, ₹), Prepaid / COD ("a / b", "₹ / ₹").
- Kind pills (`?kind=`): All, Payment failed, Order Placed (unpaid).
- Table with extra column "Reason" = `failureReason`.

### 6.6 Cancelled Orders `/admin/dashboard/cancelled` (default `month`)
Real cancellations only (status cancelled, payment not failed), placed in period, ordered by `cancelled_at` desc, latest 500. Resolve "who cancelled" (3.6).
- Description mentions filtering by placed date and links to Failed Orders for abandoned payments.
- Cards: Cancelled Orders (count, "₹X in order value"), Cancelled by Customer, Cancelled by {{BRAND}} (brand + system counts, "incl. N auto/courier"), Prepaid / COD (subtitle "₹X refunded" or "no refunds issued").
- Actor pills (`?by=customer|boxdeal|system`) with counts.
- Extra column "Cancelled by": coloured actor pill + history note.

### 6.7 RTO & Returns `/admin/dashboard/rto` (default `month`)
All `status = returned` placed in period (latest 500).
- Description: "Goods that came back — an RTO the courier never delivered, or a customer return after delivery. Their value is deducted from revenue… Filtered by the date the order was placed."
- Cards: RTO / Returned (count, "− ₹X off revenue"), RTO (count, "₹ · never delivered — came back to origin"), Customer return (count, "₹ · returned after delivery"), Prepaid / COD (subtitle "₹X was collected" for paid ones, or "nothing was collected").
- "Effect on revenue · {label}": Shipped order value − RTO / returned = Estimated revenue, link "Open the revenue breakdown →".
- Kind pills (`?kind=rto|customer`).
- Extra column "Return type": kind pill + hint.

### 6.8 Delivery & Couriers `/admin/dashboard/delivery` (default `all`)
Stats module (BoxDeal `lib/admin/courier-stats.ts`): fetch every order placed in the window with **paging past the 1000-row API limit** (pages of 1000).

**Partner roll-up.** The courier name stored on the AWB is a *service* ("Delhivery Surface 10 Kg"). `courierPartner(service)` maps it to the company with these regexes, first match wins: delhivery→Delhivery; xpressbees or `\bxb\b`→Xpressbees; ecom express→Ecom Express; blue dart→Blue Dart; `\bdtdc\b`→DTDC; shadowfax or `\bsfx\b`→Shadowfax; ekart→Ekart; amazon→Amazon Shipping; india post / speed post→India Post; professional→Professional Couriers; smartr→Smartr; rapidshyp→Rapidshyp; `\bmovin\b`→Movin; trackon→Trackon; `\bgati\b`→Gati; safexpress→Safexpress; wow express→Wow Express; shree maruti→Shree Maruti; criticalog→Criticalog; `\bshiprocket\b`→Shiprocket. Unknown → the leading words before the first `surface|air|express|cargo|heavy|<digit>` token; empty → "Unknown".

**Per row** (partner, service and an "All couriers" total): parcels, inTransit, delivered, rto, customerReturn, cancelled, value, deliveredValue, rtoValue, codParcels, prepaidParcels, codCollected (delivered COD that is paid), codPending + codPendingParcels (delivered COD never marked paid), deliveryRate, rtoRate, avgDeliveryDays, lastUsedAt, and (partners only) its list of services sorted by parcels.
- Delivery rate = (delivered + customer returns) ÷ (delivered + customer returns + RTO) × 100. RTO rate = RTO ÷ same. null if nothing settled. A customer return counts as a successful delivery. Transit and cancelled are left out of both.
- Avg days = mean of (delivered_at − (shipped_at or placed_at)) in days, only non-negative values.

**Orders with no courier name** are split three ways (not one "backlog"): failed/cancelled bucket → `neverShipped`; status delivered/returned → `offline` (also count `withAwb` = has a tracking number, and `returned`); else → `awaiting` (real backlog).

**Overview screen**
- Description: "Every Shiprocket courier that carried a {{BRAND}} parcel — how many parcels went with each partner, how many landed, how many came back as RTO and how fast they moved. A parcel is counted against the courier stamped on its AWB, filtered by the date the order was placed."
- 4 cards: Parcels shipped ("N partners · M services · ₹value"), Delivered ("x% delivery rate · ₹" or "no attempt settled yet"), RTO — came back (if offline returns exist: "+N returned with no courier — T in RTO & Returns", else "x% RTO rate · ₹ lost"), In transit ("avg x days to deliver · N awaiting a courier").
- Notes (coloured boxes, only when they apply): **Best delivery rate** (green; partner with ≥3 settled parcels and highest rate), **Highest RTO** (red; ≥3 settled and rto>0), **Waiting for a courier** (amber; awaiting count/value, mention never-shipped count), **No courier name stored** (amber; explains the RTO count gap, and either "N of them DO have an AWB… open the order and hit "Sync from Shiprocket"" or "None of them has an AWB — fulfilled outside Shiprocket"), **COD cash unconfirmed** (amber; delivered COD parcels never marked paid).
- **CourierTable** (client): "Sort by" pills Parcels, Delivered, Delivery rate, RTO, Value, Speed (speed = fastest first; null always last). Desktop table columns: Courier partner (expand chevron if >1 service, "N services"), Parcels (with a thin share-of-total bar and %), In transit, Delivered, RTO, Returned, Cancelled, Delivery rate, RTO rate, Avg days, COD / Prepaid (+ "₹ collected"), Value shipped (+ "₹ delivered"). Expanded rows list each service with the same columns (share bar relative to the partner). Every non-zero count is a link to that courier filtered to that parcel state; zero shows "—". Rate colours: delivery ≥90 green, ≥75 amber, else red; RTO ≤10 green, ≤25 amber, else red. Mobile: one card per partner with the same numbers and a "Show N services" toggle.
- "Every service used (N)" chips (exact AWB names + parcel count) linking to that service.
- Footer note explaining the rate formula and avg days.

**Detail screen** (`?courier=` = a service name or a partner name; service matched first)
- Back "All couriers"; title "{courier} · {label}"; description says partner (across N services) or one service of partner X.
- Cards: Parcels ("₹ handed over"), Delivered (rate), RTO / returned ("a / b", "₹ lost to RTO"), COD collected ("N COD · M prepaid"). If nothing: "No parcel went with "X" in this period. Try a wider date range."
- For a partner with >1 service: service chips (keep the state filter).
- State pills: All + 5 parcel states with counts and hints (`?state=`, invalid values ignored). The state filter is applied **in the database query**, before the 500-row limit.
- Table with extra column "Shipment": courier name, AWB (link to tracking URL if present), parcel-state pill.

### 6.9 Product Sales `/admin/dashboard/products` (default `today`)
Data: `order_items` joined to their order (placed in window). Line value = `total_price` if > 0 else qty × selling_price (order-level discounts are **not** apportioned).
Unit bucket per line: order bucket failed → `placed` ("not confirmed"); cancelled → `cancelled`; returned → `returned`; revenue but payment refunded → `returned`; else `live`. Only **live** units count as sold, add to the prepaid/COD unit split and to revenue (paid → Collected, else → Est. incoming). Non-live units go only to their own counter ("Not counted"). Orders count = distinct live orders.

**List view** (client `ProductSalesTable`): search box (name or SKU, every word must match, instant, clear ×). 4 cards that follow the search: Products sold / Products matched, Units sold, Collected, Estimated incoming (amber), plus "Totals above cover the N matching products of M." Table: Product (image, name link, SKU), Orders, Units sold, Prepaid / COD units, Collected, Est. incoming, chevron. Whole row clickable → `?product={id}` with the same period. Sorted by units desc, then revenue. Footer note explaining what counts.

**Detail view** (`?product=`): back "All products"; header with image, name, "SKU · label" and "· {Status} only" when filtered. **Status filter** (`?status=`, invalid ignored): All + one pill per order status the product has in the period, each showing "N units · M orders", counts always from the unfiltered period. Every number below follows the filter: cards Orders, Units sold ("a prepaid · b COD"), Collected, Estimated incoming; "Not counted in units sold" note (not confirmed / cancelled / returned counts in gray/red/orange); split chart "Daily revenue — prepaid vs COD" (paid revenue only); day table newest first: Day, Orders, Units sold, Collected, Est. incoming, Not counted (compact "3 cancelled · 1 returned"); then "Orders containing this product" (latest 100, status-filtered). Empty states: "This product had no orders in {label}." and "No {status} orders for this product in {label}."

### 6.10 Orders list `/admin/orders`
- Title "Orders" + note: "Confirmed → delivered orders. Failed, cancelled and RTO orders have their own tabs — a search here still finds them." (links).
- **OrdersSearch** (client): placeholder "Search order no, AWB, name, phone, email, city, product, coupon…"; debounced 350 ms into `?q=`; removes `page`; keeps other params; spinner while loading; clear ×; shows "N orders matching "q"". Must not overwrite what the admin is typing when the URL catches up.
- Status pills: All + Confirmed, Packed, Shipped, Out for Delivery, Delivered; then a divider and links "Failed →", "Cancelled →", "RTO →" (to those tabs with `period=all`). Pills and pagination carry `q`, `period`, `from`, `to`.
- Query: newest first, 20 per page, exact count, numbered pagination. No status and no search → live orders only. **A search finds ANY order** regardless of status. Optional period/from/to narrow by placed date.
- **Search filter builder**: strip `, ( ) * " \` and collapse spaces; ignore if < 2 chars. Build one OR filter: `ilike %q%` on order_number, shipping_full_name, shipping_phone, shipping_address1/2, shipping_city, shipping_state, shipping_pincode, tracking_number, courier_name, coupon_code, razorpay_order_id, razorpay_payment_id, shiprocket_order_id, shiprocket_shipment_id, notes; `id.eq` if the term is a UUID; if it has ≥6 digits also match the last 10 digits on phone and all digits on AWB (so "+91 98765 43210" finds "9876543210"); `id in (…)` for orders containing a product whose name/SKU matches; `user_id in (…)` for profiles matching name/phone and, only when the term contains "@", auth users whose email contains it. Cap each id list at 300.

### 6.11 Order detail `/admin/orders/[id]`
Fetch order + items + status history + customer profile. Layout: 2/3 main column + 1/3 side column, max width 4xl.
- Header: order number, status pill, and (only if the invoice can be issued, see 9.3) the invoice number + "Invoice" download button.
- **Order Items** card: image, name, "SKU: …", line total, "qty × price". Totals: Subtotal, Discount (if >0, green), Extra discount (admin, if >0), Shipping (or "FREE"), **Total**.
- **AdminDiscount** (only when status is placed or confirmed): "Extra discount (₹) — max ₹X" where max = subtotal − discount + shipping; Apply; note "Applied before packing — reflected in the Shiprocket invoice & COD amount." Validates ≥0 and ≤ max; 0 removes it.
- **Update Status** card (client):
  - Next step map: placed→confirmed→packed→shipped→out_for_delivery→delivered. Button "Mark as {Next}".
  - Optional note input ("e.g. Packed, dispatched via Bluedart").
  - Hints: before packing "Marking as Packed will auto-create the Shiprocket order and assign a courier & tracking number."; before shipping, green "Tracking already generated by Shiprocket: AWB (courier). Just click "Mark as Shipped"…" or amber "No AWB yet. Enter it in the Tracking / AWB box below…".
  - **Retry Shiprocket / Generate Tracking** (amber box) when there is no AWB and status is packed / shipped / out_for_delivery.
  - **Mark Returned** when status is shipped / out_for_delivery / delivered (confirm: "Stock goes back and any online payment is refunded.").
  - **Cancel Order** (red) whenever the status is not ended (confirm: "The Shiprocket shipment is cancelled too and any online payment is refunded.").
  - Toasts for every outcome: success, refund initiated, refund failed ("Refund manually from Razorpay"), Shiprocket warning ("check wallet balance / serviceability" or "Cancel the shipment in Shiprocket manually").
  - Hide the card when nothing applies.
- **Tracking / AWB** card (client, works at ANY status): shows "AWB · courier" with an "Edit" button (form open by default when no AWB). Fields AWB and Courier; "Save tracking" (disabled until changed; empty AWB clears tracking after a confirm); note "Saving overwrites whatever Shiprocket assigned. Leave the AWB empty to clear tracking." **"Sync from Shiprocket"** button (only if pushed to Shiprocket): toast "Already up to date" or "Synced from Shiprocket: AWB a → b, courier …, status …".
- Side column: **Customer** (profile name or shipping name, phone), **Delivery Address**, **Payment** (Method "Cash on Delivery"/"Online", Status coloured, payment id), **Shipment** (if AWB or courier order: Courier, AWB linked to tracking URL, Shiprocket ID), **Timeline** (history newest first: status pill, time, and the note under it).

### 6.12 Products `/admin/products`
- Filter tabs with counts: All, Low Stock (active, stock > 0, stock ≤ threshold), Out of Stock (stock ≤ 0, active or not), Featured, Deal of the Day. Active filter also shows a coloured badge next to the title. On Featured/Deal tabs show the homepage rule ("The homepage shows the top N featured products…" / "…the 8 newest deal-of-the-day products.") with "Manage this section →" to `/admin/featured` (or `?tab=deal-of-day`). "+ Add Product" button.
- **ProductsTable** (client): search (name, SKU, category, subcategory, brand; every word must match), "N of M products". Columns: Product (thumbnail, name, "Category › Subcategory · Brand"), SKU, Price, Stock pill (red "Out of stock" / yellow when ≤5 / green "N in stock"), Status (Active / Hidden), Placement (Featured purple / Deal of Day orange / —), **COD switch** (toggles `cod_available` instantly via PATCH, toast "COD enabled/disabled for …"), Edit link, Delete (confirm; on FK error show "This product is part of existing orders — hide it instead of deleting.").

### 6.13 Add / Edit product `/admin/products/new`, `/admin/products/[id]`
Form sections:
- **Basic Info**: Product Name*, SKU*, Brand (select, "No brand"), HSN Code (help: printed on the GST invoice; blank prints a dash), Category*, Subcategory (required if the chosen category has subcategories; list filtered by category; reset when category changes), Short Description, Full Description.
- **Pricing & Stock**: MRP*, Selling Price*, live "X% off" box; Stock Quantity*, Low Stock Alert (default 5), Weight (g), Length/Breadth/Height (cm, step 0.1) + note "Dimensions set the parcel's volumetric weight (L×B×H ÷ 5000)…".
- **Images**: thumbnails of existing images (first = "Primary" badge, star to make primary, × to remove), previews of new files, "Add" multi-file picker. At least one image required.
- **Specifications**: rows of Group (default "General") / Name / Value with remove ×, "+ Add spec"; empty rows dropped.
- **Visibility**: Active (visible in store), Featured product, Deal of the day, Cash on Delivery available ("off → customer must pay online for any cart with this product").
- **SEO (optional)**: Meta Title, Meta Description.
- Buttons: Create Product / Save Changes, Cancel, Delete (edit only).
- Validation (client + server): required fields; selling ≤ MRP; `discount_percent` = round((mrp − selling)/mrp × 100). Duplicate SKU → "A product with this SKU already exists". Slug from name; on unique clash retry once with a short suffix.
- Save flow: (new) POST product → get id; upload each new file to the image upload API (resize to max 1200 px wide webp q82 + 400×400 cover thumbnail webp q75, stored under `products/{id}/main_{ts}.webp` / `thumb_…`); then PATCH with fields (edit only) + full image list (replaces all images; first is primary, sort_order = index) + full spec list (replaces all). Changing featured/deal flags revalidates the cached homepage.

### 6.14 Featured & Deals `/admin/featured`
Tabs "Featured Products (N)" and "Deal of the Day (N)" (`?tab=deal-of-day`). List order = same as homepage: by `featured_position` / `deal_position` ascending (nulls last), then fallback `sold_count` desc (featured) / `created_at` desc (deals). If the position columns don't exist yet, fall back to the default order instead of failing.
- **Add a product**: search box (≥2 chars, debounced 300 ms, ignores stale responses) calling `GET /api/admin/products?q=` (name or SKU, 20 results). Each result: image, name, SKU · price, "· Hidden", "· Out of stock", and "Add" or a green "Added" badge. Adding sets the flag, appends to the bottom and saves the order.
- **Current list**: numbered rows with ↑ / ↓ buttons, "Top" button (except first), image, name, SKU · price, badges Hidden / Out of stock / **"Not on homepage"** (rows beyond the homepage cap, greyed), Edit link, and an on/off toggle that removes it from the section. Header: "Homepage shows the top X of N, in this order. Use the arrows to reorder." Section caps: Featured **5**, Deals **8**.
- Reordering applies instantly and saves after a 600 ms pause (a burst of clicks = one request) to `POST /api/admin/featured/reorder {flag, ids}` which writes position 1..n and revalidates the homepage. Toast "Order saved". If the column is missing, return a clear "run the migration first" error.

### 6.15 Categories `/admin/categories`
Grid of category cards (ordered by sort_order, name): image, name, "Hidden" badge, description, "Sort: N", delete button (FK error → "This category has products or subcategories — remove those first."). Subcategory chips (small image, name, "(hidden)", × delete; FK error → "This subcategory has products — reassign or remove them first."). "+ Add subcategory" inline form: image picker, name*, sort, active. "+ Add Category" form: image picker, name*, description, sort order, active. Images upload through a generic admin image API (single webp, folder `categories` / `subcategories`). Slugs auto-generated with the same clash retry.

### 6.16 Customers `/admin/customers`
All non-admin profiles, newest first. Email from the auth users list. Per customer: total order count (all orders) and Total Spent (sum of paid orders). Client table with search (name, email, phone): Customer (initials avatar, name or "Unnamed"), Contact (email, phone), Orders, Total Spent, Joined (e.g. "5 Aug 2026"), and "N of M customers".

### 6.17 Coupons `/admin/coupons`
Description "Create discount codes and choose who can use them." "+ Create Coupon" / edit form: Coupon Code* (forced uppercase), Who can use it? (Everyone / First-time customers only), Discount Type (Percentage / Fixed ₹), Value*, Max Discount (only for percentage), Min Order, Usage Limit (blank = unlimited), Expires On, Active. Server: value > 0; percentage ≤ 100; duplicate code → "A coupon with this code already exists". Card grid: code, "X% off (up to ₹Y)" or "₹X off", badges First-time only / Everyone, Active / Inactive / Expired, Min ₹, "Used a/b", "Till date"; edit and delete (confirm) buttons.

### 6.18 Analytics `/admin/analytics`
Non-split RevenueChart for the **last 30 days** (every day pre-filled with zero, revenue = revenue bucket). "Top Selling Products" table (top 10 by units from order items of revenue-bucket orders): #, Product, Units Sold, Revenue (qty × price), Rating "★ 4.5".

### 6.19 Monthly Statement `/admin/statement`
See section 10.

---

## 7. Admin API routes

All require admin unless noted. Return `{ data }` or `{ error }` with a proper status.

| Route | Purpose |
|---|---|
| `GET /api/admin/products?q=` | Product search for the Featured picker |
| `POST /api/admin/products` | Create product |
| `PATCH /api/admin/products/[id]` | Update any sent field; replace images / specs if arrays sent; revalidate homepage when flags change |
| `DELETE /api/admin/products/[id]` | Delete (images first); FK-safe message |
| `POST /api/upload` | Product image upload (main + thumb) |
| `POST /api/admin/upload-image` | Generic image upload `{file, folder}` |
| `POST /api/admin/featured/reorder` | Save section order |
| `POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/[id]` | Categories |
| `POST /api/admin/subcategories`, `DELETE /api/admin/subcategories/[id]` | Subcategories |
| `POST /api/admin/coupons`, `PATCH/DELETE /api/admin/coupons/[id]` | Coupons |
| `PATCH /api/orders/[id]` | All order actions (below). `action=cancel` is the customer path (no admin needed) |
| `GET /api/orders/[id]/invoice` | Invoice PDF (owner or admin) |
| `GET /api/admin/statement?month=YYYY-MM&format=json|csv|xlsx|pdf` | Statement data / files |
| `GET /api/admin/statement/invoices?month=&kind=issued|pending` | All invoices of a month as one PDF |
| `POST /api/webhooks/shipment-status` | Courier webhook (token, not admin) |

### `PATCH /api/orders/[id]` actions
- `action: "cancel"` (customer): must own the order; status placed/confirmed; within 12 h. Cancel on courier, settle (refund + stock), set cancelled (+ refunded), history "Cancelled by customer[ — refund initiated]" with `updated_by` = customer.
- Everything else requires admin.
- `action: "set_discount", admin_discount`: only when placed/confirmed; 0 ≤ amount ≤ subtotal − discount + shipping; sets `admin_discount` and `total_amount = base − amount`; history "Admin discount of X applied" / "removed".
- `action: "set_tracking", tracking_number, courier_name`: any status; empty AWB clears AWB, URL and courier; tracking URL `https://shiprocket.co/tracking/{awb}`; history "AWB set manually to X (courier) — replaced Y" or "AWB cleared (was Y)".
- `action: "sync_shiprocket"`: needs a courier order id; fetch the live shipment; overwrite AWB and courier if different; map status, never regress an ended order, stamp its timestamp; settle on cancelled/returned; collect COD on delivered; if nothing changed → "Already up to date with Shiprocket."; history "Synced from Shiprocket: …".
- `action: "retry_shiprocket"`: run fulfilment (below) without changing status; return `ok` + `shiprocket_error`.
- `status: <next>` with optional `note`: stamp `confirmed_at` / `packed_at` / `shipped_at` / `delivered_at` / `cancelled_at`. On **packed** run fulfilment and merge its fields (a courier failure must not block packing; return the error). On **shipped** a manually sent AWB always wins. On **delivered** apply `collectCodOnDelivery`. On **cancelled** cancel on courier, then settle; on **returned** settle only. Insert history (note + " — Refund initiated" when refunded) with `updated_by` = admin. Email the customer on shipped and delivered. Respond with `shiprocket_error`, `refunded`, `refund_error`.

### Courier fulfilment (`fulfillShiprocket`), idempotent and safe to retry
1. Already has an AWB → do nothing.
2. Not yet pushed → create the courier order with package weight/dimensions from the items (same calculation as checkout), payment method COD/Prepaid, `sub_total`, `shipping_charges`, `total_discount = discount_amount + admin_discount`. Channel order id = `order_number`, or `order_number-R{attempt}` when `shiprocket_attempt > 0` (a re-ship after cancellation must use a new id or the courier returns the old cancelled shipment). **Save the courier order/shipment ids and attempt+1 immediately**, before asking for an AWB.
3. Pick the cheapest serviceable courier for the pincode/weight, passing the COD flag and order value (the same courier the customer was quoted). Generate the AWB with it; if that fails, retry with auto-assign.
4. Save AWB, courier name and tracking URL. If the AWB response has no courier name, fetch it from the courier order; if still missing, log it.

### Courier webhook `POST /api/webhooks/shipment-status`
- URL path must not contain "shiprocket", "sr" or "kr" (Shiprocket rejects those). Optional shared token in header `x-api-key` (env `SHIPROCKET_WEBHOOK_TOKEN`); wrong token → 401.
- **Always answer 200** for anything not actionable (bad payload fields, unknown order, unknown status), or the courier refuses to save the webhook.
- Find the order by trying, in order: `channel_order_id`→order_number, `order_id`→order_number, `sr_order_id`→courier order id, `order_id`→courier order id, `awb`→tracking_number (AWB last, because a reassigned courier sends a new AWB).
- First apply AWB / courier changes (overwrite, independent of status) + history "Shiprocket updated shipment: …". Then map the status; ignore unknown; never regress an ended order; skip no-change. Stamp timestamps, collect COD on delivered, settle on cancelled/returned, history "Auto-updated via Shiprocket (STATUS)[ — refund initiated]" with `updated_by` null, email on shipped/delivered.

### COD remittance (Shiprocket payouts)
`getCodRemittances(from, to)`: call the remittance endpoint with dates like `2026-Sep-01`, in **28-day windows** (the API refuses longer), never more than 1 year back, up to 20 pages of 100 per window. Each payout: id, createdAt, codPayable, deduction (fee), walletRecharge, remitted, UTR, status, `settled = status === "Remittance success"`. Dedupe by id, newest first.

---

## 8. Caching and performance rules
- Every admin page and report route: no caching (`force-dynamic`, `Cache-Control: no-store` on files).
- Aggregate in application code over one fetch per window, not with DB functions that may not exist.
- Row limits: drill-down lists 100 (orders, revenue, product orders) or 500 (failed, cancelled, RTO, collected, courier detail); aggregates up to 10,000 or paged fully (courier stats).
- Run independent queries in parallel.

---

## 9. GST tax invoice

### 9.1 Maths (one shared function used by the PDF and the statement)
- Prices are **tax-inclusive**. taxable = inclusive ÷ (1 + rate/100); tax = remainder.
- Intra-state (buyer state code == seller state code) → CGST + SGST; otherwise IGST. Unknown state → treat as inter-state.
- State codes: full Indian GST state code table (Jammu and Kashmir 01 … Ladakh 38, Delhi 07, Maharashtra 27, Karnataka 29, etc.) plus aliases (new delhi, delhi ncr, nct of delhi → delhi; orissa → odisha; pondicherry → puducherry; uttaranchal → uttarakhand; j&k → jammu and kashmir; tamilnadu → tamil nadu).
- Order-level discount (coupon + admin) is spread across lines pro-rata to line value; the last line takes the remainder; never more than the goods value.
- Intra-state: round the half-tax first and use it for both CGST and SGST (they must print identical); the taxable value absorbs the paisa difference.
- Delivery charge is its own inclusive line at the same rate.
- Totals: taxable, cgst, sgst, igst, tax, net, and **net must equal the order's total_amount exactly**.
- HSN per line: the item's snapshot, else the product's current HSN, else blank.

### 9.2 Invoice PDF (A4, @react-pdf/renderer)
Title "TAX INVOICE" (or "DRAFT — NOT YET ISSUED" for drafts). Brand logo text. **SOLD BY** block (seller name, address, state, phone, GSTIN, CIN, website, email; every field overridable by env vars: INVOICE_SELLER_NAME, INVOICE_SELLER_ADDR1, INVOICE_SELLER_ADDR2, INVOICE_SELLER_CITY, INVOICE_SELLER_STATE, INVOICE_SELLER_STATE_CODE, INVOICE_SELLER_PHONE, INVOICE_SELLER_GSTIN, INVOICE_SELLER_CIN, INVOICE_SELLER_SITE, INVOICE_SELLER_EMAIL — never reuse BoxDeal's values; ask the user for the new seller's details. The seller state code decides CGST+SGST vs IGST). **SHIPPING ADDRESS** block. **INVOICE DETAILS**: INVOICE NO., INVOICE DATE, ORDER NO., ORDER DATE, CHANNEL, SHIPPED BY, AWB NO., PAYMENT METHOD, REMARK. Items table: S.NO., PRODUCT NAME, HSN, QTY, UNIT PRICE, UNIT DISCOUNT, TAXABLE VALUE, CGST / SGST or IGST (Value @ Rate), TOTAL (Including GST); delivery line; NET TOTAL (In Value). "Authorized Signature for {seller}". "Whether tax is payable under reverse charge- No". Dates DD/MM/YYYY in the business zone. File name `INV00001.pdf`.

### 9.3 Who gets an invoice, and when
`canInvoice(order) = delivered_at is set AND status in (delivered, returned)`. An RTO is never invoiced. The download route: owner or admin only (others get 404); not invoiceable → 409 ("The invoice is issued once the order is delivered."); then call `issue_invoice_number` and render. The admin order page shows the button only when `canInvoice` is true; use the same function on client and server.

---

## 10. Monthly Statement `/admin/statement`

### 10.1 Controls
Month dropdown (last 24 months, newest first, labels like "September 2026"; invalid `?month` → current month). "Download Excel" and "Download PDF" buttons (fetch the file; on error show the JSON error as a toast instead of navigating). Subtitle "{Month} · generated {dd/MM/yyyy, hh:mm a}". Month boundaries: 1st 00:00 to next month's 1st 00:00 (exclusive) in the business zone.

### 10.2 Computation (two views that use different dates on purpose)
Queries, in parallel:
1. Orders **placed** in the month (activity).
2. COD orders **delivered** in the month, delivered + paid (money earned), with items.
3. Online orders **placed** in the month, revenue status + paid (money earned), with items and invoice number.
4. Orders with an invoice number, delivered, **invoice_date** in the month, in number order (GST), with items + HSN.
5. Status-history rows `returned` created in the month, with their order (returns, by the day the return was recorded, not `updated_at`).
6. `voided_invoices` dated in the month.

Outputs:
- **Activity** (placed in month): placed, delivered, still in transit, cancelled, returned/RTO, failed/never paid; plus paid orders split by the month the money arrived (online placed_at, COD delivered_at).
- **Money earned** (2 + 3): paid orders, how many were ordered in an earlier month, split by order month, gross (subtotal), discount (coupon + admin), delivery, **net** (total), COD orders/amount, prepaid orders/amount, and **awaiting invoice** (online paid but no invoice yet).
- **Returns**: RTO (never delivered) and customer return, orders and value.
- **Top products**: top 10 by value (qty × price) among money-earned orders.
- **GST**: invoice register rows (number, date, order no, state, state code, payment COD/Prepaid, taxable, cgst, sgst, igst, total), totals, HSN summary (product lines only, delivery excluded; missing HSN as "(not set)"; sorted by taxable), state-wise summary (state, code, invoices, taxable, cgst, sgst, igst), voided list. All amounts rounded to 2 decimals.

### 10.3 Page layout
1. **Money Earned**: explanation ("Money that arrived in {month}. Online orders count in the month they were paid; COD orders count in the month they were delivered. Refunded, cancelled and returned orders are left out."). Cards: Paid orders ("N of these were ordered in an earlier month" / "all ordered this month"), Net sales ("₹gross goods − ₹discount discount + ₹delivery delivery"), COD collected, Prepaid. Then "N paid orders in {month} — when were they ordered?" month table (Month, COD, Online, Orders, Amount; current month tagged "(this month)").
2. **Shiprocket COD Remittance · {month}** panel: stats Customers paid courier (our COD collected), Shiprocket paid us for (codPayable, "COD settled in N payouts"), Shiprocket fee (−), Wallet recharge (− if any), **Reached bank** (green), On the way (if pending). Payout table: Date, COD, Fee, Wallet, To bank, UTR, Status ("In bank" green or the raw status amber). On API failure show "Could not load from Shiprocket: …" without breaking the page.
3. **Order Activity** card (placed counts with ↳ sub-rows) + "N paid orders from {month} — which month was the money received?" table. **Returns** card (RTO and customer return with amounts).
4. **GST** section: explanation ("Invoices dated this month. An invoice is issued when the parcel is delivered — online orders are dated on their order day, COD on the delivery day. Prices are GST-inclusive at 18%."). Buttons "Download N invoices" (disabled at 0) and amber "Download N upcoming (draft)" (only if awaiting > 0; tooltip explains drafts have no number). Cards (amounts to the paisa, `₹1234.56`): Invoices raised (+ "+N online orders paid but not delivered yet…"), Taxable value, Total GST ("CGST · SGST · IGST"), Invoice value. Voided list line if any.
5. **HSN Summary** (GSTR-1 Table 12): HSN, Qty, Taxable, GST. **State-wise Summary** (GSTR-1 Table 7, B2C): State, Code, Taxable, CGST+SGST, IGST.
6. **Invoice Register** with a Total footer.
7. **Top Products**: #, Product, SKU, Qty, Value.

### 10.4 Exports
- **Excel** (`exceljs`): sheets **Summary** (banner, sections ORDER ACTIVITY, MONEY EARNED, RETURNS, GST SUMMARY), **Invoice Register**, **HSN Summary**, **State Summary**, **Top Products**; each with a title banner, styled header row, number formats and a SUM totals row. File `{{BRAND}}-Statement-YYYY-MM.xlsx`.
- **PDF**: "MONTHLY STATEMENT" with brand header, "All amounts in INR", money-earned breakdown with NET SALES, paid-orders-by-month, returns, GST components with TOTAL GST, HSN table, state table, invoice register with TOTAL.
- **CSV**: same data via `format=csv`.
- **Invoice bundle PDF** (one invoice per page): `kind=issued` = this month's register in number order (`{{BRAND}}-Invoices-YYYY-MM.pdf`); `kind=pending` = online orders paid this month with no invoice yet, printed as **drafts with no number** ("— (issued on delivery)"), never minting a number (`…-Draft-Invoices-…`). 404 with a message when empty.

---

## 11. Gotchas that must be handled (each one was a real bug)
1. A dismissed online payment is stored as `cancelled` + `failed`: it is a **failed** order, not a cancellation.
2. An order still at `placed` was never paid: it is failed, never on the packing queue, never "pending".
3. Every path that marks an order delivered must mark COD paid.
4. A cancellation from anywhere (admin, customer, courier panel) must refund online payment and restore stock (only if stock was taken).
5. Cancelling must also cancel the courier shipment (AWB first, then order), or the parcel still gets delivered.
6. Courier webhooks fire once and are never replayed: the "Sync from Shiprocket" button is the recovery path.
7. A courier reassignment sends a new AWB: always overwrite, and match orders by AWB last.
8. Re-shipping a cancelled order needs a new channel order id (`-R1`, `-R2`…).
9. Save courier order ids before AWB generation, so a retry never creates a duplicate.
10. An RTO has no `delivered_at`; that is the only reliable RTO vs customer-return separator. No invoice for an RTO.
11. Invoice numbers are permanent; voids go to `voided_invoices`.
12. All "today / this month" logic must use the business timezone.
13. A pill count must always equal the list it opens (filter in the DB before the row limit).
14. Junk query params (`?status=xyz`, `?state=xyz`, `?pay=xyz`) are ignored, never used to filter everything away.
15. Escape `, ( )` in any user text placed inside an OR filter.
16. A courier API outage must never break a page: catch and show the error inline.
17. Products in existing orders cannot be deleted: tell the admin to hide them.

---

## 12. Customer-side pieces the panel depends on
Make sure these exist on the storefront (build them if missing; ask first if unsure):
- Checkout hides COD (and the COD order API rejects it) when **any** cart product has `cod_available = false`.
- Homepage "Featured" and "Deal of the Day" sections use the same ordering helper as the admin page and the same caps (5 / 8), only active products.
- Customer order page: "Cancel order" (12 h, placed/confirmed) using `action: "cancel"`, and an invoice download button shown only when `canInvoice` is true.
- Checkout quote and courier fulfilment use the same package-weight calculation, so the courier picked at packing is the one the customer was charged for.

---

## 13. Build order
1. Data model + migrations (tables, columns, sequence, functions, trigger, grants, storage bucket).
2. Shared modules: time/periods, order buckets, fulfilment side effects, status mapping, constants, formatting, `requireAdmin`.
3. Admin layout + sidebar + shared components (StatsCard, PeriodSelector, OrdersTable, RevenueChart).
4. Orders list + search + order detail + `PATCH /api/orders/[id]` + courier client + webhook.
5. Dashboard + Orders / Revenue / Collected / Failed / Cancelled / RTO tabs.
6. Products, product form, image upload, Featured & Deals, Categories, Customers, Coupons, Analytics.
7. Product Sales, Delivery & Couriers.
8. GST invoice (maths, PDF, route) and Monthly Statement (computation, page, Excel/PDF/CSV, invoice bundles, COD remittance panel).
9. Storefront dependencies (section 12).

---

## 14. Acceptance checklist (verify every line)
- [ ] Non-admin is redirected; admin pages are noindex; all 15 sidebar items open working pages in the listed order.
- [ ] Changing the period on any page keeps the other filters; "Any day" and custom range work; labels read correctly.
- [ ] Dashboard: Orders = Prepaid Orders + COD Orders; revenue = prepaid + COD revenue; collected + yet-to-collect = revenue; every card links to a page whose headline shows the same number.
- [ ] Failed + cancelled + RTO + revenue orders = all orders placed in the window.
- [ ] Orders drill-down: payment pills and status pills combine; counts match lists.
- [ ] Money Collected month table total = collected card; top customers link to a working search.
- [ ] Cancelled tab shows correct actor for a customer cancel, an admin cancel and a webhook cancel.
- [ ] RTO tab splits RTO vs customer return by `delivered_at`.
- [ ] Delivery tab: every count links to a list of exactly that many parcels; partner rows expand to services; mobile cards render; notes appear only when relevant.
- [ ] Product Sales: cancelled / unpaid / returned units never appear in "Units sold"; detail status filter changes every number below it; search totals follow the search.
- [ ] Orders search finds an order by number, AWB, phone typed with +91 and spaces, email, city, product name, coupon, payment id and UUID, including cancelled/failed orders.
- [ ] Order detail: full status walk placed → delivered; packing creates the courier order and AWB; retry works; manual AWB at any status; sync reports changes; cancel refunds + restores stock + cancels shipment; mark returned refunds + restores stock; admin discount only before packing and capped; timeline shows notes.
- [ ] Webhook: always 200 on junk; applies AWB change without status change; never regresses delivered/cancelled/returned; COD becomes paid on delivery.
- [ ] Products: tabs and counts, search, COD switch, delete protection; product form validation, images (primary/reorder/remove), specs, SEO.
- [ ] Featured & Deals: search/add, reorder saves once after a burst, "Not on homepage" beyond the cap, homepage shows the same order.
- [ ] Categories/subcategories, customers, coupons CRUD and validation messages.
- [ ] Invoice: only after delivery, number stable on re-download, totals equal order total to the paisa, CGST = SGST on intra-state, IGST otherwise, RTO never invoiced.
- [ ] Statement: money earned uses arrival date, GST uses invoice date, HSN and state tables sum to the GST totals, Excel / PDF / CSV / invoice bundle / draft bundle all download, remittance panel tolerates API failure.
- [ ] Type-check and production build pass.
