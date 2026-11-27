/**
 * ============================================================================
 * FILE: src/app/error.tsx
 * PERAN: Penangkap error global (Global Error Boundary) untuk App Router Next.js.
 * PENJELASAN PRESENTASI:
 * Jika terjadi kesalahan tak terduga di halaman, user tidak akan melihat layar
 * putih kosong (white screen), melainkan halaman pemulihan yang ramah dengan
 * tombol "Coba Lagi" dan "Ke Beranda".
 * ============================================================================
 */
"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError] Unhandled route exception:", error);
  }, [error]);

  return (
    <main
      id="main-content"
      role="alert"
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center bg-unsil-paper dark:bg-unsil-obsidian text-unsil-ink dark:text-unsil-mist"
    >
      <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-lg space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold">Terjadi Kendala Aplikasi</h1>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted leading-relaxed">
            Halaman mengalami kesalahan tak terduga saat memuat modul peta. Silakan muat ulang atau
            kembali ke beranda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
          <a
            href="/"
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl bg-unsil-linen dark:bg-unsil-pineRaised hover:bg-unsil-hairline dark:hover:bg-unsil-pineBorder text-unsil-ink dark:text-unsil-mist font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Ke Beranda</span>
          </a>
        </div>
      </div>
    </main>
  );
}
