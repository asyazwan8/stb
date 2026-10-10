/**
 * Content model for the photobooth.
 *
 * NOTE FOR STB: the cultural copy below was written carefully but should be
 * reviewed by the Board (or a cultural adviser) before the demo is shown to a
 * live audience. Names and spellings vary between regions and sources.
 *
 * Drafted most recently, and most in need of review: every Iban costume
 * detail other than the two headgear entries, and all Bidayuh and Orang Ulu
 * copy (descriptions, dress names and costume details).
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
  /**
   * How the swap prompt describes this photo's setting and light. Omit for
   * the Iban wording (longhouse, warm lantern light) the prompt was tuned on.
   */
  scene?: { setting: string; lighting: string; light: string };
  hotspots: Hotspot[];
};

export type Ethnic = {
  id: string;
  name: string;
  /** One-line hook on the selection card. */
  tagline: string;
  /** Short intro shown on the learn screen. */
  description: string;
  /** Closing line on the result screen, after "Scan the code to save your portrait, then". */
  invite: string;
  status: "live" | "coming-soon";
  looks: Look[];
};

const IBAN_DESCRIPTION =
  "The Iban are Sarawak's largest community — river people who have long lived in longhouses along the Rejang, Lupar and Batang Ai. Their ceremonial dress, the ngepan, is brought out for Gawai Dayak and weddings, layering handwoven pua kumbu with silver that is passed down through generations.";

// Drafted for STB review — see the note at the top of this file.
const BIDAYUH_DESCRIPTION =
  "The Bidayuh are the people of the hills south and west of Kuching, around Bau, Padawan and Serian. Their villages once gathered around the baruk, a round head-house raised on stilts. For Gawai, women wear the black jomuh skirt with beaded sashes, copper belts and the sipiah cap, and men the black vest and loincloth of the warrior.";

const ORANG_ULU_DESCRIPTION =
  "Orang Ulu means \"upriver people\" — the Kayan, Kenyah, Kelabit, Penan and other communities of Sarawak's far interior. They are Borneo's great bead-workers and carvers: their beaded caps, jackets and baby carriers carry hornbill and tiger motifs that once marked a family's rank, and their longhouse walls are painted with sweeping tendrils.";

