import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR)",
  description:
    "Aplikasi Marker-Based Web Augmented Reality untuk Peta Interaktif Kampus 2 Mugarsari Universitas Siliwangi Tasikmalaya.",
  keywords: [
    "WebAR",
    "Universitas Siliwangi",
    "Kampus 2 Mugarsari",
    "Peta Interaktif",
    "MindAR",
    "Augmented Reality",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#080c16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-[100dvh] bg-unsil-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

