"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INDIA_STATES } from "@/constants";

const schema = z.object({
  full_name:     z.string().min(2, "Name is required"),
  phone:         z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city:          z.string().min(2, "City is required"),
  state:         z.string().min(2, "State is required"),
  pincode:       z.string().regex(/^\d{6}$/, "Enter valid 6-digit PIN code"),
  address_type:  z.enum(["home", "work", "other"]).default("home"),
  save_address:  z.boolean().default(false),
  is_default:    z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof schema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => void;
  loading?: boolean;
}

export function AddressForm({ defaultValues, onSubmit, loading }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            {...register("full_name")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="John Doe"
          />
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="9876543210"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 1 *</label>
        <input
          {...register("address_line1")}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          placeholder="House No., Street Name"
        />
        {errors.address_line1 && <p className="mt-1 text-xs text-red-500">{errors.address_line1.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Address Line 2 (Landmark)</label>
        <input
          {...register("address_line2")}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          placeholder="Near landmark, Area name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
          <input
            {...register("city")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            placeholder="Mumbai"
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
          <select
            {...register("state")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          >
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">PIN Code *</label>
          <input
            {...register("pincode")}
            maxLength={6}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            placeholder="400001"
          />
          {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        {(["home", "work", "other"] as const).map((type) => (
          <label key={type} className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input type="radio" {...register("address_type")} value={type} className="text-brand-500" />
            <span className="capitalize">{type}</span>
          </label>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("save_address")} className="rounded text-brand-500" />
        Save this address for future orders
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("is_default")} className="rounded text-brand-500" />
        Set as default address
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
      >
        {loading ? "Saving…" : "Use This Address"}
      </button>
    </form>
  );
}
