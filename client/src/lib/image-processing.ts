import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions = {}
) {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  let pipeline = sharp(inputBuffer);

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Convert and optimize
  if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality });
  }

  return pipeline.toBuffer();
}

export async function generateResponsiveImages(
  inputPath: string,
  outputDir: string,
  sizes = [320, 640, 1024, 1920]
) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const inputBuffer = await fs.readFile(inputPath);
  const results: { width: number; path: string }[] = [];

  for (const width of sizes) {
    const outputPath = path.join(
      outputDir,
      `${filename}-${width}w.webp`
    );

    const processedBuffer = await processImage(inputBuffer, {
      width,
      format: 'webp'
    });

    await fs.writeFile(outputPath, processedBuffer);
    results.push({ width, path: outputPath });
  }

  return results;
}

export function generateSrcSet(images: { width: number; path: string }[]) {
  return images
    .map(({ width, path }) => `${path} ${width}w`)
    .join(', ');
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageProcessingOptions = {}
) {
  const inputBuffer = await fs.readFile(inputPath);
  const outputBuffer = await processImage(inputBuffer, options);
  await fs.writeFile(outputPath, outputBuffer);
  return outputPath;
}
