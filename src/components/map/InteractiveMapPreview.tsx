/**
 * ============================================================================
 * FILE: src/components/map/InteractiveMapPreview.tsx
 * PERAN: Mode Eksplorasi Denah Digital 2D interaktif (tanpa kamera).
 * PENJELASAN PRESENTASI:
 * 1. Menyediakan navigasi pan 1 jari & pinch-to-zoom 2 jari via Pointer Events
 *    terpadu (kompatibel penuh di layar sentuh Android, iOS, dan mouse desktop).
 * 2. Memiliki filter kategori gedung, toggle lapisan peta (Denah WebAR vs Denah
 *    Polos), dan dock pilih cepat di bagian bawah.
 * 3. Merender overlay garis SVG rute kampus secara real-time (Hijau-Emas untuk
 *    Jalan Kaki jalur kanan, Biru untuk Kendaraan jalur kiri) di atas denah.
 * ============================================================================
 */
"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
} from "lucide-react";
import { MAPPED_BUILDINGS, CAMPUS_MAP_CONFIG, CampusBuilding } from "@/data/campusBuildings";
import { findCampusRoute, TravelMode } from "@/lib/campusWayfinding";
import { WayfindingPanel } from "@/components/ui/WayfindingPanel";

interface InteractiveMapPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuilding: CampusBuilding | null;
  travelMode: TravelMode;
  onChangeTravelMode: (mode: TravelMode) => void;
  routeFromId: string;
  routeToId: string;
  onChangeRouteFrom: (id: string) => void;
  onChangeRouteTo: (id: string) => void;
  onSwapRoute: () => void;
  onClearRoute: () => void;
  wayfindingOpen: boolean;
  onToggleWayfinding: () => void;
}

type CategoryFilter = "all" | "academic" | "facility" | "worship" | "gate";

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "academic", label: "Akademik" },
  { id: "facility", label: "Fasilitas" },
  { id: "worship", label: "Ibadah" },
  { id: "gate", label: "Akses" },
];

