/**
 * ============================================================================
 * FILE: src/lib/campusWayfinding.ts
 * PERAN: Mesin pencari rute kampus (Campus Wayfinding) berbasis algoritma Dijkstra.
 * PENJELASAN PRESENTASI:
 * 1. Memodelkan jaringan jalan riil Kampus 2 Mugarsari (luas ~30 ha) sebagai graf
 *    berbobot yang terdiri dari 22 simpang jalan (`ROAD_JUNCTIONS`) dan 16 gedung.
 * 2. Mendukung 2 mode perjalanan berbeda:
 *    - Mode Jalan Kaki ("walking"): memilih jalur pejalan kaki tercepat di sisi
 *      kanan/depan Rektorat -> Faperta -> Kompleks FT (~4,5 km/jam).
 *    - Mode Kendaraan ("vehicle"): mewajibkan kendaraan lewat jalur kiri/barat
 *      lingkar kampus menuju gedung-gedung (~18 km/jam).
 * 3. Menghasilkan titik koordinat jalur (`waypoints`), format garis SVG 2D
 *    (`svgPoints`), estimasi jarak meter, estimasi waktu tempuh, dan landmark.
 * ============================================================================
 */
import {
  CAMPUS_MAP_CONFIG,
  MAPPED_BUILDINGS,
  MappedCampusBuilding,
} from "@/data/campusBuildings";

export type TravelMode = "walking" | "vehicle";

export interface MapWaypoint {
  xPercent: number;
  yPercent: number;
}

export interface CampusRoute {
  mode: TravelMode;
  from: MappedCampusBuilding;
  to: MappedCampusBuilding;
  waypoints: MapWaypoint[];
  distanceMeters: number;
  durationMinutes: number;
  passedLandmarks: string[];
  svgPoints: string;
}

interface GraphNode {
  id: string;
  xPercent: number;
  yPercent: number;
  landmarkLabel?: string;
}

interface RoadEdgeDef {
  from: string;
  to: string;
  /** Cost multiplier for walking mode (1 = preferred pedestrian route) */
  walkingPenalty?: number;
  /** Cost multiplier for vehicle mode (1 = mandatory vehicle road, null = blocked for vehicles) */
  vehiclePenalty?: number | null;
}

// Calibrated to the real ~30-hectare (300,336 m²) footprint of Kampus 2 Mugarsari UNSIL
const METERS_PER_X_PERCENT = 6.2;
const METERS_PER_Y_PERCENT = METERS_PER_X_PERCENT * CAMPUS_MAP_CONFIG.aspectRatio;
const WALKING_SPEED_M_PER_MIN = 75; // ~4.5 km/h pedestrian pace
const VEHICLE_SPEED_M_PER_MIN = 300; // ~18 km/h safe campus speed limit

const ROAD_JUNCTIONS: GraphNode[] = [
  { id: "j-gate-s", xPercent: 18.6, yPercent: 75.4 },
  { id: "j-south-t", xPercent: 18.0, yPercent: 71.2 },
  // Left / West Vehicle Road (Wajib untuk kendaraan menuju gedung-gedung)
  { id: "j-west-sw", xPercent: 6.7, yPercent: 68.0 },
  { id: "j-west-rek", xPercent: 8.8, yPercent: 60.5, landmarkLabel: "Jalur Kiri (Barat Rektorat)" },
  { id: "j-west-lab", xPercent: 11.8, yPercent: 49.0, landmarkLabel: "Jalur Barat Faperta" },
  { id: "j-fap-nw", xPercent: 14.3, yPercent: 41.8, landmarkLabel: "Simpang Barat Faperta" },
  // Right / Front Pedestrian Spine (Jalan Depan Kanan untuk Pejalan Kaki)
  { id: "j-east-se", xPercent: 25.5, yPercent: 69.8 },
  { id: "j-east-rek", xPercent: 25.0, yPercent: 62.5, landmarkLabel: "Jalan Depan Rektorat" },
  { id: "j-central-fork", xPercent: 26.3, yPercent: 59.0 },
  { id: "j-main-cross", xPercent: 35.4, yPercent: 56.2, landmarkLabel: "Simpang Utama Kampus" },
  { id: "j-fap-east", xPercent: 31.6, yPercent: 46.2, landmarkLabel: "Depan Faperta" },
  { id: "j-ft-south", xPercent: 35.0, yPercent: 44.2, landmarkLabel: "Akses Selatan Kompleks FT" },
  // Left Boulevard alongside FT -> North
  { id: "j-ft-west-mid", xPercent: 21.0, yPercent: 35.4, landmarkLabel: "Boulevard Barat FT" },
  { id: "j-ft-nw", xPercent: 26.5, yPercent: 28.0, landmarkLabel: "Boulevard Utara FT" },
  { id: "j-ft-corridor-w", xPercent: 32.2, yPercent: 36.8 },
  { id: "j-ft-corridor-m", xPercent: 38.6, yPercent: 36.8, landmarkLabel: "Koridor Tengah FT" },
  { id: "j-ft-corridor-e", xPercent: 43.2, yPercent: 38.4 },
  { id: "j-north-fork", xPercent: 37.5, yPercent: 14.0, landmarkLabel: "Simpang Utara Rusunawa" },
  { id: "j-rusunawa", xPercent: 39.8, yPercent: 6.2 },
  { id: "j-gate-n", xPercent: 42.0, yPercent: 1.4 },
  { id: "j-ring-ne", xPercent: 95.5, yPercent: 27.6 },
  { id: "j-ring-se", xPercent: 84.5, yPercent: 56.8 },
];

