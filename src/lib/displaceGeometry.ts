import * as THREE from "three";
import type { SubjectCrop, StageMode } from "../data/folioVisuals";

export interface IsolatedMeshOpts {
  imageUrl: string;
  crop: SubjectCrop;
  planeW?: number;
  planeH?: number;
  segments?: number;
  depthScale?: number;
  stage?: StageMode;
  edgeWeight?: number;
  lumWeight?: number;
  pageCurl?: number;
}

function isPaper(r: number, g: number, b: number, stage?: StageMode): boolean {
  const lum = r * 0.299 + g * 0.587 + b * 0.114;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (sat > 0.14 && lum < 0.92) return false;
  if (stage === "dissection") return lum > 0.9 && r > 0.86 && b > 0.74;
  if (stage === "workshop") return lum > 0.86 && r > 0.84 && b > 0.7;
  return lum > 0.88 && r > 0.86 && b > 0.78;
}

function luminanceAt(data: Uint8ClampedArray, size: number, px: number, py: number): number {
  const i = (py * size + px) * 4;
  const r = data[i] / 255;
  const g = data[i + 1] / 255;
  const b = data[i + 2] / 255;
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/** Edge-aware relief — ink lines and anatomical contours read as depth. */
function edgeRelief(lumGrid: Float32Array, size: number, px: number, py: number): number {
  const gx =
    -lumGrid[(py - 1) * size + (px - 1)] +
    lumGrid[(py - 1) * size + (px + 1)] +
    -2 * lumGrid[py * size + (px - 1)] +
    2 * lumGrid[py * size + (px + 1)] +
    -lumGrid[(py + 1) * size + (px - 1)] +
    lumGrid[(py + 1) * size + (px + 1)];
  const gy =
    -lumGrid[(py - 1) * size + (px - 1)] -
    2 * lumGrid[(py - 1) * size + px] -
    lumGrid[(py - 1) * size + (px + 1)] +
    lumGrid[(py + 1) * size + (px - 1)] +
    2 * lumGrid[(py + 1) * size + px] +
    lumGrid[(py + 1) * size + (px + 1)];
  return Math.min(1, Math.hypot(gx, gy) * 2.8);
}

/** Feathered ellipse alpha — soft matte edge like Google Arts cutout. */
function ellipseAlpha(px: number, py: number, size: number, tight = 0.46): number {
  const nx = (px / (size - 1) - 0.5) / tight;
  const ny = (py / (size - 1) - 0.5) / tight;
  const d = nx * nx + ny * ny;
  if (d >= 1) return 0;
  if (d <= 0.72) return 1;
  return 1 - (d - 0.72) / 0.28;
}

/** One isolated element from the folio — masked crop, CPU displacement, transparent parchment. */
export async function buildIsolatedSubjectMesh(
  opts: IsolatedMeshOpts,
): Promise<{ geometry: THREE.BufferGeometry; texture: THREE.CanvasTexture }> {
  const img = await loadImage(opts.imageUrl);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const { cx, cy, rx, ry } = opts.crop;

  const pad = 0.04;
  const x0 = Math.max(0, (cx - rx - pad) * iw);
  const y0 = Math.max(0, (cy - ry - pad) * ih);
  const x1 = Math.min(iw, (cx + rx + pad) * iw);
  const y1 = Math.min(ih, (cy + ry + pad) * ih);
  const cw = Math.max(1, x1 - x0);
  const ch = Math.max(1, y1 - y0);

  const texSize = 384;
  const texCanvas = document.createElement("canvas");
  texCanvas.width = texSize;
  texCanvas.height = texSize;
  const tctx = texCanvas.getContext("2d");
  if (!tctx) throw new Error("canvas unsupported");

  tctx.drawImage(img, x0, y0, cw, ch, 0, 0, texSize, texSize);
  const imgData = tctx.getImageData(0, 0, texSize, texSize);
  const data = imgData.data;

  const aspect = cw / ch;
  const planeW = opts.planeW ?? 1.05;
  const planeH = opts.planeH ?? planeW / aspect;
  const segments = opts.segments ?? 28;
  const depthScale = opts.depthScale ?? 0.22;
  const edgeW = opts.edgeWeight ?? 0.4;
  const lumW = opts.lumWeight ?? 0.38;
  const pageCurl = opts.pageCurl ?? 0.1;
  const stage = opts.stage;

  const dispCanvas = document.createElement("canvas");
  dispCanvas.width = texSize;
  dispCanvas.height = texSize;
  const dctx = dispCanvas.getContext("2d")!;
  dctx.drawImage(texCanvas, 0, 0);

  const dispData = dctx.getImageData(0, 0, texSize, texSize).data;
  const lumGrid = new Float32Array(texSize * texSize);
  for (let py = 0; py < texSize; py++) {
    for (let px = 0; px < texSize; px++) {
      lumGrid[py * texSize + px] = luminanceAt(dispData, texSize, px, py);
    }
  }

  const origAlpha = new Uint8Array(texSize * texSize);
  for (let py = 0; py < texSize; py++) {
    for (let px = 0; px < texSize; px++) {
      const i = (py * texSize + px) * 4;
      const feather = ellipseAlpha(px, py, texSize);
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const paper = isPaper(r, g, b, stage);
      const visible = feather > 0.05 && !paper;
      origAlpha[py * texSize + px] = visible ? Math.floor(feather * 255) : 0;
      data[i + 3] = origAlpha[py * texSize + px];
    }
  }
  tctx.putImageData(imgData, 0, 0);

  const geometry = new THREE.PlaneGeometry(planeW, planeH, segments, segments);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const gridW = segments + 1;
  const depthGrid = new Float32Array(gridW * gridW);

  for (let i = 0; i < pos.count; i++) {
    const col = i % gridW;
    const row = Math.floor(i / gridW);
    const u = col / segments;
    const v = row / segments;
    const px = Math.min(texSize - 1, Math.floor(u * texSize));
    const py = Math.min(texSize - 1, Math.floor((1 - v) * texSize));
    const pidx = py * texSize + px;
    if (origAlpha[pidx] < 8) {
      depthGrid[row * gridW + col] = 0;
      continue;
    }
    const lum = lumGrid[pidx];
    const edge = edgeRelief(lumGrid, texSize, px, py);
    const relief = Math.pow(Math.max(0, lum - 0.1), 0.82) * lumW + edge * edgeW;
    let z = relief * depthScale;
    // Parchment curl — bottom edge stays on page, centre lifts gently forward
    const vNorm = row / segments;
    const uNorm = col / segments;
    const edgeDist = Math.min(
      Math.min(uNorm, 1 - uNorm) * 2,
      Math.min(vNorm, 1 - vNorm) * 2,
    );
    const curl = Math.pow(1 - vNorm, 2.2) * pageCurl;
    z = z * (0.35 + edgeDist * 0.65) - curl;
    depthGrid[row * gridW + col] = Math.max(-0.02, z);
  }

  // Bilateral-style smooth — keeps ink ridges but removes mesh stair-steps
  const smoothed = new Float32Array(depthGrid);
  for (let row = 1; row < segments; row++) {
    for (let col = 1; col < segments; col++) {
      const i = row * gridW + col;
      if (depthGrid[i] < 0) continue;
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const v = depthGrid[(row + dy) * gridW + (col + dx)];
          if (v >= 0) {
            sum += v;
            n++;
          }
        }
      }
      smoothed[i] = n ? sum / n : depthGrid[i];
    }
  }

  for (let i = 0; i < pos.count; i++) {
    const col = i % gridW;
    const row = Math.floor(i / gridW);
    pos.setZ(i, smoothed[row * gridW + col]);
  }
  geometry.computeVertexNormals();

  const texture = new THREE.CanvasTexture(texCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return { geometry, texture };
}

