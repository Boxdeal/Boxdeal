# Shipping charge fixes — how BoxDeal fixed them, and how to apply them to another store

This guide explains two rounds of fixes made to BoxDeal's delivery-charge and Shiprocket flow:

- **Round 1 (4 Oct 2026):** the parcel weight, the COD charge and the coverage charge were calculated wrongly, so customers were charged less than Shiprocket billed.
- **Round 2 (1 Nov 2026):** we now record what was quoted and what was actually paid, choose couriers by RTO risk as well as price, let an admin enter the measured box, and let an admin change the delivery address.

The other store has the same problems BoxDeal had **before 4 Oct**. Apply Round 1 first, because it fixes money that is being lost on every order. Round 2 builds on it.

Stack in the reference code: Next.js (App Router) + Supabase + Shiprocket. All file paths are BoxDeal's. Map them to the other store's files, and keep the behaviour the same.

---

## Part A — The problem (what BoxDeal did before 4 Oct)

Three separate places worked out the parcel weight, each in a different way:

| Step | Before 4 Oct | What went wrong |
|---|---|---|
| **Checkout quote** (delivery charge shown to the customer) | Summed each item's volumetric weight separately: `Σ (L×B×H ÷ 5000) × qty`, then took `max(actual, volumetric, 0.1)` | Roughly right, but it doesn't match the box Shiprocket is told about |
| **Shiprocket order creation** | Sent **actual weight only** (`Σ grams × qty`). Box = the **largest single item's** L, B and H | Shiprocket saw a much lighter, smaller parcel than the real one |
| **Courier choice at packing (AWB)** | Used **actual weight only** | The courier was chosen for the wrong weight |

When the courier then measured the real parcel, it was heavier or bigger, so Shiprocket charged a **weight discrepancy** fee on top. BoxDeal paid it.

The rate request had two more mistakes:

1. **No order value was sent** (`declared_value`). The COD charge is a percentage of the order value (about **1.82%, minimum ₹42.9**). Without the value, Shiprocket quoted only the minimum COD fee, so expensive COD orders were badly under-quoted.
2. **The coverage charge was ignored.** Shiprocket's serviceability `rate` = freight + COD charge only. The account also always pays `coverage_charges` ("Auto Secured" protection), a slab based on order value: about **₹0 up to ₹2.5k, ₹49 up to ₹4.7k, ₹99 above that, and ₹105 at ₹10k**. The cheapest courier was also chosen on `rate` alone, without coverage.

**Real example:** order BD20261004-1873 was quoted **₹212**, but Shiprocket actually charged **₹302.93**.

---

## Part B — Round 1 fixes (4 Oct 2026)

### B1. One function sizes the parcel: `computePackage()`

File: `src/lib/shipping/package.ts`. Checkout, Shiprocket order creation and the AWB courier choice **all** call this function. No other code may work out a weight itself.

#### The formula

For the cart items `i` (each with `qty`, `grams`, `L`, `B`, `H` in cm):

```
actual weight (kg) = Σ (grams_i × qty_i) ÷ 1000

total volume (cm³) = Σ (L_i × B_i × H_i × qty_i)

box length  L = ceil( max L_i )
box breadth B = ceil( max B_i )
box height  H = max( 1, ceil( total volume ÷ (L × B) ) )      ← items "stacked" in one box

then add packing material on every side:
L = L + 1,  B = B + 1,  H = H + 1                              (PACKING_PADDING_CM = 1)

if no item has dimensions → box = 10 × 10 × 5 cm (no padding)

volumetric weight (kg) = L × B × H ÷ 5000                      (VOLUMETRIC_DIVISOR = 5000)

chargeable weight (kg) = ceil( max(actual, volumetric, 0.1) × 100 ) ÷ 100   ← rounded UP to 10 g
```

Couriers bill on the **greater** of actual and volumetric weight. The box is sized so that Shiprocket's own `L×B×H ÷ 5000` gives exactly our volumetric weight.

#### Worked example 1: a bulky, light item

