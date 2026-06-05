# BoxDeal — Complete Project Plan
### E-Commerce Platform (Amazon / Flipkart Style)
**Prepared for:** BoxDeal Client
**Date:** May 2026
**Type:** Full-Stack E-Commerce Web Application

---

## 1. PROJECT OVERVIEW

BoxDeal's current website is built on WordPress which is slow and cannot scale when the user base grows. The new platform will be professionally built from scratch to deliver:

- Handle 500+ products with ease
- Thousands of simultaneous users without any slowdown
- Admin manages the entire business from one dashboard
- Orders, delivery, payments, customers — everything in one place
- Amazon / Flipkart level shopping experience for users

---

## 2. WHY NOT WORDPRESS ANYMORE

| Problem (WordPress) | Solution (New Platform) |
|---|---|
| Page load 4–8 seconds | Page load under 1 second |
| Slows down with 500+ products | 10,000+ products still fast |
| Plugin dependency — fragile and risky | Custom built — full control |
| Limited admin capabilities | Custom admin — track everything |
| No delivery integration | Shiprocket — automatic courier management |
| No proper analytics | Full analytics — revenue, users, behavior |
| Frequent security vulnerabilities | Enterprise-grade security |

---

## 3. TECH STACK — WHAT WILL BE USED AND WHY

### 3.1 Frontend (What the User Sees) — Next.js

**Next.js** is a modern web framework used by India's top companies and global brands.

- **Speed:** Pages are pre-built on the server — loads instantly on user click
- **SEO:** Google properly indexes all products — organic traffic grows
- **Images:** Product images are automatically compressed — faster load
- **Mobile:** Same speed on mobile as desktop

**Styling — Tailwind CSS + shadcn/ui**
- Professional, clean UI components ready out of the box
- Amazon/Flipkart style cards, buttons, filters, modals — all available

---

### 3.2 Backend (Server-Side Logic) — Next.js API Routes

Handles all the business logic securely on the server:
- Processing payments
- Managing orders
- Sending emails
- Connecting to delivery services

Users cannot access this layer directly — **fully secure.**

---

### 3.3 Database — Supabase (PostgreSQL)

**Supabase** is a cloud database service powered by PostgreSQL.

- World's most reliable database engine
- Products, orders, users, categories — all stored in organized tables
- Real-time updates — order status changes live
- Automatic backups — data is never lost
- Mumbai region available — fastest response for Indian users

---

### 3.4 Authentication — Supabase Auth

- User login / signup — email + OTP (no password required)
- Google login option
- Admin and User — separate roles and permissions
- JWT tokens — industry standard security

---

### 3.5 Image Storage — Supabase Storage

- Product images stored securely in the cloud
- Delivered via CDN — fast globally
- Multiple images per product supported
- Admin can upload directly from the dashboard

---

### 3.6 Payment Gateway — Razorpay

**Razorpay** is India's #1 payment gateway.

- UPI, Google Pay, PhonePe — most popular payment methods
- Credit Card / Debit Card
- Net Banking
- EMI options
- Wallets — Paytm, Amazon Pay
- **Cost:** 2% per transaction (no monthly fee)
- Instant settlement — money goes directly to bank account

---

### 3.7 Email Service — Resend

- Order confirmation emails
- Shipping update emails
- Password reset emails
- Beautiful HTML email templates
- Reliable delivery — emails never go to spam
- **Cost:** Free up to 100 emails/day — paid plan when needed

---

### 3.8 Delivery Integration — Shiprocket

**Shiprocket** is India's #1 delivery aggregator.

- All couriers on one platform — Bluedart, Delhivery, DTDC, Ecom Express
- Automatically selects the best courier by rate and speed
- AWB / tracking number auto-generated
- Customer automatically receives tracking link
- Admin sees everything on one dashboard
- **Cost:** Per shipment charge — no monthly fee

---

### 3.9 Analytics — Google Analytics 4 + Microsoft Clarity

**Google Analytics 4 (Free):**
- How many users visited the site
- Where they came from — Google, Instagram, Direct
- Which products were viewed most
- Revenue tracking
- Conversion rate

**Microsoft Clarity (Free):**
- Session recordings — exactly what user did on site
- Heatmaps — where users clicked most
- Scroll depth — how far users scrolled
- Rage clicks — where users were frustrated

