import { NextResponse } from "next/server";
import { getEthnic, getLook, type Gender } from "@/lib/ethnics";
import {
  FAL_MODEL,
  buildSwapInput,
  describeFalError,
  getFalClient,
  loadReferenceDataUri,
} from "@/lib/fal";

export const runtime = "nodejs";
// Submitting to the queue returns immediately; the client polls for the
// result, so this never approaches Vercel's function ceiling.
export const maxDuration = 30;

const MAX_SELFIE_BYTES = 6 * 1024 * 1024;

type Body = {
  photo?: string;
  ethnic?: string;
  gender?: Gender;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { photo, ethnic: ethnicId, gender } = body;

  if (!photo?.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "A captured photo is required." },
      { status: 400 },
    );
  }
  if (photo.length > MAX_SELFIE_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large. Please take it again." },
      { status: 413 },
    );
  }
  if (gender !== "female" && gender !== "male") {
    return NextResponse.json({ error: "Unknown look." }, { status: 400 });
  }

  const ethnic = ethnicId ? getEthnic(ethnicId) : undefined;
  const look = ethnicId ? getLook(ethnicId, gender) : undefined;
  if (!ethnic || ethnic.status !== "live" || !look) {
    return NextResponse.json(
      { error: "That look is not available yet." },
      { status: 400 },
    );
  }

  try {
    const client = getFalClient();
    const referenceDataUri = await loadReferenceDataUri(look);
    const input = buildSwapInput({
      ethnicName: ethnic.name,
      look,
      referenceDataUri,
      selfieDataUri: photo,
    });

    const queued = await client.queue.submit(FAL_MODEL, { input });

    return NextResponse.json({
      requestId: queued.request_id,
      model: FAL_MODEL,
    });
  } catch (err) {
    const { message, status, detail } = describeFalError(err);
    console.error("[swap] submit failed", status, message, detail);
    return NextResponse.json({ error: message, detail }, { status });
  }
}