export const InteractiveMapPreview: React.FC<InteractiveMapPreviewProps> = ({
  onSelectBuilding,
  selectedBuilding,
  travelMode,
  onChangeTravelMode,
  routeFromId,
  routeToId,
  onChangeRouteFrom,
  onChangeRouteTo,
  onSwapRoute,
  onClearRoute,
  wayfindingOpen,
  onToggleWayfinding,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<"ar" | "clean">("ar");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);

  const dragOriginRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const activePointersRef = useRef<Record<number, { x: number; y: number }>>({});
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const scaleRef = useRef<number>(1);
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeRoute = useMemo(() => {
    if (!routeFromId || !routeToId) return null;
    return findCampusRoute(routeFromId, routeToId, travelMode);
  }, [routeFromId, routeToId, travelMode]);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, select, input")) return;
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
    return b.category === categoryFilter || b.id === routeFromId || b.id === routeToId;
  });

  const hasActiveRoute = Boolean(activeRoute && activeRoute.distanceMeters > 0);
  const startCoord = activeRoute?.waypoints[0];
  const endCoord = activeRoute?.waypoints[activeRoute.waypoints.length - 1];

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-w-[100vw] bg-unsil-linen dark:bg-unsil-obsidian overflow-hidden flex flex-col select-none pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-[4.25rem] transition-colors">
      {/* Zone 1: Dedicated Non-Overlapping Control Deck */}
      <div className="shrink-0 z-20 px-3 sm:px-6 pt-2 pb-1.5 max-w-6xl mx-auto w-full space-y-2">
        {/* Row 1: Category Filter Chips (full width, smooth scroll, zero collision) */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
          role="group"
          aria-label="Filter kategori gedung"
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`min-h-[36px] shrink-0 whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                  isActive
                    ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian border-transparent shadow-sm"
                    : "bg-white dark:bg-unsil-pine border-unsil-hairline dark:border-unsil-pineBorder text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
                }`}
                aria-pressed={isActive}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Wayfinding Trigger (Left) + Compact Layer & Zoom Controls (Right) */}
        <div className="flex items-center justify-between gap-2">
          <WayfindingPanel
            isOpen={wayfindingOpen}
            onToggleOpen={onToggleWayfinding}
            travelMode={travelMode}
            onChangeTravelMode={onChangeTravelMode}
            fromId={routeFromId}
            toId={routeToId}
            onChangeFrom={onChangeRouteFrom}
            onChangeTo={onChangeRouteTo}
            onSwap={onSwapRoute}
            onClear={onClearRoute}
            route={activeRoute}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMapLayer(mapLayer === "ar" ? "clean" : "ar")}
              className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-paper dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm text-unsil-ink dark:text-unsil-mist flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
              title="Ganti lapisan denah antara Denah WebAR dan Denah Polos"
              aria-label={`Ganti tampilan denah, saat ini ${mapLayer === "ar" ? "Denah WebAR" : "Denah Polos"}`}
            >
              <Layers className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                {mapLayer === "ar" ? "Denah WebAR" : "Denah Polos"}
              </span>
            </button>

            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                title="Perkecil Denah"
                aria-label="Perkecil denah"
              >
                <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                title="Perbesar Denah"
                aria-label="Perbesar denah"
              >
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                title="Reset Posisi dan Zoom"
                aria-label="Reset zoom dan posisi denah"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Unobstructed Center Pan/Zoom Map Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden touch-none px-4 py-2 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="relative transition-transform duration-75 origin-center h-full max-h-[640px] flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Map Canvas (1024 x 1448 A4 Aspect Ratio) — pins live outside overflow-hidden so edge pins are NEVER clipped */}
          <div className="relative h-full max-w-[calc(100vw-2rem)] aspect-[1024/1448]">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-unsil-hairline dark:border-unsil-pineBorder bg-white">
              {mapLayer === "ar" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={CAMPUS_MAP_CONFIG.arTargetSrc}
                  alt="Denah Masterplan WebAR Kampus 2 Universitas Siliwangi"
                  width={CAMPUS_MAP_CONFIG.width}
                  height={CAMPUS_MAP_CONFIG.height}
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={CAMPUS_MAP_CONFIG.originalNewSrc}
                  alt="Denah Polos Kampus 2 Universitas Siliwangi"
                  width={CAMPUS_MAP_CONFIG.width}
                  height={CAMPUS_MAP_CONFIG.height}
                  className="w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Animated SVG Campus Route Overlay (Emerald for Walking, Royal Blue for Vehicle) */}
              {hasActiveRoute && activeRoute && startCoord && endCoord && (
                <svg
                  viewBox={`0 0 ${CAMPUS_MAP_CONFIG.width} ${CAMPUS_MAP_CONFIG.height}`}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  aria-hidden="true"
                >
                  <polyline
                    points={activeRoute.svgPoints}
                    fill="none"
                    stroke={travelMode === "vehicle" ? "#1D4ED8" : "#065F46"}
                    strokeOpacity="0.28"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={activeRoute.svgPoints}
                    fill="none"
                    stroke={travelMode === "vehicle" ? "#2563EB" : "#059669"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={activeRoute.svgPoints}
                    fill="none"
                    stroke={travelMode === "vehicle" ? "#BFDBFE" : "#FDE047"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="16 18"
                    className="wayfinding-dash-flow"
                  />
                  <circle
                    cx={(startCoord.xPercent / 100) * CAMPUS_MAP_CONFIG.width}
                    cy={(startCoord.yPercent / 100) * CAMPUS_MAP_CONFIG.height}
                    r="24"
                    fill={travelMode === "vehicle" ? "#3B82F6" : "#10B981"}
                    fillOpacity="0.28"
                    stroke={travelMode === "vehicle" ? "#1D4ED8" : "#065F46"}
                    strokeWidth="4"
                  />
                  <circle
                    cx={(endCoord.xPercent / 100) * CAMPUS_MAP_CONFIG.width}
                    cy={(endCoord.yPercent / 100) * CAMPUS_MAP_CONFIG.height}
                    r="26"
                    fill="#F59E0B"
                    fillOpacity="0.32"
                    stroke="#B45309"
                    strokeWidth="4"
                  />
                </svg>
              )}
            </div>

            {/* Interactive Building Pins */}
            {visibleBuildings.map((building) => {
              const isSelected = selectedBuilding?.id === building.id;
              const isHovered = hoveredBuilding?.id === building.id;
              const isStart = hasActiveRoute && building.id === routeFromId;
              const isEnd = hasActiveRoute && building.id === routeToId;

              return (
                <div
                  key={building.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                    isSelected || isHovered || isStart || isEnd ? "z-30" : "z-20"
                  }`}
                  style={{
                    left: `${building.mapCoord.xPercent}%`,
                    top: `${building.mapCoord.yPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredBuilding(building)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragMovedRef.current) return;
                      onSelectBuilding(building);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center group"
                    aria-label={`Pilih ${building.name}`}
                  >
                    <span
                      className={`flex items-center justify-center font-mono font-semibold transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md ${
                        isSelected || isEnd
                          ? "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] bg-[#F59E0B] text-[#14201C] border-2 border-white ring-2 ring-[#14201C] scale-110"
                          : isStart
                            ? "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] bg-[#065F46] text-white border-2 border-white ring-2 ring-emerald-300 scale-110"
                            : "w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] sm:text-[10px] text-white border-[1.5px] border-white group-hover:scale-110"
                      }`}
                      style={!isSelected && !isStart && !isEnd ? { backgroundColor: building.color } : undefined}
                    >
                      {building.code}
                    </span>
                  </button>

                  {(isHovered || isSelected) && (
                    <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-52 p-2.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-xl pointer-events-none z-30 text-unsil-ink dark:text-unsil-mist">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-white"
                          style={{ backgroundColor: building.color }}
                        >
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

      {/* Zone 3: Dedicated Bottom Quick-Select Building Dock (never overlaps map!) */}
      <div className="shrink-0 z-20 px-2.5 sm:px-6 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:pb-3.5 w-full flex justify-center">
        <div className="max-w-full overflow-x-auto p-1.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex items-center gap-1.5 no-scrollbar">
          <div className="flex items-center gap-1 px-2 text-[11px] font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            <span className="hidden sm:inline">Pilih Gedung:</span>
          </div>

          {MAPPED_BUILDINGS.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBuilding(b)}
                style={isSelected ? { backgroundColor: b.color } : undefined}
                className={`min-h-[40px] sm:min-h-[42px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? "text-white shadow-sm ring-2 ring-amber-400"
                    : "bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist"
                }`}
                aria-label={`Pilih gedung ${b.name}`}
              >
                <span
                  style={!isSelected ? { backgroundColor: b.color } : undefined}
                  className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-semibold text-white shrink-0 ${
                    isSelected ? "bg-black/30" : ""
                  }`}
                >
                  {b.code}
                </span>
                <span className="max-w-[120px] truncate">
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