---

### 3.10 Hosting — Vercel

- Best hosting platform for Next.js
- Global CDN — fast in India and worldwide
- Automatic deployments — update code, site goes live instantly
- Free SSL certificate
- **Cost:** Free tier to start, then ~$20/month as traffic grows

---

## 4. COMPLETE FEATURE LIST

### 4.1 Customer (User) Features

**Shopping Experience:**
- Home page — Featured products, Deals of the Day, Brands
- Category browsing — Category → Subcategory → Products
- Product search — by name, brand, or category
- Filters — Price range, Brand, Rating, Stock availability
- Sorting — Price low-high, Rating, Newest, Most Popular
- Product detail page — Images, Specifications, Reviews
- Related product suggestions

**Account:**
- Email + OTP login (no password — modern and secure)
- Google login option
- Profile management — name, phone, photo
- Save multiple delivery addresses
- Wishlist — save products for later

**Cart & Checkout:**
- Cart — add, remove, update quantity
- Apply coupon code
- Select or add delivery address
- Pay via Razorpay — UPI / Card / Netbanking
- Order confirmation page on success

**Order Management:**
- My Orders — all orders in one place
- Order detail — items, amount, current status
- Live tracking — where the shipment is right now
- Cancel order (before it ships)
- Return / Refund request
- Download invoice

**Notifications:**
- Order placed — email confirmation
- Order confirmed — email
- Order shipped — email with tracking link
- Order delivered — email
- Review request after delivery

---

### 4.2 Admin Features

**Dashboard Overview:**
- Today's orders — how many received
- Pending packing — orders not yet packed
- Revenue — today, this week, this month
- Low stock alerts — which products are running out
- Live feed of recent orders
- Top selling products

**Order Management:**
- All orders — filter by status, date, payment
- Order detail — products, customer info, delivery address
- Update status — confirmed → packed → shipped → delivered
- Pack deadline alert — 24 hours from order placement (overdue orders shown in red)
- Bulk status update
- Assign courier via Shiprocket
- Print packing slip / invoice
- Initiate refunds

**Product Management:**
- Add new product — name, description, images, price, stock
- Edit existing product details
- Upload multiple images — drag and drop
- Add specifications — custom fields (battery life, RAM, color, etc.)
- Mark as Featured or Deal of the Day
- Bulk price updates
- Stock quantity updates

**Catalog Management:**
- Add / Edit / Delete Categories
- Add / Edit / Delete Subcategories
- Add / Edit / Delete Brands
- Upload category images

**Customer Management:**
- All customers list
- Customer profile — order history, total spent, location
- Search by name, phone, or email

**Analytics Dashboard:**
- Revenue chart — daily / weekly / monthly / yearly
- Orders chart
- Top products by sales volume
- Top categories by revenue
- Customer growth over time
- Payment method breakdown (UPI vs Card vs Netbanking)
- Traffic source analysis

**Coupon Management:**
- Create coupons — flat amount or percentage discount
- Set minimum order value requirement
- Set expiry date
- Usage limit per coupon
- Track how many times each coupon was used

**Delivery Management:**
- Pending pickups
- Orders in transit
- Delivered today
- Failed deliveries
- Return pickups

---

### 4.3 Delivery SLA Management

Timeline tracked for every order from placement to delivery:

```
Order Placed
    ↓ (0–24 hours) ← PACK DEADLINE — Red alert in admin dashboard if missed
Packed & Ready
    ↓ (Shiprocket pickup same day or next day)
Picked Up by Courier
    ↓ (1–7 days depending on destination)
Out for Delivery
    ↓
Delivered to Customer
```

Every stage has a timestamp. If the pack deadline is missed, the admin dashboard shows a **red alert** on that order.

---

## 5. DATABASE TABLES — COMPLETE DETAIL

The database is where all data is stored permanently. Below are all the tables, what they store, and why they are needed.

---

### TABLE 1: categories
**Purpose:** Organize products into broad groups

| Column | Description |
|---|---|
| id | Unique identifier |
| name | Category name (e.g., Mobile Accessories) |
| slug | URL-friendly name (e.g., mobile-accessories) |
| image | Category banner image |
| is_active | Show or hide on site |
| sort_order | Which category appears first on homepage |

