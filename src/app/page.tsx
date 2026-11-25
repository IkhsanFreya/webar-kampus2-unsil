"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { CAMPUS_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";
import { NavbarHUD } from "@/components/ui/NavbarHUD";
import { InteractiveMapPreview } from "@/components/map/InteractiveMapPreview";
import { LandingView } from "@/components/landing/LandingView";
import { BuildingDetailSheet } from "@/components/ui/BuildingDetailSheet";

type AppMode = "landing" | "ar" | "map";

// Dynamic import of WebAR Scanner to guarantee client-side only evaluation (no SSR window crash)
const ARScanner = dynamic(
  () => import("@/components/ar/ARScanner").then((mod) => mod.ARScanner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#065F46] dark:border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-xs font-medium">Memuat Antarmuka WebAR...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState<AppMode>("landing");
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);

  // Sync URL query params and browser history on mount + popstate (Back button returns to homepage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const gedungId = params.get("gedung");
    const urlMode = params.get("mode");

    if (gedungId) {
      const target = CAMPUS_BUILDINGS.find((b) => b.id === gedungId);
      if (target) {
        const targetMode: AppMode = target.hasMapPin ? "map" : "landing";
        setCurrentMode(targetMode);
        setSelectedBuilding(target);
        window.history.replaceState({ unsilMode: targetMode }, "", window.location.href);
      } else {
        window.history.replaceState({ unsilMode: "landing" }, "", window.location.pathname);
      }
    } else if (urlMode === "map" || urlMode === "ar") {
      setCurrentMode(urlMode);
      window.history.replaceState({ unsilMode: urlMode }, "", window.location.href);
    } else {
      window.history.replaceState({ unsilMode: "landing" }, "", window.location.pathname);
    }

    const handlePopState = (event: PopStateEvent) => {
      const stateMode = (event.state as { unsilMode?: AppMode } | null)?.unsilMode;
      const nextParams = new URLSearchParams(window.location.search);
      const queryMode = nextParams.get("mode");
      const queryGedung = nextParams.get("gedung");

      if (queryGedung) {
        const target = CAMPUS_BUILDINGS.find((b) => b.id === queryGedung) ?? null;
        setCurrentMode("map");
        setSelectedBuilding(target);
        return;
      }

      const resolved: AppMode =
        stateMode === "ar" || stateMode === "map" || stateMode === "landing"
          ? stateMode
          : queryMode === "ar" || queryMode === "map"
          ? queryMode
          : "landing";

      setCurrentMode(resolved);
      if (resolved === "landing") {
        setSelectedBuilding(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectBuilding = useCallback((building: CampusBuilding) => {
    setSelectedBuilding(building);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  const handleSwitchMode = useCallback(
    (mode: AppMode) => {
      if (mode === currentMode) {
        if (mode === "landing") {
          setSelectedBuilding(null);
        }
        return;
      }

      setCurrentMode(mode);
      if (mode === "landing") {
        setSelectedBuilding(null);
      }

      if (typeof window !== "undefined") {
        const nextUrl = mode === "landing" ? "/" : `/?mode=${mode}`;
        window.history.pushState({ unsilMode: mode }, "", nextUrl);
      }
    },
    [currentMode]
  );

  return (
    <div
      className={`relative w-full min-h-[100dvh] overflow-x-hidden transition-colors ${
        currentMode === "ar"
          ? "bg-transparent"
          : "bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist"
      }`}
    >
      {/* Floating Top Navbar HUD */}
      <NavbarHUD currentMode={currentMode} onSwitchMode={handleSwitchMode} />

      {/* Main View Switcher */}
      {currentMode === "landing" && (
        <LandingView
          onStartAR={() => handleSwitchMode("ar")}
          onStartMap={() => handleSwitchMode("map")}
          onSelectBuilding={handleSelectBuilding}
          selectedBuildingId={selectedBuilding?.id ?? null}
        />
      )}

      {currentMode === "ar" && (
        <ARScanner
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
          onSwitchToMap={() => handleSwitchMode("map")}
        />
      )}

      {currentMode === "map" && (
        <InteractiveMapPreview
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
        />
      )}

      {/* Building Detail Drawer / Side Panel */}
      <BuildingDetailSheet
        building={selectedBuilding}
        onClose={handleCloseDetail}
        isARMode={currentMode === "ar"}
      />
    </div>
  );
}
