import { NextResponse } from "next/server";
import { FAL_MODEL, describeFalError, getFalClient } from "@/lib/fal";

export const runtime = "nodejs";
export const maxDuration = 30;

type FalImage = { url?: string };
type FalOutput = { images?: FalImage[]; description?: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;

  if (!/^[A-Za-z0-9_-]{8,128}$/.test(requestId)) {
    return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
  }

  try {
    const client = getFalClient();
    const status = await client.queue.status(FAL_MODEL, { requestId });

    if (status.status !== "COMPLETED") {
      return NextResponse.json({
        status: status.status,
        queuePosition:
          status.status === "IN_QUEUE" ? status.queue_position : undefined,
      });
    }

    const result = await client.queue.result(FAL_MODEL, { requestId });
    const data = result.data as FalOutput;
    const imageUrl = data?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("[swap] completed with no image", JSON.stringify(data));
      return NextResponse.json(
        { error: "The portrait came back empty. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ status: "COMPLETED", imageUrl });
  } catch (err) {
    const { message, status, detail } = describeFalError(err);
    console.error("[swap] poll failed", status, message, detail);
    return NextResponse.json({ error: message, detail }, { status });
  }
}
