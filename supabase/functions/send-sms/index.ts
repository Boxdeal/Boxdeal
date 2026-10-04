// Supabase Auth "Send SMS Hook" -> MSG91 Flow API
//
// Supabase generates the OTP, stores it, and verifies it. This function only
// delivers the SMS. Never verify an OTP through MSG91 — verification has to
// stay in supabase.auth.verifyOtp() or the user never gets a session.
//
// Secrets:  supabase secrets set MSG91_AUTH_KEY=... MSG91_TEMPLATE_ID=... SEND_SMS_HOOK_SECRET=...
// Deploy:   supabase functions deploy send-sms

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

interface SendSmsPayload {
  user: { phone: string };
  sms: { otp: string };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fail = (status: number, message: string) =>
  json({ error: { http_code: status, message } }, status);

Deno.serve(async (req) => {
  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID");

  if (!hookSecret || !authKey || !templateId) {
    console.error("send-sms: missing secrets — run `supabase secrets set`");
    return fail(500, "hook not configured");
  }

  const payload = await req.text();

  let user: SendSmsPayload["user"];
  let sms: SendSmsPayload["sms"];
  try {
    // Checks the signature and the timestamp, so replayed requests are rejected
    const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));
    ({ user, sms } = wh.verify(
      payload,
      Object.fromEntries(req.headers),
    ) as SendSmsPayload);
  } catch (err) {
    console.error("send-sms: signature verification failed", err);
    return fail(401, "invalid signature");
  }

  // Supabase stores the phone as "919876543210" — country code, no "+"
  const mobile = user.phone.replace(/\D/g, "");

  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        short_url: "0",
        // The "otp" key has to match the ##otp## variable in the DLT template
        recipients: [{ mobiles: mobile, otp: sms.otp }],
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.type === "error") {
      console.error("send-sms: MSG91 rejected the request", res.status, data);
      // Supabase only retries 429 and 503, so pass those through unchanged
      const status = res.status === 429 || res.status === 503 ? res.status : 500;
      return fail(status, data?.message ?? "MSG91 request failed");
    }

    // Log only the last 4 digits — the full number is personal data
    console.log(`send-sms: sent to ...${mobile.slice(-4)} (req ${data?.message})`);
    return json({});
  } catch (err) {
    console.error("send-sms: unexpected error", err);
    return fail(500, "failed to send SMS");
  }
});
