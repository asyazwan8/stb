import { fal } from "@fal-ai/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getEthnic, getLook, type Look } from "./ethnics";

/**
 * Nano Banana Pro reasons hardest about what to preserve vs. change, which is
 * exactly the trade-off this photobooth lives or dies on: hold the visitor's
 * likeness while leaving the traditional costume untouched.
 *
 * Override with FAL_MODEL to A/B against fal-ai/nano-banana-2/edit (faster,
 * weaker identity retention).
 */
export const FAL_MODEL = process.env.FAL_MODEL ?? "fal-ai/nano-banana-pro/edit";

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}

let configured = false;

export function getFalClient() {
  const credentials = process.env.FAL_KEY;
  if (!credentials) {
    throw new FalNotConfiguredError();
  }
  if (!configured) {
    fal.config({ credentials });
    configured = true;
  }
  return fal;
}

export class FalNotConfiguredError extends Error {
  constructor() {
    super(
      "FAL_KEY is not set. Add it in Vercel > Project > Settings > Environment Variables, then redeploy.",
    );
    this.name = "FalNotConfiguredError";
  }
}

/**
 * The reference portrait is inlined as a data URI rather than passed as a
 * public URL. A Vercel preview deployment can sit behind deployment
 * protection, in which case fal would get a 401 trying to fetch it — inlining
 * sidesteps that entirely.
 */
