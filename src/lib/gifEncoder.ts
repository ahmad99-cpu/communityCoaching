/**
 * Minimal animated GIF encoder (GIF89a, one shared 256-colour palette, LZW), so the share card
 * can become a looping GIF without pulling in a library. Built for flat, brand-coloured art
 * like the share card; photos would band.
 */

export interface GifFrame {
  /** RGBA pixels, width × height × 4 (from getImageData). */
  data: Uint8ClampedArray;
}

/** 15-bit colour key (5 bits per channel). */
const key15 = (r: number, g: number, b: number) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

/** Picks the 256 most common colours (bucketed to 15 bits) across a sample of all frames. */
function buildPalette(frames: GifFrame[]) {
  const counts = new Uint32Array(32768);
  const sums = new Float64Array(32768 * 3);
  for (const f of frames) {
    const d = f.data;
    for (let i = 0; i < d.length; i += 16) {
      const k = key15(d[i], d[i + 1], d[i + 2]);
      counts[k]++;
      sums[k * 3] += d[i];
      sums[k * 3 + 1] += d[i + 1];
      sums[k * 3 + 2] += d[i + 2];
    }
  }
  const keys = Array.from(counts.keys())
    .filter((k) => counts[k] > 0)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 256);
  const palette = new Uint8Array(256 * 3);
  keys.forEach((k, i) => {
    palette[i * 3] = Math.round(sums[k * 3] / counts[k]);
    palette[i * 3 + 1] = Math.round(sums[k * 3 + 1] / counts[k]);
    palette[i * 3 + 2] = Math.round(sums[k * 3 + 2] / counts[k]);
  });
  return { palette, size: Math.max(keys.length, 2) };
}

/** 4×4 Bayer matrix, scaled to ±4 (one 15-bit step), to break soft gradients into fine grain instead of rings. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v / 16 - 0.5) * 8);
const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Maps every pixel to its nearest palette index (ordered dither, cached per 15-bit colour). */
function makeIndexer(palette: Uint8Array, size: number, width: number) {
  const cache = new Int16Array(32768).fill(-1);
  return (d: Uint8ClampedArray) => {
    const out = new Uint8Array(d.length / 4);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const t = BAYER[(p % width & 3) + ((Math.floor(p / width) & 3) << 2)];
      const k = key15(clamp(d[i] + t), clamp(d[i + 1] + t), clamp(d[i + 2] + t));
      let idx = cache[k];
      if (idx < 0) {
        const r = ((k >> 10) << 3) + 4;
        const g = (((k >> 5) & 31) << 3) + 4;
        const b = ((k & 31) << 3) + 4;
        let best = 0;
        let bestDist = Infinity;
        for (let c = 0; c < size; c++) {
          const dr = palette[c * 3] - r;
          const dg = palette[c * 3 + 1] - g;
          const db = palette[c * 3 + 2] - b;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            best = c;
          }
        }
        idx = cache[k] = best;
      }
      out[p] = idx;
    }
    return out;
  };
}

/** LZW-compresses one frame of palette indices (min code size 8), as GIF data sub-blocks. */
function lzw(indices: Uint8Array, out: number[]) {
  const CLEAR = 256;
  const EOI = 257;
  let codeSize = 9;
  let next = 258;
  let dict = new Map<number, number>();
  const bytes: number[] = [];
  let cur = 0;
  let bits = 0;
  const emit = (code: number) => {
    cur |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      bytes.push(cur & 255);
      cur >>>= 8;
      bits -= 8;
    }
  };

  emit(CLEAR);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = prefix * 256 + k;
    const found = dict.get(key);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    emit(prefix);
    if (next === 4096) {
      emit(CLEAR);
      dict = new Map();
      next = 258;
      codeSize = 9;
    } else {
      if (next >= 1 << codeSize) codeSize++;
      dict.set(key, next++);
    }
    prefix = k;
  }
  emit(prefix);
  emit(EOI);
  if (bits > 0) bytes.push(cur & 255);

  out.push(8);
  for (let i = 0; i < bytes.length; i += 255) {
    const chunk = bytes.slice(i, i + 255);
    out.push(chunk.length, ...chunk);
  }
  out.push(0);
}

/**
 * Encodes looping frames into a GIF. `delayCs` is the time per frame in hundredths of a
 * second. Yields to the browser between frames so the page stays responsive.
 */
export async function encodeGif(frames: GifFrame[], width: number, height: number, delayCs: number): Promise<Blob> {
  const { palette, size } = buildPalette(frames);
  const toIndices = makeIndexer(palette, size, width);
  const out: number[] = [];
  const u16 = (n: number) => out.push(n & 255, (n >> 8) & 255);

  out.push(...[..."GIF89a"].map((c) => c.charCodeAt(0)));
  u16(width);
  u16(height);
  out.push(0xf7, 0, 0); // global colour table, 256 entries
  for (let i = 0; i < 256 * 3; i++) out.push(palette[i]);
  // loop forever
  out.push(0x21, 0xff, 0x0b, ...[..."NETSCAPE2.0"].map((c) => c.charCodeAt(0)), 0x03, 0x01, 0, 0, 0);

  const chunks: BlobPart[] = [new Uint8Array(out)];
  for (const f of frames) {
    const frameBytes: number[] = [0x21, 0xf9, 0x04, 0x04, delayCs & 255, (delayCs >> 8) & 255, 0, 0];
    frameBytes.push(0x2c, 0, 0, 0, 0, width & 255, width >> 8, height & 255, height >> 8, 0);
    lzw(toIndices(f.data), frameBytes);
    chunks.push(new Uint8Array(frameBytes));
    await new Promise((r) => setTimeout(r, 0));
  }
  chunks.push(new Uint8Array([0x3b]));
  return new Blob(chunks, { type: "image/gif" });
}