Two speakers, each boxed at 30 × 20 × 20 cm and weighing 1.2 kg:

```
actual      = 1200 × 2 ÷ 1000                = 2.4 kg
volume      = 30 × 20 × 20 × 2               = 24,000 cm³
L = 30, B = 20, H = ceil(24000 ÷ 600)        = 40
padded box  = 31 × 21 × 41
volumetric  = 31 × 21 × 41 ÷ 5000            = 5.338 kg
chargeable  = max(2.4, 5.338, 0.1) → 5.34 kg
```

| | Before 4 Oct (sent to Shiprocket) | After |
|---|---|---|
| Box | 30 × 20 × 20 (one speaker) | **31 × 21 × 41** (both speakers + padding) |
| Weight | 2.4 kg (actual only) | **5.34 kg** |

Before the fix, Shiprocket priced 2.4 kg but the courier received a ~5 kg parcel, so a weight discrepancy fee followed. Now the quote, the label and the bill all use 5.34 kg.

#### Worked example 2: mixed items, where actual weight wins

2 earbuds (10 × 5 × 4 cm, 80 g each) and 3 power banks (10 × 5 × 6 cm, 250 g each):

```
actual      = (80×2 + 250×3) ÷ 1000          = 0.91 kg
volume      = 10×5×4×2 + 10×5×6×3            = 400 + 900 = 1,300 cm³
L = 10, B = 5, H = ceil(1300 ÷ 50)           = 26
padded box  = 11 × 6 × 27
volumetric  = 11 × 6 × 27 ÷ 5000             = 0.356 kg
chargeable  = max(0.91, 0.356, 0.1)          = 0.91 kg
```

#### Code

```ts
const DEFAULT_BOX = { length: 10, breadth: 10, height: 5 };
const PACKING_PADDING_CM = 1;
const VOLUMETRIC_DIVISOR = 5000;

export function computePackage(items: WeighableItem[]): ParcelPackage {
  let actualGrams = 0, totalVolume = 0, maxLength = 0, maxBreadth = 0;
  for (const it of items) {
    const qty = Math.max(0, Number(it.quantity) || 0);
    if (!qty) continue;
    const l = Number(it.length_cm) || 0, b = Number(it.breadth_cm) || 0, h = Number(it.height_cm) || 0;
    actualGrams += (Number(it.weight_grams) || 0) * qty;
    totalVolume += l * b * h * qty;
    maxLength  = Math.max(maxLength, l);
    maxBreadth = Math.max(maxBreadth, b);
  }

  let { length, breadth, height } = DEFAULT_BOX;
  if (totalVolume > 0) {
    length  = Math.ceil(maxLength);
    breadth = Math.ceil(maxBreadth);
    height  = Math.max(1, Math.ceil(totalVolume / (length * breadth)));
    length  += PACKING_PADDING_CM;
    breadth += PACKING_PADDING_CM;
    height  += PACKING_PADDING_CM;
  }

  const actualKg     = actualGrams / 1000;
  const volumetricKg = (length * breadth * height) / VOLUMETRIC_DIVISOR;
  const chargeableKg = Math.ceil(Math.max(actualKg, volumetricKg, 0.1) * 100) / 100;
  return { actualKg, volumetricKg, chargeableKg, length, breadth, height };
}
```

**Where it is used:**
- **Checkout quote:** `chargeableKg` is sent as `weight` to `/courier/serviceability`.
- **Shiprocket order creation** (`/orders/create/adhoc`): `length`, `breadth`, `height` and `weight: chargeableKg`.
- **Courier choice at packing:** the same `chargeableKg`.

Product weight and dimensions are always read from the **products table** at quote and packing time, never from the client.

### B2. The real Shiprocket cost: send the order value, and add coverage

File: `src/lib/shiprocket/index.ts`.

```
declared_value = order value Shiprocket will see = goods − discount + delivery charge
                 (sent as an integer ₹ in the serviceability query)

cost of a courier = rate + coverage_charges
                    (rate already includes freight + COD charge)
```

