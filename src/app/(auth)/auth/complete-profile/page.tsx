"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, User as UserIcon, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { takePostLoginRedirect } from "@/lib/utils/authRedirect";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      // Pre-fill the phone they just verified (auth stores it as +91XXXXXXXXXX).
      if (user.phone) setPhoneNumber(user.phone.replace(/^(\+?91)/, "").replace(/\D/g, "").slice(-10));

      // If the profile is already complete, this is a returning user — skip
      // the form and send them straight in.
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name?.trim()) {
        router.replace(takePostLoginRedirect());
        return;
      }
    };

    checkAuth();
  }, [router]);

  function validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanPhone);
  }

  async function handleCompleteProfile(e: React.FormEvent) {
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
      const supabase = getSupabaseBrowserClient();
      
      // Upsert so the row is created if it doesn't exist yet (phone-login
      // users may not have a profile row). Updating a missing row matches
      // 0 rows and returns a 406 error.
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            phone: phoneNumber.replace(/\D/g, ""),
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      toast.success("Profile completed successfully!");
      router.push(takePostLoginRedirect());
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to complete profile";
      toast.error(msg);
    } finally {
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
          <p className="mt-2 text-gray-500">Complete your profile</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Welcome! 👋</span> Please complete your profile to continue.
          </p>
        </div>

        <form onSubmit={handleCompleteProfile} className="space-y-4">
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
                Completing profile...
              </>
            ) : (
              <>Complete Profile <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
