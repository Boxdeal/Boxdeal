"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, User as UserIcon, Phone, Lock } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth";
import { supabasePhoneOtpService } from "@/services/supabasePhoneOtp";
import { googleOAuthService } from "@/services/googleOAuth";
import { profileService } from "@/services/profile";
import { toast } from "sonner";

export default function SignupPage() {
  const [method, setMethod] = useState<"password" | "phone">("password");
  const [step, setStep] = useState<"signup" | "verify" | "profile">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.signUp(email, password);
      if (error) throw error;

      if (data.user) {
        setUserId(data.user.id);
        setStep("profile");
        toast.success("Account created! Complete your profile.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanPhone);
  }

  async function handleSendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (!validatePhoneNumber(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const result = await supabasePhoneOtpService.sendOtp(phone);
      if (!result.success) throw new Error(result.error);

      toast.success("OTP sent to your phone!");
      setStep("verify");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await supabasePhoneOtpService.verifyOtp(phone, otp);
      if (!result.success) throw new Error(result.error);

      if (result.user) {
        setUserId(result.user.id);
        setPhoneNumber(phone.replace(/\D/g, ""));
        setStep("profile");
        toast.success("Phone verified! Complete your profile.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number (starting with 6-9)");
      return;
    }

    setLoading(true);

    try {
      // upsert — the DB trigger already created the profile row on signup, so a
      // plain insert would hit a primary-key conflict. This fills in the details.
      const { error } = await profileService.updateProfile(userId, {
        full_name: fullName.trim(),
        phone: phoneNumber.replace(/\D/g, ""),
      });
      if (error) throw error;

      toast.success("Account created successfully!");
      router.push("/account");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    try {
      const result = await googleOAuthService.signInWithGoogle();
      if (!result.success) throw new Error(result.error);
      toast.success("Redirecting...");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-up failed";
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="text-center">
          <span className="text-3xl font-black">
            Box<span className="text-brand-500">Deal</span>
          </span>
          <p className="mt-2 text-gray-500">
            {step === "signup" ? "Create your account" : "Complete your profile"}
          </p>
        </div>

        {/* Google Sign-up - Only show on signup step */}
        {step === "signup" && (
          <>
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or create with</span>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        {step === "signup" && (
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setMethod("password");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                method === "password"
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setMethod("phone");
                setPhone("");
              }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                method === "phone"
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Phone
            </button>
          </div>
        )}

        {step === "signup" && method === "password" ? (
          <form onSubmit={handlePasswordSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">At least 6 characters</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-500 hover:text-brand-600">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        ) : step === "signup" && method === "phone" ? (
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">10-digit number starting with 6-9</p>
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

            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-500 hover:text-brand-600">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        ) : step === "verify" ? (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-900">
                OTP sent to <span className="font-semibold">+91{phone}</span>
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Verify OTP <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("signup");
                setOtp("");
              }}
              className="w-full text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Change Phone Number
            </button>
          </form>
        ) : (
          <form onSubmit={createProfile} className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-900 font-semibold">✓ Account created! Complete your profile.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Full Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Phone Number <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                required
                maxLength={10}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-gray-500 mt-2">10-digit number starting with 6-9</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>Complete Profile <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
