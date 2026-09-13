/**
 * Shown on the processing screen while the portrait renders — the wait is
 * turned into a moment of destination promotion, which is the point of the
 * kiosk for STB.
 *
 * Drop real photography into /public/places using these exact filenames and
 * the cards pick it up with no code change.
 */

export type Place = {
  id: string;
  name: string;
  region: string;
  hook: string;
  image: string;
  /** Fallback wash used behind/instead of photography. */
  from: string;
  to: string;
};

export const PLACES: Place[] = [
  {
    id: "mulu",
    name: "Gunung Mulu",
    region: "Miri Division",
    hook: "A UNESCO World Heritage rainforest over some of the largest cave chambers on earth.",
    image: "/places/mulu.jpg",
    from: "#0f3d2e",
    to: "#1f7a4d",
  },
  {
    id: "bako",
    name: "Bako National Park",
    region: "Kuching Division",
    hook: "Sarawak's oldest national park — sea stacks, mangrove and wild proboscis monkeys.",
    image: "/places/bako.jpg",
    from: "#123b56",
    to: "#2f88b8",
  },
  {
    id: "kuching",
    name: "Kuching Waterfront",
    region: "Kuching Division",
    hook: "The Sarawak River promenade, at its best when the light goes gold.",
    image: "/places/kuching.jpg",
    from: "#7a2d16",
    to: "#ea6a25",
  },
  {
    id: "santubong",
    name: "Santubong",
    region: "Kuching Division",
    hook: "A rainforest mountain by the sea, and home of the Rainforest World Music Festival.",
    image: "/places/santubong.jpg",
    from: "#3f2a5e",
    to: "#8a5fb0",
  },
];
