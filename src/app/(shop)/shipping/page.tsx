import type { Metadata } from "next";
import {
  PolicyLayout,
  PolicySection,
  PolicyNote,
} from "@/components/shared/PolicyLayout";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from "@/constants";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | BoxDeal",
  description:
    "Shipping charges, delivery timelines and order tracking for BoxDeal open-box orders across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      updated="21 June 2026"
      intro="Fast, reliable and trackable delivery across India. Here is how shipping works at BoxDeal."
    >
      <PolicySection title="Shipping Charges">
        <ul>
          <li>
            <strong>Free shipping</strong> on all orders above{" "}
            <strong>₹{FREE_SHIPPING_THRESHOLD}</strong>.
          </li>
          <li>
            A flat shipping fee of <strong>₹{SHIPPING_CHARGE}</strong> applies to
            orders below ₹{FREE_SHIPPING_THRESHOLD}.
          </li>
        </ul>
        <p>
          The exact shipping charge is always shown at checkout before you pay.
        </p>
      </PolicySection>

      <PolicySection title="Delivery Timelines">
        <ul>
          <li>
            <strong>Metro cities:</strong> 2–5 business days.
          </li>
          <li>
            <strong>Other locations:</strong> 5–8 business days.
          </li>
          <li>
            <strong>Remote / rural areas:</strong> may take a little longer
            depending on courier reach.
          </li>
        </ul>
        <p>
          Orders are usually packed and dispatched within 24–48 hours of
          confirmation.
        </p>
      </PolicySection>

      <PolicySection title="Order Tracking">
        <p>
          Once your order ships, you&rsquo;ll receive a tracking link by email
          and SMS. You can also track it anytime from your{" "}
          <a href="/orders">Orders</a> page.
        </p>
      </PolicySection>

      <PolicySection title="Delivery Partners">
        <p>
          We ship through trusted logistics partners via Shiprocket to make sure
          your open-box product reaches you safely and on time.
        </p>
      </PolicySection>

      <PolicySection title="Please Note">
        <PolicyNote tone="warning">
          We strongly recommend recording a{" "}
          <strong>clear unboxing video</strong> when you open your package. It is
          required if you ever need to raise a damage or missing-item claim. See
          our <a href="/returns">Return Policy</a> for details.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="Delays & Exceptions">
        <p>
          Delivery times are estimates. Weather, regional restrictions, courier
          delays or incorrect addresses can affect timelines. If your order is
          delayed beyond the estimate, contact us and we&rsquo;ll track it down
          for you.
        </p>
      </PolicySection>

      <PolicySection title="Incorrect or Incomplete Address">
        <p>
          Please double-check your shipping address at checkout. We are not
          responsible for non-delivery caused by an incorrect or incomplete
          address. If a parcel returns to us undelivered, we&rsquo;ll contact you
          to re-arrange shipping.
        </p>
      </PolicySection>

      <PolicySection title="Need Help?">
        <p>
          For any delivery question, email{" "}
          <a href="mailto:support@boxdeal.in">support@boxdeal.in</a> or call{" "}
          <a href="tel:+919876543210">+91 98765 43210</a>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
