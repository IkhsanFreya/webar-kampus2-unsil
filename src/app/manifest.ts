/**
 * ============================================================================
 * FILE: src/app/manifest.ts
 * PERAN: Konfigurasi PWA (Progressive Web App) Web App Manifest.
 * PENJELASAN PRESENTASI:
 * Memungkinkan aplikasi diinstal ke layar utama HP Android/iOS ("Add to Home Screen")
 * sehingga terbuka fullscreen layaknya aplikasi native tanpa address bar browser.
 * ============================================================================
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR)",
    short_name: "Peta UNSIL 2",
    description:
      "Panduan denah interaktif 16 gedung, maket 3D, rute jalan kaki, dan Marker-Based WebAR kawasan Kampus 2 Mugarsari Universitas Siliwangi.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F6F4EE",
    theme_color: "#065F46",
    lang: "id",
    categories: ["education", "navigation", "utilities"],
    icons: [
      {
        src: "/assets/logo-unsil.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
