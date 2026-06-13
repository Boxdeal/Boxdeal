"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Wait for session to be established after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // Session not yet established, wait a bit and try again
          setTimeout(() => handleCallback(), 500);
          return;
        }

        // Check if user has profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        // If profile doesn't exist or missing required fields, redirect to complete profile
        if (!profile || !profile.full_name || !profile.phone) {
          router.push("/auth/complete-profile");
        } else {
          // Profile exists and complete, go to account
          router.push("/account");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setError(message);
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-500" />
        <p className="text-gray-600">Completing authentication...</p>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
