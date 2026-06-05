import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function processProductImage(
  inputBuffer: Buffer
): Promise<ProcessedImage> {
  const image = sharp(inputBuffer).rotate();

  const metadata = await image.metadata();
  const originalWidth = metadata.width ?? 1200;
  const targetWidth = Math.min(originalWidth, 1200);

  const [mainBuffer, thumbnailBuffer] = await Promise.all([
    image
      .clone()
      .resize(targetWidth, null, { withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer(),

    image
      .clone()
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 75, effort: 3 })
      .toBuffer(),
  ]);

  const mainMeta = await sharp(mainBuffer).metadata();

  return {
    buffer:          mainBuffer,
    thumbnailBuffer: thumbnailBuffer,
    width:           mainMeta.width ?? targetWidth,
    height:          mainMeta.height ?? 0,
    sizeBytes:       mainBuffer.length,
  };
}

export function getStoragePath(
  productId: string,
  filename: string,
  variant: "main" | "thumb" = "main"
): string {
  return `products/${productId}/${variant}_${filename}.webp`;
}
