// Emericfolio — created by Tomi-Tom, 2026
// Serves /robots.txt: lets crawlers in and tells them where the sitemap is
import type { MetadataRoute } from "next";
import { partage } from "@/content/site";

const SITE_URL = partage.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
