"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      // Get the session token from Supabase
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      toast.error(msg);
    } finally {
      setDeletingAccount(false);
    }
  }

  async function handleLogout() {
    if (!confirm("Are you sure you want to log out?")) return;

    setLoggingOut(true);
    try {
      await authService.logout();
      toast.success("Logged out successfully!");
      router.push("/login");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to logout";
      toast.error(msg);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      </div>

      {/* Account Email */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Account Email</h2>
        <div className="space-y-2">
          <label className="block text-sm text-gray-500">Email Address</label>
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          <p className="text-xs text-gray-500 mt-2">
            To change your email, please contact our support team.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Order updates</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Promotional emails</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span className="text-sm font-medium text-gray-700">Product recommendations</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-4">
        <h2 className="font-semibold text-red-900">Danger Zone</h2>

        <div className="space-y-3">
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
          >
            {deletingAccount ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </button>
          <p className="text-xs text-red-700">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Log Out
            </>
          )}
        </button>
      </div>
    </div>
  );
}
