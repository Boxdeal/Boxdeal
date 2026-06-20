import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

// Attaches an email to the currently-authenticated user and marks it confirmed.
// Used by phone-OTP signups (which have no email otherwise) so that every user
// ends up with BOTH a phone and an email — order emails read auth.users.email.
//
// We use the admin API with email_confirm:true rather than the client-side
// supabase.auth.updateUser({ email }) because the latter only sets a *pending*
// email (requires a confirmation click) and leaves user.email null in the
// meantime — which would break our order-email lookups.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = (await req.json()) as { email?: string };
  const clean = (email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(clean)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  // Already set to the same email — nothing to do.
  if (user.email?.toLowerCase() === clean) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email:         clean,
    email_confirm: true,
  });

  if (error) {
    // Most common: the email is already registered to another account.
    const msg = /already|registered|exists/i.test(error.message)
      ? "This email is already linked to another account. Please use a different one."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
