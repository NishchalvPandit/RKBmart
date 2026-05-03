/**
 * Generates WebP derivatives (small / medium / large) for frontend assets.
 * Run: npm run optimize-images
 *
 * Full rebuild: restore originals listed in GALLERY_SOURCES under src/assets/, plus
 * slider1.jpg, slider2.jpg, galleryimage1.jpeg (banner source), khaltiLogo.png,
 * esewaLogo.png, and public/logo.png (square logo master).
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "src/assets");
const OUT = path.join(ASSETS, "images");
const PUBLIC = path.join(ROOT, "public");

const QUALITY = 85;

async function ensureDir(d) {
  await fs.mkdir(d, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function toWebp(src, dest, resizeOpts) {
  let pipeline = sharp(src).rotate();
  if (resizeOpts) {
    const { withoutEnlargement = true, ...rest } = resizeOpts;
    pipeline = pipeline.resize({
      ...rest,
      withoutEnlargement,
    });
  }
  await ensureDir(path.dirname(dest));
  await pipeline.webp({ quality: QUALITY, effort: 4 }).toFile(dest);
}

async function multiWidth(src, baseOutPath, widths) {
  const meta = await sharp(src).metadata();
  const origW = meta.width ?? 0;
  const results = {};
  for (const w of widths) {
    if (origW && origW < w) continue;
    const dest = `${baseOutPath}-${w}.webp`;
    await toWebp(src, dest, { width: w });
    results[w] = dest;
  }
  if (Object.keys(results).length === 0) {
    const dest = `${baseOutPath}-${origW || "full"}.webp`;
    await toWebp(src, dest, null);
    results[origW || "full"] = dest;
  }
  return results;
}

const GALLERY_SOURCES = [
  "WhatsApp Image 2026-04-23 at 19.12.50.jpeg",
  "WhatsApp Image 2026-04-23 at 19.12.51 (1).jpeg",
  "WhatsApp Image 2026-04-23 at 19.12.51.jpeg",
  "WhatsApp Image 2026-04-23 at 19.12.52.jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.14 (1).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.14 (2).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.14 (3).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.14.jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.15.jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.34 (1).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.34 (2).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.34.jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.35 (1).jpeg",
  "WhatsApp Image 2026-04-23 at 19.13.35.jpeg",
  "galleryimage1.jpeg",
  "galleryimage2.jpeg",
  "galleryimage3.jpeg",
];

async function main() {
  await ensureDir(path.join(OUT, "gallery"));
  await ensureDir(path.join(OUT, "hero"));
  await ensureDir(path.join(OUT, "brand"));
  await ensureDir(PUBLIC);

  const heroWidths = [640, 1024, 1280, 1920];
  for (const n of [1, 2]) {
    const src = path.join(ASSETS, `slider${n}.jpg`);
    if (!(await fileExists(src))) {
      console.warn(`Skip slider ${n}: missing ${path.basename(src)}`);
      continue;
    }
    await multiWidth(src, path.join(OUT, "hero", `slider-${n}`), heroWidths);
  }

  const bannerSrc = path.join(ASSETS, "galleryimage1.jpeg");
  const bannerWidths = [640, 1024, 1600];
  if (await fileExists(bannerSrc)) {
    await multiWidth(bannerSrc, path.join(OUT, "hero", "home-banner"), bannerWidths);
  } else {
    console.warn("Skip home banner: missing galleryimage1.jpeg");
  }

  const galleryWidths = [480, 800, 1400];

  for (let i = 0; i < GALLERY_SOURCES.length; i++) {
    const name = GALLERY_SOURCES[i];
    const src = path.join(ASSETS, name);
    if (!(await fileExists(src))) {
      console.warn(`Skip gallery ${name}`);
      continue;
    }
    const idx = String(i + 1).padStart(2, "0");
    await multiWidth(src, path.join(OUT, "gallery", `gallery-${idx}`), galleryWidths);
  }

  const logoSrc = path.join(PUBLIC, "logo.png");
  if (await fileExists(logoSrc)) {
    for (const w of [48, 96, 160, 192]) {
      await toWebp(logoSrc, path.join(OUT, "brand", `logo-${w}.webp`), {
        width: w,
        height: w,
        fit: "inside",
      });
    }
    await toWebp(logoSrc, path.join(PUBLIC, "logo.webp"), {
      width: 160,
      height: 160,
      fit: "inside",
    });
    await toWebp(logoSrc, path.join(PUBLIC, "favicon.webp"), {
      width: 32,
      height: 32,
      fit: "inside",
    });
  } else {
    console.warn("Skip logo derivatives: missing public/logo.png");
  }

  const payHeight = 56;
  const khaltiSrc = path.join(ASSETS, "khaltiLogo.png");
  if (await fileExists(khaltiSrc)) {
    await toWebp(khaltiSrc, path.join(OUT, "brand", "khalti-56.webp"), {
      height: payHeight,
      fit: "inside",
    });
    await toWebp(khaltiSrc, path.join(OUT, "brand", "khalti-112.webp"), {
      height: payHeight * 2,
      fit: "inside",
    });
  } else {
    console.warn("Skip Khalti logos: missing khaltiLogo.png");
  }

  const esewaSrc = path.join(ASSETS, "esewaLogo.png");
  if (await fileExists(esewaSrc)) {
    await toWebp(esewaSrc, path.join(OUT, "brand", "esewa-56.webp"), {
      height: payHeight,
      fit: "inside",
    });
    await toWebp(esewaSrc, path.join(OUT, "brand", "esewa-112.webp"), {
      height: payHeight * 2,
      fit: "inside",
      withoutEnlargement: false,
    });
  } else {
    console.warn("Skip eSewa logos: missing esewaLogo.png");
  }

  console.log("Image optimization complete → src/assets/images and public/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