// Walking mode prioritizes the direct front-right path;
// Vehicle mode strictly routes via the left/west road corridor to all campus buildings.
const ROAD_EDGES: RoadEdgeDef[] = [
  // Entry stem
  { from: "j-gate-s", to: "j-south-t", walkingPenalty: 1.0, vehiclePenalty: 1.0 },

  // RIGHT / FRONT PEDESTRIAN ROUTE (Preferred for walking; blocked for vehicle through-traffic from south)
  { from: "j-south-t", to: "j-east-se", walkingPenalty: 1.0, vehiclePenalty: null },
  { from: "j-east-se", to: "j-east-rek", walkingPenalty: 1.0, vehiclePenalty: null },
  { from: "j-east-rek", to: "j-central-fork", walkingPenalty: 1.0, vehiclePenalty: 3.0 },
  { from: "j-central-fork", to: "j-main-cross", walkingPenalty: 1.0, vehiclePenalty: 3.0 },
  { from: "j-main-cross", to: "j-fap-east", walkingPenalty: 1.0, vehiclePenalty: 2.5 },
  { from: "j-fap-east", to: "j-ft-south", walkingPenalty: 1.0, vehiclePenalty: 2.5 },
  { from: "j-ft-south", to: "j-ft-corridor-w", walkingPenalty: 1.0, vehiclePenalty: 1.4 },
  { from: "j-ft-south", to: "j-ft-corridor-m", walkingPenalty: 1.0, vehiclePenalty: 1.4 },

  // LEFT / WEST VEHICLE ROAD (Mandatory main corridor for vehicles; discouraged for south->FT walking)
  { from: "j-south-t", to: "j-west-sw", walkingPenalty: 3.2, vehiclePenalty: 1.0 },
  { from: "j-west-sw", to: "j-west-rek", walkingPenalty: 3.2, vehiclePenalty: 1.0 },
  { from: "j-west-rek", to: "j-west-lab", walkingPenalty: 3.2, vehiclePenalty: 1.0 },
  { from: "j-west-lab", to: "j-fap-nw", walkingPenalty: 3.2, vehiclePenalty: 1.0 },
  { from: "j-fap-nw", to: "j-fap-east", walkingPenalty: 2.2, vehiclePenalty: 1.0 },
  { from: "j-fap-nw", to: "j-ft-west-mid", walkingPenalty: 3.2, vehiclePenalty: 1.0 },
  { from: "j-ft-west-mid", to: "j-ft-nw", walkingPenalty: 2.5, vehiclePenalty: 1.0 },
  { from: "j-ft-west-mid", to: "j-ft-corridor-w", walkingPenalty: 2.5, vehiclePenalty: 1.0 },

  // FT Internal Access & North Corridor
  { from: "j-ft-corridor-w", to: "j-ft-corridor-m", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "j-ft-corridor-m", to: "j-ft-corridor-e", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "j-ft-corridor-w", to: "j-ft-nw", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "j-ft-corridor-m", to: "j-ft-nw", walkingPenalty: 1.0, vehiclePenalty: 1.2 },
  { from: "j-ft-nw", to: "j-north-fork", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "j-north-fork", to: "j-rusunawa", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "j-rusunawa", to: "j-gate-n", walkingPenalty: 1.0, vehiclePenalty: 1.0 },

  // East perimeter ring road
  { from: "j-north-fork", to: "j-ring-ne", walkingPenalty: 2.0, vehiclePenalty: 2.5 },
  { from: "j-ring-ne", to: "j-ring-se", walkingPenalty: 2.0, vehiclePenalty: 2.5 },
  { from: "j-ring-se", to: "j-main-cross", walkingPenalty: 2.0, vehiclePenalty: 2.5 },

  // Building access links (all 16 buildings connected for both walking and vehicle)
  { from: "unsil-01", to: "j-gate-s", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-04", to: "j-gate-s", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-02", to: "j-east-rek", walkingPenalty: 1.0, vehiclePenalty: 2.8 },
  { from: "unsil-02", to: "j-west-rek", walkingPenalty: 2.8, vehiclePenalty: 1.0 },
  { from: "unsil-15", to: "j-west-rek", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-14", to: "j-west-lab", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-13", to: "j-fap-east", walkingPenalty: 1.0, vehiclePenalty: 2.0 },
  { from: "unsil-13", to: "j-west-lab", walkingPenalty: 2.2, vehiclePenalty: 1.0 },
  { from: "unsil-13", to: "j-fap-nw", walkingPenalty: 2.2, vehiclePenalty: 1.0 },
  { from: "unsil-16", to: "j-fap-east", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-12", to: "j-ft-corridor-w", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-12", to: "j-ft-west-mid", walkingPenalty: 2.2, vehiclePenalty: 1.0 },
  { from: "unsil-10", to: "j-ft-south", walkingPenalty: 1.0, vehiclePenalty: 1.6 },
  { from: "unsil-10", to: "j-ft-corridor-w", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-09", to: "j-ft-corridor-m", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-09", to: "j-ft-nw", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-06", to: "j-ft-corridor-m", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-06", to: "j-ft-corridor-e", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-07", to: "j-ft-south", walkingPenalty: 1.0, vehiclePenalty: 1.6 },
  { from: "unsil-07", to: "j-ft-corridor-m", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-08", to: "j-ft-corridor-e", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-11", to: "j-ft-south", walkingPenalty: 1.0, vehiclePenalty: 1.6 },
  { from: "unsil-11", to: "j-ft-corridor-e", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-05", to: "j-rusunawa", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
  { from: "unsil-03", to: "j-gate-n", walkingPenalty: 1.0, vehiclePenalty: 1.0 },
];

/** Menghitung jarak fisik Euclidean (dalam meter) antar dua titik koordinat peta (%). */
function computeSegmentMeters(a: MapWaypoint, b: MapWaypoint): number {
  const dx = (b.xPercent - a.xPercent) * METERS_PER_X_PERCENT;
  const dy = (b.yPercent - a.yPercent) * METERS_PER_Y_PERCENT;
  return Math.hypot(dx, dy);
}

interface AdjacencyEdge {
  to: string;
  meters: number;
  walkingCost: number;
  vehicleCost: number | null;
}

/** Membangun adjacency list graf jalan kampus lengkap dengan bobot Jalan Kaki & Kendaraan. */
function buildGraph(): {
  nodes: Map<string, GraphNode>;
  adjacency: Map<string, AdjacencyEdge[]>;
} {
  const nodes = new Map<string, GraphNode>();

  for (const j of ROAD_JUNCTIONS) {
    nodes.set(j.id, j);
  }
  for (const b of MAPPED_BUILDINGS) {
    nodes.set(b.id, {
      id: b.id,
      xPercent: b.mapCoord.xPercent,
      yPercent: b.mapCoord.yPercent,
      landmarkLabel: b.name,
    });
  }

  const adjacency = new Map<string, AdjacencyEdge[]>();
  nodes.forEach((_, key) => adjacency.set(key, []));

  for (const edge of ROAD_EDGES) {
    const nodeU = nodes.get(edge.from);
    const nodeV = nodes.get(edge.to);
    if (!nodeU || !nodeV) continue;
    const meters = computeSegmentMeters(nodeU, nodeV);
    const walkingCost = meters * (edge.walkingPenalty ?? 1.0);
    const vehicleCost =
      edge.vehiclePenalty === null ? null : meters * (edge.vehiclePenalty ?? 1.0);
    adjacency.get(edge.from)?.push({ to: edge.to, meters, walkingCost, vehicleCost });
    adjacency.get(edge.to)?.push({ to: edge.from, meters, walkingCost, vehicleCost });
  }

  return { nodes, adjacency };
}

const GRAPH = buildGraph();

/**
 * Fungsi utama pencari rute terpendek (Dijkstra) antara dua gedung berdasarkan mode perjalanan.
 * @param fromId ID gedung asal (contoh: "unsil-04" untuk Masjid)
 * @param toId ID gedung tujuan (contoh: "unsil-06" untuk Gedung FT 1)
 * @param mode "walking" (jalur kanan/depan) atau "vehicle" (wajib jalur kiri)
 */
export function findCampusRoute(
  fromId: string,
  toId: string,
  mode: TravelMode = "walking"
): CampusRoute | null {
  const from = MAPPED_BUILDINGS.find((b) => b.id === fromId);
  const to = MAPPED_BUILDINGS.find((b) => b.id === toId);
  if (!from || !to) return null;

  if (from.id === to.id) {
    const pt = { xPercent: from.mapCoord.xPercent, yPercent: from.mapCoord.yPercent };
    const sx = ((pt.xPercent / 100) * CAMPUS_MAP_CONFIG.width).toFixed(1);
    const sy = ((pt.yPercent / 100) * CAMPUS_MAP_CONFIG.height).toFixed(1);
    return {
      mode,
      from,
      to,
      waypoints: [pt],
      distanceMeters: 0,
      durationMinutes: 0,
      passedLandmarks: [],
      svgPoints: `${sx},${sy}`,
    };
  }

  // Dijkstra shortest path tuned by TravelMode (walking = right/front path, vehicle = left road)
  // ponytail: O(V^2) Dijkstra over 38 nodes; upgrade to binary heap only if graph exceeds ~500 nodes
  const cost = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const unvisited = new Set<string>(GRAPH.nodes.keys());

  GRAPH.nodes.forEach((_, id) => {
    cost.set(id, id === fromId ? 0 : Infinity);
    prev.set(id, null);
  });

  while (unvisited.size > 0) {
    let current: string | null = null;
    let best = Infinity;
    unvisited.forEach((id) => {
      const c = cost.get(id) ?? Infinity;
      if (c < best) {
        best = c;
        current = id;
      }
    });

    if (current === null || best === Infinity || current === toId) break;
    unvisited.delete(current);

    const neighbors = GRAPH.adjacency.get(current) ?? [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;
      const edgeCost = mode === "vehicle" ? edge.vehicleCost : edge.walkingCost;
      if (edgeCost === null) continue;

      const isIntermediateBuilding =
        edge.to.startsWith("unsil-") && edge.to !== toId && edge.to !== fromId;
      const alt = best + edgeCost + (isIntermediateBuilding ? 150 : 0);
      if (alt < (cost.get(edge.to) ?? Infinity)) {
        cost.set(edge.to, alt);
        prev.set(edge.to, current);
      }
    }
  }

  const rawPath: string[] = [];
  let cursor: string | null = toId;
  while (cursor !== null) {
    rawPath.unshift(cursor);
    cursor = prev.get(cursor) ?? null;
  }

  if (rawPath.length < 2 || rawPath[0] !== fromId) {
    return null;
  }

  const waypoints: MapWaypoint[] = [];
  const passedLandmarks: string[] = [];
  let realMeters = 0;

  for (let i = 0; i < rawPath.length; i++) {
    const node = GRAPH.nodes.get(rawPath[i]);
    if (!node) continue;
    waypoints.push({ xPercent: node.xPercent, yPercent: node.yPercent });
    if (i > 0) {
      realMeters += computeSegmentMeters(waypoints[i - 1], waypoints[i]);
    }
    if (i > 0 && i < rawPath.length - 1 && node.landmarkLabel) {
      passedLandmarks.push(node.landmarkLabel);
    }
  }

  const distanceMeters = Math.max(15, Math.round(realMeters / 5) * 5);
  const speed = mode === "vehicle" ? VEHICLE_SPEED_M_PER_MIN : WALKING_SPEED_M_PER_MIN;
  const durationMinutes = Math.max(1, Math.round(distanceMeters / speed));
  const svgPoints = waypoints
    .map((pt) => {
      const sx = ((pt.xPercent / 100) * CAMPUS_MAP_CONFIG.width).toFixed(1);
      const sy = ((pt.yPercent / 100) * CAMPUS_MAP_CONFIG.height).toFixed(1);
      return `${sx},${sy}`;
    })
    .join(" ");

  return {
    mode,
    from,
    to,
    waypoints,
    distanceMeters,
    durationMinutes,
    passedLandmarks: passedLandmarks.slice(0, 3),
    svgPoints,
  };
}
