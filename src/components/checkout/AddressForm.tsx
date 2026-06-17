"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { INDIA_STATES } from "@/constants";

const schema = z.object({
  full_name:     z.string().min(2, "Name is required").regex(/^[a-zA-Z\s.]+$/, "Name can only contain letters"),
  phone:         z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city:          z.string().min(2, "City is required"),
  state:         z.string().min(2, "State is required"),
  pincode:       z.string().regex(/^\d{6}$/, "Enter valid 6-digit PIN code"),
  address_type:  z.enum(["home", "work", "other"]).default("home"),
  is_default:    z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof schema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => void;
  loading?: boolean;
}

// "verified" = PIN found, state/city locked from India Post.
// "manual"   = lookup unavailable (network) → let the user type state/city.
type PinStatus = "idle" | "loading" | "verified" | "invalid" | "manual";

export function AddressForm({ defaultValues, onSubmit, loading }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [pinStatus, setPinStatus] = useState<PinStatus>(
    defaultValues?.pincode && /^\d{6}$/.test(defaultValues.pincode) ? "verified" : "idle"
  );
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);

  const pincode = watch("pincode");

  // Look up the PIN code with India Post and pin state/city to the real values.
  useEffect(() => {
    const pin = (pincode ?? "").replace(/\D/g, "");
    if (pin.length !== 6) {
      setPinStatus("idle");
      setPinMessage(null);
      setAreas([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setPinStatus("loading");
      setPinMessage(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const json = await res.json();
        const entry = Array.isArray(json) ? json[0] : null;
        if (cancelled) return;

        if (entry?.Status === "Success" && entry.PostOffice?.length) {
          const po = entry.PostOffice[0];
          const uniqueAreas = Array.from(
            new Set(entry.PostOffice.map((p: { Name: string }) => p.Name))
          ) as string[];
          setValue("state", po.State, { shouldValidate: true });
          setValue("city", po.District, { shouldValidate: true });
          setAreas(uniqueAreas);
          setPinStatus("verified");
          setPinMessage(`${po.District}, ${po.State}`);
        } else {
          setValue("state", "", { shouldValidate: false });
          setValue("city", "", { shouldValidate: false });
          setAreas([]);
          setPinStatus("invalid");
          setPinMessage("This PIN code doesn't exist. Please check it.");
        }
      } catch {
        if (cancelled) return;
        // Network/API issue — don't block the user, let them type manually.
        setPinStatus("manual");
        setPinMessage("Couldn't auto-verify PIN code. Please fill state & city.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pincode, setValue]);

  const locked = pinStatus === "verified";
  const blockSubmit = pinStatus === "loading" || pinStatus === "invalid";

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
            inputMode="numeric"
            maxLength={10}
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

      {/* PIN code first — it drives state & city */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">PIN Code *</label>
        <div className="relative">
          <input
            {...register("pincode")}
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm focus:border-brand-400 focus:outline-none"
            placeholder="400001"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {pinStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {pinStatus === "verified" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {pinStatus === "invalid" && <AlertCircle className="h-4 w-4 text-red-500" />}
          </span>
        </div>
        {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>}
        {!errors.pincode && pinMessage && (
          <p className={`mt-1 text-xs ${pinStatus === "verified" ? "text-green-600" : pinStatus === "invalid" ? "text-red-500" : "text-amber-600"}`}>
            {pinMessage}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
          <select
            {...register("state")}
            disabled={locked}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
          >
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
          <input
            {...register("city")}
            readOnly={locked}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none read-only:bg-gray-50 read-only:text-gray-600"
            placeholder="City / District"
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
      </div>

      {/* Locality (area) helper — only shown when a PIN has multiple areas */}
      {locked && areas.length > 1 && (
        <p className="text-xs text-gray-500">
          Areas in this PIN: {areas.slice(0, 5).join(", ")}{areas.length > 5 ? "…" : ""}
        </p>
      )}

      <div className="flex gap-3">
        {(["home", "work", "other"] as const).map((type) => (
          <label key={type} className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input type="radio" {...register("address_type")} value={type} className="text-brand-500" />
            <span className="capitalize">{type}</span>
          </label>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("is_default")} className="rounded text-brand-500" />
        Set as default address
      </label>

      <button
        type="submit"
        disabled={loading || blockSubmit}
        className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
      >
        {loading ? "Saving…" : pinStatus === "loading" ? "Verifying PIN…" : "Use This Address"}
      </button>
    </form>
  );
}