---

### TABLE 2: subcategories
**Purpose:** More specific groups within a category

| Column | Description |
|---|---|
| id | Unique identifier |
| category_id | Which category this belongs to |
| name | Subcategory name (e.g., Earbuds, Charging Cables) |
| slug | URL-friendly name |
| is_active | Show or hide |

---

### TABLE 3: brands
**Purpose:** Manage brands like Sony, JBL, Samsung

| Column | Description |
|---|---|
| id | Unique identifier |
| name | Brand name |
| slug | URL-friendly name |
| logo_url | Brand logo image |
| is_active | Show or hide |

---

### TABLE 4: products
**Purpose:** Core data for all products — the most important table on the site

| Column | Description |
|---|---|
| id | Unique identifier |
| name | Product name |
| slug | URL for the product detail page |
| description | Full product description |
| short_description | Brief description shown on product cards |
| sku | Stock Keeping Unit — internal product code |
| category_id | Which category this product belongs to |
| subcategory_id | Which subcategory this belongs to |
| brand_id | Which brand |
| mrp | Original / Maximum Retail Price |
| selling_price | Discounted selling price |
| discount_percent | Auto-calculated from MRP and selling price |
| stock_quantity | How many units are in stock |
| low_stock_threshold | Alert when stock drops to this number (e.g., 5) |
| weight_grams | Shipping weight for courier calculation |
| is_active | Show or hide on site |
| is_featured | Show in Featured section on homepage |
| is_deal_of_day | Show in Deal of the Day section |
| rating | Average customer rating (auto-calculated) |
| review_count | Total number of reviews |
| sold_count | Total units sold |
| meta_title | Title shown in Google search results |
| meta_description | Description shown in Google search results |

---

### TABLE 5: product_images
**Purpose:** Store multiple images per product

| Column | Description |
|---|---|
| product_id | Which product this image belongs to |
| image_url | Link to the image |
| is_primary | Whether this is the main display image |
| sort_order | Image display order in the gallery |

---

### TABLE 6: product_specifications
**Purpose:** Store product-specific technical details (varies by product type)

| Column | Description |
|---|---|
| product_id | Which product |
| spec_group | Group name (e.g., General, Battery, Connectivity) |
| spec_name | Specification name (e.g., Battery Life, Wattage) |
| spec_value | Specification value (e.g., 30 Hours, 20W) |
| sort_order | Display order in specifications table |

---

### TABLE 7: user_profiles
**Purpose:** Store additional user information beyond basic login

| Column | Description |
|---|---|
| id | Linked to Supabase Auth user |
| full_name | Full name |
| phone | Phone number |
| avatar_url | Profile photo |
| date_of_birth | Date of birth |
| gender | Gender |
| is_admin | Whether this user has admin access |

---

### TABLE 8: addresses
**Purpose:** Users can save multiple delivery addresses

| Column | Description |
|---|---|
| user_id | Which user this address belongs to |
| full_name | Recipient name |
| phone | Contact number |
| address_line1 | House / flat number, street name |
| address_line2 | Landmark (optional) |
| city | City |
| state | State |
| pincode | PIN code |
| is_default | Whether this is the default address |
| address_type | Home / Work / Other |

---

### TABLE 9: orders
**Purpose:** Complete record of every order — the most critical business table

| Column | Description |
|---|---|
| id | Unique order identifier |
| order_number | Human-readable ID (e.g., BD20260516-1001) |
| user_id | Who placed the order |
| shipping_name | Recipient name at time of order |
| shipping_phone | Contact number |
| shipping_address | Full address |
| shipping_city / state / pincode | Delivery location |
| subtotal | Product total before discounts |
| discount_amount | Coupon or sale discount applied |
| shipping_charge | Delivery fee |
| total_amount | Final amount paid |
| payment_method | Razorpay / COD |
| payment_status | Pending / Paid / Failed / Refunded |
| razorpay_order_id | Reference ID from Razorpay |
| razorpay_payment_id | Payment confirmation ID |
| status | placed → confirmed → packed → shipped → delivered |
| courier_name | Bluedart / Delhivery / DTDC etc. |
| tracking_number | AWB tracking number |
| placed_at | When order was placed |
| confirmed_at | When admin confirmed |
| packed_at | When packed |
| shipped_at | When shipped |
| delivered_at | When delivered |
| pack_deadline | Auto-set to 24 hours after placed — triggers admin alert |

