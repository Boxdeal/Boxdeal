import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Helper to check if input is email or phone
export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function isPhone(input: string): boolean {
  return /^[6-9]\d{9}$/.test(input.replace(/\D/g, ""));
}

export const authService = {
  // Send OTP for login via email
  async sendLoginOtpEmail(email: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
  },

  // Send OTP for login via phone
  async sendLoginOtpPhone(phone: string) {
    const supabase = getSupabaseBrowserClient();
    const cleanPhone = phone.replace(/\D/g, "");
    return supabase.auth.signInWithOtp({
      phone: `+91${cleanPhone}`,
      options: { shouldCreateUser: false },
    });
  },

  // Send OTP for signup via email
  async sendSignupOtpEmail(email: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
  },

  // Send OTP for signup via phone
  async sendSignupOtpPhone(phone: string) {
    const supabase = getSupabaseBrowserClient();
    const cleanPhone = phone.replace(/\D/g, "");
    return supabase.auth.signInWithOtp({
      phone: `+91${cleanPhone}`,
      options: { shouldCreateUser: true },
    });
  },

  // Verify OTP from email
  async verifyOtpEmail(email: string, token: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
  },

  // Verify OTP from phone
  async verifyOtpPhone(phone: string, token: string) {
    const supabase = getSupabaseBrowserClient();
    const cleanPhone = phone.replace(/\D/g, "");
    return supabase.auth.verifyOtp({
      phone: `+91${cleanPhone}`,
      token,
      type: "sms",
    });
  },

  // Universal send OTP (auto-detect email vs phone)
  async sendLoginOtp(emailOrPhone: string) {
    if (isEmail(emailOrPhone)) {
      return this.sendLoginOtpEmail(emailOrPhone);
    } else if (isPhone(emailOrPhone)) {
      return this.sendLoginOtpPhone(emailOrPhone);
    }
    throw new Error("Invalid email or phone number");
  },

  // Universal send signup OTP (auto-detect email vs phone)
  async sendSignupOtp(emailOrPhone: string) {
    if (isEmail(emailOrPhone)) {
      return this.sendSignupOtpEmail(emailOrPhone);
    } else if (isPhone(emailOrPhone)) {
      return this.sendSignupOtpPhone(emailOrPhone);
    }
    throw new Error("Invalid email or phone number");
  },

  // Universal verify OTP (auto-detect email vs phone)
  async verifyOtp(emailOrPhone: string, token: string) {
    if (isEmail(emailOrPhone)) {
      return this.verifyOtpEmail(emailOrPhone, token);
    } else if (isPhone(emailOrPhone)) {
      return this.verifyOtpPhone(emailOrPhone, token);
    }
    throw new Error("Invalid email or phone number");
  },

  // Get current user
  async getUser() {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.getUser();
  },

  // Sign up with email/password (legacy)
  async signUp(email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.signUp({
      email,
      password,
    });
  },

  // Sign in with email/password (legacy)
  async signIn(email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Logout
  async logout() {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.signOut();
  },

  // Get session
  async getSession() {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.getSession();
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },
};