```ts
const params = new URLSearchParams({
  pickup_postcode, delivery_postcode, weight: String(chargeableKg), cod: cod ? "1" : "0",
});
if (declaredValue > 0) params.set("declared_value", String(Math.round(declaredValue)));
// GET /courier/serviceability/?…
// for each available_courier_companies[c]:
const cost = Number(c.rate) + (Number(c.coverage_charges) || 0);
```

### B3. Re-quote until the charge settles

The delivery charge is itself part of the order value. A higher order value can raise the COD % amount or move the order into the next coverage slab. So the quote runs in a short loop (file: `src/lib/shipping/index.ts` → `getCartDeliveryQuote`):

```
goods = Σ(DB selling_price × qty) − discount

rate₀   = cost for (weight, pincode, cod, declared_value = goods)
charge₀ = min(ceil(rate₀), 499)

repeat up to 4 more times:
    rateₙ   = cost for (…, declared_value = goods + chargeₙ₋₁)
    chargeₙ = min(ceil(rateₙ), 499)
    stop when chargeₙ == chargeₙ₋₁  or  chargeₙ == 499

customer delivery charge = final charge          (cap ₹499; the store absorbs anything above)
```

This usually settles in 2–3 calls.

```ts
let final = await getDeliveryRate(pincode, chargeableKg, cod, goods);
if (!final.serviceable) return { serviceable: false, delivery_charge: null, courier_name: null };
for (let i = 0; i < 4; i++) {
  const charge = applyDeliveryCap(final.rate);           // Math.min(Math.ceil(rate), 499)
  if (charge >= DELIVERY_CHARGE_CAP) break;
  const next = await getDeliveryRate(pincode, chargeableKg, cod, goods + charge);
  if (!next.serviceable) break;
  final = next;
  if (applyDeliveryCap(next.rate) === charge) break;
}
```

### B4. The server recomputes everything

- **Checkout display quote** (`POST /api/shipping/quote`): goods are summed from **database prices**. The client's coupon discount is used only to trim the value for display.
- **Order creation** (`/api/orders/cod`, `/api/payments/create`): prices, coupon and delivery charge are all recomputed on the server, with `goods = subtotal − discount`. A value from the client is never trusted.
- **COD quote and COD order:** use `cod = true`, so only couriers that can do COD to that pincode count.

### B5. Rate cache

Checkout asks for a quote again on every address or payment-method change, and order creation asks once more seconds later. So the answer is cached in memory for **10 minutes**, keyed by `(pickup pincode, delivery pincode, weight, cod, declared value)`, with at most 1000 entries. A Shiprocket **error is never cached**, so a short outage is never remembered as "not serviceable".

---

## Part C — Round 2 fixes (1 Nov 2026)

### C1. Choose the courier on price **and** RTO risk

Picking the cheapest courier sends parcels to whoever is cheapest, even if that courier brings far more of them back. An RTO pays the freight **twice** (out and back), and the sale is lost.

File: `src/lib/shipping/courier-quality.ts`, used inside `getDeliveryRate`.

```
for each courier company (Xpressbees, Delhivery, Ekart …):
    attempted = delivered + customer returns + RTO          (last 180 days, from our own orders)
    RTO share = RTO ÷ attempted
    if attempted < 15 → use the average RTO share of all companies

an order counts as RTO when status = "returned" and delivered_at is empty

expected cost = cost × (1 + 2 × RTO share)
choose the courier with the lowest expected cost (ties → lower price)
```

- The RTO table is cached for 1 hour.
- If the stats can't be loaded, the code falls back to price-only, so a quote is never blocked.
- Shiprocket's service names ("Xpressbees Surface 1kg") are mapped to their company with the same matching the admin's Delivery & Couriers tab uses (`courierPartner()`).

**BoxDeal's data at the time:** Ekart 62% RTO; Xpressbees, Shadowfax, Delhivery and Amazon 26–31%. So Ekart is chosen only when it is about 30% cheaper:

