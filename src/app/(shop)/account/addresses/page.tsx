"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses, Address } from "@/hooks/useAddresses";
import { toast } from "sonner";

export default function AddressesPage() {
  const { user } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddresses(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Address>>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "home",
    is_default: false,
  });

  function openForm(address?: Address) {
    if (address) {
      setFormData(address);
      setEditingId(address.id);
    } else {
      setFormData({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "home",
        is_default: false,
      });
      setEditingId(null);
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateAddress(editingId, formData);
        toast.success("Address updated successfully!");
      } else {
        await addAddress({
          full_name: formData.full_name || "",
          phone: formData.phone || "",
          address_line1: formData.address_line1 || "",
          address_line2: formData.address_line2 || "",
          city: formData.city || "",
          state: formData.state || "",
          pincode: formData.pincode || "",
          address_type: formData.address_type as "home" | "work" | "other",
          is_default: formData.is_default || false,
        });
        toast.success("Address added successfully!");
      }
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteAddress(addressId);
      toast.success("Address deleted successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete address";
      toast.error(msg);
    }
  }

  async function handleSetDefault(addressId: string) {
    try {
      await setDefaultAddress(addressId);
      toast.success("Default address updated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update default address";
      toast.error(msg);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit Address" : "Add New Address"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="10 digits"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
            <input
              type="text"
              required
              value={formData.address_line1 || ""}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="Street address"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={formData.address_line2 || ""}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Apartment, suite, etc."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={formData.pincode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                placeholder="6 digits"
                maxLength={6}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                required
                value={formData.address_type || "home"}
                onChange={(e) => setFormData({ ...formData, address_type: e.target.value as "home" | "work" | "other" })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_default || false}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No addresses yet</p>
            <p className="text-sm text-gray-500">Add your first address to get started</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{addr.full_name}</h3>
                    <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                      {addr.address_type}
                    </span>
                    {addr.is_default && (
                      <span className="text-xs font-medium text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-sm text-gray-600">{addr.address_line2}</p>}
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Phone: {addr.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openForm(addr)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Set as default
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
