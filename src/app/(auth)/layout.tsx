import type { Metadata } from "next";

// Auth pages (login/signup/password/callback) SEO ke liye useless aur private
// hain — inhe search index se bahar rakho, par links follow karne do.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
