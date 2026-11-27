/**
 * ============================================================================
 * FILE: src/components/ui/NavbarHUD.tsx
 * PERAN: Bilah navigasi mengambang (Top Navigation HUD) lintas semua mode.
 * PENJELASAN PRESENTASI:
 * 1. Menyediakan perpindahan instan antar 4 mode (Beranda, Scan AR, Maket 3D,
 *    Denah 2D) yang dirancang muat rapi tanpa terpotong mulai layar 320px.
 * 2. Menyediakan tombol utilitas: Unduh/Lihat Target Denah AR, Toggle Light/Dark
 *    Mode, dan Modal Informasi Sistem.
 * 3. Di layar mobile memakai latar frosted glass agar teks halaman saat di-scroll
 *    tidak bertabrakan dengan tombol navigasi, serta Focus Trap pada seluruh modal.
 * ============================================================================
 */
"use client";

import React, { useState, useRef } from "react";
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
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface NavbarHUDProps {
  currentMode: "ar" | "3d" | "map" | "landing";
  onSwitchMode: (mode: "ar" | "3d" | "map" | "landing") => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({ currentMode, onSwitchMode }) => {
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const { theme, mounted, toggleTheme } = useTheme();

  const targetModalRef = useRef<HTMLDivElement | null>(null);
  const infoModalRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(targetModalRef, showTargetModal, () => setShowTargetModal(false));
  useFocusTrap(infoModalRef, showInfoModal, () => setShowInfoModal(false));

  const isAR = currentMode === "ar";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors ${
          isAR
            ? "px-2 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-3 pointer-events-none"
            : "bg-unsil-paper/92 dark:bg-unsil-obsidian/92 sm:bg-transparent sm:dark:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-b border-unsil-hairline/75 dark:border-unsil-pineBorder/75 sm:border-b-0 px-2.5 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:pt-3 sm:pb-0 sm:pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-auto min-w-0">
          {/* Brand Button (tablet/desktop) */}
          <button
            type="button"
            onClick={() => onSwitchMode("landing")}
            className="hidden md:flex min-h-[44px] items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm backdrop-blur-md transition-colors group shrink-0"
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

          {/* Mode Switcher — sized to never clip even on 320px–360px phones */}
          <nav
            className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm backdrop-blur-md min-w-0 shrink"
            aria-label="Mode navigasi peta"
          >
            <button
              type="button"
              onClick={() => onSwitchMode("landing")}
              className={`min-h-[38px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                currentMode === "landing"
                  ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "landing"}
              aria-label="Beranda"
              title="Beranda"
            >
              <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode("ar")}
              className={`min-h-[38px] min-w-[38px] sm:min-w-[44px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                currentMode === "ar"
                  ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "ar"}
            >
              <Camera className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:block" aria-hidden="true" />
              <span className="hidden sm:inline">Scan AR</span>
              <span className="sm:hidden">AR</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode("3d")}
              className={`min-h-[38px] min-w-[38px] sm:min-w-[44px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                currentMode === "3d"
                  ? "bg-[#1D4ED8] dark:bg-blue-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "3d"}
            >
              <Box className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:block" aria-hidden="true" />
              <span className="hidden sm:inline">Maket 3D</span>
              <span className="sm:hidden">3D</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode("map")}
              className={`min-h-[38px] min-w-[38px] sm:min-w-[44px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                currentMode === "map"
                  ? "bg-[#B45309] dark:bg-amber-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
              }`}
              aria-pressed={currentMode === "map"}
            >
              <Map className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:block" aria-hidden="true" />
              <span className="hidden sm:inline">Denah 2D</span>
              <span className="sm:hidden">2D</span>
            </button>
          </nav>

          {/* Action Tools — compact on mobile so Info button is NEVER clipped */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="w-9 h-9 sm:w-auto sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center gap-1.5 sm:px-3 rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md transition-colors text-xs font-semibold shrink-0"
              title="Lihat atau unduh target denah"
              aria-label="Lihat atau unduh kertas target denah kampus 2"
            >
              <Download className="w-4 h-4 text-[#B45309] dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline whitespace-nowrap">Target Denah</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md flex items-center justify-center transition-colors shrink-0"
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
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white/95 dark:bg-unsil-pine/95 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist shadow-sm backdrop-blur-md flex items-center justify-center transition-colors shrink-0"
              title="Informasi Aplikasi"
              aria-label="Informasi tentang aplikasi"
            >
              <Info className="w-4 h-4 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Target Map Modal */}
      {showTargetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          onClick={() => setShowTargetModal(false)}
        >
          <div
            ref={targetModalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-target-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90dvh] bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden text-unsil-ink dark:text-unsil-mist outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-unsil-hairline dark:border-unsil-pineBorder gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400 shrink-0">
                  <Download className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 id="modal-target-title" className="text-sm font-bold truncate">
                    Target Marker Denah Kampus 2
                  </h3>
                  <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted truncate">
                    Gunakan gambar ini untuk dipindai kamera WebAR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors shrink-0"
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

      {/* Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            ref={infoModalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-info-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 text-unsil-ink dark:text-unsil-mist outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-unsil-hairline dark:border-unsil-pineBorder gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo-unsil.png"
                  alt="Logo Universitas Siliwangi"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h3 id="modal-info-title" className="text-sm font-bold truncate">
                    Peta Interaktif WebAR Kampus 2
                  </h3>
                  <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted truncate">
                    Universitas Siliwangi Tasikmalaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors shrink-0"
                aria-label="Tutup jendela informasi"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-unsil-inkMuted dark:text-unsil-mistMuted leading-relaxed">
              <p>
                Aplikasi ini dikembangkan untuk memvisualisasikan zonasi bangunan, fasilitas
                laboratorium, rute jalan kaki, serta aksesibilitas di kawasan{" "}
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
                  <li>Maket 3D Interaktif: Eksplorasi 16 gedung, filter fakultas, &amp; rute 3D</li>
                  <li>Denah Digital 2D: Pan/zoom, rute jalan kaki antar gedung, &amp; lapisan denah</li>
                  <li>Antarmuka: Next.js App Router, Tailwind CSS, &amp; PWA (Light &amp; Dark Mode)</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
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
