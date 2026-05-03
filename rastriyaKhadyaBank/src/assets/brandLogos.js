import logo48 from "./images/brand/logo-48.webp";
import logo96 from "./images/brand/logo-96.webp";
import logo160 from "./images/brand/logo-160.webp";

import khalti56 from "./images/brand/khalti-56.webp";
import khalti112 from "./images/brand/khalti-112.webp";

import esewa56 from "./images/brand/esewa-56.webp";
import esewa112 from "./images/brand/esewa-112.webp";

/** Navbar: max ~48px logical width at md+, ~40px below */
export const navbarLogo = {
  src: logo96,
  srcSet: `${logo48} 48w, ${logo96} 96w, ${logo160} 160w`,
  sizes: "(min-width: 768px) 48px, 40px",
};

/** Footer brand column: h-20 = 80px */
export const footerLogo = {
  src: logo160,
  srcSet: `${logo96} 96w, ${logo160} 160w`,
  sizes: "80px",
};

/** Intrinsic sizes: khalti-56.webp 147×56, khalti-112.webp 295×112 */
export const khaltiLogoResponsive = {
  src: khalti112,
  srcSet: `${khalti56} 147w, ${khalti112} 295w`,
  sizes: "(max-width: 768px) 120px, 148px",
};

/** eSewa variants from PNG (small originals); descriptors match Sharp output widths */
/** esewa-56.webp 124×33, esewa-112.webp 421×112 */
export const esewaLogoResponsive = {
  src: esewa112,
  srcSet: `${esewa56} 124w, ${esewa112} 421w`,
  sizes: "(max-width: 768px) 100px, 124px",
};
