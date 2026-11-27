/**
 * ============================================================================
 * FILE: src/app/page.tsx
 * PERAN: Halaman utama sekaligus pengatur state pusat (Orchestrator) aplikasi.
 * PENJELASAN PRESENTASI:
 * 1. Mengelola perpindahan 4 mode utama: Beranda (landing), Kamera WebAR (ar),
 *    Maket 3D Interaktif (3d), dan Denah Digital 2D (map).
 * 2. Menggunakan `next/dynamic(..., { ssr: false })` untuk modul AR & 3D agar
 *    hanya dimuat di sisi browser (client-side), mencegah error WebGL/kamera saat SSR.
 * 3. Mensinkronkan URL query (`?mode=...` & `?gedung=...`) untuk mendukung fitur
 *    Bagikan Lokasi (deep-link) dan tombol Back browser.
 * 4. Menyimpan state rute wayfinding (asal, tujuan, mode Jalan Kaki/Kendaraan) agar
 *    konsisten saat user berpindah antara Denah 2D dan Maket 3D.
 * 5. Membungkus modul AR & 3D dengan FeatureErrorBoundary sebagai pengaman crash WebGL.
 * ============================================================================
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { CAMPUS_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";
import { TravelMode } from "@/lib/campusWayfinding";
import { NavbarHUD } from "@/components/ui/NavbarHUD";
import { InteractiveMapPreview } from "@/components/map/InteractiveMapPreview";
import { LandingView } from "@/components/landing/LandingView";
import { BuildingDetailSheet } from "@/components/ui/BuildingDetailSheet";
import { FeatureErrorBoundary } from "@/components/ui/FeatureErrorBoundary";

type AppMode = "landing" | "ar" | "3d" | "map";

// Dynamic import of WebAR Scanner & 3D Maquette to keep initial Beranda load fast & client-only
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

const Campus3DPreview = dynamic(
  () => import("@/components/landing/Campus3DPreview").then((mod) => mod.Campus3DPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-unsil-linen dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#1d4ed8] dark:border-blue-400 border-t-transparent animate-spin" />
          <p className="text-xs font-medium">Memuat Maket 3D Kampus...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState<AppMode>("landing");
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("walking");
  const [routeFromId, setRouteFromId] = useState<string>("");
  const [routeToId, setRouteToId] = useState<string>("");
  const [wayfindingOpen, setWayfindingOpen] = useState<boolean>(false);

  // Sync URL query params and browser history on mount + popstate
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
    } else if (urlMode === "map" || urlMode === "ar" || urlMode === "3d") {
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
        stateMode === "ar" || stateMode === "3d" || stateMode === "map" || stateMode === "landing"
          ? stateMode
          : queryMode === "ar" || queryMode === "3d" || queryMode === "map"
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

/** Membuka kartu detail gedung saat user mengetuk pin di AR, Maket 3D, Denah 2D, atau Direktori. */
  const handleSelectBuilding = useCallback((building: CampusBuilding) => {
    setSelectedBuilding(building);
  }, []);

  /** Menutup kartu detail gedung (BuildingDetailSheet). */
  const handleCloseDetail = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  /** Berpindah mode tampilan (landing/ar/3d/map) sekaligus memperbarui history URL browser. */
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

  /**
   * Memulai navigasi rute langsung menuju gedung yang dipilih dari kartu detail.
   * Secara default titik asal diisi Gerbang Depan (01), lalu otomatis menampilkan panel rute.
   */
  const handleRouteToBuilding = useCallback(
    (building: CampusBuilding) => {
      const defaultOrigin = building.id === "unsil-01" ? "unsil-03" : "unsil-01";
      setRouteFromId((prev) => (prev && prev !== building.id ? prev : defaultOrigin));
      setRouteToId(building.id);
      setWayfindingOpen(true);
      setSelectedBuilding(null);

      if (currentMode !== "map" && currentMode !== "3d") {
        handleSwitchMode("map");
      }
    },
    [currentMode, handleSwitchMode]
  );

  const handleSwapRoute = useCallback(() => {
    setRouteFromId(routeToId);
    setRouteToId(routeFromId);
  }, [routeFromId, routeToId]);

  const handleClearRoute = useCallback(() => {
    setRouteFromId("");
    setRouteToId("");
  }, []);

  const handleToggleWayfinding = useCallback(() => {
    setWayfindingOpen((prev) => !prev);
  }, []);

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
          onStart3D={() => handleSwitchMode("3d")}
          onStartMap={() => handleSwitchMode("map")}
          onSelectBuilding={handleSelectBuilding}
          selectedBuildingId={selectedBuilding?.id ?? null}
        />
      )}

      {currentMode === "ar" && (
        <main id="main-content" tabIndex={-1} className="outline-none">
          <FeatureErrorBoundary
            featureName="Pemindai Kamera WebAR"
            onFallbackToMap={() => handleSwitchMode("map")}
          >
            <ARScanner
              onSelectBuilding={handleSelectBuilding}
              selectedBuilding={selectedBuilding}
              onSwitchToMap={() => handleSwitchMode("map")}
            />
          </FeatureErrorBoundary>
        </main>
      )}

      {currentMode === "3d" && (
        <main id="main-content" tabIndex={-1} className="outline-none">
          <FeatureErrorBoundary
            featureName="Maket 3D Interaktif"
            onFallbackToMap={() => handleSwitchMode("map")}
          >
            <Campus3DPreview
              mode="fullscreen"
              onSelectBuilding={handleSelectBuilding}
              selectedBuildingId={selectedBuilding?.id ?? null}
              travelMode={travelMode}
              onChangeTravelMode={setTravelMode}
              routeFromId={routeFromId}
              routeToId={routeToId}
              onChangeRouteFrom={setRouteFromId}
              onChangeRouteTo={setRouteToId}
              onSwapRoute={handleSwapRoute}
              onClearRoute={handleClearRoute}
              wayfindingOpen={wayfindingOpen}
              onToggleWayfinding={handleToggleWayfinding}
            />
          </FeatureErrorBoundary>
        </main>
      )}

      {currentMode === "map" && (
        <main id="main-content" tabIndex={-1} className="outline-none">
          <InteractiveMapPreview
            onSelectBuilding={handleSelectBuilding}
            selectedBuilding={selectedBuilding}
            travelMode={travelMode}
            onChangeTravelMode={setTravelMode}
            routeFromId={routeFromId}
            routeToId={routeToId}
            onChangeRouteFrom={setRouteFromId}
            onChangeRouteTo={setRouteToId}
            onSwapRoute={handleSwapRoute}
            onClearRoute={handleClearRoute}
            wayfindingOpen={wayfindingOpen}
            onToggleWayfinding={handleToggleWayfinding}
          />
        </main>
      )}

      {/* Building Detail Drawer / Side Panel */}
      <BuildingDetailSheet
        building={selectedBuilding}
        onClose={handleCloseDetail}
        isARMode={currentMode === "ar"}
        onRouteToBuilding={handleRouteToBuilding}
      />
    </div>
  );
}
