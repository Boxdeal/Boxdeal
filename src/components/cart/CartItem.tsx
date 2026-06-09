"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { removeItem, updateQuantity } from "@/store/slices/cartSlice";
import { formatPrice } from "@/lib/utils/format";
import type { CartItem as CartItemType } from "@/types";

function CartItemComponent({ item }: { item: CartItemType }) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex gap-3 py-4">
      <Link href={`/product/${item.slug}`} className="flex-shrink-0">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill sizes="64px" loading="lazy" quality={75} className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col min-w-0">
        <Link
          href={`/product/${item.slug}`}
          className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-brand-600"
        >
          {item.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.selling_price)}
          </span>
          {item.mrp > item.selling_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(item.mrp)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={() => dispatch(updateQuantity({ product_id: item.product_id, quantity: item.quantity - 1 }))}
              disabled={item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center text-gray-500 disabled:opacity-30 hover:text-brand-600"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => dispatch(updateQuantity({ product_id: item.product_id, quantity: item.quantity + 1 }))}
              disabled={item.quantity >= item.stock_quantity}
              className="flex h-7 w-7 items-center justify-center text-gray-500 disabled:opacity-30 hover:text-brand-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => dispatch(removeItem(item.product_id))}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const CartItem = memo(CartItemComponent);
