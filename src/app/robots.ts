/**
 * ============================================================================
 * FILE: src/app/robots.ts
 * PERAN: Generator otomatis file `/robots.txt` untuk mesin pencari (SEO).
 * PENJELASAN PRESENTASI:
 * Mengizinkan bot mesin pencari (seperti Google) mengindeks seluruh halaman
 * publik aplikasi serta mengarahkannya ke file `sitemap.xml`.
 * ============================================================================
 */
import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://webar-kampus2-unsil.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
