"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Plus, Minus, RotateCcw, Pause, Play, Eye, MapPin } from "lucide-react";
import {
  MAPPED_BUILDINGS,
  CAMPUS_MAP_CONFIG,
  CampusBuilding,
  MappedCampusBuilding,
} from "@/data/campusBuildings";
import { useTheme } from "@/context/ThemeContext";

interface Campus3DPreviewProps {
  onSelectBuilding: (building: CampusBuilding) => void;
  selectedBuildingId?: string | null;
  mode?: "preview" | "fullscreen";
}

type Filter3D = "all" | "ft" | "faperta" | "facility" | "worship" | "gate";

const FILTERS_3D: Array<{ id: Filter3D; label: string; dotColor?: string }> = [
  { id: "all", label: "Semua" },
  { id: "ft", label: "F. Teknik", dotColor: "#1d4ed8" },
  { id: "faperta", label: "F. Pertanian", dotColor: "#15803d" },
  { id: "facility", label: "Fasilitas" },
  { id: "worship", label: "Ibadah" },
  { id: "gate", label: "Akses" },
];

interface MaterialPool {
  stone: THREE.MeshStandardMaterial;
  cream: THREE.MeshStandardMaterial;
  darkTrim: THREE.MeshStandardMaterial;
  slateStone: THREE.MeshStandardMaterial;
  charcoalRoof: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  techBlue: THREE.MeshStandardMaterial;
  techBlueBright: THREE.MeshStandardMaterial;
  techGlass: THREE.MeshStandardMaterial;
  agriGreen: THREE.MeshStandardMaterial;
  agriGreenBright: THREE.MeshStandardMaterial;
  agriGlass: THREE.MeshStandardMaterial;
  worshipTeal: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
  darkGlass: THREE.MeshStandardMaterial;
  redFlag: THREE.MeshStandardMaterial;
  hoverRing: THREE.MeshBasicMaterial;
  selectedRing: THREE.MeshBasicMaterial;
  ringGeometry: THREE.RingGeometry;
}

interface BuildingMeshMeta {
  group: THREE.Group;
  highlightRing: THREE.Mesh;
  pinAnchorY: number;
  baseX: number;
  baseZ: number;
}

const BOARD_W = 5.0;
const BOARD_D = BOARD_W * CAMPUS_MAP_CONFIG.aspectRatio;
const INITIAL_THETA = 0.52;
const INITIAL_PHI = 0.95;
const TOP_DOWN_PHI = 0.34;
const PREVIEW_RADIUS = 10.2;
const FULLSCREEN_RADIUS = 9.2;

function matchesFilter3D(b: MappedCampusBuilding, filter: Filter3D): boolean {
  switch (filter) {
    case "ft":
      return b.faculty.includes("Teknik");
    case "faperta":
      return b.faculty.includes("Pertanian");
    case "facility":
      return b.category === "facility";
    case "worship":
      return b.category === "worship";
    case "gate":
      return b.category === "gate";
    case "all":
    default:
      return true;
  }
}

function percentToBoardXZ(xPercent: number, yPercent: number): [number, number] {
  return [(xPercent / 100 - 0.5) * BOARD_W, (yPercent / 100 - 0.5) * BOARD_D];
}

function createSharedMaterials(): MaterialPool {
  return {
    stone: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.72, metalness: 0.05 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xeadfce, roughness: 0.7, metalness: 0.04 }),
    darkTrim: new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.5, metalness: 0.15 }),
    slateStone: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.68, metalness: 0.08 }),
    charcoalRoof: new THREE.MeshStandardMaterial({ color: 0x1e242b, roughness: 0.52, metalness: 0.14 }),
    terracotta: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.62, metalness: 0.06 }),
    techBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.48, metalness: 0.12 }),
    techBlueBright: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.42, metalness: 0.14 }),
    techGlass: new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.22,
      metalness: 0.12,
      transparent: true,
      opacity: 0.82,
    }),
    agriGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5, metalness: 0.1 }),
    agriGreenBright: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.44, metalness: 0.12 }),
    agriGlass: new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.24,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
    }),
    worshipTeal: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.52, metalness: 0.1 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.42, metalness: 0.18 }),
    darkGlass: new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.2,
      metalness: 0.25,
      transparent: true,
      opacity: 0.86,
    }),
    redFlag: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6, metalness: 0.05 }),
    hoverRing: new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }),
    selectedRing: new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
    ringGeometry: new THREE.RingGeometry(0.18, 0.245, 24),
  };
}