---

### TABLE 10: order_items
**Purpose:** One order can contain multiple products — each item stored here

| Column | Description |
|---|---|
| order_id | Which order this item belongs to |
| product_id | Which product |
| product_name | Product name snapshot at time of order |
| product_image | Image snapshot |
| quantity | Number of units ordered |
| mrp | Original price at time of order |
| selling_price | Actual price paid per unit |
| total_price | quantity × selling_price |

---

### TABLE 11: order_status_history
**Purpose:** Complete audit log of every status change for an order

| Column | Description |
|---|---|
| order_id | Which order |
| status | New status applied |
| note | Admin note (e.g., "Bluedart pickup scheduled 3pm") |
| updated_by | Which admin made the change |
| created_at | Timestamp of the change |

---

### TABLE 12: wishlists
**Purpose:** Users can save products to buy later

| Column | Description |
|---|---|
| user_id | Which user |
| product_id | Which product was saved |
| created_at | When it was saved |

---

### TABLE 13: reviews
**Purpose:** Customer reviews build trust and display star ratings on products

| Column | Description |
|---|---|
| product_id | Which product is reviewed |
| user_id | Who wrote the review |
| order_id | Which order the review is linked to |
| rating | 1 to 5 stars |
| title | Review headline |
| body | Full review text |
| is_verified_purchase | Only buyers can review (verified badge) |
| is_approved | Admin must approve before it appears |

---

### TABLE 14: coupons
**Purpose:** Manage discount coupons for promotions and sales

| Column | Description |
|---|---|
| code | Coupon code (e.g., BOXDEAL10) |
| discount_type | Percentage or flat amount |
| discount_value | How much discount |
| min_order_amount | Minimum order value required |
| max_discount | Maximum discount cap |
| usage_limit | Total times it can be used |
| used_count | How many times used so far |
| expires_at | Expiry date and time |
| is_active | Active or disabled |

---

### TABLE 15: analytics_events
**Purpose:** Track custom user behavior beyond what Google Analytics captures

| Column | Description |
|---|---|
| user_id | Logged-in user (if applicable) |
| session_id | Track anonymous users |
| event_name | buy_click, whatsapp_click, login, signup, etc. |
| page_url | Where the user was when the event happened |
| properties | Additional data (product_id, category, value, etc.) |
| created_at | When the event occurred |

---

## 6. ALL SERVICES — COST BREAKDOWN

### Monthly Cost at Launch

| Service | What It Does | Free Limit | Paid Plan |
|---|---|---|---|
| Vercel | Website hosting | Very generous free tier | $20/month when traffic grows |
| Supabase | Database + Auth + Storage | 500MB DB, 1GB Storage | $25/month when needed |
| Resend | Send emails | 100 emails/day free | $20/month (50,000 emails) |
| Razorpay | Accept payments | No monthly fee | 2% per transaction |
| Shiprocket | Manage deliveries | No monthly fee | Per shipment rate |
| Google Analytics | Traffic analytics | Free forever | — |
| Microsoft Clarity | User behavior recording | Free forever | — |

**Fixed monthly cost at launch: Nearly Zero**
**At scale (when business grows): ~$65–70/month (approx ₹5,500)**

---

## 7. USER JOURNEY — STEP BY STEP

### New Customer Flow
```
Searches "JBL speaker buy online" on Google
         ↓
BoxDeal product page appears in Google results (via SEO)
         ↓
Views product — images, specs, price, reviews
         ↓
Clicks "Add to Cart"
         ↓
Logs in via email OTP (30 seconds)
         ↓
Adds or selects delivery address
         ↓
Pays via Razorpay — UPI (10 seconds)
         ↓
Order confirmation email received instantly
         ↓
Admin also receives email notification for new order
         ↓
Admin packs order → submits to Shiprocket
         ↓
Customer receives email with tracking link
         ↓
Order delivered
         ↓
Review request email sent
```

---

## 8. ADMIN DAILY WORKFLOW

