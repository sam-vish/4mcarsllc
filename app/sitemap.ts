import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ["", "/privacy-policy", "/terms-of-service", "/sms-disclosure"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));
}