export async function loadReferenceDataUri(look: Look): Promise<string> {
  const rel = look.image.replace(/^\/+/, "");
  // Guard against a malformed data file escaping the public directory.
  const publicDir = path.join(process.cwd(), "public");
  const abs = path.join(publicDir, rel);
  if (!abs.startsWith(publicDir + path.sep)) {
    throw new Error(`Reference image path escapes public/: ${look.image}`);
  }
  const bytes = await readFile(abs);
  // Derive the type from the file — STB supplied PNGs, and mislabelling them
  // as JPEG would hand fal a corrupt data URI.
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

/**
 * Two explicit preserve-lists. Stating both sides stops the model from trading
 * one requirement for the other — the common failure mode here is a beautiful
 * costume wearing a generic face, or an accurate face in a restyled outfit.
 *
 * v2 (the default) adds one rule: the visitor's skin tone goes on ALL visible
 * skin, not just the face. v1 kept the reference model's arms and hands
 * "completely unchanged", so a visitor darker or lighter than the model got
 * either a two-tone composite or a face quietly re-toned to match the body.
 * v2 is otherwise a minimal edit of v1: two earlier rewrites made results
 * worse and were reverted (2dbac01), so the known-good structure stays.
 *
 * FAL_PROMPT=v1 restores the previous prompt verbatim, without a code change.
 */
export const PROMPT_VERSION = process.env.FAL_PROMPT === "v1" ? "v1" : "v2";

export function buildSwapPrompt(opts: {
  ethnicName: string;
  look: Look;
  version?: "v1" | "v2";
}): string {
  const version = opts.version ?? PROMPT_VERSION;
  return version === "v1" ? buildSwapPromptV1(opts) : buildSwapPromptV2(opts);
}

function promptParts(look: Look) {
  const headgear =
    look.hotspots.find((h) => h.label === "Headgear")?.name ?? "headdress";
  const scene = look.scene ?? DEFAULT_SCENE;
  return { headgear, scene };
}

/** The known-good prompt, kept byte-for-byte. */
function buildSwapPromptV1(opts: { ethnicName: string; look: Look }): string {
  const { ethnicName, look } = opts;
  const { headgear, scene } = promptParts(look);

  return [
    `You are compositing one photorealistic portrait from two photographs.`,
    ``,
    `IMAGE 1 is a traditional ${ethnicName} portrait from Sarawak, Borneo (${look.name}).`,
    `IMAGE 2 is a photograph of a visitor's face taken at a kiosk.`,
    ``,
    `TASK: replace only the face of the person in IMAGE 1 with the face of the person in IMAGE 2.`,
    ``,
    `PRESERVE FROM IMAGE 1, completely unchanged: the pose and body position; the arms, hands and fingers; the entire traditional costume including the ${headgear} headdress, all beadwork, silverwork, coins, fringing and handwoven textile; the ${scene.setting} and every background detail; the camera angle, crop and framing; the depth of field; and the ${scene.lighting} and colour grade.`,
    ``,
    `PRESERVE FROM IMAGE 2, faithfully: the person's facial identity. Keep the exact face shape and proportions, eye shape and spacing, eyebrows, nose, mouth and lips, cheekbones, jawline and chin, skin tone and complexion, skin texture, and any facial hair. The finished portrait must be immediately recognisable as this same person.`,
    ``,
    `BLENDING: relight the transplanted face to match IMAGE 1's ${scene.light}; carry the skin tone continuously into the neck and ears so there is no visible seam, edge or tonal break. Keep the head at the same size, tilt and angle as in IMAGE 1. A natural, friendly expression suited to the pose is fine, but the facial identity must not drift.`,
    ``,
    `OUTPUT: exactly one photorealistic image with a single subject, sharp and naturally detailed, in the same composition as IMAGE 1. Do not add text, captions, watermarks, borders or additional people. Do not restyle, re-colour or modify the costume or headdress in any way.`,
  ].join("\n");
}

function buildSwapPromptV2(opts: { ethnicName: string; look: Look }): string {
  const { ethnicName, look } = opts;
  const { headgear, scene } = promptParts(look);

  return [
    `You are compositing one photorealistic portrait from two photographs.`,
    ``,
    `IMAGE 1 is a traditional ${ethnicName} portrait from Sarawak, Borneo (${look.name}).`,
    `IMAGE 2 is a photograph of a visitor's face taken at a kiosk.`,
    ``,
    `TASK: replace only the face of the person in IMAGE 1 with the face of the person in IMAGE 2.`,
    ``,
    `PRESERVE FROM IMAGE 1, completely unchanged: the pose, body position and body shape; the position of the arms, hands and fingers; the entire traditional costume including the ${headgear} headdress, all beadwork, silverwork, coins, fringing and handwoven textile; the ${scene.setting} and every background detail; the camera angle, crop and framing; the depth of field; and the ${scene.lighting} and colour grade.`,
    ``,
    `PRESERVE FROM IMAGE 2, faithfully: the person's facial identity. Keep the face shape and proportions, eye shape and spacing, eyebrows, nose, mouth and lips, cheekbones, jawline and chin, skin tone and complexion, skin texture, and any facial hair. The finished portrait must be immediately recognisable as this same person.`,
    ``,
    `SKIN TONE: give every visible area of skin — face, neck, ears, shoulders, arms, hands, legs and feet — the skin tone and undertone of the person in IMAGE 2, so the whole figure is one consistent complexion. Do not lighten, darken or warm their skin toward the model in IMAGE 1. IMAGE 1's light may add its highlights and shadows, but the underlying colour stays the visitor's own.`,
    ``,
    `BLENDING: relight the transplanted face with IMAGE 1's ${scene.light} (its light and shadow only, not its skin colour); carry the skin tone continuously into the neck, ears and all other visible skin so there is no visible seam, edge or tonal break. Keep the head at the same size, tilt and angle as in IMAGE 1. A natural, friendly expression suited to the pose is fine, but the facial identity must not drift.`,
    ``,
    `OUTPUT: exactly one photorealistic image with a single subject, sharp and naturally detailed, in the same composition as IMAGE 1. Do not add text, captions, watermarks, borders or additional people. Do not restyle, re-colour or modify the costume or headdress in any way.`,
  ].join("\n");
}

/** The Iban portraits' wording — the prompt was tuned against these. */
const DEFAULT_SCENE = {
  setting: "longhouse setting",
  lighting: "warm lantern lighting",
  light: "warm directional lantern light",
};

export type SwapInput = {
  prompt: string;
  image_urls: string[];
  num_images: number;
  output_format: "jpeg";
  aspect_ratio: Look["falAspectRatio"];
  resolution: "1K" | "2K" | "4K";
  limit_generations: boolean;
};

export function buildSwapInput(opts: {
  ethnicName: string;
  look: Look;
  referenceDataUri: string;
  selfieDataUri: string;
}): SwapInput {
  return {
    prompt: buildSwapPrompt({ ethnicName: opts.ethnicName, look: opts.look }),
    // Order matters — the prompt refers to these as IMAGE 1 and IMAGE 2.
    image_urls: [opts.referenceDataUri, opts.selfieDataUri],
    num_images: 1,
    output_format: "jpeg",
    aspect_ratio: opts.look.falAspectRatio,
    resolution: "2K",
    // Stops the model deciding on its own to return a set of variations.
    limit_generations: true,
  };
}

/** A request the kiosk should never have sent — carries its own HTTP status. */
export class SwapInputError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SwapInputError";
  }
}

