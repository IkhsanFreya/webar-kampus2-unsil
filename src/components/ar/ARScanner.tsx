"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  AlertTriangle,
  RotateCcw,
  MapPin,
  CheckCircle2,
  Scan,
  Compass,
} from "lucide-react";
import { CAMPUS_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";

interface ARScannerProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuilding: CampusBuilding | null;
  onSwitchToMap: () => void;
}

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const targetEntityRef = useRef<HTMLElement | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Stop camera tracks and clean up residual elements
  const cleanupAR = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("ar-active");
      document.documentElement.classList.remove("ar-active");
    }

    // 1. Stop all video streams
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {});
    }

    // 2. Stop video elements in DOM
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

    // 3. Remove MindAR injected overlays and scanner elements
    const overlays = document.querySelectorAll(
      ".mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading"
    );
    overlays.forEach((el) => el.remove());

    // 4. Reset A-Frame scene
    if (sceneRef.current && "pause" in sceneRef.current) {
      try {
        (sceneRef.current as unknown as { pause: () => void }).pause();
      } catch {
        // Safe ignore
      }
    }
  }, []);

  // Manage body transparency for camera feed
  useEffect(() => {
    document.body.classList.add("ar-active");
    document.documentElement.classList.add("ar-active");
    return () => {
      document.body.classList.remove("ar-active");
      document.documentElement.classList.remove("ar-active");
    };
  }, []);

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
            "Gagal memeriksa file target marker. Silakan gunakan Mode Eksplorasi Digital 2D."
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

  // Camera Permission Verification & Script Loading with Hardware Native HD Resolution Patch
  useEffect(() => {
    if (!targetChecked) return;
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        "Browser Anda memblokir API Kamera pada alamat ini. Buka chrome://flags/#unsafely-treat-insecure-origin-as-secure, masukkan URL ini lalu Relaunch."
      );
      setIsLoading(false);
      return;
    }

    // Intercept getUserMedia so MindAR requests true native HD hardware sensor resolution
    try {
      const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function (constraints) {
        if (constraints && constraints.video) {
          const existing = typeof constraints.video === "object" ? constraints.video : {};
          constraints.video = {
            ...existing,
            facingMode: { ideal: "environment" },
            width: { min: 1024, ideal: 1920, max: 3840 },
            height: { min: 720, ideal: 1080, max: 2160 },
          };
        }
        return origGetUserMedia(constraints);
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
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initializeCameraAndScripts = async () => {
      try {
        setIsLoading(true);

        // Load A-Frame first
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js", "aframe-script");

        // Load MindAR A-Frame build
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js",
          "mindar-script"
        );

        setIsScriptsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        setErrorMessage(
          `Gagal memuat library WebAR: ${err instanceof Error ? err.message : "Network error"}`
        );
        setIsLoading(false);
      }
    };

    void initializeCameraAndScripts();

    return () => {
      cleanupAR();
    };
  }, [cleanupAR, targetChecked]);

  // Setup Target Found / Lost Event Listeners
  useEffect(() => {
    if (!isScriptsLoaded) return;

    const targetEl = targetEntityRef.current;
    if (!targetEl) return;

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

    targetEl.addEventListener("targetFound", handleTargetFound);
    targetEl.addEventListener("targetLost", handleTargetLost);

    return () => {
      targetEl.removeEventListener("targetFound", handleTargetFound);
      targetEl.removeEventListener("targetLost", handleTargetLost);
    };
  }, [isScriptsLoaded]);

  // Screen-Space Proximity Raycaster: 100% Guaranteed touch detection for pin numbers
  const handleViewportTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!isTargetFound) return;

      const scene = sceneRef.current as unknown as {
        camera?: unknown;
      };
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
      let minDistance = 90; // Generous 90px touch zone around each pin

      for (const b of CAMPUS_BUILDINGS) {
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
    [isTargetFound, onSelectBuilding]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAR();
    };
  }, [cleanupAR]);

  return (
    <div
      className="relative w-full h-[100dvh] min-h-[100dvh] bg-transparent overflow-hidden flex flex-col select-none"
      onPointerDown={(e) => {
        handleViewportTap(e.clientX, e.clientY);
      }}
    >
      {/* Loading Screen Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-unsil-slate-950/90 backdrop-blur-xl text-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-base font-bold text-white mb-2">Memulai Kamera WebAR HD...</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Menghubungkan ke sensor kamera native hardware dan memuat target pelacakan denah.
          </p>
        </div>
      )}

      {/* Error State Banner Overlay */}
      {errorMessage && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-unsil-slate-950/95 backdrop-blur-2xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Akses Kamera Diperlukan</h3>
          <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={onSwitchToMap}
              className="w-full py-3 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Buka Mode Denah Digital 2D
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Coba Muat Ulang
            </button>
          </div>
        </div>
      )}

      {/* Futuristic Scanner HUD Overlay */}
      {!errorMessage && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 pt-20 pb-24">
          {/* Top Status Capsule */}
          <div className="flex flex-col items-center gap-1.5 pointer-events-none">
            <div
              className={`pointer-events-auto px-4 py-2 rounded-full border shadow-glass backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 ${
                isTargetFound
                  ? "bg-emerald-950/90 border-emerald-400/80 text-emerald-200 shadow-emerald-500/30 scale-105"
                  : "bg-unsil-slate-950/90 border-white/20 text-slate-200"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isTargetFound ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"
                }`}
              />
              <span className="text-xs font-semibold tracking-wide">
                {isTargetFound
                  ? "Denah Terdeteksi — Ketuk Pin Gedung"
                  : "Arahkan kamera ke Denah Kampus 2 Unsil..."}
              </span>
            </div>
            {!isTargetFound && (
              <span className="text-[11px] text-slate-300 bg-black/60 px-3 py-0.5 rounded-full backdrop-blur-md pointer-events-none">
                Posisikan seluruh denah di dalam bingkai
              </span>
            )}
          </div>

          {/* Central Scanning Reticle / Framing Guide */}
          <div className="flex-1 flex items-center justify-center p-4 pointer-events-none">
            <div
              className={`relative w-64 h-80 sm:w-80 sm:h-96 rounded-3xl border-2 transition-all duration-500 flex items-center justify-center overflow-hidden pointer-events-none ${
                isTargetFound
                  ? "border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                  : "border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
              }`}
            >
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-emerald-400" />

              {/* Scanning Laser Beam */}
              {!isTargetFound && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse-slow top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Quick-Select Dock */}
      <div className="absolute inset-x-0 bottom-4 z-20 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto max-w-full overflow-x-auto p-1.5 rounded-full bg-unsil-slate-950/95 border border-white/20 shadow-glass backdrop-blur-2xl flex items-center gap-1.5 ring-1 ring-emerald-500/20 custom-scrollbar">
          <div className="flex items-center gap-1 px-2.5 text-[11px] font-semibold text-slate-300 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pilih Gedung:</span>
          </div>

          {CAMPUS_BUILDINGS.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(b);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105"
                    : "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/50 text-[10px] flex items-center justify-center font-bold text-white">
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
        {isScriptsLoaded && (
          <a-scene
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
              {/* Subtle translucent plane covering the detected paper map */}
              <a-plane
                color="#10b981"
                material="opacity: 0.12; transparent: true"
                position="0 0 0.005"
                height="1.241"
                width="1.0"
              />

              {/* Render 3D AR Interactive Pins for all 6 buildings */}
              {CAMPUS_BUILDINGS.map((b) => {
                const isSelected = selectedBuilding?.id === b.id;
                const posStr = `${b.arCoord.x} ${b.arCoord.y} ${b.arCoord.z}`;

                return (
                  <a-entity key={b.id} position={posStr}>
                    {/* Glowing Outer Ring */}
                    <a-ring
                      color={isSelected ? "#f59e0b" : "#10b981"}
                      material="opacity: 0.95; transparent: true"
                      radius-inner="0.034"
                      radius-outer="0.052"
                      position="0 0 0.01"
                    />

                    {/* Inner Solid Emerald Badge Circle */}
                    <a-circle
                      color={isSelected ? "#f59e0b" : "#047857"}
                      radius="0.032"
                      position="0 0 0.015"
                    />

                    {/* Pin Code Text (Bold White) */}
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
