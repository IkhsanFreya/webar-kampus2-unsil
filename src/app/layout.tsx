/**
 * ============================================================================
 * FILE: src/app/layout.tsx
 * PERAN: Kerangka utama (Root Layout) seluruh aplikasi Next.js App Router.
 * PENJELASAN PRESENTASI:
 * 1. Memuat font tipografi modern (Plus Jakarta Sans & IBM Plex Mono).
 * 2. Mengatur metadata SEO lengkap (OpenGraph, Twitter Card, & JSON-LD lokasi UNSIL)
 *    agar ketika link dibagikan ke WhatsApp/media sosial muncul pratinjau profesional.
 * 3. Menanamkan skrip bootstrap tema (Light/Dark) sebelum render agar tidak berkedip.
 * 4. Menyediakan tautan aksesibilitas "Skip to Content" sesuai standar WCAG 2.2.
 * ============================================================================
 */
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

/** Mengambil URL dasar situs secara dinamis (dari environment produksi/Vercel atau fallback). */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://webar-kampus2-unsil.vercel.app";
}

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR)",
  description:
    "Panduan denah interaktif 16 gedung, maket 3D, rute jalan kaki, dan Marker-Based WebAR kawasan Kampus 2 Mugarsari Universitas Siliwangi Tasikmalaya.",
  keywords: [
    "WebAR",
    "Universitas Siliwangi",
    "Kampus 2 Mugarsari",
    "Peta Interaktif",
    "Maket 3D",
    "Wayfinding Kampus",
    "MindAR",
    "Augmented Reality",
    "Tasikmalaya",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/assets/logo-unsil.png",
    apple: "/assets/logo-unsil.png",
  },
  appleWebApp: {
    capable: true,
    title: "Peta UNSIL 2",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Peta Interaktif Kampus 2 UNSIL",
    title: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR & Maket 3D)",
    description:
      "Jelajahi 16 gedung & fasilitas Kampus 2 Mugarsari Universitas Siliwangi dengan Marker-Based WebAR, Maket 3D interaktif, dan penunjuk rute jalan kaki.",
    images: [
      {
        url: "/assets/buildings/Gedung_Rektor.webp",
        width: 1200,
        height: 800,
        alt: "Gedung Rektorat Kampus 2 Mugarsari Universitas Siliwangi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR)",
    description:
      "Jelajahi 16 gedung Kampus 2 Mugarsari UNSIL melalui Marker-Based WebAR, Maket 3D, dan Denah 2D ber-rute.",
    images: ["/assets/buildings/Gedung_Rektor.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F4EE" },
    { media: "(prefers-color-scheme: dark)", color: "#171B1E" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Universitas Siliwangi — Kampus 2 Mugarsari",
  url: siteUrl,
  logo: `${siteUrl}/assets/logo-unsil.png`,
  description:
    "Peta interaktif kawasan Kampus 2 Mugarsari Universitas Siliwangi berbasis Marker-Based WebAR, Maket 3D, dan Denah Digital 2D.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Mugarsari, Kel. Mugarsari, Kec. Tamansari",
    addressLocality: "Kota Tasikmalaya",
    addressRegion: "Jawa Barat",
    postalCode: "46196",
    addressCountry: "ID",
  },
};

const themeBootstrapScript = `
(function(){
  try {
    var t = localStorage.getItem('unsil-theme');
    if (t !== 'dark' && t !== 'light') {
      t = 'light';
    }
    var r = document.documentElement;
    r.classList.remove('dark', 'light');
    r.classList.add(t);
  } catch (e) {}
})();
`;

/** Komponen RootLayout: membungkus seluruh halaman dengan ThemeProvider dan struktur HTML utama. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-[100dvh] font-sans bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist selection:bg-[#065F46] selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#065F46] focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
        >
          Langsung ke konten utama
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
