/**
 * ============================================================================
 * FILE: src/components/ar/AROverlayHUD.tsx
 * PERAN: Antarmuka overlay (HUD) di atas tampilan kamera WebAR.
 * PENJELASAN PRESENTASI:
 * Memisahkan tampilan UI dari logika kamera MindAR, meliputi:
 * - Layar loading persiapan kamera & layar error pemulihan jika izin kamera ditolak.
 * - Status deteksi real-time (`aria-live="polite"`) & bingkai pembidik denah.
 * - Tombol kontrol kamera (Putar Depan/Belakang & Matikan/Nyalakan Kamera).
 * - Quick-Select Dock di bawah layar agar user tetap bisa memilih gedung walau
 *   tangan bergetar saat memegang HP.
 * ============================================================================
 */
"use client";

import React from "react";
import {
  Camera,
  CameraOff,
  SwitchCamera,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Compass,
} from "lucide-react";
import { MAPPED_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";
import { CameraFacingMode } from "./arUtils";

interface AROverlayHUDProps {
  isLoading: boolean;
  errorMessage: string | null;
  isCameraOn: boolean;
  isTargetFound: boolean;
  isSwitchingCamera: boolean;
  isScriptsLoaded: boolean;
  facingMode: CameraFacingMode;
  selectedBuilding: CampusBuilding | null;
  onSelectBuilding: (building: CampusBuilding) => void;
  onSwitchToMap: () => void;
  onToggleCamera: () => void;
  onFlipCamera: () => void;
}

export const AROverlayHUD: React.FC<AROverlayHUDProps> = ({
  isLoading,
  errorMessage,
  isCameraOn,
  isTargetFound,
  isSwitchingCamera,
  isScriptsLoaded,
  facingMode,
  selectedBuilding,
  onSelectBuilding,
  onSwitchToMap,
  onToggleCamera,
  onFlipCamera,
}) => {
  const statusText = isSwitchingCamera
    ? "Mengganti kamera..."
    : isTargetFound
      ? "Denah Terdeteksi: Ketuk Pin Gedung"
      : "Arahkan kamera ke Denah Kampus 2 Unsil...";

  return (
    <>
      {/* Loading Screen Overlay */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist"
        >
          <div className="relative w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-[#065F46] dark:border-emerald-400 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <h2 className="text-base font-bold mb-1.5">Menyiapkan Kamera WebAR...</h2>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-sm">
            Menghubungkan sensor kamera dan memuat target pelacakan denah Kampus 2.
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400 mb-4">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold mb-2">Kamera Tidak Tersedia</h2>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-md mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={onSwitchToMap}
              className="min-h-[44px] flex-1 py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Buka Denah Digital 2D
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist border border-unsil-hairline dark:border-unsil-pineBorder font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Muat Ulang
            </button>
          </div>
        </div>
      )}

      {/* Camera OFF Screen */}
      {!isCameraOn && !errorMessage && !isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pt-[calc(4.75rem+env(safe-area-inset-top))] sm:pt-20 pb-[calc(8.75rem+env(safe-area-inset-bottom))] sm:pb-36 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-unsil-linen dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-inkMuted dark:text-unsil-mistMuted mb-4">
            <CameraOff className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold mb-2">Kamera Dimatikan</h2>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-md mb-6 leading-relaxed">
            Kamera WebAR sedang nonaktif. Anda tetap dapat memilih gedung di bawah atau menyalakan
            kamera kembali.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCamera();
              }}
              className="min-h-[44px] flex-1 py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Nyalakan Kamera
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSwitchToMap();
              }}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist border border-unsil-hairline dark:border-unsil-pineBorder font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Buka Denah Digital 2D
            </button>
          </div>
        </div>
      )}

      {/* Live Scanner Status & Reticle */}
      {!errorMessage && isCameraOn && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4 pt-[calc(4.25rem+env(safe-area-inset-top))] sm:pt-20 pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pb-36">
          <div className="flex flex-col items-center gap-2 pointer-events-none px-2">
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`pointer-events-auto max-w-full px-3.5 py-2 rounded-xl border shadow-md flex items-center gap-2 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isTargetFound
                  ? "bg-[#065F46] border-emerald-400 text-white"
                  : "bg-unsil-obsidian/90 border-white/25 text-white"
              }`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isTargetFound ? "bg-emerald-300" : "bg-amber-400"
                }`}
                aria-hidden="true"
              />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">
                {statusText}
              </span>
            </div>

            {!isTargetFound && !isSwitchingCamera && (
              <span className="text-[11px] text-white bg-black/70 px-3 py-1 rounded-lg pointer-events-none">
                Posisikan seluruh denah di dalam bingkai
              </span>
            )}
          </div>

          {/* Static Framing Corners */}
          <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <div
              className={`relative w-[min(66vw,250px)] sm:w-72 aspect-[1024/1448] max-h-full rounded-2xl border transition-colors flex items-center justify-center pointer-events-none ${
                isTargetFound ? "border-emerald-400/50" : "border-white/25"
              }`}
            >
              <div
                className={`absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 ${
                  isTargetFound ? "border-emerald-400" : "border-white/80"
                }`}
              />
              <div
                className={`absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 ${
                  isTargetFound ? "border-emerald-400" : "border-white/80"
                }`}
              />
              <div
                className={`absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 ${
                  isTargetFound ? "border-emerald-400" : "border-white/80"
                }`}
              />
              <div
                className={`absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 ${
                  isTargetFound ? "border-emerald-400" : "border-white/80"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stack: Camera Controls + Quick-Select Building Dock */}
      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 z-20 px-3 sm:px-4 pointer-events-none flex flex-col items-center gap-1.5 sm:gap-2">
        {!isLoading && !errorMessage && (
          <div
            className="pointer-events-auto p-1 rounded-xl bg-unsil-obsidian/95 border border-white/20 shadow-lg flex items-center gap-1.5"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={!isCameraOn || isSwitchingCamera || !isScriptsLoaded}
              onClick={(e) => {
                e.stopPropagation();
                onFlipCamera();
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white/10 hover:bg-white/20 text-white disabled:opacity-45 disabled:hover:bg-white/10 whitespace-nowrap"
              aria-label={
                facingMode === "environment" ? "Putar ke kamera depan" : "Putar ke kamera belakang"
              }
              title="Putar balik kamera depan atau belakang"
            >
              <SwitchCamera className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {isSwitchingCamera ? (
                  "Mengganti..."
                ) : facingMode === "environment" ? (
                  <>
                    <span className="sm:hidden">Belakang</span>
                    <span className="hidden sm:inline">Putar (Belakang)</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Depan</span>
                    <span className="hidden sm:inline">Putar (Depan)</span>
                  </>
                )}
              </span>
            </button>

            <button
              type="button"
              disabled={!isScriptsLoaded || isSwitchingCamera}
              aria-pressed={isCameraOn}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCamera();
              }}
              className={`min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-45 whitespace-nowrap ${
                isCameraOn
                  ? "bg-[#B91C1C] hover:bg-[#991B1B] text-white"
                  : "bg-[#065F46] hover:bg-[#047857] text-white"
              }`}
              aria-label={isCameraOn ? "Matikan kamera AR" : "Nyalakan kamera AR"}
              title={isCameraOn ? "Matikan kamera AR" : "Nyalakan kamera AR"}
            >
              {isCameraOn ? (
                <CameraOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {isCameraOn ? (
                  <>
                    <span className="sm:hidden">Matikan</span>
                    <span className="hidden sm:inline">Matikan Kamera</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Nyalakan</span>
                    <span className="hidden sm:inline">Nyalakan Kamera</span>
                  </>
                )}
              </span>
            </button>
          </div>
        )}

        <div
          className="pointer-events-auto max-w-full overflow-x-auto p-1.5 rounded-xl bg-unsil-obsidian/95 border border-white/20 shadow-lg flex items-center gap-1.5 no-scrollbar"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 px-2.5 text-[11px] font-semibold text-unsil-mistMuted shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="hidden sm:inline">Pilih Gedung:</span>
          </div>

          {MAPPED_BUILDINGS.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(b);
                }}
                style={isSelected ? { backgroundColor: b.color } : undefined}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? "text-white shadow-sm ring-2 ring-amber-400"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label={`Pilih gedung ${b.name}`}
              >
                <span
                  style={!isSelected ? { backgroundColor: b.color } : undefined}
                  className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-bold text-white ${
                    isSelected ? "bg-black/35" : ""
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
    </>
  );
};
