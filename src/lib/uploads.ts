const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Validates an uploaded image and returns a safe file extension.
 * SVG is intentionally excluded: uploaded SVGs can carry scripts.
 */
export function imageExtension(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please use a file up to 10 MB.");
  }
  const type = (file.type || "").toLowerCase();
  const ext = EXTENSION_BY_TYPE[type];
  if (!ext) {
    throw new Error("Unsupported image type. Use JPG, PNG, WebP, GIF or AVIF.");
  }
  return ext;
}