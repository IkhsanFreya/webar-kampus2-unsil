/**
 * ============================================================================
 * FILE: src/components/ui/FeatureErrorBoundary.tsx
 * PERAN: React Error Boundary khusus pengaman fitur WebGL 3D & Kamera WebAR.
 * PENJELASAN PRESENTASI:
 * Menangkap error runtime grafis/WebGL maupun ChunkLoadError (saat ada update
 * build baru) agar halaman tidak crash menjadi layar putih, lalu langsung
 * menawarkan tombol pemulihan ("Muat Ulang" & "Beralih ke Denah 2D").
 * ============================================================================
 */
"use client";

import React from "react";
import { AlertTriangle, Compass, RotateCcw } from "lucide-react";

interface FeatureErrorBoundaryProps {
  featureName: string;
  onFallbackToMap?: () => void;
  children: React.ReactNode;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  isChunkError: boolean;
  errorDetail: string;
}

export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isChunkError: false, errorDetail: "" };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    const rawMsg = error?.message || "";
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      rawMsg.includes("Loading chunk") ||
      rawMsg.includes("Failed to fetch dynamically imported module");
    return {
      hasError: true,
      isChunkError,
      errorDetail: rawMsg || "Terjadi gangguan pada perangkat grafis/kamera.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[${this.props.featureName}] Runtime error caught:`, error, info.componentStack);
  }

  handleRetry = (): void => {
    if (this.state.isChunkError && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, isChunkError: false, errorDetail: "" });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="w-full max-w-full min-h-[320px] h-full overflow-hidden flex flex-col items-center justify-center px-5 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] text-center bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist"
      >
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400 mb-4 shrink-0">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          <h2 className="text-base font-bold mb-2 leading-snug [text-wrap:balance]">
            {this.state.isChunkError
              ? "Pembaruan Modul Tersedia"
              : `${this.props.featureName} Mengalami Gangguan`}
          </h2>

          <p className="w-full text-xs text-unsil-inkMuted dark:text-unsil-mistMuted mb-5 leading-relaxed break-words [overflow-wrap:anywhere]">
            {this.state.isChunkError
              ? "Aplikasi baru saja diperbarui sehingga modul 3D perlu dimuat ulang agar tersinkronisasi dengan versi terbaru."
              : "Perangkat Anda mengalami kendala saat memuat konteks WebGL atau kamera. Anda dapat mencoba ulang atau beralih ke Denah Digital 2D yang ringan."}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={this.handleRetry}
              className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{this.state.isChunkError ? "Muat Ulang Halaman" : "Coba Muat Ulang"}</span>
            </button>

            {this.props.onFallbackToMap && (
              <button
                type="button"
                onClick={this.props.onFallbackToMap}
                className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder text-unsil-ink dark:text-unsil-mist font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Beralih ke Denah 2D</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
