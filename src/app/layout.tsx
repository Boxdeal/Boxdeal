import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/store/provider";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BoxDeal — Best Deals on Electronics & Mobile Accessories",
    template: "%s | BoxDeal",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "electronics",
    "mobile accessories",
    "online shopping India",
    "best deals",
    "buy electronics online",
    "BoxDeal",
    "gadgets",
    "chargers",
    "earphones",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "BoxDeal — Best Deals on Electronics & Mobile Accessories",
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoxDeal — Best Deals on Electronics & Mobile Accessories",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  formatDetection: { telephone: false },
  // Google Search Console verification — apna code yahan daalein:
  // verification: { google: "your-google-site-verification-code" },
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
        <script {...jsonLdScriptProps(organizationJsonLd())} />
        <script {...jsonLdScriptProps(websiteJsonLd())} />
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