### Morning Routine
1. Open dashboard — view all pending orders for today
2. Check orders approaching pack deadline — highlighted in red if overdue
3. Pack products — update status to "Packed"
4. Submit to Shiprocket — AWB tracking number auto-generated
5. Check low stock alerts — reorder inventory as needed

### Evening Routine
1. Review today's revenue
2. Check delivered orders — delivery success rate
3. Review returns and cancellations
4. Check for any failed payments that need manual review

---

## 9. PHASE-WISE IMPLEMENTATION PLAN

### Phase 1 — Foundation (Week 1–2)
- Supabase account and project setup
- Create all 15 database tables
- Next.js project initialization
- Folder structure and environment configuration

### Phase 2 — Core Backend (Week 2–3)
- User authentication (login / signup with OTP)
- Products API (list, detail, search, filter)
- Categories, Subcategories, Brands API
- Admin authentication and role-based access

### Phase 3 — Frontend Shop (Week 3–5)
- Homepage — hero banner, deals, categories, brands
- Category listing page with filters and sorting
- Product detail page — image gallery, specs, reviews
- Search results page
- User account pages — profile, orders, addresses, wishlist

### Phase 4 — Cart & Payment (Week 5–6)
- Shopping cart functionality
- Full checkout flow
- Razorpay payment integration
- Order placement and confirmation

### Phase 5 — Order Management (Week 6–7)
- Order confirmation emails (user + admin)
- Admin order management dashboard
- Status update workflow
- Pack deadline alerts

### Phase 6 — Delivery Integration (Week 7–8)
- Shiprocket API connection
- AWB / tracking number generation
- Automatic tracking updates
- Shipping notification emails

### Phase 7 — Admin Dashboard (Week 8–9)
- Revenue and sales analytics
- Product management (add / edit / delete)
- Coupon management
- Customer management

### Phase 8 — Analytics & SEO (Week 9–10)
- Google Analytics 4 setup
- Microsoft Clarity setup
- Custom event tracking
- SEO optimization — meta tags, sitemap, structured data for Google

### Phase 9 — Testing & Launch (Week 10)
- End-to-end testing of all user flows
- Performance and load testing
- Security audit
- DNS transfer from WordPress to new platform
- Go Live

**Total Estimated Timeline: 8–10 Weeks**

---

## 10. PERFORMANCE TARGETS

| Metric | WordPress (Current) | New Platform (Target) |
|---|---|---|
| Page Load Speed | 4–8 seconds | Under 1 second |
| Mobile PageSpeed Score | 30–50 | 90+ |
| Desktop PageSpeed Score | 50–70 | 95+ |
| 500 simultaneous users | Site slows significantly | Handled with ease |
| 5,000 simultaneous users | Site crashes | Handled |
| SEO Performance | Medium | High |

---

## 11. SECURITY MEASURES

- All passwords are encrypted — never stored as plain text
- Payment processing via Razorpay — card data never touches our server
- Row Level Security — users can only access their own data
- Admin routes — accessible only by verified admin accounts
- HTTPS enforced — all traffic is encrypted
- SQL injection — not possible (parameterized queries throughout)
- Rate limiting — protection against brute force attacks

---

## 12. WHAT WILL NOT BE USED

- No WordPress — entirely custom built
- No WooCommerce — better, faster custom solution
- No page builders (Elementor, etc.) — code-based for maximum speed
- No shared hosting — cloud hosting that scales automatically
- No multiple plugins — everything in one codebase, fully controlled

---

## 13. SUMMARY

**In One Line:**
BoxDeal's new platform will be a professional, fast, scalable e-commerce website delivering an Amazon/Flipkart level experience — custom built with complete admin control, automatic delivery management, full analytics, and seamless payments.

**What the Client Gets:**
- Blazing fast website — customers won't leave due to slow loading
- Complete business visibility — orders, revenue, customers — all in one place
- Automatic delivery tracking — powered by Shiprocket
- Professional email system — customer communication at every step
- Built to scale — whether the business grows 5x or 50x, the platform handles it
- SEO ready — organic traffic from Google
- Mobile-first design — 80% of Indian e-commerce traffic comes from mobile

---

*Document prepared by development team*
*BoxDeal E-Commerce Platform — 2026*
