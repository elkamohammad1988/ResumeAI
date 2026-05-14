/**
 * Crop a square (or non-square) image to a circle in a canvas, return a
 * transparent PNG data URL. Lets jsPDF render circular avatars cleanly
 * (jsPDF has no native circular clipping path).
 */
export function cropToCircle(
  dataUrl: string | null | undefined,
  size = 360,
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(null);
    if (typeof window === "undefined") return resolve(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const side = Math.min(w, h);
      const sx = (w - side) / 2;
      const sy = (h - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.imageSmoothingQuality = "high";

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
