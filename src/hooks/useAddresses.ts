"use client";

import { useState, useEffect } from "react";
import { Address, addressService } from "@/services/address";

export type { Address };

interface UseAddressesReturn {
  addresses: Address[];
  loading: boolean;
  error: Error | null;
  addAddress: (address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAddresses(userId: string | undefined): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await addressService.getAddresses(userId);
      if (err) throw err;
      setAddresses(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const addAddress = async (address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!userId) throw new Error("User ID is required");

    try {
      const { data, error: err } = await addressService.createAddress(userId, address);
      if (err) throw err;
      if (data) setAddresses([data, ...addresses]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!userId) throw new Error("User ID is required");

    try {
      const { data, error: err } = await addressService.updateAddress(addressId, userId, updates);
      if (err) throw err;
      if (data) {
        setAddresses(addresses.map((a) => (a.id === addressId ? data : a)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const deleteAddressItem = async (addressId: string) => {
    try {
      const { error: err } = await addressService.deleteAddress(addressId);
      if (err) throw err;
      setAddresses(addresses.filter((a) => a.id !== addressId));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  const setDefault = async (addressId: string) => {
    if (!userId) throw new Error("User ID is required");

    try {
      const { data, error: err } = await addressService.setDefaultAddress(addressId, userId);
      if (err) throw err;
      if (data) {
        setAddresses(
          addresses.map((a) => ({
            ...a,
            is_default: a.id === addressId,
          }))
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress: deleteAddressItem,
    setDefaultAddress: setDefault,
    refetch: fetchAddresses,
  };
}
