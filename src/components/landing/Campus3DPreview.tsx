/**
 * ============================================================================
 * FILE: src/components/landing/Campus3DPreview.tsx
 * PERAN: Komponen kanvas WebGL Three.js untuk Maket 3D Interaktif Kampus 2 UNSIL.
 * PENJELASAN PRESENTASI:
 * 1. Mendukung 2 mode tampilan: `preview` (di Beranda) dan `fullscreen` (layar penuh).
 * 2. Menyediakan kontrol kamera orbit (geser 1 jari/mouse, pinch-to-zoom 2 jari,
 *    scroll zoom, Tampak Atas vs Isometrik, Auto-Rotate, dan Camera Fly-To saat
 *    gedung dipilih).
 * 3. Menampilkan pin HTML terproyeksi (`Vector3.project`) agar tetap tajam dan
 *    mudah diklik, filter per fakultas, serta integrasi jalur rute 3D Jalan Kaki/Kendaraan.
 * 4. Menggunakan render-on-demand (hemat baterai HP) + proteksi `webglcontextlost`.
 * ============================================================================
 */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Plus, Minus, RotateCcw, Pause, Play, Eye, MapPin } from "lucide-react";
import {
  MAPPED_BUILDINGS,
  CAMPUS_MAP_CONFIG,
  CampusBuilding,
} from "@/data/campusBuildings";
import { useTheme } from "@/context/ThemeContext";
import { CampusRoute, findCampusRoute, TravelMode } from "@/lib/campusWayfinding";
import { WayfindingPanel } from "@/components/ui/WayfindingPanel";
import {
  BOARD_D,
  BOARD_W,
  BuildingMeshMeta,
  createBuildingMaquette,
  createSharedMaterials,
  Filter3D,
  FILTERS_3D,
  FULLSCREEN_RADIUS,
  INITIAL_PHI,
  INITIAL_THETA,
  matchesFilter3D,
  PREVIEW_RADIUS,
  TOP_DOWN_PHI,
} from "./campus3d/maquetteBuilder";
import { createRoute3D, Route3DHandle } from "./campus3d/route3d";

interface Campus3DPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuildingId?: string | null;
  mode?: "preview" | "fullscreen";
  travelMode?: TravelMode;
  onChangeTravelMode?: (mode: TravelMode) => void;
  routeFromId?: string;
  routeToId?: string;
  onChangeRouteFrom?: (id: string) => void;
  onChangeRouteTo?: (id: string) => void;
  onSwapRoute?: () => void;
  onClearRoute?: () => void;
  wayfindingOpen?: boolean;
  onToggleWayfinding?: () => void;
}

