"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

interface ARScannerProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuilding: CampusBuilding | null;
  onSwitchToMap: () => void;
}

type CameraFacingMode = "environment" | "user";

type AFrameSceneElement = HTMLElement & {
  systems?: {
    [key: string]: {
      stop?: () => void;
    };
  };
  pause?: () => void;
};

export const ARScanner: React.FC<ARScannerProps> = ({
  onSelectBuilding,
  selectedBuilding,
  onSwitchToMap,
}) => {
  const [isScriptsLoaded, setIsScriptsLoaded] = useState<boolean>(false);
  const [isTargetFound, setIsTargetFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetChecked, setTargetChecked] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [sceneKey, setSceneKey] = useState<number>(0);
  const [sceneMounted, setSceneMounted] = useState<boolean>(true);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const targetEntityRef = useRef<HTMLElement | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const facingModeRef = useRef<CameraFacingMode>("environment");
  const isCameraOnRef = useRef<boolean>(true);
  const isUnmountingRef = useRef<boolean>(false);
  const activeStreamsRef = useRef<Set<MediaStream>>(new Set());
  const origGetUserMediaRef = useRef<
    ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | null
  >(null);
  const switchTimerRef = useRef<number | null>(null);

  // Stop MindAR controller, release tracked hardware camera streams, and strip overlays
  const stopCameraResources = useCallback(() => {
    if (switchTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }

    const sceneEl = sceneRef.current as AFrameSceneElement | null;
    if (sceneEl) {
      try {
        sceneEl.systems?.["mindar-image-system"]?.stop?.();
      } catch {
        // Safe ignore
      }
      try {
        sceneEl.pause?.();
      } catch {
        // Safe ignore
      }
    }

    activeStreamsRef.current.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Safe ignore
        }
      });
    });
    activeStreamsRef.current.clear();

    if (typeof document !== "undefined") {
      const videos = document.querySelectorAll("video");
      videos.forEach((vid) => {
        try {
          vid.pause();
          const srcObject = vid.srcObject;
          if (srcObject && "getTracks" in srcObject) {
            (srcObject as MediaStream).getTracks().forEach((track) => track.stop());
          }
          vid.srcObject = null;
          vid.remove();
        } catch {
          // Safe ignore
        }
      });

      const overlays = document.querySelectorAll(
        ".mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading"
      );
      overlays.forEach((el) => el.remove());
    }
  }, []);

  // Keep page background pitch black only when camera feed is actively shown
  useEffect(() => {
    if (isCameraOn && !errorMessage) {
      document.body.classList.add("ar-active");
      document.documentElement.classList.add("ar-active");
    } else {
      document.body.classList.remove("ar-active");
      document.documentElement.classList.remove("ar-active");
    }
    return () => {
      document.body.classList.remove("ar-active");
      document.documentElement.classList.remove("ar-active");
    };
  }, [isCameraOn, errorMessage]);

  // Final cleanup only when leaving AR scanner view
  useEffect(() => {
    isUnmountingRef.current = false;
    return () => {
      isUnmountingRef.current = true;
      isCameraOnRef.current = false;
      stopCameraResources();

      if (typeof document !== "undefined") {
        document.body.classList.remove("ar-active");
        document.documentElement.classList.remove("ar-active");
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        origGetUserMediaRef.current
      ) {
        try {
          navigator.mediaDevices.getUserMedia = origGetUserMediaRef.current;
        } catch {
          // Safe ignore
        }
        origGetUserMediaRef.current = null;
      }

      isInitializedRef.current = false;
    };
  }, [stopCameraResources]);

  // Pre-flight check: Target file existence
  useEffect(() => {
    let isMounted = true;
    const checkTarget = async () => {
      try {
        const res = await fetch("/targets/kampus2.mind", { method: "HEAD" });
        if (!res.ok && isMounted) {
          setErrorMessage(
            "File marker target (/targets/kampus2.mind) tidak ditemukan di server. Silakan beralih ke Mode Denah Digital 2D."
          );
          setIsLoading(false);
          return;
        }
        if (isMounted) {
          setTargetChecked(true);
        }
      } catch {
        if (isMounted) {
          setErrorMessage(
            "Gagal memeriksa file target marker. Silakan gunakan Mode Denah Digital 2D."
          );
          setIsLoading(false);
        }
      }
    };

    void checkTarget();
    return () => {
      isMounted = false;
    };
  }, []);

  // Camera Permission Verification & Script Loading
  useEffect(() => {
    if (!targetChecked) return;
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        "Browser Anda memblokir API Kamera pada alamat ini. Pastikan mengakses lewat HTTPS atau buka chrome://flags/#unsafely-treat-insecure-origin-as-secure."
      );
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    try {
      if (!origGetUserMediaRef.current) {
        origGetUserMediaRef.current = navigator.mediaDevices.getUserMedia.bind(
          navigator.mediaDevices
        );
      }

      const origGetUserMedia = origGetUserMediaRef.current;

      navigator.mediaDevices.getUserMedia = async function (constraints) {
        if (!constraints || !constraints.video) {
          return origGetUserMedia(constraints);
        }

        if (!isCameraOnRef.current || isUnmountingRef.current) {
          throw new DOMException("Camera is turned off", "AbortError");
        }

        const desiredFacing = facingModeRef.current;
        const candidateConstraints: MediaStreamConstraints[] = [
          {
            audio: false,
            video: {
              facingMode: { exact: desiredFacing },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          {
            audio: false,
            video: {
              facingMode: { ideal: desiredFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          {
            audio: false,
            video: true,
          },
        ];

        let stream: MediaStream | null = null;
        let lastError: unknown = null;

        for (const candidate of candidateConstraints) {
          try {
            stream = await origGetUserMedia(candidate);
            break;
          } catch (err) {
            lastError = err;
            const errName =
              err instanceof Error
                ? err.name
                : typeof err === "object" && err !== null && "name" in err
                  ? String((err as { name: unknown }).name)
                  : "";

            if (
              errName === "NotAllowedError" ||
              errName === "PermissionDeniedError" ||
              errName === "SecurityError" ||
              errName === "AbortError"
            ) {
              throw err;
            }
          }
        }

        if (!stream) {
          throw lastError instanceof Error
            ? lastError
            : new Error("Gagal mengakses perangkat kamera.");
        }

        if (!isCameraOnRef.current || isUnmountingRef.current) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // Safe ignore
            }
          });
          throw new DOMException("Camera was turned off", "AbortError");
        }

        activeStreamsRef.current.add(stream);
        return stream;
      };
    } catch {
      // Safe fallback
    }

    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.getElementById(id);
        if (existingScript) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Gagal memuat ${src}`));
        document.head.appendChild(script);
      });
    };

    const initializeCameraAndScripts = async () => {
      try {
        if (!cancelled) setIsLoading(true);
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js", "aframe-script");
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js",
          "mindar-script"
        );
        if (!cancelled && !isUnmountingRef.current) {
          setIsScriptsLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled && !isUnmountingRef.current) {
          setErrorMessage(
            `Gagal memuat library WebAR: ${err instanceof Error ? err.message : "Network error"}`
          );
          setIsLoading(false);
        }
      }
    };

    void initializeCameraAndScripts();

    return () => {
      cancelled = true;
    };
  }, [targetChecked]);

  // Target Found / Lost & MindAR Scene Lifecycle Event Listeners
  useEffect(() => {
    if (!isScriptsLoaded || !isCameraOn || !sceneMounted) return;

    const targetEl = targetEntityRef.current;
    const sceneEl = sceneRef.current;

    const handleTargetFound = () => {
      setIsTargetFound(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {
          // Safe ignore
        }
      }
    };

    const handleTargetLost = () => {
      setIsTargetFound(false);
    };

    const handleArReady = () => {
      setIsSwitchingCamera(false);
    };

    const handleArError = () => {
      if (!isCameraOnRef.current || isUnmountingRef.current) return;
      stopCameraResources();
      setIsSwitchingCamera(false);
      setErrorMessage(
        "Izin kamera ditolak atau kamera tidak tersedia. Pastikan izin kamera aktif di browser Anda atau beralih ke Denah Digital 2D."
      );
    };

    if (targetEl) {
      targetEl.addEventListener("targetFound", handleTargetFound);
      targetEl.addEventListener("targetLost", handleTargetLost);
    }

    if (sceneEl) {
      sceneEl.addEventListener("arReady", handleArReady);
      sceneEl.addEventListener("arError", handleArError);
    }

    const readyFallbackTimer = window.setTimeout(() => {
      setIsSwitchingCamera(false);
    }, 1500);

    return () => {
      window.clearTimeout(readyFallbackTimer);
      if (targetEl) {
        targetEl.removeEventListener("targetFound", handleTargetFound);
        targetEl.removeEventListener("targetLost", handleTargetLost);
      }
      if (sceneEl) {
        sceneEl.removeEventListener("arReady", handleArReady);
        sceneEl.removeEventListener("arError", handleArError);
      }
    };
  }, [isScriptsLoaded, isCameraOn, sceneMounted, sceneKey, stopCameraResources]);

  // Toggle Camera Hardware ON/OFF
  const handleToggleCamera = useCallback(() => {
    if (!isScriptsLoaded || isSwitchingCamera) return;

    if (isCameraOnRef.current) {
      isCameraOnRef.current = false;
      setIsCameraOn(false);
      setIsTargetFound(false);
      setIsSwitchingCamera(false);
      setSceneMounted(false);
      stopCameraResources();
    } else {
      setErrorMessage(null);
      isCameraOnRef.current = true;
      setIsCameraOn(true);
      setSceneKey((k) => k + 1);
      setSceneMounted(true);
    }
  }, [isScriptsLoaded, isSwitchingCamera, stopCameraResources]);

  // Flip between rear ("environment") and front ("user") camera cleanly
  const handleFlipCamera = useCallback(() => {
    if (!isCameraOnRef.current || isSwitchingCamera || !isScriptsLoaded) return;

    const nextMode: CameraFacingMode =
      facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = nextMode;
    setFacingMode(nextMode);
    setIsTargetFound(false);
    setIsSwitchingCamera(true);
    setSceneMounted(false);
    stopCameraResources();

    // Allow mobile camera hardware ~220ms to release the previous sensor cleanly
    switchTimerRef.current = window.setTimeout(() => {
      switchTimerRef.current = null;
      if (!isCameraOnRef.current || isUnmountingRef.current) return;
      setSceneKey((k) => k + 1);
      setSceneMounted(true);
    }, 220);
  }, [isSwitchingCamera, isScriptsLoaded, stopCameraResources]);

  // Screen-Space Proximity Raycaster for 3D pin taps
  const handleViewportTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!isCameraOn || !isTargetFound) return;

      const scene = sceneRef.current as unknown as { camera?: unknown };
      if (!scene || !scene.camera) return;

      const targetEntity = targetEntityRef.current as unknown as {
        object3D?: {
          visible: boolean;
          localToWorld: (v: unknown) => void;
        };
      };
      if (!targetEntity || !targetEntity.object3D || !targetEntity.object3D.visible) return;

      const w = window as unknown as {
        THREE?: {
          Vector3: new (x: number, y: number, z: number) => {
            x: number;
            y: number;
            z: number;
            project: (camera: unknown) => void;
          };
        };
      };
      if (!w.THREE) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      let closestBuilding: CampusBuilding | null = null;
      let minDistance = 90;

      for (const b of MAPPED_BUILDINGS) {
        const v = new w.THREE.Vector3(b.arCoord.x, b.arCoord.y, b.arCoord.z);
        targetEntity.object3D.localToWorld(v);
        v.project(scene.camera);

        if (v.z < 1) {
          const screenX = ((v.x + 1) * width) / 2;
          const screenY = ((-v.y + 1) * height) / 2;

          const dist = Math.hypot(clientX - screenX, clientY - screenY);
          if (dist < minDistance) {
            minDistance = dist;
            closestBuilding = b;
          }
        }
      }

      if (closestBuilding) {
        onSelectBuilding(closestBuilding);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(60);
          } catch {
            // Safe ignore
          }
        }
      }
    },
    [isCameraOn, isTargetFound, onSelectBuilding]
  );

  return (
    <div
      className="relative w-full h-[100dvh] min-h-[100dvh] bg-transparent overflow-hidden flex flex-col select-none"
      onPointerDown={(e) => {
        handleViewportTap(e.clientX, e.clientY);
      }}
    >
      {/* Loading Screen Overlay (Theme-aware) */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist">
          <div className="relative w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-[#065F46] dark:border-emerald-400 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#065F46] dark:text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <h3 className="text-base font-bold mb-1.5">Menyiapkan Kamera WebAR...</h3>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-sm">
            Menghubungkan sensor kamera dan memuat target pelacakan denah Kampus 2.
          </p>
        </div>
      )}

      {/* Error State Overlay (Theme-aware + actionable recovery) */}
      {errorMessage && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[#92400E] dark:text-amber-400 mb-4">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold mb-2">Kamera Tidak Tersedia</h3>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-md mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
            <button
              onClick={onSwitchToMap}
              className="min-h-[44px] flex-1 py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-unsil-obsidian font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Buka Denah Digital 2D
            </button>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist border border-unsil-hairline dark:border-unsil-pineBorder font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Muat Ulang
            </button>
          </div>
        </div>
      )}

      {/* Camera OFF Screen (Theme-aware, keeps bottom building dock accessible) */}
      {!isCameraOn && !errorMessage && !isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pt-[calc(4.75rem+env(safe-area-inset-top))] sm:pt-20 pb-[calc(8.75rem+env(safe-area-inset-bottom))] sm:pb-36 bg-unsil-paper dark:bg-unsil-obsidian text-center text-unsil-ink dark:text-unsil-mist"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-unsil-linen dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder flex items-center justify-center text-unsil-inkMuted dark:text-unsil-mistMuted mb-4">
            <CameraOff className="w-7 h-7" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold mb-2">Kamera Dimatikan</h3>
          <p className="text-xs text-unsil-inkMuted dark:text-unsil-mistMuted max-w-md mb-6 leading-relaxed">
            Kamera WebAR sedang nonaktif. Anda tetap dapat memilih gedung di bawah atau menyalakan
            kamera kembali.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCamera();
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

      {/* Scanner HUD Overlay */}
      {!errorMessage && isCameraOn && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4 pt-[calc(4.75rem+env(safe-area-inset-top))] sm:pt-20 pb-[calc(8.75rem+env(safe-area-inset-bottom))] sm:pb-36">
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div
              className={`pointer-events-auto px-4 py-2 rounded-xl border shadow-md flex items-center gap-2.5 transition-colors ${
                isTargetFound
                  ? "bg-[#065F46] border-emerald-400 text-white"
                  : "bg-unsil-obsidian/90 border-white/25 text-white"
              }`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isTargetFound ? "bg-emerald-300" : "bg-amber-400"
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold tracking-wide">
                {isSwitchingCamera
                  ? "Mengganti kamera..."
                  : isTargetFound
                    ? "Denah Terdeteksi: Ketuk Pin Gedung"
                    : "Arahkan kamera ke Denah Kampus 2 Unsil..."}
              </span>
            </div>

            {!isTargetFound && !isSwitchingCamera && (
              <span className="text-[11px] text-white bg-black/70 px-3 py-1 rounded-lg pointer-events-none">
                Posisikan seluruh denah di dalam bingkai
              </span>
            )}
          </div>

          {/* Static Framing Corners (Zero endless pulsing loops per R-19) */}
          <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <div
              className={`relative w-[min(68vw,270px)] sm:w-80 aspect-[4/5] max-h-full rounded-2xl border transition-colors flex items-center justify-center pointer-events-none ${
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

      {/* Bottom Stack: Camera Controls Pill + Quick-Select Building Dock */}
      <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 z-20 px-3 sm:px-4 pointer-events-none flex flex-col items-center gap-1.5 sm:gap-2">
        {!isLoading && !errorMessage && (
          <div
            className="pointer-events-auto p-1 rounded-xl bg-unsil-obsidian/95 border border-white/20 shadow-lg flex items-center gap-1.5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={!isCameraOn || isSwitchingCamera || !isScriptsLoaded}
              onClick={(e) => {
                e.stopPropagation();
                handleFlipCamera();
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white/10 hover:bg-white/20 text-white disabled:opacity-45 disabled:hover:bg-white/10 whitespace-nowrap"
              aria-label={
                facingMode === "environment"
                  ? "Putar ke kamera depan"
                  : "Putar ke kamera belakang"
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
                handleToggleCamera();
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
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-unsil-obsidian shadow-sm"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label={`Pilih gedung ${b.name}`}
              >
                <span className="w-5 h-5 rounded bg-black/40 font-mono text-[10px] flex items-center justify-center font-bold text-white">
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

      {/* WebAR A-Frame Scene Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {isScriptsLoaded && isCameraOn && sceneMounted && !errorMessage && (
          <a-scene
            key={sceneKey}
            ref={sceneRef as unknown as React.RefObject<HTMLElement>}
            mindar-image="imageTargetSrc: /targets/kampus2.mind; autoStart: true; uiLoading: no; uiScanning: no; filterMinCF: 0.001; filterBeta: 1000; warmupTolerance: 3; missTolerance: 8;"
            color-space="sRGB"
            renderer="colorManagement: true, physicallyCorrectLights: true"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            embedded
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            <a-camera position="0 0 0" look-controls="enabled: false" />

            {/* Target 0: Denah Kampus 2 Unsil */}
            <a-entity
              ref={targetEntityRef as unknown as React.RefObject<HTMLElement>}
              mindar-image-target="targetIndex: 0"
            >
              {/* Subtle translucent overlay on detected paper map */}
              <a-plane
                color="#065f46"
                material="opacity: 0.1; transparent: true"
                position="0 0 0.005"
                height="1.241"
                width="1.0"
              />

              {/* Interactive Pins for all 6 mapped buildings */}
              {MAPPED_BUILDINGS.map((b) => {
                const isSelected = selectedBuilding?.id === b.id;
                const posStr = `${b.arCoord.x} ${b.arCoord.y} ${b.arCoord.z}`;

                const outerColor = isSelected ? "#f59e0b" : "#10b981";
                const innerColor = isSelected ? "#b45309" : "#047857";

                return (
                  <a-entity key={b.id} position={posStr}>
                    <a-ring
                      color={outerColor}
                      material="opacity: 0.95; transparent: true"
                      radius-inner="0.034"
                      radius-outer="0.052"
                      position="0 0 0.01"
                    />
                    <a-circle color={innerColor} radius="0.032" position="0 0 0.015" />
                    <a-text
                      value={b.code}
                      align="center"
                      color="#ffffff"
                      position="0 0 0.02"
                      scale="0.28 0.28 0.28"
                    />
                  </a-entity>
                );
              })}
            </a-entity>
          </a-scene>
        )}
      </div>
    </div>
  );
};
