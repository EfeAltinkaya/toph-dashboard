// Downscales an uploaded image client-side before it's turned into a data
// URL and sent to the server. Photos from a phone camera can be several MB;
// without this, storing them as base64 in the database (see README's "why
// base64" note) would bloat rows and make transfers slow for no benefit —
// the app never needs pixels beyond what fits on screen.
export function resizeImageFile(
  file: File,
  maxDimension: number,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