function createBuildingMaquette(
  building: MappedCampusBuilding,
  mats: MaterialPool
): BuildingMeshMeta {
  const group = new THREE.Group();
  const [baseX, baseZ] = percentToBoardXZ(building.mapCoord.xPercent, building.mapCoord.yPercent);
  group.position.set(baseX, 0, baseZ);
  group.userData.buildingId = building.id;

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

  const highlightRing = new THREE.Mesh(mats.ringGeometry, mats.hoverRing);
  highlightRing.rotation.x = -Math.PI / 2;
  highlightRing.position.y = 0.024;
  highlightRing.visible = false;
  highlightRing.userData.buildingId = building.id;
  group.add(highlightRing);

  const isCompactCluster = [
    "unsil-06",
    "unsil-07",
    "unsil-08",
    "unsil-09",
    "unsil-10",
    "unsil-11",
    "unsil-12",
  ].includes(building.id);

  if (building.id === "unsil-01") {
    addMesh(new THREE.BoxGeometry(0.22, 0.02, 0.14), mats.darkTrim, 0.05, 0.01, 0);
  } else if (building.id === "unsil-02") {
    addMesh(new THREE.BoxGeometry(0.56, 0.025, 0.34), mats.darkTrim, 0, 0.0125, 0, -0.22);
  } else if (building.id === "unsil-04") {
    addMesh(new THREE.BoxGeometry(0.28, 0.025, 0.28), mats.darkTrim, 0, 0.0125, 0);
  } else {
    addMesh(
      new THREE.BoxGeometry(isCompactCluster ? 0.22 : 0.34, 0.025, isCompactCluster ? 0.31 : 0.34),
      mats.darkTrim,
      0,
      0.0125,
      0,
      isCompactCluster ? -0.44 : 0
    );
  }

  let pinAnchorY = 0.48;

  switch (building.id) {
    case "unsil-01": {
      addMesh(new THREE.BoxGeometry(0.045, 0.16, 0.045), mats.terracotta, -0.04, 0.1, 0);
      addMesh(new THREE.BoxGeometry(0.052, 0.02, 0.052), mats.stone, -0.04, 0.19, 0);
      addMesh(new THREE.BoxGeometry(0.045, 0.16, 0.045), mats.terracotta, 0.13, 0.1, 0);
      addMesh(new THREE.BoxGeometry(0.052, 0.02, 0.052), mats.stone, 0.13, 0.19, 0);
      addMesh(new THREE.BoxGeometry(0.22, 0.03, 0.05), mats.amber, 0.045, 0.215, 0);
      addMesh(new THREE.BoxGeometry(0.07, 0.08, 0.08), mats.stone, 0.15, 0.06, 0.04);
      addMesh(new THREE.BoxGeometry(0.085, 0.02, 0.095), mats.agriGreen, 0.15, 0.11, 0.04);
      pinAnchorY = 0.38;
      break;
    }

    case "unsil-02": {
      const ry = -0.22;
      addMesh(new THREE.BoxGeometry(0.42, 0.2, 0.19), mats.cream, 0, 0.125, 0, ry);
      addMesh(new THREE.BoxGeometry(0.43, 0.02, 0.2), mats.terracotta, 0, 0.13, 0, ry);
      addMesh(new THREE.BoxGeometry(0.075, 0.23, 0.21), mats.slateStone, -0.23, 0.14, 0, ry);
      addMesh(new THREE.BoxGeometry(0.075, 0.23, 0.21), mats.slateStone, 0.23, 0.14, 0, ry);
      addMesh(new THREE.BoxGeometry(0.14, 0.16, 0.03), mats.darkGlass, 0, 0.12, 0.09, ry);
      addMesh(new THREE.BoxGeometry(0.16, 0.022, 0.08), mats.stone, 0, 0.08, 0.13, ry);
      addMesh(new THREE.BoxGeometry(0.14, 0.018, 0.02), mats.amber, 0.06, 0.055, 0.11, ry);
      addMesh(new THREE.BoxGeometry(0.48, 0.045, 0.24), mats.charcoalRoof, 0, 0.25, 0, ry);
      const ridgeGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.41, 3);
      ridgeGeo.rotateY(Math.PI / 2);
      ridgeGeo.rotateZ(Math.PI / 2);
      ridgeGeo.scale(1, 1.15, 1.05);
      addMesh(ridgeGeo, mats.charcoalRoof, 0, 0.32, -0.005, ry);
      addMesh(new THREE.CylinderGeometry(0.007, 0.009, 0.34, 8), mats.stone, -0.09, 0.19, 0.19);
      addMesh(new THREE.BoxGeometry(0.045, 0.018, 0.006), mats.redFlag, -0.065, 0.34, 0.19);
      addMesh(new THREE.BoxGeometry(0.045, 0.018, 0.006), mats.stone, -0.065, 0.322, 0.19);
      pinAnchorY = 0.56;
      break;
    }

    case "unsil-03": {
      addMesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), mats.darkTrim, -0.11, 0.12, 0);
      addMesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), mats.darkTrim, 0.11, 0.12, 0);
      addMesh(new THREE.BoxGeometry(0.34, 0.045, 0.14), mats.amber, 0, 0.24, 0);
      addMesh(new THREE.BoxGeometry(0.18, 0.03, 0.13), mats.slateStone, -0.04, 0.15, 0.12);
      pinAnchorY = 0.4;
      break;
    }

    case "unsil-04": {
      addMesh(new THREE.CylinderGeometry(0.155, 0.17, 0.15, 6), mats.stone, 0, 0.1, 0);
      addMesh(new THREE.CylinderGeometry(0.13, 0.145, 0.03, 8), mats.darkTrim, 0, 0.19, 0);
      addMesh(
        new THREE.SphereGeometry(0.115, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        mats.worshipTeal,
        0,
        0.205,
        0
      );
      addMesh(new THREE.ConeGeometry(0.018, 0.065, 8), mats.amber, 0, 0.35, 0);
      addMesh(new THREE.CylinderGeometry(0.025, 0.033, 0.32, 8), mats.stone, -0.13, 0.185, -0.11);
      addMesh(new THREE.ConeGeometry(0.033, 0.07, 8), mats.amber, -0.13, 0.38, -0.11);
      pinAnchorY = 0.48;
      break;
    }

    case "unsil-05": {
      addMesh(new THREE.BoxGeometry(0.2, 0.38, 0.25), mats.stone, 0, 0.21, 0, -0.18);
      addMesh(new THREE.BoxGeometry(0.21, 0.026, 0.26), mats.darkTrim, 0, 0.17, 0, -0.18);
      addMesh(new THREE.BoxGeometry(0.21, 0.026, 0.26), mats.darkTrim, 0, 0.28, 0, -0.18);
      addMesh(new THREE.BoxGeometry(0.23, 0.038, 0.28), mats.slateStone, 0, 0.415, 0, -0.18);
      pinAnchorY = 0.56;
      break;
    }

    case "unsil-06":
    case "unsil-07":
    case "unsil-08": {
      addMesh(new THREE.BoxGeometry(0.14, 0.25, 0.27), mats.stone, 0, 0.145, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.15, 0.035, 0.28), mats.techGlass, 0, 0.16, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.165, 0.042, 0.295), mats.techBlue, 0, 0.29, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.08, 0.045, 0.17), mats.techBlueBright, 0, 0.332, 0, -0.44);
      pinAnchorY = 0.46;
      break;
    }

    case "unsil-09":
    case "unsil-10":
    case "unsil-11": {
      addMesh(new THREE.BoxGeometry(0.14, 0.27, 0.27), mats.stone, 0, 0.155, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.15, 0.032, 0.28), mats.darkTrim, 0, 0.175, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.165, 0.042, 0.295), mats.techBlue, 0, 0.31, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.095, 0.055, 0.18), mats.techBlueBright, 0, 0.355, 0, -0.44);
      pinAnchorY = 0.48;
      break;
    }

    case "unsil-12": {
      addMesh(new THREE.BoxGeometry(0.14, 0.19, 0.25), mats.stone, 0, 0.115, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.16, 0.038, 0.27), mats.techBlue, 0, 0.228, 0, -0.44);
      addMesh(new THREE.BoxGeometry(0.09, 0.03, 0.14), mats.techBlueBright, 0, 0.26, 0, -0.44);
      pinAnchorY = 0.38;
      break;
    }

    case "unsil-13":
    case "unsil-16": {
      addMesh(new THREE.BoxGeometry(0.17, 0.21, 0.3), mats.stone, 0, 0.125, 0, -0.22);
      addMesh(new THREE.BoxGeometry(0.19, 0.042, 0.32), mats.agriGreen, 0, 0.25, 0, -0.22);
      addMesh(new THREE.BoxGeometry(0.095, 0.042, 0.19), mats.agriGreenBright, 0, 0.292, 0, -0.22);
      pinAnchorY = 0.42;
      break;
    }

    case "unsil-14": {
      addMesh(new THREE.BoxGeometry(0.17, 0.19, 0.3), mats.stone, 0, 0.115, 0, -0.22);
      addMesh(new THREE.BoxGeometry(0.19, 0.042, 0.32), mats.agriGreen, 0, 0.23, 0, -0.22);
      addMesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), mats.agriGlass, 0.15, 0.075, -0.13, -0.22);
      pinAnchorY = 0.42;
      break;
    }

    case "unsil-15":
    default: {
      addMesh(new THREE.BoxGeometry(0.16, 0.17, 0.22), mats.slateStone, 0, 0.105, 0, -0.22);
      addMesh(new THREE.BoxGeometry(0.18, 0.035, 0.24), mats.amber, 0, 0.205, 0, -0.22);
      addMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.11, 8), mats.stone, 0.025, 0.265, 0.03);
      pinAnchorY = 0.38;
      break;
    }
  }

  return { group, highlightRing, pinAnchorY, baseX, baseZ };
}

