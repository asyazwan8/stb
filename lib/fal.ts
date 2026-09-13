import { fal } from "@fal-ai/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Look } from "./ethnics";

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
 */
export function buildSwapPrompt(opts: {
  ethnicName: string;
  look: Look;
}): string {
  const { ethnicName, look } = opts;
  const headgear =
    look.hotspots.find((h) => h.id === "sugu-tinggi" || h.id === "ketapu")
      ?.name ?? "headdress";

  return [
    `You are compositing one photorealistic portrait from two photographs.`,
    ``,
    `IMAGE 1 is a traditional ${ethnicName} portrait from Sarawak, Borneo (${look.name}).`,
    `IMAGE 2 is a photograph of a visitor's face taken at a kiosk.`,
    ``,
    `TASK: replace only the face of the person in IMAGE 1 with the face of the person in IMAGE 2.`,
    ``,
    `PRESERVE FROM IMAGE 1, completely unchanged: the pose and body position; the arms, hands and fingers; the entire traditional costume including the ${headgear} headdress, all beadwork, silverwork, coins, fringing and handwoven textile; the longhouse setting and every background detail; the camera angle, crop and framing; the depth of field; and the warm lantern lighting and colour grade.`,
    ``,
    `PRESERVE FROM IMAGE 2, faithfully: the person's facial identity. Keep the exact face shape and proportions, eye shape and spacing, eyebrows, nose, mouth and lips, cheekbones, jawline and chin, skin tone and complexion, skin texture, and any facial hair. The finished portrait must be immediately recognisable as this same person.`,
    ``,
    `BLENDING: relight the transplanted face to match IMAGE 1's warm directional lantern light; carry the skin tone continuously into the neck and ears so there is no visible seam, edge or tonal break. Keep the head at the same size, tilt and angle as in IMAGE 1. A natural, friendly expression suited to the pose is fine, but the facial identity must not drift.`,
    ``,
    `OUTPUT: exactly one photorealistic image with a single subject, sharp and naturally detailed, in the same composition as IMAGE 1. Do not add text, captions, watermarks, borders or additional people. Do not restyle, re-colour or modify the costume or headdress in any way.`,
  ].join("\n");
}

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

/** Normalises fal SDK errors into something the kiosk can show and we can debug. */
export function describeFalError(err: unknown): {
  message: string;
  status: number;
  detail?: unknown;
} {
  if (err instanceof FalNotConfiguredError) {
    return { message: err.message, status: 503 };
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
