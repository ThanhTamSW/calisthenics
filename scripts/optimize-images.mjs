#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts JPEG images to WebP and AVIF formats
 * Generates multiple sizes for responsive images (srcset)
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGE_SOURCE = path.join(PROJECT_ROOT, 'images');
const IMAGE_DEST = path.join(PROJECT_ROOT, 'images', 'optimized');

// Responsive image sizes
const SIZES = [480, 768, 1024, 1280, 1920];

// Image categories and their compression settings
const IMAGE_CONFIG = {
  profile: {
    maxWidth: 480,
    sizes: [320, 480],
    quality: {
      webp: 75,
      avif: 60,
    },
  },
  hero: {
    maxWidth: 1280,
    sizes: [640, 1024, 1280],
    quality: {
      webp: 80,
      avif: 65,
    },
  },
  timeline: {
    maxWidth: 1280,
    sizes: [480, 768, 1024, 1280],
    quality: {
      webp: 75,
      avif: 60,
    },
  },
  default: {
    maxWidth: 1920,
    sizes: SIZES,
    quality: {
      webp: 78,
      avif: 62,
    },
  },
};

function getImageCategory(filename) {
  if (filename.startsWith('profile')) return 'profile';
  if (filename.startsWith('ultimateZ') || filename.startsWith('premium') || 
      filename.startsWith('championship') || filename.startsWith('giamkhao') ||
      filename.startsWith('southern') || filename.startsWith('BOT_II')) {
    return 'timeline';
  }
  return 'default';
}

async function optimizeImage(inputPath, baseName) {
  console.log(`\n📸 Processing: ${baseName}`);
  const category = getImageCategory(baseName);
  const config = IMAGE_CONFIG[category];

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const originalSize = fs.statSync(inputPath).size / 1024;

    console.log(`   Original: ${metadata.width}x${metadata.height}, ${originalSize.toFixed(2)}KB`);

    // Generate responsive sizes
    for (const size of config.sizes) {
      if (size > metadata.width) continue;

      // WebP format
      await image
        .resize(size, Math.round((size / metadata.width) * metadata.height), {
          fit: 'contain',
          withoutEnlargement: true,
        })
        .webp({ quality: config.quality.webp })
        .toFile(path.join(IMAGE_DEST, `${baseName}-${size}w.webp`));

      // AVIF format
      await image
        .resize(size, Math.round((size / metadata.width) * metadata.height), {
          fit: 'contain',
          withoutEnlargement: true,
        })
        .avif({ quality: config.quality.avif })
        .toFile(path.join(IMAGE_DEST, `${baseName}-${size}w.avif`));

      console.log(`   ✓ Generated ${size}w variants`);
    }

    // Generate full-size variants
    await image.webp({ quality: config.quality.webp }).toFile(path.join(IMAGE_DEST, `${baseName}-full.webp`));
    await image.avif({ quality: config.quality.avif }).toFile(path.join(IMAGE_DEST, `${baseName}-full.avif`));
    console.log(`   ✓ Generated full-size variants`);
  } catch (error) {
    console.error(`   ❌ Error processing ${baseName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  // Ensure output directory
  await fs.ensureDir(IMAGE_DEST);

  // Find all JPG, PNG files
  const sourceImages = globSync('*.{jpg,jpeg,png}', { cwd: IMAGE_SOURCE });

  if (sourceImages.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  for (const imageFile of sourceImages) {
    const baseName = path.parse(imageFile).name;
    const inputPath = path.join(IMAGE_SOURCE, imageFile);
    await optimizeImage(inputPath, baseName);
  }

  console.log('\n✅ Optimization complete!');
  console.log(`📁 Optimized images saved to: ${IMAGE_DEST}`);
}

main().catch(console.error);
