"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { CampusBuilding } from "@/data/campusBuildings";
import { AudioNarrationPlayer } from "./AudioNarrationPlayer";

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

  // Reset photo index when building changes
  useEffect(() => {
    setPhotoIndex(0);
    setIsLightboxOpen(false);
    setImgSrcMap({});
  }, [building?.id]);

  if (!building) return null;

  const currentPhoto = building.gallery[photoIndex] || {
    url: "/assets/buildings/placeholder.svg",
    caption: building.name,
    tag: "Dokumentasi",
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : building.gallery.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev < building.gallery.length - 1 ? prev + 1 : 0));
  };

  const handleImageError = (index: number) => {
    setImgSrcMap((prev) => ({
      ...prev,
      [index]: "/assets/buildings/placeholder.svg",
    }));
  };

  const activeImageUrl = imgSrcMap[photoIndex] || currentPhoto.url;

  return (
    <>
      <AnimatePresence>
        {building && (
          <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end lg:justify-start lg:items-end">
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto lg:hidden"
            />

            {/* Main Sheet Container: Bottom Sheet on Mobile, Side Panel on Desktop */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto relative w-full lg:w-[480px] lg:h-[calc(100dvh-2rem)] lg:m-4 flex flex-col max-h-[85dvh] lg:max-h-none bg-unsil-slate-950/95 lg:bg-unsil-slate-900/95 border-t lg:border border-white/10 rounded-t-[2.2rem] lg:rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-emerald-500/20"
            >
              {/* Drag handle for mobile */}
              <div className="w-full pt-3 pb-1 flex justify-center lg:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
              </div>

              {/* Sheet Header */}
              <div className="px-6 py-4 flex items-start justify-between border-b border-white/10 shrink-0 bg-slate-950/40">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-slate-950 shadow-md shrink-0 mt-0.5"
                    style={{ backgroundColor: building.color }}
                  >
                    {building.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {building.categoryLabel}
                      </span>
                      {isARMode && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5" />
                          Auto-Locked
                        </span>
                      )}
                    </div>
                    <h2 className="text-base lg:text-lg font-bold text-slate-100 leading-tight">
                      {building.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{building.faculty}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shrink-0"
                  aria-label="Tutup detail gedung"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* Photo Gallery Carousel */}
                <div className="space-y-2">
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImageUrl}
                      alt={currentPhoto.caption}
                      onError={() => handleImageError(photoIndex)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Photo Tag Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-white/15 shadow-sm">
                      {currentPhoto.tag}
                    </div>

                    {/* Lightbox Trigger Button */}
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-900 transition-all opacity-80 group-hover:opacity-100"
                      title="Perbesar Foto"
                      aria-label="Buka foto ukuran penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Prev/Next Controls (only if multi-photo) */}
                    {building.gallery.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-slate-900 transition-all"
                          aria-label="Foto sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-slate-900 transition-all"
                          aria-label="Foto selanjutnya"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Photo Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 pt-6">
                      <p className="text-xs text-slate-200 font-medium truncate">
                        {currentPhoto.caption}
                      </p>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  {building.gallery.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      {building.gallery.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPhotoIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === photoIndex
                              ? "w-6 bg-emerald-400"
                              : "w-2 bg-slate-700 hover:bg-slate-500"
                          }`}
                          aria-label={`Lihat foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Narration Component */}
                <AudioNarrationPlayer
                  audioPath={building.audioPath}
                  title={building.audioTitle}
                  duration={building.audioDuration}
                />

                {/* Description Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Profil & Fungsi Gedung
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {building.fullDesc}
                  </p>
                </div>

                {/* Facilities List Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Fasilitas & Sarana Utama
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {building.facilities.map((fac, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200">{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coordinate Info & University Siliwangi Badge */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kampus 2 Mugarsari Unsil</span>
                  </div>
                  <span className="font-mono text-slate-500">PIN-{building.code}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black transition-all"
                aria-label="Tutup foto perbesar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageUrl}
                alt={currentPhoto.caption}
                className="max-h-[75vh] w-auto object-contain"
              />

              <div className="w-full p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{building.name}</h4>
                  <p className="text-xs text-slate-400">{currentPhoto.caption}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-medium">
                  {currentPhoto.tag}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

