import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/store/provider";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BoxDeal — Best Deals on Electronics & Mobile Accessories",
    template: "%s | BoxDeal",
  },
  description:
    "Shop premium electronics, mobile accessories, and more at unbeatable prices. Fast delivery across India.",
  keywords: ["electronics", "mobile accessories", "online shopping", "deals", "India"],
  authors: [{ name: "BoxDeal" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "BoxDeal",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fhyfxchcgnsvjhagpcrj.supabase.co" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ReduxProvider>
          <ServiceWorkerRegister />
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{ duration: 3000 }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