const MAX_SELFIE_BYTES = 6 * 1024 * 1024;

/**
 * Validates a capture and queues the face swap. Shared by the touch kiosk
 * (/api/swap) and the phone-controlled flow (/api/demo-qr/[id]/photo).
 */
export async function submitSwap(args: {
  photo?: unknown;
  ethnicId?: unknown;
  gender?: unknown;
}): Promise<{ requestId: string }> {
  const { photo, ethnicId, gender } = args;

  if (typeof photo !== "string" || !photo.startsWith("data:image/")) {
    throw new SwapInputError("A captured photo is required.", 400);
  }
  if (photo.length > MAX_SELFIE_BYTES) {
    throw new SwapInputError("That photo is too large. Please take it again.", 413);
  }
  if (gender !== "female" && gender !== "male") {
    throw new SwapInputError("Unknown look.", 400);
  }

  const ethnic = typeof ethnicId === "string" ? getEthnic(ethnicId) : undefined;
  const look = typeof ethnicId === "string" ? getLook(ethnicId, gender) : undefined;
  if (!ethnic || ethnic.status !== "live" || !look) {
    throw new SwapInputError("That look is not available yet.", 400);
  }

  const client = getFalClient();
  const referenceDataUri = await loadReferenceDataUri(look);
  const input = buildSwapInput({
    ethnicName: ethnic.name,
    look,
    referenceDataUri,
    selfieDataUri: photo,
  });

  const queued = await client.queue.submit(FAL_MODEL, { input });
  return { requestId: queued.request_id };
}

type FalImage = { url?: string };
type FalOutput = { images?: FalImage[]; description?: string };

export type SwapCheck =
  | { status: "IN_QUEUE" | "IN_PROGRESS"; queuePosition?: number }
  | { status: "COMPLETED"; imageUrl: string };

export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

/** One look at the fal queue. Throws SwapInputError for a bad id or empty result. */
export async function checkSwap(requestId: string): Promise<SwapCheck> {
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new SwapInputError("Invalid request id.", 400);
  }

  const client = getFalClient();
  const status = await client.queue.status(FAL_MODEL, { requestId });

  if (status.status !== "COMPLETED") {
    return {
      status: status.status,
      queuePosition: status.status === "IN_QUEUE" ? status.queue_position : undefined,
    };
  }

  const result = await client.queue.result(FAL_MODEL, { requestId });
  const data = result.data as FalOutput;
  const imageUrl = data?.images?.[0]?.url;

  if (!imageUrl) {
    console.error("[swap] completed with no image", JSON.stringify(data));
    throw new SwapInputError("The portrait came back empty. Please try again.", 502);
  }

  return { status: "COMPLETED", imageUrl };
}

/** Normalises fal SDK errors into something the kiosk can show and we can debug. */
export function describeFalError(err: unknown): {
  message: string;
  status: number;
  detail?: unknown;
} {
  if (err instanceof FalNotConfiguredError) {
    return { message: err.message, status: 503 };
  }
  if (err instanceof SwapInputError) {
    return { message: err.message, status: err.status };
  }
  // ApiError / ValidationError from @fal-ai/client both carry status + body.
  if (typeof err === "object" && err !== null && "status" in err) {
    const e = err as { status?: number; message?: string; body?: unknown };
    return {
      message: e.message ?? "The image service rejected the request.",
      status: typeof e.status === "number" ? e.status : 502,
      detail: e.body,
    };
  }
  return {
    message: err instanceof Error ? err.message : "Unexpected error.",
    status: 500,
  };
}
