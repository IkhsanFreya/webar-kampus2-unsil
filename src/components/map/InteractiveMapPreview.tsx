"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import { CAMPUS_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";

interface InteractiveMapPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuilding: CampusBuilding | null;
}

export const InteractiveMapPreview: React.FC<InteractiveMapPreviewProps> = ({
  onSelectBuilding,
  selectedBuilding,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapLayer, setMapLayer] = useState<"blueprint" | "vector">("blueprint");
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.35, 0.75));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setScale((prev) => Math.min(Math.max(prev + zoomFactor, 0.75), 3.5));
  };

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-unsil-slate-950 overflow-hidden flex flex-col select-none">
      {/* Floating Map Tools HUD */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <div className="p-1 rounded-2xl bg-unsil-slate-900/90 border border-white/10 shadow-glass backdrop-blur-xl flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Perbesar Denah"
            aria-label="Perbesar denah"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Perkecil Denah"
            aria-label="Perkecil denah"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Reset Posisi & Zoom"
            aria-label="Reset zoom dan posisi denah"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Layer Switcher (Blueprint vs Vector) */}
        <button
          onClick={() => setMapLayer(mapLayer === "blueprint" ? "vector" : "blueprint")}
          className="p-2.5 rounded-2xl bg-unsil-slate-900/90 hover:bg-unsil-slate-850 border border-white/10 shadow-glass backdrop-blur-xl text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors group"
          title="Ganti Tampilan Denah (Blueprint / Vektor)"
          aria-label="Ganti tampilan lapisan denah"
        >
          <Layers className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Floating Status Guide Banner */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-unsil-slate-900/85 border border-white/10 shadow-glass backdrop-blur-xl flex items-center gap-2 max-w-xs">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <p className="text-[11px] text-slate-200 font-medium leading-tight">
            Mode Eksplorasi Digital: Seret untuk menggeser & ketuk pin gedung.
          </p>
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full flex-1 flex items-center justify-center overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="relative transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Main Map Canvas (Fixed Aspect Ratio 825x1024) */}
          <div className="relative w-[340px] xs:w-[380px] sm:w-[480px] md:w-[580px] lg:w-[680px] aspect-[825/1024] rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-unsil-slate-900 ring-4 ring-black/40">
            {/* Map Layer Image */}
            {mapLayer === "blueprint" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/targets/denah-kampus2.jpg"
                alt="Site Plan Kampus 2 Unsil"
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/assets/denah-kampus2.svg"
                alt="Vector Plan Kampus 2 Unsil"
                className="w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Interactive Animated Pin Layer */}
            {CAMPUS_BUILDINGS.map((building) => {
              const isSelected = selectedBuilding?.id === building.id;
              const isHovered = hoveredBuilding?.id === building.id;

              return (
                <div
                  key={building.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{
                    left: `${building.mapCoord.xPercent}%`,
                    top: `${building.mapCoord.yPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredBuilding(building)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBuilding(building);
                  }}
                >
                  {/* Pin Ripple Animation */}
                  <div
                    className={`absolute -inset-3 rounded-full opacity-75 animate-ping-slow pointer-events-none ${
                      isSelected ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />

                  {/* Pin Badge Button */}
                  <button
                    className={`relative flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isSelected
                        ? "w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black scale-125 ring-4 ring-amber-400/50"
                        : "w-8 h-8 rounded-full bg-unsil-slate-950 text-white border-2 border-emerald-400 hover:scale-110 hover:bg-emerald-600"
                    }`}
                    aria-label={`Pilih ${building.name}`}
                  >
                    <span className="text-xs font-bold">{building.code}</span>
                  </button>

                  {/* Hover Tooltip Card */}
                  {(isHovered || isSelected) && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 rounded-xl bg-unsil-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-xl pointer-events-none z-30 transition-all">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                          {building.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          PIN-{building.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {building.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                        {building.shortDesc}
                      </p>
                      <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-emerald-400 font-medium">
                        <span>Ketuk untuk detail</span>
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Quick-Select Dock */}
      <div className="absolute inset-x-0 bottom-4 z-20 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto max-w-full overflow-x-auto p-1.5 rounded-full bg-unsil-slate-950/90 border border-white/15 shadow-glass backdrop-blur-2xl flex items-center gap-1.5 ring-1 ring-emerald-500/20 custom-scrollbar">
          <div className="flex items-center gap-1 px-2.5 text-[11px] font-semibold text-slate-400 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pilih Gedung:</span>
          </div>

          {CAMPUS_BUILDINGS.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30 ring-1 ring-white/20"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center font-bold">
                  {b.code}
                </span>
                <span className="max-w-[120px] truncate">{b.name.split(" ")[0]} {b.name.split(" ")[1] || ""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