export const Campus3DPreview: React.FC<Campus3DPreviewProps> = ({
  onSelectBuilding,
  selectedBuildingId,
  mode = "preview",
}) => {
  const isFullscreen = mode === "fullscreen";

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
          if (clicked) {
            onSelectRef.current(clicked);
          }
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
        autoRotateRef.current && !isDragging && !hoveredId && !selectedIdRef.current;
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

      if (shouldAutoRotate || isDragging || anyBuildingMoving || !cameraSettled || forceRenderFrames > 0) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = 0;
      }
    }

    triggerRender(3);

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("wheel", handleWheel);

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

  return (
    <div
      className={
        isFullscreen
          ? "relative w-full h-[100dvh] min-h-[100dvh] bg-unsil-linen dark:bg-unsil-obsidian overflow-hidden select-none touch-none transition-colors"
          : "relative w-full h-[320px] sm:h-[360px] lg:h-[400px] overflow-hidden select-none touch-none"
      }
    >
      {/* Top-Left Faculty/Category Filter Strip (Fullscreen Mode) */}
      {isFullscreen && (
        <div className="absolute top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-20 left-2.5 sm:left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-5.25rem)]">
          <div
            className="p-1 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex flex-nowrap sm:flex-wrap items-center gap-1 overflow-x-auto no-scrollbar"
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
                  className={`min-h-[38px] shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-[#065F46] dark:bg-emerald-500 text-white dark:text-unsil-obsidian"
                      : "text-unsil-inkMuted dark:text-unsil-mistMuted hover:text-unsil-ink dark:hover:text-unsil-mist hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised"
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

          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-unsil-pine/90 border border-unsil-hairline dark:border-unsil-pineBorder text-[11px] font-medium text-unsil-ink dark:text-unsil-mist w-fit shadow-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]" aria-hidden="true" />
              Fakultas Teknik
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" aria-hidden="true" />
              Fakultas Pertanian
            </span>
          </div>
        </div>
      )}

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

      {/* Hovered Building Name Badge */}
      {hoveredBuilding && (
        <div
          className={`pointer-events-none absolute z-20 max-w-[240px] rounded-lg bg-white/95 dark:bg-unsil-pine/95 border border-unsil-hairline dark:border-unsil-pineBorder px-2.5 py-1.5 shadow-sm ${
            isFullscreen ? "top-32 sm:top-36 left-2.5 sm:left-4" : "top-2 left-2"
          }`}
        >
          <p className="text-[10px] font-semibold" style={{ color: hoveredBuilding.color }}>
            {hoveredBuilding.categoryLabel}
          </p>
          <p className="text-xs font-bold text-unsil-ink dark:text-unsil-mist truncate">
            {hoveredBuilding.name}
          </p>
        </div>
      )}

      {/* Camera & View Controls */}
      {isFullscreen ? (
        <div className="absolute top-[calc(4.5rem+env(safe-area-inset-top))] sm:top-20 right-2.5 sm:right-4 z-20 flex flex-col items-end gap-2">
          <div className="p-1 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm flex flex-col gap-1">
            <button
              type="button"
              onClick={() => zoomDeltaRef.current(-0.9)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
              title="Perbesar 3D"
              aria-label="Perbesar tampilan 3D"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => zoomDeltaRef.current(0.9)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
              title="Perkecil 3D"
              aria-label="Perkecil tampilan 3D"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleAutoRotate}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
              title={isAutoRotating ? "Jeda putaran 3D" : "Putar 3D otomatis"}
              aria-label={isAutoRotating ? "Jeda putaran otomatis 3D" : "Mulai putaran otomatis 3D"}
              aria-pressed={isAutoRotating}
            >
              {isAutoRotating ? (
                <Pause className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => resetViewRef.current()}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-unsil-paper dark:bg-unsil-pineRaised hover:bg-unsil-linen dark:hover:bg-unsil-pineBorder flex items-center justify-center text-unsil-ink dark:text-unsil-mist transition-colors"
              title="Reset sudut dan fokus 3D"
              aria-label="Reset sudut dan fokus kamera 3D"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleTopViewRef.current()}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-unsil-pine hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised border border-unsil-hairline dark:border-unsil-pineBorder shadow-sm text-unsil-ink dark:text-unsil-mist flex items-center gap-1.5 text-xs font-semibold transition-colors"
            title="Ganti sudut pandang kamera antara Isometrik dan Tampak Atas"
            aria-pressed={isTopView}
          >
            <Eye className="w-4 h-4 text-[#1d4ed8] dark:text-blue-400 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{isTopView ? "Isometrik" : "Tampak Atas"}</span>
          </button>
        </div>
      ) : (
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 sm:gap-0.5 bg-white/80 dark:bg-unsil-pine/80 backdrop-blur-sm border border-unsil-hairline/75 dark:border-unsil-pineBorder/75 rounded-lg p-0.5 shadow-sm">
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
      )}

      {/* Bottom Floating Quick-Select Dock (Fullscreen Mode) */}
      {isFullscreen && (
        <div className="absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 z-20 px-3 sm:px-4 pointer-events-none flex justify-center">
          <div className="pointer-events-auto max-w-full overflow-x-auto p-1.5 rounded-xl bg-white dark:bg-unsil-pine border border-unsil-hairline dark:border-unsil-pineBorder shadow-lg flex items-center gap-1.5 no-scrollbar">
            <div className="flex items-center gap-1 px-2.5 text-[11px] font-semibold text-unsil-inkMuted dark:text-unsil-mistMuted shrink-0">
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
                  className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    isSelected
                      ? "text-white shadow-sm ring-2 ring-amber-400"
                      : "bg-unsil-paper dark:bg-unsil-obsidian hover:bg-unsil-linen dark:hover:bg-unsil-pineRaised text-unsil-ink dark:text-unsil-mist"
                  }`}
                  aria-label={`Fokus ke gedung ${b.name}`}
                >
                  <span
                    style={!isSelected ? { backgroundColor: b.color } : undefined}
                    className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-semibold text-white ${
                      isSelected ? "bg-black/30" : ""
                    }`}
                  >
                    {b.code}
                  </span>
                  <span className="max-w-[130px] truncate">
                    {b.name.split(" ")[0]} {b.name.split(" ")[1] || ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
