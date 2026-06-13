import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  address_type: "home" | "work" | "other";
  created_at: string;
  updated_at: string;
}

export const addressService = {
  // Fetch all addresses for user
  async getAddresses(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    return { data: data as Address[] | null, error };
  },

  // Fetch single address
  async getAddress(addressId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .single();

    return { data: data as Address | null, error };
  },

  // Create address
  async createAddress(userId: string, address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) {
    const supabase = getSupabaseBrowserClient();

    // If this is default, unset other defaults
    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        ...address,
      })
      .select()
      .single();

    return { data: data as Address | null, error };
  },

  // Update address
  async updateAddress(addressId: string, userId: string, updates: Partial<Address>) {
    const supabase = getSupabaseBrowserClient();

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await supabase
      .from("addresses")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .select()
      .single();

    return { data: data as Address | null, error };
  },

  // Delete address
  async deleteAddress(addressId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    return { error };
  },

  // Set default address
  async setDefaultAddress(addressId: string, userId: string) {
    const supabase = getSupabaseBrowserClient();

    // Unset all other defaults
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Set this as default
    const { data, error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .select()
      .single();

    return { data: data as Address | null, error };
  },
};
