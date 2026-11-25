"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
} from "lucide-react";
import { MAPPED_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";

interface InteractiveMapPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuilding: CampusBuilding | null;
}

type CategoryFilter = "all" | "academic" | "worship" | "gate";

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "academic", label: "Akademik" },
  { id: "worship", label: "Ibadah" },
  { id: "gate", label: "Akses" },
];

export const InteractiveMapPreview: React.FC<InteractiveMapPreviewProps> = ({
  onSelectBuilding,
  selectedBuilding,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<"blueprint" | "vector">("blueprint");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);

  const dragOriginRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const activePointersRef = useRef<Record<number, { x: number; y: number }>>({});
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const scaleRef = useRef<number>(1);
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateScale = (nextScale: number) => {
    const clamped = Math.min(Math.max(nextScale, 0.75), 3.5);
    scaleRef.current = clamped;
    setScale(clamped);
  };

  const updatePosition = (nextPos: { x: number; y: number }) => {
    positionRef.current = nextPos;
    setPosition(nextPos);
  };

  const handleZoomIn = () => updateScale(scaleRef.current + 0.35);
  const handleZoomOut = () => updateScale(scaleRef.current - 0.35);
  const handleReset = () => {
    updateScale(1);
    updatePosition({ x: 0, y: 0 });
  };

  // Unified Pointer Events for 2-finger pinch-zoom and 1-finger panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    activePointersRef.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);

    const pts = Object.values(activePointersRef.current);
    if (pts.length === 2) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStartRef.current = { dist, scale: scaleRef.current };
      setIsDragging(false);
      dragOriginRef.current = null;
      dragMovedRef.current = true;
    } else if (pts.length === 1) {
      setIsDragging(true);
      dragMovedRef.current = false;
      dragOriginRef.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y,
        startX: e.clientX,
        startY: e.clientY,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current[e.pointerId]) {
      activePointersRef.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    }

    const pts = Object.values(activePointersRef.current);
    if (pts.length >= 2 && pinchStartRef.current) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (pinchStartRef.current.dist > 0) {
        updateScale(pinchStartRef.current.scale * (dist / pinchStartRef.current.dist));
      }
      dragMovedRef.current = true;
      return;
    }

    if (!isDragging || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.startX;
    const dy = e.clientY - dragOriginRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      dragMovedRef.current = true;
    }
    updatePosition({
      x: e.clientX - dragOriginRef.current.x,
      y: e.clientY - dragOriginRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    delete activePointersRef.current[e.pointerId];
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const remaining = Object.values(activePointersRef.current);
    if (remaining.length < 2) {
      pinchStartRef.current = null;
    }

    if (remaining.length === 1) {
      const p = remaining[0];
      setIsDragging(true);
      dragOriginRef.current = {
        x: p.x - positionRef.current.x,
        y: p.y - positionRef.current.y,
        startX: p.x,
        startY: p.y,
      };
    } else if (remaining.length === 0) {
      setIsDragging(false);
      dragOriginRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    updateScale(scaleRef.current + zoomFactor);
  };

  const visibleBuildings = MAPPED_BUILDINGS.filter((b) => {
    if (categoryFilter === "all") return true;
    return b.category === categoryFilter;
  });

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] bg-unsil-linen dark:bg-unsil-obsidian overflow-hidden flex flex-col select-none transition-colors">
      {/* Top-Left Category Filter Strip */}
      <div className="absolute top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-20 left-2.5 sm:left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-5.25rem)]">
        <div
          className="p-1 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex flex-nowrap sm:flex-wrap items-center gap-1 overflow-x-auto no-scrollbar"
          role="group"
          aria-label="Filter kategori gedung"
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`min-h-[38px] shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian"
                    : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
                }`}
                aria-pressed={isActive}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top-Right Map Zoom & Layer Controls */}
      <div className="absolute top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-20 right-2.5 sm:right-4 z-20 flex flex-col items-end gap-2">
        <div className="p-1 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
            title="Perbesar Denah"
            aria-label="Perbesar denah"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={handleZoomOut}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
            title="Perkecil Denah"
            aria-label="Perkecil denah"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={handleReset}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
            title="Reset Posisi dan Zoom"
            aria-label="Reset zoom dan posisi denah"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <button
          onClick={() => setMapLayer(mapLayer === "blueprint" ? "vector" : "blueprint")}
          className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm text-unsil-ink dark:text-unsil-mist flex items-center gap-1.5 text-xs font-semibold transition-colors"
          title="Ganti lapisan denah antara Denah Resmi dan Vektor"
          aria-label={`Ganti tampilan denah, saat ini ${mapLayer === "blueprint" ? "Denah Resmi" : "Vektor"}`}
        >
          <Layers className="w-4 h-4 text-[#065F46] dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">
            {mapLayer === "blueprint" ? "Denah Resmi" : "Vektor"}
          </span>
        </button>
      </div>

      {/* Interactive Map Pan/Zoom Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full flex-1 flex items-center justify-center overflow-hidden touch-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="relative transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Map Canvas (825 x 1024 Aspect Ratio) */}
          <div className="relative w-[min(88vw,calc(58dvh*0.805))] sm:w-[min(78vw,480px)] md:w-[540px] lg:w-[600px] aspect-[825/1024] rounded-2xl overflow-hidden shadow-xl border-2 border-unsil-hairline dark:border-unsil-pineBorder bg-white dark:bg-unsil-pine">
            {mapLayer === "blueprint" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/targets/denah-kampus2.jpg"
                alt="Denah Masterplan Kampus 2 Universitas Siliwangi"
                width={825}
                height={1024}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/assets/denah-kampus2.svg"
                alt="Gambar Vektor Denah Kampus 2 Universitas Siliwangi"
                width={825}
                height={1024}
                className="w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Interactive Building Pins (Zero endless ping loops per R-19) */}
            {visibleBuildings.map((building) => {
              const isSelected = selectedBuilding?.id === building.id;
              const isHovered = hoveredBuilding?.id === building.id;

              return (
                <div
                  key={building.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{
                    left: `${building.mapCoord.xPercent}%`,
                    top: `${building.mapCoord.yPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredBuilding(building)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragMovedRef.current) return;
                      onSelectBuilding(building);
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center group"
                    aria-label={`Pilih ${building.name}`}
                  >
                    <span
                      className={`flex items-center justify-center font-mono text-xs font-semibold transition-transform shadow-md ${
                        isSelected
                          ? "w-9 h-9 rounded-xl bg-[#F59E0B] text-[#14201C] border-2 border-white ring-2 ring-[#14201C] scale-110"
                          : "w-8 h-8 rounded-full bg-[#065F46] dark:bg-unsil-obsidian text-white border-2 border-white dark:border-emerald-400 group-hover:scale-110"
                      }`}
                    >
                      {building.code}
                    </span>
                  </button>

                  {(isHovered || isSelected) && (
                    <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-52 p-2.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-xl pointer-events-none z-30 text-unsil-ink dark:text-unsil-mist">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-[#065F46] dark:bg-emerald-500/20 dark:text-emerald-300">
                          {building.categoryLabel}
                        </span>
                        <span className="text-[10px] text-unsil-inkMuted dark:text-unsil-mistMuted font-mono">
                          PIN-{building.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight">{building.name}</h4>
                      <p className="text-[10px] text-unsil-inkMuted dark:text-unsil-mistMuted mt-0.5 line-clamp-2">
                        {building.shortDesc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Quick-Select Dock */}
      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 z-20 px-3 sm:px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto max-w-full overflow-x-auto p-1.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-lg flex items-center gap-1.5 no-scrollbar">
          <div className="flex items-center gap-1 px-2.5 text-[11px] font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            <span className="hidden sm:inline">Pilih Gedung:</span>
          </div>

          {MAPPED_BUILDINGS.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                    : "bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist"
                }`}
                aria-label={`Pilih gedung ${b.name}`}
              >
                <span className="w-5 h-5 rounded bg-black/20 dark:bg-white/15 font-mono text-[10px] flex items-center justify-center font-semibold">
                  {b.code}
                </span>
                <span className="max-w-[130px] truncate">
                  {b.name.split(" ")[0]} {b.name.split(" ")[1] || ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
