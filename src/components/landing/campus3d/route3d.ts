/**
 * ============================================================================
 * FILE: src/components/landing/campus3d/route3d.ts
 * PERAN: Renderer jalur rute 3D interaktif di atas papan Maket Three.js.
 * PENJELASAN PRESENTASI:
 * 1. Mengubah daftar koordinat rute Dijkstra (`CampusRoute`) menjadi kurva halus
 *    `CatmullRomCurve3` dan pita 3D bercahaya (`TubeGeometry`) di atas jalan maket.
 * 2. Warna dibedakan otomatis: Hijau Emerald untuk Jalan Kaki dan Biru untuk Kendaraan.
 * 3. Menampilkan 3 bola indikator bergerak sepanjang jalur untuk menunjukkan arah
 *    perjalanan dari titik awal ke gedung tujuan, serta fungsi `dispose()` anti-leak GPU.
 * ============================================================================
 */
import * as THREE from "three";
import { CampusRoute } from "@/lib/campusWayfinding";
import { percentToBoardXZ } from "./maquetteBuilder";

export interface Route3DHandle {
  group: THREE.Group;
  midpoint: [number, number];
  updatePulse: (elapsedSec: number) => void;
  dispose: () => void;
}

const ROUTE_Y = 0.048;

export function createRoute3D(route: CampusRoute): Route3DHandle | null {
  if (route.waypoints.length < 2 || route.distanceMeters <= 0) return null;

  const isVehicle = route.mode === "vehicle";
  const points: THREE.Vector3[] = route.waypoints.map((pt) => {
    const [x, z] = percentToBoardXZ(pt.xPercent, pt.yPercent);
    return new THREE.Vector3(x, ROUTE_Y, z);
  });

  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.18);
  const group = new THREE.Group();

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Elevated ribbon: Emerald for Walking, Royal Blue for Vehicle
  const segments = Math.max(28, points.length * 14);
  const ribbonGeo = new THREE.TubeGeometry(curve, segments, 0.028, 8, false);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: isVehicle ? 0x2563eb : 0x059669,
    emissive: isVehicle ? 0x1d4ed8 : 0x065f46,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.15,
  });
  geometries.push(ribbonGeo);
  materials.push(ribbonMat);
  group.add(new THREE.Mesh(ribbonGeo, ribbonMat));

  const haloGeo = new THREE.TubeGeometry(curve, segments, 0.046, 8, false);
  const haloMat = new THREE.MeshBasicMaterial({
    color: isVehicle ? 0x93c5fd : 0xfbbf24,
    transparent: true,
    opacity: 0.3,
  });
  geometries.push(haloGeo);
  materials.push(haloMat);
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.y = -0.008;
  group.add(haloMesh);

  const ringGeo = new THREE.RingGeometry(0.14, 0.22, 24);
  const startMat = new THREE.MeshBasicMaterial({
    color: isVehicle ? 0x3b82f6 : 0x10b981,
    side: THREE.DoubleSide,
  });
  const endMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
  geometries.push(ringGeo);
  materials.push(startMat, endMat);

  const startRing = new THREE.Mesh(ringGeo, startMat);
  startRing.rotation.x = -Math.PI / 2;
  startRing.position.set(points[0].x, 0.032, points[0].z);
  group.add(startRing);

  const lastPt = points[points.length - 1];
  const endRing = new THREE.Mesh(ringGeo, endMat);
  endRing.rotation.x = -Math.PI / 2;
  endRing.position.set(lastPt.x, 0.032, lastPt.z);
  group.add(endRing);

  // 3 animated pulse beads flowing along the path (faster for vehicle)
  const beadGeo = new THREE.SphereGeometry(0.042, 12, 12);
  const beadMat = new THREE.MeshBasicMaterial({ color: isVehicle ? 0xe0f2fe : 0xfde047 });
  geometries.push(beadGeo);
  materials.push(beadMat);

  const beads: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const bead = new THREE.Mesh(beadGeo, beadMat);
    const p = curve.getPointAt(i / 3);
    bead.position.set(p.x, p.y + 0.025, p.z);
    group.add(bead);
    beads.push(bead);
  }

  const mid = curve.getPointAt(0.5);
  const beadPos = new THREE.Vector3();
  const pulseSpeed = isVehicle ? 0.34 : 0.22;

  return {
    group,
    midpoint: [mid.x, mid.z],
    updatePulse(elapsedSec: number) {
      for (let i = 0; i < beads.length; i++) {
        const t = (elapsedSec * pulseSpeed + i / beads.length) % 1;
        curve.getPointAt(t, beadPos);
        beads[i].position.set(beadPos.x, beadPos.y + 0.025, beadPos.z);
      }
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
