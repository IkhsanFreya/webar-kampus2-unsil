"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Camera,
  Compass,
  Download,
  X,
  Box,
  Map as MapIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  CAMPUS_BUILDINGS,
  MAPPED_BUILDINGS,
  CAMPUS_MAP_CONFIG,
  CampusBuilding,
} from "@/data/campusBuildings";

const Campus3DPreview = dynamic(
  () => import("./Campus3DPreview").then((mod) => mod.Campus3DPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[360px] lg:h-[400px] flex flex-col items-center justify-center gap-2 text-unsil-inkMuted dark:text-unsil-mistMuted">
        <div className="w-7 h-7 rounded-full border-2 border-[#065F46] dark:border-emerald-400 border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Memuat maket 3D interaktif...</span>
      </div>
    ),
  }
);

interface LandingViewProps {
  onStartAR: () => void;
  onStart3D: () => void;
  onStartMap: () => void;
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuildingId?: string | null;
}

type DirectoryFilter = "all" | "academic" | "facility" | "gate" | "worship";

const DIRECTORY_FILTERS: Array<{ id: DirectoryFilter; label: string; count: number }> = [
  { id: "all", label: "Semua", count: CAMPUS_BUILDINGS.length },
  {
    id: "academic",
    label: "Akademik",
    count: CAMPUS_BUILDINGS.filter((b) => b.category === "academic").length,
  },
  {
    id: "facility",
    label: "Fasilitas",
    count: CAMPUS_BUILDINGS.filter((b) => b.category === "facility").length,
  },
  {
    id: "gate",
    label: "Akses",
    count: CAMPUS_BUILDINGS.filter((b) => b.category === "gate").length,
  },
  {
    id: "worship",
    label: "Ibadah",
    count: CAMPUS_BUILDINGS.filter((b) => b.category === "worship").length,
  },
];

const PAGE_SIZE = 4;

