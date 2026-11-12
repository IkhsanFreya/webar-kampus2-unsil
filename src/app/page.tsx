"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CampusBuilding } from "@/data/campusBuildings";
import { NavbarHUD } from "@/components/ui/NavbarHUD";
import { InteractiveMapPreview } from "@/components/map/InteractiveMapPreview";
import { LandingView } from "@/components/landing/LandingView";
import { BuildingDetailSheet } from "@/components/ui/BuildingDetailSheet";

// Dynamic import of WebAR Scanner to strictly guarantee client-side only evaluation (no SSR window crash)
const ARScanner = dynamic(
  () => import("@/components/ar/ARScanner").then((mod) => mod.ARScanner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-unsil-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-xs font-medium">Memuat Antarmuka WebAR...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState<"landing" | "ar" | "map">("landing");
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);

  const handleSelectBuilding = (building: CampusBuilding) => {
    setSelectedBuilding(building);
  };

  const handleCloseDetail = () => {
    setSelectedBuilding(null);
  };

  const handleSwitchMode = (mode: "landing" | "ar" | "map") => {
    setCurrentMode(mode);
  };

  return (
    <div
      className={`relative w-full min-h-[100dvh] overflow-hidden transition-colors ${
        currentMode === "ar" ? "bg-transparent" : "bg-unsil-slate-950"
      }`}
    >
      {/* Floating Island Detached Navbar HUD */}
      <NavbarHUD currentMode={currentMode} onSwitchMode={handleSwitchMode} />

      {/* Main View Transition */}
      {currentMode === "landing" && (
        <LandingView
          onStartAR={() => setCurrentMode("ar")}
          onStartMap={() => setCurrentMode("map")}
          onSelectBuilding={handleSelectBuilding}
        />
      )}

      {currentMode === "ar" && (
        <ARScanner
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
          onSwitchToMap={() => setCurrentMode("map")}
        />
      )}

      {currentMode === "map" && (
        <InteractiveMapPreview
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
        />
      )}

      {/* Building Detail Bottom Sheet / Side Panel with Auto-Lock */}
      <BuildingDetailSheet
        building={selectedBuilding}
        onClose={handleCloseDetail}
        isARMode={currentMode === "ar"}
      />
    </div>
  );
}
