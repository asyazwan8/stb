import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Same-origin download proxy for the finished portrait.
 *
 * Two reasons this exists rather than linking straight at fal:
 *  1. iOS Safari will not reliably save a cross-origin blob, so the QR target
 *     has to serve the bytes from our own origin with an attachment header.
 *  2. It keeps the fal CDN host out of the visitor's address bar.
 *
 * Only fal's own media hosts are reachable through it — this endpoint must
 * never become an open proxy.
 */
const ALLOWED_HOSTS = [/^([a-z0-9-]+\.)*fal\.media$/i, /^([a-z0-9-]+\.)*fal\.run$/i];
const MAX_REDIRECTS = 3;

function isAllowed(url: URL): boolean {
  return url.protocol === "https:" && ALLOWED_HOSTS.some((re) => re.test(url.hostname));
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "Missing src." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src." }, { status: 400 });
  }

  if (!isAllowed(target)) {
    return NextResponse.json({ error: "That source is not allowed." }, { status: 403 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";

  try {
    // Follow redirects by hand so every hop is re-checked against the allowlist.
    let response: Response | undefined;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      response = await fetch(target, { redirect: "manual", cache: "no-store" });
      if (response.status < 300 || response.status >= 400) break;

      const location = response.headers.get("location");
      if (!location) break;

      const next = new URL(location, target);
      if (!isAllowed(next)) {
        return NextResponse.json(
          { error: "That source redirected somewhere not allowed." },
          { status: 403 },
        );
      }
      target = next;
      response = undefined;
    }

    if (!response || !response.ok || !response.body) {
      return NextResponse.json(
        { error: "Could not fetch that portrait." },
        { status: 502 },
      );
    }

    const headers = new Headers({
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    });
    const length = response.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    if (download) {
      headers.set(
        "Content-Disposition",
        'attachment; filename="sarawak-photobooth.jpg"',
      );
    }

    return new NextResponse(response.body, { status: 200, headers });
  } catch (err) {
    console.error("[image] proxy failed", err);
    return NextResponse.json({ error: "Could not fetch that portrait." }, { status: 502 });
  }
}