export const Campus3DPreview: React.FC<Campus3DPreviewProps> = ({
  onSelectBuilding,
  selectedBuildingId,
  mode = "preview",
  travelMode = "walking",
  onChangeTravelMode,
  routeFromId = "",
  routeToId = "",
  onChangeRouteFrom,
  onChangeRouteTo,
  onSwapRoute,
  onClearRoute,
  wayfindingOpen = false,
  onToggleWayfinding,
}) => {
  const isFullscreen = mode === "fullscreen";

  const activeRoute: CampusRoute | null = useMemo(() => {
    if (!isFullscreen || !routeFromId || !routeToId) return null;
    return findCampusRoute(routeFromId, routeToId, travelMode);
  }, [isFullscreen, routeFromId, routeToId, travelMode]);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onSelectRef = useRef(onSelectBuilding);
  const selectedIdRef = useRef(selectedBuildingId);
  const themeRef = useRef<"dark" | "light">("light");
  const filterRef = useRef<Filter3D>("all");
  const autoRotateRef = useRef<boolean>(true);
  const wakeLoopRef = useRef<() => void>(() => {});
  const zoomDeltaRef = useRef<(delta: number) => void>(() => {});
  const resetViewRef = useRef<() => void>(() => {});
  const toggleTopViewRef = useRef<() => void>(() => {});
  const focusBuildingRef = useRef<(id: string) => void>(() => {});
  const sceneThemeSyncRef = useRef<(t: "dark" | "light") => void>(() => {});
  const syncRoute3DRef = useRef<(route: CampusRoute | null) => void>(() => {});

  const { theme } = useTheme();
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isTopView, setIsTopView] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<Filter3D>("all");
  const [webglError, setWebglError] = useState<boolean>(false);

  useEffect(() => {
    onSelectRef.current = onSelectBuilding;
  }, [onSelectBuilding]);

  useEffect(() => {
    selectedIdRef.current = selectedBuildingId;
    if (isFullscreen && selectedBuildingId) {
      focusBuildingRef.current(selectedBuildingId);
    }
    wakeLoopRef.current();
  }, [selectedBuildingId, isFullscreen]);

  useEffect(() => {
    themeRef.current = theme;
    sceneThemeSyncRef.current(theme);
    wakeLoopRef.current();
  }, [theme]);

  useEffect(() => {
    filterRef.current = activeFilter;
    wakeLoopRef.current();
  }, [activeFilter]);

  useEffect(() => {
    syncRoute3DRef.current(activeRoute);
  }, [activeRoute]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      autoRotateRef.current = false;
      setIsAutoRotating(false);
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglError(true);
      return;
    }

    const isMobileViewport = window.innerWidth < 768;
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 260);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileViewport ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglError(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);

    const hemiLight = new THREE.HemisphereLight(0xfdfbf6, 0x3b444b, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
    sunLight.position.set(4.5, 8.5, 5.5);
    sunLight.castShadow = true;
    const shadowSize = isMobileViewport ? 512 : 1024;
    sunLight.shadow.mapSize.set(shadowSize, shadowSize);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 22;
    sunLight.shadow.camera.left = -4.5;
    sunLight.shadow.camera.right = 4.5;
    sunLight.shadow.camera.top = 4.5;
    sunLight.shadow.camera.bottom = -4.5;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xa7f3d0, 0.55);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xdcd7cb,
      roughness: 0.85,
      metalness: 0.05,
    });
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_W + 0.18, 0.22, BOARD_D + 0.18),
      plinthMat
    );
    plinth.position.y = -0.115;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.235;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xf6f4ee,
      roughness: 0.82,
      metalness: 0.02,
    });
    const boardPlane = new THREE.Mesh(new THREE.PlaneGeometry(BOARD_W, BOARD_D), boardMat);
    boardPlane.rotation.x = -Math.PI / 2;
    boardPlane.position.y = 0.002;
    boardPlane.receiveShadow = true;
    scene.add(boardPlane);

    const sharedMats = createSharedMaterials();
    const buildingMetas: Record<string, BuildingMeshMeta> = {};
    const pickTargets: THREE.Object3D[] = [];

    for (const b of MAPPED_BUILDINGS) {
      const meta = createBuildingMaquette(b, sharedMats);
      buildingMetas[b.id] = meta;
      scene.add(meta.group);
      pickTargets.push(meta.group);
    }

    let currentRouteHandle: Route3DHandle | null = null;
    const startTimeMs = performance.now();

    const baseRadius = isFullscreen ? FULLSCREEN_RADIUS : PREVIEW_RADIUS;
    let theta = INITIAL_THETA;
    let phi = INITIAL_PHI;
    let radius = baseRadius;
    let lookX = 0;
    let lookZ = 0;

    let targetTheta = INITIAL_THETA;
    let targetPhi = INITIAL_PHI;
    let targetRadius = baseRadius;
    let targetLookX = 0;
    let targetLookZ = 0;

    let forceRenderFrames = 2;
    let isDocumentVisible = typeof document !== "undefined" ? !document.hidden : true;
    let isInViewport = true;
    let rafId = 0;

    const projVec = new THREE.Vector3();

    const triggerRender = (frames = 2) => {
      forceRenderFrames = Math.max(forceRenderFrames, frames);
      if (rafId === 0 && isDocumentVisible && isInViewport) {
        rafId = requestAnimationFrame(animate);
      }
    };
    wakeLoopRef.current = () => triggerRender(2);

    const syncRoute3D = (route: CampusRoute | null) => {
      if (currentRouteHandle) {
        scene.remove(currentRouteHandle.group);
        currentRouteHandle.dispose();
        currentRouteHandle = null;
      }
      if (route && route.distanceMeters > 0) {
        const handle = createRoute3D(route);
        if (handle) {
          currentRouteHandle = handle;
          scene.add(handle.group);
          targetLookX = handle.midpoint[0] * 0.65;
          targetLookZ = handle.midpoint[1] * 0.65;
          targetRadius = Math.min(Math.max(targetRadius, 6.2), 9.6);
        }
      }
      triggerRender(3);
    };
    syncRoute3DRef.current = syncRoute3D;

    const texLoader = new THREE.TextureLoader();
    const mapTexture = texLoader.load(CAMPUS_MAP_CONFIG.arTargetSrc, () => {
      boardMat.map = mapTexture;
      boardMat.color.setHex(0xffffff);
      boardMat.needsUpdate = true;
      triggerRender(3);
    });
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    const applyTheme = (t: "dark" | "light") => {
      scene.background = null;
      if (t === "dark") {
        plinthMat.color.setHex(0x2a3238);
        hemiLight.intensity = 1.05;
        shadowMat.opacity = 0.3;
      } else {
        plinthMat.color.setHex(0xdcd7cb);
        hemiLight.intensity = 1.25;
        shadowMat.opacity = 0.12;
      }
      triggerRender(2);
    };
    sceneThemeSyncRef.current = applyTheme;
    applyTheme(themeRef.current);

    zoomDeltaRef.current = (delta: number) => {
      targetRadius = Math.min(Math.max(targetRadius + delta, 3.8), 13.0);
      triggerRender(2);
    };

    resetViewRef.current = () => {
      targetTheta = INITIAL_THETA;
      targetPhi = INITIAL_PHI;
      targetRadius = baseRadius;
      targetLookX = 0;
      targetLookZ = 0;
      setIsTopView(false);
      triggerRender(2);
    };

    toggleTopViewRef.current = () => {
      const nextTop = Math.abs(targetPhi - TOP_DOWN_PHI) > 0.1;
      targetPhi = nextTop ? TOP_DOWN_PHI : INITIAL_PHI;
      setIsTopView(nextTop);
      triggerRender(2);
    };

    focusBuildingRef.current = (id: string) => {
      const meta = buildingMetas[id];
      if (!meta) return;
      targetLookX = meta.baseX * 0.72;
      targetLookZ = meta.baseZ * 0.72;
      targetRadius = Math.min(targetRadius, 6.4);
      triggerRender(2);
    };

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const activePointers = new Map<number, { x: number; y: number }>();
    let pinchStartDist: number | null = null;
    let pinchStartRadius = baseRadius;
    let isDragging = false;
    let dragDist = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let hoveredId: string | null = null;

    const findBuildingUnderPointer = (clientX: number, clientY: number): CampusBuilding | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(pickTargets, true);
      if (hits.length === 0) return null;
      const bId = hits[0].object.userData.buildingId as string | undefined;
      return MAPPED_BUILDINGS.find((item) => item.id === bId) ?? null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      renderer.domElement.setPointerCapture(e.pointerId);

      if (activePointers.size === 2) {
        const [p1, p2] = Array.from(activePointers.values());
        pinchStartDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        pinchStartRadius = targetRadius;
        isDragging = false;
        dragDist = 999;
      } else if (activePointers.size === 1) {
        isDragging = true;
        dragDist = 0;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
      }
      triggerRender(2);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (activePointers.size >= 2 && pinchStartDist && pinchStartDist > 0) {
        const [p1, p2] = Array.from(activePointers.values());
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (dist > 0) {
          targetRadius = Math.min(Math.max(pinchStartRadius * (pinchStartDist / dist), 3.8), 13.0);
          triggerRender(2);
        }
        return;
      }

      if (isDragging) {
        const dx = e.clientX - lastClientX;
        const dy = e.clientY - lastClientY;
        dragDist += Math.hypot(dx, dy);
        targetTheta -= dx * 0.008;
        targetPhi = Math.min(Math.max(targetPhi - dy * 0.006, 0.32), 1.24);
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        triggerRender(2);
        return;
      }

      const found = findBuildingUnderPointer(e.clientX, e.clientY);
      const nextId = found?.id ?? null;
      if (nextId !== hoveredId) {
        hoveredId = nextId;
        setHoveredBuilding(found);
        renderer.domElement.style.cursor = found ? "pointer" : "grab";
        triggerRender(2);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }

      if (activePointers.size < 2) {
        pinchStartDist = null;
      }

      if (activePointers.size === 1) {
        const [remaining] = Array.from(activePointers.values());
        isDragging = true;
        lastClientX = remaining.x;
        lastClientY = remaining.y;
      } else {
        if (isDragging && dragDist < 6) {
          const clicked = findBuildingUnderPointer(e.clientX, e.clientY);
          if (clicked) onSelectRef.current(clicked);
        }
        isDragging = false;
      }
      triggerRender(2);
    };

    const handlePointerLeave = () => {
      if (!isDragging && activePointers.size === 0) {
        hoveredId = null;
        setHoveredBuilding(null);
        triggerRender(2);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 0.55 : -0.55;
      targetRadius = Math.min(Math.max(targetRadius + step, 3.8), 13.0);
      triggerRender(2);
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const nw = Math.max(container.clientWidth, 240);
      const nh = Math.max(container.clientHeight, 240);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      triggerRender(3);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isInViewport = entries[0]?.isIntersecting ?? true;
        if (isInViewport) triggerRender(2);
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) triggerRender(2);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function animate() {
      if (!isDocumentVisible || !isInViewport) {
        rafId = 0;
        return;
      }

      const shouldAutoRotate =
        autoRotateRef.current &&
        !isDragging &&
        !hoveredId &&
        !selectedIdRef.current &&
        !currentRouteHandle;
      if (shouldAutoRotate) {
        targetTheta += 0.0022;
      }

      const dTheta = targetTheta - theta;
      const dPhi = targetPhi - phi;
      const dRadius = targetRadius - radius;
      const dLookX = targetLookX - lookX;
      const dLookZ = targetLookZ - lookZ;

      theta += dTheta * 0.12;
      phi += dPhi * 0.12;
      radius += dRadius * 0.12;
      lookX += dLookX * 0.12;
      lookZ += dLookZ * 0.12;

      camera.position.set(
        lookX + radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        lookZ + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(lookX, 0.1, lookZ);
      camera.updateMatrixWorld();

      if (currentRouteHandle && !prefersReducedMotion) {
        currentRouteHandle.updatePulse((performance.now() - startTimeMs) / 1000);
      }

      const cw = container?.clientWidth ?? 0;
      const ch = container?.clientHeight ?? 0;
      let anyBuildingMoving = false;

      for (const b of MAPPED_BUILDINGS) {
        const meta = buildingMetas[b.id];
        const isMatched = !isFullscreen || matchesFilter3D(b, filterRef.current);
        const isSelected = selectedIdRef.current === b.id;
        const isHovered = hoveredId === b.id;
        const isHighlighted = isMatched && (isHovered || isSelected);

        const desiredY = isHighlighted ? 0.085 : 0;
        const desiredScaleY = isMatched ? 1.0 : 0.32;

        const dy = desiredY - meta.group.position.y;
        const ds = desiredScaleY - meta.group.scale.y;
        if (Math.abs(dy) > 0.0005 || Math.abs(ds) > 0.0005) {
          anyBuildingMoving = true;
        }
        meta.group.position.y += dy * 0.16;
        meta.group.scale.y += ds * 0.16;

        meta.highlightRing.visible = isHighlighted;
        if (isHighlighted) {
          meta.highlightRing.material = isSelected ? sharedMats.selectedRing : sharedMats.hoverRing;
        }

        const pinEl = pinRefs.current[b.id];
        if (pinEl && cw > 0 && ch > 0) {
          if (!isMatched) {
            pinEl.style.opacity = "0";
            pinEl.style.pointerEvents = "none";
            continue;
          }
          projVec.set(
            meta.group.position.x,
            meta.group.position.y + meta.pinAnchorY,
            meta.group.position.z
          );
          projVec.project(camera);

          if (projVec.z < 1) {
            const sx = (projVec.x * 0.5 + 0.5) * cw;
            const sy = (-projVec.y * 0.5 + 0.5) * ch;
            pinEl.style.opacity = "1";
            pinEl.style.pointerEvents = "auto";
            pinEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(
              1
            )}px, 0) translate(-50%, -100%)`;
          } else {
            pinEl.style.opacity = "0";
            pinEl.style.pointerEvents = "none";
          }
        }
      }

      renderer.render(scene, camera);

      if (forceRenderFrames > 0) {
        forceRenderFrames -= 1;
      }

      const cameraSettled =
        Math.abs(dTheta) < 0.0004 &&
        Math.abs(dPhi) < 0.0004 &&
        Math.abs(dRadius) < 0.0004 &&
        Math.abs(dLookX) < 0.0004 &&
        Math.abs(dLookZ) < 0.0004;

      const animateRouteBeads = Boolean(currentRouteHandle && !prefersReducedMotion);

      if (
        shouldAutoRotate ||
        isDragging ||
        anyBuildingMoving ||
        !cameraSettled ||
        animateRouteBeads ||
        forceRenderFrames > 0
      ) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = 0;
      }
    }

    syncRoute3D(activeRoute);
    triggerRender(3);

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("wheel", handleWheel);

      if (currentRouteHandle) {
        scene.remove(currentRouteHandle.group);
        currentRouteHandle.dispose();
        currentRouteHandle = null;
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      Object.values(sharedMats).forEach((item) => item.dispose());
      plinthMat.dispose();
      shadowMat.dispose();
      boardMat.dispose();
      mapTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const toggleAutoRotate = () => {
    const next = !isAutoRotating;
    autoRotateRef.current = next;
    setIsAutoRotating(next);
    wakeLoopRef.current();
  };

  if (webglError) {
    return (
      <div
        className={`relative w-full flex items-center justify-center ${
          isFullscreen
            ? "h-[100dvh] min-h-[100dvh] bg-unsil-linen dark:bg-unsil-obsidian pt-20 pb-8 px-4"
            : "h-[320px] sm:h-[360px] lg:h-[400px]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAMPUS_MAP_CONFIG.arTargetSrc}
          alt="Denah Masterplan Kampus 2 Universitas Siliwangi"
          width={CAMPUS_MAP_CONFIG.width}
          height={CAMPUS_MAP_CONFIG.height}
          className="h-full w-auto max-w-full object-contain rounded-lg shadow-md"
        />
        <p className="absolute bottom-4 inset-x-4 rounded-lg bg-white/95 dark:bg-unsil-pine/95 px-3 py-1.5 text-[11px] text-center text-unsil-ink dark:text-unsil-mist shadow-sm">
          Mode 3D memerlukan WebGL. Silakan beralih ke tampilan Denah 2D.
        </p>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="relative w-full h-[100dvh] min-h-[100dvh] max-w-[100vw] bg-unsil-linen dark:bg-unsil-obsidian overflow-hidden flex flex-col select-none pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-[4.25rem] transition-colors">
        {/* Zone 1: Dedicated Non-Overlapping Control Deck */}
        <div className="shrink-0 z-20 px-3 sm:px-6 pt-2 pb-1.5 max-w-6xl mx-auto w-full space-y-2">
          {/* Row 1: Faculty/Category Filter Chips */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
            role="group"
            aria-label="Filter fakultas dan kategori maket 3D"
          >
            {FILTERS_3D.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`min-h-[36px] shrink-0 whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian border-transparent shadow-sm"
                      : "bg-white dark:bg-unsil-pine border-unsil-hairline dark:border-unsil-pineBorder text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist"
                  }`}
                  aria-pressed={isActive}
                >
                  {f.dotColor && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/80 shrink-0"
                      style={{ backgroundColor: f.dotColor }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Wayfinding Trigger (Left) + Compact 3D Camera Controls (Right) */}
          <div className="flex items-center justify-between gap-2">
            {onChangeRouteFrom &&
            onChangeRouteTo &&
            onChangeTravelMode &&
            onSwapRoute &&
            onClearRoute &&
            onToggleWayfinding ? (
              <WayfindingPanel
                isOpen={wayfindingOpen}
                onToggleOpen={onToggleWayfinding}
                travelMode={travelMode}
                onChangeTravelMode={onChangeTravelMode}
                fromId={routeFromId}
                toId={routeToId}
                onChangeFrom={onChangeRouteFrom}
                onChangeTo={onChangeRouteTo}
                onSwap={onSwapRoute}
                onClear={onClearRoute}
                route={activeRoute}
              />
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => toggleTopViewRef.current()}
                className="min-h-[38px] min-w-[36px] px-2 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-paper dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm text-unsil-ink dark:text-unsil-mist flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                title="Ganti sudut pandang kamera antara Isometrik dan Tampak Atas"
                aria-pressed={isTopView}
              >
                <Eye className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{isTopView ? "Isometrik" : "Tampak Atas"}</span>
              </button>

              <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm">
                <button
                  type="button"
                  onClick={toggleAutoRotate}
                  className="w-7 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                  title={isAutoRotating ? "Jeda putaran 3D" : "Putar 3D otomatis"}
                  aria-label={isAutoRotating ? "Jeda putaran otomatis 3D" : "Mulai putaran otomatis 3D"}
                  aria-pressed={isAutoRotating}
                >
                  {isAutoRotating ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => zoomDeltaRef.current(0.9)}
                  className="w-7 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                  title="Perkecil 3D"
                  aria-label="Perkecil tampilan 3D"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomDeltaRef.current(-0.9)}
                  className="w-7 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                  title="Perbesar 3D"
                  aria-label="Perbesar tampilan 3D"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => resetViewRef.current()}
                  className="w-7 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
                  title="Reset sudut dan fokus 3D"
                  aria-label="Reset sudut dan fokus kamera 3D"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Unobstructed Center WebGL Viewport */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden touch-none">
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          {/* Accessible Projected Pin Overlays */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {MAPPED_BUILDINGS.map((b) => {
              const isSelected = selectedBuildingId === b.id;
              const isHovered = hoveredBuilding?.id === b.id;
              const isRouteEndpoint =
                Boolean(activeRoute && activeRoute.distanceMeters > 0) &&
                (b.id === routeFromId || b.id === routeToId);

              return (
                <button
                  key={b.id}
                  type="button"
                  ref={(el) => {
                    pinRefs.current[b.id] = el;
                  }}
                  onClick={() => onSelectBuilding(b)}
                  style={{ left: 0, top: 0 }}
                  className="pointer-events-auto absolute min-w-[28px] min-h-[28px] flex items-center justify-center group"
                  aria-label={`Pilih bangunan 3D ${b.name}`}
                  title={b.name}
                >
                  <span
                    style={!isSelected && !isHovered && !isRouteEndpoint ? { backgroundColor: b.color } : undefined}
                    className={`px-1 py-0.5 rounded-full font-mono text-[9px] font-bold border-[1.5px] shadow-sm transition-transform ${
                      isSelected || isHovered || isRouteEndpoint
                        ? "bg-[#F59E0B] text-[#14201C] border-white scale-110"
                        : "text-white border-white group-hover:scale-110"
                    }`}
                  >
                    {b.code}
                  </span>
                </button>
              );
            })}
          </div>

          {hoveredBuilding && !wayfindingOpen && (
            <div className="pointer-events-none absolute bottom-3 left-3 sm:left-6 z-20 max-w-[240px] rounded-lg bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder px-2.5 py-1.5 shadow-sm">
              <p className="text-[10px] font-semibold" style={{ color: hoveredBuilding.color }}>
                {hoveredBuilding.categoryLabel}
              </p>
              <p className="text-xs font-bold text-unsil-ink dark:text-unsil-mist truncate">
                {hoveredBuilding.name}
              </p>
            </div>
          )}
        </div>

        {/* Zone 3: Dedicated Bottom Quick-Select Building Dock */}
        <div className="shrink-0 z-20 px-2.5 sm:px-6 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:pb-3.5 w-full flex justify-center">
          <div className="max-w-full overflow-x-auto p-1.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex items-center gap-1.5 no-scrollbar">
            <div className="flex items-center gap-1 px-2 text-[11px] font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-blue-400" aria-hidden="true" />
              <span className="hidden sm:inline">Fokus Gedung:</span>
            </div>

            {MAPPED_BUILDINGS.map((b) => {
              const isSelected = selectedBuildingId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBuilding(b)}
                  style={isSelected ? { backgroundColor: b.color } : undefined}
                  className={`min-h-[40px] sm:min-h-[42px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    isSelected
                      ? "text-white shadow-sm ring-2 ring-amber-400"
                      : "bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist"
                  }`}
                  aria-label={`Fokus ke gedung ${b.name}`}
                >
                  <span
                    style={!isSelected ? { backgroundColor: b.color } : undefined}
                    className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-semibold text-white shrink-0 ${
                      isSelected ? "bg-black/30" : ""
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
      </div>
    );
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[400px] overflow-hidden select-none touch-none">
      {/* Three.js WebGL Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Accessible Projected Pin Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {MAPPED_BUILDINGS.map((b) => {
          const isSelected = selectedBuildingId === b.id;
          const isHovered = hoveredBuilding?.id === b.id;

          return (
            <button
              key={b.id}
              type="button"
              ref={(el) => {
                pinRefs.current[b.id] = el;
              }}
              onClick={() => onSelectBuilding(b)}
              style={{ left: 0, top: 0 }}
              className="pointer-events-auto absolute min-w-[28px] min-h-[28px] flex items-center justify-center group"
              aria-label={`Pilih bangunan 3D ${b.name}`}
              title={b.name}
            >
              <span
                style={!isSelected && !isHovered ? { backgroundColor: b.color } : undefined}
                className={`px-1 py-0.5 rounded-full font-mono text-[9px] font-bold border-[1.5px] shadow-sm transition-transform ${
                  isSelected || isHovered
                    ? "bg-[#F59E0B] text-[#14201C] border-white scale-110"
                    : "text-white border-white group-hover:scale-110"
                }`}
              >
                {b.code}
              </span>
            </button>
          );
        })}
      </div>

      {hoveredBuilding && (
        <div className="pointer-events-none absolute top-2 left-2 z-20 max-w-[220px] rounded-lg bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder px-2.5 py-1.5 shadow-sm">
          <p className="text-[10px] font-semibold" style={{ color: hoveredBuilding.color }}>
            {hoveredBuilding.categoryLabel}
          </p>
          <p className="text-xs font-bold text-unsil-ink dark:text-unsil-mist truncate">
            {hoveredBuilding.name}
          </p>
        </div>
      )}

      {/* Compact Preview Controls */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 sm:gap-0.5 bg-white/85 dark:bg-unsil-pine/85 backdrop-blur-sm border border-unsil-hairline/75 dark:border-unsil-pineBorder/75 rounded-lg p-0.5 shadow-sm">
        <button
          type="button"
          onClick={toggleAutoRotate}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-md hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
          title={isAutoRotating ? "Jeda putaran 3D" : "Putar 3D otomatis"}
          aria-label={isAutoRotating ? "Jeda putaran otomatis 3D" : "Mulai putaran otomatis 3D"}
          aria-pressed={isAutoRotating}
        >
          {isAutoRotating ? (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => zoomDeltaRef.current(-0.85)}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-md hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
          title="Perbesar 3D"
          aria-label="Perbesar tampilan 3D"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomDeltaRef.current(0.85)}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-md hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
          title="Perkecil 3D"
          aria-label="Perkecil tampilan 3D"
        >
          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => resetViewRef.current()}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-md hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
          title="Reset sudut kamera 3D"
          aria-label="Reset sudut kamera 3D"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
