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

export const metadata: Metadata = {
  title: "Peta Interaktif Kampus 2 Universitas Siliwangi (WebAR)",
  description:
    "Panduan denah interaktif kawasan Kampus 2 Mugarsari Universitas Siliwangi berbasis Marker WebAR dan peta digital 2D.",
  keywords: [
    "WebAR",
    "Universitas Siliwangi",
    "Kampus 2 Mugarsari",
    "Peta Interaktif",
    "MindAR",
    "Augmented Reality",
  ],
  icons: {
    icon: "/assets/logo-unsil.png",
    apple: "/assets/logo-unsil.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F4EE",
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
      </head>
      <body className="min-h-[100dvh] font-sans bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist selection:bg-[#065F46] selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
