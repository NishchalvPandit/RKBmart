/**
 * Responsive WebP URLs built from scripts/optimize-images.mjs output.
 * Uses Vite import.meta.glob so adding gallery-* WebPs stays automatic.
 */

const heroSliderMods = import.meta.glob("./images/hero/slider-*-*.webp", {
  eager: true,
  import: "default",
});

function buildHeroSlide(sliderNum) {
  const widths = {};
  for (const path of Object.keys(heroSliderMods)) {
    const m = path.match(new RegExp(`slider-${sliderNum}-(\\d+)\\.webp`));
    if (m) widths[Number(m[1])] = heroSliderMods[path];
  }
  const sorted = Object.keys(widths)
    .map(Number)
    .sort((a, b) => a - b);
  if (!sorted.length) return null;
  const srcSet = sorted.map((w) => `${widths[w]} ${w}w`).join(", ");
  const preferred = sorted.find((w) => w >= 1280) ?? sorted[sorted.length - 1];
  return { srcSet, src: widths[preferred] };
}

export const heroSlides = [buildHeroSlide(1), buildHeroSlide(2)].filter(Boolean);

const bannerMods = import.meta.glob("./images/hero/home-banner-*.webp", {
  eager: true,
  import: "default",
});

function buildHomeBanner() {
  const widths = {};
  for (const path of Object.keys(bannerMods)) {
    const m = path.match(/home-banner-(\d+)\.webp/);
    if (m) widths[Number(m[1])] = bannerMods[path];
  }
  const sorted = Object.keys(widths)
    .map(Number)
    .sort((a, b) => a - b);
  if (!sorted.length) return null;
  const srcSet = sorted.map((w) => `${widths[w]} ${w}w`).join(", ");
  const src = widths[sorted[sorted.length - 1]];
  return { srcSet, src };
}

export const homeBanner = buildHomeBanner();

const galleryMods = import.meta.glob("./images/gallery/gallery-*-*.webp", {
  eager: true,
  import: "default",
});

function buildGalleryPhotos() {
  const byIndex = {};
  for (const path of Object.keys(galleryMods)) {
    const m = path.match(/gallery-(\d+)-(\d+)\.webp/);
    if (!m) continue;
    const idx = Number(m[1]);
    const w = m[2];
    if (!byIndex[idx]) byIndex[idx] = {};
    byIndex[idx][w] = galleryMods[path];
  }
  const maxIdx = Math.max(0, ...Object.keys(byIndex).map(Number));
  const list = [];
  for (let i = 1; i <= maxIdx; i++) {
    const sizes = byIndex[i];
    if (!sizes) continue;
    const gridOrder = ["480", "800", "1400"];
    const gridSrcSet = gridOrder
      .filter((w) => sizes[w])
      .map((w) => `${sizes[w]} ${w}w`)
      .join(", ");
    const gridSrc = sizes["800"] ?? sizes["480"] ?? sizes["1400"];
    const lbOrder = ["800", "1400"];
    const lightboxSrcSet = lbOrder
      .filter((w) => sizes[w])
      .map((w) => `${sizes[w]} ${w}w`)
      .join(", ");
    const lightboxSrc = sizes["1400"] ?? sizes["800"];
    list.push({ gridSrcSet, gridSrc, lightboxSrcSet, lightboxSrc });
  }
  return list;
}

export const galleryPhotos = buildGalleryPhotos();
