import type { OrderStatus } from "@/types";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Delivery is charged at the live Shiprocket courier rate, capped at this
// amount — the customer never pays more than ₹200 even if the real rate is
// higher (BoxDeal absorbs the difference).
export const DELIVERY_CHARGE_CAP = 200;

// Volumetric (dimensional) weight divisor. A parcel's volumetric weight in kg
// is (length_cm × breadth_cm × height_cm) / VOLUMETRIC_DIVISOR. 5000 is the
// standard used by Shiprocket and most Indian couriers. The courier bills on
// the GREATER of actual and volumetric weight ("chargeable weight").
export const VOLUMETRIC_DIVISOR = 5000;

// Customers can cancel their own order within this many hours of placing it,
// as long as it hasn't moved past "confirmed" (i.e. not yet packed/shipped).
// Mirrors the Return & Cancellation Policy (/returns).
export const ORDER_CANCEL_WINDOW_HOURS = 12;
export const USER_CANCELLABLE_STATUSES: OrderStatus[] = ["placed", "confirmed"];

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
