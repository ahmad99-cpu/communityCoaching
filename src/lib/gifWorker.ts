/**
 * Encodes the share GIF off the main thread, so building it never stalls the page's animations
 * (on phones the encode alone takes a few seconds of CPU). Posted: frames' RGBA pixels + size +
 * delay; replies with the finished GIF blob.
 */
import { encodeGif } from "@/lib/gifEncoder";

interface EncodeRequest {
  frames: Uint8ClampedArray[];
  width: number;
  height: number;
  delayCs: number;
}

self.onmessage = async (e: MessageEvent<EncodeRequest>) => {
  const { frames, width, height, delayCs } = e.data;
  const blob = await encodeGif(
    frames.map((data) => ({ data })),
    width,
    height,
    delayCs,
  );
  (self as unknown as { postMessage(message: unknown): void }).postMessage(blob);
};
