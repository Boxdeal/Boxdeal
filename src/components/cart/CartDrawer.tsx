"use client";

import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useAppDispatch, useCart, useCartOpen, useCartSubtotal, useCartDiscount } from "@/store/hooks";
import { closeCart } from "@/store/slices/uiSlice";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { cn } from "@/lib/utils/helpers";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useCartOpen();
  const { items } = useCart();
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => dispatch(closeCart())}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="font-bold text-gray-900">
            My Cart
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({items.length} item{items.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-200" />
              <div>
                <p className="font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add products to get started
                </p>
              </div>
              <Link
                href="/products"
                onClick={() => dispatch(closeCart())}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 px-4">
              {items.map((item) => (
                <CartItem key={item.product_id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 p-4 space-y-3">
            <CartSummary subtotal={subtotal} discount={discount} compact />
            <Link
              href="/checkout"
              onClick={() => dispatch(closeCart())}
              className="flex w-full items-center justify-center rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600 active:scale-95 transition-all"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
