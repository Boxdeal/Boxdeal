"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

let phoneOtpVerificationId: string | null = null;

export const supabasePhoneOtpService = {
  async sendOtp(phoneNumber: string) {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const formattedPhone = `+91${cleanPhone}`;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      phoneOtpVerificationId = (data as any)?.session?.id || null;
      return { success: true, message: "OTP sent successfully" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      console.error("Send OTP error:", err);
      return { success: false, error: msg };
    }
  },

  async verifyOtp(phoneNumber: string, otp: string) {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const formattedPhone = `+91${cleanPhone}`;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        data: { user: data.user },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid OTP";
      console.error("Verify OTP error:", err);
      return { success: false, error: msg };
    }
  },

  getSupabase() {
    return getSupabaseBrowserClient();
  },
};
