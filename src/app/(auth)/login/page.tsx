"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setStep("otp");
      toast.success("OTP sent to your email!");
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error("Invalid OTP. Please try again.");
    } else {
      toast.success("Logged in successfully!");
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <span className="text-3xl font-black">
            Box<span className="text-brand-500">Deal</span>
          </span>
          <p className="mt-2 text-gray-500">
            {step === "email" ? "Sign in to your account" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Send OTP <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                6-digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1.5 text-xs text-gray-400 text-center">
                OTP sent to <strong>{email}</strong>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
