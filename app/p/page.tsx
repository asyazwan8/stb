/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Ribbon } from "@/components/Masthead";

/** Same allowlist as the proxy — a bad or hostile src never renders. */
function isAllowed(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      /^([a-z0-9-]+\.)*fal\.(media|run)$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const valid = src && isAllowed(src);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <Ribbon />

      <header className="flex justify-center px-6 py-5">
        <img
          src="/brand/stb-masthead.png"
          alt="Sarawak — Gateway to Borneo"
          className="h-10 w-auto"
        />
      </header>

      <main className="flex-1 px-5 pb-10">
        <div className="mx-auto w-full max-w-md">
          {valid ? (
            <>
              <h1 className="text-center font-display text-3xl font-bold text-ink">
                Your Sarawak portrait
              </h1>
              <p className="mt-2 text-center text-[15px] leading-relaxed text-bark">
                Tap and hold the image to save it, or use the button below.
              </p>

              <div className="mt-5 overflow-hidden rounded-3xl bg-white p-3 shadow-xl">
                <img
                  src={`/api/image?src=${encodeURIComponent(src)}`}
                  alt="Your portrait in Sarawak traditional dress"
                  className="w-full rounded-2xl"
                />
              </div>

              <a
                href={`/api/image?src=${encodeURIComponent(src)}&download=1`}
                download="sarawak-photobooth.jpg"
                className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-stb-hornbill text-lg font-bold text-white shadow-lg shadow-stb-hornbill/25 transition active:scale-[0.97]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download photo
              </a>

              <div className="mt-8 rounded-3xl bg-sand/70 px-5 py-5 text-center">
                <p className="font-display text-xl font-bold text-ink">
                  More to discover
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-bark">
                  Longhouses on the Rejang, caves at Mulu, rainforest at Bako —
                  Sarawak is the gateway to Borneo.
                </p>
              </div>
            </>
          ) : (
            <div className="pt-16 text-center">
              <h1 className="font-display text-3xl font-bold text-ink">
                Nothing to show
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-bark">
                This link is missing a portrait, or it has expired. Scan the QR
                code on the photobooth screen again.
              </p>
              <Link
                href="/"
                className="mt-7 inline-flex h-14 items-center justify-center rounded-2xl border-2 border-bark/15 px-8 text-base font-semibold text-bark"
              >
                Back to the photobooth
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
