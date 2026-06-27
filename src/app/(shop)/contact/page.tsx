import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | BoxDeal",
  description:
    "Get in touch with the BoxDeal support team for help with orders, returns, shipping or anything else.",
};

const contactInfo = [
  {
    icon: Mail,
    label: "Email Us",
    value: "admin@boxdeal.in",
    href: "mailto:admin@boxdeal.in",
    hint: "We reply within 24–48 hours",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 93551 51182",
    href: "tel:+919355151182",
    hint: "Mon–Sat, 10 AM – 7 PM",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "BoxDeal HQ, India",
    href: null,
    hint: "Online-first, shipping pan-India",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-1 text-sm text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Contact Us</span>
          </nav>
          <h1 className="text-center text-3xl font-black sm:text-4xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/90 sm:text-base">
            Have a question about an order, a return, or a product? Our support
            team is here to help. Reach out and we&rsquo;ll get back to you as
            soon as possible.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-4 lg:col-span-1">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-brand-200">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-brand-600">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.hint}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}

            <div className="flex items-start gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-900">
                  Looking for quick answers?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-brand-900/80">
                  Check our{" "}
                  <Link href="/faq" className="font-semibold underline">
                    FAQ
                  </Link>
                  ,{" "}
                  <Link href="/returns" className="font-semibold underline">
                    Return Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/shipping" className="font-semibold underline">
                    Shipping Info
                  </Link>{" "}
                  — most questions are answered there.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
