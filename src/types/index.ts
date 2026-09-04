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
  /** Same-day revenue split by how the money came in (paid orders only). */
  prepaidRevenue: number;
  codRevenue: number;
}

export type DashboardPeriod =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "last_month"
  | "all"
  | "custom";

/** How the dashboard buckets a payment method. COD is the "postpaid" bucket. */
export type PaymentBucket = "prepaid" | "cod";

// One payment method's slice of a period. Every order lands in exactly one of
// four buckets so the numbers add up:
//   revenue    — the ESTIMATE: confirmed / packed / shipped / out for delivery /
//                delivered. Money already realised plus money still to collect.
//   collected  — the part of `revenue` that has actually been received
//                (prepaid captured, COD collected on delivery)
//   pending    — the rest of `revenue`: live orders whose cash is still coming
//   failed     — checkout never completed (payment failed, or still "placed")
//   cancelled  — a live order that was cancelled, by the customer or by us
// revenue === collectedRevenue + pendingRevenue. failed and cancelled are NOT
// part of revenue.
export interface PaymentSplit {
  orders: number;
  revenueOrders: number;
  revenue: number;
  collectedOrders: number;
  collectedRevenue: number;
  pendingOrders: number;
  pendingRevenue: number;
  failedOrders: number;
  failedRevenue: number;
  cancelledOrders: number;
  cancelledRevenue: number;
  /** Status breakdown for THIS method only, so drill-down pills stay in scope. */
  byStatus: Record<OrderStatus, { count: number; revenue: number }>;
}

/** Orders that never became revenue — one line in the dashboard. */
export interface LostBucket {
  orders: number;
  amount: number;
}

// Period-scoped analytics, all computed in IST. `revenue` is the ESTIMATED
// revenue (confirmed → delivered); `orders` counts every order in the window,
// including the failed and cancelled ones that revenue deliberately excludes.
export interface PeriodStats {
  label: string;
  start: string;
  end: string;
  orders: number;
  revenueOrders: number;
  revenue: number;
  collectedRevenue: number;
  collectedOrders: number;
  pendingRevenue: number;
  pendingOrders: number;
  failed: LostBucket;
  cancelled: LostBucket;
  /** RTO + customer returns. Their value is deducted from revenue. */
  returned: LostBucket;
  rto: LostBucket;
  customerReturn: LostBucket;
  avgOrderValue: number;
  /** Total order value per status (not only the paid part). */
  byStatus: Record<OrderStatus, { count: number; revenue: number }>;
  byPayment: Record<PaymentBucket, PaymentSplit>;
  chart: RevenueChartPoint[];
  prevRevenue: number;
  /** Revenue-order count in the previous window, for the trend comparison. */
  prevOrders: number;
}

// Per-product sales for a period. Money follows the same three-bucket rule as
// PaymentSplit: `revenue` is collected, `pendingRevenue` is the estimate still
// expected, and cancelled/returned units are tracked separately (never in the
// estimate). Item value is quantity × selling_price, so order-level coupon and
// admin discounts are NOT deducted here.
/**
 * Units of one product that are NOT live sales, split by why. These are held
 * out of `units` / `orders` entirely rather than netted off, so the headline
 * item count only ever means "actually sold".
 */
export interface ExcludedUnits {
  /** Never confirmed — still at "placed", or the checkout/payment failed. */
  placedUnits: number;
  cancelledUnits: number;
  returnedUnits: number;
}

export interface ProductSalesRow extends ExcludedUnits {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_sku: string;
  /** Live orders only — cancelled / never-confirmed / returned are excluded. */
  orders: number;
  /** Live units only — see ExcludedUnits for what was held out. */
  units: number;
  revenue: number;
  pendingRevenue: number;
  prepaidUnits: number;
  codUnits: number;
}

/** Units + distinct orders of one product sitting in a given order status. */
export interface ProductStatusCount {
  status: OrderStatus;
  orders: number;
  units: number;
}

/** One IST day of sales for a single product. */
export interface ProductDayRow extends ExcludedUnits {
  date: string;
  /** Live orders / units only, same rule as ProductSalesRow. */
  orders: number;
  units: number;
  revenue: number;
  pendingRevenue: number;
  prepaidRevenue: number;
  codRevenue: number;
}

// ────────────────────────────────────────────────────────────
// Delivery / courier performance
// ────────────────────────────────────────────────────────────

// One courier's slice of a period. The same shape describes a partner
// (Delhivery) and a single service of that partner (Delhivery Surface 10 Kg) —
// a partner row simply has its services nested under `services`.
//
// Counts are mutually exclusive and add up: parcels === inTransit + delivered +
// rto + customerReturn + cancelled.
export interface CourierRow {
  /** Service name exactly as Shiprocket reports it, or the partner name. */
  name: string;
  /** The company behind the service. Equal to `name` on a partner row. */
  partner: string;
  /** Per-service breakdown. Populated on partner rows only. */
  services: CourierRow[];
  /** Orders handed to this courier — one order is one parcel. */
  parcels: number;
  /** Still moving: confirmed, packed, shipped or out for delivery. */
  inTransit: number;
  delivered: number;
  /** Never delivered — came back to origin. */
  rto: number;
  /** Delivered, then returned by the customer. Still a successful delivery. */
  customerReturn: number;
  cancelled: number;
  /** Total order value handed to this courier. */
  value: number;
  deliveredValue: number;
  rtoValue: number;
  codParcels: number;
  prepaidParcels: number;
  /** COD cash the courier collected at the door and owes us. */
  codCollected: number;
  /**
   * Delivered COD parcels still not marked paid — the courier took the cash but
   * no webhook confirmed it. Money that is missing from `codCollected`, so it is
   * surfaced rather than silently dropped.
   */
  codPending: number;
  codPendingParcels: number;
  /** (delivered + customer returns) / attempted, as a percentage. */
  deliveryRate: number | null;
  rtoRate: number | null;
  /** Mean days from handover to delivery, over delivered parcels only. */
  avgDeliveryDays: number | null;
  lastUsedAt: string | null;
}

export interface UnshippedBucket {
  parcels: number;
  value: number;
}

export interface CourierStats {
  label: string;
  /** Partners, busiest first. */
  partners: CourierRow[];
  /** Every distinct Shiprocket service name used, busiest first. */
  services: CourierRow[];
  /** Every courier combined — the denominator for share-of-volume. */
  totals: CourierRow;
  /**
   * Orders that never got an AWB, split by why — see the note in courier-stats.
   * Only `awaiting` is a real fulfilment backlog.
   */
  unshipped: {
    /** Live and still waiting to be handed to a courier. */
    awaiting: UnshippedBucket;
    /**
     * Reached its end state with no courier name stored. `withAwb` counts the
     * ones that DO have an AWB — those did ship through Shiprocket and only
     * lost the name, so "Sync from Shiprocket" recovers them; the rest were
     * genuinely fulfilled outside Shiprocket. `returned` is why this tab's RTO
     * count can trail the RTO & Returns tab's.
     */
    offline: UnshippedBucket & { withAwb: number; returned: number };
    /** Failed checkout, or cancelled before packing — was never going to ship. */
    neverShipped: UnshippedBucket;
  };
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
