/**
 * ============================================================================
 * FILE: src/app/sitemap.ts
 * PERAN: Generator otomatis file `/sitemap.xml` berisi daftar URL aplikasi.
 * PENJELASAN PRESENTASI:
 * Mendaftarkan halaman utama, 3 mode eksplorasi (AR, 3D, 2D), serta 16 tautan
 * deep-link gedung agar seluruh lokasi kampus mudah ditemukan di Google Search.
 * ============================================================================
 */
import type { MetadataRoute } from "next";
import { CAMPUS_BUILDINGS } from "@/data/campusBuildings";

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://webar-kampus2-unsil.vercel.app";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/?mode=ar`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/?mode=3d`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/?mode=map`, lastModified, changeFrequency: "monthly", priority: 0.9 },
  ];

  const buildingRoutes: MetadataRoute.Sitemap = CAMPUS_BUILDINGS.map((b) => ({
    url: `${siteUrl}/?gedung=${encodeURIComponent(b.id)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...coreRoutes, ...buildingRoutes];
}
