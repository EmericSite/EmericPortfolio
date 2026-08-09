// Emericfolio — created by Tomi-Tom, 2026
// Serves /sitemap.xml, listing the single public address of the site
import type { MetadataRoute } from "next";
import { partage } from "@/content/site";

const SITE_URL = partage.url;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
