import type { Metadata } from "next";

// Account area (profile, addresses, settings) private hai — index se bahar.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
