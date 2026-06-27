import type { Metadata } from "next";
import {
  PolicyLayout,
  PolicySection,
  PolicyNote,
} from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | BoxDeal",
  description:
    "How BoxDeal collects, uses, and protects your personal information when you shop open-box products with us.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      updated="21 June 2026"
      intro="Your privacy matters to us. This policy explains, in simple terms, what information BoxDeal collects, why we collect it, and how we keep it safe."
    >
      <PolicySection title="1. Who We Are">
        <p>
          BoxDeal (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an
          online marketplace for genuine open-box and unboxed products in India.
          This Privacy Policy applies to everything you do on our website and
          mobile experience.
        </p>
      </PolicySection>

      <PolicySection title="2. Information We Collect">
        <p>We only collect what we need to run your account and orders:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address and
            phone number, used to sign you in via OTP.
          </li>
          <li>
            <strong>Order &amp; delivery details</strong> — shipping address,
            billing address and order history.
          </li>
          <li>
            <strong>Payment information</strong> — handled securely by our
            payment partner Razorpay. We never see or store your full card,
            UPI or bank details.
          </li>
          <li>
            <strong>Usage data</strong> — basic information like pages viewed,
            products searched and device type, used to improve the site.
          </li>
          <li>
            <strong>Claim documentation</strong> — unboxing videos or photos you
            share when raising a return or damage claim.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. How We Use Your Information">
        <ul>
          <li>To create your account and verify you with OTP.</li>
          <li>To process orders, payments, deliveries and returns.</li>
          <li>To send order updates over email, SMS or WhatsApp.</li>
          <li>To provide customer support and resolve claims.</li>
          <li>To detect fraud and keep the marketplace safe.</li>
          <li>
            To improve our products, pricing and overall shopping experience.
          </li>
        </ul>
        <PolicyNote>
          We do <strong>not</strong> sell your personal information to anyone.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="4. Who We Share It With">
        <p>
          We share data only with trusted partners who help us run BoxDeal, and
          only as far as needed:
        </p>
        <ul>
          <li>
            <strong>Razorpay</strong> — to securely process your payments.
          </li>
          <li>
            <strong>Shiprocket and delivery partners</strong> — to ship and
            deliver your orders.
          </li>
          <li>
            <strong>Communication tools</strong> — to send order emails and
            messages.
          </li>
          <li>
            <strong>Authorities</strong> — only if required by law.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Cookies">
        <p>
          We use cookies to keep you signed in, remember your cart, and
          understand how the site is used. You can disable cookies in your
          browser settings, but some features (like staying logged in) may stop
          working.
        </p>
      </PolicySection>

      <PolicySection title="6. How We Protect Your Data">
        <p>
          All transactions are encrypted, payments run through PCI-DSS compliant
          Razorpay, and access to your data is limited to staff who need it.
          While no system is 100% secure, we take strong measures to keep your
          information safe.
        </p>
      </PolicySection>

      <PolicySection title="7. Your Rights">
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Ask us to correct or update your details.</li>
          <li>Request deletion of your account and data.</li>
          <li>Opt out of marketing messages at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:admin@boxdeal.in">admin@boxdeal.in</a>.
        </p>
      </PolicySection>

      <PolicySection title="8. Children's Privacy">
        <p>
          BoxDeal is intended for users aged 18 and above. We do not knowingly
          collect information from children.
        </p>
      </PolicySection>

      <PolicySection title="9. Changes to This Policy">
        <p>
          We may update this policy from time to time. The latest version will
          always be available on this page with a revised &ldquo;last
          updated&rdquo; date.
        </p>
      </PolicySection>

      <PolicySection title="10. Contact Us">
        <p>
          Questions about your privacy? Reach us at{" "}
          <a href="mailto:admin@boxdeal.in">admin@boxdeal.in</a> or call{" "}
          <a href="tel:+919355151182">+91 93551 51182</a>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
