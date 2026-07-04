import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Dynamic robots.txt. Public catalog fully crawlable; private/transactional
 * paths blocked. Sitemap ka reference bhi diya hai taaki crawler saare
 * products/pages discover kar sake.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account",
          "/account/",
          "/checkout",
          "/orders",
          "/wishlist",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/auth/",
          "/search", // search result pages ko index nahi karna
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