```
Xpressbees ₹100 @ 28% → 100 × 1.56 = ₹156.6
Ekart      ₹80  @ 62% →  80 × 2.24 = ₹179.0   (loses)
Ekart      ₹60  @ 62% →  60 × 2.24 = ₹134.3   (wins)
```

The customer's charge is the **chosen** courier's real cost (capped at ₹499). So when a more reliable courier is chosen, the charge can be slightly higher than the absolute cheapest one.

### C2. Save the quote on the order, and ship with that courier

New order columns: `quoted_courier_id`, `quoted_courier_name`, `quoted_rate` (cost before the cap) and `quoted_weight_kg`. Both order-creation routes save them right after the order is inserted.

At packing, couriers are tried in this order:
1. **The quoted courier.** The customer's charge came from its rate.
2. **Today's best courier** (price + RTO), if (1) can't take the shipment now.
3. **Shiprocket's auto-assign**, so a parcel is never stuck.

### C3. Record what the shipment actually cost

After the AWB is assigned, the code asks Shiprocket for the price of **the courier that got the AWB**, at the weight that was sent. The AWB response includes `courier_company_id`. It saves `shipping_cost` and `shipped_weight_kg`.

Weight-discrepancy fees come later and are **not in Shiprocket's public API**. So an admin copies them from the Shiprocket panel into `shipping_cost_extra` on the order page.

```
difference = customer delivery charge − (shipping_cost + shipping_cost_extra)
             positive → delivery was covered; negative → the store paid the gap
```

- **Order page:** a "Shipping Cost" panel shows the quote, the parcel, the actual cost, the extra charge and the difference.
- **Report page:** `/admin/dashboard/shipping-cost` shows every shipment in a period, worst difference first. It has a "Cost more than charged" filter and totals.

### C4. The admin can enter the measured box before packing

New columns: `parcel_length_cm`, `parcel_breadth_cm`, `parcel_height_cm` and `parcel_weight_kg`. Fulfilment uses `resolveParcel()` instead of `computePackage()`:

```
start from computePackage(items)
if L, B and H were all entered → box = ceil(L) × ceil(B) × ceil(H)   (no extra padding; it was measured)
if weight was entered          → actual = entered kg
volumetric = L × B × H ÷ 5000
chargeable = ceil( max(actual, volumetric, 0.1) × 100 ) ÷ 100
```

- If none of it is filled in, the computed box is used, exactly as before.
- If only one or two sides are entered, the box entry is ignored.
- The values can be edited only until the order is pushed to Shiprocket.
- The customer's charge does not change.

Example (the two speakers): computed 31×21×41, 5.34 kg. The admin enters 40×30×25 → volumetric = 40×30×25 ÷ 5000 = **6 kg**, so 6 kg is sent to Shiprocket.

### C5. Products must have a weight and a size

The product form and both product APIs now reject a weight, length, breadth or height of 0 or blank. A 0 silently under-charges delivery. The PATCH API checks only the fields actually sent, so toggling a flag still works.

### C6. A Shiprocket error is no longer reported as "not deliverable"

Before, if Shiprocket returned an error, the pincode was treated as unserviceable. Now an error is passed up, and checkout shows: *"Couldn't calculate the delivery charge right now. Please try again in a moment."*

### C7. The admin can change the delivery address (order page → Delivery Address → Edit)

