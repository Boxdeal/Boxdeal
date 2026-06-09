import type { OrderStatus } from "@/types";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const SHIPPING_CHARGE = 49;
export const FREE_SHIPPING_THRESHOLD = 499;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed:           "Order Placed",
  confirmed:        "Confirmed",
  packed:           "Packed",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  returned:         "Returned",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  placed:           "bg-blue-100 text-blue-700",
  confirmed:        "bg-indigo-100 text-indigo-700",
  packed:           "bg-yellow-100 text-yellow-700",
  shipped:          "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
  returned:         "bg-gray-100 text-gray-700",
};

export const SORT_OPTIONS = [
  { label: "Most Popular",     value: "popular"    },
  { label: "Newest First",     value: "newest"     },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc"},
  { label: "Top Rated",        value: "rating"     },
] as const;

export const PRODUCTS_PER_PAGE = 24;
export const ADMIN_ORDERS_PER_PAGE = 20;

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
  "Puducherry",
];

export const RAZORPAY_CURRENCY = "INR";
export const RAZORPAY_THEME_COLOR = "#f97316";
