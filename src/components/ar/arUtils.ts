/**
 * ============================================================================
 * FILE: src/components/ar/arUtils.ts
 * PERAN: Kumpulan fungsi utilitas teknis untuk engine Marker-Based WebAR.
 * PENJELASAN PRESENTASI:
 * 1. `loadExternalScript`: Memuat library A-Frame & MindAR dinamis dari CDN.
 * 2. `cleanupARCameraResources`: Mematikan seluruh track kamera hardware
 *    (`track.stop()`) dan menghapus elemen DOM sisa agar kamera HP tidak bocor
 *    memori (memory leak) saat keluar dari mode AR.
 * 3. `createCameraInterceptor`: Menyesuaikan resolusi kamera belakang/depan
 *    hingga Full HD 1080p dengan fallback bertingkat agar kompatibel di Android/iOS.
 * 4. `findClosestARPin`: Raycasting proyeksi layar (Screen-Space Proximity) untuk
 *    mengubah ketukan jari 2D di layar HP menjadi pilihan pin gedung 3D akurat.
 * ============================================================================
 */
import { MAPPED_BUILDINGS, CampusBuilding } from "@/data/campusBuildings";

export type CameraFacingMode = "environment" | "user";

export type AFrameSceneElement = HTMLElement & {
  systems?: {
    [key: string]: {
      stop?: () => void;
    };
  };
  pause?: () => void;
};

/** Memuat skrip eksternal (A-Frame / MindAR) sekali saja ke tag <head> secara asinkron. */
export function loadExternalScript(src: string, id: string): Promise<void> {
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
}

/** Menghentikan MindAR, mematikan seluruh stream kamera aktif, dan membersihkan overlay DOM. */
export function cleanupARCameraResources(
  sceneEl: AFrameSceneElement | null,
  activeStreams: Set<MediaStream>
): void {
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

  activeStreams.forEach((stream) => {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Safe ignore
      }
    });
  });
  activeStreams.clear();

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
}

/** Interceptor `getUserMedia` agar kamera memilih lensa belakang/depan dengan resolusi HD optimal. */
export function createCameraInterceptor(
  origGetUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>,
  getState: () => {
    isCameraOn: boolean;
    isUnmounting: boolean;
    facingMode: CameraFacingMode;
  },
  activeStreams: Set<MediaStream>
): (constraints?: MediaStreamConstraints) => Promise<MediaStream> {
  return async function interceptedGetUserMedia(constraints) {
    if (!constraints || !constraints.video) {
      return origGetUserMedia(constraints);
    }

    const { isCameraOn, isUnmounting, facingMode } = getState();
    if (!isCameraOn || isUnmounting) {
      throw new DOMException("Camera is turned off", "AbortError");
    }

    const candidateConstraints: MediaStreamConstraints[] = [
      {
        audio: false,
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      },
      {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
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

    const latest = getState();
    if (!latest.isCameraOn || latest.isUnmounting) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Safe ignore
        }
      });
      throw new DOMException("Camera was turned off", "AbortError");
    }

    activeStreams.add(stream);
    return stream;
  };
}

/** Memproyeksikan posisi 3D seluruh 16 pin AR ke koordinat layar 2D untuk mendeteksi pin yang diketuk. */
export function findClosestARPin(
  clientX: number,
  clientY: number,
  sceneEl: HTMLElement | null,
  targetEl: HTMLElement | null,
  maxRadiusPx = 56
): CampusBuilding | null {
  const scene = sceneEl as unknown as { camera?: unknown } | null;
  if (!scene || !scene.camera) return null;

  const targetEntity = targetEl as unknown as {
    object3D?: {
      visible: boolean;
      localToWorld: (v: unknown) => void;
    };
  } | null;
  if (!targetEntity?.object3D?.visible) return null;

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
  if (!w.THREE) return null;

  const width = window.innerWidth;
  const height = window.innerHeight;
  let closestBuilding: CampusBuilding | null = null;
  let minDistance = maxRadiusPx;

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

  return closestBuilding;
}
