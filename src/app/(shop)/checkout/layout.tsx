import type { Metadata } from "next";

// Checkout transactional page — kabhi index nahi hona chahiye.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
