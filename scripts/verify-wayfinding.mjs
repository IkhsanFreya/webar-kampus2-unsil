/**
 * ============================================================================
 * FILE: scripts/verify-wayfinding.mjs
 * PERAN: Skrip pengujian otomatis (automated self-check) mesin rute kampus.
 * PENJELASAN PRESENTASI:
 * Menguji seluruh 512 kombinasi rute (256 Jalan Kaki + 256 Kendaraan) untuk
 * memastikan tidak ada gedung terputus, jarak simetris, Jalan Kaki lewat
 * jalur kanan/depan, dan Kendaraan wajib lewat jalur kiri/barat.
 * ============================================================================
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

function loadTsModule(relPath, mocks = {}) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const src = fs.readFileSync(fullPath, "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const mod = { exports: {} };
  const fn = new Function("require", "module", "exports", outputText);
  fn(
    (spec) => {
      if (spec in mocks) return mocks[spec];
      throw new Error(`Unexpected import: ${spec}`);
    },
    mod,
    mod.exports
  );
  return mod.exports;
}

const buildingsMod = loadTsModule("src/data/campusBuildings.ts");
const wayfindingMod = loadTsModule("src/lib/campusWayfinding.ts", {
  "@/data/campusBuildings": buildingsMod,
});

const { MAPPED_BUILDINGS } = buildingsMod;
const { findCampusRoute } = wayfindingMod;

assert.equal(MAPPED_BUILDINGS.length, 16, "Expected 16 mapped campus buildings");

let checkedPairs = 0;
for (const mode of ["walking", "vehicle"]) {
  for (const from of MAPPED_BUILDINGS) {
    for (const to of MAPPED_BUILDINGS) {
      const route = findCampusRoute(from.id, to.id, mode);
      assert.ok(route, `[${mode}] Route missing between ${from.id} and ${to.id}`);
      if (from.id === to.id) {
        assert.equal(route.distanceMeters, 0);
      } else {
        assert.ok(route.distanceMeters >= 15);
        assert.ok(route.durationMinutes >= 1);
        assert.ok(route.waypoints.length >= 2);
        const reverse = findCampusRoute(to.id, from.id, mode);
        assert.equal(
          route.distanceMeters,
          reverse.distanceMeters,
          `[${mode}] Asymmetric distance between ${from.id} and ${to.id}`
        );
      }
      checkedPairs++;
    }
  }
}

assert.equal(findCampusRoute("invalid-id", "unsil-01", "walking"), null);
assert.equal(findCampusRoute("invalid-id", "unsil-01", "vehicle"), null);

const ftIds = ["unsil-06", "unsil-07", "unsil-08", "unsil-09", "unsil-10", "unsil-11", "unsil-12"];
for (const origin of ["unsil-01", "unsil-04"]) {
  for (const dest of ftIds) {
    // Walking must go right/front road (Jalan Depan Rektorat)
    const walk = findCampusRoute(origin, dest, "walking");
    assert.ok(
      walk.passedLandmarks.includes("Jalan Depan Rektorat"),
      `Walking ${origin} -> ${dest} must use right front road, got: ${walk.passedLandmarks.join(" -> ")}`
    );

    // Vehicle must strictly go left/west road (Jalur Kiri)
    const drive = findCampusRoute(origin, dest, "vehicle");
    assert.ok(
      drive.passedLandmarks.includes("Jalur Kiri (Barat Rektorat)"),
      `Vehicle ${origin} -> ${dest} must use left vehicle road, got: ${drive.passedLandmarks.join(" -> ")}`
    );
    const touchedRightFront = drive.passedLandmarks.includes("Jalan Depan Rektorat");
    assert.equal(touchedRightFront, false, `Vehicle ${origin} -> ${dest} must NOT cut via right front road`);
  }
}

const sampleWalk = findCampusRoute("unsil-04", "unsil-06", "walking");
const sampleDrive = findCampusRoute("unsil-04", "unsil-06", "vehicle");
console.log(`Wayfinding OK: verified ${checkedPairs} routes (256 walking + 256 vehicle).`);
console.log(
  `Walking 04 -> 06: ~${sampleWalk.distanceMeters}m (${sampleWalk.durationMinutes} mnt), via: ${sampleWalk.passedLandmarks.join(" -> ")}`
);
console.log(
  `Vehicle 04 -> 06: ~${sampleDrive.distanceMeters}m (${sampleDrive.durationMinutes} mnt), via: ${sampleDrive.passedLandmarks.join(" -> ")}`
);
