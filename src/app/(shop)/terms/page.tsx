import type { Metadata } from "next";
import Link from "next/link";
import {
  PolicyLayout,
  PolicySection,
} from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of BoxDeal and your purchase of open-box products.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      updated="21 June 2026"
      intro="These terms govern your use of BoxDeal. By shopping with us, you agree to them. We've kept them short and clear."
    >
      <PolicySection title="1. Acceptance of Terms">
        <p>
          By accessing or using BoxDeal, you confirm that you are at least 18
          years old and agree to these Terms &amp; Conditions, our{" "}
          <Link href="/privacy">Privacy Policy</Link> and our{" "}
          <Link href="/returns">Return Policy</Link>.
        </p>
      </PolicySection>

      <PolicySection title="2. About Our Products">
        <p>
          BoxDeal sells genuine <strong>open-box</strong> products — items with
          the seal opened but minimal to no usage, sourced from verified
          e-commerce returns. Each product is graded for condition before listing.
          Open-box products are not refurbished and most carry valid brand
          warranty.
        </p>
      </PolicySection>

      <PolicySection title="3. Your Account">
        <ul>
          <li>
            You are responsible for keeping your login and OTP secure.
          </li>
          <li>
            Provide accurate account, contact and delivery information.
          </li>
          <li>
            You are responsible for activity that happens under your account.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="4. Pricing & Payments">
        <ul>
          <li>All prices are in Indian Rupees (₹) and include applicable taxes.</li>
          <li>
            Payments are processed securely through Razorpay. We do not store
            your card or UPI details.
          </li>
          <li>
            We try to keep prices and stock accurate, but errors can occur. If a
            product is mispriced or out of stock after you order, we&rsquo;ll
            inform you and offer a refund.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Orders">
        <p>
          Placing an order is an offer to buy. We confirm orders by email/SMS.
          We reserve the right to cancel any order due to stock issues, pricing
          errors, or suspected fraud, with a full refund where payment was made.
        </p>
      </PolicySection>

      <PolicySection title="6. Returns, Cancellations & Shipping">
        <p>
          Returns, replacements and cancellations are governed by our{" "}
          <Link href="/returns">Return Policy</Link>, and delivery is governed by our{" "}
          <Link href="/shipping">Shipping Policy</Link>. Please read them before
          ordering.
        </p>
      </PolicySection>

      <PolicySection title="7. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the site for any unlawful or fraudulent purpose.</li>
          <li>Submit false claims or fake unboxing evidence.</li>
          <li>Copy, scrape or misuse our content, listings or images.</li>
          <li>Attempt to disrupt or gain unauthorised access to our systems.</li>
        </ul>
      </PolicySection>

      <PolicySection title="8. Intellectual Property">
        <p>
          The BoxDeal name, logo, design and content are our property and may not
          be used without written permission. Product images and brand names
          belong to their respective owners.
        </p>
      </PolicySection>

      <PolicySection title="9. Limitation of Liability">
        <p>
          BoxDeal is not liable for indirect or incidental damages arising from
          use of the site. Our total liability for any order is limited to the
          amount you paid for that order. Brand warranty claims are handled per
          the brand&rsquo;s terms.
        </p>
      </PolicySection>

      <PolicySection title="10. Changes to These Terms">
        <p>
          We may update these terms from time to time. Continued use of BoxDeal
          after changes means you accept the updated terms.
        </p>
      </PolicySection>

      <PolicySection title="11. Governing Law">
        <p>
          These terms are governed by the laws of India. Any disputes are subject
          to the jurisdiction of the courts in India.
        </p>
      </PolicySection>

      <PolicySection title="12. Contact">
        <p>
          For any questions about these terms, email{" "}
          <a href="mailto:admin@boxdeal.in">admin@boxdeal.in</a> or call{" "}
          <a href="tel:+919355151182">+91 93551 51182</a>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
