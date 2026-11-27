/**
 * ============================================================================
 * FILE: src/components/ui/WayfindingPanel.tsx
 * PERAN: Panel popover pemilih rute kampus (digunakan bersama di Denah 2D & Maket 3D).
 * PENJELASAN PRESENTASI:
 * 1. Memungkinkan pengguna memilih mode perjalanan: "Jalan Kaki" (jalur tercepat
 *    sisi kanan/depan) atau "Kendaraan" (wajib jalur kiri/lingkar barat).
 * 2. Menyediakan pemilih titik asal & gedung tujuan (16 gedung), tombol tukar
 *    arah (swap), ringkasan jarak (meter) & estimasi waktu tempuh (menit), serta
 *    tombol reset/lihat peta.
 * ============================================================================
 */
"use client";

import React from "react";
import {
  Navigation,
  ArrowUpDown,
  X,
  Footprints,
  Car,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { MAPPED_BUILDINGS } from "@/data/campusBuildings";
import { CampusRoute, TravelMode } from "@/lib/campusWayfinding";

interface WayfindingPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  travelMode: TravelMode;
  onChangeTravelMode: (mode: TravelMode) => void;
  fromId: string;
  toId: string;
  onChangeFrom: (id: string) => void;
  onChangeTo: (id: string) => void;
  onSwap: () => void;
  onClear: () => void;
  route: CampusRoute | null;
}

