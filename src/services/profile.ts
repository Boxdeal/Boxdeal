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
  // Fetch user profile
  async getProfile(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data: data as UserProfile | null, error };
  },

  // Update user profile
  async updateProfile(
    userId: string,
    profile: Partial<UserProfile>
  ) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    return { data: data as UserProfile | null, error };
  },

  // Create user profile (called after signup)
  async createProfile(userId: string, email: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        full_name: null,
        phone: null,
        avatar_url: null,
        date_of_birth: null,
        gender: null,
        is_admin: false,
      })
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

