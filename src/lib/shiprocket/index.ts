import type { Order } from "@/types";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Shiprocket auth failed");

  cachedToken = {
    token:     data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // 9 days
  };

  return cachedToken.token;
}

async function shiprocketFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

export async function createShiprocketOrder(order: Order) {
  const items = (order.items ?? []).map((item) => ({
    name:      item.product_name,
    sku:       item.product_sku,
    units:     item.quantity,
    selling_price: item.selling_price,
  }));

  const totalWeight =
    (order.items ?? []).reduce((sum, _) => sum + 0.3, 0) || 0.5;

  const res = await shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify({
      order_id:         order.order_number,
      order_date:       order.placed_at,
      pickup_location:  "Primary",
      billing_customer_name:  order.shipping_full_name,
      billing_address:        order.shipping_address1,
      billing_address_2:      order.shipping_address2 ?? "",
      billing_city:           order.shipping_city,
      billing_pincode:        order.shipping_pincode,
      billing_state:          order.shipping_state,
      billing_country:        "India",
      billing_phone:          order.shipping_phone,
      shipping_is_billing:    1,
      order_items:            items,
      payment_method:         order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total:              order.subtotal,
      weight:                 totalWeight,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Shiprocket order creation failed");
  return data;
}

export async function generateAWB(shipmentId: number, courierId: number) {
  const res = await shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "AWB generation failed");
  return data;
}

export async function schedulePickup(shipmentIds: number[]) {
  const res = await shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Pickup scheduling failed");
  return data;
}

export async function trackOrder(awb: string) {
  const res = await shiprocketFetch(`/courier/track/awb/${awb}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Tracking failed");
  return data;
}
