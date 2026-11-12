"use client";

import React, { useState } from "react";
import {
  Camera,
  Compass,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  MapPin,
} from "lucide-react";
import { CAMPUS_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";

interface LandingViewProps {
  onStartAR: () => void;
  onStartMap: () => void;
  onSelectBuilding: (building: CampusBuilding) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartAR,
  onStartMap,
  onSelectBuilding,
}) => {
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);

  return (
    <div className="relative min-h-[100dvh] bg-unsil-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden pt-20 pb-12">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12">
        <div className="text-center space-y-6 pt-4">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Marker-Based WebAR • Kampus Mugarsari</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Peta Interaktif Kampus 2 <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Universitas Siliwangi
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Jelajahi denah masterplan Kampus 2 Mugarsari secara langsung melalui kamera ponsel Anda dengan Augmented Reality atau mode digital interaktif tanpa instalasi aplikasi tambahan.
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Primary Button: AR Scanner */}
            <button
              onClick={onStartAR}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-3 group ring-1 ring-white/20"
            >
              <Camera className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Mulai Scan Denah (WebAR)</span>
              <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center ml-1 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Secondary Button: 2D Digital Exploration */}
            <button
              onClick={onStartMap}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-unsil-slate-900/90 hover:bg-unsil-slate-850 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-amber-400/40 shadow-glass transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Mode Eksplorasi Denah Digital</span>
            </button>
          </div>

          {/* Quick Target Paper Downloader Hint */}
          <div className="pt-2">
            <button
              onClick={() => setShowTargetModal(true)}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Belum punya kertas denah? Unduh atau tampilkan di layar lain</span>
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Workflow Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 font-mono font-bold text-sm">
              01
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Arahkan Kamera</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buka mode WebAR dan arahkan kamera ponsel ke gambar Denah Kampus 2 Mugarsari Unsil.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 font-mono font-bold text-sm">
              02
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Target Terkunci</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem mengenali marker dalam hitungan detik dan menampilkan pin 3D beranimasi di atas denah.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 font-mono font-bold text-sm">
              03
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Eksplorasi Gedung</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ketuk pin untuk membuka profil fasilitas, galeri foto gedung, dan dengarkan narasi audio panduan.
            </p>
          </div>
        </div>

        {/* Featured Campus Points of Interest */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Titik Lokasi Utama Kampus 2</h3>
              <p className="text-xs text-slate-400">Pilih salah satu gedung untuk pratinjau informasi langsung</p>
            </div>
            <button
              onClick={onStartMap}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Buka di Peta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAMPUS_BUILDINGS.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                className="text-left p-4 rounded-2xl bg-unsil-slate-900/80 hover:bg-unsil-slate-850 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex items-start gap-3.5 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-slate-950 shrink-0 shadow-sm"
                  style={{ backgroundColor: b.color }}
                >
                  {b.code}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {b.categoryLabel}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                    {b.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-light">
                    {b.shortDesc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Target Marker Modal */}
      {showTargetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-unsil-slate-950 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col"
          >
            <h3 className="text-sm font-bold text-white mb-1">Target Denah Kampus 2 Unsil</h3>
            <p className="text-xs text-slate-400 mb-4">
              Cetak atau tampilkan gambar ini di layar monitor/tablet untuk dipindai.
            </p>
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 mb-4 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/targets/denah-kampus2.jpg"
                alt="Target Denah Kampus 2 Unsil"
                className="max-h-[50vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <a
                href="/targets/denah-kampus2.jpg"
                download="Denah-Kampus-2-Unsil.jpg"
                className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs text-center transition-colors"
              >
                Unduh Gambar
              </a>
              <button
                onClick={() => setShowTargetModal(false)}
                className="py-2.5 px-5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 max-w-4xl mx-auto px-4">
        <p>© 2026 Universitas Siliwangi Tasikmalaya • Kampus 2 Mugarsari WebAR Project</p>
      </footer>
    </div>
  );
};

