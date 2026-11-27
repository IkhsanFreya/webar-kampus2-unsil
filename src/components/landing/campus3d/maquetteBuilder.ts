/**
 * ============================================================================
 * FILE: src/components/landing/campus3d/maquetteBuilder.ts
 * PERAN: Generator geometri & material 3D prosedural untuk 16 gedung Maket Kampus.
 * PENJELASAN PRESENTASI:
 * 1. `percentToBoardXZ`: Mengonversi koordinat peta 2D (%) ke koordinat papan 3D (X, Z).
 * 2. `createSharedMaterials`: Membuat kumpulan material Three.js yang dipakai ulang
 *    (hemat memori GPU) dengan warna khas fakultas (FT=Biru, Faperta=Hijau, Ibadah=Teal).
 * 3. `createBuildingMaquette`: Membangun bentuk arsitektur miniatur 3D tiap gedung
 *    (kubah Masjid, atap limas & bendera Rektorat, kompleks FT, Rusunawa, dll.)
 *    tanpa memerlukan file model `.glb` berat sehingga muat instan di browser HP.
 * ============================================================================
 */
import * as THREE from "three";
import { CAMPUS_MAP_CONFIG, MappedCampusBuilding } from "@/data/campusBuildings";

export type Filter3D = "all" | "ft" | "faperta" | "facility" | "worship" | "gate";

export const FILTERS_3D: Array<{ id: Filter3D; label: string; dotColor?: string }> = [
  { id: "all", label: "Semua" },
  { id: "ft", label: "F. Teknik", dotColor: "#1d4ed8" },
  { id: "faperta", label: "F. Pertanian", dotColor: "#15803d" },
  { id: "facility", label: "Fasilitas" },
  { id: "worship", label: "Ibadah" },
  { id: "gate", label: "Akses" },
];

export interface MaterialPool {
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

export interface BuildingMeshMeta {
  group: THREE.Group;
  highlightRing: THREE.Mesh;
  pinAnchorY: number;
  baseX: number;
  baseZ: number;
}

export const BOARD_W = 5.0;
export const BOARD_D = BOARD_W * CAMPUS_MAP_CONFIG.aspectRatio;
export const INITIAL_THETA = 0.52;
export const INITIAL_PHI = 0.95;
export const TOP_DOWN_PHI = 0.34;
export const PREVIEW_RADIUS = 10.2;
export const FULLSCREEN_RADIUS = 9.2;

export function matchesFilter3D(b: MappedCampusBuilding, filter: Filter3D): boolean {
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

export function percentToBoardXZ(xPercent: number, yPercent: number): [number, number] {
  return [(xPercent / 100 - 0.5) * BOARD_W, (yPercent / 100 - 0.5) * BOARD_D];
}

export function createSharedMaterials(): MaterialPool {
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

const COMPACT_CLUSTER_IDS = new Set([
  "unsil-06",
  "unsil-07",
  "unsil-08",
  "unsil-09",
  "unsil-10",
  "unsil-11",
  "unsil-12",
]);

export function createBuildingMaquette(
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

  const isCompactCluster = COMPACT_CLUSTER_IDS.has(building.id);

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
