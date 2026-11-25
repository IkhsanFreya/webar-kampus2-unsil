"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plus, Minus, RotateCcw, Pause, Play } from "lucide-react";
import { MAPPED_BUILDINGS, CampusBuilding, MappedCampusBuilding } from "@/data/campusBuildings";
import { useTheme } from "@/context/ThemeContext";

interface Campus3DPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuildingId?: string | null;
}

interface BuildingMeshMeta {
  group: THREE.Group;
  pinAnchorY: number;
  materials: THREE.MeshStandardMaterial[];
}

const BOARD_W = 5.0;
const BOARD_D = 6.206; // Matches 825:1024 denah aspect ratio
const INITIAL_THETA = 0.52;
const INITIAL_PHI = 0.95;
const INITIAL_RADIUS = 9.4;

function percentToBoardXZ(xPercent: number, yPercent: number): [number, number] {
  return [
    (xPercent / 100 - 0.5) * BOARD_W,
    (yPercent / 100 - 0.5) * BOARD_D,
  ];
}

function createBuildingMaquette(building: MappedCampusBuilding): BuildingMeshMeta {
  const group = new THREE.Group();
  const [x, z] = percentToBoardXZ(
    building.mapCoord.xPercent,
    building.mapCoord.yPercent
  );
  group.position.set(x, 0, z);
  group.userData.buildingId = building.id;

  const materials: THREE.MeshStandardMaterial[] = [];

  const registerMat = (params: THREE.MeshStandardMaterialParameters) => {
    const mat = new THREE.MeshStandardMaterial(params);
    materials.push(mat);
    return mat;
  };

  const addMesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    px: number,
    py: number,
    pz: number,
    ry = 0
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(px, py, pz);
    if (ry !== 0) mesh.rotation.y = ry;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.buildingId = building.id;
    group.add(mesh);
    return mesh;
  };

  const stoneMat = registerMat({ color: 0xf4f1ea, roughness: 0.72, metalness: 0.05 });
  const darkTrimMat = registerMat({ color: 0x263238, roughness: 0.5, metalness: 0.15 });
  const emeraldMat = registerMat({ color: 0x065f46, roughness: 0.55, metalness: 0.1 });
  const emeraldBrightMat = registerMat({ color: 0x10b981, roughness: 0.45, metalness: 0.12 });
  const amberMat = registerMat({ color: 0xd97706, roughness: 0.42, metalness: 0.18 });
  const glassMat = registerMat({
    color: 0x6ee7b7,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.76,
  });

  // Base pad on map
  addMesh(new THREE.BoxGeometry(0.48, 0.03, 0.48), darkTrimMat, 0, 0.015, 0);

  let pinAnchorY = 0.55;

  switch (building.id) {
    case "unsil-01": {
      // Gerbang Selatan: Twin pillars + angled gate canopy + guard post
      addMesh(new THREE.BoxGeometry(0.11, 0.28, 0.11), stoneMat, -0.17, 0.17, 0);
      addMesh(new THREE.BoxGeometry(0.11, 0.28, 0.11), stoneMat, 0.17, 0.17, 0);
      addMesh(new THREE.BoxGeometry(0.56, 0.06, 0.22), amberMat, 0, 0.34, 0);
      addMesh(new THREE.BoxGeometry(0.46, 0.03, 0.16), emeraldMat, 0, 0.385, 0);
      addMesh(new THREE.BoxGeometry(0.14, 0.14, 0.16), stoneMat, 0.19, 0.1, 0.14);
      pinAnchorY = 0.54;
      break;
    }

    case "unsil-02": {
      // Masjid Letjen. Mashudi: Hexagonal sanctuary + emerald dome + finial + minaret
      addMesh(new THREE.CylinderGeometry(0.27, 0.29, 0.2, 6), stoneMat, 0, 0.13, 0);
      addMesh(new THREE.CylinderGeometry(0.22, 0.25, 0.04, 8), darkTrimMat, 0, 0.25, 0);
      addMesh(
        new THREE.SphereGeometry(0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        emeraldMat,
        0,
        0.27,
        0
      );
      addMesh(new THREE.ConeGeometry(0.025, 0.09, 8), amberMat, 0, 0.5, 0);
      // Corner minaret
      addMesh(new THREE.CylinderGeometry(0.038, 0.048, 0.46, 8), stoneMat, -0.23, 0.26, -0.18);
      addMesh(new THREE.ConeGeometry(0.048, 0.1, 8), amberMat, -0.23, 0.54, -0.18);
      pinAnchorY = 0.68;
      break;
    }

    case "unsil-03": {
      // Gedung FP Lab. Biometrik: Main lab building + glass greenhouse bays
      addMesh(new THREE.BoxGeometry(0.4, 0.22, 0.26), stoneMat, 0, 0.14, 0.04);
      addMesh(new THREE.BoxGeometry(0.43, 0.045, 0.29), emeraldMat, 0, 0.27, 0.04);
      addMesh(new THREE.BoxGeometry(0.32, 0.06, 0.16), emeraldBrightMat, 0, 0.32, 0.04);
      // Adjacent research greenhouses
      addMesh(new THREE.BoxGeometry(0.16, 0.13, 0.14), glassMat, -0.11, 0.095, -0.19);
      addMesh(new THREE.BoxGeometry(0.16, 0.13, 0.14), glassMat, 0.11, 0.095, -0.19);
      pinAnchorY = 0.52;
      break;
    }

    case "unsil-04": {
      // Gedung FT Labtek 2: Multi-story twin wing with amber fascia
      addMesh(new THREE.BoxGeometry(0.5, 0.34, 0.24), stoneMat, 0, 0.2, 0, 0.28);
      addMesh(new THREE.BoxGeometry(0.46, 0.06, 0.25), darkTrimMat, 0, 0.22, 0, 0.28);
      addMesh(new THREE.BoxGeometry(0.53, 0.05, 0.27), amberMat, 0, 0.39, 0, 0.28);
      addMesh(new THREE.BoxGeometry(0.22, 0.08, 0.14), darkTrimMat, 0.05, 0.45, -0.02, 0.28);
      pinAnchorY = 0.62;
      break;
    }

    case "unsil-05": {
      // Gedung FT Labtek 3: L-shaped engineering lab complex + skylight ribs
      addMesh(new THREE.BoxGeometry(0.48, 0.3, 0.22), stoneMat, -0.02, 0.18, 0, 0.28);
      addMesh(new THREE.BoxGeometry(0.2, 0.24, 0.36), stoneMat, 0.13, 0.15, 0.06, 0.28);
      addMesh(new THREE.BoxGeometry(0.51, 0.045, 0.25), emeraldMat, -0.02, 0.35, 0, 0.28);
      addMesh(new THREE.BoxGeometry(0.32, 0.05, 0.1), emeraldBrightMat, -0.02, 0.4, 0, 0.28);
      pinAnchorY = 0.58;
      break;
    }

    case "unsil-06":
    default: {
      // Gerbang Utara: Motorcycle portal arch + covered shelter
      addMesh(new THREE.BoxGeometry(0.08, 0.24, 0.08), darkTrimMat, -0.16, 0.15, 0);
      addMesh(new THREE.BoxGeometry(0.08, 0.24, 0.08), darkTrimMat, 0.16, 0.15, 0);
      addMesh(new THREE.BoxGeometry(0.48, 0.055, 0.2), amberMat, 0, 0.29, 0);
      addMesh(new THREE.BoxGeometry(0.28, 0.04, 0.22), emeraldMat, -0.06, 0.19, 0.2);
      pinAnchorY = 0.48;
      break;
    }
  }

  return { group, pinAnchorY, materials };
}

