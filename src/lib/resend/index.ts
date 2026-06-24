import { Resend } from "resend";
import type { Order } from "@/types";
import { formatPrice, formatDateTime } from "@/lib/utils/format";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`;

function orderItemsHtml(order: Order): string {
  return (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6">${item.product_name}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right">${formatPrice(item.selling_price)}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right">${formatPrice(item.total_price)}</td>
      </tr>`
    )
    .join("");
}

function baseTemplate(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#f9fafb;color:#111827">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <tr><td style="background:#f97316;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">BoxDeal</h1>
          <p style="margin:4px 0 0;color:#fed7aa;font-size:14px">${title}</p>
        </td></tr>
        <tr><td style="padding:32px">${bodyHtml}</td></tr>
        <tr><td style="background:#f3f4f6;padding:16px 32px;text-align:center">
          <p style="margin:0;color:#6b7280;font-size:12px">© 2026 BoxDeal. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const supportInbox = process.env.CONTACT_INBOX_EMAIL ?? "support@boxdeal.in";

  const html = baseTemplate(
    "New Contact Message",
    `
    <h2 style="margin:0 0 8px;font-size:20px">${input.subject}</h2>
    <p style="color:#6b7280;margin:0 0 24px">A new message was submitted from the Contact page.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#6b7280;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${input.name}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;font-weight:600">${input.email}</td></tr>
      ${input.phone ? `<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;font-weight:600">${input.phone}</td></tr>` : ""}
    </table>
    <div style="background:#f9fafb;border-radius:8px;padding:16px">
      <p style="margin:0 0 4px;font-weight:600">Message</p>
      <p style="margin:0;color:#374151;white-space:pre-line">${input.message}</p>
    </div>
    `
  );

  await resend.emails.send({
    from:     FROM,
    to:       supportInbox,
    replyTo:  input.email,
    subject:  `Contact: ${input.subject} — ${input.name}`,
    html,
  });
}

export async function sendOrderConfirmation(order: Order, email: string) {
  const html = baseTemplate(
    "Order Confirmation",
    `
    <h2 style="margin:0 0 8px;font-size:20px">Thank you for your order!</h2>
    <p style="color:#6b7280;margin:0 0 24px">Order <strong>${order.order_number}</strong> placed on ${formatDateTime(order.placed_at)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <thead><tr style="background:#f9fafb">
        <th style="padding:8px;text-align:left;font-size:13px">Product</th>
        <th style="padding:8px;text-align:center;font-size:13px">Qty</th>
        <th style="padding:8px;text-align:right;font-size:13px">Price</th>
        <th style="padding:8px;text-align:right;font-size:13px">Total</th>
      </tr></thead>
      <tbody>${orderItemsHtml(order)}</tbody>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:4px 0;color:#6b7280">Subtotal</td><td style="padding:4px 0;text-align:right">${formatPrice(order.subtotal)}</td></tr>
      ${order.discount_amount > 0 ? `<tr><td style="padding:4px 0;color:#16a34a">Discount</td><td style="padding:4px 0;text-align:right;color:#16a34a">-${formatPrice(order.discount_amount)}</td></tr>` : ""}
      <tr><td style="padding:4px 0;color:#6b7280">Shipping</td><td style="padding:4px 0;text-align:right">${order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : "FREE"}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;font-size:16px">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;font-size:16px">${formatPrice(order.total_amount)}</td></tr>
    </table>
    <div style="background:#f9fafb;border-radius:8px;padding:16px">
      <p style="margin:0 0 4px;font-weight:600">Delivering to:</p>
      <p style="margin:0;color:#6b7280">${order.shipping_full_name}<br>${order.shipping_address1}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
    </div>
    `
  );

  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Order Confirmed — ${order.order_number} | BoxDeal`,
    html,
  });
}

export async function sendOrderShipped(
  order: Order,
  email: string
) {
  const html = baseTemplate(
    "Your Order Has Shipped",
    `
    <h2 style="margin:0 0 8px;font-size:20px">Your order is on the way!</h2>
    <p style="color:#6b7280;margin:0 0 24px">Order <strong>${order.order_number}</strong></p>
    ${
      order.tracking_number
        ? `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 4px;color:#9a3e0d;font-weight:600">Tracking Number</p>
      <p style="margin:0 0 12px;font-size:22px;font-weight:700;letter-spacing:2px">${order.tracking_number}</p>
      ${order.courier_name ? `<p style="margin:0 0 12px;color:#6b7280">via ${order.courier_name}</p>` : ""}
      ${order.tracking_url ? `<a href="${order.tracking_url}" style="display:inline-block;background:#f97316;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Track Your Order</a>` : ""}
    </div>`
        : ""
    }
    <p style="color:#6b7280">Delivering to: ${order.shipping_address1}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
    `
  );

  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Your Order Has Shipped — ${order.order_number} | BoxDeal`,
    html,
  });
}

export async function sendOrderDelivered(order: Order, email: string) {
  const html = baseTemplate(
    "Order Delivered",
    `
    <h2 style="margin:0 0 8px;font-size:20px">Your order has been delivered!</h2>
    <p style="color:#6b7280;margin:0 0 24px">Order <strong>${order.order_number}</strong> was delivered successfully.</p>
    <p style="color:#6b7280">We hope you love your purchase. Please take a moment to leave a review — it helps other shoppers.</p>
    <div style="text-align:center;margin-top:24px">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600">Write a Review</a>
    </div>
    `
  );

  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Order Delivered — ${order.order_number} | BoxDeal`,
    html,
  });
}