export const ETHNICS: Ethnic[] = [
  {
    id: "iban",
    name: "Iban",
    tagline: "Longhouse people of the great rivers",
    description: IBAN_DESCRIPTION,
    invite:
      "come and see the real thing — the Iban welcome visitors to their longhouses along Sarawak’s rivers.",
    status: "live",
    looks: [
      {
        gender: "female",
        name: "Ngepan Indu",
        label: "Female",
        image: "/references/iban-female.jpeg",
        aspect: { w: 843, h: 1264 },
        falAspectRatio: "2:3",
        hotspots: [
          {
            id: "sugu-tinggi",
            label: "Headgear",
            name: "Sugu Tinggi",
            description:
              "The “tall comb” — a crown of hammered silver worn with the full ngepan indu. Its height and the number of silver leaves traditionally signalled a family's standing, and most are heirlooms handed down through generations.",
            x: 47,
            y: 25,
            status: "live",
          },
          {
            id: "marik-empang",
            label: "Collar",
            name: "Marik Empang",
            description:
              "Strands of beads draped across the shoulders like a cape. Traditionally woven by the wearer’s own hands, the patterns carry family motifs, and the colours flash with every step of the ngajat dance.",
            x: 49,
            y: 42,
            status: "live",
          },
          {
            id: "rawai",
            label: "Corset",
            name: "Rawai & Lampit",
            description:
              "The rawai is a corset of rattan hoops strung with small silver rings, wound tightly around the waist. Below it sits the lampit, a belt of linked silver coins. Together they are the heaviest silver a woman wears — and the proudest.",
            x: 55,
            y: 60,
            status: "live",
          },
          {
            id: "kain-kebat",
            label: "Skirt",
            name: "Kain Kebat",
            description:
              "A short tube skirt woven on a backstrap loom with the ikat technique: the threads are tie-dyed before weaving, so the pattern appears as the cloth is made. Mastering it was once a mark of a woman’s skill and standing.",
            x: 48,
            y: 77,
            status: "live",
          },
        ],
      },
      {
        gender: "male",
        name: "Ngepan Lelaki",
        label: "Male",
        image: "/references/iban-male.jpeg",
        aspect: { w: 768, h: 1376 },
        falAspectRatio: "3:4",
        hotspots: [
          {
            id: "ketapu",
            label: "Headgear",
            name: "Ketapu",
            description:
              "A woven rattan cap crowned with the barred feathers of the argus pheasant and the hornbill — the bird the Iban hold sacred. Worn with the ngepan lelaki, it once marked a man's standing in the longhouse.",
            x: 47,
            y: 30,
            status: "live",
          },
          {
            id: "baju-burung",
            label: "Vest",
            name: "Baju Burung",
            description:
              "A sleeveless jacket woven in the same ikat or sungkit techniques as the pua kumbu. Its motifs — hornbills, spirits, patterns passed down through families — were believed to protect the man who wore it.",
            x: 50,
            y: 45,
            status: "live",
          },
          {
            id: "ilang",
            label: "Blade",
            name: "Ilang",
            description:
              "A sword with a carved hilt, often of deer antler, and a scabbard bound with rattan. The ilang is famously forged by the Kayan and Kenyah upriver and was prized and traded across Borneo, the Iban among them.",
            x: 33,
            y: 56,
            status: "live",
          },
          {
            id: "sirat",
            label: "Sirat",
            name: "Sirat",
            description:
              "A long loincloth wrapped around the waist and between the legs, its decorated ends hanging down at front and back. The simplest piece of the ngepan lelaki, and the oldest.",
            x: 50,
            y: 66,
            status: "live",
          },
        ],
      },
    ],
  },
  {
    id: "bidayuh",
    name: "Bidayuh",
    tagline: "Hill people of the Sarawak highlands",
    description: BIDAYUH_DESCRIPTION,
    invite:
      "come and see the real thing — Bidayuh villages in the hills near Kuching welcome visitors at Gawai.",
    status: "live",
    looks: [
      {
        gender: "female",
        name: "Bidayuh Women's Dress",
        label: "Female",
        image: "/references/bidayuh-female.png",
        aspect: { w: 768, h: 1376 },
        falAspectRatio: "3:4",
        scene: {
          setting: "timber house setting",
          lighting: "warm golden lighting",
          light: "warm golden directional light",
        },
        hotspots: [
          {
            id: "sipiah",
            label: "Headgear",
            name: "Sipiah",
            description:
              "A snug cap ringed with bands of tiny glass beads, worn with the ceremonial dress for Gawai. Its colours and patterns differ from village to village, so a practised eye can tell where the wearer comes from.",
            x: 58,
            y: 26,
            status: "live",
          },
          {
            id: "bidayuh-sash",
            label: "Sash",
            name: "Beaded sash & necklace",
            description:
              "Strings of red, white, yellow and black beads crossed over the shoulders and chest. Beads were once traded upriver and held as family wealth, so a full sash was a sign of standing as much as of beauty.",
            x: 58,
            y: 44,
            status: "live",
          },
          {
            id: "bidayuh-belt",
            label: "Belt",
            name: "Copper belt",
            description:
              "A belt of linked metal rings or coins at the waist, worn over the jomuh. It catches the light and chimes softly as the wearer dances.",
            x: 56,
            y: 54,
            status: "live",
          },
          {
            id: "jomuh",
            label: "Skirt",
            name: "Jomuh",
            description:
              "The black skirt of the Bidayuh women's dress, edged with bands of white zigzag stitching and beadwork. Black is the ground colour of Bidayuh ceremonial wear, so the trim stands out sharply against it.",
            x: 62,
            y: 67,
            status: "live",
          },
        ],
      },
      {
        gender: "male",
        name: "Bidayuh Warrior's Dress",
        label: "Male",
        image: "/references/bidayuh-male.png",
        aspect: { w: 768, h: 1376 },
        falAspectRatio: "3:4",
        scene: {
          setting: "dim timber interior setting",
          lighting: "warm low lighting",
          light: "warm low directional light",
        },
        hotspots: [
          {
            id: "bidayuh-headcloth",
            label: "Headgear",
            name: "Warrior's headcloth",
            description:
              "A striped headcloth wound around the head and crowned with curved tusks. Worn for ceremonies and dances that remember the Bidayuh as warriors of the hills.",
            x: 52,
            y: 25,
            status: "live",
          },
          {
            id: "bidayuh-necklace",
            label: "Necklace",
            name: "Boar-tooth necklace",
            description:
              "A heavy collar of boar tusks, animal teeth and beads. Wild boar was the prize of the hunt, and wearing its tusks spoke of a man's courage and skill in the forest.",
            x: 52,
            y: 43,
            status: "live",
          },
          {
            id: "bidayuh-vest",
            label: "Vest",
            name: "Warrior's vest",
            description:
              "A sleeveless vest of hide or beaten bark, edged with red and white trim. Bark cloth was once made by soaking and pounding the inner bark of forest trees until it was soft enough to wear.",
            x: 38,
            y: 52,
            status: "live",
          },
          {
            id: "bidayuh-loincloth",
            label: "Loincloth",
            name: "Loincloth",
            description:
              "A long cloth wound around the waist, one end falling in front and the other behind, here finished with a decorated apron. It is the oldest and simplest part of the warrior's dress.",
            x: 60,
            y: 77,
            status: "live",
          },
        ],
      },
    ],
  },
  {
    id: "orang-ulu",
    name: "Orang Ulu",
    tagline: "Artists of the upriver interior",
    description: ORANG_ULU_DESCRIPTION,
    invite:
      "come and see the real thing — the Orang Ulu welcome visitors to their longhouses deep in Sarawak’s interior.",
    status: "live",
    looks: [
      {
        gender: "female",
        name: "Kenyah Dancer's Dress",
        label: "Female",
        image: "/references/orangulu-female.png",
        aspect: { w: 768, h: 1376 },
        falAspectRatio: "3:4",
        hotspots: [
          {
            id: "ou-headdress",
            label: "Headgear",
            name: "Hornbill-feather crown",
            description:
              "A beaded headband crowned with black-and-white hornbill feathers and pom-poms. The hornbill is the most honoured bird of the Orang Ulu, and its feathers were reserved for people of rank.",
            x: 46,
            y: 20,
            status: "live",
          },
          {
            id: "ou-necklace",
            label: "Necklace",
            name: "Bead necklace",
            description:
              "Old glass beads were the treasure of Orang Ulu families, handed down for generations. Each bead's colour and pattern carried meaning, and a fine strand was among the most valuable things a family owned.",
            x: 47,
            y: 35,
            status: "live",
          },
          {
            id: "ou-dress",
            label: "Dress",
            name: "Beaded motif dress",
            description:
              "Black cloth covered in curling yellow and white motifs — the same sweeping tendrils painted on Orang Ulu longhouse walls. Motifs such as the hornbill and the human figure were once kept for the aristocratic class.",
            x: 53,
            y: 57,
            status: "live",
          },
          {
            id: "kirip",
            label: "Fans",
            name: "Kirip",
            description:
              "Hornbill-feather fans held between the fingers in the Datun Julud, the Kenyah women's long dance. The dancer moves like a hornbill gliding in flight while her head stays still. Today most kirip are made with artificial feathers to protect the bird.",
            x: 30,
            y: 53,
            status: "live",
          },
        ],
      },
      {
        gender: "male",
        name: "Kenyah Warrior's Dress",
        label: "Male",
        image: "/references/orangulu-male.png",
        aspect: { w: 768, h: 1376 },
        falAspectRatio: "3:4",
        scene: {
          setting: "dark stage setting with red drapes",
          lighting: "warm stage lighting",
          light: "warm directional stage light",
        },
        hotspots: [
          {
            id: "tapung-puk",
            label: "Headgear",
            name: "Tapung Puk",
            description:
              "A close-fitting rattan war cap crowned with long hornbill tail feathers. Traditionally only a man who had proved himself in battle could wear the feathers, so the cap showed his courage at a glance.",
            x: 52,
            y: 27,
            status: "live",
          },
          {
            id: "besunung",
            label: "Cape",
            name: "Besunung",
            description:
              "An outer garment of goat or deer skin worn over the shoulders, often with fur left on. Worn with the abet loincloth for the warrior's dance.",
            x: 62,
            y: 42,
            status: "live",
          },
          {
            id: "ou-ilang",
            label: "Blade",
            name: "Parang Ilang",
            description:
              "The sword the Kayan and Kenyah are famous for forging, with a carved antler hilt and a rattan-bound scabbard. Ilang from the upriver smiths were traded right across Borneo.",
            x: 62,
            y: 60,
            status: "live",
          },
          {
            id: "ou-shield",
            label: "Shield",
            name: "War shield",
            description:
              "A long wooden shield painted with the bold, curling faces and tendrils of Orang Ulu art. The designs were meant to protect the warrior and frighten his enemy.",
            x: 68,
            y: 80,
            status: "live",
          },
        ],
      },
    ],
  },
  {
    id: "melanau",
    name: "Melanau",
    tagline: "Coastal builders of the tall houses",
    description: "",
    invite: "",
    status: "coming-soon",
    looks: [],
  },
];

export function getEthnic(id: string): Ethnic | undefined {
  return ETHNICS.find((e) => e.id === id);
}

export function getLook(ethnicId: string, gender: Gender): Look | undefined {
  return getEthnic(ethnicId)?.looks.find((l) => l.gender === gender);
}