/** Flat notebook page — subject region dimmed so only the 3D mesh pops. */
export async function loadNotebookTexture(
  imageUrl: string,
  crop: SubjectCrop,
  stage: StageMode = "studio",
): Promise<THREE.CanvasTexture> {
  const img = await loadImage(imageUrl);
  const w = 768;
  const h = Math.round(w * (img.naturalHeight / img.naturalWidth));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  ctx.drawImage(img, 0, 0, w, h);

  // Soft vignette — keeps focus on the codex page centre
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.12, w * 0.5, h * 0.5, w * 0.62);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Dim the crop zone on the flat page — the 3D element carries the detail
  const cx = crop.cx * w;
  const cy = crop.cy * h;
  const rx = crop.rx * w * 1.05;
  const ry = crop.ry * h * 1.05;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  g.addColorStop(0, "rgba(0,0,0,0.62)");
  g.addColorStop(0.55, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  if (stage === "dissection") {
    ctx.fillStyle = "rgba(255,180,100,0.08)";
    ctx.fillRect(0, 0, w, h);
  } else if (stage === "workshop") {
    ctx.fillStyle = "rgba(210,195,160,0.04)";
    ctx.fillRect(0, 0, w, h);
  }

  // Light parchment grain — breaks up flat digital sheen
  const grain = ctx.getImageData(0, 0, w, h);
  const gd = grain.data;
  for (let i = 0; i < gd.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    gd[i] = Math.min(255, Math.max(0, gd[i] + n));
    gd[i + 1] = Math.min(255, Math.max(0, gd[i + 1] + n));
    gd[i + 2] = Math.min(255, Math.max(0, gd[i + 2] + n));
  }
  ctx.putImageData(grain, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Full folio image for flat notebook backdrop — no displacement. */
export async function loadFolioTexture(imageUrl: string): Promise<THREE.Texture> {
  const img = await loadImage(imageUrl);
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

/** Keep legacy export for any callers — delegates to isolated build with full frame crop. */
export async function buildDisplacedMesh(
  imageUrl: string,
  planeW: number,
  planeH: number,
  segments = 36,
  depthScale = 0.35,
): Promise<{ geometry: THREE.BufferGeometry; texture: THREE.Texture }> {
  return buildIsolatedSubjectMesh({
    imageUrl,
    crop: { cx: 0.5, cy: 0.4, rx: 0.28, ry: 0.32 },
    planeW,
    planeH,
    segments,
    depthScale,
  });
}