export const WayfindingPanel: React.FC<WayfindingPanelProps> = ({
  isOpen,
  onToggleOpen,
  travelMode,
  onChangeTravelMode,
  fromId,
  toId,
  onChangeFrom,
  onChangeTo,
  onSwap,
  onClear,
  route,
}) => {
  const hasActiveRoute = Boolean(route && route.distanceMeters > 0);
  const isVehicle = travelMode === "vehicle";

  return (
    <div className="relative pointer-events-auto min-w-0">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`min-h-[36px] max-w-full px-2.5 sm:px-3 py-1.5 rounded-xl border shadow-sm text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap ${
          hasActiveRoute
            ? isVehicle
              ? "bg-[#1D4ED8] dark:bg-blue-500 border-transparent text-white dark:text-unsil-obsidian"
              : "bg-[#065F46] dark:bg-emerald-500 border-transparent text-white dark:text-unsil-obsidian"
            : "bg-white dark:bg-unsil-pine border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
        }`}
        aria-expanded={isOpen}
        aria-label="Buka atau tutup panel rute kampus"
      >
        {isVehicle ? (
          <Car className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Navigation className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        )}
        {hasActiveRoute && route ? (
          <>
            <span className="sm:hidden truncate max-w-[110px]">
              {route.from.code}→{route.to.code} · {route.distanceMeters}m
            </span>
            <span className="hidden sm:inline truncate max-w-[225px]">
              {route.from.code} → {route.to.code} · ±{route.distanceMeters} m ({route.durationMinutes} mnt)
            </span>
          </>
        ) : (
          <span>Rute</span>
        )}
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
        )}
      </button>

      {/* Compact, lightweight solid popover box */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 z-40 w-[min(calc(100vw-2rem),268px)] p-2.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-xl space-y-2 text-unsil-ink dark:text-unsil-mist"
          role="region"
          aria-label="Panel penunjuk rute jalan kaki dan kendaraan"
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <Navigation
                className={`w-3.5 h-3.5 shrink-0 ${
                  isVehicle
                    ? "text-[#1D4ED8] dark:text-blue-400"
                    : "text-[#065F46] dark:text-emerald-400"
                }`}
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold">Rute Kampus</span>
            </div>
            <div className="flex items-center gap-0.5">
              {hasActiveRoute && (
                <button
                  type="button"
                  onClick={onClear}
                  className="h-6 px-1.5 rounded-md text-[10px] font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-[#B91C1C] dark:hover:text-red-400 hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised transition-colors"
                  aria-label="Hapus rute aktif"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={onToggleOpen}
                className="w-6 h-6 rounded-md hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-inkMuted dark:text-unsil-mistMuted transition-colors"
                aria-label="Tutup panel rute"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Slim Travel Mode Switcher */}
          <div
            className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder"
            role="group"
            aria-label="Mode perjalanan"
          >
            <button
              type="button"
              onClick={() => onChangeTravelMode("walking")}
              aria-pressed={!isVehicle}
              className={`h-7 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                !isVehicle
                  ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
              }`}
            >
              <Footprints className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Jalan Kaki</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTravelMode("vehicle")}
              aria-pressed={isVehicle}
              className={`h-7 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                isVehicle
                  ? "bg-[#1D4ED8] dark:bg-blue-500 text-white dark:text-unsil-obsidian shadow-sm"
                  : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
              }`}
            >
              <Car className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Kendaraan</span>
            </button>
          </div>

          {/* Compact Origin & Destination Row */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0 space-y-1.5">
              <label htmlFor="wayfinding-from" className="sr-only">
                Titik awal rute
              </label>
              <select
                id="wayfinding-from"
                value={fromId}
                onChange={(e) => onChangeFrom(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-medium text-unsil-ink dark:text-unsil-mist truncate"
              >
                <option value="">Dari: Pilih asal...</option>
                {MAPPED_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} · {b.name}
                  </option>
                ))}
              </select>

              <label htmlFor="wayfinding-to" className="sr-only">
                Gedung tujuan rute
              </label>
              <select
                id="wayfinding-to"
                value={toId}
                onChange={(e) => onChangeTo(e.target.value)}
                className="w-full h-8 px-2 rounded-lg bg-unsil-paper dark:bg-unsil-obsidian border border-unsil-hairline dark:border-unsil-pineBorder text-xs font-medium text-unsil-ink dark:text-unsil-mist truncate"
              >
                <option value="">Ke: Pilih tujuan...</option>
                {MAPPED_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} · {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onSwap}
              disabled={!fromId && !toId}
              className="w-8 h-8 rounded-lg bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors disabled:opacity-40 shrink-0"
              title="Tukar titik awal dan tujuan"
              aria-label="Tukar titik awal dan tujuan"
            >
              <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div aria-live="polite" role="status">
            {hasActiveRoute && route ? (
              <div className="space-y-1.5">
                <div
                  className={`px-2 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${
                    isVehicle
                      ? "bg-blue-50 dark:bg-unsil-obsidian border-blue-200 dark:border-blue-500/35"
                      : "bg-emerald-50 dark:bg-unsil-obsidian border-emerald-200 dark:border-emerald-500/35"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 font-bold text-[11px] ${
                      isVehicle
                        ? "text-[#1D4ED8] dark:text-blue-300"
                        : "text-[#065F46] dark:text-emerald-300"
                    }`}
                  >
                    {isVehicle ? (
                      <Car className="w-3 h-3 shrink-0" aria-hidden="true" />
                    ) : (
                      <Footprints className="w-3 h-3 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      ±{route.distanceMeters} m · {route.durationMinutes} mnt
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isVehicle
                        ? "bg-[#1D4ED8] dark:bg-blue-500 text-white dark:text-unsil-obsidian"
                        : "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian"
                    }`}
                  >
                    {route.from.code}→{route.to.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onToggleOpen}
                  className={`w-full h-7 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                    isVehicle
                      ? "bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-blue-500 dark:hover:bg-blue-400 text-white dark:text-unsil-obsidian"
                      : "bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian"
                  }`}
                >
                  <Check className="w-3 h-3" aria-hidden="true" />
                  <span>Lihat di Peta</span>
                </button>
              </div>
            ) : fromId && toId && fromId === toId ? (
              <p className="text-[10px] text-[#92400E] dark:text-amber-300">
                Pilih 2 gedung yang berbeda.
              </p>
            ) : (
              <p className="text-[10px] text-unsil-inkMuted dark:text-unsil-mistMuted leading-tight">
                {isVehicle
                  ? "Kendaraan wajib melalui jalur kiri kampus."
                  : "Pejalan kaki diarahkan lewat jalur tercepat."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
