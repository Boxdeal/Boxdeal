import type { Metadata } from "next";
import {
  PolicyLayout,
  PolicySection,
  PolicyNote,
} from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Return, Replacement & Cancellation Policy | BoxDeal",
  description:
    "Everything about returns, replacements, cancellations, warranty and product grading for open-box products on BoxDeal.",
};

const grades = [
  {
    grade: "A",
    name: "Like-New",
    desc: "Seal opened but unused. Original box and all accessories included. No visible signs of use.",
    color: "bg-green-100 text-green-700",
  },
  {
    grade: "B",
    name: "Excellent",
    desc: "Like-new with only very minor cosmetic marks. Fully functional with accessories.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    grade: "C",
    name: "Good",
    desc: "Minor visible signs of handling. Works perfectly. May have light scuffs.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    grade: "D",
    name: "Fair",
    desc: "Multiple cosmetic signs but fully functional. Best value for money.",
    color: "bg-orange-100 text-orange-700",
  },
];

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout
      title="Return, Replacement & Cancellation Policy"
      updated="21 June 2026"
      intro="We want you to shop open-box with full confidence. Here is exactly how returns, replacements, cancellations and warranty work at BoxDeal — clear and simple."
    >
      <PolicySection title="What is an Open-Box Product?">
        <p>
          Open-box (or unboxed) products are items whose original seal was opened
          but which have little to no usage. They are sourced from genuine
          e-commerce returns, are in like-new condition, and are priced{" "}
          <strong>30–60% lower</strong> than brand-new items.
        </p>
        <PolicyNote tone="warning">
          <strong>Open-box is not refurbished.</strong> Open-box items are
          seal-opened with 7–30 days of minimal use and still carry brand
          warranty. Refurbished items are used, repaired and often have limited
          or no warranty. Everything we sell is open-box.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="Product Grading — Know Before You Buy">
        <p>
          Every product is inspected and given a grade so you know its exact
          condition before ordering:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {grades.map((g) => (
            <div
              key={g.grade}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${g.color}`}
                >
                  {g.grade}
                </span>
                <span className="font-semibold text-gray-900">{g.name}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{g.desc}</p>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="Return Window">
        <p>
          You can request a return within{" "}
          <strong>5 days of delivery</strong> if the product arrives damaged,
          defective, or significantly different from what was described.
        </p>
        <ul>
          <li>Free pickup is arranged for eligible returns.</li>
          <li>
            The product must be returned with all original accessories, box and
            documents.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Unboxing Video — Mandatory for Damage Claims">
        <PolicyNote>
          A <strong>clear, continuous unboxing video</strong> is required for any
          damage or &ldquo;missing item&rdquo; claim. Please record from the
          moment the package is sealed and untouched. Without this video we
          cannot approve damage-related returns. This protects genuine buyers
          from fraud and keeps our prices low.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="Defective Products & Warranty">
        <p>
          Most products carry <strong>6–12 months of brand warranty</strong>. If
          a product develops a fault:
        </p>
        <ol>
          <li>
            First, contact the brand&rsquo;s authorised service centre using the
            warranty — this is usually the fastest route.
          </li>
          <li>
            If the brand denies service for a valid in-warranty issue, contact us
            and we will arrange a free replacement.
          </li>
        </ol>
        <p>
          Beyond brand warranty, every order is covered by{" "}
          <strong>BoxDeal Assurance</strong> for delivery and as-described
          issues.
        </p>
      </PolicySection>

      <PolicySection title="Replacements">
        <p>
          Where stock is available, we offer a replacement of the same product.
          If a replacement is not available, we issue a full refund.
        </p>
      </PolicySection>

      <PolicySection title="Refunds">
        <ul>
          <li>
            Approved refunds are processed within{" "}
            <strong>3–7 business days</strong>.
          </li>
          <li>
            Refunds are credited back to your original payment method via
            Razorpay.
          </li>
          <li>
            For Cash on Delivery orders, refunds are issued to your provided bank
            account or UPI.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Order Cancellation">
        <p>
          You can cancel your order within{" "}
          <strong>12 hours of placing it, at no charge</strong> — as long as it
          has not already been shipped. Cancel from your{" "}
          <a href="/orders">Orders</a> page or contact support. If paid online,
          the full amount is refunded.
        </p>
      </PolicySection>

      <PolicySection title="Non-Returnable Situations">
        <ul>
          <li>Return requested after the 5-day window.</li>
          <li>Damage claims without a valid unboxing video.</li>
          <li>
            Products returned without original box, accessories or with
            customer-caused damage.
          </li>
          <li>Minor cosmetic marks already disclosed by the product grade.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Need Help?">
        <p>
          Our team is happy to help with any return or refund. Email{" "}
          <a href="mailto:support@boxdeal.in">support@boxdeal.in</a> or call{" "}
          <a href="tel:+919876543210">+91 98765 43210</a>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
