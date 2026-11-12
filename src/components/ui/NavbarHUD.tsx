"use client";

import React, { useState } from "react";
import { Camera, Map, Download, Info, X, ExternalLink, Sparkles } from "lucide-react";

interface NavbarHUDProps {
  currentMode: "ar" | "map" | "landing";
  onSwitchMode: (mode: "ar" | "map" | "landing") => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({ currentMode, onSwitchMode }) => {
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 pt-3 pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 pointer-events-auto">
          {/* Brand Pill */}
          <button
            onClick={() => onSwitchMode("landing")}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-unsil-slate-950/85 hover:bg-unsil-slate-900 border border-white/10 shadow-glass backdrop-blur-xl transition-all duration-300 group ring-1 ring-emerald-500/20"
            title="Kembali ke Beranda"
            aria-label="Kembali ke beranda aplikasi"
          >
            {/* Unsil Emblem Pill */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-unsil-slate-900 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[10px] font-black text-amber-300 tracking-tighter">US</span>
            </div>
            <div className="text-left hidden xs:block sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Kampus 2 UNSIL
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Mugarsari • WebAR Map</p>
            </div>
          </button>

          {/* Mode Switcher Island */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-unsil-slate-950/85 border border-white/10 shadow-glass backdrop-blur-xl ring-1 ring-white/5" aria-label="Mode navigasi">
            <button
              onClick={() => onSwitchMode("ar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                currentMode === "ar"
                  ? "bg-emerald-600 text-white shadow-emerald-600/30 shadow-md ring-1 ring-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan AR</span>
              <span className="sm:hidden">AR</span>
            </button>

            <button
              onClick={() => onSwitchMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                currentMode === "map"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-amber-500/30 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Denah 2D</span>
              <span className="sm:hidden">2D</span>
            </button>
          </nav>

          {/* Secondary Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* View / Download Target Map Image */}
            <button
              onClick={() => setShowTargetModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-unsil-slate-950/85 hover:bg-unsil-slate-900 border border-white/10 text-slate-300 hover:text-white shadow-glass backdrop-blur-xl transition-all duration-300 text-xs font-medium"
              title="Lihat / Unduh Kertas Target Denah"
              aria-label="Lihat atau unduh kertas target denah kampus 2"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Target Denah</span>
            </button>

            {/* About / Info */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="w-9 h-9 rounded-full bg-unsil-slate-950/85 hover:bg-unsil-slate-900 border border-white/10 text-slate-300 hover:text-white shadow-glass backdrop-blur-xl flex items-center justify-center transition-all duration-300"
              title="Informasi Aplikasi"
              aria-label="Informasi tentang aplikasi"
            >
              <Info className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Target Map Modal */}
      {showTargetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] bg-unsil-slate-950 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Target Marker Denah Kampus 2</h3>
                  <p className="text-[11px] text-slate-400">Gunakan gambar ini untuk dipindai oleh kamera WebAR</p>
                </div>
              </div>
              <button
                onClick={() => setShowTargetModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white"
                aria-label="Tutup jendela target denah"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto max-h-[55vh] rounded-2xl bg-slate-900 border border-white/10 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/targets/denah-kampus2.jpg"
                alt="Target Denah Kampus 2 Unsil"
                className="max-h-[50vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400">Tips Pengujian:</span> Buka gambar ini di layar laptop/tablet atau cetak pada kertas A4/A3, lalu arahkan kamera ponsel Anda dalam mode Scan WebAR.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="/targets/denah-kampus2.jpg"
                  download="Denah-Kampus-2-Unsil.jpg"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Gambar Target
                </a>
                <a
                  href="/targets/denah-kampus2.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Tab Baru
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info / About Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-unsil-slate-950 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tentang Peta Interaktif WebAR</h3>
                  <p className="text-[11px] text-slate-400">Universitas Siliwangi Tasikmalaya</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white"
                aria-label="Tutup jendela informasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Aplikasi ini dikembangkan untuk memvisualisasikan zonasi bangunan, fasilitas laboratorium terpadu, dan aksesibilitas di kawasan <strong className="text-white">Kampus 2 Mugarsari Universitas Siliwangi</strong> menggunakan teknologi <em>Marker-Based Web Augmented Reality</em>.
              </p>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="font-semibold text-emerald-400 text-xs">Teknologi & Standar:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Marker Tracking: MindAR Image Recognition</li>
                  <li>3D & Projection: A-Frame Engine (Zero-GLB lightweight)</li>
                  <li>Frontend: Next.js App Router & Tailwind CSS</li>
                  <li>Audio: Dual-Engine (HTML5 Audio + Web Audio API Synth)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

