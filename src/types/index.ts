// ────────────────────────────────────────────────────────────
// Shared enums (mirror DB enums)
// ────────────────────────────────────────────────────────────

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "razorpay" | "cod";
export type DiscountType = "percentage" | "flat";
export type AddressType = "home" | "work" | "other";

// ────────────────────────────────────────────────────────────
// Catalog
// ────────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  badge: string | null;
  title: string;
  mid_heading: string | null;
  subtitle: string | null;
  cta_text: string;
  cta_link: string;
  image_url: string;
  text_theme: "dark" | "light";
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  thumbnail_url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_group: string;
  spec_name: string;
  spec_value: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  category_id: string;
  subcategory_id: string | null;
  brand_id: string | null;
  mrp: number;
  selling_price: number;
  discount_percent: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams: number;
  // Parcel dimensions (cm) → volumetric weight = L×B×H / 5000.
  length_cm: number;
  breadth_cm: number;
  height_cm: number;
  is_active: boolean;
  is_featured: boolean;
  is_deal_of_day: boolean;
  rating: number;
  review_count: number;
  sold_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  subcategory?: Subcategory;
  brand?: Brand;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  mrp: number;
  selling_price: number;
  discount_percent: number;
  stock_quantity: number;
  rating: number;
  review_count: number;
  is_deal_of_day: boolean;
  primary_image: string | null;
  thumbnail_image: string | null;
  product_images?: ProductImage[];
}

// ────────────────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

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
  address_type: AddressType;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// Orders
// ────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  discount_amount: number;
  // Extra discount an admin applies from the panel, on top of any coupon. Folded
  // into the Shiprocket total_discount at pack time so the COD collectible /
  // invoice reflect it.
  admin_discount: number;
  shipping_charge: number;
  total_amount: number;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: OrderStatus;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  shiprocket_attempt: number;
  notes: string | null;
  placed_at: string;
  confirmed_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  pack_deadline: string;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
  user?: UserProfile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_sku: string;
  quantity: number;
  mrp: number;
  selling_price: number;
  total_price: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  updated_by: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<UserProfile, "full_name" | "avatar_url">;
}

// ────────────────────────────────────────────────────────────
// Coupons
// ────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  discount?: number;
  discount_type?: DiscountType;
  discount_value?: number;
  min_order_amount?: number;
  max_discount?: number | null;
  coupon_id?: string;
}

// ────────────────────────────────────────────────────────────
// Cart (Redux state)
// ────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  mrp: number;
  selling_price: number;
  quantity: number;
  stock_quantity: number;
}

export interface CartState {
  items: CartItem[];
  coupon: CouponValidationResult & { code?: string } | null;
}

// ────────────────────────────────────────────────────────────
// Wishlist (Redux state)
// ────────────────────────────────────────────────────────────

export interface WishlistState {
  productIds: string[];
}

// ────────────────────────────────────────────────────────────
// Auth (Redux state)
// ────────────────────────────────────────────────────────────

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

// ────────────────────────────────────────────────────────────
// UI (Redux state)
// ────────────────────────────────────────────────────────────

export interface UIState {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
}

// ────────────────────────────────────────────────────────────
// Admin dashboard
// ────────────────────────────────────────────────────────────

export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  overdue_packing: number;
  low_stock_products: number;
  total_customers: number;
  month_revenue: number;
  month_orders: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export type DashboardPeriod =
  | "today"
  | "week"
  | "month"
  | "last_month"
  | "all"
  | "custom";

// Period-scoped analytics, all computed in IST. Revenue fields count PAID
// orders only; `orders` counts every order in the window.
export interface PeriodStats {
  label: string;
  start: string;
  end: string;
  orders: number;
  paidOrders: number;
  revenue: number;
  onlineRevenue: number;
  codRevenue: number;
  avgOrderValue: number;
  byStatus: Record<OrderStatus, { count: number; revenue: number }>;
  chart: RevenueChartPoint[];
  prevRevenue: number;
  prevOrders: number;
}

// ────────────────────────────────────────────────────────────
// API response wrappers
// ────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ────────────────────────────────────────────────────────────
// Product listing filters (URL search params)
// ────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  in_stock?: boolean;
  sort?: "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  page?: number;
  limit?: number;
  q?: string;
}

// ────────────────────────────────────────────────────────────
// Razorpay
// ────────────────────────────────────────────────────────────

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