export const Campus3DPreview: React.FC<Campus3DPreviewProps> = ({
  onSelectBuilding,
  selectedBuildingId,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onSelectRef = useRef(onSelectBuilding);
  const selectedIdRef = useRef(selectedBuildingId);
  const themeRef = useRef<"dark" | "light">("light");
  const autoRotateRef = useRef<boolean>(true);
  const zoomDeltaRef = useRef<(delta: number) => void>(() => {});
  const resetViewRef = useRef<() => void>(() => {});
  const sceneThemeSyncRef = useRef<(t: "dark" | "light") => void>(() => {});

  const { theme } = useTheme();
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [webglError, setWebglError] = useState<boolean>(false);

  useEffect(() => {
    onSelectRef.current = onSelectBuilding;
  }, [onSelectBuilding]);

  useEffect(() => {
    selectedIdRef.current = selectedBuildingId;
  }, [selectedBuildingId]);

  useEffect(() => {
    themeRef.current = theme;
    sceneThemeSyncRef.current(theme);
  }, [theme]);

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

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 260);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);

    // Studio lighting
    const hemiLight = new THREE.HemisphereLight(0xfdfbf6, 0x3b444b, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
    sunLight.position.set(4.5, 8.5, 5.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
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

    // Architectural Map Plinth + Textured Surface
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

    // Transparent shadow catcher so the floating maquette casts a grounded shadow onto the page
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
    const boardPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_W, BOARD_D),
      boardMat
    );
    boardPlane.rotation.x = -Math.PI / 2;
    boardPlane.position.y = 0.002;
    boardPlane.receiveShadow = true;
    scene.add(boardPlane);

    const texLoader = new THREE.TextureLoader();
    const mapTexture = texLoader.load("/targets/denah-kampus2.jpg", () => {
      boardMat.map = mapTexture;
      boardMat.color.setHex(0xffffff);
      boardMat.needsUpdate = true;
    });
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    // 6 Campus 3D Maquette Models
    const buildingMetas: Record<string, BuildingMeshMeta> = {};
    const pickTargets: THREE.Object3D[] = [];

    for (const b of MAPPED_BUILDINGS) {
      const meta = createBuildingMaquette(b);
      buildingMetas[b.id] = meta;
      scene.add(meta.group);
      pickTargets.push(meta.group);
    }

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
    };
    sceneThemeSyncRef.current = applyTheme;
    applyTheme(themeRef.current);

    // Damped Spherical Orbit Camera State
    let theta = INITIAL_THETA;
    let phi = INITIAL_PHI;
    let radius = INITIAL_RADIUS;
    let targetTheta = INITIAL_THETA;
    let targetPhi = INITIAL_PHI;
    let targetRadius = INITIAL_RADIUS;

    zoomDeltaRef.current = (delta: number) => {
      targetRadius = Math.min(Math.max(targetRadius + delta, 4.2), 12.0);
    };
    resetViewRef.current = () => {
      targetTheta = INITIAL_THETA;
      targetPhi = INITIAL_PHI;
      targetRadius = INITIAL_RADIUS;
    };

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
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
      isDragging = true;
      dragDist = 0;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastClientX;
        const dy = e.clientY - lastClientY;
        dragDist += Math.hypot(dx, dy);
        targetTheta -= dx * 0.008;
        targetPhi = Math.min(Math.max(targetPhi - dy * 0.006, 0.38), 1.24);
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        return;
      }

      const found = findBuildingUnderPointer(e.clientX, e.clientY);
      const nextId = found?.id ?? null;
      if (nextId !== hoveredId) {
        hoveredId = nextId;
        setHoveredBuilding(found);
        renderer.domElement.style.cursor = found ? "pointer" : "grab";
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
      if (dragDist < 6) {
        const clicked = findBuildingUnderPointer(e.clientX, e.clientY);
        if (clicked) {
          onSelectRef.current(clicked);
        }
      }
    };

    const handlePointerLeave = () => {
      if (!isDragging) {
        hoveredId = null;
        setHoveredBuilding(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 0.55 : -0.55;
      targetRadius = Math.min(Math.max(targetRadius + step, 4.2), 12.0);
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
    });
    resizeObserver.observe(container);

    const projVec = new THREE.Vector3();
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDragging && !hoveredId && !selectedIdRef.current) {
        targetTheta += 0.0022;
      }

      theta += (targetTheta - theta) * 0.1;
      phi += (targetPhi - phi) * 0.1;
      radius += (targetRadius - radius) * 0.1;

      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0.1, 0);
      camera.updateMatrixWorld();

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      for (const b of MAPPED_BUILDINGS) {
        const meta = buildingMetas[b.id];
        const isHighlighted = hoveredId === b.id || selectedIdRef.current === b.id;
        const desiredY = isHighlighted ? 0.085 : 0;
        meta.group.position.y += (desiredY - meta.group.position.y) * 0.15;

        const targetEmissive = isHighlighted ? 0.25 : 0;
        for (const mat of meta.materials) {
          if (isHighlighted) {
            mat.emissive.setHex(b.id === selectedIdRef.current ? 0xd97706 : 0x059669);
          }
          mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.15;
        }

        const pinEl = pinRefs.current[b.id];
        if (pinEl && cw > 0 && ch > 0) {
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
            pinEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(
              1
            )}px, 0) translate(-50%, -100%)`;
          } else {
            pinEl.style.opacity = "0";
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("wheel", handleWheel);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      mapTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const toggleAutoRotate = () => {
    const next = !isAutoRotating;
    autoRotateRef.current = next;
    setIsAutoRotating(next);
  };

  if (webglError) {
    return (
      <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[360px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/targets/denah-kampus2.jpg"
          alt="Denah Masterplan Kampus 2 Universitas Siliwangi"
          width={825}
          height={1024}
          className="h-full w-auto max-w-full object-contain rounded-lg shadow-md"
        />
        <p className="absolute bottom-2 inset-x-2 rounded-lg bg-white/95 dark:bg-unsil-pine/95 px-3 py-1.5 text-[11px] text-center text-unsil-ink dark:text-unsil-mist shadow-sm">
          Mode 3D memerlukan WebGL. Gunakan pin denah atau beralih ke tampilan Denah 2D.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[360px] overflow-hidden select-none touch-none">
      {/* Three.js WebGL Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Accessible Projected Pin Overlays (Keyboard Tab + Touch Friendly) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
              className="pointer-events-auto absolute min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center group"
              aria-label={`Pilih bangunan 3D ${b.name}`}
              title={b.name}
            >
              <span
                className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold border-2 shadow-sm transition-transform ${
                  isSelected || isHovered
                    ? "bg-[#F59E0B] text-[#14201C] border-white scale-110"
                    : "bg-[#065F46] dark:bg-unsil-obsidian text-white border-white dark:border-emerald-400 group-hover:scale-110"
                }`}
              >
                {b.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hovered Building Name Badge */}
      {hoveredBuilding && (
        <div className="pointer-events-none absolute top-2 left-2 max-w-[230px] rounded-lg bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder px-2.5 py-1.5 shadow-sm">
          <p className="text-[10px] font-semibold text-[#065F46] dark:text-emerald-400">
            {hoveredBuilding.categoryLabel}
          </p>
          <p className="text-xs font-bold text-unsil-ink dark:text-unsil-mist truncate">
            {hoveredBuilding.name}
          </p>
        </div>
      )}

      {/* Minimalist Camera & Auto-Rotate Controls (R-19 & R-39 compliant) */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 sm:gap-0.5 bg-white/80 dark:bg-unsil-pine/80 backdrop-blur-sm border border-unsil-hairline/75 dark:border-unsil-pineBorder/75 rounded-lg p-0.5 shadow-sm">
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
