/**
 * Sarawak destinations promoted on the kiosk — on the attract loop, and again
 * on the processing screen while the portrait renders, so the wait becomes a
 * moment of destination marketing rather than dead time.
 *
 * PHOTOGRAPHY: these are LANDSCAPE images, shown as an editorial band at their
 * natural aspect so nothing is cropped away on the portrait panel. Drop real
 * photos into /public/places using these exact filenames — no code change.
 * Landscape, roughly 16:9, 1600x900 or larger.
 *
 * NOTE FOR STB: copy below should be reviewed before the demo.
 */

export type Place = {
  id: string;
  name: string;
  region: string;
  /** One short line — this is signage, not a brochure. */
  hook: string;
  image: string;
  /** Wash used behind the band, and instead of it before photos are dropped in. */
  from: string;
  to: string;
};

/** All four destination photos are landscape; the band reserves this shape. */
export const PLACE_ASPECT = { w: 16, h: 9 };

export const PLACES: Place[] = [
  {
    id: "borneo-cultures-museum",
    name: "Borneo Cultures Museum",
    region: "Kuching",
    hook: "Five floors of Borneo's living heritage, in the heart of the old town.",
    image: "/places/borneo-cultures-museum.jpg",
    from: "#5c2412",
    to: "#c8641f",
  },
  {
    id: "sarawak-cultural-village",
    name: "Sarawak Cultural Village",
    region: "Santubong, Kuching",
    hook: "A living museum below Mount Santubong, with ethnic houses kept by the communities themselves.",
    image: "/places/sarawak-cultural-village.jpg",
    from: "#123d2c",
    to: "#3f9b64",
  },
  {
    id: "bako-national-park",
    name: "Bako National Park",
    region: "Kuching",
    hook: "Sarawak's oldest national park — sea stacks, mangrove and wild proboscis monkeys.",
    image: "/places/bako-national-park.jpg",
    from: "#123b56",
    to: "#3d92c4",
  },
  {
    id: "semenggoh-wildlife-centre",
    name: "Semenggoh Wildlife Centre",
    region: "Kuching",
    hook: "Rehabilitated orangutans, living free in the reserve and returning at feeding time.",
    image: "/places/semenggoh-wildlife-centre.jpg",
    from: "#3f2e12",
    to: "#a8802c",
  },
];
