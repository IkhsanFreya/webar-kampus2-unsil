/**
 * ============================================================================
 * FILE: src/components/ar/ARScanner.tsx
 * PERAN: Komponen utama pemindai Marker-Based WebAR (MindAR + A-Frame).
 * PENJELASAN PRESENTASI:
 * 1. Melakukan pengecekan pre-flight keberadaan file marker binary `/targets/kampus2.mind`.
 * 2. Merender scene A-Frame dengan 16 pin 3D berkode warna fakultas tepat di atas
 *    koordinat X,Y,Z kertas denah Kampus 2 Mugarsari.
 * 3. Mengelola event `targetFound` (disertai getaran haptik) dan `targetLost`.
 * 4. Menjamin pembersihan resource kamera otomatis via cleanup `useEffect` saat
 *    pengguna keluar dari mode AR atau mengganti lensa kamera.
 * ============================================================================
 */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MAPPED_BUILDINGS, CAMPUS_MAP_CONFIG, CampusBuilding } from "@/data/campusBuildings";
import {
  AFrameSceneElement,
  CameraFacingMode,
  cleanupARCameraResources,
  createCameraInterceptor,
  findClosestARPin,
  loadExternalScript,
} from "./arUtils";
import { AROverlayHUD } from "./AROverlayHUD";

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

  const stopCameraResources = useCallback(() => {
    if (switchTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    cleanupARCameraResources(sceneRef.current as AFrameSceneElement | null, activeStreamsRef.current);
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

  // Final cleanup on unmount
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

  // Pre-flight check: Target .mind file existence
  useEffect(() => {
    let isMounted = true;
    const checkTarget = async () => {
      try {
        const res = await fetch(CAMPUS_MAP_CONFIG.mindSrc, { method: "HEAD" });
        if (!res.ok && isMounted) {
          setErrorMessage(
            "File marker target (/targets/kampus2.mind) tidak ditemukan di server. Silakan beralih ke Mode Denah Digital 2D."
          );
          setIsLoading(false);
          return;
        }
        if (isMounted) setTargetChecked(true);
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
    if (!targetChecked || isInitializedRef.current) return;
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

      navigator.mediaDevices.getUserMedia = createCameraInterceptor(
        origGetUserMediaRef.current,
        () => ({
          isCameraOn: isCameraOnRef.current,
          isUnmounting: isUnmountingRef.current,
          facingMode: facingModeRef.current,
        }),
        activeStreamsRef.current
      );
    } catch {
      // Safe fallback
    }

    const initializeScripts = async () => {
      try {
        if (!cancelled) setIsLoading(true);
        await loadExternalScript("https://aframe.io/releases/1.5.0/aframe.min.js", "aframe-script");
        await loadExternalScript(
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

    void initializeScripts();
    return () => {
      cancelled = true;
    };
  }, [targetChecked]);

  // MindAR Scene Lifecycle Event Listeners
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

    const handleTargetLost = () => setIsTargetFound(false);
    const handleArReady = () => setIsSwitchingCamera(false);
    const handleArError = () => {
      if (!isCameraOnRef.current || isUnmountingRef.current) return;
      stopCameraResources();
      setIsSwitchingCamera(false);
      setErrorMessage(
        "Izin kamera ditolak atau kamera tidak tersedia. Pastikan izin kamera aktif di browser Anda atau beralih ke Denah Digital 2D."
      );
    };

    targetEl?.addEventListener("targetFound", handleTargetFound);
    targetEl?.addEventListener("targetLost", handleTargetLost);
    sceneEl?.addEventListener("arReady", handleArReady);
    sceneEl?.addEventListener("arError", handleArError);

    const readyFallbackTimer = window.setTimeout(() => setIsSwitchingCamera(false), 1500);

    return () => {
      window.clearTimeout(readyFallbackTimer);
      targetEl?.removeEventListener("targetFound", handleTargetFound);
      targetEl?.removeEventListener("targetLost", handleTargetLost);
      sceneEl?.removeEventListener("arReady", handleArReady);
      sceneEl?.removeEventListener("arError", handleArError);
    };
  }, [isScriptsLoaded, isCameraOn, sceneMounted, sceneKey, stopCameraResources]);

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

    switchTimerRef.current = window.setTimeout(() => {
      switchTimerRef.current = null;
      if (!isCameraOnRef.current || isUnmountingRef.current) return;
      setSceneKey((k) => k + 1);
      setSceneMounted(true);
    }, 220);
  }, [isSwitchingCamera, isScriptsLoaded, stopCameraResources]);

  const handleViewportTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!isCameraOn || !isTargetFound) return;
      const closest = findClosestARPin(clientX, clientY, sceneRef.current, targetEntityRef.current);
      if (closest) {
        onSelectBuilding(closest);
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
      onClick={(e) => handleViewportTap(e.clientX, e.clientY)}
    >
      <AROverlayHUD
        isLoading={isLoading}
        errorMessage={errorMessage}
        isCameraOn={isCameraOn}
        isTargetFound={isTargetFound}
        isSwitchingCamera={isSwitchingCamera}
        isScriptsLoaded={isScriptsLoaded}
        facingMode={facingMode}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={onSelectBuilding}
        onSwitchToMap={onSwitchToMap}
        onToggleCamera={handleToggleCamera}
        onFlipCamera={handleFlipCamera}
      />

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
            mindar-image={`imageTargetSrc: ${CAMPUS_MAP_CONFIG.mindSrc}; autoStart: true; uiLoading: no; uiScanning: no; filterMinCF: 0.001; filterBeta: 1000; warmupTolerance: 3; missTolerance: 8;`}
            color-space="sRGB"
            renderer="colorManagement: true, physicallyCorrectLights: true"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            embedded
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            <a-camera position="0 0 0" look-controls="enabled: false" />

            <a-entity
              ref={targetEntityRef as unknown as React.RefObject<HTMLElement>}
              mindar-image-target="targetIndex: 0"
            >
              <a-plane
                color="#065f46"
                material="opacity: 0.08; transparent: true"
                position="0 0 0.005"
                height="1.414"
                width="1.0"
              />

              {MAPPED_BUILDINGS.map((b) => {
                const isSelected = selectedBuilding?.id === b.id;
                const posStr = `${b.arCoord.x} ${b.arCoord.y} ${b.arCoord.z}`;
                const outerColor = isSelected
                  ? "#f59e0b"
                  : b.faculty.includes("Teknik")
                    ? "#3b82f6"
                    : b.faculty.includes("Pertanian")
                      ? "#22c55e"
                      : b.category === "gate"
                        ? "#f59e0b"
                        : b.category === "worship"
                          ? "#14b8a6"
                          : "#64748b";
                const innerColor = isSelected ? "#b45309" : b.color;

                return (
                  <a-entity key={b.id} position={posStr}>
                    <a-ring
                      color={outerColor}
                      material="opacity: 0.95; transparent: true"
                      radius-inner="0.022"
                      radius-outer="0.034"
                      position="0 0 0.01"
                    />
                    <a-circle color={innerColor} radius="0.020" position="0 0 0.015" />
                    <a-text
                      value={b.code}
                      align="center"
                      color="#ffffff"
                      position="0 0 0.02"
                      scale="0.19 0.19 0.19"
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
