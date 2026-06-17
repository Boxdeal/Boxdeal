import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  // Fetch user profile. Uses maybeSingle() so a missing row returns
  // { data: null } instead of a 406 error (e.g. brand-new phone-login users
  // whose profile row hasn't been created yet).
  async getProfile(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return { data: data as UserProfile | null, error };
  },

  // Update user profile. Uses upsert (not update) so the row is created when
  // it doesn't exist yet — otherwise updating a missing profile matches 0 rows
  // and PostgREST returns 406 Not Acceptable. The id equals auth.uid(), which
  // satisfies the "User own profile" RLS policy for both insert and update.
  async updateProfile(
    userId: string,
    profile: Partial<UserProfile>
  ) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    return { data: data as UserProfile | null, error };
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const supabase = getSupabaseBrowserClient();
    const filename = `${userId}-${Date.now()}.${file.name.split(".").pop()}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filename, file, { upsert: true });

    if (error) return { data: null, error };

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filename);

    return { data: urlData, error: null };
  },
};