| Order state | What happens |
|---|---|
| Not on Shiprocket yet | The order is updated. A new pincode is checked first (COD-capable if it's a COD order). |
| On Shiprocket, same pincode | `POST /v1/external/orders/address/update` (fields: `order_id`, `shipping_customer_name`, `shipping_phone`, `shipping_address`, `shipping_address_2`, `shipping_city`, `shipping_state`, `shipping_country`, `shipping_pincode`). If Shiprocket refuses, nothing changes. |
| On Shiprocket, new pincode | After the admin confirms: cancel the AWB (`/orders/cancel/shipment/awbs`), cancel the Shiprocket order (`/orders/cancel`), clear the Shiprocket ids and AWB, update the address, then create a new shipment. The re-ship uses a `-R<n>` channel order id. |
| Shipped / delivered / cancelled / returned | Not allowed. |

The customer's delivery charge never changes.

### C8. Webhook guard: ignore events from old shipments (**required if you re-ship**)

A cancelled old shipment still sends a "CANCELED" webhook that carries **our order number**. Without a guard, that event would cancel **and refund** the live order. So the webhook now ignores an event when:

```
payload.sr_order_id is present AND
  ( order has a Shiprocket id that is different from it
    OR order has neither a Shiprocket id nor an AWB )
```

An order whose AWB was typed in by hand (no Shiprocket id, but an AWB) still receives its updates.

### C9. Safe rollout

Every write to the new columns is a **separate, best-effort update** made after the main insert or update. So checkout and packing keep working even before the SQL migration has run. Never put the new columns into the order insert or the status update.

SQL (BoxDeal: `database/shipping_quality.sql`):

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quoted_courier_id    integer,
  ADD COLUMN IF NOT EXISTS quoted_courier_name  text,
  ADD COLUMN IF NOT EXISTS quoted_rate          numeric,
  ADD COLUMN IF NOT EXISTS quoted_weight_kg     numeric,
  ADD COLUMN IF NOT EXISTS parcel_length_cm     numeric,
  ADD COLUMN IF NOT EXISTS parcel_breadth_cm    numeric,
  ADD COLUMN IF NOT EXISTS parcel_height_cm     numeric,
  ADD COLUMN IF NOT EXISTS parcel_weight_kg     numeric,
  ADD COLUMN IF NOT EXISTS shipped_weight_kg    numeric,
  ADD COLUMN IF NOT EXISTS shipping_cost        numeric,
  ADD COLUMN IF NOT EXISTS shipping_cost_extra  numeric NOT NULL DEFAULT 0;
```

---

## Part D — Applying this to the other store

Do the steps in this order and check each one before moving on.

1. **Find the three weight calculations** (checkout quote, Shiprocket order creation, courier/AWB choice). Replace all three with one `computePackage()` (B1).
2. **Check the product data.** Count products with weight or L/B/H = 0 or blank, and fill them in from the real boxes. The formula is only as good as this data. Then add the validation (C5).
3. **Rate request:** send `declared_value` and add `coverage_charges` (B2). Add the re-quote loop and the ₹499 cap, or the other store's own cap (B3).
4. **Server-side recompute** at order creation (B4), and the rate cache with no caching of errors (B5).
5. **Verify on 3–4 real orders** (one light, one bulky, one high-value COD): the quote should match what Shiprocket's panel shows for that courier, weight and value.
6. Then Round 2: save the quote and use the quoted courier (C2), the cost record and report (C3), the RTO-aware choice (C1), and the box override (C4).
7. **If you add the address change with re-ship (C7), add the webhook guard (C8) first.**
8. Run the SQL migration (C9). If the database is Supabase and you create a new table, add explicit GRANTs. Adding columns to an existing table doesn't need them.

### Checklist

- [ ] One parcel function is used by the quote, the Shiprocket order and the courier choice
- [ ] The box is stacked (L = max, B = max, H from the summed volume), +1 cm padding, default 10×10×5
- [ ] chargeable = max(actual, L×B×H ÷ 5000, 0.1), rounded up to 0.01 kg
- [ ] `declared_value` is sent; cost = `rate + coverage_charges`
- [ ] The quote is repeated on goods + charge until it settles; capped
- [ ] Prices and charge are recomputed on the server at order creation
- [ ] Shiprocket errors aren't cached and aren't shown as "not serviceable"
- [ ] Products can't be saved without a weight and size
- [ ] Quote saved on the order; the quoted courier is tried first at packing
- [ ] Actual cost recorded at AWB time; extra charge field; report page
- [ ] Courier choice uses expected cost = cost × (1 + 2 × RTO share)
- [ ] Measured-box override before packing
- [ ] Address edit; the webhook ignores detached shipments
- [ ] All customer- and admin-facing messages are in English