export const LandingView: React.FC<LandingViewProps> = ({
  onStartAR,
  onStart3D,
  onStartMap,
  onSelectBuilding,
  selectedBuildingId,
}) => {
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [heroPreviewMode, setHeroPreviewMode] = useState<"3d" | "2d">("2d");
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Antislop R-32: Escape closes target modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTargetModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset pagination whenever filter or search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [directoryFilter, searchQuery]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredBuildings = CAMPUS_BUILDINGS.filter((b) => {
    const matchesCategory =
      directoryFilter === "all" ? true : b.category === directoryFilter;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      b.name.toLowerCase().includes(normalizedQuery) ||
      b.faculty.toLowerCase().includes(normalizedQuery) ||
      b.categoryLabel.toLowerCase().includes(normalizedQuery) ||
      b.code.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalPages = Math.ceil(filteredBuildings.length / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;
  const paginatedBuildings = filteredBuildings.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );
  const rangeStart = filteredBuildings.length > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filteredBuildings.length);

  const getBuildingPhotoUrl = (building: CampusBuilding): string => {
    if (failedImages[building.id]) return "/assets/buildings/placeholder.svg";
    return building.gallery[0]?.url || "/assets/buildings/placeholder.svg";
  };

  return (
    <div className="relative min-h-[100dvh] bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist flex flex-col justify-between overflow-x-hidden pt-[calc(4.75rem+env(safe-area-inset-top))] sm:pt-24 pb-8 sm:pb-10 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-9 sm:space-y-12">
        {/* Equal 50/50 Split Hero (Intro left / 3D & 2D Campus Preview right) */}
        <section
          aria-labelledby="hero-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center"
        >
          {/* Left Column: Title, CTAs, Target Trigger */}
          <div className="space-y-5 lg:pr-2">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo-unsil.png"
                  alt="Logo Universitas Siliwangi"
                  width={28}
                  height={28}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                />
                <p className="text-xs font-semibold tracking-wide text-[#065F46] dark:text-emerald-400">
                  Universitas Siliwangi · Kampus 2 Mugarsari
                </p>
              </div>
              <h1
                id="hero-heading"
                className="text-[clamp(1.85rem,3.1vw,2.75rem)] font-extrabold tracking-tight leading-[1.12] text-unsil-ink dark:text-unsil-mist"
              >
                Peta Interaktif
                <br className="hidden sm:block" />{" "}
                <span className="text-[#065F46] dark:text-emerald-400">
                  Kampus 2 Mugarsari
                </span>
              </h1>
              <p className="text-sm sm:text-[15px] text-unsil-inkMuted dark:text-unsil-mistMuted leading-relaxed max-w-[46ch]">
                Panduan lokasi gedung dan fasilitas kampus dalam satu aplikasi web. Putar maket 3D di beranda, pindai lembar denah dengan WebAR, atau jelajahi lewat peta 2D.
              </p>
            </div>

            {/* Focal CTAs: 3 Main Modes (WebAR, Maket 3D, Denah 2D) */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={onStartAR}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap"
                  aria-label="Mulai memindai denah dengan kamera WebAR"
                >
                  <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Scan Denah WebAR</span>
                </button>

                <button
                  onClick={onStart3D}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-blue-500 dark:hover:bg-blue-400 text-white dark:text-unsil-obsidian font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap"
                  aria-label="Jelajahi maket tiga dimensi kampus layar penuh"
                >
                  <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Jelajahi Maket 3D</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onStartMap}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist font-semibold text-xs border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  aria-label="Buka denah digital dua dimensi"
                >
                  <Compass className="w-4 h-4 text-[#B45309] dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Buka Denah 2D</span>
                </button>

                <button
                  onClick={() => setShowTargetModal(true)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-1 py-1 text-xs font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-[#065F46] dark:hover:text-emerald-400 transition-colors"
                >
                  <Download className="w-4 h-4 text-[#B45309] dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Unduh target denah AR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Frameless Interactive 3D Maquette & 2D Map Preview */}
          <div className="w-full space-y-2">
            {/* Minimalist Mode Switcher */}
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-medium text-unsil-inkMuted dark:text-unsil-mistMuted">
                Pratinjau Kawasan · {MAPPED_BUILDINGS.length} Titik
              </span>
              <div
                className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-unsil-linen/80 dark:bg-unsil-pine/80 border border-unsil-hairline/80 dark:border-unsil-pineBorder"
                role="group"
                aria-label="Pilih mode pratinjau beranda"
              >
                <button
                  type="button"
                  onClick={() => setHeroPreviewMode("3d")}
                  className={`h-8 sm:h-7 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    heroPreviewMode === "3d"
                      ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian"
                      : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
                  }`}
                  aria-pressed={heroPreviewMode === "3d"}
                >
                  <Box className="w-3 h-3" aria-hidden="true" />
                  <span>Maket 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroPreviewMode("2d")}
                  className={`h-8 sm:h-7 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    heroPreviewMode === "2d"
                      ? "bg-[#B45309] dark:bg-amber-500 text-white dark:text-unsil-obsidian"
                      : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
                  }`}
                  aria-pressed={heroPreviewMode === "2d"}
                >
                  <MapIcon className="w-3 h-3" aria-hidden="true" />
                  <span>Denah 2D</span>
                </button>
              </div>
            </div>

            {heroPreviewMode === "3d" ? (
              <Campus3DPreview
                onSelectBuilding={onSelectBuilding}
                selectedBuildingId={selectedBuildingId}
              />
            ) : (
              <div className="w-full flex items-center justify-center py-1">
                <div className="relative w-full max-w-[350px] sm:w-auto sm:h-[380px] lg:h-[420px] aspect-[1024/1448] rounded-xl overflow-hidden shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CAMPUS_MAP_CONFIG.arTargetSrc}
                    alt="Denah Masterplan Kawasan Kampus 2 Mugarsari Universitas Siliwangi"
                    width={CAMPUS_MAP_CONFIG.width}
                    height={CAMPUS_MAP_CONFIG.height}
                    fetchPriority="high"
                    className="w-full h-full object-contain"
                  />

                  {/* Interactive Clickable Pin Badges Directly on Preview Map */}
                  {MAPPED_BUILDINGS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSelectBuilding(b)}
                      style={{
                        left: `${b.mapCoord.xPercent}%`,
                        top: `${b.mapCoord.yPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center group"
                      aria-label={`Lihat detail ${b.name}`}
                      title={b.name}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-semibold text-white border-[1.5px] border-white shadow-sm transition-transform group-hover:scale-125"
                        style={{ backgroundColor: b.color }}
                      >
                        {b.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[11px] text-unsil-inkMuted dark:text-unsil-mistMuted font-medium">
                {heroPreviewMode === "3d"
                  ? "Geser untuk putar 3D · Ketuk gedung atau pin"
                  : "Denah Kampus 2 · Ketuk pin untuk detail"}
              </p>
              <button
                type="button"
                onClick={heroPreviewMode === "3d" ? onStart3D : onStartMap}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#065F46] dark:text-emerald-400 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>{heroPreviewMode === "3d" ? "Buka Maket 3D Penuh" : "Buka Denah 2D Penuh"}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Minimalist Architectural Directory of All 16 Campus Buildings */}
        <section
          aria-labelledby="heading-locations"
          className="space-y-4 pt-4 border-t border-unsil-hairline dark:border-unsil-pineBorder"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 pt-2">
            <div>
              <h2
                id="heading-locations"
                className="text-lg sm:text-xl font-bold text-unsil-ink dark:text-unsil-mist"
              >
                Direktori 16 Gedung Kawasan
              </h2>
              <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted mt-0.5">
                Seluruh 16 gedung aktif pada denah 2D, maket 3D, dan pemindaian WebAR
              </p>
            </div>

            {/* Compact Search Input */}
            <div className="relative w-full lg:w-72">
              <label htmlFor="directory-search" className="sr-only">
                Cari gedung kampus
              </label>
              <Search
                className="w-4 h-4 text-unsil-inkMuted dark:text-unsil-mistMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="directory-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari gedung, prodi, atau kode..."
                className="w-full min-h-[44px] pl-9 pr-10 py-2 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-medium text-unsil-ink dark:text-unsil-mist placeholder:text-unsil-inkMuted dark:placeholder:text-unsil-mistMuted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder w-full sm:w-fit max-w-full overflow-x-auto no-scrollbar"
            role="group"
            aria-label="Filter direktori gedung"
          >
            {DIRECTORY_FILTERS.map((cat) => {
              const isActive = directoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setDirectoryFilter(cat.id)}
                  className={`min-h-[40px] shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian"
                      : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* 4-Card Priority Grid with Pagination or Honest Empty State */}
          {filteredBuildings.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder text-center space-y-3">
              <p className="text-xs sm:text-sm text-unsil-inkMuted dark:text-unsil-mistMuted">
                Tidak ada gedung yang cocok dengan pencarian atau filter saat ini.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDirectoryFilter("all");
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian text-xs font-semibold transition-colors"
              >
                Reset Pencarian &amp; Filter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {paginatedBuildings.map((b) => {
                  const photoUrl = getBuildingPhotoUrl(b);
                  return (
                    <button
                      key={b.id}
                      onClick={() => onSelectBuilding(b)}
                      className="min-w-0 text-left rounded-2xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen/45 dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder hover:border-[#065F46] dark:hover:border-emerald-400 transition-colors overflow-hidden flex flex-col justify-between group shadow-sm"
                      aria-label={`Lihat detail gedung ${b.name}`}
                    >
                      <div>
                        <div className="relative w-full aspect-[16/10] bg-unsil-linen dark:bg-unsil-obsidian overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={b.name}
                            width={640}
                            height={400}
                            loading="lazy"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [b.id]: true }))
                            }
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {b.hasMapPin ? (
                            <span
                              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold text-white border-2 border-white shadow-sm"
                              style={{ backgroundColor: b.color }}
                            >
                              PIN {b.code}
                            </span>
                          ) : (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold bg-white/95 dark:bg-unsil-obsidian/95 text-unsil-ink dark:text-unsil-mist border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm">
                              INFO {b.code}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 space-y-1">
                          <span className="block text-[11px] font-semibold text-[#065F46] dark:text-emerald-400 truncate">
                            {b.categoryLabel}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-unsil-ink dark:text-unsil-mist group-hover:text-[#065F46] dark:group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2 min-h-[2.4em]">
                            {b.name}
                          </h3>
                          <p className="text-[11px] text-unsil-inkMuted dark:text-unsil-mistMuted truncate">
                            {b.faculty}
                          </p>
                        </div>
                      </div>

                      <div className="px-3.5 py-2.5 border-t border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#065F46] dark:text-emerald-400">
                          Lihat detail
                        </span>
                        <span className="text-[10px] font-medium text-unsil-inkMuted dark:text-unsil-mistMuted">
                          {b.hasMapPin ? "Denah AR" : "Info"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted font-medium">
                    Menampilkan {rangeStart}-{rangeEnd} dari {filteredBuildings.length} gedung
                  </p>

                  <nav
                    className="flex items-center justify-center gap-1.5"
                    aria-label="Navigasi halaman direktori gedung"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={safePage === 0}
                      className="min-w-[44px] min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-semibold text-unsil-ink dark:text-unsil-mist flex items-center justify-center gap-1 transition-colors disabled:opacity-45"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => {
                        const isActive = idx === safePage;
                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`min-w-[40px] sm:min-w-[44px] min-h-[44px] rounded-xl font-mono text-xs font-semibold border transition-colors ${
                              isActive
                                ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian border-transparent"
                                : "bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist border-unsil-hairline dark:border-unsil-pineBorder"
                            }`}
                            aria-label={`Halaman ${idx + 1}`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={safePage >= totalPages - 1}
                      className="min-w-[44px] min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-semibold text-unsil-ink dark:text-unsil-mist flex items-center justify-center gap-1 transition-colors disabled:opacity-45"
                      aria-label="Halaman berikutnya"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Target Marker Modal (Solid surface) */}
      {showTargetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-target-marker-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          onClick={() => setShowTargetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col text-unsil-ink dark:text-unsil-mist"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 id="modal-target-marker-title" className="text-sm font-bold">
                Target Denah Kampus 2 Unsil
              </h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                aria-label="Tutup jendela target denah"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted mb-3">
              Cetak atau tampilkan gambar ini di layar monitor atau tablet untuk dipindai menggunakan mode WebAR.
            </p>
            <div className="rounded-xl overflow-hidden bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder mb-4 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CAMPUS_MAP_CONFIG.arTargetSrc}
                alt="Target Gambar Denah Kampus 2 Universitas Siliwangi"
                width={CAMPUS_MAP_CONFIG.width}
                height={CAMPUS_MAP_CONFIG.height}
                className="max-h-[48dvh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <a
                href={CAMPUS_MAP_CONFIG.printTargetSrc}
                download="Denah-Kampus-2-Unsil-AR.png"
                className="min-h-[44px] flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors"
              >
                Unduh Gambar
              </a>
              <button
                onClick={() => setShowTargetModal(false)}
                className="min-h-[44px] py-2.5 px-5 rounded-xl bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder text-unsil-ink dark:text-unsil-mist text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single-line Academic Footer */}
      <footer className="mt-12 pt-6 border-t border-unsil-hairline dark:border-unsil-pineBorder text-center text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-6xl mx-auto w-full px-4">
        <p>Proyek Rekayasa Sistem Multimedia 2026 · Informatika, Fakultas Teknik, Universitas Siliwangi</p>
      </footer>
    </div>
  );
};
