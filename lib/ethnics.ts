/**
 * Content model for the photobooth.
 *
 * NOTE FOR STB: the cultural copy below was written carefully but should be
 * reviewed by the Board (or a cultural adviser) before the demo is shown to a
 * live audience. Names and spellings vary between regions and sources.
 */

export type Gender = "female" | "male";

export type Hotspot = {
  id: string;
  /** Short label shown on the pin. */
  label: string;
  /** Proper name of the garment/ornament. */
  name: string;
  /** One short paragraph — this is a photobooth, not a museum panel. */
  description: string;
  /** Position as a percentage of the reference image box. */
  x: number;
  y: number;
  /** Only the headgear is live in this demo. */
  status: "live" | "coming-soon";
};

export type Look = {
  gender: Gender;
  /** e.g. "Ngepan Indu" */
  name: string;
  /** Label on the look-picker card. */
  label: string;
  image: string;
  /** Intrinsic aspect ratio of the reference photo, used to anchor hotspots. */
  aspect: { w: number; h: number };
  /** Passed to the model so the output keeps the reference's shape. */
  falAspectRatio: "2:3" | "3:4" | "9:16" | "4:5";
  hotspots: Hotspot[];
};

export type Ethnic = {
  id: string;
  name: string;
  /** One-line hook on the selection card. */
  tagline: string;
  /** Short intro shown on the learn screen. */
  description: string;
  status: "live" | "coming-soon";
  /** Accent colour drawn from the STB masthead palette. */
  accent: string;
  looks: Look[];
};

const IBAN_DESCRIPTION =
  "The Iban are Sarawak's largest community — river people who have long lived in longhouses along the Rejang, Lupar and Batang Ai. Their ceremonial dress, the ngepan, is brought out for Gawai Dayak and weddings, layering handwoven pua kumbu with silver that is passed down through generations.";

export const ETHNICS: Ethnic[] = [
  {
    id: "iban",
    name: "Iban",
    tagline: "Longhouse people of the great rivers",
    description: IBAN_DESCRIPTION,
    status: "live",
    accent: "var(--color-stb-red)",
    looks: [
      {
        gender: "female",
        name: "Ngepan Indu",
        label: "Female",
        image: "/references/iban-female.jpg",
        aspect: { w: 843, h: 1265 },
        falAspectRatio: "2:3",
        hotspots: [
          {
            id: "sugu-tinggi",
            label: "Headgear",
            name: "Sugu Tinggi",
            description:
              "The “tall comb” — a crown of hammered silver worn with the full ngepan indu. Its height and the number of silver leaves traditionally signalled a family's standing, and most are heirlooms handed down through generations.",
            x: 48,
            y: 25,
            status: "live",
          },
          {
            id: "marik-empang",
            label: "Collar",
            name: "Marik Empang",
            description: "",
            x: 50,
            y: 41,
            status: "coming-soon",
          },
          {
            id: "rawai",
            label: "Corset",
            name: "Rawai & Lampit",
            description: "",
            x: 52,
            y: 58,
            status: "coming-soon",
          },
          {
            id: "kain-kebat",
            label: "Skirt",
            name: "Kain Kebat",
            description: "",
            x: 47,
            y: 73,
            status: "coming-soon",
          },
        ],
      },
      {
        gender: "male",
        name: "Ngepan Lelaki",
        label: "Male",
        image: "/references/iban-male.jpg",
        aspect: { w: 768, h: 1280 },
        falAspectRatio: "3:4",
        hotspots: [
          {
            id: "ketapu",
            label: "Headgear",
            name: "Ketapu",
            description:
              "A woven rattan cap crowned with the barred feathers of the argus pheasant and the hornbill — the bird the Iban hold sacred. Worn with the ngepan lelaki, it once marked a man's standing in the longhouse.",
            x: 43,
            y: 19,
            status: "live",
          },
          {
            id: "baju-burung",
            label: "Vest",
            name: "Baju Burung",
            description: "",
            x: 47,
            y: 46,
            status: "coming-soon",
          },
          {
            id: "ilang",
            label: "Blade",
            name: "Ilang",
            description: "",
            x: 30,
            y: 56,
            status: "coming-soon",
          },
          {
            id: "sirat",
            label: "Sirat",
            name: "Sirat",
            description: "",
            x: 50,
            y: 68,
            status: "coming-soon",
          },
        ],
      },
    ],
  },
  {
    id: "bidayuh",
    name: "Bidayuh",
    tagline: "Hill people of the Sarawak highlands",
    description: "",
    status: "coming-soon",
    accent: "var(--color-stb-lime)",
    looks: [],
  },
  {
    id: "orang-ulu",
    name: "Orang Ulu",
    tagline: "Artists of the upriver interior",
    description: "",
    status: "coming-soon",
    accent: "var(--color-stb-blue)",
    looks: [],
  },
  {
    id: "melanau",
    name: "Melanau",
    tagline: "Coastal builders of the tall houses",
    description: "",
    status: "coming-soon",
    accent: "var(--color-stb-amber)",
    looks: [],
  },
];

export function getEthnic(id: string): Ethnic | undefined {
  return ETHNICS.find((e) => e.id === id);
}

export function getLook(ethnicId: string, gender: Gender): Look | undefined {
  return getEthnic(ethnicId)?.looks.find((l) => l.gender === gender);
}
