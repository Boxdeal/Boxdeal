import Razorpay from "razorpay";
import crypto from "crypto";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!instance) {
    instance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return instance;
}

export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const rp = getRazorpay();
  return rp.orders.create({
    amount:   amountInPaise,
    currency: "INR",
    receipt,
  });
}

/**
 * Refund a captured Razorpay payment. Pass `amountInPaise` for a partial
 * refund; omit it to refund the full captured amount. Returns the refund
 * object (its `id` is the rfnd_* reference).
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amountInPaise?: number
) {
  const rp = getRazorpay();
  return rp.payments.refund(paymentId, {
    speed: "normal",
    ...(amountInPaise ? { amount: amountInPaise } : {}),
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}
