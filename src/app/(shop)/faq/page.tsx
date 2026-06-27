import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { FaqAccordion, type FaqCategory } from "@/components/shared/FaqAccordion";
import { DELIVERY_CHARGE_CAP } from "@/constants";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | BoxDeal",
  description:
    "Answers to common questions about open-box products, returns, warranty, shipping and payments on BoxDeal.",
};

const categories: FaqCategory[] = [
  {
    title: "Open-Box Products",
    items: [
      {
        q: "What is an open-box product?",
        a: (
          <p>
            Open-box (unboxed) products are items whose original seal was opened
            but which have little to no usage. They&rsquo;re sourced from genuine
            e-commerce returns, are in like-new condition, and cost 30–60% less
            than brand-new items.
          </p>
        ),
      },
      {
        q: "Is open-box the same as refurbished?",
        a: (
          <p>
            No. Open-box items are seal-opened with only 7–30 days of minimal use
            and still carry brand warranty. Refurbished items are used, repaired,
            and often have limited or no warranty. <strong>Everything we sell is
            open-box, never refurbished.</strong>
          </p>
        ),
      },
      {
        q: "What do the product grades (A, B, C, D) mean?",
        a: (
          <ul>
            <li>
              <strong>Grade A (Like-New):</strong> Unused, original box and all
              accessories, no visible signs.
            </li>
            <li>
              <strong>Grade B (Excellent):</strong> Like-new with only very minor
              cosmetic marks.
            </li>
            <li>
              <strong>Grade C (Good):</strong> Minor visible signs of handling,
              works perfectly.
            </li>
            <li>
              <strong>Grade D (Fair):</strong> Multiple cosmetic signs but fully
              functional — best value.
            </li>
          </ul>
        ),
      },
      {
        q: "Do open-box products come with a warranty?",
        a: (
          <p>
            Yes. Most products carry 6–12 months of brand warranty. Every order
            is also covered by BoxDeal Assurance for delivery and as-described
            issues. See our <Link href="/returns">Return &amp; Warranty Policy</Link>.
          </p>
        ),
      },
    ],
  },
  {
    title: "Orders & Shipping",
    items: [
      {
        q: "What are the shipping charges?",
        a: (
          <p>
            Delivery is charged at the live courier rate for your pincode, and is
            <strong> capped at ₹{DELIVERY_CHARGE_CAP}</strong> — you never pay more
            than that even if the actual rate is higher. The exact charge is always
            shown at checkout.
          </p>
        ),
      },
      {
        q: "How long will delivery take?",
        a: (
          <p>
            Metro cities: 2–5 business days. Other locations: 5–8 business days.
            Orders are usually dispatched within 24–48 hours of confirmation. Full
            details are in our <Link href="/shipping">Shipping Policy</Link>.
          </p>
        ),
      },
      {
        q: "How do I track my order?",
        a: (
          <p>
            Once shipped, you&rsquo;ll get a tracking link by email and SMS. You
            can also track anytime from your <Link href="/orders">Orders</Link> page.
          </p>
        ),
      },
      {
        q: "Can I cancel my order?",
        a: (
          <p>
            Yes — you can cancel within <strong>12 hours of placing your order at
            no charge</strong>, as long as it hasn&rsquo;t shipped. If paid online,
            the full amount is refunded.
          </p>
        ),
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return window?",
        a: (
          <p>
            You can request a return within <strong>5 days of delivery</strong> if
            the product arrives damaged, defective, or significantly different
            from what was described. Free pickup is arranged for eligible returns.
          </p>
        ),
      },
      {
        q: "Why do I need an unboxing video?",
        a: (
          <p>
            A clear, continuous unboxing video is <strong>mandatory for any damage
            or missing-item claim</strong>. Please record from the moment the
            package is sealed and untouched. This protects genuine buyers from
            fraud and keeps our prices low.
          </p>
        ),
      },
      {
        q: "How long do refunds take?",
        a: (
          <p>
            Approved refunds are processed within <strong>3–7 business days</strong>{" "}
            to your original payment method via Razorpay. For Cash on Delivery,
            refunds go to your provided bank account or UPI.
          </p>
        ),
      },
      {
        q: "What if my product is defective?",
        a: (
          <p>
            First contact the brand&rsquo;s authorised service centre using the
            warranty. If they deny service for a valid in-warranty issue, contact
            us and we&rsquo;ll arrange a free replacement.
          </p>
        ),
      },
    ],
  },
  {
    title: "Payments & Account",
    items: [
      {
        q: "What payment methods do you accept?",
        a: (
          <p>
            We accept UPI, credit/debit cards, net banking and wallets — all
            processed securely through Razorpay. We never store your card or UPI
            details.
          </p>
        ),
      },
      {
        q: "Is it safe to pay on BoxDeal?",
        a: (
          <p>
            Yes. All payments run through PCI-DSS compliant Razorpay and every
            transaction is encrypted. See our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        ),
      },
      {
        q: "How do I create an account?",
        a: (
          <p>
            Just sign in with your email or phone number — we verify you with a
            one-time OTP. No password to remember.
          </p>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-1 text-sm text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">FAQ</span>
          </nav>
          <h1 className="text-3xl font-black sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            Everything you need to know about shopping open-box with BoxDeal.
            Can&rsquo;t find your answer? We&rsquo;re just a message away.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <FaqAccordion categories={categories} />

        {/* Still need help */}
        <div className="mt-10 rounded-xl border border-brand-100 bg-brand-50 p-6 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-brand-500" />
          <h3 className="mt-3 text-lg font-bold text-gray-900">
            Still have questions?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Our support team is happy to help.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:admin@boxdeal.in"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Email Support
            </a>
            <a
              href="tel:+919355151182"
              className="rounded-lg border border-brand-300 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Call +91 93551 51182
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
