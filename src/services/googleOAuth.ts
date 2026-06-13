"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const googleOAuthService = {
  async signInWithGoogle() {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      console.error("Google OAuth error:", err);
      return { success: false, error: msg };
    }
  },

  getSupabase() {
    return getSupabaseBrowserClient();
  },
};
