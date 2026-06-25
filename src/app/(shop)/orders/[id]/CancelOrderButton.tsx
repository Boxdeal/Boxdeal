"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ORDER_CANCEL_WINDOW_HOURS } from "@/constants";

export function CancelOrderButton({
  orderId,
  disabled = false,
  disabledReason,
}: {
  orderId: string;
  disabled?: boolean;
  disabledReason?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function cancelOrder() {
    if (
      !confirm(
        "Cancel this order? This cannot be undone. If you paid online, your refund will be processed to your original payment method."
      )
    )
      return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const { error, refunded, refund_error } = await res.json();
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Your order has been cancelled.");
    if (refunded) {
      toast.success("Refund initiated to your original payment method.");
    } else if (refund_error) {
      toast.warning(
        "Order cancelled. Your refund will be processed by our team shortly."
      );
    }
    router.refresh();
  }

  const isDisabled = disabled || loading;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {disabled && disabledReason
            ? disabledReason
            : `Changed your mind? You can cancel free of charge within ${ORDER_CANCEL_WINDOW_HOURS} hours of placing your order, as long as it hasn't been packed.`}
        </p>
        <button
          onClick={cancelOrder}
          disabled={isDisabled}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
        >
          <X className="h-4 w-4" />
          {loading ? "Cancelling…" : "Cancel Order"}
        </button>
      </div>
    </div>
  );
}
