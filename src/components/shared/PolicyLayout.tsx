import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  intro: string;
  updated: string;
  children: React.ReactNode;
}

/**
 * Shared shell for all legal / policy pages (Privacy, Terms, Returns, Shipping).
 * Keeps a consistent header, "last updated" line and readable content card
 * styled to the BoxDeal theme.
 */
export function PolicyLayout({ title, intro, updated, children }: PolicyLayoutProps) {
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
            <span className="text-white">{title}</span>
          </nav>
          <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            {intro}
          </p>
          <p className="mt-4 text-xs text-white/70">Last updated: {updated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="policy-prose space-y-8 text-gray-700">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Have a question about this policy?{" "}
          <a
            href="mailto:support@boxdeal.in"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Email our support team
          </a>
        </p>
      </div>
    </div>
  );
}

/** A numbered / titled section inside a policy page. */
export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed sm:text-[15px]">{children}</div>
    </section>
  );
}

/** Highlighted callout box for important notes. */
export function PolicyNote({
  tone = "brand",
  children,
}: {
  tone?: "brand" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-brand-200 bg-brand-50 text-brand-900";
  return (
    <div className={`rounded-lg border p-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}
