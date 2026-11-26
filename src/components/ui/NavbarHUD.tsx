"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Camera,
  Box,
  Map,
  Download,
  Info,
  X,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { CAMPUS_MAP_CONFIG } from "@/data/campusBuildings";

interface NavbarHUDProps {
  currentMode: "ar" | "3d" | "map" | "landing";
  onSwitchMode: (mode: "ar" | "3d" | "map" | "landing") => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({ currentMode, onSwitchMode }) => {
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const { theme, mounted, toggleTheme } = useTheme();

  // Antislop R-32: Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTargetModal(false);
        setShowInfoModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 px-2.5 sm:px-6 pt-[max(0.625rem,env(safe-area-inset-top))] sm:pt-3 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Brand Button (hidden on narrow mobile to prevent overflow alongside Beranda tab) */}
          <button
            onClick={() => onSwitchMode("landing")}
            className="hidden sm:flex min-h-[44px] items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm backdrop-blur-md transition-colors group"
            title="Kembali ke Beranda"
            aria-label="Kembali ke beranda aplikasi"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-unsil.png"
              alt="Logo Universitas Siliwangi"
              width={32}
              height={32}
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="text-left">
              <span className="block text-xs font-bold text-unsil-ink dark:text-unsil-mist group-hover:text-[#065F46] dark:group-hover:text-emerald-300 transition-colors leading-tight">
                Kampus 2 UNSIL
              </span>
              <span className="block text-[10px] text-unsil-inkMuted dark:text-unsil-mistMuted font-medium leading-tight">
                Mugarsari, Tasikmalaya
              </span>
            </div>
          </button>

          {/* Mode Switcher */}
          <nav
            className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm backdrop-blur-md"
            aria-label="Mode navigasi peta"
          >
            <button
              onClick={() => onSwitchMode("landing")}
              className={`min-h-[38px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentMode === "landing"
                  ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "landing"}
              aria-label="Beranda"
              title="Beranda"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Beranda</span>
            </button>

            <button
              onClick={() => onSwitchMode("ar")}
              className={`min-h-[38px] min-w-[42px] sm:min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentMode === "ar"
                  ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "ar"}
            >
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Scan AR</span>
              <span className="sm:hidden">AR</span>
            </button>

            <button
              onClick={() => onSwitchMode("3d")}
              className={`min-h-[38px] min-w-[42px] sm:min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentMode === "3d"
                  ? "bg-[#1D4ED8] dark:bg-blue-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "3d"}
            >
              <Box className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Maket 3D</span>
              <span className="sm:hidden">3D</span>
            </button>

            <button
              onClick={() => onSwitchMode("map")}
              className={`min-h-[38px] min-w-[42px] sm:min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentMode === "map"
                  ? "bg-[#B45309] dark:bg-amber-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "map"}
            >
              <Map className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Denah 2D</span>
              <span className="sm:hidden">2D</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setShowTargetModal(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md transition-colors text-xs font-semibold"
              title="Lihat atau unduh target denah"
              aria-label="Lihat atau unduh kertas target denah kampus 2"
            >
              <Download className="w-4 h-4 text-[#B45309] dark:text-amber-400" aria-hidden="true" />
              <span className="hidden md:inline">Target Denah</span>
            </button>

            <button
              onClick={toggleTheme}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md flex items-center justify-center transition-colors"
              title={
                mounted
                  ? theme === "dark"
                    ? "Ganti ke Mode Terang (Light)"
                    : "Ganti ke Mode Gelap (Dark)"
                  : "Ganti tema tampilan"
              }
              aria-label={
                mounted
                  ? theme === "dark"
                    ? "Ganti ke mode terang"
                    : "Ganti ke mode gelap"
                  : "Ganti mode tampilan"
              }
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-unsil-ink" aria-hidden="true" />
              )}
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md flex items-center justify-center transition-colors"
              title="Informasi Aplikasi"
              aria-label="Informasi tentang aplikasi"
            >
              <Info className="w-4 h-4 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Target Map Modal (Solid surface per R-10) */}
      {showTargetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-target-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90dvh] bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden text-unsil-ink dark:text-unsil-mist"
          >
            <div className="flex items-center justify-between pb-3 border-b border-unsil-hairline dark:border-unsil-pineBorder">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400">
                  <Download className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="modal-target-title" className="text-sm font-bold">
                    Target Marker Denah Kampus 2
                  </h3>
                  <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted">
                    Gunakan gambar ini untuk dipindai oleh kamera WebAR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTargetModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                aria-label="Tutup jendela target denah"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto max-h-[50dvh] rounded-xl bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CAMPUS_MAP_CONFIG.arTargetSrc}
                alt="Target Denah Kampus 2 Universitas Siliwangi untuk marker WebAR"
                width={CAMPUS_MAP_CONFIG.width}
                height={CAMPUS_MAP_CONFIG.height}
                className="max-h-[46dvh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-unsil-hairline dark:border-unsil-pineBorder">
              <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted leading-relaxed">
                <strong className="text-[#065F46] dark:text-emerald-400">Petunjuk Pengujian:</strong>{" "}
                Buka gambar ini di layar laptop/tablet atau cetak pada kertas A4/A3, lalu arahkan kamera ponsel Anda pada mode Scan AR.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <a
                  href={CAMPUS_MAP_CONFIG.printTargetSrc}
                  download="Denah-Kampus-2-Unsil-AR.png"
                  className="min-h-[44px] flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Unduh Gambar Target
                </a>
                <a
                  href={CAMPUS_MAP_CONFIG.printTargetSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder text-unsil-ink dark:text-unsil-mist border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  Buka Tab Baru
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal (Solid surface per R-10) */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-info-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 text-unsil-ink dark:text-unsil-mist"
          >
            <div className="flex items-center justify-between pb-3 border-b border-unsil-hairline dark:border-unsil-pineBorder">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo-unsil.png"
                  alt="Logo Universitas Siliwangi"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div>
                  <h3 id="modal-info-title" className="text-sm font-bold">
                    Peta Interaktif WebAR Kampus 2
                  </h3>
                  <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted">
                    Universitas Siliwangi Tasikmalaya
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                aria-label="Tutup jendela informasi"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-unsil-inkMuted dark:text-unsil-mistMuted leading-relaxed">
              <p>
                Aplikasi ini dikembangkan untuk memvisualisasikan zonasi bangunan, fasilitas laboratorium, serta aksesibilitas di kawasan{" "}
                <strong className="text-unsil-ink dark:text-unsil-mist">
                  Kampus 2 Mugarsari Universitas Siliwangi
                </strong>{" "}
                menggunakan teknologi Marker-Based Web Augmented Reality.
              </p>
              <div className="p-3.5 rounded-xl bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder space-y-2">
                <h4 className="font-semibold text-[#065F46] dark:text-emerald-400 text-xs">
                  Komponen Sistem:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pelacakan Marker: MindAR Image Recognition</li>
                  <li>Proyeksi WebAR: A-Frame Engine di atas kertas denah</li>
                  <li>Maket 3D Interaktif: Eksplorasi model 3D 16 gedung dengan filter fakultas dan fokus kamera</li>
                  <li>Denah Digital 2D: Navigasi pan, zoom, filter kategori, dan pilihan lapisan denah</li>
                  <li>Antarmuka: Next.js App Router dan Tailwind CSS (Light &amp; Dark Mode)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="min-h-[44px] w-full py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
