/**
 * Sarawak destinations promoted on the kiosk — on the attract loop, and again
 * on the processing screen while the portrait renders, so the wait becomes a
 * moment of destination marketing rather than dead time.
 *
 * PHOTOGRAPHY: shown in a gallery mat on the loading screen, centred at their
 * own aspect ratio and never cropped. Any shape works — the supplied set runs
 * from 3:2 landscape to square. Drop real photos into /public/places and point
 * `image` at them; the filename does not have to match `id`.
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

/**
 * The frame's outer window. Photos are centred inside it at their OWN aspect
 * ratio and never cropped — supplied art ranges from 3:2 landscape to square,
 * so the differing amount of surrounding mat is the point, exactly as with a
 * real matted print.
 */
export const FRAME_WINDOW = { w: 4, h: 3 };

export const PLACES: Place[] = [
  {
    id: "borneo-cultures-museum",
    name: "Borneo Cultures Museum",
    region: "Kuching",
    hook: "Five floors of Borneo's living heritage, in the heart of the old town.",
    image: "/places/borneo-cultural-museum.jpeg",
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
