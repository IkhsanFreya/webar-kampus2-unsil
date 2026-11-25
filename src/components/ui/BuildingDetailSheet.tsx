"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lock,
  Layers,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { CampusBuilding } from "@/data/campusBuildings";

interface BuildingDetailSheetProps {
  building: CampusBuilding | null;
  onClose: () => void;
  isARMode?: boolean;
}

export const BuildingDetailSheet: React.FC<BuildingDetailSheetProps> = ({
  building,
  onClose,
  isARMode = false,
}) => {
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [imgSrcMap, setImgSrcMap] = useState<Record<number, string>>({});
  const [detectedOrientation, setDetectedOrientation] = useState<
    Record<number, "landscape" | "portrait">
  >({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Reset gallery state when building changes
  useEffect(() => {
    setPhotoIndex(0);
    setIsLightboxOpen(false);
    setImgSrcMap({});
    setDetectedOrientation({});
    setCopiedLink(false);
  }, [building?.id]);

  const galleryLength = building?.gallery.length ?? 0;

  const stepPhoto = useCallback(
    (delta: number) => {
      if (galleryLength <= 1) return;
      setPhotoIndex((prev) => (prev + delta + galleryLength) % galleryLength);
    },
    [galleryLength]
  );

  // Antislop R-32: Escape closes lightbox first, then sheet; ArrowLeft/ArrowRight navigates slides
  useEffect(() => {
    if (!building) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        stepPhoto(-1);
      } else if (e.key === "ArrowRight") {
        stepPhoto(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, building, onClose, stepPhoto]);

  if (!building) return null;

  const currentPhoto = building.gallery[photoIndex] || {
    url: "/assets/buildings/placeholder.svg",
    caption: building.name,
    tag: "Dokumentasi",
    orientation: "landscape" as const,
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    stepPhoto(-1);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    stepPhoto(1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      stepPhoto(dx < 0 ? 1 : -1);
    }
  };

  const handleImageError = (index: number) => {
    setImgSrcMap((prev) => ({
      ...prev,
      [index]: "/assets/buildings/placeholder.svg",
    }));
  };

  const activeImageUrl = imgSrcMap[photoIndex] || currentPhoto.url;
  const activeOrientation =
    detectedOrientation[photoIndex] || currentPhoto.orientation || "landscape";
  const isPortrait = activeOrientation === "portrait" && !imgSrcMap[photoIndex];

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin);
    url.searchParams.set("gedung", building.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {building && (
          <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end lg:justify-start lg:items-end">
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/55 pointer-events-auto lg:hidden"
            />

            {/* Solid Sheet Container (respects R-10 glass cap) */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-building-name"
              className="pointer-events-auto relative w-full lg:w-[460px] lg:h-[calc(100dvh-2rem)] lg:m-4 flex flex-col max-h-[86dvh] lg:max-h-none bg-white dark:bg-unsil-pine border-t lg:border border-unsil-hairline dark:border-unsil-pineBorder rounded-t-3xl lg:rounded-2xl shadow-2xl overflow-hidden text-unsil-ink dark:text-unsil-mist"
            >
              {/* Mobile Drag Handle */}
              <div className="w-full pt-3 pb-1 flex justify-center lg:hidden">
                <div className="w-12 h-1.5 rounded-full bg-unsil-hairline dark:bg-unsil-pineBorder" />
              </div>

              {/* Sheet Header */}
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 flex items-start justify-between gap-3 border-b border-unsil-hairline dark:border-unsil-pineBorder shrink-0 bg-unsil-paper dark:bg-unsil-obsidian">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-semibold text-sm text-unsil-obsidian shadow-sm shrink-0 mt-0.5"
                    style={{ backgroundColor: building.color }}
                  >
                    {building.code}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-[#065F46] dark:bg-emerald-500/15 dark:text-emerald-300">
                        {building.categoryLabel}
                      </span>
                      {!building.hasMapPin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-unsil-linen text-unsil-inkMuted dark:bg-unsil-pineRaised dark:text-unsil-mistMuted border border-unsil-hairline dark:border-unsil-pineBorder">
                          <Info className="w-2.5 h-2.5" aria-hidden="true" />
                          Terdaftar · Belum di Denah
                        </span>
                      )}
                      {isARMode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-[#92400E] dark:bg-amber-500/15 dark:text-amber-300">
                          <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                          Terkunci di Layar
                        </span>
                      )}
                    </div>
                    <h2
                      id="sheet-building-name"
                      className="text-base lg:text-lg font-bold text-unsil-ink dark:text-unsil-mist leading-snug"
                    >
                      {building.name}
                    </h2>
                    <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted mt-0.5">
                      {building.faculty}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors shrink-0"
                  aria-label="Tutup detail gedung"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="p-4 sm:p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] overflow-y-auto space-y-5 sm:space-y-6 flex-1 custom-scrollbar">
                {/* Opsi A: Stable 4:3 Adaptive Photo Carousel (Landscape full cover + Portrait full uncropped with blur backdrop) */}
                <div className="space-y-2">
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-unsil-linen dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder group cursor-zoom-in"
                  >
                    {isPortrait && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeImageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-45 dark:opacity-35 pointer-events-none"
                      />
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImageUrl}
                      alt={currentPhoto.caption || building.name}
                      width={800}
                      height={600}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                          const detected =
                            img.naturalHeight > img.naturalWidth ? "portrait" : "landscape";
                          setDetectedOrientation((prev) =>
                            prev[photoIndex] === detected
                              ? prev
                              : { ...prev, [photoIndex]: detected }
                          );
                        }
                      }}
                      onError={() => handleImageError(photoIndex)}
                      className={
                        isPortrait
                          ? "relative z-10 w-full h-full object-contain"
                          : "relative z-10 w-full h-full object-cover"
                      }
                    />

                    {/* Minimal Slide Counter Badge */}
                    {building.gallery.length > 1 && (
                      <div className="absolute z-20 top-3 left-3">
                        <span className="px-2 py-1 rounded-lg font-mono text-[11px] font-semibold bg-[#171B1E]/85 text-white shadow-sm">
                          {photoIndex + 1}/{building.gallery.length}
                        </span>
                      </div>
                    )}

                    {/* Lightbox Zoom Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute z-20 top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-white/95 dark:bg-unsil-obsidian/90 border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors shadow-sm"
                      title="Perbesar Foto"
                      aria-label="Buka foto ukuran penuh"
                    >
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {/* Prev/Next Controls */}
                    {building.gallery.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute z-20 left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-lg bg-white/95 dark:bg-unsil-obsidian/90 border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors shadow-sm"
                          aria-label="Foto sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute z-20 right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-lg bg-white/95 dark:bg-unsil-obsidian/90 border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors shadow-sm"
                          aria-label="Foto selanjutnya"
                        >
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Pagination Dots */}
                  {building.gallery.length > 1 && (
                    <div className="flex items-center justify-center gap-0.5">
                      {building.gallery.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoIndex(idx)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label={`Lihat foto ${idx + 1}`}
                        >
                          <span
                            className={`h-2 rounded-full transition-all ${
                              idx === photoIndex
                                ? "w-7 bg-[#065F46] dark:bg-emerald-400"
                                : "w-2 bg-unsil-hairline dark:bg-unsil-pineBorder"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Building Profile Description */}
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-unsil-inkMuted dark:text-unsil-mistMuted flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
                    Profil dan Fungsi Gedung
                  </h3>
                  <p className="text-sm text-unsil-ink dark:text-unsil-mist leading-relaxed">
                    {building.fullDesc}
                  </p>
                </section>

                {/* Facilities List */}
                <section className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-unsil-inkMuted dark:text-unsil-mistMuted">
                    Fasilitas dan Sarana Utama
                  </h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {building.facilities.map((fac, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder"
                      >
                        <CheckCircle2
                          className="w-4 h-4 text-[#065F46] dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="text-xs text-unsil-ink dark:text-unsil-mist leading-normal">
                          {fac}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Shareable Location Deep-Link + Footer Tag */}
                <div className="pt-3 border-t border-unsil-hairline dark:border-unsil-pineBorder space-y-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-semibold text-unsil-ink dark:text-unsil-mist transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
                        <span className="text-[#065F46] dark:text-emerald-400">Tautan lokasi disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-unsil-inkMuted dark:text-unsil-mistMuted" aria-hidden="true" />
                        <span>Salin Tautan Lokasi</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-unsil-inkMuted dark:text-unsil-mistMuted">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
                      <span>Kampus 2 Mugarsari Unsil</span>
                    </div>
                    <span className="font-mono">
                      {building.hasMapPin ? `PIN-${building.code}` : `INFO-${building.code}`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Modal (Supports both Landscape & Portrait at natural aspect ratio) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau foto gedung ukuran besar"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col items-center bg-unsil-obsidian border border-unsil-pineBorder rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] rounded-xl bg-black/80 border border-white/25 flex items-center justify-center text-white hover:bg-black transition-colors"
                aria-label="Tutup foto perbesar"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative min-h-[200px] w-full flex items-center justify-center bg-[#121619]"
              >
                {building.gallery.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] rounded-xl bg-black/75 border border-white/25 flex items-center justify-center text-white hover:bg-black transition-colors"
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] rounded-xl bg-black/75 border border-white/25 flex items-center justify-center text-white hover:bg-black transition-colors"
                      aria-label="Foto selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImageUrl}
                  alt={currentPhoto.caption || building.name}
                  className="max-w-full max-h-[74dvh] w-auto h-auto object-contain"
                />
              </div>

              <div className="w-full p-4 bg-unsil-pine border-t border-unsil-pineBorder flex items-center justify-between gap-3 text-white">
                <h4 className="text-sm font-semibold truncate">{building.name}</h4>
                {building.gallery.length > 1 && (
                  <span className="px-2 py-1 rounded font-mono text-xs bg-white/10 text-white shrink-0">
                    {photoIndex + 1}/{building.gallery.length}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
